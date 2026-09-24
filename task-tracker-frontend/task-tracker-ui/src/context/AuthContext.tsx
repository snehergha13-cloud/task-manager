import { createContext, useCallback, useEffect, useMemo, useState, ReactNode } from 'react';
import { User } from '../types';
import { loginUser, registerUser } from '../api/auth';
import { usersApi } from '../api/users';
import { TOKEN_KEY } from '../api/client';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // On mount (and whenever the token changes), resolve who the token
  // belongs to. If the token is missing/expired/invalid, we clear it and
  // fall back to the logged-out state instead of trusting stale data.
  useEffect(() => {
    let cancelled = false;

    async function loadCurrentUser() {
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      try {
        const me = await usersApi.me();
        if (!cancelled) setUser(me);
      } catch {
        if (!cancelled) {
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadCurrentUser();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await loginUser({ email, password });
    // The JWT is kept in localStorage so the session survives a refresh.
    // This is a client-only app with no server-side session, so this is
    // the pragmatic choice here; a production deployment fronted by a
    // same-site backend could instead use an httpOnly cookie to remove
    // JS access to the token entirely.
    localStorage.setItem(TOKEN_KEY, res.access_token);
    setToken(res.access_token);
    setUser(res.user);
  }, []);

  const register = useCallback(
    async (email: string, name: string, password: string) => {
      await registerUser({ email, name, password });
      await login(email, password);
    },
    [login],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, isLoading, login, register, logout }),
    [user, token, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
