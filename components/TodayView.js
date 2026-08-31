'use client';
import { useState } from 'react';
import { today } from '../lib/store';
import { TaskCheckbox, PriorityBadge, CalIcon } from './common';
import { groupTasks, GROUP_META, humanDate, dueTone, projectColor } from '../lib/ui';

export default function TodayView({ tasks, projects, onToggleTask, onOpenTask }) {
  const [showDone, setShowDone] = useState(false);
  const groups = groupTasks(tasks);
  const order = ['overdue', 'today', 'upcoming', 'nodate'];

  const focusCount = groups.overdue.length + groups.today.length;
  const todayDone = groups.done.filter(t => t.dueDate === today()).length;
  const totalActive = order.reduce((n, k) => n + groups[k].length, 0);
  const isEmpty = totalActive === 0 && groups.done.length === 0;

  return (
    <div style={{ maxWidth: 760 }}>
      <h1 style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 6, color: 'var(--text)' }}>Сегодня</h1>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 24 }}>
        Что требует внимания прямо сейчас.
      </p>

      {isEmpty ? (
        <Empty />
      ) : (
        <>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14, boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ width: 42, height: 42, borderRadius: 11, background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" /></svg>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
                {focusCount > 0 ? `Требует внимания: ${focusCount}` : 'Всё под контролем'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                {groups.overdue.length > 0 ? `${groups.overdue.length} просрочено · ` : ''}{groups.today.length} на сегодня · {todayDone} выполнено
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            {order.map(key => {
              const items = groups[key];
              if (items.length === 0) return null;
              const meta = GROUP_META[key];
              return (
                <Section key={key} meta={meta} count={items.length}>
                  {items.map(t => (
                    <Row key={t.id} task={t} projects={projects} onToggle={onToggleTask} onOpen={onOpenTask} />
                  ))}
                </Section>
              );
            })}

            {groups.done.length > 0 && (
              <div>
                <button onClick={() => setShowDone(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 10 }}>
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" style={{ transform: showDone ? 'rotate(90deg)' : 'none', transition: 'transform .15s', color: 'var(--text-muted)' }}>
                    <polyline stroke="currentColor" strokeWidth="2.5" points="9 6 15 12 9 18" />
                  </svg>
                  <span style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--success)' }}>Выполненные</span>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted)' }}>{groups.done.length}</span>
                </button>
                {showDone && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {groups.done.map(t => <Row key={t.id} task={t} projects={projects} onToggle={onToggleTask} onOpen={onOpenTask} />)}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Section({ meta, count, children }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: meta.color }} />
        <span style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: meta.color }}>{meta.label}</span>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-muted)' }}>{count}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
    </div>
  );
}

function Row({ task, projects, onToggle, onOpen }) {
  const [hover, setHover] = useState(false);
  const pi = projects.findIndex(p => p.id === task.projectId);
  const proj = projects[pi];
  return (
    <div onClick={() => onOpen(task.id)}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: hover ? 'var(--surface-hover)' : 'var(--surface)',
        border: '1px solid', borderColor: hover ? 'var(--border-strong)' : 'var(--border)',
        borderRadius: 12, padding: '13px 16px', cursor: 'pointer', transition: 'all .12s',
        opacity: task.completed ? 0.72 : 1,
      }}>
      <TaskCheckbox completed={task.completed} onToggle={() => onToggle(task.id)} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: task.completed ? 'var(--text-muted)' : 'var(--text)', textDecoration: task.completed ? 'line-through' : 'none', marginBottom: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {task.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
          {proj && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-secondary)' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: projectColor(pi) }} />{proj.name}
            </span>
          )}
          <PriorityBadge value={task.priority} />
          {!task.completed && task.dueDate && (
            <span style={{ fontSize: 12.5, color: dueTone(task.dueDate, false), display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>
              <CalIcon size={11} />{humanDate(task.dueDate)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function Empty() {
  return (
    <div style={{ background: 'var(--surface)', border: '1px dashed var(--border-strong)', borderRadius: 14, textAlign: 'center', padding: '64px 20px', color: 'var(--text-secondary)' }}>
      <svg width="44" height="44" fill="none" viewBox="0 0 24 24" style={{ margin: '0 auto 14px', display: 'block', color: 'var(--text-muted)' }}>
        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18M8 15l3 3 5-5" />
      </svg>
      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, color: 'var(--text)' }}>Задач нет</div>
      <div style={{ fontSize: 13.5 }}>Добавь задачи через кнопку + внизу справа</div>
    </div>
  );
}
