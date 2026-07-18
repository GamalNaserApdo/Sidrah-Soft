/**
 * CMS Input, Textarea, Select, Checkbox components.
 * All support label, error, hint, and required indicator.
 */

import { forwardRef, useId } from 'react';

const baseInputStyle = {
  width: '100%',
  padding: 'var(--space-2) var(--space-3)',
  background: 'var(--cms-bg-input)',
  border: '1px solid var(--cms-border-default)',
  borderRadius: 'var(--cms-radius-md)',
  color: 'var(--cms-text-primary)',
  fontSize: 'var(--font-size-md)',
  fontFamily: 'inherit',
  outline: 'none',
  transition: 'border-color var(--cms-transition-fast)',
};

const errorBorderStyle = {
  borderColor: 'var(--cms-danger-border)',
};

const labelStyle = {
  display: 'block',
  fontSize: 'var(--font-size-sm)',
  fontWeight: '500',
  color: 'var(--cms-text-secondary)',
  marginBottom: 'var(--space-1)',
};

const errorStyle = {
  fontSize: 'var(--font-size-sm)',
  color: 'var(--cms-danger)',
  marginTop: 'var(--space-1)',
};

const hintStyle = {
  fontSize: 'var(--font-size-xs)',
  color: 'var(--cms-text-dim)',
  marginTop: 'var(--space-1)',
};

const requiredMark = {
  color: 'var(--cms-danger)',
  marginLeft: '0.125rem',
};

export const CMSInput = forwardRef(function CMSInput(
  { label, error, hint, required, style, ...rest },
  ref,
) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  return (
    <div>
      {label && (
        <label htmlFor={id} style={labelStyle}>
          {label}
          {required && <span style={requiredMark}>*</span>}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        style={{ ...baseInputStyle, ...(error ? errorBorderStyle : {}), ...style }}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : (hint ? hintId : undefined)}
        {...rest}
      />
      {error && <div id={errorId} style={errorStyle}>{error}</div>}
      {hint && !error && <div id={hintId} style={hintStyle}>{hint}</div>}
    </div>
  );
});

export const CMSTextarea = forwardRef(function CMSTextarea(
  { label, error, hint, required, rows = 4, style, ...rest },
  ref,
) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  return (
    <div>
      {label && (
        <label htmlFor={id} style={labelStyle}>
          {label}
          {required && <span style={requiredMark}>*</span>}
        </label>
      )}
      <textarea
        id={id}
        ref={ref}
        rows={rows}
        style={{
          ...baseInputStyle,
          resize: 'vertical',
          minHeight: '80px',
          lineHeight: '1.5',
          ...(error ? errorBorderStyle : {}),
          ...style,
        }}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : (hint ? hintId : undefined)}
        {...rest}
      />
      {error && <div id={errorId} style={errorStyle}>{error}</div>}
      {hint && !error && <div id={hintId} style={hintStyle}>{hint}</div>}
    </div>
  );
});

export const CMSSelect = forwardRef(function CMSSelect(
  { label, error, hint, required, children, style, ...rest },
  ref,
) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  return (
    <div>
      {label && (
        <label htmlFor={id} style={labelStyle}>
          {label}
          {required && <span style={requiredMark}>*</span>}
        </label>
      )}
      <select
        id={id}
        ref={ref}
        style={{
          ...baseInputStyle,
          cursor: 'pointer',
          ...(error ? errorBorderStyle : {}),
          ...style,
        }}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : (hint ? hintId : undefined)}
        {...rest}
      >
        {children}
      </select>
      {error && <div id={errorId} style={errorStyle}>{error}</div>}
      {hint && !error && <div id={hintId} style={hintStyle}>{hint}</div>}
    </div>
  );
});

export const CMSCheckbox = forwardRef(function CMSCheckbox(
  { label, error, hint, style, ...rest },
  ref,
) {
  const id = useId();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <input
        id={id}
        ref={ref}
        type="checkbox"
        style={{
          width: '16px',
          height: '16px',
          accentColor: 'var(--cms-accent)',
          cursor: 'pointer',
          ...style,
        }}
        {...rest}
      />
      {label && (
        <label htmlFor={id} style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>
          {label}
        </label>
      )}
      {error && <div style={errorStyle}>{error}</div>}
      {hint && !error && <div style={hintStyle}>{hint}</div>}
    </div>
  );
});
