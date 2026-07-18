import React from 'react';

/**
 * Shared SectionHeading component for future section rebuilds.
 *
 * Supports:
 * - Eyebrow (small uppercase label)
 * - Section index number (e.g. "01", "02")
 * - Large editorial headline
 * - Description text
 * - EN/AR via i18n (pass translated strings)
 * - RTL via [dir='rtl'] CSS rules
 * - Accessibility (aria-labelledby on the heading)
 *
 * Usage:
 * <SectionHeading
 *   eyebrow="What We Do"
 *   index="01"
 *   title="Services"
 *   description="We help organizations..."
 *   id="services-heading"
 * />
 *
 * NOT integrated into existing sections in this phase.
 * Opt-in only — sections will adopt it during their individual rebuilds.
 */
function SectionHeading({
  eyebrow,
  index,
  title,
  description,
  id,
  align = 'left',
  as: Tag = 'h2',
  className = '',
}) {
  const headingId = id || `section-heading-${Math.random().toString(36).slice(2, 9)}`;
  const alignClass = align === 'center' ? 'section-heading--center' : '';

  return (
    <div className={`section-heading ${alignClass} ${className}`.trim()}>
      {eyebrow && (
        <span className="section-eyebrow">
          {index && <span className="section-index">{index}</span>}
          {eyebrow}
        </span>
      )}
      {!eyebrow && index && (
        <span className="section-index">{index}</span>
      )}
      <Tag
        id={headingId}
        className="text-h2"
        style={{ marginTop: eyebrow || index ? '0' : '0' }}
      >
        {title}
      </Tag>
      {description && (
        <p className="section-description" style={{ marginTop: 'var(--space-5)' }}>
          {description}
        </p>
      )}
    </div>
  );
}

export default SectionHeading;
