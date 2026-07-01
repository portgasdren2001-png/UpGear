import { useApi } from '../components/useApi.js';
import { fetchRankings, fetchCategories, fetchSyncStatus } from '../api/client.js';
import ProductCard from '../components/ProductCard.jsx';

export default function Home({ onNav, onProduct }) {
  const rankings   = useApi(fetchRankings);
  const categories = useApi(fetchCategories);
  const syncStatus = useApi(fetchSyncStatus);

  const top5 = rankings.data?.rankings?.slice(0, 5) || [];
  const cats  = categories.data?.categories?.filter(c => c.count > 0) || [];

  return (
    <div>
      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '60px 0 48px', borderBottom: '1px solid var(--border)', marginBottom: 48 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.3em', color: 'var(--accent)', marginBottom: 16 }}>UPGEAR POWERED</div>
        <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 16, lineHeight: 1.2 }}>
          判断を減らす装備を、<br />ここで見つける
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-dim)', maxWidth: 480, margin: '0 auto 32px' }}>
          UpGearが厳選した「日常の迷いを消す道具」を紹介。
          コスパでもデザインでもなく、判断削減で評価します。
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => onNav('products')}
            style={{
              background: 'var(--accent)', color: '#fff', border: 'none',
              padding: '12px 28px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            商品を見る
          </button>
          <button
            onClick={() => onNav('rankings')}
            style={{
              background: 'none', color: 'var(--text)', border: '1px solid var(--border)',
              padding: '12px 28px', fontSize: 14, cursor: 'pointer',
            }}
          >
            ランキング
          </button>
        </div>

        {syncStatus.data && (
          <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 24 }}>
            {syncStatus.data.count}件のギアを収録 —
            最終更新: {syncStatus.data.syncedAt ? new Date(syncStatus.data.syncedAt).toLocaleDateString('ja-JP') : '未同期'}
          </p>
        )}
      </div>

      {/* カテゴリ */}
      {cats.length > 0 && (
        <section style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: 14, letterSpacing: '0.2em', color: 'var(--text-dim)', marginBottom: 20 }}>カテゴリ</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {cats.map(cat => (
              <button
                key={cat.name}
                onClick={() => onNav('products', { category: cat.name })}
                style={{
                  background: 'var(--bg3)', border: '1px solid var(--border)',
                  color: 'var(--text)', padding: '8px 18px', fontSize: 13, cursor: 'pointer',
                  transition: 'border-color 0.12s',
                }}
                onMouseEnter={e => e.target.style.borderColor = 'var(--accent)'}
                onMouseLeave={e => e.target.style.borderColor = 'var(--border)'}
              >
                {cat.name}
                <span style={{ fontSize: 11, color: 'var(--text-dim)', marginLeft: 6 }}>{cat.count}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 上位ランキング */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 14, letterSpacing: '0.2em', color: 'var(--text-dim)' }}>TOP GEAR</h2>
          <button onClick={() => onNav('rankings')} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 12, cursor: 'pointer' }}>
            すべて見る →
          </button>
        </div>
        {rankings.loading && <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>読み込み中...</p>}
        {rankings.error && <EmptyState message="データを取得できませんでした。UpGear OSで同期してください。" />}
        {!rankings.loading && !rankings.error && top5.length === 0 && (
          <EmptyState message="まだ商品が登録されていません。UpGear OSで商品を追加・同期してください。" />
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {top5.map(p => (
            <ProductCard key={p.id} product={p} onClick={() => onProduct(p.id)} />
          ))}
        </div>
      </section>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div style={{ padding: '48px 0', textAlign: 'center', border: '1px dashed var(--border)', color: 'var(--text-dim)', fontSize: 13 }}>
      {message}
    </div>
  );
}
