/**
 * CMS Layout — shared layout shell for all protected CMS pages.
 *
 * Wraps sidebar + header + main content area.
 * Handles responsive sidebar toggle, RTL, and unsaved changes guard.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CMSSidebar from './CMSSidebar';
import CMSHeader from './CMSHeader';
import { useCMSLang } from '../../../contexts/CMSLanguageContext';

export default function CMSLayout({ children, unsavedChanges = false }) {
  const { dir } = useCMSLang();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const unsavedRef = useRef(unsavedChanges);
  unsavedRef.current = unsavedChanges;

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Warn before unload if unsaved changes
  useEffect(() => {
    const handler = (e) => {
      if (unsavedRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  // Warn before route change if unsaved changes
  useEffect(() => {
    const handler = (e) => {
      if (unsavedRef.current) {
        const confirm = window.confirm(
          'You have unsaved changes. Are you sure you want to leave?',
        );
        if (!confirm) {
          e.preventDefault();
        }
      }
    };
    // React Router v7 doesn't expose beforeunload on navigate directly,
    // but the beforeunload event above handles page-level navigation.
    // For in-app navigation, individual pages should check unsaved state.
    return () => {};
  }, []);

  const handleMenuToggle = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  return (
    <div className="cms-root" dir={dir}>
      <CMSSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <CMSHeader onMenuToggle={handleMenuToggle} />
      <main className="cms-main" style={styles.main}>
        <div style={styles.content}>{children}</div>
      </main>
    </div>
  );
}

const styles = {
  main: {
    marginLeft: '240px',
    minHeight: '100vh',
    paddingTop: '56px',
  },
  content: {
    padding: '1.5rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
};
