import { useI18n } from '../../i18n/I18nProvider';

export function LoadingState({ message }) {
  return (
    <div className="ui-state" role="status" aria-live="polite">
      <div className="ui-loading__spinner" aria-hidden="true" />
      {message && <p className="ui-loading__text">{message}</p>}
    </div>
  );
}

export function EmptyState({ message, icon = '📋', children }) {
  return (
    <div className="ui-state">
      <div className="ui-empty__icon" aria-hidden="true">{icon}</div>
      {message && <p className="ui-empty__text">{message}</p>}
      {children}
    </div>
  );
}

export function ErrorState({ message, onRetry, retryLabel }) {
  const { t } = useI18n();
  const label = retryLabel || t('common.retry');
  return (
    <div className="ui-error" role="alert">
      <span className="ui-error__icon" aria-hidden="true">⚠</span>
      <span className="ui-error__text">{message}</span>
      {onRetry && (
        <button type="button" className="ui-button ui-button--small ui-button--ghost" onClick={onRetry}>
          {label}
        </button>
      )}
    </div>
  );
}
