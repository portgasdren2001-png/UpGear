#!/usr/bin/env python3
"""
UpGear TikTok投稿データ 自動分析スクリプト
使い方:
  python upgear_analysis.py                      # Excelを自動検出
  python upgear_analysis.py data.xlsx            # ファイル指定
  python upgear_analysis.py --csv                # インラインサンプルCSVで動作確認
"""

import argparse
import io
import re
import sys
import textwrap
from collections import Counter
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np
import pandas as pd

# ────────────────────────────────────────────────
# サンプルデータ（--csv フラグで使用）
# ────────────────────────────────────────────────
SAMPLE_CSV = """No,商品,再生数,いいね,保存,フォロー増,2枚目維持率,最終到達率,フック
001-A,トラックボール,2000,3,1,0,57,29,デスクが狭いと感じたことがある人へ
001-B,トラックボール,3600,7,0,2,62,29,なぜトラックボールは満点じゃなかったのか
001-C,トラックボール,5800,18,4,0,48,23,普通のマウスをやめるために確認すること
002-A,無印リュック,2600,2,1,1,52,27,通勤バックに3万円出す前に見て
003-A,NB990V4,1400,3,0,0,42,14,なぜ990V4は85点止まりなのか
003-B,NB990V4,620,1,0,0,48,19,37000の靴を買って後悔する人の特徴
003-C,NB990V4,1100,4,0,0,32,12,990V4を買う前に確認すること
005-A,Salomon,2200,8,2,0,31,10,俺が仕事用の靴にトレランシューズを選んだ理由
006-B,ELECOM,10700,24,4,3,55,33,普通のマウスをまだ使う理由があるか 俺は1年前に捨てた
007-B,無印リュック,2200,5,1,0,59,33,通勤バッグをまだ選んでいるか 1年前に考えるのをやめた
007-C,無印リュック,1400,3,1,1,59,32,通勤バッグを買う前に確認しろ 後悔パターンがある
008-A,Technics,1500,2,1,0,44,20,イヤホンをまだ選んでいるか 1年前に考えるのを辞めた"""

# ────────────────────────────────────────────────
# データ読み込み
# ────────────────────────────────────────────────

def load_excel(path: str) -> pd.DataFrame:
    raw = pd.read_excel(path, header=None)
    # ヘッダー行を探す（"No" が含まれる行）
    header_row = None
    for i, row in raw.iterrows():
        if row.astype(str).str.contains("No", na=False).any():
            header_row = i
            break
    if header_row is None:
        raise ValueError("ヘッダー行（'No'列）が見つかりません")
    df = pd.read_excel(path, header=header_row)
    # 不要列を落として列名を整理
    df = df.rename(columns=lambda c: str(c).strip())
    return df


def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    """列名を内部標準名に統一する"""
    alias = {
        "no": "No", "商品": "商品", "投稿日": "投稿日",
        "再生": "再生数", "再生数": "再生数",
        "いいね": "いいね", "保存": "保存",
        "フォロー増": "フォロー増", "フォロー": "フォロー増",
        "2枚目維持率": "2枚目維持率", "最終到達率": "最終到達率",
        "フック": "フック",
    }
    df.columns = [alias.get(c.lower().replace(" ", ""), c) for c in df.columns]
    return df


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """No列を起点に行を絞り込み、数値列を整備する"""
    # No列の存在チェック
    no_col = next((c for c in df.columns if str(c).lower() == "no"), None)
    if no_col is None:
        raise ValueError("'No' 列が見つかりません")
    if no_col != "No":
        df = df.rename(columns={no_col: "No"})

    # Noが「000-X」パターンの行だけ残す
    df = df[df["No"].astype(str).str.match(r"\d{3}[－\-][ABC]", na=False)].copy()
    df["No"] = df["No"].astype(str).str.replace("－", "-", regex=False).str.strip()

    # 商品名を前方埋め（同一シリーズは空白）
    if "商品" in df.columns:
        df["商品"] = df["商品"].replace("", np.nan).ffill()

    # 数値列
    for col in ["再生数", "いいね", "保存", "フォロー増"]:
        if col in df.columns:
            df[col] = pd.to_numeric(
                df[col].astype(str).str.replace(",", "").str.replace("\\", ""),
                errors="coerce"
            ).fillna(0).astype(int)

    for col in ["2枚目維持率", "最終到達率"]:
        if col in df.columns:
            s = df[col].astype(str).str.replace("%", "").str.strip()
            df[col] = pd.to_numeric(s, errors="coerce")
            # 0〜1 の小数なら % に変換
            if df[col].dropna().max() <= 1.0:
                df[col] = df[col] * 100

    # シリーズ番号・タイプを分解
    df["シリーズ"] = df["No"].str[:3]
    df["タイプ"] = df["No"].str[-1]

    # いいね率（%）を計算
    df["いいね率"] = np.where(
        df["再生数"] > 0,
        (df["いいね"] / df["再生数"] * 100).round(2),
        np.nan
    )

    df = df.reset_index(drop=True)
    return df


def load_data(path: str | None, use_csv: bool) -> pd.DataFrame:
    if use_csv:
        df = pd.read_csv(io.StringIO(SAMPLE_CSV))
        df["シリーズ"] = df["No"].str[:3]
        df["タイプ"] = df["No"].str[-1]
        df["いいね率"] = (df["いいね"] / df["再生数"] * 100).round(2)
        return df

    if path is None:
        # カレントディレクトリの xlsx を自動検索
        hits = list(Path(".").glob("*.xlsx")) + list(Path(".").glob("*.xls"))
        if not hits:
            raise FileNotFoundError("xlsx ファイルが見つかりません。--csv オプションか明示的なパスを指定してください")
        path = str(sorted(hits)[-1])
        print(f"  自動検出: {path}")

    df = load_excel(path)
    df = normalize_columns(df)
    df = clean_data(df)
    return df


# ────────────────────────────────────────────────
# 分析関数
# ────────────────────────────────────────────────

def series_summary(df: pd.DataFrame) -> pd.DataFrame:
    grp = df.groupby("シリーズ").agg(
        投稿数=("再生数", "count"),
        再生数_平均=("再生数", "mean"),
        再生数_合計=("再生数", "sum"),
        いいね_平均=("いいね", "mean"),
        いいね率_平均=("いいね率", "mean"),
        維持率_平均=("2枚目維持率", "mean"),
        最終到達率_平均=("最終到達率", "mean"),
    ).round(1)
    return grp


def type_summary(df: pd.DataFrame) -> pd.DataFrame:
    grp = df.groupby("タイプ").agg(
        投稿数=("再生数", "count"),
        再生数_平均=("再生数", "mean"),
        いいね率_平均=("いいね率", "mean"),
        維持率_平均=("2枚目維持率", "mean"),
        最終到達率_平均=("最終到達率", "mean"),
        保存_合計=("保存", "sum"),
        フォロー増_合計=("フォロー増", "sum"),
    ).round(1)
    return grp


def like_rate_ranking(df: pd.DataFrame, n: int = 5):
    ranked = df.sort_values("いいね率", ascending=False)
    return ranked.head(n), ranked.tail(n)


def hook_by_views(df: pd.DataFrame, n: int = 5):
    s = df.sort_values("再生数", ascending=False)
    top = s.head(n)[["No", "再生数", "いいね率", "フック"]].reset_index(drop=True)
    bot = s.tail(n)[["No", "再生数", "いいね率", "フック"]].reset_index(drop=True)
    return top, bot


def hook_by_like_rate(df: pd.DataFrame, n: int = 5):
    s = df.sort_values("いいね率", ascending=False)
    return s.head(n)[["No", "再生数", "いいね率", "フック"]].reset_index(drop=True)


def keyword_freq(df: pd.DataFrame, top_n: int = 20) -> list[tuple[str, int]]:
    stop = {"を", "に", "は", "が", "で", "の", "と", "も", "な", "て",
            "し", "た", "ない", "から", "ため", "こと", "する", "ある",
            "その", "いる", "れる", "なる", "これ", "あの", "あり", "まだ",
            "前に", "理由", "人の", "人へ"}
    tokens: list[str] = []
    for hook in df["フック"].dropna():
        parts = re.split(r"[\s　。、・]", str(hook))
        for p in parts:
            p = p.strip()
            if len(p) >= 2 and p not in stop:
                tokens.append(p)
    return Counter(tokens).most_common(top_n)


def retention_analysis(df: pd.DataFrame):
    valid = df.dropna(subset=["2枚目維持率", "再生数"])
    r2 = np.corrcoef(valid["2枚目維持率"], valid["再生数"])[0, 1] if len(valid) > 1 else float("nan")

    valid2 = df.dropna(subset=["最終到達率", "保存"])
    r3 = np.corrcoef(valid2["最終到達率"], valid2["保存"])[0, 1] if len(valid2) > 1 else float("nan")

    # 高維持率（中央値以上）の投稿の共通点
    if df["2枚目維持率"].notna().sum() > 0:
        med = df["2枚目維持率"].median()
        high = df[df["2枚目維持率"] >= med]
    else:
        high = df.head(0)

    return r2, r3, high


def genre_insight(df: pd.DataFrame) -> pd.DataFrame:
    if "商品" not in df.columns:
        return pd.DataFrame()
    grp = df.groupby("商品").agg(
        投稿数=("再生数", "count"),
        再生数_平均=("再生数", "mean"),
        いいね率_平均=("いいね率", "mean"),
        維持率_平均=("2枚目維持率", "mean"),
    ).round(1).sort_values("再生数_平均", ascending=False)
    return grp


def b_type_patterns(df: pd.DataFrame) -> pd.DataFrame:
    b = df[df["タイプ"] == "B"].sort_values("再生数", ascending=False)
    return b[["No", "再生数", "いいね率", "2枚目維持率", "フォロー増", "フック"]].reset_index(drop=True)


def generate_hook_suggestions(df: pd.DataFrame) -> list[str]:
    """B型成功パターンから009向けフック候補を生成"""
    b_top = df[df["タイプ"] == "B"].sort_values("再生数", ascending=False).head(3)
    suggestions = [
        "【逆張り×一人称】俺が〇〇を仕事で使うのをやめた理由／1年前に決断した",
        "【問いかけ型】〇〇をまだ選んでいるか／俺は答えを出した",
        "【ギャップ型】〇〇に△△円出す前に見ておけ／買って気づいた唯一の後悔",
    ]
    # 上位B型フックからパターン補強
    for _, row in b_top.iterrows():
        hook = str(row.get("フック", ""))
        if "まだ" in hook:
            suggestions[1] = f"【006-B型転用】{hook.split('　')[0]}｜（009商品名に差し替え）"
            break
    return suggestions


# ────────────────────────────────────────────────
# グラフ生成
# ────────────────────────────────────────────────

TYPE_COLORS = {"A": "#3498db", "B": "#e74c3c", "C": "#2ecc71"}


def _setup_font():
    """利用可能な日本語フォントを自動検出して設定する"""
    from matplotlib import font_manager
    candidates = ["IPAexGothic", "IPAGothic", "Noto Sans CJK JP",
                  "Noto Sans JP", "TakaoGothic", "VL Gothic"]
    available = {f.name for f in font_manager.fontManager.ttflist}
    for name in candidates:
        if name in available:
            plt.rcParams["font.family"] = name
            return
    # フォントが見つからない場合はラベルをASCII代替にする（警告を出さない）
    plt.rcParams["font.family"] = "DejaVu Sans"


def make_charts(df: pd.DataFrame, out_path: str = "upgear_charts.png"):
    _setup_font()
    fig, axes = plt.subplots(1, 3, figsize=(18, 6))
    fig.suptitle("UpGear TikTok 投稿データ分析", fontsize=15, fontweight="bold")

    # ① シリーズ別再生数推移
    ax = axes[0]
    for t, color in TYPE_COLORS.items():
        sub = df[df["タイプ"] == t].sort_values("シリーズ")
        if sub.empty:
            continue
        ax.plot(sub["シリーズ"], sub["再生数"], marker="o", label=f"{t}型",
                color=color, linewidth=2, markersize=7)
    ax.set_title("シリーズ別 再生数推移", fontsize=12, fontweight="bold")
    ax.set_xlabel("シリーズ")
    ax.set_ylabel("再生数")
    ax.legend()
    ax.tick_params(axis="x", rotation=45)
    ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, _: f"{int(x):,}"))
    ax.grid(axis="y", alpha=0.3)

    # ② タイプ別いいね率比較（箱ひげ図）
    ax = axes[1]
    data_by_type = [df[df["タイプ"] == t]["いいね率"].dropna().tolist() for t in ["A", "B", "C"]]
    bp = ax.boxplot(data_by_type, patch_artist=True, widths=0.5,
                    medianprops=dict(color="black", linewidth=2))
    for patch, color in zip(bp["boxes"], TYPE_COLORS.values()):
        patch.set_facecolor(color)
        patch.set_alpha(0.7)
    ax.set_xticks([1, 2, 3])
    ax.set_xticklabels(["A型（王道）", "B型（逆張り）", "C型（保存）"])
    ax.set_title("タイプ別 いいね率比較", fontsize=12, fontweight="bold")
    ax.set_ylabel("いいね率 (%)")
    ax.grid(axis="y", alpha=0.3)

    # ③ 2枚目維持率 × 再生数 散布図
    ax = axes[2]
    valid = df.dropna(subset=["2枚目維持率", "再生数"])
    for t, color in TYPE_COLORS.items():
        sub = valid[valid["タイプ"] == t]
        ax.scatter(sub["2枚目維持率"], sub["再生数"], color=color,
                   label=f"{t}型", s=80, alpha=0.8, edgecolors="white", linewidth=0.5)
        # ラベル
        for _, row in sub.iterrows():
            ax.annotate(row["No"], (row["2枚目維持率"], row["再生数"]),
                        fontsize=7, alpha=0.7, xytext=(3, 3), textcoords="offset points")
    # 回帰直線
    if len(valid) > 2:
        m, b = np.polyfit(valid["2枚目維持率"], valid["再生数"], 1)
        xr = np.linspace(valid["2枚目維持率"].min(), valid["2枚目維持率"].max(), 50)
        ax.plot(xr, m * xr + b, "k--", linewidth=1, alpha=0.5, label="回帰直線")
        r = np.corrcoef(valid["2枚目維持率"], valid["再生数"])[0, 1]
        ax.set_title(f"2枚目維持率 × 再生数  (r={r:.2f})", fontsize=12, fontweight="bold")
    else:
        ax.set_title("2枚目維持率 × 再生数", fontsize=12, fontweight="bold")
    ax.set_xlabel("2枚目維持率 (%)")
    ax.set_ylabel("再生数")
    ax.legend()
    ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, _: f"{int(x):,}"))
    ax.grid(alpha=0.3)

    fig.tight_layout()
    fig.savefig(out_path, dpi=150, bbox_inches="tight")
    plt.close(fig)
    return out_path


# ────────────────────────────────────────────────
# Markdownレポート生成
# ────────────────────────────────────────────────

def df_to_md(df: pd.DataFrame) -> str:
    if df.empty:
        return "_データなし_\n"
    lines = ["| " + " | ".join(str(c) for c in df.columns) + " |"]
    lines.append("|" + "|".join(["---"] * len(df.columns)) + "|")
    for _, row in df.iterrows():
        lines.append("| " + " | ".join(str(v) for v in row.values) + " |")
    return "\n".join(lines) + "\n"


def build_report(df: pd.DataFrame, chart_path: str) -> str:
    s_sum = series_summary(df)
    t_sum = type_summary(df)
    like_top, like_bot = like_rate_ranking(df)
    hook_top, hook_bot = hook_by_views(df)
    hook_like = hook_by_like_rate(df)
    keywords = keyword_freq(df)
    r_ret_views, r_final_saves, high_ret = retention_analysis(df)
    genre = genre_insight(df)
    b_patterns = b_type_patterns(df)
    suggestions = generate_hook_suggestions(df)

    best = df.loc[df["再生数"].idxmax()]
    total_views = df["再生数"].sum()
    avg_like_rate = df["いいね率"].mean()

    lines = [
        "# UpGear TikTok 投稿データ分析レポート\n",
        f"**集計投稿数**: {len(df)} 本　"
        f"**総再生数**: {total_views:,}　"
        f"**平均いいね率**: {avg_like_rate:.2f}%\n",

        "---\n",
        "## 1. 基本集計\n",

        "### 1-1. シリーズ別平均\n",
        df_to_md(s_sum.reset_index()),

        "### 1-2. 構成タイプ別（A/B/C）平均\n",
        df_to_md(t_sum.reset_index()),

        "### 1-3. いいね率ランキング\n",
        "**上位5本**\n",
        df_to_md(like_top[["No", "再生数", "いいね率", "フック"]]),
        "**下位5本**\n",
        df_to_md(like_bot[["No", "再生数", "いいね率", "フック"]]),

        "---\n",
        "## 2. フック分析\n",

        "### 2-1. 再生数上位5本のフック\n",
        df_to_md(hook_top),

        "### 2-2. 再生数下位5本のフック\n",
        df_to_md(hook_bot),

        "### 2-3. いいね率上位5本のフック\n",
        df_to_md(hook_like),

        "### 2-4. フック頻出キーワード（上位20語）\n",
        "| キーワード | 出現回数 |\n|---|---|\n"
        + "\n".join(f"| {w} | {c} |" for w, c in keywords) + "\n",

        "---\n",
        "## 3. 維持率分析\n",

        f"- **2枚目維持率 × 再生数** 相関係数: **r = {r_ret_views:.3f}**\n",
        f"- **最終到達率 × 保存数** 相関係数: **r = {r_final_saves:.3f}**\n\n",
        "### 維持率が高い投稿（中央値以上）\n",
        df_to_md(high_ret[["No", "再生数", "いいね率", "2枚目維持率", "最終到達率", "フック"]].head(8))
        if not high_ret.empty else "_該当なし_\n",

        "---\n",
        "## 4. 次シリーズへの推奨\n",

        "### 4-1. 商品ジャンル別パフォーマンス\n",
        df_to_md(genre.reset_index()) if not genre.empty else "_商品列なし_\n",

        "### 4-2. B型フック成功パターン\n",
        df_to_md(b_patterns),

        "### 4-3. 009以降 集約型設計フック候補（3案）\n",
        "\n".join(f"{i+1}. {s}" for i, s in enumerate(suggestions)) + "\n\n",

        "> **設計原則（確定）**\n"
        "> - B型×一人称×逆張りフックが最高再生パターン（006-B: 10,700再生）\n"
        "> - 「まだ〇〇しているか」＋「俺は1年前に〜した」の2文構成が有効\n"
        "> - 商品名は4〜5枚目まで伏せる\n"
        "> - アイテムの当事者の広さ（全デスクワーカー vs 通勤者）が再生数の天井を決める\n",

        "---\n",
        "## 5. グラフ\n",
        f"![分析グラフ]({chart_path})\n",

        "---\n",
        f"*生成日時: {pd.Timestamp.now().strftime('%Y-%m-%d %H:%M')}*\n",
    ]
    return "\n".join(lines)


# ────────────────────────────────────────────────
# メイン
# ────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="UpGear TikTok投稿データ分析")
    parser.add_argument("file", nargs="?", help="Excel (.xlsx) または CSV ファイル")
    parser.add_argument("--csv", action="store_true", help="インラインサンプルCSVで動作確認")
    parser.add_argument("--output", "-o", default=".", help="出力先ディレクトリ")
    args = parser.parse_args()

    out_dir = Path(args.output)
    out_dir.mkdir(parents=True, exist_ok=True)

    print("📂 データ読み込み中...")
    try:
        df = load_data(args.file, args.csv)
    except Exception as e:
        print(f"エラー: {e}", file=sys.stderr)
        sys.exit(1)

    print(f"✅ {len(df)} 件の投稿データを読み込みました")
    print(f"   シリーズ: {sorted(df['シリーズ'].unique())}")
    print(f"   タイプ:   {sorted(df['タイプ'].unique())}")

    print("📊 グラフ生成中...")
    chart_path = str(out_dir / "upgear_charts.png")
    make_charts(df, chart_path)

    print("📝 レポート生成中...")
    report = build_report(df, "upgear_charts.png")
    report_path = out_dir / "upgear_analysis_report.md"
    report_path.write_text(report, encoding="utf-8")

    print(f"\n💾 出力完了:")
    print(f"   {report_path}")
    print(f"   {chart_path}")
    print("\n🔑 主要インサイト:")

    best = df.loc[df["再生数"].idxmax()]
    print(f"   最高再生: {best['No']}  {best['再生数']:,} 再生  フック:「{best['フック']}」")

    t_avg = df.groupby("タイプ")["再生数"].mean().sort_values(ascending=False)
    for t, v in t_avg.items():
        label = {"A": "王道", "B": "逆張り", "C": "保存"}.get(t, t)
        print(f"   {t}型（{label}）平均再生: {v:,.0f}")


if __name__ == "__main__":
    main()
