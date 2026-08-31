'use client';
import { useState, useRef, useEffect } from 'react';
import { today, localDateFromOffset } from '../lib/store';
import { PRIO, prio } from '../lib/ui';
import DatePicker from './DatePicker';

// ===== Конфетти + звук победы =====
export function triggerConfetti(element) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const playNote = (freq, start, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = freq; osc.type = 'sine';
      gain.gain.setValueAtTime(0, ctx.currentTime + start);
      gain.gain.linearRampToValueAtTime(0.28, ctx.currentTime + start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };
    playNote(523, 0, 0.15); playNote(659, 0.15, 0.15);
    playNote(784, 0.3, 0.15); playNote(1047, 0.45, 0.3);
  } catch (e) {}

  const rect = element ? element.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 };
  const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
  const colors = ['#2563eb', '#16a34a', '#6d5efc', '#e11d48', '#d97706', '#0891b2'];
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden;';
  document.body.appendChild(container);

  for (let i = 0; i < 38; i++) {
    const p = document.createElement('div');
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() * 8 + 4;
    const angle = Math.random() * 360 * (Math.PI / 180);
    const vel = Math.random() * 200 + 80;
    const vx = Math.cos(angle) * vel, vy = Math.sin(angle) * vel - 120;
    p.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;width:${size}px;height:${size}px;background:${color};border-radius:${Math.random() > 0.5 ? '50%' : '2px'};pointer-events:none;transform:translate(-50%,-50%);`;
    container.appendChild(p);
    let t0 = null; const dur = 900 + Math.random() * 400;
    const anim = (ts) => {
      if (!t0) t0 = ts;
      const prog = (ts - t0) / dur;
      if (prog >= 1) { p.remove(); return; }
      p.style.left = (cx + vx * prog) + 'px';
      p.style.top = (cy + vy * prog + 300 * prog * prog) + 'px';
      p.style.opacity = 1 - prog;
      p.style.transform = `translate(-50%,-50%) rotate(${prog * 360}deg)`;
      requestAnimationFrame(anim);
    };
    requestAnimationFrame(anim);
  }
  setTimeout(() => container.remove(), 1500);
}

// ===== Круглый чекбокс выполнения =====
export function TaskCheckbox({ completed, onToggle, size = 22 }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); if (!completed) triggerConfetti(e.currentTarget); onToggle(); }}
      style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        border: `2px solid ${completed ? 'var(--success)' : 'var(--border-strong)'}`,
        background: completed ? 'var(--success)' : 'var(--surface)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', padding: 0, transition: 'all .15s',
      }}
      onMouseEnter={e => { if (!completed) e.currentTarget.style.borderColor = 'var(--success)'; }}
      onMouseLeave={e => { if (!completed) e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
      aria-label={completed ? 'Снять отметку' : 'Отметить выполненной'}>
      {completed && <svg width={size * 0.55} height={size * 0.55} fill="none" viewBox="0 0 24 24"><polyline stroke="#fff" strokeWidth="3.5" points="20 6 9 17 4 12" /></svg>}
    </button>
  );
}

// ===== Бейдж приоритета =====
export function PriorityBadge({ value }) {
  const p = prio(value);
  return (
    <span style={{
      padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.05em', background: p.bg, color: p.color,
    }}>{p.label}</span>
  );
}

// ===== Кастомный выпадающий список приоритета (в стиле сайта) =====
export function PrioritySelect({ value, onChange, style, fullWidth }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const p = prio(value);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative', display: fullWidth ? 'block' : 'inline-block', width: fullWidth ? '100%' : undefined, ...style }}>
      <button type="button" onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 8, width: fullWidth ? '100%' : undefined,
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8,
        padding: '8px 12px', fontSize: 13, fontWeight: 600, color: p.color, cursor: 'pointer',
      }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
        {p.label}
        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>
          <path stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, minWidth: '100%', zIndex: 260,
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10,
          boxShadow: 'var(--shadow-lg)', padding: 4,
        }}>
          {['high', 'medium', 'low'].map(k => {
            const o = prio(k);
            const sel = k === value;
            return (
              <button key={k} type="button" onClick={() => { onChange(k); setOpen(false); }} style={{
                display: 'flex', alignItems: 'center', gap: 9, width: '100%', textAlign: 'left',
                background: sel ? 'var(--surface-2)' : 'none', border: 'none', borderRadius: 7,
                padding: '8px 10px', fontSize: 13.5, fontWeight: 600, color: o.color, cursor: 'pointer',
              }}
                onMouseEnter={e => { if (!sel) e.currentTarget.style.background = 'var(--surface-hover)'; }}
                onMouseLeave={e => { if (!sel) e.currentTarget.style.background = 'none'; }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: o.color, flexShrink: 0 }} />
                {o.label}
                {sel && <svg width="13" height="13" fill="none" viewBox="0 0 24 24" style={{ marginLeft: 'auto' }}><polyline stroke="currentColor" strokeWidth="2.5" points="20 6 9 17 4 12" /></svg>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ===== Универсальный выпадающий список (в стиле сайта) =====
export function Select({ value, onChange, options, fullWidth, placeholder = 'Выбрать…' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = options.find(o => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative', width: fullWidth ? '100%' : undefined, display: fullWidth ? 'block' : 'inline-block' }}>
      <button type="button" onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 8, width: '100%',
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10,
        padding: '10px 12px', fontSize: 14, fontWeight: 500, color: 'var(--text)', cursor: 'pointer',
      }}>
        {current?.color && <span style={{ width: 8, height: 8, borderRadius: '50%', background: current.color, flexShrink: 0 }} />}
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{current?.label || placeholder}</span>
        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" style={{ marginLeft: 'auto', flexShrink: 0, color: 'var(--text-muted)' }}>
          <path stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, width: '100%', zIndex: 260,
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10,
          boxShadow: 'var(--shadow-lg)', padding: 4, maxHeight: 240, overflowY: 'auto',
        }}>
          {options.map(o => {
            const sel = o.value === value;
            return (
              <button key={o.value} type="button" onClick={() => { onChange(o.value); setOpen(false); }} style={{
                display: 'flex', alignItems: 'center', gap: 9, width: '100%', textAlign: 'left',
                background: sel ? 'var(--surface-2)' : 'none', border: 'none', borderRadius: 7,
                padding: '8px 10px', fontSize: 13.5, fontWeight: 500, color: 'var(--text)', cursor: 'pointer',
              }}
                onMouseEnter={e => { if (!sel) e.currentTarget.style.background = 'var(--surface-hover)'; }}
                onMouseLeave={e => { if (!sel) e.currentTarget.style.background = 'none'; }}>
                {o.color && <span style={{ width: 8, height: 8, borderRadius: '50%', background: o.color, flexShrink: 0 }} />}
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.label}</span>
                {sel && <svg width="13" height="13" fill="none" viewBox="0 0 24 24" style={{ marginLeft: 'auto', flexShrink: 0, color: 'var(--primary)' }}><polyline stroke="currentColor" strokeWidth="2.5" points="20 6 9 17 4 12" /></svg>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ===== Быстрый выбор даты: Сегодня · Завтра · Выбрать дату · Без даты =====
export function DateQuickPick({ value, onChange }) {
  const t = today();
  const tomorrow = localDateFromOffset(1);
  const isCustom = value && value !== t && value !== tomorrow;

  const chip = (activeState) => ({
    padding: '7px 12px', borderRadius: 8, fontSize: 12.5, fontWeight: 600,
    border: `1px solid ${activeState ? 'var(--primary)' : 'var(--border)'}`,
    background: activeState ? 'var(--primary-soft)' : 'var(--surface)',
    color: activeState ? 'var(--primary)' : 'var(--text-secondary)',
    cursor: 'pointer', transition: 'all .15s', whiteSpace: 'nowrap',
  });

  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
      <button type="button" style={chip(value === t)} onClick={() => onChange(t)}>Сегодня</button>
      <button type="button" style={chip(value === tomorrow)} onClick={() => onChange(tomorrow)}>Завтра</button>
      <DatePicker value={isCustom ? value : null} active={isCustom} onChange={(v) => onChange(v)} />
      <button type="button" style={chip(!value)} onClick={() => onChange(null)}>Без даты</button>
    </div>
  );
}

// ===== Иконка календаря (маленькая) =====
export function CalIcon({ size = 12, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth="2" />
      <path stroke={color} strokeWidth="2" d="M3 10h18M8 2v4M16 2v4" />
    </svg>
  );
}
