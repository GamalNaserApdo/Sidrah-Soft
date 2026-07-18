/**
 * Leads Header — compact professional top bar with navigation,
 * language switch, user dropdown, and mobile menu.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCMSLang } from '../../contexts/CMSLanguageContext';

export default function LeadsHeader() {
  const { user, logout } = useAuth();
  const { lang, toggleLang, t } = useCMSLang();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = useCallback(async () => {
    setMenuOpen(false);
    setMobileNavOpen(false);
    await logout();
    navigate('/leads/login');
  }, [logout, navigate]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  const navItems = [
    { path: '/leads', label: t('leads.title') },
  ];

  return (
    <header className="leads-header">
      <div className="leads-header__brand">
        <Link to="/leads" className="leads-header__logo">SidrahSoft</Link>
        <span className="leads-header__divider">|</span>
        <span className="leads-header__title">{t('leads.title')}</span>
      </div>

      <nav className={`leads-header__nav ${mobileNavOpen ? 'leads-header__nav--open' : ''}`} aria-label={t('leads.title')}>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`leads-header__nav-link ${isActive(item.path) ? 'leads-header__nav-link--active' : ''}`}
            onClick={() => setMobileNavOpen(false)}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="leads-header__actions">
        <button
          type="button"
          onClick={toggleLang}
          className="leads-header__lang-btn ui-focus-ring"
          aria-label={t('a11y.switchLanguage')}
        >
          {lang === 'en' ? 'العربية' : 'English'}
        </button>

        <button
          type="button"
          className="leads-header__mobile-toggle ui-focus-ring"
          aria-label={t('a11y.toggleMenu')}
          aria-expanded={mobileNavOpen}
          onClick={() => setMobileNavOpen((prev) => !prev)}
        >
          {mobileNavOpen ? '✕' : '☰'}
        </button>

        <div ref={menuRef} className="leads-header__user">
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="leads-header__user-btn ui-focus-ring"
            aria-haspopup="true"
            aria-expanded={menuOpen}
            aria-label={user?.display_name || user?.username}
          >
            <span className="leads-header__avatar">
              {(user?.display_name || user?.username || '?').charAt(0).toUpperCase()}
            </span>
            <span className="leads-header__user-name">{user?.display_name || user?.username}</span>
            <span className="leads-header__caret" aria-hidden="true">▾</span>
          </button>

          {menuOpen && (
            <div className="leads-header__dropdown" role="menu">
              <div className="leads-header__dropdown-header">
                <div className="leads-header__dropdown-name">{user?.display_name || user?.username}</div>
                <div className="leads-header__dropdown-email">{user?.email}</div>
                <div className="leads-header__dropdown-role">{user?.role}</div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="leads-header__logout-item ui-focus-ring"
                role="menuitem"
              >
                <span aria-hidden="true">→</span>
                {t('user.signOut')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
