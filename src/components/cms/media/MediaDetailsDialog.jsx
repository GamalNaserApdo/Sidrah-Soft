/**
 * MediaDetailsDialog — modal showing full asset detail with
 * preview, metadata editing, copy URL, usage list, and delete.
 */

import { useState, useEffect, useCallback } from 'react';
import { getMedia, getMediaUsage, updateMediaMetadata, deleteMedia } from '../../../services/cms/mediaApi';
import { useCMSLang } from '../../../contexts/CMSLanguageContext';

export default function MediaDetailsDialog({ assetId, open, onClose, onDeleted, onUpdated }) {
  const { t } = useCMSLang();
  const [asset, setAsset] = useState(null);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editAltText, setEditAltText] = useState('');
  const [editUsageContext, setEditUsageContext] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadData = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const [assetData, usageData] = await Promise.all([
        getMedia(id),
        getMediaUsage(id),
      ]);
      setAsset(assetData);
      setUsage(usageData);
      setEditTitle(assetData.title || '');
      setEditAltText(assetData.alt_text || '');
      setEditUsageContext(assetData.usage_context || '');
    } catch (err) {
      setError(err.message || t('media.loadDetailsFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (open && assetId) {
      setDeleteConfirm(false);
      setDeleteError(null);
      setEditing(false);
      loadData(assetId);
    }
  }, [open, assetId, loadData]);

  const handleSave = useCallback(async () => {
    if (!asset || saving) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updateMediaMetadata(asset.id, {
        title: editTitle.trim(),
        alt_text: editAltText.trim(),
        usage_context: editUsageContext.trim(),
      });
      setAsset(updated);
      setEditing(false);
      if (onUpdated) onUpdated(updated);
    } catch (err) {
      setError(err.message || t('media.updateFailed'));
    } finally {
      setSaving(false);
    }
  }, [asset, saving, editTitle, editAltText, editUsageContext, onUpdated, t]);

  const handleDelete = useCallback(async () => {
    if (!asset) return;
    setSaving(true);
    setDeleteError(null);
    try {
      await deleteMedia(asset.id);
      if (onDeleted) onDeleted(asset.id);
      onClose();
    } catch (err) {
      if (err.status === 409) {
        setDeleteError(t('media.inUseCannotDelete'));
      } else {
        setDeleteError(err.message || t('media.deleteFailed'));
      }
    } finally {
      setSaving(false);
    }
  }, [asset, onDeleted, onClose, t]);

  const handleCopyUrl = useCallback(() => {
    if (asset?.file_url) {
      navigator.clipboard.writeText(asset.file_url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }, [asset]);

  if (!open) return null;

  return (
    <div style={styles.overlay} onClick={onClose} onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }} tabIndex={-1}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>{t('media.details')}</h2>
          <button style={styles.closeBtn} onClick={onClose} aria-label={t('media.closeDetails')}>✕</button>
        </div>

        <div style={styles.body}>
          {loading && <div style={styles.loading}>{t('state.loading')}</div>}
          {error && <div style={styles.error}>{error}</div>}

          {asset && !loading && (
            <>
              {/* Preview */}
              <div style={styles.previewWrap}>
                {asset.file_url && (
                  <img
                    src={asset.file_url}
                    alt={asset.alt_text || asset.title || t('media.asset', { id: asset.id })}
                    style={styles.preview}
                  />
                )}
              </div>

              {/* URL with copy */}
              <div style={styles.urlRow}>
                <input
                  type="text"
                  readOnly
                  value={asset.file_url || ''}
                  style={styles.urlInput}
                  aria-label={t('media.url')}
                />
                <button style={styles.copyBtn} onClick={handleCopyUrl}>
                  {copied ? t('action.copied') : t('action.copy')}
                </button>
              </div>

              {/* Metadata */}
              {editing ? (
                <div style={styles.editSection}>
                  <div style={styles.field}>
                    <label style={styles.label} htmlFor="detail-title">{t('media.title')}</label>
                    <input id="detail-title" type="text" style={styles.input} value={editTitle} onChange={(e) => setEditTitle(e.target.value)} maxLength={255} />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label} htmlFor="detail-alt">{t('media.altText')}</label>
                    <input id="detail-alt" type="text" style={styles.input} value={editAltText} onChange={(e) => setEditAltText(e.target.value)} maxLength={255} />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label} htmlFor="detail-usage">{t('media.usageContext')}</label>
                    <input id="detail-usage" type="text" style={styles.input} value={editUsageContext} onChange={(e) => setEditUsageContext(e.target.value)} maxLength={120} />
                  </div>
                  <div style={styles.editActions}>
                    <button style={styles.cancelBtn} onClick={() => setEditing(false)}>{t('media.cancel')}</button>
                    <button style={{ ...styles.saveBtn, ...(saving ? styles.saveBtnDisabled : {}) }} onClick={handleSave} disabled={saving}>
                      {saving ? t('state.saving') : t('action.save')}
                    </button>
                  </div>
                </div>
              ) : (
                <div style={styles.metaGrid}>
                  <MetaItem label={t('media.title')} value={asset.title || '—'} />
                  <MetaItem label={t('media.altText')} value={asset.alt_text || '—'} />
                  <MetaItem label={t('media.filename')} value={asset.filename || '—'} />
                  <MetaItem label={t('media.mimeType')} value={asset.mime_type || '—'} />
                  <MetaItem label={t('media.fileSize')} value={formatFileSize(asset.file_size)} />
                  <MetaItem label={t('media.dimensions')} value={asset.width && asset.height ? `${asset.width}×${asset.height}` : '—'} />
                  <MetaItem label={t('media.usageContext')} value={asset.usage_context || '—'} />
                  <MetaItem label={t('media.uploadedBy')} value={asset.uploaded_by?.display_name || asset.uploaded_by?.username || '—'} />
                  <MetaItem label={t('media.uploadDate')} value={new Date(asset.created_at).toLocaleString()} />
                  <MetaItem label={t('media.usageCount')} value={String(usage?.usage_count ?? 0)} />
                </div>
              )}

              {/* Usage list */}
              {usage && usage.is_used && (
                <div style={styles.usageSection}>
                  <h3 style={styles.sectionTitle}>{t('media.usedBy', { count: usage.usage_count })}</h3>
                  <div style={styles.usageList}>
                    {usage.usages.map((u, i) => (
                      <div key={i} style={styles.usageItem}>
                        <span style={styles.usageModule}>{u.module}</span>
                        <span style={styles.usageModel}>{u.model}.{u.field}</span>
                        <span style={styles.usageLabel}>{u.object_label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Delete section */}
              {deleteError && <div style={styles.error}>{deleteError}</div>}
              {deleteConfirm ? (
                <div style={styles.deleteConfirm}>
                  <p style={styles.deleteText}>
                    {usage?.is_used
                      ? t('media.deleteInUse')
                      : t('media.deleteConfirm')}
                  </p>
                  <div style={styles.deleteActions}>
                    <button style={styles.cancelBtn} onClick={() => setDeleteConfirm(false)}>{t('media.cancel')}</button>
                    {!usage?.is_used && (
                      <button
                        style={{ ...styles.deleteBtn, ...(saving ? styles.saveBtnDisabled : {}) }}
                        onClick={handleDelete}
                        disabled={saving}
                      >
                        {saving ? t('state.deleting') : t('action.confirmDelete')}
                      </button>
                    )}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>

        {asset && !loading && !editing && !deleteConfirm && (
          <div style={styles.footer}>
            <button
              style={{ ...styles.deleteBtn, ...(usage?.is_used ? styles.deleteBtnDisabled : {}) }}
              onClick={() => setDeleteConfirm(true)}
              disabled={usage?.is_used}
              title={usage?.is_used ? t('media.assetInUseTitle') : t('media.deleteTitle')}
            >
              {t('action.delete')}
            </button>
            <button style={styles.editBtn} onClick={() => setEditing(true)}>
              {t('action.editMetadata')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function MetaItem({ label, value }) {
  return (
    <div style={styles.metaItem}>
      <dt style={styles.metaLabel}>{label}</dt>
      <dd style={styles.metaValue}>{value}</dd>
    </div>
  );
}

function formatFileSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 1000,
  },
  modal: {
    background: '#12121e', borderRadius: '10px', border: '1px solid #2a2a3e',
    width: '90%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '1rem 1.5rem', borderBottom: '1px solid #1e1e2e',
  },
  title: { fontSize: '1rem', fontWeight: '600', color: '#c9a96e', margin: 0 },
  closeBtn: { background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1rem', padding: '0.25rem' },
  body: { padding: '1.5rem' },
  loading: { color: '#888', textAlign: 'center', padding: '2rem' },
  error: {
    background: 'rgba(220, 50, 50, 0.1)', border: '1px solid rgba(220, 50, 50, 0.3)',
    borderRadius: '6px', padding: '0.625rem 0.75rem', color: '#e05050',
    fontSize: '0.8125rem', marginBottom: '0.5rem',
  },
  previewWrap: {
    width: '100%', maxHeight: '300px', overflow: 'hidden', borderRadius: '8px',
    background: '#0a0a14', marginBottom: '1rem', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
  },
  preview: { maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' },
  urlRow: { display: 'flex', gap: '0.5rem', marginBottom: '1rem' },
  urlInput: {
    flex: 1, padding: '0.5rem 0.75rem', background: '#0a0a14',
    border: '1px solid #2a2a3e', borderRadius: '6px', color: '#888',
    fontSize: '0.75rem', outline: 'none',
  },
  copyBtn: {
    padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #c9a96e',
    background: 'rgba(201, 169, 110, 0.1)', color: '#c9a96e',
    fontSize: '0.75rem', cursor: 'pointer', whiteSpace: 'nowrap',
  },
  metaGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 1rem',
    marginBottom: '1rem',
  },
  metaItem: { display: 'flex', flexDirection: 'column', gap: '0.125rem' },
  metaLabel: { fontSize: '0.6875rem', color: '#888', margin: 0 },
  metaValue: { fontSize: '0.8125rem', color: '#e0e0e0', margin: 0, wordBreak: 'break-word' },
  editSection: { marginBottom: '1rem' },
  field: { marginBottom: '0.875rem' },
  label: { display: 'block', fontSize: '0.75rem', color: '#888', marginBottom: '0.25rem' },
  input: {
    width: '100%', padding: '0.5rem 0.75rem', background: '#0a0a14',
    border: '1px solid #2a2a3e', borderRadius: '6px', color: '#e0e0e0',
    fontSize: '0.8125rem', outline: 'none',
  },
  editActions: { display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' },
  cancelBtn: {
    padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #333',
    background: 'transparent', color: '#888', fontSize: '0.8125rem', cursor: 'pointer',
  },
  saveBtn: {
    padding: '0.5rem 1.25rem', borderRadius: '6px', border: '1px solid #c9a96e',
    background: 'rgba(201, 169, 110, 0.1)', color: '#c9a96e',
    fontSize: '0.8125rem', cursor: 'pointer', fontWeight: '500',
  },
  saveBtnDisabled: { opacity: 0.4, cursor: 'not-allowed' },
  usageSection: { marginBottom: '1rem' },
  sectionTitle: { fontSize: '0.875rem', color: '#c9a96e', margin: '0 0 0.5rem 0' },
  usageList: { display: 'flex', flexDirection: 'column', gap: '0.375rem' },
  usageItem: {
    display: 'flex', gap: '0.5rem', alignItems: 'center',
    padding: '0.5rem 0.75rem', background: '#0a0a14', borderRadius: '6px',
    fontSize: '0.75rem',
  },
  usageModule: { color: '#c9a96e', fontWeight: '500' },
  usageModel: { color: '#888' },
  usageLabel: { color: '#e0e0e0', marginLeft: 'auto' },
  deleteConfirm: {
    background: 'rgba(220, 50, 50, 0.05)', border: '1px solid rgba(220, 50, 50, 0.2)',
    borderRadius: '8px', padding: '1rem', marginTop: '1rem',
  },
  deleteText: { color: '#e0e0e0', fontSize: '0.8125rem', margin: '0 0 0.75rem 0' },
  deleteActions: { display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' },
  footer: {
    display: 'flex', justifyContent: 'space-between', padding: '1rem 1.5rem',
    borderTop: '1px solid #1e1e2e',
  },
  deleteBtn: {
    padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid rgba(220, 50, 50, 0.4)',
    background: 'rgba(220, 50, 50, 0.1)', color: '#e05050',
    fontSize: '0.8125rem', cursor: 'pointer',
  },
  deleteBtnDisabled: { opacity: 0.3, cursor: 'not-allowed' },
  editBtn: {
    padding: '0.5rem 1.25rem', borderRadius: '6px', border: '1px solid #c9a96e',
    background: 'rgba(201, 169, 110, 0.1)', color: '#c9a96e',
    fontSize: '0.8125rem', cursor: 'pointer', fontWeight: '500',
  },
};
