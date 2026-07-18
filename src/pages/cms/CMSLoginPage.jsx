/**
 * CMS Login Page.
 *
 * Clean, functional login form aligned with Sidrah brand identity.
 * Redirects to /cms if already authenticated.
 */

import { useCallback, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function getSafeNextPath(search) {
  const params = new URLSearchParams(search);
  const next = params.get('next');
  if (!next) return '/cms';
  // Only accept relative CMS paths to avoid open redirects.
  if (next.startsWith('/cms/') || next === '/cms') return next;
  return '/cms';
}

export default function CMSLoginPage() {
  const { login, isAuthenticated, isLoading, error } = useAuth();
  const location = useLocation();
  const nextPath = getSafeNextPath(location.search);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLocalError('');
    setSubmitting(true);
    try {
      await login(username, password);
    } catch (err) {
      setLocalError(err.data?.detail || err.message || 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  }, [login, username, password]);

  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={nextPath} replace />;
  }

  const displayError = localError || error;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <span style={styles.logoText}>Sidrah</span>
          <span style={styles.logoCms}>CMS</span>
        </div>
        <h1 style={styles.title}>Sign In</h1>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label} htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              style={styles.input}
              disabled={submitting}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label} htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              style={styles.input}
              disabled={submitting}
            />
          </div>
          {displayError && (
            <div style={styles.error}>{displayError}</div>
          )}
          <button
            type="submit"
            disabled={submitting || !username || !password}
            style={{
              ...styles.button,
              opacity: (submitting || !username || !password) ? 0.6 : 1,
            }}
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#0a0a14',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    padding: '1rem',
  },
  card: {
    background: '#12121e',
    border: '1px solid #1e1e2e',
    borderRadius: '12px',
    padding: '2.5rem 2rem',
    width: '100%',
    maxWidth: '380px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
  },
  logo: {
    textAlign: 'center',
    marginBottom: '1.5rem',
  },
  logoText: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#c9a96e',
    letterSpacing: '0.02em',
  },
  logoCms: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#888',
    marginLeft: '0.5rem',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  title: {
    textAlign: 'center',
    fontSize: '1.125rem',
    fontWeight: '500',
    color: '#e0e0e0',
    marginBottom: '1.5rem',
    margin: '0 0 1.5rem 0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  },
  label: {
    fontSize: '0.8125rem',
    color: '#999',
    fontWeight: '500',
  },
  input: {
    padding: '0.625rem 0.75rem',
    borderRadius: '6px',
    border: '1px solid #2a2a3e',
    background: '#0a0a14',
    color: '#e0e0e0',
    fontSize: '0.9375rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  error: {
    color: '#e74c3c',
    fontSize: '0.8125rem',
    textAlign: 'center',
    padding: '0.5rem',
    background: 'rgba(231, 76, 60, 0.1)',
    borderRadius: '4px',
  },
  button: {
    marginTop: '0.5rem',
    padding: '0.75rem',
    borderRadius: '6px',
    border: 'none',
    background: '#c9a96e',
    color: '#0a0a14',
    fontSize: '0.9375rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
};
