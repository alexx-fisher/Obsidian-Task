'use client';
import { useState, useRef } from 'react';

const COLORS = ['#ba9eff','#68fcbf','#699cff','#ff6e84','#ffd166','#f77f00'];
const colorFor = (i) => COLORS[i % COLORS.length];

export default function Sidebar({ projects, activeProjectId, activeScreen, onProjectClick, onOverview, onToday, onUpcoming, onTrash, trashedCount, onAddProject, onReorderProjects, isOpen, onClose }) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const dragIdx = useRef(null);
  const dragOverIdx = useRef(null);

  const handleAdd = () => {
    if (newName.trim()) { onAddProject(newName.trim()); setNewName(''); setAdding(false); }
  };

  const handleDragStart = (i) => { dragIdx.current = i; };
  const handleDragOver = (e, i) => { e.preventDefault(); dragOverIdx.current = i; };
  const handleDrop = () => {
    if (dragIdx.current === null || dragOverIdx.current === null) return;
    const reordered = [...projects];
    const [moved] = reordered.splice(dragIdx.current, 1);
    reordered.splice(dragOverIdx.current, 0, moved);
    onReorderProjects(reordered);
    dragIdx.current = null;
    dragOverIdx.current = null;
  };

  const navItems = [
    { label: 'Обзор', screen: 'dashboard', action: onOverview, icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/></svg> },
    { label: 'Сегодня', screen: 'today', action: onToday, icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><path stroke="currentColor" strokeWidth="2" d="M16 2v4M8 2v4M3 10h18"/><circle cx="12" cy="16" r="2" fill="currentColor"/></svg> },
    { label: 'Предстоящее', screen: 'upcoming', action: onUpcoming, icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><path stroke="currentColor" strokeWidth="2" d="M16 2v4M8 2v4M3 10h18M8 14h8M8 18h5"/></svg> },
  ];

  return (
    <>
      {isOpen && <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 39 }}/>}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`} style={{
        width: 256, background: '#000',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', flexDirection: 'column', padding: '20px 16px',
        height: 'calc(100vh - 64px)', position: 'fixed', top: 64, left: 0,
        overflowY: 'auto', boxShadow: '20px 0 40px rgba(0,0,0,0.4)', zIndex: 40,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 8px', marginBottom: 28 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(186,158,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="#ba9eff" d="M12 2L2 7l10 5 10-5-10-5zm0 13L2 10v7l10 5 10-5v-7l-10 5z"/></svg>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#e8eaff' }}>Проекты</div>
            <div style={{ fontSize: 11, color: 'var(--outline)', marginTop: 2 }}>Рабочее пространство</div>
          </div>
        </div>

        <nav style={{ flex: 1 }}>
          {navItems.map((item) => (
            <button key={item.label} onClick={item.action} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
              borderRadius: 8, fontSize: 14, fontWeight: 500,
              color: activeScreen === item.screen ? 'var(--primary)' : 'var(--on-surface-variant)',
              background: activeScreen === item.screen ? 'rgba(186,158,255,0.1)' : 'none',
              border: 'none', width: '100%', textAlign: 'left', marginBottom: 2, transition: 'all .2s', cursor: 'pointer',
            }}
            onMouseEnter={e => { if (activeScreen !== item.screen) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
            onMouseLeave={e => { if (activeScreen !== item.screen) e.currentTarget.style.background = 'none'; }}>
              {item.icon}{item.label}
            </button>
          ))}

          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--outline)', padding: '20px 12px 10px' }}>
            Рабочее пространство
          </div>

          {projects.map((p, i) => (
            <div key={p.id} draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDrop={handleDrop}
              style={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
              <div style={{ padding: '10px 4px', cursor: 'grab', color: 'var(--outline)', opacity: 0.35, flexShrink: 0 }}>
                <svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor">
                  <circle cx="2" cy="3" r="1.5"/><circle cx="8" cy="3" r="1.5"/>
                  <circle cx="2" cy="8" r="1.5"/><circle cx="8" cy="8" r="1.5"/>
                  <circle cx="2" cy="13" r="1.5"/><circle cx="8" cy="13" r="1.5"/>
                </svg>
              </div>
              <button onClick={() => onProjectClick(p.id)} style={{
                flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 8px',
                borderRadius: 8, fontSize: 14, fontWeight: 500,
                color: activeProjectId === p.id && activeScreen === 'project' ? colorFor(i) : 'var(--on-surface-variant)',
                background: activeProjectId === p.id && activeScreen === 'project' ? `${colorFor(i)}15` : 'none',
                border: 'none', textAlign: 'left', transition: 'all .2s', cursor: 'pointer',
              }}
              onMouseEnter={e => { if (!(activeProjectId === p.id && activeScreen === 'project')) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={e => { if (!(activeProjectId === p.id && activeScreen === 'project')) e.currentTarget.style.background = 'none'; }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: colorFor(i), flexShrink: 0, boxShadow: `0 0 8px ${colorFor(i)}99` }}/>
                {p.name}
              </button>
            </div>
          ))}

          {adding ? (
            <div style={{ padding: '8px 4px' }}>
              <input autoFocus value={newName} onChange={e => setNewName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setAdding(false); }}
                placeholder="Название проекта..."
                style={{ width: '100%', background: 'var(--surface-high)', border: '1px solid var(--primary)', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: 'var(--on-surface)', outline: 'none', marginBottom: 8 }}/>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={handleAdd} style={{ flex: 1, background: 'var(--primary)', color: '#000', border: 'none', borderRadius: 6, padding: '6px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Добавить</button>
                <button onClick={() => setAdding(false)} style={{ flex: 1, background: 'var(--surface-high)', color: 'var(--on-surface-variant)', border: 'none', borderRadius: 6, padding: '6px', fontSize: 12, cursor: 'pointer' }}>Отмена</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setAdding(true)} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
              borderRadius: 8, fontSize: 14, fontWeight: 500, color: 'var(--primary)',
              background: 'none', border: 'none', width: '100%', marginTop: 8, transition: 'background .2s', cursor: 'pointer',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(186,158,255,0.05)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M12 8v8M8 12h8"/></svg>
              Создать проект
            </button>
          )}
        </nav>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 12, marginTop: 16 }}>
          <button onClick={onTrash} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
            borderRadius: 8, fontSize: 14, fontWeight: 500,
            color: activeScreen === 'trash' ? 'var(--error)' : 'var(--on-surface-variant)',
            background: activeScreen === 'trash' ? 'rgba(255,110,132,0.1)' : 'none',
            border: 'none', width: '100%', textAlign: 'left', transition: 'all .2s', cursor: 'pointer',
          }}
          onMouseEnter={e => { if (activeScreen !== 'trash') e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
          onMouseLeave={e => { if (activeScreen !== 'trash') e.currentTarget.style.background = 'none'; }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><polyline stroke="currentColor" strokeWidth="2" points="3 6 5 6 21 6"/><path stroke="currentColor" strokeWidth="2" d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/></svg>
            Корзина
            {trashedCount > 0 && (
              <span style={{ marginLeft: 'auto', background: 'rgba(255,110,132,0.15)', color: 'var(--error)', fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 999 }}>
                {trashedCount}
              </span>
            )}
          </button>
        </div>
      </aside>

      <style jsx global>{`
        @media (max-width: 768px) {
          .sidebar { transform: translateX(-100%); transition: transform .3s ease; }
          .sidebar.open { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
