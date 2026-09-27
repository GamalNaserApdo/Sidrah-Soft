/**
 * CMS Media Library Page — /cms/media
 *
 * Features:
 * - Image grid with lazy loading
 * - Search, MIME filter, ordering, pagination
 * - Upload button → MediaUploadDialog
 * - Asset click → MediaDetailsDialog
 * - Empty/loading/error states
 * - Capability-aware navigation
 *
 * Uses shared CMS UI primitives (CMSToolbar, CMSPagination, CMSSelect,
 * CMSStateViews) and CMS design tokens for visual consistency.
 */

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCMSLang } from '../../contexts/CMSLanguageContext';
import { listMedia } from '../../services/cms/mediaApi';
import MediaGrid from '../../components/cms/media/MediaGrid';
import MediaUploadDialog from '../../components/cms/media/MediaUploadDialog';
import MediaDetailsDialog from '../../components/cms/media/MediaDetailsDialog';
import CMSLayout from '../../components/cms/layout/CMSLayout';
import CMSPageHeader from '../../components/cms/ui/CMSPageHeader';
import CMSToolbar from '../../components/cms/ui/CMSToolbar';
import CMSPagination from '../../components/cms/ui/CMSPagination';
import CMSButton from '../../components/cms/ui/CMSButton';
import { CMSSelect } from '../../components/cms/ui/CMSFormInputs';
import { CMSLoadingState, CMSErrorState, CMSEmptyState } from '../../components/cms/ui/CMSStateViews';

export default function MediaLibraryPage() {
  const { user, hasModuleAccess, hasCapability } = useAuth();
  const { t } = useCMSLang();

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [mimeType, setMimeType] = useState('');
  const [ordering, setOrdering] = useState('-created_at');
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [next, setNext] = useState(null);
  const [previous, setPrevious] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState(null);

  const canUpload = hasCapability('media.create');
  const canView = hasModuleAccess('media');

  const loadAssets = useCallback(async (pageNum = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: pageNum, page_size: 20, ordering };
      if (search) params.search = search;
      if (mimeType) params.mime_type = mimeType;
      const data = await listMedia(params);
      setAssets(data.results || []);
      setCount(data.count || 0);
      setNext(data.next);
      setPrevious(data.previous);
    } catch (err) {
      setError(err.message || t('media.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [search, mimeType, ordering, t]);

  useEffect(() => {
    if (canView) {
      loadAssets(page);
    } else {
      setLoading(false);
    }
  }, [canView, page, loadAssets]);

  const handleSearchChange = useCallback((value) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleSearchSubmit = useCallback(() => {
    setPage(1);
    loadAssets(1);
  }, [loadAssets]);

  const handleMimeChange = useCallback((e) => {
    setMimeType(e.target.value);
    setPage(1);
  }, []);

  const handleOrderingChange = useCallback((e) => {
    setOrdering(e.target.value);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const handleUploadSuccess = useCallback((newAsset) => {
    setShowUpload(false);
    setPage(1);
    loadAssets(1);
    setSelectedAssetId(newAsset.id);
  }, [loadAssets]);

  const handleAssetDeleted = useCallback((deletedId) => {
    setSelectedAssetId(null);
    loadAssets(page);
  }, [loadAssets, page]);

  const handleAssetUpdated = useCallback(() => {
    loadAssets(page);
  }, [loadAssets, page]);

  if (!canView) {
    return (
      <CMSLayout>
        <CMSPageHeader title={t('media.library')} />
        <CMSErrorState message={t('media.permissionDenied')} />
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link to="/cms" style={{ color: 'var(--cms-accent)', textDecoration: 'none', fontSize: '0.875rem' }}>
            {t('media.backDashboard')}
          </Link>
        </div>
      </CMSLayout>
    );
  }

  // Compute total pages from count (page_size = 20)
  const totalPages = Math.max(1, Math.ceil(count / 20));

  return (
    <CMSLayout>
      <CMSPageHeader
        title={t('media.library')}
        actions={canUpload && <CMSButton variant="primary" onClick={() => setShowUpload(true)}>+ {t('media.uploadImage')}</CMSButton>}
      />

      <CMSToolbar
        search={search}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
      >
        <CMSSelect value={mimeType} onChange={handleMimeChange} aria-label={t('media.filterMime')}>
          <option value="">{t('media.allTypes')}</option>
          <option value="image/jpeg">JPEG</option>
          <option value="image/png">PNG</option>
          <option value="image/webp">WebP</option>
          <option value="image/gif">GIF</option>
        </CMSSelect>
        <CMSSelect value={ordering} onChange={handleOrderingChange} aria-label={t('media.sortOrder')}>
          <option value="-created_at">{t('media.newest')}</option>
          <option value="created_at">{t('media.oldest')}</option>
          <option value="-updated_at">{t('media.recentlyUpdated')}</option>
          <option value="updated_at">{t('media.leastRecentlyUpdated')}</option>
          <option value="-file_size">{t('media.largest')}</option>
          <option value="file_size">{t('media.smallest')}</option>
          <option value="title">{t('media.titleAZ')}</option>
          <option value="-title">{t('media.titleZA')}</option>
        </CMSSelect>
      </CMSToolbar>

      {loading && <CMSLoadingState />}
      {error && <CMSErrorState message={error} onRetry={() => loadAssets(page)} />}
      {!loading && !error && assets.length === 0 && (
        <CMSEmptyState
          message={t('media.empty')}
          action={canUpload && <CMSButton variant="primary" onClick={() => setShowUpload(true)}>{t('media.uploadImage')}</CMSButton>}
        />
      )}
      {!loading && !error && assets.length > 0 && (
        <>
          <div style={styles.count}>{count} {count !== 1 ? t('media.assetsCount') : t('media.assetCount')}</div>
          <MediaGrid assets={assets} onAssetClick={setSelectedAssetId} />
        </>
      )}

      {(previous || next) && (
        <CMSPagination
          page={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          count={count}
        />
      )}

      {/* Dialogs */}
      <MediaUploadDialog
        open={showUpload}
        onClose={() => setShowUpload(false)}
        onUploaded={handleUploadSuccess}
      />
      <MediaDetailsDialog
        assetId={selectedAssetId}
        open={!!selectedAssetId}
        onClose={() => setSelectedAssetId(null)}
        onDeleted={handleAssetDeleted}
        onUpdated={handleAssetUpdated}
      />
    </CMSLayout>
  );
}

const styles = {
  count: {
    fontSize: '0.75rem',
    color: 'var(--cms-text-muted)',
    marginBottom: '1rem',
  },
};
