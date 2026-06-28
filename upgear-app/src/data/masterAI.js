import { typeSummary, seriesSummary, likeRate, typeOf } from "../utils/calc";

const VERSION_RE = /^v(\d+)\.(\d+)$/;

function nextVersion(current) {
  const m = current?.match(VERSION_RE);
  if (!m) return "v5.0";
  return `v${m[1]}.${Number(m[2]) + 1}`;
}

function calcCategoryStats(items) {
  const map = {};
  items.forEach((item) => {
    const c = item.category || "OTHER";
    if (!map[c]) map[c] = { count: 0, approved: 0, avgScore: 0, scores: [] };
    map[c].count++;
    if (item.judgment === "認定" || item.judgment === "条件付き認定") map[c].approved++;
    if (item.score) map[c].scores.push(Number(item.score));
  });
  Object.values(map).forEach((v) => {
    v.avgScore = v.scores.length ? Math.round(v.scores.reduce((a, b) => a + b, 0) / v.scores.length) : 0;
    delete v.scores;
  });
  return map;
}

function extractPatterns(posts, learningData) {
  const typeData = typeSummary(posts);
  const seriesData = seriesSummary(posts);
  const bestType = typeData.reduce((a, b) => (b.avgViews > a.avgViews ? b : a), typeData[0] || {});
  const worstType = typeData.reduce((a, b) => (b.avgViews < a.avgViews ? b : a), typeData[0] || {});
  const topPost = [...posts].sort((a, b) => b.views - a.views)[0];
  const avgViews = posts.length ? Math.round(posts.reduce((a, p) => a + (p.views || 0), 0) / posts.length) : 0;
  const avgLike = posts.length
    ? (posts.reduce((a, p) => a + parseFloat(likeRate(p) || 0), 0) / posts.length).toFixed(2)
    : "0.00";

  const recentPatterns = (learningData?.patterns || []).slice(-50);
  const hookSuccess = {};
  recentPatterns.forEach((p) => {
    if (!p.hookType) return;
    if (!hookSuccess[p.hookType]) hookSuccess[p.hookType] = { total: 0, good: 0 };
    hookSuccess[p.hookType].total++;
    if (p.views > avgViews) hookSuccess[p.hookType].good++;
  });

  return { bestType, worstType, topPost, avgViews, avgLike, seriesData, hookSuccess };
}

function generateRules(patterns, posts) {
  const rules = [];
  if (patterns.bestType?.label) {
    rules.push({
      title: "最強タイプ（データ確定）",
      items: [
        `${patterns.bestType.label}が最高平均再生 ${patterns.bestType.avgViews?.toLocaleString()} 再生`,
        "バズ型：逆張り・問い・一人称貫通",
        "保存型：チェックリスト・基準・保存動機ワード",
        "フォロー型：連続性・続き匂わせ・次回予告",
      ],
    });
  }
  if (patterns.topPost) {
    rules.push({
      title: "最高再生フック（実績）",
      items: [
        `「${patterns.topPost.hook?.slice(0, 30) || "—"}」`,
        `${patterns.topPost.views?.toLocaleString()} 再生 / No.${patterns.topPost.no}`,
        "1枚目に商品名は出さない",
        "問題・対象から入り好奇心ギャップを作る",
      ],
    });
  }
  rules.push({
    title: "文体ルール（全投稿共通）",
    items: [
      "短文・断言・体言止めを基本にする",
      "旧状態は過去形で書き現在の自分と距離を取る",
      "機能説明・スペック羅列をしない",
      "身体感覚・場面のディテールで書く",
    ],
  });
  if (posts.length >= 5) {
    const slide2avg = posts.filter((p) => p.slide2_rate != null).reduce((a, p) => a + p.slide2_rate, 0) / (posts.filter((p) => p.slide2_rate != null).length || 1);
    rules.push({
      title: `2枚目維持率 — 平均 ${slide2avg.toFixed(1)}%`,
      items: [
        slide2avg >= 60 ? "2枚目設計は現状維持で良い" : "2枚目の改善が最優先課題",
        "2枚目に保存動機ワードを入れると維持率向上",
        "問いへの答えを即出しせず引きを作る",
        "スライド2で全員離脱した投稿の共通点を分析すること",
      ],
    });
  }
  return rules;
}

function generateInsights(posts, items, patterns) {
  const insights = [];
  if (posts.length === 0) return insights;

  const topPost = patterns.topPost;
  if (topPost) {
    insights.push({
      label: `No.${topPost.no} — 最高再生`,
      text: `「${topPost.hook?.slice(0, 25) || "—"}」で ${topPost.views?.toLocaleString()} 再生。タイプ: ${typeOf(topPost.no) || "—"}型`,
    });
  }

  const certified = items.filter((i) => i.judgment === "認定");
  if (certified.length) {
    const avgScore = Math.round(certified.reduce((a, i) => a + (Number(i.score) || 0), 0) / certified.length);
    insights.push({
      label: `認定アイテム ${certified.length} 件`,
      text: `平均スコア ${avgScore} 点。カテゴリ分散: ${[...new Set(certified.map((i) => i.category))].join(", ")}`,
    });
  }

  if (patterns.bestType && patterns.worstType && patterns.bestType.type !== patterns.worstType.type) {
    insights.push({
      label: "タイプ差分",
      text: `${patterns.bestType.label} vs ${patterns.worstType.label} で平均再生 ${(patterns.bestType.avgViews - patterns.worstType.avgViews)?.toLocaleString()} の差。`,
    });
  }

  return insights;
}

export function generateMasterVersion(storeData, learningData, prevVersion) {
  const { items = [], posts = [], followers = 0 } = storeData;
  const version = nextVersion(prevVersion);
  const ts = Date.now();

  const patterns = extractPatterns(posts, learningData);
  const catStats = calcCategoryStats(items);
  const rules = generateRules(patterns, posts);
  const insights = generateInsights(posts, items, patterns);

  const certified = items.filter((i) => i.judgment === "認定");
  const conditional = items.filter((i) => i.judgment === "条件付き認定");
  const pending = items.filter((i) => i.judgment === "保留");

  const avgViews = patterns.avgViews;
  const totalViews = posts.reduce((a, p) => a + (p.views || 0), 0);

  return {
    version,
    ts,
    summary: {
      totalPosts: posts.length,
      totalViews,
      avgViews,
      avgLikeRate: patterns.avgLike,
      followers,
      certifiedItems: certified.length,
      conditionalItems: conditional.length,
      pendingItems: pending.length,
      totalItems: items.length,
    },
    certified: certified.map((i) => ({ id: i.id, no: i.no, label: i.label, score: i.score, category: i.category, price: i.price })),
    conditional: conditional.map((i) => ({ id: i.id, no: i.no, label: i.label, score: i.score, category: i.category })),
    catStats,
    rules,
    insights,
    bestType: patterns.bestType,
    topPost: patterns.topPost ? { no: patterns.topPost.no, hook: patterns.topPost.hook, views: patterns.topPost.views } : null,
  };
}

export function diffMasterVersions(prev, next) {
  if (!prev || !next) return [];
  const changes = [];

  const ds = next.summary.totalPosts - prev.summary.totalPosts;
  if (ds !== 0) changes.push({ type: ds > 0 ? "add" : "remove", label: "投稿数", value: `${ds > 0 ? "+" : ""}${ds}本 → ${next.summary.totalPosts}本` });

  const dv = next.summary.avgViews - prev.summary.avgViews;
  if (Math.abs(dv) >= 50) changes.push({ type: dv > 0 ? "up" : "down", label: "平均再生数", value: `${dv > 0 ? "+" : ""}${dv.toLocaleString()} → ${next.summary.avgViews.toLocaleString()}` });

  const dc = next.summary.certifiedItems - prev.summary.certifiedItems;
  if (dc !== 0) changes.push({ type: dc > 0 ? "add" : "remove", label: "認定アイテム", value: `${dc > 0 ? "+" : ""}${dc}件 → ${next.summary.certifiedItems}件` });

  const di = next.summary.totalItems - prev.summary.totalItems;
  if (di !== 0) changes.push({ type: di > 0 ? "add" : "remove", label: "ストック数", value: `${di > 0 ? "+" : ""}${di}件 → ${next.summary.totalItems}件` });

  if (prev.bestType?.type !== next.bestType?.type) {
    changes.push({ type: "change", label: "最強タイプ変更", value: `${prev.bestType?.label || "—"} → ${next.bestType?.label || "—"}` });
  }

  if (changes.length === 0) changes.push({ type: "none", label: "変化なし", value: "前バージョンと同一" });
  return changes;
}
