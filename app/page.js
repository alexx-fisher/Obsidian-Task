'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  fetchProjects, createProject, updateProject, reorderProjects, deleteProjectForever,
  fetchTasks, createTask, updateTask, deleteTaskForever, reorderTasks,
} from '../lib/store';
import { supabase } from '../lib/supabase';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import Dashboard from '../components/Dashboard';
import ProjectView from '../components/ProjectView';
import TodayView from '../components/TodayView';
import UpcomingView from '../components/UpcomingView';
import TrashView from '../components/TrashView';
import FabModal from '../components/FabModal';
import TaskPanel from '../components/TaskPanel';
import Toast from '../components/Toast';

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [openTaskId, setOpenTaskId] = useState(null);
  const [toast, setToast] = useState(null); // { message, actionLabel, onAction }

  const showToast = useCallback((message, opts = {}) => {
    setToast({ message, ...opts, key: Date.now() });
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [p, t] = await Promise.all([fetchProjects(), fetchTasks()]);
    if (p.length === 0) {
      const defaults = [
        { id: '1', name: 'Маркетинг', color: '#2563eb', description: 'Ребрендинг и продвижение в социальных сетях', order: 0, deleted: false },
        { id: '2', name: 'Глубокая работа', color: '#16a34a', description: 'Сессии без отвлечений для высококачественного результата', order: 1, deleted: false },
        { id: '3', name: 'Дом', color: '#6d5efc', description: 'Планирование ремонта и уход за садом', order: 2, deleted: false },
      ];
      await Promise.all(defaults.map(createProject));
      setProjects(defaults);
    } else {
      setProjects(p);
    }
    setTasks(t);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Realtime — автообновление при изменениях в базе
  useEffect(() => {
    const projectsSub = supabase
      .channel('projects-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        fetchProjects().then(setProjects);
      })
      .subscribe();
    const tasksSub = supabase
      .channel('tasks-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchTasks().then(setTasks);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(projectsSub);
      supabase.removeChannel(tasksSub);
    };
  }, []);

  const openProject = (id) => { setActiveProjectId(id); setActiveScreen('project'); setSidebarOpen(false); };
  const goOverview = () => { setActiveScreen('dashboard'); setSidebarOpen(false); };
  const goToday = () => { setActiveScreen('today'); setSidebarOpen(false); };
  const goUpcoming = () => { setActiveScreen('upcoming'); setSidebarOpen(false); };
  const goTrash = () => { setActiveScreen('trash'); setSidebarOpen(false); };

  const activeProjects = projects.filter(p => !p.deleted);
  const activeProject = projects.find(p => p.id === activeProjectId);
  const projectTasks = tasks.filter(t => t.projectId === activeProjectId && !t.deleted);
  const trashedCount = tasks.filter(t => t.deleted).length + projects.filter(p => p.deleted).length;
  const openTask = tasks.find(t => t.id === openTaskId && !t.deleted) || null;

  // ===== Проекты =====
  const handleAddProject = async (name) => {
    const p = { id: Date.now().toString(), name, color: '#2563eb', description: '', order: activeProjects.length, deleted: false };
    setProjects(prev => [...prev, p]);
    await createProject(p);
  };
  const handleUpdateProject = async (updated) => {
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
    await updateProject(updated);
  };
  const handleReorderProjects = async (reordered) => {
    setProjects(reordered);
    await reorderProjects(reordered);
  };
  const handleDeleteProject = async (id) => {
    const projectTaskIds = tasks.filter(t => t.projectId === id).map(t => t.id);
    setTasks(prev => prev.filter(t => t.projectId !== id));
    await Promise.all(projectTaskIds.map(deleteTaskForever));
    const updated = { ...projects.find(p => p.id === id), deleted: true };
    setProjects(prev => prev.map(p => p.id === id ? updated : p));
    await updateProject(updated);
    goOverview();
  };
  const handleRestoreProject = async (id) => {
    const updated = { ...projects.find(p => p.id === id), deleted: false };
    setProjects(prev => prev.map(p => p.id === id ? updated : p));
    await updateProject(updated);
  };
  const handleDeleteProjectForever = async (id) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    await deleteProjectForever(id);
  };

  // ===== Задачи =====
  const handleAddTask = async (task) => {
    setTasks(prev => [...prev, task]);
    await createTask(task);
  };

  const setTaskCompleted = async (id, completed) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const updated = { ...task, completed };
    setTasks(prev => prev.map(t => t.id === id ? updated : t));
    await updateTask(updated);
  };

  // Отмена случайного выполнения (правка 5)
  const handleToggleTask = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const willComplete = !task.completed;
    await setTaskCompleted(id, willComplete);
    if (willComplete) {
      showToast('Задача выполнена', { actionLabel: 'Отменить', onAction: () => setTaskCompleted(id, false) });
    }
  };

  const handleSoftDelete = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    setTasks(prev => prev.map(t => t.id === id ? { ...t, deleted: true } : t));
    await updateTask({ ...task, deleted: true });
    if (openTaskId === id) setOpenTaskId(null);
    showToast('Задача перемещена в корзину', { actionLabel: 'Отменить', onAction: () => handleRestoreTask(id) });
  };
  const handleRestoreTask = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    setTasks(prev => prev.map(t => t.id === id ? { ...t, deleted: false } : t));
    await updateTask({ ...task, deleted: false });
  };
  const handleDeleteTaskForever = async (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    await deleteTaskForever(id);
  };
  const handleUpdateTask = async (updated) => {
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
    await updateTask(updated);
  };
  const handleReorderTasks = async (reordered) => {
    const otherTasks = tasks.filter(t => t.projectId !== activeProjectId || t.deleted);
    setTasks([...otherTasks, ...reordered]);
    await reorderTasks(reordered);
  };
  const handleFabAddTask = async ({ name, priority, dueDate, projectId }) => {
    const t = { id: Date.now().toString(), projectId, name, priority, dueDate: dueDate || null, note: '', completed: false, deleted: false, createdAt: Date.now(), order: tasks.filter(x => x.projectId === projectId && !x.deleted).length };
    await handleAddTask(t);
    openProject(projectId);
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', flexDirection: 'column', gap: 16 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid var(--border)', borderTop: '3px solid var(--primary)', animation: 'spin .8s linear infinite' }} />
        <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Загрузка…</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)' }}>
      <TopNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div style={{ display: 'flex', flex: 1, paddingTop: 64, height: '100vh' }}>
        <Sidebar
          projects={activeProjects}
          activeProjectId={activeProjectId}
          activeScreen={activeScreen}
          onProjectClick={openProject}
          onOverview={goOverview}
          onToday={goToday}
          onUpcoming={goUpcoming}
          onTrash={goTrash}
          trashedCount={trashedCount}
          onAddProject={handleAddProject}
          onReorderProjects={handleReorderProjects}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main style={{ marginLeft: 256, flex: 1, overflowY: 'auto', padding: '36px 40px 120px' }} className="main-content">
          {activeScreen === 'dashboard' && (
            <Dashboard projects={activeProjects} tasks={tasks.filter(t => !t.deleted)} onProjectClick={openProject} onOpenTask={setOpenTaskId} />
          )}
          {activeScreen === 'today' && (
            <TodayView tasks={tasks.filter(t => !t.deleted)} projects={activeProjects} onToggleTask={handleToggleTask} onOpenTask={setOpenTaskId} />
          )}
          {activeScreen === 'upcoming' && (
            <UpcomingView tasks={tasks.filter(t => !t.deleted)} projects={activeProjects} onToggleTask={handleToggleTask} onOpenTask={setOpenTaskId} />
          )}
          {activeScreen === 'trash' && (
            <TrashView
              tasks={tasks}
              projects={projects.filter(p => p.deleted)}
              allProjects={projects}
              onRestoreTask={handleRestoreTask}
              onDeleteTaskForever={handleDeleteTaskForever}
              onRestoreProject={handleRestoreProject}
              onDeleteProjectForever={handleDeleteProjectForever}
            />
          )}
          {activeScreen === 'project' && (
            <ProjectView
              project={activeProject}
              tasks={projectTasks}
              onBack={goOverview}
              onAddTask={async (name, priority, dueDate) => {
                const t = { id: Date.now().toString(), projectId: activeProjectId, name, priority, dueDate: dueDate || null, note: '', completed: false, deleted: false, createdAt: Date.now(), order: projectTasks.length };
                await handleAddTask(t);
              }}
              onToggleTask={handleToggleTask}
              onOpenTask={setOpenTaskId}
              onUpdateProject={handleUpdateProject}
              onReorderTasks={handleReorderTasks}
              onDeleteProject={handleDeleteProject}
            />
          )}
        </main>
      </div>

      <button onClick={() => setFabOpen(true)} style={{
        position: 'fixed', bottom: 32, right: 32, width: 54, height: 54, borderRadius: '50%',
        background: 'var(--primary)', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 10px 24px rgba(37,99,235,0.4)', transition: 'transform .15s, background .15s', zIndex: 90,
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.06)'; e.currentTarget.style.background = 'var(--primary-dim)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'var(--primary)'; }}>
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="#fff" strokeWidth="2.5" strokeLinecap="round" d="M12 5v14M5 12h14" /></svg>
      </button>

      {fabOpen && (
        <FabModal projects={activeProjects} onClose={() => setFabOpen(false)}
          onAddTask={handleFabAddTask}
          onAddProject={async ({ name }) => { await handleAddProject(name); }} />
      )}

      {openTask && (
        <TaskPanel
          task={openTask}
          projects={activeProjects}
          onClose={() => setOpenTaskId(null)}
          onUpdate={handleUpdateTask}
          onToggle={() => handleToggleTask(openTask.id)}
          onDelete={() => handleSoftDelete(openTask.id)}
          onOpenProject={openProject}
        />
      )}

      {toast && (
        <Toast key={toast.key} message={toast.message} actionLabel={toast.actionLabel}
          onAction={toast.onAction} onDone={() => setToast(null)} />
      )}

      <style jsx global>{`
        @media (max-width: 768px) {
          .main-content { margin-left: 0 !important; padding: 20px 16px 100px !important; }
        }
      `}</style>
    </div>
  );
}
