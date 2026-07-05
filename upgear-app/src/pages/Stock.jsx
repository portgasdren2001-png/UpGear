import { useState, useEffect, useRef, useCallback } from "react";
import { PageHeader, Tag, Btn } from "../components/ui";
import ItemWizard from "./ItemWizard";
import GenreManager from "./GenreManager";

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

// 手動ジャンルを返す。未設定なら null
function getManualGenre(item) {
  return item.manualGenre || null;
}

// 推定ジャンルを返す（AI・楽天API由来）
function getInferredGenre(item) {
  return item.inferredGenre || item.mainCategory || item.category || null;
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

// ─── GenreBadge ───────────────────────────────────────────────────────────────

function GenreBadge({ genre, manual }) {
  const isUnset = !genre;
  return (
    <span style={{
      fontSize: 9, padding: "2px 7px",
      background: isUnset ? "rgba(100,100,100,0.08)" : manual ? "rgba(255,107,0,0.1)" : "rgba(111,168,220,0.1)",
      color: isUnset ? "#555" : manual ? "var(--accent)" : "#6fa8dc",
      border: `1px solid ${isUnset ? "#444" : manual ? "var(--accent)" : "#6fa8dc"}`,
      whiteSpace: "nowrap",
    }}>
      {genre || "未分類"}
    </span>
  );
}

// ─── ItemCard ─────────────────────────────────────────────────────────────────

function ItemCard({ item, selected, onClick, onDoubleClick, onWizard, onNavToStudio, onNavToUnderstanding }) {
  const [hovered, setHovered] = useState(false);
  const u = item.understanding || {};
  const manualGenre = getManualGenre(item);
  // 商品理解データを優先表示
  const displayName     = u.name       || item.label       || "（商品名未設定）";
  const displayBrand    = u.brand      || item.brand       || "";
  const displayCategory = u.category   || item.mainCategory || item.category || "";
  const displayPrice    = u.price      ? u.price : (item.price ? `¥${Number(item.price).toLocaleString()}` : "");
  const displayScore    = u.totalScore || item.score       || null;
  const displayOneLiner = u.oneLiner   || "";
  const hasUnderstanding = Object.values(u).some(v => v?.trim?.());

  return (
    <div
      title={displayName}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: selected ? "var(--accent-dim)" : hovered ? "var(--bg2)" : "var(--bg3)",
        border: `1px solid ${selected ? "var(--accent)" : hovered ? "var(--accent)" : "var(--border)"}`,
        borderLeft: `3px solid ${hasUnderstanding ? "#98c379" : "var(--border)"}`,
        padding: "12px 14px", cursor: "pointer",
        transition: "border-color 0.12s, background 0.12s",
        userSelect: "none",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3, flexWrap: "wrap" }}>
          <span style={{ fontSize: 9, color: "var(--text-dim)" }}>No.{item.no}</span>
          <GenreBadge genre={manualGenre} manual={true} />
          {hasUnderstanding && (
            <span style={{ fontSize: 9, color: "#98c379", background: "rgba(152,195,121,0.12)", border: "1px solid rgba(152,195,121,0.3)", padding: "1px 5px" }}>◍ 理解済み</span>
          )}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {displayName}
        </div>
        {displayBrand && <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 2 }}>{displayBrand}</div>}
      </div>

      {/* Data row */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, fontSize: 10, color: "var(--text-dim)", alignItems: "center" }}>
        {displayCategory && <span>{displayCategory}</span>}
        {displayPrice && <span style={{ color: "var(--text)" }}>{displayPrice}</span>}
        {displayScore && <span style={{ color: "var(--accent)" }}>{displayScore}点</span>}
      </div>
      {displayOneLiner && (
        <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontStyle: "italic" }}>
          {displayOneLiner}
        </div>
      )}

      {/* Actions when selected */}
      {selected && (
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }} onClick={(e) => e.stopPropagation()}>
          {onNavToUnderstanding && (
            <Btn small variant="primary" onClick={() => onNavToUnderstanding(item.id)}>◍ 商品理解を開く</Btn>
          )}
          {onNavToStudio && (
            <Btn small onClick={() => onNavToStudio(item.id)}>▣ 制作スタジオ</Btn>
          )}
        </div>
      )}
    </div>
  );
}

// ─── GenreSelector ────────────────────────────────────────────────────────────
// 詳細パネル内でジャンルを手動選択するUI

function GenreSelector({ item, genres, onSave }) {
  const [open, setOpen] = useState(false);
  const manualGenre = getManualGenre(item);
  const inferredGenre = getInferredGenre(item);

  const handleSelect = (name) => {
    onSave(item.id, { manualGenre: name });
    setOpen(false);
  };

  const handleClear = () => {
    onSave(item.id, { manualGenre: null });
    setOpen(false);
  };

  return (
    <div>
      {/* 現在のジャンル表示 */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <div>
          <span style={{ fontSize: 10, color: "var(--text-dim)", marginRight: 6 }}>手動ジャンル:</span>
          <GenreBadge genre={manualGenre} manual={true} />
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          style={{
            background: "none", border: "1px solid var(--accent)",
            color: "var(--accent)", fontSize: 10, padding: "3px 10px",
            cursor: "pointer", fontFamily: "var(--font-mono)",
          }}
        >
          {open ? "閉じる" : "ジャンルを変更"}
        </button>
      </div>



      {/* ジャンル一覧 */}
      {open && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "10px 0" }}>
          <button
            onClick={handleClear}
            style={{
              padding: "5px 12px", background: "none",
              border: `1px solid ${!manualGenre ? "var(--accent)" : "var(--border)"}`,
              color: !manualGenre ? "var(--accent)" : "var(--text-dim)",
              fontSize: 11, cursor: "pointer", fontFamily: "var(--font-mono)",
            }}
          >
            未分類
          </button>
          {genres.map((g) => (
            <button
              key={g.id}
              onClick={() => handleSelect(g.name)}
              style={{
                padding: "5px 12px", background: "none",
                border: `1px solid ${manualGenre === g.name ? "var(--accent)" : "var(--border)"}`,
                color: manualGenre === g.name ? "var(--accent)" : "var(--text-dim)",
                fontSize: 11, cursor: "pointer", fontFamily: "var(--font-mono)",
              }}
            >
              {manualGenre === g.name ? "✓ " : ""}{g.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── DetailPanel ─────────────────────────────────────────────────────────────

function DetailPanel({ item, genres, onWizard, onNavToStudio, onNavToUnderstanding, onDelete, onUpdateItem }) {
  if (!item) return (
    <div style={{ padding: "60px 20px", textAlign: "center", color: "var(--text-dim)", fontSize: 13 }}>
      <div style={{ marginBottom: 8 }}>アイテムを選択してください</div>
      <div style={{ fontSize: 10 }}>クリックで詳細 / ダブルクリックで商品理解AI</div>
    </div>
  );

  // 自動分析変数（一旦不使用 — 復活時はコメント解除）
  // const card = item.card;
  // const rb = item.rakuten || card?.rakuten;
  // const status = getItemStatus(item);
  // const cfg = STATUS_CONFIG[status];

  return (
    <div>
      {/* Actions */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", justifyContent: "flex-end" }}>
        {onNavToUnderstanding && <Btn small variant="primary" onClick={() => onNavToUnderstanding(item.id)}>◍ 商品理解を開く</Btn>}
        {onNavToStudio && <Btn small onClick={() => onNavToStudio(item.id)}>▣ 制作スタジオ</Btn>}
        {onDelete && <Btn small variant="danger" onClick={() => onDelete(item.id)}>削除</Btn>}
      </div>



      {/* ─ ジャンル手動選択 ─ */}
      <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", padding: "12px 14px", marginBottom: 16 }}>
        <div style={{ fontSize: 9, color: "var(--accent)", letterSpacing: "0.15em", borderLeft: "2px solid var(--accent)", paddingLeft: 8, marginBottom: 10 }}>
          ジャンル
        </div>
        <GenreSelector item={item} genres={genres} onSave={onUpdateItem} />
      </div>

      {/* 自動分析: 不足情報（一旦非表示）
      {(item.missingReasons || []).length > 0 && (
        <div style={{ background: "rgba(224,108,117,0.08)", border: "1px solid rgba(224,108,117,0.3)", padding: "10px 14px", marginBottom: 16 }}>
          <div style={{ fontSize: 9, color: "#e06c75", letterSpacing: "0.15em", marginBottom: 6 }}>不足情報</div>
          {item.missingReasons.map((r, i) => (
            <div key={i} style={{ fontSize: 10, color: "var(--text-dim)", padding: "2px 0" }}>· {r}</div>
          ))}
        </div>
      )}
      */}

      {/* 自動分析セクション（一旦非表示 — 将来の自動分析復活時はここのコメントを外す）
      <Section title="楽天API取得データ" color="#e07b4c">
        <Row label="商品名"       value={rb?.name} source="楽天API" />
        <Row label="価格"         value={rb?.price ? `¥${Number(rb.price).toLocaleString()}` : null} source="楽天API" />
        <Row label="レビュー件数" value={rb?.reviewCount ? `${rb.reviewCount.toLocaleString()}件` : null} source="楽天API" />
        <Row label="レビュー平均" value={rb?.reviewAverage ? `★${rb.reviewAverage}` : null} source="楽天API" />
        <Row label="楽天URL"      value={rb?.url} source="楽天API" link />
        <Row label="ショップ名"   value={rb?.shopName} source="楽天API" />
        {!rb && <div style={{ fontSize: 11, color: "var(--text-dim)", padding: "8px 0" }}>楽天API未取得</div>}
      </Section>
      <Section title="Playwright取得データ" color="#6fa8dc">...</Section>
      <Section title="Claude AI解析データ" color="#98c379">...</Section>
      <Section title="UpGear評価">
        <Row label="UpGearスコア" value={`${item.score}点`} />
        <Row label="判定"         value={item.judgment} />
      </Section>
      */}

      {/* 商品理解データ（SSoT 優先表示） */}
      {(() => {
        const u = item.understanding || {};
        const hasU = Object.values(u).some(v => v?.trim?.());
        if (hasU) {
          return (
            <Section title="商品理解データ" color="var(--accent)">
              {u.name      && <Row label="商品名"   value={u.name} />}
              {u.brand     && <Row label="ブランド" value={u.brand} />}
              {u.category  && <Row label="カテゴリ" value={u.category} />}
              {u.price     && <Row label="価格"     value={u.price} />}
              {u.overview  && <Row label="商品概要" value={u.overview} />}
              {u.strengths && <Row label="強み"     value={u.strengths} />}
              {u.oneLiner  && <Row label="一言まとめ" value={u.oneLiner} />}
              {u.officialUrl && (
                <div style={{ display: "flex", gap: 10, padding: "5px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 10, color: "var(--text-dim)", width: 110, flexShrink: 0 }}>公式URL</span>
                  <a href={u.officialUrl} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: "#6fa8dc", wordBreak: "break-all" }}>{u.officialUrl}</a>
                </div>
              )}
              {u.salesUrl && (
                <div style={{ display: "flex", gap: 10, padding: "5px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 10, color: "var(--text-dim)", width: 110, flexShrink: 0 }}>販売URL</span>
                  <a href={u.salesUrl} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: "#6fa8dc", wordBreak: "break-all" }}>{u.salesUrl}</a>
                </div>
              )}
            </Section>
          );
        }
        // 商品理解未入力の場合は従来データを表示
        return (
          <>
            {(item.price || item.brand) && (
              <Section title="基本情報">
                {item.brand && <Row label="ブランド" value={item.brand} />}
                {item.price && <Row label="価格" value={`¥${Number(item.price).toLocaleString()}`} />}
              </Section>
            )}
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
            <div style={{ padding: "12px 0", textAlign: "center", color: "var(--text-dim)", fontSize: 11 }}>
              商品理解データが未入力です。
              <br />
              <button
                onClick={() => onNavToUnderstanding?.(item.id)}
                style={{ marginTop: 8, background: "none", border: "1px solid var(--accent)", color: "var(--accent)", fontSize: 10, padding: "5px 14px", cursor: "pointer", fontFamily: "var(--font-mono)" }}
              >
                ◍ 商品理解を入力する
              </button>
            </div>
          </>
        );
      })()}
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

export default function Stock({
  data, addItem, updateItem, deleteItem,
  selectedItemId, setSelectedItemId, onNavToStudio, onNavToUnderstanding,
  genres, addGenre, renameGenre, deleteGenre, moveGenre, resetGenres,
  categories,
}) {
  const { items } = data;
  const [selectedId, setSelectedId] = useState(selectedItemId || null);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardItem, setWizardItem] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [genreFilter, setGenreFilter] = useState("all");
  const [showGenreManager, setShowGenreManager] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef(null);

  // ── ReadyAI同期 ──────────────────────────────────────────────────────────────
  const [syncState, setSyncState] = useState("idle"); // idle | syncing | done | error
  const [syncMsg,   setSyncMsg]   = useState("");

  const handleSyncToReadyAI = useCallback(async () => {
    setSyncState("syncing");
    setSyncMsg("同期中...");
    try {
      const publishableItems = items.filter(i => {
        const s = getItemStatus(i);
        return s !== "未分析" && s !== "解析中";
      });
      const rankings = [...publishableItems]
        .filter(i => (i.card?.upgearScore ?? i.score) > 0)
        .sort((a, b) => (b.card?.upgearScore ?? b.score ?? 0) - (a.card?.upgearScore ?? a.score ?? 0))
        .slice(0, 20)
        .map((item, idx) => ({
          rank: idx + 1,
          id: item.id,
          name: item.card?.name || item.label,
          upgearScore: item.card?.upgearScore ?? item.score ?? 0,
          verdict: item.card?.verdict || item.judgment || "",
          imageUrl: (item.rakuten || item.card?.rakuten)?.imageUrl || null,
          manualGenre: item.manualGenre || null,
        }));
      const categorySet = [...new Set(publishableItems.map(i => i.mainCategory || i.category).filter(Boolean))];
      const res = await fetch("http://localhost:3001/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          products: publishableItems,
          categories: categorySet.map(name => ({ name })),
          rankings,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setSyncState("done");
        setSyncMsg(`✓ ${json.count}件 同期完了 — ${new Date(json.syncedAt).toLocaleTimeString("ja-JP")}`);
      } else {
        throw new Error(json.error || "sync failed");
      }
    } catch (e) {
      setSyncState("error");
      setSyncMsg(`✗ 同期エラー: ${e.message}`);
    }
    setTimeout(() => { setSyncState("idle"); setSyncMsg(""); }, 4000);
  }, [items]);
  // ─────────────────────────────────────────────────────────────────────────────

  const selectedItem = items.find((i) => i.id === selectedId) || null;

  const openWizard = (item = null) => {
    setWizardItem(item);
    setShowWizard(true);
  };

  const handleSave = (item) => {
    // ウィザードで保存時: AI推定ジャンルを inferredGenre へ移動、手動は上書きしない
    const inferredGenre = item.mainCategory || item.category || null;
    const saved = {
      ...item,
      inferredGenre,
      // manualGenre は既存のものを引き継ぐ（ウィザードは上書きしない）
      manualGenre: items.find((i) => i.id === item.id)?.manualGenre || null,
    };
    if (items.find((i) => i.id === saved.id)) {
      updateItem(saved.id, saved);
    } else {
      addItem(saved);
    }
    setSelectedId(saved.id);
    setSelectedItemId?.(saved.id);
  };

  const handleDelete = (id) => {
    if (!confirm("削除しますか？")) return;
    deleteItem(id);
    setSelectedId(null);
  };

  const handleUpdateItem = (id, patch) => {
    updateItem(id, patch);
  };

  const countByStatus = (s) => items.filter((i) => getItemStatus(i) === s).length;
  const countByGenre  = (name) => items.filter((i) => (getManualGenre(i) || null) === name).length;
  const unclassifiedCount = items.filter((i) => !getManualGenre(i)).length;

  const STATUS_FILTERS = [
    { id: "all",      label: `すべて (${items.length})` },
    { id: "認定",     label: `認定 (${countByStatus("認定")})` },
    { id: "条件付き", label: `条件付き (${countByStatus("条件付き")})` },
    { id: "要確認",   label: `要確認 (${countByStatus("要確認")})` },
    { id: "未分析",   label: `未分析 (${countByStatus("未分析")})` },
    { id: "非認定",   label: `非認定 (${countByStatus("非認定")})` },
  ];

  const filtered = items.filter((i) => {
    if (statusFilter !== "all" && getItemStatus(i) !== statusFilter) return false;
    if (genreFilter === "__unclassified") {
      if (getManualGenre(i)) return false;
    } else if (genreFilter !== "all") {
      if (getManualGenre(i) !== genreFilter) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (i.label || "").toLowerCase().includes(q) ||
             (i.brand || "").toLowerCase().includes(q) ||
             (i.manualGenre || "").toLowerCase().includes(q);
    }
    return true;
  });

  // キーボードショートカット
  useEffect(() => {
    if (showWizard || showGenreManager) return;
    const handle = (e) => {
      if (!selectedItem) return;
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;
      if (e.key === "Delete") { handleDelete(selectedItem.id); return; }
      if (e.key === "F2") { e.preventDefault(); openWizard(selectedItem); return; }
      if (e.key === "d" && e.ctrlKey) {
        e.preventDefault();
        const dup = { ...selectedItem, id: `item_${Date.now()}`, no: "—", label: `${selectedItem.label}（コピー）`, manualGenre: selectedItem.manualGenre };
        addItem(dup);
        return;
      }
      if (e.key === "f" && e.ctrlKey) {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [selectedItem, showWizard, showGenreManager]);

  const filterBtnStyle = (active, color) => ({
    padding: "4px 10px", background: "none", fontFamily: "var(--font-mono)",
    border: `1px solid ${active ? (color || "var(--accent)") : "var(--border)"}`,
    color: active ? (color || "var(--accent)") : "var(--text-dim)",
    fontSize: 10, cursor: "pointer",
  });

  return (
    <div>
      {/* ヘッダー */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <PageHeader
          title="ストック"
          sub={`商品データベース — ${items.length}件 / 認定 ${countByStatus("認定")}件 / 条件付き ${countByStatus("条件付き")}件`}
        />
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            ref={searchRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="検索... (Ctrl+F)"
            style={{
              background: "var(--bg2)", border: "1px solid var(--border)",
              color: "var(--text)", fontFamily: "var(--font-mono)", fontSize: 11,
              padding: "5px 10px", width: 180,
            }}
          />
          <button
            onClick={() => setShowGenreManager(true)}
            style={{ background: "none", border: "1px solid var(--border)", color: "var(--text-dim)", fontSize: 11, padding: "5px 12px", cursor: "pointer", fontFamily: "var(--font-mono)" }}
          >
            ジャンル管理
          </button>
          {/* ── ReadyAIへ同期ボタン ── */}
          <button
            onClick={handleSyncToReadyAI}
            disabled={syncState === "syncing"}
            style={{
              background: syncState === "done"  ? "rgba(152,195,121,0.15)"
                        : syncState === "error" ? "rgba(224,108,117,0.15)"
                        : "none",
              border: `1px solid ${
                syncState === "done"  ? "#98c379" :
                syncState === "error" ? "#e06c75" : "var(--accent)"}`,
              color: syncState === "done"  ? "#98c379"
                   : syncState === "error" ? "#e06c75"
                   : "var(--accent)",
              fontSize: 11, padding: "5px 14px",
              cursor: syncState === "syncing" ? "not-allowed" : "pointer",
              fontFamily: "var(--font-mono)",
              opacity: syncState === "syncing" ? 0.5 : 1,
              minWidth: 140,
            }}
          >
            {syncState === "syncing" ? "同期中..." : "↑ ReadyAIへ同期"}
          </button>
          {syncMsg && (
            <span style={{
              fontSize: 10,
              color: syncState === "error" ? "#e06c75" : "#98c379",
            }}>
              {syncMsg}
            </span>
          )}
          <Btn variant="primary" onClick={() => openWizard()}>+ 新規アイテム登録</Btn>
        </div>
      </div>

      {/* ショートカットヒント */}
      <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        {[["クリック","詳細表示"],["Delete","削除"],["Ctrl+D","複製"],["Ctrl+F","検索"]].map(([k,v]) => (
          <span key={k} style={{ fontSize: 9, color: "var(--text-dim)" }}>
            <kbd style={{ background: "var(--bg2)", border: "1px solid var(--border)", padding: "1px 5px", borderRadius: 2, fontFamily: "var(--font-mono)" }}>{k}</kbd>
            {" "}{v}
          </span>
        ))}
      </div>

      {/* ─ ジャンルフィルター ─ */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.12em", marginBottom: 6 }}>GENRE</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {/* すべて */}
          <button onClick={() => setGenreFilter("all")} style={filterBtnStyle(genreFilter === "all")}>
            すべて ({items.length})
          </button>
          {/* 未分類 */}
          {unclassifiedCount > 0 && (
            <button onClick={() => setGenreFilter("__unclassified")} style={filterBtnStyle(genreFilter === "__unclassified", "#555")}>
              未分類 ({unclassifiedCount})
            </button>
          )}
          {/* 登録ジャンル */}
          {genres.map((g) => {
            const cnt = countByGenre(g.name);
            return (
              <button key={g.id} onClick={() => setGenreFilter(g.name)} style={filterBtnStyle(genreFilter === g.name)}>
                {g.name} ({cnt})
              </button>
            );
          })}
        </div>
      </div>

      {/* ─ ステータスフィルター ─ */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
        {STATUS_FILTERS.map((f) => {
          const cfg = STATUS_CONFIG[f.id];
          return (
            <button key={f.id} onClick={() => setStatusFilter(f.id)} style={filterBtnStyle(statusFilter === f.id, cfg?.color)}>
              {f.label}
            </button>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 16 }}>
        {/* リスト */}
        <div>
          {filtered.length === 0 ? (
            <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-dim)", fontSize: 12 }}>
              {searchQuery ? `"${searchQuery}" に一致するアイテムがありません` : "アイテムがありません"}
              <br />
              {!searchQuery && (
                <button onClick={() => openWizard()} style={{ marginTop: 12, background: "none", border: "1px solid var(--accent)", color: "var(--accent)", padding: "6px 14px", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 11 }}>
                  + 登録する
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {filtered.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  selected={selectedId === item.id}
                  onClick={() => { setSelectedId(item.id); setSelectedItemId?.(item.id); }}
                  onDoubleClick={() => openWizard(item)}
                  onWizard={openWizard}
                  onNavToStudio={onNavToStudio}
                  onNavToUnderstanding={onNavToUnderstanding}
                />
              ))}
            </div>
          )}
        </div>

        {/* 詳細パネル */}
        <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", padding: "20px 24px", overflowY: "auto", maxHeight: "calc(100vh - 180px)" }}>
          <DetailPanel
            item={selectedItem}
            genres={genres}
            onWizard={openWizard}
            onNavToStudio={onNavToStudio}
            onNavToUnderstanding={onNavToUnderstanding}
            onDelete={handleDelete}
            onUpdateItem={handleUpdateItem}
          />
        </div>
      </div>

      {/* ジャンル管理モーダル */}
      {showGenreManager && (
        <GenreManager
          genres={genres}
          onClose={() => setShowGenreManager(false)}
          addGenre={addGenre}
          renameGenre={renameGenre}
          deleteGenre={deleteGenre}
          moveGenre={moveGenre}
          resetGenres={resetGenres}
        />
      )}

      {/* Wizard overlay */}
      {showWizard && (
        <ItemWizard
          existingItem={wizardItem}
          categories={categories}
          onSave={handleSave}
          onGoToStudio={(itemId) => { setSelectedItemId?.(itemId); onNavToStudio?.(itemId); }}
          onClose={() => { setShowWizard(false); setWizardItem(null); }}
        />
      )}
    </div>
  );
}
