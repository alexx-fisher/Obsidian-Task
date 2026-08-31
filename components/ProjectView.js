'use client';
import { useState } from 'react';
import { today } from '../lib/store';
import { TaskCheckbox, PriorityBadge, PrioritySelect, DateQuickPick, CalIcon } from './common';
import SortableList from './SortableList';
import { prio, groupTasks, GROUP_META, sortTasks, humanDate, dueTone } from '../lib/ui';

const FILTERS = [
  { key: 'active', label: 'Активные' },
  { key: 'all', label: 'Все' },
  { key: 'done', label: 'Выполненные' },
];
const SORTS = [
  { key: 'date', label: 'По дате' },
  { key: 'priority', label: 'По приоритету' },
  { key: 'manual', label: 'Вручную' },
];

export default function ProjectView({ project, tasks, onBack, onAddTask, onToggleTask, onOpenTask, onUpdateProject, onReorderTasks, onDeleteProject }) {
  const [newTask, setNewTask] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState(today());
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [filter, setFilter] = useState('active');
  const [sort, setSort] = useState('manual');
  const [showDone, setShowDone] = useState(false);

  if (!project) return null;

  const active = tasks.filter(t => !t.completed);
  const done = tasks.filter(t => t.completed);
  const pct = tasks.length ? Math.round(done.length / tasks.length * 100) : 0;

  const handleAdd = () => {
    if (newTask.trim()) {
      onAddTask(newTask.trim(), priority, dueDate || null);
      setNewTask('');
      setDueDate(today());
      setPriority('medium');
    }
  };

  const handleTitleSave = () => {
    if (titleValue.trim()) onUpdateProject({ ...project, name: titleValue.trim() });
    setEditingTitle(false);
  };

  // Приоритеты для правой панели
  const prioCounts = {
    high: active.filter(t => t.priority === 'high').length,
    medium: active.filter(t => t.priority === 'medium').length,
    low: active.filter(t => t.priority === 'low').length,
  };
  const inProgress = 0; // нет статуса "в процессе" в модели

  return (
    <div style={{ maxWidth: 1080 }}>
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 18, padding: 0 }}>
        <svg width="15" height="15" fill="none" viewBox="0 0 24 24"><polyline stroke="currentColor" strokeWidth="2.5" points="15 18 9 12 15 6" /></svg>
        Назад к дашборду
      </button>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {editingTitle ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <input autoFocus value={titleValue} onChange={e => setTitleValue(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleTitleSave(); if (e.key === 'Escape') setEditingTitle(false); }}
                style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', background: 'var(--surface)', border: '2px solid var(--primary)', borderRadius: 10, padding: '4px 12px', color: 'var(--text)', outline: 'none', width: '100%' }} />
              <button onClick={handleTitleSave} style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}>Сохранить</button>
            </div>
          ) : (
            <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text)', marginBottom: 8 }}>{project.name}</h1>
          )}
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="14" height="14" fill="var(--accent)" viewBox="0 0 24 24" style={{ flexShrink: 0 }}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
            Режим фокуса активен. Осталось {active.length} активных задач.
          </p>
        </div>

        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 9, color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex' }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.6" fill="currentColor" /><circle cx="12" cy="12" r="1.6" fill="currentColor" /><circle cx="19" cy="12" r="1.6" fill="currentColor" /></svg>
          </button>
          {menuOpen && (
            <>
              <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 49 }} />
              <div style={{ position: 'absolute', top: '110%', right: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 4, zIndex: 50, minWidth: 180, boxShadow: 'var(--shadow-lg)' }}>
                <MenuItem onClick={() => { setTitleValue(project.name); setEditingTitle(true); setMenuOpen(false); }}>
                  <svg width="15" height="15" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path stroke="currentColor" strokeWidth="2" d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                  Переименовать
                </MenuItem>
                <MenuItem danger onClick={() => { setMenuOpen(false); setDeleteConfirm(true); }}>
                  <svg width="15" height="15" fill="none" viewBox="0 0 24 24"><polyline stroke="currentColor" strokeWidth="2" points="3 6 5 6 21 6" /><path stroke="currentColor" strokeWidth="2" d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" /></svg>
                  Удалить проект
                </MenuItem>
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 999, overflow: 'hidden', marginBottom: 26 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--primary)', borderRadius: 999, transition: 'width .5s ease' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 28, alignItems: 'start' }} className="proj-grid">
        {/* ==== Основная колонка ==== */}
        <div>
          {/* Добавление задачи */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 16, marginBottom: 20, boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="var(--primary)" strokeWidth="2" /><path stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" d="M12 8v8M8 12h8" /></svg>
              <input value={newTask} onChange={e => setNewTask(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
                placeholder={`Добавить задачу в «${project.name}»…`}
                style={{ background: 'none', border: 'none', outline: 'none', fontSize: 15, color: 'var(--text)', flex: 1, minWidth: 0 }} />
              <button onClick={handleAdd} style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '9px 20px', borderRadius: 9, fontSize: 13.5, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background .15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-dim)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--primary)'}>
                Создать
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', paddingLeft: 30 }}>
              <DateQuickPick value={dueDate} onChange={setDueDate} />
              <PrioritySelect value={priority} onChange={setPriority} />
            </div>
          </div>

          {/* Фильтры + сортировка (правка 6) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <SegmentedControl options={FILTERS} value={filter} onChange={setFilter} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Сортировка</span>
              <SegmentedControl options={SORTS} value={sort} onChange={setSort} small />
            </div>
          </div>

          <TaskList
            active={active} done={done}
            filter={filter} sort={sort}
            showDone={showDone} setShowDone={setShowDone}
            onToggleTask={onToggleTask} onOpenTask={onOpenTask}
            onReorderTasks={onReorderTasks} allTasks={tasks}
          />
        </div>

        {/* ==== Правая панель ==== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="proj-rail">
          <RailCard title="Прогресс">
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <Donut done={done.length} total={tasks.length} label={`${active.length}`} sub="активных" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                <LegendRow color="var(--primary)" label="Выполнено" value={done.length} />
                <LegendRow color="#93b4f5" label="В процессе" value={inProgress} />
                <LegendRow color="var(--surface-2)" label="Осталось" value={active.length} border />
              </div>
            </div>
          </RailCard>

          <RailCard title="Приоритеты">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13.5 }}>
              {['high', 'medium', 'low'].map(k => (
                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: prio(k).color }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{prio(k).label}</span>
                  <span style={{ marginLeft: 'auto', fontWeight: 700, color: 'var(--text)' }}>{prioCounts[k]}</span>
                </div>
              ))}
            </div>
          </RailCard>

          <RailCard title="Ближайшие дедлайны">
            {(() => {
              const upcoming = [...active].filter(t => t.dueDate).sort((a, b) => a.dueDate < b.dueDate ? -1 : 1).slice(0, 4);
              if (upcoming.length === 0) return <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Нет задач с датой</div>;
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                  {upcoming.map(t => (
                    <div key={t.id} onClick={() => onOpenTask(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                      <CalIcon size={12} color="var(--text-muted)" />
                      <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{t.name}</span>
                      <span style={{ fontWeight: 600, color: dueTone(t.dueDate, false), whiteSpace: 'nowrap' }}>{humanDate(t.dueDate)}</span>
                    </div>
                  ))}
                </div>
              );
            })()}
          </RailCard>
        </div>
      </div>

      {deleteConfirm && (
        <ConfirmDelete name={project.name} onCancel={() => setDeleteConfirm(false)}
          onConfirm={() => { setDeleteConfirm(false); onDeleteProject(project.id); }} />
      )}

      <style jsx global>{`
        @media (max-width: 900px) {
          .proj-grid { grid-template-columns: 1fr !important; }
          .proj-rail { flex-direction: row !important; flex-wrap: wrap !important; }
          .proj-rail > * { flex: 1 1 220px; }
        }
      `}</style>
    </div>
  );
}

/* ===== Список задач с группировкой ===== */
function TaskList({ active, done, filter, sort, showDone, setShowDone, onToggleTask, onOpenTask, onReorderTasks, allTasks }) {
  // фильтр «Выполненные»
  if (filter === 'done') {
    if (done.length === 0) return <Empty text="Выполненных задач пока нет" />;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sortTasks(done, sort === 'manual' ? 'manual' : sort).map(t => (
          <TaskRow key={t.id} task={t} onToggle={onToggleTask} onOpen={onOpenTask} />
        ))}
      </div>
    );
  }

  // Вручную — плоский перетаскиваемый список активных с живым превью
  if (sort === 'manual') {
    const ordered = sortTasks(active, 'manual');
    if (ordered.length === 0 && !(filter === 'all' && done.length)) return <Empty text="Задач пока нет — добавь первую выше" />;
    return (
      <div>
        <SortableList items={ordered} onReorder={onReorderTasks}
          renderRow={(t, { dragging, handleProps }) => (
            <TaskRow task={t} dragging={dragging} handleProps={handleProps} onToggle={onToggleTask} onOpen={onOpenTask} />
          )} />
        {filter === 'all' && done.length > 0 && (
          <DoneBlock done={done} sort={sort} showDone={showDone} setShowDone={setShowDone} onToggle={onToggleTask} onOpen={onOpenTask} />
        )}
      </div>
    );
  }

  // Группировка: Просрочено / Сегодня / Предстоящие / Без даты
  const groups = groupTasks(active);
  const order = ['overdue', 'today', 'upcoming', 'nodate'];
  const anyActive = order.some(k => groups[k].length);
  if (!anyActive && !(filter === 'all' && done.length)) return <Empty text="Задач пока нет — добавь первую выше" />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {order.map(key => {
        const items = sortTasks(groups[key], sort);
        if (items.length === 0) return null;
        const meta = GROUP_META[key];
        return (
          <div key={key}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: meta.color }} />
              <span style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: meta.color }}>{meta.label}</span>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted)' }}>{items.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {items.map(t => <TaskRow key={t.id} task={t} onToggle={onToggleTask} onOpen={onOpenTask} />)}
            </div>
          </div>
        );
      })}

      {filter === 'all' && done.length > 0 && (
        <DoneBlock done={done} sort={sort} showDone={showDone} setShowDone={setShowDone} onToggle={onToggleTask} onOpen={onOpenTask} />
      )}
    </div>
  );
}

function DoneBlock({ done, sort, showDone, setShowDone, onToggle, onOpen }) {
  return (
    <div>
      <button onClick={() => setShowDone(v => !v)} style={{
        display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 10,
      }}>
        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" style={{ transform: showDone ? 'rotate(90deg)' : 'none', transition: 'transform .15s', color: 'var(--text-muted)' }}>
          <polyline stroke="currentColor" strokeWidth="2.5" points="9 6 15 12 9 18" />
        </svg>
        <span style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--success)' }}>Выполненные</span>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted)' }}>{done.length}</span>
      </button>
      {showDone && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sortTasks(done, sort === 'manual' ? 'manual' : sort).map(t => (
            <TaskRow key={t.id} task={t} onToggle={onToggle} onOpen={onOpen} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ===== Строка задачи ===== */
function TaskRow({ task, onToggle, onOpen, dragging, handleProps }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onClick={() => { if (!dragging) onOpen(task.id); }}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: dragging ? 'var(--primary-soft)' : hover ? 'var(--surface-hover)' : 'var(--surface)',
        border: '1px solid', borderRadius: 12, padding: '13px 16px',
        cursor: 'pointer', transition: 'background .12s, border-color .12s, box-shadow .12s, transform .12s',
        borderColor: dragging ? 'var(--primary)' : hover ? 'var(--border-strong)' : 'var(--border)',
        boxShadow: dragging ? 'var(--shadow-lg)' : 'none',
        transform: dragging ? 'scale(1.015)' : 'none',
        opacity: task.completed && !dragging ? 0.72 : 1,
        position: 'relative', zIndex: dragging ? 5 : 'auto',
      }}>
      {handleProps && (
        <span
          {...handleProps}
          onClick={e => e.stopPropagation()}
          title="Перетащите, чтобы изменить порядок"
          style={{
            cursor: 'grab', color: 'var(--text-muted)', opacity: hover || dragging ? 0.9 : 0.45,
            flexShrink: 0, display: 'flex', alignItems: 'center', touchAction: 'none',
            padding: '12px 8px', margin: '-12px -6px -12px -6px',
          }}>
          <svg width="11" height="17" viewBox="0 0 10 16" fill="currentColor"><circle cx="2" cy="3" r="1.6" /><circle cx="8" cy="3" r="1.6" /><circle cx="2" cy="8" r="1.6" /><circle cx="8" cy="8" r="1.6" /><circle cx="2" cy="13" r="1.6" /><circle cx="8" cy="13" r="1.6" /></svg>
        </span>
      )}
      <TaskCheckbox completed={task.completed} onToggle={() => onToggle(task.id)} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: task.completed ? 'var(--text-muted)' : 'var(--text)', textDecoration: task.completed ? 'line-through' : 'none', marginBottom: task.completed || task.dueDate || true ? 5 : 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {task.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <PriorityBadge value={task.priority} />
          {task.completed ? (
            <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="11" height="11" fill="none" viewBox="0 0 24 24"><polyline stroke="currentColor" strokeWidth="2.5" points="20 6 9 17 4 12" /></svg>
              Выполнено
            </span>
          ) : task.dueDate ? (
            <span style={{ fontSize: 12.5, color: dueTone(task.dueDate, false), display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>
              <CalIcon size={11} />{humanDate(task.dueDate)}
            </span>
          ) : null}
          {task.note ? (
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" style={{ color: 'var(--text-muted)' }}><path stroke="currentColor" strokeWidth="2" d="M4 6h16M4 12h16M4 18h10" /></svg>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ===== Вспомогательные ===== */
function SegmentedControl({ options, value, onChange, small }) {
  return (
    <div style={{ display: 'inline-flex', background: 'var(--surface-2)', borderRadius: 9, padding: 3, gap: 2 }}>
      {options.map(o => {
        const active = value === o.key;
        return (
          <button key={o.key} onClick={() => onChange(o.key)} style={{
            padding: small ? '5px 10px' : '6px 13px', borderRadius: 7, border: 'none',
            fontSize: small ? 12 : 12.5, fontWeight: 600, cursor: 'pointer',
            background: active ? 'var(--surface)' : 'none',
            color: active ? 'var(--text)' : 'var(--text-secondary)',
            boxShadow: active ? 'var(--shadow-sm)' : 'none', transition: 'all .12s',
          }}>{o.label}</button>
        );
      })}
    </div>
  );
}

function RailCard({ title, children }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 18, boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>{title}</div>
      {children}
    </div>
  );
}

function LegendRow({ color, label, value, border }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 9, height: 9, borderRadius: 3, background: color, border: border ? '1px solid var(--border-strong)' : 'none', flexShrink: 0 }} />
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ marginLeft: 'auto', fontWeight: 700, color: 'var(--text)' }}>{value}</span>
    </div>
  );
}

function Donut({ done, total, label, sub }) {
  const size = 92, stroke = 11, r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const pct = total ? done / total : 0;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--primary)" strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)} strokeLinecap="round" style={{ transition: 'stroke-dashoffset .5s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{label}</span>
        <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>{sub}</span>
      </div>
    </div>
  );
}

function MenuItem({ children, onClick, danger }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 7,
      background: 'none', border: 'none', color: danger ? 'var(--danger)' : 'var(--text)',
      fontSize: 13.5, cursor: 'pointer', width: '100%', textAlign: 'left',
    }}
      onMouseEnter={e => e.currentTarget.style.background = danger ? 'var(--danger-soft)' : 'var(--surface-2)'}
      onMouseLeave={e => e.currentTarget.style.background = 'none'}>
      {children}
    </button>
  );
}

function Empty({ text }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px dashed var(--border-strong)', borderRadius: 14, textAlign: 'center', padding: '44px 20px', color: 'var(--text-secondary)', fontSize: 14 }}>
      {text}
    </div>
  );
}

function ConfirmDelete({ name, onCancel, onConfirm }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(16,24,40,0.45)', backdropFilter: 'blur(2px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 26, width: '100%', maxWidth: 400, boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Удалить проект «{name}»?</div>
        <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
          Все задачи этого проекта будут удалены без возможности восстановления.
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, background: 'var(--surface-2)', color: 'var(--text-secondary)', border: 'none', borderRadius: 10, padding: '11px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Отмена</button>
          <button onClick={onConfirm} style={{ flex: 1, background: 'var(--danger)', color: '#fff', border: 'none', borderRadius: 10, padding: '11px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Удалить</button>
        </div>
      </div>
    </div>
  );
}
