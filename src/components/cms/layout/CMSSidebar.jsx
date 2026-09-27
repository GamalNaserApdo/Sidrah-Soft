/**
 * CMS Sidebar — premium capability-aware navigation.
 *
 * Features:
 * - Section grouping (Overview, Content, Training, System)
 * - SVG icons via CmsIcon
 * - Active state with accent border
 * - Collapsible on mobile with overlay
 * - RTL-aware
 */

import { NavLink } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useCMSLang } from '../../../contexts/CMSLanguageContext';
import CmsIcon from '../ui/CmsIcon';
import brandLogo from '../../../assets/logo.png';

const NAV_SECTIONS = [
  {
    labelKey: 'nav.sectionOverview',
    items: [
      { to: '/cms', module: 'dashboard', icon: 'dashboard', labelKey: 'nav.dashboard', end: true },
    ],
  },
  {
    labelKey: 'nav.sectionContent',
    items: [
      { to: '/cms/homepage', module: 'site_settings', icon: 'home', labelKey: 'nav.homepage' },
      { to: '/cms/navigation', module: 'navigation', icon: 'navigation', labelKey: 'nav.navigation' },
      { to: '/cms/partners', module: 'partners', icon: 'partners', labelKey: 'nav.partners' },
      { to: '/cms/services', module: 'services', icon: 'services', labelKey: 'nav.services' },
      { to: '/cms/case-studies', module: 'case_studies', icon: 'caseStudies', labelKey: 'nav.caseStudies' },
      { to: '/cms/insights', module: 'insights', icon: 'insights', labelKey: 'nav.insights' },
      { to: '/cms/careers', module: 'careers', icon: 'careers', labelKey: 'nav.careers' },
      { to: '/cms/ai-automation', module: 'ai_automation', icon: 'services', labelKey: 'nav.aiAutomation' },
      { to: '/cms/forms', module: 'forms', icon: 'contact', labelKey: 'nav.forms' },
      { to: '/cms/contact', module: 'contact', icon: 'contact', labelKey: 'nav.contact' },
    ],
  },
  {
    labelKey: 'nav.sectionTraining',
    items: [
      { to: '/cms/training', module: 'training', icon: 'training', labelKey: 'nav.training' },
      { to: '/cms/training/offers', module: 'training', icon: 'training', labelKey: 'nav.offers' },
      { to: '/cms/training/starter-form', module: 'training', icon: 'training', labelKey: 'nav.starterForm' },
      { to: '/cms/training/starter-landing', module: 'training', icon: 'training', labelKey: 'nav.starterLanding' },
      { to: '/cms/training/registrations', module: 'training_registrations', capability: 'training_registrations.view', icon: 'registrations', labelKey: 'nav.trainingRegistrations' },
      { to: '/cms/training/certificates', module: 'certificates', capability: 'certificates.view', icon: 'certificates', labelKey: 'nav.trainingCertificates' },
    ],
  },
  {
    labelKey: 'nav.sectionSystem',
    items: [
      { to: '/cms/media', module: 'media', icon: 'media', labelKey: 'nav.media' },
      { to: '/cms/users', module: 'users', icon: 'users', labelKey: 'nav.users' },
      { to: '/cms/activity-logs', module: 'activity_logs', icon: 'activity', labelKey: 'nav.activityLogs' },
      { to: '/cms/site-settings', module: 'site_settings', icon: 'settings', labelKey: 'nav.siteSettings' },
      { to: '/cms/static-seo', module: 'site_settings', icon: 'settings', labelKey: 'nav.staticSeo' },
    ],
  },
];

export default function CMSSidebar({ open, onClose, expanded = true, onExpandedChange }) {
  const { user, hasModuleAccess, hasCapability } = useAuth();
  const { t } = useCMSLang();

  const isItemVisible = (item) =>
    user?.is_superuser ||
    hasModuleAccess(item.module) ||
    (item.capability && hasCapability(item.capability));

  const toggleExpanded = () => {
    onExpandedChange?.(!expanded);
  };

  return (
    <>
      {open && <div style={styles.backdrop} onClick={onClose} aria-hidden="true" />}
      <aside
        className={`cms-sidebar ${open ? 'open' : ''} ${expanded ? '' : 'collapsed'}`}
        style={styles.sidebar}
        aria-label={t('a11y.cmsNavigation')}
      >
        <div className="cms-sidebar-brand" style={styles.brand}>
          <img src={brandLogo} alt="SidrahSoft" className="cms-sidebar-brand-logo" style={styles.brandLogoImg} />
          <span className="cms-sidebar-brand-text" style={styles.brandCMS}>CMS</span>
          {/* Desktop collapse/expand toggle */}
          <button
            type="button"
            className="cms-sidebar-collapse-btn"
            onClick={toggleExpanded}
            aria-label={expanded ? t('sidebar.collapse') : t('sidebar.expand')}
            title={expanded ? t('sidebar.collapse') : t('sidebar.expand')}
            style={styles.collapseBtn}
          >
            <CmsIcon name={expanded ? 'chevronLeft' : 'chevronRight'} size={16} />
          </button>
          {/* Mobile close */}
          {open && (
            <button
              type="button"
              className="cms-sidebar-close"
              onClick={onClose}
              aria-label={t('a11y.closeDialog')}
              style={styles.closeBtn}
            >
              <CmsIcon name="close" size={16} />
            </button>
          )}
        </div>

        <nav style={styles.nav}>
          {NAV_SECTIONS.map((section) => {
            const visibleItems = section.items.filter(isItemVisible);
            if (visibleItems.length === 0) return null;

            return (
              <div key={section.labelKey}>
                <div className="cms-sidebar-section-label">
                  {t(section.labelKey)}
                </div>
                {visibleItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `cms-sidebar-nav-item ${isActive ? 'active' : ''}`
                    }
                    title={t(item.labelKey)}
                    aria-label={t(item.labelKey)}
                    data-label={t(item.labelKey)}
                  >
                    <span className="cms-sidebar-nav-item-icon">
                      <CmsIcon name={item.icon} size={18} />
                    </span>
                    <span className="cms-sidebar-nav-item-label">{t(item.labelKey)}</span>
                  </NavLink>
                ))}
              </div>
            );
          })}
        </nav>

        <div style={styles.footer}>
          <span style={styles.version}>Sidrah CMS v1.0</span>
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
    background: 'rgba(0,0,0,0.55)',
    zIndex: 1000,
    display: 'none',
  },
  sidebar: {
    position: 'fixed',
    top: 0,
    bottom: 0,
    width: 'var(--cms-sidebar-width, 248px)',
    background: 'var(--cms-bg-page)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1001,
    overflowY: 'auto',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid var(--cms-border-subtle)',
  },
  collapseBtn: {
    marginInlineStart: 'auto',
    background: 'transparent',
    border: '1px solid var(--cms-border-subtle)',
    borderRadius: 'var(--cms-radius-md)',
    color: 'var(--cms-text-muted)',
    cursor: 'pointer',
    padding: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all var(--cms-transition-fast)',
  },
  closeBtn: {
    marginInlineStart: '0.5rem',
    background: 'none',
    border: 'none',
    color: 'var(--cms-text-muted)',
    cursor: 'pointer',
    padding: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLogoImg: {
    height: '2rem',
    width: 'auto',
    objectFit: 'contain',
  },
  brandCMS: {
    fontSize: '0.6875rem',
    fontWeight: 600,
    color: 'var(--cms-accent)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  nav: {
    flex: 1,
    padding: '0.5rem 0 1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.125rem',
  },
  footer: {
    padding: '1rem 1.5rem',
    borderTop: '1px solid var(--cms-border-subtle)',
  },
  version: {
    fontSize: '0.6875rem',
    color: 'var(--cms-text-dim)',
  },
};
