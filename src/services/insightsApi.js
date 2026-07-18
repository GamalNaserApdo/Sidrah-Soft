import { apiFetch } from './apiClient';

function buildQueryString(params) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
}

export const getInsights = (params = {}, options = {}) => {
  const queryString = buildQueryString(params);
  return apiFetch(`/api/v1/insights/${queryString}`, options);
};

export const getInsight = (slug, options = {}) =>
  apiFetch(`/api/v1/insights/${slug}/`, options);
