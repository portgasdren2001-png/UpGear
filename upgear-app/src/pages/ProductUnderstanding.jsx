import { useState, useEffect, useCallback } from "react";
import { Btn } from "../components/ui";

// ─── ChatGPT プロンプトテンプレート ───────────────────────────────────────────

function buildPromptTemplate(item, u) {
  const name       = u?.name       || item?.label        || "";
  const officialUrl = u?.officialUrl || item?.urls?.official || "";
  const salesUrl   = u?.salesUrl   || item?.urls?.rakuten  || "";

  return `あなたはUPGEAR専属の商品リサーチAIです。

目的は、商品を徹底的に調査・分析し、UPGEARの商品データベースとして保存できるレベルの商品理解を作成することです。

==============================
【最重要ルール】
==============================

・必ずメーカー公式サイトを最優先する
・楽天・Amazon・レビューサイト・比較記事・YouTube・TikTokなど公開情報も横断して調査する
・事実と推測は必ず分ける
・推測は「推定」と明記する
・情報不足の場合は「情報不足」と記載する
・レビュー本文をそのまま転載せず、必ず要約・分析する
・口コミは傾向を分析する
・UPGEARは30〜40代デスクワーカー向け装備審査メディアであることを前提に評価する
・機能説明だけで終わらず、「実生活でどう役立つか」まで分析する
・可能な限り情報を網羅する
・空欄を作らず、取得できない場合のみ「情報不足」と記載する

==============================
【入力】
==============================

商品名：${name}

メーカー公式URL：${officialUrl}

販売ページURL：${salesUrl}

比較したい商品：

==============================
【出力】
==============================

# 【基本情報】

- 商品名
- ブランド
- カテゴリ
- 型番
- 発売日
- 価格
- 公式URL
- 販売URL
- 商品画像URL
- JANコード

# 【商品理解】

- 商品概要
- 解決する悩み
- 主な機能
- 強み
- 弱み
- 向いている人
- 向いていない人
- 使用シーン
- 購入理由（なぜ選ばれるか）
- 比較される商品
- 競合商品
- 購入前に悩まれるポイント
- よくある質問（FAQ）

# 【レビュー分析】

- 楽天レビュー要約
- Amazonレビュー要約
- 高評価で多い意見
- 低評価で多い意見
- 長期使用レビュー
- バッテリー評価
- 耐久性
- 替刃・消耗品コスト
- 肌質別評価
- レビュー総評

# 【市場分析】

- TikTokで伸びている訴求
- TikTok投稿傾向
- YouTubeレビュー傾向
- Google検索ニーズ
- 30〜40代男性の購入理由
- 買われない理由
- 差別化ポイント
- 市場での立ち位置

# 【UPGEAR評価】

- 装備性
- 判断削減力
- 継続運用性
- コスパ
- デザイン性
- 総合点（100点満点）
- 評価理由
- 一言まとめ

# 【SNS用】

- TikTok訴求
- 投稿フック（5案）
- 保存されやすいポイント
- コメントが増えそうなテーマ
- 避ける表現
- 検索キーワード
- ハッシュタグ候補

# 【AI用】

- ChatGPT分析全文
- 情報源（調査したサイト一覧）
- 推定事項
- 情報不足
- 次に調査すべき項目
- 作成日時
- 更新日時

==============================
【重要】
==============================

1. 一つの商品について可能な限り深く調査すること。
2. 公式情報・レビュー・市場情報を横断して統合分析すること。
3. 「この商品を知らない人でも理解できるレベル」の商品理解を作ること。
4. UPGEARの商品マスターデータとして保存できる品質を目指すこと。
5. 出力は必ず上記の構成・順番を守ること。
6. 情報量を優先し、省略せず詳しく出力すること。長くなっても構わない。
7. 回答が長くなる場合は途中で省略せず、「Part1」「Part2」…と分割して最後まで出力すること。
8. 情報源ごとの内容を整理し、事実・レビュー傾向・AI分析を混同しないこと。`;
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
    id: "upgear",
    label: "UPGEAR評価",
    color: "#98c379",
    fields: [
      { key: "gearScore",         label: "装備性（0〜10）",   type: "text" },
      { key: "judgmentReduction", label: "判断削減力（0〜10）", type: "text" },
      { key: "continuity",        label: "継続運用性（0〜10）", type: "text" },
      { key: "costPerformance",   label: "コスパ（0〜10）",   type: "text" },
      { key: "designScore",       label: "デザイン性（0〜10）",type: "text" },
      { key: "totalScore",        label: "総合点（0〜100）",  type: "text" },
      { key: "evalReason",        label: "評価理由",          type: "textarea", rows: 3 },
      { key: "oneLiner",          label: "一言まとめ",        type: "textarea", rows: 2 },
    ],
  },
  {
    id: "sns",
    label: "SNS用",
    color: "#e5c07b",
    fields: [
      { key: "tiktokAngles",      label: "TikTok訴求",              type: "textarea", rows: 3 },
      { key: "hook",              label: "投稿フック（5案）",        type: "textarea", rows: 4 },
      { key: "saveablePoints",    label: "保存されやすいポイント",   type: "textarea", rows: 2 },
      { key: "commentThemes",     label: "コメントが増えそうなテーマ", type: "textarea", rows: 2 },
      { key: "avoidExpressions",  label: "避ける表現",               type: "textarea", rows: 2 },
      { key: "searchKeywords",    label: "検索キーワード",           type: "textarea", rows: 2 },
      { key: "hashtags",          label: "ハッシュタグ候補",         type: "textarea", rows: 2 },
    ],
  },
  {
    id: "ai",
    label: "AI用",
    color: "#c678dd",
    fields: [
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
    u.costPerformance   && `コスパ:${u.costPerformance}`,
    u.designScore       && `デザイン性:${u.designScore}`,
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
【UPGEAR評価】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${scores}
総合点：${u.totalScore || ""}
${line("評価理由", u.evalReason)}${line("一言まとめ", u.oneLiner)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【SNS用】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${line("TikTok訴求", u.tiktokAngles)}${line("投稿フック（5案）", u.hook)}${line("保存されやすいポイント", u.saveablePoints)}${line("コメントが増えそうなテーマ", u.commentThemes)}${line("避ける表現", u.avoidExpressions)}${line("検索キーワード", u.searchKeywords)}${line("ハッシュタグ候補", u.hashtags)}
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
