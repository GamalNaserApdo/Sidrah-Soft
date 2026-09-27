/**
 * AI Automation page API service.
 *
 * Fetches CMS-controlled AI Automation page content.
 * Used by the useAIAutomation hook to resolve CMS content → i18n fallback.
 */

import { apiFetch } from './apiClient';

let _cache = null;
let _fetchPromise = null;

/**
 * Fetch the AI Automation page content (cached).
 */
export async function getAIAutomationContent() {
  if (_cache) return _cache;
  if (_fetchPromise) return _fetchPromise;
  _fetchPromise = apiFetch('/api/v1/ai-automation/')
    .then((data) => {
      _cache = data || {};
      _fetchPromise = null;
      return _cache;
    })
    .catch((err) => {
      _fetchPromise = null;
      // Return null on failure so callers fall back to i18n
      return null;
    });
  return _fetchPromise;
}

/**
 * Clear the cache (useful after CMS updates).
 */
export function clearAIAutomationCache() {
  _cache = null;
}
