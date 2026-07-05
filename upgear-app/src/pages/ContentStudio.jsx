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
import { getTopRecommendations } from "../data/marketResearchAI";

/* ─── helpers ─── */

// Format helpers for new slide structure:
// S1: { intro, hook, note }  → 上段/中央/下段
// S2-S6: { title, body1, body2 }  → 大タイトル/本文1/本文2

function optToText(opt) {
  if (!opt) return "";
  if (typeof opt === "string") return opt;
  if (opt.hook !== undefined) {
    return [opt.intro, opt.hook, opt.note].filter(Boolean).join("  /  ");
  }
  if (opt.title !== undefined) {
    return [opt.title, opt.body1, opt.body2].filter(Boolean).join("  /  ");
  }
  return opt.text || "";
}

function optToScript(opt, isHook) {
  if (!opt) return "";
  if (typeof opt === "string") return opt;
  if (opt.hook !== undefined || isHook) {
    return `上段: ${opt.intro || ""}\n大フック: ${opt.hook || ""}\n下段: ${opt.note || ""}`;
  }
  if (opt.title !== undefined) {
    return `大タイトル: ${opt.title || ""}\n本文1: ${opt.body1 || ""}\n本文2: ${opt.body2 || ""}`;
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

function SlideOptionCard({ opt, selected, onClick, label, isHook }) {
  const archetypeColor = opt?.archetypeColor;
  const archetype      = opt?.archetype;
  const borderColor    = selected ? (archetypeColor || "var(--accent)") : "var(--border)";
  const bgColor        = selected ? (archetypeColor ? archetypeColor + "18" : "rgba(255,107,0,0.12)") : "var(--bg2)";

  const dimStyle  = { fontSize: 9, color: "var(--text-dim)", marginBottom: 2, letterSpacing: "0.08em" };
  const textStyle = (big) => ({ fontSize: big ? 16 : 12, fontWeight: big ? 700 : 400, color: selected ? "var(--text)" : "var(--text-dim)", lineHeight: 1.5 });

  return (
    <div onClick={onClick} style={{ background: bgColor, border: `1px solid ${borderColor}`, borderRadius: 4, padding: "10px 12px", cursor: "pointer", transition: "border-color 0.15s", minHeight: 80 }}>
      <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 8 }}>
        {archetype && <span style={{ fontSize: 8, background: archetypeColor || "var(--accent)", color: "#fff", padding: "1px 5px", fontWeight: 700 }}>{archetype}</span>}
        <span style={{ fontSize: 9, color: archetypeColor || "var(--accent)", letterSpacing: "0.12em" }}>{label}</span>
      </div>

      {(isHook || opt?.hook !== undefined) ? (
        /* S1: 上段 / 大フック / 下段 */
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <div>
            <div style={dimStyle}>上段</div>
            <div style={textStyle(false)}>{opt?.intro}</div>
          </div>
          <div>
            <div style={dimStyle}>大フック</div>
            <div style={textStyle(true)}>{opt?.hook}</div>
          </div>
          <div>
            <div style={dimStyle}>下段</div>
            <div style={textStyle(false)}>{opt?.note}</div>
          </div>
        </div>
      ) : (
        /* S2-S6: 大タイトル / 本文1 / 本文2 */
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <div>
            <div style={dimStyle}>大タイトル</div>
            <div style={textStyle(true)}>{opt?.title}</div>
          </div>
          <div>
            <div style={dimStyle}>本文1</div>
            <div style={textStyle(false)}>{opt?.body1}</div>
          </div>
          <div>
            <div style={dimStyle}>本文2</div>
            <div style={{ ...textStyle(false), color: selected ? "var(--text-dim)" : "#50545e" }}>{opt?.body2}</div>
          </div>
        </div>
      )}
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

export default function ContentStudio({ data, selectedItemId: initItemId, setSelectedItemId: syncItemId, onNavToStock, addLearning, learningData }) {
  const { items } = data;

  const [step, setStep] = useState(1);
  const [selectedItemId, setSelectedItemIdLocal] = useState(initItemId ?? items[0]?.id ?? "");
  const setSelectedItemId = (id) => { setSelectedItemIdLocal(id); syncItemId?.(id); };
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState(null);

  const [recommendations, setRecommendations] = useState([]);
  const [selectedRec, setSelectedRec] = useState(null);
  const [selectedHook, setSelectedHook] = useState(null);
  const [regenMode, setRegenMode] = useState(null);
  const [slides, setSlides] = useState([]);
  const [captions, setCaptions] = useState([]);
  const [selectedCaption, setSelectedCaption] = useState(0);
  const [hashtags, setHashtags] = useState("");
  const [quality, setQuality] = useState(null);
  const [snsAnalysis, setSnsAnalysis] = useState(null);
  const [scriptView, setScriptView] = useState(false);

  const [analytics, setAnalytics] = useState({ views: "", likes: "", saves: "", comments: "", follows: "" });
  const [perfResult, setPerfResult] = useState(null);

  const item = items.find((i) => i.id === selectedItemId) ?? items[0];

  /* ─── Apply research if coming from MarketResearch page ─── */
  /* ─── Actions ─── */

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
      `【スライド${i + 1} — ${s.role}】\n${optToScript(s.options[s.selected], s.type === "hook")}`
    ).join("\n\n");
    const cap = captions[selectedCaption] ?? "";
    return `${lines}\n\n【キャプション】\n${cap}\n\n【ハッシュタグ】\n${hashtags}`;
  };

  const buildImagePromptsText = () => {
    const parts = [];
    slides.forEach((s, i) => {
      const opt = s.options[s.selected];
      if (!opt?.imagePrompt) return; // S4 skip
      const slideNum = i + 1;
      parts.push(`【${slideNum}枚目 — ${s.role}】\n${opt.imagePrompt}`);
    });
    return parts.join("\n\n");
  };

  /* ─── Step bar ─── */

  const STEPS = ["セットアップ", "テーマ", "フック", "スライド構築", "投稿分析"];

  const stepBar = (
    <div style={{ display: "flex", flexWrap: "wrap", marginBottom: 24, borderBottom: "1px solid var(--border)" }}>
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
          {items.map((it) => {
            const u = it.understanding || {};
            const hasU = Object.values(u).some(v => v?.trim?.());
            const displayName = u.name || it.label || "（未設定）";
            const displayCat  = u.category || it.mainCategory || it.category || "";
            return (
              <div key={it.id} onClick={() => setSelectedItemId(it.id)} style={{
                padding: "10px 12px", cursor: "pointer", borderRadius: 4,
                background: selectedItemId === it.id ? "rgba(255,107,0,0.1)" : "var(--bg2)",
                border: `1px solid ${selectedItemId === it.id ? "var(--accent)" : "var(--border)"}`,
                borderLeft: `3px solid ${hasU ? "#98c379" : "var(--border)"}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ fontSize: 12, color: selectedItemId === it.id ? "var(--text)" : "var(--text-dim)", flex: 1 }}>
                    No.{it.no}　{displayName}
                  </div>
                  {hasU && <span style={{ fontSize: 9, color: "#98c379", flexShrink: 0 }}>◍ 理解済み</span>}
                </div>
                {displayCat && <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 2 }}>{displayCat}</div>}
              </div>
            );
          })}
        </div>

      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* 商品理解データサマリー（SSoT から自動読み込み） */}
        {item?.understanding && Object.values(item.understanding).some(v => v?.trim?.()) && (() => {
          const u = item.understanding;
          return (
            <Card>
              <CardTitle>◍ 商品理解データ（自動読み込み済み）</CardTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 11 }}>
                {u.name      && <div style={{ display: "flex", gap: 8 }}><span style={{ color: "var(--text-dim)", width: 80, flexShrink: 0 }}>商品名</span><span>{u.name}</span></div>}
                {u.category  && <div style={{ display: "flex", gap: 8 }}><span style={{ color: "var(--text-dim)", width: 80, flexShrink: 0 }}>カテゴリ</span><span>{u.category}</span></div>}
                {u.oneLiner  && <div style={{ display: "flex", gap: 8 }}><span style={{ color: "var(--text-dim)", width: 80, flexShrink: 0 }}>一言まとめ</span><span style={{ color: "var(--accent)" }}>{u.oneLiner}</span></div>}
                {u.overview  && <div style={{ display: "flex", gap: 8 }}><span style={{ color: "var(--text-dim)", width: 80, flexShrink: 0 }}>概要</span><span style={{ lineHeight: 1.5 }}>{u.overview}</span></div>}
                {u.strengths && <div style={{ display: "flex", gap: 8 }}><span style={{ color: "var(--text-dim)", width: 80, flexShrink: 0 }}>強み</span><span style={{ lineHeight: 1.5 }}>{u.strengths}</span></div>}
                {u.tiktokAngles && <div style={{ display: "flex", gap: 8 }}><span style={{ color: "var(--text-dim)", width: 80, flexShrink: 0 }}>TikTok訴求</span><span style={{ lineHeight: 1.5 }}>{u.tiktokAngles}</span></div>}
              </div>
            </Card>
          );
        })()}
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
        <Btn onClick={() => {
          const recs = getTopRecommendations(item, learningData ?? []);
          setRecommendations(recs);
          setSelectedRec(null);
          setSelectedHook(null);
          setStep(2);
        }} style={{ alignSelf: "flex-end" }}>テーマ生成 ▶</Btn>
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
              const isHook = s.type === "hook" || opt?.hook !== undefined;
              return (
                <div key={si} style={{ borderLeft: `2px solid ${si === 3 ? "#98c379" : "var(--border)"}`, paddingLeft: 12 }}>
                  <div style={{ fontSize: 10, color: "var(--accent)", letterSpacing: "0.1em", marginBottom: 6 }}>
                    スライド {si + 1} — {s.role}
                    {si === 3 && <span style={{ marginLeft: 8, fontSize: 9, color: "#98c379" }}>（実商品写真を使用）</span>}
                  </div>
                  {isHook ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <div style={{ fontSize: 10, color: "var(--text-dim)" }}>上段: <span style={{ color: "var(--text)", fontSize: 12 }}>{opt?.intro}</span></div>
                      <div style={{ fontSize: 10, color: "var(--text-dim)" }}>大フック: <span style={{ color: "var(--text)", fontSize: 18, fontWeight: 700 }}>{opt?.hook}</span></div>
                      <div style={{ fontSize: 10, color: "var(--text-dim)" }}>下段: <span style={{ color: "var(--text-dim)", fontSize: 11 }}>{opt?.note}</span></div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <div style={{ fontSize: 10, color: "var(--text-dim)" }}>大タイトル: <span style={{ color: "var(--text)", fontSize: 15, fontWeight: 700 }}>{opt?.title}</span></div>
                      <div style={{ fontSize: 10, color: "var(--text-dim)" }}>本文1: <span style={{ color: "var(--text)", fontSize: 12 }}>{opt?.body1}</span></div>
                      <div style={{ fontSize: 10, color: "var(--text-dim)" }}>本文2: <span style={{ color: "var(--text-dim)", fontSize: 11 }}>{opt?.body2}</span></div>
                    </div>
                  )}
                </div>
              );
            })}

            {captions.length > 0 && (
              <div style={{ borderLeft: "2px solid var(--accent)", paddingLeft: 12 }}>
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
                  <div>
                    <div style={{ fontSize: 10, color: si === 3 ? "#98c379" : "var(--accent)", letterSpacing: "0.08em" }}>
                      S{si + 1} — {s.role}
                    </div>
                    {si === 3 && <div style={{ fontSize: 9, color: "#98c379", marginTop: 2 }}>実商品写真を使用</div>}
                  </div>
                  <button onClick={() => copyText(optToText(s.options[s.selected]))} style={{
                    fontSize: 9, color: "var(--text-dim)", background: "none",
                    border: "1px solid var(--border)", padding: "2px 6px", cursor: "pointer",
                  }}>コピー</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  {s.options.map((opt, oi) => (
                    <SlideOptionCard key={oi} opt={opt} label={`案 ${oi + 1}`}
                      isHook={s.type === "hook"} selected={s.selected === oi} onClick={() => selectSlideOption(si, oi)} />
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

          {/* Image prompts for Gemini */}
          <Card style={{ marginBottom: 12, borderLeft: "2px solid #56b6c2" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div>
                <CardTitle style={{ marginBottom: 2 }}>画像生成プロンプト（Gemini用）</CardTitle>
                <div style={{ fontSize: 10, color: "var(--text-dim)" }}>S4のみ実商品写真を使用するためプロンプトなし</div>
              </div>
              <button onClick={() => copyText(buildImagePromptsText())} style={{
                fontSize: 10, color: "#56b6c2", background: "none",
                border: "1px solid #56b6c2", padding: "4px 10px", cursor: "pointer",
              }}>一括コピー</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {slides.map((s, si) => {
                const opt = s.options[s.selected];
                if (!opt?.imagePrompt) return (
                  <div key={si} style={{ padding: "8px 12px", background: "rgba(152,195,121,0.06)", border: "1px solid rgba(152,195,121,0.25)", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 9, color: "#98c379", border: "1px solid #98c379", padding: "1px 6px" }}>S{si + 1}</span>
                    <span style={{ fontSize: 11, color: "#98c379" }}>実商品写真を使用（プロンプト不要）</span>
                  </div>
                );
                return (
                  <div key={si} style={{ padding: "10px 12px", background: "var(--bg2)", border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 10, color: "#56b6c2", letterSpacing: "0.08em" }}>【{si + 1}枚目 — {s.role}】</span>
                      <button onClick={() => copyText(opt.imagePrompt)} style={{ fontSize: 9, color: "var(--text-dim)", background: "none", border: "1px solid var(--border)", padding: "2px 6px", cursor: "pointer" }}>コピー</button>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.7, fontFamily: "var(--font-mono)" }}>{opt.imagePrompt}</div>
                  </div>
                );
              })}
            </div>
          </Card>
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
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <PageHeader
          title="コンテンツ制作スタジオ"
          sub={`UpGear v4.6 — ${item?.label ?? "—"}`}
        />
      </div>
      {stepBar}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
      {step === 5 && renderStep5()}
    </div>
  );
}
