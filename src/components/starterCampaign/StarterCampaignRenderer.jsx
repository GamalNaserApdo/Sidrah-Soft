/**
 * StarterCampaignRenderer — THE shared renderer for the Starter campaign
 * landing page.
 *
 * Used by BOTH:
 *   - the public page  (src/pages/StarterCampaignPage.jsx — published payload)
 *   - the CMS preview  (same public route with ?preview=<token> — draft payload)
 *
 * Sections come from the Page Builder (validated server-side). The
 * registration_form section is a protected system block: its copy comes
 * from StarterCampaignConfig and its internals (fields, honeypot, consent,
 * validation, submit contract, dedup handling, analytics, UTM) are fixed —
 * only position and visibility are builder-controlled.
 *
 * isPreview: renders the draft but keeps submission inert — no POST,
 * no registration record, no email, no conversion events.
 */
import { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nProvider';
import { submitRegistration, extractUTMFromURL } from '../../services/trainingApi';
import { useAnalyticsConsent } from '../../contexts/AnalyticsContext';
import { trackRegistrationSuccess } from '../../utils/analyticsEvents';
import { formatPrice } from '../../utils/formatPrice';
import '../../pages/StarterCampaignPage.css';

const FORM_STATES = {
  IDLE: 'idle',
  VALIDATING: 'validating',
  SUBMITTING: 'submitting',
  SUCCESS: 'success',
  VALIDATION_ERROR: 'validation_error',
  SERVER_ERROR: 'server_error',
};

export default function StarterCampaignRenderer({
  sections,
  courses,
  coursesLoading,
  coursesError,
  onRetryCourses,
  formConfig,
  isPreview = false,
}) {
  const { lang, dir } = useI18n();
  const isAr = lang === 'ar';
  const { isGranted: isConsentGranted, showBanner: isConsentBannerVisible } = useAnalyticsConsent();
  const conversionFiredRef = useRef(false);
  const heroTitleRef = useRef(null);
  const registerRef = useRef(null);
  const registerHeadingRef = useRef(null);

  const [isHeroIntroVisible, setIsHeroIntroVisible] = useState(true);
  const [hasReachedRegister, setHasReachedRegister] = useState(false);
  const [formState, setFormState] = useState(FORM_STATES.IDLE);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    selectedCourse: '',
    privacyConsent: false,
    website_field: '', // honeypot
  });

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;

    const heroObserver = new IntersectionObserver(
      ([entry]) => setIsHeroIntroVisible(entry.isIntersecting),
      { threshold: 0.1 },
    );
    const registerObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setHasReachedRegister(true);
      },
      { threshold: 0.1, rootMargin: '0px 0px -60% 0px' },
    );

    if (heroTitleRef.current) heroObserver.observe(heroTitleRef.current);
    if (registerHeadingRef.current) registerObserver.observe(registerHeadingRef.current);

    return () => {
      heroObserver.disconnect();
      registerObserver.disconnect();
    };
  }, []);

  const isSubmitting = formState === FORM_STATES.SUBMITTING;
  const isSuccess = formState === FORM_STATES.SUCCESS;

  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const scrollToForm = useCallback((e) => {
    if (e) e.preventDefault();
    if (registerRef.current) {
      registerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        const firstInput = registerRef.current.querySelector('#full_name');
        if (firstInput && !isSuccess) firstInput.focus({ preventScroll: true });
      }, 600);
    }
  }, [isSuccess]);

  const validate = useCallback(() => {
    const errs = {};
    if (!formData.full_name.trim()) {
      errs.full_name = isAr ? 'الاسم مطلوب' : 'Full name is required';
    } else if (formData.full_name.trim().length < 3) {
      errs.full_name = isAr ? 'الاسم قصير جدًا' : 'Name too short';
    }
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = isAr ? 'بريد إلكتروني غير صالح' : 'Invalid email format';
    }
    if (!formData.phone.trim()) {
      errs.phone = isAr ? 'رقم الهاتف مطلوب' : 'Phone number is required';
    } else if (formData.phone.replace(/\D/g, '').length < 7) {
      errs.phone = isAr ? 'رقم هاتف غير صالح' : 'Invalid phone number';
    }
    if (!formData.selectedCourse) {
      errs.selectedCourse = isAr ? 'اختر الكورس' : 'Please select a course';
    }
    if (!formData.privacyConsent) {
      errs.privacyConsent = isAr ? 'يجب الموافقة على سياسة الخصوصية' : 'Privacy policy consent is required';
    }
    return errs;
  }, [formData, isAr]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Preview mode: submission is inert — no POST, no record, no analytics.
    if (isPreview) {
      setFormState(FORM_STATES.SUBMITTING);
      setTimeout(() => setFormState(FORM_STATES.IDLE), 400);
      return;
    }
    // Honeypot — if filled, silently "succeed" (bot trap)
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
      const response = await submitRegistration(formData.selectedCourse, {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        preferred_language: lang,
        privacyConsent: formData.privacyConsent,
        website_field: formData.website_field,
      }, utm);

      if (response.is_new === false) {
        setServerError(isAr
          ? 'لقد سجلت بالفعل في هذا الكورس. سنتواصل معك قريبًا.'
          : 'You have already registered for this course. We will contact you soon.');
        setFormState(FORM_STATES.SUCCESS);
      } else {
        if (!conversionFiredRef.current) {
          conversionFiredRef.current = true;
          trackRegistrationSuccess({
            programSlug: formData.selectedCourse,
            productType: 'starter',
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
        const fieldErrs = {};
        for (const [key, val] of Object.entries(err.data)) {
          if (Array.isArray(val)) {
            fieldErrs[key] = val[0];
          } else if (typeof val === 'string') {
            fieldErrs[key] = val;
          }
        }
        if (fieldErrs.non_field_errors) {
          setServerError(fieldErrs.non_field_errors);
        }
        setErrors(fieldErrs);
        setFormState(FORM_STATES.VALIDATION_ERROR);
      } else {
        setServerError(isAr
          ? 'تعذر إرسال التسجيل. يرجى المحاولة مرة أخرى.'
          : 'Failed to submit registration. Please try again.');
        setFormState(FORM_STATES.SERVER_ERROR);
      }
    }
  };

  // Shared campaign price derived from the loaded Starter programs.
  // Only displayed when every loaded program agrees on one valid
  // price/currency — mixed or missing prices get neutral copy so the
  // hero can never contradict ProgramLanding.current_price.
  const parsedPrices = (courses || []).map((c) => parseFloat(c.current_price));
  const sharedPrice =
    courses && courses.length > 0 &&
    parsedPrices.every((p) => Number.isFinite(p)) &&
    new Set(parsedPrices).size === 1 &&
    new Set(courses.map((c) => c.currency || 'EGP')).size === 1
      ? parsedPrices[0]
      : null;

  const formCopyProps = {
    isAr,
    formConfig,
    courses,
    coursesLoading,
    coursesError,
    onRetryCourses,
    formData,
    errors,
    serverError,
    formState,
    isSubmitting,
    isSuccess,
    isPreview,
    handleChange,
    handleSubmit,
    registerRef,
    registerHeadingRef,
    scrollToForm,
  };

  const enabledSections = (sections || []).filter((s) => s && s.enabled !== false);

  return (
    <div className="starter-campaign-page" dir={dir}>
      <main className="starter-campaign-main">
        {enabledSections.map((section) => (
          <SectionRenderer
            key={section.id}
            section={section}
            isAr={isAr}
            lang={lang}
            sharedPrice={sharedPrice}
            scrollToForm={scrollToForm}
            heroTitleRef={heroTitleRef}
            formCopyProps={formCopyProps}
          />
        ))}
      </main>

      {!isSuccess && !isHeroIntroVisible && !hasReachedRegister && !isConsentBannerVisible && (
        <a href="#register" className="starter-campaign-floating-cta" onClick={scrollToForm}>
          {isAr ? 'سجّل الآن' : 'Register Now'}
        </a>
      )}
    </div>
  );
}

function pick(props, key, isAr) {
  const localized = props?.[`${key}_${isAr ? 'ar' : 'en'}`];
  const fallback = props?.[`${key}_${isAr ? 'en' : 'ar'}`];
  return localized || fallback || '';
}

function SectionRenderer({ section, isAr, lang, sharedPrice, scrollToForm, heroTitleRef, formCopyProps }) {
  switch (section.type) {
    case 'hero':
      return <HeroSection props={section.props} isAr={isAr} lang={lang} sharedPrice={sharedPrice} scrollToForm={scrollToForm} heroTitleRef={heroTitleRef} />;
    case 'rich_text':
      return <RichTextSection props={section.props} isAr={isAr} />;
    case 'faq':
      return <FAQSection props={section.props} isAr={isAr} />;
    case 'cta_banner':
      return <CTABannerSection props={section.props} isAr={isAr} scrollToForm={scrollToForm} />;
    case 'registration_form':
      return <RegistrationFormSection {...formCopyProps} />;
    default:
      return null;
  }
}

function HeroSection({ props = {}, isAr, lang, sharedPrice, scrollToForm, heroTitleRef }) {
  const badge = pick(props, 'badge', isAr);
  const title = pick(props, 'title', isAr);
  const tagline = pick(props, 'tagline', isAr);
  const brand = pick(props, 'brand', isAr);
  const cta = pick(props, 'cta', isAr);
  const priceDisplay = props.price_display || 'shared';

  let priceHighlight = null;
  if (priceDisplay === 'shared') {
    priceHighlight = sharedPrice !== null
      ? (isAr
          ? `${formatPrice(sharedPrice, lang)} فقط للكورس بالكامل`
          : `Only ${formatPrice(sharedPrice, lang)} for the Full Course`)
      : (isAr
          ? 'سعر كل كورس موضّح في قائمة الاختيار أدناه'
          : 'Each course price is shown in the selection below');
  } else if (priceDisplay === 'per_course') {
    priceHighlight = isAr
      ? 'سعر كل كورس موضّح في قائمة الاختيار أدناه'
      : 'Each course price is shown in the selection below';
  }

  return (
    <section className="starter-campaign-hero">
      <div className="starter-campaign-hero__container">
        {badge && <span className="starter-campaign-hero__badge">{badge}</span>}
        <h1 ref={heroTitleRef} className="starter-campaign-hero__title">{title}</h1>
        {tagline && <p className="starter-campaign-hero__tagline">{tagline}</p>}

        {priceHighlight && (
          <div className="starter-campaign-price">
            <h2 className="starter-campaign-price__amount">{priceHighlight}</h2>
            <p className="starter-campaign-price__note">
              {isAr ? 'السعر للكورس كاملًا — ليس للجلسة' : 'Price is for the full course — not per session'}
            </p>
          </div>
        )}

        {cta && (
          <a href="#register" className="starter-campaign-cta" onClick={scrollToForm}>
            {cta}
          </a>
        )}

        {brand && <p className="starter-campaign-brand">{brand}</p>}
      </div>
    </section>
  );
}

function RichTextSection({ props = {}, isAr }) {
  const heading = pick(props, 'heading', isAr);
  const body = pick(props, 'body', isAr);
  if (!heading && !body) return null;
  return (
    <section className="starter-campaign-richtext">
      <div className="starter-campaign-richtext__container">
        {heading && <h2 className="starter-campaign-richtext__heading">{heading}</h2>}
        {body && (
          <div className="starter-campaign-richtext__body">
            {body.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function FAQSection({ props = {}, isAr }) {
  const heading = pick(props, 'heading', isAr);
  const items = Array.isArray(props.items) ? props.items : [];
  const visibleItems = items.filter((item) => pick(item, 'question', isAr));
  if (!heading && visibleItems.length === 0) return null;
  return (
    <section className="starter-campaign-faq">
      <div className="starter-campaign-faq__container">
        {heading && <h2 className="starter-campaign-faq__heading">{heading}</h2>}
        <div className="starter-campaign-faq__list">
          {visibleItems.map((item, i) => (
            <details key={i} className="starter-campaign-faq__item">
              <summary className="starter-campaign-faq__question">
                {pick(item, 'question', isAr)}
              </summary>
              <p className="starter-campaign-faq__answer">{pick(item, 'answer', isAr)}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTABannerSection({ props = {}, isAr, scrollToForm }) {
  const heading = pick(props, 'heading', isAr);
  const description = pick(props, 'description', isAr);
  const button = pick(props, 'button', isAr);
  const target = (props.target || '').trim() || '#register';
  if (!heading && !description && !button) return null;

  const isAnchor = target.startsWith('#');
  return (
    <section className="starter-campaign-ctabanner">
      <div className="starter-campaign-ctabanner__container">
        {heading && <h2 className="starter-campaign-ctabanner__heading">{heading}</h2>}
        {description && <p className="starter-campaign-ctabanner__description">{description}</p>}
        {button && (
          isAnchor ? (
            <a
              href={target}
              className="starter-campaign-cta"
              onClick={target === '#register' ? scrollToForm : undefined}
            >
              {button}
            </a>
          ) : (
            <Link to={target} className="starter-campaign-cta">{button}</Link>
          )
        )}
      </div>
    </section>
  );
}

function RegistrationFormSection({
  isAr,
  formConfig,
  courses,
  coursesLoading,
  coursesError,
  onRetryCourses,
  formData,
  errors,
  serverError,
  formState,
  isSubmitting,
  isSuccess,
  isPreview,
  handleChange,
  handleSubmit,
  registerRef,
  registerHeadingRef,
}) {
  const { lang } = useI18n();

  // CMS-controlled shared form copy — falls back to hardcoded defaults.
  const formTitle = isAr
    ? (formConfig?.form_title_ar || 'سجّل في كورس Starter')
    : (formConfig?.form_title_en || 'Register for a Starter Course');
  const formDescription = isAr
    ? (formConfig?.form_description_ar || 'اختر كورسك واملأ البيانات. سنتواصل معك لإكمال التسجيل.')
    : (formConfig?.form_description_en || 'Choose your course and fill in your details. We will contact you to complete registration.');
  const ctaLabel = isAr ? 'سجّل الآن' : 'Register Now';
  const submitButtonText = isAr
    ? (formConfig?.form_button_ar || ctaLabel)
    : (formConfig?.form_button_en || ctaLabel);
  const successMessage = isAr
    ? (formConfig?.success_message_ar || 'شكراً لتسجيلك! سيتواصل معك فريق Sidrah لإكمال عملية التسجيل.')
    : (formConfig?.success_message_en || 'Thank you for registering! The Sidrah team will contact you to complete the registration process.');
  const successNote = isAr
    ? (formConfig?.success_note_ar || 'هذا تأكيد استلام التسجيل — وليس تأكيد قبول أو دفع أو مقعد مؤكد.')
    : (formConfig?.success_note_en || 'This is a registration receipt confirmation — not an acceptance, payment, or seat confirmation.');
  const closedMessage = isAr
    ? (formConfig?.closed_message_ar || 'التسجيل في هذه الدورة مغلق حاليًا.')
    : (formConfig?.closed_message_en || 'Registration for this course is currently closed.');
  const showForm = formConfig?.show_registration_form ?? true;

  return (
    <section id="register" className="starter-campaign-register" ref={registerRef}>
      <div className="starter-campaign-register__container">
        {isSuccess ? (
          <div className="starter-campaign-success">
            <div className="starter-campaign-success__icon" aria-hidden="true">✓</div>
            <h2 className="starter-campaign-success__title">
              {isAr ? 'تم استلام تسجيلك بنجاح' : 'Registration Received Successfully'}
            </h2>
            <p className="starter-campaign-success__message">
              {serverError || successMessage}
            </p>
            <p className="starter-campaign-success__note">{successNote}</p>
            <Link to="/training/starter" className="starter-campaign-success__link">
              {isAr ? 'العودة للكورسات' : 'Back to Courses'}
            </Link>
          </div>
        ) : !showForm ? (
          <div className="starter-campaign-success">
            <p className="starter-campaign-success__message">{closedMessage}</p>
          </div>
        ) : (
          <>
            <h2 ref={registerHeadingRef} className="starter-campaign-register__title">{formTitle}</h2>
            <p className="starter-campaign-register__subtitle">
              {formDescription}
            </p>

            {serverError && formState !== FORM_STATES.VALIDATION_ERROR && (
              <div className="starter-campaign-form__server-error" role="alert">
                {serverError}
              </div>
            )}

            <form className="starter-campaign-form" onSubmit={handleSubmit} noValidate>
              {/* Honeypot */}
              <input
                type="text"
                name="website_field"
                value={formData.website_field}
                onChange={(e) => handleChange('website_field', e.target.value)}
                className="starter-campaign-honeypot"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />

              {/* Full Name */}
              <div className="starter-campaign-field">
                <label htmlFor="full_name" className="starter-campaign-field__label">
                  {isAr ? 'الاسم بالكامل' : 'Full Name'} <span className="starter-campaign-field__required">*</span>
                </label>
                <input
                  id="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  className={`starter-campaign-field__input ${errors.full_name ? 'is-error' : ''}`}
                  autoComplete="name"
                  required
                  aria-invalid={!!errors.full_name}
                  aria-describedby={errors.full_name ? 'full_name-error' : undefined}
                />
                {errors.full_name && (
                  <span id="full_name-error" className="starter-campaign-field__error" role="alert">
                    {errors.full_name}
                  </span>
                )}
              </div>

              {/* WhatsApp Number */}
              <div className="starter-campaign-field">
                <label htmlFor="phone" className="starter-campaign-field__label">
                  {isAr ? 'رقم واتساب' : 'WhatsApp Number'} <span className="starter-campaign-field__required">*</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className={`starter-campaign-field__input ${errors.phone ? 'is-error' : ''}`}
                  placeholder={isAr ? '+20 10x xxxx xxxx' : '+20 10x xxxx xxxx'}
                  autoComplete="tel"
                  required
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? 'phone-error' : undefined}
                />
                {errors.phone && (
                  <span id="phone-error" className="starter-campaign-field__error" role="alert">
                    {errors.phone}
                  </span>
                )}
              </div>

              {/* Email */}
              <div className="starter-campaign-field">
                <label htmlFor="email" className="starter-campaign-field__label">
                  {isAr ? 'البريد الإلكتروني (اختياري)' : 'Email Address (Optional)'}
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`starter-campaign-field__input ${errors.email ? 'is-error' : ''}`}
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && (
                  <span id="email-error" className="starter-campaign-field__error" role="alert">
                    {errors.email}
                  </span>
                )}
              </div>

              {/* Course Selection */}
              <div className="starter-campaign-field">
                <label htmlFor="selectedCourse" className="starter-campaign-field__label">
                  {isAr ? 'اختر كورسك' : 'Choose Your Course'} <span className="starter-campaign-field__required">*</span>
                </label>
                {coursesLoading ? (
                  <p className="starter-campaign-field__loading" role="status">
                    {isAr ? 'جاري تحميل الكورسات...' : 'Loading courses...'}
                  </p>
                ) : coursesError || (courses || []).length === 0 ? (
                  <div className="starter-campaign-field__load-error" role="alert">
                    <span>
                      {coursesError
                        ? (isAr ? 'تعذر تحميل الكورسات. حاول مرة أخرى.' : 'Courses could not be loaded. Please try again.')
                        : (isAr ? 'لا توجد كورسات Starter متاحة حاليًا.' : 'No Starter courses are currently available.')}
                    </span>
                    <button type="button" onClick={onRetryCourses} className="starter-campaign-field__retry">
                      {isAr ? 'إعادة المحاولة' : 'Retry'}
                    </button>
                  </div>
                ) : (
                  <select
                    id="selectedCourse"
                    value={formData.selectedCourse}
                    onChange={(e) => handleChange('selectedCourse', e.target.value)}
                    className={`starter-campaign-field__select ${errors.selectedCourse ? 'is-error' : ''}`}
                    required
                    aria-invalid={!!errors.selectedCourse}
                    aria-describedby={errors.selectedCourse ? 'course-error' : undefined}
                  >
                    <option value="">{isAr ? '— اختر —' : '— Select —'}</option>
                    {courses.map((c) => {
                      const title = isAr ? c.title_ar : c.title_en;
                      const price = c.current_price ? formatPrice(parseFloat(c.current_price), lang) : '';
                      return (
                        <option key={c.slug} value={c.slug}>
                          {title}{price ? ` — ${price}` : ''}
                        </option>
                      );
                    })}
                  </select>
                )}
                {errors.selectedCourse && (
                  <span id="course-error" className="starter-campaign-field__error" role="alert">
                    {errors.selectedCourse}
                  </span>
                )}
              </div>

              {/* Privacy Consent */}
              <div className="starter-campaign-field starter-campaign-field--checkbox">
                <label className="starter-campaign-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.privacyConsent}
                    onChange={(e) => handleChange('privacyConsent', e.target.checked)}
                    required
                    aria-invalid={!!errors.privacyConsent}
                  />
                  <span>
                    {isAr
                      ? 'أوافق على سياسة الخصوصية ومعالجة بياناتي لأغراض التسجيل.'
                      : 'I agree to the privacy policy and processing of my data for registration purposes.'}
                  </span>
                </label>
                {errors.privacyConsent && (
                  <span className="starter-campaign-field__error" role="alert">
                    {errors.privacyConsent}
                  </span>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="starter-campaign-submit"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
              >
                {isSubmitting
                  ? (isAr ? 'جاري الإرسال...' : 'Submitting...')
                  : submitButtonText}
              </button>
              {isPreview && (
                <p className="starter-campaign-form__preview-note">
                  {isAr
                    ? 'معاينة — الإرسال معطّل ولن يتم إنشاء أي تسجيل.'
                    : 'Preview mode — submission is disabled and no registration will be created.'}
                </p>
              )}
            </form>
          </>
        )}
      </div>
    </section>
  );
}
