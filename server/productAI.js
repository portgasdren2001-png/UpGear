/**
 * productAI.js — Claude API による商品理解（UpGear思想ベース）
 *
 * UpGearの前提:
 *   ギア = 判断を減らすための装備
 *   良い商品ではなく、日常の迷い・手間・失敗を減らす商品を評価する
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

// ─── UpGear Product Understanding ────────────────────────────────────────────

export async function analyzeProduct(scraped, visionResult, existingCategoryInfo) {

  // 楽天データを優先的に渡す（商品名・価格・レビュー・説明が最も信頼できる）
  const rb = scraped.rakuten || null;

  const context = {
    // 商品の基本情報（楽天API優先）
    productName:    rb?.name     || scraped.h1 || scraped.title || null,
    price:          rb?.price    || null,
    reviewAverage:  rb?.reviewAverage || scraped.reviewSummary?.avg || null,
    reviewCount:    rb?.reviewCount   || scraped.reviewSummary?.count || null,
    catchCopy:      rb?.catchCopy || null,
    shopName:       rb?.shopName  || null,

    // Playwrightで取得した詳細情報
    description:    scraped.description?.slice(0, 1000) || null,
    features:       scraped.features?.slice(0, 10) || [],
    breadcrumbs:    scraped.breadcrumbs || [],
    specs:          scraped.specs || {},

    // レビューサンプル（ユーザーの生の声）
    reviewSamples:  scraped.reviewSummary?.samples?.slice(0, 5) || [],

    // Vision解析（画像から推定）
    visionAnalysis: visionResult || null,

    // カテゴリヒント（最終判断はClaudeに委ねる）
    categoryHint:   existingCategoryInfo || null,
  };

  const systemPrompt = `あなたはUpGearの「商品理解エンジン」です。
SNS台本はまだ生成しません。まず商品を正確に理解することが目標です。

## フェーズ1: 商品理解（このプロンプトの役割）
- 商品が「何であるか」「誰のためのものか」「何の問題を解くか」を確実に把握する
- カテゴリを全情報源（楽天ジャンル・説明・レビュー・Vision解析）から厳密に判定する
- カテゴリが確定できない場合は候補を列挙し、信頼度を下げて返す（推測で埋めない）

## UpGearの思想
- ギアとは「判断を減らすための装備」
- 良い商品ではなく「日常の迷い・手間・失敗を減らす装備」を評価する
- 誰にでも勧めない。向いていない人を必ず先に出す
- 価格より「判断削減・継続運用・代替不可能性」を重視する

## 判断基準
- 情報が不足している場合は無理に評価せず「情報不足」「要確認」とする
- カテゴリが判定できない場合: categoryConfidence を 50 以下にし、categoryCandidates に候補を列挙する
- UpGearスコアは厳しく採点する（80点以上 = 多くの人の日常判断を確実に減らせる）`;

  const prompt = `以下の商品データをUpGear思想で評価してください。

## 商品データ
${JSON.stringify(context, null, 2)}

## 出力形式（JSON）
{
  "name": "正確な商品名",
  "brand": "ブランド名（不明なら空文字）",
  "maker": "メーカー名",
  "model": "型番（不明なら空文字）",
  "category": "大カテゴリ（ガジェット / バッグ / アパレル / シューズ / デスク環境 / EDC / トラベル / その他）",
  "subCategory": "小カテゴリ",
  "productType": "商品タイプ（具体的に）",
  "priceRange": "価格帯（例: ¥3,000〜5,000）",

  "categorySource": "カテゴリ判定の根拠",
  "categoryChain": ["大カテゴリ", "中カテゴリ", "小カテゴリ"],
  "categoryConfidence": カテゴリ信頼度(0-100の数値),

  "judgmentReducer": "この商品は何の判断を減らす装備か（1〜2文で具体的に）",

  "notForWho": [
    "向いていない人の具体的な属性や状況（必ず先に、最低2つ）"
  ],

  "forWho": "向いている人（デスクワーカー・通勤・日常運用など具体的に）",

  "dailyFrictionReduced": [
    "日常で減る具体的な迷い・手間・判断（例: 毎朝何を持っていくか迷う時間が消える）"
  ],

  "continuityReason": "継続使用できる理由（なぜ飽きずに使い続けられるか）",

  "vsAlternatives": "代替品（安い選択肢・他ブランド）と比べた実質的な優位性",

  "strengths": ["強み1", "強み2", "強み3"],

  "weaknesses": ["弱点1（実際の使用上の問題）", "弱点2"],

  "upgearScore": UpGearスコア(0-100の整数。厳しく採点。80以上は日常判断を確実に減らせる商品のみ),

  "verdict": "認定 または 条件付き または 非認定 または 情報不足",

  "verdictReason": "認定/非認定の根拠（UpGear思想に基づいて1〜2文）",

  "tiktokAngles": [
    "TikTok投稿で使える切り口・フック（視聴者が思わず止まるアングル）"
  ],

  "useScenes": ["日常的な使用シーン1", "使用シーン2"],

  "reviewData": {
    "avg": レビュー平均点(数値またはnull),
    "count": レビュー件数(数値またはnull),
    "highEval": ["高評価の実際の理由"],
    "lowEval": ["低評価・クレームの実際の内容"],
    "longTerm": "長期使用者の評価傾向",
    "positive": ["ポジティブ評価1", "ポジティブ評価2"],
    "negative": ["ネガティブ評価1"]
  },

  "searchKeywords": ["キーワード1", "キーワード2", "...(10個)"],

  "visionUsed": true/false,
  "inferenceMethod": "判定方法（楽天APIデータ中心 / Playwright + 楽天API / フォールバックなど）",

  "dataQuality": "excellent / good / limited / insufficient（入力データの質の評価）",
  "dataQualityNote": "データ不足の場合に何が足りないか",

  "categoryCandidates": ["カテゴリ不明時の候補1", "候補2", "候補3"],

  "summary": {
    "productName": "正確な商品名（不明なら空文字）",
    "brand": "ブランド名（不明なら空文字）",
    "category": "商品カテゴリ（確定できない場合は「不明」）",
    "purpose": "何に使うか（1〜2文で具体的に）",
    "mainFeatures": ["主な機能1", "主な機能2", "主な機能3"],
    "targetUser": "想定ユーザー（具体的な属性・状況）",
    "priceRange": "価格帯（例: ¥3,000〜5,000）",
    "reviewSummary": "口コミ評価（平均点・件数・傾向を1文で）",
    "complaints": ["実際の不満点1", "不満点2"],
    "upgearValue": "UpGear装備としての価値（判断削減の観点で1〜2文）",
    "misjudgmentRisk": "誤認リスク（この商品を誤解しやすいポイント）",
    "confidence": 理解信頼度(0-100の整数。カテゴリ不確定なら50以下)
  }
}

必ずJSONのみを返してください。説明文は不要です。`;

  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = msg.content[0].text;
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('AI response parsing failed');
  return JSON.parse(match[0]);
}
