import { User } from '../../types';
import { EmptyState } from '../layout/EmptyState';
import { Spinner } from '../layout/Spinner';

interface UsersTableProps {
  users: User[];
  isLoading: boolean;
  currentUserId: string;
  onDelete: (user: User) => void;
}

export function UsersTable({ users, isLoading, currentUserId, onDelete }: UsersTableProps) {
  if (isLoading) return <Spinner label="Loading users…" />;
  if (users.length === 0) {
    return <EmptyState title="No users found" />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] border-collapse text-sm">
        <thead>
          <tr className="text-left text-[var(--text-secondary)]">
            <th className="pb-2 pr-4 font-medium">Name</th>
            <th className="pb-2 pr-4 font-medium">Email</th>
            <th className="pb-2 pr-4 font-medium">Role</th>
            <th className="pb-2 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t border-black/5 dark:border-white/10">
              <td className="py-2 pr-4">{u.name}</td>
              <td className="py-2 pr-4">{u.email}</td>
              <td className="py-2 pr-4 capitalize">{u.role}</td>
              <td className="py-2">
                <button
                  onClick={() => onDelete(u)}
                  disabled={u.id === currentUserId}
                  className="glass-button px-3 py-1 text-xs font-medium text-[var(--danger)] disabled:opacity-40"
                  title={u.id === currentUserId ? "You can't delete your own account" : undefined}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
