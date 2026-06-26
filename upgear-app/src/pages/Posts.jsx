import { useState } from "react";
import { PageHeader, Card, CardTitle, Tag, Btn, Input, Divider, Grid } from "../components/ui";
import { likeRate, typeOf, exportCSV } from "../utils/calc";

const TYPE_COLOR = { A: "blue", B: "orange", C: "green" };

const BLANK = {
  no: "", product: "", date: "", time: "",
  views: 0, likes: 0, saves: 0, follows: 0,
  slide2_rate: "", final_rate: "",
  hook: "", bgm: "",
};

const FIELDS = [
  { key: "no",          label: "No.",          type: "text",   placeholder: "009-B" },
  { key: "product",     label: "商品名",        type: "text",   placeholder: "アイテム名" },
  { key: "date",        label: "投稿日",        type: "date" },
  { key: "time",        label: "投稿時間",      type: "text",   placeholder: "22:00" },
  { key: "views",       label: "再生数",        type: "number" },
  { key: "likes",       label: "いいね",        type: "number" },
  { key: "saves",       label: "保存",          type: "number" },
  { key: "follows",     label: "フォロー増",    type: "number" },
  { key: "slide2_rate", label: "2枚目維持率(%)", type: "number", placeholder: "55" },
  { key: "final_rate",  label: "最終到達率(%)", type: "number", placeholder: "33" },
  { key: "hook",        label: "フック文",      type: "text",   span: true },
  { key: "bgm",         label: "BGM",           type: "text",   placeholder: "RYDEEN" },
];

export default function Posts({ data, addPost, updatePost, deletePost }) {
  const { posts } = data;
  const [form, setForm] = useState(BLANK);
  const [editing, setEditing] = useState(null); // no of editing post
  const [showForm, setShowForm] = useState(false);
  const [sortKey, setSortKey] = useState("no");
  const [filterType, setFilterType] = useState("ALL");

  const sorted = [...posts]
    .filter((p) => filterType === "ALL" || typeOf(p.no) === filterType)
    .sort((a, b) => {
      if (sortKey === "views") return b.views - a.views;
      if (sortKey === "like_rate") return parseFloat(likeRate(b) || 0) - parseFloat(likeRate(a) || 0);
      return a.no.localeCompare(b.no);
    });

  const openNew = () => {
    setForm(BLANK);
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (p) => {
    setForm({ ...p });
    setEditing(p.no);
    setShowForm(true);
  };

  const save = () => {
    const cleaned = {
      ...form,
      views: Number(form.views) || 0,
      likes: Number(form.likes) || 0,
      saves: Number(form.saves) || 0,
      follows: Number(form.follows) || 0,
      slide2_rate: form.slide2_rate !== "" ? Number(form.slide2_rate) : null,
      final_rate: form.final_rate !== "" ? Number(form.final_rate) : null,
    };
    if (editing) updatePost(editing, cleaned);
    else addPost(cleaned);
    setShowForm(false);
    setEditing(null);
    setForm(BLANK);
  };

  const del = (no) => {
    if (!confirm(`${no} を削除しますか？`)) return;
    deletePost(no);
  };

  return (
    <div>
      <PageHeader title="投稿データ" sub="TikTok投稿の記録・管理" />

      {/* ツールバー */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
        <Btn variant="primary" small onClick={openNew}>+ 新規投稿</Btn>
        <Btn small onClick={() => exportCSV(posts)}>CSV出力</Btn>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {["ALL", "A", "B", "C"].map((t) => (
            <Btn key={t} small
              variant={filterType === t ? "primary" : "default"}
              onClick={() => setFilterType(t)}
            >
              {t === "ALL" ? "全て" : `${t}型`}
            </Btn>
          ))}
          <select
            value={sortKey} onChange={(e) => setSortKey(e.target.value)}
            style={{ background: "var(--bg3)", border: "1px solid var(--border)", color: "var(--text-dim)", fontFamily: "var(--font-mono)", fontSize: 11, padding: "4px 8px" }}
          >
            <option value="no">No.順</option>
            <option value="views">再生数順</option>
            <option value="like_rate">いいね率順</option>
          </select>
        </div>
      </div>

      {/* 入力フォーム */}
      {showForm && (
        <Card style={{ marginBottom: 16, borderColor: "var(--accent)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: "var(--accent)", letterSpacing: "0.15em" }}>
              {editing ? `編集: ${editing}` : "NEW POST"}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn small variant="primary" onClick={save}>保存</Btn>
              <Btn small onClick={() => { setShowForm(false); setEditing(null); }}>キャンセル</Btn>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {FIELDS.map((f) => (
              <div key={f.key} style={{ gridColumn: f.span ? "1 / -1" : undefined }}>
                <Input
                  label={f.label} type={f.type}
                  value={form[f.key]}
                  onChange={(v) => setForm((prev) => ({ ...prev, [f.key]: v }))}
                  placeholder={f.placeholder}
                  small
                />
              </div>
            ))}
          </div>
          {/* 自動計算プレビュー */}
          {form.views > 0 && (
            <div style={{ marginTop: 12, padding: "8px 12px", background: "var(--bg2)", fontSize: 11, color: "var(--text-dim)" }}>
              いいね率（自動）: <span style={{ color: "var(--accent)" }}>{likeRate(form)}%</span>
            </div>
          )}
        </Card>
      )}

      {/* テーブル */}
      <Card>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
          <thead>
            <tr>
              {["No.", "商品", "再生数", "いいね", "いいね率", "保存", "FW増", "2枚目%", "最終%", "フック", ""].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "8px 10px", borderBottom: "1px solid var(--border)", color: "var(--text-dim)", fontWeight: 400, fontSize: 10, letterSpacing: "0.1em", whiteSpace: "nowrap" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => {
              const lr = likeRate(p);
              const t = typeOf(p.no);
              return (
                <tr key={p.no} style={{ borderBottom: "1px solid var(--border)" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = ""}
                >
                  <td style={{ padding: "8px 10px" }}>
                    <Tag color={TYPE_COLOR[t]}>{p.no}</Tag>
                  </td>
                  <td style={{ padding: "8px 10px", color: "var(--text-dim)" }}>{p.product}</td>
                  <td style={{ padding: "8px 10px", fontWeight: p.views >= 3000 ? 700 : 400, color: p.views >= 10000 ? "var(--accent)" : "var(--text)" }}>
                    {p.views?.toLocaleString()}
                  </td>
                  <td style={{ padding: "8px 10px" }}>{p.likes}</td>
                  <td style={{ padding: "8px 10px", color: "var(--accent)" }}>{lr ? `${lr}%` : "-"}</td>
                  <td style={{ padding: "8px 10px" }}>{p.saves || 0}</td>
                  <td style={{ padding: "8px 10px" }}>{p.follows || 0}</td>
                  <td style={{ padding: "8px 10px", color: p.slide2_rate >= 55 ? "var(--accent)" : "var(--text-dim)" }}>
                    {p.slide2_rate != null ? `${p.slide2_rate}%` : "-"}
                  </td>
                  <td style={{ padding: "8px 10px", color: "var(--text-dim)" }}>
                    {p.final_rate != null ? `${p.final_rate}%` : "-"}
                  </td>
                  <td style={{ padding: "8px 10px", maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--text-dim)" }}>
                    {p.hook}
                  </td>
                  <td style={{ padding: "8px 10px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Btn small onClick={() => openEdit(p)}>編集</Btn>
                      <Btn small variant="danger" onClick={() => del(p.no)}>✕</Btn>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={{ padding: "12px 10px", borderTop: "1px solid var(--border)", fontSize: 10, color: "var(--text-dim)", display: "flex", gap: 24 }}>
          <span>表示: {sorted.length} 本</span>
          <span>総再生: {sorted.reduce((a, p) => a + (p.views || 0), 0).toLocaleString()}</span>
          <span>平均いいね率: {(sorted.reduce((a, p) => a + parseFloat(likeRate(p) || 0), 0) / sorted.length).toFixed(2)}%</span>
        </div>
      </Card>
    </div>
  );
}
