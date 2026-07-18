/**
 * CMS Button Component
 *
 * Variants: primary, secondary, danger, ghost, link
 * Sizes: sm, md, lg
 * States: loading, disabled
 */

import { forwardRef } from 'react';

const variantStyles = {
  primary: {
    background: 'var(--cms-accent-bg)',
    border: '1px solid var(--cms-accent)',
    color: 'var(--cms-accent)',
  },
  secondary: {
    background: 'var(--cms-bg-surface-alt)',
    border: '1px solid var(--cms-border-strong)',
    color: 'var(--cms-text-secondary)',
  },
  danger: {
    background: 'var(--cms-danger-bg)',
    border: '1px solid var(--cms-danger-border)',
    color: 'var(--cms-danger)',
  },
  ghost: {
    background: 'transparent',
    border: '1px solid transparent',
    color: 'var(--cms-text-secondary)',
  },
  link: {
    background: 'transparent',
    border: 'none',
    color: 'var(--cms-accent)',
    padding: 0,
    cursor: 'pointer',
    textDecoration: 'none',
    fontSize: 'inherit',
  },
};

const sizeStyles = {
  sm: { padding: 'var(--space-1) var(--space-3)', fontSize: 'var(--font-size-sm)', borderRadius: 'var(--cms-radius-sm)' },
  md: { padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--font-size-md)', borderRadius: 'var(--cms-radius-md)' },
  lg: { padding: 'var(--space-3) var(--space-6)', fontSize: 'var(--font-size-base)', borderRadius: 'var(--cms-radius-lg)' },
};

const CMSButton = forwardRef(function CMSButton(
  {
    children,
    variant = 'secondary',
    size = 'md',
    loading = false,
    disabled = false,
    onClick,
    type = 'button',
    style,
    ...rest
  },
  ref,
) {
  const isDisabled = disabled || loading;
  const isLink = variant === 'link';

  return (
    <button
      ref={ref}
      type={type}
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      style={{
        ...!isLink && sizeStyles[size],
        ...variantStyles[variant],
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.5 : 1,
        fontWeight: '500',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        fontFamily: 'inherit',
        transition: 'var(--cms-transition-fast)',
        ...style,
      }}
      {...rest}
    >
      {loading && <span aria-hidden="true">⏳</span>}
      {children}
    </button>
  );
});

export default CMSButton;
