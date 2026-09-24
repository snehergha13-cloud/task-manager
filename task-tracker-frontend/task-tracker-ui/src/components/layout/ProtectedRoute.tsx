import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Spinner } from './Spinner';

export function ProtectedRoute() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return <Spinner label="Checking your session…" />;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
