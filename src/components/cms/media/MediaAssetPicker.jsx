/**
 * MediaAssetPicker — reusable modal for selecting a media asset.
 *
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - onSelect: (asset) => void
 * - acceptedMimeTypes: string[] (optional, frontend guidance only)
 * - minimumWidth: number (optional, frontend guidance only)
 * - minimumHeight: number (optional, frontend guidance only)
 * - usageLabel: string (optional, passed as usage_context on upload)
 */

import { useState, useEffect, useCallback } from 'react';
import { listMedia, uploadMedia } from '../../../services/cms/mediaApi';
import { useCMSLang } from '../../../contexts/CMSLanguageContext';
import MediaGrid from './MediaGrid';

const ACCEPTED_TYPES = '.jpg,.jpeg,.png,.webp,.gif';

export default function MediaAssetPicker({
  open,
  onClose,
  onSelect,
  acceptedMimeTypes,
  minimumWidth,
  minimumHeight,
  usageLabel,
}) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [next, setNext] = useState(null);
  const [previous, setPrevious] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const { t } = useCMSLang();

  const loadAssets = useCallback(async (pageNum = 1, searchTerm = '') => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: pageNum, page_size: 12 };
      if (searchTerm) params.search = searchTerm;
      if (acceptedMimeTypes && acceptedMimeTypes.length > 0) {
        params.mime_type = acceptedMimeTypes[0];
      }
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
  }, [acceptedMimeTypes, t]);

  useEffect(() => {
    if (open) {
      setSearch('');
      setPage(1);
      setShowUpload(false);
      setUploadFile(null);
      setUploadError(null);
      loadAssets(1, '');
    }
  }, [open, loadAssets]);

  const handleSearch = useCallback((e) => {
    const val = e.target.value;
    setSearch(val);
    setPage(1);
    loadAssets(1, val);
  }, [loadAssets]);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    loadAssets(newPage, search);
  }, [loadAssets, search]);

  const handleSelect = useCallback((asset) => {
    // Frontend guidance checks
    if (minimumWidth && asset.width && asset.width < minimumWidth) {
      setError(t('media.imageMinWidth', { size: minimumWidth, actual: asset.width }));
      return;
    }
    if (minimumHeight && asset.height && asset.height < minimumHeight) {
      setError(t('media.imageMinHeight', { size: minimumHeight, actual: asset.height }));
      return;
    }
    onSelect(asset);
    onClose();
  }, [minimumWidth, minimumHeight, onSelect, onClose, t]);

  const handleUploadFile = useCallback((e) => {
    setUploadError(null);
    const f = e.target.files?.[0];
    if (f) setUploadFile(f);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!uploadFile || uploading) return;
    setUploading(true);
    setUploadError(null);
    try {
      await uploadMedia(uploadFile, {
        usage_context: usageLabel || '',
      });
      setUploadFile(null);
      setShowUpload(false);
      loadAssets(1, search);
    } catch (err) {
      setUploadError(err.data?.file || err.data?.detail || err.message || t('media.uploadFailed'));
    } finally {
      setUploading(false);
    }
  }, [uploadFile, uploading, usageLabel, loadAssets, search, t]);

  if (!open) return null;

  return (
    <div style={styles.overlay} onClick={onClose} onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }} tabIndex={-1}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>{t('media.select')}</h2>
          <button style={styles.closeBtn} onClick={onClose} aria-label={t('media.closePicker')}>✕</button>
        </div>

        <div style={styles.toolbar}>
          <input
            type="text"
            style={styles.searchInput}
            placeholder={t('media.search')}
            value={search}
            onChange={handleSearch}
            aria-label={t('media.searchAssets')}
          />
          <button
            style={{ ...styles.uploadToggleBtn, ...(showUpload ? styles.uploadToggleActive : {}) }}
            onClick={() => setShowUpload(!showUpload)}
          >
            {showUpload ? t('action.cancelUpload') : t('action.uploadNew')}
          </button>
        </div>

        {showUpload && (
          <div style={styles.uploadSection}>
            <input
              type="file"
              accept={ACCEPTED_TYPES}
              onChange={handleUploadFile}
              style={styles.fileInput}
              aria-label={t('media.chooseImage')}
            />
            {uploadFile && (
              <div style={styles.uploadFileInfo}>
                {uploadFile.name} — {(uploadFile.size / (1024 * 1024)).toFixed(2)} MB
              </div>
            )}
            {uploadError && <div style={styles.uploadError}>{uploadError}</div>}
            <button
              style={{ ...styles.uploadBtn, ...(!uploadFile || uploading ? styles.uploadBtnDisabled : {}) }}
              onClick={handleUpload}
              disabled={!uploadFile || uploading}
            >
              {uploading ? t('media.uploading') : t('media.upload')}
            </button>
          </div>
        )}

        <div style={styles.body}>
          {loading && <div style={styles.loading}>{t('state.loading')}</div>}
          {error && <div style={styles.error}>{error}</div>}
          {!loading && !error && assets.length === 0 && (
            <div style={styles.empty}>{t('media.noAssetsUpload')}</div>
          )}
          {!loading && !error && assets.length > 0 && (
            <MediaGrid assets={assets} onAssetClick={handleSelect} />
          )}
        </div>

        {(previous || next) && (
          <div style={styles.pagination}>
            <button
              style={{ ...styles.pageBtn, ...(!previous ? styles.pageBtnDisabled : {}) }}
              onClick={() => handlePageChange(page - 1)}
              disabled={!previous}
            >
              ← {t('action.previousPage')}
            </button>
            <span style={styles.pageInfo}>{t('media.pageOf', { page, total: Math.ceil(count / 12) || 1 })}</span>
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
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 1000,
  },
  modal: {
    background: '#12121e', borderRadius: '10px', border: '1px solid #2a2a3e',
    width: '90%', maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '1rem 1.5rem', borderBottom: '1px solid #1e1e2e',
  },
  title: { fontSize: '1rem', fontWeight: '600', color: '#c9a96e', margin: 0 },
  closeBtn: { background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1rem', padding: '0.25rem' },
  toolbar: {
    display: 'flex', gap: '0.5rem', padding: '1rem 1.5rem',
    borderBottom: '1px solid #1e1e2e',
  },
  searchInput: {
    flex: 1, padding: '0.5rem 0.75rem', background: '#0a0a14',
    border: '1px solid #2a2a3e', borderRadius: '6px', color: '#e0e0e0',
    fontSize: '0.8125rem', outline: 'none',
  },
  uploadToggleBtn: {
    padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #c9a96e',
    background: 'transparent', color: '#c9a96e', fontSize: '0.75rem',
    cursor: 'pointer', whiteSpace: 'nowrap',
  },
  uploadToggleActive: {
    background: 'rgba(201, 169, 110, 0.1)',
  },
  uploadSection: {
    padding: '1rem 1.5rem', borderBottom: '1px solid #1e1e2e',
    display: 'flex', flexDirection: 'column', gap: '0.5rem',
  },
  fileInput: {
    color: '#e0e0e0', fontSize: '0.8125rem',
  },
  uploadFileInfo: { fontSize: '0.75rem', color: '#888' },
  uploadError: { fontSize: '0.75rem', color: '#e05050' },
  uploadBtn: {
    padding: '0.5rem 1.25rem', borderRadius: '6px', border: '1px solid #c9a96e',
    background: 'rgba(201, 169, 110, 0.1)', color: '#c9a96e',
    fontSize: '0.8125rem', cursor: 'pointer', fontWeight: '500', alignSelf: 'flex-start',
  },
  uploadBtnDisabled: { opacity: 0.4, cursor: 'not-allowed' },
  body: { padding: '1.5rem', minHeight: '200px' },
  loading: { color: '#888', textAlign: 'center', padding: '2rem' },
  error: {
    background: 'rgba(220, 50, 50, 0.1)', border: '1px solid rgba(220, 50, 50, 0.3)',
    borderRadius: '6px', padding: '0.625rem 0.75rem', color: '#e05050',
    fontSize: '0.8125rem', marginBottom: '0.5rem',
  },
  empty: { color: '#888', textAlign: 'center', padding: '2rem', fontSize: '0.875rem' },
  pagination: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    gap: '1rem', padding: '1rem 1.5rem', borderTop: '1px solid #1e1e2e',
  },
  pageBtn: {
    padding: '0.375rem 0.75rem', borderRadius: '6px', border: '1px solid #333',
    background: 'transparent', color: '#aaa', fontSize: '0.75rem', cursor: 'pointer',
  },
  pageBtnDisabled: { opacity: 0.3, cursor: 'not-allowed' },
  pageInfo: { fontSize: '0.75rem', color: '#888' },
};
