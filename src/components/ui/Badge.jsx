function Badge({
  children,
  variant = 'default',
  size = 'medium',
  className = '',
}) {
  const variantClass = {
    default: '',
    accent: 'ui-badge--accent',
    success: 'ui-badge--success',
    warning: 'ui-badge--warning',
    danger: 'ui-badge--danger',
    info: 'ui-badge--info',
  }[variant] || '';

  const sizeClass = {
    small: 'ui-badge--small',
    medium: '',
  }[size] || '';

  const classes = ['ui-badge', variantClass, sizeClass, className]
    .filter(Boolean)
    .join(' ');

  return <span className={classes}>{children}</span>;
}

export default Badge;
