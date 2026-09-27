/**
 * CMS Login Page — redesigned premium authentication screen.
 *
 * Layout: centered brand header (logo + name + subtitle) above a wider
 * login card with EN/AR language switcher, larger inputs, password
 * visibility toggle, and full-width CTA.
 *
 * Authentication logic is unchanged — same AuthContext.login() call,
 * same CSRF flow, same session handling.
 */

import { useCallback, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCMSLang } from '../../contexts/CMSLanguageContext';
import CmsIcon from '../../components/cms/ui/CmsIcon';
import brandLogo from '../../assets/logo.png';
import './CMSLoginPage.css';

function getSafeNextPath(search) {
  const params = new URLSearchParams(search);
  const next = params.get('next');
  if (!next) return '/cms';
  if (next.startsWith('/cms/') || next === '/cms') return next;
  return '/cms';
}

export default function CMSLoginPage() {
  const { login, isAuthenticated, isLoading, error } = useAuth();
  const { lang, dir, t, toggleLang } = useCMSLang();
  const location = useLocation();
  const nextPath = getSafeNextPath(location.search);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const isAr = lang === 'ar';

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
      <div className="cms-login-page">
        <div className="cms-login-card">
          <p className="cms-login-loading">
            {isAr ? 'جاري التحميل...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={nextPath} replace />;
  }

  const displayError = localError || error;

  return (
    <div className="cms-login-page" dir={dir}>
      {/* Brand header */}
      <div className="cms-login-brand">
        <img src={brandLogo} alt="Sidrah Soft" className="cms-login-brand-logo" />
        <div className="cms-login-brand-name">Sidrah Soft</div>
        <div className="cms-login-brand-sub">
          {isAr ? 'نظام إدارة المحتوى' : 'CMS Management System'}
        </div>
      </div>

      {/* Login card */}
      <div className="cms-login-card">
        {/* Language switcher */}
        <button
          type="button"
          onClick={toggleLang}
          className="cms-login-lang-btn"
          aria-label={t('a11y.switchLanguage')}
        >
          {lang === 'en' ? 'العربية' : 'English'}
        </button>

        <h1 className="cms-login-title">
          {isAr ? 'تسجيل الدخول' : 'CMS Login'}
        </h1>
        <p className="cms-login-subtitle">
          {isAr ? 'سجّل الدخول إلى حسابك' : 'Sign in to your account'}
        </p>

        <form onSubmit={handleSubmit} className="cms-login-form">
          <div className="cms-login-field">
            <label className="cms-login-label" htmlFor="username">
              {t('form.username')}
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              className="cms-login-input"
              disabled={submitting}
            />
          </div>
          <div className="cms-login-field">
            <label className="cms-login-label" htmlFor="password">
              {t('form.password')}
            </label>
            <div className="cms-login-password-wrap">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="cms-login-input"
                disabled={submitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="cms-login-eye-btn"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
              >
                <CmsIcon name="eye" size={18} />
                {showPassword && <span className="cms-login-eye-slash" />}
              </button>
            </div>
          </div>
          {displayError && (
            <div className="cms-login-error" role="alert">{displayError}</div>
          )}
          <button
            type="submit"
            disabled={submitting || !username || !password}
            className="cms-login-submit"
          >
            {submitting
              ? (isAr ? 'جاري تسجيل الدخول...' : 'Signing in...')
              : (isAr ? 'تسجيل الدخول' : 'Sign In')}
          </button>
        </form>
      </div>
    </div>
  );
}
