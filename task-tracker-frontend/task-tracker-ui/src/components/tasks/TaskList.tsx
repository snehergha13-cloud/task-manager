import { Task } from '../../types';
import { TaskItem } from './TaskItem';
import { Spinner } from '../layout/Spinner';
import { EmptyState } from '../layout/EmptyState';

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  currentUserId: string;
  isAdmin: boolean;
  usersById?: Record<string, string>;
  onCreate: () => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onToggleStatus: (task: Task) => void;
}

export function TaskList({
  tasks,
  isLoading,
  currentUserId,
  isAdmin,
  usersById,
  onCreate,
  onEdit,
  onDelete,
  onToggleStatus,
}: TaskListProps) {
  if (isLoading) return <Spinner label="Loading tasks…" />;

  if (tasks.length === 0) {
    return (
      <EmptyState
        title="No tasks yet"
        description="Create your first task to get started."
        action={
          <button
            onClick={onCreate}
            className="glass-button mt-2 px-4 py-2 text-sm font-medium text-[var(--accent)]"
          >
            + New task
          </button>
        }
      />
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          canEdit={isAdmin || task.userId === currentUserId}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
          ownerLabel={isAdmin && usersById ? usersById[task.userId] : undefined}
        />
      ))}
    </ul>
  );
}
