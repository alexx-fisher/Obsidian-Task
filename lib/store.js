import { supabase } from './supabase';

// Timezone-safe local date
export function today() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function localDateFromOffset(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDate(dateStr) {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

// ===== PROJECTS =====
export async function fetchProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('order', { ascending: true });
  if (error) { console.error(error); return []; }
  return data.map(p => ({ ...p, id: p.id, order: p.order || 0, deleted: p.deleted || false }));
}

export async function createProject(project) {
  const { error } = await supabase.from('projects').insert([{
    id: project.id,
    name: project.name,
    description: project.description || '',
    color: project.color || '#ba9eff',
    order: project.order || 0,
    deleted: project.deleted || false,
  }]);
  if (error) console.error(error);
}

export async function updateProject(project) {
  const { error } = await supabase.from('projects').update({
    name: project.name,
    description: project.description || '',
    color: project.color || '#ba9eff',
    order: project.order || 0,
    deleted: project.deleted || false,
  }).eq('id', project.id);
  if (error) console.error(error);
}

export async function deleteProjectForever(id) {
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) console.error(error);
}

export async function deleteProject(id) {
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) console.error(error);
}

export async function reorderProjects(projects) {
  const updates = projects.map((p, i) =>
    supabase.from('projects').update({ order: i }).eq('id', p.id)
  );
  await Promise.all(updates);
}

// ===== TASKS =====
export async function fetchTasks() {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('order', { ascending: true });
  if (error) { console.error(error); return []; }
  return data.map(t => ({
    id: t.id,
    projectId: t.project_id,
    name: t.name,
    priority: t.priority || 'medium',
    dueDate: t.due_date || null,
    completed: t.completed || false,
    deleted: t.deleted || false,
    createdAt: t.created_at,
    order: t.order || 0,
  }));
}

export async function createTask(task) {
  const { error } = await supabase.from('tasks').insert([{
    id: task.id,
    project_id: task.projectId,
    name: task.name,
    priority: task.priority || 'medium',
    due_date: task.dueDate || null,
    completed: task.completed || false,
    deleted: task.deleted || false,
    order: task.order || 0,
    created_at: task.createdAt || Date.now(),
  }]);
  if (error) console.error(error);
}

export async function updateTask(task) {
  const { error } = await supabase.from('tasks').update({
    name: task.name,
    priority: task.priority,
    due_date: task.dueDate || null,
    completed: task.completed,
    deleted: task.deleted,
    order: task.order || 0,
  }).eq('id', task.id);
  if (error) console.error(error);
}

export async function deleteTaskForever(id) {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) console.error(error);
}

export async function reorderTasks(tasks) {
  const updates = tasks.map((t, i) =>
    supabase.from('tasks').update({ order: i }).eq('id', t.id)
  );
  await Promise.all(updates);
}
