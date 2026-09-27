import { useState, useEffect } from 'react';
import { useI18n } from '../../i18n/I18nProvider.jsx';
import { useHomepageConfig } from '../../hooks/useHomepageConfig';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import getBilingual from '../../utils/getBilingual';
import { useInquiryTypes } from '../../hooks/useInquiryTypes';
import { submitContactForm } from '../../services/contactApi';
import SectionHeading from '../ui/SectionHeading';

const FALLBACK_INQUIRY_TYPES = [
  {
    slug: 'website-development',
    name: { en: 'Website Development', ar: 'تطوير مواقع الويب' },
    order: 0,
  },
  {
    slug: 'mobile-applications',
    name: { en: 'Mobile Application', ar: 'تطبيق جوال' },
    order: 1,
  },
  {
    slug: 'erp-business-system',
    name: { en: 'ERP / Business System', ar: 'نظام تخطيط الموارد / نظام أعمال' },
    order: 2,
  },
  {
    slug: 'consultation',
    name: { en: 'Consultation', ar: 'استشارة' },
    order: 3,
  },
  {
    slug: 'training',
    name: { en: 'Training', ar: 'تدريب' },
    order: 4,
  },
  {
    slug: 'technical-support',
    name: { en: 'Technical Support', ar: 'الدعم الفني' },
    order: 5,
  },
  {
    slug: 'other',
    name: { en: 'Other', ar: 'أخرى' },
    order: 6,
  },
];

const initialFormState = {
  inquiryType: '',
  name: '',
  email: '',
  phone: '',
  company: '',
  message: '',
  privacyConsent: false,
  website: '',
};

function ContactSection() {
  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [relatedService, setRelatedService] = useState(null);
  const { t, lang } = useI18n();
  const { inquiryTypes: cmsInquiryTypes, loading: typesLoading } = useInquiryTypes();
  const { config } = useHomepageConfig();
  const { settings } = useSiteSettings();

  // Read ?service=<slug> from the URL hash/query to preselect a service.
  // This enables service detail pages to hand off to Contact with attribution.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash || '';
    // The contact CTA uses /#contact?service=<slug> — parse the query portion.
    const queryStart = hash.indexOf('?');
    if (queryStart === -1) return;
    const params = new URLSearchParams(hash.slice(queryStart + 1));
    const serviceSlug = params.get('service');
    if (serviceSlug) {
      setRelatedService(serviceSlug);
    }
  }, []);

  const inquiryTypes = cmsInquiryTypes || FALLBACK_INQUIRY_TYPES;

  const contactHeading = config?.headings?.contact;
  const heading = getBilingual(
    { en: contactHeading?.heading_en, ar: contactHeading?.heading_ar },
    lang
  ) || t('contact.headline');

  const description = getBilingual(
    { en: contactHeading?.description_en, ar: contactHeading?.description_ar },
    lang
  ) || t('contact.description');

  const conversionStatement = lang === 'ar'
    ? 'سواء كنت تبدأ من الصفر أو تطور نظاماً قائماً، نحن نساعد المؤسسات على البناء بثقة — برمجيات، ذكاء اصطناعي، أتمتة، وأنظمة تخطيط موارد.'
    : 'Whether you are starting from scratch or evolving an existing system, we help organizations build with confidence — software, AI, automation, and ERP systems.';

  // Contact info — CMS SiteSettings is authoritative; existing hardcoded
  // values are retained only as safe fallbacks when CMS fields are empty.
  // This avoids breaking the public page during CMS API failure or before
  // staff populate the CMS. Once CMS is populated, fallbacks are unused.
  const cmsEmail = settings?.contact?.contact_email || '';
  const cmsPhone = settings?.contact?.phone || '';
  const cmsWhatsapp = settings?.contact?.whatsapp_url || '';
  const cmsAddress = settings?.location?.address || '';
  const cmsMapsUrl = settings?.location?.google_maps_url || '';
  const cmsWorkingHours = settings?.location?.working_hours || '';

  // Derive tel: href safely from CMS phone (strip non-numeric except leading +).
  const telHref = cmsPhone
    ? `tel:${cmsPhone.replace(/[^\d+]/g, '')}`
    : '';

  const contactInfo = lang === 'ar'
    ? [
        cmsEmail
          ? { label: 'البريد الإلكتروني', value: cmsEmail, href: `mailto:${cmsEmail}` }
          : { label: 'البريد الإلكتروني', value: 'sidrahsoft@gmail.com', href: 'mailto:sidrahsoft@gmail.com' },
        cmsPhone
          ? { label: 'الهاتف', value: cmsPhone, href: telHref }
          : { label: 'الهاتف', value: '01027285487', href: 'tel:01027285487' },
        cmsWhatsapp
          ? { label: 'واتساب', value: cmsWhatsapp, href: cmsWhatsapp }
          : { label: 'واتساب', value: '01027285487', href: 'https://wa.me/201027285487' },
        cmsAddress
          ? { label: 'الموقع', value: cmsAddress, href: cmsMapsUrl || null }
          : { label: 'الموقع', value: 'جمهورية مصر العربية – محافظة البحيرة', href: null },
        ...(cmsWorkingHours ? [{ label: 'ساعات العمل', value: cmsWorkingHours, href: null }] : []),
      ]
    : [
        cmsEmail
          ? { label: 'Email', value: cmsEmail, href: `mailto:${cmsEmail}` }
          : { label: 'Email', value: 'sidrahsoft@gmail.com', href: 'mailto:sidrahsoft@gmail.com' },
        cmsPhone
          ? { label: 'Phone', value: cmsPhone, href: telHref }
          : { label: 'Phone', value: '01027285487', href: 'tel:01027285487' },
        cmsWhatsapp
          ? { label: 'WhatsApp', value: cmsWhatsapp, href: cmsWhatsapp }
          : { label: 'WhatsApp', value: '01027285487', href: 'https://wa.me/201027285487' },
        cmsAddress
          ? { label: 'Location', value: cmsAddress, href: cmsMapsUrl || null }
          : { label: 'Location', value: 'Beheira Governorate, Egypt', href: null },
        ...(cmsWorkingHours ? [{ label: 'Working Hours', value: cmsWorkingHours, href: null }] : []),
      ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    const backendKeyMap = {
      name: 'full_name',
      inquiryType: 'inquiry_type',
      privacyConsent: 'privacy_consent',
    };
    const keysToClear = new Set([name, backendKeyMap[name]].filter(Boolean));
    if (Object.keys(fieldErrors).some((key) => keysToClear.has(key))) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        keysToClear.forEach((key) => delete next[key]);
        return next;
      });
    }
  };

  const buildPayload = () => ({
    inquiry_type: formData.inquiryType,
    full_name: formData.name,
    email: formData.email,
    phone: formData.phone,
    company: formData.company,
    message: formData.message,
    privacy_consent: formData.privacyConsent,
    related_service: relatedService || undefined,
    source_page: typeof window !== 'undefined'
      ? window.location.pathname + window.location.search
      : '',
    language: lang,
    website: formData.website,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError(null);
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      await submitContactForm(buildPayload());
      setIsSubmitted(true);
      setFormData(initialFormState);
    } catch (err) {
      if (err.status === 429) {
        setError(t('contact.rateLimitError'));
      } else if (err.status === 400 && err.data) {
        setFieldErrors(err.data);
        setError(t('contact.validationError'));
      } else {
        setError(t('contact.errorText'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInquiryOptions = () => {
    if (typesLoading) {
      return (
        <option value="" disabled>
          {t('contact.loading')}
        </option>
      );
    }

    return inquiryTypes.map((item) => {
      const name = item.name;
      const label = lang === 'ar'
        ? (name?.ar || name?.en || (typeof name === 'string' ? name : ''))
        : getBilingual(name, lang);
      return (
        <option key={item.slug} value={item.slug}>
          {label}
        </option>
      );
    });
  };

  return (
    <section id="contact" className="contact-section" aria-labelledby="contact-heading">
      <div className="contact-content">
        <SectionHeading
          id="contact-heading"
          index="11"
          eyebrow={lang === 'ar' ? 'تواصل معنا' : 'Get In Touch'}
          title={heading}
          description={description}
          className="contact-heading-block motion-clip-reveal is-visible"
        />

        <div className="contact-showcase">
          <div className="contact-conversion">
            <p className="contact-conversion__statement motion-fade-up is-visible">
              {conversionStatement}
            </p>

            <div className="contact-info">
              {contactInfo.map((info, idx) => (
                <div
                  key={info.label}
                  className={`contact-info__card motion-fade-up is-visible stagger-${Math.min(idx + 1, 6)}`}
                >
                  <span className="contact-info__label">{info.label}</span>
                  {info.href ? (
                    <a
                      href={info.href}
                      className="contact-info__value"
                      {...(info.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    >
                      {info.value}
                    </a>
                  ) : (
                    <span className="contact-info__value">{info.value}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="contact-form-wrapper motion-scale-in is-visible">
            {isSubmitted ? (
              <div className="contact-success" role="status" aria-live="polite">
                <h3 className="contact-success__title">{t('contact.successTitle')}</h3>
                <p className="contact-success__text">{t('contact.successText')}</p>
                <button
                  type="button"
                  className="contact-button contact-button--secondary"
                  onClick={() => setIsSubmitted(false)}
                >
                  {t('contact.sendAgain')}
                </button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit} noValidate>
                {error && (
                  <div className="contact-form__error" role="alert">
                    <strong>{t('contact.errorTitle')}</strong>
                    <p>{error}</p>
                  </div>
                )}

                <div className="contact-form__honeypot" aria-hidden="true">
                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <div className="contact-form__field">
                  <label htmlFor="inquiryType">{t('contact.inquiryType')}</label>
                  <select
                    id="inquiryType"
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>
                      {t('contact.inquiryPlaceholder')}
                    </option>
                    {renderInquiryOptions()}
                  </select>
                  {fieldErrors.inquiry_type && (
                    <span className="contact-form__field-error">{fieldErrors.inquiry_type[0]}</span>
                  )}
                </div>

                <div className="contact-form__row">
                  <div className="contact-form__field">
                    <label htmlFor="name">{t('contact.name')}</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={t('contact.namePlaceholder')}
                      required
                    />
                    {fieldErrors.full_name && (
                      <span className="contact-form__field-error">{fieldErrors.full_name[0]}</span>
                    )}
                  </div>
                  <div className="contact-form__field">
                    <label htmlFor="email">{t('contact.email')}</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={t('contact.emailPlaceholder')}
                      required
                    />
                    {fieldErrors.email && (
                      <span className="contact-form__field-error">{fieldErrors.email[0]}</span>
                    )}
                  </div>
                </div>

                <div className="contact-form__row">
                  <div className="contact-form__field">
                    <label htmlFor="phone">
                      {t('contact.phone')} <span className="contact-form__optional">{t('contact.optional')}</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder={t('contact.phonePlaceholder')}
                    />
                    {fieldErrors.phone && (
                      <span className="contact-form__field-error">{fieldErrors.phone[0]}</span>
                    )}
                  </div>
                  <div className="contact-form__field">
                    <label htmlFor="company">
                      {t('contact.company')} <span className="contact-form__optional">{t('contact.optional')}</span>
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder={t('contact.companyPlaceholder')}
                    />
                    {fieldErrors.company && (
                      <span className="contact-form__field-error">{fieldErrors.company[0]}</span>
                    )}
                  </div>
                </div>

                <div className="contact-form__field">
                  <label htmlFor="message">{t('contact.message')}</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={t('contact.messagePlaceholder')}
                    rows={5}
                    required
                  />
                  {fieldErrors.message && (
                    <span className="contact-form__field-error">{fieldErrors.message[0]}</span>
                  )}
                </div>

                <div className="contact-form__field contact-form__field--checkbox">
                  <label htmlFor="privacyConsent">
                    <input
                      type="checkbox"
                      id="privacyConsent"
                      name="privacyConsent"
                      checked={formData.privacyConsent}
                      onChange={handleChange}
                      required
                    />
                    {t('contact.privacyConsent')}
                  </label>
                  {fieldErrors.privacy_consent && (
                    <span className="contact-form__field-error">{fieldErrors.privacy_consent[0]}</span>
                  )}
                </div>

                <button
                  type="submit"
                  className="contact-submit-button"
                  disabled={isSubmitting}
                >
                  <span>{isSubmitting ? t('contact.submitting') : t('contact.submit')}</span>
                  <span className="contact-submit-button__arrow" aria-hidden="true">→</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;
