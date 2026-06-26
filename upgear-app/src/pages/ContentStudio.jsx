import { useState, useCallback } from "react";
import { PageHeader, Card, CardTitle, Tag, Btn, Textarea } from "../components/ui";
import {
  getMarketResearch,
  generateThemes,
  generateHooks,
  FORMATS,
  TEMPLATES,
  generateAllSlides,
  generateCaption,
  generateHashtags,
  scoreQuality,
  analyzePerformance,
  analyzeSNSPotential,
  REGEN_MODES,
} from "../data/contentAI";

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
  return (
    <div
      onClick={onClick}
      style={{
        background: selected ? "rgba(255,107,0,0.12)" : "var(--bg2)",
        border: `1px solid ${selected ? "var(--accent)" : "var(--border)"}`,
        borderRadius: 4,
        padding: "10px 12px",
        cursor: "pointer",
        transition: "border-color 0.15s, background 0.15s",
        minHeight: 70,
      }}
    >
      <div style={{ fontSize: 9, color: "var(--accent)", letterSpacing: "0.12em", marginBottom: 6 }}>{label}</div>
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

export default function ContentStudio({ data, selectedItemId: initItemId, setSelectedItemId: syncItemId, onNavToStock }) {
  const { items } = data;

  const [step, setStep] = useState(1);
  const [selectedItemId, setSelectedItemIdLocal] = useState(initItemId ?? items[0]?.id ?? "");
  const setSelectedItemId = (id) => { setSelectedItemIdLocal(id); syncItemId?.(id); };
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState(null);

  const [market, setMarket] = useState(null);
  const [themes, setThemes] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [hooks, setHooks] = useState([]);
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

  /* ─── Actions ─── */

  const doResearch = useCallback(() => {
    setMarket(getMarketResearch(item?.category ?? "GEAR"));
    setThemes(generateThemes(item));
    setSelectedTheme(null);
    setStep(2);
  }, [item]);

  const doHooks = useCallback(() => {
    setHooks(generateHooks(item));
    setSelectedHook(null);
    setStep(3);
  }, [item]);

  const doBuild = useCallback((hookOverride) => {
    const hObj = hookOverride ?? selectedHook ?? (hooks[0] ?? { text: "" });
    const h = typeof hObj === "object" ? (hObj.text ?? "") : hObj;
    const fmt = selectedFormat ?? FORMATS[0].id;
    const ss = generateAllSlides(item, h, fmt, regenMode);
    setSlides(ss.map((s) => ({ ...s, selected: 0 })));
    setCaptions(generateCaption(item, hObj));
    setHashtags(generateHashtags(item));
    setQuality(null);
    setSnsAnalysis(null);
    setScriptView(false);
    setStep(4);
  }, [item, selectedHook, selectedFormat, regenMode, hooks]);

  const doScore = useCallback(() => {
    const sel = slides.map((s) => s.options[s.selected]);
    setQuality(scoreQuality(sel, selectedHook?.text ?? ""));
  }, [slides, selectedHook]);

  const doSNS = useCallback(() => {
    setSnsAnalysis(analyzeSNSPotential(item, selectedHook, selectedFormat ?? FORMATS[0].id));
  }, [item, selectedHook, selectedFormat]);

  const doAnalyze = useCallback(() => {
    setPerfResult(analyzePerformance({ ...analytics, hook: selectedHook?.text ?? "" }));
  }, [analytics, selectedHook]);

  const selectSlideOption = (si, oi) =>
    setSlides((prev) => prev.map((s, i) => i === si ? { ...s, selected: oi } : s));

  const doRegen = (mode) => {
    setRegenMode(mode.id);
    const hObj = selectedHook ?? (hooks[0] ?? { text: "" });
    const h = typeof hObj === "object" ? (hObj.text ?? "") : hObj;
    const ss = generateAllSlides(item, h, selectedFormat ?? FORMATS[0].id, mode.id);
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

        {/* Stock preview */}
        {item?.stock && (
          <div style={{ marginTop: 12, background: "var(--bg3)", border: "1px solid var(--border)", padding: "10px 12px" }}>
            <div style={{ fontSize: 9, color: "var(--accent)", letterSpacing: "0.1em", marginBottom: 8 }}>
              ストックデータ — {["situation","hook","reveal","change","good","ng1","ng2","conclusion"].filter(k => item.stock[k]?.trim()).length}/8 入力済み
            </div>
            {[
              { key: "situation", label: "状況" },
              { key: "hook",      label: "フック" },
              { key: "conclusion",label: "結論" },
            ].map(({ key, label }) => (
              <div key={key} style={{ display: "flex", gap: 8, padding: "4px 0", borderBottom: "1px solid var(--border)" }}>
                <div style={{ fontSize: 10, color: "var(--text-dim)", width: 40, flexShrink: 0 }}>{label}</div>
                <div style={{ fontSize: 11, color: item.stock[key] ? "var(--text)" : "#50545e", lineHeight: 1.4 }}>
                  {item.stock[key] || "（未入力）"}
                </div>
              </div>
            ))}
          </div>
        )}
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

  /* ─── Step 2: Themes + Market ─── */

  const renderStep2 = () => (
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
      <Card>
        <CardTitle>投稿テーマ提案（{themes.length}件）</CardTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 5, maxHeight: 500, overflowY: "auto" }}>
          {themes.map((t, i) => {
            const fromStock = i < (item?.stock ? Object.values(item.stock).filter(v => v?.trim()).length : 0);
            return (
              <div key={i} onClick={() => setSelectedTheme(t)} style={{
                padding: "9px 12px", cursor: "pointer", borderRadius: 4,
                background: selectedTheme === t ? "rgba(255,107,0,0.1)" : "var(--bg2)",
                border: `1px solid ${selectedTheme === t ? "var(--accent)" : "var(--border)"}`,
                display: "flex", gap: 8, alignItems: "flex-start",
              }}>
                {fromStock && <span style={{ fontSize: 9, color: "var(--accent)", whiteSpace: "nowrap", marginTop: 2, letterSpacing: "0.05em" }}>ストック</span>}
                <span style={{ fontSize: 12, color: selectedTheme === t ? "var(--text)" : "var(--text-dim)", lineHeight: 1.5 }}>{t}</span>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
          <Btn onClick={doHooks}>フック提案へ ▶</Btn>
        </div>
      </Card>

      {market && (
        <Card>
          <CardTitle>マーケットリサーチ</CardTitle>
          <SectionLabel>よくある悩み</SectionLabel>
          {market.problems.map((p, i) => <div key={i} style={{ fontSize: 11, color: "var(--text-dim)", padding: "3px 0" }}>— {p}</div>)}
          <div style={{ marginTop: 10 }} />
          <SectionLabel>バズる切り口</SectionLabel>
          {(market.viral || []).map((p, i) => <div key={i} style={{ fontSize: 11, color: "var(--text-dim)", padding: "3px 0" }}>— {p}</div>)}
          <div style={{ marginTop: 10 }} />
          <SectionLabel>購買動機</SectionLabel>
          {market.buyReasons.map((p, i) => <div key={i} style={{ fontSize: 11, color: "var(--text-dim)", padding: "3px 0" }}>— {p}</div>)}
        </Card>
      )}
    </div>
  );

  /* ─── Step 3: Hooks ─── */

  const TYPE_COLOR = { 逆張り: "orange", 体験: "blue", 共感: "green", チェック: "gray", NG: "gray" };

  const renderStep3 = () => (
    <Card>
      <CardTitle>フック提案（{hooks.length}件）— クリックで採用</CardTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, maxHeight: 500, overflowY: "auto" }}>
        {hooks.map((h, i) => (
          <div key={i} onClick={() => setSelectedHook(h)} style={{
            padding: "12px", cursor: "pointer", borderRadius: 4,
            background: selectedHook === h ? "rgba(255,107,0,0.1)" : "var(--bg2)",
            border: `1px solid ${selectedHook === h ? "var(--accent)" : "var(--border)"}`,
          }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 6, alignItems: "center" }}>
              <Tag color={TYPE_COLOR[h.type] ?? "gray"}>{h.type}</Tag>
              {h.fromStock && <span style={{ fontSize: 9, color: "var(--accent)", letterSpacing: "0.05em" }}>ストック</span>}
              {selectedHook === h && <span style={{ fontSize: 9, color: "var(--accent)" }}>採用中</span>}
            </div>
            <div style={{ fontSize: 12, color: selectedHook === h ? "var(--text)" : "var(--text-dim)", lineHeight: 1.6 }}>{h.text}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end", gap: 8 }}>
        {selectedHook && <div style={{ fontSize: 11, color: "var(--text-dim)", alignSelf: "center" }}>採用: 「{selectedHook.text.slice(0, 28)}…」</div>}
        <Btn onClick={() => doBuild()} disabled={!selectedHook}>スライド構築へ ▶</Btn>
      </div>
    </Card>
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
          <ScoreDim label="ストック充実度" score={snsAnalysis.breakdown.stock} max={10} />

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
      <PageHeader
        title="コンテンツ制作スタジオ"
        sub={`UpGear v4.6 — ${item?.label ?? "—"} / ストック ${item?.stock ? Object.values(item.stock).filter(v => v?.trim()).length : 0}/8`}
      />
      {stepBar}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
      {step === 5 && renderStep5()}
    </div>
  );
}
