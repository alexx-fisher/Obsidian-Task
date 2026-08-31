'use client';
import { useState, useRef, useEffect } from 'react';
import { today } from '../lib/store';

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const MONTHS_NOM = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

const pad = (n) => String(n).padStart(2, '0');
const toStr = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
const parse = (s) => { const [y, m, d] = s.split('-').map(Number); return { y, m: m - 1, d }; };

// Понедельник = 0
const mondayIndex = (jsDay) => (jsDay + 6) % 7;

export default function DatePicker({ value, onChange, active, placeholder = 'Выбрать дату' }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const sel = value ? parse(value) : null;
  const t = parse(today());
  const [view, setView] = useState(() => sel || t); // { y, m }

  useEffect(() => {
    if (open) setView(value ? parse(value) : parse(today()));
  }, [open]); // eslint-disable-line

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const label = value
    ? `${sel.d} ${MONTHS[sel.m]}${sel.y !== new Date().getFullYear() ? ` ${sel.y}` : ''}`
    : placeholder;

  const firstDow = mondayIndex(new Date(view.y, view.m, 1).getDay());
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const shiftMonth = (delta) => {
    const nm = view.m + delta;
    setView({ y: view.y + Math.floor(nm / 12), m: ((nm % 12) + 12) % 12 });
  };

  const pick = (d) => { onChange(toStr(view.y, view.m, d)); setOpen(false); };

  const chipStyle = {
    padding: '7px 12px', borderRadius: 8, fontSize: 12.5, fontWeight: 600,
    border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
    background: active ? 'var(--primary-soft)' : 'var(--surface)',
    color: active ? 'var(--primary)' : 'var(--text-secondary)',
    cursor: 'pointer', transition: 'all .15s', whiteSpace: 'nowrap',
    display: 'inline-flex', alignItems: 'center', gap: 6,
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button type="button" style={chipStyle} onClick={() => setOpen(o => !o)}>
        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
          <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
          <path stroke="currentColor" strokeWidth="2" d="M3 10h18M8 2v4M16 2v4" />
        </svg>
        {label}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 260,
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14,
          boxShadow: 'var(--shadow-lg)', padding: 14, width: 268,
        }}>
          {/* Заголовок */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text)' }}>
              {MONTHS_NOM[view.m]} {view.y}
            </div>
            <div style={{ display: 'flex', gap: 2 }}>
              <NavBtn onClick={() => shiftMonth(-1)} label="Предыдущий месяц">
                <polyline points="15 18 9 12 15 6" />
              </NavBtn>
              <NavBtn onClick={() => shiftMonth(1)} label="Следующий месяц">
                <polyline points="9 18 15 12 9 6" />
              </NavBtn>
            </div>
          </div>

          {/* Дни недели */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
            {WEEKDAYS.map((w, i) => (
              <div key={w} style={{ textAlign: 'center', fontSize: 10.5, fontWeight: 700, color: i >= 5 ? 'var(--text-muted)' : 'var(--text-secondary)', padding: '4px 0' }}>{w}</div>
            ))}
          </div>

          {/* Сетка */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {cells.map((d, i) => {
              if (d === null) return <div key={i} />;
              const ds = toStr(view.y, view.m, d);
              const isSel = value === ds;
              const isToday = ds === today();
              return (
                <button key={i} type="button" onClick={() => pick(d)} style={{
                  height: 32, borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: isSel || isToday ? 700 : 500,
                  background: isSel ? 'var(--primary)' : 'none',
                  color: isSel ? '#fff' : isToday ? 'var(--primary)' : 'var(--text)',
                  transition: 'background .12s',
                }}
                  onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = 'var(--surface-2)'; }}
                  onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'none'; }}>
                  {d}
                </button>
              );
            })}
          </div>

          {/* Действия */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
            <button type="button" onClick={() => { onChange(null); setOpen(false); }}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', padding: '2px 4px' }}>
              Очистить
            </button>
            <button type="button" onClick={() => { onChange(today()); setOpen(false); }}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', padding: '2px 4px' }}>
              Сегодня
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function NavBtn({ onClick, children, label }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} style={{
      width: 26, height: 26, borderRadius: 7, border: 'none', background: 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)',
    }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
      onMouseLeave={e => e.currentTarget.style.background = 'none'}>
      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </button>
  );
}
