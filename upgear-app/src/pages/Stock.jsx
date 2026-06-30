import { useState } from "react";
import { PageHeader, Tag, Btn } from "../components/ui";
import ItemWizard from "./ItemWizard";

// ─── ステータス定義 ────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  "未分析":   { color: "#555",     bg: "rgba(85,85,85,0.12)",     label: "未分析" },
  "解析中":   { color: "#6fa8dc",  bg: "rgba(111,168,220,0.12)",  label: "解析中" },
  "要確認":   { color: "#e06c75",  bg: "rgba(224,108,117,0.12)",  label: "要確認" },
  "条件付き": { color: "var(--accent)", bg: "var(--accent-dim)", label: "条件付き" },
  "認定":     { color: "#98c379",  bg: "rgba(152,195,121,0.12)",  label: "認定" },
  "非認定":   { color: "#666",     bg: "rgba(100,100,100,0.08)",  label: "非認定" },
};

function getItemStatus(item) {
  if (item.analysisStatus) return item.analysisStatus;
  if (!item.card) return "未分析";
  const s = item.score || 0;
  if (s >= 80) return "認定";
  if (s >= 70) return "条件付き";
  if (s < 60)  return "非認定";
  return "要確認";
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["未分析"];
  return (
    <span style={{
      fontSize: 9, padding: "2px 7px",
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.color}`,
      letterSpacing: "0.05em", fontWeight: 600,
      whiteSpace: "nowrap",
    }}>
      {cfg.label}
    </span>
  );
}

function SourceTag({ source }) {
  const colors = { "楽天API": "#e07b4c", "Playwright": "#6fa8dc", "Claude AI": "#98c379", "手動": "#888" };
  return (
    <span style={{ fontSize: 9, color: colors[source] || "#888", background: "var(--bg2)", border: `1px solid ${colors[source] || "#555"}`, padding: "1px 5px" }}>
      {source}
    </span>
  );
}

// ─── ItemCard ─────────────────────────────────────────────────────────────────

function ItemCard({ item, selected, onClick, onWizard, onNavToStudio }) {
  const status = getItemStatus(item);
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["未分析"];
  const rb = item.rakuten || item.card?.rakuten;

  return (
    <div
      onClick={onClick}
      style={{
        background: selected ? "var(--accent-dim)" : "var(--bg3)",
        border: `1px solid ${selected ? "var(--accent)" : "var(--border)"}`,
        borderLeft: `3px solid ${cfg.color}`,
        padding: "12px 14px", cursor: "pointer",
        transition: "border-color 0.15s, background 0.15s",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3, flexWrap: "wrap" }}>
            <span style={{ fontSize: 9, color: "var(--text-dim)" }}>No.{item.no}</span>
            <StatusBadge status={status} />
            {item.category && <Tag color={item.category === "GEAR" ? "gray" : item.category === "SHOES" ? "blue" : "green"}>{item.category}</Tag>}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {item.label || "（商品名未設定）"}
          </div>
          {item.brand && <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 2 }}>{item.brand}</div>}
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: cfg.color }}>{item.score}点</div>
          <div style={{ fontSize: 9, color: "var(--text-dim)" }}>UpGear</div>
        </div>
      </div>

      {/* Data row */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, fontSize: 10, color: "var(--text-dim)", alignItems: "center" }}>
        {(rb?.price || item.price) && (
          <span style={{ color: "var(--text)" }}>
            ¥{Number(rb?.price || item.price).toLocaleString()}
          </span>
        )}
        {rb?.reviewCount && (
          <span>★{rb.reviewAverage} ({rb.reviewCount?.toLocaleString()}件)</span>
        )}
        {rb?.url && (
          <span style={{ color: "#e07b4c" }}>楽天あり</span>
        )}
        {item.card?.understandingScore != null && (
          <span>理解:{item.card.understandingScore}点</span>
        )}
      </div>

      {/* Actions when selected */}
      {selected && (
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }} onClick={(e) => e.stopPropagation()}>
          <Btn small onClick={() => onWizard(item)}>{item.card ? "再分析" : "商品理解AI"}</Btn>
          {onNavToStudio && (
            <Btn small variant="primary" onClick={() => onNavToStudio(item.id)}>▣ 制作スタジオ</Btn>
          )}
        </div>
      )}
    </div>
  );
}

// ─── DetailPanel ──────────────────────────────────────────────────────────────

function DetailPanel({ item, onWizard, onNavToStudio, onDelete }) {
  if (!item) return (
    <div style={{ padding: "60px 20px", textAlign: "center", color: "var(--text-dim)", fontSize: 13 }}>
      アイテムを選択してください
    </div>
  );

  const card = item.card;
  const rb = item.rakuten || card?.rakuten;
  const status = getItemStatus(item);
  const cfg = STATUS_CONFIG[status];

  // データソースを判定
  const sources = [];
  if (rb) sources.push("楽天API");
  if (card?.fetchedAt) sources.push("Playwright");
  if (card?.whatIsThis) sources.push("Claude AI");
  if (sources.length === 0) sources.push("手動");

  return (
    <div>
      {/* Actions */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", justifyContent: "flex-end" }}>
        <Btn small onClick={() => onWizard(item)}>{card ? "再分析・編集" : "商品理解AIを実行"}</Btn>
        {onNavToStudio && <Btn small variant="primary" onClick={() => onNavToStudio(item.id)}>▣ 制作スタジオ</Btn>}
        {onDelete && <Btn small variant="danger" onClick={() => onDelete(item.id)}>削除</Btn>}
      </div>

      {/* Status banner */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: cfg.bg, border: `1px solid ${cfg.color}`, marginBottom: 16 }}>
        <StatusBadge status={status} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {sources.map(s => <SourceTag key={s} source={s} />)}
        </div>
        {item.analysisAt && (
          <span style={{ fontSize: 9, color: "var(--text-dim)", marginLeft: "auto" }}>
            {new Date(item.analysisAt).toLocaleString("ja-JP")}
          </span>
        )}
      </div>

      {/* Missing reasons */}
      {(item.missingReasons || []).length > 0 && (
        <div style={{ background: "rgba(224,108,117,0.08)", border: "1px solid rgba(224,108,117,0.3)", padding: "10px 14px", marginBottom: 16 }}>
          <div style={{ fontSize: 9, color: "#e06c75", letterSpacing: "0.15em", marginBottom: 6 }}>不足情報</div>
          {item.missingReasons.map((r, i) => (
            <div key={i} style={{ fontSize: 10, color: "var(--text-dim)", padding: "2px 0" }}>· {r}</div>
          ))}
        </div>
      )}

      {/* 楽天APIデータ */}
      <Section title="楽天API取得データ" color="#e07b4c">
        <Row label="商品名"         value={rb?.name} source="楽天API" />
        <Row label="価格"           value={rb?.price ? `¥${Number(rb.price).toLocaleString()}` : null} source="楽天API" />
        <Row label="レビュー件数"   value={rb?.reviewCount ? `${rb.reviewCount.toLocaleString()}件` : null} source="楽天API" />
        <Row label="レビュー平均"   value={rb?.reviewAverage ? `★${rb.reviewAverage}` : null} source="楽天API" />
        <Row label="楽天商品URL"    value={rb?.url} source="楽天API" link />
        <Row label="アフィリエイトURL" value={rb?.url} source="楽天API" link />
        <Row label="ショップ名"     value={rb?.shopName} source="楽天API" />
        {rb?.imageUrl && (
          <div style={{ padding: "8px 0" }}>
            <span style={{ fontSize: 10, color: "var(--text-dim)", display: "block", marginBottom: 4 }}>画像</span>
            <img src={rb.imageUrl} alt="商品画像" style={{ maxWidth: 80, maxHeight: 80, objectFit: "contain", border: "1px solid var(--border)" }} />
          </div>
        )}
        {!rb && <div style={{ fontSize: 11, color: "var(--text-dim)", padding: "8px 0" }}>楽天API未取得</div>}
      </Section>

      {/* Playwright / AI データ */}
      <Section title="Playwright取得データ" color="#6fa8dc">
        <Row label="ブランド"       value={card?.brand} source="Playwright" />
        <Row label="カテゴリ"       value={card?.category ? `${card.category} > ${card.subCategory || "—"}` : null} source="Playwright" />
        <Row label="判定根拠"       value={card?.categorySource} source="Playwright" />
        <Row label="信頼度"         value={card?.categoryConfidence ? `${card.categoryConfidence}%` : null} source="Playwright" />
        <Row label="レビュー平均"   value={card?.reviewData?.avg ? `★${card.reviewData.avg}` : null} source="Playwright" />
        <Row label="レビュー件数"   value={card?.reviewData?.count ? `${card.reviewData.count.toLocaleString()}件` : null} source="Playwright" />
        {!card && <div style={{ fontSize: 11, color: "var(--text-dim)", padding: "8px 0" }}>Playwright未実行</div>}
      </Section>

      {/* Claude AI データ */}
      {card && (
        <Section title="Claude AI解析データ" color="#98c379">
          {card.understandingScore != null && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 10, color: "var(--text-dim)" }}>商品理解スコア</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#98c379" }}>{card.understandingScore}点</span>
              </div>
              <div style={{ height: 4, background: "var(--border)" }}>
                <div style={{ width: `${card.understandingScore}%`, height: "100%", background: "#98c379" }} />
              </div>
              {(card.missingFields || []).length > 0 && (
                <div style={{ fontSize: 9, color: "var(--text-dim)", marginTop: 4 }}>
                  不足: {card.missingFields.join("、")}
                </div>
              )}
            </div>
          )}
          <Row label="商品説明"     value={card.whatIsThis} source="Claude AI" />
          <Row label="課題解決"     value={card.whatItSolves} source="Claude AI" />
          <Row label="向いている人" value={card.forWho} source="Claude AI" />
          <Row label="向いていない人" value={(card.notForWho || []).join(" / ")} source="Claude AI" />
          <Row label="強み"         value={(card.strengths || []).join("、")} source="Claude AI" />
          <Row label="弱み"         value={(card.weaknesses || []).join("、")} source="Claude AI" />
        </Section>
      )}

      {/* UpGear評価 */}
      <Section title="UpGear評価">
        <Row label="UpGearスコア" value={`${item.score}点`} />
        <Row label="判定"         value={item.judgment} />
        <Row label="価格（手動）" value={item.price ? `¥${Number(item.price).toLocaleString()}` : null} />
      </Section>

      {/* 検索キーワード */}
      {card?.searchKeywords?.length > 0 && (
        <Section title="検索キーワード" color="#98c379">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {card.searchKeywords.map((kw) => (
              <span key={kw} style={{ fontSize: 11, background: "var(--bg2)", border: "1px solid var(--border)", padding: "3px 10px" }}>{kw}</span>
            ))}
          </div>
        </Section>
      )}

      {/* 参照URL */}
      {item.urls && Object.values(item.urls).some(Boolean) && (
        <Section title="参照URL">
          {Object.entries(item.urls).filter(([, v]) => v).map(([k, v]) => (
            <div key={k} style={{ display: "flex", gap: 8, padding: "4px 0", alignItems: "center" }}>
              <span style={{ fontSize: 10, color: "var(--text-dim)", width: 80, flexShrink: 0 }}>{k}</span>
              <a href={v} target="_blank" rel="noreferrer" style={{ fontSize: 10, color: "#6fa8dc", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{v}</a>
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({ title, color = "var(--accent)", children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 9, color, letterSpacing: "0.2em", borderLeft: `2px solid ${color}`, paddingLeft: 8, marginBottom: 10 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Row({ label, value, source, link }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", gap: 10, padding: "5px 0", borderBottom: "1px solid var(--border)", alignItems: "flex-start" }}>
      <span style={{ fontSize: 10, color: "var(--text-dim)", width: 110, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 11, lineHeight: 1.5, flex: 1, wordBreak: "break-all" }}>
        {link ? (
          <a href={value} target="_blank" rel="noreferrer" style={{ color: "#6fa8dc" }}>{value}</a>
        ) : value}
      </span>
      {source && <SourceTag source={source} />}
    </div>
  );
}

// ─── Main Stock page ─────────────────────────────────────────────────────────

export default function Stock({ data, addItem, updateItem, deleteItem, selectedItemId, setSelectedItemId, onNavToStudio }) {
  const { items } = data;
  const [selectedId, setSelectedId] = useState(selectedItemId || null);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardItem, setWizardItem] = useState(null);
  const [filter, setFilter] = useState("all");

  const selectedItem = items.find((i) => i.id === selectedId) || null;

  const openWizard = (item = null) => {
    setWizardItem(item);
    setShowWizard(true);
  };

  const handleSave = (item) => {
    if (items.find((i) => i.id === item.id)) {
      updateItem(item.id, item);
    } else {
      addItem(item);
    }
    setSelectedId(item.id);
    setSelectedItemId?.(item.id);
  };

  const handleDelete = (id) => {
    if (!confirm("削除しますか？")) return;
    deleteItem(id);
    setSelectedId(null);
  };

  const countByStatus = (s) => items.filter((i) => getItemStatus(i) === s).length;

  const FILTERS = [
    { id: "all",      label: `すべて (${items.length})` },
    { id: "認定",     label: `認定 (${countByStatus("認定")})` },
    { id: "条件付き", label: `条件付き (${countByStatus("条件付き")})` },
    { id: "要確認",   label: `要確認 (${countByStatus("要確認")})` },
    { id: "未分析",   label: `未分析 (${countByStatus("未分析")})` },
    { id: "非認定",   label: `非認定 (${countByStatus("非認定")})` },
  ];

  const filtered = items.filter((i) => {
    if (filter === "all") return true;
    return getItemStatus(i) === filter;
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <PageHeader
          title="ストック"
          sub={`商品データベース — ${items.length}件 / 認定 ${countByStatus("認定")}件 / 条件付き ${countByStatus("条件付き")}件`}
        />
        <Btn variant="primary" onClick={() => openWizard()}>
          + 新規アイテム登録
        </Btn>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
        {FILTERS.map((f) => {
          const cfg = STATUS_CONFIG[f.id];
          return (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{
              padding: "5px 12px", background: "none", fontFamily: "var(--font-mono)",
              border: `1px solid ${filter === f.id ? (cfg?.color || "var(--accent)") : "var(--border)"}`,
              color: filter === f.id ? (cfg?.color || "var(--accent)") : "var(--text-dim)",
              fontSize: 11, cursor: "pointer",
            }}>{f.label}</button>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 16 }}>
        {/* List */}
        <div>
          {filtered.length === 0 ? (
            <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-dim)", fontSize: 12 }}>
              アイテムがありません
              <br />
              <button onClick={() => openWizard()} style={{ marginTop: 12, background: "none", border: "1px solid var(--accent)", color: "var(--accent)", padding: "6px 14px", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 11 }}>
                + 登録する
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {filtered.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  selected={selectedId === item.id}
                  onClick={() => {
                    setSelectedId(item.id);
                    setSelectedItemId?.(item.id);
                  }}
                  onWizard={openWizard}
                  onNavToStudio={onNavToStudio}
                />
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", padding: "20px 24px", overflowY: "auto", maxHeight: "calc(100vh - 180px)" }}>
          <DetailPanel
            item={selectedItem}
            onWizard={openWizard}
            onNavToStudio={onNavToStudio}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Wizard overlay */}
      {showWizard && (
        <ItemWizard
          existingItem={wizardItem}
          onSave={handleSave}
          onGoToStudio={(itemId) => { setSelectedItemId?.(itemId); onNavToStudio?.(itemId); }}
          onClose={() => { setShowWizard(false); setWizardItem(null); }}
        />
      )}
    </div>
  );
}
