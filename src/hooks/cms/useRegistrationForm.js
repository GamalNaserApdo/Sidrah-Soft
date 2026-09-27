import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/CMSToastContext';
import {
  getRegistration,
  createRegistration,
  updateRegistration,
  deleteRegistration,
  transitionOperationalStatus,
} from '../../services/cms/trainingRegistrationsApi';
import { listPrograms } from '../../services/cms/trainingApi';
import { parseApiError, extractFieldErrors } from '../../services/cms/cmsFetch';
import { useCMSLang } from '../../contexts/CMSLanguageContext';

const empty = {
  program: '',
  full_name: '',
  email: '',
  phone: '',
  national_id: '',
  college_or_school: '',
  academic_year: '',
  university: '',
  university_other: '',
  education_status: '',
  education_status_other: '',
  preferred_language: 'en',
  notes: '',
  internal_notes: '',
  status: 'new',
  source: 'cms_manual',
  // Operational fields
  enrollment_stage: 'needs_contact',
  payment_status: 'unknown',
  paid_amount: '',
  payment_method: '',
  payment_date: '',
  payment_reference: '',
  payment_notes: '',
  whatsapp_group_added: false,
  last_contacted_at: '',
  next_follow_up_at: '',
  follow_up_notes: '',
};

// Nullable model fields: an empty string is not a valid date/decimal/datetime
// on the API — send null instead.
const NULLABLE_WHEN_EMPTY = new Set([
  'paid_amount', 'payment_date', 'next_follow_up_at', 'last_contacted_at',
]);

// Fields the simplified operational modal is allowed to submit. Hidden
// profile/technical fields are never re-sent by the modal (partial update).
const SIMPLIFIED_PAYLOAD_FIELDS = [
  'full_name', 'email', 'phone',
  'next_follow_up_at', 'last_contacted_at', 'follow_up_notes',
  'payment_status', 'paid_amount', 'payment_method', 'payment_date',
  'payment_reference', 'payment_notes', 'whatsapp_group_added',
];

// API field name -> CMS translation key, used to surface the first backend
// field error in the toast instead of a generic message.
const FIELD_LABEL_KEYS = {
  full_name: 'form.name',
  email: 'form.email',
  phone: 'form.phone',
  program: 'training.title',
  status: 'form.status',
  enrollment_stage: 'registration.enrollmentStage',
  payment_status: 'registration.paymentStatus',
  paid_amount: 'registration.paidAmount',
  payment_method: 'registration.paymentMethod',
  payment_date: 'registration.paymentDate',
  payment_reference: 'registration.paymentReference',
  payment_notes: 'registration.paymentNotes',
  next_follow_up_at: 'registration.nextFollowUp',
  last_contacted_at: 'registration.lastContacted',
  follow_up_notes: 'registration.followUpNotes',
  whatsapp_group_added: 'registration.whatsappGroupAdded',
};

export default function useRegistrationForm({ id, isNew = false, simplified = false, onSaveSuccess, onDeleteSuccess }) {
  const { t } = useCMSLang();
  const { hasCapability } = useAuth();
  const { showSuccess, showError } = useToast();

  const canCreate = hasCapability('training_registrations.create');
  const canUpdate = hasCapability('training_registrations.update');
  const canDelete = hasCapability('training_registrations.delete');
  const canEdit = isNew ? canCreate : canUpdate;

  const [data, setData] = useState(empty);
  const [record, setRecord] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(!isNew);
  const [programsLoading, setProgramsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [dirty, setDirty] = useState(isNew);

  const loadPrograms = useCallback(async () => {
    setProgramsLoading(true);
    try {
      const res = await listPrograms({ page_size: 1000 });
      setPrograms(res.results || []);
    } catch {
      setPrograms([]);
    } finally {
      setProgramsLoading(false);
    }
  }, []);

  const load = useCallback(async () => {
    if (isNew || !id) return;
    setLoading(true);
    setError(null);
    try {
      const d = await getRegistration(id);
      setRecord(d);
      setData({
        program: d.program || '',
        full_name: d.full_name || '',
        email: d.email || '',
        phone: d.phone || '',
        national_id: d.national_id || '',
        college_or_school: d.college_or_school || '',
        academic_year: d.academic_year || '',
        university: d.university || '',
        university_other: d.university_other || '',
        education_status: d.education_status || '',
        education_status_other: d.education_status_other || '',
        preferred_language: d.preferred_language || 'en',
        notes: d.notes || '',
        internal_notes: d.internal_notes || '',
        status: d.status || 'new',
        source: d.source || 'cms_manual',
        confirmation_email_status: d.confirmation_email_status || 'not_attempted',
        confirmation_email_status_display: d.confirmation_email_status_display || 'Not attempted',
        confirmation_email_attempted_at: d.confirmation_email_attempted_at || null,
        confirmation_email_sent_at: d.confirmation_email_sent_at || null,
        confirmation_email_error_summary: d.confirmation_email_error_summary || '',
        // Operational fields
        operational_status: d.operational_status || 'lead',
        enrollment_stage: d.enrollment_stage || 'unknown',
        payment_status: d.payment_status || 'unknown',
        paid_amount: d.paid_amount ?? '',
        payment_method: d.payment_method || '',
        payment_date: d.payment_date || '',
        payment_reference: d.payment_reference || '',
        payment_notes: d.payment_notes || '',
        whatsapp_group_added: d.whatsapp_group_added ?? false,
        last_contacted_at: d.last_contacted_at || '',
        next_follow_up_at: d.next_follow_up_at || '',
        follow_up_notes: d.follow_up_notes || '',
      });
      setDirty(false);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }, [id, isNew]);

  useEffect(() => {
    loadPrograms();
    load();
  }, [load, loadPrograms]);

  const handleChange = (field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleMarkContacted = () => {
    setData((prev) => ({
      ...prev,
      last_contacted_at: new Date().toISOString(),
      enrollment_stage:
        prev.enrollment_stage === 'needs_contact'
          ? 'contacted'
          : prev.enrollment_stage,
    }));
    setDirty(true);
  };

  const [transitioning, setTransitioning] = useState(false);

  // Atomic server-side transition of the primary operational status.
  // Transition rules live in the backend (OPERATIONAL_TRANSITIONS).
  const handleOperationalTransition = useCallback(async (newStatus, note) => {
    if (!canEdit || isNew) return;
    setTransitioning(true);
    try {
      await transitionOperationalStatus(id, newStatus, note);
      showSuccess(t('msg.saved'));
      await load();
      onSaveSuccess?.();
    } catch (err) {
      showError(parseApiError(err));
      throw err;
    } finally {
      setTransitioning(false);
    }
  }, [canEdit, isNew, id, load, onSaveSuccess, showSuccess, showError, t]);

  const handleToggleWhatsApp = () => {
    setData((prev) => ({
      ...prev,
      whatsapp_group_added: !prev.whatsapp_group_added,
    }));
    setDirty(true);
  };

  const handleSave = async () => {
    if (!canEdit) return;
    setSaving(true);
    setFieldErrors({});
    try {
      const keys = simplified ? SIMPLIFIED_PAYLOAD_FIELDS : Object.keys(data);
      const payload = {};
      for (const key of keys) {
        let value = data[key];
        if (value === undefined) continue;
        // PATCH omission preserves the stored value; the CMS write serializer
        // rejects blank email, so never send an empty one on update.
        if (key === 'email' && value === '' && !isNew) continue;
        if (value === '' && NULLABLE_WHEN_EMPTY.has(key)) value = null;
        payload[key] = value;
      }
      let result;
      if (isNew) {
        result = await createRegistration(payload);
        showSuccess(t('msg.created'));
      } else {
        result = await updateRegistration(id, payload);
        showSuccess(t('msg.saved'));
      }
      setDirty(false);
      onSaveSuccess?.(result);
    } catch (err) {
      const fe = extractFieldErrors(err);
      if (Object.keys(fe).length > 0) {
        setFieldErrors(fe);
        const [firstField, firstMsgs] = Object.entries(fe)[0];
        const labelKey = FIELD_LABEL_KEYS[firstField];
        const label = labelKey ? t(labelKey) : firstField;
        showError(`${label}: ${firstMsgs[0]}`);
      } else {
        showError(parseApiError(err));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    await deleteRegistration(id);
    showSuccess(t('registration.deleted'));
    onDeleteSuccess?.();
  };

  return {
    data,
    record,
    programs,
    loading,
    programsLoading,
    error,
    saving,
    fieldErrors,
    dirty,
    isNew,
    canEdit,
    canDelete,
    load,
    handleChange,
    handleSave,
    handleDelete,
    handleMarkContacted,
    handleToggleWhatsApp,
    handleOperationalTransition,
    transitioning,
  };
}
