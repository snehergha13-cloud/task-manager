import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { LoginPage } from '../../pages/LoginPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { ProtectedRoute } from '../../components/layout/ProtectedRoute';

function renderApp() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('Login -> Dashboard flow (integration, mocked API)', () => {
  it('logs in against the API, stores the JWT, and renders the dashboard', async () => {
    renderApp();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), 'alice@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    expect(await screen.findByText(/hi, alice/i)).toBeInTheDocument();
    expect(localStorage.getItem('auth_token')).toBe('fake-jwt-token');
  });

  it('shows the API error message for invalid credentials and does not store a token', async () => {
    renderApp();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), 'alice@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrong-password');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument();
    expect(localStorage.getItem('auth_token')).toBeNull();
  });
});
