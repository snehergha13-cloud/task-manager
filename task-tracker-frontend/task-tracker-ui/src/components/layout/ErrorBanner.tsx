export function ErrorBanner({ message }: { message: string | null | undefined }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="mb-4 rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300"
    >
      {message}
    </div>
  );
}
