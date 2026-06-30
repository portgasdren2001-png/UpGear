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

// ─── Category tree ────────────────────────────────────────────────────────────
// UpGearコンセプト: 「ギア」は思想（判断を減らす装備）であり、カテゴリではない

export const CATEGORY_TREE = {
  ガジェット: {
    subCategories: ["イヤホン", "ヘッドホン", "マウス", "トラックボール", "キーボード", "モニター", "電気シェーバー", "モバイルバッテリー", "充電器", "ケーブル", "スマートウォッチ", "カメラ", "その他"],
    productType: "ガジェット",
    legacyCat: "GEAR",
    keywords: ["時短", "仕事効率", "ガジェット", "テレワーク", "コスパ", "毎日使う", "買ってよかった"],
    useCases: ["毎日のデスクワーク", "テレワーク環境構築", "移動中の作業"],
    competitors: ["Logicool", "Anker", "ELECOM", "Belkin"],
    strengthPatterns: ["毎日使える耐久性", "作業効率の向上", "セットアップが簡単"],
    weaknessPatterns: ["慣れるまでに時間がかかる", "価格が高め"],
  },
  バッグ: {
    subCategories: ["リュック", "ショルダー", "トート", "クラッチ", "ウエストバッグ", "その他"],
    productType: "バッグ",
    legacyCat: "GEAR",
    keywords: ["毎日持てる", "通勤バッグ", "軽量", "大容量", "防水", "ガジェット収納"],
    useCases: ["毎日の通勤", "旅行・出張", "デイリーユース"],
    competitors: ["PORTER", "Gregory", "Aer", "Peak Design"],
    strengthPatterns: ["収納力と整理しやすさ", "耐久性", "デザインの汎用性"],
    weaknessPatterns: ["価格が高め", "サイズ感の個人差"],
  },
  アパレル: {
    subCategories: ["シューズ", "ジャケット", "アウター", "シャツ", "パンツ", "インナー", "パーカー", "その他"],
    productType: "アパレル",
    legacyCat: "WEAR",
    keywords: ["着回し", "ミニマリスト", "毎日使える", "コーデ不要", "長持ち", "シンプル"],
    useCases: ["毎日の通勤", "休日のカジュアル", "アウトドア"],
    competitors: ["ユニクロ", "無印良品", "パタゴニア", "アークテリクス", "ノースフェイス"],
    strengthPatterns: ["着回しやすさ", "高耐久・長期コスパ", "シンプルデザイン"],
    weaknessPatterns: ["価格が高め", "サイズ感要確認"],
  },
  デスク環境: {
    subCategories: ["デスク", "チェア", "モニターアーム", "照明", "スピーカー", "Webカメラ", "マイク", "ケーブル管理", "その他"],
    productType: "デスク環境",
    legacyCat: "GEAR",
    keywords: ["デスク環境", "テレワーク", "在宅勤務", "集中力", "作業効率"],
    useCases: ["在宅ワーク環境構築", "配信・クリエイター環境", "快適な作業スペース"],
    competitors: ["Flexispot", "Ergotron", "BenQ", "Elgato"],
    strengthPatterns: ["作業環境の質向上", "姿勢改善", "集中力アップ"],
    weaknessPatterns: ["設置スペースが必要", "価格が高め", "組み立てが大変"],
  },
  EDC: {
    subCategories: ["財布", "キーケース", "時計", "ペン", "ライト", "マルチツール", "ノート", "その他"],
    productType: "EDC（毎日携帯品）",
    legacyCat: "GEAR",
    keywords: ["毎日持ち歩く", "EDC", "ミニマル財布", "日常使い", "頑丈"],
    useCases: ["毎日のポケット", "外出時の必携品", "ミニマルライフ"],
    competitors: ["ABRASUS", "HIGHTIDE", "Leatherman"],
    strengthPatterns: ["毎日持てるコンパクトさ", "高耐久", "シンプルで使いやすい"],
    weaknessPatterns: ["容量が少ない", "価格が高め"],
  },
  トラベル: {
    subCategories: ["スーツケース", "トラベルポーチ", "圧縮袋", "トラベル枕", "変換プラグ", "パッキングキューブ", "その他"],
    productType: "トラベルグッズ",
    legacyCat: "GEAR",
    keywords: ["旅行", "出張", "パッキング", "手荷物", "軽量化"],
    useCases: ["国内旅行", "海外出張", "ミニマムパッキング"],
    competitors: ["Muji", "RIMOWA", "Away", "Aer"],
    strengthPatterns: ["旅の快適性向上", "軽量・コンパクト", "整理しやすい"],
    weaknessPatterns: ["旅行時のみ使用", "価格が高め"],
  },
  その他: {
    subCategories: ["その他"],
    productType: "その他",
    legacyCat: "GEAR",
    keywords: ["便利", "QOL", "日常使い"],
    useCases: ["日常生活"],
    competitors: [],
    strengthPatterns: ["使いやすさ", "コスパ"],
    weaknessPatterns: ["汎用品との差別化"],
  },
};

export const MAIN_CATEGORIES = Object.keys(CATEGORY_TREE);

// 後方互換: legacyCatへのマッピング
function getLegacyCat(mainCategory) {
  return CATEGORY_TREE[mainCategory]?.legacyCat || "GEAR";
}

// 旧CAT_DBとの互換レイヤー（contentAI/marketResearchAIで使用）
const CAT_DB = Object.fromEntries(
  Object.entries(CATEGORY_TREE).map(([key, val]) => [key, val])
);
// 旧キーでのアクセスも維持
CAT_DB.GEAR = CATEGORY_TREE.ガジェット;
CAT_DB.SHOES = CATEGORY_TREE.アパレル;
CAT_DB.WEAR  = CATEGORY_TREE.アパレル;

const BRAND_LIST = [
  { name: "ELECOM",         mainCat: "ガジェット" },
  { name: "Logicool",       mainCat: "ガジェット" },
  { name: "Anker",          mainCat: "ガジェット" },
  { name: "Technics",       mainCat: "ガジェット" },
  { name: "Philips",        mainCat: "ガジェット" },
  { name: "Bose",           mainCat: "ガジェット" },
  { name: "Sony",           mainCat: "ガジェット" },
  { name: "PORTER",         mainCat: "バッグ" },
  { name: "Gregory",        mainCat: "バッグ" },
  { name: "Aer",            mainCat: "バッグ" },
  { name: "無印良品",        mainCat: "アパレル" },
  { name: "Salomon",        mainCat: "アパレル" },
  { name: "New Balance",    mainCat: "アパレル" },
  { name: "Nike",           mainCat: "アパレル" },
  { name: "adidas",         mainCat: "アパレル" },
  { name: "HOKA",           mainCat: "アパレル" },
  { name: "THE NORTH FACE", mainCat: "アパレル" },
  { name: "Arc'teryx",      mainCat: "アパレル" },
  { name: "Patagonia",      mainCat: "アパレル" },
  { name: "ユニクロ",        mainCat: "アパレル" },
  { name: "Flexispot",      mainCat: "デスク環境" },
  { name: "Ergotron",       mainCat: "デスク環境" },
];

function detectBrand(label = "") {
  for (const b of BRAND_LIST) {
    if (label.toLowerCase().includes(b.name.toLowerCase())) {
      return { brand: b.name, inferredMainCat: b.mainCat };
    }
  }
  const first = label.split(/[\s\-_（(]/)[0];
  return { brand: first || "不明", inferredMainCat: null };
}

// label全体をすべての大カテゴリの小カテゴリリストで検索する
function detectSubCategory(label = "", mainCat = null) {
  const searchIn = mainCat ? [mainCat] : MAIN_CATEGORIES;
  for (const cat of searchIn) {
    const db = CATEGORY_TREE[cat];
    if (!db) continue;
    for (const sub of db.subCategories) {
      if (sub === "その他") continue;
      if (label.toLowerCase().includes(sub.toLowerCase())) return { mainCat: cat, subCat: sub };
    }
  }
  return null;
}

// ─── Category determination (priority chain) ─────────────────────────────────
// Priority: official > amazon > rakuten > kakaku > description > review > vision > inference

function determineCategoryFromUrls(urls = {}) {
  const urlTypes = Object.entries(urls)
    .filter(([, v]) => v)
    .map(([k, v]) => ({ type: k, url: v }));

  if (urlTypes.length === 0) return { mainCat: null, source: "なし", confidence: 0 };

  for (const { url } of urlTypes) {
    if (/shoes|footwear|sneaker|boot|sandal/i.test(url))        return { mainCat: "アパレル",   source: "URL構造", confidence: 75 };
    if (/jacket|wear|apparel|clothing|fashion/i.test(url))      return { mainCat: "アパレル",   source: "URL構造", confidence: 75 };
    if (/bag|backpack|rucksack/i.test(url))                     return { mainCat: "バッグ",     source: "URL構造", confidence: 75 };
    if (/desk|chair|monitor.arm|lighting/i.test(url))           return { mainCat: "デスク環境", source: "URL構造", confidence: 75 };
    if (/travel|suitcase|luggage/i.test(url))                   return { mainCat: "トラベル",   source: "URL構造", confidence: 75 };
    if (/wallet|edc|keychain|flashlight/i.test(url))            return { mainCat: "EDC",        source: "URL構造", confidence: 75 };
    if (/gear|gadget|device|electronics|pc|earphone|keyboard/i.test(url)) return { mainCat: "ガジェット", source: "URL構造", confidence: 75 };
  }

  return { mainCat: null, source: "推定", confidence: 30 };
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
  const { brand, inferredMainCat } = detectBrand(label);

  // Category determination chain
  const catFromUrl = determineCategoryFromUrls(urls);
  const mainCatFromUrl = catFromUrl.mainCat;
  const finalMainCat = mainCatFromUrl || inferredMainCat || (() => {
    // labelから小カテゴリを検索して大カテゴリを推定
    const found = detectSubCategory(label, null);
    return found?.mainCat || "ガジェット";
  })();
  const catSource = mainCatFromUrl ? catFromUrl.source : inferredMainCat ? "ブランドDB" : "AI推論";

  const db = CATEGORY_TREE[finalMainCat] || CATEGORY_TREE.ガジェット;
  const subCatResult = detectSubCategory(label, finalMainCat);
  const subCat = subCatResult?.subCat || null;
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
    mainCategory: finalMainCat,
    category:     finalMainCat,   // 後方互換
    categorySource: catSource,
    subCategory:  subCat,
    productType:  db.productType,
    colors:       [],
    sizes:        [],
    weight:       "不明",
    materials:    [],
    warranty:     "不明",

    // ── 商品理解 ──
    whatIsThis:   `${label}は${db.productType}カテゴリの製品。${subCat ? subCat + "として分類。" : ""}`,
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
      ...(subCat ? [`${subCat} おすすめ`, `${subCat} 比較`, `${subCat} デメリット`, `${subCat} 向いてない人`] : []),
      `${brand} レビュー`,
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
