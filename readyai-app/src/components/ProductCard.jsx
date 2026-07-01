export default function ProductCard({ product, onClick }) {
  const score = product.upgearScore ?? null;
  const verdict = product.verdict || '';

  const verdictColor = {
    '認定': 'var(--green)',
    '条件付き': 'var(--accent)',
    '非認定': '#666',
    '情報不足': '#555',
  }[verdict] || '#888';

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--bg3)',
        border: '1px solid var(--border)',
        borderLeft: `3px solid ${verdictColor}`,
        padding: '16px',
        cursor: 'pointer',
        transition: 'border-color 0.12s, background 0.12s',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.borderLeftColor = verdictColor;
      }}
    >
      {/* 画像 */}
      {product.imageUrl && (
        <div style={{ marginBottom: 10, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg2)' }}>
          <img
            src={product.imageUrl}
            alt={product.name}
            style={{ maxHeight: 80, maxWidth: '100%', objectFit: 'contain' }}
          />
        </div>
      )}

      {/* Category + Verdict */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
        {product.manualGenre && (
          <span style={{ fontSize: 10, padding: '2px 8px', background: 'rgba(255,107,0,0.1)', color: 'var(--accent)', border: '1px solid var(--accent)' }}>
            {product.manualGenre}
          </span>
        )}
        {verdict && (
          <span style={{ fontSize: 10, padding: '2px 8px', background: `${verdictColor}18`, color: verdictColor, border: `1px solid ${verdictColor}` }}>
            {verdict}
          </span>
        )}
      </div>

      {/* Name */}
      <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.4, marginBottom: 4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
        {product.name || product.label}
      </div>

      {product.brand && (
        <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 8 }}>{product.brand}</div>
      )}

      {/* Score + Price */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {score != null ? (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: verdictColor }}>{score}</span>
            <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>点</span>
          </div>
        ) : <div />}
        {product.price && (
          <span style={{ fontSize: 12, color: 'var(--text)' }}>
            ¥{Number(product.price).toLocaleString()}
          </span>
        )}
      </div>

      {/* Review */}
      {product.reviewCount > 0 && (
        <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 6 }}>
          ★{product.reviewAvg} ({product.reviewCount?.toLocaleString()}件)
        </div>
      )}
    </div>
  );
}
