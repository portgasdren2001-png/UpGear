import { useState, useEffect, useRef, useCallback } from "react";
import { PageHeader, Tag, Btn } from "../components/ui";
import { MAIN_CATEGORIES, CATEGORY_TREE } from "../data/productUnderstandingAI";
import ItemWizard from "./ItemWizard";

// ─── ステータス定義 ────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  "未分析":   { color: "#555",     bg: "rgba(85,85,85,0.12)",     label: "未分析" },
  "解析中":   { color: "#6fa8dc",  bg: "rgba(111,168,220,0.12)",  label: "解析中" },
  "要確認":   { color: "#e06c75",  bg: "rgba(224,108,117,0.12)",  label: "要確認" },
  "条件付き": { color: "var(--accent)", bg: "var(--accent-dim)", label: "条件付き" },
  "認定":     { color: "#98c379",  bg: "rgba(152,195,121,0.12)",  label: "認定" },
  "非認定":   { color: "#666",     bg: "rgba(100,100,100,0.08)",  label: "非認定" },
};

function getItemStatus(item) {
  if (item.analysisStatus) return item.analysisStatus;
  if (!item.card) return "未分析";
  const s = item.score || 0;
  if (s >= 80) return "認定";
  if (s >= 70) return "条件付き";
  if (s < 60)  return "非認定";
  return "要確認";
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["未分析"];
  return (
    <span style={{
      fontSize: 9, padding: "2px 7px",
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.color}`,
      letterSpacing: "0.05em", fontWeight: 600,
      whiteSpace: "nowrap",
    }}>
      {cfg.label}
    </span>
  );
}

function SourceTag({ source }) {
  const colors = { "楽天API": "#e07b4c", "Playwright": "#6fa8dc", "Claude AI": "#98c379", "手動": "#888" };
  return (
    <span style={{ fontSize: 9, color: colors[source] || "#888", background: "var(--bg2)", border: `1px solid ${colors[source] || "#555"}`, padding: "1px 5px" }}>
      {source}
    </span>
  );
}

// ─── ItemCard ─────────────────────────────────────────────────────────────────

function ItemCard({ item, selected, onClick, onDoubleClick, onWizard, onNavToStudio }) {
  const [hovered, setHovered] = useState(false);
  const status = getItemStatus(item);
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["未分析"];
  const rb = item.rakuten || item.card?.rakuten;

  return (
    <div
      title="ダブルクリックで商品理解を開く"
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: selected ? "var(--accent-dim)" : hovered ? "var(--bg2)" : "var(--bg3)",
        border: `1px solid ${selected ? "var(--accent)" : hovered ? "var(--accent)" : "var(--border)"}`,
        borderLeft: `3px solid ${cfg.color}`,
        padding: "12px 14px", cursor: "pointer",
        transition: "border-color 0.12s, background 0.12s",
        userSelect: "none",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3, flexWrap: "wrap" }}>
            <span style={{ fontSize: 9, color: "var(--text-dim)" }}>No.{item.no}</span>
            <StatusBadge status={status} />
            {(item.mainCategory || item.category) && (
              <Tag color="gray">{item.mainCategory || item.category}</Tag>
            )}
            {item.subCategory && (
              <Tag color="blue">{item.subCategory}</Tag>
            )}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {item.label || "（商品名未設定）"}
          </div>
          {item.brand && <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 2 }}>{item.brand}</div>}
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: cfg.color }}>{item.score}点</div>
          <div style={{ fontSize: 9, color: "var(--text-dim)" }}>UpGear</div>
        </div>
      </div>

      {/* Data row */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, fontSize: 10, color: "var(--text-dim)", alignItems: "center" }}>
        {(rb?.price || item.price) && (
          <span style={{ color: "var(--text)" }}>
            ¥{Number(rb?.price || item.price).toLocaleString()}
          </span>
        )}
        {rb?.reviewCount && (
          <span>★{rb.reviewAverage} ({rb.reviewCount?.toLocaleString()}件)</span>
        )}
        {rb?.url && (
          <span style={{ color: "#e07b4c" }}>楽天あり</span>
        )}
        {item.card?.understandingScore != null && (
          <span>理解:{item.card.understandingScore}点</span>
        )}
        {hovered && !selected && (
          <span style={{ color: "var(--accent)", fontSize: 9, marginLeft: "auto" }}>ダブルクリックで開く</span>
        )}
      </div>

      {/* Actions when selected */}
      {selected && (
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }} onClick={(e) => e.stopPropagation()}>
          <Btn small onClick={() => onWizard(item)}>{item.card ? "再分析" : "商品理解AI"}</Btn>
          {onNavToStudio && (
            <Btn small variant="primary" onClick={() => onNavToStudio(item.id)}>▣ 制作スタジオ</Btn>
          )}
        </div>
      )}
    </div>
  );
}

// ─── CardModal (ダブルクリックで開く商品理解モーダル) ─────────────────────────

function CardModal({ item, items, onClose, onWizard, onNavToStudio, onDelete, onNavigate }) {
  const card = item.card;
  const rb = item.rakuten || card?.rakuten;
  const status = getItemStatus(item);
  const cfg = STATUS_CONFIG[status];
  const currentIndex = items.findIndex(i => i.id === item.id);

  // データソースを判定
  const sources = [];
  if (rb) sources.push("楽天API");
  if (card?.fetchedAt) sources.push("Playwright");
  if (card?.whatIsThis) sources.push("Claude AI");
  if (sources.length === 0) sources.push("手動");

  // キーボードハンドラ
  useEffect(() => {
    const handle = (e) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "Enter" && !e.ctrlKey) { onNavToStudio?.(item.id); onClose(); return; }
      if (e.key === "s" && e.ctrlKey) { e.preventDefault(); onWizard(item); onClose(); return; }
      if (e.key === "ArrowLeft"  && currentIndex > 0)               { onNavigate(items[currentIndex - 1].id); return; }
      if (e.key === "ArrowRight" && currentIndex < items.length - 1) { onNavigate(items[currentIndex + 1].id); return; }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [item, currentIndex, items]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 300,
        background: "rgba(0,0,0,0.75)",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        padding: "40px 20px", overflowY: "auto",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg)", border: "1px solid var(--border)",
          width: "100%", maxWidth: 680,
          padding: "28px 32px", position: "relative",
        }}
      >
        {/* ナビゲーション */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() => currentIndex > 0 && onNavigate(items[currentIndex - 1].id)}
              disabled={currentIndex === 0}
              style={{ background: "none", border: "1px solid var(--border)", color: currentIndex === 0 ? "var(--text-dim)" : "var(--text)", padding: "4px 10px", cursor: currentIndex === 0 ? "default" : "pointer", fontFamily: "var(--font-mono)", fontSize: 11 }}
              title="前の商品 (←)"
            >← 前</button>
            <span style={{ fontSize: 10, color: "var(--text-dim)", display: "flex", alignItems: "center", padding: "0 8px" }}>
              {currentIndex + 1} / {items.length}
            </span>
            <button
              onClick={() => currentIndex < items.length - 1 && onNavigate(items[currentIndex + 1].id)}
              disabled={currentIndex === items.length - 1}
              style={{ background: "none", border: "1px solid var(--border)", color: currentIndex === items.length - 1 ? "var(--text-dim)" : "var(--text)", padding: "4px 10px", cursor: currentIndex === items.length - 1 ? "default" : "pointer", fontFamily: "var(--font-mono)", fontSize: 11 }}
              title="次の商品 (→)"
            >次 →</button>
          </div>

          {/* キーボードヒント */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {[["Esc","閉じる"],["Enter","スタジオへ"],["Ctrl+S","保存/編集"],["←→","前後の商品"]].map(([k,v]) => (
              <span key={k} style={{ fontSize: 9, color: "var(--text-dim)" }}>
                <kbd style={{ background: "var(--bg2)", border: "1px solid var(--border)", padding: "1px 5px", borderRadius: 2 }}>{k}</kbd> {v}
              </span>
            ))}
          </div>

          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>✕</button>
        </div>

        {/* 商品ヘッダー */}
        <div style={{ display: "flex", gap: 14, marginBottom: 20 }}>
          {rb?.imageUrl && (
            <img src={rb.imageUrl} alt="" style={{ width: 64, height: 64, objectFit: "contain", border: "1px solid var(--border)", flexShrink: 0 }} />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
              <StatusBadge status={status} />
              {(item.mainCategory || item.category) && <Tag color="gray">{item.mainCategory || item.category}</Tag>}
              {item.subCategory && <Tag color="blue">{item.subCategory}</Tag>}
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {sources.map(s => <SourceTag key={s} source={s} />)}
              </div>
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.3, marginBottom: 4 }}>{item.label}</div>
            {item.brand && <div style={{ fontSize: 11, color: "var(--text-dim)" }}>{item.brand}</div>}
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: cfg.color }}>{item.score}点</div>
            <div style={{ fontSize: 9, color: "var(--text-dim)" }}>UpGear</div>
          </div>
        </div>

        {/* アクション */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          <Btn small onClick={() => { onWizard(item); onClose(); }}>{card ? "再分析・編集" : "商品理解AIを実行"}</Btn>
          {onNavToStudio && (
            <Btn small variant="primary" onClick={() => { onNavToStudio(item.id); onClose(); }}>▣ 制作スタジオ</Btn>
          )}
          {onDelete && (
            <Btn small variant="danger" onClick={() => { onDelete(item.id); onClose(); }}>削除</Btn>
          )}
        </div>

        {/* Status banner */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: cfg.bg, border: `1px solid ${cfg.color}`, marginBottom: 14 }}>
          <StatusBadge status={status} />
          {item.analysisAt && (
            <span style={{ fontSize: 9, color: "var(--text-dim)", marginLeft: "auto" }}>
              {new Date(item.analysisAt).toLocaleString("ja-JP")}
            </span>
          )}
        </div>

        {/* 不足情報 */}
        {(item.missingReasons || []).length > 0 && (
          <div style={{ background: "rgba(224,108,117,0.08)", border: "1px solid rgba(224,108,117,0.3)", padding: "8px 12px", marginBottom: 14 }}>
            <div style={{ fontSize: 9, color: "#e06c75", letterSpacing: "0.15em", marginBottom: 4 }}>不足情報</div>
            {item.missingReasons.map((r, i) => (
              <div key={i} style={{ fontSize: 10, color: "var(--text-dim)", padding: "2px 0" }}>· {r}</div>
            ))}
          </div>
        )}

        {/* 2カラムグリッド */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          {/* 楽天API */}
          <Section title="楽天APIデータ" color="#e07b4c">
            <Row label="価格"         value={rb?.price ? `¥${Number(rb.price).toLocaleString()}` : null} />
            <Row label="レビュー"     value={rb?.reviewCount ? `★${rb.reviewAverage} (${rb.reviewCount?.toLocaleString()}件)` : null} />
            <Row label="ショップ"     value={rb?.shopName} />
            <Row label="楽天URL"      value={rb?.url} link />
            {!rb && <div style={{ fontSize: 10, color: "var(--text-dim)" }}>未取得</div>}
          </Section>

          {/* Playwright */}
          <Section title="Playwrightデータ" color="#6fa8dc">
            <Row label="大カテゴリ"   value={item.mainCategory || card?.mainCategory || card?.category} />
            <Row label="小カテゴリ"   value={item.subCategory || card?.subCategory} />
            <Row label="判定根拠"     value={card?.categorySource} />
            <Row label="信頼度"       value={card?.categoryConfidence ? `${card.categoryConfidence}%` : null} />
            {!card && <div style={{ fontSize: 10, color: "var(--text-dim)" }}>未実行</div>}
          </Section>
        </div>

        {/* Claude AI */}
        {card && (
          <Section title="Claude AI解析" color="#98c379">
            {card.understandingScore != null && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 10, color: "var(--text-dim)" }}>商品理解スコア</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#98c379" }}>{card.understandingScore}点</span>
                </div>
                <div style={{ height: 3, background: "var(--border)" }}>
                  <div style={{ width: `${card.understandingScore}%`, height: "100%", background: "#98c379" }} />
                </div>
              </div>
            )}
            <Row label="商品説明"       value={card.whatIsThis} />
            <Row label="課題解決"       value={card.whatItSolves} />
            <Row label="向いている人"   value={card.forWho} />
            <Row label="向いていない人" value={(card.notForWho || []).join(" / ")} />
            <Row label="強み"           value={(card.strengths || []).join("、")} />
            <Row label="弱み"           value={(card.weaknesses || []).join("、")} />
          </Section>
        )}

        {/* 検索キーワード */}
        {card?.searchKeywords?.length > 0 && (
          <Section title="検索キーワード" color="#98c379">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {card.searchKeywords.map((kw) => (
                <span key={kw} style={{ fontSize: 10, background: "var(--bg2)", border: "1px solid var(--border)", padding: "2px 8px" }}>{kw}</span>
              ))}
            </div>
          </Section>
        )}

        {/* 参照URL */}
        {item.urls && Object.values(item.urls).some(Boolean) && (
          <Section title="参照URL">
            {Object.entries(item.urls).filter(([, v]) => v).map(([k, v]) => (
              <div key={k} style={{ display: "flex", gap: 8, padding: "3px 0", alignItems: "center" }}>
                <span style={{ fontSize: 9, color: "var(--text-dim)", width: 70, flexShrink: 0 }}>{k}</span>
                <a href={v} target="_blank" rel="noreferrer" style={{ fontSize: 10, color: "#6fa8dc", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{v}</a>
              </div>
            ))}
          </Section>
        )}
      </div>
    </div>
  );
}

// ─── DetailPanel (右ペイン) ───────────────────────────────────────────────────

function DetailPanel({ item, onWizard, onNavToStudio, onDelete, onOpenModal }) {
  if (!item) return (
    <div style={{ padding: "60px 20px", textAlign: "center", color: "var(--text-dim)", fontSize: 13 }}>
      <div style={{ marginBottom: 8 }}>アイテムを選択してください</div>
      <div style={{ fontSize: 10, color: "var(--text-dim)" }}>ダブルクリックで商品理解を開く</div>
    </div>
  );

  const card = item.card;
  const rb = item.rakuten || card?.rakuten;
  const status = getItemStatus(item);
  const cfg = STATUS_CONFIG[status];

  const sources = [];
  if (rb) sources.push("楽天API");
  if (card?.fetchedAt) sources.push("Playwright");
  if (card?.whatIsThis) sources.push("Claude AI");
  if (sources.length === 0) sources.push("手動");

  return (
    <div>
      {/* Actions */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", justifyContent: "flex-end" }}>
        <Btn small onClick={onOpenModal}>詳細を開く</Btn>
        <Btn small onClick={() => onWizard(item)}>{card ? "再分析・編集" : "商品理解AIを実行"}</Btn>
        {onNavToStudio && <Btn small variant="primary" onClick={() => onNavToStudio(item.id)}>▣ 制作スタジオ</Btn>}
        {onDelete && <Btn small variant="danger" onClick={() => onDelete(item.id)}>削除</Btn>}
      </div>

      {/* Status banner */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: cfg.bg, border: `1px solid ${cfg.color}`, marginBottom: 16 }}>
        <StatusBadge status={status} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {sources.map(s => <SourceTag key={s} source={s} />)}
        </div>
        {item.analysisAt && (
          <span style={{ fontSize: 9, color: "var(--text-dim)", marginLeft: "auto" }}>
            {new Date(item.analysisAt).toLocaleString("ja-JP")}
          </span>
        )}
      </div>

      {/* Missing reasons */}
      {(item.missingReasons || []).length > 0 && (
        <div style={{ background: "rgba(224,108,117,0.08)", border: "1px solid rgba(224,108,117,0.3)", padding: "10px 14px", marginBottom: 16 }}>
          <div style={{ fontSize: 9, color: "#e06c75", letterSpacing: "0.15em", marginBottom: 6 }}>不足情報</div>
          {item.missingReasons.map((r, i) => (
            <div key={i} style={{ fontSize: 10, color: "var(--text-dim)", padding: "2px 0" }}>· {r}</div>
          ))}
        </div>
      )}

      {/* 楽天APIデータ */}
      <Section title="楽天API取得データ" color="#e07b4c">
        <Row label="商品名"         value={rb?.name} source="楽天API" />
        <Row label="価格"           value={rb?.price ? `¥${Number(rb.price).toLocaleString()}` : null} source="楽天API" />
        <Row label="レビュー件数"   value={rb?.reviewCount ? `${rb.reviewCount.toLocaleString()}件` : null} source="楽天API" />
        <Row label="レビュー平均"   value={rb?.reviewAverage ? `★${rb.reviewAverage}` : null} source="楽天API" />
        <Row label="楽天商品URL"    value={rb?.url} source="楽天API" link />
        <Row label="アフィリエイトURL" value={rb?.url} source="楽天API" link />
        <Row label="ショップ名"     value={rb?.shopName} source="楽天API" />
        {rb?.imageUrl && (
          <div style={{ padding: "8px 0" }}>
            <span style={{ fontSize: 10, color: "var(--text-dim)", display: "block", marginBottom: 4 }}>画像</span>
            <img src={rb.imageUrl} alt="商品画像" style={{ maxWidth: 80, maxHeight: 80, objectFit: "contain", border: "1px solid var(--border)" }} />
          </div>
        )}
        {!rb && <div style={{ fontSize: 11, color: "var(--text-dim)", padding: "8px 0" }}>楽天API未取得</div>}
      </Section>

      <Section title="Playwright取得データ" color="#6fa8dc">
        <Row label="ブランド"     value={card?.brand} source="Playwright" />
        <Row label="大カテゴリ"   value={item.mainCategory || card?.mainCategory || card?.category} source="Playwright" />
        <Row label="小カテゴリ"   value={item.subCategory || card?.subCategory} source="Playwright" />
        <Row label="判定根拠"     value={card?.categorySource} source="Playwright" />
        <Row label="信頼度"       value={card?.categoryConfidence ? `${card.categoryConfidence}%` : null} source="Playwright" />
        <Row label="レビュー平均" value={card?.reviewData?.avg ? `★${card.reviewData.avg}` : null} source="Playwright" />
        <Row label="レビュー件数" value={card?.reviewData?.count ? `${card.reviewData.count.toLocaleString()}件` : null} source="Playwright" />
        {!card && <div style={{ fontSize: 11, color: "var(--text-dim)", padding: "8px 0" }}>Playwright未実行</div>}
      </Section>

      {card && (
        <Section title="Claude AI解析データ" color="#98c379">
          {card.understandingScore != null && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 10, color: "var(--text-dim)" }}>商品理解スコア</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#98c379" }}>{card.understandingScore}点</span>
              </div>
              <div style={{ height: 4, background: "var(--border)" }}>
                <div style={{ width: `${card.understandingScore}%`, height: "100%", background: "#98c379" }} />
              </div>
              {(card.missingFields || []).length > 0 && (
                <div style={{ fontSize: 9, color: "var(--text-dim)", marginTop: 4 }}>
                  不足: {card.missingFields.join("、")}
                </div>
              )}
            </div>
          )}
          <Row label="商品説明"     value={card.whatIsThis} source="Claude AI" />
          <Row label="課題解決"     value={card.whatItSolves} source="Claude AI" />
          <Row label="向いている人" value={card.forWho} source="Claude AI" />
          <Row label="向いていない人" value={(card.notForWho || []).join(" / ")} source="Claude AI" />
          <Row label="強み"         value={(card.strengths || []).join("、")} source="Claude AI" />
          <Row label="弱み"         value={(card.weaknesses || []).join("、")} source="Claude AI" />
        </Section>
      )}

      <Section title="UpGear評価">
        <Row label="UpGearスコア" value={`${item.score}点`} />
        <Row label="判定"         value={item.judgment} />
        <Row label="価格（手動）" value={item.price ? `¥${Number(item.price).toLocaleString()}` : null} />
      </Section>

      {card?.searchKeywords?.length > 0 && (
        <Section title="検索キーワード" color="#98c379">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {card.searchKeywords.map((kw) => (
              <span key={kw} style={{ fontSize: 11, background: "var(--bg2)", border: "1px solid var(--border)", padding: "3px 10px" }}>{kw}</span>
            ))}
          </div>
        </Section>
      )}

      {item.urls && Object.values(item.urls).some(Boolean) && (
        <Section title="参照URL">
          {Object.entries(item.urls).filter(([, v]) => v).map(([k, v]) => (
            <div key={k} style={{ display: "flex", gap: 8, padding: "4px 0", alignItems: "center" }}>
              <span style={{ fontSize: 10, color: "var(--text-dim)", width: 80, flexShrink: 0 }}>{k}</span>
              <a href={v} target="_blank" rel="noreferrer" style={{ fontSize: 10, color: "#6fa8dc", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{v}</a>
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({ title, color = "var(--accent)", children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 9, color, letterSpacing: "0.2em", borderLeft: `2px solid ${color}`, paddingLeft: 8, marginBottom: 10 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Row({ label, value, source, link }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", gap: 10, padding: "5px 0", borderBottom: "1px solid var(--border)", alignItems: "flex-start" }}>
      <span style={{ fontSize: 10, color: "var(--text-dim)", width: 110, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 11, lineHeight: 1.5, flex: 1, wordBreak: "break-all" }}>
        {link ? (
          <a href={value} target="_blank" rel="noreferrer" style={{ color: "#6fa8dc" }}>{value}</a>
        ) : value}
      </span>
      {source && <SourceTag source={source} />}
    </div>
  );
}

// ─── Main Stock page ─────────────────────────────────────────────────────────

export default function Stock({ data, addItem, updateItem, deleteItem, selectedItemId, setSelectedItemId, onNavToStudio }) {
  const { items } = data;
  const [selectedId, setSelectedId] = useState(selectedItemId || null);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardItem, setWizardItem] = useState(null);
  const [filter, setFilter] = useState("all");
  const [catFilter, setCatFilter] = useState("all");
  const [subCatFilter, setSubCatFilter] = useState("all");
  const [modalItemId, setModalItemId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef(null);

  const selectedItem = items.find((i) => i.id === selectedId) || null;
  const modalItem = items.find((i) => i.id === modalItemId) || null;

  const openWizard = (item = null) => {
    setWizardItem(item);
    setShowWizard(true);
  };

  const handleSave = (item) => {
    if (items.find((i) => i.id === item.id)) {
      updateItem(item.id, item);
    } else {
      addItem(item);
    }
    setSelectedId(item.id);
    setSelectedItemId?.(item.id);
  };

  const handleDelete = (id) => {
    if (!confirm("削除しますか？")) return;
    deleteItem(id);
    setSelectedId(null);
  };

  const countByStatus = (s) => items.filter((i) => getItemStatus(i) === s).length;

  const FILTERS = [
    { id: "all",      label: `すべて (${items.length})` },
    { id: "認定",     label: `認定 (${countByStatus("認定")})` },
    { id: "条件付き", label: `条件付き (${countByStatus("条件付き")})` },
    { id: "要確認",   label: `要確認 (${countByStatus("要確認")})` },
    { id: "未分析",   label: `未分析 (${countByStatus("未分析")})` },
    { id: "非認定",   label: `非認定 (${countByStatus("非認定")})` },
  ];

  const getItemMainCat = (i) => i.mainCategory || i.category || "";
  const getItemSubCat  = (i) => i.subCategory || "";

  const filtered = items.filter((i) => {
    if (filter !== "all" && getItemStatus(i) !== filter) return false;
    if (catFilter !== "all" && getItemMainCat(i) !== catFilter) return false;
    if (subCatFilter !== "all" && getItemSubCat(i) !== subCatFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (i.label || "").toLowerCase().includes(q) ||
             (i.brand || "").toLowerCase().includes(q) ||
             (i.subCategory || "").toLowerCase().includes(q);
    }
    return true;
  });

  const subCatsInCurrentFilter = catFilter !== "all"
    ? (CATEGORY_TREE[catFilter]?.subCategories || [])
    : [];

  // 一覧画面のキーボードショートカット
  useEffect(() => {
    if (showWizard || modalItemId) return;
    const handle = (e) => {
      if (!selectedItem) return;
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

      if (e.key === "Delete") { handleDelete(selectedItem.id); return; }
      if (e.key === "F2") { e.preventDefault(); openWizard(selectedItem); return; }
      if (e.key === "d" && e.ctrlKey) {
        e.preventDefault();
        const dup = { ...selectedItem, id: `item_${Date.now()}`, no: "—", label: `${selectedItem.label}（コピー）` };
        addItem(dup);
        return;
      }
      if (e.key === "f" && e.ctrlKey) {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }
      if (e.key === "Enter") {
        setModalItemId(selectedItem.id);
        return;
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [selectedItem, showWizard, modalItemId]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <PageHeader
          title="ストック"
          sub={`商品データベース — ${items.length}件 / 認定 ${countByStatus("認定")}件 / 条件付き ${countByStatus("条件付き")}件`}
        />
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* 検索バー */}
          <input
            ref={searchRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="検索... (Ctrl+F)"
            style={{
              background: "var(--bg2)", border: "1px solid var(--border)",
              color: "var(--text)", fontFamily: "var(--font-mono)", fontSize: 11,
              padding: "5px 10px", width: 180,
            }}
          />
          <Btn variant="primary" onClick={() => openWizard()}>+ 新規アイテム登録</Btn>
        </div>
      </div>

      {/* ショートカットヒント */}
      <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        {[["ダブルクリック","商品理解を開く"],["Delete","削除"],["F2","編集"],["Ctrl+D","複製"],["Ctrl+F","検索"]].map(([k,v]) => (
          <span key={k} style={{ fontSize: 9, color: "var(--text-dim)" }}>
            <kbd style={{ background: "var(--bg2)", border: "1px solid var(--border)", padding: "1px 5px", borderRadius: 2, fontFamily: "var(--font-mono)" }}>{k}</kbd>
            {" "}{v}
          </span>
        ))}
      </div>

      {/* Category filter */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
        {[{ id: "all", label: `すべて (${items.length})` }, ...MAIN_CATEGORIES.map(c => ({
          id: c,
          label: `${c} (${items.filter(i => getItemMainCat(i) === c).length})`,
        }))].map((f) => (
          <button key={f.id} onClick={() => { setCatFilter(f.id); setSubCatFilter("all"); }} style={{
            padding: "4px 10px", background: "none", fontFamily: "var(--font-mono)",
            border: `1px solid ${catFilter === f.id ? "var(--accent)" : "var(--border)"}`,
            color: catFilter === f.id ? "var(--accent)" : "var(--text-dim)",
            fontSize: 10, cursor: "pointer",
          }}>{f.label}</button>
        ))}
      </div>

      {/* Sub-category filter */}
      {subCatsInCurrentFilter.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8, paddingLeft: 12, borderLeft: "2px solid var(--border)" }}>
          <button onClick={() => setSubCatFilter("all")} style={{
            padding: "3px 8px", background: "none", fontFamily: "var(--font-mono)",
            border: `1px solid ${subCatFilter === "all" ? "var(--accent)" : "var(--border)"}`,
            color: subCatFilter === "all" ? "var(--accent)" : "var(--text-dim)",
            fontSize: 9, cursor: "pointer",
          }}>すべて</button>
          {subCatsInCurrentFilter.map((s) => {
            const cnt = items.filter(i => getItemMainCat(i) === catFilter && getItemSubCat(i) === s).length;
            if (cnt === 0) return null;
            return (
              <button key={s} onClick={() => setSubCatFilter(s)} style={{
                padding: "3px 8px", background: "none", fontFamily: "var(--font-mono)",
                border: `1px solid ${subCatFilter === s ? "#6fa8dc" : "var(--border)"}`,
                color: subCatFilter === s ? "#6fa8dc" : "var(--text-dim)",
                fontSize: 9, cursor: "pointer",
              }}>{s} ({cnt})</button>
            );
          })}
        </div>
      )}

      {/* Status filter tabs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
        {FILTERS.map((f) => {
          const cfg = STATUS_CONFIG[f.id];
          return (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{
              padding: "5px 12px", background: "none", fontFamily: "var(--font-mono)",
              border: `1px solid ${filter === f.id ? (cfg?.color || "var(--accent)") : "var(--border)"}`,
              color: filter === f.id ? (cfg?.color || "var(--accent)") : "var(--text-dim)",
              fontSize: 11, cursor: "pointer",
            }}>{f.label}</button>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 16 }}>
        {/* List */}
        <div>
          {filtered.length === 0 ? (
            <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-dim)", fontSize: 12 }}>
              {searchQuery ? `"${searchQuery}" に一致するアイテムがありません` : "アイテムがありません"}
              <br />
              {!searchQuery && (
                <button onClick={() => openWizard()} style={{ marginTop: 12, background: "none", border: "1px solid var(--accent)", color: "var(--accent)", padding: "6px 14px", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 11 }}>
                  + 登録する
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {filtered.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  selected={selectedId === item.id}
                  onClick={() => {
                    setSelectedId(item.id);
                    setSelectedItemId?.(item.id);
                  }}
                  onDoubleClick={() => setModalItemId(item.id)}
                  onWizard={openWizard}
                  onNavToStudio={onNavToStudio}
                />
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", padding: "20px 24px", overflowY: "auto", maxHeight: "calc(100vh - 180px)" }}>
          <DetailPanel
            item={selectedItem}
            onWizard={openWizard}
            onNavToStudio={onNavToStudio}
            onDelete={handleDelete}
            onOpenModal={() => selectedItem && setModalItemId(selectedItem.id)}
          />
        </div>
      </div>

      {/* CardModal — ダブルクリックで開く商品理解モーダル */}
      {modalItem && (
        <CardModal
          item={modalItem}
          items={filtered}
          onClose={() => setModalItemId(null)}
          onWizard={openWizard}
          onNavToStudio={onNavToStudio}
          onDelete={handleDelete}
          onNavigate={(id) => {
            setModalItemId(id);
            setSelectedId(id);
            setSelectedItemId?.(id);
          }}
        />
      )}

      {/* Wizard overlay */}
      {showWizard && (
        <ItemWizard
          existingItem={wizardItem}
          onSave={handleSave}
          onGoToStudio={(itemId) => { setSelectedItemId?.(itemId); onNavToStudio?.(itemId); }}
          onClose={() => { setShowWizard(false); setWizardItem(null); }}
        />
      )}
    </div>
  );
}
