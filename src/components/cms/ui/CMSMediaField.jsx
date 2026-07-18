/**
 * CMS Media Field
 *
 * Reusable image picker field that integrates with existing MediaAssetPicker.
 * Shows current image thumbnail, select/remove buttons.
 */

import { useState } from 'react';
import MediaAssetPicker from '../media/MediaAssetPicker';
import { useCMSLang } from '../../../contexts/CMSLanguageContext';

export default function CMSMediaField({
  label,
  value,
  onChange,
  acceptedMimeTypes,
  minimumWidth,
  minimumHeight,
  usageLabel,
  hint,
}) {
  const { t } = useCMSLang();
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleSelect = (asset) => {
    onChange(asset.id, asset);
  };

  const handleRemove = () => {
    onChange(null, null);
  };

  const hasImage = value && (value.url || value.file_url);

  return (
    <div>
      {label && <label style={styles.label}>{label}</label>}
      <div style={styles.container}>
        {hasImage ? (
          <div style={styles.preview}>
            <img
              src={value.url || value.file_url}
              alt={value.alt_text || value.title || ''}
              style={styles.img}
            />
            <div style={styles.previewInfo}>
              <span style={styles.filename}>{value.title || value.alt_text || t('media.title')}</span>
              <div style={styles.previewActions}>
                <button type="button" onClick={() => setPickerOpen(true)} style={styles.changeBtn}>
                  {t('action.change')}
                </button>
                <button type="button" onClick={handleRemove} style={styles.removeBtn}>
                  {t('form.removeImage')}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div style={styles.empty}>
            <span style={styles.emptyText}>{t('form.noImage')}</span>
            <button type="button" onClick={() => setPickerOpen(true)} style={styles.selectBtn}>
              {t('form.selectImage')}
            </button>
          </div>
        )}
      </div>
      {hint && <div style={styles.hint}>{hint}</div>}
      <MediaAssetPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleSelect}
        acceptedMimeTypes={acceptedMimeTypes}
        minimumWidth={minimumWidth}
        minimumHeight={minimumHeight}
        usageLabel={usageLabel}
      />
    </div>
  );
}

const styles = {
  label: {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: '500',
    color: '#aaa',
    marginBottom: '0.375rem',
  },
  container: {
    border: '1px solid #2a2a3e',
    borderRadius: '8px',
    background: '#0a0a14',
    padding: '0.75rem',
  },
  preview: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
  },
  img: {
    width: '64px',
    height: '64px',
    objectFit: 'cover',
    borderRadius: '6px',
    border: '1px solid #2a2a3e',
    flexShrink: 0,
  },
  previewInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  },
  filename: {
    fontSize: '0.75rem',
    color: '#ccc',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  previewActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  changeBtn: {
    background: 'transparent',
    border: '1px solid #c9a96e',
    color: '#c9a96e',
    borderRadius: '4px',
    padding: '0.25rem 0.625rem',
    fontSize: '0.6875rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  removeBtn: {
    background: 'transparent',
    border: '1px solid rgba(239, 68, 68, 0.4)',
    color: '#ef4444',
    borderRadius: '4px',
    padding: '0.25rem 0.625rem',
    fontSize: '0.6875rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.625rem',
    padding: '1.25rem',
  },
  emptyText: {
    fontSize: '0.75rem',
    color: '#555',
  },
  selectBtn: {
    background: 'rgba(201, 169, 110, 0.1)',
    border: '1px solid #c9a96e',
    color: '#c9a96e',
    borderRadius: '6px',
    padding: '0.375rem 0.875rem',
    fontSize: '0.75rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  hint: {
    fontSize: '0.6875rem',
    color: '#555',
    marginTop: '0.25rem',
  },
};
