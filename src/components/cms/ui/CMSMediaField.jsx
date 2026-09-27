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
    fontSize: 'var(--font-size-sm)',
    fontWeight: '500',
    color: 'var(--cms-text-secondary)',
    marginBottom: 'var(--space-1)',
  },
  container: {
    border: '1px solid var(--cms-border-default)',
    borderRadius: 'var(--cms-radius-md)',
    background: 'var(--cms-bg-input)',
    padding: 'var(--space-3)',
  },
  preview: {
    display: 'flex',
    gap: 'var(--space-3)',
    alignItems: 'center',
  },
  img: {
    width: '64px',
    height: '64px',
    objectFit: 'cover',
    borderRadius: 'var(--cms-radius-sm)',
    border: '1px solid var(--cms-border-default)',
    flexShrink: 0,
  },
  previewInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-1)',
  },
  filename: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--cms-text-primary)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  previewActions: {
    display: 'flex',
    gap: 'var(--space-2)',
  },
  changeBtn: {
    background: 'transparent',
    border: '1px solid var(--cms-accent)',
    color: 'var(--cms-accent)',
    borderRadius: 'var(--cms-radius-sm)',
    padding: 'var(--space-1) var(--space-2)',
    fontSize: 'var(--font-size-xs)',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  removeBtn: {
    background: 'transparent',
    border: '1px solid var(--cms-danger-border)',
    color: 'var(--cms-danger)',
    borderRadius: 'var(--cms-radius-sm)',
    padding: 'var(--space-1) var(--space-2)',
    fontSize: 'var(--font-size-xs)',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--space-2)',
    padding: 'var(--space-5)',
  },
  emptyText: {
    fontSize: 'var(--font-size-sm)',
    color: 'var(--cms-text-muted)',
  },
  selectBtn: {
    background: 'var(--cms-accent-bg)',
    border: '1px solid var(--cms-accent)',
    color: 'var(--cms-accent)',
    borderRadius: 'var(--cms-radius-md)',
    padding: 'var(--space-1) var(--space-3)',
    fontSize: 'var(--font-size-sm)',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  hint: {
    fontSize: 'var(--font-size-xs)',
    color: 'var(--cms-text-dim)',
    marginTop: 'var(--space-1)',
  },
};
