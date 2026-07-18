/**
 * MediaCard — individual asset card in the media grid.
 */

import { useCMSLang } from '../../../contexts/CMSLanguageContext';

export default function MediaCard({ asset, onClick }) {
  const { t } = useCMSLang();
  const fileSize = formatFileSize(asset.file_size);
  const dims = asset.width && asset.height ? `${asset.width}×${asset.height}` : '—';

  return (
    <div
      style={styles.card}
      onClick={() => onClick(asset)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(asset);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`${t('media.details')}: ${asset.title || asset.filename || t('media.asset', { id: asset.id })}`}
    >
      <div style={styles.thumbWrap}>
        {asset.file_url ? (
          <img
            src={asset.file_url}
            alt={asset.alt_text || asset.title || t('media.asset', { id: asset.id })}
            style={styles.thumb}
            loading="lazy"
          />
        ) : (
          <div style={styles.noThumb}>{t('media.noPreview')}</div>
        )}
      </div>
      <div style={styles.info}>
        <div style={styles.title}>{asset.title || asset.filename || t('media.asset', { id: asset.id })}</div>
        <div style={styles.meta}>
          <span>{asset.mime_type || '—'}</span>
          <span>{dims}</span>
          <span>{fileSize}</span>
        </div>
        <div style={styles.date}>
          {new Date(asset.created_at).toLocaleDateString()}
        </div>
      </div>
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
  card: {
    background: '#12121e',
    borderRadius: '8px',
    border: '1px solid #1e1e2e',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'border-color 0.15s',
  },
  thumbWrap: {
    width: '100%',
    aspectRatio: '4 / 3',
    overflow: 'hidden',
    background: '#0a0a14',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumb: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  noThumb: {
    color: '#555',
    fontSize: '0.75rem',
  },
  info: {
    padding: '0.625rem 0.75rem',
  },
  title: {
    fontSize: '0.8125rem',
    color: '#e0e0e0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginBottom: '0.25rem',
  },
  meta: {
    display: 'flex',
    gap: '0.5rem',
    fontSize: '0.6875rem',
    color: '#888',
    flexWrap: 'wrap',
  },
  date: {
    fontSize: '0.6875rem',
    color: '#555',
    marginTop: '0.25rem',
  },
};
