'use client';
import { useState } from 'react';
import { today } from '../lib/store';
import { TaskCheckbox, PriorityBadge } from './common';
import { humanDate, dueTone, projectColor } from '../lib/ui';

export default function UpcomingView({ tasks, projects, onToggleTask, onOpenTask }) {
  const todayStr = today();

  const days = [];
  for (let i = 1; i <= 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayTasks = tasks.filter(t => t.dueDate === dateStr && !t.completed);
    if (dayTasks.length > 0) {
      const label = i === 1 ? 'Завтра' : d.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
      days.push({ dateStr, label, tasks: dayTasks });
    }
  }
  const overdue = tasks
    .filter(t => !t.completed && t.dueDate && t.dueDate < todayStr)
    .sort((a, b) => a.dueDate < b.dueDate ? -1 : 1);
  const total = days.reduce((n, d) => n + d.tasks.length, 0) + overdue.length;

  return (
    <div style={{ maxWidth: 760 }}>
      <h1 style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 6, color: 'var(--text)' }}>Предстоящее</h1>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 24 }}>Задачи на ближайшие две недели.</p>

      {total === 0 ? (
        <div style={{ background: 'var(--surface)', border: '1px dashed var(--border-strong)', borderRadius: 14, textAlign: 'center', padding: '64px 20px', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, color: 'var(--text)' }}>Предстоящих задач нет</div>
          <div style={{ fontSize: 13.5 }}>Добавь задачи с датой через кнопку +</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {overdue.length > 0 && (
            <DayGroup label="Просрочено" color="var(--danger)">
              {overdue.map(t => <Row key={t.id} task={t} projects={projects} onToggle={onToggleTask} onOpen={onOpenTask} showDate />)}
            </DayGroup>
          )}
          {days.map(day => (
            <DayGroup key={day.dateStr} label={day.label} color="var(--text-secondary)">
              {day.tasks.map(t => <Row key={t.id} task={t} projects={projects} onToggle={onToggleTask} onOpen={onOpenTask} />)}
            </DayGroup>
          ))}
        </div>
      )}
    </div>
  );
}

function DayGroup({ label, color, children }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
        <span style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color }}>{label}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
    </div>
  );
}

function Row({ task, projects, onToggle, onOpen, showDate }) {
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
      }}>
      <TaskCheckbox completed={task.completed} onToggle={() => onToggle(task.id)} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)', marginBottom: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
          {proj && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-secondary)' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: projectColor(pi) }} />{proj.name}
            </span>
          )}
          <PriorityBadge value={task.priority} />
          {showDate && task.dueDate && (
            <span style={{ fontSize: 12.5, color: dueTone(task.dueDate, false), fontWeight: 500 }}>{humanDate(task.dueDate)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
