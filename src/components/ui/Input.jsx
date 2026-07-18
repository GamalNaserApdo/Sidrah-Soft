import { forwardRef, useId } from 'react';

export const Field = forwardRef(function Field(
  { label, error, hint, required, children, className = '' },
  ref
) {
  return (
    <div ref={ref} className={`ui-field ${className}`.trim()}>
      {label && (
        <label className="ui-label">
          {label}
          {required && <span className="ui-field__required" aria-hidden="true"> *</span>}
        </label>
      )}
      {children}
      {error && <div className="ui-field__error">{error}</div>}
      {hint && !error && <div className="ui-field__hint">{hint}</div>}
    </div>
  );
});

export const Input = forwardRef(function Input(
  { label, error, hint, required, className = '', ...rest },
  ref
) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const inputClass = `ui-input ui-focus-ring ${error ? 'ui-input--error' : ''} ${className}`.trim();

  return (
    <Field label={label} error={error} hint={hint} required={required}>
      <input
        id={id}
        ref={ref}
        className={inputClass}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        {...rest}
      />
    </Field>
  );
});

export const Textarea = forwardRef(function Textarea(
  { label, error, hint, required, rows = 4, className = '', ...rest },
  ref
) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const inputClass = `ui-textarea ui-focus-ring ${error ? 'ui-textarea--error' : ''} ${className}`.trim();

  return (
    <Field label={label} error={error} hint={hint} required={required}>
      <textarea
        id={id}
        ref={ref}
        rows={rows}
        className={inputClass}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        {...rest}
      />
    </Field>
  );
});

export const Select = forwardRef(function Select(
  { label, error, hint, required, children, className = '', ...rest },
  ref
) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const inputClass = `ui-select ui-focus-ring ${error ? 'ui-select--error' : ''} ${className}`.trim();

  return (
    <Field label={label} error={error} hint={hint} required={required}>
      <select
        id={id}
        ref={ref}
        className={inputClass}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        {...rest}
      >
        {children}
      </select>
    </Field>
  );
});

export const Checkbox = forwardRef(function Checkbox(
  { label, error, className = '', ...rest },
  ref
) {
  const id = useId();

  return (
    <div className={`ui-field ${className}`.trim()} style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
      <input
        id={id}
        ref={ref}
        type="checkbox"
        className="ui-checkbox"
        {...rest}
      />
      {label && (
        <label htmlFor={id} className="ui-label" style={{ marginBottom: 0, cursor: 'pointer' }}>
          {label}
        </label>
      )}
      {error && <div className="ui-field__error">{error}</div>}
    </div>
  );
});
