/**
 * CMS Sidebar — capability-aware navigation.
 *
 * Shows only modules the user has access to.
 * Collapsible on mobile with overlay.
 */

import { NavLink } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useCMSLang } from '../../../contexts/CMSLanguageContext';

const MODULE_ICONS = {
  dashboard: '◆',
  site_settings: '⚙',
  homepage: '🏠',
  navigation: '☰',
  partners: '🤝',
  services: '✦',
  case_studies: '📋',
  insights: '💡',
  careers: '💼',
  contact: '✉',
  media: '🖼',
  users: '👤',
  activity_logs: '📜',
};

export default function CMSSidebar({ open, onClose }) {
  const { user, hasModuleAccess } = useAuth();
  const { t } = useCMSLang();

  const navItems = [
    { to: '/cms', module: 'dashboard', label: t('nav.dashboard'), end: true },
    { to: '/cms/site-settings', module: 'site_settings', label: t('nav.siteSettings') },
    { to: '/cms/homepage', module: 'site_settings', label: t('nav.homepage') },
    { to: '/cms/navigation', module: 'navigation', label: t('nav.navigation') },
    { to: '/cms/partners', module: 'partners', label: t('nav.partners') },
    { to: '/cms/services', module: 'services', label: t('nav.services') },
    { to: '/cms/case-studies', module: 'case_studies', label: t('nav.caseStudies') },
    { to: '/cms/insights', module: 'insights', label: t('nav.insights') },
    { to: '/cms/careers', module: 'careers', label: t('nav.careers') },
    { to: '/cms/contact', module: 'contact', label: t('nav.contact') },
    { to: '/cms/media', module: 'media', label: t('nav.media') },
    { to: '/cms/users', module: 'users', label: t('nav.users') },
    { to: '/cms/activity-logs', module: 'activity_logs', label: t('nav.activityLogs') },
  ];

  const visibleItems = navItems.filter(
    (item) => user?.is_superuser || hasModuleAccess(item.module),
  );

  return (
    <>
      {open && <div style={styles.backdrop} onClick={onClose} aria-hidden="true" />}
      <aside
        className={`cms-sidebar ${open ? 'open' : ''}`}
        style={styles.sidebar}
        aria-label={t('a11y.cmsNavigation')}
      >
        <div style={styles.brand}>
          <span style={styles.brandLogo}>Sidrah</span>
          <span style={styles.brandCMS}>CMS</span>
          {open && (
            <button
              type="button"
              className="cms-sidebar-close"
              onClick={onClose}
              aria-label={t('a11y.closeDialog')}
              style={styles.closeBtn}
            >
              ✕
            </button>
          )}
        </div>
        <nav style={styles.nav}>
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              style={({ isActive }) => ({
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {}),
              })}
            >
              <span style={styles.navIcon} aria-hidden="true">
                {MODULE_ICONS[item.module] || '•'}
              </span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div style={styles.footer}>
          <span style={styles.version}>v1.0</span>
        </div>
      </aside>
    </>
  );
}

const styles = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
    display: 'none',
  },
  sidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    width: '240px',
    background: '#12121e',
    borderRight: '1px solid #1e1e2e',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1001,
    overflowY: 'auto',
  },
  brand: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.5rem',
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid #1e1e2e',
  },
  closeBtn: {
    marginLeft: 'auto',
    background: 'none',
    border: 'none',
    color: '#888',
    cursor: 'pointer',
    fontSize: '1rem',
    padding: '0.25rem',
  },
  brandLogo: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#c9a96e',
  },
  brandCMS: {
    fontSize: '0.6875rem',
    fontWeight: '500',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  nav: {
    flex: 1,
    padding: '0.75rem 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.125rem',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    padding: '0.5rem 1.5rem',
    color: '#888',
    textDecoration: 'none',
    fontSize: '0.8125rem',
    fontWeight: '500',
    transition: '150ms ease',
    borderLeft: '2px solid transparent',
  },
  navItemActive: {
    color: '#c9a96e',
    background: 'rgba(201, 169, 110, 0.08)',
    borderLeftColor: '#c9a96e',
  },
  navIcon: {
    fontSize: '0.875rem',
    width: '1.25rem',
    textAlign: 'center',
    flexShrink: 0,
  },
  footer: {
    padding: '1rem 1.5rem',
    borderTop: '1px solid #1e1e2e',
  },
  version: {
    fontSize: '0.6875rem',
    color: '#555',
  },
};
