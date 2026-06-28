/**
 * 商品理解AI — Phase 1: AI simulation from category DB + URL heuristics
 * Phase 2: replace simulateFetch() with real Playwright scrapers
 *          replace generateFromUrl() with actual parsed HTML
 *          replace visionAnalyze() with Claude Vision API call
 */

// ─── URL type detection ───────────────────────────────────────────────────────

export function detectUrlType(url = "") {
  const u = url.toLowerCase();
  if (u.includes("amazon.co.jp") || u.includes("amazon.com")) return "amazon";
  if (u.includes("rakuten.co.jp"))  return "rakuten";
  if (u.includes("kakaku.com"))     return "kakaku";
  return "official";
}

export const URL_TYPE_LABELS = {
  amazon:   "Amazon",
  rakuten:  "楽天",
  kakaku:   "価格.com",
  official: "公式サイト / レビューサイト",
};

// ─── Category databases ───────────────────────────────────────────────────────

const CAT_DB = {
  GEAR: {
    subCategories: ["トラックボール", "マウス", "キーボード", "ヘッドセット", "イヤホン", "充電器", "バックパック", "財布", "時計", "カメラ"],
    productType: "ガジェット・道具",
    market: "デスクワーカー・テクノロジー市場",
    keywords: ["時短", "仕事効率", "デスク環境", "QOL", "ガジェット", "テレワーク", "コスパ", "ルーティン", "毎日使う", "買ってよかった"],
    useCases: ["毎日のデスクワーク", "テレワーク環境構築", "移動中の作業", "趣味・クリエイター用途"],
    competitors: ["Amazon Basics", "Logicool", "Anker", "Belkin", "サードパーティー製"],
    strengthPatterns: ["毎日使える耐久性", "作業効率の向上", "セットアップが簡単", "コンパクトで持ち運びやすい"],
    weaknessPatterns: ["慣れるまでに時間がかかる", "価格が高め", "設定アプリの品質にムラ"],
  },
  SHOES: {
    subCategories: ["スニーカー", "トレランシューズ", "ビジネスシューズ", "サンダル", "ブーツ", "ランニングシューズ"],
    productType: "フットウェア",
    market: "シューズ・ファッション市場",
    keywords: ["通勤", "足疲れ", "防水", "コーデ", "毎日履ける", "サイズ感", "長持ち", "歩きやすい", "靴選び"],
    useCases: ["毎日の通勤", "長時間の歩行", "雨の日", "アウトドア", "カジュアルシーン"],
    competitors: ["Nike", "adidas", "New Balance", "HOKA", "On", "Salomon"],
    strengthPatterns: ["履きやすさ・快適性", "耐久性・長期コスパ", "オールシーズン対応", "コーデの汎用性"],
    weaknessPatterns: ["サイズ感が特殊", "初期の硬さ", "価格が高め", "デザインの好み分かれる"],
  },
  WEAR: {
    subCategories: ["アウター", "ジャケット", "Tシャツ", "パンツ", "インナー", "パーカー"],
    productType: "アパレル",
    market: "ファッション・ミニマリスト市場",
    keywords: ["着回し", "ミニマリスト", "毎日同じ服", "コーデ不要", "長持ち", "シンプル", "洗濯機可", "防水"],
    useCases: ["毎日の通勤", "休日のカジュアル", "アウトドア", "旅行"],
    competitors: ["ユニクロ", "無印良品", "パタゴニア", "アークテリクス", "ノースフェイス"],
    strengthPatterns: ["着回しやすさ", "高耐久・長期コスパ", "シンプルデザイン", "機能性（防水・防風）"],
    weaknessPatterns: ["価格が高め", "サイズ感要確認", "流行を追えない"],
  },
};

const BRAND_LIST = [
  { name: "ELECOM",       cat: "GEAR" },
  { name: "Logicool",     cat: "GEAR" },
  { name: "Anker",        cat: "GEAR" },
  { name: "Technics",     cat: "GEAR" },
  { name: "PORTER",       cat: "GEAR" },
  { name: "無印良品",      cat: "GEAR" },
  { name: "Salomon",      cat: "SHOES" },
  { name: "New Balance",  cat: "SHOES" },
  { name: "Nike",         cat: "SHOES" },
  { name: "adidas",       cat: "SHOES" },
  { name: "HOKA",         cat: "SHOES" },
  { name: "THE NORTH FACE", cat: "WEAR" },
  { name: "Arc'teryx",    cat: "WEAR" },
  { name: "Patagonia",    cat: "WEAR" },
  { name: "ユニクロ",      cat: "WEAR" },
];

function detectBrand(label = "") {
  for (const b of BRAND_LIST) {
    if (label.toLowerCase().includes(b.name.toLowerCase())) {
      return { brand: b.name, inferredCat: b.cat };
    }
  }
  const first = label.split(/[\s\-_（(]/)[0];
  return { brand: first || "不明", inferredCat: null };
}

function detectSubCategory(label = "", cat = "GEAR") {
  const db = CAT_DB[cat] || CAT_DB.GEAR;
  for (const sub of db.subCategories) {
    if (label.toLowerCase().includes(sub.toLowerCase())) return sub;
  }
  return null;
}

// ─── Category determination (priority chain) ─────────────────────────────────
// Priority: official > amazon > rakuten > kakaku > description > review > vision > inference

function determineCategoryFromUrls(urls = {}) {
  // Phase 2: parse actual page HTML for breadcrumbs/category
  // Phase 1: heuristic from URL domain patterns
  const urlTypes = Object.entries(urls)
    .filter(([, v]) => v)
    .map(([k, v]) => ({ type: k, url: v, urlType: detectUrlType(v) }));

  if (urlTypes.length === 0) return { cat: null, source: "なし", confidence: 0 };

  // Simulate category signal from URL structure
  for (const { url } of urlTypes) {
    if (/shoes|footwear|sneaker|boot|sandal/i.test(url)) return { cat: "SHOES", source: "URL構造", confidence: 75 };
    if (/jacket|wear|apparel|clothing|fashion/i.test(url)) return { cat: "WEAR", source: "URL構造", confidence: 75 };
    if (/gear|gadget|device|electronics|pc/i.test(url)) return { cat: "GEAR", source: "URL構造", confidence: 75 };
  }

  return { cat: null, source: "推定", confidence: 30 };
}

// ─── Understanding score ──────────────────────────────────────────────────────

export function calcUnderstandingScore(card) {
  let score = 0;
  const missing = [];

  if (card.name && card.name !== "不明")           score += 12; else missing.push("商品名");
  if (card.brand && card.brand !== "不明")          score += 8;  else missing.push("ブランド");
  if (card.category)                               score += 15; else missing.push("カテゴリ（最重要）");
  if (card.subCategory)                            score += 8;  else missing.push("サブカテゴリ");
  if (card.price && card.price !== "—")            score += 5;  else missing.push("価格");
  if (card.description)                            score += 10; else missing.push("商品説明");
  if ((card.strengths || []).length >= 2)          score += 8;  else missing.push("強み（2つ以上）");
  if ((card.weaknesses || []).length >= 2)         score += 8;  else missing.push("弱み（2つ以上）");
  if ((card.reviewData?.positive || []).length >= 2) score += 8; else missing.push("ポジティブ評価");
  if ((card.searchKeywords || []).length >= 5)     score += 8;  else missing.push("検索キーワード（5つ以上）");
  if (card.urlCount >= 2)                          score += 10; else if (card.urlCount === 1) { score += 4; missing.push("複数URL（2つ以上推奨）"); }

  return { score: Math.min(100, score), missing };
}

// ─── Main product understanding generator ────────────────────────────────────

export function generateProductUnderstanding(item) {
  const label = item.label || "";
  const urls  = item.urls || {};
  const urlCount = Object.values(urls).filter(Boolean).length;
  const { brand, inferredCat } = detectBrand(label);

  // Category determination chain
  const catFromUrl = determineCategoryFromUrls(urls);
  const catFromBrand = inferredCat;
  const catFromUrl2 = catFromUrl.cat;
  const finalCat = catFromUrl2 || catFromBrand || "GEAR";
  const catSource = catFromUrl2 ? catFromUrl.source : catFromBrand ? "ブランドDB" : "AI推論";

  const db = CAT_DB[finalCat] || CAT_DB.GEAR;
  const subCat = detectSubCategory(label, finalCat);
  const score = Number(item.score) || 70;
  const price = item.price ? `¥${Number(item.price).toLocaleString()}` : "—";

  // Review simulation
  const reviewAvg = Math.min(5, Math.max(2.5, 3.5 + (score - 50) / 120));
  const reviewCount = 200 + Math.floor((score / 100) * 2000);
  const reviewDist = {
    5: Math.floor(reviewCount * (score >= 80 ? 0.50 : 0.35)),
    4: Math.floor(reviewCount * 0.26),
    3: Math.floor(reviewCount * 0.12),
    2: Math.floor(reviewCount * 0.07),
    1: 0,
  };
  reviewDist[1] = reviewCount - reviewDist[5] - reviewDist[4] - reviewDist[3] - reviewDist[2];

  const card = {
    // ── 基本情報 ──
    name:         label || "不明",
    brand,
    maker:        brand,
    model:        "",
    priceRange:   price,
    releaseDate:  "不明",
    category:     finalCat,
    categorySource: catSource,
    subCategory:  subCat,
    productType:  db.productType,
    colors:       [],
    sizes:        [],
    weight:       "不明",
    materials:    [],
    warranty:     "不明",

    // ── 商品理解 ──
    whatIsThis:   `${label}は${db.productType}カテゴリの製品。${subCat}として分類。`,
    whatItSolves: `${db.useCases[0]}での課題を解決する。`,
    whySelling:   `${db.strengthPatterns[0]}が支持を集めている。`,
    forWho:       item.stock?.ng1 ? null : `${db.useCases.slice(0, 2).join("、")}をする人`,
    notForWho:    [item.stock?.ng1, item.stock?.ng2].filter(Boolean),
    useCases:     db.useCases,
    competitors:  db.competitors,
    alternatives: db.competitors.slice(0, 3),
    strengths:    db.strengthPatterns.slice(0, 3),
    weaknesses:   db.weaknessPatterns.slice(0, 3),
    buyReasons:   ["毎日使うものに投資したかった", "口コミで評判が良かった", "長く使えるものを探していた"],
    dontBuyReasons: ["価格が予算オーバー", "使用頻度が少ない", "すでに同等品を持っている"],

    // ── レビュー分析 ──
    reviewData: {
      avg:         reviewAvg.toFixed(1),
      count:       reviewCount,
      distribution: reviewDist,
      positive:    ["期待通りの性能", "毎日使いたくなる", "コスパが良い"],
      negative:    ["慣れるまで時間が必要", "価格が高めに感じる"],
      highEval:    ["機能性が高い", "デザインが良い", "耐久性がある"],
      lowEval:     ["価格に見合わないケースも", "サイズ感の個人差"],
      longTerm:    "長期使用者からの評価は高く、消耗後も同製品を再購入するユーザーが多い。",
      returnReasons: ["サイズが合わなかった", "使用用途とのミスマッチ"],
      beginnerEval: "入門としても扱いやすく、初心者評価は概ね良好。",
      advancedEval: "上級者からは機能面の評価が高い。",
    },

    // ── 検索キーワード ──
    searchKeywords: [
      ...db.keywords.slice(0, 5),
      `${subCat} おすすめ`,
      `${subCat} 比較`,
      `${brand} レビュー`,
      `${subCat} デメリット`,
      `${subCat} 向いてない人`,
    ],

    // ── Meta ──
    urlCount,
    urls,
    fetchedAt:   Date.now(),
    fetchSources: Object.entries(urls)
      .filter(([, v]) => v)
      .map(([k, v]) => ({ key: k, url: v, type: detectUrlType(v), status: "simulated" })),
    visionAnalyzed: false,  // Phase 2: set true after Vision API call
    visionData: null,       // Phase 2: fill with Vision analysis result
  };

  const { score: understandingScore, missing } = calcUnderstandingScore(card);

  return {
    ...card,
    understandingScore,
    missingFields: missing,
    canRunResearch: understandingScore >= 90,
  };
}

// ─── Fetch stage definitions (used by wizard animation) ───────────────────────

export const FETCH_STAGES = [
  { id: "init",      label: "URL解析",         ms: 300  },
  { id: "fetch",     label: "ページ取得",       ms: 900  },
  { id: "parse",     label: "構造・カテゴリ解析", ms: 700 },
  { id: "reviews",   label: "レビュー収集",      ms: 800 },
  { id: "vision",    label: "Vision解析",       ms: 600  },
  { id: "synthesize","label": "商品理解合成",    ms: 500  },
  { id: "score",     label: "スコア算出",        ms: 300  },
];

export function totalFetchMs(urlCount) {
  return FETCH_STAGES.reduce((a, s) => a + s.ms, 0) * Math.min(urlCount, 3) * 0.6;
}
