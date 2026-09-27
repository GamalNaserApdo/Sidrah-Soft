/**
 * DynamicFormRenderer — public-facing form renderer.
 *
 * Fetches form schema by slug or target, renders fields with EN/AR support,
 * handles validation, and submits to the backend.
 *
 * Features:
 * - Bilingual labels, placeholders, help text
 * - RTL-aware
 * - Required validation
 * - Type-specific input rendering
 * - Accessible labels and error association
 * - Honeypot spam protection
 * - Success/error states
 */

import { useState, useCallback, useEffect, useId } from 'react';
import { useI18n } from '../../i18n/I18nProvider.jsx';
import { getForm, getAssignedForm, submitForm } from '../../services/formsApi';

const FIELD_TYPES_WITH_OPTIONS = ['select', 'radio', 'checkbox'];

export default function DynamicFormRenderer({ slug, target, onSubmitSuccess }) {
  const { lang, dir } = useI18n();
  const isRTL = dir === 'rtl';
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (slug) {
        data = await getForm(slug);
      } else if (target) {
        data = await getAssignedForm(target);
      }
      setFormData(data);
      // Initialize values
      const initial = {};
      if (data?.fields) {
        data.fields.forEach(f => {
          const key = f.field_key || `field_${f.id}`;
          initial[key] = '';
        });
        initial.website = ''; // honeypot
      }
      setValues(initial);
    } catch (err) {
      // When fetching by target, a 404 means no form is assigned.
      // Render nothing instead of showing an error to visitors.
      if (target && err.status === 404) {
        setFormData(null);
        setError(null);
      } else {
        setError(err.message || 'Failed to load form');
      }
    } finally {
      setLoading(false);
    }
  }, [slug, target]);

  useEffect(() => { load(); }, [load]);

  const handleChange = (key, value) => {
    setValues(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!formData?.fields) return errs;
    formData.fields.forEach(f => {
      if (!f.is_active) return;
      const key = f.field_key || `field_${f.id}`;
      const val = values[key];
      if (f.is_required && (!val || val === '')) {
        errs[key] = lang === 'ar' ? 'هذا الحقل مطلوب' : 'This field is required';
        return;
      }
      if (!val || val === '') return;
      // Type validation
      if (f.field_type === 'email') {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
          errs[key] = lang === 'ar' ? 'أدخل بريداً إلكترونياً صحيحاً' : 'Enter a valid email address';
        }
      } else if (f.field_type === 'phone') {
        const digits = val.replace(/\D/g, '');
        if (digits.length < 7) {
          errs[key] = lang === 'ar' ? 'أدخل رقم هاتف صحيح' : 'Enter a valid phone number';
        }
      } else if (f.field_type === 'url') {
        if (!/^https?:\/\//i.test(val)) {
          errs[key] = lang === 'ar' ? 'أدخل رابطاً صحيحاً' : 'Enter a valid URL';
        }
      } else if (f.field_type === 'number') {
        if (isNaN(val)) {
          errs[key] = lang === 'ar' ? 'أدخل رقماً صحيحاً' : 'Enter a valid number';
        }
      }
    });
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      const payload = { ...values, _language: lang, _source_page: window.location.href };
      await submitForm(formData.slug, payload);
      setSubmitted(true);
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (err) {
      const data = err.data || {};
      if (data && typeof data === 'object') {
        const fieldErrs = {};
        Object.entries(data).forEach(([k, v]) => {
          if (k !== 'detail' && k !== 'non_field_errors') {
            fieldErrs[k] = Array.isArray(v) ? v[0] : v;
          }
        });
        setErrors(fieldErrs);
        setSubmitError(data.detail || (Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : null));
      } else {
        setSubmitError(err.message || 'Submission failed');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>{lang === 'ar' ? 'جارٍ التحميل...' : 'Loading...'}</div>;
  }

  if (error) {
    return <div style={styles.error}>{error}</div>;
  }

  if (!formData) {
    return null;
  }

  if (submitted) {
    return (
      <div style={styles.success} role="status">
        <p style={styles.successText}>
          {lang === 'ar' ? (formData.success_message_ar || formData.success_message_en) : formData.success_message_en}
        </p>
      </div>
    );
  }

  const title = lang === 'ar' ? (formData.title_ar || formData.title_en) : formData.title_en;
  const description = lang === 'ar' ? (formData.description_ar || formData.description_en) : formData.description_en;
  const submitLabel = lang === 'ar' ? (formData.submit_button_ar || formData.submit_button_en) : formData.submit_button_en;

  return (
    <form onSubmit={handleSubmit} style={styles.form} dir={isRTL ? 'rtl' : 'ltr'} noValidate>
      {title && <h3 style={styles.title}>{title}</h3>}
      {description && <p style={styles.description}>{description}</p>}

      {/* Honeypot */}
      <input
        type="text"
        name="website"
        value={values.website || ''}
        onChange={(e) => handleChange('website', e.target.value)}
        style={styles.honeypot}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      {formData.fields.filter(f => f.is_active).map(field => (
        <FieldRenderer
          key={field.id}
          field={field}
          value={values[field.field_key || `field_${field.id}`]}
          error={errors[field.field_key || `field_${field.id}`]}
          onChange={(v) => handleChange(field.field_key || `field_${field.id}`, v)}
          lang={lang}
        />
      ))}

      {submitError && <div style={styles.submitError} role="alert">{submitError}</div>}

      <button type="submit" disabled={submitting} style={styles.submitBtn}>
        {submitting ? (lang === 'ar' ? 'جارٍ الإرسال...' : 'Submitting...') : submitLabel}
      </button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Field Renderer
// ---------------------------------------------------------------------------

function FieldRenderer({ field, value, error, onChange, lang }) {
  const id = useId();
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;
  const key = field.field_key || `field_${field.id}`;
  const label = lang === 'ar' ? (field.label_ar || field.label_en) : field.label_en;
  const placeholder = lang === 'ar' ? (field.placeholder_ar || field.placeholder_en) : field.placeholder_en;
  const helpText = lang === 'ar' ? (field.help_text_ar || field.help_text_en) : field.help_text_en;

  const commonProps = {
    id,
    value: value || '',
    onChange: (e) => onChange(e.target.value),
    placeholder,
    'aria-invalid': !!error,
    'aria-describedby': error ? errorId : (helpText ? helpId : undefined),
    required: field.is_required,
  };

  return (
    <div style={styles.field}>
      <label htmlFor={id} style={styles.label}>
        {label}
        {field.is_required && <span style={styles.required} aria-hidden="true">*</span>}
      </label>

      {field.field_type === 'textarea' && (
        <textarea {...commonProps} rows={4} style={styles.textarea} />
      )}

      {field.field_type === 'select' && (
        <select {...commonProps} style={styles.select}>
          <option value="">{lang === 'ar' ? 'اختر...' : 'Select...'}</option>
          {field.options?.map(opt => (
            <option key={opt.value} value={opt.value}>
              {lang === 'ar' ? (opt.label_ar || opt.label_en) : opt.label_en}
            </option>
          ))}
        </select>
      )}

      {field.field_type === 'radio' && (
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>{label}{field.is_required && <span style={styles.required} aria-hidden="true">*</span>}</legend>
          <div style={styles.radioGroup}>
            {field.options?.map(opt => (
              <label key={opt.value} style={styles.radioLabel}>
                <input
                  type="radio"
                  name={key}
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={(e) => onChange(e.target.value)}
                  required={field.is_required}
                />
                {lang === 'ar' ? (opt.label_ar || opt.label_en) : opt.label_en}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {field.field_type === 'checkbox' && (
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>{label}{field.is_required && <span style={styles.required} aria-hidden="true">*</span>}</legend>
          <div style={styles.checkboxGroup}>
            {field.options?.map(opt => (
              <label key={opt.value} style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name={key}
                  value={opt.value}
                  checked={Array.isArray(value) ? value.includes(opt.value) : value === opt.value}
                  onChange={(e) => {
                    const current = Array.isArray(value) ? value : (value ? [value] : []);
                    if (e.target.checked) onChange([...current, opt.value]);
                    else onChange(current.filter(v => v !== opt.value));
                  }}
                />
                {lang === 'ar' ? (opt.label_ar || opt.label_en) : opt.label_en}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {!['textarea', 'select', 'radio', 'checkbox'].includes(field.field_type) && (
        <input
          {...commonProps}
          type={field.field_type === 'phone' ? 'tel' : field.field_type}
          style={styles.input}
        />
      )}

      {helpText && !error && <div id={helpId} style={styles.helpText}>{helpText}</div>}
      {error && <div id={errorId} style={styles.errorText} role="alert">{error}</div>}
    </div>
  );
}

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    maxWidth: '640px',
  },
  loading: {
    padding: '2rem',
    textAlign: 'center',
    color: '#6b7280',
  },
  error: {
    padding: '1rem',
    color: '#dc2626',
    background: '#fef2f2',
    borderRadius: '0.5rem',
  },
  success: {
    padding: '1.5rem',
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '0.5rem',
  },
  successText: {
    margin: 0,
    color: '#065f46',
    fontSize: '1rem',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 600,
    margin: 0,
  },
  description: {
    fontSize: '0.9rem',
    color: '#6b7280',
    margin: 0,
  },
  honeypot: {
    position: 'absolute',
    left: '-9999px',
    width: '1px',
    height: '1px',
    opacity: 0,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#374151',
  },
  required: {
    color: '#dc2626',
    marginInlineStart: '0.25rem',
  },
  input: {
    padding: '0.625rem 0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '0.9rem',
    width: '100%',
    boxSizing: 'border-box',
  },
  textarea: {
    padding: '0.625rem 0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '0.9rem',
    width: '100%',
    boxSizing: 'border-box',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  select: {
    padding: '0.625rem 0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '0.9rem',
    width: '100%',
    boxSizing: 'border-box',
    background: 'white',
  },
  fieldset: {
    border: 'none',
    padding: 0,
    margin: 0,
  },
  legend: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '0.5rem',
  },
  radioGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  checkboxGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  helpText: {
    fontSize: '0.75rem',
    color: '#6b7280',
  },
  errorText: {
    fontSize: '0.75rem',
    color: '#dc2626',
    fontWeight: 500,
  },
  submitError: {
    padding: '0.75rem',
    background: '#fef2f2',
    color: '#dc2626',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
  },
  submitBtn: {
    padding: '0.75rem 1.5rem',
    background: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
    alignSelf: 'flex-start',
  },
};
