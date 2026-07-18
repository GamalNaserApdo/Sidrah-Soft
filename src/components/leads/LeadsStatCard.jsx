/**
 * LeadsStatCard — KPI card for the leads dashboard.
 */

export default function LeadsStatCard({ value, label, variant, icon }) {
  return (
    <div className={`leads-stat-card leads-stat-card--${variant}`}>
      <div className="leads-stat-card__top">
        <div className="leads-stat-card__value">{value}</div>
        {icon && <div className="leads-stat-card__icon" aria-hidden="true">{icon}</div>}
      </div>
      <div className="leads-stat-card__label">{label}</div>
    </div>
  );
}
