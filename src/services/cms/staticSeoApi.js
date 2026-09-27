/**
 * CMS Static Page SEO API service.
 *
 * Static page SEO records are keyed by a code-controlled page_key.
 * - List endpoint returns the catalogue of valid page keys (with has_record flag).
 * - Detail endpoint returns the SEO record for a given page key.
 * - Update endpoint saves the SEO record for a given page key.
 */
import { cmsFetch } from './cmsFetch';

/**
 * Fetch the list of valid static page SEO keys.
 * GET /api/v1/cms/static-page-seo/
 */
export function getStaticSEOList() {
  return cmsFetch('/api/v1/cms/static-page-seo/');
}

/**
 * Fetch a single static page SEO record by page key.
 * GET /api/v1/cms/static-page-seo/<pageKey>/
 */
export function getStaticSEO(pageKey) {
  return cmsFetch(`/api/v1/cms/static-page-seo/${pageKey}/`);
}

/**
 * Update a single static page SEO record by page key.
 * PUT /api/v1/cms/static-page-seo/<pageKey>/
 */
export function updateStaticSEO(pageKey, data) {
  return cmsFetch(`/api/v1/cms/static-page-seo/${pageKey}/`, {
    method: 'PUT',
    body: data,
  });
}
