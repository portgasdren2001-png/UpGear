import { useState, useEffect } from 'react';
import { fetchProducts, fetchCategories } from '../api/client.js';
import ProductCard from '../components/ProductCard.jsx';

export default function ProductList({ initialCategory, onProduct }) {
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [total,      setTotal]      = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  const [category, setCategory] = useState(initialCategory || '');
  const [verdict,  setVerdict]  = useState('');
  const [offset,   setOffset]   = useState(0);
  const LIMIT = 24;

  useEffect(() => {
    fetchCategories()
      .then(d => setCategories(d.categories || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchProducts({ category, limit: LIMIT, offset })
      .then(d => {
        let items = d.items || [];
        if (verdict) items = items.filter(p => p.verdict === verdict);
        setProducts(items);
        setTotal(d.total || 0);
        setLoading(false);
      })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [category, offset]);

  const handleCategoryChange = (c) => { setCategory(c); setOffset(0); };

  const verdicts = ['認定', '条件付き', '非認定'];

  const filtered = verdict ? products.filter(p => p.verdict === verdict) : products;

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>商品一覧</h1>
      <p style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 28 }}>全{total}件のギアを収録</p>

      {/* フィルター */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
        <FilterBtn active={!category} onClick={() => handleCategoryChange('')}>すべて</FilterBtn>
        {categories.filter(c => c.count > 0).map(c => (
          <FilterBtn key={c.name} active={category === c.name} onClick={() => handleCategoryChange(c.name)}>
            {c.name} <span style={{ opacity: 0.6, fontSize: 10 }}>{c.count}</span>
          </FilterBtn>
        ))}
      </div>

      {/* 認定フィルター */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        <FilterBtn small active={!verdict} onClick={() => setVerdict('')}>すべて</FilterBtn>
        {verdicts.map(v => (
          <FilterBtn key={v} small active={verdict === v} onClick={() => setVerdict(verdict === v ? '' : v)}>{v}</FilterBtn>
        ))}
      </div>

      {loading && <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>読み込み中...</p>}
      {error && <p style={{ color: '#e06c75', fontSize: 13 }}>エラー: {error}</p>}
      {!loading && filtered.length === 0 && (
        <div style={{ padding: '48px 0', textAlign: 'center', border: '1px dashed var(--border)', color: 'var(--text-dim)', fontSize: 13 }}>
          商品が見つかりませんでした
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {filtered.map(p => (
          <ProductCard key={p.id} product={p} onClick={() => onProduct(p.id)} />
        ))}
      </div>

      {/* ページネーション */}
      {total > LIMIT && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 32 }}>
          {offset > 0 && (
            <PageBtn onClick={() => setOffset(Math.max(0, offset - LIMIT))}>← 前</PageBtn>
          )}
          <span style={{ fontSize: 12, color: 'var(--text-dim)', padding: '8px 12px' }}>
            {offset + 1}–{Math.min(offset + LIMIT, total)} / {total}
          </span>
          {offset + LIMIT < total && (
            <PageBtn onClick={() => setOffset(offset + LIMIT)}>次 →</PageBtn>
          )}
        </div>
      )}
    </div>
  );
}

function FilterBtn({ active, onClick, children, small }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? 'rgba(255,107,0,0.1)' : 'none',
        border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
        color: active ? 'var(--accent)' : 'var(--text-dim)',
        padding: small ? '4px 12px' : '6px 16px',
        fontSize: small ? 11 : 13,
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

function PageBtn({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}
    >
      {children}
    </button>
  );
}
