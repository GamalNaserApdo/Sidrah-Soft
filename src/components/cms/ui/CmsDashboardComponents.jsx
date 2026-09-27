/**
 * CMS Dashboard Components — reusable building blocks for the premium dashboard.
 *
 * Components:
 * - DashboardHeader: page header (title, subtitle, date, refresh action)
 * - DashboardAlert: conditional operational notice (renders only with real items)
 * - KpiCard: primary hero KPI card (icon, large value, label, meta)
 * - StatCard: KPI card with icon, value, and meta items
 * - QuickActionCard: quick action link card with icon
 * - ActivityItem: single activity log entry
 * - RegistrationItem: compact recent-registration row
 * - SectionCard: card container with header (title, icon, optional link)
 * - ContactSubmissionItem: single contact submission row
 * - WelcomeHeader: dashboard greeting header
 *
 * All components use CSS classes from cms.css and consume design tokens.
 * No hard-coded colors — all visual properties come from --cms-* / --color-* tokens.
 */

import { Link } from 'react-router-dom';
import { useCMSLang } from '../../../contexts/CMSLanguageContext';
import CmsIcon from './CmsIcon';
import CMSBadge from './CMSBadge';

/* ─── Welcome Header ─────────────────────────────────────────────────────── */

export function WelcomeHeader({ userName, userRole, onRefresh, loading }) {
  const { t, lang } = useCMSLang();

  const now = new Date();
  const dateStr = now.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="cms-dash-welcome">
      <div className="cms-dash-welcome-content">
        <h1 className="cms-dash-welcome-title">
          {t('dash.welcome')}, {userName}
        </h1>
        <p className="cms-dash-welcome-subtitle">{userRole}</p>
        <div className="cms-dash-welcome-date">
          <CmsIcon name="clock" size={14} />
          {dateStr}
        </div>
      </div>
      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          className="cms-header-icon-btn"
          aria-label={t('action.refresh')}
          title={t('action.refresh')}
          style={{
            position: 'relative',
            zIndex: 1,
            ...(loading ? { opacity: 0.6 } : {}),
          }}
        >
          <CmsIcon name="refresh" size={18} />
        </button>
      )}
    </div>
  );
}

/* ─── Dashboard Page Header ──────────────────────────────────────────────── */

export function DashboardHeader({ subtitle, onRefresh, loading }) {
  const { t, lang } = useCMSLang();

  const dateStr = new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="cms-dash-header">
      <div className="cms-dash-header-text">
        <h1 className="cms-dash-header-title">{t('nav.dashboard')}</h1>
        <p className="cms-dash-header-subtitle">{subtitle || t('dash.subtitle')}</p>
        <div className="cms-dash-header-date">
          <CmsIcon name="clock" size={13} />
          {dateStr}
        </div>
      </div>
      {onRefresh && (
        <div className="cms-dash-header-actions">
          <button
            type="button"
            onClick={onRefresh}
            className="cms-dash-refresh"
            disabled={loading}
          >
            <CmsIcon name="refresh" size={15} />
            {t('action.refresh')}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Dashboard Alert (operational notice) ───────────────────────────────── */

/**
 * Renders only when at least one actionable item exists.
 * items: [{ key, count, label, link }]
 */
export function DashboardAlert({ items }) {
  const { t } = useCMSLang();
  if (!items || items.length === 0) return null;

  return (
    <div className="cms-dash-alert" role="status">
      <span className="cms-dash-alert-icon">
        <CmsIcon name="alert" size={18} />
      </span>
      <span className="cms-dash-alert-title">{t('dash.needsAttention')}</span>
      <div className="cms-dash-alert-items">
        {items.map((item) => (
          <Link key={item.key} to={item.link} className="cms-dash-alert-item">
            <strong>{item.count}</strong>
            {item.label}
            <CmsIcon name="arrowRight" size={13} />
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ─── KPI Card (primary hero metric) ─────────────────────────────────────── */

export function KpiCard({ icon, value, label, meta = [], badge, link }) {
  const content = (
    <div className="cms-kpi-card">
      <div className="cms-kpi-card-top">
        <span className="cms-kpi-card-icon">
          <CmsIcon name={icon} size={20} />
        </span>
        {badge && <span className="cms-kpi-card-badge">{badge}</span>}
      </div>
      <div className="cms-kpi-card-value">{value ?? 0}</div>
      <div className="cms-kpi-card-label">{label}</div>
      {meta.length > 0 && (
        <div className="cms-kpi-card-meta">
          {meta.map((m) => (
            <span key={m.label} className="cms-kpi-card-meta-item">
              <strong>{m.value}</strong>
              {m.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  if (link) {
    return (
      <Link to={link} className="cms-kpi-card-link">
        {content}
      </Link>
    );
  }
  return content;
}

/* ─── Registration Item (compact recent-registration row) ────────────────── */

const REGISTRATION_STATUS_BADGE = {
  new: 'info',
  reviewed: 'accent',
  accepted: 'success',
  rejected: 'danger',
  enrolled: 'success',
  completed: 'success',
  cancelled: 'default',
};

const REGISTRATION_STATUS_DOT = {
  new: 'info',
  reviewed: 'accent',
  accepted: 'success',
  rejected: 'danger',
  enrolled: 'success',
  completed: 'success',
  cancelled: 'default',
};

export function RegistrationItem({ reg, onView }) {
  const { t, lang } = useCMSLang();
  const dateStr = new Date(reg.submitted_at).toLocaleDateString(
    lang === 'ar' ? 'ar-EG' : 'en-US',
    { month: 'short', day: 'numeric' }
  );
  const statusLabel = t(`registration.status.${reg.status}`);

  return (
    <button
      type="button"
      className="cms-activity-item cms-activity-item--btn"
      onClick={() => onView?.(reg)}
    >
      <span className={`cms-activity-dot ${REGISTRATION_STATUS_DOT[reg.status] || 'info'}`} />
      <div className="cms-activity-content">
        <div className="cms-activity-title">{reg.full_name}</div>
        <div className="cms-activity-meta">
          {reg.program_title} · {dateStr}
        </div>
      </div>
      <span className="cms-item-trailing">
        <CMSBadge type={REGISTRATION_STATUS_BADGE[reg.status] || 'default'}>
          {statusLabel}
        </CMSBadge>
      </span>
    </button>
  );
}

/* ─── Stat Card ──────────────────────────────────────────────────────────── */

const STAT_ICON_MAP = {
  partners: 'partners',
  services: 'services',
  case_studies: 'caseStudies',
  insights: 'insights',
  careers: 'careers',
  contact: 'contact',
  media: 'media',
  users: 'users',
  activity_logs: 'activity',
};

export function StatCard({ module, title, stats, link, canAccess, labels, primaryLabel = 'total' }) {
  const icon = STAT_ICON_MAP[module] || 'folder';
  const entries = Object.entries(stats).filter(([key]) => key !== 'by_role');
  const primaryValue = stats[primaryLabel] ?? entries[0]?.[1] ?? 0;
  const metaEntries = entries.filter(([key]) => key !== primaryLabel).slice(0, 4);

  const content = (
    <div className="cms-stat-card">
      <div className="cms-stat-card-header">
        <span className="cms-stat-card-icon">
          <CmsIcon name={icon} size={18} />
        </span>
        <span className="cms-stat-card-title">{title}</span>
      </div>
      <div className="cms-stat-card-value">{primaryValue}</div>
      {metaEntries.length > 0 && (
        <div className="cms-stat-card-meta">
          {metaEntries.map(([key, value]) => (
            <div key={key} className="cms-stat-card-meta-item">
              <span className="cms-stat-card-meta-value">{value}</span>
              <span className="cms-stat-card-meta-label">{labels[key] || key}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (canAccess && link) {
    return (
      <Link to={link} style={{ textDecoration: 'none' }}>
        {content}
      </Link>
    );
  }
  return content;
}

/* ─── Quick Action Card ──────────────────────────────────────────────────── */

export function QuickActionCard({ to, icon, label }) {
  return (
    <Link to={to} className="cms-quick-action">
      <span className="cms-quick-action-icon">
        <CmsIcon name={icon} size={16} />
      </span>
      <span>{label}</span>
    </Link>
  );
}

/* ─── Activity Item ──────────────────────────────────────────────────────── */

export function ActivityItem({ log }) {
  const { lang } = useCMSLang();
  const isSuccess = log.is_success;
  const actor = log.display_name || log.username || '—';
  const timestamp = new Date(log.created_at).toLocaleString(
    lang === 'ar' ? 'ar-EG' : 'en-US',
    { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
  );

  return (
    <div className="cms-activity-item">
      <span className={`cms-activity-dot ${isSuccess ? 'success' : 'danger'}`} />
      <div className="cms-activity-content">
        <div className="cms-activity-title">
          {log.action} · {log.module}
        </div>
        <div className="cms-activity-meta">
          {actor} · {timestamp}
        </div>
      </div>
    </div>
  );
}

/* ─── Section Card ───────────────────────────────────────────────────────── */

export function SectionCard({ title, icon, link, linkLabel, children, emptyMessage }) {
  const { t } = useCMSLang();

  return (
    <div className="cms-section-card">
      <div className="cms-section-card-header">
        <span className="cms-section-card-title">
          {icon && <span className="cms-section-card-title-icon"><CmsIcon name={icon} size={16} /></span>}
          {title}
        </span>
        {link && (
          <Link to={link} className="cms-section-card-link">
            {linkLabel || t('dash.viewAll')}
            <CmsIcon name="arrowRight" size={14} />
          </Link>
        )}
      </div>
      {children}
      {emptyMessage && !children && (
        <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--cms-text-muted)', fontSize: 'var(--font-size-sm)' }}>
          {emptyMessage}
        </div>
      )}
    </div>
  );
}

/* ─── Contact Submission Item ────────────────────────────────────────────── */

export function ContactSubmissionItem({ sub }) {
  const { lang } = useCMSLang();
  const timestamp = new Date(sub.created_at).toLocaleDateString(
    lang === 'ar' ? 'ar-EG' : 'en-US',
    { month: 'short', day: 'numeric' }
  );
  const isHighPriority = sub.priority === 'high' || sub.priority === 'urgent';

  return (
    <div className="cms-activity-item">
      <span
        className="cms-activity-dot"
        style={{
          background: isHighPriority ? 'var(--cms-warning)' : 'var(--cms-info)',
          boxShadow: `0 0 6px ${isHighPriority ? 'var(--cms-warning-bg)' : 'var(--cms-info-bg)'}`,
        }}
      />
      <div className="cms-activity-content">
        <div className="cms-activity-title">{sub.full_name}</div>
        <div className="cms-activity-meta">
          {sub.inquiry_type || '—'} · {sub.status} · {timestamp}
        </div>
      </div>
    </div>
  );
}
