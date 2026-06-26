import { useState } from "react";
import { PageHeader, Card, CardTitle, Select, Input, Btn, Divider, CopyBtn } from "../components/ui";

const SLIDE_LABELS = ["1枚目", "2枚目", "3枚目", "4枚目", "5枚目", "6枚目"];
const SLIDE_ROLES  = [
  "B型フック（問い・一人称・好奇心ギャップ）",
  "before（身体感覚・共感）",
  "露見シーン（変化の瞬間）",
  "認定理由・商品後出し",
  "向いていない人（理由付き）",
  "結論 ＋ 保存CTA",
];

function buildSlides(item, hook) {
  const s = item?.stock || {};
  const label = item?.label || "〇〇";
  const score = item?.score ?? "--";
  const cat = item?.category || "GEAR";
  const price = item?.price ? `¥${Number(item.price).toLocaleString()}` : "";
  const no = item?.no ? `UpGear ${item.no.padStart(3, "0")}` : "UpGear 〇〇〇";
  const selectedHook = hook || s.hook || "〇〇をまだ選んでいるか　俺は1年前に決断した";

  return [
    {
      role: SLIDE_ROLES[0],
      sub: selectedHook.split(/[\s　]/)[0] || "〇〇を",
      main: selectedHook.split(/[\s　]/)[1] || "まだ選んでいるか",
      note: selectedHook.split(/[\s　]/).slice(2).join("") || "俺は1年前に決断した",
      label: `${no}-B`,
      cat,
    },
    {
      role: SLIDE_ROLES[1],
      sub: "before",
      main: s.situation || "〇〇だった",
      note: "それが当たり前だと思っていた",
      label: `${no}-B`,
      cat,
    },
    {
      role: SLIDE_ROLES[2],
      sub: "露見",
      main: s.reveal || "〇〇で気づいた",
      note: s.change || "俺の中の当たり前が変わっていた",
      label: `${no}-B`,
      cat,
    },
    {
      role: SLIDE_ROLES[3],
      sub: `${label}`,
      main: `${score}点`,
      note: s.good || "認定理由を記入",
      label: `${no}-B`,
      cat,
    },
    {
      role: SLIDE_ROLES[4],
      sub: "向いていない人",
      main: "買う前に確認",
      note: [s.ng1, s.ng2].filter(Boolean).join(" / ") || "向いていない人を記入",
      label: `${no}-B`,
      cat,
    },
    {
      role: SLIDE_ROLES[5],
      sub: s.conclusion || "〇〇の人だけ買え",
      main: "以上",
      note: "保存して次の装備はプロフィールから",
      label: `${no}-B`,
      cat,
    },
  ];
}

function SlideCard({ index, slide, no }) {
  const canvaText = `【スライド ${index + 1}】${slide.role}
─────────────────
[左上ラベル]
テキスト：${slide.label}
X: 80px　Y: 64px
フォントサイズ：22px
色：#555555

[右上カテゴリ]
テキスト：${slide.cat}
X: 920px　Y: 64px
フォントサイズ：22px
色：#555555

[サブ見出し]
テキスト：${slide.sub}
X: 80px　Y: 820px
フォントサイズ：30px
色：#333333

[メイン見出し]
テキスト：${slide.main}
X: 80px　Y: 880px
フォントサイズ：70px
色：#111111
スタイル：太字

[補足テキスト]
テキスト：${slide.note}
X: 80px　Y: 1100px
フォントサイズ：30px
色：#333333
─────────────────`;

  return (
    <div style={{
      background: "var(--bg3)", border: "1px solid var(--border)",
      borderLeft: "3px solid var(--accent)",
    }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span style={{ fontSize: 10, color: "var(--accent)", letterSpacing: "0.15em" }}>{SLIDE_LABELS[index]}</span>
          <span style={{ fontSize: 10, color: "var(--text-dim)", marginLeft: 8 }}>{slide.role}</span>
        </div>
        <CopyBtn text={canvaText} label="Canvaコピー" />
      </div>
      <div style={{ padding: "16px", display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
        {/* ミニプレビュー */}
        <div style={{
          background: "#fff", aspectRatio: "9/16", position: "relative",
          overflow: "hidden", fontSize: 6, color: "#111",
        }}>
          <div style={{ position: "absolute", top: 4, left: 4, fontSize: 5, color: "#555" }}>{slide.label}</div>
          <div style={{ position: "absolute", top: 4, right: 4, fontSize: 5, color: "#555" }}>{slide.cat}</div>
          <div style={{ position: "absolute", bottom: "38%", left: 6, right: 6 }}>
            <div style={{ fontSize: 6, color: "#333", marginBottom: 2 }}>{slide.sub}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#111", lineHeight: 1.2, marginBottom: 4 }}>{slide.main.slice(0, 10)}</div>
            <div style={{ fontSize: 5, color: "#333" }}>{slide.note.slice(0, 30)}</div>
          </div>
          <div style={{ position: "absolute", bottom: 4, right: 4, fontSize: 18, color: "rgba(255,107,0,0.3)", fontWeight: 900 }}>{(index + 1) * 100}</div>
        </div>
        {/* テキスト */}
        <div style={{ fontFamily: "var(--font-mono)", display: "flex", flexDirection: "column", gap: 8 }}>
          <Row label="サブ見出し" val={slide.sub} />
          <Row label="メイン見出し（10字以内）" val={slide.main} accent />
          <Row label="補足テキスト" val={slide.note} />
        </div>
      </div>
    </div>
  );
}

function Row({ label, val, accent }) {
  return (
    <div>
      <div style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.12em", marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 12, color: accent ? "var(--accent)" : "var(--text)", lineHeight: 1.5 }}>{val}</div>
    </div>
  );
}

export default function Script({ data }) {
  const { items } = data;
  const [selectedId, setSelectedId] = useState(items[0]?.id || "");
  const [customHook, setCustomHook] = useState("");

  const item = items.find((i) => i.id === selectedId) || items[0];
  const slides = buildSlides(item, customHook);

  const allCanva = slides.map((s, i) => `【スライド ${i + 1}】${s.role}
─────────────────
[左上ラベル] テキスト：${s.label} / X:80 Y:64 / 22px / #555555
[右上カテゴリ] テキスト：${s.cat} / X:920 Y:64 / 22px / #555555
[サブ見出し] テキスト：${s.sub} / X:80 Y:820 / 30px / #333333
[メイン見出し] テキスト：${s.main} / X:80 Y:880 / 70px 太字 / #111111
[補足テキスト] テキスト：${s.note} / X:80 Y:1100 / 30px / #333333
─────────────────`).join("\n\n");

  const itemOptions = items.map((i) => ({ value: i.id, label: `No.${i.no} ${i.label}` }));

  return (
    <div>
      <PageHeader title="台本生成" sub="集約型6枚スライド台本（Canva座標付き）" />

      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 16, alignItems: "end" }}>
          <Select
            label="アイテム選択"
            value={selectedId}
            onChange={setSelectedId}
            options={itemOptions}
          />
          <Input
            label="フック上書き（空欄=ストックから自動引用）"
            value={customHook}
            onChange={setCustomHook}
            placeholder={item?.stock?.hook || "まだ〇〇しているか　俺は1年前に〜した"}
          />
          <CopyBtn text={allCanva} label="全スライドコピー" />
        </div>
        {item && (
          <div style={{ marginTop: 12, padding: "10px 14px", background: "var(--bg2)", border: "1px solid var(--border)", display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Info label="No." val={item.no} />
            <Info label="カテゴリ" val={item.category} />
            <Info label="スコア" val={`${item.score}点`} accent />
            <Info label="価格" val={item.price ? `¥${Number(item.price).toLocaleString()}` : "-"} />
            <Info label="認定種別" val={item.judgment} />
          </div>
        )}
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {slides.map((s, i) => (
          <SlideCard key={i} index={i} slide={s} no={item?.no} />
        ))}
      </div>
    </div>
  );
}

function Info({ label, val, accent }) {
  return (
    <div>
      <span style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.12em" }}>{label} </span>
      <span style={{ fontSize: 12, color: accent ? "var(--accent)" : "var(--text)" }}>{val}</span>
    </div>
  );
}
