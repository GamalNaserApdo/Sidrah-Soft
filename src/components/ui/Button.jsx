import { forwardRef } from 'react';

const Button = forwardRef(function Button(
  {
    as: Component = 'button',
    variant = 'secondary',
    size = 'medium',
    loading = false,
    disabled = false,
    block = false,
    className = '',
    children,
    ...rest
  },
  ref
) {
  const isDisabled = disabled || loading;

  const variantClass = {
    primary: 'ui-button--primary',
    secondary: '',
    danger: 'ui-button--danger',
    warning: 'ui-button--warning',
    ghost: 'ui-button--ghost',
  }[variant] ?? '';

  const sizeClass = {
    small: 'ui-button--small',
    medium: '',
    large: 'ui-button--large',
  }[size] ?? '';

  const classes = [
    'ui-button',
    'ui-focus-ring',
    variantClass,
    sizeClass,
    block ? 'ui-button--block' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Component
      ref={ref}
      type={Component === 'button' ? 'button' : undefined}
      className={classes}
      disabled={Component === 'button' ? isDisabled : undefined}
      aria-disabled={isDisabled || undefined}
      {...rest}
    >
      {loading && <span aria-hidden="true">⏳</span>}
      {children}
    </Component>
  );
});

export default Button;
