function StatCard({ value, label, className = '' }) {
  return (
    <div className={`ui-stat-card ${className}`.trim()}>
      <div className="ui-stat-card__value">{value}</div>
      <div className="ui-stat-card__label">{label}</div>
    </div>
  );
}

export default StatCard;
