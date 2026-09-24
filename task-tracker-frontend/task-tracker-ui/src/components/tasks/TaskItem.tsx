import { Task, TaskStatus } from '../../types';

interface TaskItemProps {
  task: Task;
  canEdit: boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onToggleStatus: (task: Task) => void;
  ownerLabel?: string;
}

export function TaskItem({
  task,
  canEdit,
  onEdit,
  onDelete,
  onToggleStatus,
  ownerLabel,
}: TaskItemProps) {
  const isCompleted = task.status === TaskStatus.COMPLETED;

  return (
    <li className="glass-panel rounded-2xl p-4" data-testid="task-item">
      <div className="glass-content flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <button
            type="button"
            aria-label={isCompleted ? 'Mark as pending' : 'Mark as completed'}
            onClick={() => onToggleStatus(task)}
            disabled={!canEdit}
            className={`mt-1 h-5 w-5 flex-shrink-0 rounded-full border-2 transition ${
              isCompleted
                ? 'border-[var(--success)] bg-[var(--success)]'
                : 'border-[var(--text-secondary)]'
            } ${canEdit ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
          />
          <div>
            <p
              className={`font-medium ${
                isCompleted ? 'text-[var(--text-secondary)] line-through' : ''
              }`}
            >
              {task.title}
            </p>
            {task.description && (
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{task.description}</p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
              <span
                className={`rounded-full px-2 py-0.5 font-medium ${
                  isCompleted
                    ? 'bg-[var(--success)]/15 text-[var(--success)]'
                    : 'bg-[var(--accent)]/15 text-[var(--accent)]'
                }`}
              >
                {isCompleted ? 'Completed' : 'Pending'}
              </span>
              <span>{new Date(task.createdAt).toLocaleDateString()}</span>
              {ownerLabel && <span>· {ownerLabel}</span>}
            </div>
          </div>
        </div>
        {canEdit && (
          <div className="flex flex-shrink-0 gap-2">
            <button onClick={() => onEdit(task)} className="glass-button px-3 py-1.5 text-xs font-medium">
              Edit
            </button>
            <button
              onClick={() => onDelete(task)}
              className="glass-button px-3 py-1.5 text-xs font-medium text-[var(--danger)]"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </li>
  );
}
