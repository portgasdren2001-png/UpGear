// ─── Market Research ─────────────────────────────────────────────────────────

const MARKET = {
  GEAR: {
    problems: ["デスクのスペースが足りない", "コードが絡まって邪魔", "すぐ壊れて買い直しになる", "使いにくくて仕事が遅くなる", "どれを選べばいいか分からない", "安物を買って後悔した", "手首・肩が疲れる"],
    angles: ["仕事効率化", "デスク整理", "テレワーク最適化", "長期投資としての選択", "コスパ重視"],
    viral: ["1年使って分かったこと", "会社の人に聞かれた理由", "買い替えた結果", "ミスった買い物の話", "毎日使って初めて気づいたこと"],
    buyReasons: ["毎日使うから良いものを", "口コミが良かった", "プロが使っていた", "見た目が気に入った", "コスパが良さそうだった"],
    regrets: ["互換性を確認しなかった", "安物で結局高い方に買い直した", "サイズを間違えた", "使いにくさに後で気づいた"],
    surprises: ["1ヶ月で手放せなくなる", "仕事のスピードが体感で変わる", "元に戻れなくなる", "意外と周りから聞かれる"],
  },
  SHOES: {
    problems: ["歩くと足が疲れる", "雨の日に靴が濡れる", "毎日同じ靴が履けない", "コーデが難しい", "革靴のケアが面倒", "通勤で靴が傷む"],
    angles: ["通勤最適化", "天気を気にしない", "毎日同じ靴で済む", "見た目と機能の両立", "長期コスパ"],
    viral: ["革靴をやめた話", "毎日同じ靴を履いてる理由", "雨でも使える靴を探してた", "靴選びで後悔した話", "靴で仕事効率が変わった話"],
    buyReasons: ["疲れにくそうだった", "天気を気にしたくない", "長持ちしそうだった", "デザインが気に入った", "機能性を優先した"],
    regrets: ["サイズが合わなかった", "ケアの手間を考えなかった", "見た目だけで選んだ", "価格だけで選んだ"],
    surprises: ["雨でも全く気にならなくなる", "足の疲れが激減する", "毎朝靴選びが不要になる"],
  },
  WEAR: {
    problems: ["毎朝服選びに時間がかかる", "着回しが難しい", "洗濯で傷む", "季節ごとに買い替えが必要", "ビジネスとカジュアルの兼用が難しい"],
    angles: ["服選びの時間をゼロに", "長く使える服", "どんな場面でも使える", "ミニマルクローゼット"],
    viral: ["服を減らした結果", "毎日同じ服を着てる理由", "高い服より長く使える服", "クローゼットを片付けた話"],
    buyReasons: ["毎日使える", "コーデに迷いたくない", "長持ちする", "デザインがシンプル"],
    regrets: ["流行りで選んで後悔", "安物で買い直した", "サイズ感を確認しなかった"],
    surprises: ["服選びがなくなる快感", "毎朝の時間が増える", "意外と飽きない"],
  },
};

export function getMarketResearch(category) {
  return MARKET[category] || MARKET.GEAR;
}

// ─── Theme Generation ─────────────────────────────────────────────────────────

export function generateThemes(item) {
  const nick = getNick(item);
  const cat = getCatWord(item);
  return [
    `半年使って分かった${nick}の正直な話`,
    `${nick}を買って後悔した人がやってたこと`,
    `毎日使う人には必須　${nick}の話`,
    `向いてない人もいる　${nick}の現実`,
    `買う前に知りたかった${nick}のデメリット`,
    `ここだけは失敗した　${nick}レビュー`,
    `1年使ってる俺が正直に言う`,
    `安い方を買って後悔した話`,
    `これ知らずに損してた`,
    `最初はいらんと思ってた　でも今は手放せない`,
    `もっと早く買えばよかった`,
    `買って1週間で気づいたこと`,
    `${cat}選びで失敗しないために`,
    `正直レビュー　良いとこ悪いとこ全部`,
    `向いてない人の特徴3つ`,
    `コスパで考えたら答えは決まってた`,
    `毎日使って初めて分かること`,
    `買う前に5分だけ見て`,
    `${nick}で変わった1つのこと`,
    `失敗しない${cat}選びの基準`,
  ];
}

// ─── Hook Generation ─────────────────────────────────────────────────────────

export function generateHooks(item) {
  const nick = getNick(item);
  const cat = getCatWord(item);
  const s = item.stock || {};

  return [
    { type: "逆張り", text: `${nick}をまだ選んでいるか　俺は1年前に決断した` },
    { type: "逆張り", text: `まだ普通の${cat}使ってるの？` },
    { type: "逆張り", text: `${nick}　買わなくていい人がいる` },
    { type: "逆張り", text: `正直いらんと思ってた　でも今は毎日使ってる` },
    { type: "逆張り", text: `${cat}に${item.price ? `¥${Number(item.price).toLocaleString()}` : "1万円"}出す前に見て` },
    { type: "体験", text: s.hook || `俺が${nick}を選んだ理由` },
    { type: "体験", text: `${nick}を半年使って正直に言う` },
    { type: "体験", text: `買ってから毎日使ってる　それだけで答えは出てる` },
    { type: "体験", text: `最初は半信半疑だった　使って3日で確信した` },
    { type: "体験", text: `見た目で選んで　機能で確信した` },
    { type: "共感", text: `${cat}選びで5分以上迷ったことある？` },
    { type: "共感", text: `毎朝同じ悩みを繰り返してた` },
    { type: "共感", text: `なんでもっと早く気づかなかったんだろ` },
    { type: "共感", text: `これ知らなかった人絶対損してる` },
    { type: "共感", text: `同じ失敗をしてほしくないから言う` },
    { type: "チェック", text: `${nick}を買う前に確認しろ　後悔するパターンがある` },
    { type: "チェック", text: `買う前に3つだけ確認して` },
    { type: "チェック", text: `向いてない人の特徴を先に言う` },
    { type: "NG", text: `${nick}で後悔した話` },
    { type: "NG", text: `ここだけは失敗した　正直に言う` },
  ];
}

// ─── Formats ─────────────────────────────────────────────────────────────────

export const FORMATS = [
  { id: "story",   label: "体験談",         icon: "◉", desc: "before→露見→気づき→結論。B型の基本。フォロワーが増えやすい。" },
  { id: "check",   label: "チェックリスト", icon: "☑", desc: "確認項目3つ。保存されやすい。C型。資産になる。" },
  { id: "compare", label: "比較",           icon: "⇄", desc: "before/after。2択の提示。購買意欲が上がる。" },
  { id: "fail",    label: "失敗談",         icon: "✕", desc: "後悔から入る。共感を生む。エンゲージが高い。" },
  { id: "rank",    label: "ランキング",     icon: "★", desc: "順位形式。3〜5項目。保存されやすい。" },
  { id: "qa",      label: "Q&A",            icon: "?", desc: "よくある疑問に答える。初心者に届く。" },
];

// ─── Templates ───────────────────────────────────────────────────────────────

export const TEMPLATES = [
  { id: "viral",    label: "バズ狙い",     icon: "▲", format: "story",   hookType: "逆張り",  desc: "B型逆張り。フォロワーが増えやすい。006-B型。" },
  { id: "saves",    label: "保存狙い",     icon: "◈", format: "check",   hookType: "チェック", desc: "チェックリスト構成。長期資産になる。" },
  { id: "failure",  label: "失敗談",       icon: "✕", format: "fail",    hookType: "NG",      desc: "共感から入る。エンゲージメントが高い。" },
  { id: "review",   label: "正直レビュー", icon: "★", format: "story",   hookType: "体験",    desc: "使用後の正直レビュー。信頼が上がる。" },
  { id: "compare",  label: "比較",         icon: "⇄", format: "compare", hookType: "共感",    desc: "before/after。購買意欲を上げる。" },
  { id: "beginner", label: "初心者向け",   icon: "○", format: "qa",      hookType: "共感",    desc: "基礎から。幅広い層に届く。" },
];

// ─── Slide Generation ────────────────────────────────────────────────────────

export function generateAllSlides(item, hook, format, mode) {
  return [
    { role: "フック（1枚目）", type: "hook",  options: genS1(item, hook, mode) },
    { role: "before（2枚目）", type: "text",  options: genS2(item, mode) },
    { role: "露見シーン（3枚目）", type: "text", options: genS3(item, mode) },
    { role: "認定理由（4枚目）", type: "text", options: genS4(item, mode) },
    { role: "向いていない人（5枚目）", type: "text", options: genS5(item, mode) },
    { role: "結論（6枚目）", type: "text", options: genS6(item, mode) },
  ];
}

function genS1(item, hook, mode) {
  const parts = (hook || "").split(/[\s　]+/);
  const s = item.stock || {};
  const cat = getCatWord(item);
  const nick = getNick(item);

  const base = [
    { sub: parts[0] || cat + "を", main: (parts[1] || "まだ選んでいるか").slice(0, 10), note: parts.slice(2).join("") || "俺は1年前に決断した" },
    { sub: cat + "で", main: "迷ってる人へ", note: "1年使った俺が正直に言う" },
    { sub: "まだ", main: "損してるかも", note: "これ知らずに後悔してほしくない" },
    { sub: s.situation?.slice(0, 8) || "買う前に", main: "見てほしい", note: "後悔するパターンがある" },
  ];

  if (mode === "口語") return base.map(o => ({ ...o, note: o.note.replace(/ください/g, "").replace(/ます/g, "る") }));
  if (mode === "短く") return base.map(o => ({ ...o, note: o.note.split("　")[0] }));
  return base;
}

function genS2(item, mode) {
  const s = item.stock || {};
  const cat = getCatWord(item);
  const sit = s.situation || `普通の${cat}を使っていた`;

  const base = [
    { text: `${sit}。それが当たり前だと思っていた。` },
    { text: `毎日小さなストレスがあった。でも慣れていた。` },
    { text: `${sit.slice(0, 30)}。気にしないようにしていた。` },
    { text: `前の${cat}でも困ってはいなかった。ただ何かが足りなかった。` },
  ];

  return applyModeToOptions(base, mode);
}

function genS3(item, mode) {
  const s = item.stock || {};
  const cat = getCatWord(item);
  const rev = s.reveal || `以前の${cat}に戻ったとき気づいた`;

  const base = [
    { text: `${rev}。俺の中の当たり前が変わっていた。` },
    { text: `1ヶ月後。元に戻れなくなっていた。` },
    { text: `${s.change || "気づいたら毎日使っていた"}。それだけで答えは出ていた。` },
    { text: `以前の${cat}を使おうとして気づいた。${rev.slice(0, 20)}。` },
  ];

  return applyModeToOptions(base, mode);
}

function genS4(item, mode) {
  const s = item.stock || {};
  const good = s.good || "使って初めて分かる良さがある";

  const base = [
    { text: `${item.label}　${item.score}点。${good.slice(0, 40)}。` },
    { text: `正直に言う。${good.slice(0, 50) || "これは良かった。毎日使うものだから。"}` },
    { text: `認定理由は一つだけ。${(s.change || good).slice(0, 40)}。` },
    { text: `${item.score}点の理由。${good.slice(0, 50)}。向いている人には刺さる。` },
  ];

  return applyModeToOptions(base, mode);
}

function genS5(item, mode) {
  const s = item.stock || {};
  const ng1 = s.ng1 || "こだわりが強い人には向かない";
  const ng2 = s.ng2 || "使用頻度が低い人には不要";

  const base = [
    { text: `向いていない人を先に言う。${ng1}。${ng2}。` },
    { text: `買って後悔するパターン。${ng1}。これが当てはまるなら別を選べ。` },
    { text: `正直に言う。${ng1}。${ng2}。2つ当てはまる人は買わなくていい。` },
    { text: `買う前に確認。${ng1}。クリアできる人だけ買え。` },
  ];

  return applyModeToOptions(base, mode);
}

function genS6(item, mode) {
  const s = item.stock || {};
  const cat = getCatWord(item);
  const conc = s.conclusion || `${cat}で迷いたくない人だけ買え`;

  const base = [
    { text: `${conc}。保存して次の装備はプロフィールから。` },
    { text: `答えは決まっている。${conc}。` },
    { text: `迷ってる時間が一番もったいない。${conc}。` },
    { text: `俺の結論はこれだけ。${conc}。` },
  ];

  return applyModeToOptions(base, mode);
}

function applyModeToOptions(options, mode) {
  if (!mode) return options;
  return options.map(o => {
    let t = o.text || "";
    if (mode === "口語")    t = t.replace(/です/g, "だ").replace(/ます。/g, "る。").replace(/ました。/g, "た。").replace(/ません/g, "ない");
    if (mode === "短く")    t = t.split("。")[0] + "。";
    if (mode === "感情")    t = t.replace(/。$/, "") + "。マジでそう思う。";
    if (mode === "論理")    t = "理由はシンプル。" + t;
    if (mode === "upgear")  t = t.replace(/。$/, "") + "。向いていない人は別を選べ。";
    if (mode === "テンポ")  t = t.replace(/、/g, "。").split("。").filter(Boolean).slice(0, 2).join("。") + "。";
    return { ...o, text: t };
  });
}

// ─── Caption & Hashtag ───────────────────────────────────────────────────────

export function generateCaption(item, hook) {
  const s = item.stock || {};
  const cat = getCatWord(item);
  const conc = s.conclusion || `${cat}で迷いたくない人だけ買え`;

  return [
    `${hook}\n\n${conc}\n\nプロフィールのリンクから詳細をチェック`,
    `${(s.situation || "").slice(0, 30) || "毎日使うものだから"}\nだから${getNick(item)}を選んだ\n\n向いてない人→${(s.ng1 || "こだわりが強い人").slice(0, 20)}\n\n保存して次の投稿も見て`,
    `正直に言う。${getNick(item)}は${item.score}点。\n\n${(s.good || "使って初めて分かる良さがある").slice(0, 40)}\n\n${conc}`,
  ];
}

export function generateHashtags(item) {
  const catTags = {
    GEAR: ["#ガジェット", "#デスク環境", "#仕事効率化", "#テレワーク", "#ガジェット好き", "#ガジェットオタク"],
    SHOES: ["#靴", "#スニーカー", "#通勤コーデ", "#靴好き", "#メンズファッション", "#スニーカーコーデ"],
    WEAR: ["#服", "#メンズコーデ", "#ミニマリスト", "#シンプルコーデ", "#ファッション", "#ミニマルライフ"],
  };
  const base = ["#UpGear", "#装備", "#おすすめ", "#購入品", "#レビュー", "#TikTok"];
  return [...base, ...(catTags[item.category] || [])].join(" ");
}

// ─── Quality Score ────────────────────────────────────────────────────────────

export function scoreQuality(slides, hook) {
  const texts = slides.map(s => {
    const opt = s.options[s.selected || 0];
    if (!opt) return "";
    return opt.text || `${opt.sub || ""} ${opt.main || ""} ${opt.note || ""}`;
  });
  const allText = [hook, ...texts].join(" ");

  // 口語の自然さ (25点)
  const formal = ["です。", "ます。", "ございます", "いたします", "非常に", "大変", "しかしながら", "また、", "さらに、", "それに加え"];
  const formalHits = formal.filter(w => allText.includes(w)).length;
  const colloquial = Math.max(0, 25 - formalHits * 4);

  // フックの強さ (20点)
  const hookScore = (
    (hook.includes("俺") ? 5 : 0) +
    ((hook.includes("か") || hook.includes("？")) ? 5 : 0) +
    (hook.length < 30 ? 5 : 2) +
    (hook.split(/[\s　]/).length >= 2 ? 5 : 0)
  );

  // UpGearらしさ (20点)
  const upgearWords = ["だけ買え", "向いていない", "俺", "確認", "判断", "迷わ", "装備", "認定"];
  const upgear = Math.min(20, upgearWords.filter(w => allText.includes(w)).length * 4);

  // 感情量 (15点)
  const emotionWords = ["気づいた", "後悔", "正直", "変わった", "戻れない", "損", "驚", "まじ", "マジ", "手放せない"];
  const emotion = Math.min(15, emotionWords.filter(w => allText.includes(w)).length * 3);

  // 保存されやすさ (10点)
  const saveWords = ["確認", "チェック", "前に", "保存", "リスト", "知りたかった"];
  const saves = Math.min(10, saveWords.filter(w => allText.includes(w)).length * 3);

  // 読みやすさ (10点)
  const avgLen = texts.reduce((a, t) => a + t.length, 0) / (texts.length || 1);
  const readability = (avgLen > 15 && avgLen < 90) ? 10 : (avgLen < 15 ? 5 : 7);

  // AIっぽさペナルティ
  const aiWords = ["この商品は", "非常に便利", "購入しました", "満足しています", "おすすめです", "是非ご検討"];
  const aiPenalty = aiWords.filter(w => allText.includes(w)).length * 5;

  const total = Math.max(0, Math.min(100, colloquial + hookScore + upgear + emotion + saves + readability - aiPenalty));

  const improvements = [];
  if (colloquial < 18) improvements.push("「です」「ます」を減らして口語にしましょう");
  if (hookScore < 12)  improvements.push("フックに「俺」を入れて一人称にしましょう");
  if (upgear < 12)     improvements.push("「〇〇の人だけ買え」の断定結論を明確にしましょう");
  if (emotion < 8)     improvements.push("「気づいた」「後悔」など感情ワードを追加しましょう");
  if (saves < 6)       improvements.push("「確認」「保存」など保存動機ワードを入れましょう");
  if (aiPenalty > 0)   improvements.push("AI特有の固い表現を口語に言い換えましょう");

  return {
    total,
    breakdown: {
      "口語の自然さ":       { score: colloquial,  max: 25 },
      "フックの強さ":       { score: hookScore,   max: 20 },
      "UpGearらしさ":       { score: upgear,      max: 20 },
      "感情量":             { score: emotion,      max: 15 },
      "保存されやすさ":     { score: saves,        max: 10 },
      "読みやすさ":         { score: readability,  max: 10 },
    },
    aiPenalty,
    improvements,
  };
}

// ─── Performance Analysis ─────────────────────────────────────────────────────

export function analyzePerformance({ views, likes, saves, comments, follows, hook }) {
  const v = Number(views) || 0;
  const l = Number(likes) || 0;
  const s = Number(saves) || 0;
  const f = Number(follows) || 0;
  const likeR = v > 0 ? ((l / v) * 100).toFixed(2) : 0;
  const saveR = v > 0 ? ((s / v) * 100).toFixed(2) : 0;

  const reasons = [];
  const improvements = [];
  const nextTips = [];

  if (likeR >= 3)    reasons.push(`いいね率${likeR}%は高水準。フックと内容が刺さった。`);
  else               improvements.push(`いいね率${likeR}%は改善余地あり。フックの一人称化を試みよう。`);

  if (s >= 10)       reasons.push(`保存${s}件は資産コンテンツの証拠。チェックリスト型が効いた。`);
  else if (s > 0)    improvements.push(`保存${s}件。「確認」ワードを増やすと保存が増える。`);
  else               improvements.push(`保存0件。C型（チェックリスト）構成で保存を狙う投稿を追加しよう。`);

  if (f > 0)         reasons.push(`フォロー+${f}。B型逆張りフックが機能している。`);
  else               nextTips.push(`フォローがつかない場合はB型（逆張り）フックを強化しよう。`);

  if (v >= 10000) {
    reasons.push(`${v.toLocaleString()}再生は大バズ。アルゴリズムが外部配信を開始した証拠。`);
    nextTips.push(`このフック構造を次回に転用しよう。`);
  } else if (v >= 3000) {
    reasons.push(`${v.toLocaleString()}再生は好調。テーマの当事者が広かった可能性。`);
    nextTips.push(`同じテーマで別のアングルを試してみよう。`);
  } else {
    improvements.push(`${v.toLocaleString()}再生は低め。フックの当事者の広さを確認しよう。`);
    nextTips.push(`次回は「全デスクワーカー」が当事者になれるテーマを選ぼう。`);
  }

  nextTips.push(`${likeR >= 3 ? "このフックパターン" : "B型逆張りフック"}を次のシリーズで試してみよう。`);

  return { likeRate: likeR, saveRate: saveR, reasons, improvements, nextTips };
}

// ─── Regeneration Modes ───────────────────────────────────────────────────────

export const REGEN_MODES = [
  { id: "口語",   label: "もっと口語に",         desc: "「です」「ます」をなくす" },
  { id: "短く",   label: "もっと短く",           desc: "一文に圧縮" },
  { id: "感情",   label: "もっと感情的に",       desc: "感情ワードを追加" },
  { id: "論理",   label: "もっと論理的に",       desc: "理由から入る構成に" },
  { id: "テンポ", label: "もっとテンポよく",     desc: "短文の連打に" },
  { id: "upgear", label: "もっとUpGearらしく",   desc: "断定・フィルタ型に" },
];

// ─── Utilities ───────────────────────────────────────────────────────────────

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
