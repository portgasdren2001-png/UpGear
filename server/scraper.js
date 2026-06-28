/**
 * scraper.js — Playwright ベース構造化データ抽出
 *
 * 優先順位:
 * ① schema.org  ② JSON-LD  ③ パンくず  ④ Amazonカテゴリ
 * ⑤ 楽天カテゴリ  ⑥ 価格.com  ⑦ h1  ⑧ title  ⑨ meta desc
 * ⑩ 商品説明  ⑪ レビュー  ⑫ Vision(別途)  ⑬ AI推論
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const CHROMIUM_PATH = process.env.CHROMIUM_PATH ||
  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

// ─── Browser lifecycle ────────────────────────────────────────────────────────

let browserInstance = null;

async function getBrowser() {
  if (browserInstance) return browserInstance;
  const pwModule = await import('../upgear-app/node_modules/playwright-core/index.js');
  const { chromium } = pwModule.default ?? pwModule;
  const launchArgs = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
  ];
  if (process.env.HTTPS_PROXY) {
    launchArgs.push(`--proxy-server=${process.env.HTTPS_PROXY}`);
  }
  browserInstance = await chromium.launch({
    executablePath: CHROMIUM_PATH,
    headless: true,
    args: launchArgs,
  });
  return browserInstance;
}

// ─── DOM extraction helpers (run inside page.evaluate) ───────────────────────

const EXTRACTOR_SCRIPT = `
(() => {
  const result = {
    url: location.href,
    title: document.title || '',
    h1: (document.querySelector('h1') || {}).innerText || '',
    meta: {},
    og: {},
    jsonLd: [],
    schemaOrg: [],
    breadcrumbs: [],
    features: [],
    specs: {},
    description: '',
    reviewSummary: { avg: null, count: null, samples: [] },
    images: [],
    siteType: 'unknown',
    rawCategory: [],
    debug: { found: [], missing: [] },
  };

  // ── Site type detection ──
  const host = location.hostname;
  if (host.includes('amazon.co.jp') || host.includes('amazon.com')) result.siteType = 'amazon';
  else if (host.includes('rakuten.co.jp')) result.siteType = 'rakuten';
  else if (host.includes('kakaku.com')) result.siteType = 'kakaku';
  else result.siteType = 'official';

  // ── Meta tags ──
  document.querySelectorAll('meta[name]').forEach(m => {
    const k = m.getAttribute('name').toLowerCase();
    const v = m.getAttribute('content') || '';
    result.meta[k] = v;
  });
  if (result.meta.description) result.debug.found.push('meta-description');
  else result.debug.missing.push('meta-description');

  // ── OpenGraph ──
  document.querySelectorAll('meta[property]').forEach(m => {
    const k = m.getAttribute('property');
    const v = m.getAttribute('content') || '';
    if (k.startsWith('og:')) result.og[k.replace('og:', '')] = v;
  });
  if (Object.keys(result.og).length) result.debug.found.push('opengraph');
  else result.debug.missing.push('opengraph');

  // ── JSON-LD ──
  document.querySelectorAll('script[type="application/ld+json"]').forEach(s => {
    try {
      const parsed = JSON.parse(s.textContent);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      items.forEach(item => result.jsonLd.push(item));
    } catch(e) {}
  });
  if (result.jsonLd.length) result.debug.found.push('json-ld');
  else result.debug.missing.push('json-ld');

  // ── schema.org microdata ──
  const schemaEls = document.querySelectorAll('[itemtype*="schema.org"]');
  schemaEls.forEach(el => {
    const type = el.getAttribute('itemtype') || '';
    const props = {};
    el.querySelectorAll('[itemprop]').forEach(p => {
      const k = p.getAttribute('itemprop');
      const v = p.getAttribute('content') || p.getAttribute('value') || p.innerText || '';
      props[k] = v.trim();
    });
    result.schemaOrg.push({ type, props });
  });
  if (result.schemaOrg.length) result.debug.found.push('schema-org');
  else result.debug.missing.push('schema-org');

  // ── Breadcrumbs ──
  const bcSelectors = [
    '[itemtype*="BreadcrumbList"] [itemprop="name"]',
    'nav[aria-label*="breadcrumb"] a, nav[aria-label*="Breadcrumb"] a',
    '.breadcrumb a, .breadcrumbs a, .breadcrumb-item a',
    '#nav-breadcrumb .a-link-normal',
    '.sc-breadcrumb a',
  ];
  for (const sel of bcSelectors) {
    const els = document.querySelectorAll(sel);
    if (els.length > 0) {
      result.breadcrumbs = [...els].map(e => (e.getAttribute('content') || e.innerText || '').trim()).filter(Boolean);
      break;
    }
  }
  if (result.breadcrumbs.length) result.debug.found.push('breadcrumbs');
  else result.debug.missing.push('breadcrumbs');

  // ── Images ──
  const imgSelectors = [
    '#landingImage',
    '#imgBlkFront',
    '[data-action="main-image-click"] img',
    '.product-image img',
    '.item-image img',
    '.product_main_image img',
    'meta[property="og:image"]',
  ];
  const foundImgs = new Set();
  imgSelectors.forEach(sel => {
    if (sel.startsWith('meta')) {
      const v = document.querySelector(sel)?.getAttribute('content');
      if (v) foundImgs.add(v);
    } else {
      document.querySelectorAll(sel).forEach(el => {
        const src = el.getAttribute('src') || el.getAttribute('data-src') || '';
        if (src && src.startsWith('http')) foundImgs.add(src);
      });
    }
  });
  result.images = [...foundImgs].slice(0, 5);
  if (result.images.length) result.debug.found.push('product-images');
  else result.debug.missing.push('product-images');

  // ── Amazon specific ──
  if (result.siteType === 'amazon') {
    // Product title
    const title = document.querySelector('#productTitle');
    if (title) result.h1 = title.innerText.trim();

    // Brand
    const brand = document.querySelector('#bylineInfo');
    if (brand) result.specs['brand'] = brand.innerText.replace(/ブランド:|Brand:/, '').trim();

    // Category nav
    const catEls = document.querySelectorAll('#wayfinding-breadcrumbs_feature_div a, #nav-breadcrumb .a-link-normal');
    if (catEls.length) {
      result.rawCategory = [...catEls].map(e => e.innerText.trim()).filter(Boolean);
      result.debug.found.push('amazon-category');
    } else result.debug.missing.push('amazon-category');

    // Features
    const featureEls = document.querySelectorAll('#feature-bullets li:not(.aok-hidden) span.a-list-item');
    result.features = [...featureEls].map(e => e.innerText.trim()).filter(Boolean).slice(0, 10);
    if (result.features.length) result.debug.found.push('amazon-features');

    // Specs table
    document.querySelectorAll('#productDetails_techSpec_section_1 tr, #detailBullets_feature_div li').forEach(row => {
      const cells = row.querySelectorAll('td, span.a-list-item');
      if (cells.length >= 2) {
        const k = cells[0].innerText.trim().replace(/[:\\n]/g, '');
        const v = cells[1].innerText.trim();
        if (k && v) result.specs[k] = v;
      }
    });

    // Reviews
    const ratingEl = document.querySelector('#acrPopover .a-size-base');
    const countEl = document.querySelector('#acrCustomerReviewText');
    if (ratingEl) result.reviewSummary.avg = parseFloat(ratingEl.innerText);
    if (countEl) {
      result.reviewSummary.count = parseInt(countEl.innerText.replace(/[^0-9]/g, ''));
      result.debug.found.push('review-count');
    } else result.debug.missing.push('review-count');

    const reviewEls = document.querySelectorAll('[data-hook="review-body"] span, .review-text-content span');
    result.reviewSummary.samples = [...reviewEls].slice(0, 5).map(e => e.innerText.trim()).filter(Boolean);
    if (result.reviewSummary.samples.length) result.debug.found.push('review-samples');

    // Description
    const desc = document.querySelector('#productDescription p, #aplus .aplus-module-wrapper');
    if (desc) {
      result.description = desc.innerText.trim().slice(0, 1000);
      result.debug.found.push('product-description');
    } else result.debug.missing.push('product-description');
  }

  // ── Rakuten specific ──
  if (result.siteType === 'rakuten') {
    const name = document.querySelector('.item_name, .item-name, h1.item_name');
    if (name) result.h1 = name.innerText.trim();

    const catEls = document.querySelectorAll('.category-list a, .cat_navi a, .breadcrumb a');
    if (catEls.length) {
      result.rawCategory = [...catEls].map(e => e.innerText.trim()).filter(Boolean);
      result.debug.found.push('rakuten-category');
    }

    const desc = document.querySelector('.item_desc, .item-detail');
    if (desc) {
      result.description = desc.innerText.trim().slice(0, 1000);
      result.debug.found.push('product-description');
    }
  }

  // ── Kakaku specific ──
  if (result.siteType === 'kakaku') {
    const catEls = document.querySelectorAll('.categoryList a, #breadcrumb a, .bcs a');
    if (catEls.length) {
      result.rawCategory = [...catEls].map(e => e.innerText.trim()).filter(Boolean);
      result.debug.found.push('kakaku-category');
    }

    const ratingEl = document.querySelector('.review_star .num, .revStars .txt');
    if (ratingEl) result.reviewSummary.avg = parseFloat(ratingEl.innerText);

    const countEl = document.querySelector('.revList .tit, .reviewCount');
    if (countEl) {
      const m = countEl.innerText.match(/\\d+/);
      if (m) result.reviewSummary.count = parseInt(m[0]);
    }
  }

  // ── General description fallback ──
  if (!result.description) {
    const candidates = [
      document.querySelector('meta[name="description"]')?.getAttribute('content'),
      document.querySelector('meta[property="og:description"]')?.getAttribute('content'),
      document.querySelector('.product-description, .item-description, .description')?.innerText,
    ].filter(Boolean);
    if (candidates.length) {
      result.description = candidates[0].slice(0, 1000);
      result.debug.found.push('description-fallback');
    } else result.debug.missing.push('product-description');
  }

  // ── Infer h1 fallback ──
  if (!result.h1) {
    result.h1 = result.og.title || result.title || '';
    result.debug.missing.push('h1');
  } else result.debug.found.push('h1');

  return result;
})()
`;

// ─── Category priority resolver ───────────────────────────────────────────────

export function resolveCategory(scraped) {
  const sources = [];
  let category = null;

  // ① schema.org Product.category
  for (const s of scraped.schemaOrg) {
    if (s.type.includes('Product') && s.props.category) {
      category = s.props.category;
      sources.push('schema.org');
      break;
    }
  }

  // ② JSON-LD
  if (!category) {
    for (const ld of scraped.jsonLd) {
      const type = ld['@type'];
      const types = Array.isArray(type) ? type : [type];
      if (types.some(t => ['Product', 'ItemPage'].includes(t))) {
        if (ld.category) { category = Array.isArray(ld.category) ? ld.category[0] : ld.category; sources.push('JSON-LD'); break; }
        if (ld.breadcrumb) { sources.push('JSON-LD'); break; }
      }
    }
  }

  // ③ Breadcrumbs
  if (!category && scraped.breadcrumbs.length >= 2) {
    category = scraped.breadcrumbs.slice(0, 3).join(' > ');
    sources.push('パンくず');
  }

  // ④–⑥ Site-specific categories
  if (!category && scraped.rawCategory.length > 0) {
    category = scraped.rawCategory.join(' > ');
    const siteLabel = { amazon: 'Amazonカテゴリ', rakuten: '楽天カテゴリ', kakaku: '価格.com' }[scraped.siteType] || 'カテゴリ';
    sources.push(siteLabel);
  }

  // ⑦ h1
  if (!category && scraped.h1) { sources.push('h1テキスト'); }

  // ⑧ title
  if (!category && scraped.title) { sources.push('titleタグ'); }

  // ⑨ meta description
  if (!category && scraped.meta.description) { sources.push('meta-description'); }

  // ⑩ product description
  if (!category && scraped.description) { sources.push('商品説明'); }

  // Calculate confidence
  const confidence = Math.min(98, 40 + sources.length * 18);

  return { category, sources, confidence };
}

// ─── Merge multi-URL data ─────────────────────────────────────────────────────

function mergeResults(results) {
  const merged = {
    jsonLd: [],
    schemaOrg: [],
    breadcrumbs: [],
    features: [],
    specs: {},
    images: [],
    rawCategory: [],
    reviewSummary: { avg: null, count: null, samples: [] },
    debug: { found: [], missing: [] },
    title: '',
    h1: '',
    description: '',
    og: {},
    meta: {},
    siteType: 'official',
    sources: [],
  };

  for (const r of results) {
    if (r.jsonLd.length && !merged.jsonLd.length) merged.jsonLd = r.jsonLd;
    if (r.schemaOrg.length && !merged.schemaOrg.length) merged.schemaOrg = r.schemaOrg;
    if (r.breadcrumbs.length > merged.breadcrumbs.length) merged.breadcrumbs = r.breadcrumbs;
    if (r.features.length > merged.features.length) merged.features = r.features;
    if (r.images.length > merged.images.length) merged.images = r.images;
    if (r.rawCategory.length > merged.rawCategory.length) merged.rawCategory = r.rawCategory;
    if (!merged.h1 && r.h1) merged.h1 = r.h1;
    if (!merged.description && r.description) merged.description = r.description;
    if (!merged.title && r.title) merged.title = r.title;
    if (r.reviewSummary.avg && !merged.reviewSummary.avg) merged.reviewSummary = r.reviewSummary;
    Object.assign(merged.specs, r.specs);
    Object.assign(merged.og, r.og);
    Object.assign(merged.meta, r.meta);
    if (r.siteType !== 'official') merged.siteType = r.siteType;
    merged.debug.found.push(...r.debug.found);
    merged.debug.missing.push(...r.debug.missing.filter(m => !r.debug.found.includes(m)));
    merged.sources.push({ url: r.url, siteType: r.siteType });
  }

  // Deduplicate debug
  merged.debug.found = [...new Set(merged.debug.found)];
  merged.debug.missing = [...new Set(merged.debug.missing.filter(m => !merged.debug.found.includes(m)))];

  return merged;
}

// ─── Main scrape function ─────────────────────────────────────────────────────

export async function scrapeUrls(urls, onProgress) {
  const urlList = Object.entries(urls).filter(([, v]) => v).map(([k, v]) => ({ key: k, url: v }));
  if (urlList.length === 0) throw new Error('URLが入力されていません');

  const browser = await getBrowser();
  const results = [];

  for (const { key, url } of urlList) {
    onProgress?.({ stage: 'fetch', status: 'running', detail: `${key}: ${url.slice(0, 60)}` });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 900 },
      ignoreHTTPSErrors: true,
    });
    const page = await context.newPage();
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(1500);
      const data = await page.evaluate(new Function(`return ${EXTRACTOR_SCRIPT}`)());
      results.push(data);
      onProgress?.({ stage: 'fetch', status: 'progress', detail: `${key} ✓` });
    } catch (err) {
      onProgress?.({ stage: 'fetch', status: 'error', detail: `${key}: ${err.message.slice(0, 60)}` });
      results.push({ url, siteType: key, jsonLd: [], schemaOrg: [], breadcrumbs: [], features: [], specs: {}, images: [], rawCategory: [], reviewSummary: { avg: null, count: null, samples: [] }, debug: { found: [], missing: ['page-load-failed'] }, title: '', h1: '', description: '', og: {}, meta: {} });
    } finally {
      await context.close();
    }
  }

  const merged = mergeResults(results);
  const categoryInfo = resolveCategory(merged);
  merged.categoryInfo = categoryInfo;

  return merged;
}
