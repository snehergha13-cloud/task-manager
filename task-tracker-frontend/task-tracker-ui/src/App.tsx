import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Navbar } from './components/layout/Navbar';
import { useAuth } from './hooks/useAuth';

function LiquidBackdrop() {
  return (
    <div className="liquid-backdrop" aria-hidden="true">
      <div className="liquid-blob b1" />
      <div className="liquid-blob b2" />
      <div className="liquid-blob b3" />
    </div>
  );
}

export default function App() {
  const { token } = useAuth();

  return (
    <>
      <LiquidBackdrop />
      {token && <Navbar />}
      <main className="pb-10">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </>
  );
}
