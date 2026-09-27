/**
 * CMS Forms List Page — /cms/forms
 */

import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import CMSLayout from '../../components/cms/layout/CMSLayout';
import CMSPageHeader from '../../components/cms/ui/CMSPageHeader';
import CMSToolbar from '../../components/cms/ui/CMSToolbar';
import { CMSTable, CMSTableRow, CMSTableCell, TableActionButton } from '../../components/cms/ui/CMSTable';
import CMSPagination from '../../components/cms/ui/CMSPagination';
import CMSButton from '../../components/cms/ui/CMSButton';
import { StatusBadge } from '../../components/cms/ui/CMSBadge';
import { CMSSelect } from '../../components/cms/ui/CMSFormInputs';
import { CMSLoadingState, CMSErrorState, CMSEmptyState } from '../../components/cms/ui/CMSStateViews';
import CMSConfirmDialog from '../../components/cms/ui/CMSConfirmDialog';
import { useCMSList } from '../../hooks/cms/useCMSList';
import { useAuth } from '../../contexts/AuthContext';
import { useCMSLang } from '../../contexts/CMSLanguageContext';
import { useToast } from '../../contexts/CMSToastContext';
import { listForms, deleteForm } from '../../services/cms/formsApi';
import { parseApiError } from '../../services/cms/cmsFetch';

export default function CMSFormsPage() {
  const { hasCapability } = useAuth();
  const { t } = useCMSLang();
  const { showSuccess, showError } = useToast();
  const canCreate = hasCapability('forms.create');
  const canUpdate = hasCapability('forms.update');
  const canDelete = hasCapability('forms.delete');

  const list = useCMSList(listForms);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteForm(deleteTarget.id);
      showSuccess(t('msg.deleted'));
      list.refresh();
    } catch (err) { showError(parseApiError(err)); throw err; }
    finally { setDeleting(false); }
  }, [deleteTarget, showSuccess, showError, t, list]);

  return (
    <CMSLayout>
      <CMSPageHeader
        title={t('nav.forms')}
        actions={canCreate && <Link to="/cms/forms/new"><CMSButton variant="primary">+ {t('action.addNew')}</CMSButton></Link>}
      />
      <CMSToolbar search={list.search} onSearchChange={list.setSearch} onSearchSubmit={() => list.refresh()}>
        <CMSSelect value={list.filters.active || ''} onChange={(e) => list.setFilter('active', e.target.value)}>
          <option value="">{t('filter.allStatuses')}</option>
          <option value="true">{t('filter.active')}</option>
          <option value="false">{t('filter.inactive')}</option>
        </CMSSelect>
      </CMSToolbar>

      {list.loading && <CMSLoadingState />}
      {list.error && <CMSErrorState message={list.error} onRetry={list.refresh} />}
      {!list.loading && !list.error && list.items.length === 0 && <CMSEmptyState message={t('state.empty')} />}
      {!list.loading && !list.error && list.items.length > 0 && (
        <>
          <CMSTable columns={[
            { key: 'name', label: 'Name' },
            { key: 'slug', label: 'Slug' },
            { key: 'submissions', label: 'Submissions', align: 'center' },
            { key: 'status', label: t('col.status') },
            { key: 'actions', label: t('col.actions'), align: 'right' },
          ]}>
            {list.items.map((form) => (
              <CMSTableRow key={form.id}>
                <CMSTableCell>
                  <Link to={`/cms/forms/${form.id}`} style={{ fontWeight: 600 }}>
                    {form.name}
                  </Link>
                  <div style={{ fontSize: '0.75rem', color: 'var(--cms-text-muted)', marginTop: '0.25rem' }}>
                    {form.title_en || form.title_ar}
                  </div>
                </CMSTableCell>
                <CMSTableCell><code className="cms-slug">{form.slug}</code></CMSTableCell>
                <CMSTableCell align="center">{form.submission_count ?? 0}</CMSTableCell>
                <CMSTableCell>
                  <StatusBadge status={form.is_active ? 'active' : 'inactive'} />
                </CMSTableCell>
                <CMSTableCell align="right">
                  {canUpdate && <Link to={`/cms/forms/${form.id}`}><TableActionButton>{t('action.edit')}</TableActionButton></Link>}
                  {canUpdate && <Link to={`/cms/forms/${form.id}/submissions`}><TableActionButton>Submissions</TableActionButton></Link>}
                  {canDelete && <TableActionButton variant="danger" onClick={() => setDeleteTarget(form)}>{t('action.delete')}</TableActionButton>}
                </CMSTableCell>
              </CMSTableRow>
            ))}
          </CMSTable>
          <CMSPagination page={list.page} totalPages={list.totalPages} onPageChange={list.setPage} count={list.count} />
        </>
      )}

      <CMSConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting}
        message={`Delete form "${deleteTarget?.name}"? Forms with submissions cannot be deleted.`} />
    </CMSLayout>
  );
}
