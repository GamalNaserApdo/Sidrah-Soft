import { apiFetch } from './apiClient';

export const getHomepageServices = (options = {}) =>
  apiFetch('/api/v1/services/?show_on_homepage=true', options);
