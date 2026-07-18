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
import CMSButton from '../../components/cms/ui/CMSButton';

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

  const handleSearchChange = useCallback((e) => {
    setSearch(e.target.value);
    setPage(1);
  }, []);

  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
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
        <div style={styles.denied}>
          <h2 style={styles.deniedTitle}>{t('media.accessDenied')}</h2>
          <p style={styles.deniedText}>{t('media.permissionDenied')}</p>
          <Link to="/cms" style={styles.backLink}>{t('media.backDashboard')}</Link>
        </div>
      </CMSLayout>
    );
  }

  return (
    <CMSLayout>
      <CMSPageHeader
        title={t('media.library')}
        actions={canUpload && <CMSButton variant="primary" onClick={() => setShowUpload(true)}>+ {t('media.uploadImage')}</CMSButton>}
      />

      <div>

        {/* Toolbar */}
        <div style={styles.toolbar}>
          <form onSubmit={handleSearchSubmit} style={styles.searchForm}>
            <input
              type="text"
              style={styles.searchInput}
              placeholder={t('media.searchPlaceholder')}
              value={search}
              onChange={handleSearchChange}
              aria-label={t('media.searchAssets')}
            />
            <button type="submit" style={styles.searchBtn}>{t('action.search')}</button>
          </form>
          <select style={styles.select} value={mimeType} onChange={handleMimeChange} aria-label={t('media.filterMime')}>
            <option value="">{t('media.allTypes')}</option>
            <option value="image/jpeg">JPEG</option>
            <option value="image/png">PNG</option>
            <option value="image/webp">WebP</option>
            <option value="image/gif">GIF</option>
          </select>
          <select style={styles.select} value={ordering} onChange={handleOrderingChange} aria-label={t('media.sortOrder')}>
            <option value="-created_at">{t('media.newest')}</option>
            <option value="created_at">{t('media.oldest')}</option>
            <option value="-updated_at">{t('media.recentlyUpdated')}</option>
            <option value="updated_at">{t('media.leastRecentlyUpdated')}</option>
            <option value="-file_size">{t('media.largest')}</option>
            <option value="file_size">{t('media.smallest')}</option>
            <option value="title">{t('media.titleAZ')}</option>
            <option value="-title">{t('media.titleZA')}</option>
          </select>
        </div>

        {/* Content */}
        {loading && <div style={styles.loading}>{t('media.loading')}</div>}
        {error && <div style={styles.error}>{error}</div>}
        {!loading && !error && assets.length === 0 && (
          <div style={styles.empty}>
            <p style={styles.emptyText}>{t('media.empty')}</p>
            {canUpload && <p style={styles.emptyHint}>{t('media.emptyHint')}</p>}
          </div>
        )}
        {!loading && !error && assets.length > 0 && (
          <>
            <div style={styles.count}>{count} {count !== 1 ? t('media.assetsCount') : t('media.assetCount')}</div>
            <MediaGrid assets={assets} onAssetClick={setSelectedAssetId} />
          </>
        )}

        {/* Pagination */}
        {(previous || next) && (
          <div style={styles.pagination}>
            <button
              style={{ ...styles.pageBtn, ...(!previous ? styles.pageBtnDisabled : {}) }}
              onClick={() => handlePageChange(page - 1)}
              disabled={!previous}
            >
              ← {t('action.previousPage')}
            </button>
            <span style={styles.pageInfo}>{t('media.pageNumber', { page })}</span>
            <button
              style={{ ...styles.pageBtn, ...(!next ? styles.pageBtnDisabled : {}) }}
              onClick={() => handlePageChange(page + 1)}
              disabled={!next}
            >
              {t('action.nextPage')} →
            </button>
          </div>
        )}
      </div>

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
  container: {
    minHeight: '100vh', background: '#0a0a14', color: '#e0e0e0',
    fontFamily: 'system-ui, -apple-system, sans-serif', padding: '0',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '1rem 2rem', borderBottom: '1px solid #1e1e2e', background: '#12121e',
  },
  brand: { display: 'flex', alignItems: 'baseline', gap: '0.5rem' },
  logo: { fontSize: '1.25rem', fontWeight: '700', color: '#c9a96e' },
  cms: { fontSize: '0.75rem', fontWeight: '500', color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em' },
  nav: { display: 'flex', gap: '1rem', alignItems: 'center' },
  navLink: { color: '#aaa', textDecoration: 'none', fontSize: '0.875rem' },
  navLinkActive: { color: '#c9a96e', fontWeight: '500' },
  userBadge: { fontSize: '0.75rem', color: '#888' },
  main: { padding: '2rem', maxWidth: '1200px', margin: '0 auto' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  pageTitle: { fontSize: '1.25rem', fontWeight: '600', color: '#c9a96e', margin: 0 },
  uploadBtn: {
    padding: '0.5rem 1.25rem', borderRadius: '6px', border: '1px solid #c9a96e',
    background: 'rgba(201, 169, 110, 0.1)', color: '#c9a96e',
    fontSize: '0.8125rem', cursor: 'pointer', fontWeight: '500',
  },
  toolbar: {
    display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap',
  },
  searchForm: { display: 'flex', gap: '0.5rem', flex: 1, minWidth: '240px' },
  searchInput: {
    flex: 1, padding: '0.5rem 0.75rem', background: '#12121e',
    border: '1px solid #2a2a3e', borderRadius: '6px', color: '#e0e0e0',
    fontSize: '0.8125rem', outline: 'none',
  },
  searchBtn: {
    padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #333',
    background: '#1a1a2e', color: '#aaa', fontSize: '0.8125rem', cursor: 'pointer',
  },
  select: {
    padding: '0.5rem 0.75rem', background: '#12121e', border: '1px solid #2a2a3e',
    borderRadius: '6px', color: '#e0e0e0', fontSize: '0.8125rem', outline: 'none',
    cursor: 'pointer',
  },
  loading: { color: '#888', textAlign: 'center', padding: '3rem', fontSize: '0.875rem' },
  error: {
    background: 'rgba(220, 50, 50, 0.1)', border: '1px solid rgba(220, 50, 50, 0.3)',
    borderRadius: '8px', padding: '1rem', color: '#e05050', fontSize: '0.875rem',
  },
  empty: { textAlign: 'center', padding: '3rem', color: '#888' },
  emptyText: { fontSize: '1rem', margin: '0 0 0.5rem 0' },
  emptyHint: { fontSize: '0.8125rem', color: '#555' },
  count: { fontSize: '0.75rem', color: '#888', marginBottom: '1rem' },
  pagination: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    gap: '1rem', marginTop: '2rem',
  },
  pageBtn: {
    padding: '0.375rem 0.75rem', borderRadius: '6px', border: '1px solid #333',
    background: 'transparent', color: '#aaa', fontSize: '0.75rem', cursor: 'pointer',
  },
  pageBtnDisabled: { opacity: 0.3, cursor: 'not-allowed' },
  pageInfo: { fontSize: '0.75rem', color: '#888' },
  denied: { textAlign: 'center', padding: '4rem 2rem' },
  deniedTitle: { color: '#c9a96e', fontSize: '1.25rem', marginBottom: '0.5rem' },
  deniedText: { color: '#888', fontSize: '0.875rem', marginBottom: '1rem' },
  backLink: { color: '#c9a96e', textDecoration: 'none', fontSize: '0.875rem' },
};
