import { useState, useCallback } from "react";
import { PageHeader, Card, CardTitle, Tag, Btn, Textarea } from "../components/ui";
import {
  FORMATS,
  TEMPLATES,
  generateAllSlides,
  generateSlidesByArchetypes,
  generateCaption,
  generateHashtags,
  scoreQuality,
  analyzePerformance,
  analyzeSNSPotential,
  REGEN_MODES,
} from "../data/contentAI";
import { getTopRecommendations, runMarketResearch } from "../data/marketResearchAI";

/* ─── helpers ─── */

function optToText(opt) {
  if (!opt) return "";
  if (typeof opt === "string") return opt;
  if (opt.sub !== undefined || opt.main !== undefined) {
    return [opt.sub, opt.main, opt.note].filter(Boolean).join("  /  ");
  }
  return opt.text || "";
}

function optToScript(opt, role) {
  if (!opt) return "";
  if (typeof opt === "string") return opt;
  if (opt.sub !== undefined || opt.main !== undefined) {
    return `サブ: ${opt.sub || ""}\nメイン: ${opt.main || ""}\n補足: ${opt.note || ""}`;
  }
  return opt.text || "";
}

/* ─── sub-components ─── */

function SectionLabel({ children, color = "var(--accent)" }) {
  return (
    <div style={{ fontSize: 10, letterSpacing: "0.14em", color, marginBottom: 10, borderLeft: "2px solid currentColor", paddingLeft: 8 }}>
      {children}
    </div>
  );
}

function SlideOptionCard({ opt, selected, onClick, label }) {
  const text = optToText(opt);
  const isHookFormat = opt && (opt.sub !== undefined || opt.main !== undefined);
  const archetypeColor = opt?.archetypeColor;
  const archetype = opt?.archetype;
  const borderColor = selected ? (archetypeColor || "var(--accent)") : "var(--border)";
  const bgColor = selected ? (archetypeColor ? archetypeColor + "18" : "rgba(255,107,0,0.12)") : "var(--bg2)";
  return (
    <div
      onClick={onClick}
      style={{
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: 4,
        padding: "10px 12px",
        cursor: "pointer",
        transition: "border-color 0.15s, background 0.15s",
        minHeight: 70,
      }}
    >
      <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6 }}>
        {archetype && (
          <span style={{ fontSize: 8, background: archetypeColor || "var(--accent)", color: "#fff", padding: "1px 5px", fontWeight: 700, letterSpacing: "0.08em" }}>
            {archetype}
          </span>
        )}
        <span style={{ fontSize: 9, color: archetypeColor || "var(--accent)", letterSpacing: "0.12em" }}>{label}</span>
      </div>
      {isHookFormat ? (
        <div>
          <div style={{ fontSize: 9, color: "var(--text-dim)", marginBottom: 2 }}>サブ</div>
          <div style={{ fontSize: 11, color: selected ? "var(--text)" : "var(--text-dim)" }}>{opt.sub}</div>
          <div style={{ fontSize: 9, color: "var(--text-dim)", marginTop: 6, marginBottom: 2 }}>メイン</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: selected ? "var(--text)" : "var(--text-dim)" }}>{opt.main}</div>
          {opt.note && <>
            <div style={{ fontSize: 9, color: "var(--text-dim)", marginTop: 6, marginBottom: 2 }}>補足</div>
            <div style={{ fontSize: 11, color: selected ? "var(--text-dim)" : "#50545e" }}>{opt.note}</div>
          </>}
        </div>
      ) : (
        <div style={{ fontSize: 12, color: selected ? "var(--text)" : "var(--text-dim)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{text}</div>
      )}
    </div>
  );
}

function ResearchPanel({ recommendations, researchData, onClose }) {
  const [tab, setTab] = useState("recs");
  const tabs = [
    { id: "recs", label: "3択提案" },
    { id: "market", label: "市場データ" },
    { id: "competitors", label: "競合" },
    { id: "targets", label: "ターゲット" },
  ];

  return (
    <div style={{
      position: "fixed", top: 0, right: 0, bottom: 0, width: 380,
      background: "var(--bg1)", borderLeft: "1px solid var(--border)",
      zIndex: 200, display: "flex", flexDirection: "column", boxShadow: "-4px 0 20px rgba(0,0,0,0.3)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <div style={{ fontSize: 12, color: "var(--accent)", letterSpacing: "0.1em" }}>◐ 市場調査データ</div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-dim)", fontSize: 16, cursor: "pointer" }}>✕</button>
      </div>
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: "8px 4px", background: "none", border: "none",
            borderBottom: tab === t.id ? "2px solid var(--accent)" : "2px solid transparent",
            color: tab === t.id ? "var(--accent)" : "var(--text-dim)", fontSize: 10, cursor: "pointer",
          }}>{t.label}</button>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
        {tab === "recs" && recommendations.map((rec, i) => (
          <div key={i} style={{ marginBottom: 16, padding: 12, background: "var(--bg2)", border: `1px solid ${rec.color}`, borderRadius: 4 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
              <span style={{ background: rec.color, color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 6px" }}>{rec.archetype}</span>
              <span style={{ fontSize: 10, color: "var(--text-dim)" }}>{rec.archetypeDesc}</span>
            </div>
            <div style={{ fontSize: 11, color: "var(--text)", fontWeight: 600, marginBottom: 4 }}>{rec.theme.text}</div>
            <div style={{ fontSize: 10, color: "var(--text-dim)", marginBottom: 8, lineHeight: 1.5 }}>フック: 「{rec.hook.text}」</div>
            {rec.snsBasis.map((b, bi) => (
              <div key={bi} style={{ fontSize: 10, color: "var(--text-dim)", paddingLeft: 8, borderLeft: `2px solid ${rec.color}`, marginBottom: 4, lineHeight: 1.5 }}>{b}</div>
            ))}
            <div style={{ display: "flex", gap: 4, marginTop: 8, flexWrap: "wrap" }}>
              {[rec.expectedReach, rec.expectedFollow, rec.expectedSave].map((m, mi) => (
                <span key={mi} style={{ fontSize: 9, color: rec.color, border: `1px solid ${rec.color}`, padding: "1px 5px" }}>{m}</span>
              ))}
            </div>
          </div>
        ))}
        {tab === "market" && researchData && (
          <div>
            <div style={{ fontSize: 9, color: "var(--accent)", letterSpacing: "0.1em", marginBottom: 8 }}>よくある悩み</div>
            {(researchData.reviewAnalysis?.painPoints || []).map((p, i) => <div key={i} style={{ fontSize: 11, color: "var(--text-dim)", padding: "3px 0" }}>— {p}</div>)}
            <div style={{ marginTop: 10, fontSize: 9, color: "var(--accent)", letterSpacing: "0.1em", marginBottom: 8 }}>SNSバズパターン</div>
            {(researchData.snsAnalysis?.viralPatterns || []).map((p, i) => <div key={i} style={{ fontSize: 11, color: "var(--text-dim)", padding: "3px 0" }}>— {p}</div>)}
            <div style={{ marginTop: 10, fontSize: 9, color: "var(--accent)", letterSpacing: "0.1em", marginBottom: 8 }}>検索ニーズ</div>
            {(researchData.searchNeeds?.keywords || []).map((p, i) => <div key={i} style={{ fontSize: 11, color: "var(--text-dim)", padding: "3px 0" }}>— {p}</div>)}
          </div>
        )}
        {tab === "competitors" && researchData && (
          <div>
            {(researchData.competitorAnalysis?.competitors || []).map((c, i) => (
              <div key={i} style={{ marginBottom: 10, padding: 10, background: "var(--bg2)", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 12, color: "var(--text)", marginBottom: 4 }}>{c.name}</div>
                <div style={{ fontSize: 10, color: "var(--text-dim)" }}>強み: {c.strength}</div>
                <div style={{ fontSize: 10, color: "#e06c75" }}>弱み: {c.weakness}</div>
              </div>
            ))}
          </div>
        )}
        {tab === "targets" && researchData && (
          <div>
            {(researchData.targetAnalysis?.segments || []).map((seg, i) => (
              <div key={i} style={{ marginBottom: 10, padding: 10, background: "var(--bg2)", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 11, color: "var(--accent)", marginBottom: 4 }}>{seg.label}</div>
                <div style={{ fontSize: 10, color: "var(--text-dim)", lineHeight: 1.5 }}>{seg.desc}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ScoreDim({ label, score, max = 20 }) {
  const pct = Math.round((score / max) * 100);
  const color = pct >= 80 ? "var(--accent)" : pct >= 55 ? "#6fa8dc" : "var(--border)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0" }}>
      <div style={{ fontSize: 11, color: "var(--text-dim)", width: 100 }}>{label}</div>
      <div style={{ flex: 1, height: 4, background: "var(--bg2)" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, transition: "width 0.4s" }} />
      </div>
      <div style={{ fontSize: 12, color, width: 40, textAlign: "right" }}>{score}/{max}</div>
    </div>
  );
}

function OptionCard({ text, selected, onClick, dim }) {
  return (
    <div onClick={onClick} style={{
      background: selected ? "rgba(255,107,0,0.12)" : "var(--bg2)",
      border: `1px solid ${selected ? "var(--accent)" : "var(--border)"}`,
      borderRadius: 4, padding: "10px 12px", cursor: "pointer",
    }}>
      <div style={{ fontSize: 12, color: selected ? "var(--text)" : "var(--text-dim)", lineHeight: 1.6 }}>{text}</div>
      {dim && <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 4 }}>{dim}</div>}
    </div>
  );
}

/* ─── Main Component ─── */

export default function ContentStudio({ data, selectedItemId: initItemId, setSelectedItemId: syncItemId, onNavToStock, onNavToResearch, researchApply, onClearResearch, addLearning, learningData }) {
  const { items } = data;

  const [step, setStep] = useState(1);
  const [selectedItemId, setSelectedItemIdLocal] = useState(initItemId ?? items[0]?.id ?? "");
  const setSelectedItemId = (id) => { setSelectedItemIdLocal(id); syncItemId?.(id); };
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState(null);

  const [recommendations, setRecommendations] = useState([]);
  const [selectedRec, setSelectedRec] = useState(null);
  const [selectedHook, setSelectedHook] = useState(null);
  const [researchPanelOpen, setResearchPanelOpen] = useState(false);
  const [researchPanelData, setResearchPanelData] = useState(null);
  const [regenMode, setRegenMode] = useState(null);
  const [slides, setSlides] = useState([]);
  const [captions, setCaptions] = useState([]);
  const [selectedCaption, setSelectedCaption] = useState(0);
  const [hashtags, setHashtags] = useState("");
  const [quality, setQuality] = useState(null);
  const [snsAnalysis, setSnsAnalysis] = useState(null);
  const [scriptView, setScriptView] = useState(false);
  const [researchBanner, setResearchBanner] = useState(!!researchApply);

  const [analytics, setAnalytics] = useState({ views: "", likes: "", saves: "", comments: "", follows: "" });
  const [perfResult, setPerfResult] = useState(null);

  const item = items.find((i) => i.id === selectedItemId) ?? items[0];

  /* ─── Apply research if coming from MarketResearch page ─── */
  const [appliedResearch, setAppliedResearch] = useState(false);
  if (researchApply && !appliedResearch) {
    setAppliedResearch(true);
    if (researchApply.hook) setTimeout(() => setSelectedHook(researchApply.hook), 0);
    if (researchApply.plan?.format) setTimeout(() => setSelectedFormat(researchApply.plan.format), 0);
  }

  /* ─── Actions ─── */

  const doResearch = useCallback(() => {
    const recs = getTopRecommendations(item, learningData ?? []);
    setRecommendations(recs);
    setResearchPanelData(runMarketResearch(item));
    setSelectedRec(null);
    setSelectedHook(null);
    setStep(2);
  }, [item, learningData]);

  const doBuild = useCallback((hookOverride) => {
    const hObj = hookOverride ?? selectedHook ?? { text: "" };
    const h = typeof hObj === "object" ? (hObj.text ?? "") : hObj;
    const fmt = selectedFormat ?? FORMATS[0].id;
    const ss = recommendations.length >= 3
      ? generateSlidesByArchetypes(item, recommendations, regenMode)
      : generateAllSlides(item, h, fmt, regenMode);
    setSlides(ss.map((s) => ({ ...s, selected: 0 })));
    setCaptions(generateCaption(item, hObj));
    setHashtags(generateHashtags(item));
    setQuality(null);
    setSnsAnalysis(null);
    setScriptView(false);
    setStep(4);
  }, [item, selectedHook, selectedFormat, regenMode]);

  const doScore = useCallback(() => {
    const sel = slides.map((s) => s.options[s.selected]);
    setQuality(scoreQuality(sel, selectedHook?.text ?? ""));
  }, [slides, selectedHook]);

  const doSNS = useCallback(() => {
    setSnsAnalysis(analyzeSNSPotential(item, selectedHook, selectedFormat ?? FORMATS[0].id));
  }, [item, selectedHook, selectedFormat]);

  const doAnalyze = useCallback(() => {
    const result = analyzePerformance({ ...analytics, hook: selectedHook?.text ?? "" });
    setPerfResult(result);
    if (addLearning && analytics.views) {
      addLearning({
        hookType: selectedHook?.type ?? "",
        hookText: selectedHook?.text ?? "",
        format: selectedFormat ?? "",
        itemId: item?.id ?? "",
        views: Number(analytics.views) || 0,
        likes: Number(analytics.likes) || 0,
        saves: Number(analytics.saves) || 0,
        comments: Number(analytics.comments) || 0,
        follows: Number(analytics.follows) || 0,
      });
    }
  }, [analytics, selectedHook, selectedFormat, item, addLearning]);

  const selectSlideOption = (si, oi) =>
    setSlides((prev) => prev.map((s, i) => i === si ? { ...s, selected: oi } : s));

  const doRegen = (mode) => {
    setRegenMode(mode.id);
    const hObj = selectedHook ?? { text: "" };
    const h = typeof hObj === "object" ? (hObj.text ?? "") : hObj;
    const ss = recommendations.length >= 3
      ? generateSlidesByArchetypes(item, recommendations, mode.id)
      : generateAllSlides(item, h, selectedFormat ?? FORMATS[0].id, mode.id);
    setSlides(ss.map((s) => ({ ...s, selected: 0 })));
  };

  const copyText = (txt) => navigator.clipboard.writeText(txt).catch(() => {});

  const buildFullScript = () => {
    const lines = slides.map((s, i) =>
      `【スライド${i + 1} — ${s.role}】\n${optToScript(s.options[s.selected], s.role)}`
    ).join("\n\n");
    const cap = captions[selectedCaption] ?? "";
    return `${lines}\n\n【キャプション】\n${cap}\n\n【ハッシュタグ】\n${hashtags}`;
  };

  /* ─── Step bar ─── */

  const STEPS = ["セットアップ", "テーマ", "フック", "スライド構築", "投稿分析"];

  const stepBar = (
    <div style={{ display: "flex", marginBottom: 24, borderBottom: "1px solid var(--border)" }}>
      {STEPS.map((s, i) => {
        const n = i + 1;
        const active = step === n;
        const done = step > n;
        return (
          <button key={n} onClick={() => n < step && setStep(n)} style={{
            flex: 1, padding: "10px 4px", background: "none", border: "none",
            borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent",
            color: active ? "var(--accent)" : done ? "var(--text-dim)" : "#50545e",
            fontSize: 11, cursor: n < step ? "pointer" : "default", letterSpacing: "0.05em",
          }}>
            <span style={{ marginRight: 4, fontSize: 9 }}>{done ? "✓" : n}</span>{s}
          </button>
        );
      })}
    </div>
  );

  /* ─── Step 1: Setup ─── */

  const renderStep1 = () => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <CardTitle style={{ marginBottom: 0 }}>アイテム選択</CardTitle>
          {onNavToStock && item && (
            <button onClick={() => onNavToStock(item.id)} style={{
              fontSize: 11, color: "var(--accent)", background: "none",
              border: "1px solid var(--accent)", padding: "4px 10px", cursor: "pointer",
            }}>◉ ストックを編集</button>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 280, overflowY: "auto" }}>
          {items.map((it) => (
            <div key={it.id} onClick={() => setSelectedItemId(it.id)} style={{
              padding: "10px 12px", cursor: "pointer", borderRadius: 4,
              background: selectedItemId === it.id ? "rgba(255,107,0,0.1)" : "var(--bg2)",
              border: `1px solid ${selectedItemId === it.id ? "var(--accent)" : "var(--border)"}`,
            }}>
              <div style={{ fontSize: 12, color: selectedItemId === it.id ? "var(--text)" : "var(--text-dim)" }}>
                No.{it.no}　{it.label}
              </div>
              <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 2 }}>{it.category} / {it.judgment}</div>
            </div>
          ))}
        </div>

      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Card>
          <CardTitle>テンプレート</CardTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {TEMPLATES.map((t) => (
              <OptionCard key={t.id} text={t.label} dim={t.desc}
                selected={selectedTemplate?.id === t.id}
                onClick={() => { setSelectedTemplate(t); setSelectedFormat(t.format); }}
              />
            ))}
          </div>
        </Card>
        <Card>
          <CardTitle>投稿フォーマット</CardTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {FORMATS.map((f) => (
              <OptionCard key={f.id} text={`${f.icon} ${f.label}`} dim={f.desc}
                selected={selectedFormat === f.id} onClick={() => setSelectedFormat(f.id)}
              />
            ))}
          </div>
        </Card>
        <Btn onClick={doResearch} style={{ alignSelf: "flex-end" }}>マーケット調査 → テーマ生成 ▶</Btn>
      </div>
    </div>
  );

  /* ─── Step 2: Archetype Recommendations ─── */

  const renderStep2 = () => (
    <div>
      <div style={{ marginBottom: 14, fontSize: 11, color: "var(--text-dim)" }}>
        SNSマーケティングAIが3つのアーキタイプを分析しました。最も効果的なテーマ・フックを選んでください。
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        {recommendations.map((rec, i) => {
          const isSelected = selectedRec === i;
          return (
            <div key={i} style={{
              background: isSelected ? `${rec.color}18` : "var(--bg2)",
              border: `2px solid ${isSelected ? rec.color : "var(--border)"}`,
              borderRadius: 6, padding: 16, cursor: "pointer", transition: "border-color 0.15s, background 0.15s",
            }} onClick={() => {
              setSelectedRec(i);
              setSelectedHook(rec.hook);
              setSelectedFormat(rec.format);
            }}>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ background: rec.color, color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 8px", letterSpacing: "0.08em" }}>
                  {rec.archetype}
                </div>
                <div style={{ fontSize: 10, color: "var(--text-dim)" }}>{rec.archetypeDesc}</div>
                {isSelected && <div style={{ marginLeft: "auto", fontSize: 10, color: rec.color }}>選択中 ✓</div>}
              </div>

              {/* Theme */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 9, color: rec.color, letterSpacing: "0.1em", marginBottom: 4 }}>テーマ</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", lineHeight: 1.5 }}>{rec.theme.text}</div>
                <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 4, lineHeight: 1.5 }}>{rec.theme.reason}</div>
              </div>

              {/* Hook */}
              <div style={{ marginBottom: 10, padding: "10px", background: "var(--bg3)", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 9, color: rec.color, letterSpacing: "0.1em", marginBottom: 4 }}>フック — {rec.hook.type}型</div>
                <div style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.6 }}>「{rec.hook.text}」</div>
                <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 4, lineHeight: 1.4 }}>{rec.hook.reason}</div>
              </div>

              {/* SNS basis */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.1em", marginBottom: 6 }}>SNSマーケ根拠</div>
                {rec.snsBasis.map((b, bi) => (
                  <div key={bi} style={{ fontSize: 10, color: "var(--text-dim)", padding: "3px 0", paddingLeft: 8, borderLeft: `2px solid ${rec.color}`, marginBottom: 4, lineHeight: 1.5 }}>
                    {b}
                  </div>
                ))}
              </div>

              {/* Metrics */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                {[rec.expectedReach, rec.expectedFollow, rec.expectedSave].map((m, mi) => (
                  <div key={mi} style={{ fontSize: 9, color: rec.color, border: `1px solid ${rec.color}`, padding: "2px 6px" }}>{m}</div>
                ))}
              </div>

              <Btn onClick={(e) => {
                e.stopPropagation();
                setSelectedRec(i);
                setSelectedHook(rec.hook);
                setSelectedFormat(rec.format);
                doBuild(rec.hook);
              }} style={{ width: "100%", textAlign: "center", background: isSelected ? rec.color : undefined }}>
                このテーマ・フックで制作 ▶
              </Btn>
            </div>
          );
        })}
      </div>

      {/* フックだけ変える */}
      {selectedRec !== null && (
        <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button onClick={() => setStep(3)} style={{
            padding: "6px 14px", background: "none", border: "1px solid var(--border)",
            color: "var(--text-dim)", fontSize: 11, cursor: "pointer",
          }}>フックだけ変える ▶</button>
          <Btn onClick={() => doBuild()}>採用中フックでスライド構築 ▶</Btn>
        </div>
      )}
    </div>
  );

  /* ─── Step 3: Hook swap ─── */

  const renderStep3 = () => (
    <div>
      <div style={{ marginBottom: 14, fontSize: 11, color: "var(--text-dim)" }}>
        3つのアーキタイプのフックから選択するか、採用中フックのままスライド構築へ進んでください。
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 16 }}>
        {recommendations.map((rec, i) => {
          const isSelected = selectedHook?.text === rec.hook.text;
          return (
            <div key={i} onClick={() => { setSelectedHook(rec.hook); setSelectedRec(i); setSelectedFormat(rec.format); }} style={{
              background: isSelected ? `${rec.color}18` : "var(--bg2)",
              border: `2px solid ${isSelected ? rec.color : "var(--border)"}`,
              borderRadius: 6, padding: 14, cursor: "pointer",
            }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                <div style={{ background: rec.color, color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 7px" }}>{rec.archetype}</div>
                <div style={{ fontSize: 10, color: "var(--text-dim)" }}>{rec.hook.type}型フック</div>
                {isSelected && <div style={{ marginLeft: "auto", fontSize: 10, color: rec.color }}>採用 ✓</div>}
              </div>
              <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.6, marginBottom: 8 }}>「{rec.hook.text}」</div>
              <div style={{ fontSize: 10, color: "var(--text-dim)", lineHeight: 1.5 }}>{rec.hook.reason}</div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={() => setStep(2)} style={{
          padding: "6px 14px", background: "none", border: "1px solid var(--border)",
          color: "var(--text-dim)", fontSize: 11, cursor: "pointer",
        }}>◀ テーマに戻る</button>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {selectedHook && <div style={{ fontSize: 11, color: "var(--text-dim)" }}>採用: 「{selectedHook.text.slice(0, 28)}…」</div>}
          <Btn onClick={() => doBuild()} disabled={!selectedHook}>スライド構築へ ▶</Btn>
        </div>
      </div>
    </div>
  );

  /* ─── Step 4: Slides + Script + Analysis ─── */

  const renderStep4 = () => (
    <div>
      {/* Top bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {REGEN_MODES.map((m) => (
            <button key={m.id} onClick={() => doRegen(m)} style={{
              padding: "5px 10px", background: regenMode === m.id ? "rgba(255,107,0,0.15)" : "var(--bg2)",
              border: `1px solid ${regenMode === m.id ? "var(--accent)" : "var(--border)"}`,
              color: regenMode === m.id ? "var(--accent)" : "var(--text-dim)",
              fontSize: 10, cursor: "pointer",
            }}>{m.label}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setScriptView(v => !v)} style={{
            padding: "5px 12px", background: scriptView ? "rgba(255,107,0,0.15)" : "var(--bg2)",
            border: `1px solid ${scriptView ? "var(--accent)" : "var(--border)"}`,
            color: scriptView ? "var(--accent)" : "var(--text-dim)", fontSize: 11, cursor: "pointer",
          }}>
            {scriptView ? "▣ スライド表示" : "≡ 台本表示"}
          </button>
          <button onClick={() => copyText(buildFullScript())} style={{
            padding: "5px 12px", background: "var(--bg2)", border: "1px solid var(--border)",
            color: "var(--text-dim)", fontSize: 11, cursor: "pointer",
          }}>全コピー</button>
        </div>
      </div>

      {/* Script view */}
      {scriptView ? (
        <Card style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <CardTitle style={{ marginBottom: 0 }}>台本</CardTitle>
            <button onClick={() => copyText(buildFullScript())} style={{
              fontSize: 10, color: "var(--text-dim)", background: "none",
              border: "1px solid var(--border)", padding: "3px 8px", cursor: "pointer",
            }}>コピー</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {slides.map((s, si) => {
              const opt = s.options[s.selected];
              const isHook = opt && opt.sub !== undefined;
              return (
                <div key={si} style={{ borderLeft: "2px solid var(--border)", paddingLeft: 12 }}>
                  <div style={{ fontSize: 10, color: "var(--accent)", letterSpacing: "0.1em", marginBottom: 6 }}>
                    スライド {si + 1} — {s.role}
                  </div>
                  {isHook ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <div style={{ fontSize: 10, color: "var(--text-dim)" }}>サブ: <span style={{ color: "var(--text)", fontSize: 12 }}>{opt.sub}</span></div>
                      <div style={{ fontSize: 10, color: "var(--text-dim)" }}>メイン: <span style={{ color: "var(--text)", fontSize: 16, fontWeight: 700 }}>{opt.main}</span></div>
                      {opt.note && <div style={{ fontSize: 10, color: "var(--text-dim)" }}>補足: <span style={{ color: "var(--text-dim)", fontSize: 11 }}>{opt.note}</span></div>}
                    </div>
                  ) : (
                    <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{opt?.text || ""}</div>
                  )}
                </div>
              );
            })}

            {captions.length > 0 && (
              <div style={{ borderLeft: "2px solid var(--border)", paddingLeft: 12, borderColor: "var(--accent)" }}>
                <div style={{ fontSize: 10, color: "var(--accent)", letterSpacing: "0.1em", marginBottom: 6 }}>キャプション</div>
                <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{captions[selectedCaption]}</div>
              </div>
            )}

            {hashtags && (
              <div style={{ borderLeft: "2px solid var(--border)", paddingLeft: 12 }}>
                <div style={{ fontSize: 10, color: "var(--accent)", letterSpacing: "0.1em", marginBottom: 6 }}>ハッシュタグ</div>
                <div style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.8 }}>{hashtags}</div>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <>
          {/* Slide cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            {slides.map((s, si) => (
              <Card key={si} style={{ padding: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ fontSize: 10, color: "var(--accent)", letterSpacing: "0.08em" }}>
                    S{si + 1} — {s.role}
                  </div>
                  <button onClick={() => copyText(optToText(s.options[s.selected]))} style={{
                    fontSize: 9, color: "var(--text-dim)", background: "none",
                    border: "1px solid var(--border)", padding: "2px 6px", cursor: "pointer",
                  }}>コピー</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  {s.options.map((opt, oi) => (
                    <SlideOptionCard key={oi} opt={opt} label={`案 ${oi + 1}`}
                      selected={s.selected === oi} onClick={() => selectSlideOption(si, oi)} />
                  ))}
                </div>
              </Card>
            ))}
          </div>

          {/* Caption */}
          {captions.length > 0 && (
            <Card style={{ marginBottom: 12 }}>
              <CardTitle>キャプション</CardTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {captions.map((c, i) => (
                  <div key={i} onClick={() => setSelectedCaption(i)} style={{
                    padding: "10px 12px", cursor: "pointer", borderRadius: 4,
                    background: selectedCaption === i ? "rgba(255,107,0,0.12)" : "var(--bg2)",
                    border: `1px solid ${selectedCaption === i ? "var(--accent)" : "var(--border)"}`,
                    fontSize: 11, color: selectedCaption === i ? "var(--text)" : "var(--text-dim)",
                    lineHeight: 1.7, whiteSpace: "pre-wrap",
                  }}>{c}</div>
                ))}
              </div>
            </Card>
          )}

          {/* Hashtags */}
          {hashtags && (
            <Card style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <CardTitle style={{ marginBottom: 0 }}>ハッシュタグ</CardTitle>
                <button onClick={() => copyText(hashtags)} style={{ fontSize: 10, color: "var(--text-dim)", background: "none", border: "1px solid var(--border)", padding: "3px 8px", cursor: "pointer" }}>コピー</button>
              </div>
              <div style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.8 }}>{hashtags}</div>
            </Card>
          )}
        </>
      )}

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <Btn onClick={doScore}>品質スコア</Btn>
        <Btn onClick={doSNS}>SNSマーケ分析</Btn>
        <Btn onClick={() => setStep(5)}>投稿後分析へ ▶</Btn>
      </div>

      {/* Quality score */}
      {quality && (
        <Card style={{ marginBottom: 12, borderLeft: `3px solid ${quality.total >= 80 ? "var(--accent)" : quality.total >= 60 ? "#6fa8dc" : "var(--border)"}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <CardTitle>品質スコア</CardTitle>
            <div style={{ fontSize: 28, fontWeight: 700, color: quality.total >= 80 ? "var(--accent)" : quality.total >= 60 ? "#6fa8dc" : "var(--text-dim)" }}>
              {quality.total}<span style={{ fontSize: 14, fontWeight: 400 }}>/100</span>
            </div>
          </div>
          <ScoreDim label="口語の自然さ" score={quality.breakdown.colloquial} />
          <ScoreDim label="フック強度" score={quality.breakdown.hook} />
          <ScoreDim label="体験密度" score={quality.breakdown.experience} />
          <ScoreDim label="断定力" score={quality.breakdown.assertion} />
          <ScoreDim label="UpGear思想" score={quality.breakdown.philosophy} />
          <ScoreDim label="CTA力" score={quality.breakdown.cta} />
          {quality.aiPenalty > 0 && <div style={{ marginTop: 8, fontSize: 11, color: "#e06c75" }}>AI文体ペナルティ: -{quality.aiPenalty}点</div>}
          {quality.improvements.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <SectionLabel color="#6fa8dc">改善提案</SectionLabel>
              {quality.improvements.map((imp, i) => <div key={i} style={{ fontSize: 11, color: "var(--text-dim)", padding: "3px 0" }}>→ {imp}</div>)}
            </div>
          )}
        </Card>
      )}

      {/* SNS Analysis */}
      {snsAnalysis && (
        <Card style={{ borderLeft: `3px solid ${snsAnalysis.total >= 70 ? "var(--accent)" : "#6fa8dc"}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <CardTitle style={{ marginBottom: 4 }}>SNSマーケ分析</CardTitle>
              <div style={{ display: "flex", gap: 10 }}>
                <Tag color="orange">{snsAnalysis.postType}</Tag>
                <span style={{ fontSize: 11, color: "var(--text-dim)" }}>当事者: {snsAnalysis.audienceLabel}</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: snsAnalysis.total >= 70 ? "var(--accent)" : "#6fa8dc" }}>
                {snsAnalysis.total}<span style={{ fontSize: 12, fontWeight: 400 }}>/100</span>
              </div>
              <div style={{ fontSize: 11, color: "var(--accent)", marginTop: 2 }}>推定: {snsAnalysis.reachRange}</div>
            </div>
          </div>

          <ScoreDim label="当事者の広さ" score={snsAnalysis.breakdown.audience} max={30} />
          <ScoreDim label="バズ型フック" score={snsAnalysis.breakdown.buzz} max={25} />
          <ScoreDim label="保存されやすさ" score={snsAnalysis.breakdown.saves} max={20} />
          <ScoreDim label="TikTok適合度" score={snsAnalysis.breakdown.tiktok} max={15} />

          {snsAnalysis.issues.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <SectionLabel color="#6fa8dc">改善ポイント</SectionLabel>
              {snsAnalysis.issues.map((iss, i) => (
                <div key={i} style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 10, color: "var(--accent)", marginBottom: 3 }}>▶ {iss.dim}</div>
                  <div style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.6 }}>{iss.tip}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );

  /* ─── Step 5: Post analytics ─── */

  const renderStep5 = () => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <Card>
        <CardTitle>投稿データ入力</CardTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { key: "views",    label: "再生数" },
            { key: "likes",    label: "いいね数" },
            { key: "saves",    label: "保存数" },
            { key: "comments", label: "コメント数" },
            { key: "follows",  label: "フォロー数" },
          ].map(({ key, label }) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 11, color: "var(--text-dim)", width: 80 }}>{label}</div>
              <input type="number" value={analytics[key]}
                onChange={(e) => setAnalytics((a) => ({ ...a, [key]: e.target.value }))}
                style={{ flex: 1, background: "var(--bg2)", border: "1px solid var(--border)", color: "var(--text)", padding: "6px 10px", fontSize: 12, outline: "none" }}
              />
            </div>
          ))}
          <Btn onClick={doAnalyze}>AI分析を実行</Btn>
        </div>
      </Card>

      {perfResult && (
        <Card>
          <CardTitle>AI解析レポート</CardTitle>
          <div style={{ display: "flex", gap: 20, marginBottom: 14 }}>
            {[
              { label: "いいね率", val: `${perfResult.likeRate}%`, hi: perfResult.likeRate >= 3 },
              { label: "保存率",   val: `${perfResult.saveRate}%`, hi: perfResult.saveRate >= 2 },
            ].map(({ label, val, hi }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "var(--text-dim)" }}>{label}</div>
                <div style={{ fontSize: 22, color: hi ? "var(--accent)" : "var(--text)" }}>{val}</div>
              </div>
            ))}
          </div>
          <SectionLabel>うまくいった理由</SectionLabel>
          {perfResult.reasons.map((r, i) => <div key={i} style={{ fontSize: 11, color: "var(--text-dim)", padding: "3px 0" }}>✓ {r}</div>)}
          {perfResult.improvements.length > 0 && <>
            <div style={{ marginTop: 10 }} />
            <SectionLabel color="#6fa8dc">改善ポイント</SectionLabel>
            {perfResult.improvements.map((r, i) => <div key={i} style={{ fontSize: 11, color: "var(--text-dim)", padding: "3px 0" }}>→ {r}</div>)}
          </>}
          <div style={{ marginTop: 10 }} />
          <SectionLabel color="#98c379">次回の仮説</SectionLabel>
          {perfResult.nextTips.map((r, i) => <div key={i} style={{ fontSize: 11, color: "var(--text-dim)", padding: "3px 0" }}>▶ {r}</div>)}
        </Card>
      )}
    </div>
  );

  /* ─── Render ─── */

  return (
    <div style={{ paddingRight: researchPanelOpen ? 394 : 0, transition: "padding-right 0.2s" }}>
      {researchPanelOpen && (
        <ResearchPanel
          recommendations={recommendations}
          researchData={researchPanelData}
          onClose={() => setResearchPanelOpen(false)}
        />
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <PageHeader
          title="コンテンツ制作スタジオ"
          sub={`UpGear v4.6 — ${item?.label ?? "—"}`}
        />
        <div style={{ display: "flex", gap: 8, flexShrink: 0, marginTop: 4 }}>
          {(recommendations.length > 0 || researchPanelData) && (
            <button onClick={() => setResearchPanelOpen(v => !v)} style={{
              padding: "6px 14px", background: researchPanelOpen ? "rgba(255,107,0,0.12)" : "none",
              border: `1px solid ${researchPanelOpen ? "var(--accent)" : "var(--border)"}`,
              color: researchPanelOpen ? "var(--accent)" : "var(--text-dim)", fontSize: 11, cursor: "pointer",
            }}>◐ 市場調査</button>
          )}
          {onNavToResearch && (
            <button onClick={() => onNavToResearch(item?.id)} style={{
              padding: "6px 14px", background: "none", border: "1px solid var(--border)",
              color: "var(--text-dim)", fontSize: 11, cursor: "pointer",
            }}>◐ 市場調査AI（全画面）</button>
          )}
        </div>
      </div>
      {researchApply && researchBanner && (
        <div style={{
          marginBottom: 12, padding: "10px 14px", background: "rgba(255,107,0,0.08)",
          border: "1px solid var(--accent)", display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{ fontSize: 11, color: "var(--accent)" }}>
            ◐ 市場調査から反映済み — フック・フォーマットが設定されています。Step3からスライド構築へ進んでください。
          </div>
          <button onClick={() => { setResearchBanner(false); onClearResearch?.(); }} style={{
            background: "none", border: "none", color: "var(--text-dim)", fontSize: 12, cursor: "pointer",
          }}>✕</button>
        </div>
      )}
      {stepBar}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
      {step === 5 && renderStep5()}
    </div>
  );
}
