import { useState } from "react";
import {
  BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { PageHeader, Card, CardTitle, StatBox, Tag, Btn, Grid } from "../components/ui";
import { likeRate, seriesSummary, typeSummary, typeOf } from "../utils/calc";

const TYPE_COLOR = { A: "#3296ff", B: "#FF6B00", C: "#00c864" };

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      background: "#111", border: "1px solid #1e1e1e",
      padding: "8px 12px", fontSize: 11, fontFamily: "var(--font-mono)",
    }}>
      {Object.entries(d).map(([k, v]) => (
        <div key={k} style={{ color: "#aaa" }}>{k}: <span style={{ color: "#e8e8e8" }}>{v}</span></div>
      ))}
    </div>
  );
}

export default function Dashboard({ data, setFollowers }) {
  const { posts, followers } = data;

  const totalViews = posts.reduce((a, p) => a + (p.views || 0), 0);
  const avgLikeRate = (posts.reduce((a, p) => a + parseFloat(likeRate(p) || 0), 0) / posts.length).toFixed(2);
  const topPost = [...posts].sort((a, b) => b.views - a.views)[0];

  const seriesData = seriesSummary(posts);
  const typeData = typeSummary(posts);

  const top5 = [...posts].sort((a, b) => b.views - a.views).slice(0, 5);
  const top5Like = [...posts]
    .filter((p) => p.views > 0)
    .sort((a, b) => parseFloat(likeRate(b)) - parseFloat(likeRate(a)))
    .slice(0, 5);

  const scatterData = posts
    .filter((p) => p.slide2_rate != null && p.views != null)
    .map((p) => ({
      維持率: p.slide2_rate,
      再生数: p.views,
      No: p.no,
      type: typeOf(p.no),
    }));

  // 推奨ジャンル（直近3シリーズの傾向）
  const recentSeries = seriesData.slice(-3);
  const bestType = typeData.reduce((a, b) => (b.avgViews > a.avgViews ? b : a), typeData[0]);

  const [editFollowers, setEditFollowers] = useState(false);
  const [fInput, setFInput] = useState(followers);

  return (
    <div>
      <PageHeader title="ダッシュボード" sub="UpGear TikTok 投稿パフォーマンス" />

      {/* KPI */}
      <Grid cols={4} gap={12} style={{ marginBottom: 24 }}>
        <StatBox label="総投稿数" value={posts.length} unit="本" />
        <StatBox label="総再生数" value={totalViews.toLocaleString()} />
        <StatBox label="平均いいね率" value={avgLikeRate} unit="%" accent />
        <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", padding: "20px 24px" }}>
          <div style={{ fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.15em", marginBottom: 8 }}>
            フォロワー数
          </div>
          {editFollowers ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="number" value={fInput}
                onChange={(e) => setFInput(Number(e.target.value))}
                style={{ width: 80, background: "var(--bg2)", border: "1px solid var(--border)", color: "var(--text)", fontFamily: "var(--font-mono)", fontSize: 20, padding: "2px 8px" }}
              />
              <Btn small onClick={() => { setFollowers(fInput); setEditFollowers(false); }}>保存</Btn>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontSize: 28, fontWeight: 700 }}>{followers}</span>
              <button onClick={() => setEditFollowers(true)} style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", fontSize: 11 }}>編集</button>
            </div>
          )}
        </div>
      </Grid>

      <Grid cols={2} gap={16} style={{ marginBottom: 16 }}>
        {/* シリーズ別再生数 */}
        <Card>
          <CardTitle>シリーズ別 平均再生数</CardTitle>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={seriesData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#1e1e1e" vertical={false} />
              <XAxis dataKey="series" tick={{ fill: "#666", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#666", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="avgViews" radius={0}>
                {seriesData.map((d) => (
                  <Cell key={d.series} fill={d.avgViews >= 3000 ? "#FF6B00" : "#333"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* タイプ別いいね率 */}
        <Card>
          <CardTitle>タイプ別 平均いいね率（%）</CardTitle>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={typeData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#1e1e1e" vertical={false} />
              <XAxis dataKey="type" tick={{ fill: "#666", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#666", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="avgLikeRate" radius={0}>
                {typeData.map((d) => (
                  <Cell key={d.type} fill={TYPE_COLOR[d.type]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
            {typeData.map((d) => (
              <div key={d.type} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: "var(--text-dim)" }}>
                <span style={{ width: 8, height: 8, background: TYPE_COLOR[d.type], display: "inline-block" }} />
                {d.label}
              </div>
            ))}
          </div>
        </Card>
      </Grid>

      {/* 散布図 */}
      <Card style={{ marginBottom: 16 }}>
        <CardTitle>2枚目維持率 × 再生数 散布図</CardTitle>
        <ResponsiveContainer width="100%" height={220}>
          <ScatterChart margin={{ top: 4, right: 20, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="#1e1e1e" />
            <XAxis dataKey="維持率" name="2枚目維持率" unit="%" tick={{ fill: "#666", fontSize: 11 }} axisLine={false} />
            <YAxis dataKey="再生数" name="再生数" tick={{ fill: "#666", fontSize: 10 }} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Scatter data={scatterData} shape={(props) => {
              const { cx, cy, payload } = props;
              return (
                <g>
                  <circle cx={cx} cy={cy} r={5} fill={TYPE_COLOR[payload.type] || "#888"} opacity={0.8} />
                  <text x={cx + 7} y={cy + 4} fontSize={9} fill="#666">{payload.No}</text>
                </g>
              );
            }} />
          </ScatterChart>
        </ResponsiveContainer>
      </Card>

      <Grid cols={2} gap={16} style={{ marginBottom: 16 }}>
        {/* 上位5投稿 */}
        <Card>
          <CardTitle>再生数 TOP 5</CardTitle>
          {top5.map((p, i) => (
            <div key={p.no} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ color: i === 0 ? "var(--accent)" : "var(--text-dim)", fontSize: 11, width: 16 }}>#{i + 1}</span>
                <Tag color={typeOf(p.no) === "B" ? "orange" : typeOf(p.no) === "C" ? "green" : "blue"}>{p.no}</Tag>
                <span style={{ fontSize: 11, color: "var(--text-dim)", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.hook}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", flexShrink: 0 }}>{p.views.toLocaleString()}</span>
            </div>
          ))}
        </Card>

        {/* いいね率TOP5 */}
        <Card>
          <CardTitle>いいね率 TOP 5</CardTitle>
          {top5Like.map((p, i) => (
            <div key={p.no} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ color: i === 0 ? "var(--accent)" : "var(--text-dim)", fontSize: 11, width: 16 }}>#{i + 1}</span>
                <Tag color={typeOf(p.no) === "B" ? "orange" : typeOf(p.no) === "C" ? "green" : "blue"}>{p.no}</Tag>
                <span style={{ fontSize: 11, color: "var(--text-dim)", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.hook}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", flexShrink: 0 }}>{likeRate(p)}%</span>
            </div>
          ))}
        </Card>
      </Grid>

      {/* 推奨 */}
      <Card>
        <CardTitle>次シリーズ推奨 — 分析から自動生成</CardTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          <div style={{ padding: "12px 16px", background: "var(--bg2)", border: "1px solid var(--accent)", borderLeft: "3px solid var(--accent)" }}>
            <div style={{ fontSize: 10, color: "var(--accent)", letterSpacing: "0.15em", marginBottom: 6 }}>HOOK TYPE</div>
            <div style={{ fontSize: 13 }}>{bestType?.label} が最高平均再生</div>
            <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>{bestType?.avgViews?.toLocaleString()} 再生 / 平均</div>
          </div>
          <div style={{ padding: "12px 16px", background: "var(--bg2)", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.15em", marginBottom: 6 }}>BEST HOOK PATTERN</div>
            <div style={{ fontSize: 12 }}>「まだ〇〇しているか」</div>
            <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>＋「俺は1年前に〜した」</div>
          </div>
          <div style={{ padding: "12px 16px", background: "var(--bg2)", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.15em", marginBottom: 6 }}>DESIGN</div>
            <div style={{ fontSize: 12 }}>集約型 6枚構成</div>
            <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>商品名は4枚目以降</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
