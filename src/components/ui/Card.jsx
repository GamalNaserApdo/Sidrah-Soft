import { forwardRef } from 'react';

const Card = forwardRef(function Card(
  {
    as: Component = 'div',
    variant = 'default',
    size = 'medium',
    interactive = false,
    className = '',
    children,
    ...rest
  },
  ref
) {
  const variantClass = {
    default: '',
    gold: 'ui-card--gold',
    purple: 'ui-card--purple',
  }[variant] || '';

  const sizeClass = {
    small: 'ui-card--small',
    medium: '',
    large: 'ui-card--large',
  }[size] || '';

  const classes = [
    'ui-card',
    interactive || Component === 'a' ? 'ui-card--interactive' : '',
    variantClass,
    sizeClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Component ref={ref} className={classes} {...rest}>
      {children}
    </Component>
  );
});

export default Card;
