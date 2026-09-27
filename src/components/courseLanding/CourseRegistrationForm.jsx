import { useState, useRef, useCallback, useMemo } from 'react';
import { useI18n } from '../../i18n/I18nProvider.jsx';
import { submitRegistration, extractUTMFromURL, DEFAULT_REGISTRATION_URL } from '../../services/trainingApi';
import { useAnalyticsConsent } from '../../contexts/AnalyticsContext';
import { trackRegistrationSuccess } from '../../utils/analyticsEvents';
import SearchableSelect from './SearchableSelect';
import {
  ALL_UNIVERSITIES,
  UNIVERSITY_CATEGORIES,
  EDUCATION_STATUS_OPTIONS,
} from '../../data/egyptianUniversities';

const FORM_STATES = {
  IDLE: 'idle',
  VALIDATING: 'validating',
  SUBMITTING: 'submitting',
  SUCCESS: 'success',
  VALIDATION_ERROR: 'validation_error',
  SERVER_ERROR: 'server_error',
  CLOSED: 'closed',
};

export default function CourseRegistrationForm({ program, slug }) {
  const { lang } = useI18n();
  const isAr = lang === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';
  const { isGranted: isConsentGranted } = useAnalyticsConsent();
  const conversionFiredRef = useRef(false);

  const [formState, setFormState] = useState(FORM_STATES.IDLE);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    college_or_school: '',
    academic_year: '',
    university: '',
    university_other: '',
    education_status: '',
    education_status_other: '',
    notes: '',
    privacyConsent: false,
    website_field: '', // honeypot
  });
  const submitTimeoutRef = useRef(null);

  const landing = program?.landing || {};

  // Build university options with bilingual labels
  const universityOptions = useMemo(() =>
    ALL_UNIVERSITIES.map((u) => ({
      value: u.value,
      label: isAr ? u.name_ar : u.name_en,
      category: u.category,
    })),
    [isAr]
  );
  const formTitle = isAr
    ? (landing.registrationFormTitle?.ar || 'سجل في هذه الدورة')
    : (landing.registrationFormTitle?.en || 'Register for this Course');
  const formDescription = isAr
    ? landing.registrationFormDescription?.ar
    : landing.registrationFormDescription?.en;
  const buttonText = isAr
    ? (landing.registrationFormButton?.ar || 'إرسال التسجيل')
    : (landing.registrationFormButton?.en || 'Submit Registration');
  const successMessage = isAr
    ? (landing.registrationSuccessMessage?.ar || 'تم استلام تسجيلك. سنتواصل معك قريبًا.')
    : (landing.registrationSuccessMessage?.en || 'Your registration has been received. We will contact you soon.');
  const closedMessage = isAr
    ? (landing.registrationClosedMessage?.ar || 'التسجيل في هذه الدورة مغلق حاليًا.')
    : (landing.registrationClosedMessage?.en || 'Registration for this course is currently closed.');
  const fallbackUrl = landing.fallbackGoogleFormUrl || DEFAULT_REGISTRATION_URL;

  // Check if registration is closed
  const registrationAvailable = program?.course?.registrationAvailable !== false;
  const showForm = landing.showRegistrationForm !== false;

  const validate = useCallback(() => {
    const errs = {};
    if (!formData.full_name.trim()) {
      errs.full_name = isAr ? 'الاسم مطلوب' : 'Full name is required';
    } else if (formData.full_name.trim().length < 3) {
      errs.full_name = isAr ? 'الاسم قصير جدًا' : 'Name too short';
    }
    if (!formData.email.trim()) {
      errs.email = isAr ? 'البريد الإلكتروني مطلوب' : 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = isAr ? 'بريد إلكتروني غير صالح' : 'Invalid email format';
    }
    if (!formData.phone.trim()) {
      errs.phone = isAr ? 'رقم الهاتف مطلوب' : 'Phone number is required';
    } else if (formData.phone.replace(/\D/g, '').length < 7) {
      errs.phone = isAr ? 'رقم هاتف غير صالح' : 'Invalid phone number';
    }
    // Validate "Other" conditional fields
    if (formData.university === 'other' && !formData.university_other.trim()) {
      errs.university_other = isAr
        ? 'اكتب اسم الجامعة أو الجهة التعليمية'
        : 'Enter university or educational institution';
    }
    if (formData.education_status === 'other' && !formData.education_status_other.trim()) {
      errs.education_status_other = isAr
        ? 'وضح حالتك الدراسية'
        : 'Specify your education status';
    }
    if (!formData.privacyConsent) {
      errs.privacyConsent = isAr
        ? 'يجب الموافقة على سياسة الخصوصية'
        : 'Privacy policy consent is required';
    }
    return errs;
  }, [formData, isAr]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Honeypot check — if filled, silently "succeed" (bot trap)
    if (formData.website_field) {
      setFormState(FORM_STATES.SUCCESS);
      return;
    }

    setFormState(FORM_STATES.VALIDATING);
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setFormState(FORM_STATES.VALIDATION_ERROR);
      return;
    }

    setFormState(FORM_STATES.SUBMITTING);
    setServerError('');

    try {
      const utm = extractUTMFromURL();
      const response = await submitRegistration(slug, { ...formData, preferred_language: lang }, utm);

      if (response.is_new === false) {
        // Duplicate — show success-like message. NOT a new conversion:
        // no explicit conversion event fires for duplicates.
        setServerError(isAr
          ? 'لقد سجلت بالفعل في هذه الدورة. سنتواصل معك قريبًا.'
          : 'You have already registered for this course. We will contact you soon.');
        setFormState(FORM_STATES.SUCCESS);
      } else {
        // Confirmed successful NEW registration — fire the explicit
        // conversion event exactly once (ref guards against any
        // rerender-driven duplicate invocation).
        if (!conversionFiredRef.current) {
          conversionFiredRef.current = true;
          trackRegistrationSuccess({
            programSlug: slug,
            productType: program?.course?.branch || '',
            sourcePage: typeof window !== 'undefined' ? window.location.pathname : '',
            campaignSlug: utm.utm_campaign || '',
            analyticsGranted: isConsentGranted('analytics'),
            marketingGranted: isConsentGranted('marketing'),
          });
        }
        setFormState(FORM_STATES.SUCCESS);
      }
    } catch (err) {
      if (err.status === 400 && err.data) {
        // Field errors from backend
        const fieldErrs = {};
        for (const [key, val] of Object.entries(err.data)) {
          if (Array.isArray(val)) {
            fieldErrs[key] = val[0];
          } else if (typeof val === 'string') {
            fieldErrs[key] = val;
          }
        }
        // Check for registration closed error
        if (fieldErrs.non_field_errors) {
          setServerError(fieldErrs.non_field_errors);
          if (fieldErrs.non_field_errors.includes('closed') || fieldErrs.non_field_errors.includes('مغلق')) {
            setFormState(FORM_STATES.CLOSED);
            return;
          }
        }
        setErrors(fieldErrs);
        setFormState(FORM_STATES.VALIDATION_ERROR);
      } else {
        setServerError(isAr
          ? 'تعذر إرسال التسجيل. يرجى المحاولة مرة أخرى أو استخدام نموذج Google.'
          : 'Failed to submit registration. Please try again or use the Google Form.');
        setFormState(FORM_STATES.SERVER_ERROR);
      }
    }
  };

  const handleReset = () => {
    setFormData({
      full_name: '', email: '', phone: '',
      college_or_school: '', academic_year: '',
      university: '', university_other: '',
      education_status: '', education_status_other: '',
      notes: '', privacyConsent: false, website_field: '',
    });
    setErrors({});
    setServerError('');
    setFormState(FORM_STATES.IDLE);
  };

  // Don't render if form is hidden by CMS
  if (!showForm) return null;

  // Registration closed state
  if (!registrationAvailable || formState === FORM_STATES.CLOSED) {
    return (
      <section id="course-registration-form" className="course-registration" dir={dir}>
        <div className="course-registration__container">
          <h2 className="course-registration__title">{formTitle}</h2>
          <p className="course-registration__closed-message">{closedMessage}</p>
        </div>
      </section>
    );
  }

  // Success state
  if (formState === FORM_STATES.SUCCESS) {
    return (
      <section id="course-registration-form" className="course-registration" dir={dir}>
        <div className="course-registration__container">
          <div className="course-registration__success">
            <div className="course-registration__success-icon" aria-hidden="true">✓</div>
            <h2 className="course-registration__title">
              {isAr ? 'تم استلام التسجيل' : 'Registration Received'}
            </h2>
            <p className="course-registration__success-message">
              {serverError || successMessage}
            </p>
            <button className="course-registration__reset-btn" onClick={handleReset}>
              {isAr ? 'تسجيل جديد' : 'New Registration'}
            </button>
          </div>
        </div>
      </section>
    );
  }

  const isSubmitting = formState === FORM_STATES.SUBMITTING;

  return (
    <section id="course-registration-form" className="course-registration" dir={dir}>
      <div className="course-registration__container">
        <h2 className="course-registration__title">{formTitle}</h2>
        {formDescription && (
          <p className="course-registration__description">{formDescription}</p>
        )}

        <form
          className="course-registration__form"
          onSubmit={handleSubmit}
          noValidate
          aria-label={formTitle}
        >
          {/* Honeypot field — hidden from users, visible to bots */}
          <div className="course-registration__honeypot" aria-hidden="true" style={{ position: 'absolute', left: '-9999px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden' }}>
            <label>
              Website
              <input
                type="text"
                name="website_field"
                value={formData.website_field}
                onChange={(e) => handleChange('website_field', e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </label>
          </div>

          <div className="course-registration__field">
            <label htmlFor="reg-full-name" className="course-registration__label">
              {isAr ? 'الاسم الكامل' : 'Full Name'} <span className="course-registration__required">*</span>
            </label>
            <input
              id="reg-full-name"
              type="text"
              className={`course-registration__input ${errors.full_name ? 'course-registration__input--error' : ''}`}
              value={formData.full_name}
              onChange={(e) => handleChange('full_name', e.target.value)}
              disabled={isSubmitting}
              required
              maxLength={255}
              autoComplete="name"
            />
            {errors.full_name && (
              <span className="course-registration__error">{errors.full_name}</span>
            )}
          </div>

          <div className="course-registration__field-row">
            <div className="course-registration__field">
              <label htmlFor="reg-email" className="course-registration__label">
                {isAr ? 'البريد الإلكتروني' : 'Email'} <span className="course-registration__required">*</span>
              </label>
              <input
                id="reg-email"
                type="email"
                className={`course-registration__input ${errors.email ? 'course-registration__input--error' : ''}`}
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled={isSubmitting}
                required
                maxLength={254}
                autoComplete="email"
                dir="ltr"
              />
              {errors.email && (
                <span className="course-registration__error">{errors.email}</span>
              )}
            </div>

            <div className="course-registration__field">
              <label htmlFor="reg-phone" className="course-registration__label">
                {isAr ? 'رقم الهاتف' : 'Phone Number'} <span className="course-registration__required">*</span>
              </label>
              <input
                id="reg-phone"
                type="tel"
                className={`course-registration__input ${errors.phone ? 'course-registration__input--error' : ''}`}
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                disabled={isSubmitting}
                required
                maxLength={40}
                autoComplete="tel"
                dir="ltr"
              />
              {errors.phone && (
                <span className="course-registration__error">{errors.phone}</span>
              )}
            </div>
          </div>

          <div className="course-registration__field-row">
            <div className="course-registration__field">
              <label htmlFor="reg-university" className="course-registration__label">
                {isAr ? 'الجامعة / الجهة التعليمية' : 'University / Institution'}
              </label>
              <SearchableSelect
                id="reg-university"
                options={universityOptions}
                value={formData.university}
                onChange={(val) => handleChange('university', val)}
                placeholder={isAr ? 'ابحث عن الجامعة...' : 'Search university...'}
                disabled={isSubmitting}
                grouped
                groupLabels={isAr
                  ? Object.fromEntries(UNIVERSITY_CATEGORIES.map((c) => [c.value, c.label_ar]))
                  : Object.fromEntries(UNIVERSITY_CATEGORIES.map((c) => [c.value, c.label_en]))
                }
                error={!!errors.university}
              />
              {errors.university && (
                <span className="course-registration__error">{errors.university}</span>
              )}
            </div>

            <div className="course-registration__field">
              <label htmlFor="reg-status" className="course-registration__label">
                {isAr ? 'الحالة الدراسية' : 'Study Status'}
              </label>
              <select
                id="reg-status"
                className={`course-registration__input course-registration__select ${errors.education_status ? 'course-registration__input--error' : ''}`}
                value={formData.education_status}
                onChange={(e) => handleChange('education_status', e.target.value)}
                disabled={isSubmitting}
              >
                <option value="">{isAr ? 'اختر الحالة الدراسية' : 'Select study status'}</option>
                {EDUCATION_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {isAr ? opt.label_ar : opt.label_en}
                  </option>
                ))}
              </select>
              {errors.education_status && (
                <span className="course-registration__error">{errors.education_status}</span>
              )}
            </div>
          </div>

          {/* Conditional "Other" university text input */}
          {formData.university === 'other' && (
            <div className="course-registration__field">
              <label htmlFor="reg-university-other" className="course-registration__label">
                {isAr ? 'اكتب اسم الجامعة أو الجهة التعليمية' : 'Enter university or educational institution'}
                <span className="course-registration__required"> *</span>
              </label>
              <input
                id="reg-university-other"
                type="text"
                className={`course-registration__input ${errors.university_other ? 'course-registration__input--error' : ''}`}
                value={formData.university_other}
                onChange={(e) => handleChange('university_other', e.target.value)}
                disabled={isSubmitting}
                maxLength={255}
                required
              />
              {errors.university_other && (
                <span className="course-registration__error">{errors.university_other}</span>
              )}
            </div>
          )}

          {/* Conditional "Other" education status text input */}
          {formData.education_status === 'other' && (
            <div className="course-registration__field">
              <label htmlFor="reg-status-other" className="course-registration__label">
                {isAr ? 'وضح حالتك الدراسية' : 'Specify your education status'}
                <span className="course-registration__required"> *</span>
              </label>
              <input
                id="reg-status-other"
                type="text"
                className={`course-registration__input ${errors.education_status_other ? 'course-registration__input--error' : ''}`}
                value={formData.education_status_other}
                onChange={(e) => handleChange('education_status_other', e.target.value)}
                disabled={isSubmitting}
                maxLength={255}
                required
              />
              {errors.education_status_other && (
                <span className="course-registration__error">{errors.education_status_other}</span>
              )}
            </div>
          )}

          <div className="course-registration__field">
            <label htmlFor="reg-notes" className="course-registration__label">
              {isAr ? 'ملاحظات' : 'Notes'}
            </label>
            <textarea
              id="reg-notes"
              className="course-registration__textarea"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              disabled={isSubmitting}
              rows={3}
              maxLength={2000}
            />
          </div>

          <div className="course-registration__consent">
            <label className="course-registration__checkbox-label">
              <input
                type="checkbox"
                checked={formData.privacyConsent}
                onChange={(e) => handleChange('privacyConsent', e.target.checked)}
                disabled={isSubmitting}
                className={errors.privacyConsent ? 'course-registration__input--error' : ''}
              />
              <span>
                {isAr
                  ? 'أوافق على سياسة الخصوصية ومعالجة بياناتي لأغراض التسجيل.'
                  : 'I agree to the privacy policy and consent to processing my data for registration.'}
              </span>
            </label>
            {errors.privacyConsent && (
              <span className="course-registration__error">{errors.privacyConsent}</span>
            )}
          </div>

          {formState === FORM_STATES.SERVER_ERROR && serverError && (
            <div className="course-registration__server-error" role="alert">
              <p>{serverError}</p>
              <a
                href={fallbackUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="course-registration__fallback-link"
              >
                {isAr ? 'استخدام نموذج Google بدلاً من ذلك' : 'Use Google Form instead'}
              </a>
            </div>
          )}

          <div className="course-registration__actions">
            <button
              type="submit"
              className="course-registration__submit-btn"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting
                ? (isAr ? 'جاري الإرسال...' : 'Submitting...')
                : buttonText}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
