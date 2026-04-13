'use client';
import { useState } from 'react';
import { today } from '../lib/store';

export default function FabModal({ projects, onClose, onAddTask, onAddProject }) {
  const [mode, setMode] = useState(null);
  const [name, setName] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState(today());
  const [projectId, setProjectId] = useState(projects[0]?.id || '');

  const PRIO = {
    high:   { label: 'Высокий', color: '#ff6e84' },
    medium: { label: 'Средний', color: '#68fcbf' },
    low:    { label: 'Низкий',  color: '#699cff' },
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    if (mode === 'task') {
      onAddTask({ name: name.trim(), priority, dueDate: dueDate || null, projectId });
    } else {
      onAddProject({ name: name.trim(), dueDate: dueDate || null });
    }
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: 'var(--surface-high)', borderRadius: 20, padding: 32,
        width: '100%', maxWidth: 460,
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>Создать</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer', padding: 4 }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {!mode && (
          <div style={{ display: 'flex', gap: 16 }}>
            {[
              { key: 'task', label: 'Задачу', icon: <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2"/><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M8 12l3 3 5-5"/></svg> },
              { key: 'project', label: 'Проект', icon: <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M12 2L2 7l10 5 10-5-10-5zm0 13L2 10v7l10 5 10-5v-7l-10 5z"/></svg> },
            ].map(item => (
              <button key={item.key} onClick={() => setMode(item.key)} style={{
                flex: 1, background: 'var(--surface-low)', border: '2px solid var(--outline-variant)',
                borderRadius: 14, padding: '28px 20px', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 12, cursor: 'pointer', color: 'var(--on-surface-variant)',
                transition: 'all .2s', fontSize: 15, fontWeight: 600,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--outline-variant)'; e.currentTarget.style.color = 'var(--on-surface-variant)'; }}>
                {item.icon}{item.label}
              </button>
            ))}
          </div>
        )}

        {mode === 'task' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <button onClick={() => setMode(null)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer', fontSize: 13, padding: 0 }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><polyline stroke="currentColor" strokeWidth="2" points="15 18 9 12 15 6"/></svg>
              Назад
            </button>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>Новая задача</div>
            <input autoFocus value={name} onChange={e => setName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
              placeholder="Название задачи..."
              style={{ background: 'var(--surface-low)', border: '1px solid var(--outline-variant)', borderRadius: 10, padding: '12px 16px', fontSize: 15, color: 'var(--on-surface)', outline: 'none' }}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--outline-variant)'}/>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'end' }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginBottom: 6 }}>Приоритет</div>
                <select value={priority} onChange={e => setPriority(e.target.value)} style={{
                  width: '100%', background: 'var(--surface-low)', border: '1px solid var(--outline-variant)',
                  borderRadius: 10, padding: '10px 12px', fontSize: 14,
                  color: PRIO[priority].color, outline: 'none', cursor: 'pointer',
                }}>
                  <option value="high">Высокий</option>
                  <option value="medium">Средний</option>
                  <option value="low">Низкий</option>
                </select>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginBottom: 6 }}>Дата дедлайна</div>
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                  style={{ width: '100%', background: 'var(--surface-bright)', border: '1px solid rgba(186,158,255,0.25)', borderRadius: 10, padding: '12px', fontSize: 14, color: 'var(--on-surface)', outline: 'none', cursor: 'pointer', height: 46 }}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--outline-variant)'}/>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginBottom: 6 }}>Проект</div>
              <select value={projectId} onChange={e => setProjectId(e.target.value)} style={{
                width: '100%', background: 'var(--surface-low)', border: '1px solid var(--outline-variant)',
                borderRadius: 10, padding: '10px 12px 10px 12px', paddingRight: '32px', fontSize: 14, color: 'var(--on-surface)', outline: 'none', cursor: 'pointer',
              }}>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <button onClick={handleSubmit} style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dim) 100%)', color: '#000', border: 'none', padding: '14px', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 4 }}>
              Создать задачу
            </button>
          </div>
        )}

        {mode === 'project' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <button onClick={() => setMode(null)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer', fontSize: 13, padding: 0 }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><polyline stroke="currentColor" strokeWidth="2" points="15 18 9 12 15 6"/></svg>
              Назад
            </button>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>Новый проект</div>
            <input autoFocus value={name} onChange={e => setName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
              placeholder="Название проекта..."
              style={{ background: 'var(--surface-low)', border: '1px solid var(--outline-variant)', borderRadius: 10, padding: '12px 16px', fontSize: 15, color: 'var(--on-surface)', outline: 'none' }}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--outline-variant)'}/>
            <div>
              <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginBottom: 6 }}>Дата дедлайна (необязательно)</div>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                style={{ width: '100%', background: 'var(--surface-bright)', border: '1px solid rgba(186,158,255,0.25)', borderRadius: 10, padding: '10px 12px', fontSize: 14, color: 'var(--on-surface)', outline: 'none', cursor: 'pointer' }}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--outline-variant)'}/>
            </div>
            <button onClick={handleSubmit} style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dim) 100%)', color: '#000', border: 'none', padding: '14px', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 4 }}>
              Создать проект
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
