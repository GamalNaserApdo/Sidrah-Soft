/**
 * Static Page SEO API service.
 *
 * Fetches CMS-controlled SEO metadata for static pages.
 * Used by the useStaticPageSEO hook to resolve CMS SEO → seo.js fallback.
 */

import { apiFetch } from './apiClient';

let _cache = null;
let _fetchPromise = null;

/**
 * Fetch all static page SEO records (cached).
 * Returns a dict keyed by page_key.
 */
export async function getStaticPageSEO() {
  if (_cache) return _cache;
  if (_fetchPromise) return _fetchPromise;
  _fetchPromise = apiFetch('/api/v1/static-page-seo/')
    .then((data) => {
      _cache = data || {};
      _fetchPromise = null;
      return _cache;
    })
    .catch((err) => {
      _fetchPromise = null;
      // Return empty on failure so callers fall back to seo.js
      return {};
    });
  return _fetchPromise;
}

/**
 * Clear the cache (useful after CMS updates).
 */
export function clearStaticPageSEOCache() {
  _cache = null;
}
