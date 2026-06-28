import { useState } from "react";
import { PageHeader, Tag, Btn } from "../components/ui";
import ItemWizard from "./ItemWizard";

const J_COLOR = {
  "認定":       "orange",
  "条件付き認定": "blue",
  "保留":        "gray",
  "非認定":      "gray",
};

const UNDERSTANDING_COLOR = (s) => {
  if (!s) return "var(--border)";
  if (s >= 90) return "#98c379";
  if (s >= 70) return "var(--accent)";
  return "#e06c75";
};

function ScoreDot({ score }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: UNDERSTANDING_COLOR(score), flexShrink: 0 }} />
      <span style={{ fontSize: 10, color: UNDERSTANDING_COLOR(score) }}>
        {score ? `${score}点` : "未分析"}
      </span>
    </div>
  );
}

function ItemCard({ item, selected, onClick, onWizard, onNavToStudio }) {
  const card = item.card;
  const urlCount = item.urls ? Object.values(item.urls).filter(Boolean).length : 0;

  return (
    <div
      onClick={onClick}
      style={{
        background: selected ? "var(--accent-dim)" : "var(--bg3)",
        border: `1px solid ${selected ? "var(--accent)" : "var(--border)"}`,
        borderLeft: `3px solid ${selected ? "var(--accent)" : "transparent"}`,
        padding: "14px 16px", cursor: "pointer",
        transition: "border-color 0.15s, background 0.15s",
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, color: "var(--text-dim)", marginBottom: 3 }}>
            No.{item.no} · <Tag color={J_COLOR[item.judgment]}>{item.category}</Tag>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {item.label}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--accent)" }}>{item.score}点</div>
          <div style={{ fontSize: 10, color: "var(--text-dim)" }}>UpGear</div>
        </div>
      </div>

      {/* Meta row */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <ScoreDot score={card?.understandingScore} />
        {urlCount > 0 && (
          <span style={{ fontSize: 10, color: "#6fa8dc" }}>
            URL {urlCount}件
          </span>
        )}
        {card?.subCategory && (
          <span style={{ fontSize: 10, color: "var(--text-dim)" }}>{card.subCategory}</span>
        )}
        {item.price && (
          <span style={{ fontSize: 10, color: "var(--text-dim)" }}>¥{Number(item.price).toLocaleString()}</span>
        )}
      </div>

      {/* Card keywords preview */}
      {card?.searchKeywords?.length > 0 && selected && (
        <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 4 }}>
          {card.searchKeywords.slice(0, 5).map((kw) => (
            <span key={kw} style={{ fontSize: 9, background: "var(--bg2)", border: "1px solid var(--border)", padding: "1px 6px", color: "var(--text-dim)" }}>{kw}</span>
          ))}
        </div>
      )}

      {/* Actions (shown when selected) */}
      {selected && (
        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }} onClick={(e) => e.stopPropagation()}>
          <Btn small onClick={() => onWizard(item)}>
            {card ? "再分析" : "商品理解AI"}
          </Btn>
          {onNavToStudio && (
            <Btn small variant="primary" onClick={() => onNavToStudio(item.id)}>
              ▣ 制作スタジオ
            </Btn>
          )}
        </div>
      )}
    </div>
  );
}

function DetailPanel({ item, onWizard, onNavToStudio, onDelete }) {
  if (!item) return (
    <div style={{ padding: "60px 20px", textAlign: "center", color: "var(--text-dim)", fontSize: 13 }}>
      アイテムを選択してください
    </div>
  );

  const card = item.card;

  return (
    <div>
      {/* Actions */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", justifyContent: "flex-end" }}>
        <Btn small onClick={() => onWizard(item)}>{card ? "再分析・編集" : "商品理解AIを実行"}</Btn>
        {onNavToStudio && <Btn small variant="primary" onClick={() => onNavToStudio(item.id)}>▣ 制作スタジオ</Btn>}
        {onDelete && <Btn small variant="danger" onClick={() => onDelete(item.id)}>削除</Btn>}
      </div>

      {/* Understanding score */}
      {card?.understandingScore != null && (
        <div style={{ background: "var(--bg2)", border: `2px solid ${UNDERSTANDING_COLOR(card.understandingScore)}`, padding: "12px 16px", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "var(--text-dim)" }}>商品理解スコア</span>
            <span style={{ fontSize: 22, fontWeight: 700, color: UNDERSTANDING_COLOR(card.understandingScore) }}>
              {card.understandingScore}点
            </span>
          </div>
          <div style={{ height: 4, background: "var(--border)", marginTop: 8 }}>
            <div style={{ width: `${card.understandingScore}%`, height: "100%", background: UNDERSTANDING_COLOR(card.understandingScore) }} />
          </div>
          {(card.missingFields || []).length > 0 && (
            <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 6 }}>
              不足: {card.missingFields.join("、")}
            </div>
          )}
        </div>
      )}

      {/* Sections */}
      {[
        {
          title: "基本情報",
          rows: [
            ["ブランド", card?.brand || "—"],
            ["サブカテゴリ", card?.subCategory || "—"],
            ["商品タイプ", card?.productType || "—"],
            ["カテゴリ判定根拠", card?.categorySource || "手動設定"],
            ["価格", item.price ? `¥${Number(item.price).toLocaleString()}` : "—"],
            ["UpGear判定", item.judgment],
            ["スコア", `${item.score}点`],
          ]
        },
        card ? {
          title: "商品理解",
          rows: [
            ["この商品は何か", card.whatIsThis],
            ["何を解決するか", card.whatItSolves],
            ["なぜ売れているか", card.whySelling],
            ["向いている人", card.forWho || "—"],
            ["向いていない人", (card.notForWho || []).join(" / ") || "—"],
            ["強み", (card.strengths || []).join("、")],
            ["弱み", (card.weaknesses || []).join("、")],
          ]
        } : null,
        card?.reviewData ? {
          title: "レビュー分析",
          rows: [
            ["評価", `★${card.reviewData.avg} / ${card.reviewData.count?.toLocaleString()}件`],
            ["高評価理由", (card.reviewData.highEval || []).join("、")],
            ["低評価理由", (card.reviewData.lowEval || []).join("、")],
            ["長期使用", card.reviewData.longTerm || "—"],
          ]
        } : null,
      ].filter(Boolean).map((sec) => (
        <div key={sec.title} style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 9, color: "var(--accent)", letterSpacing: "0.2em", borderLeft: "2px solid var(--accent)", paddingLeft: 8, marginBottom: 10 }}>
            {sec.title}
          </div>
          {sec.rows.map(([l, v]) => v && (
            <div key={l} style={{ display: "flex", gap: 10, padding: "5px 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: 10, color: "var(--text-dim)", width: 110, flexShrink: 0 }}>{l}</span>
              <span style={{ fontSize: 11, lineHeight: 1.5, flex: 1 }}>{v}</span>
            </div>
          ))}
        </div>
      ))}

      {/* Keywords */}
      {card?.searchKeywords?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 9, color: "var(--accent)", letterSpacing: "0.2em", borderLeft: "2px solid var(--accent)", paddingLeft: 8, marginBottom: 10 }}>
            検索キーワード
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {card.searchKeywords.map((kw) => (
              <span key={kw} style={{ fontSize: 11, background: "var(--bg2)", border: "1px solid var(--border)", padding: "3px 10px" }}>
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* URLs */}
      {item.urls && Object.values(item.urls).some(Boolean) && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 9, color: "var(--accent)", letterSpacing: "0.2em", borderLeft: "2px solid var(--accent)", paddingLeft: 8, marginBottom: 10 }}>
            参照URL
          </div>
          {Object.entries(item.urls).filter(([, v]) => v).map(([k, v]) => (
            <div key={k} style={{ display: "flex", gap: 8, padding: "4px 0", alignItems: "center" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#98c379", flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: "var(--text-dim)", width: 80 }}>{k}</span>
              <span style={{ fontSize: 10, color: "#6fa8dc", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{v}</span>
            </div>
          ))}
        </div>
      )}

      {/* Fetch timestamp */}
      {card?.fetchedAt && (
        <div style={{ fontSize: 10, color: "var(--text-dim)" }}>
          最終分析: {new Date(card.fetchedAt).toLocaleString("ja-JP")}
        </div>
      )}
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

  const handleGoToStudio = (itemId, research) => {
    setSelectedItemId?.(itemId);
    onNavToStudio?.(itemId);
  };

  const FILTERS = [
    { id: "all",    label: `すべて (${items.length})` },
    { id: "cert",   label: `認定 (${items.filter((i) => i.judgment === "認定").length})` },
    { id: "cond",   label: `条件付き (${items.filter((i) => i.judgment === "条件付き認定").length})` },
    { id: "nocard", label: `未分析 (${items.filter((i) => !i.card).length})` },
  ];

  const filtered = items.filter((i) => {
    if (filter === "cert")   return i.judgment === "認定";
    if (filter === "cond")   return i.judgment === "条件付き認定";
    if (filter === "nocard") return !i.card;
    return true;
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <PageHeader title="ストック" sub={`商品データベース — ${items.length}件 / 認定 ${items.filter((i) => i.judgment === "認定").length}件`} />
        <Btn variant="primary" onClick={() => openWizard()}>
          + 新規アイテム登録
        </Btn>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
        {FILTERS.map((f) => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{
            padding: "5px 12px", background: "none", fontFamily: "var(--font-mono)",
            border: `1px solid ${filter === f.id ? "var(--accent)" : "var(--border)"}`,
            color: filter === f.id ? "var(--accent)" : "var(--text-dim)",
            fontSize: 11, cursor: "pointer",
          }}>{f.label}</button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16 }}>
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
        <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", padding: "20px 24px" }}>
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
          onGoToStudio={handleGoToStudio}
          onClose={() => { setShowWizard(false); setWizardItem(null); }}
        />
      )}
    </div>
  );
}
