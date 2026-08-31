'use client';
import { useState, useEffect } from 'react';
import { TaskCheckbox, PrioritySelect, DateQuickPick } from './common';
import { projectColor } from '../lib/ui';

export default function TaskPanel({ task, projects, onClose, onUpdate, onToggle, onDelete, onOpenProject }) {
  const [name, setName] = useState(task.name);
  const [note, setNote] = useState(task.note || '');
  const [priority, setPriority] = useState(task.priority);
  const [dueDate, setDueDate] = useState(task.dueDate || null);

  // Синхронизация при смене задачи
  useEffect(() => {
    setName(task.name);
    setNote(task.note || '');
    setPriority(task.priority);
    setDueDate(task.dueDate || null);
  }, [task.id]); // eslint-disable-line

  // Автосохранение при изменении полей
  useEffect(() => {
    const changed = name.trim() !== task.name || note !== (task.note || '') ||
      priority !== task.priority || (dueDate || null) !== (task.dueDate || null);
    if (!changed) return;
    const timer = setTimeout(() => {
      onUpdate({ ...task, name: name.trim() || task.name, note, priority, dueDate: dueDate || null });
    }, 400);
    return () => clearTimeout(timer);
  }, [name, note, priority, dueDate]); // eslint-disable-line

  const pi = projects.findIndex(p => p.id === task.projectId);
  const project = projects[pi];

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 250, display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(16,24,40,0.28)' }} />
      <aside style={{
        position: 'relative', width: 400, maxWidth: '100vw', height: '100%',
        background: 'var(--surface)', borderLeft: '1px solid var(--border)',
        boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column',
        animation: 'panelIn .2s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <TaskCheckbox completed={task.completed} onToggle={onToggle} size={20} />
            <span style={{ fontSize: 13, fontWeight: 600, color: task.completed ? 'var(--success)' : 'var(--text-secondary)' }}>
              {task.completed ? 'Выполнено' : 'Активна'}
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, display: 'flex' }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 22 }}>
          <textarea value={name} onChange={e => setName(e.target.value)} rows={2}
            placeholder="Название задачи"
            style={{
              fontSize: 18, fontWeight: 700, color: 'var(--text)', border: 'none', outline: 'none',
              resize: 'none', background: 'none', lineHeight: 1.35, fontFamily: 'inherit',
            }} />

          <Field label="Проект">
            {project ? (
              <button onClick={() => { onOpenProject(project.id); onClose(); }} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--surface-2)',
                border: '1px solid var(--border)', borderRadius: 8, padding: '7px 12px',
                fontSize: 13.5, fontWeight: 600, color: 'var(--text)', cursor: 'pointer',
              }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: projectColor(pi) }} />
                {project.name}
              </button>
            ) : <span style={{ fontSize: 13.5, color: 'var(--text-muted)' }}>—</span>}
          </Field>

          <Field label="Дата">
            <DateQuickPick key={task.id} value={dueDate} onChange={setDueDate} />
          </Field>

          <Field label="Приоритет">
            <PrioritySelect value={priority} onChange={setPriority} />
          </Field>

          <Field label="Заметка">
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={5}
              placeholder="Короткая заметка к задаче…"
              style={{
                width: '100%', fontSize: 14, color: 'var(--text)', lineHeight: 1.55,
                border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px',
                outline: 'none', resize: 'vertical', background: 'var(--surface-inset)', fontFamily: 'inherit',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </Field>
        </div>

        <div style={{ padding: '14px 18px', borderTop: '1px solid var(--border)' }}>
          <button onClick={onDelete} style={{
            display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none',
            color: 'var(--danger)', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', padding: '6px 4px',
          }}>
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24"><polyline stroke="currentColor" strokeWidth="2" points="3 6 5 6 21 6" /><path stroke="currentColor" strokeWidth="2" d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" /></svg>
            Удалить задачу
          </button>
        </div>
      </aside>

      <style jsx>{`
        @media (max-width: 480px) { aside { width: 100vw !important; } }
      `}</style>
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
