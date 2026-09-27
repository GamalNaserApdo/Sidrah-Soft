import { useState, useEffect } from 'react';
import CMSDialog from '../ui/CMSDialog';
import CMSButton from '../ui/CMSButton';
import CMSConfirmDialog from '../ui/CMSConfirmDialog';
import { CMSTextarea } from '../ui/CMSFormInputs';
import RegistrationFormFields from './RegistrationFormFields';
import useRegistrationForm from '../../../hooks/cms/useRegistrationForm';
import { useCMSLang } from '../../../contexts/CMSLanguageContext';
import { useToast } from '../../../contexts/CMSToastContext';
import { parseApiError } from '../../../services/cms/cmsFetch';

export default function RegistrationDetailModal({
  registrationId,
  open,
  onClose,
  onSaved,
  onDeleted,
}) {
  const { t } = useCMSLang();
  const { showError } = useToast();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [unsavedOpen, setUnsavedOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelNote, setCancelNote] = useState('');

  const {
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
  } = useRegistrationForm({
    id: registrationId,
    isNew: false,
    simplified: true,
    onSaveSuccess: onSaved,
    onDeleteSuccess: () => {
      setDeleteOpen(false);
      onDeleted?.();
      onClose();
    },
  });

  useEffect(() => {
    if (open) {
      load();
    }
  }, [open, load]);

  const handleCloseAttempt = () => {
    if (dirty) {
      setUnsavedOpen(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    setUnsavedOpen(false);
    onClose();
  };

  const handleDeleteClick = () => {
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await handleDelete();
    } catch (err) {
      showError(err?.data?.code === 'registration_has_certificate'
        ? t('registration.deleteBlockedCertificate')
        : parseApiError(err));
      throw err;
    }
  };

  const title = `${t('registration.details') || 'Registration Details'}${record?.full_name ? ` — ${record.full_name}` : ''}`;

  return (
    <CMSDialog
      open={open}
      onClose={handleCloseAttempt}
      title={title}
      size="xl"
      footer={
        <>
          {canDelete && (
            <CMSButton variant="danger" onClick={handleDeleteClick}>
              {t('registration.deleteTitle')}
            </CMSButton>
          )}
          <div style={{ marginInlineStart: 'auto', display: 'flex', gap: 'var(--space-3)' }}>
            <CMSButton variant="secondary" onClick={handleCloseAttempt}>
              {t('action.close')}
            </CMSButton>
            {canEdit && (
              <CMSButton
                variant="primary"
                onClick={handleSave}
                loading={saving}
                disabled={!dirty}
              >
                {t('action.save')}
              </CMSButton>
            )}
          </div>
        </>
      }
    >
      <RegistrationFormFields
        data={data}
        record={record}
        programs={programs}
        fieldErrors={fieldErrors}
        canEdit={canEdit}
        isNew={isNew}
        programsLoading={programsLoading}
        loading={loading}
        error={error}
        onRetry={load}
        onChange={handleChange}
        onMarkContacted={handleMarkContacted}
        onToggleWhatsApp={handleToggleWhatsApp}
        onOperationalTransition={handleOperationalTransition}
        onCancelRequest={() => { setCancelNote(''); setCancelOpen(true); }}
        transitioning={transitioning}
        simplified
      />

      <CMSConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        variant="danger"
        title={t('registration.deleteTitle')}
        confirmLabel={t('registration.deletePermanently')}
        message={
          <>
            {t('registration.deleteConfirm')} {t('registration.deleteIrreversible')}
            <br /><br />
            <strong>#{registrationId}</strong> — {record?.full_name || '—'}
            <br />
            {record?.email || '—'}
            <br />
            {record?.program_title || record?.program || '—'} — {(record?.submitted_at || record?.created_at)
              ? new Date(record.submitted_at || record.created_at).toLocaleString()
              : '—'}
          </>
        }
      />

      {/* Cancel registration — optional note appended to internal notes */}
      <CMSDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title={t('registration.action.cancelRegistration') || 'Cancel Registration'}
        size="sm"
        footer={
          <>
            <CMSButton variant="secondary" onClick={() => setCancelOpen(false)}>
              {t('action.close') || 'Close'}
            </CMSButton>
            <CMSButton
              variant="danger"
              loading={transitioning}
              onClick={async () => {
                try {
                  await handleOperationalTransition('cancelled', cancelNote.trim() || undefined);
                  setCancelOpen(false);
                } catch { /* toast already shown */ }
              }}
            >
              {t('registration.action.confirmCancel') || 'Confirm Cancellation'}
            </CMSButton>
          </>
        }
      >
        <CMSTextarea
          label={t('registration.cancelNote') || 'Cancellation note (optional)'}
          value={cancelNote}
          onChange={(e) => setCancelNote(e.target.value)}
          rows={3}
        />
      </CMSDialog>

      <CMSConfirmDialog
        open={unsavedOpen}
        onClose={() => setUnsavedOpen(false)}
        onConfirm={handleConfirmClose}
        title={t('form.unsavedChanges') || 'Unsaved Changes'}
        confirmLabel={t('action.discard') || 'Discard'}
        message={t('form.unsavedChangesConfirm') || 'You have unsaved changes. Are you sure you want to close?'}
      />
    </CMSDialog>
  );
}
