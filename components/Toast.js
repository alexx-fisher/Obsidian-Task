'use client';
import { useEffect, useRef, useState } from 'react';

export default function Toast({ message, actionLabel, onAction, onDone, duration = 5000 }) {
  const [leaving, setLeaving] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    timer.current = setTimeout(() => setLeaving(true), duration);
    return () => clearTimeout(timer.current);
  }, [duration]);

  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(onDone, 180);
    return () => clearTimeout(t);
  }, [leaving, onDone]);

  return (
    <div style={{
      position: 'fixed', left: '50%', bottom: 28, zIndex: 400,
      transform: 'translateX(-50%)',
      animation: leaving ? 'toastIn .18s ease reverse forwards' : 'toastIn .22s ease',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        background: 'var(--text)', color: '#fff',
        borderRadius: 12, padding: '12px 16px 12px 18px',
        boxShadow: 'var(--shadow-lg)', fontSize: 14, fontWeight: 500,
        maxWidth: 'calc(100vw - 32px)',
      }}>
        <span>{message}</span>
        {actionLabel && (
          <button onClick={() => { clearTimeout(timer.current); onAction?.(); setLeaving(true); }}
            style={{
              background: 'none', border: 'none', color: '#7db1ff', fontWeight: 700,
              fontSize: 14, cursor: 'pointer', padding: '2px 4px', whiteSpace: 'nowrap',
            }}>
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
