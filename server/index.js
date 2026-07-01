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
import { sync, getProducts, getProductById, getCategories, getRankings, getSyncMeta } from './publishStore.js';

const app = express();
const PORT = process.env.PORT || 3001;

const ALLOWED_ORIGINS = [
  'http://localhost:5173',  // UpGear OS
  'http://localhost:5174',  // ReadyAI dev
  'http://localhost:4173',  // ReadyAI preview
];

app.use(cors({
  origin: (origin, cb) => {
    // allow server-to-server (no origin) and listed origins
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error('CORS: origin not allowed'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

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
  const name = scraped.h1 || scraped.title || scraped.og?.title || item.label || rb?.name || '不明';
  const brand = scraped.specs?.brand || item.brand || name.split(/[\s\-]/)[0] || '不明';
  const catchCopy = rb?.catchCopy || '';

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
    category: scraped.rawCategory?.[0] || item.mainCategory || '',
    subCategory: scraped.breadcrumbs?.[scraped.breadcrumbs.length - 1] || item.subCategory || '',
    productType: item.subCategory || '',
    priceRange: rb?.price ? `¥${rb.price.toLocaleString()}` : '',
    categorySource: rb ? '楽天API商品名' : (scraped.categoryInfo?.sources?.join(', ') || 'データ不足'),
    categoryChain: scraped.breadcrumbs?.slice(0, 3) || [],
    categoryConfidence: scraped.categoryInfo?.confidence || (rb ? 40 : 0),
    // UpGear判断フィールド — フォールバックは空にする（推測で埋めない）
    judgmentReducer: '',
    notForWho: [],
    forWho: '',
    dailyFrictionReduced: [],
    continuityReason: '',
    vsAlternatives: '',
    strengths: [],
    weaknesses: [],
    upgearScore: null,
    verdict: '情報不足',
    verdictReason: 'データ不足のためUpGear判断を実行できませんでした。商品理解AIを再実行してください。',
    tiktokAngles: [],
    useScenes: [],
    // 旧互換
    whatIsThis: catchCopy ? `${name}。${catchCopy.slice(0, 100)}` : `${name}の商品です。`,
    whatItSolves: catchCopy ? catchCopy.slice(0, 80) : '',
    reviewData: {
      avg: rb?.reviewAverage || scraped.reviewSummary?.avg || null,
      count: rb?.reviewCount || scraped.reviewSummary?.count || null,
      highEval: [], lowEval: [], longTerm: '', positive: [], negative: [],
    },
    searchKeywords: [...new Set([...rakutenKeywords, ...(scraped.breadcrumbs?.slice(0, 3) || [])])].slice(0, 10),
    visionUsed: false,
    inferenceMethod: rb ? '楽天APIフォールバック（Playwright未実行）' : 'フォールバック（データ不足）',
    dataQuality: rb ? 'limited' : 'insufficient',
    dataQualityNote: rb ? '楽天APIデータのみ。Playwright未実行のため詳細情報が不足しています。' : 'データが取得できませんでした。URLを確認して再試行してください。',
  };
}

function buildProductCard(ai, scraped, vision, rakutenData) {
  const rb = rakutenData?.best || null;

  // reviewData は ai.reviewData（新形式）または ai.reviewSummary（旧互換）から取得
  const rdSrc = ai.reviewData || ai.reviewSummary || {};

  return {
    // ─── 基本情報
    name:         ai.name,
    brand:        ai.brand,
    maker:        ai.maker || ai.brand,
    model:        ai.model || '',
    category:     ai.category,
    subCategory:  ai.subCategory,
    productType:  ai.productType || ai.subCategory,
    priceRange:   ai.priceRange || '',

    // ─── カテゴリ判定
    categorySource:     ai.categorySource,
    categoryChain:      ai.categoryChain || [],
    categoryConfidence: ai.categoryConfidence || 0,

    // ─── UpGear思想ベース判断（新フィールド）
    judgmentReducer:        ai.judgmentReducer || '',
    notForWho:              ai.notForWho || [],
    forWho:                 ai.forWho || '',
    dailyFrictionReduced:   ai.dailyFrictionReduced || [],
    continuityReason:       ai.continuityReason || '',
    vsAlternatives:         ai.vsAlternatives || '',
    strengths:              ai.strengths || [],
    weaknesses:             ai.weaknesses || [],
    upgearScore:            ai.upgearScore ?? null,
    verdict:                ai.verdict || '情報不足',
    verdictReason:          ai.verdictReason || '',
    tiktokAngles:           ai.tiktokAngles || [],

    // ─── 旧互換フィールド（フロントエンドが参照している箇所のため維持）
    whatIsThis:    ai.judgmentReducer || ai.whatIsThis || '',
    whatItSolves:  ai.dailyFrictionReduced?.[0] || ai.whatItSolves || '',
    useScenes:     ai.useScenes || [],
    competitors:   ai.competitors || [],
    alternatives:  ai.alternatives || [],

    // ─── レビューデータ
    reviewData: {
      avg:      rdSrc.avg   || scraped.reviewSummary?.avg   || null,
      count:    rdSrc.count || scraped.reviewSummary?.count || null,
      highEval: rdSrc.highEval || [],
      lowEval:  rdSrc.lowEval  || [],
      longTerm: rdSrc.longTerm || '',
      positive: rdSrc.positive || [],
      negative: rdSrc.negative || [],
    },

    // ─── メタ情報
    searchKeywords:  ai.searchKeywords || [],
    inferenceMethod: ai.inferenceMethod || '',
    dataQuality:     ai.dataQuality || 'limited',
    dataQualityNote: ai.dataQualityNote || '',
    visionUsed:      ai.visionUsed || false,
    visionCategory:  vision?.category || null,
    visionProductType: vision?.productType || null,
    fetchSources:    scraped.sources || [],
    rawBreadcrumbs:  scraped.breadcrumbs,
    rawCategory:     scraped.rawCategory,

    // ─── 楽天APIデータ
    rakuten:              scraped.rakuten || null,
    rakutenPrice:         rb?.price || null,
    rakutenReviewCount:   rb?.reviewCount || null,
    rakutenReviewAverage: rb?.reviewAverage || null,
    rakutenUrl:           rb?.rakutenUrl || null,
    rakutenImageUrl:      rb?.imageUrl || null,
  };
}

// ─── Public API (ReadyAI / iOS / Android 共通) ────────────────────────────────

// 商品一覧
app.get('/api/products', (req, res) => {
  const products = getProducts();
  const { category, genre, q, limit, offset } = req.query;

  let list = products;
  if (category) list = list.filter(p => p.category === category || p.mainCategory === category);
  if (genre)    list = list.filter(p => p.manualGenre === genre);
  if (q) {
    const lq = q.toLowerCase();
    list = list.filter(p =>
      (p.name || '').toLowerCase().includes(lq) ||
      (p.brand || '').toLowerCase().includes(lq) ||
      (p.category || '').toLowerCase().includes(lq)
    );
  }

  const total = list.length;
  const off = parseInt(offset) || 0;
  const lim = Math.min(parseInt(limit) || 50, 100);
  const items = list.slice(off, off + lim);

  res.json({ ok: true, total, offset: off, limit: lim, items });
});

// 商品詳細
app.get('/api/products/:id', (req, res) => {
  const product = getProductById(req.params.id);
  if (!product) return res.status(404).json({ ok: false, error: 'not found' });
  res.json({ ok: true, product });
});

// カテゴリ一覧
app.get('/api/categories', (req, res) => {
  const categories = getCategories();
  const products   = getProducts();

  // 商品数を付与
  const withCount = categories.map(cat => ({
    ...cat,
    count: products.filter(p => p.mainCategory === cat.name || p.category === cat.name).length,
  }));

  res.json({ ok: true, categories: withCount });
});

// ランキング
app.get('/api/rankings', (req, res) => {
  const rankings = getRankings();
  res.json({ ok: true, rankings });
});

// 同期メタ情報
app.get('/api/sync/status', (_, res) => {
  res.json({ ok: true, ...getSyncMeta() });
});

// ─── Sync endpoint (UpGear OS → server) ──────────────────────────────────────

app.post('/api/sync', (req, res) => {
  const { products, categories, rankings } = req.body;
  if (!Array.isArray(products)) {
    return res.status(400).json({ ok: false, error: 'products must be an array' });
  }

  // 公開用に内部管理情報を除去する
  const publicProducts = products.map(p => sanitizeForPublic(p));

  const result = sync({ products: publicProducts, categories: categories || [], rankings: rankings || [] });
  res.json(result);
});

// 内部管理情報を除いた公開用データに変換
function sanitizeForPublic(item) {
  const card = item.card || {};
  const rb   = item.rakuten || card.rakuten || {};

  return {
    id:          item.id,
    name:        card.name        || item.label || '',
    label:       item.label       || '',
    brand:       card.brand       || item.brand || '',
    maker:       card.maker       || '',
    model:       card.model       || '',
    category:    card.category    || item.mainCategory || item.category || '',
    mainCategory: item.mainCategory || card.category || '',
    subCategory: card.subCategory || item.subCategory || '',
    manualGenre: item.manualGenre || null,
    inferredGenre: item.inferredGenre || null,

    // 商品説明・特徴
    description:        card.whatIsThis        || '',
    judgmentReducer:    card.judgmentReducer   || '',
    forWho:             card.forWho            || '',
    notForWho:          card.notForWho         || [],
    dailyFrictionReduced: card.dailyFrictionReduced || [],
    continuityReason:   card.continuityReason  || '',
    vsAlternatives:     card.vsAlternatives    || '',
    strengths:          card.strengths         || [],
    weaknesses:         card.weaknesses        || [],
    useScenes:          card.useScenes         || [],

    // UpGear評価
    upgearScore:  card.upgearScore  ?? item.score ?? null,
    verdict:      card.verdict      || item.judgment || '',
    verdictReason: card.verdictReason || '',

    // 価格・レビュー
    price:         rb.price         || item.price    || null,
    priceRange:    card.priceRange  || '',
    reviewAvg:     rb.reviewAverage || card.reviewData?.avg  || null,
    reviewCount:   rb.reviewCount   || card.reviewData?.count || null,

    // 画像
    imageUrl:   rb.imageUrl || card.rakutenImageUrl || null,
    images:     item.images || [],

    // 購入リンク
    rakutenUrl: rb.url || card.rakutenUrl || item.urls?.rakuten || null,
    amazonUrl:  item.urls?.amazon || null,
    officialUrl: item.urls?.official || null,

    // タグ・キーワード
    searchKeywords: card.searchKeywords || [],
    tiktokAngles:   card.tiktokAngles   || [],

    // メタ
    publishedAt: Date.now(),
  };
}

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`UpGear server v6.1 — http://localhost:${PORT}`);
  console.log(`Anthropic API: ${process.env.ANTHROPIC_API_KEY ? '✓ set' : '✗ not set (fallback mode)'}`);
  console.log(`Public API: http://localhost:${PORT}/api/products`);
});
