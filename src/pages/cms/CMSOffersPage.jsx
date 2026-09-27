/**
 * CMS Offers Page — /cms/training/offers
 * Campaign list with lifecycle status (active/scheduled/expired/inactive),
 * start/end dates, item counts, and priority. Reuses the 'training' CMS
 * module RBAC (training.view/create/update/delete).
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
import { listOfferCampaigns, deleteOfferCampaign } from '../../services/cms/offersApi';
import { parseApiError } from '../../services/cms/cmsFetch';

const STATUS_CLASSES = {
  active: 'success',
  scheduled: 'info',
  expired: 'muted',
  inactive: 'default',
};

const STATUS_LABELS = {
  active: 'Active',
  scheduled: 'Scheduled',
  expired: 'Expired',
  inactive: 'Inactive',
};

function formatDate(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return value;
  }
}

export default function CMSOffersPage() {
  const { t } = useCMSLang();
  const { hasCapability } = useAuth();
  const { showSuccess, showError } = useToast();

  const canCreate = hasCapability('training.create');
  const canDelete = hasCapability('training.delete');

  const list = useCMSList(listOfferCampaigns);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteOfferCampaign(deleteTarget.id);
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
        title={t('nav.offers') || 'Training Offers'}
        actions={
          canCreate && (
            <Link to="/cms/training/offers/new">
              <CMSButton variant="primary">+ {t('action.addNew')}</CMSButton>
            </Link>
          )
        }
      />

      <CMSToolbar search={list.search} onSearchChange={list.setSearch} onSearchSubmit={() => list.refresh()}>
        <CMSSelect value={list.filters.status || ''} onChange={(e) => list.setFilter('status', e.target.value)}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="scheduled">Scheduled</option>
          <option value="expired">Expired</option>
          <option value="inactive">Inactive</option>
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
              { key: 'status', label: t('form.status') },
              { key: 'start', label: 'Starts', align: 'center' },
              { key: 'end', label: 'Ends', align: 'center' },
              { key: 'courses', label: 'Courses', align: 'center' },
              { key: 'priority', label: 'Priority', align: 'center' },
              { key: 'actions', label: '', align: 'right' },
            ]}
          >
            {list.items.map((campaign) => (
              <CMSTableRow key={campaign.id}>
                <CMSTableCell>
                  <div>
                    <strong>{campaign.title_en || campaign.title_ar}</strong>
                    {campaign.title_ar && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--cms-text-muted)' }} dir="rtl">
                        {campaign.title_ar}
                      </div>
                    )}
                    <code className="cms-slug" style={{ fontSize: '0.75rem' }}>{campaign.slug}</code>
                  </div>
                </CMSTableCell>
                <CMSTableCell>
                  <StatusBadge
                    status={STATUS_LABELS[campaign.status] || campaign.status}
                    type={STATUS_CLASSES[campaign.status] || 'default'}
                  />
                </CMSTableCell>
                <CMSTableCell align="center">{formatDate(campaign.start_date)}</CMSTableCell>
                <CMSTableCell align="center">{formatDate(campaign.end_date)}</CMSTableCell>
                <CMSTableCell align="center">{campaign.item_count}</CMSTableCell>
                <CMSTableCell align="center">{campaign.priority}</CMSTableCell>
                <CMSTableCell align="right">
                  <Link to={`/cms/training/offers/${campaign.id}`}>
                    <TableActionButton>{t('action.edit')}</TableActionButton>
                  </Link>
                  {canDelete && (
                    <TableActionButton
                      variant="danger"
                      onClick={() => setDeleteTarget(campaign)}
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
        open={Boolean(deleteTarget)}
        title={t('action.delete')}
        message={`Delete campaign "${deleteTarget?.title_en}"? This also removes its offer items.`}
        confirmLabel={t('action.delete')}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </CMSLayout>
  );
}
