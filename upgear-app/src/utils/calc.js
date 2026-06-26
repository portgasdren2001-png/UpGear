export function likeRate(post) {
  if (!post.views || post.views === 0) return null;
  return ((post.likes / post.views) * 100).toFixed(2);
}

export function seriesOf(no) {
  return no?.slice(0, 3) ?? "";
}

export function typeOf(no) {
  return no?.slice(-1) ?? "";
}

export function groupBy(arr, fn) {
  return arr.reduce((acc, item) => {
    const key = fn(item);
    (acc[key] = acc[key] || []).push(item);
    return acc;
  }, {});
}

export function avg(arr, fn) {
  const vals = arr.map(fn).filter((v) => v != null && !isNaN(v));
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export function seriesSummary(posts) {
  const byS = groupBy(posts, (p) => seriesOf(p.no));
  return Object.entries(byS)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([series, ps]) => ({
      series,
      avgViews: Math.round(avg(ps, (p) => p.views)),
      avgLikeRate: parseFloat(avg(ps, (p) => parseFloat(likeRate(p))).toFixed(2)),
      avgSlide2: parseFloat(avg(ps, (p) => p.slide2_rate).toFixed(1)),
      count: ps.length,
    }));
}

export function typeSummary(posts) {
  const byT = groupBy(posts, (p) => typeOf(p.no));
  return ["A", "B", "C"].map((t) => {
    const ps = byT[t] || [];
    return {
      type: t,
      label: { A: "A型（王道）", B: "B型（逆張り）", C: "C型（保存）" }[t],
      avgViews: ps.length ? Math.round(avg(ps, (p) => p.views)) : 0,
      avgLikeRate: ps.length ? parseFloat(avg(ps, (p) => parseFloat(likeRate(p))).toFixed(2)) : 0,
      avgSlide2: ps.length ? parseFloat(avg(ps, (p) => p.slide2_rate).toFixed(1)) : 0,
      count: ps.length,
    };
  });
}

export function exportCSV(posts) {
  const headers = ["No", "商品", "投稿日", "再生数", "いいね", "保存", "フォロー増",
    "2枚目維持率", "最終到達率", "いいね率", "フック", "BGM"];
  const rows = posts.map((p) => [
    p.no, p.product, p.date, p.views, p.likes, p.saves, p.follows,
    p.slide2_rate ?? "", p.final_rate ?? "",
    likeRate(p) ?? "", p.hook, p.bgm ?? "",
  ]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "upgear_posts.csv";
  a.click();
  URL.revokeObjectURL(url);
}
