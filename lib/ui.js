import { today, localDateFromOffset } from './store';

// ===== Priority config =====
export const PRIO = {
  high:   { label: 'Высокий', color: 'var(--prio-high)',   bg: 'var(--prio-high-soft)',   rank: 0 },
  medium: { label: 'Средний', color: 'var(--prio-medium)', bg: 'var(--prio-medium-soft)', rank: 1 },
  low:    { label: 'Низкий',  color: 'var(--prio-low)',    bg: 'var(--prio-low-soft)',    rank: 2 },
};
export const prio = (p) => PRIO[p] || PRIO.low;

// ===== Project palette =====
export const PROJECT_COLORS = ['#2563eb', '#16a34a', '#6d5efc', '#e11d48', '#d97706', '#0891b2'];
export const projectColor = (i) => PROJECT_COLORS[i % PROJECT_COLORS.length];

// ===== Date helpers =====
export function humanDate(dateStr) {
  if (!dateStr) return 'Без даты';
  const t = today();
  const tomorrow = localDateFromOffset(1);
  if (dateStr === t) return 'Сегодня';
  if (dateStr === tomorrow) return 'Завтра';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const opts = date.getFullYear() === new Date().getFullYear()
    ? { day: 'numeric', month: 'short' }
    : { day: 'numeric', month: 'short', year: 'numeric' };
  return date.toLocaleDateString('ru-RU', opts);
}

export function dueTone(dateStr, completed) {
  if (completed || !dateStr) return 'var(--text-muted)';
  const t = today();
  if (dateStr < t) return 'var(--danger)';
  if (dateStr === t) return 'var(--warning)';
  return 'var(--text-secondary)';
}

// ===== Grouping =====
// Разбивает задачи на: overdue / today / upcoming / nodate / done
export function groupTasks(tasks) {
  const t = today();
  const groups = { overdue: [], today: [], upcoming: [], nodate: [], done: [] };
  for (const task of tasks) {
    if (task.completed) { groups.done.push(task); continue; }
    if (!task.dueDate) { groups.nodate.push(task); continue; }
    if (task.dueDate < t) { groups.overdue.push(task); continue; }
    if (task.dueDate === t) { groups.today.push(task); continue; }
    groups.upcoming.push(task);
  }
  const byDate = (a, b) => (a.dueDate || '') < (b.dueDate || '') ? -1 : 1;
  groups.overdue.sort(byDate);
  groups.upcoming.sort(byDate);
  return groups;
}

export const GROUP_META = {
  overdue:  { label: 'Просрочено',   color: 'var(--danger)' },
  today:    { label: 'Сегодня',      color: 'var(--warning)' },
  upcoming: { label: 'Предстоящие',  color: 'var(--text-secondary)' },
  nodate:   { label: 'Без даты',     color: 'var(--text-muted)' },
  done:     { label: 'Выполненные',  color: 'var(--success)' },
};

// ===== Sorting =====
export function sortTasks(tasks, mode) {
  const copy = [...tasks];
  if (mode === 'date') {
    return copy.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return (a.order || 0) - (b.order || 0);
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0;
    });
  }
  if (mode === 'priority') {
    return copy.sort((a, b) => prio(a.priority).rank - prio(b.priority).rank || (a.order || 0) - (b.order || 0));
  }
  return copy.sort((a, b) => (a.order || 0) - (b.order || 0)); // manual
}
