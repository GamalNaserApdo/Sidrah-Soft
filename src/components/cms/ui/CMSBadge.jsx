/**
 * CMS Badge Component
 *
 * Status, type, and boolean indicators.
 */

import { useCMSLang } from '../../../contexts/CMSLanguageContext';

const typeStyles = {
  default: { background: 'var(--cms-bg-surface-alt)', color: 'var(--cms-text-secondary)', border: '1px solid var(--cms-border-default)' },
  accent: { background: 'var(--cms-accent-bg)', color: 'var(--cms-accent)', border: '1px solid var(--cms-accent-border)' },
  success: { background: 'var(--cms-success-bg)', color: 'var(--cms-success)', border: '1px solid var(--cms-success-border)' },
  warning: { background: 'var(--cms-warning-bg)', color: 'var(--cms-warning)', border: '1px solid var(--cms-warning-border)' },
  danger: { background: 'var(--cms-danger-bg)', color: 'var(--cms-danger)', border: '1px solid var(--cms-danger-border)' },
  info: { background: 'var(--cms-info-bg)', color: 'var(--cms-info)', border: '1px solid var(--cms-info-border)' },
};

export default function CMSBadge({ children, type = 'default', size = 'sm', style }) {
  const sizeStyles = {
    xs: { fontSize: '0.625rem', padding: '0.0625rem 0.375rem' },
    sm: { fontSize: '0.6875rem', padding: '0.125rem 0.5rem' },
    md: { fontSize: '0.75rem', padding: '0.25rem 0.625rem' },
  };

  return (
    <span
      style={{
        display: 'inline-block',
        borderRadius: 'var(--cms-radius-sm)',
        fontWeight: '500',
        whiteSpace: 'nowrap',
        ...sizeStyles[size],
        ...typeStyles[type],
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  const { t } = useCMSLang();
  const statusMap = {
    draft: { type: 'default', label: t('status.draft') },
    published: { type: 'success', label: t('status.published') },
    archived: { type: 'warning', label: t('status.archived') },
    new: { type: 'info', label: t('status.new') },
    contacted: { type: 'accent', label: t('status.contacted') },
    in_progress: { type: 'accent', label: t('status.inProgress') },
    closed: { type: 'success', label: t('status.closed') },
    spam: { type: 'danger', label: t('status.spam') },
    active: { type: 'success', label: t('status.active') },
    inactive: { type: 'default', label: t('status.inactive') },
    open: { type: 'info', label: t('status.open') },
    expired: { type: 'warning', label: t('status.expired') },
    issued: { type: 'success', label: t('status.issued') },
    revoked: { type: 'danger', label: t('status.revoked') },
  };

  const config = statusMap[status] || { type: 'default', label: status };
  return <CMSBadge type={config.type}>{config.label}</CMSBadge>;
}
