// Phase 1: AI-simulated product card
// Phase 2: replace with Playwright URL scraping

const CATEGORY_LABELS = { GEAR: "ガジェット・道具", SHOES: "シューズ", WEAR: "ウェア" };

const BRANDS = [
  "ELECOM","Logicool","Anker","Apple","SONY","Panasonic","Technics",
  "New Balance","Salomon","Nike","adidas","HOKA","On",
  "THE NORTH FACE","Arc'teryx","Patagonia","PORTER","無印良品","ユニクロ",
];

const SPECS_DB = {
  GEAR: ["接続: Bluetooth 5.0 / USB-C","電池: 約6ヶ月","対応OS: Windows / Mac","重量: 約150g"],
  SHOES: ["防水: ゴアテックス内蔵","重量: 約320g（片足）","ソール: ラバー","サイズ: 25.0〜28.5cm"],
  WEAR: ["素材: ナイロン100%","耐水圧: 10,000mm以上","重量: 約350g","ケア: 洗濯機可"],
};

const REVIEW_TEMPLATES = {
  GEAR: {
    positive: [
      "最初は慣れなかったが1ヶ月で手放せなくなった",
      "毎日使うものだから良いものを買って正解",
      "仕事のスピードが体感で変わった",
      "壊れないので結果的にコスパが良い",
    ],
    negative: [
      "最初の設定が少し面倒",
      "価格が高いと感じる人もいる",
      "慣れるまでに時間がかかる",
    ],
    buyReasons: ["仕事効率を上げたかった","毎日使うから良いものを選んだ","プロが使っていた"],
    regrets: ["もっと早く買えばよかった","安物を先に買って結局こちらに買い替えた"],
    faq: ["他の製品と何が違う？","初心者でも使える？","長持ちする？","コスパは？"],
    complaints: ["価格をもう少し抑えてほしい","設定アプリを改善してほしい"],
  },
  SHOES: {
    positive: [
      "雨の日でも全く気にならなくなった",
      "足の疲れが激減した",
      "毎朝靴選びの悩みがなくなった",
      "3年使っても全然へたらない",
    ],
    negative: [
      "サイズ感が難しい（ハーフサイズ上を推奨）",
      "最初は少し硬い",
      "価格が高めで最初は躊躇した",
    ],
    buyReasons: ["足が疲れにくいと聞いた","毎日同じ靴を履きたかった","長持ちする靴を探していた"],
    regrets: ["サイズを間違えた","もっと早く試せばよかった"],
    faq: ["普段サイズでいい？","雨でも大丈夫？","スーツに合う？","何年持つ？"],
    complaints: ["もう少し軽くしてほしい","カラーバリエーションを増やしてほしい"],
  },
  WEAR: {
    positive: [
      "毎朝の服選びがゼロになった",
      "どんな場面でも着回せる",
      "洗濯しても全然へたらない",
      "5年使っても現役",
    ],
    negative: [
      "価格が高めで最初は躊躇した",
      "サイズ感の確認が必要",
      "流行を追う人には地味に見えるかも",
    ],
    buyReasons: ["毎日使えるものが欲しかった","コーデに迷いたくなかった","長く使える服を探していた"],
    regrets: ["安いものを先に買って後悔した","もっと早く知りたかった"],
    faq: ["何年持つ？","洗濯機で洗える？","どんなコーデに合う？"],
    complaints: ["もっとカラーバリエーションを","価格を抑えてほしい"],
  },
};

function extractBrand(label) {
  for (const b of BRANDS) {
    if (label.toUpperCase().includes(b.toUpperCase())) return b;
  }
  return label.split(/[\s_\-（]/)[0];
}

export function generateProductCard(item) {
  const cat = item.category || "GEAR";
  const score = Number(item.score) || 70;
  const tmpl = REVIEW_TEMPLATES[cat] || REVIEW_TEMPLATES.GEAR;
  const urls = item.urls || {};
  const hasUrls = Object.values(urls).some(Boolean);
  const urlCount = Object.values(urls).filter(Boolean).length;

  const base = 3.5 + (score - 50) / 120;
  const reviewAvg = Math.min(5, Math.max(2.5, base));
  const reviewCount = 200 + Math.floor((score / 100) * 2000);
  const five = Math.floor(reviewCount * (score >= 80 ? 0.50 : 0.36));
  const four = Math.floor(reviewCount * 0.26);
  const three = Math.floor(reviewCount * 0.12);
  const two = Math.floor(reviewCount * 0.07);
  const one = reviewCount - five - four - three - two;

  return {
    name: item.label,
    category: cat,
    categoryLabel: CATEGORY_LABELS[cat] || cat,
    price: item.price ? `¥${Number(item.price).toLocaleString()}` : "—",
    score,
    judgment: item.judgment,
    brand: extractBrand(item.label),
    description: `${item.label}は${CATEGORY_LABELS[cat]}カテゴリの製品。UpGearスコア${score}点 / ${item.judgment}。`,
    specs: SPECS_DB[cat] || [],
    reviewSummary: {
      avg: reviewAvg.toFixed(1),
      count: reviewCount,
      distribution: { 5: five, 4: four, 3: three, 2: two, 1: one },
      positive: tmpl.positive.slice(0, 3),
      negative: tmpl.negative.slice(0, 2),
      buyReasons: tmpl.buyReasons,
      regrets: tmpl.regrets,
      faq: tmpl.faq,
      complaints: tmpl.complaints,
    },
    urls,
    fetchStatus: hasUrls ? "pending_phase2" : "none",
    urlCount,
    generatedAt: Date.now(),
  };
}
