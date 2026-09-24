import { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-black/10 py-12 text-center dark:border-white/15">
      <p className="text-base font-medium text-[var(--text-primary)]">{title}</p>
      {description && (
        <p className="max-w-sm text-sm text-[var(--text-secondary)]">{description}</p>
      )}
      {action}
    </div>
  );
}
