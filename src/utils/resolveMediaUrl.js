import { API_BASE_URL } from '../services/apiClient';

/**
 * Resolve a CMS media URL to an absolute URL.
 *
 * - Accepts an absolute URL as-is.
 * - Prefixes a relative `/media/...` path with the API base URL.
 * - Accepts a media object containing a `url` property.
 * - Returns null for missing/invalid input so callers can safely fallback.
 *
 * @param {string | { url?: string } | null | undefined} media
 * @returns {string | null}
 */
export default function resolveMediaUrl(media) {
  if (!media) return null;

  const url = typeof media === 'string' ? media : media.url;
  if (!url || typeof url !== 'string') return null;

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  return url.startsWith('/') ? `${base}${url}` : `${base}/${url}`;
}
