import { useApi } from '../components/useApi.js';
import { fetchProduct, fetchProducts } from '../api/client.js';

export default function ProductDetail({ id, onBack, onProduct }) {
  const { data, loading, error } = useApi(() => fetchProduct(id), [id]);
  const product = data?.product;

  const relatedApi = useApi(
    () => product ? fetchProducts({ category: product.mainCategory || product.category, limit: 5 }) : Promise.resolve({ items: [] }),
    [product?.mainCategory]
  );
  const related = (relatedApi.data?.items || []).filter(p => p.id !== id).slice(0, 4);

  if (loading) return <p style={{ color: 'var(--text-dim)', padding: '60px 0' }}>読み込み中...</p>;
  if (error || !product) return (
    <div style={{ padding: '60px 0', textAlign: 'center' }}>
      <p style={{ color: '#e06c75', marginBottom: 16 }}>商品が見つかりませんでした</p>
      <BackBtn onClick={onBack} />
    </div>
  );

  const verdictColor = { '認定': 'var(--green)', '条件付き': 'var(--accent)', '非認定': '#666' }[product.verdict] || '#888';
  const score = product.upgearScore;

  return (
    <div>
      <BackBtn onClick={onBack} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 40, marginTop: 24 }}>
        {/* Left */}
        <div>
          {/* ヘッダー */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              {product.manualGenre && <Badge color="var(--accent)">{product.manualGenre}</Badge>}
              {product.category && <Badge color="var(--text-dim)">{product.category}</Badge>}
              {product.subCategory && <Badge color="var(--text-dim)">{product.subCategory}</Badge>}
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.3, marginBottom: 8 }}>{product.name}</h1>
            {product.brand && <p style={{ fontSize: 14, color: 'var(--text-dim)' }}>{product.brand}</p>}
          </div>

          {/* UpGear評価 */}
          <div style={{ background: 'var(--bg3)', border: `1px solid ${verdictColor}`, borderLeft: `4px solid ${verdictColor}`, padding: '16px 20px', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
              {score != null && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 36, fontWeight: 800, color: verdictColor, lineHeight: 1 }}>{score}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>UpGearスコア</div>
                </div>
              )}
              <div>
                {product.verdict && (
                  <div style={{ fontSize: 16, fontWeight: 700, color: verdictColor, marginBottom: 4 }}>{product.verdict}</div>
                )}
                {product.verdictReason && (
                  <div style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.5 }}>{product.verdictReason}</div>
                )}
              </div>
            </div>
            {product.judgmentReducer && (
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, fontSize: 13, lineHeight: 1.6 }}>
                <span style={{ color: 'var(--accent)', fontWeight: 600 }}>何の判断を減らすか — </span>
                {product.judgmentReducer}
              </div>
            )}
          </div>

          {/* 向いている人 / 向いていない人 */}
          {(product.forWho || (product.notForWho || []).length > 0) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              {product.forWho && (
                <InfoBox title="向いている人" color="var(--green)">
                  <p style={{ fontSize: 13, lineHeight: 1.6 }}>{product.forWho}</p>
                </InfoBox>
              )}
              {(product.notForWho || []).length > 0 && (
                <InfoBox title="向いていない人" color="#e06c75">
                  {product.notForWho.map((t, i) => (
                    <p key={i} style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 4 }}>· {t}</p>
                  ))}
                </InfoBox>
              )}
            </div>
          )}

          {/* 日常で減る迷い */}
          {(product.dailyFrictionReduced || []).length > 0 && (
            <InfoBox title="日常で減る迷い・手間" color="var(--blue)" style={{ marginBottom: 24 }}>
              {product.dailyFrictionReduced.map((t, i) => (
                <p key={i} style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 4 }}>· {t}</p>
              ))}
            </InfoBox>
          )}

          {/* 継続使用できる理由 */}
          {product.continuityReason && (
            <InfoBox title="継続使用できる理由" color="var(--text-dim)" style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 13, lineHeight: 1.6 }}>{product.continuityReason}</p>
            </InfoBox>
          )}

          {/* 代替品との比較 */}
          {product.vsAlternatives && (
            <InfoBox title="代替品との比較" color="var(--text-dim)" style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 13, lineHeight: 1.6 }}>{product.vsAlternatives}</p>
            </InfoBox>
          )}

          {/* 強み・弱み */}
          {((product.strengths || []).length > 0 || (product.weaknesses || []).length > 0) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              {(product.strengths || []).length > 0 && (
                <InfoBox title="強み" color="var(--green)">
                  {product.strengths.map((s, i) => <p key={i} style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 4 }}>✓ {s}</p>)}
                </InfoBox>
              )}
              {(product.weaknesses || []).length > 0 && (
                <InfoBox title="弱み" color="#e06c75">
                  {product.weaknesses.map((w, i) => <p key={i} style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 4 }}>· {w}</p>)}
                </InfoBox>
              )}
            </div>
          )}

          {/* レビュー */}
          {(product.reviewCount > 0) && (
            <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', padding: '16px 20px', marginBottom: 24 }}>
              <div style={{ fontSize: 11, letterSpacing: '0.15em', color: 'var(--text-dim)', marginBottom: 10 }}>レビュー</div>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 700 }}>★{product.reviewAvg}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{product.reviewCount?.toLocaleString()}件</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div>
          {/* 画像 */}
          {product.imageUrl && (
            <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', padding: 16, marginBottom: 20, textAlign: 'center' }}>
              <img src={product.imageUrl} alt={product.name} style={{ maxWidth: '100%', maxHeight: 260, objectFit: 'contain' }} />
            </div>
          )}

          {/* 価格 */}
          {product.price && (
            <div style={{ marginBottom: 16, padding: '12px 16px', background: 'var(--bg3)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 4 }}>価格</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>¥{Number(product.price).toLocaleString()}</div>
            </div>
          )}

          {/* 購入リンク */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {product.rakutenUrl && (
              <BuyBtn href={product.rakutenUrl} color="#bf0000">楽天市場で購入</BuyBtn>
            )}
            {product.amazonUrl && (
              <BuyBtn href={product.amazonUrl} color="#ff9900">Amazonで購入</BuyBtn>
            )}
            {product.officialUrl && (
              <BuyBtn href={product.officialUrl} color="var(--border)" outline>公式サイト</BuyBtn>
            )}
          </div>

          {/* 使用シーン */}
          {(product.useScenes || []).length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, letterSpacing: '0.15em', color: 'var(--text-dim)', marginBottom: 10 }}>使用シーン</div>
              {product.useScenes.map((s, i) => (
                <div key={i} style={{ fontSize: 12, color: 'var(--text-dim)', padding: '4px 0', borderBottom: '1px solid var(--border)' }}>· {s}</div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 関連商品 */}
      {related.length > 0 && (
        <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: 14, letterSpacing: '0.2em', color: 'var(--text-dim)', marginBottom: 20 }}>同カテゴリの商品</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
            {related.map(p => (
              <div key={p.id} onClick={() => onProduct(p.id)} style={{ cursor: 'pointer' }}>
                <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', padding: 12 }}>
                  {p.imageUrl && <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: 80, objectFit: 'contain', marginBottom: 8 }} />}
                  <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.4, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{p.upgearScore}点 / {p.verdict}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: 13, cursor: 'pointer', padding: 0 }}>
      ← 戻る
    </button>
  );
}

function Badge({ color, children }) {
  return (
    <span style={{ fontSize: 10, padding: '2px 8px', border: `1px solid ${color}`, color, background: `${color}18` }}>
      {children}
    </span>
  );
}

function InfoBox({ title, color, children, style }) {
  return (
    <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderLeft: `3px solid ${color}`, padding: '14px 16px', ...style }}>
      <div style={{ fontSize: 11, color, letterSpacing: '0.12em', marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
}

function BuyBtn({ href, color, outline, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      style={{
        display: 'block', textAlign: 'center',
        background: outline ? 'none' : color,
        border: `1px solid ${color}`,
        color: outline ? color : '#fff',
        padding: '12px 20px', fontSize: 14, fontWeight: 600,
        cursor: 'pointer',
      }}
    >
      {children}
    </a>
  );
}
