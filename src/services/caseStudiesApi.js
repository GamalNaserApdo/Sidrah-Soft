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

export const getCaseStudies = (params = {}, options = {}) => {
  const queryString = buildQueryString(params);
  return apiFetch(`/api/v1/case-studies/${queryString}`, options);
};

export const getCaseStudy = (slug, options = {}) =>
  apiFetch(`/api/v1/case-studies/${slug}/`, options);
