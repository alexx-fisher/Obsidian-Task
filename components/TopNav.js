'use client';

export default function TopNav({ onMenuClick }) {
  return (
    <>
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 64, zIndex: 100,
        background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <button onClick={onMenuClick} className="menu-btn" style={{
            display: 'none', background: 'none', border: 'none',
            color: 'var(--text-secondary)', padding: 6, borderRadius: 8, cursor: 'pointer',
          }}>
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 26, height: 26, borderRadius: 8, background: 'linear-gradient(140deg, #7c6cff, #5a3fe0)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><polyline stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points="4 12 10 18 20 6" /></svg>
            </div>
            <span style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)' }}>Tudu</span>
          </div>
          <div className="search-wrap" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--surface-2)', borderRadius: 10,
            padding: '9px 14px', width: 260, border: '1px solid transparent',
            transition: 'border-color .15s, background .15s',
          }}>
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24">
              <path stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input placeholder="Быстрый поиск…" style={{
              background: 'none', border: 'none', outline: 'none',
              fontSize: 14, color: 'var(--text)', width: '100%',
            }}
              onFocus={e => { e.target.parentElement.style.background = 'var(--surface)'; e.target.parentElement.style.borderColor = 'var(--border-strong)'; }}
              onBlur={e => { e.target.parentElement.style.background = 'var(--surface-2)'; e.target.parentElement.style.borderColor = 'transparent'; }} />
          </div>
        </div>

        <div className="topnav-phrase" style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontStyle: 'italic', color: 'var(--text-muted)', letterSpacing: '0.01em' }}>
            «Меньше думай. Больше делай»
          </span>
        </div>
      </header>

      <style jsx global>{`
        @media (max-width: 768px) {
          .menu-btn { display: flex !important; }
          .search-wrap { display: none !important; }
          .topnav-phrase { display: none !important; }
        }
      `}</style>
    </>
  );
}
