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
  const s = item.stock || {};
  const baseScore = Number(item.score) || 70;
  const filled = ["situation","hook","reveal","change","good","ng1","ng2","conclusion"].filter(k => s[k]?.trim()).length;

  const equipScore  = baseScore >= 80 ? 18 : baseScore >= 65 ? 14 : 10;
  const judgScore   = s.change  ? Math.min(20, 14 + Math.floor(s.change.length / 20)) : 12;
  const contScore   = baseScore >= 80 ? 17 : 13;
  const cospaScore  = item.price ? (Number(item.price) < 5000 ? 14 : Number(item.price) < 15000 ? 12 : 9) : 10;
  const irrepScore  = item.judgment === "認定" ? 13 : item.judgment === "条件付き認定" ? 10 : 7;
  const satisScore  = filled >= 6 ? 5 : filled >= 4 ? 4 : 3;
  const longScore   = baseScore >= 80 ? 5 : 4;

  return {
    equip: equipScore, judgment: judgScore, continuity: contScore,
    cospa: cospaScore, irreplace: irrepScore, satisfaction: satisScore, longterm: longScore,
    total: equipScore + judgScore + contScore + cospaScore + irrepScore + satisScore + longScore,
  };
}

// ─── Differentiation points ───────────────────────────────────────────────────

function genDifferentiation(item) {
  const s = item.stock || {};
  const nick = getNick(item);
  const cat = getCatWord(item);

  const points = [
    `「向いてない人を先に言う」切り口：${s.ng1 ? `「${s.ng1.slice(0,20)}」人は買うな` : `${nick}を勧めない人がいる`}という逆説フック`,
    `「1年後の自分」視点：買った直後より1年後の変化を語る。「${s.change || `${cat}を選ぶ判断が消えた`}」の体験談`,
    `「元に戻れない瞬間」型：${s.reveal ? `「${s.reveal.slice(0,25)}」` : "古い環境に戻ったとき気づく"}という露見シーンで維持率を上げる`,
    `「判断削減」視点：機能説明ではなく「何個の判断が消えたか」で語る。スペックではなく認知コストの話`,
    `「当事者の広さ」型：${nick}のユーザーは${cat}を使う全員。狭い属性ではなく全デスクワーカーに語りかける`,
    `「コスト逆算」型：${item.price ? `¥${Number(item.price).toLocaleString()}を1日あたりに換算すると¥${Math.round(Number(item.price)/365)}。コスパの語り方を変える` : "1日あたりのコストで語る"}`,
    `「失敗談から入る」型：${s.situation ? `「${s.situation.slice(0,20)}」という過去の自分` : "安物を買って後悔した話"}から始める共感型`,
    `「フィルター型CTA」：「${s.conclusion || `${cat}で迷いたくない人だけ買え`}」という排除の文法。保存ではなくフォロー誘導に最適`,
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
  const s = item.stock || {};
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
    s.conclusion ? s.conclusion : `${cat}で迷いたくない人だけ買え`,
    s.situation  ? `${s.situation.slice(0,18)}…だった話` : `普通の${cat}をやめた理由`,
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
  const s = item.stock || {};
  const nick = getNick(item);
  const cat = getCatWord(item);
  const price = item.price ? `¥${Number(item.price).toLocaleString()}` : "";

  const hooks = [
    { type: "逆張り", text: `まだ普通の${cat}使ってるの？　俺は1年前に決断した` },
    { type: "逆張り", text: `${nick}　買わなくていい人がいる` },
    { type: "逆張り", text: `正直いらんと思ってた　でも今は毎日使ってる` },
    { type: "逆張り", text: `${price ? `${price}` : "この値段"}出す前に見て　後悔するパターンがある` },
    { type: "逆張り", text: `向いてない人を先に言う。これが当てはまるなら買うな` },
    s.hook ? { type: "体験", text: s.hook, fromStock: true } : { type: "体験", text: `俺が${nick}を選んだ理由` },
    { type: "体験", text: `${nick}を半年使って正直に言う` },
    { type: "体験", text: `買ってから毎日使ってる　それだけで答えは出てる` },
    { type: "体験", text: `最初は半信半疑だった　使って3日で確信した` },
    s.situation ? { type: "体験", text: `${s.situation.slice(0,25)}…　その日から変わった`, fromStock: true } : { type: "体験", text: `1年前の俺に教えてやりたい` },
    s.reveal    ? { type: "体験", text: `${s.reveal.slice(0,25)}…　その瞬間気づいた`, fromStock: true } : { type: "体験", text: `元に戻れなくなった話をする` },
    { type: "共感", text: `${cat}選びで5分以上迷ったことある？` },
    { type: "共感", text: `毎朝同じ悩みを繰り返してた` },
    { type: "共感", text: `なんでもっと早く気づかなかったんだろ` },
    { type: "共感", text: `これ知らなかった人絶対損してる` },
    { type: "共感", text: `同じ失敗をしてほしくないから言う` },
    { type: "共感", text: `安物を買って後悔したことある？　俺はある` },
    { type: "チェック", text: `${nick}を買う前に確認しろ　後悔するパターンがある` },
    { type: "チェック", text: `買う前に3つだけ確認して` },
    { type: "チェック", text: `向いてない人の特徴を先に言う` },
    s.conclusion ? { type: "チェック", text: s.conclusion, fromStock: true } : { type: "チェック", text: `${cat}で迷いたくない人だけ読め` },
  ];

  return hooks.filter(Boolean);
}

// ─── CTAs ────────────────────────────────────────────────────────────────────

function genCTAs(item) {
  const nick = getNick(item);
  const cat = getCatWord(item);
  const s = item.stock || {};

  const saves = [
    `保存して${cat}を買う前に確認して`,
    `保存しておいて次の買い物の参考にして`,
    `${cat}選びで迷ったときにまた見て`,
    `あとで見返せるように保存して`,
    `次に${cat}を買うときのために保存`,
    `このチェックリスト　保存必須`,
    `${cat}を買う前に保存して読み返して`,
    s.conclusion ? `${s.conclusion}　保存して確認して` : `保存して読み返して`,
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

// ─── Keyword replacer ────────────────────────────────────────────────────────

function fillKeywords(list, item) {
  const nick = getNick(item);
  const cat = getCatWord(item);
  return list.map(k => k.replace(/〇〇/g, nick).replace(/××/g, cat));
}

// ─── Main research runner ─────────────────────────────────────────────────────

export function runMarketResearch(item) {
  const cat = item.category || "GEAR";
  const s = item.stock || {};
  const reviewDB = REVIEW_DB[cat] || REVIEW_DB.GEAR;
  const snsDB = SNS_DB[cat] || SNS_DB.GEAR;
  const searchDB = SEARCH_KEYWORDS_DB[cat] || SEARCH_KEYWORDS_DB.GEAR;
  const targetDB = TARGET_DB[cat] || TARGET_DB.GEAR;
  const competitors = detectCompetitors(item);
  const upgearScore = calcUpGearScore(item);

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
      features: s.good || "ストックデータに記入してください",
      stockFilled: ["situation","hook","reveal","change","good","ng1","ng2","conclusion"].filter(k => s[k]?.trim()).length,
      position: `${cat}カテゴリ内の${item.judgment}アイテム。スコア${item.score}点。`,
    },
    // ② 口コミ分析
    reviews: {
      good: [...(s.good ? [`（ストック）${s.good.slice(0,50)}`] : []), ...reviewDB.good],
      bad: [...(s.ng1 ? [`（ストック）${s.ng1.slice(0,40)}`] : []), ...(s.ng2 ? [`（ストック）${s.ng2.slice(0,40)}`] : []), ...reviewDB.bad],
      buyReasons: [...(s.situation ? [`（ストック）${s.situation.slice(0,40)}`] : []), ...reviewDB.buyReasons],
      regrets: reviewDB.regrets,
      repeatRate: ripRate,
      satisfiedProfile: targetDB.buyMotivation[0] + "人。" + targetDB.lifestyle.slice(0,30),
      unsuitedProfile: s.ng1 || targetDB.dontBuy[0],
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

// ─── Utilities ────────────────────────────────────────────────────────────────

function getNick(item) {
  const label = item.label || "";
  const words = label.split(/[\s　（(]/);
  const first = words[0];
  if (first.length <= 4 && words[1] && !/^[（(]/.test(words[1])) return first + " " + words[1];
  return first;
}

function getCatWord(item) {
  return { GEAR: "ガジェット", SHOES: "靴", WEAR: "服" }[item.category] || "アイテム";
}
