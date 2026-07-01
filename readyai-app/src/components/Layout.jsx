export default function Layout({ page, onNav, children }) {
  const nav = [
    { id: 'home',     label: 'ホーム' },
    { id: 'products', label: '商品一覧' },
    { id: 'rankings', label: 'ランキング' },
    { id: 'search',   label: '検索' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        borderBottom: '1px solid #1e1e1e',
        background: 'rgba(10,10,10,0.95)',
        backdropFilter: 'blur(10px)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', height: 56, gap: 32 }}>
          <button
            onClick={() => onNav('home')}
            style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
          >
            <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--accent)' }}>READY</span>
            <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' }}>AI</span>
          </button>

          <nav style={{ display: 'flex', gap: 4, flex: 1 }}>
            {nav.map(n => (
              <button
                key={n.id}
                onClick={() => onNav(n.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: `2px solid ${page === n.id ? 'var(--accent)' : 'transparent'}`,
                  color: page === n.id ? 'var(--text)' : 'var(--text-dim)',
                  fontSize: 13, padding: '4px 12px',
                  cursor: 'pointer', fontWeight: page === n.id ? 600 : 400,
                }}
              >
                {n.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main */}
      <main style={{ flex: 1, maxWidth: 1100, margin: '0 auto', width: '100%', padding: '32px 24px' }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '24px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>
          Powered by <span style={{ color: 'var(--accent)' }}>UpGear OS</span> — 判断を減らすための装備
        </p>
      </footer>
    </div>
  );
}
