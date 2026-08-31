'use client';
import { useState } from 'react';
import { PriorityBadge } from './common';
import { humanDate, projectColor } from '../lib/ui';

export default function TrashView({ tasks, projects, allProjects, onRestoreTask, onDeleteTaskForever, onRestoreProject, onDeleteProjectForever }) {
  const [selTasks, setSelTasks] = useState(new Set());
  const [selProjects, setSelProjects] = useState(new Set());

  const deletedTasks = tasks.filter(t => t.deleted);
  const deletedProjects = projects.filter(p => p.deleted);
  const isEmpty = deletedTasks.length === 0 && deletedProjects.length === 0;

  const toggle = (set, setter, id) => {
    const s = new Set(set); s.has(id) ? s.delete(id) : s.add(id); setter(s);
  };
  const toggleAll = (items, set, setter) =>
    setter(set.size === items.length ? new Set() : new Set(items.map(i => i.id)));

  return (
    <div style={{ maxWidth: 780 }}>
      <h1 style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 6, color: 'var(--text)' }}>Корзина</h1>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 28 }}>
        Удалённые проекты и задачи. Восстановите или удалите навсегда.
      </p>

      {isEmpty ? (
        <div style={{ background: 'var(--surface)', border: '1px dashed var(--border-strong)', borderRadius: 14, textAlign: 'center', padding: '64px 20px', color: 'var(--text-secondary)' }}>
          <svg width="44" height="44" fill="none" viewBox="0 0 24 24" style={{ margin: '0 auto 14px', display: 'block', color: 'var(--text-muted)' }}>
            <polyline stroke="currentColor" strokeWidth="1.5" points="3 6 5 6 21 6" />
            <path stroke="currentColor" strokeWidth="1.5" d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
          </svg>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, color: 'var(--text)' }}>Корзина пуста</div>
          <div style={{ fontSize: 13.5 }}>Удалённые проекты и задачи появятся здесь</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
          {deletedProjects.length > 0 && (
            <Group title={`Проекты — ${deletedProjects.length}`}
              allSelected={selProjects.size === deletedProjects.length}
              selectedCount={selProjects.size}
              onToggleAll={() => toggleAll(deletedProjects, selProjects, setSelProjects)}
              onRestoreSel={() => { selProjects.forEach(onRestoreProject); setSelProjects(new Set()); }}
              onDeleteSel={() => { selProjects.forEach(onDeleteProjectForever); setSelProjects(new Set()); }}>
              {deletedProjects.map((p, i) => (
                <RowShell key={p.id} selected={selProjects.has(p.id)} onSelect={() => toggle(selProjects, setSelProjects, p.id)}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: projectColor(i), flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text-secondary)', textDecoration: 'line-through' }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{tasks.filter(t => t.projectId === p.id).length} задач в проекте</div>
                  </div>
                  <Actions onRestore={() => onRestoreProject(p.id)} onDelete={() => onDeleteProjectForever(p.id)} />
                </RowShell>
              ))}
            </Group>
          )}

          {deletedTasks.length > 0 && (
            <Group title={`Задачи — ${deletedTasks.length}`}
              allSelected={selTasks.size === deletedTasks.length}
              selectedCount={selTasks.size}
              onToggleAll={() => toggleAll(deletedTasks, selTasks, setSelTasks)}
              onRestoreSel={() => { selTasks.forEach(onRestoreTask); setSelTasks(new Set()); }}
              onDeleteSel={() => { selTasks.forEach(onDeleteTaskForever); setSelTasks(new Set()); }}>
              {deletedTasks.map(t => {
                const proj = allProjects.find(p => p.id === t.projectId);
                return (
                  <RowShell key={t.id} selected={selTasks.has(t.id)} onSelect={() => toggle(selTasks, setSelTasks, t.id)}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text-secondary)', textDecoration: 'line-through', marginBottom: 5 }}>{t.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{proj ? proj.name : '—'}</span>
                        <PriorityBadge value={t.priority} />
                        {t.dueDate && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{humanDate(t.dueDate)}</span>}
                      </div>
                    </div>
                    <Actions onRestore={() => onRestoreTask(t.id)} onDelete={() => onDeleteTaskForever(t.id)} />
                  </RowShell>
                );
              })}
            </Group>
          )}
        </div>
      )}
    </div>
  );
}

function Group({ title, allSelected, selectedCount, onToggleAll, onRestoreSel, onDeleteSel, children }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--text-muted)', marginBottom: 12 }}>{title}</div>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10, flexWrap: 'wrap' }}>
        <Check checked={allSelected} onClick={onToggleAll} />
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{selectedCount === 0 ? 'Выбрать все' : `Выбрано: ${selectedCount}`}</span>
        {selectedCount > 0 && (
          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
            <button onClick={onRestoreSel} style={pillBtn('var(--success)', 'var(--success-soft)')}>Восстановить</button>
            <button onClick={onDeleteSel} style={pillBtn('var(--danger)', 'var(--danger-soft)')}>Удалить навсегда</button>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
    </div>
  );
}

function RowShell({ selected, onSelect, children }) {
  return (
    <div style={{
      background: selected ? 'var(--primary-soft)' : 'var(--surface)',
      border: '1px solid', borderColor: selected ? 'var(--primary)' : 'var(--border)',
      borderRadius: 12, padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 14, transition: 'all .12s',
    }}>
      <Check checked={selected} onClick={onSelect} />
      {children}
    </div>
  );
}

function Check({ checked, onClick }) {
  return (
    <div onClick={onClick} style={{
      width: 19, height: 19, borderRadius: 6, flexShrink: 0, cursor: 'pointer',
      border: `2px solid ${checked ? 'var(--primary)' : 'var(--border-strong)'}`,
      background: checked ? 'var(--primary)' : 'var(--surface)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .12s',
    }}>
      {checked && <svg width="11" height="11" fill="none" viewBox="0 0 24 24"><polyline stroke="#fff" strokeWidth="3.5" points="20 6 9 17 4 12" /></svg>}
    </div>
  );
}

function Actions({ onRestore, onDelete }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
      <button onClick={onRestore} style={pillBtn('var(--success)', 'var(--success-soft)')}>Восстановить</button>
      <button onClick={onDelete} style={pillBtn('var(--danger)', 'var(--danger-soft)')}>Удалить навсегда</button>
    </div>
  );
}

function pillBtn(color, bg) {
  return { background: bg, color, border: 'none', borderRadius: 8, padding: '7px 13px', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' };
}
