import { apiFetch } from './apiClient';

export const getHomepageServices = (options = {}) =>
  apiFetch('/api/v1/services/?show_on_homepage=true', options);

export const getAllServices = (options = {}) =>
  apiFetch('/api/v1/services/', options);

export const getService = (slug, options = {}) =>
  apiFetch(`/api/v1/services/${slug}/`, options);
