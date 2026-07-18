import { apiFetch } from './apiClient';

function buildQueryString(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  const query = params.toString();
  return query ? `?${query}` : '';
}

export const getJobs = (filters = {}, options = {}) =>
  apiFetch(`/api/v1/jobs/${buildQueryString(filters)}`, options);

export const getJob = (slug, options = {}) =>
  apiFetch(`/api/v1/jobs/${slug}/`, options);
