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

function resolveMarketKey(category) {
  if (MARKET[category]) return category;
  const map = { ガジェット: "GEAR", バッグ: "GEAR", アパレル: "WEAR", デスク環境: "GEAR", EDC: "GEAR", トラベル: "GEAR" };
  return map[category] || "GEAR";
}

export function getMarketResearch(category) {
  return MARKET[resolveMarketKey(category)];
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
    `コスパで考えたら答えは決まってた`,
    `毎日使って初めて分かること`,
    `買う前に5分だけ見て`,
    `${nick}で変わった1つのこと`,
    `失敗しない${cat}選びの基準`,
    `普通の${cat}をやめた日から変わったこと`,
  ];
}

// ─── Hook Generation ─────────────────────────────────────────────────────────

export function generateHooks(item) {
  const nick = getNick(item);
  const cat = getCatWord(item);
  const price = item.price ? `¥${Number(item.price).toLocaleString()}` : "1万円";

  return [
    { type: "逆張り", text: `${nick}をまだ選んでいるか　俺は1年前に決断した` },
    { type: "逆張り", text: `まだ普通の${cat}使ってるの？` },
    { type: "逆張り", text: `${nick}　買わなくていい人がいる` },
    { type: "逆張り", text: `正直いらんと思ってた　でも今は毎日使ってる` },
    { type: "逆張り", text: `${cat}に${price}出す前に見て` },
    { type: "体験",   text: `${nick}を半年使って正直に言う` },
    { type: "体験",   text: `買ってから毎日使ってる　それだけで答えは出てる` },
    { type: "体験",   text: `最初は半信半疑だった　使って3日で確信した` },
    { type: "体験",   text: `1年前の俺に教えてやりたい` },
    { type: "体験",   text: `元に戻れなくなった話をする` },
    { type: "共感",   text: `${cat}選びで5分以上迷ったことある？` },
    { type: "共感",   text: `なんでもっと早く気づかなかったんだろ` },
    { type: "共感",   text: `同じ失敗をしてほしくないから言う` },
    { type: "共感",   text: `安物を買って後悔したことある？　俺はある` },
    { type: "チェック", text: `${nick}を買う前に確認しろ　後悔するパターンがある` },
    { type: "チェック", text: `買う前に3つだけ確認して` },
    { type: "NG",     text: `${nick}で後悔した話` },
    { type: "NG",     text: `ここだけは失敗した　正直に言う` },
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
  const cat = getCatWord(item);
  const nick = getNick(item);

  const base = [
    { sub: parts[0] || cat + "を", main: (parts[1] || "まだ選んでいるか").slice(0, 10), note: parts.slice(2).join("") || "俺は1年前に決断した" },
    { sub: cat + "で", main: "迷ってる人へ", note: "1年使った俺が正直に言う" },
    { sub: "まだ", main: "損してるかも", note: "これ知らずに後悔してほしくない" },
    { sub: "買う前に", main: "見てほしい", note: "後悔するパターンがある" },
  ];

  if (mode === "口語") return base.map(o => ({ ...o, note: o.note.replace(/ください/g, "").replace(/ます/g, "る") }));
  if (mode === "短く") return base.map(o => ({ ...o, note: o.note.split("　")[0] }));
  return base;
}

function genS2(item, mode) {
  const cat = getCatWord(item);

  const base = [
    { text: `普通の${cat}を使っていた。それが当たり前だと思っていた。` },
    { text: `毎日小さなストレスがあった。でも慣れていた。` },
    { text: `普通の${cat}で十分だと思っていた。気にしないようにしていた。` },
    { text: `前の${cat}でも困ってはいなかった。ただ何かが足りなかった。` },
  ];

  return applyModeToOptions(base, mode);
}

function genS3(item, mode) {
  const cat = getCatWord(item);

  const base = [
    { text: `以前の${cat}に戻ったとき気づいた。俺の中の当たり前が変わっていた。` },
    { text: `1ヶ月後。元に戻れなくなっていた。` },
    { text: `気づいたら毎日使っていた。それだけで答えは出ていた。` },
    { text: `以前の${cat}を使おうとして気づいた。もう戻れなかった。` },
  ];

  return applyModeToOptions(base, mode);
}

function genS4(item, mode) {
  const cat = getCatWord(item);
  const good = "使って初めて分かる良さがある";

  const base = [
    { text: `${item.label}　${item.score}点。${good}。` },
    { text: `正直に言う。これは良かった。毎日使うものだから。` },
    { text: `認定理由は一つだけ。気づいたら元に戻れなくなっていた。` },
    { text: `${item.score}点の理由。毎日使うものに妥協しなかったから。向いている人には刺さる。` },
  ];

  return applyModeToOptions(base, mode);
}

function genS5(item, mode) {
  const cat = getCatWord(item);

  const base = [
    { text: `向いていない人を先に言う。こだわりが強すぎる人。使用頻度が低い人。` },
    { text: `買って後悔するパターン。使わない日が多い人。これが当てはまるなら別を選べ。` },
    { text: `正直に言う。毎日使わない人には不要。コスパ最優先の人には合わない。2つ当てはまる人は買わなくていい。` },
    { text: `買う前に確認。毎日使えるか。長期で使えるか。クリアできる人だけ買え。` },
  ];

  return applyModeToOptions(base, mode);
}

function genS6(item, mode) {
  const cat = getCatWord(item);

  const base = [
    { text: `${cat}で迷いたくない人だけ買え。保存して次の装備はプロフィールから。` },
    { text: `答えは決まっている。毎日使える${cat}を選べ。` },
    { text: `迷ってる時間が一番もったいない。${cat}で判断を減らせ。` },
    { text: `俺の結論はこれだけ。毎日使う人なら絶対に元が取れる。` },
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
  const cat = getCatWord(item);
  const nick = getNick(item);
  const hookText = (hook && typeof hook === "object") ? (hook.text || "") : (hook || "");

  return [
    `${hookText}\n\n${cat}で迷いたくない人だけ買え\n\nプロフィールのリンクから詳細をチェック`,
    `毎日使うものだから\nだから${nick}を選んだ\n\n向いてない人→使用頻度が低い人\n\n保存して次の投稿も見て`,
    `正直に言う。${nick}は${item.score}点。\n\n使って初めて分かる良さがある\n\n${cat}で迷いたくない人だけ買え`,
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
    if (!s) return "";
    if (typeof s === "string") return s;
    return s.text || `${s.sub || ""} ${s.main || ""} ${s.note || ""}`;
  });
  const allText = [hook, ...texts].join(" ");

  // 口語の自然さ /20
  const formal = ["です。", "ます。", "ございます", "いたします", "非常に", "大変", "しかしながら", "また、", "さらに、", "それに加え"];
  const formalHits = formal.filter(w => allText.includes(w)).length;
  const colloquial = Math.max(0, 20 - formalHits * 4);

  // フック強度 /20
  const h = hook || "";
  const hookScore = Math.min(20,
    (h.includes("俺") ? 5 : 0) +
    ((h.includes("か") || h.includes("？")) ? 5 : 0) +
    (h.length > 4 && h.length < 30 ? 5 : 2) +
    (h.split(/[\s　]/).length >= 2 ? 5 : 0)
  );

  // 体験密度 /20
  const expWords = ["気づいた", "後悔", "正直", "変わった", "戻れない", "手放せない", "使って", "体感", "気づき", "before"];
  const experience = Math.min(20, expWords.filter(w => allText.includes(w)).length * 4);

  // 断定力 /20
  const upgearWords = ["だけ買え", "向いていない", "俺", "確認", "迷わ", "装備", "認定", "答えは決まって"];
  const assertion = Math.min(20, upgearWords.filter(w => allText.includes(w)).length * 4);

  // UpGear思想 /10
  const philWords = ["SD", "判断", "Silent", "装備", "認定", "フィルタ"];
  const philosophy = Math.min(10, philWords.filter(w => allText.includes(w)).length * 4);

  // CTA力 /10
  const ctaWords = ["保存", "プロフィール", "次の投稿", "確認", "チェック", "リスト"];
  const cta = Math.min(10, ctaWords.filter(w => allText.includes(w)).length * 3);

  // AIっぽさペナルティ
  const aiWords = ["この商品は", "非常に便利", "購入しました", "満足しています", "おすすめです", "是非ご検討"];
  const aiPenalty = aiWords.filter(w => allText.includes(w)).length * 5;

  const total = Math.max(0, Math.min(100, colloquial + hookScore + experience + assertion + philosophy + cta - aiPenalty));

  const improvements = [];
  if (colloquial < 14) improvements.push("「です」「ます」を減らして口語にしましょう");
  if (hookScore < 12)  improvements.push("フックに「俺」を入れて一人称にしましょう");
  if (assertion < 12)  improvements.push("「〇〇の人だけ買え」の断定結論を明確にしましょう");
  if (experience < 10) improvements.push("「気づいた」「後悔」など体験ワードを追加しましょう");
  if (cta < 5)         improvements.push("「確認」「保存」などCTAワードを入れましょう");
  if (aiPenalty > 0)   improvements.push("AI特有の固い表現を口語に言い換えましょう");

  return {
    total,
    breakdown: { colloquial, hook: hookScore, experience, assertion, philosophy, cta },
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

// ─── SNS Marketing Analysis ──────────────────────────────────────────────────

export function analyzeSNSPotential(item, hook, format) {
  const hookText = (hook && typeof hook === "object") ? (hook.text || "") : (hook || "");
  const hookType = (hook && typeof hook === "object") ? (hook.type || "") : "";

  // 当事者の広さ (0-30): 誰が対象か
  const audienceMap = { GEAR: 30, SHOES: 20, WEAR: 18 };
  const audience = audienceMap[item.category] ?? 20;
  const audienceLabel = audience >= 28 ? "デスクワーカー全員" : audience >= 20 ? "通勤・外出者" : "ファッション関心層";

  // バズ型スコア (0-25): B型逆張り、フック強度
  const isReverse = hookType === "逆張り" || hookText.includes("まだ") || hookText.includes("なぜ") || hookText.includes("やめた");
  const hasIchi = hookText.includes("俺") || hookText.includes("俺が");
  const isQuestion = hookText.includes("か") && hookText.length < 30;
  const buzzScore = Math.min(25,
    (isReverse ? 10 : 0) + (hasIchi ? 8 : 0) + (isQuestion ? 7 : 0)
  );

  // 保存型スコア (0-20): C型チェックリスト
  const saveFormats = ["check", "rank", "compare"];
  const hasSaveFormat = saveFormats.includes(format);
  const saveScore = Math.min(20, (hasSaveFormat ? 16 : 4));

  // TikTok適合度 (0-15): フォーマット・フックの組み合わせ
  const tiktokScore = Math.min(15,
    (hookText.length > 8 && hookText.length < 35 ? 6 : 2) +
    (format === "story" || format === "fail" ? 5 : 3) + 4
  );

  const total = audience + buzzScore + saveScore + tiktokScore;

  // 推定リーチ予測
  let reachRange = "";
  if (total >= 75)      reachRange = "5,000〜30,000再生";
  else if (total >= 60) reachRange = "1,500〜8,000再生";
  else if (total >= 45) reachRange = "500〜3,000再生";
  else                  reachRange = "〜1,000再生";

  // 型判定
  const postType = buzzScore >= 18 ? "B型（バズ狙い）" : saveScore >= 14 ? "C型（保存狙い）" : "A型（教育型）";

  // 課題と改善提案
  const issues = [];
  if (audience < 20)  issues.push({ dim: "当事者の広さ", tip: "GEARカテゴリは当事者が最も広い。テーマを「全デスクワーカー」が当事者になる視点に広げよう。" });
  if (buzzScore < 15) issues.push({ dim: "バズ型フック", tip: "「まだ〇〇してるの？」「俺は〜した」の逆張り一人称フックに変えるとB型になる。" });
  if (saveScore < 10) issues.push({ dim: "保存されやすさ", tip: "チェックリスト型（C型）やNG提示を追加すると保存率が上がる。" });

  return {
    total,
    breakdown: { audience, buzz: buzzScore, saves: saveScore, tiktok: tiktokScore },
    audienceLabel,
    reachRange,
    postType,
    issues,
  };
}

// ─── Archetype-based Slide Generation ────────────────────────────────────────

export function generateSlidesByArchetypes(item, recommendations, mode) {
  const [buzz, save, follow] = recommendations;
  if (!buzz || !save || !follow) return generateAllSlides(item, "", FORMATS[0].id, mode);

  const cat = getCatWord(item);
  const nick = getNick(item);

  // S1: フック (sub/main/note)
  const s1 = [
    {
      archetype: buzz.archetype, archetypeColor: buzz.color,
      sub: "まだ普通の" + cat + "使ってるの？",
      main: buzz.hook.text.split(/[\s　]+/).slice(0, 2).join("") || "俺は決断した",
      note: "1年前の俺に見せたかった話",
    },
    {
      archetype: save.archetype, archetypeColor: save.color,
      sub: "買う前に確認",
      main: "後悔ゼロの選び方",
      note: "この3点だけ押さえればいい",
    },
    {
      archetype: follow.archetype, archetypeColor: follow.color,
      sub: "正直に言う",
      main: follow.hook.text.split(/[\s　]+/).slice(0, 2).join("") || "半年使った話",
      note: "体験ベースでレビューする",
    },
  ];

  // S2: before
  const s2 = applyModeToOptions([
    { archetype: buzz.archetype, archetypeColor: buzz.color, text: `普通の${cat}で毎日消耗していた。気づいてなかった。それが当たり前だと思っていた。` },
    { archetype: save.archetype, archetypeColor: save.color, text: `${cat}を選ぶときに何を確認すべきか分からなかった。情報が多すぎて判断できなかった。` },
    { archetype: follow.archetype, archetypeColor: follow.color, text: `最初は半信半疑だった。普通の${cat}から変える理由が見つからなかった。` },
  ], mode);

  // S3: 露見シーン
  const s3 = applyModeToOptions([
    { archetype: buzz.archetype, archetypeColor: buzz.color, text: `1週間後。元に戻れなくなっていた。当たり前が変わっていた。` },
    { archetype: save.archetype, archetypeColor: save.color, text: `使い始めて気づいた。3つのポイントで全ての問題が解決していた。` },
    { archetype: follow.archetype, archetypeColor: follow.color, text: `使って3日。気づいたら毎日使っていた。体感で分かった。` },
  ], mode);

  // S4: 認定理由
  const s4 = applyModeToOptions([
    { archetype: buzz.archetype, archetypeColor: buzz.color, text: `${item.label}　${item.score}点。理由はシンプル。${buzz.theme.text}。これだけでいい。` },
    { archetype: save.archetype, archetypeColor: save.color, text: `認定${item.score}点の理由。①使いやすさ ②長期コスパ ③${cat}選びの基準をクリア。` },
    { archetype: follow.archetype, archetypeColor: follow.color, text: `正直に言う。使って初めて分かる良さがある。俺の体験ベースで${item.score}点。` },
  ], mode);

  // S5: 向いていない人
  const s5 = applyModeToOptions([
    { archetype: buzz.archetype, archetypeColor: buzz.color, text: `向いていない人を先に言う。こだわりが強すぎる人。これが当てはまるなら別を選べ。` },
    { archetype: save.archetype, archetypeColor: save.color, text: `買う前チェックリスト。✕ 使用頻度が低い ✕ とにかく安さ優先。2つ当てはまる人は不要。` },
    { archetype: follow.archetype, archetypeColor: follow.color, text: `俺も最初は向いていないと思ってた。でも使って変わった。ただし頻度が低い人には不要。` },
  ], mode);

  // S6: 結論
  const s6 = applyModeToOptions([
    { archetype: buzz.archetype, archetypeColor: buzz.color, text: `${buzz.theme.text}。迷ってる時間が一番もったいない。フォローして次の装備も確認して。` },
    { archetype: save.archetype, archetypeColor: save.color, text: `保存して次に使って。${cat}で迷いたくない人だけ買え。リストはプロフィールから。` },
    { archetype: follow.archetype, archetypeColor: follow.color, text: `俺の結論。${follow.theme.text}。体験した人間が言うから信じていい。` },
  ], mode);

  return [
    { role: "フック（1枚目）", type: "hook", options: s1 },
    { role: "before（2枚目）", type: "text", options: s2 },
    { role: "露見シーン（3枚目）", type: "text", options: s3 },
    { role: "認定理由（4枚目）", type: "text", options: s4 },
    { role: "向いていない人（5枚目）", type: "text", options: s5 },
    { role: "結論（6枚目）", type: "text", options: s6 },
  ];
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
  const cat = item.mainCategory || item.category || "";
  const map = { GEAR: "ガジェット", SHOES: "靴", WEAR: "服", ガジェット: "ガジェット", バッグ: "バッグ", アパレル: "服", デスク環境: "デスクアイテム", EDC: "EDCギア", トラベル: "トラベルグッズ" };
  return map[cat] || item.subCategory || "アイテム";
}
