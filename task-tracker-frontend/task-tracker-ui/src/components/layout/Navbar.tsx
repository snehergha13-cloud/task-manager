import { useAuth } from '../../hooks/useAuth';

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-4 z-20 mx-4 md:mx-8">
      <div className="glass-panel flex items-center justify-between rounded-full px-5 py-3">
        <div className="glass-content flex items-center gap-2">
          <span className="text-lg font-semibold tracking-tight">Task Tracker</span>
        </div>
        {user && (
          <div className="glass-content flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium leading-tight">{user.name}</p>
              <p className="text-xs capitalize leading-tight text-[var(--text-secondary)]">
                {user.role}
              </p>
            </div>
            <button
              onClick={logout}
              className="glass-button px-4 py-1.5 text-sm font-medium"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
