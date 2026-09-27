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

const SIDEBAR_EXPANDED_KEY = 'cms_sidebar_expanded';

function readSidebarExpanded() {
  try {
    const stored = localStorage.getItem(SIDEBAR_EXPANDED_KEY);
    return stored === null ? true : JSON.parse(stored);
  } catch {
    return true;
  }
}

export default function CMSLayout({ children, unsavedChanges = false }) {
  const { dir } = useCMSLang();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(readSidebarExpanded);
  const location = useLocation();
  const navigate = useNavigate();
  const unsavedRef = useRef(unsavedChanges);
  unsavedRef.current = unsavedChanges;

  // Persist sidebar collapse preference
  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_EXPANDED_KEY, JSON.stringify(sidebarExpanded));
    } catch {
      // ignore storage errors
    }
  }, [sidebarExpanded]);

  // Close mobile sidebar drawer on route change
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

  const sidebarWidth = sidebarExpanded ? '248px' : '72px';

  return (
    <div
      className={`cms-root ${sidebarExpanded ? '' : 'cms-root--sidebar-collapsed'}`}
      dir={dir}
      style={{ '--cms-sidebar-width': sidebarWidth }}
    >
      <CMSSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        expanded={sidebarExpanded}
        onExpandedChange={setSidebarExpanded}
      />
      <CMSHeader onMenuToggle={handleMenuToggle} />
      <main className="cms-main" style={styles.main}>
        <div style={styles.content}>{children}</div>
      </main>
    </div>
  );
}

const styles = {
  main: {
    minHeight: '100vh',
    paddingTop: '60px',
  },
  content: {
    padding: 'var(--space-6)',
    maxWidth: '1400px',
    margin: '0 auto',
  },
};
