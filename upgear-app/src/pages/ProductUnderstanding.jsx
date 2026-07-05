import { useState, useEffect, useCallback } from "react";
import { PageHeader, Btn } from "../components/ui";

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
      { key: "price",       label: "価格",          type: "text" },
      { key: "officialUrl", label: "公式URL",       type: "url"  },
      { key: "salesUrl",    label: "販売URL",       type: "url"  },
      { key: "imageUrl",    label: "商品画像URL",   type: "url"  },
    ],
  },
  {
    id: "understanding",
    label: "商品理解",
    color: "var(--accent)",
    fields: [
      { key: "overview",       label: "商品概要",          type: "textarea", rows: 3 },
      { key: "problemSolved",  label: "解決する悩み",      type: "textarea", rows: 3 },
      { key: "features",       label: "主な機能",          type: "textarea", rows: 3 },
      { key: "strengths",      label: "強み",              type: "textarea", rows: 3 },
      { key: "weaknesses",     label: "弱み",              type: "textarea", rows: 3 },
      { key: "forWho",         label: "向いている人",      type: "textarea", rows: 2 },
      { key: "notForWho",      label: "向いていない人",    type: "textarea", rows: 2 },
      { key: "useScenes",      label: "使用シーン",        type: "textarea", rows: 2 },
      { key: "competitors",    label: "競合商品",          type: "textarea", rows: 2 },
    ],
  },
  {
    id: "upgear",
    label: "UPGEAR評��",
    color: "#98c379",
    fields: [
      { key: "gearScore",        label: "装備性（0〜10）",   type: "text" },
      { key: "judgmentReduction",label: "判断削減力（0〜10）",type: "text" },
      { key: "continuity",       label: "継続運用性���0〜10）",type: "text" },
      { key: "costPerformance",  label: "コスパ（0〜10）",   type: "text" },
      { key: "totalScore",       label: "総合点（0〜100）",  type: "text" },
      { key: "evalReason",       label: "評価理由",          type: "textarea", rows: 3 },
      { key: "oneLiner",         label: "一言まとめ",        type: "textarea", rows: 2 },
    ],
  },
  {
    id: "sns",
    label: "SNS用",
    color: "#e5c07b",
    fields: [
      { key: "tiktokAngles",     label: "TikTok訴求",      type: "textarea", rows: 3 },
      { key: "hook",             label: "投稿フック",       type: "textarea", rows: 2 },
      { key: "avoidExpressions", label: "避ける表現",       type: "textarea", rows: 2 },
      { key: "searchKeywords",   label: "検索キーワード",   type: "textarea", rows: 2 },
    ],
  },
  {
    id: "ai",
    label: "AI用",
    color: "#c678dd",
    fields: [
      { key: "chatgptFullText", label: "ChatGPT分析全文",  type: "textarea", rows: 10, large: true },
      { key: "sources",         label: "情報源",           type: "textarea", rows: 2 },
      { key: "missingInfo",     label: "不足情報",         type: "textarea", rows: 2 },
      { key: "createdAt",       label: "作成日時",         type: "readonly" },
      { key: "updatedAt",       label: "更新日時",         type: "readonly" },
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
    name:              card.name        || item.label       || "",
    brand:             card.brand       || item.brand       || "",
    category:          item.mainCategory || card.category   || "",
    price:             item.price       || (rb.price ? `¥${Number(rb.price).toLocaleString()}` : "") || "",
    officialUrl:       item.urls?.official || "",
    salesUrl:          item.urls?.rakuten  || rb.url        || "",
    imageUrl:          rb.imageUrl         || card.rakutenImageUrl || "",

    overview:          card.whatIsThis  || card.judgmentReducer || "",
    problemSolved:     card.whatItSolves || arr(card.dailyFrictionReduced) || "",
    features:          arr(card.strengths),
    strengths:         arr(card.strengths),
    weaknesses:        arr(card.weaknesses),
    forWho:            card.forWho      || "",
    notForWho:         arr(card.notForWho),
    useScenes:         arr(card.useScenes),
    competitors:       card.vsAlternatives || "",

    gearScore:         "",
    judgmentReduction: "",
    continuity:        "",
    costPerformance:   "",
    totalScore:        card.upgearScore != null ? String(card.upgearScore) : "",
    evalReason:        card.verdictReason || "",
    oneLiner:          card.productType  || "",

    tiktokAngles:      arr(card.tiktokAngles),
    hook:              "",
    avoidExpressions:  arr(card.avoidExpressions),
    searchKeywords:    arr(card.searchKeywords),

    chatgptFullText:   card.importedFrom === "chatgpt" && item.card?._rawImportText ? item.card._rawImportText : "",
    sources:           card.inferenceMethod || "",
    missingInfo:       arr(card.missingFields),
    createdAt:         new Date().toLocaleString("ja-JP"),
    updatedAt:         new Date().toLocaleString("ja-JP"),
  };
}

// ─── Copy formatter ───────────────────────────────────────────────────────────

function buildCopyText(name, u) {
  const line = (label, val) => val?.trim() ? `${label}：\n${val.trim()}\n` : "";
  return `# 商品理解データ ― ${name || "商品名未設定"}
生成日時：${u.updatedAt || new Date().toLocaleString("ja-JP")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【基本情報】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
商品名：${u.name || ""}
ブランド：${u.brand || ""}
カテゴリ：${u.category || ""}
価格：${u.price || ""}
公式URL：${u.officialUrl || ""}
販売URL：${u.salesUrl || ""}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【商品理解】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${line("商品概要", u.overview)}
${line("解決する悩み", u.problemSolved)}
${line("主な機能", u.features)}
${line("強み", u.strengths)}
${line("弱み", u.weaknesses)}
${line("向いている人", u.forWho)}
${line("向いていない人", u.notForWho)}
${line("使用シーン", u.useScenes)}
${line("競合商品", u.competitors)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【UPGEAR評価】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
装備性：${u.gearScore || ""}／判断削減力：${u.judgmentReduction || ""}／継続運用性：${u.continuity || ""}／コスパ：${u.costPerformance || ""}
総合点：${u.totalScore || ""}
${line("評価理由", u.evalReason)}
${line("一言まとめ", u.oneLiner)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【SNS用】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${line("TikTok訴求", u.tiktokAngles)}
${line("投稿フック", u.hook)}
${line("避ける表現", u.avoidExpressions)}
${line("検索キーワード", u.searchKeywords)}
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
      <label style={{ width: 130, flexShrink: 0, fontSize: 10, color: "var(--text-dim)", paddingTop: 8 }}>
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
            style={{ ...base, resize: "vertical", lineHeight: 1.6, minHeight: field.large ? 180 : undefined }}
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
  const [saved,   setSaved]   = useState(false);
  const [copied,  setCopied]  = useState(false);
  const [activeSection, setActiveSection] = useState("basic");

  // Re-initialize when item changes
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
    const data = {
      ...u,
      updatedAt: now,
      createdAt: u.createdAt || now,
    };
    setU(data);
    updateItem(item.id, { understanding: data });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCopy = async () => {
    const text = buildCopyText(item?.label || u.name, u);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!item) return (
    <div style={{ padding: 40, textAlign: "center", color: "var(--text-dim)" }}>
      商品が選択されていません
    </div>
  );

  const currentSection = SECTIONS.find(s => s.id === activeSection) || SECTIONS[0];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
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
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
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

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
          <button
            onClick={handleCopy}
            style={{
              fontSize: 11, padding: "7px 16px", cursor: "pointer",
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

      {/* Section tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "1px solid var(--border)", paddingBottom: 0, flexWrap: "wrap" }}>
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            style={{
              fontSize: 11, padding: "8px 16px", cursor: "pointer",
              background: activeSection === s.id ? "var(--bg2)" : "none",
              border: "none",
              borderBottom: activeSection === s.id ? `2px solid ${s.color}` : "2px solid transparent",
              color: activeSection === s.id ? s.color : "var(--text-dim)",
              fontFamily: "var(--font-mono)",
              marginBottom: -1,
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Section content */}
      <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", padding: "24px 28px", marginBottom: 20 }}>
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

      {/* Save bar */}
      <div style={{
        position: "sticky", bottom: 16,
        background: "var(--bg2)", border: "1px solid var(--border)",
        padding: "12px 20px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ fontSize: 11, color: "var(--text-dim)" }}>
          「保存」すると商品データとして台本作成・口コミ分析・ReadyAI反映に使用できます
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleCopy} style={{ fontSize: 11, padding: "6px 14px", cursor: "pointer", background: "none", border: "1px solid var(--border)", color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
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
