import { apiFetch } from './apiClient';

export const getHomepageConfig = (options = {}) =>
  apiFetch('/api/v1/homepage/', options);
