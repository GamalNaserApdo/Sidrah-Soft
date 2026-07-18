/**
 * CMS Media Library API service.
 *
 * Uses the existing API client for session credentials and CSRF.
 * Multipart uploads use FormData — no manual Content-Type header.
 */

import { API_BASE_URL } from '../apiClient';

function getCsrfToken() {
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? match[1] : null;
}

async function mediaFetch(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const headers = { ...options.headers };

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes((options.method || '').toUpperCase())) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
    }
  }

  // Do NOT set Content-Type for FormData — browser sets boundary automatically
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
    const error = new Error(data?.detail || `Request failed: ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

/**
 * List media assets with optional search/filter/ordering/pagination.
 */
export async function listMedia(params = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  }
  const qs = query.toString();
  return mediaFetch(`/api/v1/cms/media/${qs ? `?${qs}` : ''}`);
}

/**
 * Get a single media asset by ID.
 */
export async function getMedia(id) {
  return mediaFetch(`/api/v1/cms/media/${id}/`);
}

/**
 * Upload a new media asset (multipart/form-data).
 * @param {File} file - The image file to upload.
 * @param {object} metadata - Optional { title, alt_text, usage_context }.
 * @param {AbortSignal} [signal] - Optional abort signal for cancellation.
 */
export async function uploadMedia(file, metadata = {}, signal) {
  const formData = new FormData();
  formData.append('file', file);
  if (metadata.title) formData.append('title', metadata.title);
  if (metadata.alt_text) formData.append('alt_text', metadata.alt_text);
  if (metadata.usage_context) formData.append('usage_context', metadata.usage_context);

  return mediaFetch('/api/v1/cms/media/', {
    method: 'POST',
    body: formData,
    signal,
  });
}

/**
 * Update media metadata (title, alt_text, usage_context, is_active).
 */
export async function updateMediaMetadata(id, data) {
  return mediaFetch(`/api/v1/cms/media/${id}/`, {
    method: 'PATCH',
    body: data,
  });
}

/**
 * Get usage references for a media asset.
 */
export async function getMediaUsage(id) {
  return mediaFetch(`/api/v1/cms/media/${id}/usage/`);
}

/**
 * Delete a media asset. Returns null on success (204).
 * Throws with status 409 if the asset is in use.
 */
export async function deleteMedia(id) {
  return mediaFetch(`/api/v1/cms/media/${id}/`, {
    method: 'DELETE',
  });
}
