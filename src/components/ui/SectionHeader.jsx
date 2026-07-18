function SectionHeader({ title, description, align = 'center', className = '', children }) {
  const alignClass = align === 'left' ? 'ui-section-header--left' : '';

  return (
    <div className={`ui-section-header ${alignClass} ${className}`.trim()}>
      <h2 className="ui-section-header__title">{title}</h2>
      {description && <p className="ui-section-header__description">{description}</p>}
      {children}
    </div>
  );
}

export default SectionHeader;
