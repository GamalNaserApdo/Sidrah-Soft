/**
 * Google-style search result preview for SEO fields.
 * Shows how the page title and meta description will appear in search results.
 */
function SEOSearchPreview({ title, description, url, siteName }) {
  const displayTitle = title || 'Untitled Page';
  const displayDescription = description || 'No description set. Add a meta description to improve search visibility.';
  const displayUrl = url || '/';

  const truncatedTitle = displayTitle.length > 60 ? `${displayTitle.slice(0, 57)}...` : displayTitle;
  const truncatedDescription = displayDescription.length > 160 ? `${displayDescription.slice(0, 157)}...` : displayDescription;

  const urlParts = displayUrl.replace(/^https?:\/\//, '').split('/');
  const domain = urlParts[0] || 'sidrahsoft.com';
  const pathParts = urlParts.slice(1).filter(Boolean);

  return (
    <div style={styles.preview}>
      <div style={styles.previewLabel}>Search Preview</div>
      <div style={styles.googleResult}>
        <div style={styles.googleUrl}>
          <span style={styles.googleDomain}>{siteName || domain}</span>
          {pathParts.length > 0 && (
            <>
              <span style={styles.googleSep}> › </span>
              <span style={styles.googlePath}>{pathParts.join(' › ')}</span>
            </>
          )}
        </div>
        <div style={styles.googleTitle}>{truncatedTitle}</div>
        <div style={styles.googleDesc}>{truncatedDescription}</div>
      </div>
      <div style={styles.charHints}>
        <span style={title.length > 60 ? styles.charWarn : styles.charOk}>
          Title: {title.length}/60
        </span>
        <span style={description.length > 160 ? styles.charWarn : styles.charOk}>
          Description: {description.length}/160
        </span>
      </div>
    </div>
  );
}

const styles = {
  preview: {
    background: '#0d0d15',
    border: '1px solid #1e1e2e',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1rem',
  },
  previewLabel: {
    fontSize: '0.7rem',
    fontWeight: '600',
    color: '#c9a96e',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    marginBottom: '0.75rem',
  },
  googleResult: {
    background: '#fff',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
  },
  googleUrl: {
    fontSize: '0.8rem',
    color: '#202124',
    marginBottom: '0.25rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  googleDomain: {
    color: '#1a0dab',
    fontWeight: 500,
  },
  googleSep: {
    color: '#4d5156',
  },
  googlePath: {
    color: '#4d5156',
  },
  googleTitle: {
    fontSize: '1.1rem',
    color: '#1a0dab',
    lineHeight: 1.3,
    marginBottom: '0.25rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  googleDesc: {
    fontSize: '0.8rem',
    color: '#4d5156',
    lineHeight: 1.4,
  },
  charHints: {
    display: 'flex',
    gap: '1.5rem',
    marginTop: '0.5rem',
    fontSize: '0.7rem',
  },
  charOk: {
    color: '#6b7280',
  },
  charWarn: {
    color: '#f59e0b',
    fontWeight: 500,
  },
};

export default SEOSearchPreview;
