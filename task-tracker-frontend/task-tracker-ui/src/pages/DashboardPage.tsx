import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Task, TaskStatus, User, UserRole } from '../types';
import { tasksApi } from '../api/tasks';
import { usersApi } from '../api/users';
import { TaskList } from '../components/tasks/TaskList';
import { TaskFormModal } from '../components/tasks/TaskFormModal';
import { UsersTable } from '../components/users/UsersTable';
import { ErrorBanner } from '../components/layout/ErrorBanner';
import { GlassCard } from '../components/layout/GlassCard';

export function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState<string | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(isAdmin);
  const [usersError, setUsersError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const loadTasks = useCallback(async () => {
    setTasksLoading(true);
    setTasksError(null);
    try {
      const data = await tasksApi.list();
      setTasks(data);
    } catch (err) {
      setTasksError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setTasksLoading(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    if (!isAdmin) return;
    setUsersLoading(true);
    setUsersError(null);
    try {
      const data = await usersApi.all();
      setUsers(data);
    } catch (err) {
      setUsersError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    loadTasks();
    loadUsers();
  }, [loadTasks, loadUsers]);

  const usersById = useMemo(() => {
    const map: Record<string, string> = {};
    users.forEach((u) => {
      map[u.id] = u.name;
    });
    return map;
  }, [users]);

  function openCreateModal() {
    setEditingTask(null);
    setModalOpen(true);
  }

  function openEditModal(task: Task) {
    setEditingTask(task);
    setModalOpen(true);
  }

  async function handleSubmitTask(values: {
    title: string;
    description?: string;
    status?: TaskStatus;
  }) {
    if (editingTask) {
      const updated = await tasksApi.update(editingTask.id, values);
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } else {
      const created = await tasksApi.create(values);
      setTasks((prev) => [created, ...prev]);
    }
  }

  async function handleDeleteTask(task: Task) {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    try {
      await tasksApi.remove(task.id);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    } catch (err) {
      setTasksError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  }

  async function handleToggleStatus(task: Task) {
    const nextStatus =
      task.status === TaskStatus.COMPLETED ? TaskStatus.PENDING : TaskStatus.COMPLETED;
    try {
      const updated = await tasksApi.update(task.id, { status: nextStatus });
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (err) {
      setTasksError(err instanceof Error ? err.message : 'Failed to update task');
    }
  }

  async function handleDeleteUser(target: User) {
    if (!window.confirm(`Delete user ${target.email}? This cannot be undone.`)) return;
    try {
      await usersApi.remove(target.id);
      setUsers((prev) => prev.filter((u) => u.id !== target.id));
    } catch (err) {
      setUsersError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  }

  if (!user) return null;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 pb-16 pt-6 md:px-8">
      <GlassCard className="rounded-3xl p-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Hi, {user.name.split(' ')[0]} 👋
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          {user.email} · <span className="capitalize">{user.role}</span> account
        </p>
      </GlassCard>

      {isAdmin && (
        <GlassCard className="rounded-3xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">All users</h2>
          </div>
          <ErrorBanner message={usersError} />
          <UsersTable
            users={users}
            isLoading={usersLoading}
            currentUserId={user.id}
            onDelete={handleDeleteUser}
          />
        </GlassCard>
      )}

      <GlassCard className="rounded-3xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{isAdmin ? 'All tasks' : 'Your tasks'}</h2>
          <button
            onClick={openCreateModal}
            className="glass-button px-4 py-2 text-sm font-medium text-[var(--accent)]"
          >
            + New task
          </button>
        </div>
        <ErrorBanner message={tasksError} />
        <TaskList
          tasks={tasks}
          isLoading={tasksLoading}
          currentUserId={user.id}
          isAdmin={isAdmin}
          usersById={usersById}
          onCreate={openCreateModal}
          onEdit={openEditModal}
          onDelete={handleDeleteTask}
          onToggleStatus={handleToggleStatus}
        />
      </GlassCard>

      <TaskFormModal
        open={modalOpen}
        initialTask={editingTask}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitTask}
      />
    </div>
  );
}
