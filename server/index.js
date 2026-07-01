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

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('【楽天API】接続確認');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  RAKUTEN_APP_ID : ${process.env.RAKUTEN_APP_ID ? '✓ set' : '✗ 未設定'}`);
    console.log(`  RAKUTEN_AFFILIATE_ID: ${process.env.RAKUTEN_AFFILIATE_ID ? '✓ set' : '✗ 未設定'}`);
    console.log(`  検索キーワード : ${item.label || '（未入力 — URLから推定）'}`);

    if (process.env.RAKUTEN_APP_ID) {
      const keyword = item.label || null;
      const result = await searchRakuten({ keyword, urls });

      console.log(`  API結果        : ${result.ok ? '✓ 成功' : `✗ 失敗 — ${result.reason}`}`);

      if (result.ok && result.best) {
        rakutenData = result;
        const rb = result.best;
        console.log('\n  ─── 楽天API 取得データ ───────────────────');
        console.log(`  [楽天] 商品名         : ${rb.name}`);
        console.log(`  [楽天] 価格           : ¥${rb.price?.toLocaleString() ?? '—'}`);
        console.log(`  [楽天] レビュー件数   : ${rb.reviewCount ?? '—'}件`);
        console.log(`  [楽天] レビュー平均   : ${rb.reviewAverage ?? '—'}`);
        console.log(`  [楽天] 楽天商品URL    : ${rb.rakutenUrl ?? '—'}`);
        console.log(`  [楽天] アフィリエイトURL: ${rb.rakutenUrl ?? '（affiliateId未設定）'}`);
        console.log(`  [楽天] 画像URL        : ${rb.imageUrl ?? '—'}`);
        console.log(`  [楽天] ショップ名     : ${rb.shopName ?? '—'}`);
        console.log(`  [楽天] キャッチコピー : ${rb.catchCopy?.slice(0, 60) ?? '—'}`);
        console.log(`  [楽天] 総ヒット件数   : ${result.totalCount}件`);
        console.log('  ──────────────────────────────────────────');

        sse.emit('progress', { stage: 'rakuten', detail: `[楽天API] 「${rb.name.slice(0, 35)}」 ¥${rb.price?.toLocaleString()} / レビュー${rb.reviewCount}件 (★${rb.reviewAverage})` });
        sse.emit('rakutenResult', { rakuten: result });
      } else {
        console.log(`  取得失敗理由   : ${result.reason}`);
        sse.emit('progress', { stage: 'rakuten', detail: `[楽天API] スキップ: ${result.reason}` });
      }
    } else {
      console.log('  → RAKUTEN_APP_ID未設定のためスキップ');
      sse.emit('progress', { stage: 'rakuten', detail: '[楽天API] RAKUTEN_APP_ID未設定 — スキップ' });
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    sse.emit('stage', { id: 'rakuten', status: 'done' });

    // ── STAGE: fetch + parse ──
    sse.emit('stage', { id: 'fetch', status: 'running', detail: 'Playwrightでページを取得中' });
    sse.emit('stage', { id: 'parse', status: 'running' });

    let scraped;
    let playwrightOk = true;
    try {
      scraped = await scrapeUrls(urls, ({ stage, detail }) => {
        sse.emit('progress', { stage, detail });
      });
      sse.emit('stage', { id: 'fetch', status: 'done' });
      sse.emit('stage', { id: 'parse', status: 'done' });
    } catch (scrapeErr) {
      playwrightOk = false;
      const errMsg = scrapeErr.message || '';
      const hint = errMsg.includes('executable') || errMsg.includes('Chromium')
        ? 'Chromium未インストール — 楽天APIデータで継続します'
        : `Playwright失敗 — 楽天APIデータで継続します`;
      sse.emit('stage', { id: 'fetch', status: 'error', detail: hint });
      sse.emit('stage', { id: 'parse', status: 'error' });
      sse.emit('progress', { stage: 'fetch', detail: `⚠ ${hint}` });
      console.warn('  [Playwright] 失敗:', errMsg.slice(0, 120));
      scraped = buildFallbackScraped(urls);
    }

    // ── Playwright 取得データ ログ ──
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('【Playwright】取得データ');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  [Playwright] タイトル     : ${scraped.title || '—'}`);
    console.log(`  [Playwright] h1           : ${scraped.h1 || '—'}`);
    console.log(`  [Playwright] パンくず     : ${scraped.breadcrumbs?.join(' > ') || '—'}`);
    console.log(`  [Playwright] レビュー平均 : ${scraped.reviewSummary?.avg ?? '—'}`);
    console.log(`  [Playwright] レビュー件数 : ${scraped.reviewSummary?.count ?? '—'}件`);
    console.log(`  [Playwright] 画像数       : ${scraped.images?.length ?? 0}件`);
    console.log(`  [Playwright] JSON-LD数    : ${scraped.jsonLd?.length ?? 0}件`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 楽天データをスクレイプ結果にマージ（Playwrightで取れなかった項目を補完）
    if (rakutenData?.best) {
      const rb = rakutenData.best;
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('【データマージ】楽天 → Playwright 補完');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      if (!scraped.reviewSummary.avg && rb.reviewAverage) {
        scraped.reviewSummary.avg = rb.reviewAverage;
        console.log(`  レビュー平均 → 楽天から補完: ${rb.reviewAverage}`);
      }
      if (!scraped.reviewSummary.count && rb.reviewCount) {
        scraped.reviewSummary.count = rb.reviewCount;
        console.log(`  レビュー件数 → 楽天から補完: ${rb.reviewCount}件`);
      }
      if (rb.imageUrl && !scraped.images.includes(rb.imageUrl)) {
        scraped.images.unshift(rb.imageUrl);
        console.log(`  画像 → 楽天から先頭に追加: ${rb.imageUrl}`);
      }
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
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

    // ── Playwright失敗時: 楽天データで scraped を補完 ──
    if (!playwrightOk && rakutenData?.best) {
      const rb = rakutenData.best;
      console.log('  [フォールバック] 楽天データでscrapedを補完');
      scraped.h1 = scraped.h1 || rb.name || '';
      scraped.title = scraped.title || rb.name || '';
      // catchCopyを説明文として活用
      if (rb.catchCopy) scraped.description = rb.catchCopy;
      scraped.reviewSummary.avg = rb.reviewAverage || null;
      scraped.reviewSummary.count = rb.reviewCount || null;
      if (rb.imageUrl) scraped.images = [rb.imageUrl];
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
      playwrightOk,
      message: confidence >= 95
        ? `カテゴリ自動確定（信頼度 ${confidence}%）`
        : `カテゴリ要確認（信頼度 ${confidence}%）`,
      dataSource: !playwrightOk
        ? (rakutenData?.best ? '楽天APIのみ' : 'データ不足')
        : (rakutenData?.best ? '楽天API + Playwright' : 'Playwrightのみ'),
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
  const rb = scraped.rakuten || null;
  const name = scraped.h1 || scraped.title || scraped.og.title || item.label || rb?.name || '不明';
  const brand = scraped.specs.brand || item.brand || name.split(/[\s\-]/)[0] || '不明';
  const catchCopy = rb?.catchCopy || '';

  // 楽天データからキーワードを抽出
  const rakutenKeywords = [];
  if (rb?.name) {
    const words = rb.name.split(/[\s　【】「」（）()・\/]/).filter(w => w.length >= 2 && w.length <= 12);
    rakutenKeywords.push(...words.slice(0, 6));
  }

  return {
    name,
    brand,
    maker: brand,
    model: '',
    category: scraped.rawCategory[0] || item.mainCategory || '',
    subCategory: scraped.breadcrumbs[scraped.breadcrumbs.length - 1] || item.subCategory || '',
    productType: item.subCategory || '',
    useCase: catchCopy.slice(0, 80) || '',
    categorySource: rb ? '楽天API商品名' : (scraped.categoryInfo?.sources?.join(', ') || 'データ不足'),
    categoryChain: scraped.breadcrumbs.slice(0, 3),
    categoryConfidence: scraped.categoryInfo?.confidence || (rb ? 40 : 0),
    whatIsThis: catchCopy
      ? `${name}。${catchCopy.slice(0, 100)}`
      : `${name}の商品です。`,
    whatItSolves: catchCopy ? catchCopy.slice(0, 80) : '',
    forWho: '',
    useScenes: [],
    competitors: [],
    alternatives: [],
    strengths: [],
    weaknesses: [],
    notForWho: [],
    reviewSummary: {
      avg: rb?.reviewAverage || scraped.reviewSummary?.avg || null,
      count: rb?.reviewCount || scraped.reviewSummary?.count || null,
      highEval: [], lowEval: [], longTerm: '', positive: [], negative: [],
    },
    searchKeywords: [...new Set([...rakutenKeywords, ...scraped.breadcrumbs.slice(0, 3)])].slice(0, 10),
    visionUsed: false,
    inferenceMethod: rb ? '楽天APIフォールバック（Playwright未実行）' : 'フォールバック（データ不足）',
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
