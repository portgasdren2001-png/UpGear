import { useState, useEffect, useRef } from "react";
import { Btn, Tag } from "../components/ui";
import {
  generateProductUnderstanding,
  detectUrlType,
  URL_TYPE_LABELS,
  FETCH_STAGES,
  calcUnderstandingScore,
} from "../data/productUnderstandingAI";

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = [
  { n: 1, label: "URL入力" },
  { n: 2, label: "商品理解" },
  { n: 3, label: "確認" },
  { n: 4, label: "ストック保存" },
  { n: 5, label: "市場調査" },
  { n: 6, label: "制作スタジオ" },
];

const J_OPTIONS = [
  { v: "認定",       label: "認定（80〜94点）" },
  { v: "条件付き認定", label: "条件付き認定（65〜79点）" },
  { v: "保留",        label: "保留（50〜64点）" },
  { v: "非認定",      label: "非認定（49点以下）" },
];

const UNDERSTANDING_COLOR = (s) =>
  s >= 90 ? "#98c379" : s >= 70 ? "var(--accent)" : "#e06c75";

// ─── Sub-components ──────────────────────────────────────────────────────────

function StepBar({ current }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 4 }}>
      {STEPS.map((s, i) => (
        <div key={s.n} style={{ display: "flex", alignItems: "center" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "4px 10px",
            background: current === s.n ? "var(--accent-dim)" : current > s.n ? "rgba(152,195,121,0.1)" : "none",
            border: `1px solid ${current === s.n ? "var(--accent)" : current > s.n ? "#98c379" : "var(--border)"}`,
            fontSize: 11,
          }}>
            <span style={{
              color: current === s.n ? "var(--accent)" : current > s.n ? "#98c379" : "var(--text-dim)",
              fontWeight: current === s.n ? 700 : 400,
            }}>
              {current > s.n ? "✓" : s.n}
            </span>
            <span style={{ color: current === s.n ? "var(--text)" : current > s.n ? "#98c379" : "var(--text-dim)" }}>
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <span style={{ color: "var(--border)", margin: "0 4px", fontSize: 10 }}>›</span>
          )}
        </div>
      ))}
    </div>
  );
}

function SectionLabel({ children, color = "var(--accent)" }) {
  return (
    <div style={{ fontSize: 9, color, letterSpacing: "0.2em", borderLeft: "2px solid currentColor", paddingLeft: 8, marginBottom: 10 }}>
      {children}
    </div>
  );
}

function CardRow({ label, value, accent, edit, onEdit }) {
  return (
    <div style={{ display: "flex", gap: 10, padding: "7px 0", borderBottom: "1px solid var(--border)", alignItems: "flex-start" }}>
      <div style={{ fontSize: 10, color: "var(--text-dim)", width: 110, flexShrink: 0 }}>{label}</div>
      <div style={{ flex: 1, fontSize: 11, color: accent ? "var(--accent)" : "var(--text)", lineHeight: 1.5 }}>{value || "—"}</div>
      {edit && (
        <button onClick={onEdit} style={{ fontSize: 9, color: "var(--text-dim)", background: "none", border: "1px solid var(--border)", padding: "1px 6px", cursor: "pointer" }}>
          修正
        </button>
      )}
    </div>
  );
}

function UnderstandingScore({ score, missing }) {
  const color = UNDERSTANDING_COLOR(score);
  return (
    <div style={{ background: "var(--bg2)", border: `2px solid ${color}`, padding: "16px 20px", marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ fontSize: 12, color }}>商品理解スコア</div>
        <div style={{ fontSize: 28, fontWeight: 700, color }}>{score}<span style={{ fontSize: 14 }}>点</span></div>
      </div>
      <div style={{ height: 6, background: "var(--border)", marginBottom: 8 }}>
        <div style={{ width: `${score}%`, height: "100%", background: color, transition: "width 0.6s ease" }} />
      </div>
      {score < 90 && missing.length > 0 && (
        <div>
          <div style={{ fontSize: 9, color: "#e06c75", marginBottom: 6 }}>不足情報（市場調査には90点以上が必要）</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {missing.map((m) => (
              <span key={m} style={{ fontSize: 10, background: "rgba(224,108,117,0.1)", color: "#e06c75", border: "1px solid rgba(224,108,117,0.3)", padding: "2px 8px" }}>{m}</span>
            ))}
          </div>
        </div>
      )}
      {score >= 90 && (
        <div style={{ fontSize: 10, color: "#98c379" }}>✓ 市場調査可能</div>
      )}
    </div>
  );
}

// ─── Step 1: URL入力 ──────────────────────────────────────────────────────────

function Step1({ urls, setUrls, onNext }) {
  const URL_FIELDS = [
    { key: "official", label: "公式サイト URL",    placeholder: "https://..." },
    { key: "amazon",   label: "Amazon URL",        placeholder: "https://amazon.co.jp/dp/..." },
    { key: "rakuten",  label: "楽天 URL",           placeholder: "https://item.rakuten.co.jp/..." },
    { key: "kakaku",   label: "価格.com URL",       placeholder: "https://kakaku.com/item/..." },
    { key: "review",   label: "レビューサイト URL", placeholder: "https://..." },
  ];

  const setUrl = (key, val) => setUrls((prev) => ({ ...prev, [key]: val }));
  const count = Object.values(urls).filter(Boolean).length;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>URLを入力してください</h2>
        <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7 }}>
          1つのURLから開始できます。複数入力するほど商品理解スコアが向上します。
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
        {URL_FIELDS.map((f) => {
          const val = urls[f.key] || "";
          const type = val ? detectUrlType(val) : null;
          return (
            <div key={f.key} style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: val ? "#98c379" : "var(--border)", flexShrink: 0, marginBottom: 12 }} />
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.15em", display: "block", marginBottom: 5 }}>{f.label}</label>
                <input
                  value={val}
                  onChange={(e) => setUrl(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  style={{
                    width: "100%", background: "var(--bg2)", border: `1px solid ${val ? "#98c379" : "var(--border)"}`,
                    color: "var(--text)", fontFamily: "var(--font-mono)", fontSize: 12, padding: "8px 12px",
                  }}
                />
              </div>
              {type && (
                <div style={{ fontSize: 9, color: "var(--text-dim)", whiteSpace: "nowrap", marginBottom: 10 }}>
                  {URL_TYPE_LABELS[type]}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 11, color: "var(--text-dim)" }}>
          {count > 0 ? (
            <span>{count}件のURL設定済み <span style={{ color: "#98c379" }}>✓</span></span>
          ) : "URLを1つ以上入力してください"}
        </div>
        <Btn variant="primary" onClick={onNext} disabled={count === 0}>
          商品理解を開始 →
        </Btn>
      </div>
    </div>
  );
}

// ─── 商品理解インポート: パーサー ────────────���────────────────────────────────

const IMPORT_FIELDS = [
  { key: "productName",       label: "商品名",                  multi: false },
  { key: "brand",             label: "ブランド名",              multi: false },
  { key: "category",         label: "商品カテゴリ",             multi: false },
  { key: "purpose",          label: "何をする商品か",           multi: false },
  { key: "targetProblem",    label: "誰のどんな悩みを解決するか", multi: true  },
  { key: "features",         label: "主な機能",                 multi: true  },
  { key: "strengths",        label: "強み",                    multi: true  },
  { key: "weaknesses",       label: "弱み",                    multi: true  },
  { key: "forWho",           label: "向い���いる人",            multi: false },
  { key: "notForWho",        label: "向いていない人",          multi: true  },
  { key: "competitors",      label: "競合商品",                multi: true  },
  { key: "upgearEval",       label: "UPGEAR視点での評価",      multi: false },
  { key: "tiktokAngles",     label: "TikTokで刺さる訴求",      multi: true  },
  { key: "avoidExpressions", label: "投稿で避けるべき表現",    multi: true  },
  { key: "catchphrase",      label: "一言でいうと",            multi: false },
  // レビュー分析
  { key: "rakutenReview",    label: "楽天レビュー要約",        multi: false },
  { key: "amazonReview",     label: "Amazonレビュー要約",      multi: false },
  { key: "positiveReviews",  label: "高評価で多い意見",        multi: true  },
  { key: "negativeReviews",  label: "低評価で多い意見",        multi: true  },
  { key: "reviewSummary",    label: "レビュー総評",            multi: false },
  // 市場分析
  { key: "tiktokTrends",     label: "TikTokで伸びている訴求",  multi: true  },
  { key: "tiktokPattern",    label: "TikTok投稿傾向",          multi: false },
  { key: "differentiation",  label: "差別化ポイント",          multi: false },
  { key: "marketPosition",   label: "市場での立ち位置",        multi: false },
];

const IMPORT_SECTION_PATTERNS = [
  { key: "productName",       patterns: ["商品名", "製品名", "商品："] },
  { key: "brand",             patterns: ["ブランド", "メーカー", "製造"] },
  { key: "category",         patterns: ["商品カテゴリ", "カテゴリ", "商品種別", "種別"] },
  { key: "purpose",          patterns: ["何をする商品", "商品概要", "概要", "用途", "何の商品", "商品説明"] },
  { key: "targetProblem",    patterns: ["誰の��んな悩み", "ターゲット", "悩み解決", "どん���悩み", "課題", "解決する悩み"] },
  { key: "features",         patterns: ["主な機能", "主要機能", "機能一覧", "機能", "特徴", "スペック"] },
  { key: "strengths",        patterns: ["強み", "メリット", "よい点", "良い点", "優れた点"] },
  { key: "weaknesses",       patterns: ["弱み", "デメリット", "注意点", "欠点", "弱点", "課題点"] },
  { key: "forWho",           patterns: ["向いている人", "向いてる人", "おすすめの人", "対象ユーザー", "こんな人に"] },
  { key: "notForWho",        patterns: ["向いていない人", "向いてない人", "不向き", "対象外", "おすすめできない"] },
  { key: "competitors",      patterns: ["競合商品", "競合", "類似商品", "競合製品", "比���"] },
  { key: "upgearEval",       patterns: ["upgear", "アップギア", "upgear視点", "upgear評価", "upGear", "UpGear"] },
  { key: "tiktokAngles",     patterns: ["tiktok", "ティックトック", "tikTok", "訴求", "刺さる", "sns切り口"] },
  { key: "avoidExpressions", patterns: ["避けるべき", "禁止", "使わない", "ng表現", "避けたい", "ng", "注意ワード"] },
  { key: "catchphrase",      patterns: ["一言でいうと", "キャッチコピー", "まとめると", "結論", "一文でいうと"] },
  // レビュー分析
  { key: "rakutenReview",    patterns: ["楽天レビュー要約", "楽天レビュー", "楽天口コミ"] },
  { key: "amazonReview",     patterns: ["amazonレビュー要約", "amazonレビュー", "amazon口コミ", "アマゾンレビュー"] },
  { key: "positiveReviews",  patterns: ["高評価で多い意見", "高評価", "好評", "よかった点", "満足点"] },
  { key: "negativeReviews",  patterns: ["低評価で多い意見", "低評価", "不満", "悪かった点", "改善点"] },
  { key: "reviewSummary",    patterns: ["レビュー総評", "口コミ総評", "レビューまとめ", "総合評価"] },
  // 市場分析
  { key: "tiktokTrends",     patterns: ["tiktokで伸びている", "tiktok訴求", "伸びている訴求", "バズ訴求"] },
  { key: "tiktokPattern",    patterns: ["tiktok投稿傾向", "投稿傾向", "投稿パターン", "人気の投稿"] },
  { key: "differentiation",  patterns: ["差別化ポイント", "差別化", "独自性", "他商品との違い"] },
  { key: "marketPosition",   patterns: ["市場での立ち位置", "市場ポジション", "市場位置", "競合との比較"] },
];

function parseImportText(raw) {
  const lines = raw.split("\n").map(l => l.trim()).filter(Boolean);
  const parsed = {};
  let currentKey = null;
  let currentLines = [];

  const flush = () => {
    if (currentKey && currentLines.length > 0) {
      parsed[currentKey] = currentLines.join("\n").trim();
    }
  };

  const normalize = s => s.toLowerCase().replace(/[\s:：・「」【】#▶●■▼◆◇→\-\d\.]/g, "");

  for (const line of lines) {
    const normLine = normalize(line);
    let matched = null;

    for (const sec of IMPORT_SECTION_PATTERNS) {
      if (sec.patterns.some(p => normLine.includes(normalize(p)))) {
        // Treat as header only if line is short or has common header markers
        const isHeader =
          line.length < 45 ||
          /[:：]/.test(line.slice(0, 20)) ||
          /^[#■▶●◆◇▼【]/.test(line) ||
          /^\d+[\.\)]/.test(line);
        if (isHeader) { matched = sec.key; break; }
      }
    }

    if (matched) {
      flush();
      currentKey = matched;
      currentLines = [];
      // Capture inline content after colon
      const ci = Math.max(line.lastIndexOf("���"), line.lastIndexOf(":"));
      if (ci !== -1 && ci < line.length - 1) {
        const inline = line.slice(ci + 1).trim();
        if (inline && inline.length > 1) currentLines.push(inline);
      }
    } else if (currentKey) {
      if (!/^[-=─━＝]{3,}$/.test(line)) currentLines.push(line);
    }
  }
  flush();
  return parsed;
}

function buildCardFromImport(parsed, existingLabel) {
  const NA = "要確認";
  const g = k => (parsed[k] && parsed[k].trim()) ? parsed[k].trim() : NA;
  const gList = k => {
    const v = parsed[k];
    if (!v || !v.trim()) return [NA];
    return v.split(/\n|[・、,，]/).map(s => s.replace(/^[-・\d\.]\s*/, "").trim()).filter(Boolean);
  };

  const category = g("category");
  const name = g("productName") !== NA ? g("productName") : (existingLabel || NA);

  return {
    // 基本
    name,
    brand:        g("brand"),
    category:     category !== NA ? category : "",
    mainCategory: category !== NA ? category : "ガジェ��ト",
    subCategory:  "",
    productType:  g("catchphrase"),
    priceRange:   "",

    // UpGear思想フィールド
    judgmentReducer:       g("purpose"),
    whatIsThis:            g("purpose"),
    whatItSolves:          g("targetProblem"),
    forWho:                g("forWho"),
    notForWho:             gList("notForWho"),
    strengths:             gList("strengths"),
    weaknesses:            gList("weaknesses"),
    dailyFrictionReduced:  gList("targetProblem"),
    continuityReason:      "",
    vsAlternatives:        g("competitors"),
    tiktokAngles:          gList("tiktokAngles"),
    avoidExpressions:      gList("avoidExpressions"),
    useScenes:             [],

    // 評価
    verdict:      "要確認",
    verdictReason: g("upgearEval"),
    upgearScore:  70,

    // カテゴリ信頼度
    categoryConfidence: category !== NA ? 85 : 40,
    categorySource:     "インポート（ChatGPT）",
    categoryChain:      category !== NA ? [category] : [],
    categoryCandidates: [],

    // 商品理解サマリー
    summary: {
      productName:    name,
      brand:          g("brand"),
      category:       category,
      purpose:        g("purpose"),
      mainFeatures:   gList("features"),
      targetUser:     g("forWho"),
      priceRange:     "",
      reviewSummary:  NA,
      complaints:     gList("weaknesses"),
      upgearValue:    g("upgearEval"),
      misjudgmentRisk: NA,
      confidence:     75,
    },

    // レビュー（インポート）
    reviewData: {
      avg: null, count: null,
      highEval: gList("positiveReviews"),
      lowEval:  gList("negativeReviews"),
      longTerm: "",
      positive: gList("positiveReviews"),
      negative: gList("negativeReviews"),
    },

    // 商品理解追加フィールド（ProductUnderstandingページ用）
    understanding: {
      rakutenReview:   g("rakutenReview"),
      amazonReview:    g("amazonReview"),
      positiveReviews: g("positiveReviews"),
      negativeReviews: g("negativeReviews"),
      reviewSummary:   g("reviewSummary"),
      tiktokTrends:    g("tiktokTrends"),
      tiktokPattern:   g("tiktokPattern"),
      differentiation: g("differentiation"),
      marketPosition:  g("marketPosition"),
    },

    // メタ
    searchKeywords:  [],
    dataQuality:     "imported",
    dataQualityNote: "ChatGPTイン��ートデータ",
    inferenceMethod: "手動インポート（ChatGPT）",
    visionUsed:      false,
    rakuten:         null,
    fetchSources:    [],
    rawBreadcrumbs:  [],
    rawCategory:     [],

    understandingScore: 75,
    missingFields:      [],

    importedFrom: "chatgpt",
    importedAt:   Date.now(),
  };
}

// ─── Step 2 Import Mode ─────────��──────────────────────────────────────────────

function Step2Import({ item, onComplete, onSwitchAuto }) {
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState(null);
  const [draft, setDraft] = useState(null);
  const [parseError, setParseError] = useState("");

  const handleParse = () => {
    if (!text.trim()) { setParseError("テキストを貼り付けてください"); return; }
    setParseError("");
    const p = parseImportText(text);
    const detectedCount = Object.keys(p).length;
    if (detectedCount === 0) {
      setParseError("セクションを検出できませんでした。「商品カテゴリ：」「強み：」など見出しを含む形式を貼り付けてください。");
      return;
    }
    setParsed(p);
    const card = buildCardFromImport(p, item?.label);
    // build editable draft: all 15 fields as strings
    const d = {};
    for (const f of IMPORT_FIELDS) {
      d[f.key] = p[f.key] || "";
    }
    setDraft(d);
  };

  const handleComplete = () => {
    const merged = { ...parsed, ...draft };
    const card = buildCardFromImport(merged, item?.label);
    onComplete(card);
  };

  const setField = (k, v) => setDraft(prev => ({ ...prev, [k]: v }));

  const detectedCount = parsed ? Object.values(parsed).filter(v => v && v.trim()).length : 0;

  const taBase = {
    width: "100%", background: "var(--bg)", border: "1px solid var(--border)",
    color: "var(--text)", fontFamily: "var(--font-mono)", fontSize: 11,
    padding: "6px 10px", resize: "vertical", boxSizing: "border-box",
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>商品理解インポート</h2>
          <p style={{ fontSize: 12, color: "var(--text-dim)" }}>
            ChatGPTで作成した商品理解テキストを貼り付けて、商品カルテに変換します
          </p>
        </div>
        <button onClick={onSwitchAuto} style={{ fontSize: 10, color: "var(--text-dim)", background: "none", border: "1px solid var(--border)", padding: "4px 12px", cursor: "pointer" }}>
          ← 自動解析に切り替え
        </button>
      </div>

      {/* Paste area */}
      {!draft && (
        <div>
          <div style={{ fontSize: 10, color: "var(--text-dim)", marginBottom: 6, letterSpacing: "0.1em" }}>
            ChatGPT出力テキストを貼り付け — 「商���カテゴリ：」「強み：」などの見出しが含まれていれば自動認識します
          </div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={"例:\n商品カテ���リ：ワイヤレスイヤホン\n何をする商品か：外音遮断とANC機能により、通勤・在宅の集中環境をワンタップで作れる\n強み：\n・業界最高水準のANC性能\n・30時間のバッテリー\n...\n"}
            style={{ ...taBase, minHeight: 260, marginBottom: 12, fontSize: 12, lineHeight: 1.6 }}
          />
          {parseError && (
            <div style={{ fontSize: 11, color: "#e06c75", marginBottom: 10 }}>{parseError}</div>
          )}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button
              onClick={handleParse}
              disabled={!text.trim()}
              style={{
                background: text.trim() ? "var(--accent)" : "var(--bg2)",
                color: text.trim() ? "#1e2127" : "var(--text-dim)",
                border: "none", padding: "10px 28px", fontSize: 13,
                fontWeight: 700, cursor: text.trim() ? "pointer" : "not-allowed",
                fontFamily: "var(--font-mono)",
              }}
            >
              読み込む →
            </button>
          </div>
        </div>
      )}

      {/* Editable fields after parse */}
      {draft && (
        <div>
          <div style={{ background: "rgba(152,195,121,0.08)", border: "1px solid rgba(152,195,121,0.3)", padding: "10px 14px", marginBottom: 16, fontSize: 11 }}>
            <span style={{ color: "#98c379", fontWeight: 700 }}>✓ {detectedCount}項目を検出</span>
            <span style={{ color: "var(--text-dim)", marginLeft: 12 }}>
              「要確認」の項目を手動で編集してください
            </span>
            <button onClick={() => { setParsed(null); setDraft(null); }} style={{ float: "right", fontSize: 10, color: "var(--text-dim)", background: "none", border: "1px solid var(--border)", padding: "1px 8px", cursor: "pointer" }}>
              貼り直す
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {IMPORT_FIELDS.map(f => {
              const val = draft[f.key] || "";
              const isEmpty = !val.trim();
              const isNA = val.trim() === "要確認";
              return (
                <div key={f.key} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ width: 150, flexShrink: 0, paddingTop: 7 }}>
                    <div style={{ fontSize: 10, color: isEmpty || isNA ? "#e06c75" : "var(--text-dim)" }}>
                      {isEmpty || isNA ? "⚠ " : "✓ "}{f.label}
                    </div>
                  </div>
                  <textarea
                    value={val}
                    onChange={e => setField(f.key, e.target.value)}
                    rows={f.multi ? 3 : 1}
                    style={{
                      ...taBase,
                      borderColor: isEmpty || isNA ? "rgba(224,108,117,0.4)" : "var(--border)",
                      minHeight: f.multi ? 56 : 30,
                    }}
                    placeholder={`${f.label}を入力（空欄可）`}
                  />
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: 16 }}>
            <div style={{ fontSize: 11, color: "var(--text-dim)" }}>
              保存後に台本作成・ReadyAI反映まで使用できます
            </div>
            <button
              onClick={handleComplete}
              style={{ background: "var(--accent)", color: "#1e2127", border: "none", padding: "10px 28px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-mono)" }}
            >
              確認画面へ →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ──��� Step 2: 商品理解（Playwright + Claude API） ──────────────────────────────

const REAL_STAGES = [
  { id: "init",    label: "URL解析・準備" },
  { id: "rakuten", label: "楽天API（商品名・価格・レビュー）" },
  { id: "fetch",   label: "ページ取得（Playwright）" },
  { id: "parse",   label: "DOM解析" },
  { id: "schema",  label: "スキーマ取得（JSON-LD / schema.org）" },
  { id: "reviews", label: "レビュー収集" },
  { id: "vision",  label: "Vision解析" },
  { id: "analyze", label: "AI商品理解（Claude）" },
  { id: "score",   label: "カルテ生成・スコア算出" },
];

function ConfidenceBadge({ confidence }) {
  const color = confidence >= 95 ? "#98c379" : confidence >= 70 ? "var(--accent)" : "#e06c75";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ fontSize: 11, color, fontWeight: 700 }}>{confidence}%</div>
      <div style={{ fontSize: 10, color: "var(--text-dim)" }}>
        {confidence >= 95 ? "自動確定" : "要確認"}
      </div>
    </div>
  );
}

function SummaryCard({ summary, categoryConfidence, categoryCandidates }) {
  if (!summary) return null;

  const conf = summary.confidence ?? categoryConfidence ?? 0;
  const confColor = conf >= 90 ? "#98c379" : conf >= 70 ? "var(--accent)" : "#e06c75";

  const Row = ({ label, value, warn }) => (
    <div style={{ display: "flex", gap: 10, padding: "6px 0", borderBottom: "1px solid var(--border)", alignItems: "flex-start" }}>
      <div style={{ fontSize: 10, color: "var(--text-dim)", width: 100, flexShrink: 0 }}>{label}</div>
      <div style={{ flex: 1, fontSize: 11, color: warn ? "#e06c75" : "var(--text)", lineHeight: 1.5 }}>
        {value || <span style={{ color: "#e06c75" }}>— 未取得</span>}
      </div>
    </div>
  );

  return (
    <div style={{ background: "var(--bg2)", border: "2px solid var(--accent)", padding: "16px 20px", marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: "var(--accent)", letterSpacing: "0.15em" }}>商品理解サマリー</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: confColor }}>{conf}<span style={{ fontSize: 11 }}>%</span></div>
          <div style={{ fontSize: 10, color: "var(--text-dim)" }}>理解信頼度</div>
        </div>
      </div>
      <div style={{ height: 4, background: "var(--border)", marginBottom: 14 }}>
        <div style={{ width: `${conf}%`, height: "100%", background: confColor, transition: "width 0.6s ease" }} />
      </div>

      <Row label="商品名" value={summary.productName} />
      <Row label="ブランド" value={summary.brand} />
      <Row
        label="商品カテゴリ"
        value={summary.category === "不明" || !summary.category
          ? (categoryCandidates?.length
              ? `不明 — 候補: ${categoryCandidates.join(" / ")}`
              : "不明")
          : summary.category}
        warn={!summary.category || summary.category === "不明"}
      />
      <Row label="何に使うか" value={summary.purpose} />
      <Row label="主な機能" value={summary.mainFeatures?.join(" / ")} />
      <Row label="想定ユーザー" value={summary.targetUser} />
      <Row label="価格帯" value={summary.priceRange} />
      <Row label="口コミ評価" value={summary.reviewSummary} />
      <Row label="不満点" value={summary.complaints?.join(" / ")} />
      <Row label="UpGear装備価値" value={summary.upgearValue} />
      <Row label="誤認リスク" value={summary.misjudgmentRisk} />
    </div>
  );
}

function DebugPanel({ debug, categoryInfo, visible }) {
  if (!visible || !debug) return null;
  return (
    <div style={{ background: "#1a1d24", border: "1px solid #444", padding: "12px 14px", marginBottom: 16, fontSize: 10 }}>
      <div style={{ color: "#98c379", marginBottom: 8, letterSpacing: "0.15em" }}>DEBUG — 商品理解ログ</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div>
          <div style={{ color: "#98c379", marginBottom: 4 }}>✔ 取得成功</div>
          {(debug.found || []).map(f => <div key={f} style={{ color: "#98c379", padding: "1px 0" }}>✔ {f}</div>)}
        </div>
        <div>
          <div style={{ color: "#e06c75", marginBottom: 4 }}>✖ 取得失敗</div>
          {(debug.missing || []).map(m => <div key={m} style={{ color: "#e06c75", padding: "1px 0" }}>✖ {m}</div>)}
        </div>
      </div>
      {categoryInfo && (
        <div style={{ marginTop: 8, borderTop: "1px solid #333", paddingTop: 8 }}>
          <div style={{ color: "var(--accent)", marginBottom: 4 }}>カテゴリ判定</div>
          <div style={{ color: "var(--text)" }}>{categoryInfo.category || "未取得"}</div>
          <div style={{ color: "var(--text-dim)", marginTop: 2 }}>
            根拠: {(categoryInfo.sources || []).join(" → ") || "なし"}　信頼度: {categoryInfo.confidence || 0}%
          </div>
        </div>
      )}
    </div>
  );
}

function Step2({ urls, item, onComplete, onBack }) {
  const [mode, setMode] = useState("auto"); // "auto" | "import"

  if (mode === "import") {
    return <Step2Import item={item} onComplete={onComplete} onSwitchAuto={() => setMode("auto")} />;
  }

  return <Step2Auto urls={urls} item={item} onComplete={onComplete} onBack={onBack} onSwitchImport={() => setMode("import")} />;
}

function Step2Auto({ urls, item, onComplete, onBack, onSwitchImport }) {
  const [stageStatus, setStageStatus] = useState({});
  const [progressLog, setProgressLog] = useState([]);
  const [done, setDone] = useState(false);
  const [card, setCard] = useState(null);
  const [error, setError] = useState(null);
  const [debugData, setDebugData] = useState(null);
  const [showDebug, setShowDebug] = useState(false);
  const [requiresConfirmation, setRequiresConfirmation] = useState(false);
  const [confidence, setConfidence] = useState(null);
  const [dataSource, setDataSource] = useState(null);
  const [playwrightOk, setPlaywrightOk] = useState(null);
  const [serverAvailable, setServerAvailable] = useState(null);
  const [categoryUnknown, setCategoryUnknown] = useState(false);
  const abortRef = useRef(null);

  const urlCount = Object.values(urls).filter(Boolean).length;

  useEffect(() => {
    let cancelled = false;

    const setStage = (id, status) => {
      if (!cancelled) setStageStatus(prev => ({ ...prev, [id]: status }));
    };
    const addLog = (msg) => {
      if (!cancelled) setProgressLog(prev => [...prev.slice(-8), msg]);
    };

    const runReal = async () => {
      // Check server
      try {
        const health = await fetch("/api/health", { signal: AbortSignal.timeout(2000) });
        if (!health.ok) throw new Error();
        setServerAvailable(true);
      } catch {
        setServerAvailable(false);
        runFallback();
        return;
      }

      setStage("init", "running");
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const resp = await fetch("/api/product/understand", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ urls, item }),
          signal: controller.signal,
        });

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";

        while (true) {
          const { done: streamDone, value } = await reader.read();
          if (streamDone || cancelled) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop();
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const evt = JSON.parse(line.slice(6));
              if (evt.type === "stage") {
                setStage(evt.id, evt.status);
                if (evt.detail) addLog(evt.detail);
              } else if (evt.type === "progress") {
                addLog(evt.detail);
              } else if (evt.type === "rawDebug") {
                setDebugData({ debug: evt.debug, categoryInfo: evt.categoryInfo });
              } else if (evt.type === "rakutenResult") {
                addLog(`楽天: ${evt.rakuten?.best?.name?.slice(0, 30) || "取得済み"} / ¥${evt.rakuten?.best?.price?.toLocaleString() || "—"} / レビュー${evt.rakuten?.best?.reviewCount || 0}件`);
              } else if (evt.type === "card") {
                if (!cancelled) setCard(evt.card);
              } else if (evt.type === "done") {
                setRequiresConfirmation(evt.requiresConfirmation);
                setConfidence(evt.confidence);
                setDataSource(evt.dataSource || null);
                setPlaywrightOk(evt.playwrightOk !== false);
                if (!cancelled) setDone(true);
                // カテゴリ不明チェック: confidence<=50 or category="不明"
                const cardEvt = evt.card;
                const catConf = evt.confidence ?? 0;
                const catVal = cardEvt?.summary?.category || cardEvt?.category;
                if (catConf <= 50 || !catVal || catVal === "不明") {
                  setCategoryUnknown(true);
                }
              } else if (evt.type === "error") {
                setError(evt.message);
              }
            } catch {}
          }
        }
      } catch (err) {
        if (!cancelled && err.name !== "AbortError") {
          setError(err.message);
        }
      }
    };

    const runFallback = () => {
      // Server is required — show a blocking error instead of faking results
      setError("バックエンドサーバーが起動していません。\n`cd server && node index.js` を実行してから再試行してください。");
    };

    runReal();
    return () => { cancelled = true; abortRef.current?.abort(); };
  }, []);

  const stages = REAL_STAGES;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
            {done ? "商品理解完了" : "商品を理解しています..."}
          </h2>
          <p style={{ fontSize: 12, color: "var(--text-dim)" }}>
            {done
              ? "商品カルテが生成されました。次のステップへ進んでください。"
              : `${urlCount}件のURLをPlaywrightで解析中`}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {confidence !== null && <ConfidenceBadge confidence={confidence} />}
          <button onClick={() => setShowDebug(v => !v)} style={{
            fontSize: 9, color: "var(--text-dim)", background: "none",
            border: "1px solid var(--border)", padding: "2px 8px", cursor: "pointer",
          }}>
            {showDebug ? "DEBUG ▲" : "DEBUG ▼"}
          </button>
          {!done && (
            <button onClick={onSwitchImport} style={{
              fontSize: 9, color: "var(--accent)", background: "none",
              border: "1px solid var(--accent)", padding: "2px 10px", cursor: "pointer",
            }}>
              テキストインポートに切替
            </button>
          )}
        </div>
      </div>

      {/* Debug panel */}
      <DebugPanel
        debug={debugData?.debug}
        categoryInfo={debugData?.categoryInfo}
        visible={showDebug}
      />

      {/* Progress stages */}
      <div style={{ marginBottom: 16 }}>
        {stages.map((s) => {
          const status = stageStatus[s.id];
          return (
            <div key={s.id} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "8px 12px",
              marginBottom: 4, background: "var(--bg2)", border: `1px solid ${status === "done" ? "rgba(152,195,121,0.3)" : status === "running" ? "var(--accent)" : "var(--border)"}`,
              transition: "border-color 0.2s",
            }}>
              <div style={{ width: 20, textAlign: "center", flexShrink: 0 }}>
                {status === "done"    && <span style={{ color: "#98c379", fontSize: 12 }}>✓</span>}
                {status === "running" && <span style={{ fontSize: 12, color: "var(--accent)" }}>◌</span>}
                {status === "error"   && <span style={{ color: "#e06c75", fontSize: 12 }}>✗</span>}
                {!status              && <span style={{ color: "var(--border)", fontSize: 12 }}>○</span>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: status === "done" ? "var(--text)" : status === "running" ? "var(--accent)" : "var(--text-dim)" }}>
                  {s.label}
                </div>
              </div>
              {status === "running" && (
                <div style={{ width: 40, height: 2, background: "var(--border)", overflow: "hidden" }}>
                  <div style={{ width: "40%", height: "100%", background: "var(--accent)", animation: "progress-bar 0.8s linear infinite" }} />
                </div>
              )}
              {status === "done" && <span style={{ fontSize: 9, color: "#98c379" }}>完了</span>}
            </div>
          );
        })}
      </div>

      {/* Progress log */}
      {progressLog.length > 0 && (
        <div style={{ background: "#1a1d24", border: "1px solid var(--border)", padding: "8px 12px", marginBottom: 16, fontSize: 10, fontFamily: "var(--font-mono)", maxHeight: 80, overflowY: "auto" }}>
          {progressLog.map((log, i) => (
            <div key={i} style={{ color: "var(--text-dim)", padding: "1px 0" }}>› {log}</div>
          ))}
        </div>
      )}

      {/* Server status */}
      {serverAvailable === false && (
        <div style={{ background: "rgba(255,107,0,0.08)", border: "1px solid var(--accent)", padding: "8px 12px", marginBottom: 16, fontSize: 11, color: "var(--accent)" }}>
          ⚠ バックエンドサーバー未起動 — ローカル推論で実行中<br />
          <span style={{ fontSize: 10, color: "var(--text-dim)" }}>本番: cd server && node index.js を実行し、ANTHROPIC_API_KEY を設定してください</span>
        </div>
      )}

      {/* Playwright失敗 — 楽天APIフォールバック通知 */}
      {done && playwrightOk === false && (
        <div style={{ background: "rgba(255,193,7,0.08)", border: "1px solid rgba(255,193,7,0.4)", padding: "10px 14px", marginBottom: 16, fontSize: 11 }}>
          <div style={{ color: "#ffc107", fontWeight: 600, marginBottom: 4 }}>⚠ Playwrightが使用できませんでした</div>
          <div style={{ color: "var(--text-dim)", lineHeight: 1.6 }}>
            Chromiumが未インストールです。楽天APIデータのみで商品カルテを生成しました。<br />
            <strong style={{ color: "var(--text)" }}>データソース: {dataSource || "楽天APIのみ"}</strong><br />
            <span style={{ fontSize: 10 }}>
              完全な解析には以下を実行してください:<br />
              <code style={{ background: "var(--bg2)", padding: "1px 6px", userSelect: "all" }}>cd upgear-app &amp;&amp; npx playwright install chromium</code>
            </span>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ background: "rgba(224,108,117,0.1)", border: "1px solid #e06c75", padding: "12px", marginBottom: 16, fontSize: 12, color: "#e06c75" }}>
          エラー: {error}
        </div>
      )}

      {/* Category unknown blocker */}
      {done && card && categoryUnknown && (
        <div style={{ background: "rgba(224,108,117,0.08)", border: "2px solid #e06c75", padding: "14px 18px", marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: "#e06c75", fontWeight: 700, marginBottom: 6 }}>
            カテゴリが確定できませんでした
          </div>
          <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 8 }}>
            信頼度: <strong style={{ color: "#e06c75" }}>{confidence}%</strong>　カテゴリ: <strong style={{ color: "var(--text)" }}>{card.summary?.category || card.category || "不明"}</strong>
          </div>
          {card.categoryCandidates?.length > 0 && (
            <div style={{ fontSize: 11, color: "var(--text)" }}>
              候補: <strong>{card.categoryCandidates.join(" / ")}</strong> — どれですか？
            </div>
          )}
          <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 6 }}>
            「カテゴリを修正する」でカテゴリを手動指定するか、「商品情報を再取得する」でURLを追加してください。
          </div>
        </div>
      )}

      {/* Summary card */}
      {done && card && (
        <SummaryCard
          summary={card.summary}
          categoryConfidence={card.categoryConfidence}
          categoryCandidates={card.categoryCandidates}
        />
      )}

      {done && card && (
        <div>
          <UnderstandingScore score={card.understandingScore} missing={card.missingFields || []} />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap", marginTop: 8 }}>
            <Btn small onClick={() => onBack()}>← URL修正</Btn>
            <Btn small onClick={() => {
              // カテゴリ修正: categoryUnknown をリセットして確認画面へ（Step3 で手動修正）
              setCategoryUnknown(false);
              onComplete({ ...card, _needsCategoryFix: true });
            }}>
              カテゴリを修正する
            </Btn>
            <Btn small onClick={() => {
              // 商品情報を再取得: Step1へ戻る
              setDone(false);
              setCard(null);
              setError(null);
              setStageStatus({});
              setProgressLog([]);
              setCategoryUnknown(false);
              onBack();
            }}>
              商品情報を再取得する
            </Btn>
            <Btn variant="primary" disabled={categoryUnknown} onClick={() => onComplete(card)}
              style={categoryUnknown ? { opacity: 0.4, cursor: "not-allowed" } : {}}>
              この理解で台本生成する →
            </Btn>
          </div>
          {categoryUnknown && (
            <div style={{ fontSize: 10, color: "#e06c75", textAlign: "right", marginTop: 6 }}>
              カテゴリを確定してから台本生成してください
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Step 3: 確認 ────────────────────────────────────────────────────────────

function Step3({ card, item, categories, onConfirm, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    name:         card.name,
    brand:        card.brand,
    mainCategory: card.mainCategory || card.category || "ガジェット",
    subCategory:  card.subCategory || "",
    price:        item.price || "",
    judgment:     item.judgment || "保留",
    score:        item.score || 70,
  });

  const set = (k, v) => setDraft((prev) => ({ ...prev, [k]: v }));

  const inputStyle = {
    background: "var(--bg2)", border: "1px solid var(--border)",
    color: "var(--text)", fontFamily: "var(--font-mono)", fontSize: 12,
    padding: "6px 10px", width: "100%",
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>商品カルテを確認</h2>
        <p style={{ fontSize: 12, color: "var(--text-dim)" }}>
          AIが理解した内容を確認してください。修正が必要な場合は編集してください。
        </p>
      </div>

      <UnderstandingScore score={card.understandingScore} missing={card.missingFields || []} />

      {/* Basic info */}
      <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", padding: "16px", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <SectionLabel>基本情報</SectionLabel>
          <button onClick={() => setEditing(!editing)} style={{ fontSize: 10, color: "var(--accent)", background: "none", border: "1px solid var(--accent)", padding: "2px 10px", cursor: "pointer" }}>
            {editing ? "プレビュー" : "編集"}
          </button>
        </div>

        {editing ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            {[["商品名", "name"], ["ブランド", "brand"], ["価格", "price"], ["スコア", "score"]].map(([l, k]) => (
              <div key={k}>
                <label style={{ fontSize: 10, color: "var(--text-dim)", display: "block", marginBottom: 4 }}>{l}</label>
                <input value={draft[k]} onChange={(e) => set(k, e.target.value)} style={inputStyle} />
              </div>
            ))}
            <div>
              <label style={{ fontSize: 10, color: "var(--text-dim)", display: "block", marginBottom: 4 }}>大カテゴリ</label>
              <select value={draft.mainCategory} onChange={(e) => { set("mainCategory", e.target.value); set("subCategory", ""); }} style={inputStyle}>
                <option value="">（未選択）</option>
                {(categories?.mainCategories || []).map((m) => <option key={m.id} value={m.name}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 10, color: "var(--text-dim)", display: "block", marginBottom: 4 }}>小カテゴリ</label>
              <select value={draft.subCategory} onChange={(e) => set("subCategory", e.target.value)} style={inputStyle}>
                <option value="">（未選択）</option>
                {((categories?.mainCategories || []).find(m => m.name === draft.mainCategory)?.subCategories || []).map((s) => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 10, color: "var(--text-dim)", display: "block", marginBottom: 4 }}>判定</label>
              <select value={draft.judgment} onChange={(e) => set("judgment", e.target.value)} style={inputStyle}>
                {J_OPTIONS.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}
              </select>
            </div>
          </div>
        ) : (
          <>
            <CardRow label="商品名" value={draft.name} accent />
            <CardRow label="ブランド" value={draft.brand} />
            <CardRow label="カテゴリ" value={`${draft.mainCategory}${draft.subCategory ? " > " + draft.subCategory : ""}`} />
            <CardRow label="商品タイプ" value={card.productType} />
            <CardRow label="価格" value={draft.price ? `¥${Number(draft.price).toLocaleString()}` : "—"} />
            <CardRow label="UpGear判定" value={draft.judgment} />
            <CardRow label="スコア" value={`${draft.score}点`} />
          </>
        )}
      </div>

      {/* Category evidence panel */}
      {(card.categoryChain?.length > 0 || card.categorySource) && (
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", padding: "14px 16px", marginBottom: 16 }}>
          <SectionLabel>カテゴリ判定根拠</SectionLabel>
          {card.categoryChain?.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
              {card.categoryChain.map((c, i) => (
                <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 12, color: i === card.categoryChain.length - 1 ? "var(--accent)" : "var(--text)", fontWeight: i === card.categoryChain.length - 1 ? 700 : 400 }}>{c}</span>
                  {i < card.categoryChain.length - 1 && <span style={{ color: "var(--border)" }}>›</span>}
                </span>
              ))}
            </div>
          )}
          <div style={{ fontSize: 10, color: "var(--text-dim)", marginBottom: 6 }}>
            取得元: {card.categorySource || "—"}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 10, color: "var(--text-dim)" }}>信頼度:</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: (card.categoryConfidence || 0) >= 95 ? "#98c379" : "var(--accent)" }}>
              {card.categoryConfidence || 0}%
            </span>
            <span style={{ fontSize: 10, color: (card.categoryConfidence || 0) >= 95 ? "#98c379" : "var(--accent)" }}>
              {(card.categoryConfidence || 0) >= 95 ? "✓ 自動確定" : "⚠ 要確認"}
            </span>
          </div>
          {card.visionUsed && card.visionProductType && (
            <div style={{ marginTop: 6, fontSize: 10, color: "#6fa8dc" }}>
              Vision: {card.visionProductType}（{card.visionCategory}）
            </div>
          )}
        </div>
      )}

      {/* Product understanding */}
      <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", padding: "16px", marginBottom: 16 }}>
        <SectionLabel>商品理解</SectionLabel>
        <CardRow label="この商品は何か" value={card.whatIsThis} />
        <CardRow label="何を解決するか" value={card.whatItSolves} />
        <CardRow label="向いている人" value={card.forWho} />
        <CardRow label="向いていない人" value={(card.notForWho || []).join(" / ") || "—"} />
        <CardRow label="強み" value={(card.strengths || []).slice(0, 2).join("、")} />
        <CardRow label="弱み" value={(card.weaknesses || []).slice(0, 2).join("、")} />
        {card.useScenes?.length > 0 && (
          <CardRow label="使用シーン" value={card.useScenes.slice(0, 3).join("、")} />
        )}
      </div>

      {/* Review summary */}
      <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", padding: "16px", marginBottom: 16 }}>
        <SectionLabel>レビュー分析</SectionLabel>
        <CardRow label="評価" value={`★${card.reviewData?.avg} / ${card.reviewData?.count?.toLocaleString()}件`} accent />
        <CardRow label="高評価理由" value={(card.reviewData?.highEval || []).join("、")} />
        <CardRow label="低評価理由" value={(card.reviewData?.lowEval || []).join("、")} />
        <CardRow label="長期使用評価" value={card.reviewData?.longTerm} />
      </div>

      {/* Keywords */}
      <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", padding: "16px", marginBottom: 24 }}>
        <SectionLabel>検索キーワード（市場調査で使用）</SectionLabel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {(card.searchKeywords || []).map((kw) => (
            <span key={kw} style={{ fontSize: 11, background: "var(--bg3)", border: "1px solid var(--border)", padding: "3px 10px", color: "var(--text)" }}>
              {kw}
            </span>
          ))}
        </div>
      </div>

      <div style={{ padding: "16px", background: "var(--bg2)", border: "1px solid var(--accent)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>この内容でストックに登録しますか？</div>
          <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>
            カテゴリ: <strong>{draft.mainCategory}</strong> ／ {draft.subCategory || "—"} ／ 市場: {card.productType}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={() => setEditing(true)}>修正</Btn>
          <Btn variant="primary" onClick={() => onConfirm(draft, card)}>登録 →</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── Step 4: ストック保存完了 ─────────────────────────────────────────────────

function Step4({ savedItem, onNext }) {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>✓</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: "#98c379" }}>ストックに保存しました</h2>
        <p style={{ fontSize: 12, color: "var(--text-dim)" }}>
          商品カルテがストックデータベースに保存されました。
        </p>
      </div>

      <div style={{ background: "var(--bg2)", border: "1px solid #98c379", padding: "16px", marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: "#98c379" }}>{savedItem.label}</div>
        {[
          ["カテゴリ", `${savedItem.mainCategory || savedItem.category}${savedItem.subCategory ? " > " + savedItem.subCategory : ""}`],
          ["ブランド", savedItem.card?.brand || "—"],
          ["スコア", `${savedItem.score}点`],
          ["商品理解スコア", `${savedItem.card?.understandingScore}点`],
          ["URL数", `${savedItem.card?.urlCount || 0}件`],
        ].map(([l, v]) => (
          <div key={l} style={{ display: "flex", gap: 12, padding: "4px 0", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontSize: 10, color: "var(--text-dim)", width: 110 }}>{l}</span>
            <span style={{ fontSize: 11 }}>{v}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 11, color: "var(--text-dim)" }}>
          次のステップ: 制作スタジオで台本を作成します
        </div>
        <Btn variant="primary" onClick={onNext}>制作スタジオへ →</Btn>
      </div>
    </div>
  );
}

// ─── Step 5: 制作スタジオ引き継ぎ ───────────────────────────────────────────────

function Step5({ savedItem, onComplete }) {
  const u = savedItem?.understanding || {};
  const hasUnderstanding = Object.values(u).some(v => v?.trim?.());

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>制作スタジオへ引き継ぎ</h2>
        <p style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.7 }}>
          商品を保存しました。制作スタジオでTikTok台本を作成できます。
        </p>
      </div>

      {!hasUnderstanding && (
        <div style={{ background: "rgba(229,192,123,0.1)", border: "1px solid #e5c07b", padding: "12px 16px", marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: "#e5c07b", fontWeight: 600, marginBottom: 4 }}>
            商品理解データ未入力
          </div>
          <div style={{ fontSize: 11, color: "var(--text-dim)" }}>
            「商品理解」ページで商品理解データを入力すると、制作スタジオの台本品質が向上します。
          </div>
        </div>
      )}

      {hasUnderstanding && (
        <div style={{ background: "rgba(152,195,121,0.08)", border: "1px solid rgba(152,195,121,0.3)", padding: "12px 16px", marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: "#98c379", fontWeight: 600, marginBottom: 4 }}>◍ 商品理解データ読み込み済み</div>
          {u.name      && <div style={{ fontSize: 11, color: "var(--text-dim)" }}>商品名: {u.name}</div>}
          {u.oneLiner  && <div style={{ fontSize: 11, color: "var(--text-dim)" }}>一言まとめ: {u.oneLiner}</div>}
          {u.tiktokAngles && <div style={{ fontSize: 11, color: "var(--text-dim)" }}>TikTok訴求: {u.tiktokAngles?.slice(0, 60)}...</div>}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <Btn onClick={onComplete}>制作スタジオへ →</Btn>
      </div>
    </div>
  );
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────

export default function ItemWizard({ existingItem, categories, onSave, onGoToStudio, onClose }) {
  const hasExistingUrls = existingItem && Object.values(existingItem.urls || {}).some(Boolean);
  const [step, setStep] = useState(hasExistingUrls ? 2 : 1);
  const [urls, setUrls] = useState(existingItem?.urls || { official: "", amazon: "", rakuten: "", kakaku: "", review: "" });
  const [card, setCard] = useState(existingItem?.card || null);
  const [savedItem, setSavedItem] = useState(existingItem || null);

  const handleStep2Complete = (generatedCard) => {
    setCard(generatedCard);
    setStep(3);
  };

  const handleStep3Confirm = (draft, confirmedCard) => {
    const upgearScore = Number(draft.score) || 70;

    // ─ 解析ステータスを決定 ─────────────────────────────────
    const missingReasons = [];
    const rb = confirmedCard.rakuten;
    if (!rb?.price)          missingReasons.push("楽天API不足: 価格");
    if (!rb?.reviewCount)    missingReasons.push("楽天API不足: レビュー件数");
    if (!rb?.url)            missingReasons.push("楽天API不足: 楽天URL");
    if (!confirmedCard.brand || confirmedCard.brand === "不明")
                             missingReasons.push("Playwright不足: ブランド");
    if (!confirmedCard.whatIsThis)
                             missingReasons.push("AI未生成: 商品説明");
    if ((confirmedCard.strengths || []).length < 2)
                             missingReasons.push("AI未生成: 強み");

    let analysisStatus;
    if (missingReasons.length >= 4)          analysisStatus = "要確認";
    else if (upgearScore >= 80)              analysisStatus = "認定";
    else if (upgearScore >= 70)              analysisStatus = "条件付き";
    else if (upgearScore < 60 && confirmedCard.whatIsThis)
                                             analysisStatus = "非認定";
    else                                     analysisStatus = "要確認";

    const item = {
      ...(existingItem || {}),
      id:       existingItem?.id || `item_${Date.now()}`,
      no:       existingItem?.no || "—",
      label:        draft.name,
      brand:        draft.brand,
      mainCategory: draft.mainCategory,
      category:     draft.mainCategory,  // 後方互換
      subCategory:  draft.subCategory || confirmedCard.subCategory,
      score:    upgearScore,
      price:    String(draft.price).replace(/[¥,]/g, ""),
      judgment: draft.judgment,
      urls,
      card:     { ...confirmedCard, name: draft.name, brand: draft.brand, mainCategory: draft.mainCategory, category: draft.mainCategory },
      stock:    existingItem?.stock || { situation: "", hook: "", reveal: "", change: "", good: "", ng1: "", ng2: "", conclusion: "" },
      // 拡張フィールド
      analysisStatus,
      missingReasons,
      analysisAt: Date.now(),
      rakuten: rb ? {
        name:          rb.name,
        price:         rb.price,
        imageUrl:      rb.imageUrl,
        url:           rb.url,
        reviewCount:   rb.reviewCount,
        reviewAverage: rb.reviewAverage,
        shopName:      rb.shopName,
      } : null,
    };
    onSave(item);
    setSavedItem(item);
    setStep(4);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "flex-start", justifyContent: "center",
      padding: "20px", overflowY: "auto",
    }}>
      <div style={{
        background: "var(--bg)", border: "1px solid var(--border)",
        width: "100%", maxWidth: 760,
        padding: "32px", position: "relative",
        minHeight: 500,
      }}>
        {/* Close */}
        <button onClick={onClose} style={{
          position: "absolute", top: 16, right: 16,
          background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", fontSize: 18,
        }}>✕</button>

        {/* Header */}
        <div style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.2em", marginBottom: 8 }}>
          UPGEAR / 商品登録ウィザード
        </div>
        <StepBar current={step} />

        {/* Step content */}
        {step === 1 && <Step1 urls={urls} setUrls={setUrls} onNext={() => setStep(2)} />}
        {step === 2 && (
          <Step2
            urls={urls}
            item={existingItem || { label: "", score: 70, price: "", judgment: "保留" }}
            onComplete={handleStep2Complete}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && card && (
          <Step3
            card={card}
            item={existingItem || { price: "", judgment: "保留", score: 70 }}
            categories={categories}
            onConfirm={handleStep3Confirm}
            onEdit={() => setStep(1)}
          />
        )}
        {step === 4 && savedItem && (
          <Step4 savedItem={savedItem} onNext={() => setStep(5)} />
        )}
        {step === 5 && savedItem && (
          <Step5
            savedItem={savedItem}
            onComplete={() => { onGoToStudio(savedItem.id); onClose(); }}
          />
        )}
      </div>
    </div>
  );
}
