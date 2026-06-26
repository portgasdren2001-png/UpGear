import { useState } from "react";
import { PageHeader, Card, CardTitle, Tag, Btn, Input, Textarea, Select, Grid, Divider, CopyBtn } from "../components/ui";

const JUDGMENT_OPTIONS = [
  { value: "認定", label: "認定（80〜94点）" },
  { value: "条件付き認定", label: "条件付き認定（65〜79点）" },
  { value: "保留", label: "保留（50〜64点）" },
  { value: "非認定", label: "非認定（49点以下）" },
];

const CATEGORY_OPTIONS = [
  { value: "GEAR", label: "GEAR" },
  { value: "SHOES", label: "SHOES" },
  { value: "WEAR", label: "WEAR" },
];

const JUDGMENT_COLOR = {
  "認定": "orange",
  "条件付き認定": "blue",
  "保留": "gray",
  "非認定": "gray",
};

const STOCK_FIELDS = [
  { key: "situation", label: "買う前の状況・不満", note: "読者全員が共感できる日常の不満。身体感覚・場面のディテールで。", rows: 3 },
  { key: "hook",      label: "フック候補", note: "「まだ〇〇しているか」の型。商品名を出さない。", rows: 2 },
  { key: "reveal",    label: "露見シーンのエピソード", note: "新しい当たり前が古い環境で裏切る瞬間。最も再生に効く。", rows: 3 },
  { key: "change",    label: "変化・気づき", note: "判断が何個消えたか。「迷わなくなった・選ばなくなった」の形で。", rows: 2 },
  { key: "good",      label: "良かった理由・機能", note: "感情表現NG。事実と身体感覚で。「〇〇する判断が消えた」の形で。", rows: 2 },
  { key: "ng1",       label: "向いていない人①", note: "理由付きで明確に。「〇〇な人には向かない。なぜなら〜」", rows: 2 },
  { key: "ng2",       label: "向いていない人②", note: "2つ以上で審査スコアが上がる。", rows: 2 },
  { key: "conclusion",label: "結論", note: "「〇〇の人だけ買え」の形で断言する。", rows: 2 },
];

function generateCopyText(item) {
  const s = item.stock;
  return `【UpGear 体験ストック】
No.${item.no} ${item.label}（${item.category} / ${item.score}点 / ${item.judgment}）

■ 買う前の状況・不満
${s.situation}

■ フック候補
${s.hook}

■ 露見シーンのエピソード
${s.reveal}

■ 変化・気づき
${s.change}

■ 良かった理由・機能
${s.good}

■ 向いていない人①
${s.ng1}

■ 向いていない人②
${s.ng2}

■ 結論
${s.conclusion}`;
}

const BLANK_ITEM = {
  id: "", no: "", label: "", category: "GEAR", score: 80,
  price: "", judgment: "認定",
  stock: { situation: "", hook: "", reveal: "", change: "", good: "", ng1: "", ng2: "", conclusion: "" },
};

export default function Stock({ data, addItem, updateItem, deleteItem, selectedItemId, setSelectedItemId, onNavToStudio }) {
  const { items } = data;
  const initItem = selectedItemId ? (items.find((i) => i.id === selectedItemId) ?? null) : null;
  const [selected, setSelected] = useState(initItem);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(initItem ? JSON.parse(JSON.stringify(initItem)) : BLANK_ITEM);
  const [isNew, setIsNew] = useState(false);

  const open = (item) => {
    setSelected(item);
    setForm(JSON.parse(JSON.stringify(item)));
    setEditing(false);
    setIsNew(false);
    setSelectedItemId?.(item.id);
  };

  const openNew = () => {
    const blank = { ...BLANK_ITEM, id: `item_${Date.now()}`, stock: { ...BLANK_ITEM.stock } };
    setForm(blank);
    setSelected(null);
    setEditing(true);
    setIsNew(true);
  };

  const save = () => {
    if (isNew) addItem(form);
    else updateItem(form.id, form);
    setSelected(form);
    setEditing(false);
    setIsNew(false);
  };

  const del = () => {
    if (!confirm(`「${selected.label}」を削除しますか？`)) return;
    deleteItem(selected.id);
    setSelected(null);
  };

  const setStock = (key, val) =>
    setForm((f) => ({ ...f, stock: { ...f.stock, [key]: val } }));

  return (
    <div>
      <PageHeader title="ストック" sub="体験ストックの入力・管理" />

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 16 }}>
        {/* リスト */}
        <div>
          <div style={{ marginBottom: 12 }}>
            <Btn onClick={openNew} variant="primary" small>+ 新規アイテム</Btn>
          </div>
          {["認定", "条件付き認定", "保留"].map((j) => {
            const group = items.filter((i) => i.judgment === j);
            if (!group.length) return null;
            return (
              <div key={j} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.15em", marginBottom: 6 }}>{j.toUpperCase()}</div>
                {group.map((item) => (
                  <button key={item.id} onClick={() => open(item)} style={{
                    display: "block", width: "100%", textAlign: "left",
                    background: selected?.id === item.id ? "var(--accent-dim)" : "var(--bg3)",
                    border: `1px solid ${selected?.id === item.id ? "var(--accent)" : "var(--border)"}`,
                    borderLeft: `3px solid ${selected?.id === item.id ? "var(--accent)" : "transparent"}`,
                    color: "var(--text)", fontFamily: "var(--font-mono)",
                    padding: "10px 12px", marginBottom: 4, cursor: "pointer",
                  }}>
                    <div style={{ fontSize: 10, color: "var(--text-dim)", marginBottom: 3 }}>
                      No.{item.no} · <Tag color={JUDGMENT_COLOR[item.judgment]}>{item.category}</Tag>
                    </div>
                    <div style={{ fontSize: 12, lineHeight: 1.4 }}>{item.label}</div>
                    <div style={{ fontSize: 10, color: "var(--accent)", marginTop: 3 }}>{item.score}点</div>
                  </button>
                ))}
              </div>
            );
          })}
        </div>

        {/* 詳細 */}
        <div>
          {(!selected && !isNew) && (
            <Card>
              <div style={{ color: "var(--text-dim)", fontSize: 13, padding: "40px 0", textAlign: "center" }}>
                アイテムを選択してください
              </div>
            </Card>
          )}

          {(selected || isNew) && (
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.15em" }}>
                  {isNew ? "NEW ITEM" : `No.${form.no} · ${form.category}`}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {!editing && onNavToStudio && (
                    <Btn small variant="primary" onClick={() => onNavToStudio((selected || form).id)}>▣ 制作スタジオへ</Btn>
                  )}
                  {!editing && <CopyBtn text={generateCopyText(selected || form)} label="Claude用コピー" />}
                  {!editing && <Btn small onClick={() => setEditing(true)}>編集</Btn>}
                  {!editing && selected && <Btn small variant="danger" onClick={del}>削除</Btn>}
                  {editing && <Btn small variant="primary" onClick={save}>保存</Btn>}
                  {editing && !isNew && <Btn small onClick={() => { setForm(JSON.parse(JSON.stringify(selected))); setEditing(false); }}>キャンセル</Btn>}
                </div>
              </div>

              {/* 基本情報 */}
              <Grid cols={3} gap={12} style={{ marginBottom: 20 }}>
                <Input label="No." value={form.no} onChange={(v) => setForm((f) => ({ ...f, no: v }))} disabled={!editing} />
                <Select label="カテゴリ" value={form.category} onChange={(v) => setForm((f) => ({ ...f, category: v }))} options={CATEGORY_OPTIONS} disabled={!editing} />
                <Input label="スコア" type="number" value={form.score} onChange={(v) => setForm((f) => ({ ...f, score: v }))} disabled={!editing} />
              </Grid>
              <div style={{ marginBottom: 12 }}>
                <Input label="アイテム名" value={form.label} onChange={(v) => setForm((f) => ({ ...f, label: v }))} disabled={!editing} />
              </div>
              <Grid cols={2} gap={12} style={{ marginBottom: 20 }}>
                <Input label="価格（円）" value={form.price} onChange={(v) => setForm((f) => ({ ...f, price: v }))} disabled={!editing} />
                <Select label="認定種別" value={form.judgment} onChange={(v) => setForm((f) => ({ ...f, judgment: v }))} options={JUDGMENT_OPTIONS} disabled={!editing} />
              </Grid>

              <Divider />

              {/* 体験ストック */}
              <CardTitle>体験ストック（集約型009〜）</CardTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {STOCK_FIELDS.map((f) => (
                  <Textarea
                    key={f.key}
                    label={f.label}
                    rows={f.rows}
                    value={form.stock[f.key]}
                    onChange={(v) => setStock(f.key, v)}
                    note={f.note}
                    disabled={!editing}
                    placeholder={editing ? f.note : "（未入力）"}
                  />
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
