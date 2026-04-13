'use client';
import { today, formatDate } from '../lib/store';

const COLORS = ['#ba9eff','#68fcbf','#699cff','#ff6e84','#ffd166','#f77f00'];
const colorFor = (i) => COLORS[i % COLORS.length];

export default function TodayView({ tasks, projects, onToggleTask }) {
  const todayStr = today();
  const todayTasks = tasks.filter(t => t.dueDate === todayStr);
  const done = todayTasks.filter(t => t.completed).length;
  const pct = todayTasks.length ? Math.round(done / todayTasks.length * 100) : 0;

  const PRIO = {
    high:   { label: 'Высокий', color: '#ff6e84', bg: 'rgba(255,110,132,0.12)' },
    medium: { label: 'Средний', color: '#68fcbf', bg: 'rgba(104,252,191,0.12)' },
    low:    { label: 'Низкий',  color: '#699cff', bg: 'rgba(105,156,255,0.12)' },
  };

  return (
    <div>
      <h1 style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8 }}>Сегодня</h1>
      <p style={{ fontSize: 15, color: 'var(--on-surface-variant)', marginBottom: 40 }}>
        Задачи, которые срочно нужно сделать сегодня.
      </p>

      {todayTasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--on-surface-variant)' }}>
          <svg width="48" height="48" fill="none" viewBox="0 0 24 24" style={{ margin: '0 auto 16px', display: 'block', opacity: 0.3 }}>
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
            <path stroke="currentColor" strokeWidth="1.5" d="M16 2v4M8 2v4M3 10h18"/>
            <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" d="M8 14l3 3 5-5"/>
          </svg>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>На сегодня задач нет</div>
          <div style={{ fontSize: 14 }}>Добавь задачи с датой на сегодня через кнопку +</div>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24, marginBottom: 32 }} className="today-grid">
            {/* Left — progress card */}
            <div style={{ background: 'var(--surface-high)', borderRadius: 16, padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <svg width="28" height="28" fill="#68fcbf" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)', background: 'rgba(104,252,191,0.12)', padding: '3px 10px', borderRadius: 999, color: 'var(--secondary)' }}>FOCUS</span>
              </div>
              <div style={{ marginTop: 'auto' }}>
                <div style={{ fontSize: 52, fontWeight: 900, color: '#fff', lineHeight: 1, marginBottom: 6 }}>{pct}%</div>
                <div style={{ fontSize: 13, color: 'var(--on-surface-variant)', marginBottom: 20 }}>Прогресс дня</div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: 'var(--secondary)', borderRadius: 999, boxShadow: '0 0 10px rgba(104,252,191,0.5)', transition: 'width .5s ease' }}/>
                </div>
              </div>
            </div>

            {/* Right — task list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {todayTasks.map(t => {
                const proj = projects.find(p => p.id === t.projectId);
                const pi = projects.findIndex(p => p.id === t.projectId);
                const p = PRIO[t.priority] || PRIO.low;
                return (
                  <div key={t.id} style={{
                    background: 'var(--surface-high)', borderRadius: 14, padding: '16px 20px',
                    display: 'flex', alignItems: 'center', gap: 16, transition: 'background .2s',
                    opacity: t.completed ? 0.6 : 1,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-bright)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-high)'}>
                    <button onClick={() => onToggleTask(t.id)} style={{
                      width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                      border: `2px solid ${t.completed ? 'var(--secondary)' : 'var(--outline-variant)'}`,
                      background: t.completed ? 'var(--secondary)' : 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0, transition: 'all .2s',
                    }}>
                      {t.completed && <svg width="12" height="12" fill="none" viewBox="0 0 24 24"><polyline stroke="#005e40" strokeWidth="3" points="20 6 9 17 4 12"/></svg>}
                    </button>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 600, color: t.completed ? 'var(--outline)' : 'var(--on-surface)', textDecoration: t.completed ? 'line-through' : 'none', marginBottom: 6 }}>
                        {t.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        {/* название проекта — мелко, без акцента (правка 5) */}
                        {proj && <span style={{ fontSize: 11, color: 'var(--outline)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{proj.name}</span>}
                        <span style={{ fontSize: 11, color: 'var(--outline)' }}>·</span>
                        <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', background: p.bg, color: p.color }}>{p.label}</span>
                      </div>
                    </div>
                    <svg width="16" height="16" fill="none" viewBox="0 0 16 16" style={{ color: 'var(--outline-variant)', flexShrink: 0, opacity: 0.5 }}>
                      <circle cx="3" cy="4" r="1.5" fill="currentColor"/><circle cx="9" cy="4" r="1.5" fill="currentColor"/>
                      <circle cx="3" cy="8" r="1.5" fill="currentColor"/><circle cx="9" cy="8" r="1.5" fill="currentColor"/>
                      <circle cx="3" cy="12" r="1.5" fill="currentColor"/><circle cx="9" cy="12" r="1.5" fill="currentColor"/>
                    </svg>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Focus block (правки 5,6) */}
          <div style={{ background: 'var(--surface-high)', borderRadius: 16, padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Фокус на главном</div>
              <div style={{ fontSize: 14, color: 'var(--on-surface-variant)', maxWidth: 400 }}>
                Сегодня у вас {todayTasks.filter(t=>!t.completed).length} активных задач. Самое время начать с наиболее приоритетных.
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
          .today-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
