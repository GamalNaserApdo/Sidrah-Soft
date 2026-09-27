/**
 * CMS Services List Page — /cms/services
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
import { listServices, deleteService } from '../../services/cms/servicesApi';
import { parseApiError } from '../../services/cms/cmsFetch';

export default function CMSServicesPage() {
  const { hasCapability } = useAuth();
  const { t } = useCMSLang();
  const { showSuccess, showError } = useToast();

  const canCreate = hasCapability('services.create');
  const canUpdate = hasCapability('services.update');
  const canDelete = hasCapability('services.delete');

  const list = useCMSList(listServices);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteService(deleteTarget.id);
      showSuccess(t('msg.deleted'));
      list.refresh();
    } catch (err) {
      showError(parseApiError(err));
      throw err;
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, showSuccess, showError, t, list]);

  return (
    <CMSLayout>
      <CMSPageHeader
        title={t('nav.services')}
        actions={canCreate && <Link to="/cms/services/new"><CMSButton variant="primary">+ {t('action.addNew')}</CMSButton></Link>}
      />

      <CMSToolbar search={list.search} onSearchChange={list.setSearch} onSearchSubmit={() => list.refresh()}>
        <CMSSelect value={list.filters.active || ''} onChange={(e) => list.setFilter('active', e.target.value)}>
          <option value="">{t('filter.allStatuses')}</option>
          <option value="true">{t('filter.active')}</option>
          <option value="false">{t('filter.inactive')}</option>
        </CMSSelect>
        <CMSSelect value={list.filters.featured || ''} onChange={(e) => list.setFilter('featured', e.target.value)}>
          <option value="">{t('filter.all')}</option>
          <option value="true">{t('filter.featured')}</option>
        </CMSSelect>
      </CMSToolbar>

      {list.loading && <CMSLoadingState />}
      {list.error && <CMSErrorState message={list.error} onRetry={list.refresh} />}
      {!list.loading && !list.error && list.items.length === 0 && <CMSEmptyState message={t('state.empty')} />}
      {!list.loading && !list.error && list.items.length > 0 && (
        <>
          <CMSTable columns={[
            { key: 'name', label: t('col.name') },
            { key: 'slug', label: t('col.slug') },
            { key: 'order', label: t('col.order'), align: 'center' },
            { key: 'status', label: t('col.status') },
            { key: 'actions', label: t('col.actions'), align: 'right' },
          ]}>
            {list.items.map((service) => (
              <CMSTableRow key={service.id}>
                <CMSTableCell>
                  {service.icon_url && <img src={service.icon_url} alt="" style={styles.icon} />}
                  {service.name_en || service.name_ar}
                </CMSTableCell>
                <CMSTableCell><code className="cms-slug">{service.slug}</code></CMSTableCell>
                <CMSTableCell align="center">{service.display_order}</CMSTableCell>
                <CMSTableCell>
                  <div style={styles.badges}>
                    <StatusBadge status={service.is_active ? 'active' : 'inactive'} />
                    {service.is_featured && <CMSBadge type="accent" size="xs">{t('badge.featured')}</CMSBadge>}
                    {service.show_on_homepage && <CMSBadge type="info" size="xs">{t('badge.homepage')}</CMSBadge>}
                  </div>
                </CMSTableCell>
                <CMSTableCell align="right">
                  {canUpdate && <Link to={`/cms/services/${service.id}`}><TableActionButton>{t('action.edit')}</TableActionButton></Link>}
                  {canDelete && <TableActionButton variant="danger" onClick={() => setDeleteTarget(service)}>{t('action.delete')}</TableActionButton>}
                </CMSTableCell>
              </CMSTableRow>
            ))}
          </CMSTable>
          <CMSPagination page={list.page} totalPages={list.totalPages} onPageChange={list.setPage} count={list.count} />
        </>
      )}

      <CMSConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        message={t('confirm.delete.message', { name: deleteTarget?.name_en })}
      />
    </CMSLayout>
  );
}

const styles = {
  icon: { width: '20px', height: '20px', objectFit: 'contain', marginInlineEnd: '0.5rem', verticalAlign: 'middle' },
  badges: { display: 'flex', gap: '0.375rem' },
};
