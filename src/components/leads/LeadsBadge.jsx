/**
 * LeadsBadge — status and priority badges with bilingual labels.
 */

import { useCMSLang } from '../../contexts/CMSLanguageContext';

const STATUS_ICONS = {
  new: '●',
  contacted: '●',
  in_progress: '●',
  closed: '✓',
  spam: '!',
  archived: '⊘',
};

const PRIORITY_ICONS = {
  low: '↓',
  normal: '−',
  high: '↑',
  urgent: '!',
};

export default function LeadsBadge({ type, value }) {
  const { t } = useCMSLang();

  const label = type === 'status'
    ? t(`status.${value}`) || value.replace(/_/g, ' ')
    : t(`priority.${value}`) || value;

  const modifier = type === 'status'
    ? `leads-badge--status-${value}`
    : `leads-badge--priority-${value}`;

  const icon = type === 'status' ? STATUS_ICONS[value] : PRIORITY_ICONS[value];

  return (
    <span className={`leads-badge ${modifier}`}>
      {icon && <span className="leads-badge__icon" aria-hidden="true">{icon}</span>}
      {label}
    </span>
  );
}
