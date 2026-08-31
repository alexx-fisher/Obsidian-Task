'use client';
import { useState } from 'react';
import { today } from '../lib/store';
import { DateQuickPick, PrioritySelect } from './common';

export default function FabModal({ projects, onClose, onAddTask, onAddProject }) {
  const [mode, setMode] = useState('task');
  const [name, setName] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState(today());
  const [projectId, setProjectId] = useState(projects[0]?.id || '');

  const handleSubmit = () => {
    if (!name.trim()) return;
    if (mode === 'task') onAddTask({ name: name.trim(), priority, dueDate: dueDate || null, projectId });
    else onAddProject({ name: name.trim() });
    onClose();
  };

  const tab = (active) => ({
    flex: 1, padding: '9px', borderRadius: 8, border: 'none', fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
    background: active ? 'var(--surface)' : 'none',
    color: active ? 'var(--text)' : 'var(--text-secondary)',
    boxShadow: active ? 'var(--shadow-sm)' : 'none', transition: 'all .12s',
  });

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(16,24,40,0.45)', backdropFilter: 'blur(2px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 24, width: '100%', maxWidth: 440, boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Создать</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, display: 'flex' }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div style={{ display: 'flex', gap: 3, background: 'var(--surface-2)', borderRadius: 10, padding: 3, marginBottom: 18 }}>
          <button style={tab(mode === 'task')} onClick={() => setMode('task')}>Задача</button>
          <button style={tab(mode === 'project')} onClick={() => setMode('project')}>Проект</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input autoFocus value={name} onChange={e => setName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
            placeholder={mode === 'task' ? 'Название задачи…' : 'Название проекта…'}
            style={{ background: 'var(--surface-inset)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 15, color: 'var(--text)', outline: 'none' }}
            onFocus={e => e.target.style.borderColor = 'var(--primary)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'} />

          {mode === 'task' && (
            <>
              <Field label="Проект">
                <select value={projectId} onChange={e => setProjectId(e.target.value)} style={{
                  width: '100%', background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 10, padding: '10px 12px', fontSize: 14, color: 'var(--text)', outline: 'none', cursor: 'pointer',
                }}>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </Field>
              <Field label="Дата">
                <DateQuickPick value={dueDate} onChange={setDueDate} />
              </Field>
              <Field label="Приоритет">
                <PrioritySelect value={priority} onChange={setPriority} style={{ width: '100%' }} />
              </Field>
            </>
          )}

          <button onClick={handleSubmit} style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '13px', borderRadius: 11, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 2, transition: 'background .15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-dim)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--primary)'}>
            {mode === 'task' ? 'Создать задачу' : 'Создать проект'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}
