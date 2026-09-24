import { FormEvent, useEffect, useState } from 'react';
import { Task, TaskStatus } from '../../types';
import { validateTaskForm, FieldErrors } from '../../utils/validation';

interface TaskFormModalProps {
  open: boolean;
  initialTask?: Task | null;
  onClose: () => void;
  onSubmit: (values: { title: string; description?: string; status?: TaskStatus }) => Promise<void>;
}

export function TaskFormModal({ open, initialTask, onClose, onSubmit }: TaskFormModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.PENDING);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle(initialTask?.title ?? '');
      setDescription(initialTask?.description ?? '');
      setStatus(initialTask?.status ?? TaskStatus.PENDING);
      setErrors({});
      setApiError(null);
    }
  }, [open, initialTask]);

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validation = validateTaskForm({ title });
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setSubmitting(true);
    setApiError(null);
    try {
      await onSubmit({ title: title.trim(), description: description.trim() || undefined, status });
      onClose();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-md rounded-3xl p-6">
        <div className="glass-content">
          <h2 className="text-lg font-semibold">{initialTask ? 'Edit task' : 'New task'}</h2>
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4" noValidate>
            <div>
              <label htmlFor="title" className="mb-1 block text-sm font-medium">
                Title
              </label>
              <input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="glass-input w-full px-3 py-2 text-sm"
                placeholder="e.g. Write project proposal"
              />
              {errors.title && <p className="mt-1 text-xs text-[var(--danger)]">{errors.title}</p>}
            </div>
            <div>
              <label htmlFor="description" className="mb-1 block text-sm font-medium">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="glass-input w-full px-3 py-2 text-sm"
                placeholder="Optional details"
              />
            </div>
            <div>
              <label htmlFor="status" className="mb-1 block text-sm font-medium">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="glass-input w-full px-3 py-2 text-sm"
              >
                <option value={TaskStatus.PENDING}>Pending</option>
                <option value={TaskStatus.COMPLETED}>Completed</option>
              </select>
            </div>
            {apiError && <p className="text-sm text-[var(--danger)]">{apiError}</p>}
            <div className="mt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="glass-button px-4 py-2 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="glass-button bg-[var(--accent)]/90 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {submitting ? 'Saving…' : initialTask ? 'Save changes' : 'Create task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
