'use client';
import { useState, useEffect, useRef } from 'react';

/* Перетаскиваемый список: карточка едет за курсором 1:1, соседи плавно расступаются.
   Во время перетаскивания массив не меняется — двигаются только CSS-трансформы. */
const SHIFT_MS = 180;

export default function SortableList({ items, onReorder, renderRow, gap = 8 }) {
  const [list, setList] = useState(items);
  const [drag, setDrag] = useState(null); // { startIndex, targetIndex, dy }
  const listRef = useRef(list);
  const dragRef = useRef(null);
  const rowRefs = useRef([]);
  const step = useRef(56);
  const suppressClick = useRef(false);
  listRef.current = list;

  useEffect(() => { if (!dragRef.current) setList(items); }, [items]);

  const onMove = (e) => {
    const st = dragRef.current;
    if (!st) return;
    const dy = e.clientY - st.startY;
    const n = listRef.current.length;
    const targetIndex = Math.max(0, Math.min(n - 1, Math.round(st.startIndex + dy / step.current)));
    st.dy = dy;
    st.targetIndex = targetIndex;
    setDrag({ startIndex: st.startIndex, targetIndex, dy });
  };

  const onUp = () => {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
    const st = dragRef.current;
    dragRef.current = null;
    if (st && st.targetIndex !== st.startIndex) {
      const copy = [...listRef.current];
      const [m] = copy.splice(st.startIndex, 1);
      copy.splice(st.targetIndex, 0, m);
      listRef.current = copy;
      setList(copy);
      onReorder(copy);
      suppressClick.current = true;
      setTimeout(() => { suppressClick.current = false; }, 90);
    }
    setDrag(null);
  };

  const startDrag = (e, index) => {
    if (e.button != null && e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    const rows = rowRefs.current.filter(Boolean);
    if (rows[0] && rows[1]) {
      step.current = rows[1].getBoundingClientRect().top - rows[0].getBoundingClientRect().top;
    } else if (rows[0]) {
      step.current = rows[0].getBoundingClientRect().height + gap;
    }
    dragRef.current = { startIndex: index, startY: e.clientY, dy: 0, targetIndex: index };
    setDrag({ startIndex: index, targetIndex: index, dy: 0 });
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'grabbing';
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap }}>
      {list.map((t, i) => {
        let translateY = 0;
        let transition = `transform ${SHIFT_MS}ms cubic-bezier(.2,.7,.2,1)`;
        let z = 1;
        let lifted = false;
        if (drag) {
          const { startIndex, targetIndex, dy } = drag;
          if (i === startIndex) {
            translateY = dy; transition = 'none'; z = 20; lifted = true;
          } else if (targetIndex > startIndex && i > startIndex && i <= targetIndex) {
            translateY = -step.current;
          } else if (targetIndex < startIndex && i >= targetIndex && i < startIndex) {
            translateY = step.current;
          }
        }
        return (
          <div key={t.id}
            ref={(el) => { rowRefs.current[i] = el; }}
            onClickCapture={(e) => { if (suppressClick.current) { e.stopPropagation(); e.preventDefault(); } }}
            style={{ position: 'relative', zIndex: z, transform: `translateY(${translateY}px)`, transition, willChange: drag ? 'transform' : 'auto' }}>
            {renderRow(t, {
              dragging: lifted,
              index: i,
              handleProps: { onPointerDown: (e) => startDrag(e, i) },
            })}
          </div>
        );
      })}
    </div>
  );
}
