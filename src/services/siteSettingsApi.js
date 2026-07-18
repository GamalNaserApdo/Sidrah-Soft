import { apiFetch } from './apiClient';

export const getSiteSettings = (options = {}) =>
  apiFetch('/api/v1/site-settings/', options);
