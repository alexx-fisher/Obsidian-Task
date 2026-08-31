'use client';
import { PriorityBadge, CalIcon } from './common';
import { projectColor, humanDate, dueTone } from '../lib/ui';
import { today } from '../lib/store';

export default function Dashboard({ projects, tasks, onProjectClick, onOpenTask }) {
  const t = today();

  // "Самый активный сегодня" — больше всего выполнено сегодня, затем больше активных
  const activity = projects.map((p, idx) => {
    const pt = tasks.filter(x => x.projectId === p.id);
    return {
      project: p, idx,
      completedToday: pt.filter(x => x.completed && x.dueDate === t).length,
      active: pt.filter(x => !x.completed).length,
      done: pt.filter(x => x.completed).length,
      total: pt.length,
    };
  }).sort((a, b) => b.completedToday - a.completedToday || b.active - a.active || b.total - a.total);

  const hero = activity[0];
  const heroPct = hero && hero.total ? Math.round(hero.done / hero.total * 100) : 0;

  // Ближайшие дедлайны — активные задачи с датой, ближайшие сверху, затем без даты
  const deadlines = [...tasks.filter(x => !x.completed)]
    .sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate < b.dueDate ? -1 : 1;
    })
    .slice(0, 6);

  return (
    <div style={{ maxWidth: 1000 }}>
      <h1 style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 6, color: 'var(--text)' }}>
        Обзор рабочего пространства
      </h1>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 28 }}>
        Управляйте проектами и отслеживайте прогресс в реальном времени.
      </p>

      {hero && (
        <div onClick={() => onProjectClick(hero.project.id)} style={{
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16,
          padding: 28, marginBottom: 36, cursor: 'pointer', boxShadow: 'var(--shadow-sm)',
          transition: 'box-shadow .15s, border-color .15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 11px', borderRadius: 999, background: 'var(--accent-soft)', color: 'var(--accent)', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                Самый активный сегодня
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: 6 }}>{hero.project.name}</h2>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Сегодня ты продвинулся здесь дальше всего</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--success)', fontSize: 13, fontWeight: 600, flexShrink: 0, whiteSpace: 'nowrap' }}>
              <svg width="17" height="17" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /><polyline stroke="currentColor" strokeWidth="2" points="8 12 11 15 16 9" /></svg>
              {hero.done} завершено
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 22, flexWrap: 'wrap' }}>
            <Pill>{hero.total} задач</Pill>
            <Pill tone="success">{hero.done} выполнено</Pill>
            <Pill>{hero.active} осталось</Pill>
            <div style={{ flex: 1, minWidth: 120, height: 8, background: 'var(--surface-2)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${heroPct}%`, background: 'var(--primary)', borderRadius: 999, transition: 'width .5s ease' }} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap' }}>{heroPct}%</div>
          </div>
        </div>
      )}

      <h2 style={{ fontSize: 19, fontWeight: 700, color: 'var(--text)', marginBottom: 16 }}>Ближайшие дедлайны</h2>

      {deadlines.length === 0 ? (
        <div style={{ background: 'var(--surface)', border: '1px dashed var(--border-strong)', borderRadius: 14, textAlign: 'center', padding: '48px 20px', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, color: 'var(--text)' }}>Активных задач нет</div>
          <div style={{ fontSize: 13.5 }}>Создай задачу через кнопку + внизу справа</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {deadlines.map(task => {
            const pi = projects.findIndex(p => p.id === task.projectId);
            const proj = projects[pi];
            return (
              <div key={task.id} onClick={() => onOpenTask(task.id)} style={{
                background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12,
                padding: '15px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: 14, cursor: 'pointer', transition: 'background .12s, border-color .12s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                  <div style={{ width: 4, height: 38, borderRadius: 999, background: projectColor(pi < 0 ? 0 : pi), flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{proj?.name || '—'}</span>
                      {task.dueDate && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: dueTone(task.dueDate, false) }}>
                          <CalIcon size={11} />{humanDate(task.dueDate)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <PriorityBadge value={task.priority} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Pill({ children, tone }) {
  const map = {
    success: { bg: 'var(--success-soft)', color: 'var(--success)' },
    default: { bg: 'var(--surface-2)', color: 'var(--text-secondary)' },
  };
  const s = map[tone] || map.default;
  return (
    <span style={{ padding: '5px 12px', borderRadius: 999, background: s.bg, color: s.color, fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap' }}>
      {children}
    </span>
  );
}
