'use client';

const COLORS = ['#ba9eff','#68fcbf','#699cff','#ff6e84','#ffd166','#f77f00'];
const colorFor = (i) => COLORS[i % COLORS.length];

export default function Dashboard({ projects, tasks, onProjectClick }) {
  const upcoming = tasks.filter(t => !t.completed).slice(0, 5);

  // Цвета приоритетов — красный/зелёный/голубой
  const pLabel = { high: 'Высокий', medium: 'Средний', low: 'Низкий' };
  const pColor = { high: '#ff6e84', medium: '#68fcbf', low: '#699cff' };
  const pBg = { high: 'rgba(255,110,132,0.12)', medium: 'rgba(104,252,191,0.12)', low: 'rgba(105,156,255,0.12)' };

  // Умная логика "Самый активный сегодня"
  const todayStr = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  })();

  const projectActivity = projects.map(p => {
    const ptasks = tasks.filter(t => t.projectId === p.id);
    const completedToday = ptasks.filter(t => t.completed && t.dueDate === todayStr).length;
    const totalActive = ptasks.filter(t => !t.completed).length;
    return { project: p, completedToday, totalActive };
  });

  const sorted = [...projectActivity].sort((a, b) =>
    b.completedToday !== a.completedToday
      ? b.completedToday - a.completedToday
      : b.totalActive - a.totalActive
  );

  const heroActivity = sorted[0];
  const heroProject = heroActivity?.project;
  const heroTasks = heroProject ? tasks.filter(t => t.projectId === heroProject.id) : [];
  const heroPct = heroTasks.length ? Math.round(heroTasks.filter(t => t.completed).length / heroTasks.length * 100) : 0;
  const hasActivityToday = (heroActivity?.completedToday || 0) > 0;

  return (
    <div>
      <h1 style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8 }}>Обзор рабочего пространства</h1>
      <p style={{ fontSize: 15, color: 'var(--on-surface-variant)', marginBottom: 40, maxWidth: 580 }}>
        Управляйте проектами и отслеживайте прогресс в реальном времени.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr', gap: 20 }} className="bento-grid">

        {/* Hero card */}
        {heroProject && (
          <div onClick={() => onProjectClick(heroProject.id)} style={{
            gridColumn: 'span 8', borderRadius: 16, background: 'var(--surface-high)',
            height: 300, position: 'relative', overflow: 'hidden', cursor: 'pointer', transition: 'background .2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-bright)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-high)'}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(90,50,180,0.45) 0%, rgba(20,10,60,0.7) 100%)' }}/>
            <div style={{ position: 'relative', zIndex: 1, padding: 32, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'auto' }}>
                <div>
                  <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 999, background: 'rgba(186,158,255,0.15)', color: 'var(--primary)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
                    Самый активный сегодня
                  </div>
                  <h2 style={{ fontSize: 30, fontWeight: 700, color: '#fff', marginBottom: 10, lineHeight: 1.2 }}>{heroProject.name}</h2>
                  <p style={{ fontSize: 14, color: '#94a3b8', maxWidth: 340, lineHeight: 1.5 }}>Сегодня ты продвинулся здесь дальше всего</p>
                </div>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dim) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(186,158,255,0.35)', flexShrink: 0 }}>
                  <svg width="26" height="26" fill="none" viewBox="0 0 24 24"><path stroke="#000" strokeWidth="2" d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
                {[
                  { label: `${heroTasks.length} задач`, bg: 'rgba(255,255,255,0.1)', color: '#fff' },
                  { label: `${heroTasks.filter(t=>t.completed).length} выполнено`, bg: 'rgba(104,252,191,0.15)', color: '#68fcbf' },
                  { label: `${heroTasks.filter(t=>!t.completed).length} осталось`, bg: 'rgba(186,158,255,0.15)', color: '#ba9eff' },
                ].map((pill, i) => (
                  <div key={i} style={{
                    padding: '5px 14px', borderRadius: 999,
                    background: pill.bg, color: pill.color,
                    fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
                  }}>{pill.label}</div>
                ))}
                <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden', minWidth: 60 }}>
                  <div style={{ height: '100%', width: `${heroPct}%`, background: 'var(--primary)', borderRadius: 999, boxShadow: '0 0 12px rgba(186,158,255,0.5)' }}/>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)', whiteSpace: 'nowrap' }}>{heroPct}%</div>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[
            { icon: <svg width="28" height="28" fill="#68fcbf" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>, label: 'Скорость', value: tasks.filter(t=>t.completed).length.toString(), desc: 'Задач завершено всего' },
            { icon: <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#699cff" strokeWidth="2"/><path stroke="#699cff" strokeWidth="2" d="M12 6v6l4 2"/></svg>, label: 'Фокус-часы', value: '0ч', desc: 'Зафиксировано времени' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'var(--surface-high)', borderRadius: 16, padding: 24, flex: 1, transition: 'background .2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-bright)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-high)'}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                {s.icon}
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-variant)' }}>{s.label}</span>
              </div>
              <div style={{ fontSize: 38, fontWeight: 900, color: '#fff', lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>{s.desc}</div>
            </div>
          ))}
        </div>

        {/* Upcoming — правка 18: убраны карточки проектов, оставлены только дедлайны */}
        {upcoming.length > 0 && (
          <div style={{ gridColumn: 'span 12', marginTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>Ближайшие дедлайны</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {upcoming.map(t => {
                const proj = projects.find(p => p.id === t.projectId);
                const pi = projects.findIndex(p => p.id === t.projectId);
                return (
                  <div key={t.id} style={{
                    background: 'var(--surface-high)', borderRadius: 14, padding: '16px 20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'background .2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-bright)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-high)'}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ width: 4, height: 40, borderRadius: 999, background: colorFor(pi), flexShrink: 0 }}/>
                      <div>
                        <div style={{ fontWeight: 700, color: '#fff', marginBottom: 4 }}>{t.name}</div>
                        <div style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>{proj?.name || '—'}</div>
                      </div>
                    </div>
                    <span style={{ padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', background: pBg[t.priority] || pBg.low, color: pColor[t.priority] || pColor.low }}>
                      {pLabel[t.priority] || 'Низкий'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {upcoming.length === 0 && (
          <div style={{ gridColumn: 'span 12', textAlign: 'center', padding: '60px 20px', color: 'var(--on-surface-variant)' }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Активных задач нет</div>
            <div style={{ fontSize: 14 }}>Создай задачи через кнопку + внизу справа</div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .bento-grid { grid-template-columns: repeat(12, 1fr) !important; }
        @media (max-width: 768px) {
          .bento-grid { grid-template-columns: 1fr !important; gap: 14px !important; }
          .bento-grid > * { grid-column: span 1 !important; }
        }
      `}</style>
    </div>
  );
}
