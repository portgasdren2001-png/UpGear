/**
 * productAI.js — Claude API による商品理解
 *
 * 入力: 構造化スクレイピングデータ
 * 出力: 商品カルテ（カテゴリ・信頼度・根拠つき）
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = 'claude-haiku-4-5-20251001';

// ─── Vision analysis ──────────────────────────────────────────────────────────

export async function analyzeVision(imageUrls) {
  if (!imageUrls || imageUrls.length === 0) return null;

  const validImgs = imageUrls.filter(u => u && u.startsWith('http')).slice(0, 3);
  if (!validImgs.length) return null;

  const content = [
    {
      type: 'text',
      text: `以下の商品画像を分析してください。JSON形式で回答してください：
{
  "productType": "商品の種類（例: メンズシェーバー、トラックボール、スニーカーなど）",
  "category": "大カテゴリ（例: 美容家電、PCアクセサリー、シューズなど）",
  "subCategory": "サブカテゴリ",
  "useCase": "主な用途・使用シーン",
  "design": "デザイン特徴",
  "sizeImpression": "サイズ感",
  "qualityLevel": "品質・高級感（budget/standard/premium/luxury）",
  "color": ["メインカラー"],
  "targetUser": "想定ユーザー",
  "confidence": 推論信頼度(0-100の数値)
}`,
    },
    ...validImgs.map(url => ({
      type: 'image',
      source: { type: 'url', url },
    })),
  ];

  try {
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 512,
      messages: [{ role: 'user', content }],
    });
    const text = msg.content[0].text;
    const match = text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  } catch (e) {
    console.error('Vision error:', e.message);
    return null;
  }
}

// ─── Product understanding ────────────────────────────────────────────────────

export async function analyzeProduct(scraped, visionResult, existingCategoryInfo) {
  const { categoryInfo } = scraped;

  // Build context for Claude
  const context = {
    // Page title & h1
    title: scraped.title,
    h1: scraped.h1,

    // Schema data
    jsonLd: scraped.jsonLd.slice(0, 5),
    schemaOrg: scraped.schemaOrg.slice(0, 5),

    // Navigation
    breadcrumbs: scraped.breadcrumbs,
    rawCategory: scraped.rawCategory,

    // Content
    description: scraped.description?.slice(0, 800),
    features: scraped.features.slice(0, 8),
    specs: scraped.specs,

    // Meta
    og: scraped.og,
    meta: { description: scraped.meta.description },

    // Reviews
    reviewAvg: scraped.reviewSummary.avg,
    reviewCount: scraped.reviewSummary.count,
    reviewSamples: scraped.reviewSummary.samples.slice(0, 3),

    // Rakuten API data (price, review, image from real product listing)
    rakuten: scraped.rakuten || null,

    // Vision
    visionAnalysis: visionResult,

    // Pre-resolved category (as hint, NOT final decision)
    categoryHint: categoryInfo,
  };

  const prompt = `あなたは商品理解AIです。
以下の構造化データのみを使って商品を理解してください。
URLや過去の商品データを推測に使わないでください。
カテゴリはデータから判定してください（AI推論は最後の手段）。

## 入力データ
${JSON.stringify(context, null, 2)}

## 出力形式（JSON）
{
  "name": "正確な商品名",
  "brand": "ブランド名",
  "maker": "メーカー名",
  "model": "型番（不明なら空文字）",
  "category": "大カテゴリ（データから判定）",
  "subCategory": "サブカテゴリ",
  "productType": "商品タイプ（より詳細）",
  "useCase": "主な用途",
  "priceRange": "価格帯（データにあれば）",

  "categorySource": "カテゴリ判定の根拠（例: JSON-LDとパンくずより）",
  "categoryChain": ["大カテゴリ", "中カテゴリ", "小カテゴリ"],
  "categoryConfidence": 信頼度(0-100の数値),

  "whatIsThis": "この商品は何か（1〜2文）",
  "whatItSolves": "何の課題を解決するか",
  "forWho": "どんな人向けか",
  "useScenes": ["使用シーン1", "使用シーン2", "使用シーン3"],
  "competitors": ["競合商品1", "競合商品2"],
  "alternatives": ["代替商品1", "代替商品2"],
  "strengths": ["強み1", "強み2", "強み3"],
  "weaknesses": ["弱み1", "弱み2"],
  "notForWho": ["向いていない人1", "向いていない人2"],

  "reviewSummary": {
    "avg": レビュー平均点(数値またはnull),
    "count": レビュー件数(数値またはnull),
    "highEval": ["高評価理由1", "高評価理由2"],
    "lowEval": ["低評価理由1"],
    "longTerm": "長期使用評価",
    "positive": ["ポジティブ評価1", "ポジティブ評価2"],
    "negative": ["ネガティブ評価1"]
  },

  "searchKeywords": ["キーワード1", "キーワード2", "...(10個)"],
  "visionUsed": true/false,
  "inferenceMethod": "判定方法の説明"
}

必ずJSONのみを返してください。説明文は不要です。`;

  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = msg.content[0].text;
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('AI response parsing failed');
  return JSON.parse(match[0]);
}
