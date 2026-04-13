'use client';
import { useState } from 'react';
import { formatDate } from '../lib/store';

const COLORS = ['#ba9eff','#68fcbf','#699cff','#ff6e84','#ffd166','#f77f00'];
const colorFor = (i) => COLORS[i % COLORS.length];

const PRIO = {
  high:   { label: 'Высокий', color: '#ff6e84', bg: 'rgba(255,110,132,0.12)' },
  medium: { label: 'Средний', color: '#68fcbf', bg: 'rgba(104,252,191,0.12)' },
  low:    { label: 'Низкий',  color: '#699cff', bg: 'rgba(105,156,255,0.12)' },
};

export default function TrashView({ tasks, projects, allProjects, onRestoreTask, onDeleteTaskForever, onRestoreProject, onDeleteProjectForever }) {
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [selectedProjects, setSelectedProjects] = useState(new Set());

  const deletedTasks = tasks.filter(t => t.deleted);
  const deletedProjects = projects.filter(p => p.deleted);

  // Tasks selection
  const toggleTask = (id) => {
    const s = new Set(selectedTasks);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelectedTasks(s);
  };
  const toggleAllTasks = () => {
    setSelectedTasks(selectedTasks.size === deletedTasks.length ? new Set() : new Set(deletedTasks.map(t => t.id)));
  };

  // Projects selection
  const toggleProject = (id) => {
    const s = new Set(selectedProjects);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelectedProjects(s);
  };
  const toggleAllProjects = () => {
    setSelectedProjects(selectedProjects.size === deletedProjects.length ? new Set() : new Set(deletedProjects.map(p => p.id)));
  };

  const handleRestoreSelectedTasks = () => {
    selectedTasks.forEach(id => onRestoreTask(id));
    setSelectedTasks(new Set());
  };
  const handleDeleteSelectedTasks = () => {
    selectedTasks.forEach(id => onDeleteTaskForever(id));
    setSelectedTasks(new Set());
  };
  const handleRestoreSelectedProjects = () => {
    selectedProjects.forEach(id => onRestoreProject(id));
    setSelectedProjects(new Set());
  };
  const handleDeleteSelectedProjects = () => {
    selectedProjects.forEach(id => onDeleteProjectForever(id));
    setSelectedProjects(new Set());
  };

  const isEmpty = deletedTasks.length === 0 && deletedProjects.length === 0;

  return (
    <div style={{ maxWidth: 780 }}>
      <h1 style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8 }}>Корзина</h1>
      <p style={{ fontSize: 15, color: 'var(--on-surface-variant)', marginBottom: 32 }}>
        Удалённые проекты и задачи. Восстановите или удалите навсегда.
      </p>

      {isEmpty ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--on-surface-variant)' }}>
          <svg width="48" height="48" fill="none" viewBox="0 0 24 24" style={{ margin: '0 auto 16px', display: 'block', opacity: 0.3 }}>
            <polyline stroke="currentColor" strokeWidth="1.5" points="3 6 5 6 21 6"/>
            <path stroke="currentColor" strokeWidth="1.5" d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/>
          </svg>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Корзина пуста</div>
          <div style={{ fontSize: 14 }}>Удалённые проекты и задачи будут появляться здесь</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>

          {/* ===== ПРОЕКТЫ ===== */}
          {deletedProjects.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--outline)', marginBottom: 14 }}>
                Проекты — {deletedProjects.length}
              </div>

              {/* Панель выделения проектов */}
              <div style={{ background: 'var(--surface-high)', borderRadius: 12, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
                  <div onClick={toggleAllProjects} style={{
                    width: 20, height: 20, borderRadius: 5,
                    border: `2px solid ${selectedProjects.size === deletedProjects.length && deletedProjects.length > 0 ? 'var(--primary)' : 'var(--outline-variant)'}`,
                    background: selectedProjects.size === deletedProjects.length && deletedProjects.length > 0 ? 'var(--primary)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s', flexShrink: 0, cursor: 'pointer',
                  }}>
                    {selectedProjects.size === deletedProjects.length && deletedProjects.length > 0 && (
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24"><polyline stroke="#000" strokeWidth="3" points="20 6 9 17 4 12"/></svg>
                    )}
                  </div>
                  <span style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>
                    {selectedProjects.size === 0 ? 'Выбрать все' : `Выбрано: ${selectedProjects.size}`}
                  </span>
                </label>
                {selectedProjects.size > 0 && (
                  <div style={{ display: 'flex', gap: 10, marginLeft: 'auto' }}>
                    <button onClick={handleRestoreSelectedProjects} style={{ background: 'rgba(104,252,191,0.1)', color: 'var(--secondary)', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      Восстановить
                    </button>
                    <button onClick={handleDeleteSelectedProjects} style={{ background: 'rgba(255,110,132,0.1)', color: 'var(--error)', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      Удалить навсегда
                    </button>
                  </div>
                )}
              </div>

              {/* Список удалённых проектов */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {deletedProjects.map((p, i) => {
                  const isSelected = selectedProjects.has(p.id);
                  const taskCount = tasks.filter(t => t.projectId === p.id).length;
                  return (
                    <div key={p.id} style={{
                      background: isSelected ? 'var(--surface-bright)' : 'var(--surface-high)',
                      borderRadius: 14, padding: '16px 20px',
                      display: 'flex', alignItems: 'center', gap: 16,
                      border: isSelected ? '1px solid rgba(186,158,255,0.3)' : '1px solid transparent',
                      transition: 'all .2s',
                    }}>
                      <div onClick={() => toggleProject(p.id)} style={{
                        width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                        border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--outline-variant)'}`,
                        background: isSelected ? 'var(--primary)' : 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all .2s',
                      }}>
                        {isSelected && <svg width="11" height="11" fill="none" viewBox="0 0 24 24"><polyline stroke="#000" strokeWidth="3" points="20 6 9 17 4 12"/></svg>}
                      </div>

                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: colorFor(i), flexShrink: 0, boxShadow: `0 0 8px ${colorFor(i)}80` }}/>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--on-surface-variant)', textDecoration: 'line-through', marginBottom: 4 }}>{p.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--outline)' }}>{taskCount} задач в проекте</div>
                      </div>

                      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                        <button onClick={() => onRestoreProject(p.id)} style={{ background: 'rgba(104,252,191,0.1)', color: 'var(--secondary)', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'filter .2s' }}
                          onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.2)'}
                          onMouseLeave={e => e.currentTarget.style.filter = 'none'}>
                          Восстановить
                        </button>
                        <button onClick={() => onDeleteProjectForever(p.id)} style={{ background: 'rgba(255,110,132,0.1)', color: 'var(--error)', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'filter .2s' }}
                          onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.2)'}
                          onMouseLeave={e => e.currentTarget.style.filter = 'none'}>
                          Удалить навсегда
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===== ЗАДАЧИ ===== */}
          {deletedTasks.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--outline)', marginBottom: 14 }}>
                Задачи — {deletedTasks.length}
              </div>

              {/* Панель выделения задач */}
              <div style={{ background: 'var(--surface-high)', borderRadius: 12, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
                  <div onClick={toggleAllTasks} style={{
                    width: 20, height: 20, borderRadius: 5,
                    border: `2px solid ${selectedTasks.size === deletedTasks.length && deletedTasks.length > 0 ? 'var(--primary)' : 'var(--outline-variant)'}`,
                    background: selectedTasks.size === deletedTasks.length && deletedTasks.length > 0 ? 'var(--primary)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s', flexShrink: 0, cursor: 'pointer',
                  }}>
                    {selectedTasks.size === deletedTasks.length && deletedTasks.length > 0 && (
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24"><polyline stroke="#000" strokeWidth="3" points="20 6 9 17 4 12"/></svg>
                    )}
                  </div>
                  <span style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>
                    {selectedTasks.size === 0 ? 'Выбрать все' : `Выбрано: ${selectedTasks.size}`}
                  </span>
                </label>
                {selectedTasks.size > 0 && (
                  <div style={{ display: 'flex', gap: 10, marginLeft: 'auto' }}>
                    <button onClick={handleRestoreSelectedTasks} style={{ background: 'rgba(104,252,191,0.1)', color: 'var(--secondary)', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      Восстановить
                    </button>
                    <button onClick={handleDeleteSelectedTasks} style={{ background: 'rgba(255,110,132,0.1)', color: 'var(--error)', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      Удалить навсегда
                    </button>
                  </div>
                )}
              </div>

              {/* Список задач */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {deletedTasks.map(t => {
                  const proj = allProjects.find(p => p.id === t.projectId);
                  const p = PRIO[t.priority] || PRIO.low;
                  const isSelected = selectedTasks.has(t.id);
                  return (
                    <div key={t.id} style={{
                      background: isSelected ? 'var(--surface-bright)' : 'var(--surface-high)',
                      borderRadius: 14, padding: '16px 20px',
                      display: 'flex', alignItems: 'center', gap: 16,
                      border: isSelected ? '1px solid rgba(186,158,255,0.3)' : '1px solid transparent',
                      transition: 'all .2s',
                    }}>
                      <div onClick={() => toggleTask(t.id)} style={{
                        width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                        border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--outline-variant)'}`,
                        background: isSelected ? 'var(--primary)' : 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all .2s',
                      }}>
                        {isSelected && <svg width="11" height="11" fill="none" viewBox="0 0 24 24"><polyline stroke="#000" strokeWidth="3" points="20 6 9 17 4 12"/></svg>}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--on-surface-variant)', textDecoration: 'line-through', marginBottom: 6 }}>{t.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 11, color: 'var(--outline)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            {proj ? proj.name : proj?.deleted ? 'Удалённый проект' : '—'}
                          </span>
                          <span style={{ fontSize: 11, color: 'var(--outline)' }}>·</span>
                          <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', background: p.bg, color: p.color }}>{p.label}</span>
                          {t.dueDate && <span style={{ fontSize: 12, color: 'var(--outline)' }}>{formatDate(t.dueDate)}</span>}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                        <button onClick={() => onRestoreTask(t.id)} style={{ background: 'rgba(104,252,191,0.1)', color: 'var(--secondary)', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'filter .2s' }}
                          onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.2)'}
                          onMouseLeave={e => e.currentTarget.style.filter = 'none'}>
                          Восстановить
                        </button>
                        <button onClick={() => onDeleteTaskForever(t.id)} style={{ background: 'rgba(255,110,132,0.1)', color: 'var(--error)', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'filter .2s' }}
                          onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.2)'}
                          onMouseLeave={e => e.currentTarget.style.filter = 'none'}>
                          Удалить навсегда
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
