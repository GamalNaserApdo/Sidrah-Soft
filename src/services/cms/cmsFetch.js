/**
 * Shared CMS API Client
 *
 * Extends the existing apiClient with CSRF handling for mutations.
 * Reuses the same API_BASE_URL and session credentials.
 * Does not duplicate the global request client — wraps it with CMS-specific needs.
 */

import { API_BASE_URL, ApiError } from '../apiClient';

function getCsrfToken() {
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? match[1] : null;
}

/**
 * CMS fetch with CSRF, credentials, and JSON handling.
 *
 * @param {string} path - Relative API path (e.g. '/api/v1/cms/partners/')
 * @param {object} [options={}] - Fetch options
 * @returns {Promise<any>} Parsed JSON or null for 204
 * @throws {ApiError} On non-2xx responses
 */
export async function cmsFetch(path, options = {}) {
  const url = path.startsWith('http')
    ? path
    : `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  const headers = { ...options.headers };
  const method = (options.method || 'GET').toUpperCase();

  // CSRF for unsafe methods
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
    }
  }

  // Content-Type for JSON bodies (not FormData)
  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    options.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(response.status, response.statusText, data);
  }

  return data;
}

/**
 * Build query string from params object, omitting empty values.
 */
export function buildQuery(params = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  }
  const qs = query.toString();
  return qs ? `?${qs}` : '';
}

/**
 * Parse API error into user-friendly message.
 * Does not expose backend stack traces.
 */
export function parseApiError(error) {
  if (!error) return 'Unknown error.';

  // Network error
  if (error.status === 0) {
    return 'Network error. Please check your connection.';
  }

  // Session expired
  if (error.status === 401) {
    return 'Session expired. Please log in again.';
  }

  // Permission denied
  if (error.status === 403) {
    return 'You do not have permission to perform this action.';
  }

  // Not found
  if (error.status === 404) {
    return 'The requested resource was not found.';
  }

  // Conflict
  if (error.status === 409) {
    return error.data?.detail || 'This item is referenced and cannot be deleted.';
  }

  // Throttled
  if (error.status === 429) {
    return 'Too many requests. Please wait a moment and try again.';
  }

  // Validation error (400)
  if (error.status === 400 && error.data) {
    // Return field errors as-is for form display; provide fallback message
    const fieldErrors = error.data;
    if (typeof fieldErrors === 'object') {
      const messages = [];
      for (const [field, errs] of Object.entries(fieldErrors)) {
        if (field === 'non_field_errors' || field === 'detail') {
          messages.push(Array.isArray(errs) ? errs.join(' ') : String(errs));
        }
      }
      if (messages.length > 0) return messages.join(' ');
    }
    return error.data?.detail || 'Validation error. Please check the form.';
  }

  // Server error
  if (error.status >= 500) {
    return 'Server error. Please try again later.';
  }

  return error.data?.detail || error.message || 'Request failed.';
}

/**
 * Extract field-level errors from an ApiError for form display.
 * Returns { fieldName: [messages] } or {} if no field errors.
 */
export function extractFieldErrors(error) {
  if (!error || !error.data || typeof error.data !== 'object') return {};
  const errors = {};
  for (const [key, value] of Object.entries(error.data)) {
    if (key === 'non_field_errors' || key === 'detail') continue;
    errors[key] = Array.isArray(value) ? value : [String(value)];
  }
  return errors;
}

/**
 * Extract non-field errors from an ApiError.
 * Returns string or null.
 */
export function extractNonFieldErrors(error) {
  if (!error || !error.data) return null;
  if (error.data.non_field_errors) {
    return Array.isArray(error.data.non_field_errors)
      ? error.data.non_field_errors.join(' ')
      : String(error.data.non_field_errors);
  }
  if (error.data.detail && typeof error.data.detail === 'string') {
    return error.data.detail;
  }
  return null;
}
