/**
 * UpGear Backend Server — v6.1
 * Express + Playwright + Claude API
 *
 * POST /api/product/understand  → SSE stream
 * GET  /api/health
 */

import express from 'express';
import cors from 'cors';
import { scrapeUrls } from './scraper.js';
import { analyzeProduct, analyzeVision } from './productAI.js';
import { calcUnderstandingScore } from './scoring.js';
import { searchRakuten } from './rakuten.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// ─── SSE helper ──────────────────────────────────────────────────────────────

function createSse(res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  return {
    emit(type, data) {
      res.write(`data: ${JSON.stringify({ type, ...data })}\n\n`);
      if (res.flush) res.flush();
    },
    end() { res.end(); },
  };
}

// ─── Health check ─────────────────────────────────────────────────────────────

app.get('/api/health', (_, res) => {
  res.json({ ok: true, version: '6.1', ts: Date.now() });
});

// ─── Product understanding — SSE stream ───────────────────────────────────────

app.post('/api/product/understand', async (req, res) => {
  const sse = createSse(res);
  const { urls = {}, item = {} } = req.body;

  const urlCount = Object.values(urls).filter(Boolean).length;
  if (urlCount === 0) {
    sse.emit('error', { message: 'URLが入力されていません' });
    sse.end();
    return;
  }

  try {
    // ── STAGE: init ──
    sse.emit('stage', { id: 'init', status: 'running', detail: `${urlCount}件のURLを解析中` });
    await sleep(200);
    sse.emit('stage', { id: 'init', status: 'done' });

    // ── STAGE: rakuten ──
    sse.emit('stage', { id: 'rakuten', status: 'running', detail: '楽天APIで商品情報を取得中' });
    let rakutenData = null;
    if (process.env.RAKUTEN_APP_ID) {
      const keyword = item.label || null;
      const result = await searchRakuten({ keyword, urls });
      if (result.ok && result.best) {
        rakutenData = result;
        sse.emit('progress', { stage: 'rakuten', detail: `楽天: 「${result.best.name.slice(0, 40)}」 ¥${result.best.price?.toLocaleString()} / レビュー${result.best.reviewCount}件` });
        sse.emit('rakutenResult', { rakuten: result });
      } else {
        sse.emit('progress', { stage: 'rakuten', detail: `楽天スキップ: ${result.reason}` });
      }
    } else {
      sse.emit('progress', { stage: 'rakuten', detail: 'RAKUTEN_APP_ID未設定 — スキップ' });
    }
    sse.emit('stage', { id: 'rakuten', status: 'done' });

    // ── STAGE: fetch + parse ──
    sse.emit('stage', { id: 'fetch', status: 'running', detail: 'Playwrightでページを取得中' });
    sse.emit('stage', { id: 'parse', status: 'running' });

    let scraped;
    try {
      scraped = await scrapeUrls(urls, ({ stage, detail }) => {
        sse.emit('progress', { stage, detail });
      });
      sse.emit('stage', { id: 'fetch', status: 'done' });
      sse.emit('stage', { id: 'parse', status: 'done' });
    } catch (scrapeErr) {
      sse.emit('stage', { id: 'fetch', status: 'error', detail: scrapeErr.message });
      sse.emit('stage', { id: 'parse', status: 'error' });
      scraped = buildFallbackScraped(urls);
    }

    // 楽天データをスクレイプ結果にマージ（Playwrightで取れなかった項目を補完）
    if (rakutenData?.best) {
      const rb = rakutenData.best;
      if (!scraped.reviewSummary.avg && rb.reviewAverage)
        scraped.reviewSummary.avg = rb.reviewAverage;
      if (!scraped.reviewSummary.count && rb.reviewCount)
        scraped.reviewSummary.count = rb.reviewCount;
      if (rb.imageUrl && !scraped.images.includes(rb.imageUrl))
        scraped.images.unshift(rb.imageUrl);
      scraped.rakuten = {
        name: rb.name,
        price: rb.price,
        reviewCount: rb.reviewCount,
        reviewAverage: rb.reviewAverage,
        imageUrl: rb.imageUrl,
        url: rb.rakutenUrl,
        shopName: rb.shopName,
        catchCopy: rb.catchCopy,
        totalResults: rakutenData.totalCount,
      };
    }

    // ── STAGE: schema ──
    sse.emit('stage', { id: 'schema', status: 'running', detail: 'JSON-LD / schema.org 解析' });
    sse.emit('rawDebug', { debug: scraped.debug, categoryInfo: scraped.categoryInfo });
    await sleep(300);
    sse.emit('stage', { id: 'schema', status: 'done' });

    // ── STAGE: reviews ──
    sse.emit('stage', { id: 'reviews', status: 'running', detail: 'レビューデータ収集' });
    await sleep(200);
    sse.emit('stage', { id: 'reviews', status: 'done' });

    // ── STAGE: vision ──
    sse.emit('stage', { id: 'vision', status: 'running', detail: `画像 ${scraped.images.length}件 を解析中` });
    let visionResult = null;
    if (scraped.images.length > 0 && process.env.ANTHROPIC_API_KEY) {
      try {
        visionResult = await analyzeVision(scraped.images);
        sse.emit('visionResult', { vision: visionResult });
      } catch (vErr) {
        sse.emit('progress', { stage: 'vision', detail: `Vision失敗: ${vErr.message.slice(0, 60)}` });
      }
    } else {
      sse.emit('progress', { stage: 'vision', detail: scraped.images.length === 0 ? '画像なし — スキップ' : 'APIキー未設定' });
    }
    sse.emit('stage', { id: 'vision', status: 'done' });

    // ── STAGE: analyze ──
    sse.emit('stage', { id: 'analyze', status: 'running', detail: 'Claude APIで商品理解中' });
    let aiResult;
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        aiResult = await analyzeProduct(scraped, visionResult, scraped.categoryInfo);
      } catch (aiErr) {
        sse.emit('progress', { stage: 'analyze', detail: `AI失敗: ${aiErr.message.slice(0, 60)}` });
        aiResult = buildFallbackAiResult(scraped, item);
      }
    } else {
      sse.emit('progress', { stage: 'analyze', detail: 'APIキー未設定 — フォールバック' });
      aiResult = buildFallbackAiResult(scraped, item);
    }
    sse.emit('stage', { id: 'analyze', status: 'done' });

    // ── STAGE: score ──
    sse.emit('stage', { id: 'score', status: 'running', detail: 'スコア算出・カルテ生成' });

    const card = buildProductCard(aiResult, scraped, visionResult, rakutenData);
    const { score: understandingScore, missing: missingFields } = calcUnderstandingScore(card);
    card.understandingScore = understandingScore;
    card.missingFields = missingFields;
    card.fetchedAt = Date.now();
    card.urlCount = urlCount;
    card.urls = urls;
    card.visionAnalyzed = !!visionResult;
    card.visionData = visionResult;
    card.debug = scraped.debug;

    await sleep(200);
    sse.emit('stage', { id: 'score', status: 'done' });

    // ── DONE ──
    sse.emit('card', { card });

    // Confidence gate — tell frontend if user confirmation is needed
    const confidence = card.categoryConfidence || 50;
    sse.emit('done', {
      requiresConfirmation: confidence < 95,
      confidence,
      message: confidence >= 95
        ? `カテゴリ自動確定（信頼度 ${confidence}%）`
        : `カテゴリ要確認（信頼度 ${confidence}%）`,
    });
  } catch (err) {
    console.error('Understand error:', err);
    sse.emit('error', { message: err.message });
  }

  sse.end();
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function buildFallbackScraped(urls) {
  return {
    jsonLd: [], schemaOrg: [], breadcrumbs: [], features: [], specs: {}, images: [],
    rawCategory: [], reviewSummary: { avg: null, count: null, samples: [] },
    debug: { found: [], missing: ['page-load-failed'] },
    title: '', h1: '', description: '', og: {}, meta: {}, siteType: 'official',
    categoryInfo: { category: null, sources: [], confidence: 0 },
    sources: Object.entries(urls).filter(([,v]) => v).map(([k,v]) => ({ key: k, url: v })),
  };
}

function buildFallbackAiResult(scraped, item) {
  const name = scraped.h1 || scraped.title || scraped.og.title || item.label || '不明';
  const brand = scraped.specs.brand || name.split(/[\s\-]/)[0] || '不明';
  return {
    name, brand, maker: brand, model: '', category: scraped.rawCategory[0] || '',
    subCategory: scraped.breadcrumbs[scraped.breadcrumbs.length - 1] || '',
    productType: '', useCase: '',
    categorySource: scraped.categoryInfo?.sources?.join(', ') || 'データ不足',
    categoryChain: scraped.breadcrumbs.slice(0, 3),
    categoryConfidence: scraped.categoryInfo?.confidence || 0,
    whatIsThis: `${name}の商品です。`,
    whatItSolves: '', forWho: '', useScenes: [], competitors: [], alternatives: [],
    strengths: [], weaknesses: [], notForWho: [],
    reviewSummary: scraped.reviewSummary,
    searchKeywords: scraped.breadcrumbs.slice(0, 5),
    visionUsed: false, inferenceMethod: 'フォールバック（スクレイプ失敗）',
  };
}

function buildProductCard(ai, scraped, vision, rakutenData) {
  const rb = rakutenData?.best || null;
  return {
    name: ai.name,
    brand: ai.brand,
    maker: ai.maker || ai.brand,
    model: ai.model || '',
    category: ai.category,
    subCategory: ai.subCategory,
    productType: ai.productType || ai.subCategory,
    useCase: ai.useCase,
    priceRange: ai.priceRange || '',
    categorySource: ai.categorySource,
    categoryChain: ai.categoryChain || [],
    categoryConfidence: ai.categoryConfidence || 0,
    whatIsThis: ai.whatIsThis,
    whatItSolves: ai.whatItSolves,
    forWho: ai.forWho,
    notForWho: ai.notForWho || [],
    useScenes: ai.useScenes || [],
    competitors: ai.competitors || [],
    alternatives: ai.alternatives || [],
    strengths: ai.strengths || [],
    weaknesses: ai.weaknesses || [],
    reviewData: {
      avg: ai.reviewSummary?.avg || scraped.reviewSummary?.avg,
      count: ai.reviewSummary?.count || scraped.reviewSummary?.count,
      highEval: ai.reviewSummary?.highEval || [],
      lowEval: ai.reviewSummary?.lowEval || [],
      longTerm: ai.reviewSummary?.longTerm || '',
      positive: ai.reviewSummary?.positive || [],
      negative: ai.reviewSummary?.negative || [],
    },
    searchKeywords: ai.searchKeywords || [],
    inferenceMethod: ai.inferenceMethod || '',
    visionUsed: ai.visionUsed || false,
    visionCategory: vision?.category || null,
    visionProductType: vision?.productType || null,
    fetchSources: scraped.sources || [],
    rawBreadcrumbs: scraped.breadcrumbs,
    rawCategory: scraped.rawCategory,
    // 楽天APIデータ
    rakuten: scraped.rakuten || null,
    rakutenPrice: rb?.price || null,
    rakutenReviewCount: rb?.reviewCount || null,
    rakutenReviewAverage: rb?.reviewAverage || null,
    rakutenUrl: rb?.rakutenUrl || null,
    rakutenImageUrl: rb?.imageUrl || null,
  };
}

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`UpGear server v6.1 — http://localhost:${PORT}`);
  console.log(`Anthropic API: ${process.env.ANTHROPIC_API_KEY ? '✓ set' : '✗ not set (fallback mode)'}`);
});
