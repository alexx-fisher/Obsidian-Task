'use client';
import { useState } from 'react';
import { projectColor } from '../lib/ui';
import SortableList from './SortableList';

export default function Sidebar({ projects, activeProjectId, activeScreen, onProjectClick, onOverview, onToday, onUpcoming, onTrash, trashedCount, onAddProject, onReorderProjects, isOpen, onClose }) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');

  const handleAdd = () => {
    if (newName.trim()) { onAddProject(newName.trim()); setNewName(''); setAdding(false); }
  };

  const navItems = [
    { label: 'Обзор', screen: 'dashboard', action: onOverview, icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" /><rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" /><rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" /><rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" /></svg> },
    { label: 'Сегодня', screen: 'today', action: onToday, icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" /><path stroke="currentColor" strokeWidth="2" d="M16 2v4M8 2v4M3 10h18" /><circle cx="12" cy="16" r="2" fill="currentColor" /></svg> },
    { label: 'Предстоящее', screen: 'upcoming', action: onUpcoming, icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" /><path stroke="currentColor" strokeWidth="2" d="M16 2v4M8 2v4M3 10h18M8 14h8M8 18h5" /></svg> },
  ];

  const itemStyle = (active) => ({
    display: 'flex', alignItems: 'center', gap: 11, padding: '9px 12px',
    borderRadius: 9, fontSize: 14, fontWeight: 500,
    color: active ? 'var(--primary)' : 'var(--text-secondary)',
    background: active ? 'var(--primary-soft)' : 'none',
    border: 'none', width: '100%', textAlign: 'left', marginBottom: 2,
    transition: 'all .15s', cursor: 'pointer',
  });

  return (
    <>
      {isOpen && <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(16,24,40,0.35)', zIndex: 39 }} />}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`} style={{
        width: 256, background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', padding: '18px 14px',
        height: 'calc(100vh - 64px)', position: 'fixed', top: 64, left: 0,
        overflowY: 'auto', zIndex: 40,
      }}>
        <div style={{ padding: '0 8px', marginBottom: 22 }}>
          <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-0.01em', color: 'var(--text)' }}>Проекты</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Рабочее пространство</div>
        </div>

        <nav style={{ flex: 1 }}>
          {navItems.map((item) => {
            const active = activeScreen === item.screen;
            return (
              <button key={item.label} onClick={item.action} style={itemStyle(active)}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--surface-2)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'none'; }}>
                {item.icon}{item.label}
              </button>
            );
          })}

          <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', padding: '18px 12px 8px' }}>
            Рабочее пространство
          </div>

          <SortableList items={projects} gap={2} onReorder={onReorderProjects}
            renderRow={(p, { dragging, index, handleProps }) => {
              const active = activeProjectId === p.id && activeScreen === 'project';
              return (
                <div style={{
                  display: 'flex', alignItems: 'center',
                  borderRadius: 9,
                  background: dragging ? 'var(--surface)' : 'none',
                  boxShadow: dragging ? 'var(--shadow-md)' : 'none',
                }}>
                  <span {...handleProps} onClick={e => e.stopPropagation()}
                    style={{ padding: '10px 4px', cursor: 'grab', color: 'var(--text-muted)', opacity: dragging ? 0.9 : 0.4, flexShrink: 0, display: 'flex', touchAction: 'none' }}>
                    <svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor">
                      <circle cx="2" cy="3" r="1.5" /><circle cx="8" cy="3" r="1.5" />
                      <circle cx="2" cy="8" r="1.5" /><circle cx="8" cy="8" r="1.5" />
                      <circle cx="2" cy="13" r="1.5" /><circle cx="8" cy="13" r="1.5" />
                    </svg>
                  </span>
                  <button onClick={() => { if (!dragging) onProjectClick(p.id); }} style={{
                    flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px',
                    borderRadius: 9, fontSize: 14, fontWeight: 500,
                    color: active ? 'var(--primary)' : 'var(--text-secondary)',
                    background: active ? 'var(--primary-soft)' : 'none',
                    border: 'none', textAlign: 'left', transition: 'background .15s, color .15s', cursor: 'pointer', minWidth: 0,
                  }}
                    onMouseEnter={e => { if (!active && !dragging) e.currentTarget.style.background = 'var(--surface-2)'; }}
                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'none'; }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: projectColor(index), flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                  </button>
                </div>
              );
            }} />

          {adding ? (
            <div style={{ padding: '8px 4px' }}>
              <input autoFocus value={newName} onChange={e => setNewName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setAdding(false); }}
                placeholder="Название проекта…"
                style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--primary)', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: 'var(--text)', outline: 'none', marginBottom: 8 }} />
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={handleAdd} style={{ flex: 1, background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 7, padding: '7px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Добавить</button>
                <button onClick={() => setAdding(false)} style={{ flex: 1, background: 'var(--surface-2)', color: 'var(--text-secondary)', border: 'none', borderRadius: 7, padding: '7px', fontSize: 12, cursor: 'pointer' }}>Отмена</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setAdding(true)} style={{
              display: 'flex', alignItems: 'center', gap: 11, padding: '9px 12px',
              borderRadius: 9, fontSize: 14, fontWeight: 600, color: 'var(--primary)',
              background: 'none', border: 'none', width: '100%', marginTop: 6, transition: 'background .15s', cursor: 'pointer',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-soft)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M12 8v8M8 12h8" /></svg>
              Создать проект
            </button>
          )}
        </nav>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 14 }}>
          <button onClick={onTrash} style={{
            display: 'flex', alignItems: 'center', gap: 11, padding: '9px 12px',
            borderRadius: 9, fontSize: 14, fontWeight: 500,
            color: activeScreen === 'trash' ? 'var(--danger)' : 'var(--text-secondary)',
            background: activeScreen === 'trash' ? 'var(--danger-soft)' : 'none',
            border: 'none', width: '100%', textAlign: 'left', transition: 'all .15s', cursor: 'pointer',
          }}
            onMouseEnter={e => { if (activeScreen !== 'trash') e.currentTarget.style.background = 'var(--surface-2)'; }}
            onMouseLeave={e => { if (activeScreen !== 'trash') e.currentTarget.style.background = 'none'; }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><polyline stroke="currentColor" strokeWidth="2" points="3 6 5 6 21 6" /><path stroke="currentColor" strokeWidth="2" d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" /></svg>
            Корзина
            {trashedCount > 0 && (
              <span style={{ marginLeft: 'auto', background: 'var(--surface-2)', color: 'var(--text-secondary)', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999 }}>
                {trashedCount}
              </span>
            )}
          </button>
        </div>
      </aside>

      <style jsx global>{`
        @media (max-width: 768px) {
          .sidebar { transform: translateX(-100%); transition: transform .3s ease; box-shadow: 20px 0 40px rgba(16,24,40,0.12); }
          .sidebar.open { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
