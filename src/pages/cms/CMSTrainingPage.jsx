import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import CMSLayout from '../../components/cms/layout/CMSLayout';
import CMSPageHeader from '../../components/cms/ui/CMSPageHeader';
import CMSToolbar from '../../components/cms/ui/CMSToolbar';
import { CMSTable, CMSTableRow, CMSTableCell, TableActionButton } from '../../components/cms/ui/CMSTable';
import CMSPagination from '../../components/cms/ui/CMSPagination';
import CMSButton from '../../components/cms/ui/CMSButton';
import CMSBadge, { StatusBadge } from '../../components/cms/ui/CMSBadge';
import { CMSSelect } from '../../components/cms/ui/CMSFormInputs';
import { CMSLoadingState, CMSErrorState, CMSEmptyState } from '../../components/cms/ui/CMSStateViews';
import CMSConfirmDialog from '../../components/cms/ui/CMSConfirmDialog';
import { useCMSList } from '../../hooks/cms/useCMSList';
import { useAuth } from '../../contexts/AuthContext';
import { useCMSLang } from '../../contexts/CMSLanguageContext';
import { useToast } from '../../contexts/CMSToastContext';
import { listPrograms, deleteProgram } from '../../services/cms/trainingApi';
import { parseApiError } from '../../services/cms/cmsFetch';

const BRANCH_LABELS = {
  professional: 'Professional Training',
  secondary: 'Secondary / Baccalaureate',
};

const STATUS_CLASSES = {
  draft: 'default',
  active: 'success',
  archived: 'muted',
};

export default function CMSTrainingPage() {
  const { t } = useCMSLang();
  const { hasCapability } = useAuth();
  const { showSuccess, showError } = useToast();

  const canCreate = hasCapability('training.create');
  const canUpdate = hasCapability('training.update');
  const canDelete = hasCapability('training.delete');

  const list = useCMSList(listPrograms);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProgram(deleteTarget.id);
      showSuccess(t('msg.deleted'));
      list.refresh();
    } catch (err) {
      showError(parseApiError(err));
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, showSuccess, showError, t, list]);

  return (
    <CMSLayout>
      <CMSPageHeader
        title={t('nav.training')}
        actions={
          canCreate && (
            <Link to="/cms/training/new">
              <CMSButton variant="primary">+ {t('action.addNew')}</CMSButton>
            </Link>
          )
        }
      />

      <CMSToolbar search={list.search} onSearchChange={list.setSearch} onSearchSubmit={() => list.refresh()}>
        <CMSSelect value={list.filters.branch || ''} onChange={(e) => list.setFilter('branch', e.target.value)}>
          <option value="">{t('training.branch.all') || 'All branches'}</option>
          <option value="professional">{BRANCH_LABELS.professional}</option>
          <option value="secondary">{BRANCH_LABELS.secondary}</option>
        </CMSSelect>
        <CMSSelect value={list.filters.status || ''} onChange={(e) => list.setFilter('status', e.target.value)}>
          <option value="">{t('training.status.all') || 'All statuses'}</option>
          <option value="draft">{t('training.status.draft')}</option>
          <option value="active">{t('training.status.active')}</option>
          <option value="archived">{t('training.status.archived')}</option>
        </CMSSelect>
      </CMSToolbar>

      {list.loading && <CMSLoadingState />}
      {list.error && <CMSErrorState message={list.error} onRetry={list.refresh} />}
      {!list.loading && !list.error && list.items.length === 0 && (
        <CMSEmptyState message={t('state.empty')} />
      )}
      {!list.loading && !list.error && list.items.length > 0 && (
        <>
          <CMSTable
            columns={[
              { key: 'title', label: t('form.title') },
              { key: 'slug', label: t('form.slug') },
              { key: 'branch', label: t('form.branch') },
              { key: 'order', label: t('form.order'), align: 'center' },
              { key: 'status', label: t('form.status') },
              { key: 'actions', label: '', align: 'right' },
            ]}
          >
            {list.items.map((program) => (
              <CMSTableRow key={program.id}>
                <CMSTableCell>
                  {program.image_url && (
                    <img src={program.image_url} alt="" style={styles.logo} />
                  )}
                  <span>{program.title_en || program.title_ar}</span>
                </CMSTableCell>
                <CMSTableCell><code style={styles.slug}>{program.slug}</code></CMSTableCell>
                <CMSTableCell>{BRANCH_LABELS[program.branch] || program.branch}</CMSTableCell>
                <CMSTableCell align="center">{program.display_order}</CMSTableCell>
                <CMSTableCell>
                  <StatusBadge status={program.status} type={STATUS_CLASSES[program.status] || 'default'} />
                </CMSTableCell>
                <CMSTableCell align="right">
                  {canUpdate && (
                    <Link to={`/cms/training/${program.id}`}>
                      <TableActionButton>{t('action.edit')}</TableActionButton>
                    </Link>
                  )}
                  {canDelete && (
                    <TableActionButton
                      onClick={() => setDeleteTarget(program)}
                      style={{ color: '#ef4444' }}
                    >
                      {t('action.delete')}
                    </TableActionButton>
                  )}
                </CMSTableCell>
              </CMSTableRow>
            ))}
          </CMSTable>
          <CMSPagination
            page={list.page}
            totalPages={list.totalPages}
            onPageChange={list.setPage}
            count={list.count}
          />
        </>
      )}

      <CMSConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        message={t('training.deleteConfirm', { title: deleteTarget?.title_en || deleteTarget?.title_ar })}
      />
    </CMSLayout>
  );
}

const styles = {
  logo: {
    width: '28px',
    height: '28px',
    objectFit: 'cover',
    borderRadius: '4px',
    marginRight: '0.5rem',
    verticalAlign: 'middle',
  },
  slug: {
    fontSize: '0.6875rem',
    background: '#1a1a2e',
    padding: '0.125rem 0.375rem',
    borderRadius: '3px',
    color: '#888',
  },
};
