import { useState, useEffect, useRef } from "react";
import { Btn, Tag } from "../components/ui";
import {
  generateProductUnderstanding,
  detectUrlType,
  URL_TYPE_LABELS,
  FETCH_STAGES,
  calcUnderstandingScore,
} from "../data/productUnderstandingAI";
import { runMarketResearch } from "../data/marketResearchAI";

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

// ─── Step 2: 商品理解（Playwright + Claude API） ──────────────────────────────

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

      {/* Confirmation gate for low confidence */}
      {done && card && requiresConfirmation && (
        <div style={{ background: "rgba(255,107,0,0.08)", border: "1px solid var(--accent)", padding: "12px 16px", marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600, marginBottom: 4 }}>
            カテゴリ信頼度 {confidence}% — 確認が必要です
          </div>
          <div style={{ fontSize: 11, color: "var(--text-dim)" }}>
            推定: <strong style={{ color: "var(--text)" }}>{card.category || "不明"}</strong>　›　<strong style={{ color: "var(--text)" }}>{card.subCategory || "不明"}</strong>
          </div>
          <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 4 }}>
            根拠: {card.categorySource || "—"}
          </div>
        </div>
      )}

      {done && card && (
        <div>
          <UnderstandingScore score={card.understandingScore} missing={card.missingFields || []} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Btn small onClick={() => onBack()}>← URL修正</Btn>
            <Btn variant="primary" onClick={() => onComplete(card)}>確認画面へ →</Btn>
          </div>
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
          次のステップ: 商品カルテを使って市場調査を実行します
        </div>
        <Btn variant="primary" onClick={onNext}>市場調査へ →</Btn>
      </div>
    </div>
  );
}

// ─── Step 5: 市場調査 ─────────────────────────────────────────────────────────

function Step5({ savedItem, onComplete }) {
  const [running, setRunning] = useState(false);
  const [research, setResearch] = useState(null);

  const run = () => {
    setRunning(true);
    setTimeout(() => {
      const result = runMarketResearch(savedItem);
      setResearch(result);
      setRunning(false);
    }, 1200);
  };

  const topArch = research?.bestArchetype?.[0];
  const archColors = { "バズ型": "#FF6B00", "保存型": "#6fa8dc", "フォロー型": "#98c379" };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>市場調査</h2>
        <p style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.7 }}>
          商品カルテのキーワード・カテゴリ・ターゲットを基に市場を調査します。<br />
          商品名検索は使用しません。
        </p>
      </div>

      {savedItem.card?.understandingScore < 90 && (
        <div style={{ background: "rgba(224,108,117,0.1)", border: "1px solid #e06c75", padding: "12px 16px", marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: "#e06c75", fontWeight: 600, marginBottom: 4 }}>
            商品理解スコア {savedItem.card?.understandingScore}点 — 90点未満
          </div>
          <div style={{ fontSize: 11, color: "var(--text-dim)" }}>
            市場調査精度が低下する可能性があります。それでも実行できます。
          </div>
        </div>
      )}

      {!research && (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          {running ? (
            <div>
              <div style={{ fontSize: 14, color: "var(--text-dim)", marginBottom: 12 }}>
                調査中...
              </div>
              <div style={{ fontSize: 11, color: "var(--text-dim)" }}>
                カテゴリ: {savedItem.category} ／ キーワード: {(savedItem.card?.searchKeywords || []).slice(0, 3).join("、")}
              </div>
            </div>
          ) : (
            <Btn variant="primary" onClick={run}>市場調査を実行 →</Btn>
          )}
        </div>
      )}

      {research && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 16 }}>
            <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", padding: "12px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 9, color: "var(--text-dim)", marginBottom: 4 }}>UpGearスコア</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "var(--accent)" }}>{research.score?.total}</div>
            </div>
            {topArch && (
              <div style={{ background: "var(--bg2)", border: `1px solid ${archColors[topArch.name] || "var(--border)"}`, padding: "12px 14px", textAlign: "center" }}>
                <div style={{ fontSize: 9, color: "var(--text-dim)", marginBottom: 4 }}>推奨アーキタイプ</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: archColors[topArch.name] }}>{topArch.name}</div>
              </div>
            )}
            <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", padding: "12px 14px" }}>
              <div style={{ fontSize: 9, color: "var(--text-dim)", marginBottom: 4 }}>推奨フック</div>
              <div style={{ fontSize: 11, lineHeight: 1.5 }}>「{research.hooks?.[0]?.text?.slice(0, 30)}…」</div>
            </div>
          </div>

          <div style={{ padding: "14px 16px", background: "var(--bg2)", border: "1px solid var(--accent)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <div style={{ fontSize: 11, color: "var(--text-dim)" }}>
              市場調査が完了しました。制作スタジオへ引き継ぎます。
            </div>
            <Btn variant="primary" onClick={() => onComplete(research)}>制作スタジオへ →</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step 6: 制作スタジオ準備完了 ─────────────────────────────────────────────

function Step6({ savedItem, research, onGoToStudio, onFinish }) {
  const archColors = { "バズ型": "#FF6B00", "保存型": "#6fa8dc", "フォロー型": "#98c379" };
  const topArch = research?.bestArchetype?.[0];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>🎬</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>制作スタジオへ引き継ぎ完了</h2>
        <p style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.7 }}>
          以下の情報が制作スタジオへ引き継がれます。
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 24 }}>
        {[
          { label: "商品理解", value: `スコア ${savedItem.card?.understandingScore}点`, color: "#98c379" },
          { label: "市場調査", value: "完了", color: "#98c379" },
          { label: "推奨アーキタイプ", value: topArch?.name || "—", color: archColors[topArch?.name] || "var(--accent)" },
          { label: "UpGearスコア", value: `${research?.score?.total}点`, color: "var(--accent)" },
          { label: "フック候補", value: `${(research?.hooks || []).length}件`, color: "var(--text)" },
          { label: "投稿企画", value: `${(research?.postPlans || []).length}本`, color: "var(--text)" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: "var(--bg2)", border: "1px solid var(--border)", padding: "12px 14px" }}>
            <div style={{ fontSize: 9, color: "var(--text-dim)", marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <Btn onClick={onFinish}>ストックに戻る</Btn>
        <Btn variant="primary" onClick={onGoToStudio}>制作スタジオを開く ▶</Btn>
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
  const [research, setResearch] = useState(null);

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

  const handleStep5Complete = (researchResult) => {
    setResearch(researchResult);
    setStep(6);
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
          <Step5 savedItem={savedItem} onComplete={handleStep5Complete} />
        )}
        {step === 6 && savedItem && (
          <Step6
            savedItem={savedItem}
            research={research}
            onGoToStudio={() => { onGoToStudio(savedItem.id, research); onClose(); }}
            onFinish={onClose}
          />
        )}
      </div>
    </div>
  );
}
