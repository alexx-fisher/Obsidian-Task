'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  fetchProjects, createProject, updateProject, reorderProjects, deleteProjectForever,
  fetchTasks, createTask, updateTask, deleteTaskForever, reorderTasks,
  today
} from '../lib/store';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import Dashboard from '../components/Dashboard';
import ProjectView from '../components/ProjectView';
import TodayView from '../components/TodayView';
import UpcomingView from '../components/UpcomingView';
import TrashView from '../components/TrashView';
import FabModal from '../components/FabModal';

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [p, t] = await Promise.all([fetchProjects(), fetchTasks()]);
    if (p.length === 0) {
      const defaults = [
        { id: '1', name: 'Маркетинг', color: '#ba9eff', description: 'Ребрендинг и продвижение в социальных сетях', order: 0, deleted: false },
        { id: '2', name: 'Глубокая работа', color: '#68fcbf', description: 'Сессии без отвлечений для высококачественного результата', order: 1, deleted: false },
        { id: '3', name: 'Дом', color: '#699cff', description: 'Планирование ремонта и уход за садом', order: 2, deleted: false },
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

  const openProject = (id) => { setActiveProjectId(id); setActiveScreen('project'); setSidebarOpen(false); };
  const goOverview = () => { setActiveScreen('dashboard'); setSidebarOpen(false); };
  const goToday = () => { setActiveScreen('today'); setSidebarOpen(false); };
  const goUpcoming = () => { setActiveScreen('upcoming'); setSidebarOpen(false); };
  const goTrash = () => { setActiveScreen('trash'); setSidebarOpen(false); };

  // Только неудалённые проекты для навигации
  const activeProjects = projects.filter(p => !p.deleted);
  const activeProject = projects.find(p => p.id === activeProjectId);
  const projectTasks = tasks.filter(t => t.projectId === activeProjectId && !t.deleted);
  const trashedCount = tasks.filter(t => t.deleted).length + projects.filter(p => p.deleted).length;

  // Проекты
  const handleAddProject = async (name) => {
    const p = { id: Date.now().toString(), name, color: '#ba9eff', description: '', order: activeProjects.length, deleted: false };
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

  // Удалить проект — в корзину, задачи удаляются навсегда
  const handleDeleteProject = async (id) => {
    // Удаляем все задачи проекта навсегда
    const projectTaskIds = tasks.filter(t => t.projectId === id).map(t => t.id);
    setTasks(prev => prev.filter(t => t.projectId !== id));
    await Promise.all(projectTaskIds.map(tid => deleteTaskForever(tid)));

    // Проект уходит в корзину
    const updated = { ...projects.find(p => p.id === id), deleted: true };
    setProjects(prev => prev.map(p => p.id === id ? updated : p));
    await updateProject(updated);

    // Возвращаемся на дашборд
    goOverview();
  };

  // Восстановить проект из корзины
  const handleRestoreProject = async (id) => {
    const updated = { ...projects.find(p => p.id === id), deleted: false };
    setProjects(prev => prev.map(p => p.id === id ? updated : p));
    await updateProject(updated);
  };

  // Удалить проект навсегда из корзины
  const handleDeleteProjectForever = async (id) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    await deleteProjectForever(id);
  };

  // Задачи
  const handleAddTask = async (task) => {
    setTasks(prev => [...prev, task]);
    await createTask(task);
  };

  const handleToggleTask = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const updated = { ...task, completed: !task.completed };
    setTasks(prev => prev.map(t => t.id === id ? updated : t));
    await updateTask(updated);
  };

  const handleSoftDelete = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const updated = { ...task, deleted: true };
    setTasks(prev => prev.map(t => t.id === id ? updated : t));
    await updateTask(updated);
  };

  const handleRestoreTask = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const updated = { ...task, deleted: false };
    setTasks(prev => prev.map(t => t.id === id ? updated : t));
    await updateTask(updated);
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
    const t = { id: Date.now().toString(), projectId, name, priority, dueDate: dueDate || null, completed: false, deleted: false, createdAt: Date.now(), order: tasks.filter(x => x.projectId === projectId && !x.deleted).length };
    await handleAddTask(t);
    openProject(projectId);
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060e20', flexDirection: 'column', gap: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #141f38', borderTop: '3px solid #ba9eff', animation: 'spin 0.8s linear infinite' }}/>
        <div style={{ fontSize: 14, color: '#a3aac4' }}>Загрузка...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopNav onMenuClick={() => setSidebarOpen(!sidebarOpen)}/>
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

        <main style={{ marginLeft: 256, flex: 1, overflowY: 'auto', padding: '40px 40px 100px' }} className="main-content">
          {activeScreen === 'dashboard' && (
            <Dashboard projects={activeProjects} tasks={tasks.filter(t=>!t.deleted)} onProjectClick={openProject}/>
          )}
          {activeScreen === 'today' && (
            <TodayView tasks={tasks.filter(t=>!t.deleted)} projects={activeProjects} onToggleTask={handleToggleTask}/>
          )}
          {activeScreen === 'upcoming' && (
            <UpcomingView tasks={tasks.filter(t=>!t.deleted)} projects={activeProjects} onToggleTask={handleToggleTask}/>
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
                const t = { id: Date.now().toString(), projectId: activeProjectId, name, priority, dueDate: dueDate || null, completed: false, deleted: false, createdAt: Date.now(), order: projectTasks.length };
                await handleAddTask(t);
              }}
              onToggleTask={handleToggleTask}
              onSoftDeleteTask={handleSoftDelete}
              onUpdateTask={handleUpdateTask}
              onUpdateProject={handleUpdateProject}
              onReorderTasks={handleReorderTasks}
              onDeleteProject={handleDeleteProject}
            />
          )}
        </main>
      </div>

      <button onClick={() => setFabOpen(true)} style={{
        position: 'fixed', bottom: 32, right: 32, width: 56, height: 56, borderRadius: '50%',
        background: 'linear-gradient(135deg, #ba9eff 0%, #8455ef 100%)',
        border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 8px 32px rgba(186,158,255,0.4)', transition: 'transform .2s', zIndex: 90,
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="#000" strokeWidth="2.5" strokeLinecap="round" d="M12 5v14M5 12h14"/></svg>
      </button>

      {fabOpen && (
        <FabModal projects={activeProjects} onClose={() => setFabOpen(false)}
          onAddTask={handleFabAddTask}
          onAddProject={async ({ name }) => { await handleAddProject(name); }}/>
      )}

      <style jsx global>{`
        @media (max-width: 768px) {
          .main-content { margin-left: 0 !important; padding: 20px 16px 80px !important; }
        }
      `}</style>
    </div>
  );
}
