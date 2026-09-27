/**
 * CMS Starter Form Config Page — /cms/training/starter-form
 *
 * Singleton configuration screen for the shared Starter campaign
 * registration form at /training/starter/register.
 *
 * Endpoint:
 *   GET /api/v1/cms/training/starter-form-config/
 *   PUT /api/v1/cms/training/starter-form-config/
 */

import { useState, useEffect, useCallback } from 'react';
import CMSLayout from '../../components/cms/layout/CMSLayout';
import CMSPageHeader from '../../components/cms/ui/CMSPageHeader';
import { CMSLoadingState, CMSErrorState } from '../../components/cms/ui/CMSStateViews';
import CMSButton from '../../components/cms/ui/CMSButton';
import { CMSInput, CMSTextarea, CMSCheckbox } from '../../components/cms/ui/CMSFormInputs';
import StarterFormPreviewModal from '../../components/cms/training/StarterFormPreviewModal';
import { useAuth } from '../../contexts/AuthContext';
import { useCMSLang } from '../../contexts/CMSLanguageContext';
import { useToast } from '../../contexts/CMSToastContext';
import { getStarterFormConfig, updateStarterFormConfig } from '../../services/cms/trainingApi';
import { parseApiError, extractFieldErrors } from '../../services/cms/cmsFetch';

export default function CMSTrainingStarterFormConfigPage() {
  const { hasCapability } = useAuth();
  const { t } = useCMSLang();
  const { showSuccess, showError } = useToast();

  const canView = hasCapability('training.view') || hasCapability('training.update');
  const canEdit = hasCapability('training.update');

  const [formData, setFormData] = useState(null);
  const [original, setOriginal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [dirty, setDirty] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStarterFormConfig();
      setFormData(data);
      setOriginal(data);
      setDirty(false);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (canView) load();
  }, [canView, load]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSave = async () => {
    if (!formData) return;
    setSaving(true);
    setFieldErrors({});
    try {
      const payload = {
        show_registration_form: formData.show_registration_form ?? true,
        form_title_en: formData.form_title_en || '',
        form_title_ar: formData.form_title_ar || '',
        form_description_en: formData.form_description_en || '',
        form_description_ar: formData.form_description_ar || '',
        form_button_en: formData.form_button_en || '',
        form_button_ar: formData.form_button_ar || '',
        success_message_en: formData.success_message_en || '',
        success_message_ar: formData.success_message_ar || '',
        success_note_en: formData.success_note_en || '',
        success_note_ar: formData.success_note_ar || '',
        closed_message_en: formData.closed_message_en || '',
        closed_message_ar: formData.closed_message_ar || '',
      };
      const updated = await updateStarterFormConfig(payload);
      setFormData(updated);
      setOriginal(updated);
      setDirty(false);
      showSuccess(t('msg.saved'));
    } catch (err) {
      const fe = extractFieldErrors(err);
      if (Object.keys(fe).length > 0) setFieldErrors(fe);
      showError(parseApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(original);
    setDirty(false);
    setFieldErrors({});
  };

  if (!canView) {
    return (
      <CMSLayout>
        <CMSErrorState message={t('siteSettings.permissionDenied')} />
      </CMSLayout>
    );
  }

  return (
    <CMSLayout unsavedChanges={dirty}>
      <CMSPageHeader
        title={t('nav.starterForm')}
        subtitle={t('starterForm.subtitle')}
      />

      {loading && <CMSLoadingState />}
      {error && <CMSErrorState message={error} onRetry={load} />}

      {!loading && !error && formData && (
        <div style={styles.formContainer}>
          {/* Visibility */}
          <Section title={t('starterForm.visibilitySection')}>
            <CMSCheckbox
              label={t('starterForm.showForm')}
              checked={formData.show_registration_form ?? true}
              onChange={(e) => handleChange('show_registration_form', e.target.checked)}
              disabled={!canEdit}
            />
            <p style={styles.sectionHint}>{t('starterForm.showFormHint')}</p>
          </Section>

          {/* English content */}
          <Section title={t('starterForm.englishSection')}>
            <CMSInput
              label={t('starterForm.formTitle')}
              value={formData.form_title_en || ''}
              onChange={(e) => handleChange('form_title_en', e.target.value)}
              error={fieldErrors.form_title_en}
              disabled={!canEdit}
              maxLength={255}
            />
            <div style={{ marginTop: '1rem' }}>
              <CMSTextarea
                label={t('starterForm.formDescription')}
                value={formData.form_description_en || ''}
                onChange={(e) => handleChange('form_description_en', e.target.value)}
                error={fieldErrors.form_description_en}
                disabled={!canEdit}
                rows={2}
              />
            </div>
            <div style={{ marginTop: '1rem' }}>
              <CMSInput
                label={t('starterForm.formButton')}
                value={formData.form_button_en || ''}
                onChange={(e) => handleChange('form_button_en', e.target.value)}
                error={fieldErrors.form_button_en}
                disabled={!canEdit}
                maxLength={120}
              />
            </div>
            <div style={{ marginTop: '1rem' }}>
              <CMSTextarea
                label={t('starterForm.successMessage')}
                value={formData.success_message_en || ''}
                onChange={(e) => handleChange('success_message_en', e.target.value)}
                error={fieldErrors.success_message_en}
                disabled={!canEdit}
                rows={2}
              />
            </div>
            <div style={{ marginTop: '1rem' }}>
              <CMSTextarea
                label={t('starterForm.successNote')}
                value={formData.success_note_en || ''}
                onChange={(e) => handleChange('success_note_en', e.target.value)}
                error={fieldErrors.success_note_en}
                disabled={!canEdit}
                rows={2}
                hint={t('starterForm.successNoteHint')}
              />
            </div>
            <div style={{ marginTop: '1rem' }}>
              <CMSTextarea
                label={t('starterForm.closedMessage')}
                value={formData.closed_message_en || ''}
                onChange={(e) => handleChange('closed_message_en', e.target.value)}
                error={fieldErrors.closed_message_en}
                disabled={!canEdit}
                rows={2}
                hint={t('starterForm.closedMessageHint')}
              />
            </div>
          </Section>

          {/* Arabic content */}
          <Section title={t('starterForm.arabicSection')}>
            <CMSInput
              label={t('starterForm.formTitle')}
              value={formData.form_title_ar || ''}
              onChange={(e) => handleChange('form_title_ar', e.target.value)}
              error={fieldErrors.form_title_ar}
              disabled={!canEdit}
              dir="rtl"
              maxLength={255}
            />
            <div style={{ marginTop: '1rem' }}>
              <CMSTextarea
                label={t('starterForm.formDescription')}
                value={formData.form_description_ar || ''}
                onChange={(e) => handleChange('form_description_ar', e.target.value)}
                error={fieldErrors.form_description_ar}
                disabled={!canEdit}
                dir="rtl"
                rows={2}
              />
            </div>
            <div style={{ marginTop: '1rem' }}>
              <CMSInput
                label={t('starterForm.formButton')}
                value={formData.form_button_ar || ''}
                onChange={(e) => handleChange('form_button_ar', e.target.value)}
                error={fieldErrors.form_button_ar}
                disabled={!canEdit}
                dir="rtl"
                maxLength={120}
              />
            </div>
            <div style={{ marginTop: '1rem' }}>
              <CMSTextarea
                label={t('starterForm.successMessage')}
                value={formData.success_message_ar || ''}
                onChange={(e) => handleChange('success_message_ar', e.target.value)}
                error={fieldErrors.success_message_ar}
                disabled={!canEdit}
                dir="rtl"
                rows={2}
              />
            </div>
            <div style={{ marginTop: '1rem' }}>
              <CMSTextarea
                label={t('starterForm.successNote')}
                value={formData.success_note_ar || ''}
                onChange={(e) => handleChange('success_note_ar', e.target.value)}
                error={fieldErrors.success_note_ar}
                disabled={!canEdit}
                dir="rtl"
                rows={2}
                hint={t('starterForm.successNoteHint')}
              />
            </div>
            <div style={{ marginTop: '1rem' }}>
              <CMSTextarea
                label={t('starterForm.closedMessage')}
                value={formData.closed_message_ar || ''}
                onChange={(e) => handleChange('closed_message_ar', e.target.value)}
                error={fieldErrors.closed_message_ar}
                disabled={!canEdit}
                dir="rtl"
                rows={2}
                hint={t('starterForm.closedMessageHint')}
              />
            </div>
          </Section>

          {/* Save bar */}
          {canEdit && (
            <div style={styles.saveBar}>
              <CMSButton variant="primary" onClick={handleSave} loading={saving} disabled={!dirty}>
                {t('action.save')}
              </CMSButton>
              <CMSButton variant="secondary" onClick={() => setPreviewOpen(true)}>
                {t('starterForm.preview')}
              </CMSButton>
              {dirty && (
                <CMSButton variant="ghost" onClick={handleCancel} disabled={saving}>
                  {t('action.cancel')}
                </CMSButton>
              )}
              {dirty && <span style={styles.dirtyIndicator}>{t('msg.unsavedIndicator')}</span>}
            </div>
          )}
        </div>
      )}

      {/* Preview Modal */}
      {formData && (
        <StarterFormPreviewModal
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          config={formData}
        />
      )}
    </CMSLayout>
  );
}

function Section({ title, children }) {
  return (
    <div style={styles.section}>
      <h3 style={styles.sectionTitle}>{title}</h3>
      {children}
    </div>
  );
}

const styles = {
  formContainer: {
    maxWidth: '760px',
  },
  section: {
    background: 'var(--cms-bg-surface)',
    border: '1px solid var(--cms-border-default)',
    borderRadius: 'var(--cms-radius-lg)',
    padding: '1.25rem',
    marginBottom: '1rem',
  },
  sectionTitle: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'var(--cms-accent)',
    marginBottom: '1rem',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  sectionHint: {
    fontSize: '0.75rem',
    color: 'var(--cms-text-muted)',
    marginTop: '0.5rem',
    marginBottom: 0,
  },
  saveBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem 0',
  },
  dirtyIndicator: {
    fontSize: '0.75rem',
    color: 'var(--cms-warning, #f59e0b)',
  },
};
