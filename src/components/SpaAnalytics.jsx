/**
 * SpaAnalytics — application-owned SPA navigation events.
 *
 * Pushes a custom `sidrah_page_view` event to `window.dataLayer` on:
 * - initial page load (only after analytics consent is granted)
 * - React Router navigation (location pathname/search change)
 * - browser Back/Forward (popstate) when the route updates
 * - analytics consent being granted after the page is already loaded
 *
 * Strict consent architecture:
 * - Before analytics consent is granted, NO `sidrah_page_view` events are
 *   pushed to dataLayer. This prevents any queued events from being
 *   processed by GTM if it loads later.
 * - When consent transitions to granted, the current page is pushed exactly
 *   once. This ensures GA4 receives the current page without requiring
 *   further navigation.
 * - When consent is revoked (granted → denied), the deduplication ref is
 *   reset so that re-granting consent will push the current page again.
 *   No new events are pushed while consent is denied.
 *
 * Deduplication strategy:
 * - A ref (`lastPushedPath`) tracks the last path that was actually pushed.
 * - Before pushing, the current path (pathname + search) is compared to
 *   `lastPushedPath`. If identical, the push is skipped.
 * - This is deterministic based on navigation identity, not timeouts.
 * - React StrictMode double-invocation of effects is handled because the
 *   second invocation sees the same path and skips.
 *
 * Sanitization:
 * - Sensitive query parameters (preview, token, key, password, etc.) are
 *   stripped from page_location and page_path before pushing to dataLayer.
 * - This prevents CMS preview tokens or other sensitive values from being
 *   sent to Google Analytics.
 *
 * This is the single source of truth for page views. GTM/GA4 must be
 * configured externally to listen for `sidrah_page_view` and not to also
 * fire on GTM's own History Change or GA4 automatic page_view triggers.
 */
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalyticsConsent } from '../contexts/AnalyticsContext';

// Query parameters that may carry sensitive values and must never be sent
// to analytics. The check is case-insensitive.
const SENSITIVE_QUERY_PARAMS = new Set([
  'preview',
  'token',
  'key',
  'password',
  'pwd',
  'secret',
  'auth',
  'apikey',
  'api_key',
  'access_token',
  'refresh_token',
  'code',
]);

function ensureDataLayer() {
  if (typeof window === 'undefined') return [];
  window.dataLayer = window.dataLayer || [];
  return window.dataLayer;
}

/**
 * Strip sensitive query parameters from a URL string.
 * Returns the sanitized URL string.
 */
function sanitizeUrl(url) {
  try {
    const parsed = new URL(url, window.location.origin);
    const params = new URLSearchParams(parsed.search);
    let removed = false;
    for (const key of [...params.keys()]) {
      if (SENSITIVE_QUERY_PARAMS.has(key.toLowerCase())) {
        params.delete(key);
        removed = true;
      }
    }
    if (removed) {
      parsed.search = params.toString();
    }
    return parsed.toString();
  } catch {
    // If URL parsing fails, return the original — fail safe rather than crash.
    return url;
  }
}

/**
 * Strip sensitive query parameters from a path string (pathname + search).
 * Returns the sanitized path.
 */
function sanitizePath(path) {
  try {
    const [pathname, search = ''] = path.split('?');
    const params = new URLSearchParams(search);
    let removed = false;
    for (const key of [...params.keys()]) {
      if (SENSITIVE_QUERY_PARAMS.has(key.toLowerCase())) {
        params.delete(key);
        removed = true;
      }
    }
    const cleanSearch = params.toString();
    return cleanSearch ? `${pathname}?${cleanSearch}` : pathname;
  } catch {
    return path;
  }
}

function pushPageView(path) {
  const dataLayer = ensureDataLayer();
  dataLayer.push({
    event: 'sidrah_page_view',
    page_location: sanitizeUrl(window.location.href),
    page_path: sanitizePath(path),
    page_title: document.title,
  });
}

export default function SpaAnalytics() {
  const location = useLocation();
  const { isGranted } = useAnalyticsConsent();
  const lastPushedPath = useRef(null);
  const analyticsGranted = isGranted('analytics');

  // Main effect: push page view on route change when consent is granted.
  useEffect(() => {
    if (!analyticsGranted) return;
    const currentPath = location.pathname + location.search;
    if (lastPushedPath.current === currentPath) return;
    lastPushedPath.current = currentPath;
    pushPageView(currentPath);
  }, [analyticsGranted, location.pathname, location.search]);

  // Reset deduplication ref when consent is revoked so that re-granting
  // consent will push the current page exactly once.
  useEffect(() => {
    if (!analyticsGranted) {
      lastPushedPath.current = null;
    }
  }, [analyticsGranted]);

  return null;
}
