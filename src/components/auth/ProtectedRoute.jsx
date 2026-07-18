/**
 * Route guard for CMS dashboard routes.
 *
 * - Shows loading state while checking auth.
 * - Redirects to /cms/login if not authenticated.
 * - Shows access denied if authenticated but lacks CMS access.
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCMSLang } from '../../contexts/CMSLanguageContext';

export default function ProtectedRoute({
  children,
  redirectTo = '/leads/login',
  requiredModule = null,
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const { t } = useCMSLang();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        color: '#c9a96e',
        fontFamily: 'system-ui, sans-serif',
        background: '#0a0a14',
      }}>
        {t('common.loading')}
      </div>
    );
  }

  if (!isAuthenticated) {
    const next = encodeURIComponent(location.pathname + location.search + location.hash);
    return <Navigate to={`${redirectTo}?next=${next}`} replace />;
  }

  if (user && !user.is_superuser) {
    const modules = user.permitted_modules || [];
    const hasNoAccess = modules.length === 0;
    const lacksRequiredModule = requiredModule && !modules.includes(requiredModule);
    if (hasNoAccess || lacksRequiredModule) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          color: '#e74c3c',
          fontFamily: 'system-ui, sans-serif',
          background: '#0a0a14',
          textAlign: 'center',
          padding: '2rem',
        }}>
          <h1 style={{ color: '#c9a96e', marginBottom: '1rem' }}>{t('common.accessDenied')}</h1>
          <p>{t('common.accessDeniedText')}</p>
          <p style={{ opacity: 0.6, marginTop: '0.5rem' }}>
            {t('common.contactAdmin')}
          </p>
        </div>
      );
    }
  }

  return children;
}
