/**
 * CMS Careers List Page — /cms/careers
 */

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
import { listJobs, deleteJob } from '../../services/cms/careersApi';
import { parseApiError } from '../../services/cms/cmsFetch';

export default function CMSCareersPage() {
  const { hasCapability } = useAuth();
  const { t } = useCMSLang();
  const { showSuccess, showError } = useToast();
  const canCreate = hasCapability('careers.create');
  const canUpdate = hasCapability('careers.update');
  const canDelete = hasCapability('careers.delete');

  const list = useCMSList(listJobs);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteJob(deleteTarget.id);
      showSuccess(t('msg.deleted'));
      list.refresh();
    } catch (err) { showError(parseApiError(err)); throw err; }
    finally { setDeleting(false); }
  }, [deleteTarget, showSuccess, showError, t, list]);

  return (
    <CMSLayout>
      <CMSPageHeader
        title={t('nav.careers')}
        actions={canCreate && <Link to="/cms/careers/new"><CMSButton variant="primary">+ {t('action.addNew')}</CMSButton></Link>}
      />
      <CMSToolbar search={list.search} onSearchChange={list.setSearch} onSearchSubmit={() => list.refresh()}>
        <CMSSelect value={list.filters.active || ''} onChange={(e) => list.setFilter('active', e.target.value)}>
          <option value="">All statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </CMSSelect>
        <CMSSelect value={list.filters.department || ''} onChange={(e) => list.setFilter('department', e.target.value)}>
          <option value="">All departments</option>
        </CMSSelect>
      </CMSToolbar>

      {list.loading && <CMSLoadingState />}
      {list.error && <CMSErrorState message={list.error} onRetry={list.refresh} />}
      {!list.loading && !list.error && list.items.length === 0 && <CMSEmptyState message={t('state.empty')} />}
      {!list.loading && !list.error && list.items.length > 0 && (
        <>
          <CMSTable columns={[
            { key: 'title', label: 'Title' },
            { key: 'department', label: 'Department' },
            { key: 'location', label: 'Location' },
            { key: 'type', label: 'Type' },
            { key: 'closing', label: 'Closing Date' },
            { key: 'status', label: 'Status' },
            { key: 'actions', label: '', align: 'right' },
          ]}>
            {list.items.map((job) => (
              <CMSTableRow key={job.id}>
                <CMSTableCell>{job.title_en || job.title_ar}</CMSTableCell>
                <CMSTableCell>{job.department_en || job.department_ar || '—'}</CMSTableCell>
                <CMSTableCell>{job.location_en || job.location_ar || '—'}</CMSTableCell>
                <CMSTableCell>{job.employment_type || '—'}</CMSTableCell>
                <CMSTableCell>{job.closing_date ? new Date(job.closing_date).toLocaleDateString() : '—'}</CMSTableCell>
                <CMSTableCell>
                  <div style={styles.badges}>
                    <StatusBadge status={job.is_active ? 'active' : 'inactive'} />
                    {job.is_featured && <CMSBadge type="accent" size="xs">Featured</CMSBadge>}
                  </div>
                </CMSTableCell>
                <CMSTableCell align="right">
                  {canUpdate && <Link to={`/cms/careers/${job.id}`}><TableActionButton>{t('action.edit')}</TableActionButton></Link>}
                  {canDelete && <TableActionButton onClick={() => setDeleteTarget(job)} style={{ color: '#ef4444' }}>{t('action.delete')}</TableActionButton>}
                </CMSTableCell>
              </CMSTableRow>
            ))}
          </CMSTable>
          <CMSPagination page={list.page} totalPages={list.totalPages} onPageChange={list.setPage} count={list.count} />
        </>
      )}

      <CMSConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting}
        message={t('confirm.delete.message', { name: deleteTarget?.title_en })} />
    </CMSLayout>
  );
}

const styles = { badges: { display: 'flex', gap: '0.375rem' } };
