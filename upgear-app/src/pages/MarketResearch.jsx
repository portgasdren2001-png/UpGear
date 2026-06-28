import { useState } from "react";
import { PageHeader, Card, CardTitle, Tag } from "../components/ui";
import { runMarketResearch, getLearningInsights } from "../data/marketResearchAI";

const UPGEAR_DIMS = [
  { key: "equip",       label: "装備性",      max: 20 },
  { key: "judgment",    label: "判断削減力",   max: 20 },
  { key: "continuity",  label: "継続運用性",  max: 20 },
  { key: "cospa",       label: "コスパ",       max: 15 },
  { key: "irreplace",   label: "代替不可能性", max: 15 },
  { key: "satisfaction","label": "満足度",     max: 5  },
  { key: "longterm",    label: "長期利用価値", max: 5  },
];

const HOOK_TYPE_COLOR = { 逆張り: "orange", 体験: "blue", 共感: "green", チェック: "gray", NG: "gray" };

/* ─── Sub-components ─── */

function SL({ children, color = "var(--accent)" }) {
  return (
    <div style={{ fontSize: 10, color, letterSpacing: "0.13em", marginBottom: 8, borderLeft: "2px solid currentColor", paddingLeft: 8 }}>
      {children}
    </div>
  );
}

function Row({ label, value, accent }) {
  return (
    <div style={{ display: "flex", gap: 10, padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
      <div style={{ fontSize: 10, color: "var(--text-dim)", width: 100, flexShrink: 0 }}>{label}</div>
      <div style={{ fontSize: 11, color: accent ? "var(--accent)" : "var(--text)", lineHeight: 1.5 }}>{value}</div>
    </div>
  );
}

function ScoreBar({ label, score, max }) {
  const pct = Math.round((score / max) * 100);
  const color = pct >= 80 ? "var(--accent)" : pct >= 55 ? "#6fa8dc" : "var(--border)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0" }}>
      <div style={{ fontSize: 11, color: "var(--text-dim)", width: 96 }}>{label}</div>
      <div style={{ flex: 1, height: 4, background: "var(--bg2)" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, transition: "width 0.4s" }} />
      </div>
      <div style={{ fontSize: 11, color, width: 40, textAlign: "right" }}>{score}/{max}</div>
    </div>
  );
}

function BulletList({ items, color = "var(--text-dim)" }) {
  return (
    <div>
      {items.map((t, i) => (
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

function EvidenceBlock({ topic, facts, analysis, basis }) {
  return (
    <div style={{ marginBottom: 16, background: "var(--bg2)", border: "1px solid var(--border)", padding: 14 }}>
      <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 600, marginBottom: 10, letterSpacing: "0.05em" }}>▶ {topic}</div>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 9, color: "#6fa8dc", letterSpacing: "0.1em", marginBottom: 4, borderLeft: "2px solid #6fa8dc", paddingLeft: 6 }}>事実</div>
        {facts.map((f, i) => <div key={i} style={{ fontSize: 11, color: "var(--text)", padding: "2px 0", paddingLeft: 8, lineHeight: 1.6 }}>• {f}</div>)}
      </div>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 9, color: "var(--accent)", letterSpacing: "0.1em", marginBottom: 4, borderLeft: "2px solid var(--accent)", paddingLeft: 6 }}>考察</div>
        {analysis.map((a, i) => <div key={i} style={{ fontSize: 11, color: "var(--text-dim)", padding: "2px 0", paddingLeft: 8, lineHeight: 1.6 }}>→ {a}</div>)}
      </div>
      <div>
        <div style={{ fontSize: 9, color: "#98c379", letterSpacing: "0.1em", marginBottom: 4, borderLeft: "2px solid #98c379", paddingLeft: 6 }}>根拠</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {basis.map((b, i) => <span key={i} style={{ fontSize: 9, color: "#98c379", border: "1px solid #98c379", padding: "1px 6px" }}>{b}</span>)}
        </div>
      </div>
    </div>
  );
}

function SelectableCard({ text, selected, onSelect, children }) {
  return (
    <div style={{
      padding: "8px 12px", borderRadius: 3, cursor: "pointer",
      background: selected ? "rgba(255,107,0,0.10)" : "var(--bg2)",
      border: `1px solid ${selected ? "var(--accent)" : "var(--border)"}`,
      display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    }}>
      <div style={{ fontSize: 11, color: selected ? "var(--text)" : "var(--text-dim)", lineHeight: 1.6, flex: 1 }}
           onClick={onSelect}>{text}</div>
      {children}
    </div>
  );
}

/* ─── Tab definitions ─── */

const TABS = [
  { id: "overview",        label: "①商品概要" },
  { id: "reviews",         label: "②口コミ" },
  { id: "sns",             label: "③SNS分析" },
  { id: "search",          label: "④検索ニーズ" },
  { id: "competitors",     label: "⑤競合分析" },
  { id: "target",          label: "⑥ターゲット" },
  { id: "score",           label: "⑦UpGearスコア" },
  { id: "differentiation", label: "⑧差別化" },
  { id: "optimal_sns",     label: "⑨最適SNS判定" },
  { id: "strategy",        label: "⑩投稿戦略" },
  { id: "script",          label: "⑪投稿台本" },
  { id: "titles",          label: "⑫タイトル" },
  { id: "hooks",           label: "⑬フック" },
  { id: "ctas",            label: "⑭CTA" },
  { id: "prepost",         label: "⑮投稿戦略説明" },
  { id: "evidence",        label: "⑯根拠一覧" },
  { id: "plans",           label: "投稿企画20本" },
];

/* ─── Main Component ─── */

export default function MarketResearch({ data, learningData, onApplyToStudio, onNavToStudio }) {
  const { items, posts } = data;

  const [selectedItemId, setSelectedItemId] = useState(items[0]?.id ?? "");
  const [research, setResearch] = useState(null);
  const [running, setRunning] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedHook, setSelectedHook] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedTitles, setSelectedTitles] = useState([]);
  const [selectedCTAs, setSelectedCTAs] = useState({ saves: null, comments: null, follows: null });
  const [scriptArchetype, setScriptArchetype] = useState(0);

  const item = items.find(i => i.id === selectedItemId) ?? items[0];
  const insights = getLearningInsights(learningData);

  const run = () => {
    if (!item) return;
    setRunning(true);
    setTimeout(() => {
      setResearch(runMarketResearch(item));
      setRunning(false);
      setActiveTab("overview");
      setSelectedHook(null);
      setSelectedPlan(null);
      setSelectedTitles([]);
      setSelectedCTAs({ saves: null, comments: null, follows: null });
    }, 600);
  };

  const applyToStudio = () => {
    if (!research || !onApplyToStudio) return;
    onApplyToStudio({
      itemId: selectedItemId,
      hook: selectedHook ?? research.hooks[0],
      plan: selectedPlan ?? research.postPlans[0],
      titles: selectedTitles,
      ctas: selectedCTAs,
    });
    onNavToStudio?.();
  };

  const toggleTitle = (t) =>
    setSelectedTitles(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  /* ─── Tab renderers ─── */

  const renderOverview = () => research && (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <Card>
        <CardTitle>商品情報</CardTitle>
        <Row label="アイテム名" value={research.overview.name} />
        <Row label="カテゴリ" value={research.overview.category} />
        <Row label="価格" value={research.overview.price} accent />
        <Row label="スコア" value={`${research.overview.score}点 / ${research.overview.judgment}`} accent />
        <Row label="価格帯" value={research.overview.priceRange} />
        <Row label="市場での立ち位置" value={research.overview.position} />
        <div style={{ marginTop: 12 }}>
          <SL>特徴・良い点</SL>
          <div style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.7 }}>{research.overview.features}</div>
        </div>
      </Card>
      {insights && (
        <Card>
          <CardTitle>AI学習データ（{insights.count}投稿）</CardTitle>
          <Row label="平均再生数" value={`${insights.avgViews.toLocaleString()} 再生`} accent />
          {insights.bestHook && <Row label="最強フック型" value={`${insights.bestHook.type}（平均${insights.bestHook.avgViews.toLocaleString()}再生）`} accent />}
          {insights.bestFormat && <Row label="最高保存フォーマット" value={insights.bestFormat.fmt} accent />}
          <div style={{ marginTop: 12, fontSize: 10, color: "var(--text-dim)", lineHeight: 1.8 }}>
            投稿後分析タブでデータを登録すると、ここに学習結果が蓄積されます。
          </div>
        </Card>
      )}
      {!insights && (
        <Card>
          <CardTitle>AI学習データ</CardTitle>
          <div style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.8, padding: "20px 0" }}>
            まだ学習データがありません。<br />
            投稿後に「投稿分析」タブでデータを登録すると、<br />
            フック・フォーマットの最適解が自動学習されます。
          </div>
        </Card>
      )}
    </div>
  );

  const renderReviews = () => research && (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <Card>
        <SL>良い口コミ</SL>
        <BulletList items={research.reviews.good} color="var(--text-dim)" />
        <div style={{ marginTop: 12 }} />
        <SL>悪い口コミ・不満</SL>
        <BulletList items={research.reviews.bad} color="var(--text-dim)" />
        <div style={{ marginTop: 12 }} />
        <SL>購入理由</SL>
        <BulletList items={research.reviews.buyReasons} />
        <div style={{ marginTop: 12 }} />
        <SL>後悔ポイント</SL>
        <BulletList items={research.reviews.regrets} color="var(--text-dim)" />
      </Card>
      <Card>
        <Row label="リピート率" value={research.reviews.repeatRate} accent />
        <Row label="満足している人の特徴" value={research.reviews.satisfiedProfile} />
        <Row label="向いていない人" value={research.reviews.unsuitedProfile} />
        <div style={{ marginTop: 12 }} />
        <SL>頻出ワード</SL>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
          {research.reviews.frequentWords.map((w, i) => <Tag key={i} color="gray">{w}</Tag>)}
        </div>
        <SL>よくある質問</SL>
        <BulletList items={research.reviews.faq.slice(0, 8)} />
        <div style={{ marginTop: 12 }} />
        <SL>改善要望</SL>
        <BulletList items={research.reviews.improvement} color="var(--text-dim)" />
      </Card>
    </div>
  );

  const renderSNS = () => research && (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <Card>
        <CardTitle>TikTok</CardTitle>
        <SL>伸びている切り口</SL>
        <BulletList items={research.sns.tiktok.buzzing} />
        <div style={{ marginTop: 10 }} />
        <SL color="#e06c75">伸びない切り口</SL>
        <BulletList items={research.sns.tiktok.notBuzzing} color="#e06c75" />
        <div style={{ marginTop: 10 }} />
        <SL>よく使われるタイトル</SL>
        <BulletList items={research.sns.tiktok.titles} />
        <div style={{ marginTop: 10 }} />
        <SL>コメント欄の質問</SL>
        <BulletList items={research.sns.tiktok.comments} />
      </Card>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Card>
          <CardTitle>Instagram</CardTitle>
          <SL>バズっている形式</SL>
          <BulletList items={research.sns.instagram.buzzing} />
          <div style={{ marginTop: 8 }} />
          <SL>保存されやすい内容</SL>
          <BulletList items={research.sns.instagram.saves} />
        </Card>
        <Card>
          <CardTitle>YouTube</CardTitle>
          <BulletList items={research.sns.youtube.buzzing} />
        </Card>
        <Card>
          <SL color="#e06c75">炎上ポイント</SL>
          <BulletList items={research.sns.inflammatoryPoints} color="#e06c75" />
          <div style={{ marginTop: 8 }} />
          <SL>保存されやすい内容</SL>
          <BulletList items={research.sns.saveable} />
        </Card>
      </div>
    </div>
  );

  const renderSearch = () => research && (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <Card>
        <SL>メインキーワード</SL>
        <BulletList items={research.search.main} />
        <div style={{ marginTop: 10 }} />
        <SL>比較キーワード</SL>
        <BulletList items={research.search.compare} />
        <div style={{ marginTop: 10 }} />
        <SL>購入前の悩み</SL>
        <BulletList items={research.search.beforeBuy} />
        <div style={{ marginTop: 10 }} />
        <SL>購入後の悩み</SL>
        <BulletList items={research.search.afterBuy} />
      </Card>
      <Card>
        <SL>初心者が気になること</SL>
        <BulletList items={research.search.beginner} />
        <div style={{ marginTop: 10 }} />
        <SL>上級者が気になること</SL>
        <BulletList items={research.search.advanced} />
        <div style={{ marginTop: 10 }} />
        <SL>関連キーワード</SL>
        <BulletList items={research.search.related} />
      </Card>
    </div>
  );

  const renderCompetitors = () => research && (
    <Card>
      <CardTitle>競合比較（{research.competitors.length}商品）</CardTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
        {research.competitors.map((c, i) => (
          <div key={i} style={{ background: "var(--bg2)", border: "1px solid var(--border)", padding: "12px" }}>
            <div style={{ fontSize: 12, color: "var(--text)", marginBottom: 8, fontWeight: 500 }}>{c.name}</div>
            <Row label="価格" value={c.price} accent />
            <Row label="市場ポジション" value={c.position} />
            <Row label="強み" value={c.pros} />
            <Row label="弱み" value={c.cons} />
            <Row label="向いている人" value={c.suitable} />
          </div>
        ))}
        <div style={{ background: "rgba(255,107,0,0.06)", border: "1px solid var(--accent)", padding: "12px" }}>
          <div style={{ fontSize: 12, color: "var(--accent)", marginBottom: 8, fontWeight: 500 }}>{item.label}</div>
          <Row label="価格" value={item.price ? `¥${Number(item.price).toLocaleString()}` : "—"} accent />
          <Row label="市場ポジション" value={item.judgment} accent />
          <Row label="強み" value="毎日使えるコスパの良さ・長期的な価値" />
          <Row label="向いていない人" value="使用頻度が低い人・コスパ最優先の人" />
        </div>
      </div>
    </Card>
  );

  const renderTarget = () => research && (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <Card>
        <CardTitle>デモグラフィック</CardTitle>
        <Row label="年代" value={research.target.age} />
        <Row label="性別" value={research.target.gender} />
        <Row label="職業" value={research.target.occupation} />
        <Row label="年収" value={research.target.income} />
        <Row label="ライフスタイル" value={research.target.lifestyle} />
      </Card>
      <Card>
        <CardTitle>心理・行動</CardTitle>
        <SL>価値観</SL>
        <BulletList items={research.target.values} />
        <div style={{ marginTop: 10 }} />
        <SL>悩み</SL>
        <BulletList items={research.target.pain} />
        <div style={{ marginTop: 10 }} />
        <SL>購入動機</SL>
        <BulletList items={research.target.buyMotivation} />
        <div style={{ marginTop: 10 }} />
        <SL color="#e06c75">購入しない理由</SL>
        <BulletList items={research.target.dontBuy} color="#e06c75" />
      </Card>
    </div>
  );

  const renderScore = () => research && (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <Card style={{ borderLeft: `3px solid ${research.upgearScore.total >= 80 ? "var(--accent)" : "#6fa8dc"}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <CardTitle>UpGear独自スコア</CardTitle>
          <div style={{ fontSize: 32, fontWeight: 700, color: research.upgearScore.total >= 80 ? "var(--accent)" : "#6fa8dc" }}>
            {research.upgearScore.total}<span style={{ fontSize: 14, fontWeight: 400 }}>/100</span>
          </div>
        </div>
        {UPGEAR_DIMS.map(d => (
          <ScoreBar key={d.key} label={d.label} score={research.upgearScore[d.key] || 0} max={d.max} />
        ))}
      </Card>
      <Card>
        <CardTitle>スコア解説</CardTitle>
        {UPGEAR_DIMS.map(d => (
          <div key={d.key} style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <span style={{ fontSize: 11, color: "var(--text)" }}>{d.label}</span>
              <span style={{ fontSize: 12, color: "var(--accent)" }}>{research.upgearScore[d.key] || 0}/{d.max}</span>
            </div>
            <div style={{ fontSize: 10, color: "var(--text-dim)" }}>
              {{ equip: "毎日・なければ生活が止まる", judgment: "機能面の判断が3つ以上消える",
                 continuity: "5年以上・廃番なし・買い直せる", cospa: "価格に対する長期的価値",
                 irreplace: "同カテゴリで唯一・代替不可能", satisfaction: "実際の使用後の満足感",
                 longterm: "3年後も使い続けている自信" }[d.key]}
            </div>
          </div>
        ))}
      </Card>
    </div>
  );

  const renderDiff = () => research && (
    <Card>
      <CardTitle>差別化ポイント — UpGearならでは（{research.differentiation.length}件）</CardTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {research.differentiation.map((d, i) => (
          <div key={i} style={{ padding: "10px 12px", background: "var(--bg2)", border: "1px solid var(--border)", display: "flex", gap: 10 }}>
            <span style={{ fontSize: 10, color: "var(--accent)", flexShrink: 0, marginTop: 2 }}>▶ {i + 1}</span>
            <span style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.7 }}>{d}</span>
          </div>
        ))}
      </div>
    </Card>
  );

  const FORMAT_LABEL = { story: "体験談", check: "チェック", compare: "比較", fail: "失敗談", rank: "ランキング", qa: "Q&A" };

  const renderPlans = () => research && (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <CardTitle style={{ marginBottom: 0 }}>投稿企画（{research.postPlans.length}本）— クリックで採用</CardTitle>
        {selectedPlan && <Tag color="orange">採用: {selectedPlan.title.slice(0, 20)}…</Tag>}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {research.postPlans.map((p, i) => (
          <div key={i} onClick={() => setSelectedPlan(p)} style={{
            padding: "10px 12px", cursor: "pointer",
            background: selectedPlan === p ? "rgba(255,107,0,0.1)" : "var(--bg2)",
            border: `1px solid ${selectedPlan === p ? "var(--accent)" : "var(--border)"}`,
            display: "flex", gap: 10, alignItems: "center",
          }}>
            <Tag color="gray">{p.category}</Tag>
            <span style={{ fontSize: 11, color: selectedPlan === p ? "var(--text)" : "var(--text-dim)", flex: 1 }}>{p.title}</span>
            <Tag color={HOOK_TYPE_COLOR[p.hookType] || "gray"}>{p.hookType}</Tag>
            <span style={{ fontSize: 9, color: "var(--text-dim)" }}>{FORMAT_LABEL[p.format]}</span>
          </div>
        ))}
      </div>
    </Card>
  );

  const renderTitles = () => research && (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <CardTitle style={{ marginBottom: 0 }}>タイトル候補（{research.titles.length}本）— 複数選択可</CardTitle>
        <span style={{ fontSize: 11, color: "var(--text-dim)" }}>{selectedTitles.length}件選択中</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {research.titles.map((t, i) => (
          <SelectableCard key={i} text={t} selected={selectedTitles.includes(t)} onSelect={() => toggleTitle(t)}>
            <div style={{ display: "flex", gap: 4, flexShrink: 0, marginLeft: 8 }}>
              <CopyBtn text={t} />
            </div>
          </SelectableCard>
        ))}
      </div>
    </Card>
  );

  const renderHooks = () => research && (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <CardTitle style={{ marginBottom: 0 }}>フック候補（{research.hooks.length}件）— クリックで採用</CardTitle>
        {selectedHook && <Tag color="orange">採用済み</Tag>}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {research.hooks.map((h, i) => (
          <div key={i} onClick={() => setSelectedHook(h)} style={{
            padding: "12px", cursor: "pointer",
            background: selectedHook === h ? "rgba(255,107,0,0.1)" : "var(--bg2)",
            border: `1px solid ${selectedHook === h ? "var(--accent)" : "var(--border)"}`,
          }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 6, alignItems: "center" }}>
              <Tag color={HOOK_TYPE_COLOR[h.type] ?? "gray"}>{h.type}</Tag>
              {selectedHook === h && <span style={{ fontSize: 9, color: "var(--accent)" }}>採用中</span>}
            </div>
            <div style={{ fontSize: 12, color: selectedHook === h ? "var(--text)" : "var(--text-dim)", lineHeight: 1.6 }}>{h.text}</div>
          </div>
        ))}
      </div>
    </Card>
  );

  const renderCTAs = () => research && (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
      {[
        { key: "saves",    label: "保存される締め", color: "orange" },
        { key: "comments", label: "コメントされる締め", color: "blue" },
        { key: "follows",  label: "フォローされる締め", color: "green" },
      ].map(({ key, label, color }) => (
        <Card key={key}>
          <CardTitle>{label}</CardTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {(research.ctas[key] || []).map((c, i) => (
              <div key={i} onClick={() => setSelectedCTAs(prev => ({ ...prev, [key]: c }))} style={{
                padding: "8px 10px", cursor: "pointer", borderRadius: 3,
                background: selectedCTAs[key] === c ? "rgba(255,107,0,0.10)" : "var(--bg2)",
                border: `1px solid ${selectedCTAs[key] === c ? "var(--accent)" : "var(--border)"}`,
                display: "flex", gap: 6, alignItems: "flex-start",
              }}>
                <div style={{ fontSize: 11, color: selectedCTAs[key] === c ? "var(--text)" : "var(--text-dim)", flex: 1, lineHeight: 1.5 }}>{c}</div>
                <CopyBtn text={c} />
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );

  const ARCH_COLORS = { "バズ型": "#FF6B00", "保存型": "#6fa8dc", "フォロー型": "#98c379" };

  const renderOptimalSNS = () => research && (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {research.optimalSNS.map((p, i) => (
        <div key={i} style={{ background: "var(--bg2)", border: `1px solid ${i === 0 ? "var(--accent)" : "var(--border)"}`, padding: 16 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: i === 0 ? "var(--accent)" : "var(--text-dim)", width: 28 }}>#{p.rank}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, color: i === 0 ? "var(--accent)" : "var(--text)", fontWeight: 600 }}>{p.platform}</div>
              <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 2 }}>{p.format}</div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: p.score >= 80 ? "var(--accent)" : p.score >= 60 ? "#6fa8dc" : "var(--border)" }}>
              {p.score}<span style={{ fontSize: 12, fontWeight: 400 }}>/100</span>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 10 }}>
            <div>
              <SL>向いている理由</SL>
              <BulletList items={p.pros} />
            </div>
            <div>
              <SL color="#e06c75">向いていない理由</SL>
              <BulletList items={p.cons} color="#e06c75" />
            </div>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: "var(--accent)", letterSpacing: "0.1em", marginBottom: 4 }}>期待できる成果</div>
              <div style={{ fontSize: 11, color: "var(--text)", lineHeight: 1.5 }}>{p.result}</div>
            </div>
          </div>
          <div style={{ marginTop: 8, fontSize: 9, color: "var(--text-dim)", borderLeft: "2px solid #98c379", paddingLeft: 6 }}>
            根拠: {p.basis}
          </div>
        </div>
      ))}
    </div>
  );

  const renderStrategy = () => research && (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Card>
          <CardTitle>投稿スケジュール</CardTitle>
          <Row label="最適プラットフォーム" value={research.postStrategy.topPlatform} accent />
          <Row label="推奨投稿頻度" value={research.postStrategy.frequency} accent />
          <Row label="推奨曜日" value={research.postStrategy.bestDays.join(" / ")} />
          <div style={{ marginTop: 10 }} />
          <SL>推奨投稿時間帯</SL>
          <BulletList items={research.postStrategy.bestTimes} />
          <div style={{ marginTop: 10, fontSize: 10, color: "var(--text-dim)", lineHeight: 1.7 }}>
            根拠: {research.postStrategy.reason}
          </div>
        </Card>
        <Card>
          <CardTitle>伸びる理由</CardTitle>
          <BulletList items={research.postStrategy.growthReasons} />
        </Card>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Card>
          <CardTitle>シリーズ化案（{research.postStrategy.series.length}案）</CardTitle>
          {research.postStrategy.series.map((s, i) => (
            <div key={i} style={{ marginBottom: 10, padding: "10px 12px", background: "var(--bg3)", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 11, color: "var(--accent)", marginBottom: 6 }}>{s.title}</div>
              {s.plans.map((p, pi) => (
                <div key={pi} style={{ fontSize: 10, color: "var(--text-dim)", padding: "2px 0" }}>→ {p}</div>
              ))}
            </div>
          ))}
        </Card>
      </div>
    </div>
  );

  const renderScript = () => research && (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {research.detailedScript.map((ds, i) => (
          <button key={i} onClick={() => setScriptArchetype(i)} style={{
            padding: "8px 16px", background: scriptArchetype === i ? ARCH_COLORS[ds.archetype] : "var(--bg2)",
            border: `1px solid ${scriptArchetype === i ? ARCH_COLORS[ds.archetype] : "var(--border)"}`,
            color: scriptArchetype === i ? "#fff" : "var(--text-dim)",
            fontSize: 11, cursor: "pointer", fontWeight: scriptArchetype === i ? 700 : 400,
          }}>{ds.archetype}</button>
        ))}
      </div>
      {research.detailedScript[scriptArchetype] && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {research.detailedScript[scriptArchetype].slides.map((slide, si) => (
            <div key={si} style={{ background: "var(--bg2)", border: "1px solid var(--border)", padding: 16 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
                <div style={{ background: ARCH_COLORS[research.detailedScript[scriptArchetype].archetype], color: "#fff", fontSize: 12, fontWeight: 700, padding: "3px 10px" }}>
                  S{slide.slideNum}
                </div>
                <div style={{ fontSize: 11, color: "var(--accent)", letterSpacing: "0.05em" }}>{slide.role}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <SL>表示テキスト</SL>
                  <div style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.7, whiteSpace: "pre-wrap", padding: "8px", background: "var(--bg3)", marginBottom: 8 }}>
                    {slide.displayText}
                  </div>
                  <SL>ナレーション</SL>
                  <div style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{slide.narration}</div>
                </div>
                <div>
                  <SL>画像イメージ</SL>
                  <div style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.6, marginBottom: 8 }}>{slide.imageIdea}</div>
                  <SL>この枚の狙い</SL>
                  <div style={{ fontSize: 11, color: "var(--text)", lineHeight: 1.6, marginBottom: 8 }}>{slide.goal}</div>
                  <SL color="#6fa8dc">離脱防止ポイント</SL>
                  <div style={{ fontSize: 11, color: "#6fa8dc", lineHeight: 1.6, marginBottom: 6 }}>{slide.dropPrevention}</div>
                  <div style={{ fontSize: 9, color: "#98c379", borderLeft: "2px solid #98c379", paddingLeft: 6, lineHeight: 1.5 }}>
                    根拠: {slide.basis}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderPrePost = () => research && (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {research.prePostStrategy.map((strategy, i) => (
        <div key={i} style={{ background: "var(--bg2)", border: `2px solid ${strategy.color}`, padding: 16 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
            <div style={{ background: strategy.color, color: "#fff", fontSize: 12, fontWeight: 700, padding: "4px 12px" }}>{strategy.archetype}</div>
            <div style={{ fontSize: 11, color: "var(--text-dim)" }}>投稿前の戦略説明</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <SL>この切り口を選んだ理由</SL>
              <div style={{ fontSize: 11, color: "var(--text)", lineHeight: 1.7, marginBottom: 10 }}>{strategy.whyThisAngle}</div>
              <SL>ターゲットに刺さる理由</SL>
              <div style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.7, marginBottom: 10 }}>{strategy.whyHitsTarget}</div>
            </div>
            <div>
              <SL>競合との差別化</SL>
              <div style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.7, marginBottom: 10 }}>{strategy.competitorDiff}</div>
              <SL color="#98c379">市場調査の根拠</SL>
              <div style={{ fontSize: 10, color: "#98c379", lineHeight: 1.9, whiteSpace: "pre-wrap", marginBottom: 10 }}>{strategy.researchBasis}</div>
              <SL color="#6fa8dc">期待できる視聴者の反応</SL>
              <div style={{ fontSize: 11, color: "#6fa8dc", lineHeight: 1.7 }}>{strategy.expectedReaction}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderEvidence = () => research && (
    <div>
      <div style={{ marginBottom: 12, padding: "10px 14px", background: "rgba(255,107,0,0.06)", border: "1px solid var(--accent)", fontSize: 10, color: "var(--accent)", lineHeight: 1.8 }}>
        ⑯ 根拠表示ルール: 事実（確認されたデータ）と考察（分析・推論）を分けて表示。根拠タグで出典を明示。
      </div>
      {research.evidence.map((block, i) => (
        <EvidenceBlock key={i} {...block} />
      ))}
    </div>
  );

  const renderTab = () => {
    if (!research) return null;
    switch (activeTab) {
      case "overview":        return renderOverview();
      case "reviews":         return renderReviews();
      case "sns":             return renderSNS();
      case "search":          return renderSearch();
      case "competitors":     return renderCompetitors();
      case "target":          return renderTarget();
      case "score":           return renderScore();
      case "differentiation": return renderDiff();
      case "optimal_sns":     return renderOptimalSNS();
      case "strategy":        return renderStrategy();
      case "script":          return renderScript();
      case "prepost":         return renderPrePost();
      case "evidence":        return renderEvidence();
      case "plans":           return renderPlans();
      case "titles":          return renderTitles();
      case "hooks":           return renderHooks();
      case "ctas":            return renderCTAs();
      default: return null;
    }
  };

  /* ─── Main render ─── */

  return (
    <div>
      <PageHeader title="市場調査AI" sub="UpGear v4.6 — 投稿前リサーチ自動実行システム" />

      {/* Item selector + run */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: "var(--text-dim)", marginBottom: 8, letterSpacing: "0.1em" }}>調査対象アイテム</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 6 }}>
              {items.map(it => (
                <div key={it.id} onClick={() => setSelectedItemId(it.id)} style={{
                  padding: "8px 12px", cursor: "pointer", borderRadius: 3,
                  background: selectedItemId === it.id ? "rgba(255,107,0,0.1)" : "var(--bg2)",
                  border: `1px solid ${selectedItemId === it.id ? "var(--accent)" : "var(--border)"}`,
                }}>
                  <div style={{ fontSize: 11, color: selectedItemId === it.id ? "var(--text)" : "var(--text-dim)" }}>
                    No.{it.no} {it.label}
                  </div>
                  <div style={{ fontSize: 9, color: "var(--text-dim)", marginTop: 2 }}>{it.category} / {it.judgment}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end", flexShrink: 0 }}>
            <button onClick={run} disabled={running} style={{
              padding: "10px 24px", background: running ? "var(--bg3)" : "var(--accent)",
              border: "none", color: "#fff", fontSize: 13, fontWeight: 700,
              cursor: running ? "default" : "pointer", letterSpacing: "0.05em", transition: "background 0.2s",
            }}>
              {running ? "調査中…" : "▶ 市場調査を実行"}
            </button>
            {research && (
              <button onClick={applyToStudio} style={{
                padding: "8px 16px", background: "none", border: "1px solid var(--accent)",
                color: "var(--accent)", fontSize: 11, cursor: "pointer",
              }}>
                制作スタジオへ反映 ▶
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Tabs */}
      {research && (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", borderBottom: "1px solid var(--border)", marginBottom: 16 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                padding: "9px 14px", background: "none", border: "none", whiteSpace: "nowrap",
                borderBottom: activeTab === t.id ? "2px solid var(--accent)" : "2px solid transparent",
                color: activeTab === t.id ? "var(--accent)" : "var(--text-dim)",
                fontSize: 11, cursor: "pointer", letterSpacing: "0.04em",
              }}>{t.label}</button>
            ))}
          </div>

          {renderTab()}

          {/* Bottom apply bar */}
          <div style={{ marginTop: 24, padding: "16px", background: "var(--bg2)", border: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 11, color: "var(--text-dim)" }}>
              {selectedPlan && <span style={{ marginRight: 16 }}>企画: 「{selectedPlan.title.slice(0, 20)}…」</span>}
              {selectedHook && <span style={{ marginRight: 16 }}>フック: 採用済み</span>}
              {selectedTitles.length > 0 && <span>タイトル: {selectedTitles.length}件</span>}
            </div>
            <button onClick={applyToStudio} style={{
              padding: "8px 20px", background: "var(--accent)", border: "none",
              color: "#fff", fontSize: 12, cursor: "pointer", fontWeight: 600,
            }}>制作スタジオへ反映 ▶</button>
          </div>
        </>
      )}

      {!research && !running && (
        <div style={{ padding: "60px 0", textAlign: "center", color: "var(--text-dim)", fontSize: 13 }}>
          アイテムを選択して「市場調査を実行」をクリックしてください
        </div>
      )}
    </div>
  );
}
