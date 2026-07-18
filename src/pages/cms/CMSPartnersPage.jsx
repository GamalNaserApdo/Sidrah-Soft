/**
 * CMS Partners List Page — /cms/partners
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
import { listPartners, deletePartner } from '../../services/cms/partnersApi';
import { parseApiError } from '../../services/cms/cmsFetch';

export default function CMSPartnersPage() {
  const { hasCapability } = useAuth();
  const { t } = useCMSLang();
  const { showSuccess, showError } = useToast();

  const canCreate = hasCapability('partners.create');
  const canUpdate = hasCapability('partners.update');
  const canDelete = hasCapability('partners.delete');

  const list = useCMSList(listPartners);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deletePartner(deleteTarget.id);
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
        title={t('nav.partners')}
        actions={
          canCreate && (
            <Link to="/cms/partners/new">
              <CMSButton variant="primary">+ {t('action.addNew')}</CMSButton>
            </Link>
          )
        }
      />

      <CMSToolbar search={list.search} onSearchChange={list.setSearch} onSearchSubmit={() => list.refresh()}>
        <CMSSelect value={list.filters.active || ''} onChange={(e) => list.setFilter('active', e.target.value)}>
          <option value="">All statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </CMSSelect>
        <CMSSelect value={list.filters.featured || ''} onChange={(e) => list.setFilter('featured', e.target.value)}>
          <option value="">All types</option>
          <option value="true">Featured</option>
          <option value="false">Not Featured</option>
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
              { key: 'name', label: 'Name' },
              { key: 'slug', label: 'Slug' },
              { key: 'type', label: 'Type' },
              { key: 'order', label: 'Order', align: 'center' },
              { key: 'status', label: 'Status' },
              { key: 'actions', label: '', align: 'right' },
            ]}
          >
            {list.items.map((partner) => (
              <CMSTableRow key={partner.id}>
                <CMSTableCell>
                  {partner.logo_url && (
                    <img src={partner.logo_url} alt="" style={styles.logo} />
                  )}
                  <span>{partner.name_en || partner.name_ar}</span>
                </CMSTableCell>
                <CMSTableCell><code style={styles.slug}>{partner.slug}</code></CMSTableCell>
                <CMSTableCell>{partner.partner_type}</CMSTableCell>
                <CMSTableCell align="center">{partner.display_order}</CMSTableCell>
                <CMSTableCell>
                  <div style={styles.badges}>
                    <StatusBadge status={partner.is_active ? 'active' : 'inactive'} />
                    {partner.is_featured && <CMSBadge type="accent" size="xs">Featured</CMSBadge>}
                  </div>
                </CMSTableCell>
                <CMSTableCell align="right">
                  {canUpdate && (
                    <Link to={`/cms/partners/${partner.id}`}>
                      <TableActionButton>{t('action.edit')}</TableActionButton>
                    </Link>
                  )}
                  {canDelete && (
                    <TableActionButton
                      onClick={() => setDeleteTarget(partner)}
                      style={{ color: '#ef4444' }}
                    >
                      {t('action.delete')}
                    </TableActionButton>
                  )}
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
        message={t('confirm.delete.message', { name: deleteTarget?.name_en || deleteTarget?.name_ar })}
      />
    </CMSLayout>
  );
}

const styles = {
  logo: {
    width: '24px',
    height: '24px',
    objectFit: 'contain',
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
  badges: {
    display: 'flex',
    gap: '0.375rem',
  },
};
