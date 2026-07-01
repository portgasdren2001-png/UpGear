import { useState, useCallback } from 'react';
import { fetchProducts } from '../api/client.js';
import ProductCard from '../components/ProductCard.jsx';

export default function Search({ onProduct }) {
  const [query,    setQuery]    = useState('');
  const [results,  setResults]  = useState([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async (q) => {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const data = await fetchProducts({ q: q.trim(), limit: 50 });
      setResults(data.items || []);
      setTotal(data.total || 0);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    handleSearch(query);
  };

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>検索</h1>
      <p style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 28 }}>
        商品名・ブランド・カテゴリで検索できます
      </p>

      <form onSubmit={onSubmit} style={{ display: 'flex', gap: 10, marginBottom: 32 }}>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="キーワードを入力..."
          style={{
            flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)',
            color: 'var(--text)', padding: '10px 16px', fontSize: 14,
            outline: 'none',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
        <button
          type="submit"
          style={{
            background: 'var(--accent)', border: 'none', color: '#fff',
            padding: '10px 24px', fontSize: 14, cursor: 'pointer', fontWeight: 600,
          }}
        >
          検索
        </button>
      </form>

      {loading && <p style={{ color: 'var(--text-dim)' }}>検索中...</p>}
      {error   && <p style={{ color: '#e06c75' }}>エラー: {error}</p>}

      {searched && !loading && (
        <p style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 20 }}>
          「{query}」の検索結果: {total}件
        </p>
      )}

      {!loading && results.length === 0 && searched && (
        <div style={{ padding: '48px 0', textAlign: 'center', border: '1px dashed var(--border)', color: 'var(--text-dim)', fontSize: 13 }}>
          検索結果が見つかりませんでした
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {results.map(p => (
          <ProductCard key={p.id} product={p} onClick={() => onProduct(p.id)} />
        ))}
      </div>
    </div>
  );
}
