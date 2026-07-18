/**
 * CMS Authentication Context.
 *
 * Provides auth state, login/logout, and capability checks.
 * Does not interfere with public website — only used in /cms routes.
 */

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getCurrentUser, login as apiLogin, logout as apiLogout } from '../services/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAuthenticated = !!user;

  const refreshUser = useCallback(async () => {
    try {
      const data = await getCurrentUser();
      setUser(data);
      setError(null);
    } catch (err) {
      setUser(null);
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    getCurrentUser()
      .then((data) => {
        if (!cancelled) {
          setUser(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setUser(null);
          if (err.status !== 401 && err.status !== 403 && err.status !== 0) {
            setError(err.message);
          }
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (username, password) => {
    setError(null);
    try {
      const data = await apiLogin(username, password);
      setUser(data);
      return data;
    } catch (err) {
      setUser(null);
      setError(err.data?.detail || err.message);
      throw err;
    }
  }, []);

  const logoutFn = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // Logout endpoint may fail if session already expired.
    }
    setUser(null);
    setError(null);
  }, []);

  const hasCapability = useCallback((capability) => {
    if (!user) return false;
    if (user.is_superuser) return true;
    return user.capabilities?.includes(capability) ?? false;
  }, [user]);

  const hasModuleAccess = useCallback((module) => {
    if (!user) return false;
    if (user.is_superuser) return true;
    return user.permitted_modules?.includes(module) ?? false;
  }, [user]);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout: logoutFn,
    refreshUser,
    hasCapability,
    hasModuleAccess,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
