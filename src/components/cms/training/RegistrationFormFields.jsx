import { CMSInput, CMSTextarea, CMSSelect } from '../ui/CMSFormInputs';
import { CMSLoadingState, CMSErrorState } from '../ui/CMSStateViews';
import CMSButton from '../ui/CMSButton';
import CMSBadge from '../ui/CMSBadge';
import { useCMSLang } from '../../../contexts/CMSLanguageContext';
import { getUniversityLabel, getEducationStatusLabel } from '../../../data/egyptianUniversities';
import { formatPrice } from '../../../utils/formatPrice';

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'enrolled', label: 'Enrolled' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const SOURCE_OPTIONS = [
  { value: 'google_form', label: 'Google Form' },
  { value: 'cms_manual', label: 'CMS Manual' },
  { value: 'website', label: 'Website' },
];

const ENROLLMENT_STAGE_OPTIONS = [
  { value: 'unknown', labelKey: 'registration.enrollment_stage.unknown' },
  { value: 'needs_contact', labelKey: 'registration.enrollment_stage.needs_contact' },
  { value: 'contacted', labelKey: 'registration.enrollment_stage.contacted' },
  { value: 'follow_up', labelKey: 'registration.enrollment_stage.follow_up' },
  { value: 'pending_payment', labelKey: 'registration.enrollment_stage.pending_payment' },
  { value: 'confirmed', labelKey: 'registration.enrollment_stage.confirmed' },
  { value: 'cancelled', labelKey: 'registration.enrollment_stage.cancelled' },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: 'unknown', labelKey: 'registration.payment_status.unknown' },
  { value: 'unpaid', labelKey: 'registration.payment_status.unpaid' },
  { value: 'pending', labelKey: 'registration.payment_status.pending' },
  { value: 'paid', labelKey: 'registration.payment_status.paid' },
  { value: 'not_applicable', labelKey: 'registration.payment_status.not_applicable' },
];

const PAYMENT_METHOD_OPTIONS = [
  { value: '', labelKey: 'form.selectImage' },
  { value: 'cash', labelKey: 'registration.payment_method.cash' },
  { value: 'bank_transfer', labelKey: 'registration.payment_method.bank_transfer' },
  { value: 'vodafone_cash', labelKey: 'registration.payment_method.vodafone_cash' },
  { value: 'instapay', labelKey: 'registration.payment_method.instapay' },
  { value: 'other', labelKey: 'registration.payment_method.other' },
];

// Normalize an Egyptian phone number to a wa.me destination (digits only,
// no '+'). Returns null when the value cannot be a valid Egyptian mobile.
// This never mutates stored data — it only builds the chat URL.
const normalizeWhatsAppPhone = (phone) => {
  if (!phone) return null;
  let digits = String(phone).replace(/\D/g, '');
  if (!digits) return null;
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = `20${digits.slice(1)}`;
  if (digits.length === 10 && digits.startsWith('1')) digits = `20${digits}`;
  if (!/^201[0125]\d{8}$/.test(digits)) return null;
  return digits;
};

export default function RegistrationFormFields({
  data,
  record,
  programs,
  fieldErrors,
  canEdit,
  isNew,
  programsLoading,
  loading,
  error,
  onRetry,
  onChange,
  onMarkContacted,
  onToggleWhatsApp,
  onOperationalTransition,
  onCancelRequest,
  transitioning = false,
  simplified = false,
}) {
  const { t, lang } = useCMSLang();
  const isAr = lang === 'ar';

  if (loading) return <CMSLoadingState />;
  if (error) return <CMSErrorState message={error} onRetry={onRetry} />;

  const selectedProgram = programs.find((p) => String(p.id) === String(data.program));
  const programTitle = selectedProgram
    ? (selectedProgram.title_en || selectedProgram.title_ar || `#${selectedProgram.id}`)
    : data.program
      ? `#${data.program}`
      : '—';
  const trackTitle = record?.program_track || selectedProgram?.track || programTitle;
  const programBranch = record?.program_branch || selectedProgram?.branch || '';

  const cmsLang = 'en';
  const universityDisplay = data.university
    ? (data.university === 'other'
        ? (data.university_other || 'Other')
        : getUniversityLabel(data.university, cmsLang))
    : (data.college_or_school || '—');
  const educationStatusDisplay = data.education_status
    ? (data.education_status === 'other'
        ? (data.education_status_other || 'Other')
        : getEducationStatusLabel(data.education_status, cmsLang))
    : (data.academic_year || '—');

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString(isAr ? 'ar-EG' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  // Registration-time price snapshot (immutable). NULL legacy rows show '—';
  // the current program price is never substituted.
  const coursePriceDisplay = (record?.course_price !== null && record?.course_price !== undefined)
    ? (formatPrice(record.course_price, isAr ? 'ar' : 'en', true) || '—')
    : '—';

  // Simplified operational layout used by the Registration Details modal.
  // Hides academic/technical/UTM fields — they remain available on the full
  // registration detail page.
  if (simplified && !isNew) {
    const isPaid = data.payment_status === 'paid';
    const opStatus = record?.operational_status || 'lead';
    const OPS_VARIANTS = { lead: 'danger', contacted: 'accent', subscribed: 'success', cancelled: 'default' };
    return (
      <div style={styles.form}>
        {/* CUSTOMER */}
        <div style={styles.opsSection}>
          <h4 style={styles.operationalTitle}>{t('registration.customerSection') || 'Customer'}</h4>
          <div className="cms-form-grid" style={styles.grid2}>
            <CMSInput label={t('form.name')} value={data.full_name} onChange={(e) => onChange('full_name', e.target.value)} error={fieldErrors.full_name} readOnly={!canEdit} />
            <div>
              <CMSInput label={t('form.phone')} value={data.phone} onChange={(e) => onChange('phone', e.target.value)} error={fieldErrors.phone} readOnly={!canEdit} />
              {normalizeWhatsAppPhone(data.phone) && (
                <a
                  href={`https://wa.me/${normalizeWhatsAppPhone(data.phone)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.whatsAppLink}
                >
                  {t('registration.openWhatsApp') || 'Open WhatsApp'}
                </a>
              )}
            </div>
            <CMSInput label={t('form.email')} value={data.email} onChange={(e) => onChange('email', e.target.value)} error={fieldErrors.email} readOnly={!canEdit} />
            <div>
              <div style={styles.readOnlyLabel}>{t('training.track') || 'Track'}</div>
              <div style={styles.readOnlyValue}>{trackTitle}</div>
              {programTitle !== trackTitle && (
                <div style={styles.readOnlySubValue}>{programTitle}{programBranch ? ` · ${programBranch}` : ''}</div>
              )}
              {programTitle === trackTitle && programBranch && (
                <div style={styles.readOnlySubValue}>{programBranch}</div>
              )}
            </div>
            <div>
              <div style={styles.readOnlyLabel}>{t('form.date') || 'Registered At'}</div>
              <div style={styles.readOnlyValue}>{formatDate(record?.submitted_at || record?.created_at)}</div>
            </div>
            <div>
              <div style={styles.readOnlyLabel}>{t('registration.coursePrice') || 'Course Price'}</div>
              <div style={styles.readOnlyValue}>{coursePriceDisplay}</div>
            </div>
          </div>
        </div>

        {/* OPERATIONAL STATUS — primary workflow, atomic server transitions */}
        <div style={styles.opsSection}>
          <h4 style={styles.operationalTitle}>{t('registration.operationalStatus') || 'Status'}</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <CMSBadge type={OPS_VARIANTS[opStatus] || 'default'}>
              {t(`registration.operational_status.${opStatus}`)}
            </CMSBadge>
            {record?.last_contacted_at && (
              <span style={{ fontSize: '0.8rem', color: 'var(--cms-text-muted)' }}>
                {t('registration.lastContacted') || 'Last Contacted'}: {formatDate(record.last_contacted_at)}
              </span>
            )}
          </div>
          {canEdit && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
              {opStatus === 'lead' && (
                <CMSButton variant="primary" size="sm" loading={transitioning}
                  onClick={() => onOperationalTransition('contacted')}>
                  {t('registration.action.markContacted') || 'Mark Contacted'}
                </CMSButton>
              )}
              {opStatus === 'contacted' && (
                <CMSButton variant="primary" size="sm" loading={transitioning}
                  onClick={() => onOperationalTransition('subscribed')}>
                  {t('registration.action.markSubscribed') || 'Mark Subscribed'}
                </CMSButton>
              )}
              {opStatus === 'subscribed' && (
                <CMSButton variant="secondary" size="sm" loading={transitioning}
                  onClick={() => onOperationalTransition('contacted')}>
                  {t('registration.action.correctToContacted') || 'Correct to Contacted'}
                </CMSButton>
              )}
              {opStatus === 'cancelled' && (
                <CMSButton variant="primary" size="sm" loading={transitioning}
                  onClick={() => onOperationalTransition('contacted')}>
                  {t('registration.action.reactivate') || 'Reactivate (Mark Contacted)'}
                </CMSButton>
              )}
              {opStatus !== 'cancelled' && (
                <CMSButton variant="danger" size="sm" onClick={onCancelRequest} disabled={transitioning}>
                  {t('registration.action.cancelRegistration') || 'Cancel Registration'}
                </CMSButton>
              )}
            </div>
          )}
        </div>

        {/* ADVANCED DETAILS — payment / WhatsApp / follow-up (secondary metadata) */}
        <details style={styles.advancedDetails}>
          <summary style={styles.advancedSummary}>
            {t('registration.advancedDetails') || 'Advanced Details'}
          </summary>

          {/* FOLLOW-UP */}
          <div style={styles.opsSection}>
            <h4 style={styles.operationalTitle}>{t('registration.followUpSection') || 'Follow-up'}</h4>
            <div className="cms-form-grid" style={styles.grid2}>
              <CMSInput
                label={t('registration.nextFollowUp') || 'Next Follow-up'}
                type="date"
                value={data.next_follow_up_at || ''}
                onChange={(e) => onChange('next_follow_up_at', e.target.value)}
                readOnly={!canEdit}
              />
            </div>
            <CMSTextarea
              label={t('registration.followUpNotes') || 'Follow-up Notes'}
              value={data.follow_up_notes || ''}
              onChange={(e) => onChange('follow_up_notes', e.target.value)}
              rows={3}
              readOnly={!canEdit}
            />
          </div>

        {/* PAYMENT */}
        <div style={styles.opsSection}>
          <h4 style={styles.operationalTitle}>{t('registration.paymentSection') || 'Payment'}</h4>
          <div className="cms-form-grid" style={styles.grid2}>
            <CMSSelect
              label={t('registration.paymentStatus') || 'Payment Status'}
              value={data.payment_status || ''}
              onChange={(e) => onChange('payment_status', e.target.value)}
              disabled={!canEdit}
            >
              {PAYMENT_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{t(o.labelKey)}</option>
              ))}
            </CMSSelect>
          </div>
          {isPaid && (
            <div className="cms-form-grid" style={styles.grid2}>
              <CMSInput
                label={t('registration.paidAmount') || 'Paid Amount'}
                type="number"
                value={data.paid_amount ?? ''}
                onChange={(e) => onChange('paid_amount', e.target.value === '' ? '' : Number(e.target.value))}
                readOnly={!canEdit}
              />
              <CMSSelect
                label={t('registration.paymentMethod') || 'Payment Method'}
                value={data.payment_method || ''}
                onChange={(e) => onChange('payment_method', e.target.value)}
                disabled={!canEdit}
              >
                {PAYMENT_METHOD_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{t(o.labelKey)}</option>
                ))}
              </CMSSelect>
              <CMSInput
                label={t('registration.paymentDate') || 'Payment Date'}
                type="date"
                value={data.payment_date || ''}
                onChange={(e) => onChange('payment_date', e.target.value)}
                readOnly={!canEdit}
              />
              <CMSInput
                label={t('registration.paymentReference') || 'Payment Reference'}
                value={data.payment_reference || ''}
                onChange={(e) => onChange('payment_reference', e.target.value)}
                readOnly={!canEdit}
              />
            </div>
          )}
          <CMSTextarea
            label={t('registration.paymentNotes') || 'Payment Notes'}
            value={data.payment_notes || ''}
            onChange={(e) => onChange('payment_notes', e.target.value)}
            rows={3}
            readOnly={!canEdit}
          />
        </div>

        {/* WHATSAPP GROUP */}
        <div style={styles.opsSection}>
          <h4 style={styles.operationalTitle}>{t('registration.whatsappSection') || 'WhatsApp Group'}</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <label style={styles.toggleLabel}>
              <input
                type="checkbox"
                checked={!!data.whatsapp_group_added}
                onChange={onToggleWhatsApp}
                disabled={!canEdit}
                style={styles.toggleInput}
              />
              <span>{t('registration.whatsappGroupAdded') || 'Added to WhatsApp Group'}</span>
            </label>
          </div>
          {data.whatsapp_group_added && (
            <div style={styles.waMeta}>
              {record?.whatsapp_group_added_at && (
                <span>{t('registration.addedAt') || 'Added At'}: {formatDate(record.whatsapp_group_added_at)}</span>
              )}
              {record?.whatsapp_group_added_by_username && (
                <span>{t('registration.addedBy') || 'Added By'}: {record.whatsapp_group_added_by_username}</span>
              )}
            </div>
          )}
        </div>
        </details>
      </div>
    );
  }

  return (
    <div style={styles.form}>
      <CMSSelect
        label={t('training.title')}
        value={data.program}
        onChange={(e) => onChange('program', e.target.value)}
        error={fieldErrors.program}
        disabled={!canEdit || programsLoading}
      >
        <option value="">{t('form.selectImage') || 'Select a program…'}</option>
        {programs.map((p) => (
          <option key={p.id} value={p.id}>{p.title_en || p.title_ar || p.slug}</option>
        ))}
      </CMSSelect>
      {!canEdit && (
        <div style={styles.readOnlyValue}>{programTitle}</div>
      )}

      <div className="cms-form-grid" style={styles.grid2}>
        <CMSInput label={t('form.name')} value={data.full_name} onChange={(e) => onChange('full_name', e.target.value)} error={fieldErrors.full_name} readOnly={!canEdit} />
        <CMSInput label={t('form.email')} value={data.email} onChange={(e) => onChange('email', e.target.value)} error={fieldErrors.email} readOnly={!canEdit} />
        <CMSInput label={t('form.phone')} value={data.phone} onChange={(e) => onChange('phone', e.target.value)} error={fieldErrors.phone} readOnly={!canEdit} />
        <CMSInput label={t('training.nationalId') || 'National ID'} value={data.national_id} onChange={(e) => onChange('national_id', e.target.value)} error={fieldErrors.national_id} readOnly={!canEdit} />
        <CMSInput label={t('training.collegeOrSchool') || 'College / School'} value={data.college_or_school} onChange={(e) => onChange('college_or_school', e.target.value)} error={fieldErrors.college_or_school} readOnly={!canEdit} />
        <CMSInput label={t('training.academicYear') || 'Academic Year'} value={data.academic_year} onChange={(e) => onChange('academic_year', e.target.value)} error={fieldErrors.academic_year} readOnly={!canEdit} />
        <CMSInput label={t('training.university') || 'University'} value={universityDisplay} readOnly />
        {data.university_other && (
          <CMSInput label={t('training.universityOther') || 'Custom Institution'} value={data.university_other} readOnly />
        )}
        <CMSInput label={t('training.educationStatus') || 'Study Status'} value={educationStatusDisplay} readOnly />
        {data.education_status_other && (
          <CMSInput label={t('training.educationStatusOther') || 'Custom Status'} value={data.education_status_other} readOnly />
        )}
        <CMSSelect label={t('training.preferredLanguage') || 'Preferred Language'} value={data.preferred_language} onChange={(e) => onChange('preferred_language', e.target.value)} disabled={!canEdit}>
          <option value="en">English</option>
          <option value="ar">العربية</option>
        </CMSSelect>
        <CMSSelect label={t('form.status')} value={data.status} onChange={(e) => onChange('status', e.target.value)} error={fieldErrors.status} disabled={!canEdit}>
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{t(`registration.status.${o.value}`)}</option>
          ))}
        </CMSSelect>
        <CMSSelect label={t('form.source')} value={data.source} disabled>
          {SOURCE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{t(`registration.source.${o.value}`)}</option>
          ))}
        </CMSSelect>
      </div>

      <CMSTextarea label={t('form.notes') || 'Notes'} value={data.notes} onChange={(e) => onChange('notes', e.target.value)} error={fieldErrors.notes} rows={4} readOnly={!canEdit} />
      <CMSTextarea
        label={t('form.internalNotes')}
        value={data.internal_notes}
        onChange={(e) => onChange('internal_notes', e.target.value)}
        error={fieldErrors.internal_notes}
        rows={4}
        hint={t('leads.notesHint')}
        readOnly={!canEdit}
      />

      {!isNew && data.confirmation_email_status && (
        <div style={styles.emailStatusSection}>
          <h4 style={styles.emailStatusTitle}>{t('registration.confirmationEmail') || 'Confirmation Email'}</h4>
          <div className="cms-form-grid">
            <CMSInput
              label={t('registration.emailStatus') || 'Status'}
              value={data.confirmation_email_status_display || data.confirmation_email_status || 'Not attempted'}
              readOnly
            />
            <CMSInput
              label={t('registration.emailAttempted') || 'Attempted'}
              value={data.confirmation_email_attempted_at ? new Date(data.confirmation_email_attempted_at).toLocaleString() : '—'}
              readOnly
            />
            <CMSInput
              label={t('registration.emailSent') || 'Sent'}
              value={data.confirmation_email_sent_at ? new Date(data.confirmation_email_sent_at).toLocaleString() : '—'}
              readOnly
            />
          </div>
          {data.confirmation_email_error_summary && (
            <CMSTextarea
              label={t('registration.emailError') || 'Error'}
              value={data.confirmation_email_error_summary}
              readOnly
              rows={2}
            />
          )}
        </div>
      )}

      {!isNew && record?.submitted_at && (
        <div style={styles.metaRow}>
          <span style={styles.metaLabel}>{t('form.date') || 'Date'}:</span>
          <span>{formatDate(record.submitted_at || record.created_at)}</span>
        </div>
      )}

      {/* Operational / Follow-up Section */}
      {!isNew && (
        <div style={styles.operationalSection}>
          <h4 style={styles.operationalTitle}>{t('registration.operationalSection') || 'Operational / Follow-up'}</h4>

          {/* Follow-up */}
          <div style={styles.subSection}>
            <h5 style={styles.subTitle}>{t('registration.followUpSection') || 'Follow-up'}</h5>
            <div className="cms-form-grid" style={styles.grid2}>
              <CMSSelect
                label={t('registration.enrollmentStage') || 'Enrollment Stage'}
                value={data.enrollment_stage || ''}
                onChange={(e) => onChange('enrollment_stage', e.target.value)}
                disabled={!canEdit}
              >
                {ENROLLMENT_STAGE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{t(o.labelKey)}</option>
                ))}
              </CMSSelect>
              <CMSInput
                label={t('registration.lastContacted') || 'Last Contacted'}
                value={data.last_contacted_at ? new Date(data.last_contacted_at).toLocaleString() : '—'}
                readOnly
              />
              <CMSInput
                label={t('registration.nextFollowUp') || 'Next Follow-up'}
                type="date"
                value={data.next_follow_up_at || ''}
                onChange={(e) => onChange('next_follow_up_at', e.target.value)}
                readOnly={!canEdit}
              />
              {canEdit && (
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <CMSButton variant="secondary" onClick={onMarkContacted}>
                    {t('registration.markContacted') || 'Mark Contacted'}
                  </CMSButton>
                </div>
              )}
            </div>
            <CMSTextarea
              label={t('registration.followUpNotes') || 'Follow-up Notes'}
              value={data.follow_up_notes || ''}
              onChange={(e) => onChange('follow_up_notes', e.target.value)}
              rows={3}
              readOnly={!canEdit}
            />
          </div>

          {/* Payment */}
          <div style={styles.subSection}>
            <h5 style={styles.subTitle}>{t('registration.paymentSection') || 'Payment'}</h5>
            <div className="cms-form-grid" style={styles.grid2}>
              <CMSSelect
                label={t('registration.paymentStatus') || 'Payment Status'}
                value={data.payment_status || ''}
                onChange={(e) => onChange('payment_status', e.target.value)}
                disabled={!canEdit}
              >
                {PAYMENT_STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{t(o.labelKey)}</option>
                ))}
              </CMSSelect>
              <CMSInput
                label={t('registration.paidAmount') || 'Paid Amount'}
                type="number"
                value={data.paid_amount ?? ''}
                onChange={(e) => onChange('paid_amount', e.target.value === '' ? '' : Number(e.target.value))}
                readOnly={!canEdit}
              />
              <CMSSelect
                label={t('registration.paymentMethod') || 'Payment Method'}
                value={data.payment_method || ''}
                onChange={(e) => onChange('payment_method', e.target.value)}
                disabled={!canEdit}
              >
                {PAYMENT_METHOD_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{t(o.labelKey)}</option>
                ))}
              </CMSSelect>
              <CMSInput
                label={t('registration.paymentDate') || 'Payment Date'}
                type="date"
                value={data.payment_date || ''}
                onChange={(e) => onChange('payment_date', e.target.value)}
                readOnly={!canEdit}
              />
              <CMSInput
                label={t('registration.paymentReference') || 'Payment Reference'}
                value={data.payment_reference || ''}
                onChange={(e) => onChange('payment_reference', e.target.value)}
                readOnly={!canEdit}
              />
            </div>
            <CMSTextarea
              label={t('registration.paymentNotes') || 'Payment Notes'}
              value={data.payment_notes || ''}
              onChange={(e) => onChange('payment_notes', e.target.value)}
              rows={3}
              readOnly={!canEdit}
            />
          </div>

          {/* WhatsApp Group */}
          <div style={styles.subSection}>
            <h5 style={styles.subTitle}>{t('registration.whatsappSection') || 'WhatsApp Group'}</h5>
            <div className="cms-form-grid" style={styles.grid2}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <label style={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    checked={!!data.whatsapp_group_added}
                    onChange={onToggleWhatsApp}
                    disabled={!canEdit}
                    style={styles.toggleInput}
                  />
                  <span>{t('registration.whatsappGroupAdded') || 'Added to WhatsApp Group'}</span>
                </label>
              </div>
              <CMSInput
                label={t('registration.addedAt') || 'Added At'}
                value={record?.whatsapp_group_added_at ? new Date(record.whatsapp_group_added_at).toLocaleString() : '—'}
                readOnly
              />
              <CMSInput
                label={t('registration.addedBy') || 'Added By'}
                value={record?.whatsapp_group_added_by_username || '—'}
                readOnly
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  readOnlyValue: {
    fontSize: '0.875rem',
    color: 'var(--cms-text-secondary)',
    padding: '0.5rem 0',
  },
  readOnlyLabel: {
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: 'var(--cms-text-secondary)',
    marginBottom: '0.25rem',
  },
  readOnlySubValue: {
    fontSize: '0.75rem',
    color: 'var(--cms-text-tertiary, var(--cms-text-secondary))',
    paddingBottom: '0.5rem',
  },
  advancedDetails: {
    marginTop: '0.75rem',
    border: '1px solid var(--cms-border-default)',
    borderRadius: 'var(--cms-radius-md)',
    padding: '0.75rem 1rem',
  },
  advancedSummary: {
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.875rem',
    color: 'var(--cms-text-secondary)',
  },
  opsSection: {
    padding: '1rem 1.25rem',
    background: 'var(--cms-bg-surface)',
    border: '1px solid var(--cms-border-default)',
    borderRadius: 'var(--cms-radius-lg)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.875rem',
  },
  waMeta: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
    fontSize: '0.75rem',
    color: 'var(--cms-text-secondary)',
  },
  whatsAppLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    marginTop: '0.375rem',
    padding: 'var(--space-1) var(--space-3)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: '500',
    color: 'var(--cms-accent)',
    background: 'var(--cms-bg-surface-alt)',
    border: '1px solid var(--cms-border-strong)',
    borderRadius: 'var(--cms-radius-sm)',
    textDecoration: 'none',
    cursor: 'pointer',
  },
  operationalSection: {
    marginTop: '1.5rem',
    padding: '1.25rem',
    background: 'var(--cms-bg-surface)',
    border: '1px solid var(--cms-border-default)',
    borderRadius: 'var(--cms-radius-lg)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  operationalTitle: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'var(--cms-accent)',
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  subSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  subTitle: {
    fontSize: '0.8125rem',
    fontWeight: '600',
    color: 'var(--cms-text-secondary)',
    margin: 0,
  },
  toggleLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    color: 'var(--cms-text-primary)',
    cursor: 'pointer',
  },
  toggleInput: {
    width: '1.125rem',
    height: '1.125rem',
    accentColor: 'var(--cms-accent)',
    cursor: 'pointer',
  },
  emailStatusSection: {
    marginTop: '1.5rem',
    padding: '1rem',
    background: 'var(--cms-bg-surface)',
    border: '1px solid var(--cms-border-default)',
    borderRadius: 'var(--cms-radius-lg)',
  },
  emailStatusTitle: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'var(--cms-accent)',
    marginBottom: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  metaRow: {
    display: 'flex',
    gap: '0.5rem',
    fontSize: '0.875rem',
    color: 'var(--cms-text-secondary)',
  },
  metaLabel: {
    fontWeight: 600,
  },
};
