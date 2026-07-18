/**
 * CMS Toolbar — search and filter bar for list pages.
 */

import { useCMSLang } from '../../../contexts/CMSLanguageContext';

export default function CMSToolbar({ search, onSearchChange, onSearchSubmit, children }) {
  const { t } = useCMSLang();

  return (
    <div style={styles.toolbar}>
      {search !== undefined && (
        <form onSubmit={(e) => { e.preventDefault(); onSearchSubmit?.(); }} style={styles.searchForm}>
          <input
            type="text"
            placeholder={t('action.search')}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            style={styles.searchInput}
            aria-label={t('action.search')}
          />
          {onSearchSubmit && (
            <button type="submit" style={styles.searchBtn}>{t('action.search')}</button>
          )}
        </form>
      )}
      {children}
    </div>
  );
}

const styles = {
  toolbar: {
    display: 'flex',
    gap: 'var(--space-3)',
    marginBottom: 'var(--space-6)',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  searchForm: {
    display: 'flex',
    gap: 'var(--space-2)',
    flex: 1,
    minWidth: '200px',
  },
  searchInput: {
    flex: 1,
    padding: 'var(--space-2) var(--space-3)',
    background: 'var(--cms-bg-surface)',
    border: '1px solid var(--cms-border-default)',
    borderRadius: 'var(--cms-radius-md)',
    color: 'var(--cms-text-primary)',
    fontSize: 'var(--font-size-md)',
    outline: 'none',
    fontFamily: 'inherit',
  },
  searchBtn: {
    padding: 'var(--space-2) var(--space-4)',
    borderRadius: 'var(--cms-radius-md)',
    border: '1px solid var(--cms-border-strong)',
    background: 'var(--cms-bg-surface-alt)',
    color: 'var(--cms-text-secondary)',
    fontSize: 'var(--font-size-md)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap',
  },
};
