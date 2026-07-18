/**
 * CMS Header — top bar with menu toggle, user info, language switch, logout.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useCMSLang } from '../../../contexts/CMSLanguageContext';

export default function CMSHeader({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const { lang, toggleLang, t } = useCMSLang();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleMenuToggle = useCallback(() => setMenuOpen((prev) => !prev), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        closeMenu();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen, closeMenu]);

  return (
    <header className="cms-header" style={styles.header}>
      <button
        type="button"
        onClick={onMenuToggle}
        style={styles.menuBtn}
        aria-label={t('a11y.toggleMenu')}
      >
        ☰
      </button>

      <div style={styles.spacer} />

      <button
        type="button"
        onClick={toggleLang}
        style={styles.langBtn}
        aria-label={t('a11y.switchLanguage')}
      >
        {lang === 'en' ? 'العربية' : 'English'}
      </button>

      <div ref={menuRef} style={styles.userContainer}>
        <button
          type="button"
          onClick={handleMenuToggle}
          style={styles.userBtn}
          aria-haspopup="true"
          aria-expanded={menuOpen}
        >
          <span style={styles.userAvatar}>
            {(user?.display_name || user?.username || '?').charAt(0).toUpperCase()}
          </span>
          <span style={styles.userName}>{user?.display_name || user?.username}</span>
          <span style={styles.caret}>▾</span>
        </button>

        {menuOpen && (
          <div style={styles.dropdown} role="menu">
            <div style={styles.dropdownHeader}>
              <div style={styles.dropdownName}>{user?.display_name || user?.username}</div>
              <div style={styles.dropdownEmail}>{user?.email}</div>
              <div style={styles.dropdownRole}>
                <span style={styles.roleBadge}>{user?.role}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                closeMenu();
                logout();
              }}
              style={styles.logoutItem}
              role="menuitem"
            >
              {t('user.signOut')}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

const styles = {
  header: {
    position: 'fixed',
    top: 0,
    left: '240px',
    right: 0,
    height: '56px',
    background: '#12121e',
    borderBottom: '1px solid #1e1e2e',
    display: 'flex',
    alignItems: 'center',
    padding: '0 1.5rem',
    gap: '0.75rem',
    zIndex: 900,
  },
  menuBtn: {
    background: 'none',
    border: 'none',
    color: '#aaa',
    fontSize: '1.25rem',
    cursor: 'pointer',
    padding: '0.25rem 0.5rem',
    display: 'none',
  },
  spacer: { flex: 1 },
  langBtn: {
    background: 'transparent',
    border: '1px solid #2a2a3e',
    color: '#aaa',
    borderRadius: '6px',
    padding: '0.375rem 0.75rem',
    fontSize: '0.75rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  userContainer: {
    position: 'relative',
  },
  userBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'transparent',
    border: 'none',
    color: '#ccc',
    cursor: 'pointer',
    fontFamily: 'inherit',
    padding: '0.25rem 0.5rem',
    borderRadius: '6px',
  },
  userAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'rgba(201, 169, 110, 0.15)',
    color: '#c9a96e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: '600',
    flexShrink: 0,
  },
  userName: {
    fontSize: '0.8125rem',
    fontWeight: '500',
  },
  caret: {
    fontSize: '0.625rem',
    color: '#888',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '0.5rem',
    background: '#12121e',
    border: '1px solid #2a2a3e',
    borderRadius: '8px',
    boxShadow: '0 10px 20px rgba(0,0,0,0.4)',
    minWidth: '220px',
    overflow: 'hidden',
  },
  dropdownHeader: {
    padding: '0.875rem 1rem',
    borderBottom: '1px solid #1e1e2e',
  },
  dropdownName: {
    fontSize: '0.8125rem',
    fontWeight: '600',
    color: '#e0e0e0',
  },
  dropdownEmail: {
    fontSize: '0.6875rem',
    color: '#888',
    marginTop: '0.125rem',
  },
  dropdownRole: {
    marginTop: '0.5rem',
  },
  roleBadge: {
    display: 'inline-block',
    padding: '0.125rem 0.5rem',
    borderRadius: '4px',
    background: 'rgba(201, 169, 110, 0.15)',
    color: '#c9a96e',
    fontSize: '0.625rem',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  logoutItem: {
    display: 'block',
    width: '100%',
    padding: '0.625rem 1rem',
    background: 'transparent',
    border: 'none',
    color: '#ef4444',
    fontSize: '0.8125rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'left',
  },
};
