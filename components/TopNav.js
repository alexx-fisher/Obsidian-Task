'use client';

export default function TopNav({ onMenuClick }) {
  return (
    <>
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 64, zIndex: 100,
        background: 'rgba(6,14,32,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <button onClick={onMenuClick} className="menu-btn" style={{
            display: 'none', background: 'none', border: 'none',
            color: 'var(--on-surface-variant)', padding: 6, borderRadius: 8, cursor: 'pointer',
          }}>
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M3 6h18M3 12h18M3 18h18"/>
            </svg>
          </button>
          <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.05em', color: '#fff' }}>
            Obsidian Task
          </div>
          <div className="search-wrap" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--surface-low)', borderRadius: 999,
            padding: '8px 16px', width: 280,
          }}>
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24">
              <path stroke="#6d758c" strokeWidth="2" strokeLinecap="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
            </svg>
            <input placeholder="Быстрый поиск..." style={{
              background: 'none', border: 'none', outline: 'none',
              fontSize: 14, color: 'var(--on-surface)', width: '100%',
            }}/>
          </div>
        </div>

        {/* Мотивирующая фраза вместо вкладок */}
        <div className="topnav-phrase" style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 300, fontStyle: 'italic', color: 'var(--on-surface-variant)', letterSpacing: '0.02em' }}>
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
