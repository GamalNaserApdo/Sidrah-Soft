/**
 * Activity Logs admin API service.
 *
 * Read-only endpoints for the Custom Sidrah CMS audit log.
 * Uses credentials: 'include' for session cookies.
 * Does not store logs in localStorage.
 */

import { apiFetch } from './apiClient';

/**
 * Fetch a paginated list of activity logs with optional filters.
 *
 * @param {object} [filters={}] - Filter/pagination params.
 * @param {string} [filters.search] - Search term.
 * @param {string} [filters.module] - Module identifier.
 * @param {string} [filters.action] - Action identifier.
 * @param {boolean} [filters.success] - Success state.
 * @param {string} [filters.from] - ISO start date.
 * @param {string} [filters.to] - ISO end date.
 * @param {number} [filters.page] - Page number.
 * @param {number} [filters.page_size] - Page size (max 100).
 * @returns {Promise<object>} Paginated response from the API.
 */
export async function fetchActivityLogs(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    params.append(key, String(value));
  });

  const query = params.toString();
  const path = `/api/v1/admin/activity-logs/${query ? `?${query}` : ''}`;

  return apiFetch(path, {
    method: 'GET',
    credentials: 'include',
  });
}

/**
 * Fetch a single activity log entry by ID.
 *
 * @param {number} id - Activity log ID.
 * @returns {Promise<object>} Activity log detail.
 */
export async function fetchActivityLog(id) {
  return apiFetch(`/api/v1/admin/activity-logs/${id}/`, {
    method: 'GET',
    credentials: 'include',
  });
}
