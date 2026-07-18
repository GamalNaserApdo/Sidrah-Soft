/**
 * MediaUploadDialog — modal for uploading a single image.
 *
 * Features:
 * - File picker (required) + drag-and-drop (optional)
 * - Metadata fields (title, alt_text, usage_context)
 * - Pre-upload file info display
 * - Upload progress / pending state
 * - Field-specific validation errors
 * - Reset after success
 */

import { useState, useRef, useCallback } from 'react';
import { uploadMedia } from '../../../services/cms/mediaApi';
import { useCMSLang } from '../../../contexts/CMSLanguageContext';

const ACCEPTED_TYPES = '.jpg,.jpeg,.png,.webp,.gif';
const MAX_SIZE = 5 * 1024 * 1024;

export default function MediaUploadDialog({ open, onClose, onUploaded }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [altText, setAltText] = useState('');
  const [usageContext, setUsageContext] = useState('');
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const { t } = useCMSLang();

  const reset = useCallback(() => {
    setFile(null);
    setTitle('');
    setAltText('');
    setUsageContext('');
    setError(null);
    setFieldErrors({});
    setUploading(false);
    setDragOver(false);
  }, []);

  const handleClose = useCallback(() => {
    if (uploading) return;
    reset();
    onClose();
  }, [uploading, reset, onClose]);

  const handleFileSelect = useCallback((selectedFile) => {
    setError(null);
    setFieldErrors({});

    if (!selectedFile) return;

    if (selectedFile.size > MAX_SIZE) {
      setError(t('media.fileSizeLimit', { size: (selectedFile.size / (1024 * 1024)).toFixed(1) }));
      return;
    }

    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (!['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
      setError(t('media.extensionNotAllowed', { ext }));
      return;
    }

    setFile(selectedFile);
  }, [t]);

  const handleInputChange = useCallback((e) => {
    handleFileSelect(e.target.files[0]);
  }, [handleFileSelect]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!file || uploading) return;

    setUploading(true);
    setError(null);
    setFieldErrors({});

    try {
      const result = await uploadMedia(file, {
        title: title.trim(),
        alt_text: altText.trim(),
        usage_context: usageContext.trim(),
      });
      reset();
      onUploaded(result);
    } catch (err) {
      if (err.data) {
        const apiErrors = {};
        for (const [key, value] of Object.entries(err.data)) {
          apiErrors[key] = Array.isArray(value) ? value.join(' ') : String(value);
        }
        setFieldErrors(apiErrors);
        if (apiErrors.file) setError(apiErrors.file);
        else if (apiErrors.non_field_errors) setError(apiErrors.non_field_errors);
        else if (err.data.detail) setError(err.data.detail);
      } else {
        setError(err.message || t('media.uploadFailed'));
      }
    } finally {
      setUploading(false);
    }
  }, [file, uploading, title, altText, usageContext, reset, onUploaded, t]);

  if (!open) return null;

  return (
    <div style={styles.overlay} onClick={handleClose} onKeyDown={(e) => { if (e.key === 'Escape') handleClose(); }} tabIndex={-1}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>{t('media.uploadDialog')}</h2>
          <button style={styles.closeBtn} onClick={handleClose} disabled={uploading} aria-label={t('media.closeUpload')}>
            ✕
          </button>
        </div>

        <div style={styles.body}>
          {/* File drop zone */}
          <div
            style={{ ...styles.dropZone, ...(dragOver ? styles.dropZoneActive : {}) }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
            aria-label={t('media.chooseOrDrag')}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES}
              style={{ display: 'none' }}
              onChange={handleInputChange}
            />
            {file ? (
              <div style={styles.fileInfo}>
                <div style={styles.fileName}>{file.name}</div>
                <div style={styles.fileSize}>{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
              </div>
            ) : (
              <div style={styles.dropText}>
                <div>{t('media.chooseOrDrag')}</div>
                <div style={styles.dropHint}>{t('media.fileTypesHint')}</div>
              </div>
            )}
          </div>

          {/* Metadata fields */}
          <div style={styles.field}>
            <label style={styles.label} htmlFor="upload-title">{t('media.title')} ({t('media.optional')})</label>
            <input
              id="upload-title"
              type="text"
              style={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={255}
              disabled={uploading}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label} htmlFor="upload-alt">{t('media.altText')} ({t('media.optional')})</label>
            <input
              id="upload-alt"
              type="text"
              style={styles.input}
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              maxLength={255}
              disabled={uploading}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label} htmlFor="upload-usage">{t('media.usageContext')} ({t('media.optional')})</label>
            <input
              id="upload-usage"
              type="text"
              style={styles.input}
              value={usageContext}
              onChange={(e) => setUsageContext(e.target.value)}
              maxLength={120}
              disabled={uploading}
              placeholder={t('media.usageHint')}
            />
          </div>

          {/* Errors */}
          {error && <div style={styles.error}>{error}</div>}
          {fieldErrors.title && <div style={styles.fieldError}>{fieldErrors.title}</div>}
          {fieldErrors.alt_text && <div style={styles.fieldError}>{fieldErrors.alt_text}</div>}
          {fieldErrors.usage_context && <div style={styles.fieldError}>{fieldErrors.usage_context}</div>}
        </div>

        <div style={styles.footer}>
          <button style={styles.cancelBtn} onClick={handleClose} disabled={uploading}>
            {t('media.cancel')}
          </button>
          <button
            style={{ ...styles.uploadBtn, ...(uploading || !file ? styles.uploadBtnDisabled : {}) }}
            onClick={handleUpload}
            disabled={uploading || !file}
          >
            {uploading ? t('media.uploading') : t('media.upload')}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#12121e',
    borderRadius: '10px',
    border: '1px solid #2a2a3e',
    width: '90%',
    maxWidth: '480px',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.5rem',
    borderBottom: '1px solid #1e1e2e',
  },
  title: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#c9a96e',
    margin: 0,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#888',
    cursor: 'pointer',
    fontSize: '1rem',
    padding: '0.25rem',
  },
  body: {
    padding: '1.5rem',
  },
  dropZone: {
    border: '2px dashed #333',
    borderRadius: '8px',
    padding: '2rem',
    textAlign: 'center',
    cursor: 'pointer',
    marginBottom: '1rem',
    transition: 'border-color 0.15s',
  },
  dropZoneActive: {
    borderColor: '#c9a96e',
  },
  dropText: {
    color: '#888',
    fontSize: '0.875rem',
  },
  dropHint: {
    fontSize: '0.75rem',
    color: '#555',
    marginTop: '0.25rem',
  },
  fileInfo: {
    color: '#e0e0e0',
  },
  fileName: {
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  fileSize: {
    fontSize: '0.75rem',
    color: '#888',
    marginTop: '0.25rem',
  },
  field: {
    marginBottom: '0.875rem',
  },
  label: {
    display: 'block',
    fontSize: '0.75rem',
    color: '#888',
    marginBottom: '0.25rem',
  },
  input: {
    width: '100%',
    padding: '0.5rem 0.75rem',
    background: '#0a0a14',
    border: '1px solid #2a2a3e',
    borderRadius: '6px',
    color: '#e0e0e0',
    fontSize: '0.8125rem',
    outline: 'none',
  },
  error: {
    background: 'rgba(220, 50, 50, 0.1)',
    border: '1px solid rgba(220, 50, 50, 0.3)',
    borderRadius: '6px',
    padding: '0.625rem 0.75rem',
    color: '#e05050',
    fontSize: '0.8125rem',
    marginBottom: '0.5rem',
  },
  fieldError: {
    color: '#e05050',
    fontSize: '0.75rem',
    marginBottom: '0.25rem',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.5rem',
    padding: '1rem 1.5rem',
    borderTop: '1px solid #1e1e2e',
  },
  cancelBtn: {
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    border: '1px solid #333',
    background: 'transparent',
    color: '#888',
    fontSize: '0.8125rem',
    cursor: 'pointer',
  },
  uploadBtn: {
    padding: '0.5rem 1.25rem',
    borderRadius: '6px',
    border: '1px solid #c9a96e',
    background: 'rgba(201, 169, 110, 0.1)',
    color: '#c9a96e',
    fontSize: '0.8125rem',
    cursor: 'pointer',
    fontWeight: '500',
  },
  uploadBtnDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
};
