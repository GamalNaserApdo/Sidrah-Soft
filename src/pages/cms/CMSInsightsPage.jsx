/**
 * CMS Insights List Page — /cms/insights
 *
 * Includes workflow actions: publish, unpublish, archive.
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
import { listArticles, deleteArticle, publishArticle, unpublishArticle, archiveArticle } from '../../services/cms/insightsApi';
import { parseApiError } from '../../services/cms/cmsFetch';

export default function CMSInsightsPage() {
  const { hasCapability } = useAuth();
  const { t } = useCMSLang();
  const { showSuccess, showError } = useToast();
  const canCreate = hasCapability('insights.create');
  const canUpdate = hasCapability('insights.update');
  const canDelete = hasCapability('insights.delete');
  const canPublish = hasCapability('insights.publish');

  const list = useCMSList(listArticles);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handleWorkflow = useCallback(async (action, article) => {
    setActionLoading(true);
    try {
      if (action === 'publish') await publishArticle(article.id);
      else if (action === 'unpublish') await unpublishArticle(article.id);
      else if (action === 'archive') await archiveArticle(article.id);
      else if (action === 'delete') await deleteArticle(article.id);
      showSuccess(
        action === 'delete' ? t('msg.deleted') :
        action === 'publish' ? t('msg.published') :
        action === 'unpublish' ? t('msg.unpublished') :
        t('msg.archived')
      );
      list.refresh();
    } catch (err) { showError(parseApiError(err)); throw err; }
    finally { setActionLoading(false); }
  }, [showSuccess, showError, t, list]);

  return (
    <CMSLayout>
      <CMSPageHeader
        title={t('nav.insights')}
        actions={canCreate && <Link to="/cms/insights/new"><CMSButton variant="primary">+ {t('action.addNew')}</CMSButton></Link>}
      />
      <CMSToolbar search={list.search} onSearchChange={list.setSearch} onSearchSubmit={() => list.refresh()}>
        <CMSSelect value={list.filters.status || ''} onChange={(e) => list.setFilter('status', e.target.value)}>
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </CMSSelect>
        <CMSSelect value={list.filters.content_type || ''} onChange={(e) => list.setFilter('content_type', e.target.value)}>
          <option value="">All types</option>
          <option value="insight">Insight</option>
          <option value="article">Article</option>
          <option value="news">News</option>
          <option value="announcement">Announcement</option>
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
            { key: 'title', label: t('form.title') },
            { key: 'type', label: t('form.contentType') },
            { key: 'category', label: t('form.category') },
            { key: 'status', label: t('form.status') },
            { key: 'date', label: t('form.publishedAt') },
            { key: 'actions', label: '', align: 'right' },
          ]}>
            {list.items.map((article) => (
              <CMSTableRow key={article.id}>
                <CMSTableCell>
                  {article.title_en || article.title_ar}
                </CMSTableCell>
                <CMSTableCell><CMSBadge type="default" size="xs">{article.content_type}</CMSBadge></CMSTableCell>
                <CMSTableCell>{article.category_en || article.category_ar || '—'}</CMSTableCell>
                <CMSTableCell>
                  <div style={styles.badges}>
                    <StatusBadge status={article.status} />
                    {article.is_featured && <CMSBadge type="accent" size="xs">Featured</CMSBadge>}
                  </div>
                </CMSTableCell>
                <CMSTableCell>{article.published_at ? new Date(article.published_at).toLocaleDateString() : '—'}</CMSTableCell>
                <CMSTableCell align="right">
                  <div style={styles.actions}>
                    {canUpdate && <Link to={`/cms/insights/${article.id}`}><TableActionButton>{t('action.edit')}</TableActionButton></Link>}
                    {canPublish && article.status === 'draft' && (
                      <TableActionButton onClick={() => setConfirmDialog({ action: 'publish', article })} style={{ color: '#22c55e' }}>{t('action.publish')}</TableActionButton>
                    )}
                    {canPublish && article.status === 'published' && (
                      <TableActionButton onClick={() => setConfirmDialog({ action: 'unpublish', article })}>{t('action.unpublish')}</TableActionButton>
                    )}
                    {canPublish && article.status !== 'archived' && (
                      <TableActionButton onClick={() => setConfirmDialog({ action: 'archive', article })} style={{ color: '#f59e0b' }}>{t('action.archive')}</TableActionButton>
                    )}
                    {canDelete && (
                      <TableActionButton onClick={() => setConfirmDialog({ action: 'delete', article })} style={{ color: '#ef4444' }}>{t('action.delete')}</TableActionButton>
                    )}
                  </div>
                </CMSTableCell>
              </CMSTableRow>
            ))}
          </CMSTable>
          <CMSPagination page={list.page} totalPages={list.totalPages} onPageChange={list.setPage} count={list.count} />
        </>
      )}

      <CMSConfirmDialog
        open={!!confirmDialog}
        onClose={() => setConfirmDialog(null)}
        onConfirm={() => handleWorkflow(confirmDialog.action, confirmDialog.article)}
        loading={actionLoading}
        title={confirmDialog?.action === 'delete' ? t('confirm.delete.title') :
               confirmDialog?.action === 'publish' ? t('confirm.publish.title') :
               confirmDialog?.action === 'archive' ? t('confirm.archive.title') : 'Confirm'}
        message={confirmDialog?.action === 'delete' ? t('confirm.delete.message', { name: confirmDialog?.article?.title_en }) :
                 confirmDialog?.action === 'publish' ? t('confirm.publish.message', { name: confirmDialog?.article?.title_en }) :
                 confirmDialog?.action === 'archive' ? t('confirm.archive.message', { name: confirmDialog?.article?.title_en }) : ''}
        confirmLabel={confirmDialog?.action === 'delete' ? t('action.delete') :
                      confirmDialog?.action === 'publish' ? t('action.publish') :
                      confirmDialog?.action === 'archive' ? t('action.archive') : t('action.confirm')}
        variant={confirmDialog?.action === 'delete' ? 'danger' : confirmDialog?.action === 'archive' ? 'secondary' : 'primary'}
      />
    </CMSLayout>
  );
}

const styles = {
  thumb: { width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px', marginRight: '0.5rem', verticalAlign: 'middle' },
  badges: { display: 'flex', gap: '0.375rem' },
  actions: { display: 'flex', gap: '0.25rem', justifyContent: 'flex-end', flexWrap: 'wrap' },
};
