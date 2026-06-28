import { useState } from "react";
import { PageHeader, Card, CardTitle, Tag, Btn } from "../components/ui";
import { likeRate, typeSummary, seriesSummary } from "../utils/calc";
import { generateMasterVersion, diffMasterVersions } from "../data/masterAI";

const TYPE_COLOR = { A: "blue", B: "orange", C: "green" };
const J_COLOR = { "認定": "orange", "条件付き認定": "blue", "保留": "gray", "非認定": "gray" };

const DIFF_COLORS = { add: "#98c379", remove: "#e06c75", up: "#98c379", down: "#e06c75", change: "var(--accent)", none: "var(--text-dim)" };

function DiffBadge({ type, label, value }) {
  const icon = { add: "＋", remove: "－", up: "↑", down: "↓", change: "⇄", none: "＝" }[type] || "•";
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
      <span style={{ color: DIFF_COLORS[type], fontSize: 12, width: 16, flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: 11, color: "var(--text-dim)", width: 100, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 11, color: DIFF_COLORS[type] }}>{value}</span>
    </div>
  );
}

function VersionCard({ version, isLatest, onSelect, selected }) {
  const d = new Date(version.ts);
  const dateStr = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return (
    <button onClick={onSelect} style={{
      width: "100%", background: selected ? "var(--accent-dim)" : "var(--bg2)",
      border: `1px solid ${selected ? "var(--accent)" : "var(--border)"}`,
      padding: "10px 14px", cursor: "pointer", textAlign: "left",
      fontFamily: "var(--font-mono)", marginBottom: 6,
      display: "flex", alignItems: "center", gap: 10,
    }}>
      <span style={{ fontSize: 12, color: selected ? "var(--accent)" : "var(--text)", fontWeight: 700, flex: 1 }}>
        {version.version}
        {isLatest && <span style={{ marginLeft: 8, fontSize: 9, color: "var(--accent)", background: "var(--accent-dim)", padding: "1px 5px" }}>LATEST</span>}
      </span>
      <span style={{ fontSize: 10, color: "var(--text-dim)" }}>{dateStr}</span>
      <span style={{ fontSize: 10, color: "var(--text-dim)" }}>{version.summary.totalPosts}本 / 認定{version.summary.certifiedItems}件</span>
    </button>
  );
}

function formatMasterAsText(version, data) {
  const d = new Date(version.ts);
  const dateStr = d.toLocaleString("ja-JP");
  const W = 70;
  const sep  = "═".repeat(W);
  const sep2 = "─".repeat(W);
  const L = (text = "") => text;
  const H = (title) => [``, sep, `  ${title}`, sep, ``];
  const H2 = (title) => [``, sep2, `  ${title}`, sep2, ``];
  const items = data?.items || [];
  const posts = data?.posts || [];

  const lines = [
    sep,
    `  UpGear 引き継ぎ書`,
    `  バージョン: ${version.version}　生成日時: ${dateStr}`,
    sep,
    ``,

    // ── SECTION 1: MISSION ──────────────────────────────────────────────
    ...H("1. UpGear ミッション & 哲学"),
    `  生活と仕事を、装備で立て直す。`,
    `  判断を整理し、線を引き、言葉として残す。`,
    ``,
    `  SD思想（Silent Delegation）`,
    `  　人間の判断能力には構造的な限界がある。`,
    `  　道具・習慣・環境に判断の重さを委任（delegate）することで`,
    `  　認知負荷を削減し、本質的な思考に集中できる状態を作る。`,
    ``,
    `  UpGearの定義する「装備」とは`,
    `  　毎日使うもの / なければ生活・仕事が止まるもの`,
    `  　一度選べば判断コストがゼロになるもの`,
    `  　他人に勧められるほど確信を持てるもの`,
    ``,

    // ── SECTION 2: SCORING CRITERIA ─────────────────────────────────────
    ...H("2. UpGear認定基準（100点満点）"),
    `  ① 装備性           20点  毎日・なければ止まる`,
    `  ② 判断削減力       20点  3つ以上の判断が消える`,
    `  ③ 継続運用性       20点  5年以上・廃番なし・再購入可`,
    `  ④ ミスマッチ明確性 20点  向いていない人を4つ以上・理由つき`,
    `  ⑤ 代替不可能性     20点  同カテゴリで唯一`,
    ``,
    `  判定ライン`,
    `  　95〜100: 殿堂入り  80〜94: 認定`,
    `  　65〜79: 条件付き認定  50〜64: 保留  49以下: 非認定`,
    `  　PR・提供品: ②から -5点`,
    ``,

    // ── SECTION 3: PERFORMANCE ──────────────────────────────────────────
    ...H(`3. パフォーマンスサマリー — ${version.version}`),
    `  総投稿数:     ${version.summary.totalPosts}本`,
    `  総再生数:     ${(version.summary.totalViews || 0).toLocaleString()}`,
    `  平均再生数:   ${version.summary.avgViews.toLocaleString()}`,
    `  平均いいね率: ${version.summary.avgLikeRate}%`,
    `  フォロワー:   ${version.summary.followers}`,
    `  認定:         ${version.summary.certifiedItems}件`,
    `  条件付き認定: ${version.summary.conditionalItems || 0}件`,
    `  ストック:     ${version.summary.totalItems}件`,
    ``,

    // Top post
    ...(version.topPost ? [
      ...H2("3a. 最高再生投稿"),
      `  No.${version.topPost.no}`,
      `  フック: 「${version.topPost.hook || "—"}」`,
      `  再生数: ${(version.topPost.views || 0).toLocaleString()}`,
      ``,
    ] : []),

    // ── SECTION 4: CONTENT RULES ────────────────────────────────────────
    ...H("4. コピー設計ルール（AI自動更新）"),
    ...(version.rules || []).flatMap((r) => [
      `  ■ ${r.title}`,
      ...(r.items || []).map((item) => `    ・${item}`),
      ``,
    ]),

    // ── SECTION 5: AI INSIGHTS ──────────────────────────────────────────
    ...H("5. データからの示唆"),
    ...(version.insights || []).flatMap((ins) => [
      `  ■ ${ins.label}`,
      `    ${ins.text}`,
      ``,
    ]),

    // ── SECTION 6: PRODUCT DATABASE ─────────────────────────────────────
    ...H("6. 商品データベース"),
    ...H2("6a. 認定アイテム"),
    ...(version.certified?.length
      ? version.certified.map((item) =>
          `  No.${String(item.no).padEnd(4)} [${String(item.score).padStart(3)}点] ${item.category?.padEnd(5) || "     "} ${item.label}${item.price ? `  ¥${Number(item.price).toLocaleString()}` : ""}`)
      : ["  なし"]),
    ``,

    ...H2("6b. 条件付き認定"),
    ...(version.conditional?.length
      ? version.conditional.map((item) =>
          `  No.${String(item.no).padEnd(4)} [${String(item.score).padStart(3)}点] ${item.category?.padEnd(5) || "     "} ${item.label}`)
      : ["  なし"]),
    ``,

    // Full stock with understanding scores
    ...H2("6c. ストック全件（商品理解スコアつき）"),
    ...(items.length
      ? items.map((item) =>
          `  No.${String(item.no).padEnd(4)} [UpGear:${String(item.score).padStart(3)}点 理解:${String(item.card?.understandingScore ?? "—").padStart(3)}点] ${item.judgment?.padEnd(8) || "        "} ${item.label}`)
      : ["  なし"]),
    ``,

    // ── SECTION 7: PRODUCT CARDS ────────────────────────────────────────
    ...H("7. 商品カルテ（詳細）"),
    ...items.filter(i => i.card).flatMap((item) => {
      const c = item.card;
      return [
        sep2,
        `  ${item.label}  [No.${item.no} / ${item.judgment} / ${item.score}点]`,
        sep2,
        `  カテゴリ:     ${c.category || "—"} > ${c.subCategory || "—"}`,
        `  ブランド:     ${c.brand || "—"}`,
        `  商品タイプ:   ${c.productType || "—"}`,
        `  理解スコア:   ${c.understandingScore ?? "—"}点`,
        `  カテゴリ信頼度: ${c.categoryConfidence ?? "—"}%`,
        `  判定根拠:     ${c.categorySource || "—"}`,
        ``,
        `  [商品理解]`,
        `  これは何か:   ${c.whatIsThis || "—"}`,
        `  解決すること: ${c.whatItSolves || "—"}`,
        `  向いている人: ${c.forWho || "—"}`,
        ...(c.notForWho?.length ? [`  向いていない: ${c.notForWho.join(" / ")}`] : []),
        ...(c.strengths?.length  ? [`  強み:         ${c.strengths.slice(0,3).join("、")}`] : []),
        ...(c.weaknesses?.length ? [`  弱み:         ${c.weaknesses.slice(0,2).join("、")}`] : []),
        ...(c.reviewData?.avg    ? [`  レビュー:     ★${c.reviewData.avg} / ${(c.reviewData.count || 0).toLocaleString()}件`] : []),
        ...(c.searchKeywords?.length ? [`  キーワード:   ${c.searchKeywords.slice(0,6).join("、")}`] : []),
        ``,
      ];
    }),

    // ── SECTION 8: POST HISTORY ─────────────────────────────────────────
    ...H("8. 投稿データ"),
    ...(posts.length
      ? posts.slice(0, 30).map((p) =>
          `  No.${String(p.no).padEnd(4)} ${String(p.views || 0).padStart(6)}再生 いいね率${p.likeRate || "—"}% [${p.type || "—"}型] 「${(p.hook || "").slice(0, 30)}」`)
      : ["  なし"]),
    ``,

    // ── SECTION 9: WORKFLOW ─────────────────────────────────────────────
    ...H("9. ワークフロー"),
    `  UpGear操作フロー（v6.1 — Playwright + Claude API）`,
    ``,
    `  ① URL入力`,
    `     商品のURL（Amazon / 楽天 / 価格.com / 公式など）を入力`,
    ``,
    `  ② Playwright解析`,
    `     ページを実際に開き、JSON-LD・schema.org・パンくず・`,
    `     レビュー・画像を構造化データとして取得`,
    ``,
    `  ③ Vision解析`,
    `     取得した商品画像をClaudeのVision APIで解析`,
    `     → 商品種類・用途・デザイン・ターゲットを推定`,
    ``,
    `  ④ AI商品理解（Claude）`,
    `     構造化データのみを使って商品を理解`,
    `     カテゴリ判定は優先順位チェーンで決定（AI推論は最後）`,
    `     信頼度95%以上で自動確定、未満はユーザー確認`,
    ``,
    `  ⑤ 商品カルテ確認・保存`,
    `     生成されたカルテを確認・修正してストックに保存`,
    ``,
    `  ⑥ 市場調査`,
    `     商品カルテのキーワード・カテゴリを使って市場調査`,
    `     ※商品名での検索は使用しない`,
    ``,
    `  ⑦ 制作スタジオ`,
    `     フック生成・投稿企画・スクリプト作成`,
    ``,
    `  ⑧ マスター更新`,
    `     全投稿・全アイテムの知識ベースを自動更新`,
    `     → この引き継ぎ書をテキストファイルとして出力`,
    ``,

    // ── SECTION 10: TECHNICAL ───────────────────────────────────────────
    ...H("10. 技術構成"),
    `  Frontend: React 19 + Vite + localStorage`,
    `  Backend:  Express + Playwright + Claude API (Haiku)`,
    `  Scraping: Playwright (Chromium) — JSON-LD / schema.org / OG`,
    `  Vision:   Claude Vision API`,
    `  AI:       claude-haiku-4-5-20251001`,
    ``,
    `  カテゴリ判定優先順位`,
    `  ① schema.org Product.category`,
    `  ② JSON-LD`,
    `  ③ パンくず`,
    `  ④ Amazonカテゴリ`,
    `  ⑤ 楽天カテゴリ`,
    `  ⑥ 価格.com`,
    `  ⑦ h1タイトル`,
    `  ⑧ titleタグ`,
    `  ⑨ meta description`,
    `  ⑩ 商品説明`,
    `  ⑪ レビュー`,
    `  ⑫ Vision解析`,
    `  ⑬ AI推論（最終手段）`,
    ``,

    sep,
    `  Generated by UpGear v6.1 — ${dateStr}`,
    sep,
  ];

  return lines.join("\n");
}

function downloadTextFile(text, filename) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function Master({ data, learningData, masterStore, addMasterVersion, latestMasterVersion }) {
  const { items, posts } = data;
  const [generating, setGenerating] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [showDiff, setShowDiff] = useState(false);

  const versions = masterStore?.versions || [];
  const latest = latestMasterVersion;
  const prev = versions.length >= 2 ? versions[versions.length - 2] : null;

  const displayed = selectedIdx !== null ? versions[selectedIdx] : latest;
  const diffData = prev && latest ? diffMasterVersions(prev, latest) : [];

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      const newVer = generateMasterVersion(data, learningData, latest?.version);
      addMasterVersion(newVer);
      setSelectedIdx(null);
      setShowDiff(true);
      setGenerating(false);
      const text = formatMasterAsText(newVer, { items: data.items || [], posts: data.posts || [] });
      const d = new Date(newVer.ts);
      const dateTag = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`;
      downloadTextFile(text, `upgear-master-${newVer.version}-${dateTag}.txt`);
    }, 800);
  };

  const typeData = typeSummary(posts);
  const seriesData = seriesSummary(posts);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <PageHeader
          title="マスター"
          sub={latest ? `${latest.version} — AI知識ベース自動更新 / ${new Date(latest.ts).toLocaleDateString("ja-JP")}` : "UpGear v5.0 — AI知識ベース"}
        />
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          {versions.length >= 2 && (
            <Btn small onClick={() => setShowDiff((v) => !v)} style={{ borderColor: showDiff ? "var(--accent)" : undefined }}>
              差分表示 {prev?.version}→{latest?.version}
            </Btn>
          )}
          <Btn onClick={handleGenerate} disabled={generating}>
            {generating ? "生成中..." : "最新マスターを生成"}
          </Btn>
        </div>
      </div>

      {/* 差分表示 */}
      {showDiff && diffData.length > 0 && (
        <Card style={{ marginBottom: 16, borderLeft: "3px solid var(--accent)" }}>
          <CardTitle>{prev?.version} → {latest?.version} 差分</CardTitle>
          {diffData.map((d, i) => <DiffBadge key={i} {...d} />)}
        </Card>
      )}

      {/* バージョン履歴 */}
      {versions.length > 0 && (
        <Card style={{ marginBottom: 16 }}>
          <CardTitle>バージョン履歴（{versions.length}件）</CardTitle>
          <div>
            {[...versions].reverse().map((v, i) => {
              const origIdx = versions.length - 1 - i;
              return (
                <VersionCard
                  key={v.version}
                  version={v}
                  isLatest={origIdx === versions.length - 1}
                  selected={selectedIdx === origIdx}
                  onSelect={() => setSelectedIdx(selectedIdx === origIdx ? null : origIdx)}
                />
              );
            })}
          </div>
        </Card>
      )}

      {/* ミッション（常に表示） */}
      <Card style={{ marginBottom: 16, borderLeft: "3px solid var(--accent)" }}>
        <CardTitle>UpGear ミッション</CardTitle>
        <div style={{ fontSize: 16, color: "var(--text)", lineHeight: 1.8, fontFamily: "Georgia, serif" }}>
          生活と仕事を、装備で立て直す。<br />
          判断を整理し、線を引き、言葉として残す。
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: "var(--text-dim)", lineHeight: 1.8 }}>
          <span style={{ color: "var(--accent)" }}>SD思想（Silent Delegation）</span>：
          人間の判断能力には構造的な限界がある。判断の重さを静かに代替する設計思想。
        </div>
      </Card>

      {displayed ? (
        <>
          {/* AI生成サマリー */}
          <Card style={{ marginBottom: 16 }}>
            <CardTitle>パフォーマンスサマリー — {displayed.version}</CardTitle>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 16 }}>
              {[
                ["総投稿数", `${displayed.summary.totalPosts}本`],
                ["平均再生数", `${displayed.summary.avgViews.toLocaleString()}`],
                ["平均いいね率", `${displayed.summary.avgLikeRate}%`],
                ["フォロワー", `${displayed.summary.followers}`],
                ["認定", `${displayed.summary.certifiedItems}件`],
                ["ストック", `${displayed.summary.totalItems}件`],
              ].map(([label, val]) => (
                <div key={label} style={{ background: "var(--bg2)", border: "1px solid var(--border)", padding: "12px 14px" }}>
                  <div style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.15em", marginBottom: 6 }}>{label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{val}</div>
                </div>
              ))}
            </div>

            {displayed.topPost && (
              <div style={{ background: "rgba(255,107,0,0.06)", border: "1px solid var(--accent)", padding: "10px 14px" }}>
                <span style={{ fontSize: 10, color: "var(--accent)", letterSpacing: "0.1em" }}>最高再生 — No.{displayed.topPost.no}</span>
                <div style={{ fontSize: 12, marginTop: 4 }}>「{displayed.topPost.hook?.slice(0, 40)}」</div>
                <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>{displayed.topPost.views?.toLocaleString()} 再生</div>
              </div>
            )}
          </Card>

          {/* AI生成ルール */}
          {displayed.rules?.length > 0 && (
            <Card style={{ marginBottom: 16 }}>
              <CardTitle>コピー設計ルール（AI自動更新）</CardTitle>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
                {displayed.rules.map((r) => (
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
          )}

          {/* AI示唆 */}
          {displayed.insights?.length > 0 && (
            <Card style={{ marginBottom: 16 }}>
              <CardTitle>データからの示唆（AI分析）</CardTitle>
              {displayed.insights.map((ins) => (
                <div key={ins.label} style={{ padding: "10px 0", borderBottom: "1px solid var(--border)", display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 10, color: "var(--accent)", whiteSpace: "nowrap", letterSpacing: "0.05em" }}>■ {ins.label}</span>
                  <span style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.6 }}>{ins.text}</span>
                </div>
              ))}
            </Card>
          )}

          {/* 認定アイテム */}
          {(displayed.certified?.length > 0 || displayed.conditional?.length > 0) && (
            <Card style={{ marginBottom: 16 }}>
              <CardTitle>認定済みアイテム — {displayed.version}</CardTitle>
              {["認定", "条件付き認定"].map((j) => {
                const group = j === "認定" ? displayed.certified : displayed.conditional;
                if (!group?.length) return null;
                return (
                  <div key={j} style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.15em", marginBottom: 8 }}>{j.toUpperCase()}</div>
                    {group.map((item) => (
                      <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)", flexWrap: "wrap" }}>
                        <Tag color={J_COLOR[j]}>{item.score}点</Tag>
                        <Tag color={item.category === "GEAR" ? "gray" : item.category === "SHOES" ? "blue" : "green"}>{item.category}</Tag>
                        <div style={{ flex: 1, minWidth: 120 }}>
                          <div style={{ fontSize: 12 }}>No.{item.no}　{item.label}</div>
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
          )}
        </>
      ) : (
        /* まだ一度も生成していない場合は現在のデータから静的表示 */
        <>
          <Card style={{ marginBottom: 16 }}>
            <CardTitle>認定済みアイテム一覧（現在のストックから）</CardTitle>
            {["認定", "条件付き認定", "保留"].map((j) => {
              const group = items.filter((i) => i.judgment === j);
              if (!group.length) return null;
              return (
                <div key={j} style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.15em", marginBottom: 8 }}>{j.toUpperCase()}</div>
                  {group.map((item) => (
                    <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)", flexWrap: "wrap" }}>
                      <Tag color={J_COLOR[item.judgment]}>{item.score}点</Tag>
                      <Tag color={item.category === "GEAR" ? "gray" : item.category === "SHOES" ? "blue" : "green"}>{item.category}</Tag>
                      <div style={{ flex: 1, minWidth: 120 }}>
                        <div style={{ fontSize: 12 }}>No.{item.no}　{item.label}</div>
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
        </>
      )}

      {/* 投稿サマリー（常に表示） */}
      {posts.length > 0 && (
        <Card style={{ marginBottom: 16 }}>
          <CardTitle>投稿データサマリー（{posts.length} 本）</CardTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.1em", marginBottom: 8 }}>タイプ別平均</div>
              {typeData.map((d) => (
                <div key={d.type} style={{ display: "flex", gap: 10, alignItems: "center", padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
                  <Tag color={TYPE_COLOR[d.type]}>{d.type}型</Tag>
                  <span style={{ fontSize: 11, flex: 1 }}>{d.label.replace(/（.*?）/, "")}</span>
                  <span style={{ fontSize: 12, minWidth: 60, textAlign: "right" }}>{d.avgViews?.toLocaleString()} 再生</span>
                  <span style={{ fontSize: 11, color: "var(--accent)", minWidth: 50, textAlign: "right" }}>{d.avgLikeRate}%</span>
                </div>
              ))}
            </div>
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
        </Card>
      )}

      {/* 審査基準（常に表示） */}
      <Card>
        <CardTitle>認定基準（100点満点 / 5項目×20点）</CardTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          {[
            ["① 装備性", "毎日・なければ生活が止まる＝20点"],
            ["② 判断削減力", "機能面の判断が3つ以上消える＝20点"],
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
