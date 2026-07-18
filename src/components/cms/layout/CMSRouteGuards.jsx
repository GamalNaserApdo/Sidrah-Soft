/**
 * CMS Route Guards
 *
 * CMSProtectedRoute — waits for auth init, redirects to login if unauthenticated.
 * CMSCapabilityRoute — additionally checks module access and optional capability.
 *
 * The backend remains the final security boundary.
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCMSLang } from '../../contexts/CMSLanguageContext';

function LoadingScreen() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#0a0a14',
      color: '#c9a96e',
      fontFamily: 'system-ui, sans-serif',
      fontSize: '0.875rem',
    }}>
      Loading…
    </div>
  );
}

function ForbiddenState({ message }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#0a0a14',
      color: '#e0e0e0',
      fontFamily: 'system-ui, sans-serif',
      textAlign: 'center',
      padding: '2rem',
    }}>
      <h1 style={{ color: '#c9a96e', fontSize: '1.5rem', marginBottom: '0.75rem' }}>
        Access Denied
      </h1>
      <p style={{ color: '#aaa', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
        {message || 'You do not have permission to access this page.'}
      </p>
      <p style={{ color: '#555', fontSize: '0.75rem' }}>
        Contact a system administrator if you believe this is an error.
      </p>
    </div>
  );
}

export function CMSProtectedRoute({ children }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingScreen />;

  if (!isAuthenticated) {
    return <Navigate to="/cms/login" replace state={{ from: location }} />;
  }

  if (user && !user.is_superuser && (!user.permitted_modules || user.permitted_modules.length === 0)) {
    return <ForbiddenState message="Your account does not have CMS access." />;
  }

  return children;
}

export function CMSCapabilityRoute({ children, module, action = 'view' }) {
  const { user, hasCapability, hasModuleAccess, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingScreen />;

  if (!user || !user.is_active) {
    return <Navigate to="/cms/login" replace state={{ from: location }} />;
  }

  if (!hasModuleAccess(module)) {
    return <ForbiddenState message={`You do not have access to the ${module} module.`} />;
  }

  if (action && !hasCapability(`${module}.${action}`)) {
    return <ForbiddenState message={`You do not have ${action} permission for ${module}.`} />;
  }

  return children;
}
