/**
 * CMS Header — premium top bar.
 *
 * Features:
 * - Menu toggle (mobile)
 * - Language switch with globe icon
 * - User profile dropdown with avatar
 * - Logout
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useCMSLang } from '../../../contexts/CMSLanguageContext';
import CmsIcon from '../ui/CmsIcon';

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

  const displayName = user?.display_name || user?.username || '';
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <header className="cms-header cms-header-premium">
      <div className="cms-header-left">
        <button
          type="button"
          onClick={onMenuToggle}
          className="cms-header-icon-btn"
          aria-label={t('a11y.toggleMenu')}
          style={styles.menuBtn}
        >
          <CmsIcon name="menu" size={20} />
        </button>
      </div>

      <div className="cms-header-right">
        <button
          type="button"
          onClick={toggleLang}
          className="cms-header-lang-btn"
          aria-label={t('a11y.switchLanguage')}
        >
          <CmsIcon name="globe" size={16} />
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
            <span className="cms-user-avatar">{initials}</span>
            <span style={styles.userName}>{displayName}</span>
            <CmsIcon name="chevronDown" size={14} />
          </button>

          {menuOpen && (
            <div style={styles.dropdown} role="menu">
              <div style={styles.dropdownHeader}>
                <div style={styles.dropdownName}>{displayName}</div>
                {user?.email && <div style={styles.dropdownEmail}>{user.email}</div>}
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
                <CmsIcon name="logout" size={16} />
                {t('user.signOut')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

const styles = {
  menuBtn: {
    display: 'none',
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
    color: 'var(--cms-text-primary)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    padding: '0.25rem 0.5rem',
    borderRadius: 'var(--cms-radius-md)',
    transition: 'background var(--cms-transition-fast)',
  },
  userName: {
    fontSize: 'var(--font-size-md)',
    fontWeight: 500,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    insetInlineEnd: 0,
    marginTop: '0.5rem',
    background: 'var(--cms-bg-surface)',
    border: '1px solid var(--cms-border-default)',
    borderRadius: 'var(--cms-radius-lg)',
    boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
    minWidth: '240px',
    overflow: 'hidden',
  },
  dropdownHeader: {
    padding: '1rem',
    borderBottom: '1px solid var(--cms-border-subtle)',
  },
  dropdownName: {
    fontSize: 'var(--font-size-md)',
    fontWeight: 600,
    color: 'var(--cms-text-primary)',
  },
  dropdownEmail: {
    fontSize: 'var(--font-size-xs)',
    color: 'var(--cms-text-muted)',
    marginTop: '0.125rem',
  },
  dropdownRole: {
    marginTop: '0.625rem',
  },
  roleBadge: {
    display: 'inline-block',
    padding: '0.125rem 0.5rem',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--cms-accent-bg)',
    color: 'var(--cms-accent)',
    fontSize: 'var(--font-size-2xs)',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  logoutItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    width: '100%',
    padding: '0.75rem 1rem',
    background: 'transparent',
    border: 'none',
    color: 'var(--cms-danger)',
    fontSize: 'var(--font-size-md)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'start',
    transition: 'background var(--cms-transition-fast)',
  },
};
