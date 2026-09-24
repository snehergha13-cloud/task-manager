export function Spinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-sm text-[var(--text-secondary)]">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent"
        role="status"
        aria-label={label}
      />
      <span>{label}</span>
    </div>
  );
}
