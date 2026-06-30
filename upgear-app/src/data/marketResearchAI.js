// ─── Category & item databases ────────────────────────────────────────────────

const REVIEW_DB = {
  GEAR: {
    good: [
      "最初は慣れなかったけど1ヶ月で手放せなくなった",
      "毎日使うものだから良いものを買って正解だった",
      "仕事のスピードが体感で変わった",
      "デスクがスッキリして集中できるようになった",
      "壊れないので結果的にコスパが良い",
      "同じものをリピート買いするくらい気に入っている",
    ],
    bad: [
      "最初の設定が少し面倒だった",
      "価格が高いと感じる人もいる",
      "慣れるまでに時間がかかる",
      "デザインが好みでない人もいる",
    ],
    buyReasons: ["仕事効率を上げたかった", "毎日使うから良いものを選んだ", "口コミで評判が良かった", "プロが使っていた"],
    regrets: ["もっと早く買えばよかった", "安物を先に買って結局こちらに買い替えた", "互換性を事前に確認しなかった"],
    faq: ["他の製品と何が違う？", "初心者でも使える？", "長持ちする？", "コスパは？", "サポートは充実している？"],
    improvementRequests: ["価格をもう少し抑えてほしい", "カラーバリエーションを増やしてほしい", "設定アプリを改善してほしい"],
  },
  SHOES: {
    good: [
      "雨の日でも全く気にならなくなった",
      "足の疲れが激減した",
      "毎朝靴選びの悩みがなくなった",
      "コーデに迷わなくなった",
      "3年使っても全然へたらない",
    ],
    bad: [
      "サイズ感が難しい（ハーフサイズ上を推奨）",
      "重量感が合わない人もいる",
      "最初は少し硬い",
      "価格が高めで最初は躊躇した",
    ],
    buyReasons: ["足が疲れにくいと聞いた", "雨でも使える靴が欲しかった", "毎日同じ靴を履きたかった", "長持ちする靴を探していた"],
    regrets: ["サイズを間違えた", "ケアの手間を考えなかった", "もっと早く試せばよかった"],
    faq: ["普段サイズでいい？", "雨でも大丈夫？", "スーツに合う？", "何年持つ？"],
    improvementRequests: ["もう少し軽くしてほしい", "カラーバリエーションを増やしてほしい"],
  },
  WEAR: {
    good: [
      "毎朝の服選びがゼロになった",
      "どんな場面でも着回せる",
      "洗濯しても全然へたらない",
      "見た目よりずっと軽い",
      "5年使っても現役",
    ],
    bad: [
      "価格が高めで最初は躊躇した",
      "サイズ感の確認が必要",
      "流行を追う人には地味に見えるかも",
    ],
    buyReasons: ["毎日使えるものが欲しかった", "服を減らしたかった", "コーデに迷いたくなかった", "長く使える服を探していた"],
    regrets: ["安いものを先に買って後悔した", "サイズを間違えた", "もっと早く知りたかった"],
    faq: ["何年持つ？", "洗濯機で洗える？", "どんなコーデに合う？", "サイズはどれを選べば？"],
    improvementRequests: ["もっとカラーバリエーションを", "価格を抑えてほしい"],
  },
};

const SNS_DB = {
  GEAR: {
    tiktok: {
      buzzing: ["デスク環境ルーティン", "仕事道具紹介", "買って後悔した話", "毎日使う道具の正直レビュー", "1年使って分かったこと"],
      notBuzzing: ["スペック紹介だけ", "購入開封動画のみ", "比較表を見せるだけ"],
      titles: ["これ知らずに損してた", "デスクワーカー必見", "仕事効率が変わった理由"],
      comments: ["どこで買えますか？", "値段は？", "Macでも使える？", "初心者でも使える？"],
    },
    instagram: {
      buzzing: ["デスク環境全体写真", "ビフォーアフター", "おしゃれなフラットレイ"],
      saves: ["デスク環境まとめ", "必須アイテムリスト", "買ってよかったもの"],
    },
    youtube: {
      buzzing: ["詳細レビュー動画", "比較動画", "1年使ってみた"],
    },
    x: {
      buzzing: ["購入報告ツイート", "使ってみた感想", "おすすめ紹介"],
    },
  },
  SHOES: {
    tiktok: {
      buzzing: ["コーデ紹介", "雨の日でも大丈夫？", "毎日同じ靴を履く理由", "靴選びで後悔した話"],
      notBuzzing: ["スペック説明のみ", "開封動画だけ"],
      titles: ["靴で仕事効率が変わった", "毎日同じ靴でいい理由", "雨に強い靴を探してた"],
      comments: ["サイズはどれ？", "雨でも大丈夫？", "スーツに合う？"],
    },
    instagram: {
      buzzing: ["コーデ写真", "雨の日コーデ", "シンプルスタイル"],
      saves: ["靴コーデまとめ", "通勤スタイル", "雨の日アイテム"],
    },
    youtube: { buzzing: ["詳細レビュー", "サイズ感紹介", "1年使ってみた"] },
    x: { buzzing: ["購入報告", "コーデ紹介"] },
  },
  WEAR: {
    tiktok: {
      buzzing: ["服を減らした結果", "毎日同じ服を着る理由", "着回し術", "ミニマリストの服選び"],
      notBuzzing: ["ブランド紹介だけ", "素材説明のみ"],
      titles: ["服を減らしたら生活が変わった", "毎日同じ服でいい理由", "着回しできる服"],
      comments: ["どこで買える？", "サイズは？", "洗濯はできる？"],
    },
    instagram: {
      buzzing: ["コーデ写真", "ミニマルスタイル", "着回しコーデ"],
      saves: ["着回しまとめ", "シンプルスタイル", "ミニマリストのクローゼット"],
    },
    youtube: { buzzing: ["着回し術", "詳細レビュー", "ミニマリストの服紹介"] },
    x: { buzzing: ["服を減らした話", "購入報告"] },
  },
};

const COMPETITOR_SETS = {
  'トラックボール|trackball': [
    { name: "Logicool MX ERGO", price: "¥14,920", pros: "精度が高い・多機能", cons: "高価・重い", suitable: "仕事でガッツリ使う人", position: "定番・高価格帯" },
    { name: "Kensington Expert Mouse", price: "¥9,800", pros: "大玉で操作しやすい", cons: "価格高め・でかい", suitable: "デザイナー・クリエイター", position: "プロ向け" },
    { name: "ELECOM M-HT1DRBK", price: "¥4,280", pros: "安い・コンパクト", cons: "機能少ない", suitable: "コスパ優先の人", position: "エントリー" },
    { name: "Logicool M575", price: "¥5,980", pros: "コスパ良い・Bluetooth", cons: "精度は上位機種に劣る", suitable: "初心者・コスパ重視", position: "ミドルレンジ" },
    { name: "SANWA MA-BTTB154BK", price: "¥3,200", pros: "安価", cons: "品質が安定しない", suitable: "試してみたい人", position: "廉価版" },
  ],
  'リュック|バックパック|バッグ': [
    { name: "Aer Travel Pack 3", price: "¥44,000", pros: "機能性最高・耐久性抜群", cons: "高価・重い", suitable: "出張が多いビジネスマン", position: "プレミアム" },
    { name: "PORTER HEAT", price: "¥27,500", pros: "デザイン良い・ブランド力", cons: "コスパは普通", suitable: "ブランドにこだわる人", position: "ミドル〜ハイ" },
    { name: "THE NORTH FACE Shuttle", price: "¥19,800", pros: "耐久性・PC収納充実", cons: "ロゴが目立つ", suitable: "アウトドア好き・機能重視", position: "ミドルレンジ" },
    { name: "Incase City Compact", price: "¥14,300", pros: "スリム・PC保護優秀", cons: "収納少ない", suitable: "荷物が少ない人・MacBookユーザー", position: "スリム特化" },
    { name: "HERSCHEL Little America", price: "¥9,800", pros: "デザイン良い・安め", cons: "機能性は低め・耐水なし", suitable: "デザイン優先の学生", position: "デザイン系" },
  ],
  'スニーカー|990|NB|ニューバランス': [
    { name: "Nike Air Force 1", price: "¥14,300", pros: "定番・コーデ汎用性高い", cons: "かさばる・毎日は疲れる", suitable: "ファッション好き", position: "定番" },
    { name: "adidas Stan Smith", price: "¥11,000", pros: "シンプル・軽い", cons: "ソールが薄い・長時間歩くと疲れる", suitable: "シンプル好き", position: "定番・軽量" },
    { name: "HOKA Clifton", price: "¥17,600", pros: "クッション最高・長距離OK", cons: "ファッション性が低い", suitable: "歩く量が多い人", position: "機能特化" },
    { name: "On Cloud 5", price: "¥16,500", pros: "軽い・クッション良い", cons: "耐久性の口コミが分かれる", suitable: "走る人・アクティブな人", position: "スポーツ寄り" },
    { name: "Vans Old Skool", price: "¥7,700", pros: "安い・コーデしやすい", cons: "クッション薄い・耐久性低い", suitable: "コスパ重視・ファッション系", position: "廉価ファッション" },
  ],
  'ジャケット': [
    { name: "Patagonia Nano Puff", price: "¥28,600", pros: "軽い・撥水・コンパクト収納", cons: "高価・動きにくい", suitable: "アウトドア好き・旅行好き", position: "軽量特化" },
    { name: "ユニクロ ウルトラライトダウン", price: "¥5,990", pros: "安い・軽い・毎日使える", cons: "見た目が普通・耐久性普通", suitable: "コスパ最優先", position: "廉価・大衆向け" },
    { name: "モンベル スペリオダウン", price: "¥27,500", pros: "ダウン品質最高・コスパ良い", cons: "デザインが機能優先", suitable: "機能重視・登山好き", position: "機能×コスパ" },
    { name: "Barbour Bedale", price: "¥55,000", pros: "英国製・耐久性抜群・ブランド力", cons: "手入れが必要・重い", suitable: "上質なものにこだわる人", position: "プレミアム" },
    { name: "UNIQLO ブロックテックパーカ", price: "¥14,900", pros: "防風防水・コスパ良い", cons: "デザインが普通", suitable: "機能×コスパを両立したい人", position: "ミドルコスパ" },
  ],
};

const SEARCH_KEYWORDS_DB = {
  GEAR: {
    main: ["トラックボール おすすめ", "デスク環境 改善", "仕事効率 道具", "テレワーク ガジェット", "ワークスペース 整理"],
    compare: ["〇〇 vs ××", "〇〇 比較", "〇〇 違い", "〇〇 どっち"],
    beforeBuy: ["〇〇 デメリット", "〇〇 向いてない人", "〇〇 慣れるまで", "〇〇 設定 方法"],
    afterBuy: ["〇〇 使い方", "〇〇 カスタマイズ", "〇〇 故障", "〇〇 寿命"],
    beginner: ["〇〇 初心者 おすすめ", "〇〇 使い方 初心者", "〇〇 入門"],
    advanced: ["〇〇 上級者 設定", "〇〇 カスタマイズ 上級", "〇〇 最大限 活用"],
  },
  SHOES: {
    main: ["スニーカー おすすめ", "通勤 靴 おすすめ", "雨 靴 おすすめ", "疲れない靴 ビジネス"],
    compare: ["〇〇 サイズ感", "〇〇 vs ××", "〇〇 比較 通勤"],
    beforeBuy: ["〇〇 デメリット", "〇〇 サイズ 選び方", "〇〇 幅 細い"],
    afterBuy: ["〇〇 手入れ", "〇〇 防水 スプレー", "〇〇 ケア 方法"],
    beginner: ["スニーカー 選び方 初心者", "通勤靴 初心者"],
    advanced: ["コレクター おすすめ", "スニーカー マニア"],
  },
  WEAR: {
    main: ["着回し 服 おすすめ", "ミニマリスト 服", "毎日同じ服 理由", "シンプル コーデ メンズ"],
    compare: ["〇〇 サイズ感", "〇〇 vs ××", "〇〇 比較"],
    beforeBuy: ["〇〇 デメリット", "〇〇 サイズ 選び方", "〇〇 洗濯 方法"],
    afterBuy: ["〇〇 コーデ", "〇〇 合わせ方", "〇〇 ケア"],
    beginner: ["着回し コーデ 初心者", "シンプル ファッション 始め方"],
    advanced: ["ミニマリスト クローゼット 完成形", "着回し 上級者"],
  },
};

const TARGET_DB = {
  GEAR: {
    age: "25〜45歳",
    gender: "男性 70% / 女性 30%",
    occupation: "ITエンジニア、デザイナー、会社員（デスクワーク中心）",
    income: "400〜700万円",
    lifestyle: "毎日PC作業6時間以上・テレワーク経験あり・Amazon中心に購入・Twitterで口コミ確認",
    values: ["時間の効率化", "質の高いものへの投資", "シンプルなデスク環境"],
    pain: ["作業効率が上がらない", "道具選びに時間を使いたくない", "安物を買って後悔した経験がある"],
    buyMotivation: ["仕事の質を上げたい", "デスク環境を整えたい", "プロも使っているものが欲しい"],
    dontBuy: ["コスト優先で品質を妥協できない人", "毎日PC作業しない人", "すでに十分な道具を持っている人"],
  },
  SHOES: {
    age: "25〜40歳",
    gender: "男性 60% / 女性 40%",
    occupation: "会社員（通勤あり）、営業、フリーランス",
    income: "350〜600万円",
    lifestyle: "毎日電車通勤・歩く距離が長い・コーデにある程度こだわりあり",
    values: ["機能性とデザインの両立", "長く使えるもの", "朝の準備を最短にしたい"],
    pain: ["通勤で足が疲れる", "雨の日に靴が濡れる", "毎朝靴選びに悩む"],
    buyMotivation: ["足の疲れを減らしたい", "天気を気にしない靴が欲しい", "1足で全部済ませたい"],
    dontBuy: ["靴のデザインだけを重視する人", "毎日歩かない人", "頻繁に新しい靴を買いたい人"],
  },
  WEAR: {
    age: "25〜40歳",
    gender: "男性 55% / 女性 45%",
    occupation: "会社員、フリーランス、エンジニア",
    income: "350〜600万円",
    lifestyle: "朝の準備を最短にしたい・ミニマルな生活に興味・長く使えるものを選ぶ",
    values: ["シンプルさ", "長期コスパ", "コーデの悩みをなくす"],
    pain: ["毎朝服選びに時間がかかる", "たくさん服があるのに着るものがない", "流行で買って後悔する"],
    buyMotivation: ["服の選択肢を減らしたい", "長く使えるものが欲しい", "コーデに迷いたくない"],
    dontBuy: ["毎シーズン新しい服を楽しみたい人", "ブランドで服を選ぶ人", "トレンド重視の人"],
  },
};

const UPGEAR_SCORE_DIMENSIONS = [
  { key: "equip",       label: "装備性",       desc: "毎日・なければ生活が止まる",      max: 20 },
  { key: "judgment",    label: "判断削減力",    desc: "機能面の判断が3つ以上消える",     max: 20 },
  { key: "continuity",  label: "継続運用性",   desc: "5年以上・廃番なし・買い直せる",   max: 20 },
  { key: "cospa",       label: "コスパ",        desc: "価格に対する長期的価値",          max: 15 },
  { key: "irreplace",   label: "代替不可能性",  desc: "同カテゴリで唯一",               max: 15 },
  { key: "satisfaction","label": "満足度",      desc: "実際の使用後の満足感",            max: 5 },
  { key: "longterm",    label: "長期利用価値",  desc: "3年後も使い続けている自信",       max: 5 },
];

// ─── Competitor detection ─────────────────────────────────────────────────────

function detectCompetitors(item) {
  const label = (item.label || "").toLowerCase();
  for (const [keys, set] of Object.entries(COMPETITOR_SETS)) {
    const patterns = keys.split("|");
    if (patterns.some(p => label.includes(p.toLowerCase()) || item.category === p)) {
      return set;
    }
  }
  // Fallback by category
  const catFallback = {
    GEAR: COMPETITOR_SETS['リュック|バックパック|バッグ'],
    SHOES: COMPETITOR_SETS['スニーカー|990|NB|ニューバランス'],
    WEAR: COMPETITOR_SETS['ジャケット'],
  };
  return catFallback[item.category] || COMPETITOR_SETS['リュック|バックパック|バッグ'];
}

// ─── UpGear Score calculator ──────────────────────────────────────────────────

function calcUpGearScore(item) {
  const baseScore = Number(item.score) || 70;

  const equipScore  = baseScore >= 80 ? 18 : baseScore >= 65 ? 14 : 10;
  const judgScore   = baseScore >= 80 ? 18 : baseScore >= 65 ? 15 : 12;
  const contScore   = baseScore >= 80 ? 17 : 13;
  const cospaScore  = item.price ? (Number(item.price) < 5000 ? 14 : Number(item.price) < 15000 ? 12 : 9) : 10;
  const irrepScore  = item.judgment === "認定" ? 13 : item.judgment === "条件付き認定" ? 10 : 7;
  const satisScore  = baseScore >= 80 ? 5 : baseScore >= 65 ? 4 : 3;
  const longScore   = baseScore >= 80 ? 5 : 4;

  return {
    equip: equipScore, judgment: judgScore, continuity: contScore,
    cospa: cospaScore, irreplace: irrepScore, satisfaction: satisScore, longterm: longScore,
    total: equipScore + judgScore + contScore + cospaScore + irrepScore + satisScore + longScore,
  };
}

// ─── Differentiation points ───────────────────────────────────────────────────

function genDifferentiation(item) {
  const nick = getNick(item);
  const cat = getCatWord(item);

  const points = [
    `「向いてない人を先に言う」切り口：${nick}を勧めない人がいるという逆説フック`,
    `「1年後の自分」視点：買った直後より1年後の変化を語る。「${cat}を選ぶ判断が消えた」の体験談`,
    `「元に戻れない瞬間」型：古い環境に戻ったとき気づくという露見シーンで維持率を上げる`,
    `「判断削減」視点：機能説明ではなく「何個の判断が消えたか」で語る。スペックではなく認知コストの話`,
    `「当事者の広さ」型：${nick}のユーザーは${cat}を使う全員。狭い属性ではなく全デスクワーカーに語りかける`,
    `「コスト逆算」型：${item.price ? `¥${Number(item.price).toLocaleString()}を1日あたりに換算すると¥${Math.round(Number(item.price)/365)}。コスパの語り方を変える` : "1日あたりのコストで語る"}`,
    `「失敗談から入る」型：安物を買って後悔した話から始める共感型`,
    `「フィルター型CTA」：「${cat}で迷いたくない人だけ買え」という排除の文法。保存ではなくフォロー誘導に最適`,
    `「SD思想」貫通：商品説明なし。「判断が消えた」「迷わなくなった」という生活変化だけで語り切る`,
    `「競合を名指しせず差別化」型：「普通の${cat}との違い」を比較表ではなく体験の差として語る`,
    `「リピート宣言」型：「同じものをもう一度買う理由」という切り口。耐久性と継続性を証明する`,
    `「初心者の誤解を解く」型：「${nick}について多くの人が勘違いしていること」から始める教育型`,
  ];

  return points;
}

// ─── Post plans ──────────────────────────────────────────────────────────────

function genPostPlans(item) {
  const s = item.stock || {};
  const nick = getNick(item);
  const cat = getCatWord(item);

  return [
    { category: "失敗談",     title: `${nick}を買う前に知りたかったこと3つ`,              hookType: "NG", format: "fail" },
    { category: "体験談",     title: `普通の${cat}をやめた日から変わったこと`,             hookType: "逆張り", format: "story" },
    { category: "正直レビュー", title: `${nick}を半年使った正直な話　良いとこ悪いとこ全部`, hookType: "体験", format: "story" },
    { category: "向いてない人", title: `${nick}を買わない方がいい人の特徴3つ`,             hookType: "NG", format: "fail" },
    { category: "比較",       title: `${nick}vs 普通の${cat}　何が違うか正直に言う`,       hookType: "共感", format: "compare" },
    { category: "コスパ",     title: `${item.price ? `¥${Number(item.price).toLocaleString()}` : "この値段"}で何が変わるか`,  hookType: "共感", format: "story" },
    { category: "Q&A",       title: `${nick}についてよく聞かれること全部答える`,           hookType: "チェック", format: "qa" },
    { category: "ランキング",  title: `${cat}選びで絶対外したくないポイント5つ`,            hookType: "チェック", format: "rank" },
    { category: "あるある",   title: `${cat}選びで後悔するパターンあるある`,               hookType: "共感", format: "fail" },
    { category: "知らないと損", title: `${nick}を買う前に絶対確認してほしいこと`,          hookType: "チェック", format: "check" },
    { category: "神アイテム",  title: `俺が今年一番買ってよかった${cat}`,                  hookType: "体験", format: "story" },
    { category: "NG行動",     title: `${cat}選びでやりがちな失敗3パターン`,               hookType: "NG", format: "fail" },
    { category: "仕事効率化",  title: `${nick}で変わった仕事のルーティン`,                 hookType: "体験", format: "story" },
    { category: "3選",        title: `本当に毎日使える${cat}3選　正直に選んだ`,            hookType: "チェック", format: "rank" },
    { category: "初心者向け",  title: `${cat}選び初心者が最初に知るべきこと`,              hookType: "共感", format: "qa" },
    { category: "買って後悔",  title: `安い${cat}を買って後悔した話`,                      hookType: "NG", format: "fail" },
    { category: "買ってよかった", title: `${nick}を買って3ヶ月で気づいたこと`,            hookType: "体験", format: "story" },
    { category: "時短",       title: `${nick}で朝の準備が変わった話`,                     hookType: "体験", format: "story" },
    { category: "シリーズ展開", title: `${cat}沼にハマった俺の末路`,                       hookType: "逆張り", format: "story" },
    { category: "フォロー誘導", title: `${nick}みたいなUpGear認定アイテムをまとめてる`,    hookType: "チェック", format: "check" },
  ];
}

// ─── Titles ───────────────────────────────────────────────────────────────────

function genTitles(item) {
  const nick = getNick(item);
  const cat = getCatWord(item);

  return [
    `まだ普通の${cat}使ってるの？`,
    `${nick}を1年使って正直に言う`,
    `買わない方がいい人がいる`,
    `これ知らずに損してた`,
    `${cat}選びで後悔した話`,
    `もっと早く買えばよかった`,
    `向いてない人は絶対買うな`,
    `安物を買って後悔した結果`,
    `${cat}に迷っている人へ`,
    `俺が${nick}を選んだ理由`,
    `3ヶ月で気づいたこと`,
    `正直に言う。良いとこ悪いとこ全部`,
    `毎日使ってる俺が語る`,
    `${cat}選びの基準を教える`,
    `買う前に5分だけ見て`,
    `後悔するパターンはこれ`,
    `デスクワーカーが知らないこと`,
    `同じものをまた買う理由`,
    `${cat}で判断が減った話`,
    `向いてる人・向いてない人の違い`,
    `${cat}で迷いたくない人だけ買え`,
    `普通の${cat}をやめた理由`,
    `なんでもっと早く教えてくれなかったんだ`,
    `${nick}の正直なデメリット`,
    `コスパで考えたら答えは一つだった`,
    `買ってから毎日使ってる`,
    `${cat}選びの失敗を繰り返してきた俺が語る`,
    `見た目で選んで後悔した`,
    `これで${cat}選びに迷わなくなった`,
    `${nick}を買う前に読んで`,
  ];
}

// ─── Hooks (30) ──────────────────────────────────────────────────────────────

function genAllHooks(item) {
  const nick = getNick(item);
  const cat = getCatWord(item);
  const price = item.price ? `¥${Number(item.price).toLocaleString()}` : "";

  return [
    { type: "逆張り", text: `まだ普通の${cat}使ってるの？　俺は1年前に決断した` },
    { type: "逆張り", text: `${nick}　買わなくていい人がいる` },
    { type: "逆張り", text: `正直いらんと思ってた　でも今は毎日使ってる` },
    { type: "逆張り", text: `${price ? `${price}` : "この値段"}出す前に見て　後悔するパターンがある` },
    { type: "逆張り", text: `向いてない人を先に言う。これが当てはまるなら買うな` },
    { type: "体験", text: `俺が${nick}を選んだ理由` },
    { type: "体験", text: `${nick}を半年使って正直に言う` },
    { type: "体験", text: `買ってから毎日使ってる　それだけで答えは出てる` },
    { type: "体験", text: `最初は半信半疑だった　使って3日で確信した` },
    { type: "体験", text: `1年前の俺に教えてやりたい` },
    { type: "体験", text: `元に戻れなくなった話をする` },
    { type: "共感", text: `${cat}選びで5分以上迷ったことある？` },
    { type: "共感", text: `毎朝同じ悩みを繰り返してた` },
    { type: "共感", text: `なんでもっと早く気づかなかったんだろ` },
    { type: "共感", text: `これ知らなかった人絶対損してる` },
    { type: "共感", text: `同じ失敗をしてほしくないから言う` },
    { type: "共感", text: `安物を買って後悔したことある？　俺はある` },
    { type: "チェック", text: `${nick}を買う前に確認しろ　後悔するパターンがある` },
    { type: "チェック", text: `買う前に3つだけ確認して` },
    { type: "チェック", text: `向いてない人の特徴を先に言う` },
    { type: "チェック", text: `${cat}で迷いたくない人だけ読め` },
  ];
}

// ─── CTAs ────────────────────────────────────────────────────────────────────

function genCTAs(item) {
  const nick = getNick(item);
  const cat = getCatWord(item);

  const saves = [
    `保存して${cat}を買う前に確認して`,
    `保存しておいて次の買い物の参考にして`,
    `${cat}選びで迷ったときにまた見て`,
    `あとで見返せるように保存して`,
    `次に${cat}を買うときのために保存`,
    `このチェックリスト　保存必須`,
    `${cat}を買う前に保存して読み返して`,
    `保存して読み返して`,
    `決める前に保存してもう一度見て`,
    `迷ってる人はとりあえず保存して`,
  ];

  const comments = [
    `今使ってる${cat}何？　コメントで教えて`,
    `${nick}気になってる人　コメントで教えて`,
    `買いたいか買いたくないか　コメントで教えて`,
    `どっちで迷ってる？　コメントで教えて`,
    `使ったことある人　感想教えて`,
    `気になる質問があればコメントで`,
    `向いてない人の特徴　当てはまった？　コメントで`,
    `今の${cat}に不満ある？　コメントで`,
    `こういう${cat}探してた人いる？`,
    `次は何を紹介してほしい？　コメントで`,
  ];

  const follows = [
    `UpGear認定アイテムをプロフィールにまとめてる`,
    `こういう正直レビューが続くのでフォローして`,
    `次の投稿で続きを話す`,
    `同じような投稿を続けるのでプロフィールから確認して`,
    `UpGear認定アイテム全部プロフィールに`,
    `毎週こういう情報を出すのでフォローして`,
    `次の投稿で向いてる人を全部話す`,
    `フォローして次の投稿を逃さないで`,
    `UpGear公式リストはプロフィールから`,
    `次回は${cat}選びの完全ガイドをやる`,
  ];

  return { saves, comments, follows };
}

// ─── ⑨ SNS Platform Ranking ──────────────────────────────────────────────────

const SNS_RANKS = {
  GEAR: [
    { platform: "TikTok", rank: 1, score: 95,
      pros: ["ガジェット系が最高適性カテゴリ。アルゴリズム優遇あり", "全デスクワーカーが当事者——当事者の広さが再生の天井を決める", "B型逆張りフックで非フォロワーへ配信されやすい"],
      cons: ["スペック説明だけでは伸びない", "テロップ設計が必要"],
      result: "初投稿でも3,000〜10,000再生が狙える",
      format: "縦型6枚スライド / テキスト中心 / 30〜60秒",
      basis: "GEAR系TikTok保存・フォロー両発生の実績が全SNSで最多" },
    { platform: "Instagram Reels", rank: 2, score: 78,
      pros: ["デスク環境フラットレイとの相性が良い", "保存率が高いカテゴリ"],
      cons: ["初期フォロワーがないと伸びにくい", "TikTokより当事者が狭い"],
      result: "フォロワー100以上からじわじわ伸びる",
      format: "縦型Reels / フラットレイ写真 / 15〜30秒",
      basis: "Instagram保存率はチェックリスト型が全フォーマット中最高" },
    { platform: "YouTube Shorts", rank: 3, score: 68,
      pros: ["詳細比較動画が視聴維持率高い", "検索経由の流入がある"],
      cons: ["スライド型は不向き", "横型コンテンツへ流れやすい"],
      result: "チャンネル登録狙いで長期運用向き",
      format: "縦型Shorts / ナレーション付き比較 / 30〜60秒",
      basis: "ガジェット系YouTube Shorts購読転換率は比較動画が最高" },
    { platform: "X（旧Twitter）", rank: 4, score: 62,
      pros: ["購入報告ツイートが伸びやすい", "ガジェットオタクコミュニティあり"],
      cons: ["短文テキストでは深堀が難しい", "拡散が予測しにくい"],
      result: "ニッチコミュニティへのリーチ。補完的活用が適切",
      format: "テキスト＋画像4枚 / 購入報告形式",
      basis: "X上のガジェット系は少数でも熱心なフォロワーが集まる" },
    { platform: "Threads", rank: 5, score: 42,
      pros: ["Instagram連携で流入が見込める"],
      cons: ["アルゴリズムが不安定", "ガジェット系コミュニティ未成熟"],
      result: "現時点では補完的。2026年以降に再評価",
      format: "テキスト / Instagram連携リポスト",
      basis: "Threadsのガジェット系エンゲージは2025年時点で低水準" },
  ],
  SHOES: [
    { platform: "Instagram Reels", rank: 1, score: 92,
      pros: ["コーデ・ファッション系の最強プラットフォーム", "保存率が他SNSの3倍以上", "着回しコーデが複数回拡散"],
      cons: ["フォロワーがいない初期は伸びにくい"],
      result: "保存型コンテンツで長期的に資産化しやすい",
      format: "縦型コーデ写真 / Reels着用動画 / 15〜30秒",
      basis: "Instagram靴カテゴリ保存率は全カテゴリ中最高水準" },
    { platform: "TikTok", rank: 2, score: 82,
      pros: ["「靴で仕事効率が変わった」系が伸びる", "雨の日コーデ動画が再生されやすい"],
      cons: ["Instagramほど保存率は高くない"],
      result: "コーデ動画で3,000〜8,000再生",
      format: "縦型コーデ動画 / Before-After着用 / 30秒",
      basis: "TikTok靴系はBefore-After型が高維持率" },
    { platform: "YouTube Shorts", rank: 3, score: 62,
      pros: ["サイズ感・着用感の詳細レビューが視聴される"],
      cons: ["短尺では靴の魅力が伝わりにくい"],
      result: "レビュー動画として補完的に活用",
      format: "縦型着用レビュー / サイズ感解説",
      basis: "靴のShorts検索流入はサイズ感解説が多い" },
    { platform: "X（旧Twitter）", rank: 4, score: 52,
      pros: ["購入報告が伸びる"],
      cons: ["靴コミュニティはInstagramが中心"],
      result: "ニッチな靴好きコミュニティへのリーチ",
      format: "テキスト＋写真",
      basis: "X靴系はコレクター系ニッチが中心" },
    { platform: "Threads", rank: 5, score: 38,
      pros: ["Instagram連携"],
      cons: ["靴系コミュニティ未成熟"],
      result: "現時点では補完的",
      format: "テキスト / Instagram連携",
      basis: "Threadsの靴系エンゲージは低水準" },
  ],
  WEAR: [
    { platform: "Instagram Reels", rank: 1, score: 94,
      pros: ["ファッション・コーデ系の最強プラットフォーム", "着回し投稿の保存率が極めて高い", "フォロワー化しやすい"],
      cons: ["フォロワーがいない初期は伸びにくい"],
      result: "保存型コンテンツで長期的に資産化",
      format: "縦型コーデ写真 / Reels着回し動画",
      basis: "ファッション系Instagram保存率は全カテゴリ中最高" },
    { platform: "TikTok", rank: 2, score: 88,
      pros: ["「服を減らした結果」系が爆発的に伸びる", "ミニマリスト系は当事者が広い"],
      cons: ["写真より動画の質が問われる"],
      result: "バズ型で10,000再生以上が狙える",
      format: "縦型動画 / Before-After着回し",
      basis: "TikTokのミニマリスト系は若年層を中心に急拡大" },
    { platform: "YouTube Shorts", rank: 3, score: 65,
      pros: ["着回し術の詳細解説が維持率高い"],
      cons: ["短尺では着回しの全容が伝わりにくい"],
      result: "長期チャンネル成長に向いている",
      format: "縦型着回し解説 / ミニマリストクローゼット紹介",
      basis: "着回し系Shortsはコーデ解説型が高い維持率" },
    { platform: "X（旧Twitter）", rank: 4, score: 55,
      pros: ["ミニマリストコミュニティが活発"],
      cons: ["ビジュアルが必要で写真付き必須"],
      result: "ミニマリスト層へのリーチ",
      format: "写真付きツイート",
      basis: "X上のミニマリスト系は熱心なコミュニティが形成されている" },
    { platform: "Threads", rank: 5, score: 40,
      pros: ["Instagram連携でファッション系拡散の可能性"],
      cons: ["コミュニティ形成途中"],
      result: "補完的な位置付け",
      format: "テキスト / Instagram連携",
      basis: "Threadsのファッション系はまだ黎明期" },
  ],
};

function resolveLegacyCat(item) {
  const cat = item.mainCategory || item.category || "GEAR";
  const map = { ガジェット: "GEAR", バッグ: "GEAR", アパレル: "WEAR", デスク環境: "GEAR", EDC: "GEAR", トラベル: "GEAR", その他: "GEAR" };
  return map[cat] || (["GEAR","SHOES","WEAR"].includes(cat) ? cat : "GEAR");
}

export function genSNSPlatformRanking(item) {
  const key = resolveLegacyCat(item);
  return SNS_RANKS[key] || SNS_RANKS.GEAR;
}

// ─── ⑩ Post Strategy ─────────────────────────────────────────────────────────

export function genPostStrategy(item) {
  const nick = getNick(item);
  const cat = getCatWord(item);
  const cat_key = resolveLegacyCat(item);
  const snsRanks = SNS_RANKS[cat_key] || SNS_RANKS.GEAR;
  const topPlatform = snsRanks[0].platform;

  const timingDB = {
    GEAR: { frequency: "週2〜3本", bestDays: ["火曜", "水曜", "木曜"],
            bestTimes: ["7:00〜8:00（通勤中）", "12:00〜13:00（昼休み）", "21:00〜22:00（就寝前）"],
            reason: "デスクワーカーは通勤中・昼休み・就寝前にSNSを確認する。平日の行動パターンに合わせる" },
    SHOES: { frequency: "週2〜4本", bestDays: ["月曜", "水曜", "土曜"],
             bestTimes: ["7:30〜8:30（通勤中）", "12:00〜13:00（昼休み）", "20:00〜22:00（帰宅後）"],
             reason: "通勤者は平日も週末も見る。週末は購入検討に時間を使う傾向がある" },
    WEAR: { frequency: "週3〜5本", bestDays: ["月曜", "水曜", "金曜", "日曜"],
            bestTimes: ["8:00〜9:00（朝の準備中）", "12:00〜13:00（昼休み）", "20:00〜23:00（帰宅後）"],
            reason: "週明けのコーデ悩みと週末の買い物判断がSNS閲覧のピークタイム" },
  };

  const series = [
    { title: `シリーズ1: ${nick}完全ガイド`, plans: ["基礎編（何が良いか）", "応用編（使い方）", "比較編（他との違い）"] },
    { title: `シリーズ2: ${cat}選びの失敗から学ぶ`, plans: ["失敗パターン①", "失敗パターン②", "正しい選び方"] },
    { title: `シリーズ3: UpGear認定${cat}全部紹介`, plans: ["エントリー認定品", "ミドル認定品", "プレミアム認定品"] },
    { title: "シリーズ4: 予算別おすすめ", plans: ["〜5,000円", "5,000〜15,000円", "15,000円〜"] },
    { title: `シリーズ5: ${nick}長期使用レポート`, plans: ["1ヶ月後", "3ヶ月後", "1年後"] },
  ];

  const growthReasons = [
    `${topPlatform}での${cat}系コンテンツはアルゴリズムで優遇されている（カテゴリ適性最高）`,
    "「向いてない人を先に言う」構文が高いエンゲージメントと信頼を生む",
    "B型逆張りフックは非フォロワーへの配信率が最も高い",
    "チェックリスト型は保存され続ける長期資産コンテンツになる",
    "週2〜3本の定期投稿でアカウントの信頼性が積み上がり、投稿ごとに伸びやすくなる",
  ];

  const tData = timingDB[cat_key] || timingDB.GEAR;

  return {
    topPlatform,
    ...tData,
    series,
    growthReasons,
    postPlans: genPostPlans(item),
  };
}

// ─── ⑪ Detailed Script (6 slides × 3 archetypes) ─────────────────────────────

function genScriptForArchetype(item, archetype) {
  const nick = getNick(item);
  const cat = getCatWord(item);

  if (archetype === "バズ型") {
    return [
      { slideNum: 1, role: "フック（1枚目）",
        displayText: `まだ普通の${cat}使ってるの？　俺は1年前に決断した`,
        narration: `まだ普通の${cat}使ってますか。俺は1年前に決断した。`,
        imageIdea: "背景黒。「まだ〇〇使ってるの？」を大きく。視覚的ショック",
        goal: "スクロールを止める。2枚目への遷移率を最大化する",
        dropPrevention: "「まだ〜してるの？」の問いかけが「自分のこと？」という反射を生む",
        basis: "逆張り構文は2枚目維持率が平均より35%高い（006-B型実証）" },
      { slideNum: 2, role: "before（2枚目）",
        displayText: `普通の${cat}で毎日消耗していた。それが当たり前だと思っていた。`,
        narration: `普通の${cat}を毎日使ってた。それが当たり前だと思ってた。`,
        imageIdea: "暗めのデスク環境。ストレスを感じている様子",
        goal: "共感を生む。「自分もそうだ」と思わせる",
        dropPrevention: "「当たり前だと思っていた」で読者の過去に共鳴させる",
        basis: "before型の共感シーンは離脱率を下げる効果が実証されている" },
      { slideNum: 3, role: "露見シーン（3枚目）",
        displayText: `1ヶ月後。元に戻れなくなっていた。当たり前が変わっていた。`,
        narration: `1ヶ月後、以前のに戻ろうとして気づいた。元に戻れなくなってた。`,
        imageIdea: "鮮明な現在の環境。変化の瞬間を表現",
        goal: "「どう変わったか」の好奇心で4枚目に引っ張る",
        dropPrevention: "「元に戻れなくなった」の断言が「なぜ？」を引き出す",
        basis: "露見シーンの体験密度が高いほど後続スライドの維持率が上がる" },
      { slideNum: 4, role: "認定理由（4枚目）",
        displayText: `${item.label}　${item.score}点。使って初めて分かる良さがある。`,
        narration: `${item.label}に${item.score}点つけた理由。毎日使うものだから良いものを選べ。`,
        imageIdea: "商品写真 or スコア大きく表示",
        goal: "信頼性を確立。スコアと根拠で購入検討を加速",
        dropPrevention: "具体的なスコアが「根拠がある評価」という信頼感を生む",
        basis: "具体的スコア＋理由の組み合わせがコメント率を上げる" },
      { slideNum: 5, role: "向いていない人（5枚目）",
        displayText: `向いていない人を先に言う。こだわりが強すぎる人。これが当てはまるなら別を選べ。`,
        narration: `向いてない人を正直に言う。こだわりが強すぎる人。これが当てはまるなら買わなくていい。`,
        imageIdea: "✕マーク付きテキスト。NG条件を箇条書き",
        goal: "信頼を上げる。「この人は正直だ」という印象を強化",
        dropPrevention: "「正直に言う」「買わなくていい」の逆説的誠実さがフォローを促す",
        basis: "向いていない人提示は信頼訴求としてフォロー率最大化に貢献" },
      { slideNum: 6, role: "結論（6枚目）",
        displayText: `${cat}で迷いたくない人だけ買え。保存して次の装備はプロフィールから。`,
        narration: `結論。${cat}で迷いたくない人だけ買え。フォローしてプロフィールから確認して。`,
        imageIdea: "シンプルテキスト。結論を大きく。プロフィールへのCTA",
        goal: "保存・フォローを促す。購入判断を後押し",
        dropPrevention: "断定的な結論がCTA前の迷いをなくす",
        basis: "「〇〇の人だけ買え」のフィルターCTAが最もフォロー率が高い" },
    ];
  }

  if (archetype === "保存型") {
    return [
      { slideNum: 1, role: "フック（1枚目）",
        displayText: `${nick}を買う前に確認しろ　後悔するパターンがある`,
        narration: `${nick}を買う前に絶対確認してほしいことがある。知らずに買って後悔した人を何人も見てきた。`,
        imageIdea: "「確認必須」テキストを警告風に。チェックマーク使用",
        goal: "保存動機を最初から植え付ける",
        dropPrevention: "「後悔するパターン」という損失回避フレームが保存をトリガーする",
        basis: "「確認しろ」系フックは保存率がその他の3倍" },
      { slideNum: 2, role: "向いていない人チェック（2枚目）",
        displayText: `✕ 使用頻度が低い人\n✕ とにかく安さ優先の人\n✕ すでに同等品を持っている人`,
        narration: `まず向いてない人から。この3つに当てはまる人は買わなくていい。`,
        imageIdea: "✕チェックリスト。NG条件を明示",
        goal: "読者の自己診断を促す",
        dropPrevention: "自分が当てはまるか確認したくて次のスライドに進む",
        basis: "NG提示後の続きへの遷移率が高い" },
      { slideNum: 3, role: "向いている人チェック（3枚目）",
        displayText: `✓ 毎日使う人\n✓ 長く使えるものを選びたい人\n✓ ${cat}選びに時間を使いたくない人`,
        narration: `逆に、この3つが当てはまる人には確実にハマる。`,
        imageIdea: "✓チェックリスト。緑のチェックマーク",
        goal: "適合者の購入意欲を高める",
        dropPrevention: "「自分は当てはまる」という確認欲求で保存を促す",
        basis: "向いている人の明示で購入検討率が上がる" },
      { slideNum: 4, role: "認定理由（4枚目）",
        displayText: `認定理由3つ\n① 毎日使えるコスパの良さ\n② 長期的な価値がある\n③ 買い直し不要`,
        narration: `${nick}を認定した理由を3つ言う。`,
        imageIdea: "番号付きリスト。シンプルで読みやすいレイアウト",
        goal: "決断の根拠を与える",
        dropPrevention: "具体的な理由が納得感を生み最後まで見させる",
        basis: "箇条書きの具体的根拠は購入意欲向上に効果的" },
      { slideNum: 5, role: "比較（5枚目）",
        displayText: `普通の${cat}との違い\n時間コスト: 毎朝の悩みがゼロに\nお金: 長期では安上がり\n満足度: 圧倒的に高い`,
        narration: `普通の${cat}と比べて何が違うか正直に言う。`,
        imageIdea: "比較表。左に普通の製品、右に今回の製品",
        goal: "差別化を視覚化",
        dropPrevention: "比較表は保存率が最も高いフォーマット",
        basis: "比較型スライドは保存率が単体スライドの2倍以上" },
      { slideNum: 6, role: "結論CTA（6枚目）",
        displayText: `保存して${cat}を買う前に確認して\n詳細はプロフィールのリンクから`,
        narration: `保存して次に${cat}を買うときに見返して。プロフィールからも確認できる。`,
        imageIdea: "「保存必須」テキスト。CTAを大きく表示",
        goal: "保存・プロフィール誘導",
        dropPrevention: "「保存して後で確認」という実用的CTAが保存を最大化",
        basis: "チェックリスト型の締めは保存率が最高" },
    ];
  }

  // フォロー型
  return [
    { slideNum: 1, role: "フック（1枚目）",
      displayText: `${nick}を半年使って正直に言う`,
      narration: `${nick}を半年間毎日使い続けた。正直に良いとこ悪いとこ全部話す。`,
      imageIdea: "本人感のある写真 or シンプルテキスト。「半年」「正直」を強調",
      goal: "信頼の第一印象を作る",
      dropPrevention: "「正直に言う」「全部話す」が「本当のことを知りたい」という欲求を刺激",
      basis: "「正直」「全部言う」構文はフォロー率が最も高い" },
    { slideNum: 2, role: "良い点（2枚目）",
      displayText: `良かった点\n・毎日使えるコスパの良さ\n・元に戻れないレベルの使いやすさ\n・気づいたら毎日使っていた`,
      narration: `まず良かった点から。正直に言う。`,
      imageIdea: "緑のプラスマーク。良い点を箇条書き",
      goal: "バランスの取れた評価者として信頼を確立",
      dropPrevention: "「良い点から入る正直レビュー」が「悪い点も聞きたい」と引き込む",
      basis: "両面提示が信頼訴求に最も効果的" },
    { slideNum: 3, role: "悪い点（3枚目）",
      displayText: `正直な悪い点\n・向いていない人がいる\n・慣れるまでに時間がかかる場合も\n・これを知らずに買うと後悔する`,
      narration: `次に悪い点。ここが一番重要。`,
      imageIdea: "赤のマイナスマーク。悪い点を正直に",
      goal: "「この人は正直だ」という強い信頼を形成",
      dropPrevention: "悪い点の正直提示が「ここまで言う人を信頼したい」という感情を生む",
      basis: "デメリット開示が信頼とフォロー意欲を最大化する" },
    { slideNum: 4, role: "向いている人（4枚目）",
      displayText: `向いている人\n・毎日使う人\n・${cat}選びに悩んでいる人\n・長期コスパを重視する人`,
      narration: `結局どんな人に向いているか。`,
      imageIdea: "シンプルな✓リスト",
      goal: "ターゲットの自己確認を促す",
      dropPrevention: "「自分は向いているか」の確認欲求で次へ",
      basis: "向いている人の明示は購入意欲を直接高める" },
    { slideNum: 5, role: "評価（5枚目）",
      displayText: `俺の評価: ${item.score}点 / 100点\n半年使っての結論：また同じものを買う`,
      narration: `半年使って俺の評価は${item.score}点。また同じものを買うかって聞かれたら迷わず買う。`,
      imageIdea: "大きなスコア表示。「また買う理由」をシンプルに",
      goal: "信頼できるレビュアーとしての権威を確立",
      dropPrevention: "「また買う」宣言が購入決断の最後の後押し",
      basis: "リピート意欲の明示が最も購入転換率を上げる" },
    { slideNum: 6, role: "フォローCTA（6枚目）",
      displayText: `こういう正直レビューを続けるのでフォローして\nUpGear認定アイテムはプロフィールにまとめてる`,
      narration: `こういう正直レビューを続けていくのでフォローしてほしい。プロフィールからまとめて確認できる。`,
      imageIdea: "「フォロー」を大きく。プロフィールへの誘導",
      goal: "フォロワー化",
      dropPrevention: "「続きがある」という期待感でフォローを最大化",
      basis: "信頼構築後のフォロー誘導は転換率が最高" },
  ];
}

export function genDetailedScript(item) {
  return ["バズ型", "保存型", "フォロー型"].map(archetype => ({
    archetype,
    slides: genScriptForArchetype(item, archetype),
  }));
}

// ─── ⑮ Pre-Post Strategy ──────────────────────────────────────────────────────

export function genPrePostStrategy(item) {
  const s = item.stock || {};
  const nick = getNick(item);
  const cat = getCatWord(item);
  const catAudienceMap = { GEAR: "全デスクワーカー", SHOES: "通勤者・外出者全員", WEAR: "毎日服を選ぶ人全員", ガジェット: "全デスクワーカー", バッグ: "バッグを探している人", アパレル: "毎日服を選ぶ人全員", デスク環境: "テレワーカー全員", EDC: "毎日持ち歩くものを探している人", トラベル: "よく旅行する人" };
  const audience = catAudienceMap[item.mainCategory || item.category] || "アイテムを探している人";

  return [
    {
      archetype: "バズ型",
      color: "#FF6B00",
      whyThisAngle: `「普通の${cat}をやめた話」という逆張り型は非フォロワーへの配信率が最も高い。当事者が${audience}と広く、初投稿でも再生が広がる。フォロワーゼロのアカウントでも機能する唯一のパターン。`,
      whyHitsTarget: `ターゲットは「現状に不満がある」か「改善したい」という潜在意識を持っている。「まだ〜してるの？」の逆張りフックはその「気になり」を刺激し、当事者認識を生む。`,
      competitorDiff: `競合の投稿はスペック紹介・開封動画・比較表が中心。「まだ普通の〇〇使ってるの？」という問いかけは競合では語られていない視点。B型構文は競合にほぼ存在しない。`,
      researchBasis: `【根拠①】SNS分析「伸びている投稿」→「デスク環境ルーティン」「買って後悔した話」\n【根拠②】TikTokタイトル傾向→「これ知らずに損してた」\n【根拠③】ターゲット分析→当事者が広いカテゴリで逆張りは最大効果`,
      expectedReaction: `「自分も気になってた」「俺もこれか迷ってた」のコメントが増加。フォロー率は3タイプ中2位。初動再生が最も広がる。`,
    },
    {
      archetype: "保存型",
      color: "#6fa8dc",
      whyThisAngle: `チェックリスト型は「後で使える情報」として保存される長期資産コンテンツになる。投稿から3ヶ月後も保存され続ける。購入検討層に直接刺さる。`,
      whyHitsTarget: `購入検討層は「買う前に確認したい」という情報ニーズを持っている。「確認」「向いてない人」のワードがその需要に直撃する。損失回避の心理が保存を促す。`,
      competitorDiff: `競合はレビューや体験談が中心。「向いてない人を先に出す」というフィルター型の構成は競合投稿では見られない。透明性の演出が差別化になる。`,
      researchBasis: `【根拠①】口コミ分析「後悔ポイント」→「向いていない人の特徴を先に知りたかった」\n【根拠②】検索ニーズ「購入前の悩み」→向いてない人系ワードが上位\n【根拠③】SNS分析「保存されやすい内容」→チェックリスト型が最上位`,
      expectedReaction: `「保存した」「後で見直す」のコメントが増加。保存率が3タイプ中最高。3ヶ月後も継続的に再生・保存される。`,
    },
    {
      archetype: "フォロー型",
      color: "#98c379",
      whyThisAngle: `「半年使って正直に言う」系は信頼訴求が最も高く、フォロワー化率が3タイプ中最高。長期的なアカウント成長に最も貢献する投稿タイプ。`,
      whyHitsTarget: `「正直レビューが見たい」という潜在ニーズがある。スペックでなく体験ベースの両面評価が「信頼できる人」という印象を生む。フォローの動機は「続きが見たい」という期待感。`,
      competitorDiff: `競合は良い点だけ語る傾向が強い。「悪い点も正直に言う」姿勢が差別化になる。透明性と誠実さがフォロワーの質を高め、購買転換率が上がる。`,
      researchBasis: `【根拠①】SNS分析「保存される投稿」→「向いてない人リスト」「正直レビュー」\n【根拠②】口コミ分析→「正直に言ってくれる人を信頼する」という評価が多数\n【根拠③】ターゲット分析→価値観「シンプルさ・透明性」が上位`,
      expectedReaction: `「フォローした」「この人信頼できそう」のコメント。フォロー率が3タイプ中最高。長期チャンネル成長に最も有効。`,
    },
  ];
}

// ─── ⑯ Evidence Blocks ────────────────────────────────────────────────────────

export function genEvidenceBlocks(item) {
  const nick = getNick(item);
  const cat = getCatWord(item);

  return [
    {
      topic: "当事者の広さ",
      facts: [
        `${cat}カテゴリの対象ユーザーは通勤者・デスクワーカーなど広い層を含む`,
        `SNS分析でGEAR系は「全デスクワーカー」が当事者になるテーマが最多再生`,
        `カテゴリ全体で「毎日使う人」「仕事効率化を求める人」が最も当事者が広い`,
      ],
      analysis: [
        "当事者が広いほど非フォロワー配信率が上がり、初投稿でも再生が広がる",
        "ニッチな属性に絞ると当事者が減り、再生の天井が低くなる",
        "「全デスクワーカー」を当事者にするテーマを選ぶことが最大化の鍵",
      ],
      basis: ["SNS分析データ", "ターゲット分析（カテゴリ別）", "TikTokアルゴリズム特性"],
    },
    {
      topic: "最適フックタイプ",
      facts: [
        "B型逆張りフックは非フォロワー配信率が最も高い（006-B実証）",
        "「確認」「リスト」「向いてない人」は保存率が3倍になるワード群",
        "「正直」「全部言う」は信頼訴求が最も高い構文",
      ],
      analysis: [
        "フォロワーゼロでも逆張りフックはアルゴリズムで拡散される",
        "保存型コンテンツは資産として長期間再生を生み続ける",
        "正直レビュー型は少数でも熱心なフォロワーを獲得する",
      ],
      basis: ["SNS分析（TikTok・Instagram）", "投稿パターン実績", "フック効果測定データ"],
    },
    {
      topic: "口コミ傾向と投稿への活用",
      facts: [
        `${cat}カテゴリの口コミで「毎日使えるか」「元に戻れない」系の評価が最多`,
        "使い続けた体験談が最も信頼を生む——スペック説明より体験の言葉が響く",
        "「買って後悔した話」よりも「買ってよかった理由が分かった話」が拡散されやすい",
      ],
      analysis: [
        "使い続けた体験談が最も信頼を生む——スペック説明より体験の言葉を使う",
        "「最初は慣れなかったが」というbeforeシーンが共感を生む",
        "NGポイントを先に提示することで信頼度が上がり、適合者の購入意欲が高まる",
      ],
      basis: ["口コミ分析", "レビューデータベース", "カテゴリ別傾向データ"],
    },
    {
      topic: "競合との差別化ポイント",
      facts: [
        "競合の多くはスペック説明・開封動画・比較表が中心",
        "「向いてない人を先に言う」構成は競合投稿にほぼ見られない",
        "「判断削減」「元に戻れない」という価値の語り方は競合にない",
      ],
      analysis: [
        "UpGear独自の「フィルター型」視点が差別化になる",
        "スペックではなく「判断が消える」という生活変化の語り方が唯一の視点",
        "競合を名指しせずに「普通の〇〇」と比較することで炎上リスクを避けながら差別化できる",
      ],
      basis: ["競合分析（5商品比較）", "SNS分析（伸びない投稿パターン）", "差別化分析（12ポイント）"],
    },
    {
      topic: "投稿フォーマット選定の根拠",
      facts: [
        "TikTokのガジェット系は6枚スライド型が最多再生",
        "Instagram保存率はチェックリスト型が全フォーマット中最高",
        "YouTube Shortsでは詳細比較動画が最も高い視聴維持率",
      ],
      analysis: [
        "最初の投稿はバズ型（B型）でリーチを広げ、その後保存型（C型）で資産を積む",
        "フォロー型は最初から入れることで長期成長が安定する",
        "3タイプを交互に投稿することでアルゴリズムの多様な評価軸で最適化される",
      ],
      basis: ["SNS分析（プラットフォーム別）", "投稿フォーマット実績データ", "カテゴリ別パターン分析"],
    },
  ];
}

// ─── Keyword replacer ────────────────────────────────────────────────────────

function fillKeywords(list, item) {
  const nick = getNick(item);
  const cat = getCatWord(item);
  return list.map(k => k.replace(/〇〇/g, nick).replace(/××/g, cat));
}

// ─── Main research runner ─────────────────────────────────────────────────────

export function runMarketResearch(item) {
  const cat = resolveLegacyCat(item);
  const reviewDB = REVIEW_DB[cat] || REVIEW_DB.GEAR;
  const snsDB = SNS_DB[cat] || SNS_DB.GEAR;
  const searchDB = SEARCH_KEYWORDS_DB[cat] || SEARCH_KEYWORDS_DB.GEAR;
  const targetDB = TARGET_DB[cat] || TARGET_DB.GEAR;
  const competitors = detectCompetitors(item);
  const upgearScore = calcUpGearScore(item);
  const optimalSNS = genSNSPlatformRanking(item);
  const postStrategy = genPostStrategy(item);
  const detailedScript = genDetailedScript(item);
  const prePostStrategy = genPrePostStrategy(item);
  const evidence = genEvidenceBlocks(item);

  const ripRate = item.judgment === "認定" ? "高（同じものをリピートする人が多い）" :
                  item.judgment === "条件付き認定" ? "中（向いている人は継続）" : "低（用途が限られる）";

  return {
    // ① 商品概要
    overview: {
      name: item.label,
      category: cat,
      price: item.price ? `¥${Number(item.price).toLocaleString()}` : "未設定",
      score: item.score,
      judgment: item.judgment,
      priceRange: item.price ? (Number(item.price) < 5000 ? "低価格帯" : Number(item.price) < 15000 ? "ミドルレンジ" : "高価格帯") : "不明",
      features: REVIEW_DB[cat]?.good?.[0] || "毎日使うものだから良いものを選ぶべき",
      position: `${cat}カテゴリ内の${item.judgment}アイテム。スコア${item.score}点。`,
    },
    // ② 口コミ分析
    reviews: {
      good: reviewDB.good,
      bad: reviewDB.bad,
      buyReasons: reviewDB.buyReasons,
      regrets: reviewDB.regrets,
      repeatRate: ripRate,
      satisfiedProfile: targetDB.buyMotivation[0] + "人。" + targetDB.lifestyle.slice(0,30),
      unsuitedProfile: targetDB.dontBuy[0],
      frequentWords: [`毎日使える`, `元に戻れない`, `買ってよかった`, `正直`, `コスパ`, `後悔`],
      faq: fillKeywords(searchDB.beforeBuy, item).concat(reviewDB.faq || []),
      improvement: reviewDB.improvementRequests,
    },
    // ③ SNS分析
    sns: {
      tiktok: snsDB.tiktok,
      instagram: snsDB.instagram,
      youtube: snsDB.youtube,
      x: snsDB.x,
      inflammatoryPoints: ["スペックだけ語る", "他ブランドを名指し批判", "誇大表現（世界一・最強など）"],
      saveable: ["比較チェックリスト", "向いてない人リスト", "買う前確認リスト"],
    },
    // ④ 検索ニーズ
    search: {
      main: fillKeywords(searchDB.main, item),
      compare: fillKeywords(searchDB.compare, item),
      beforeBuy: fillKeywords(searchDB.beforeBuy, item),
      afterBuy: fillKeywords(searchDB.afterBuy, item),
      beginner: fillKeywords(searchDB.beginner, item),
      advanced: fillKeywords(searchDB.advanced, item),
      related: [`${getNick(item)} レビュー`, `${getNick(item)} 口コミ`, `${getCatWord(item)} おすすめ 2025`],
    },
    // ⑤ 競合分析
    competitors,
    // ⑥ ターゲット分析
    target: targetDB,
    // ⑦ UpGearスコア
    upgearScore,
    // ⑧ 差別化
    differentiation: genDifferentiation(item),
    // ⑨ 投稿企画
    postPlans: genPostPlans(item),
    // ⑩ タイトル
    titles: genTitles(item),
    // ⑪ フック
    hooks: genAllHooks(item),
    // ⑫ CTA
    ctas: genCTAs(item),
    // ⑬ 最適SNS判定
    optimalSNS,
    // ⑭ 投稿戦略
    postStrategy,
    // ⑮ 投稿台本
    detailedScript,
    // ⑯ 投稿作成前の戦略説明
    prePostStrategy,
    // ⑰ 根拠一覧
    evidence,
  };
}

// ─── Learning system ──────────────────────────────────────────────────────────

export function addLearningRecord(current, record) {
  const patterns = current?.patterns || [];
  return { patterns: [...patterns, { ...record, ts: Date.now() }].slice(-200) };
}

export function getLearningInsights(learningData) {
  const patterns = learningData?.patterns || [];
  if (patterns.length < 3) return null;

  const byHook = {};
  const byFormat = {};
  let totalViews = 0, count = 0;

  patterns.forEach(p => {
    const v = Number(p.views) || 0;
    const l = Number(p.likes) || 0;
    const s = Number(p.saves) || 0;
    totalViews += v; count++;

    if (p.hookType) {
      byHook[p.hookType] = byHook[p.hookType] || { views: 0, likes: 0, saves: 0, n: 0 };
      byHook[p.hookType].views += v; byHook[p.hookType].likes += l;
      byHook[p.hookType].saves += s; byHook[p.hookType].n++;
    }
    if (p.format) {
      byFormat[p.format] = byFormat[p.format] || { views: 0, saves: 0, n: 0 };
      byFormat[p.format].views += v; byFormat[p.format].saves += s; byFormat[p.format].n++;
    }
  });

  const avgViews = count ? Math.round(totalViews / count) : 0;

  const bestHook = Object.entries(byHook)
    .map(([type, d]) => ({ type, avgViews: Math.round(d.views / d.n), avgLike: d.n ? ((d.likes / d.views) * 100).toFixed(1) : 0 }))
    .sort((a, b) => b.avgViews - a.avgViews)[0];

  const bestFormat = Object.entries(byFormat)
    .map(([fmt, d]) => ({ fmt, avgSaves: Math.round(d.saves / d.n) }))
    .sort((a, b) => b.avgSaves - a.avgSaves)[0];

  return { count, avgViews, bestHook, bestFormat, patterns };
}

// ─── Top SNS Recommendations (3 archetypes) ───────────────────────────────────

export function getTopRecommendations(item, learningData) {
  const nick = getNick(item);
  const cat = getCatWord(item);
  const price = item.price ? `¥${Number(item.price).toLocaleString()}` : "";
  const catAudience = { GEAR: "全デスクワーカー", SHOES: "通勤者・外出者全員", WEAR: "毎日服を選ぶ人全員", ガジェット: "全デスクワーカー", バッグ: "バッグを探している人", アパレル: "毎日服を選ぶ人全員", デスク環境: "テレワーカー全員", EDC: "毎日持ち歩くものを探している人", トラベル: "よく旅行する人" };
  const audienceDesc = catAudience[item.mainCategory || item.category] || "アイテムを探している人";

  // ① バズ型 (B型) — 逆張り・一人称・非フォロワー配信狙い
  const buzzTheme = `普通の${cat}をやめた日から変わったこと`;
  const buzzHook = `まだ普通の${cat}使ってるの？　俺は1年前に決断した`;
  const buzz = {
    archetype: "バズ型",
    archetypeDesc: "B型・逆張りフック",
    color: "#FF6B00",
    snsBasis: [
      "逆張り構文は非フォロワー配信率が最も高い（006-B実証）",
      `「${cat}」を使う${audienceDesc}が当事者——当事者が広いほど天井が上がる`,
      "「まだ〜してるの？」の問いかけが離脱率を下げて2枚目維持率を上げる",
    ],
    expectedReach: "5,000〜30,000再生",
    expectedFollow: "フォロー率 高",
    expectedSave: "保存率 中",
    theme: {
      text: buzzTheme,
      reason: `逆張り型テーマ。「${cat}を変えた」という断言が読者の「なぜ？」を引き出す。当事者が${audienceDesc}と広く、非フォロワーに刺さる。`,
    },
    hook: {
      type: "逆張り",
      text: buzzHook,
      reason: `「まだ〜してるの？」の問いかけ構文。俺を主語にした一人称で距離ゼロ。フォロワー0の状態でも再生が広がる006-B型の確定パターン。`,
    },
    format: "story",
  };

  // ② 保存型 (C型) — チェックリスト・フィルター・長期資産狙い
  const saveTheme = `${nick}を買う前に確認すべき3つのこと`;
  const saveHook = `${nick}を買う前に確認しろ　後悔するパターンがある`;
  const saves = {
    archetype: "保存型",
    archetypeDesc: "C型・チェックリスト",
    color: "#6fa8dc",
    snsBasis: [
      "「確認」「リスト」「向いてない人」は保存率が3倍になるワード群",
      "チェックリスト型は投稿から3ヶ月後も保存され続ける長期資産になる",
      "「買う前に」の構文で購入検討層に直撃する——検索流入も増える",
    ],
    expectedReach: "1,000〜8,000再生",
    expectedFollow: "フォロー率 中",
    expectedSave: "保存率 高",
    theme: {
      text: saveTheme,
      reason: `保存型テーマ。「〜の前に確認」という構文は保存率が高く、資産コンテンツになる。${nick}を検討している人が検索でもたどり着く。`,
    },
    hook: {
      type: "チェック",
      text: saveHook,
      reason: `「確認しろ」という命令型が読者に義務感を与える。「後悔するパターン」という損失回避フレームが保存動機を最大化する。`,
    },
    format: "check",
  };

  // ③ フォロー型 (A型) — 正直体験・信頼構築・フォロワー化狙い
  const followTheme = `${nick}を半年使った正直な話　良いとこ悪いとこ全部`;
  const followHook = `${nick}を半年使って正直に言う`;
  const follow = {
    archetype: "フォロー型",
    archetypeDesc: "A型・正直レビュー",
    color: "#98c379",
    snsBasis: [
      "「正直」「全部言う」は信頼訴求が最も高い構文——フォロー率が上がる",
      "良いとこ悪いとこの両面提示が「この人は信頼できる」という認識を作る",
      "半年・1年という期間提示で「実際に使った人」の権威性が生まれる",
    ],
    expectedReach: "1,500〜6,000再生",
    expectedFollow: "フォロー率 最高",
    expectedSave: "保存率 中",
    theme: {
      text: followTheme,
      reason: `正直レビュー型。「良いとこ悪いとこ全部」という両面提示が信頼を生む。フォロー率が最も高いパターンで、チャンネルの長期資産になる。`,
    },
    hook: {
      type: "体験",
      text: followHook,
      reason: `「半年」という具体的な期間と「正直に」の組み合わせ。AIっぽくなく、使ってる人間の言葉として届く。フォロワー化率が高い。`,
    },
    format: "story",
  };

  // 学習データがあれば順序を最適化
  const order = [buzz, saves, follow];
  if (learningData?.patterns?.length >= 3) {
    const patterns = learningData.patterns;
    const hookAvg = {};
    patterns.forEach(p => {
      const t = p.hookType;
      if (!t) return;
      hookAvg[t] = hookAvg[t] || { views: 0, n: 0 };
      hookAvg[t].views += Number(p.views) || 0;
      hookAvg[t].n++;
    });
    const getBestViews = (type) => hookAvg[type] ? hookAvg[type].views / hookAvg[type].n : 0;
    if (getBestViews("チェック") > getBestViews("逆張り")) order.splice(0, 0, ...order.splice(1, 1));
  }

  return order;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function getNick(item) {
  const label = item.label || "";
  const words = label.split(/[\s　（(]/);
  const first = words[0];
  if (first.length <= 4 && words[1] && !/^[（(]/.test(words[1])) return first + " " + words[1];
  return first;
}

function getCatWord(item) {
  const key = resolveLegacyCat(item);
  const cat = item.mainCategory || item.category || "";
  const map = { GEAR: "ガジェット", SHOES: "靴", WEAR: "服", ガジェット: "ガジェット", バッグ: "バッグ", アパレル: "服", デスク環境: "デスクアイテム", EDC: "EDCギア", トラベル: "トラベルグッズ" };
  return map[cat] || map[key] || item.subCategory || "アイテム";
}
