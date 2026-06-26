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
  REGEN_MODES,
} from "../data/contentAI";

/* ─── tiny sub-components ─── */

function SectionLabel({ children, color = "var(--accent)" }) {
  return (
    <div style={{ fontSize: 10, letterSpacing: "0.14em", color, marginBottom: 10, borderLeft: "2px solid currentColor", paddingLeft: 8 }}>
      {children}
    </div>
  );
}

function OptionCard({ text, selected, onClick, label, dim }) {
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
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      {label && <div style={{ fontSize: 9, color: "var(--accent)", letterSpacing: "0.12em" }}>{label}</div>}
      <div style={{ fontSize: 12, color: selected ? "var(--text)" : "var(--text-dim)", lineHeight: 1.6 }}>{text}</div>
      {dim && <div style={{ fontSize: 10, color: "var(--text-dim)" }}>{dim}</div>}
    </div>
  );
}

function ScoreDim({ label, score }) {
  const pct = Math.round((score / 20) * 100);
  const color = score >= 16 ? "var(--accent)" : score >= 12 ? "#6fa8dc" : "var(--border)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0" }}>
      <div style={{ fontSize: 11, color: "var(--text-dim)", width: 90 }}>{label}</div>
      <div style={{ flex: 1, height: 4, background: "var(--bg2)", borderRadius: 0 }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, transition: "width 0.4s" }} />
      </div>
      <div style={{ fontSize: 12, color, width: 32, textAlign: "right" }}>{score}/20</div>
    </div>
  );
}

/* ─── Main Component ─── */

export default function ContentStudio({ data, selectedItemId: initItemId, setSelectedItemId: syncItemId, onNavToStock }) {
  const { items } = data;

  /* Step state */
  const [step, setStep] = useState(1); // 1=setup 2=themes 3=hooks 4=build 5=analyze

  /* Setup */
  const [selectedItemId, setSelectedItemIdLocal] = useState(initItemId ?? items[0]?.id ?? "");
  const setSelectedItemId = (id) => { setSelectedItemIdLocal(id); syncItemId?.(id); };
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState(null);

  /* Generated content */
  const [market, setMarket] = useState(null);
  const [themes, setThemes] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [hooks, setHooks] = useState([]);
  const [selectedHook, setSelectedHook] = useState(null);
  const [regenMode, setRegenMode] = useState(null);
  const [slides, setSlides] = useState([]); // [{slide,options,selected}]
  const [captions, setCaptions] = useState([]);
  const [selectedCaption, setSelectedCaption] = useState(0);
  const [hashtags, setHashtags] = useState("");
  const [quality, setQuality] = useState(null);

  /* Analytics */
  const [analytics, setAnalytics] = useState({ views: "", likes: "", saves: "", comments: "", follows: "", hook: "" });
  const [perfResult, setPerfResult] = useState(null);

  const item = items.find((i) => i.id === selectedItemId) ?? items[0];

  /* ─── Actions ─── */

  const doResearch = useCallback(() => {
    const m = getMarketResearch(item?.category ?? "GEAR");
    setMarket(m);
    const t = generateThemes(item);
    setThemes(t);
    setSelectedTheme(null);
    setStep(2);
  }, [item]);

  const doHooks = useCallback(() => {
    const h = generateHooks(item);
    setHooks(h);
    setSelectedHook(null);
    setStep(3);
  }, [item]);

  const doBuild = useCallback((hookOverride) => {
    const hObj = hookOverride ?? selectedHook ?? (hooks[0] ?? { text: "" });
    const h = hObj.text ?? hObj;
    const fmt = selectedFormat ?? FORMATS[0].id;
    const mode = regenMode;
    const ss = generateAllSlides(item, h, fmt, mode);
    const caps = generateCaption(item, hObj);
    const tags = generateHashtags(item);
    setSlides(ss.map((s) => ({ ...s, selected: 0 })));
    setCaptions(caps);
    setHashtags(tags);
    setQuality(null);
    setStep(4);
  }, [item, selectedHook, selectedFormat, regenMode, hooks]);

  const doScore = useCallback(() => {
    const selected = slides.map((s) => s.options[s.selected]);
    const q = scoreQuality(selected, selectedHook?.text ?? "");
    setQuality(q);
  }, [slides, selectedHook]);

  const doAnalyze = useCallback(() => {
    const r = analyzePerformance({ ...analytics, hook: selectedHook?.text ?? analytics.hook });
    setPerfResult(r);
  }, [analytics, selectedHook]);

  const selectSlideOption = (slideIdx, optIdx) => {
    setSlides((prev) => prev.map((s, i) => i === slideIdx ? { ...s, selected: optIdx } : s));
  };

  const doRegen = (mode) => {
    setRegenMode(mode.id);
    const hObj = selectedHook ?? (hooks[0] ?? { text: "" });
    const h = hObj.text ?? hObj;
    const fmt = selectedFormat ?? FORMATS[0].id;
    const ss = generateAllSlides(item, h, fmt, mode.id);
    setSlides(ss.map((s) => ({ ...s, selected: 0 })));
  };

  /* ─── Copy helpers ─── */

  const copyText = (txt) => navigator.clipboard.writeText(txt).catch(() => {});

  const buildFullScript = () => {
    const lines = slides.map((s, i) => `【スライド${i + 1}】\n${s.options[s.selected]}`).join("\n\n");
    const cap = captions[selectedCaption] ?? "";
    return `${lines}\n\n【キャプション】\n${cap}\n\n【ハッシュタグ】\n${hashtags}`;
  };

  /* ─── STEP BAR ─── */

  const STEPS = ["セットアップ", "テーマ選択", "フック選択", "スライド構築", "投稿分析"];

  const stepBar = (
    <div style={{ display: "flex", gap: 0, marginBottom: 24, borderBottom: "1px solid var(--border)" }}>
      {STEPS.map((s, i) => {
        const n = i + 1;
        const active = step === n;
        const done = step > n;
        return (
          <button
            key={n}
            onClick={() => n < step && setStep(n)}
            style={{
              flex: 1, padding: "10px 4px", background: "none", border: "none", borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent",
              color: active ? "var(--accent)" : done ? "var(--text-dim)" : "#50545e",
              fontSize: 11, cursor: n < step ? "pointer" : "default", letterSpacing: "0.05em",
            }}
          >
            <span style={{ marginRight: 4, fontSize: 9 }}>{done ? "✓" : n}</span>{s}
          </button>
        );
      })}
    </div>
  );

  /* ─── STEP 1: SETUP ─── */

  const renderStep1 = () => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      {/* Item select */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <CardTitle style={{ marginBottom: 0 }}>アイテム選択</CardTitle>
          {onNavToStock && item && (
            <button
              onClick={() => onNavToStock(item.id)}
              style={{ fontSize: 11, color: "var(--accent)", background: "none", border: "1px solid var(--accent)", padding: "4px 10px", cursor: "pointer" }}
            >
              ◉ ストックを編集
            </button>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 300, overflowY: "auto" }}>
          {items.map((it) => (
            <div
              key={it.id}
              onClick={() => setSelectedItemId(it.id)}
              style={{
                padding: "10px 12px", cursor: "pointer",
                background: selectedItemId === it.id ? "rgba(255,107,0,0.1)" : "var(--bg2)",
                border: `1px solid ${selectedItemId === it.id ? "var(--accent)" : "var(--border)"}`,
                borderRadius: 4,
              }}
            >
              <div style={{ fontSize: 12, color: selectedItemId === it.id ? "var(--text)" : "var(--text-dim)" }}>
                No.{it.no}　{it.label}
              </div>
              <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 2 }}>{it.category} / {it.judgment}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Template + Format */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Card>
          <CardTitle>テンプレート</CardTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {TEMPLATES.map((t) => (
              <OptionCard
                key={t.id}
                text={t.label}
                dim={t.desc}
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
              <OptionCard
                key={f.id}
                text={`${f.icon} ${f.label}`}
                dim={f.desc}
                selected={selectedFormat === f.id}
                onClick={() => setSelectedFormat(f.id)}
              />
            ))}
          </div>
        </Card>
        {/* Stock preview */}
        {item?.stock && (
          <Card style={{ background: "var(--bg3)", border: "1px solid var(--border)", marginTop: 4 }}>
            <div style={{ fontSize: 10, color: "var(--accent)", letterSpacing: "0.1em", marginBottom: 8 }}>ストックデータ（{item.label}）</div>
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
          </Card>
        )}
        <Btn onClick={doResearch} style={{ alignSelf: "flex-end" }}>マーケット調査 → テーマ生成 ▶</Btn>
      </div>
    </div>
  );

  /* ─── STEP 2: THEMES + MARKET ─── */

  const renderStep2 = () => (
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
      <Card>
        <CardTitle>投稿テーマ提案（{themes.length}件）</CardTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 500, overflowY: "auto" }}>
          {themes.map((t, i) => (
            <div
              key={i}
              onClick={() => setSelectedTheme(t)}
              style={{
                padding: "10px 12px", cursor: "pointer", borderRadius: 4,
                background: selectedTheme === t ? "rgba(255,107,0,0.1)" : "var(--bg2)",
                border: `1px solid ${selectedTheme === t ? "var(--accent)" : "var(--border)"}`,
                fontSize: 12, color: selectedTheme === t ? "var(--text)" : "var(--text-dim)", lineHeight: 1.5,
              }}
            >
              {t}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
          <Btn onClick={doHooks}>フック提案へ ▶</Btn>
        </div>
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
    </div>
  );

  /* ─── STEP 3: HOOKS ─── */

  const TYPE_COLOR = { 逆張り: "orange", 体験: "blue", 共感: "green", チェック: "gray", NG: "gray" };

  const renderStep3 = () => (
    <Card>
      <CardTitle>フック提案（{hooks.length}件）— クリックで採用</CardTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, maxHeight: 520, overflowY: "auto" }}>
        {hooks.map((h, i) => (
          <div
            key={i}
            onClick={() => setSelectedHook(h)}
            style={{
              padding: "12px", cursor: "pointer", borderRadius: 4,
              background: selectedHook === h ? "rgba(255,107,0,0.1)" : "var(--bg2)",
              border: `1px solid ${selectedHook === h ? "var(--accent)" : "var(--border)"}`,
            }}
          >
            <div style={{ display: "flex", gap: 6, marginBottom: 6, alignItems: "center" }}>
              <Tag color={TYPE_COLOR[h.type] ?? "gray"}>{h.type}</Tag>
              {selectedHook === h && <span style={{ fontSize: 10, color: "var(--accent)" }}>採用中</span>}
            </div>
            <div style={{ fontSize: 12, color: selectedHook === h ? "var(--text)" : "var(--text-dim)", lineHeight: 1.6 }}>{h.text}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end", gap: 8 }}>
        {selectedHook && <div style={{ fontSize: 11, color: "var(--text-dim)", alignSelf: "center" }}>採用: 「{selectedHook.text.slice(0, 30)}…」</div>}
        <Btn onClick={() => doBuild()} disabled={!selectedHook}>スライド構築へ ▶</Btn>
      </div>
    </Card>
  );

  /* ─── STEP 4: SLIDES ─── */

  const renderStep4 = () => (
    <div>
      {/* Regen modes */}
      <Card style={{ marginBottom: 12 }}>
        <CardTitle>再生成モード</CardTitle>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {REGEN_MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => doRegen(m)}
              style={{
                padding: "6px 12px", background: regenMode === m.id ? "rgba(255,107,0,0.15)" : "var(--bg2)",
                border: `1px solid ${regenMode === m.id ? "var(--accent)" : "var(--border)"}`,
                color: regenMode === m.id ? "var(--accent)" : "var(--text-dim)",
                fontSize: 11, cursor: "pointer", borderRadius: 3,
              }}
            >
              {m.label}
              <span style={{ fontSize: 9, color: "var(--text-dim)", marginLeft: 4 }}>{m.desc}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Slides */}
      {slides.map((s, si) => (
        <Card key={si} style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <CardTitle style={{ marginBottom: 0 }}>スライド {si + 1} — {s.slide}</CardTitle>
            <button
              onClick={() => copyText(s.options[s.selected])}
              style={{ fontSize: 10, color: "var(--text-dim)", background: "none", border: "1px solid var(--border)", padding: "3px 8px", cursor: "pointer" }}
            >
              コピー
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {s.options.map((opt, oi) => (
              <OptionCard
                key={oi}
                text={opt}
                label={`案 ${oi + 1}`}
                selected={s.selected === oi}
                onClick={() => selectSlideOption(si, oi)}
              />
            ))}
          </div>
        </Card>
      ))}

      {/* Caption */}
      {captions.length > 0 && (
        <Card style={{ marginBottom: 12 }}>
          <CardTitle>キャプション</CardTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {captions.map((c, i) => (
              <OptionCard key={i} text={c} label={`案 ${i + 1}`} selected={selectedCaption === i} onClick={() => setSelectedCaption(i)} />
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

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <Btn onClick={() => copyText(buildFullScript())}>全スクリプトをコピー</Btn>
        <Btn onClick={doScore}>品質スコアを算出</Btn>
        <Btn onClick={() => setStep(5)}>投稿後分析へ ▶</Btn>
      </div>

      {/* Quality score */}
      {quality && (
        <Card style={{ borderLeft: `3px solid ${quality.total >= 80 ? "var(--accent)" : quality.total >= 60 ? "#6fa8dc" : "var(--border)"}` }}>
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
          {quality.aiPenalty > 0 && (
            <div style={{ marginTop: 8, fontSize: 11, color: "#e06c75" }}>AI文体ペナルティ: -{quality.aiPenalty}点</div>
          )}
          {quality.improvements.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <SectionLabel color="#6fa8dc">改善提案</SectionLabel>
              {quality.improvements.map((imp, i) => (
                <div key={i} style={{ fontSize: 11, color: "var(--text-dim)", padding: "3px 0" }}>→ {imp}</div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );

  /* ─── STEP 5: ANALYTICS ─── */

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
              <input
                type="number"
                value={analytics[key]}
                onChange={(e) => setAnalytics((a) => ({ ...a, [key]: e.target.value }))}
                style={{
                  flex: 1, background: "var(--bg2)", border: "1px solid var(--border)", color: "var(--text)",
                  padding: "6px 10px", fontSize: 12, outline: "none",
                }}
              />
            </div>
          ))}
          <div style={{ marginTop: 4 }}>
            <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 6 }}>使用したフック</div>
            <Textarea
              value={analytics.hook || selectedHook?.text || ""}
              onChange={(e) => setAnalytics((a) => ({ ...a, hook: e.target.value }))}
              rows={3}
              style={{ width: "100%", fontSize: 11 }}
            />
          </div>
          <Btn onClick={doAnalyze}>AI分析を実行</Btn>
        </div>
      </Card>

      {perfResult && (
        <Card>
          <CardTitle>AI解析レポート</CardTitle>
          <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "var(--text-dim)" }}>いいね率</div>
              <div style={{ fontSize: 20, color: perfResult.likeRate >= 3 ? "var(--accent)" : "var(--text)" }}>{perfResult.likeRate}%</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "var(--text-dim)" }}>保存率</div>
              <div style={{ fontSize: 20, color: perfResult.saveRate >= 2 ? "var(--accent)" : "var(--text)" }}>{perfResult.saveRate}%</div>
            </div>
          </div>

          <SectionLabel>うまくいった理由</SectionLabel>
          {perfResult.reasons.map((r, i) => <div key={i} style={{ fontSize: 11, color: "var(--text-dim)", padding: "3px 0" }}>✓ {r}</div>)}

          {perfResult.improvements.length > 0 && (
            <>
              <div style={{ marginTop: 10 }} />
              <SectionLabel color="#6fa8dc">改善ポイント</SectionLabel>
              {perfResult.improvements.map((r, i) => <div key={i} style={{ fontSize: 11, color: "var(--text-dim)", padding: "3px 0" }}>→ {r}</div>)}
            </>
          )}

          <div style={{ marginTop: 10 }} />
          <SectionLabel color="#98c379">次回の仮説</SectionLabel>
          {perfResult.nextTips.map((r, i) => <div key={i} style={{ fontSize: 11, color: "var(--text-dim)", padding: "3px 0" }}>▶ {r}</div>)}
        </Card>
      )}
    </div>
  );

  /* ─── RENDER ─── */

  return (
    <div>
      <PageHeader
        title="コンテンツ制作スタジオ"
        sub={`UpGear v4.6 — AIコンテンツ制作システム / アイテム: ${item?.label ?? "—"}`}
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
