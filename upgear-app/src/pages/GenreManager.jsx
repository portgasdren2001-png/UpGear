import { useState } from "react";
import { Btn } from "../components/ui";

// ─── GenreManager ─────────────────────────────────────────────────────────────
// ジャンルのCRUD + 並び替えモーダル
// props: genres, onClose, addGenre, renameGenre, deleteGenre, moveGenre, resetGenres

export default function GenreManager({
  genres,
  onClose,
  addGenre,
  renameGenre,
  deleteGenre,
  moveGenre,
  resetGenres,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [newName, setNewName] = useState("");

  const startEdit = (g) => {
    setEditingId(g.id);
    setEditValue(g.name);
  };

  const commitEdit = () => {
    const v = editValue.trim();
    if (v && editingId) renameGenre(editingId, v);
    setEditingId(null);
    setEditValue("");
  };

  const handleAdd = () => {
    const v = newName.trim();
    if (!v) return;
    addGenre(v);
    setNewName("");
  };

  const handleDelete = (g) => {
    if (!confirm(`ジャンル「${g.name}」を削除しますか？\n（商品に設定済みのジャンルは「未分類」になります）`)) return;
    deleteGenre(g.id);
  };

  const handleReset = () => {
    if (!confirm("ジャンルをデフォルトに戻しますか？現在の変更は失われます。")) return;
    resetGenres();
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
          width: "100%", maxWidth: 480,
          padding: "28px 32px",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.1em" }}>ジャンル管理</div>
            <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 2 }}>
              ジャンルを追加・編集・削除・並び替えできます
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={handleReset}
              style={{ background: "none", border: "1px solid var(--border)", color: "var(--text-dim)", fontSize: 10, padding: "4px 10px", cursor: "pointer", fontFamily: "var(--font-mono)" }}
            >
              デフォルトに戻す
            </button>
            <button
              onClick={onClose}
              style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", fontSize: 18 }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Genre list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 24 }}>
          {genres.length === 0 && (
            <div style={{ fontSize: 11, color: "var(--text-dim)", padding: "12px 0", textAlign: "center" }}>
              ジャンルがありません
            </div>
          )}
          {genres.map((g, idx) => (
            <div
              key={g.id}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 12px",
                background: "var(--bg2)", border: "1px solid var(--border)",
              }}
            >
              {/* 並び替えボタン */}
              <div style={{ display: "flex", flexDirection: "column", gap: 2, flexShrink: 0 }}>
                <button
                  onClick={() => moveGenre(g.id, "up")}
                  disabled={idx === 0}
                  style={{
                    background: "none", border: "none",
                    color: idx === 0 ? "var(--border)" : "var(--text-dim)",
                    cursor: idx === 0 ? "default" : "pointer",
                    fontSize: 10, padding: "0 4px", lineHeight: 1,
                  }}
                  title="上に移動"
                >▲</button>
                <button
                  onClick={() => moveGenre(g.id, "down")}
                  disabled={idx === genres.length - 1}
                  style={{
                    background: "none", border: "none",
                    color: idx === genres.length - 1 ? "var(--border)" : "var(--text-dim)",
                    cursor: idx === genres.length - 1 ? "default" : "pointer",
                    fontSize: 10, padding: "0 4px", lineHeight: 1,
                  }}
                  title="下に移動"
                >▼</button>
              </div>

              {/* 名前 / 編集input */}
              {editingId === g.id ? (
                <input
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={commitEdit}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitEdit();
                    if (e.key === "Escape") { setEditingId(null); }
                  }}
                  style={{
                    flex: 1, background: "var(--bg3)", border: "1px solid var(--accent)",
                    color: "var(--text)", fontFamily: "var(--font-mono)", fontSize: 13,
                    padding: "4px 8px",
                  }}
                />
              ) : (
                <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{g.name}</span>
              )}

              {/* 件数ヒント（渡す場合） */}

              {/* 編集・削除 */}
              <button
                onClick={() => startEdit(g)}
                style={{
                  background: "none", border: "1px solid var(--border)",
                  color: "var(--text-dim)", fontSize: 10, padding: "3px 10px",
                  cursor: "pointer", fontFamily: "var(--font-mono)", flexShrink: 0,
                }}
              >
                編集
              </button>
              <button
                onClick={() => handleDelete(g)}
                style={{
                  background: "none", border: "1px solid rgba(224,108,117,0.4)",
                  color: "#e06c75", fontSize: 10, padding: "3px 10px",
                  cursor: "pointer", fontFamily: "var(--font-mono)", flexShrink: 0,
                }}
              >
                削除
              </button>
            </div>
          ))}
        </div>

        {/* 新規追加 */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
          <div style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.15em", marginBottom: 8 }}>
            新しいジャンルを追加
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
              placeholder="例: アウトドア"
              style={{
                flex: 1, background: "var(--bg2)", border: "1px solid var(--border)",
                color: "var(--text)", fontFamily: "var(--font-mono)", fontSize: 12,
                padding: "7px 10px",
              }}
            />
            <Btn onClick={handleAdd}>+ 追加</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
