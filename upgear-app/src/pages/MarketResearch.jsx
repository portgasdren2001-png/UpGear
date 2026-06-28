import { useState } from "react";
import { PageHeader, Card, CardTitle, Tag, Btn } from "../components/ui";
import { runMarketResearch, getLearningInsights } from "../data/marketResearchAI";
import { generateProductCard } from "../data/productCard";

/* ─── Shared primitives ──────────────────────────────────────────────────────── */

function Row({ label, value, accent }) {
  return (
    <div style={{ display: "flex", gap: 10, padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
      <div style={{ fontSize: 10, color: "var(--text-dim)", width: 110, flexShrink: 0 }}>{label}</div>
      <div style={{ fontSize: 11, color: accent ? "var(--accent)" : "var(--text)", lineHeight: 1.5, flex: 1 }}>{value}</div>
    </div>
  );
}

function ScoreBar({ label, score, max, color }) {
  const pct = Math.round((score / max) * 100);
  const c = color || (pct >= 80 ? "var(--accent)" : pct >= 55 ? "#6fa8dc" : "var(--border)");
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0" }}>
      <div style={{ fontSize: 11, color: "var(--text-dim)", width: 96, flexShrink: 0 }}>{label}</div>
      <div style={{ flex: 1, height: 4, background: "var(--bg2)" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: c, transition: "width 0.4s" }} />
      </div>
      <div style={{ fontSize: 11, color: c, width: 40, textAlign: "right" }}>{score}/{max}</div>
    </div>
  );
}

function BulletList({ items, color = "var(--text-dim)" }) {
  return (
    <div>
      {(items || []).map((t, i) => (
        <div key={i} style={{ fontSize: 11, color, padding: "3px 0", lineHeight: 1.6 }}>— {t}</div>
      ))}
    </div>
  );
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  return (
    <button onClick={copy} style={{
      fontSize: 9, color: copied ? "var(--accent)" : "var(--text-dim)",
      background: "none", border: "1px solid var(--border)", padding: "2px 6px", cursor: "pointer",
    }}>{copied ? "✓" : "コピー"}</button>
  );
}

function Selectable({ selected, onSelect, children, style }) {
  return (
    <div onClick={onSelect} style={{
      padding: "8px 12px", cursor: "pointer",
      background: selected ? "rgba(255,107,0,0.08)" : "var(--bg2)",
      border: `1px solid ${selected ? "var(--accent)" : "var(--border)"}`,
      marginBottom: 6,
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ─── Accordion ─────────────────────────────────────────────────────────────── */

function Accordion({ title, badge, defaultOpen = false, accent = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ border: `1px solid ${accent ? "var(--accent)" : "var(--border)"}`, marginBottom: 8 }}>
      <button onClick={() => setOpen((v) => !v)} style={{
        width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "10px 14px", background: open ? "rgba(255,255,255,0.03)" : "var(--bg2)",
        border: "none", cursor: "pointer", fontFamily: "var(--font-mono)", textAlign: "left",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: accent ? "var(--accent)" : "var(--text)", fontWeight: 600 }}>{title}</span>
          {badge && <span style={{ fontSize: 9, color: "var(--text-dim)", background: "var(--bg3)", padding: "1px 6px", border: "1px solid var(--border)" }}>{badge}</span>}
        </div>
        <span style={{ fontSize: 10, color: "var(--text-dim)" }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div style={{ padding: "14px 16px", background: "var(--bg3)", borderTop: "1px solid var(--border)" }}>
          {children}
        </div>
      )}
    </div>
  );
}

/* ─── Star rating display ───────────────────────────────────────────────────── */

function StarBar({ label, count, total }) {
  const pct = total ? (count / total) * 100 : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "2px 0" }}>
      <span style={{ fontSize: 10, color: "var(--text-dim)", width: 20, textAlign: "right" }}>{label}★</span>
      <div style={{ flex: 1, height: 6, background: "var(--bg2)" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: label >= 4 ? "#98c379" : label === 3 ? "#6fa8dc" : "#e06c75" }} />
      </div>
      <span style={{ fontSize: 10, color: "var(--text-dim)", width: 36, textAlign: "right" }}>{count}</span>
    </div>
  );
}

/* ─── Tabs ───────────────────────────────────────────────────────────────────── */

const TABS = [
  { id: "product",  label: "①商品理解" },
  { id: "market",   label: "②市場分析" },
  { id: "strategy", label: "③投稿戦略" },
  { id: "generate", label: "④投稿生成" },
  { id: "evidence", label: "⑤根拠" },
];

const ARCHETYPE_COLORS = { "バズ型": "#FF6B00", "保存型": "#6fa8dc", "フォロー型": "#98c379" };
const HOOK_TYPE_COLOR = { 逆張り: "orange", 体験: "blue", 共感: "green", チェック: "gray", NG: "gray" };

/* ─── Main component ─────────────────────────────────────────────────────────── */

export default function MarketResearch({ data, learningData, onApplyToStudio }) {
  const { items } = data;
  const [selectedItemId, setSelectedItemId] = useState(items[0]?.id ?? "");
  const [card, setCard] = useState(null);
  const [research, setResearch] = useState(null);
  const [running, setRunning] = useState(false);
  const [activeTab, setActiveTab] = useState("product");
  const [selectedHook, setSelectedHook] = useState(null);
  const [selectedTitles, setSelectedTitles] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedCTAs, setSelectedCTAs] = useState({ saves: null, comments: null, follows: null });
  const [scriptArchetype, setScriptArchetype] = useState(0);

  const item = items.find((i) => i.id === selectedItemId) ?? items[0];
  const insights = getLearningInsights(learningData);

  const run = () => {
    if (!item) return;
    setRunning(true);
    setTimeout(() => {
      setCard(generateProductCard(item));
      setResearch(runMarketResearch(item));
      setRunning(false);
      setActiveTab("product");
      setSelectedHook(null);
      setSelectedTitles([]);
      setSelectedPlan(null);
      setSelectedCTAs({ saves: null, comments: null, follows: null });
    }, 700);
  };

  const handleApply = () => {
    if (!research || !onApplyToStudio) return;
    onApplyToStudio({
      itemId: selectedItemId,
      hook: selectedHook ?? research.hooks?.[0],
      plan: selectedPlan ?? research.postPlans?.[0],
      titles: selectedTitles,
      ctas: selectedCTAs,
    });
  };

  const toggleTitle = (t) =>
    setSelectedTitles((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);

  const topArchetype = research?.bestArchetype?.[0];

  /* ─── Tab contents ──────────────────────────────────────────────────────────── */

  const renderProduct = () => !card ? null : (
    <div>
      {/* 商品カルテ — always open */}
      <Card style={{ marginBottom: 12, borderLeft: "3px solid var(--accent)" }}>
        <CardTitle>商品カルテ</CardTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 12 }}>
          {[
            ["ブランド", card.brand],
            ["カテゴリ", card.categoryLabel],
            ["価格", card.price],
            ["スコア", `${card.score}点`],
            ["判定", card.judgment],
          ].map(([l, v]) => (
            <div key={l} style={{ background: "var(--bg2)", border: "1px solid var(--border)", padding: "10px 12px" }}>
              <div style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.15em", marginBottom: 4 }}>{l}</div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{v}</div>
            </div>
          ))}
        </div>
        {card.urls && Object.values(card.urls).some(Boolean) && (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 9, color: "var(--text-dim)", marginBottom: 6 }}>参照URL</div>
            {Object.entries(card.urls).filter(([, v]) => v).map(([k, v]) => (
              <div key={k} style={{ fontSize: 10, display: "flex", gap: 8, alignItems: "center", marginBottom: 3 }}>
                <span style={{ color: "var(--accent)", width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", display: "inline-block", flexShrink: 0 }} />
                <span style={{ color: "var(--text-dim)", width: 80 }}>{k}</span>
                <span style={{ color: "#6fa8dc", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{v}</span>
                <span style={{ fontSize: 9, color: "#e06c75", background: "rgba(224,108,117,0.1)", padding: "1px 5px", border: "1px solid rgba(224,108,117,0.2)", whiteSpace: "nowrap" }}>Phase2で取得</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 特徴・仕様 */}
      <Accordion title="特徴・仕様">
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 10, color: "var(--text-dim)", marginBottom: 6 }}>商品説明</div>
          <div style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.7 }}>{card.description}</div>
        </div>
        <div style={{ fontSize: 10, color: "var(--text-dim)", marginBottom: 6, marginTop: 12 }}>主な仕様</div>
        <BulletList items={card.specs} />
        {research?.overview?.features && (
          <>
            <div style={{ fontSize: 10, color: "var(--text-dim)", marginBottom: 6, marginTop: 12 }}>特長</div>
            <div style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.7 }}>{research.overview.features}</div>
          </>
        )}
      </Accordion>

      {/* 口コミ分析 */}
      <Accordion title="口コミ・レビュー分析" badge={`★${card.reviewSummary.avg} / ${card.reviewSummary.count}件`} defaultOpen>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "var(--accent)" }}>{card.reviewSummary.avg}</div>
            <div style={{ fontSize: 10, color: "var(--text-dim)", marginBottom: 12 }}>{card.reviewSummary.count}件のレビュー</div>
            {[5, 4, 3, 2, 1].map((n) => (
              <StarBar key={n} label={n} count={card.reviewSummary.distribution[n]} total={card.reviewSummary.count} />
            ))}
          </div>
          <div>
            <div style={{ fontSize: 10, color: "#98c379", marginBottom: 6 }}>ポジティブ評価</div>
            <BulletList items={card.reviewSummary.positive} color="var(--text)" />
            <div style={{ fontSize: 10, color: "#e06c75", marginBottom: 6, marginTop: 12 }}>ネガティブ評価</div>
            <BulletList items={card.reviewSummary.negative} color="var(--text-dim)" />
          </div>
        </div>
      </Accordion>

      {/* メリット・デメリット */}
      <Accordion title="メリット・デメリット">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          <div>
            <div style={{ fontSize: 10, color: "#98c379", letterSpacing: "0.1em", marginBottom: 8 }}>メリット</div>
            <BulletList items={research?.reviews?.positive || card.reviewSummary.positive} color="var(--text)" />
          </div>
          <div>
            <div style={{ fontSize: 10, color: "#e06c75", letterSpacing: "0.1em", marginBottom: 8 }}>デメリット・注意点</div>
            <BulletList items={research?.reviews?.negative || card.reviewSummary.negative} />
            {card.reviewSummary.complaints?.length > 0 && (
              <>
                <div style={{ fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.1em", marginBottom: 8, marginTop: 12 }}>よくある不満</div>
                <BulletList items={card.reviewSummary.complaints} />
              </>
            )}
          </div>
        </div>
      </Accordion>

      {/* ターゲット分析 */}
      <Accordion title="ターゲット分析">
        {research?.target && (
          <>
            <Row label="年齢層" value={research.target.age} />
            <Row label="性別" value={research.target.gender} />
            <Row label="職業" value={research.target.occupation} />
            <Row label="生活スタイル" value={research.target.lifestyle} />
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 10, color: "var(--text-dim)", marginBottom: 6 }}>購買動機</div>
              <BulletList items={research.target.buyMotivation} />
            </div>
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 10, color: "#e06c75", marginBottom: 6 }}>向いていない人</div>
              <BulletList items={research.target.dontBuy} />
            </div>
          </>
        )}
      </Accordion>
    </div>
  );

  const renderMarket = () => !research ? null : (
    <div>
      {/* UpGearスコア — always visible */}
      <Card style={{ marginBottom: 12 }}>
        <CardTitle>市場スコア — UpGear {research.score?.total ?? "—"}点</CardTitle>
        {research.score && Object.entries(research.score).filter(([k]) => k !== "total").map(([k, v]) => {
          const dim = { equip: ["装備性",20], judgment: ["判断削減力",20], continuity: ["継続運用性",20], cospa: ["コスパ",15], irreplace: ["代替不可能性",15], satisfaction: ["満足度",5], longterm: ["長期利用価値",5] };
          const d = dim[k];
          return d ? <ScoreBar key={k} label={d[0]} score={v} max={d[1]} /> : null;
        })}
      </Card>

      {/* SNS分析 */}
      <Accordion title="SNS分析" badge={`総合 ${research.sns?.score ?? "—"}点`} defaultOpen>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 12 }}>
          {[["バズ型", research.sns?.buzz, "#FF6B00"], ["保存型", research.sns?.save, "#6fa8dc"], ["フォロー型", research.sns?.follow, "#98c379"]].map(([l, v, c]) => (
            <div key={l} style={{ background: "var(--bg2)", border: "1px solid var(--border)", padding: "12px", textAlign: "center" }}>
              <div style={{ fontSize: 10, color: c, marginBottom: 4 }}>{l}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: c }}>{v ?? "—"}</div>
              <div style={{ fontSize: 9, color: "var(--text-dim)" }}>/ 100</div>
            </div>
          ))}
        </div>
        {research.sns?.tiktok && (
          <div>
            <div style={{ fontSize: 10, color: "var(--text-dim)", marginBottom: 6 }}>TikTokで伸びる要素</div>
            <BulletList items={research.sns.tiktok.buzzing} />
          </div>
        )}
      </Accordion>

      {/* 競合分析 */}
      <Accordion title="競合分析" badge={`${(research.competitors || []).length}社`}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", fontSize: 11, borderCollapse: "collapse" }}>
            <thead>
              <tr>{["商品名", "価格", "強み", "弱み", "ポジション"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "6px 8px", borderBottom: "1px solid var(--border)", color: "var(--text-dim)", fontSize: 10 }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {(research.competitors || []).map((c) => (
                <tr key={c.name}>
                  <td style={{ padding: "6px 8px", borderBottom: "1px solid var(--border)", color: "var(--accent)" }}>{c.name}</td>
                  <td style={{ padding: "6px 8px", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" }}>{c.price}</td>
                  <td style={{ padding: "6px 8px", borderBottom: "1px solid var(--border)", color: "#98c379" }}>{c.pros}</td>
                  <td style={{ padding: "6px 8px", borderBottom: "1px solid var(--border)", color: "#e06c75" }}>{c.cons}</td>
                  <td style={{ padding: "6px 8px", borderBottom: "1px solid var(--border)", color: "var(--text-dim)" }}>{c.position}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Accordion>

      {/* 検索ニーズ */}
      <Accordion title="検索ニーズ">
        {research.searchNeeds && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
            {Object.entries(research.searchNeeds).map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: 10, color: "var(--accent)", marginBottom: 6 }}>{k}</div>
                <BulletList items={v} />
              </div>
            ))}
          </div>
        )}
      </Accordion>

      {/* 最適SNS */}
      <Accordion title="最適SNS判定">
        {research.optimalSNS && (
          <>
            <Row label="推奨プラットフォーム" value={research.optimalSNS.primary} accent />
            <Row label="補助プラットフォーム" value={research.optimalSNS.secondary} />
          </>
        )}
        {insights && (
          <div style={{ marginTop: 12, padding: "10px 12px", background: "var(--bg2)", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 10, color: "var(--accent)", marginBottom: 4 }}>学習データ（{insights.count}投稿）</div>
            {insights.bestHook && <Row label="最強フック型" value={`${insights.bestHook.type}（平均${insights.bestHook.avgViews.toLocaleString()}再生）`} accent />}
          </div>
        )}
      </Accordion>
    </div>
  );

  const renderStrategy = () => !research ? null : (
    <div>
      {/* 推奨アーキタイプ — always visible */}
      {topArchetype && (
        <Card style={{ marginBottom: 12, borderLeft: `3px solid ${ARCHETYPE_COLORS[topArchetype.name] || "var(--accent)"}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
            <div>
              <div style={{ fontSize: 10, color: "var(--text-dim)", marginBottom: 4 }}>最推奨アーキタイプ</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: ARCHETYPE_COLORS[topArchetype.name] || "var(--accent)" }}>{topArchetype.name}</div>
              <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>{topArchetype.reason}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, color: "var(--text-dim)", marginBottom: 4 }}>スコア</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{topArchetype.score}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            {(research.bestArchetype || []).map((a) => (
              <div key={a.name} style={{ padding: "6px 12px", background: "var(--bg2)", border: `1px solid ${ARCHETYPE_COLORS[a.name] || "var(--border)"}`, fontSize: 11 }}>
                <span style={{ color: ARCHETYPE_COLORS[a.name] }}>{a.name}</span>
                <span style={{ color: "var(--text-dim)", marginLeft: 8 }}>{a.score}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 差別化ポイント */}
      <Accordion title="差別化ポイント" defaultOpen>
        <BulletList items={research.differentiation} color="var(--text)" />
      </Accordion>

      {/* フック候補 */}
      <Accordion title="フック候補" badge={`${(research.hooks || []).length}件`} defaultOpen>
        <div style={{ fontSize: 10, color: "var(--text-dim)", marginBottom: 8 }}>クリックで選択 → ④投稿生成・制作スタジオへ引き継ぎ</div>
        {(research.hooks || []).map((h, i) => (
          <Selectable key={i} selected={selectedHook === h} onSelect={() => setSelectedHook(selectedHook === h ? null : h)}>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <Tag color={HOOK_TYPE_COLOR[h.type] || "gray"}>{h.type || "—"}</Tag>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, lineHeight: 1.6, color: selectedHook === h ? "var(--text)" : "var(--text-dim)" }}>{h.text}</div>
              </div>
              <CopyBtn text={h.text} />
            </div>
          </Selectable>
        ))}
      </Accordion>

      {/* CTA候補 */}
      <Accordion title="CTA候補">
        {research.ctas && Object.entries(research.ctas).map(([type, ctaList]) => (
          <div key={type} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: "var(--accent)", marginBottom: 6 }}>{type === "saves" ? "保存促進" : type === "comments" ? "コメント促進" : "フォロー促進"}</div>
            {(ctaList || []).map((cta, i) => (
              <Selectable key={i} selected={selectedCTAs[type] === cta} onSelect={() => setSelectedCTAs((prev) => ({ ...prev, [type]: prev[type] === cta ? null : cta }))}>
                <span style={{ fontSize: 11, color: "var(--text-dim)" }}>{cta}</span>
              </Selectable>
            ))}
          </div>
        ))}
      </Accordion>

      {/* 投稿戦略説明 */}
      {research.strategy && (
        <Accordion title="投稿戦略メモ">
          <Row label="アプローチ" value={research.strategy.approach} />
          <Row label="フック戦略" value={research.strategy.hook} />
          <Row label="スライド設計" value={research.strategy.slide} />
          <Row label="クロージング" value={research.strategy.closing} />
        </Accordion>
      )}
    </div>
  );

  const renderGenerate = () => !research ? null : (
    <div>
      {/* タイトル候補 */}
      <Accordion title="タイトル候補" badge={`${selectedTitles.length}件選択`} defaultOpen>
        <div style={{ fontSize: 10, color: "var(--text-dim)", marginBottom: 8 }}>チェックで選択</div>
        {(research.titles || []).map((t, i) => (
          <Selectable key={i} selected={selectedTitles.includes(t)} onSelect={() => toggleTitle(t)}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ width: 14, height: 14, border: `1px solid ${selectedTitles.includes(t) ? "var(--accent)" : "var(--border)"}`, background: selectedTitles.includes(t) ? "var(--accent)" : "none", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {selectedTitles.includes(t) && <span style={{ color: "#000", fontSize: 9 }}>✓</span>}
              </span>
              <span style={{ fontSize: 11, flex: 1 }}>{t}</span>
              <CopyBtn text={t} />
            </div>
          </Selectable>
        ))}
      </Accordion>

      {/* 投稿台本 */}
      <Accordion title="投稿台本（3アーキタイプ）" defaultOpen>
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          {(research.bestArchetype || []).map((a, i) => (
            <button key={a.name} onClick={() => setScriptArchetype(i)} style={{
              padding: "6px 14px", border: `1px solid ${scriptArchetype === i ? (ARCHETYPE_COLORS[a.name] || "var(--accent)") : "var(--border)"}`,
              background: scriptArchetype === i ? "rgba(255,107,0,0.08)" : "none",
              color: scriptArchetype === i ? (ARCHETYPE_COLORS[a.name] || "var(--accent)") : "var(--text-dim)",
              fontSize: 11, cursor: "pointer", fontFamily: "var(--font-mono)",
            }}>{a.name}</button>
          ))}
        </div>
        {(() => {
          const arch = research.bestArchetype?.[scriptArchetype];
          const script = research.scripts?.[arch?.name];
          if (!script) return <div style={{ color: "var(--text-dim)", fontSize: 11 }}>台本なし</div>;
          return (
            <div>
              {script.map((s, i) => (
                <div key={i} style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)", display: "flex", gap: 12 }}>
                  <div style={{ fontSize: 10, color: "var(--text-dim)", width: 50, flexShrink: 0 }}>
                    {i === 0 ? "1枚目" : `${i + 1}枚目`}
                  </div>
                  <div>
                    {s.main && <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{s.main}</div>}
                    {s.sub && <div style={{ fontSize: 11, color: "var(--text-dim)" }}>{s.sub}</div>}
                    {s.note && <div style={{ fontSize: 10, color: "var(--accent)", marginTop: 4 }}>→ {s.note}</div>}
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end" }}>
                <CopyBtn text={script.map((s, i) => `【${i + 1}枚目】\n${s.main || ""}\n${s.sub || ""}`).join("\n\n")} />
              </div>
            </div>
          );
        })()}
      </Accordion>

      {/* 投稿企画20本 */}
      <Accordion title="投稿企画 20本" badge={selectedPlan ? "1件選択" : ""}>
        {(research.postPlans || []).map((plan, i) => (
          <Selectable key={i} selected={selectedPlan === plan} onSelect={() => setSelectedPlan(selectedPlan === plan ? null : plan)}>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <span style={{ fontSize: 9, color: "var(--text-dim)", width: 20, flexShrink: 0 }}>#{i + 1}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: "var(--text)", lineHeight: 1.5 }}>{plan.title}</div>
                {plan.outline && <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 3 }}>{plan.outline}</div>}
              </div>
              {plan.type && <Tag color={ARCHETYPE_COLORS[plan.type] ? (plan.type === "バズ型" ? "orange" : plan.type === "保存型" ? "blue" : "green") : "gray"}>{plan.type}</Tag>}
            </div>
          </Selectable>
        ))}
      </Accordion>

      {/* 制作スタジオへ */}
      <div style={{ marginTop: 16, padding: "16px", background: "var(--bg2)", border: "1px solid var(--accent)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div style={{ fontSize: 11, color: "var(--text-dim)" }}>
          {selectedPlan && <span style={{ marginRight: 12, color: "var(--text)" }}>企画: 「{selectedPlan.title?.slice(0, 25)}…」</span>}
          {selectedHook && <span style={{ marginRight: 12, color: "var(--text)" }}>フック: 採用済み</span>}
          {selectedTitles.length > 0 && <span style={{ color: "var(--text)" }}>タイトル: {selectedTitles.length}件</span>}
          {!selectedPlan && !selectedHook && selectedTitles.length === 0 && "選択なしでも反映可能（全データを引き継ぎ）"}
        </div>
        <Btn variant="primary" onClick={handleApply}>制作スタジオへ ▶</Btn>
      </div>
    </div>
  );

  const renderEvidence = () => !research ? null : (
    <div>
      {/* 参照URL */}
      <Accordion title="参照URL" defaultOpen>
        {card?.urls && Object.values(card.urls).some(Boolean) ? (
          <div>
            {Object.entries(card.urls).filter(([, v]) => v).map(([k, v]) => (
              <Row key={k} label={k} value={v} />
            ))}
            <div style={{ fontSize: 10, color: "#e06c75", marginTop: 8 }}>
              ※ Phase 1ではURL保存のみ。Phase 2でPlaywrightが各ページを自動取得します。
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 11, color: "var(--text-dim)" }}>
            URLが未設定です。ストック画面でURLを登録するとPhase 2で自動取得されます。
          </div>
        )}
      </Accordion>

      {/* レビュー原文 */}
      <Accordion title="レビュー・口コミ（シミュレート）">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          <div>
            <div style={{ fontSize: 10, color: "#98c379", marginBottom: 6 }}>購入理由</div>
            <BulletList items={card?.reviewSummary.buyReasons} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: "#e06c75", marginBottom: 6 }}>後悔パターン</div>
            <BulletList items={card?.reviewSummary.regrets} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: "#6fa8dc", marginBottom: 6 }}>よくある質問</div>
            <BulletList items={card?.reviewSummary.faq} />
          </div>
        </div>
      </Accordion>

      {/* AI分析根拠 */}
      <Accordion title="AI分析根拠・エビデンス">
        {(research.evidence || []).map((ev, i) => (
          <div key={i} style={{ marginBottom: 12, background: "var(--bg2)", border: "1px solid var(--border)", padding: 12 }}>
            <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 600, marginBottom: 8 }}>▶ {ev.topic}</div>
            {ev.facts?.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 9, color: "#6fa8dc", marginBottom: 4, borderLeft: "2px solid #6fa8dc", paddingLeft: 6 }}>事実</div>
                <BulletList items={ev.facts} />
              </div>
            )}
            {ev.analysis?.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 9, color: "var(--accent)", marginBottom: 4, borderLeft: "2px solid var(--accent)", paddingLeft: 6 }}>AI考察</div>
                <BulletList items={ev.analysis} />
              </div>
            )}
            {ev.basis && (
              <div style={{ fontSize: 9, color: "var(--text-dim)", marginTop: 6 }}>根拠: {ev.basis}</div>
            )}
          </div>
        ))}
      </Accordion>

      {/* 取得情報 */}
      <Accordion title="取得情報・信頼度">
        <Row label="生成日時" value={card ? new Date(card.generatedAt).toLocaleString("ja-JP") : "—"} />
        <Row label="フェッチ状態" value={card?.fetchStatus === "none" ? "URL未設定（AIシミュレート）" : "URL設定済み（Phase 2で取得）"} />
        <Row label="データ品質" value="Phase 1: カテゴリDBベース / Phase 2: 実URLから取得" />
        <div style={{ marginTop: 10, fontSize: 10, color: "var(--text-dim)", lineHeight: 1.8 }}>
          <span style={{ color: "#6fa8dc" }}>事実</span>: UpGearスコア・価格・判定などの登録データ<br />
          <span style={{ color: "var(--accent)" }}>AI考察</span>: カテゴリDBと市場パターンからの推論<br />
          <span style={{ color: "#e06c75" }}>要検証</span>: Phase 2で実URLから取得・検証が必要な項目
        </div>
      </Accordion>
    </div>
  );

  const renderTab = () => {
    if (activeTab === "product")  return renderProduct();
    if (activeTab === "market")   return renderMarket();
    if (activeTab === "strategy") return renderStrategy();
    if (activeTab === "generate") return renderGenerate();
    if (activeTab === "evidence") return renderEvidence();
    return null;
  };

  /* ─── Render ─────────────────────────────────────────────────────────────── */

  return (
    <div>
      <PageHeader title="市場調査AI" sub="商品カルテ生成 → 市場分析 → 投稿戦略の最短ルート" />

      {/* 商品選択 + 実行 */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.15em", marginBottom: 6 }}>対象アイテム</div>
            <select
              value={selectedItemId}
              onChange={(e) => { setSelectedItemId(e.target.value); setCard(null); setResearch(null); }}
              style={{
                width: "100%", background: "var(--bg2)", border: "1px solid var(--border)",
                color: "var(--text)", fontFamily: "var(--font-mono)", fontSize: 13, padding: "8px 12px",
              }}
            >
              {items.map((i) => (
                <option key={i.id} value={i.id}>{i.label}（{i.score}点 / {i.judgment}）</option>
              ))}
            </select>
          </div>

          {/* URL status */}
          {item?.urls && Object.values(item.urls).some(Boolean) && (
            <div style={{ fontSize: 11, color: "var(--text-dim)", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#98c379", display: "inline-block" }} />
              URL {Object.values(item.urls).filter(Boolean).length}件 登録済み
            </div>
          )}

          <Btn variant="primary" onClick={run} disabled={running || !item}>
            {running ? "分析中..." : "市場調査を実行"}
          </Btn>
        </div>
      </Card>

      {/* スティッキーサマリー */}
      {research && (
        <div style={{
          position: "sticky", top: 0, zIndex: 50, background: "var(--bg2)",
          border: "1px solid var(--border)", borderLeft: "3px solid var(--accent)",
          padding: "10px 16px", marginBottom: 16,
          display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", gap: 14, flex: 1, flexWrap: "wrap", alignItems: "center" }}>
            <div>
              <span style={{ fontSize: 9, color: "var(--text-dim)" }}>スコア</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: "var(--accent)", marginLeft: 6 }}>{research.score?.total}点</span>
            </div>
            {topArchetype && (
              <div>
                <span style={{ fontSize: 9, color: "var(--text-dim)" }}>推奨</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: ARCHETYPE_COLORS[topArchetype.name] || "var(--accent)", marginLeft: 6 }}>{topArchetype.name}</span>
              </div>
            )}
            {research.hooks?.[0] && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 9, color: "var(--text-dim)" }}>推奨フック</span>
                <span style={{ fontSize: 11, color: "var(--text)", marginLeft: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  「{research.hooks[0].text?.slice(0, 30)}…」
                </span>
              </div>
            )}
          </div>
          <Btn small variant="primary" onClick={handleApply}>→ 制作スタジオへ</Btn>
        </div>
      )}

      {/* Tabs */}
      {research && (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", borderBottom: "1px solid var(--border)", marginBottom: 16 }}>
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                padding: "10px 16px", background: "none", border: "none", whiteSpace: "nowrap",
                borderBottom: activeTab === t.id ? "2px solid var(--accent)" : "2px solid transparent",
                color: activeTab === t.id ? "var(--accent)" : "var(--text-dim)",
                fontSize: 12, cursor: "pointer", letterSpacing: "0.04em", fontFamily: "var(--font-mono)",
              }}>{t.label}</button>
            ))}
          </div>
          {renderTab()}
        </>
      )}

      {!research && !running && (
        <div style={{ padding: "60px 0", textAlign: "center", color: "var(--text-dim)", fontSize: 13 }}>
          アイテムを選択して「市場調査を実行」を押してください
        </div>
      )}
    </div>
  );
}
