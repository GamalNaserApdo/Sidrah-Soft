/**
 * Starter Form Preview Modal — read-only visual preview of the shared
 * Starter campaign registration form as it will appear on the public page.
 *
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 *  - config: StarterCampaignConfig object (formData from the CMS page)
 *
 * The preview NEVER submits. It is a visual approximation using the
 * configured text and the existing form field structure.
 */

import { useState } from 'react';
import CMSDialog from '../ui/CMSDialog';
import CMSButton from '../ui/CMSButton';
import { useCMSLang } from '../../../contexts/CMSLanguageContext';

export default function StarterFormPreviewModal({ open, onClose, config }) {
  const { t } = useCMSLang();
  const [previewLang, setPreviewLang] = useState('en');
  const isAr = previewLang === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';

  const showForm = config?.show_registration_form ?? true;

  // Resolve text with hardcoded fallbacks matching the public page
  const title = isAr
    ? (config?.form_title_ar || 'سجّل في كورس Starter')
    : (config?.form_title_en || 'Register for a Starter Course');
  const description = isAr
    ? (config?.form_description_ar || 'اختر كورسك واملأ البيانات. سنتواصل معك لإكمال التسجيل.')
    : (config?.form_description_en || 'Choose your course and fill in your details. We will contact you to complete registration.');
  const buttonText = isAr
    ? (config?.form_button_ar || 'سجّل الآن')
    : (config?.form_button_en || 'Register Now');
  const successMessage = isAr
    ? (config?.success_message_ar || 'شكراً لتسجيلك! سيتواصل معك فريق Sidrah لإكمال عملية التسجيل.')
    : (config?.success_message_en || 'Thank you for registering! The Sidrah team will contact you to complete the registration process.');
  const successNote = isAr
    ? (config?.success_note_ar || 'هذا تأكيد استلام التسجيل — وليس تأكيد قبول أو دفع أو مقعد مؤكد.')
    : (config?.success_note_en || 'This is a registration receipt confirmation — not an acceptance, payment, or seat confirmation.');
  const closedMessage = isAr
    ? (config?.closed_message_ar || 'التسجيل في هذه الدورة مغلق حاليًا.')
    : (config?.closed_message_en || 'Registration for this course is currently closed.');

  // Field labels (hardcoded on the public page — shown for visual context)
  const labels = isAr
    ? {
        fullName: 'الاسم بالكامل',
        phone: 'رقم واتساب',
        email: 'البريد الإلكتروني (اختياري)',
        course: 'اختر كورسك',
        consent: 'أوافق على سياسة الخصوصية ومعالجة بياناتي لأغراض التسجيل.',
        selectCourse: '— اختر —',
      }
    : {
        fullName: 'Full Name',
        phone: 'WhatsApp Number',
        email: 'Email Address (Optional)',
        course: 'Choose Your Course',
        consent: 'I agree to the privacy policy and processing of my data for registration purposes.',
        selectCourse: '— Select —',
      };

  return (
    <CMSDialog
      open={open}
      onClose={onClose}
      title={t('starterForm.previewTitle')}
      size="lg"
      footer={
        <div style={styles.footerInner}>
          <div style={styles.langToggle}>
            <button
              type="button"
              onClick={() => setPreviewLang('en')}
              style={{
                ...styles.langBtn,
                ...(previewLang === 'en' ? styles.langBtnActive : {}),
              }}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setPreviewLang('ar')}
              style={{
                ...styles.langBtn,
                ...(previewLang === 'ar' ? styles.langBtnActive : {}),
              }}
            >
              العربية
            </button>
          </div>
          <CMSButton variant="secondary" onClick={onClose}>
            {t('action.close')}
          </CMSButton>
        </div>
      }
    >
      <div dir={dir} style={styles.previewContainer}>
        {!showForm ? (
          /* ── Closed state ── */
          <div style={styles.closedState}>
            <p style={styles.closedText}>{closedMessage}</p>
            <p style={styles.closedHint}>{t('starterForm.previewClosedHint')}</p>
          </div>
        ) : (
          /* ── Form preview ── */
          <div style={styles.formPreview}>
            <h2 style={styles.formTitle}>{title}</h2>
            <p style={styles.formDesc}>{description}</p>

            {/* Full Name */}
            <div style={styles.field}>
              <label style={styles.fieldLabel}>
                {labels.fullName} <span style={styles.required}>*</span>
              </label>
              <div style={styles.fieldInput} aria-hidden="true" />
            </div>

            {/* Phone */}
            <div style={styles.field}>
              <label style={styles.fieldLabel}>
                {labels.phone} <span style={styles.required}>*</span>
              </label>
              <div style={styles.fieldInput}>
                <span style={styles.placeholder}>+20 10x xxxx xxxx</span>
              </div>
            </div>

            {/* Email */}
            <div style={styles.field}>
              <label style={styles.fieldLabel}>{labels.email}</label>
              <div style={styles.fieldInput} aria-hidden="true" />
            </div>

            {/* Course Select */}
            <div style={styles.field}>
              <label style={styles.fieldLabel}>
                {labels.course} <span style={styles.required}>*</span>
              </label>
              <div style={styles.fieldInput}>
                <span style={styles.placeholder}>{labels.selectCourse}</span>
              </div>
            </div>

            {/* Privacy Consent */}
            <div style={styles.field}>
              <label style={styles.checkboxLabel}>
                <input type="checkbox" disabled style={styles.checkbox} />
                <span>{labels.consent}</span>
              </label>
            </div>

            {/* Submit Button */}
            <button type="button" style={styles.submitBtn} disabled>
              {buttonText}
            </button>
          </div>
        )}

        {/* Success preview */}
        {showForm && (
          <div style={styles.successPreview}>
            <div style={styles.successTitle}>
              {isAr ? 'معاينة رسالة النجاح' : 'Success Message Preview'}
            </div>
            <p style={styles.successMessage}>{successMessage}</p>
            <p style={styles.successNote}>{successNote}</p>
          </div>
        )}
      </div>
    </CMSDialog>
  );
}

const styles = {
  previewContainer: {
    fontFamily: 'inherit',
  },
  closedState: {
    textAlign: 'center',
    padding: '2rem 1rem',
  },
  closedText: {
    fontSize: '1rem',
    color: 'var(--cms-text-primary)',
    fontWeight: '500',
  },
  closedHint: {
    fontSize: '0.8125rem',
    color: 'var(--cms-text-muted)',
    marginTop: '0.5rem',
  },
  formPreview: {
    maxWidth: '480px',
    margin: '0 auto',
  },
  formTitle: {
    fontSize: '1.375rem',
    fontWeight: '700',
    color: 'var(--cms-text-primary)',
    marginBottom: '0.5rem',
    textAlign: 'center',
  },
  formDesc: {
    fontSize: '0.875rem',
    color: 'var(--cms-text-secondary)',
    marginBottom: '1.5rem',
    textAlign: 'center',
    lineHeight: '1.5',
  },
  field: {
    marginBottom: '1rem',
  },
  fieldLabel: {
    display: 'block',
    fontSize: '0.8125rem',
    fontWeight: '500',
    color: 'var(--cms-text-primary)',
    marginBottom: '0.375rem',
  },
  required: {
    color: 'var(--cms-danger)',
  },
  fieldInput: {
    background: 'var(--cms-bg-elevated)',
    border: '1px solid var(--cms-border-default)',
    borderRadius: 'var(--cms-radius-sm)',
    padding: '0.625rem 0.875rem',
    minHeight: '40px',
    display: 'flex',
    alignItems: 'center',
  },
  placeholder: {
    color: 'var(--cms-text-muted)',
    fontSize: '0.8125rem',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
    fontSize: '0.8125rem',
    color: 'var(--cms-text-secondary)',
    cursor: 'default',
    lineHeight: '1.4',
  },
  checkbox: {
    marginTop: '0.125rem',
    flexShrink: 0,
  },
  submitBtn: {
    width: '100%',
    padding: '0.75rem',
    background: 'var(--cms-accent)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--cms-radius-md)',
    fontSize: '0.9375rem',
    fontWeight: '600',
    fontFamily: 'inherit',
    cursor: 'default',
    opacity: 0.9,
  },
  successPreview: {
    marginTop: '2rem',
    padding: '1rem',
    background: 'var(--cms-bg-elevated)',
    border: '1px dashed var(--cms-border-default)',
    borderRadius: 'var(--cms-radius-md)',
    textAlign: 'center',
  },
  successTitle: {
    fontSize: '0.6875rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: 'var(--cms-text-muted)',
    marginBottom: '0.5rem',
  },
  successMessage: {
    fontSize: '0.875rem',
    color: 'var(--cms-text-primary)',
    lineHeight: '1.5',
  },
  successNote: {
    fontSize: '0.75rem',
    color: 'var(--cms-text-muted)',
    marginTop: '0.5rem',
    fontStyle: 'italic',
  },
  footerInner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  langToggle: {
    display: 'flex',
    gap: '0.25rem',
    border: '1px solid var(--cms-border-default)',
    borderRadius: 'var(--cms-radius-sm)',
    padding: '2px',
  },
  langBtn: {
    padding: '0.25rem 0.75rem',
    border: 'none',
    borderRadius: 'calc(var(--cms-radius-sm) - 2px)',
    background: 'transparent',
    color: 'var(--cms-text-secondary)',
    fontSize: '0.8125rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all var(--cms-transition-fast)',
  },
  langBtnActive: {
    background: 'var(--cms-accent)',
    color: '#fff',
    fontWeight: '600',
  },
};
