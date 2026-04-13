'use client';
import { today } from '../lib/store';

const COLORS = ['#ba9eff','#68fcbf','#699cff','#ff6e84','#ffd166','#f77f00'];

export default function UpcomingView({ tasks, projects, onToggleTask }) {
  const todayStr = today();

  // Собираем задачи на ближайшие 7 дней
  const days = [];
  for (let i = 1; i <= 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const label = i === 1 ? 'Завтра' : i === 2 ? 'Послезавтра' : d.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
    const dayTasks = tasks.filter(t => t.dueDate === dateStr);
    if (dayTasks.length > 0) days.push({ dateStr, label, tasks: dayTasks });
  }

  // Также задачи без даты или просроченные
  const overdue = tasks.filter(t => !t.completed && t.dueDate && t.dueDate < todayStr);

  const PRIO = {
    high:   { label: 'Высокий', color: '#ff6e84', bg: 'rgba(255,110,132,0.12)' },
    medium: { label: 'Средний', color: '#68fcbf', bg: 'rgba(104,252,191,0.12)' },
    low:    { label: 'Низкий',  color: '#699cff', bg: 'rgba(105,156,255,0.12)' },
  };

  const totalUpcoming = days.reduce((acc, d) => acc + d.tasks.length, 0);
  const doneUpcoming = days.reduce((acc, d) => acc + d.tasks.filter(t=>t.completed).length, 0);
  const pct = totalUpcoming ? Math.round(doneUpcoming / totalUpcoming * 100) : 0;

  return (
    <div>
      <h1 style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8 }}>Предстоящее</h1>
      <p style={{ fontSize: 15, color: 'var(--on-surface-variant)', marginBottom: 40 }}>
        Задачи на ближайшие 7 дней.
      </p>

      {overdue.length === 0 && days.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--on-surface-variant)' }}>
          <svg width="48" height="48" fill="none" viewBox="0 0 24 24" style={{ margin: '0 auto 16px', display: 'block', opacity: 0.3 }}>
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
            <path stroke="currentColor" strokeWidth="1.5" d="M16 2v4M8 2v4M3 10h18M8 14h8M8 18h5"/>
          </svg>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Предстоящих задач нет</div>
          <div style={{ fontSize: 14 }}>Добавь задачи с датой через кнопку +</div>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24, marginBottom: 32 }} className="upcoming-grid">
            {/* Left — progress */}
            <div style={{ background: 'var(--surface-high)', borderRadius: 16, padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" stroke="#699cff" strokeWidth="2"/><path stroke="#699cff" strokeWidth="2" d="M16 2v4M8 2v4M3 10h18M8 14h8M8 18h5"/></svg>
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', background: 'rgba(105,156,255,0.12)', padding: '3px 10px', borderRadius: 999, color: 'var(--tertiary)' }}>7 ДНЕЙ</span>
              </div>
              <div style={{ marginTop: 'auto' }}>
                <div style={{ fontSize: 52, fontWeight: 900, color: '#fff', lineHeight: 1, marginBottom: 6 }}>{totalUpcoming}</div>
                <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginBottom: 20 }}>Задач запланировано</div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: 'var(--tertiary)', borderRadius: 999, boxShadow: '0 0 10px rgba(105,156,255,0.5)', transition: 'width .5s ease' }}/>
                </div>
              </div>
            </div>

            {/* Right — tasks grouped by day */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {overdue.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--error-dim)', marginBottom: 10 }}>
                    ⚠ Просроченные
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {overdue.map(t => <UpcomingTask key={t.id} task={t} projects={projects} PRIO={PRIO} onToggle={onToggleTask}/>)}
                  </div>
                </div>
              )}
              {days.map(day => (
                <div key={day.dateStr}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)', marginBottom: 10 }}>
                    {day.label}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {day.tasks.map(t => <UpcomingTask key={t.id} task={t} projects={projects} PRIO={PRIO} onToggle={onToggleTask}/>)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Focus block */}
          <div style={{ background: 'var(--surface-high)', borderRadius: 16, padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Фокус на главном</div>
              <div style={{ fontSize: 14, color: 'var(--on-surface-variant)', maxWidth: 400 }}>
                На ближайшую неделю запланировано {totalUpcoming} задач. Самое время начать с наиболее приоритетных.
              </div>
            </div>
            <button style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dim) 100%)', color: '#000', border: 'none', padding: '12px 28px', borderRadius: 999, fontSize: 14, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'filter .2s' }}
              onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
              onMouseLeave={e => e.currentTarget.style.filter = 'none'}>
              Старт сессии
            </button>
          </div>
        </>
      )}

      <style jsx global>{`
        @media (max-width: 768px) {
          .upcoming-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function UpcomingTask({ task, projects, PRIO, onToggle }) {
  const proj = projects.find(p => p.id === task.projectId);
  const p = PRIO[task.priority] || PRIO.low;
  return (
    <div style={{
      background: 'var(--surface-high)', borderRadius: 14, padding: '14px 20px',
      display: 'flex', alignItems: 'center', gap: 16, transition: 'background .2s',
      opacity: task.completed ? 0.6 : 1,
    }}
    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-bright)'}
    onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-high)'}>
      <button onClick={() => onToggle(task.id)} style={{
        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
        border: `2px solid ${task.completed ? 'var(--secondary)' : 'var(--outline-variant)'}`,
        background: task.completed ? 'var(--secondary)' : 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0, transition: 'all .2s',
      }}>
        {task.completed && <svg width="11" height="11" fill="none" viewBox="0 0 24 24"><polyline stroke="#005e40" strokeWidth="3" points="20 6 9 17 4 12"/></svg>}
      </button>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: task.completed ? 'var(--outline)' : 'var(--on-surface)', textDecoration: task.completed ? 'line-through' : 'none', marginBottom: 4 }}>{task.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {proj && <span style={{ fontSize: 11, color: 'var(--outline)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{proj.name}</span>}
          <span style={{ fontSize: 11, color: 'var(--outline)' }}>·</span>
          <span style={{ padding: '2px 7px', borderRadius: 4, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', background: p.bg, color: p.color }}>{p.label}</span>
        </div>
      </div>
    </div>
  );
}
