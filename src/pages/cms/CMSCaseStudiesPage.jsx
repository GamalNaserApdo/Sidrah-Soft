/**
 * CMS Case Studies List Page — /cms/case-studies
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
import { listCaseStudies, deleteCaseStudy } from '../../services/cms/caseStudiesApi';
import { parseApiError } from '../../services/cms/cmsFetch';

export default function CMSCaseStudiesPage() {
  const { hasCapability } = useAuth();
  const { t } = useCMSLang();
  const { showSuccess, showError } = useToast();
  const canCreate = hasCapability('case_studies.create');
  const canUpdate = hasCapability('case_studies.update');
  const canDelete = hasCapability('case_studies.delete');

  const list = useCMSList(listCaseStudies);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCaseStudy(deleteTarget.id);
      showSuccess(t('msg.deleted'));
      list.refresh();
    } catch (err) { showError(parseApiError(err)); throw err; }
    finally { setDeleting(false); }
  }, [deleteTarget, showSuccess, showError, t, list]);

  return (
    <CMSLayout>
      <CMSPageHeader
        title={t('nav.caseStudies')}
        actions={canCreate && <Link to="/cms/case-studies/new"><CMSButton variant="primary">+ {t('action.addNew')}</CMSButton></Link>}
      />
      <CMSToolbar search={list.search} onSearchChange={list.setSearch} onSearchSubmit={() => list.refresh()}>
        <CMSSelect value={list.filters.active || ''} onChange={(e) => list.setFilter('active', e.target.value)}>
          <option value="">All statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </CMSSelect>
        <CMSSelect value={list.filters.featured || ''} onChange={(e) => list.setFilter('featured', e.target.value)}>
          <option value="">All</option>
          <option value="true">Featured</option>
        </CMSSelect>
      </CMSToolbar>

      {list.loading && <CMSLoadingState />}
      {list.error && <CMSErrorState message={list.error} onRetry={list.refresh} />}
      {!list.loading && !list.error && list.items.length === 0 && <CMSEmptyState message={t('state.empty')} />}
      {!list.loading && !list.error && list.items.length > 0 && (
        <>
          <CMSTable columns={[
            { key: 'title', label: 'Title' },
            { key: 'slug', label: 'Slug' },
            { key: 'client', label: 'Client' },
            { key: 'order', label: 'Order', align: 'center' },
            { key: 'status', label: 'Status' },
            { key: 'actions', label: '', align: 'right' },
          ]}>
            {list.items.map((cs) => (
              <CMSTableRow key={cs.id}>
                <CMSTableCell>{cs.title_en || cs.title_ar}</CMSTableCell>
                <CMSTableCell><code style={styles.slug}>{cs.slug}</code></CMSTableCell>
                <CMSTableCell>{cs.client_name_en || cs.client_name_ar || '—'}</CMSTableCell>
                <CMSTableCell align="center">{cs.display_order}</CMSTableCell>
                <CMSTableCell>
                  <div style={styles.badges}>
                    <StatusBadge status={cs.is_active ? 'active' : 'inactive'} />
                    {cs.is_featured && <CMSBadge type="accent" size="xs">Featured</CMSBadge>}
                    {cs.show_on_homepage && <CMSBadge type="info" size="xs">Homepage</CMSBadge>}
                  </div>
                </CMSTableCell>
                <CMSTableCell align="right">
                  {canUpdate && <Link to={`/cms/case-studies/${cs.id}`}><TableActionButton>{t('action.edit')}</TableActionButton></Link>}
                  {canDelete && <TableActionButton onClick={() => setDeleteTarget(cs)} style={{ color: '#ef4444' }}>{t('action.delete')}</TableActionButton>}
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

const styles = { slug: { fontSize: '0.6875rem', background: '#1a1a2e', padding: '0.125rem 0.375rem', borderRadius: '3px', color: '#888' }, badges: { display: 'flex', gap: '0.375rem' } };
