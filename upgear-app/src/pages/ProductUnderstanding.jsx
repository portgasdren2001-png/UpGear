import { useState, useEffect, useCallback } from "react";
import { Btn } from "../components/ui";

// ─── ChatGPT プロンプトテンプレート ───────────────────────────────────────────

function buildPromptTemplate(item, u) {
  const name        = u?.name        || item?.label         || "";
  const officialUrl = u?.officialUrl || item?.urls?.official || "";
  const salesUrl    = u?.salesUrl    || item?.urls?.rakuten  || "";

  return `ＵＰＧＥＡＲ 商品理解エージェント

あなたの役割

あなたは「ＵＰＧＥＡＲ」の専属商品リサーチャー兼編集者です。

目的は商品の説明ではありません。

目的は「この商品をＵＰＧＥＡＲで紹介する価値があるか」を判断し、その後のTikTok・ReadyAI・レビュー分析・比較記事まで使える商品データベースを作ることです。

商品ごとの差を重視してください。
テンプレートのような文章は禁止です。
商品固有の特徴・メリット・弱点・購入理由を深く分析してください。

==============================
【入力】
==============================

商品名：${name}
メーカー公式URL：${officialUrl}
販売ページURL：${salesUrl}

不足情報があれば補完してください。

==============================
【調査内容と出力】
==============================

# 【基本情報】

- 商品名
- ブランド
- カテゴリ
- 型番
- 発売日
- 価格
- JANコード
- 商品画像URL
- 公式URL
- 販売URL

# 【商品理解】

商品の特徴を並べるだけではなく、「なぜその機能が必要なのか」まで説明してください。

- 商品概要
- 解決する悩み
- この商品が存在する理由
- 主な機能
- 強み
- 弱み
- 向いている人
- 向いていない人
- 使用シーン
- 購入理由
- 比較される商品
- 競合商品
- 購入前に悩まれるポイント
- よくある質問（FAQ）

# 【レビュー分析】

複数のレビューを分析し、件数ではなく傾向をまとめてください。個別レビューをそのまま転載しないこと。

- 高評価で多い意見
- 低評価で多い意見
- 長期使用レビュー
- 耐久性
- バッテリー評価（該当商品のみ）
- 品質
- 初期不良傾向
- サポート評価
- レビュー総評

# 【競合分析】

競合商品と比較して整理してください。

- この商品を選ぶ理由
- 他を選ぶ理由
- 勝っている点
- 負けている点

# 【UPGEAR評価】

以下5項目を20点満点で採点し、合計100点で評価してください。
点数だけではなく「なぜその点数なのか」を必ず説明してください。

- 装備性
- 判断削減力
- 継続運用性
- ミスマッチ明確性
- 代替不可能性
- 総合点（100点満点）
- 認定判定（認定／条件付き認定／非認定）
- 評価理由
- 一言まとめ

# 【TikTok分析】

- 一番刺さる悩み
- 一番強い訴求ポイント
- 投稿フック（5案）
- 避ける表現
- 保存されやすいポイント
- 比較すると面白い商品
- 検索キーワード
- ハッシュタグ候補

# 【ReadyAI掲載用】

- 150文字要約
- 300文字要約
- SEOキーワード
- メタディスクリプション

# 【編集長コメント】

一般論ではなく、この商品の特徴を踏まえた具体的な判断を行ってください。

- ＵＰＧＥＡＲ編集長コメント
  （紹介する価値があるか／どんな人に刺さるか／TikTokで伸びそうか／アフィリエイト向きか／長期的に紹介し続けられるか／最適な切り口）

# 【AI用】

- 情報源（調査したサイト一覧）
- 推定事項
- 情報不足

==============================
【重要ルール】
==============================

- 商品ごとの差別化を最優先する。
- テンプレート的な文章は禁止。
- 推測と事実を明確に区別し、推測は「推定」と明記する。
- 情報不足の項目は「情報未確認」と明記する。
- レビューは傾向を要約し、個別レビューをそのまま転載しない。
- 必要に応じて追加調査を行い、情報を統合する。
- 出力は必ず上記の構成・順番・項目名を守ること（アプリが自動仕分けするため）。
- 長くなる場合は「Part1」「Part2」…と分割して最後まで出力すること。`;
}

// ─── Field definitions ────────────────────────────────────────────────────────

const SECTIONS = [
  {
    id: "basic",
    label: "基本情報",
    color: "#6fa8dc",
    fields: [
      { key: "name",        label: "商品名",       type: "text" },
      { key: "brand",       label: "ブランド",      type: "text" },
      { key: "category",    label: "カテゴリ",      type: "text" },
      { key: "modelNumber", label: "型番",          type: "text" },
      { key: "releaseDate", label: "発売日",        type: "text" },
      { key: "price",       label: "価格",          type: "text" },
      { key: "officialUrl", label: "公式URL",       type: "url"  },
      { key: "salesUrl",    label: "販売URL",       type: "url"  },
      { key: "imageUrl",    label: "商品画像URL",   type: "url"  },
      { key: "janCode",     label: "JANコード",     type: "text" },
    ],
  },
  {
    id: "understanding",
    label: "商品理解",
    color: "var(--accent)",
    fields: [
      { key: "overview",        label: "商品概要",              type: "textarea", rows: 3 },
      { key: "problemSolved",   label: "解決する悩み",          type: "textarea", rows: 3 },
      { key: "existReason",     label: "この商品が存在する理由", type: "textarea", rows: 2 },
      { key: "features",        label: "主な機能",              type: "textarea", rows: 3 },
      { key: "strengths",       label: "強み",                  type: "textarea", rows: 3 },
      { key: "weaknesses",      label: "弱み",                  type: "textarea", rows: 3 },
      { key: "forWho",          label: "向いている人",          type: "textarea", rows: 2 },
      { key: "notForWho",       label: "向いていない人",        type: "textarea", rows: 2 },
      { key: "useScenes",       label: "使用シーン",            type: "textarea", rows: 2 },
      { key: "buyReason",       label: "購入理由（なぜ選ばれるか）", type: "textarea", rows: 2 },
      { key: "comparedProducts",label: "比較される商品",        type: "textarea", rows: 2 },
      { key: "competitors",     label: "競合商品",              type: "textarea", rows: 2 },
      { key: "buyingConcerns",  label: "購入前に悩まれるポイント", type: "textarea", rows: 2 },
      { key: "faq",             label: "よくある質問（FAQ）",   type: "textarea", rows: 4 },
    ],
  },
  {
    id: "review",
    label: "レビュー分析",
    color: "#e06c75",
    fields: [
      { key: "rakutenReview",   label: "楽天レビュー要約",     type: "textarea", rows: 3 },
      { key: "amazonReview",    label: "Amazonレビュー要約",   type: "textarea", rows: 3 },
      { key: "positiveReviews", label: "高評価で多い意見",     type: "textarea", rows: 3 },
      { key: "negativeReviews", label: "低評価で多い意見",     type: "textarea", rows: 3 },
      { key: "longTermReview",  label: "長期使用レビュー",     type: "textarea", rows: 2 },
      { key: "batteryEval",     label: "バッテリー評価",       type: "textarea", rows: 2 },
      { key: "durability",      label: "耐久性",               type: "textarea", rows: 2 },
      { key: "consumableCost",  label: "替刃・消耗品コスト",   type: "textarea", rows: 2 },
      { key: "skinTypeEval",    label: "肌質別評価",           type: "textarea", rows: 2 },
      { key: "qualityEval",     label: "品質",                 type: "textarea", rows: 2 },
      { key: "initialDefects",  label: "初期不良傾向",         type: "textarea", rows: 2 },
      { key: "supportEval",     label: "サポート評価",         type: "textarea", rows: 2 },
      { key: "reviewSummary",   label: "レビュー総評",         type: "textarea", rows: 3 },
    ],
  },
  {
    id: "market",
    label: "市場分析",
    color: "#56b6c2",
    fields: [
      { key: "tiktokTrends",     label: "TikTokで伸びている訴求", type: "textarea", rows: 3 },
      { key: "tiktokPattern",    label: "TikTok投稿傾向",          type: "textarea", rows: 2 },
      { key: "youtubePattern",   label: "YouTubeレビュー傾向",     type: "textarea", rows: 2 },
      { key: "googleNeeds",      label: "Google検索ニーズ",        type: "textarea", rows: 2 },
      { key: "mensBuyReason",    label: "30〜40代男性の購入理由",  type: "textarea", rows: 2 },
      { key: "notBoughtReason",  label: "買われない理由",          type: "textarea", rows: 2 },
      { key: "differentiation",  label: "差別化ポイント",          type: "textarea", rows: 2 },
      { key: "marketPosition",   label: "市場での立ち位置",        type: "textarea", rows: 2 },
    ],
  },
  {
    id: "competitive",
    label: "競合分析",
    color: "#d19a66",
    fields: [
      { key: "whyChooseThis",  label: "この商品を選ぶ理由", type: "textarea", rows: 3 },
      { key: "whyChooseOther", label: "他を選ぶ理由",       type: "textarea", rows: 3 },
      { key: "winPoints",      label: "勝っている点",       type: "textarea", rows: 2 },
      { key: "losePoints",     label: "負けている点",       type: "textarea", rows: 2 },
    ],
  },
  {
    id: "upgear",
    label: "UPGEAR評価",
    color: "#98c379",
    fields: [
      { key: "gearScore",         label: "装備性（0〜20）",       type: "text" },
      { key: "judgmentReduction", label: "判断削減力（0〜20）",   type: "text" },
      { key: "continuity",        label: "継続運用性（0〜20）",   type: "text" },
      { key: "mismatchClarity",   label: "ミスマッチ明確性（0〜20）", type: "text" },
      { key: "irreplaceability",  label: "代替不可能性（0〜20）", type: "text" },
      { key: "totalScore",        label: "総合点（0〜100）",      type: "text" },
      { key: "certification",     label: "認定判定",              type: "text" },
      { key: "evalReason",        label: "評価理由",              type: "textarea", rows: 3 },
      { key: "oneLiner",          label: "一言まとめ",            type: "textarea", rows: 2 },
    ],
  },
  {
    id: "sns",
    label: "SNS用",
    color: "#e5c07b",
    fields: [
      { key: "topPain",           label: "一番刺さる悩み",           type: "textarea", rows: 2 },
      { key: "topAppeal",         label: "一番強い訴求ポイント",     type: "textarea", rows: 2 },
      { key: "tiktokAngles",      label: "TikTok訴求",              type: "textarea", rows: 3 },
      { key: "hook",              label: "投稿フック（5案）",        type: "textarea", rows: 4 },
      { key: "saveablePoints",    label: "保存されやすいポイント",   type: "textarea", rows: 2 },
      { key: "commentThemes",     label: "コメントが増えそうなテーマ", type: "textarea", rows: 2 },
      { key: "avoidExpressions",  label: "避ける表現",               type: "textarea", rows: 2 },
      { key: "searchKeywords",    label: "検索キーワード",           type: "textarea", rows: 2 },
      { key: "hashtags",          label: "ハッシュタグ候補",         type: "textarea", rows: 2 },
      { key: "funCompare",        label: "比較すると面白い商品",     type: "textarea", rows: 2 },
    ],
  },
  {
    id: "readyai",
    label: "ReadyAI用",
    color: "#61afef",
    fields: [
      { key: "summary150",      label: "150文字要約",         type: "textarea", rows: 3 },
      { key: "summary300",      label: "300文字要約",         type: "textarea", rows: 5 },
      { key: "seoKeywords",     label: "SEOキーワード",       type: "textarea", rows: 2 },
      { key: "metaDescription", label: "メタディスクリプション", type: "textarea", rows: 2 },
    ],
  },
  {
    id: "ai",
    label: "AI用",
    color: "#c678dd",
    fields: [
      { key: "editorComment",     label: "ＵＰＧＥＡＲ編集長コメント", type: "textarea", rows: 5 },
      { key: "chatgptFullText",   label: "ChatGPT分析全文",       type: "textarea", rows: 12, large: true },
      { key: "sources",           label: "情報源（調査サイト一覧）", type: "textarea", rows: 3 },
      { key: "estimations",       label: "推定事項",              type: "textarea", rows: 2 },
      { key: "missingInfo",       label: "情報不足",              type: "textarea", rows: 2 },
      { key: "nextResearch",      label: "次に調査すべき項目",    type: "textarea", rows: 2 },
      { key: "createdAt",         label: "作成日時",              type: "readonly" },
      { key: "updatedAt",         label: "更新日時",              type: "readonly" },
    ],
  },
];

const ALL_KEYS = SECTIONS.flatMap(s => s.fields.map(f => f.key));
const EMPTY_UNDERSTANDING = () => Object.fromEntries(ALL_KEYS.map(k => [k, ""]));

// ─── Pre-fill from existing card data ─────────────────────────────────────────

function prefillFromCard(item) {
  const card = item.card || {};
  const rb   = item.rakuten || card.rakuten || {};
  const arr  = (v) => Array.isArray(v) ? v.join("\n") : (v || "");

  return {
    // 基本情報
    name:              card.name          || item.label        || "",
    brand:             card.brand         || item.brand        || "",
    category:          item.mainCategory  || card.category     || "",
    modelNumber:       card.model         || "",
    releaseDate:       "",
    price:             item.price || (rb.price ? `¥${Number(rb.price).toLocaleString()}` : "") || "",
    officialUrl:       item.urls?.official  || "",
    salesUrl:          item.urls?.rakuten   || rb.url          || "",
    imageUrl:          rb.imageUrl          || card.rakutenImageUrl || "",
    janCode:           "",

    // 商品理解
    overview:          card.whatIsThis    || card.judgmentReducer || "",
    problemSolved:     card.whatItSolves  || arr(card.dailyFrictionReduced) || "",
    features:          arr(card.strengths),
    strengths:         arr(card.strengths),
    weaknesses:        arr(card.weaknesses),
    forWho:            card.forWho        || "",
    notForWho:         arr(card.notForWho),
    useScenes:         arr(card.useScenes),
    buyReason:         "",
    comparedProducts:  "",
    competitors:       card.vsAlternatives || "",
    buyingConcerns:    "",
    faq:               "",

    // レビュー分析
    rakutenReview:     rb.reviewAverage ? `★${rb.reviewAverage}（${rb.reviewCount?.toLocaleString()}件）` : "",
    amazonReview:      "",
    positiveReviews:   arr(card.reviewData?.positive || card.reviewData?.highEval),
    negativeReviews:   arr(card.reviewData?.negative || card.reviewData?.lowEval),
    longTermReview:    card.reviewData?.longTerm || "",
    batteryEval:       "",
    durability:        "",
    consumableCost:    "",
    skinTypeEval:      "",
    reviewSummary:     card.continuityReason || "",

    // 市場分析
    tiktokTrends:      arr(card.tiktokAngles),
    tiktokPattern:     "",
    youtubePattern:    "",
    googleNeeds:       arr(card.searchKeywords),
    mensBuyReason:     card.forWho || "",
    notBoughtReason:   arr(card.notForWho),
    differentiation:   card.vsAlternatives || "",
    marketPosition:    "",

    // UPGEAR評価
    gearScore:         "",
    judgmentReduction: "",
    continuity:        "",
    costPerformance:   "",
    designScore:       "",
    totalScore:        card.upgearScore != null ? String(card.upgearScore) : "",
    evalReason:        card.verdictReason || "",
    oneLiner:          card.productType   || "",

    // SNS用
    tiktokAngles:      arr(card.tiktokAngles),
    hook:              "",
    saveablePoints:    "",
    commentThemes:     "",
    avoidExpressions:  arr(card.avoidExpressions),
    searchKeywords:    arr(card.searchKeywords),
    hashtags:          "",

    // AI用
    chatgptFullText:   "",
    sources:           card.inferenceMethod || "",
    estimations:       "",
    missingInfo:       arr(card.missingFields),
    nextResearch:      "",
    createdAt:         new Date().toLocaleString("ja-JP"),
    updatedAt:         new Date().toLocaleString("ja-JP"),
  };
}

// ─── Copy formatter (保存データ → AI貼り付け用) ───────────────────────────────

function buildCopyText(name, u) {
  const line = (label, val) => val?.trim() ? `${label}：\n${val.trim()}\n` : "";
  const scores = [
    u.gearScore         && `装備性:${u.gearScore}`,
    u.judgmentReduction && `判断削減力:${u.judgmentReduction}`,
    u.continuity        && `継続運用性:${u.continuity}`,
    u.mismatchClarity   && `ミスマッチ明確性:${u.mismatchClarity}`,
    u.irreplaceability  && `代替不可能性:${u.irreplaceability}`,
  ].filter(Boolean).join("　／　");

  return `# 商品理解データ ― ${name || "商品名未設定"}
生成日時：${u.updatedAt || new Date().toLocaleString("ja-JP")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【基本情報】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
商品名：${u.name || ""}
ブランド：${u.brand || ""}
カテゴリ：${u.category || ""}
型番：${u.modelNumber || ""}
発売日：${u.releaseDate || ""}
価格：${u.price || ""}
公式URL：${u.officialUrl || ""}
販売URL：${u.salesUrl || ""}
JANコード：${u.janCode || ""}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【商品理解】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${line("商品概要", u.overview)}${line("解決する悩み", u.problemSolved)}${line("主な機能", u.features)}${line("強み", u.strengths)}${line("弱み", u.weaknesses)}${line("向いている人", u.forWho)}${line("向いていない人", u.notForWho)}${line("使用シーン", u.useScenes)}${line("購入理由", u.buyReason)}${line("比較される商品", u.comparedProducts)}${line("競合商品", u.competitors)}${line("購入前に悩まれるポイント", u.buyingConcerns)}${line("よくある質問", u.faq)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【レビュー分析】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${line("楽天レビュー要約", u.rakutenReview)}${line("Amazonレビュー要約", u.amazonReview)}${line("高評価で多い意見", u.positiveReviews)}${line("低評価で多い意見", u.negativeReviews)}${line("長期使用レビュー", u.longTermReview)}${line("バッテリー評価", u.batteryEval)}${line("耐久性", u.durability)}${line("替刃・消耗品コスト", u.consumableCost)}${line("肌質別評価", u.skinTypeEval)}${line("レビュー総評", u.reviewSummary)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【市場分析】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${line("TikTokで伸びている訴求", u.tiktokTrends)}${line("TikTok投稿傾向", u.tiktokPattern)}${line("YouTubeレビュー傾向", u.youtubePattern)}${line("Google検索ニーズ", u.googleNeeds)}${line("30〜40代男性の購入理由", u.mensBuyReason)}${line("買われない理由", u.notBoughtReason)}${line("差別化ポイント", u.differentiation)}${line("市場での立ち位置", u.marketPosition)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【競合分析】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${line("この商品を選ぶ理由", u.whyChooseThis)}${line("他を選ぶ理由", u.whyChooseOther)}${line("勝っている点", u.winPoints)}${line("負けている点", u.losePoints)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【UPGEAR評価】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${scores}
総合点：${u.totalScore || ""}
認定判定：${u.certification || ""}
${line("評価理由", u.evalReason)}${line("一言まとめ", u.oneLiner)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【SNS用】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${line("TikTok訴求", u.tiktokAngles)}${line("投稿フック（5案）", u.hook)}${line("保存されやすいポイント", u.saveablePoints)}${line("コメントが増えそうなテーマ", u.commentThemes)}${line("避ける表現", u.avoidExpressions)}${line("検索キーワード", u.searchKeywords)}${line("ハッシュタグ候補", u.hashtags)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【ReadyAI掲載用】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${line("150文字要約", u.summary150)}${line("300文字要約", u.summary300)}${line("SEOキーワード", u.seoKeywords)}${line("メタディスクリプション", u.metaDescription)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【編集長コメント】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${u.editorComment || "（未記入）"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【ChatGPT分析全文】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${u.chatgptFullText || "（未記入）"}
`.trim();
}

// ─── Components ───────────────────────────────────────────────────────────────

function SectionHeader({ label, color }) {
  return (
    <div style={{
      fontSize: 10, letterSpacing: "0.2em", color,
      borderLeft: `3px solid ${color}`, paddingLeft: 10,
      marginBottom: 16, marginTop: 4,
    }}>
      {label}
    </div>
  );
}

function FieldRow({ field, value, onChange }) {
  const isUrl      = field.type === "url";
  const isReadonly = field.type === "readonly";
  const isTextarea = field.type === "textarea";

  const base = {
    width: "100%",
    background: "var(--bg)",
    border: "1px solid var(--border)",
    color: "var(--text)",
    fontFamily: "var(--font-mono)",
    fontSize: 12,
    padding: "7px 10px",
    boxSizing: "border-box",
    outline: "none",
  };

  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 14, alignItems: "flex-start" }}>
      <label style={{ width: 160, flexShrink: 0, fontSize: 10, color: "var(--text-dim)", paddingTop: 8, lineHeight: 1.4 }}>
        {field.label}
      </label>
      <div style={{ flex: 1 }}>
        {isReadonly ? (
          <div style={{ fontSize: 12, color: "var(--text-dim)", paddingTop: 8 }}>{value || "—"}</div>
        ) : isTextarea ? (
          <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            rows={field.rows || 3}
            style={{ ...base, resize: "vertical", lineHeight: 1.6, minHeight: field.large ? 200 : undefined }}
          />
        ) : (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="text"
              value={value}
              onChange={e => onChange(e.target.value)}
              style={{ ...base, flex: 1 }}
            />
            {isUrl && value?.trim() && (
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 10, color: "var(--accent)", whiteSpace: "nowrap", textDecoration: "none", border: "1px solid var(--accent)", padding: "3px 8px" }}
              >
                開く ↗
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


// ─── ChatGPT output parser ────────────────────────────────────────────────────

// Maps every Japanese label variant → field key
const LABEL_MAP = {
  // 基本情報
  "商品名":           "name",
  "ブランド":         "brand",
  "カテゴリ":         "category",
  "型番":             "modelNumber",
  "発売日":           "releaseDate",
  "価格":             "price",
  "公式url":          "officialUrl",
  "公式URL":          "officialUrl",
  "販売url":          "salesUrl",
  "販売URL":          "salesUrl",
  "商品画像url":      "imageUrl",
  "商品画像URL":      "imageUrl",
  "janコード":        "janCode",
  "JANコード":        "janCode",

  // 商品理解
  "商品概要":                   "overview",
  "解決する悩み":               "problemSolved",
  "主な機能":                   "features",
  "強み":                       "strengths",
  "弱み":                       "weaknesses",
  "向いている人":               "forWho",
  "向いていない人":             "notForWho",
  "使用シーン":                 "useScenes",
  "購入理由（なぜ選ばれるか）": "buyReason",
  "購入理由":                   "buyReason",
  "なぜ選ばれるか":             "buyReason",
  "比較される商品":             "comparedProducts",
  "競合商品":                   "competitors",
  "購入前に悩まれるポイント":   "buyingConcerns",
  "よくある質問（faq）":        "faq",
  "よくある質問（FAQ）":        "faq",
  "よくある質問":               "faq",
  "faq":                        "faq",
  "FAQ":                        "faq",

  // レビュー分析
  "楽天レビュー要約":   "rakutenReview",
  "amazonレビュー要約": "amazonReview",
  "Amazonレビュー要約": "amazonReview",
  "高評価で多い意見":   "positiveReviews",
  "低評価で多い意見":   "negativeReviews",
  "長期使用レビュー":   "longTermReview",
  "バッテリー評価":     "batteryEval",
  "耐久性":             "durability",
  "替刃・消耗品コスト": "consumableCost",
  "肌質別評価":         "skinTypeEval",
  "レビュー総評":       "reviewSummary",

  // 市場分析
  "tiktokで伸びている訴求":  "tiktokTrends",
  "TikTokで伸びている訴求":  "tiktokTrends",
  "tiktok投稿傾向":          "tiktokPattern",
  "TikTok投稿傾向":          "tiktokPattern",
  "youtubeレビュー傾向":     "youtubePattern",
  "YouTubeレビュー傾向":     "youtubePattern",
  "google検索ニーズ":        "googleNeeds",
  "Google検索ニーズ":        "googleNeeds",
  "30〜40代男性の購入理由":  "mensBuyReason",
  "買われない理由":          "notBoughtReason",
  "差別化ポイント":          "differentiation",
  "市場での立ち位置":        "marketPosition",

  // UPGEAR評価
  "装備性":          "gearScore",
  "判断削減力":      "judgmentReduction",
  "継続運用性":      "continuity",
  "コスパ":          "costPerformance",
  "デザイン性":      "designScore",
  "総合点（100点満点）": "totalScore",
  "総合点":          "totalScore",
  "評価理由":        "evalReason",
  "一言まとめ":      "oneLiner",

  // SNS用
  "tiktok訴求":               "tiktokAngles",
  "TikTok訴求":               "tiktokAngles",
  "投稿フック（5案）":        "hook",
  "投稿フック":               "hook",
  "保存されやすいポイント":   "saveablePoints",
  "コメントが増えそうなテーマ": "commentThemes",
  "避ける表現":               "avoidExpressions",
  "検索キーワード":           "searchKeywords",
  "ハッシュタグ候補":         "hashtags",

  // AI用
  "chatgpt分析全文":          "chatgptFullText",
  "ChatGPT分析全文":          "chatgptFullText",
  "情報源（調査したサイト一覧）": "sources",
  "情報源（調査サイト一覧）": "sources",
  "情報源":                   "sources",
  "推定事項":                 "estimations",
  "情報不足":                 "missingInfo",
  "次に調査すべき項目":       "nextResearch",
  "作成日時":                 "createdAt",
  "更新日時":                 "updatedAt",

  // 商品理解（新エージェント項目）
  "この商品が存在する理由":   "existReason",
  "存在する理由":             "existReason",
  "購入理由（なぜ選ばれるのか）": "buyReason",

  // レビュー分析（新エージェント項目）
  "高評価で多い内容":         "positiveReviews",
  "低評価で多い内容":         "negativeReviews",
  "品質":                     "qualityEval",
  "初期不良傾向":             "initialDefects",
  "初期不良":                 "initialDefects",
  "サポート評価":             "supportEval",
  "バッテリー評価（該当商品のみ）": "batteryEval",

  // 競合分析
  "この商品を選ぶ理由":       "whyChooseThis",
  "他を選ぶ理由":             "whyChooseOther",
  "勝っている点":             "winPoints",
  "負けている点":             "losePoints",

  // UPGEAR評価（新軸）
  "ミスマッチ明確性":         "mismatchClarity",
  "代替不可能性":             "irreplaceability",
  "認定判定":                 "certification",
  "認定判定（認定／条件付き認定／非認定）": "certification",

  // TikTok分析
  "一番刺さる悩み":           "topPain",
  "一番強い訴求ポイント":     "topAppeal",
  "冒頭3秒で使えるフック案（5案）": "hook",
  "冒頭3秒フック（5案）":     "hook",
  "避けるべき訴求":           "avoidExpressions",
  "保存されやすい切り口":     "saveablePoints",
  "比較すると面白い商品":     "funCompare",

  // ReadyAI掲載用
  "150文字要約":              "summary150",
  "300文字要約":              "summary300",
  "seoキーワード":            "seoKeywords",
  "SEOキーワード":            "seoKeywords",
  "メタディスクリプション":   "metaDescription",

  // 編集長コメント
  "ＵＰＧＥＡＲ編集長コメント": "editorComment",
  "UPGEAR編集長コメント":     "editorComment",
  "upgear編集長コメント":     "editorComment",
  "編集長コメント":           "editorComment",
};

/**
 * Parse ChatGPT structured output into an object keyed by understanding field keys.
 * Handles: "# 【セクション】", "【セクション】", "- ラベル", "ラベル：", "ラベル: " etc.
 */
function parseChatGPTOutput(text) {
  const result = {};
  if (!text?.trim()) return result;

  const lines = text.split("\n");
  let currentLabel = null;
  let buffer = [];

  const flush = () => {
    if (!currentLabel) return;
    const key = resolveKey(currentLabel);
    if (key) {
      result[key] = (result[key] ? result[key] + "\n" : "") + buffer.join("\n").trim();
    }
    currentLabel = null;
    buffer = [];
  };

  // Normalize a label string for lookup
  const normalize = (s) => s.trim().replace(/\s+/g, "").replace(/：$/, "").replace(/:$/, "");

  const resolveKey = (label) => {
    const n = normalize(label);
    // Exact match first
    if (LABEL_MAP[n]) return LABEL_MAP[n];
    // Case-insensitive
    const lower = n.toLowerCase();
    for (const [k, v] of Object.entries(LABEL_MAP)) {
      if (k.toLowerCase() === lower) return v;
    }
    return null;
  };

  // Regex: section headers (skip, just markers)
  const sectionRe = /^#{0,3}\s*[【\[]([^\]】]+)[】\]]\s*$/;
  // Regex: field label line — "- ラベル" or "ラベル：" or "ラベル: "
  const fieldRe   = /^(?:-\s*)?([^\n：:]+)[：:]\s*(.*)$/;
  // Regex: "- label" alone (no colon, next line is value)
  const bulletRe  = /^-\s+(.+)$/;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trimEnd();

    // Skip section headers
    if (sectionRe.test(line)) {
      flush();
      continue;
    }

    // "- label：value" or "label：value"
    const fm = line.match(fieldRe);
    if (fm) {
      const labelCandidate = fm[1].trim();
      const valueInline    = fm[2].trim();
      if (resolveKey(labelCandidate)) {
        flush();
        currentLabel = labelCandidate;
        if (valueInline) buffer.push(valueInline);
        continue;
      }
    }

    // "- label" (bullet with known label, no colon — value on next lines)
    const bm = line.match(bulletRe);
    if (bm) {
      const labelCandidate = bm[1].trim();
      if (resolveKey(labelCandidate)) {
        flush();
        currentLabel = labelCandidate;
        continue;
      }
    }

    // Continuation line for current field
    if (currentLabel !== null) {
      buffer.push(line);
    }
  }

  flush();
  return result;
}

// ─── PastePanel component ─────────────────────────────────────────────────────

function PastePanel({ onApply }) {
  const [open,    setOpen]    = useState(false);
  const [text,    setText]    = useState("");
  const [preview, setPreview] = useState(null);
  const [confirm, setConfirm] = useState(false);

  const handleParse = () => {
    const parsed = parseChatGPTOutput(text);
    const count  = Object.keys(parsed).length;
    if (count === 0) {
      alert("読み取れる項目が見つかりませんでした。\n出力フォーマットを確認してください。");
      return;
    }
    setPreview({ parsed, count });
    setConfirm(true);
  };

  const handleConfirm = (overwrite) => {
    onApply(preview.parsed, overwrite);
    setConfirm(false);
    setPreview(null);
    setText("");
    setOpen(false);
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", textAlign: "left",
          padding: "10px 16px",
          background: open ? "rgba(229,192,123,0.08)" : "rgba(229,192,123,0.04)",
          border: "1px solid rgba(229,192,123,0.35)",
          color: "rgba(229,192,123,0.9)",
          cursor: "pointer",
          fontSize: 12,
          fontFamily: "var(--font-mono)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}
      >
        <span>ChatGPT出力を貼り付けて自動仕分け</span>
        <span style={{ fontSize: 14 }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div style={{
          background: "var(--bg2)",
          border: "1px solid rgba(229,192,123,0.35)",
          borderTop: "none",
          padding: "20px 20px 16px",
        }}>
          <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 10, lineHeight: 1.6 }}>
            ChatGPTの出力全文をそのまま貼り付けてください。「# 【基本情報】」などの見出しと項目を読み取り、各フォーム欄に自動入力します。
          </div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={"# 【基本情報】\n- 商品名：○○○\n- ブランド：△△△\n...\n\n# 【商品理解】\n- 商品概要：…"}
            rows={14}
            style={{
              width: "100%",
              background: "var(--bg)",
              border: "1px solid var(--border)",
              color: "var(--text)",
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              padding: "10px 12px",
              boxSizing: "border-box",
              resize: "vertical",
              lineHeight: 1.6,
              outline: "none",
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, flexWrap: "wrap", gap: 8 }}>
            <div style={{ fontSize: 10, color: "var(--text-dim)" }}>
              {text.trim()
                ? `${Object.keys(parseChatGPTOutput(text)).length} 項目を検出中`
                : "テキストを貼り付けると項目数が表示されます"}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => { setText(""); setPreview(null); setConfirm(false); }}
                style={{ fontSize: 11, padding: "6px 12px", cursor: "pointer", background: "none", border: "1px solid var(--border)", color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}
              >
                クリア
              </button>
              <button
                onClick={handleParse}
                disabled={!text.trim()}
                style={{
                  fontSize: 11, padding: "6px 16px", cursor: text.trim() ? "pointer" : "default",
                  background: text.trim() ? "rgba(229,192,123,0.12)" : "none",
                  border: `1px solid ${text.trim() ? "rgba(229,192,123,0.6)" : "var(--border)"}`,
                  color: text.trim() ? "rgba(229,192,123,0.9)" : "var(--text-dim)",
                  fontFamily: "var(--font-mono)",
                  opacity: text.trim() ? 1 : 0.5,
                }}
              >
                項目ごとに自動仕分け →
              </button>
            </div>
          </div>

          {confirm && preview && (
            <div style={{
              marginTop: 16,
              background: "rgba(229,192,123,0.06)",
              border: "1px solid rgba(229,192,123,0.3)",
              padding: "16px 18px",
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(229,192,123,0.9)", marginBottom: 10 }}>
                {preview.count} 項目を読み取りました
              </div>
              <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 14, lineHeight: 1.7 }}>
                <div style={{ fontWeight: 600, marginBottom: 6, color: "var(--text)" }}>読み取り済み項目：</div>
                {Object.entries(preview.parsed).map(([k, v]) => (
                  <div key={k} style={{ display: "flex", gap: 8, marginBottom: 3 }}>
                    <span style={{ color: "rgba(229,192,123,0.7)", minWidth: 140 }}>{k}</span>
                    <span style={{ color: "var(--text-dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 360 }}>
                      {v.replace(/\n/g, " ").substring(0, 80)}{v.length > 80 ? "…" : ""}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
                <button
                  onClick={() => setConfirm(false)}
                  style={{ fontSize: 11, padding: "6px 14px", cursor: "pointer", background: "none", border: "1px solid var(--border)", color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}
                >
                  キャンセル
                </button>
                <button
                  onClick={() => handleConfirm(false)}
                  style={{ fontSize: 11, padding: "6px 14px", cursor: "pointer", background: "none", border: "1px solid var(--accent)", color: "var(--accent)", fontFamily: "var(--font-mono)" }}
                >
                  空欄のみ埋める
                </button>
                <button
                  onClick={() => handleConfirm(true)}
                  style={{ fontSize: 11, padding: "6px 14px", cursor: "pointer", background: "rgba(229,192,123,0.12)", border: "1px solid rgba(229,192,123,0.6)", color: "rgba(229,192,123,0.9)", fontFamily: "var(--font-mono)" }}
                >
                  すべて上書きして反映
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProductUnderstanding({ item, updateItem, onBack }) {
  const [u, setU] = useState(() => {
    if (item?.understanding) return { ...EMPTY_UNDERSTANDING(), ...item.understanding };
    return prefillFromCard(item || {});
  });
  const [saved,         setSaved]         = useState(false);
  const [copied,        setCopied]        = useState(false);
  const [promptCopied,  setPromptCopied]  = useState(false);
  const [activeSection, setActiveSection] = useState("basic");

  useEffect(() => {
    if (item?.understanding) {
      setU({ ...EMPTY_UNDERSTANDING(), ...item.understanding });
    } else {
      setU(prefillFromCard(item || {}));
    }
  }, [item?.id]);

  const set = useCallback((key, val) => setU(prev => ({ ...prev, [key]: val })), []);

  const handleSave = () => {
    const now = new Date().toLocaleString("ja-JP");
    const data = { ...u, updatedAt: now, createdAt: u.createdAt || now };
    setU(data);
    updateItem(item.id, { understanding: data });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
  };

  const handleCopyData = async () => {
    await copyToClipboard(buildCopyText(item?.label || u.name, u));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyPrompt = async () => {
    await copyToClipboard(buildPromptTemplate(item, u));
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 2500);
  };

  const handlePasteApply = useCallback((parsed, overwrite) => {
    setU(prev => {
      const next = { ...prev };
      for (const [key, val] of Object.entries(parsed)) {
        if (overwrite || !prev[key]?.trim()) {
          next[key] = val;
        }
      }
      return next;
    });
  }, []);

  if (!item) return (
    <div style={{ padding: 40, textAlign: "center", color: "var(--text-dim)" }}>
      商品が選択されていません
    </div>
  );

  const currentSection = SECTIONS.find(s => s.id === activeSection) || SECTIONS[0];

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
            <button
              onClick={onBack}
              style={{ fontSize: 10, color: "var(--text-dim)", background: "none", border: "1px solid var(--border)", padding: "3px 10px", cursor: "pointer" }}
            >
              ← ストックに戻る
            </button>
            <span style={{ fontSize: 10, color: "var(--text-dim)" }}>商品理解</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
            {item.label || u.name || "（商品名未設定）"}
          </h1>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {item.mainCategory && (
              <span style={{ fontSize: 10, color: "var(--text-dim)", background: "var(--bg2)", border: "1px solid var(--border)", padding: "2px 8px" }}>
                {item.mainCategory}
              </span>
            )}
            {item.score && (
              <span style={{ fontSize: 10, color: "var(--accent)", background: "var(--accent-dim)", border: "1px solid var(--accent)", padding: "2px 8px" }}>
                {item.score}点
              </span>
            )}
            {item.understanding?.updatedAt && (
              <span style={{ fontSize: 10, color: "var(--text-dim)" }}>
                最終更新: {item.understanding.updatedAt}
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button
            onClick={handleCopyPrompt}
            style={{
              fontSize: 11, padding: "7px 14px", cursor: "pointer",
              background: promptCopied ? "rgba(198,120,221,0.15)" : "rgba(198,120,221,0.05)",
              border: `1px solid ${promptCopied ? "#c678dd" : "rgba(198,120,221,0.4)"}`,
              color: promptCopied ? "#c678dd" : "rgba(198,120,221,0.8)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {promptCopied ? "✓ コピー完了" : "ChatGPTプロンプトをコピー"}
          </button>
          <button
            onClick={handleCopyData}
            style={{
              fontSize: 11, padding: "7px 14px", cursor: "pointer",
              background: copied ? "rgba(152,195,121,0.15)" : "none",
              border: `1px solid ${copied ? "#98c379" : "var(--border)"}`,
              color: copied ? "#98c379" : "var(--text-dim)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {copied ? "✓ コピー完了" : "商品理解データをコピー"}
          </button>
          <Btn variant="primary" onClick={handleSave}>
            {saved ? "✓ 保存完了" : "保存"}
          </Btn>
        </div>
      </div>

      {/* Paste panel */}
      <PastePanel onApply={handlePasteApply} />

      {/* ChatGPT prompt hint */}
      <div style={{ background: "rgba(198,120,221,0.05)", border: "1px solid rgba(198,120,221,0.25)", padding: "10px 16px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div style={{ fontSize: 11, color: "rgba(198,120,221,0.9)" }}>
          <strong>ChatGPT連携：</strong>「ChatGPTプロンプトをコピー」→ ChatGPTに貼り付けて調査 → 結果を「AI用」タブの「ChatGPT分析全文」に貼り付け → 保存
        </div>
        <button
          onClick={handleCopyPrompt}
          style={{ fontSize: 10, padding: "4px 12px", cursor: "pointer", background: "none", border: "1px solid rgba(198,120,221,0.4)", color: "rgba(198,120,221,0.9)", fontFamily: "var(--font-mono)" }}
        >
          {promptCopied ? "✓ コピー済み" : "プロンプトをコピー →"}
        </button>
      </div>

      {/* Section tabs */}
      <div style={{ display: "flex", gap: 0, marginBottom: 0, borderBottom: "1px solid var(--border)", flexWrap: "wrap" }}>
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            style={{
              fontSize: 11, padding: "8px 14px", cursor: "pointer",
              background: activeSection === s.id ? "var(--bg2)" : "none",
              border: "none",
              borderBottom: activeSection === s.id ? `2px solid ${s.color}` : "2px solid transparent",
              color: activeSection === s.id ? s.color : "var(--text-dim)",
              fontFamily: "var(--font-mono)",
              marginBottom: -1,
              whiteSpace: "nowrap",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Section content */}
      <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderTop: "none", padding: "24px 28px", marginBottom: 20 }}>
        <SectionHeader label={currentSection.label} color={currentSection.color} />
        {currentSection.fields.map(f => (
          <FieldRow
            key={f.key}
            field={f}
            value={u[f.key] || ""}
            onChange={val => set(f.key, val)}
          />
        ))}
      </div>

      {/* Sticky save bar */}
      <div style={{
        position: "sticky", bottom: 16,
        background: "var(--bg2)", border: "1px solid var(--border)",
        padding: "12px 20px",
        display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap",
      }}>
        <div style={{ fontSize: 11, color: "var(--text-dim)" }}>
          保存すると台本作成・口コミ分析・ReadyAI反映に使用できます
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleCopyData} style={{ fontSize: 11, padding: "6px 14px", cursor: "pointer", background: "none", border: "1px solid var(--border)", color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
            {copied ? "✓ コピー済み" : "データをコピー"}
          </button>
          <Btn variant="primary" onClick={handleSave}>
            {saved ? "✓ 保存完了" : "保存する"}
          </Btn>
        </div>
      </div>
    </div>
  );
}
