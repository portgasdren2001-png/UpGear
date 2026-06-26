import { PageHeader, Card, CardTitle, Tag, Divider } from "../components/ui";
import { likeRate, typeSummary, seriesSummary, typeOf } from "../utils/calc";

const TYPE_COLOR = { A: "blue", B: "orange", C: "green" };
const J_COLOR = { "認定": "orange", "条件付き認定": "blue", "保留": "gray", "非認定": "gray" };

const COPY_RULES = [
  { title: "フック型（1枚目）の設計", items: [
    "読者が誰でも持っている日用品を名指しし、それを使い続ける前提に問いを投げる",
    "サブ見出し＝読者の当たり前の対象を名指し",
    "メイン見出し＝否定でも命令でもなく問いにする",
    "補足＝一人称の過去断言で好奇心ギャップを作る",
    "1枚目に商品名は出さない。問題・対象から入る",
  ]},
  { title: "文体ルール", items: [
    "短文・断言・体言止めを基本にする",
    "旧状態は過去形で書き、今の自分と距離を取る",
    "一人称「俺」を全スライド貫通する",
    "機能説明・スペック羅列をしない。身体感覚・場面のディテールで書く",
  ]},
  { title: "B型（逆張り）設計原則", items: [
    "中盤3段：before（身体感覚）→露見シーン→定義（体験を抽象化）",
    "SD思想は最後に体験から導く。先に説明しない",
    "商品名は5枚目まで完全に伏せる",
    "締め文：次の投稿で続きを話す",
  ]},
  { title: "C型（保存型）設計原則", items: [
    "フック型をそのまま確定フォーミュラとして使う",
    "保存動機ワードを2枚目以内に必ず入れる",
    "チェック・基準・リスト要素を1枚以上",
    "締め文：保存して買う前に確認しろ",
  ]},
];

const INSIGHTS = [
  { label: "006-B成功パターン", text: "B型×一人称×逆張りフック。「普通のマウスをまだ使う理由があるか　俺は1年前に捨てた」で10,700再生。非フォロワー100%配信達成。" },
  { label: "アイテムの当事者の広さ", text: "マウス（全デスクワーカー）>バッグ（通勤者）>イヤホン（外出者）。当事者の広さが再生数の天井を決める。" },
  { label: "004シリーズの失敗", text: "思想説明を1枚目に置いたため2枚目維持率が3%。思想は体験から導く。先に説明しない。" },
  { label: "006-C異常データ", text: "2枚目維持率100%・最終到達率0%。2枚目で全員離脱。スライド2の設計問題として要検証。" },
];

export default function Master({ data }) {
  const { items, posts } = data;
  const typeData = typeSummary(posts);
  const seriesData = seriesSummary(posts);

  return (
    <div>
      <PageHeader title="マスター" sub="UpGear v4.6 — 設計ルール・認定アイテム・データサマリー" />

      {/* 思想 */}
      <Card style={{ marginBottom: 16, borderLeft: "3px solid var(--accent)" }}>
        <CardTitle>UpGear ミッション</CardTitle>
        <div style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.8, fontFamily: "Georgia, serif" }}>
          生活と仕事を、装備で立て直す。<br />
          判断を整理し、線を引き、言葉として残す。
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: "var(--text-dim)", lineHeight: 1.8 }}>
          <span style={{ color: "var(--accent)" }}>SD思想（Silent Delegation）</span>：
          人間の判断能力には構造的な限界がある。判断の重さを静かに代替する設計思想。<br />
          読み終えたとき「迷っていない状態」になっている。それがUpGearの成功。
        </div>
      </Card>

      {/* 認定アイテム */}
      <Card style={{ marginBottom: 16 }}>
        <CardTitle>認定済みアイテム一覧</CardTitle>
        {["認定", "条件付き認定", "保留"].map((j) => {
          const group = items.filter((i) => i.judgment === j);
          if (!group.length) return null;
          return (
            <div key={j} style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.15em", marginBottom: 8 }}>{j.toUpperCase()}</div>
              {group.map((item) => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                  <Tag color={J_COLOR[item.judgment]}>{item.score}点</Tag>
                  <Tag color={item.category === "GEAR" ? "gray" : item.category === "SHOES" ? "blue" : "green"}>{item.category}</Tag>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12 }}>No.{item.no}　{item.label}</div>
                    {item.stock.conclusion && (
                      <div style={{ fontSize: 11, color: "var(--accent)", marginTop: 2 }}>→「{item.stock.conclusion}」</div>
                    )}
                  </div>
                  {item.price && (
                    <div style={{ fontSize: 11, color: "var(--text-dim)" }}>¥{Number(item.price).toLocaleString()}</div>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </Card>

      {/* コピー設計ルール */}
      <Card style={{ marginBottom: 16 }}>
        <CardTitle>コピー設計ルール（006-B・001-C検証で確定）</CardTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {COPY_RULES.map((r) => (
            <div key={r.title}>
              <div style={{ fontSize: 10, color: "var(--accent)", letterSpacing: "0.1em", marginBottom: 8 }}>{r.title}</div>
              {r.items.map((item, i) => (
                <div key={i} style={{ fontSize: 11, color: "var(--text-dim)", padding: "3px 0", display: "flex", gap: 6 }}>
                  <span style={{ color: "var(--border)" }}>—</span>
                  {item}
                </div>
              ))}
            </div>
          ))}
        </div>
      </Card>

      {/* 投稿データサマリー */}
      <Card style={{ marginBottom: 16 }}>
        <CardTitle>投稿データサマリー（{posts.length} 本）</CardTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          {/* タイプ別 */}
          <div>
            <div style={{ fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.1em", marginBottom: 8 }}>タイプ別平均</div>
            {typeData.map((d) => (
              <div key={d.type} style={{ display: "flex", gap: 10, alignItems: "center", padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
                <Tag color={TYPE_COLOR[d.type]}>{d.type}型</Tag>
                <span style={{ fontSize: 11, flex: 1 }}>{d.label.replace(/（.*?）/, "")}</span>
                <span style={{ fontSize: 12, color: "var(--text)", minWidth: 60, textAlign: "right" }}>{d.avgViews?.toLocaleString()} 再生</span>
                <span style={{ fontSize: 11, color: "var(--accent)", minWidth: 50, textAlign: "right" }}>{d.avgLikeRate}%</span>
              </div>
            ))}
          </div>
          {/* シリーズ別 */}
          <div>
            <div style={{ fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.1em", marginBottom: 8 }}>シリーズ別平均再生</div>
            {seriesData.map((d) => (
              <div key={d.series} style={{ display: "flex", gap: 10, alignItems: "center", padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: 11, color: "var(--text-dim)", width: 30 }}>{d.series}</span>
                <div style={{ flex: 1, background: "var(--bg2)", height: 4, borderRadius: 0 }}>
                  <div style={{ width: `${Math.min(100, (d.avgViews / 12000) * 100)}%`, height: "100%", background: d.avgViews >= 3000 ? "var(--accent)" : "var(--border)" }} />
                </div>
                <span style={{ fontSize: 12, color: d.avgViews >= 3000 ? "var(--accent)" : "var(--text)", minWidth: 60, textAlign: "right" }}>
                  {d.avgViews?.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* データからの示唆 */}
        <div style={{ fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.12em", marginBottom: 8 }}>データからの示唆</div>
        {INSIGHTS.map((ins) => (
          <div key={ins.label} style={{ padding: "10px 0", borderBottom: "1px solid var(--border)", display: "flex", gap: 12 }}>
            <span style={{ fontSize: 10, color: "var(--accent)", whiteSpace: "nowrap", letterSpacing: "0.05em" }}>■ {ins.label}</span>
            <span style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.6 }}>{ins.text}</span>
          </div>
        ))}
      </Card>

      {/* 審査基準 */}
      <Card>
        <CardTitle>認定基準（100点満点 / 5項目×20点）</CardTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            ["① 装備性", "毎日・なければ生活が止まる＝20点"],
            ["② 判断削減力", "機能面の判断が3つ以上消える＝20点（色・デザイン以外で評価）"],
            ["③ 継続運用性", "5年以上・廃番なし・同じものを買い直せる＝20点"],
            ["④ ミスマッチ明確性", "向いていない人を4つ以上・理由付きで明言＝20点"],
            ["⑤ 代替不可能性", "同カテゴリで唯一・代替不可能＝20点"],
          ].map(([title, desc]) => (
            <div key={title} style={{ padding: "12px", background: "var(--bg2)", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 11, color: "var(--accent)", marginBottom: 4 }}>{title}</div>
              <div style={{ fontSize: 11, color: "var(--text-dim)" }}>{desc}</div>
            </div>
          ))}
          <div style={{ padding: "12px", background: "rgba(255,107,0,0.05)", border: "1px solid var(--accent)" }}>
            <div style={{ fontSize: 11, color: "var(--text)", marginBottom: 4 }}>判定ライン</div>
            <div style={{ fontSize: 10, color: "var(--text-dim)", lineHeight: 1.8 }}>
              95〜100：殿堂入り ／ 80〜94：認定<br />
              65〜79：条件付き認定 ／ 50〜64：保留<br />
              49以下：非認定 ／ PR・提供品：②から-5点
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
