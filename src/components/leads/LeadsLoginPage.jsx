/**
 * Leads Login Page.
 *
 * Reuses session authentication. Redirects authenticated users to /leads.
 */

import { useCallback, useState, useId } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCMSLang } from '../../contexts/CMSLanguageContext';
import { Input } from '../ui/Input.jsx';
import { ErrorState } from '../ui/StateViews.jsx';
import Button from '../ui/Button.jsx';

function getSafeNextPath(search) {
  const params = new URLSearchParams(search);
  const next = params.get('next');
  if (!next) return '/leads';
  if (next.startsWith('/leads/') || next === '/leads') return next;
  return '/leads';
}

export default function LeadsLoginPage() {
  const { login, isAuthenticated, isLoading, error } = useAuth();
  const location = useLocation();
  const { t } = useCMSLang();
  const nextPath = getSafeNextPath(location.search);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  const formId = useId();
  const errorId = `${formId}-error`;

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLocalError('');
    setSubmitting(true);
    try {
      await login(username, password);
    } catch (err) {
      const isNetworkError = !err.status || err.status === 0;
      setLocalError(
        isNetworkError
          ? t('leads.networkError')
          : err.data?.detail || err.message || t('leads.loginFailed')
      );
    } finally {
      setSubmitting(false);
    }
  }, [login, username, password, t]);

  if (isLoading) {
    return (
      <div className="leads-layout leads-page--center">
        <div className="leads-card leads-page--narrow leads-login__loading">
          <div className="ui-loading__spinner" aria-hidden="true" />
          <p className="leads-login__loading-text">{t('leads.loading')}</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={nextPath} replace />;
  }

  const displayError = localError || error;

  return (
    <div className="leads-layout leads-page--center">
      <div className="leads-card leads-page--narrow leads-login">
        <div className="leads-login__brand">
          <span className="leads-login__brand-name">SidrahSoft</span>
          <span className="leads-login__brand-subtitle">{t('leads.title')}</span>
        </div>
        <h1 className="leads-login__title">{t('leads.signIn')}</h1>
        <p className="leads-login__subtitle">{t('leads.loginSubtitle')}</p>
        <form onSubmit={handleSubmit} className="leads-login__form" aria-describedby={displayError ? errorId : undefined}>
          <Input
            label={t('form.username')}
            id="leads-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
            disabled={submitting}
          />
          <Input
            label={t('form.password')}
            id="leads-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            disabled={submitting}
          />
          {displayError && (
            <div id={errorId} className="leads-login__error">
              <ErrorState message={displayError} />
            </div>
          )}
          <Button
            type="submit"
            variant="primary"
            block
            loading={submitting}
            disabled={submitting || !username || !password}
            className="leads-login__submit"
          >
            {submitting ? t('leads.signingIn') : t('leads.signIn')}
          </Button>
        </form>
      </div>
    </div>
  );
}
