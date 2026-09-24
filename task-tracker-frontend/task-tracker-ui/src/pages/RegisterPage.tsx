import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { validateRegisterForm, FieldErrors } from '../utils/validation';
import { ErrorBanner } from '../components/layout/ErrorBanner';

export function RegisterPage() {
  const { register, token } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (token) navigate('/dashboard', { replace: true });
  }, [token, navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validation = validateRegisterForm({ email, name, password });
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setSubmitting(true);
    setApiError(null);
    try {
      await register(email, name, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Unable to create your account');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-panel w-full max-w-sm rounded-3xl p-8">
        <div className="glass-content">
          <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Start tracking your tasks in seconds.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium">
                Name
              </label>
              <input
                id="name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="glass-input w-full px-3 py-2 text-sm"
              />
              {errors.name && <p className="mt-1 text-xs text-[var(--danger)]">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input w-full px-3 py-2 text-sm"
              />
              {errors.email && <p className="mt-1 text-xs text-[var(--danger)]">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input w-full px-3 py-2 text-sm"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-[var(--danger)]">{errors.password}</p>
              )}
            </div>

            <ErrorBanner message={apiError} />

            <button
              type="submit"
              disabled={submitting}
              className="glass-button mt-2 w-full bg-[var(--accent)]/90 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {submitting ? 'Creating account…' : 'Sign up'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-[var(--accent)]">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
