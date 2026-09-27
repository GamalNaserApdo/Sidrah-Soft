/**
 * CMS Stat Card — small reusable KPI building block.
 *
 * Used by registrations KPIs and any page that needs a compact value/label card.
 * Visual style is aligned with the dashboard StatCard tokens.
 */

import CmsIcon from './CmsIcon';

const VARIANT_CLASS = {
  default: '',
  accent: 'cms-stat-card-accent',
  info: 'cms-stat-card-info',
  success: 'cms-stat-card-success',
  danger: 'cms-stat-card-danger',
  warning: 'cms-stat-card-warning',
};

export function CMSStatCard({
  value,
  label,
  icon,
  variant = 'default',
  compact = false,
  clickable = false,
  onClick,
}) {
  return (
    <div
      className={[
        'cms-stat-card',
        VARIANT_CLASS[variant] || '',
        compact ? 'compact' : '',
        clickable ? 'cms-stat-card-clickable' : '',
      ].join(' ').trim()}
      onClick={onClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-label={clickable ? `${label}: ${value}` : undefined}
    >
      {icon && (
        <span className="cms-stat-card-icon cms-stat-card-icon-inline">
          <CmsIcon name={icon} size={16} />
        </span>
      )}
      <div className="cms-stat-card-value">{value ?? 0}</div>
      <div className="cms-stat-card-label">{label}</div>
    </div>
  );
}

export function CMSStatsGrid({ children, compact = false, className = '' }) {
  return (
    <div className={`cms-stats-grid ${compact ? 'compact' : ''} ${className}`.trim()}>
      {children}
    </div>
  );
}
