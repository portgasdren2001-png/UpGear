import { useApi } from '../components/useApi.js';
import { fetchRankings } from '../api/client.js';

export default function Rankings({ onProduct }) {
  const { data, loading, error } = useApi(fetchRankings);
  const rankings = data?.rankings || [];

  const verdictColor = v => ({
    '認定': 'var(--green)',
    '条件付き': 'var(--accent)',
    '非認定': '#666',
  }[v] || '#888');

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>ランキング</h1>
      <p style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 32 }}>
        UpGearスコアが高い順。「日常の判断を最も多く減らせる装備」が上位です。
      </p>

      {loading && <p style={{ color: 'var(--text-dim)' }}>読み込み中...</p>}
      {error && <p style={{ color: '#e06c75' }}>エラー: {error}</p>}
      {!loading && rankings.length === 0 && (
        <div style={{ padding: '48px 0', textAlign: 'center', border: '1px dashed var(--border)', color: 'var(--text-dim)', fontSize: 13 }}>
          まだランキングがありません。UpGear OSで商品を追加・同期してください。
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {rankings.map((item, idx) => {
          const vc = verdictColor(item.verdict);
          return (
            <div
              key={item.id}
              onClick={() => onProduct(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                background: 'var(--bg3)', border: '1px solid var(--border)',
                borderLeft: `3px solid ${vc}`,
                padding: '12px 16px', cursor: 'pointer',
                transition: 'border-color 0.12s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.borderLeftColor = vc;
              }}
            >
              {/* Rank */}
              <div style={{ width: 36, textAlign: 'center', flexShrink: 0 }}>
                <span style={{
                  fontSize: idx < 3 ? 18 : 14,
                  fontWeight: 800,
                  color: idx === 0 ? '#ffd700' : idx === 1 ? '#c0c0c0' : idx === 2 ? '#cd7f32' : 'var(--text-dim)',
                }}>
                  {idx + 1}
                </span>
              </div>

              {/* Image */}
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} style={{ width: 48, height: 48, objectFit: 'contain', flexShrink: 0, background: 'var(--bg2)' }} />
              ) : (
                <div style={{ width: 48, height: 48, background: 'var(--bg2)', flexShrink: 0 }} />
              )}

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                  {item.manualGenre && (
                    <span style={{ fontSize: 10, padding: '1px 6px', background: 'rgba(255,107,0,0.1)', color: 'var(--accent)', border: '1px solid var(--accent)' }}>
                      {item.manualGenre}
                    </span>
                  )}
                  {item.verdict && (
                    <span style={{ fontSize: 10, padding: '1px 6px', background: `${vc}18`, color: vc, border: `1px solid ${vc}` }}>
                      {item.verdict}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.name}
                </div>
              </div>

              {/* Score */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: vc }}>{item.upgearScore}</div>
                <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>点</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
