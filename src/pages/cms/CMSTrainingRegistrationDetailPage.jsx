import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import CMSLayout from '../../components/cms/layout/CMSLayout';
import CMSPageHeader from '../../components/cms/ui/CMSPageHeader';
import CMSButton from '../../components/cms/ui/CMSButton';
import CMSConfirmDialog from '../../components/cms/ui/CMSConfirmDialog';
import { CMSLoadingState, CMSErrorState } from '../../components/cms/ui/CMSStateViews';
import { useCMSLang } from '../../contexts/CMSLanguageContext';
import { useToast } from '../../contexts/CMSToastContext';
import { parseApiError } from '../../services/cms/cmsFetch';
import RegistrationFormFields from '../../components/cms/training/RegistrationFormFields';
import useRegistrationForm from '../../hooks/cms/useRegistrationForm';

export default function CMSTrainingRegistrationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useCMSLang();
  const { showError } = useToast();

  const isNew = !id;

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
    canEdit,
    canDelete,
    load,
    handleChange,
    handleSave,
    handleDelete,
  } = useRegistrationForm({
    id,
    isNew,
    onSaveSuccess: () => navigate('/cms/training/registrations'),
    onDeleteSuccess: () => navigate('/cms/training/registrations'),
  });

  const [deleteOpen, setDeleteOpen] = useState(false);

  const onDeleteConfirm = async () => {
    try {
      await handleDelete();
      setDeleteOpen(false);
    } catch (err) {
      setDeleteOpen(false);
      showError(err?.data?.code === 'registration_has_certificate'
        ? t('registration.deleteBlockedCertificate')
        : parseApiError(err));
    }
  };

  if (loading) return <CMSLayout><CMSLoadingState /></CMSLayout>;
  if (error) return <CMSLayout><CMSErrorState message={error} onRetry={load} /></CMSLayout>;

  return (
    <CMSLayout unsavedChanges={dirty}>
      <CMSPageHeader
        title={isNew ? t('training.newRegistration') || 'New Registration' : (data.full_name || t('training.registration'))}
        actions={
          <>
            {!isNew && canDelete && (
              <CMSButton variant="danger" onClick={() => setDeleteOpen(true)}>
                {t('registration.deleteTitle')}
              </CMSButton>
            )}
            <Link to="/cms/training/registrations">
              <CMSButton variant="secondary">{t('action.cancel')}</CMSButton>
            </Link>
            {canEdit && (
              <CMSButton variant="primary" onClick={handleSave} loading={saving} disabled={!dirty && !isNew}>
                {t('action.save')}
              </CMSButton>
            )}
          </>
        }
      />

      <div style={{ maxWidth: '720px' }}>
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
        />
      </div>

      <CMSConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={onDeleteConfirm}
        variant="danger"
        title={t('registration.deleteTitle')}
        confirmLabel={t('registration.deletePermanently')}
        message={
          <>
            {t('registration.deleteConfirm')} {t('registration.deleteIrreversible')}
            <br /><br />
            <strong>#{id}</strong> — {record?.full_name || '—'}
            <br />
            {record?.email || '—'}
            <br />
            {record?.program_title || record?.program || '—'} — {record?.submitted_at || record?.created_at
              ? new Date(record.submitted_at || record.created_at).toLocaleString()
              : '—'}
          </>
        }
      />
    </CMSLayout>
  );
}
