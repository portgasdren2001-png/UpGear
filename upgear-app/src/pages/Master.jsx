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
  const H = (title) => [``, sep, `  ${title}`, sep, ``];
  const H2 = (title) => [``, sep2, `  ${title}`, sep2, ``];
  const items = data?.items || [];
  const posts = data?.posts || [];

  const lines = [
    sep,
    `  UpGear 引き継ぎ書 v5.5`,
    `  バージョン: ${version.version}　生成日時: ${dateStr}`,
    sep,
    ``,

    // ── 1. ミッション & 哲学 ────────────────────────────────────────────
    ...H("1. UpGear ミッション & 哲学"),
    `  生活と仕事を、装備で立て直す。`,
    `  判断を整理し、線を引き、言葉として残す。`,
    ``,
    `  UpGearの定義する「装備」とは`,
    `  　毎日使うもの / なければ生活・仕事が止まるもの`,
    `  　一度選べば判断コストがゼロになるもの`,
    `  　他人に勧められるほど確信を持てるもの`,
    ``,

    // ── 2. 役割定義 ────────────────────────────────────────────────────
    ...H("2. 役割定義"),
    `  UpGearは30〜40代デスクワーカーのための装備メディア。`,
    `  AIはUpGearの「編集長兼戦略パートナー」として振る舞う。`,
    ``,
    `  商品紹介ではなく、判断を整理し、装備として残すためのメディアである。`,
    `  読者が「UpGearを見なくてもUpGear的に判断できる」状態が成功の定義。`,
    ``,

    // ── 3. ターゲット ──────────────────────────────────────────────────
    ...H("3. ターゲット"),
    `  ・30〜40代`,
    `  ・デスクワーカー`,
    `  ・忙しくて疲れている`,
    `  ・選択肢が多すぎて「ちゃんと選びたいのに選べない」`,
    `  ・合理的・機能的を最優先する`,
    `  ・一度決めたら同じものを使い続けたい`,
    ``,

    // ── 4. 発信者キャラ ────────────────────────────────────────────────
    ...H("4. 発信者キャラ（v2.9）"),
    `  作られたキャラではなく実像に基づく。`,
    ``,
    `  素の価値観`,
    `  ・オシャレ好き。見た目と機能を両立したい。`,
    `  ・納得するまで比較してから買う。比較のプロセス自体を楽しむ。`,
    `  ・持ち物が自分の価値観を表すと思っている。`,
    `  ・だから妥協しない。仕事でも私服でも。`,
    ``,
    `  キャラの出し方`,
    `  ・一人称「俺」で語る（俺が選んだ・俺が使っている）`,
    `  ・体験談として話す（実際に使った・仕事で履いている）`,
    `  ・比較したプロセスをコンテンツにする`,
    `  ・「この人が納得して選んだなら信頼できる」を目指す`,
    ``,
    `  プロフィール文`,
    `  「日常を、装備せよ。比較オタクが納得したモノだけ紹介。」`,
    ``,
    `  注意`,
    `  ・「判断を減らす」はUpGear設計思想として機能させる。発信者キャラには使わない。`,
    `  ・「俺が決めた」「一択」の断言は、比較・納得のプロセスを経た上での言葉として使う。`,
    ``,

    // ── 5. 思想的背景（内部設計情報・読者には見せない） ──────────────
    ...H("5. 思想的背景【内部設計情報 — 読者には出さない】"),
    `  以下は設計者だけが知る文脈。コンテンツ構造・言語選択の根拠として機能する。`,
    `  読者には見せない。思想はコンテンツの構造と言葉選びにだけ反映させる。`,
    ``,
    `  ① ハーバート・A・サイモン「限定合理性」`,
    `     人間の判断能力は構造的に有限だ。`,
    `     情報・時間・認知能力に限界がある。選択肢が増えるほど判断の質は下がる。`,
    `     これはあなたの能力の問題ではなく人間という構造の問題だ。`,
    `     → UpGearはこの限界を前提に設計されている`,
    `     ※ サイモンの名前・理論名は読者に出さない。「なぜか」だけを伝える。`,
    ``,
    `  ② その他の思想的背景`,
    `     ・Dieter Rams：機能以外を削ぎ落とす設計`,
    `     ・無印良品：余白と引き算の美学`,
    ``,
    `  SD思想（Silent Delegation）【内部設計情報 — 読者には直接見せない】`,
    `  　定義：人間の判断能力には構造的な限界がある。`,
    `  　　　　判断の重さを静かに代替する設計思想。`,
    ``,
    `  　原則`,
    `  　・教えない。正解を言わない。急かさない。`,
    `  　・読み終えたとき「迷っていない状態」になっている`,
    `  　・判断を奪うのではなく、一時的に預かる`,
    `  　・認知資源の消費を代替し、本来使うべき場所に還元する`,
    ``,
    `  　実装ルール`,
    `  　・断定的に書くが、押しつけない`,
    `  　・向いていない人を先に書く`,
    `  　・結論を冒頭に置く。説明は最小限`,
    `  　・行動を急かすCTAは使わない`,
    ``,
    `  思想の接続`,
    `  　限定合理性 → 問題の提示`,
    `  　SD思想　　 → 解決の設計`,
    `  　UpGear　　 → 実装の場所`,
    ``,

    // ── 6. 認定基準 ────────────────────────────────────────────────────
    ...H("6. UpGear認定基準（100点満点 / 各項目20点・5段階評価）"),
    `  ① 装備性`,
    `     20点：毎日・なければ生活が止まる`,
    `     15点：週3〜4回・代替があるがこれが最善`,
    `     10点：週1〜2回・代替品がある`,
    `      5点：月数回・気分で使う`,
    `      0点：ほぼ使わない`,
    ``,
    `  ② 判断削減力（色・デザイン以外で評価）`,
    `     20点：機能面の判断が3つ以上消える`,
    `     15点：2つ消える`,
    `     10点：1つ消える`,
    `      5点：少し楽になるが消えない`,
    `      0点：消えない・増える`,
    ``,
    `  ③ 継続運用性`,
    `     20点：5年以上・廃番なし・同じものを買い直せる`,
    `     15点：3〜4年・廃番リスク低`,
    `     10点：2〜3年・乗り換え可能性あり`,
    `      5点：1〜2年・トレンド依存`,
    `      0点：半年以内に飽きる設計`,
    ``,
    `  ④ ミスマッチ明確性`,
    `     20点：向いていない人を4つ以上・理由付きで明言`,
    `     15点：3つ明言`,
    `     10点：2つ明言`,
    `      5点：1つしか言えない`,
    `      0点：誰にでも合うとしか言えない`,
    ``,
    `  ⑤ 代替不可能性`,
    `     20点：同カテゴリで唯一・代替不可能`,
    `     15点：競合はあるが明確な優位性がある`,
    `     10点：競合と同等・優位性が限定的`,
    `      5点：より良い代替品がある`,
    `      0点：完全に代替可能`,
    ``,
    `  ルール`,
    `  　PR・提供品は②から5点自動減算`,
    ``,
    `  判定ライン`,
    `  　95〜100: 殿堂入り（極めて稀・現時点で0品）`,
    `  　80〜 94: 認定`,
    `  　65〜 79: 条件付き認定（誰向けかを1行で必ず明示）`,
    `  　50〜 64: 保留`,
    `  　49以下:  非認定`,
    `  　フィルター不通過: 審査対象外`,
    ``,

    // ── 7. 審査入口フィルター ─────────────────────────────────────────
    ...H("7. 審査入口フィルター"),
    `  以下を満たさない場合、審査対象外とする。`,
    ``,
    `  フットウェアの場合`,
    `  ・カラーがブラック・グレー・ホワイト系であること`,
    `  ・定番ラインとして継続販売されていること`,
    ``,
    `  ガジェット・その他の場合`,
    `  ・定番品として継続販売されていること`,
    `  ・デザインがトレンドに依存していないこと`,
    ``,

    // ── 8. 商品データベース ────────────────────────────────────────────
    ...H("8. 商品データベース"),
    ...H2("8a. 認定アイテム"),
    ...(version.certified?.length
      ? version.certified.map((item) =>
          `  No.${String(item.no).padEnd(4)} [${String(item.score).padStart(3)}点] ${item.category?.padEnd(5) || "     "} ${item.label}${item.price ? `  ¥${Number(item.price).toLocaleString()}` : ""}`)
      : ["  なし"]),
    ``,
    ...H2("8b. 条件付き認定"),
    ...(version.conditional?.length
      ? version.conditional.map((item) =>
          `  No.${String(item.no).padEnd(4)} [${String(item.score).padStart(3)}点] ${item.category?.padEnd(5) || "     "} ${item.label}`)
      : ["  なし"]),
    ``,
    ...H2("8c. ストック全件（商品理解スコアつき）"),
    ...(items.length
      ? items.map((item) =>
          `  No.${String(item.no).padEnd(4)} [UpGear:${String(item.score).padStart(3)}点 理解:${String(item.card?.understandingScore ?? "—").padStart(3)}点] ${item.judgment?.padEnd(8) || "        "} ${item.label}`)
      : ["  なし"]),
    ``,

    // ── 9. 商品カルテ ──────────────────────────────────────────────────
    ...H("9. 商品カルテ（詳細）"),
    ...items.filter(i => i.card).flatMap((item) => {
      const c = item.card;
      return [
        sep2,
        `  ${item.label}  [No.${item.no} / ${item.judgment} / ${item.score}点]`,
        sep2,
        `  カテゴリ:       ${c.category || "—"} > ${c.subCategory || "—"}`,
        `  ブランド:       ${c.brand || "—"}`,
        `  商品タイプ:     ${c.productType || "—"}`,
        `  理解スコア:     ${c.understandingScore ?? "—"}点`,
        `  カテゴリ信頼度: ${c.categoryConfidence ?? "—"}%`,
        `  判定根拠:       ${c.categorySource || "—"}`,
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

    // ── 10. TikTok投稿設計 ────────────────────────────────────────────
    ...H("10. TikTok投稿設計"),
    `  投稿形式：スライド6枚以内を基本とする。動画は現時点で機能しない。`,
    `  投稿時間：夜21〜22時を最優先枠とする。`,
    ``,
    ...H2("フェーズX【統合設計】006〜（現行）"),
    `  ・主語は常に俺の変化・体験`,
    `  ・商品名は4〜5枚目まで出さない`,
    `  ・フック → before → 露見シーン → 定義 → 商品後出し → 結論`,
    `  ・毎シリーズ3本セット：B → A → C の順で投稿する`,
    ``,
    `  1本目（B型・逆張り）`,
    `  　目的：再生数を稼ぐ・フォロワーを増やす`,
    `  　フック：問い型（まだ〇〇を使う理由があるか）`,
    `  　商品：後出し（4〜5枚目）`,
    `  　締め文：次の投稿で続きを話す`,
    ``,
    `  2本目（A型・王道）`,
    `  　目的：認定理由・体験を語る・信頼を積む`,
    `  　フック：体験型（俺が〇〇を選んだ理由）`,
    `  　締め文：他の装備はプロフィールから`,
    ``,
    `  3本目（C型・保存型）`,
    `  　目的：保存数を積む・資産コンテンツにする`,
    `  　フック：確認型（買う前に確認しろ）`,
    `  　締め文：保存して買う前に確認しろ`,
    ``,
    ...H2("集約型設計【009〜】"),
    `  1商品1投稿に変更。A・B・C の3投稿構造を廃止。`,
    ``,
    `  構成（6枚）`,
    `  1枚目：B型フック（問い・一人称・好奇心ギャップ）`,
    `  2枚目：before（身体感覚）`,
    `  3枚目：露見シーン（変化の瞬間）`,
    `  4枚目：認定理由・商品後出し`,
    `  5枚目：向いていない人または確認事項`,
    `  6枚目：結論・締め文「保存して次の装備はプロフィールから」`,
    ``,
    `  スライドラベリング`,
    `  　左上ラベル形式：UpGear 〇〇〇-A / B / C`,
    `  　投稿順は B→A→C だがラベルはシリーズ番号で管理する`,
    ``,

    // ── 11. A/B/C構成タイプ ────────────────────────────────────────────
    ...H("11. A/B/C 構成タイプ"),
    `  A型（王道）`,
    `  　目的：認定理由を語る。信頼を積む。`,
    `  　フック：体験型（俺が〇〇を選んだ理由）`,
    `  　特性：再生は普通・保存は少ない・新規流入向け`,
    `  　構成：共感 → 理由 → 気づき → 向いていない人 → 審査 → 結論`,
    `  　締め文：他の装備はプロフィールから`,
    ``,
    `  B型（逆張り）`,
    `  　目的：再生数とフォロー増を狙う。`,
    `  　フック：問い型（まだ〇〇しているか）`,
    `  　特性：再生が伸びやすい・フォロワーが増えやすい`,
    `  　構成：問い → 共感（before）→ 露見シーン → 定義 → 商品後出し → 結論`,
    `  　注意：1枚目フックはストーリー型。列挙型禁止。`,
    `  　締め文：次の投稿で続きを話す`,
    ``,
    `  C型（チェックリスト・保存型）`,
    `  　目的：保存されることを設計する。資産コンテンツにする。`,
    `  　フック：確認型（買う前に確認しろ）`,
    `  　特性：再生・維持率ともに安定。長期的に保存が積まれる。`,
    `  　構成：保存動機（1〜2枚目）→ 確認リスト → 向いていない人 → 結論`,
    `  　締め文：保存して買う前に確認しろ`,
    ``,
    `  使い分け方針`,
    `  ・フォロワー増を最優先する週 → B中心`,
    `  ・資産コンテンツを積む週　　 → C中心`,
    `  ・新アイテム紹介タイミング　 → B → C → A の順`,
    `  ・006〜フェーズ2　　　　　　 → B優先。Aは封印。Cは資産として週1本。`,
    ``,

    // ── 12. コピー設計ルール ───────────────────────────────────────────
    ...H("12. コピー設計ルール"),
    ...H2("全タイプ共通ルール"),
    `  フック型（1枚目）`,
    `  ・1枚目に商品名を出さない`,
    `  ・読者全員が当事者になる日用品・問題を名指しする`,
    `  ・メイン見出しは否定・命令ではなく「問い」にする`,
    `  ・補足に一人称の過去断言で好奇心ギャップを作る`,
    `  ・商品名が先頭に来たフックは低迷（確定した失敗パターン）`,
    ``,
    `  文体ルール`,
    `  ・短文・断言・体言止めを基本にする`,
    `  ・旧状態は過去形で書き、現在の自分と距離を取る`,
    `  ・一人称「俺」を全スライド貫通する`,
    `  ・機能説明・スペック羅列をしない`,
    `  ・身体感覚・場面のディテールで書く`,
    ``,
    `  露見シーンの装置`,
    `  ・変化を説明せず、新しい当たり前が古い環境で裏切る瞬間を1枚で描く`,
    `  ・006-Bで最も再生に効いた要素。全タイプで転用可能。`,
    ``,
    `  フィルター型クロージング`,
    `  ・条件を提示する（固定デスクで毎日使う人だけ買え）`,
    `  ・向いていない人を明記して除外する`,
    `  ・プッシュ販売はしない。除外の明記が信頼とフォロー動機を生む。`,
    ``,
    `  コンテンツルール（SD思想の実装）`,
    `  ・感情表現禁止（最高・すごい等NG）`,
    `  ・断定的に書く。説明しすぎない`,
    `  ・向いていない人を必ず・先に明言する`,
    `  ・結論を冒頭に置く`,
    `  ・行動を急かす表現を使わない`,
    `  ・編集長の一票否決権あり（理由は必ず公開）`,
    ``,
    ...H2("AI自動更新ルール — ${version.version}"),
    ...(version.rules || []).flatMap((r) => [
      `  ■ ${r.title}`,
      ...(r.items || []).map((item) => `    ・${item}`),
      ``,
    ]),
    ...H2("データからの示唆"),
    ...(version.insights || []).flatMap((ins) => [
      `  ■ ${ins.label}`,
      `    ${ins.text}`,
      ``,
    ]),

    // ── 13. Canvaテンプレ構成 ─────────────────────────────────────────
    ...H("13. Canvaテンプレ構成【確定版】"),
    `  スライドサイズ：1080 × 1920px（TikTok縦型）`,
    ``,
    `  固定要素（全スライド共通・変更禁止）`,
    `  　左上ラベル：UpGear 〇〇〇-[A/B/C]　X:80 Y:64　22px　#555555`,
    `  　右上ラベル：GEAR / SHOES / WEAR など　X:920 Y:64　22px　#555555`,
    `  　アバター全身線画（センター分け・丸眼鏡）`,
    `  　靴図解イラスト（左上エリア）`,
    `  　黒タグバー：アイテム名 / 価格　認定スコア`,
    `  　背景ナンバー：320px　#FF6B00（005〜オレンジ）`,
    `  　テキスト：縦書き（005シリーズより）`,
    ``,
    `  変動要素（スライドごとに変わる）`,
    `  　サブ見出し　X:80 Y:820　30px　#333333`,
    `  　メイン見出し　X:80 Y:880　70px　太字　#111111（10文字以内・2行まで）`,
    `  　補足テキスト　X:80 Y:1100　30px　#333333（1行15文字×2行まで）`,
    ``,
    `  台本出力ルール`,
    `  ・台本のテキストに鉤括弧は使わない`,
    `  ・強調が必要な箇所は太字で示す`,
    `  ・台本には必ず全要素のXY座標を明記する`,
    `  ・座標なしの台本は出さない`,
    `  ・メイン見出しは10文字以内`,
    `  ・補足は1行15文字×2行まで。見出しで完結なら削除可`,
    ``,

    // ── 14. 体験ストック ───────────────────────────────────────────────
    ...H("14. 体験ストック"),
    ...H2("ELECOM M-IT10BRBK（No.006 / 条件付き認定 / 70点）"),
    `  買う前：普通の有線マウスを使っていた。可動域が大きくなるのが不満だった。`,
    `  きっかけ：トラックボールへの憧れ。値段が手を出しやすかった。`,
    `  比較：ロジクールと比較。決め手は価格。`,
    ``,
    `  買った後の気づき`,
    `  ・隣に人がいても自分の可動スペースが変わらない`,
    `  ・1ヶ月で完全に慣れた。むしろトラックボールでないと気になる`,
    `  ・会社の普通のマウスをトラックボールのように使おうとして困惑した`,
    `  ・自分の中の当たり前になった`,
    ``,
    `  今：UpGearの記事作成時に使用中。`,
    `  向いていない人：移動先で作業する人 / マウスに高い機能を求める人`,
    ``,
    `  フック案`,
    `  ・俺が普通のマウスをやめた理由`,
    `  ・会社のマウスで困惑した話`,
    `  ・1ヶ月でトラックボールが当たり前になった`,
    ``,
    `  006-B スライド素材`,
    `  S1（フック）：普通のマウスをまだ使う理由があるか／俺は1年前に捨てた`,
    `  S2（before）：マウスを動かすたびにスペースを取っていた。隣に気を使っていた。`,
    `  S3（露見）：1ヶ月後、会社のマウスをトラックボールのように使おうとして気づいた。`,
    `  S4（定義）：俺の中の当たり前が変わっていた。`,
    `  S5（商品後出し）：ELECOM M-IT10BRBK 70点。固定デスク以外の人には向かない。`,
    `  S6（結論）：固定デスクで毎日PC作業をする人だけ買え。次の投稿で続きを話す。`,
    ``,
    ...H2("無印良品 撥水リュック（黒）（No.007 / 認定 / 90点）"),
    `  買う前：ビジネスバッグを使っていた。収納力がなく不満だった。`,
    `  きっかけ：値段が安く試しやすかった。比較なしで購入。`,
    `  比較：なし。`,
    ``,
    `  買った後の気づき`,
    `  ・試しに買ったが、これで充分だと感じた`,
    `  ・収納量をある程度気にしなくてよくなった`,
    `  ・デザインがシンプルで余計な主張がない`,
    `  ・サイズがちょうどいい。大きすぎずダサく見えない`,
    ``,
    `  今：仕事用のバッグとして使用中。`,
    `  向いていない人：営業マン（カジュアルすぎる）/ 個性的なデザインを求める人 / 機能性重視の人`,
    ``,
    `  フック案`,
    `  ・値段で選んで、シンプルさで続けている`,
    `  ・毎朝バッグを選ばなくなった理由`,
    `  ・サイズ感で選んで1年使っている`,
    ``,
    `  007-B スライド素材`,
    `  S1（フック）：通勤バッグをまだ選んでいるか／俺は1年前に考えるのをやめた`,
    `  S2（before）：ビジネスバッグだった。収納が足りなかった。毎日何かを妥協していた。`,
    `  S3（露見）：ビジネスバッグに戻した日、収納が足りなくて気づいた。無印で充分だったんだ。`,
    `  S4（定義）：バッグで迷わなくなったとき、それが装備になった。`,
    `  S5（商品後出し）：無印良品 撥水リュック 90点。営業職・スーツ必須の人には向かない。`,
    `  S6（結論）：毎日同じバッグで迷いたくない人だけ買え。次の投稿で続きを話す。`,
    ``,
    ...H2("Technics EAH-AZ40M2-S（No.008 / 条件付き認定 / 70点）"),
    `  買う前：Beats Budsをなくした。その日のうちに家電量販店へ。`,
    `  きっかけ：予算15,000円以内で探していた。価格が合致＋シルバーのデザインが気に入った。`,
    `  比較：比較なし。1万円台で適当に探していた。`,
    ``,
    `  買った後の気づき`,
    `  ・急速充電あり。残量が数字で確認できる。`,
    `  ・Beatsとの違いに気づかない。大きな不満がない。代替品になっている。`,
    `  ・ボタンの感度が良すぎる。少し触れただけで音が止まる。操作ストレスがある。`,
    ``,
    `  今：通勤中・休日の外出時に使用。`,
    `  向いていない人：音質にこだわる人 / iPhoneとのシームレス接続を求める人`,
    `  満点でない理由：ボタンの感度が良すぎて誤操作が起きる。慣れるまでストレスになる。`,
    ``,
    `  フック案`,
    `  ・イヤホンをまだ選んでいるか`,
    `  ・1年前に考えるのをやめた`,
    ``,
    `  008-B スライド素材`,
    `  S1（フック）：イヤホンをまだ選んでいるか／俺は1年前に考えるのをやめた`,
    `  S2（before）：Beatsをなくした日。その日のうちに買いに行った。それが当たり前だと思っていた。`,
    `  S3（露見）：新しいイヤホンで不満がなかった。Beatsとの違いに気づかなかった。`,
    `  S4（定義）：迷わなくなったとき、それが装備になった。`,
    `  S5（商品後出し）：Technics EAH-AZ40M2-S 70点。音質にこだわる人には向かない。`,
    `  S6（結論）：イヤホンで迷いたくない人だけ買え。次の投稿で続きを話す。`,
    ``,

    // ── 15. 投稿データ ─────────────────────────────────────────────────
    ...H("15. 投稿データ"),
    ...H2(`パフォーマンスサマリー — ${version.version}`),
    `  総投稿数:     ${version.summary.totalPosts}本`,
    `  総再生数:     ${(version.summary.totalViews || 0).toLocaleString()}`,
    `  平均再生数:   ${version.summary.avgViews.toLocaleString()}`,
    `  平均いいね率: ${version.summary.avgLikeRate}%`,
    `  フォロワー:   ${version.summary.followers}`,
    `  認定:         ${version.summary.certifiedItems}件`,
    `  条件付き認定: ${version.summary.conditionalItems || 0}件`,
    `  ストック:     ${version.summary.totalItems}件`,
    ``,
    ...(version.topPost ? [
      `  最高再生：No.${version.topPost.no}  ${(version.topPost.views || 0).toLocaleString()}再生`,
      `  フック：「${version.topPost.hook || "—"}」`,
      ``,
    ] : []),
    ...H2("投稿一覧"),
    `  No      型    再生    保存  フォロー  2枚目  最終到達  フック`,
    ...(posts.length
      ? posts.slice(0, 30).map((p) =>
          `  No.${String(p.no).padEnd(6)} ${String(p.views || 0).padStart(6)}再生 いいね率${String(p.likeRate || "—").padStart(4)}% [${p.type || "—"}型] 「${(p.hook || "").slice(0, 30)}」`)
      : ["  なし"]),
    ``,
    `  シリーズ別データ（マスタープロンプト v4.6 より）`,
    `  001-A:2,000  001-B:3,600  001-C:5,800`,
    `  002-A:2,600  002-B:455    002-C:280`,
    `  003-A:1,400  003-B:620    003-C:1,100`,
    `  004-A:470    004-B:430    004-C:400`,
    `  005-A:2,200  005-B:700    005-C:700`,
    `  006-A:440    006-B:15,000 006-C:780`,
    `  007-A:1,900  007-B:2,200  007-C:1,400`,
    `  008-B:1,500（投稿順1本目・ラベルはA）`,
    ``,
    `  タイプ別平均（スライド）`,
    `  　A型：1,518再生  2枚目37%`,
    `  　B型：2,752再生  2枚目40%（006-B反映後・B型が最高値に確定）`,
    `  　C型：1,720再生  2枚目42%`,
    ``,
    `  確定データ・示唆`,
    `  ・006-B（15,000再生）：B型逆張り×一人称フックが最強パターンに確定`,
    `  ・フォロー増はB型のみ（001-B・006-B各+2）`,
    `  ・フック「アイテムの当事者の広さ」が再生数の天井を決める`,
    `  　マウス（全デスクワーカー）vsバッグ（通勤者限定）で天井が変わる`,
    `  ・006-C異常データ：2枚目100%・最終0%。スライド2の構成要検証。`,
    `  ・008-B：2枚目44%。006-B（55%）より低い。「やめた」より「捨てた」が強い可能性。`,
    ``,

    // ── 16. サイト制作ルール ───────────────────────────────────────────
    ...H("16. サイト制作ルール"),
    `  ブランド表記：ＵＰＧＥＡＲ（全角・大文字）`,
    `  デザイン：白とグレー基調 / モノトーン / 工業的 / 装飾禁止`,
    `  フォント：monospace（ラベル）/ Georgia（本文）`,
    `  WordPress / Arkheテーマ使用`,
    ``,
    `  表示する情報`,
    `  ・商品名・スコア・認定ランク`,
    `  ・向いている人・向いていない人`,
    `  ・実体験`,
    `  ・関連TikTok投稿`,
    ``,
    `  表に出さない情報`,
    `  ・SD思想・限定合理性などの内部思想`,
    `  ・審査プロセスの詳細`,
    ``,
    `  構成方針`,
    `  ・TikTok投稿と商品を紐づける`,
    `  ・投稿で見た装備をサイトですぐ探せる構成にする`,
    `  ・「ちゃんと選びたいのに選べない人」が最短で答えにたどり着ける設計`,
    ``,

    // ── 17. ワークフロー ───────────────────────────────────────────────
    ...H("17. ワークフロー"),
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
    `     ※ 商品名での検索は使用しない`,
    ``,
    `  ⑦ 制作スタジオ`,
    `     フック生成・投稿企画・スクリプト作成`,
    ``,
    `  ⑧ マスター更新`,
    `     全投稿・全アイテムの知識ベースを自動更新`,
    `     → この引き継ぎ書をテキストファイルとして出力`,
    ``,

    // ── 18. 技術構成 ──────────────────────────────────────────────────
    ...H("18. 技術構成"),
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
    `  UpGear 引き継ぎ書 v5.5 — Generated ${dateStr}`,
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
