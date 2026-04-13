'use client';
import { useState, useRef } from 'react';
import { today, formatDate } from '../lib/store';

// Правка: только приоритет, цвета красный/зелёный/голубой
const PRIO = {
  high:   { label: 'Высокий', color: '#ff6e84', bg: 'rgba(255,110,132,0.12)' },
  medium: { label: 'Средний', color: '#68fcbf', bg: 'rgba(104,252,191,0.12)' },
  low:    { label: 'Низкий',  color: '#699cff', bg: 'rgba(105,156,255,0.12)' },
};

export default function ProjectView({ project, tasks, onBack, onAddTask, onToggleTask, onSoftDeleteTask, onUpdateTask, onUpdateProject, onReorderTasks, onDeleteProject }) {
  const [newTask, setNewTask] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState(today());
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  if (!project) return null;

  const activeTasks = tasks.filter(t => !t.deleted);
  const pct = activeTasks.length ? Math.round(activeTasks.filter(t => t.completed).length / activeTasks.length * 100) : 0;

  const handleAdd = () => {
    if (newTask.trim()) {
      onAddTask(newTask.trim(), priority, dueDate || null);
      setNewTask('');
      setDueDate(today());
    }
  };

  const handleTitleSave = () => {
    if (titleValue.trim()) onUpdateProject({ ...project, name: titleValue.trim() });
    setEditingTitle(false);
    setMenuOpen(false);
  };

  return (
    <div style={{ maxWidth: 780 }}>
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--on-surface-variant)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 24, padding: 0, transition: 'color .2s' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--on-surface-variant)'}>
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><polyline stroke="currentColor" strokeWidth="2" points="15 18 9 12 15 6"/></svg>
        Назад к дашборду
      </button>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ flex: 1 }}>
          {editingTitle ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <input autoFocus value={titleValue} onChange={e => setTitleValue(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleTitleSave(); if (e.key === 'Escape') setEditingTitle(false); }}
                style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-0.03em', background: 'var(--surface-high)', border: '2px solid var(--primary)', borderRadius: 10, padding: '4px 12px', color: 'var(--on-surface)', outline: 'none', width: '100%' }}/>
              <button onClick={handleTitleSave} style={{ background: 'var(--primary)', color: '#000', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}>Сохранить</button>
              <button onClick={() => setEditingTitle(false)} style={{ background: 'var(--surface-high)', color: 'var(--on-surface-variant)', border: 'none', borderRadius: 8, padding: '8px 12px', fontSize: 13, cursor: 'pointer' }}>✕</button>
            </div>
          ) : (
            <h1 style={{ fontSize: 40, fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--on-surface)', marginBottom: 8 }}>{project.name}</h1>
          )}
          <p style={{ fontSize: 14, color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <svg width="14" height="14" fill="var(--primary)" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 2 }}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            <span>Режим фокуса активен.<br/>Осталось {activeTasks.filter(t=>!t.completed).length} активных задач.</span>
          </p>
        </div>

        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'var(--surface-high)', border: 'none', borderRadius: 12, padding: 10, color: 'var(--on-surface-variant)', cursor: 'pointer', display: 'flex', transition: 'color .2s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--on-surface-variant)'}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="19" cy="12" r="1.5" fill="currentColor"/></svg>
          </button>
          {menuOpen && (
            <>
              <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 49 }}/>
              <div style={{ position: 'absolute', top: '110%', right: 0, background: 'var(--surface-highest)', border: '1px solid var(--outline-variant)', borderRadius: 10, padding: 4, zIndex: 50, minWidth: 160, boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
                <button onClick={() => { setTitleValue(project.name); setEditingTitle(true); setMenuOpen(false); }} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 7,
                  background: 'none', border: 'none', color: 'var(--on-surface)', fontSize: 14, cursor: 'pointer', width: '100%', textAlign: 'left',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                  <svg width="15" height="15" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path stroke="currentColor" strokeWidth="2" d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Редактировать
                </button>
                <button onClick={() => { setMenuOpen(false); setDeleteConfirm(true); }} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 7,
                  background: 'none', border: 'none', color: 'var(--error)', fontSize: 14, cursor: 'pointer', width: '100%', textAlign: 'left',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,110,132,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                  <svg width="15" height="15" fill="none" viewBox="0 0 24 24"><polyline stroke="currentColor" strokeWidth="2" points="3 6 5 6 21 6"/><path stroke="currentColor" strokeWidth="2" d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/></svg>
                  Удалить проект
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{ height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden', marginBottom: 32 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, var(--primary), var(--primary-dim))', borderRadius: 999, transition: 'width .5s ease', boxShadow: '0 0 12px rgba(186,158,255,0.5)' }}/>
      </div>

      {/* Task input */}
      <div style={{ position: 'relative', marginBottom: 32 }}>
        <div style={{ position: 'absolute', inset: -4, background: 'linear-gradient(90deg, var(--primary), var(--primary-dim))', borderRadius: 18, opacity: 0.12, filter: 'blur(8px)', pointerEvents: 'none' }}/>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--surface-high)', borderRadius: 14, padding: '14px 20px', border: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap' }}>
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#a27cff" strokeWidth="2"/><path stroke="#a27cff" strokeWidth="2" strokeLinecap="round" d="M12 8v8M8 12h8"/></svg>
          <input value={newTask} onChange={e => setNewTask(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
            placeholder={`Добавить задачу в ${project.name}...`}
            style={{ background: 'none', border: 'none', outline: 'none', fontSize: 16, color: 'var(--on-surface)', flex: 1, minWidth: 120 }}/>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
              style={{ background: 'var(--surface-bright)', border: '1px solid rgba(186,158,255,0.2)', color: 'var(--on-surface)', borderRadius: 8, padding: '6px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer', outline: 'none' }}/>
            <select value={priority} onChange={e => setPriority(e.target.value)} style={{
              background: 'var(--surface-low)', border: 'none',
              color: PRIO[priority].color,
              borderRadius: 8, padding: '6px 28px 6px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer', outline: 'none',
            }}>
              <option value="high">Высокий</option>
              <option value="medium">Средний</option>
              <option value="low">Низкий</option>
            </select>
            <button onClick={handleAdd} style={{ background: 'var(--primary)', color: '#000', border: 'none', padding: '8px 20px', borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all .2s', whiteSpace: 'nowrap' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-dim)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = '#000'; }}>
              Создать
            </button>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 48 }}>
        {activeTasks.map((t, i) => (
          <TaskItem key={t.id} task={t} index={i} tasks={activeTasks}
            onToggle={onToggleTask}
            onDelete={onSoftDeleteTask}
            onUpdate={onUpdateTask}
            onReorder={(reordered) => onReorderTasks(reordered)}/>
        ))}
        {activeTasks.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--on-surface-variant)' }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Задач пока нет</div>
            <div style={{ fontSize: 14 }}>Добавь первую задачу выше</div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }} className="proj-stats">
        <div style={{ background: 'var(--surface-high)', borderRadius: 18, padding: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary)', marginBottom: 16 }}>Эффективность</div>
          <div style={{ fontSize: 42, fontWeight: 900, color: 'var(--on-surface)', lineHeight: 1, marginBottom: 4 }}>{pct}%</div>
          <div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>Процент выполнения</div>
        </div>
        <div style={{ background: 'var(--surface-high)', borderRadius: 18, padding: 24, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, background: 'rgba(104,252,191,0.08)', borderRadius: '50%', filter: 'blur(30px)' }}/>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--secondary)', marginBottom: 16 }}>Сессия фокуса</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 42, fontWeight: 900, color: 'var(--on-surface)', lineHeight: 1, marginBottom: 4 }}>02:45</div>
                <div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>Текущая серия глубокой работы</div>
              </div>
              <button style={{ background: 'var(--secondary)', color: '#005e40', border: 'none', padding: '10px 24px', borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Завершить сессию
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 600px) { .proj-stats { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* Модал подтверждения удаления проекта */}
      {deleteConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
          zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }} onClick={e => { if (e.target === e.currentTarget) setDeleteConfirm(false); }}>
          <div style={{
            background: 'var(--surface-high)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 400,
            border: '1px solid rgba(255,110,132,0.2)', boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
          }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 10 }}>
                Удалить проект «{project.name}»?
              </div>
              <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>
                Все задачи прикреплённые к этому проекту будут удалены без возможности восстановить.
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setDeleteConfirm(false)} style={{
                flex: 1, background: 'var(--surface-low)', color: 'var(--on-surface-variant)',
                border: 'none', borderRadius: 12, padding: '13px', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'background .2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-bright)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-low)'}>
                Отмена
              </button>
              <button onClick={() => { setDeleteConfirm(false); onDeleteProject(project.id); }} style={{
                flex: 1, background: 'rgba(255,110,132,0.15)', color: 'var(--error)',
                border: '1px solid rgba(255,110,132,0.3)', borderRadius: 12, padding: '13px', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all .2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,110,132,0.25)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,110,132,0.15)'; }}>
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TaskItem({ task, index, tasks, onToggle, onDelete, onUpdate, onReorder }) {
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(task.name);
  const [editPriority, setEditPriority] = useState(task.priority);
  const [editDate, setEditDate] = useState(task.dueDate || '');
  const p = PRIO[task.priority] || PRIO.low;

  const handleSave = () => {
    onUpdate({ ...task, name: editName.trim() || task.name, priority: editPriority, dueDate: editDate || null });
    setEditing(false);
  };

  const handleDragStart = (e) => { e.dataTransfer.setData('taskIndex', index); };
  const handleDragOver = (e) => { e.preventDefault(); };
  const handleDrop = (e) => {
    e.preventDefault();
    const from = parseInt(e.dataTransfer.getData('taskIndex'));
    if (from === index) return;
    const reordered = [...tasks];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(index, 0, moved);
    onReorder(reordered);
  };

  if (editing) {
    return (
      <div style={{ background: 'var(--surface-high)', borderRadius: 14, padding: 20, border: '1px solid var(--primary)', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input autoFocus value={editName} onChange={e => setEditName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditing(false); }}
          style={{ background: 'var(--surface-low)', border: '1px solid var(--outline-variant)', borderRadius: 8, padding: '10px 14px', fontSize: 15, color: 'var(--on-surface)', outline: 'none' }}/>
        <div style={{ display: 'flex', gap: 10 }}>
          <select value={editPriority} onChange={e => setEditPriority(e.target.value)} style={{ flex: 1, background: 'var(--surface-bright)', border: '1px solid rgba(186,158,255,0.25)', borderRadius: 8, padding: '8px 28px 8px 10px', fontSize: 13, color: 'var(--on-surface)', outline: 'none', cursor: 'pointer' }}>
            <option value="high">Высокий</option>
            <option value="medium">Средний</option>
            <option value="low">Низкий</option>
          </select>
          <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)}
            style={{ flex: 1, background: 'var(--surface-bright)', border: '1px solid rgba(186,158,255,0.25)', borderRadius: 8, padding: '8px 28px 8px 10px', fontSize: 13, color: 'var(--on-surface)', outline: 'none', cursor: 'pointer' }}/>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleSave} style={{ flex: 1, background: 'var(--primary)', color: '#000', border: 'none', borderRadius: 8, padding: '9px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Сохранить</button>
          <button onClick={() => setEditing(false)} style={{ flex: 1, background: 'var(--surface-low)', color: 'var(--on-surface-variant)', border: 'none', borderRadius: 8, padding: '9px', fontSize: 13, cursor: 'pointer' }}>Отмена</button>
        </div>
      </div>
    );
  }

  return (
    <div draggable onDragStart={handleDragStart} onDragOver={handleDragOver} onDrop={handleDrop}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: hovered ? 'var(--surface-bright)' : 'var(--surface-high)',
        borderRadius: 14, padding: 20, transition: 'background .2s',
        opacity: task.completed ? 0.65 : 1,
      }}>
      <div style={{ cursor: 'grab', color: 'var(--outline)', opacity: hovered ? 0.6 : 0.2, transition: 'opacity .2s', flexShrink: 0 }}>
        <svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor">
          <circle cx="2" cy="3" r="1.5"/><circle cx="8" cy="3" r="1.5"/>
          <circle cx="2" cy="8" r="1.5"/><circle cx="8" cy="8" r="1.5"/>
          <circle cx="2" cy="13" r="1.5"/><circle cx="8" cy="13" r="1.5"/>
        </svg>
      </div>

      <button onClick={() => onToggle(task.id)} style={{
        width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
        border: `2px solid ${task.completed ? 'var(--secondary)' : task.priority === 'high' ? '#ff6e84' : 'var(--outline-variant)'}`,
        background: task.completed ? 'var(--secondary)' : 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', padding: 0, transition: 'all .2s',
      }}>
        {task.completed && <svg width="12" height="12" fill="none" viewBox="0 0 24 24"><polyline stroke="#005e40" strokeWidth="3" points="20 6 9 17 4 12"/></svg>}
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: task.completed ? 'var(--outline)' : 'var(--on-surface)', textDecoration: task.completed ? 'line-through' : 'none', marginBottom: 6 }}>
          {task.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', background: p.bg, color: p.color }}>
            {p.label}
          </span>
          {task.completed ? (
            <span style={{ fontSize: 12, color: 'var(--secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="11" height="11" fill="none" viewBox="0 0 24 24"><polyline stroke="currentColor" strokeWidth="2" points="20 6 9 17 4 12"/></svg>
              Выполнено
            </span>
          ) : task.dueDate ? (
            <span style={{ fontSize: 13, color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="11" height="11" fill="none" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><path stroke="currentColor" strokeWidth="2" d="M3 10h18"/></svg>
              {formatDate(task.dueDate)}
            </span>
          ) : null}
        </div>
      </div>

      {hovered && (
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          <button onClick={() => { setEditName(task.name); setEditPriority(task.priority); setEditDate(task.dueDate || ''); setEditing(true); }}
            style={{ background: 'none', border: 'none', color: 'var(--outline)', cursor: 'pointer', padding: 8, borderRadius: 8, display: 'flex', transition: 'color .2s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--on-surface)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--outline)'}>
            <svg width="17" height="17" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path stroke="currentColor" strokeWidth="2" d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button onClick={() => onDelete(task.id)}
            style={{ background: 'none', border: 'none', color: 'var(--outline)', cursor: 'pointer', padding: 8, borderRadius: 8, display: 'flex', transition: 'color .2s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--error)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--outline)'}>
            <svg width="17" height="17" fill="none" viewBox="0 0 24 24"><polyline stroke="currentColor" strokeWidth="2" points="3 6 5 6 21 6"/><path stroke="currentColor" strokeWidth="2" d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/></svg>
          </button>
        </div>
      )}
    </div>
  );
}
