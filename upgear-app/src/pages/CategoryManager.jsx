import { useState } from "react";
import { Btn } from "../components/ui";

// ─── CategoryManager ──────────────────────────────────────────────────────────
// 大カテゴリ・小カテゴリのCRUDモーダル
// props: categories, onClose, addMainCategory, renameMainCategory, deleteMainCategory,
//        addSubCategory, renameSubCategory, deleteSubCategory, resetCategories

export default function CategoryManager({
  categories,
  onClose,
  addMainCategory,
  renameMainCategory,
  deleteMainCategory,
  addSubCategory,
  renameSubCategory,
  deleteSubCategory,
  resetCategories,
}) {
  const [expandedMain, setExpandedMain] = useState(null);
  const [editingMain, setEditingMain] = useState(null);   // { id, value }
  const [editingSub, setEditingSub]   = useState(null);   // { mainId, subId, value }
  const [newMainVal, setNewMainVal]   = useState("");
  const [newSubVals, setNewSubVals]   = useState({});     // { mainId: string }

  const { mainCategories } = categories;

  const commitMain = () => {
    if (!editingMain) return;
    const v = editingMain.value.trim();
    if (v) renameMainCategory(editingMain.id, v);
    setEditingMain(null);
  };

  const commitSub = () => {
    if (!editingSub) return;
    const v = editingSub.value.trim();
    if (v) renameSubCategory(editingSub.mainId, editingSub.subId, v);
    setEditingSub(null);
  };

  const handleAddMain = () => {
    const v = newMainVal.trim();
    if (!v) return;
    addMainCategory(v);
    setNewMainVal("");
  };

  const handleAddSub = (mainId) => {
    const v = (newSubVals[mainId] || "").trim();
    if (!v) return;
    addSubCategory(mainId, v);
    setNewSubVals((p) => ({ ...p, [mainId]: "" }));
  };

  const handleDeleteMain = (id, name) => {
    if (!confirm(`大カテゴリ「${name}」と配下の小カテゴリをすべて削除しますか？`)) return;
    deleteMainCategory(id);
    if (expandedMain === id) setExpandedMain(null);
  };

  const handleDeleteSub = (mainId, subId, name) => {
    if (!confirm(`小カテゴリ「${name}」を削除しますか？`)) return;
    deleteSubCategory(mainId, subId);
  };

  const handleReset = () => {
    if (!confirm("カテゴリをデフォルトに戻しますか？現在の変更は失われます。")) return;
    resetCategories();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 400,
        background: "rgba(0,0,0,0.75)",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        padding: "40px 20px", overflowY: "auto",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg)", border: "1px solid var(--border)",
          width: "100%", maxWidth: 540,
          padding: "28px 32px",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.1em" }}>カテゴリ管理</div>
            <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 2 }}>大カテゴリ・小カテゴリを自由に編集できます</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={handleReset} style={{ background: "none", border: "1px solid var(--border)", color: "var(--text-dim)", fontSize: 10, padding: "4px 10px", cursor: "pointer", fontFamily: "var(--font-mono)" }}>
              デフォルトに戻す
            </button>
            <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", fontSize: 18 }}>✕</button>
          </div>
        </div>

        {/* Main categories */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
          {mainCategories.map((main) => (
            <div key={main.id} style={{ border: "1px solid var(--border)", background: "var(--bg2)" }}>
              {/* Main row */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px" }}>
                <button
                  onClick={() => setExpandedMain(expandedMain === main.id ? null : main.id)}
                  style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", fontSize: 12, padding: 0, width: 16, flexShrink: 0 }}
                >
                  {expandedMain === main.id ? "▾" : "▸"}
                </button>

                {editingMain?.id === main.id ? (
                  <input
                    autoFocus
                    value={editingMain.value}
                    onChange={(e) => setEditingMain((p) => ({ ...p, value: e.target.value }))}
                    onBlur={commitMain}
                    onKeyDown={(e) => { if (e.key === "Enter") commitMain(); if (e.key === "Escape") setEditingMain(null); }}
                    style={{ flex: 1, background: "var(--bg3)", border: "1px solid var(--accent)", color: "var(--text)", fontFamily: "var(--font-mono)", fontSize: 12, padding: "3px 8px" }}
                  />
                ) : (
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{main.name}</span>
                )}

                <span style={{ fontSize: 10, color: "var(--text-dim)" }}>{main.subCategories.length}件</span>

                <button
                  onClick={() => setEditingMain({ id: main.id, value: main.name })}
                  title="名前を変更"
                  style={{ background: "none", border: "1px solid var(--border)", color: "var(--text-dim)", fontSize: 10, padding: "2px 8px", cursor: "pointer", fontFamily: "var(--font-mono)" }}
                >
                  編集
                </button>
                <button
                  onClick={() => handleDeleteMain(main.id, main.name)}
                  title="削除"
                  style={{ background: "none", border: "1px solid rgba(224,108,117,0.4)", color: "#e06c75", fontSize: 10, padding: "2px 8px", cursor: "pointer", fontFamily: "var(--font-mono)" }}
                >
                  削除
                </button>
              </div>

              {/* Sub categories */}
              {expandedMain === main.id && (
                <div style={{ borderTop: "1px solid var(--border)", padding: "8px 12px 12px 32px", background: "var(--bg3)" }}>
                  {main.subCategories.map((sub) => (
                    <div key={sub.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "1px solid var(--border)" }}>
                      <span style={{ color: "var(--text-dim)", fontSize: 11, flexShrink: 0 }}>├</span>

                      {editingSub?.subId === sub.id ? (
                        <input
                          autoFocus
                          value={editingSub.value}
                          onChange={(e) => setEditingSub((p) => ({ ...p, value: e.target.value }))}
                          onBlur={commitSub}
                          onKeyDown={(e) => { if (e.key === "Enter") commitSub(); if (e.key === "Escape") setEditingSub(null); }}
                          style={{ flex: 1, background: "var(--bg2)", border: "1px solid var(--accent)", color: "var(--text)", fontFamily: "var(--font-mono)", fontSize: 11, padding: "2px 6px" }}
                        />
                      ) : (
                        <span style={{ flex: 1, fontSize: 12 }}>{sub.name}</span>
                      )}

                      <button
                        onClick={() => setEditingSub({ mainId: main.id, subId: sub.id, value: sub.name })}
                        style={{ background: "none", border: "1px solid var(--border)", color: "var(--text-dim)", fontSize: 9, padding: "1px 6px", cursor: "pointer", fontFamily: "var(--font-mono)" }}
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDeleteSub(main.id, sub.id, sub.name)}
                        style={{ background: "none", border: "1px solid rgba(224,108,117,0.3)", color: "#e06c75", fontSize: 9, padding: "1px 6px", cursor: "pointer", fontFamily: "var(--font-mono)" }}
                      >
                        削除
                      </button>
                    </div>
                  ))}

                  {/* Add sub */}
                  <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                    <input
                      value={newSubVals[main.id] || ""}
                      onChange={(e) => setNewSubVals((p) => ({ ...p, [main.id]: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === "Enter") handleAddSub(main.id); }}
                      placeholder="新しい小カテゴリ名"
                      style={{ flex: 1, background: "var(--bg2)", border: "1px solid var(--border)", color: "var(--text)", fontFamily: "var(--font-mono)", fontSize: 11, padding: "4px 8px" }}
                    />
                    <button
                      onClick={() => handleAddSub(main.id)}
                      style={{ background: "none", border: "1px solid var(--accent)", color: "var(--accent)", fontSize: 11, padding: "4px 12px", cursor: "pointer", fontFamily: "var(--font-mono)" }}
                    >
                      + 追加
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add main category */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
          <div style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.15em", marginBottom: 8 }}>新しい大カテゴリを追加</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={newMainVal}
              onChange={(e) => setNewMainVal(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAddMain(); }}
              placeholder="例: アウトドア"
              style={{ flex: 1, background: "var(--bg2)", border: "1px solid var(--border)", color: "var(--text)", fontFamily: "var(--font-mono)", fontSize: 12, padding: "6px 10px" }}
            />
            <Btn onClick={handleAddMain}>+ 大カテゴリ追加</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
