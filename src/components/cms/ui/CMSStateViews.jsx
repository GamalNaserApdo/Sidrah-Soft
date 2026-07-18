/**
 * CMS State Views — Loading, Error, Empty, Forbidden
 *
 * Reusable state components for consistent UX across all CMS pages.
 */

import { useCMSLang } from '../../../contexts/CMSLanguageContext';

export function CMSLoadingState({ message }) {
  const { t } = useCMSLang();
  return (
    <div style={styles.center} role="status" aria-live="polite">
      <div style={styles.spinner} />
      <span style={styles.text}>{message || t('state.loading')}</span>
    </div>
  );
}

export function CMSErrorState({ message, onRetry }) {
  const { t } = useCMSLang();
  return (
    <div style={styles.errorBox} role="alert">
      <span style={styles.errorIcon}>⚠</span>
      <span style={styles.errorText}>{message || t('state.error')}</span>
      {onRetry && (
        <button type="button" onClick={onRetry} style={styles.retryBtn}>
          {t('action.retry')}
        </button>
      )}
    </div>
  );
}

export function CMSEmptyState({ message, action }) {
  const { t } = useCMSLang();
  return (
    <div style={styles.center}>
      <div style={styles.emptyIcon}>📋</div>
      <p style={styles.emptyText}>{message || t('state.empty')}</p>
      {action}
    </div>
  );
}

export function CMSForbiddenState({ message, onBack }) {
  const { t } = useCMSLang();
  return (
    <div style={styles.center}>
      <div style={styles.forbiddenIcon}>🔒</div>
      <h2 style={styles.forbiddenTitle}>{t('state.forbidden')}</h2>
      <p style={styles.forbiddenText}>{message}</p>
      {onBack && (
        <button type="button" onClick={onBack} style={styles.backBtn}>
          {t('action.back')}
        </button>
      )}
    </div>
  );
}

const styles = {
  center: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--space-12) var(--space-6)',
    textAlign: 'center',
    gap: 'var(--space-3)',
  },
  spinner: {
    width: '28px',
    height: '28px',
    border: '3px solid var(--cms-border-subtle)',
    borderTopColor: 'var(--cms-accent)',
    borderRadius: '50%',
    animation: 'cms-spin 0.8s linear infinite',
  },
  text: {
    color: 'var(--cms-text-muted)',
    fontSize: 'var(--font-size-base)',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    padding: 'var(--space-3) var(--space-4)',
    background: 'var(--cms-danger-bg)',
    border: '1px solid var(--cms-danger-border)',
    borderRadius: 'var(--cms-radius-lg)',
    color: 'var(--cms-danger)',
    fontSize: 'var(--font-size-md)',
    marginBottom: 'var(--space-4)',
  },
  errorIcon: { fontSize: 'var(--font-size-xl)', flexShrink: 0 },
  errorText: { flex: 1, lineHeight: 1.4 },
  retryBtn: {
    background: 'transparent',
    border: '1px solid var(--cms-danger-border)',
    color: 'var(--cms-danger)',
    borderRadius: 'var(--cms-radius-sm)',
    padding: 'var(--space-1) var(--space-3)',
    fontSize: 'var(--font-size-sm)',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  emptyIcon: { fontSize: 'var(--font-size-4xl)', opacity: 0.3 },
  emptyText: { color: 'var(--cms-text-muted)', fontSize: 'var(--font-size-base)' },
  forbiddenIcon: { fontSize: 'var(--font-size-4xl)', opacity: 0.3 },
  forbiddenTitle: { color: 'var(--cms-accent)', fontSize: 'var(--font-size-2xl)', margin: 0 },
  forbiddenText: { color: 'var(--cms-text-muted)', fontSize: 'var(--font-size-base)', maxWidth: '400px' },
  backBtn: {
    background: 'transparent',
    border: '1px solid var(--cms-accent)',
    color: 'var(--cms-accent)',
    borderRadius: 'var(--cms-radius-md)',
    padding: 'var(--space-2) var(--space-4)',
    fontSize: 'var(--font-size-md)',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
};
