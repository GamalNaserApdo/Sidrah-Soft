import { apiFetch } from './apiClient';

export const getPartners = (options = {}) =>
  apiFetch('/api/v1/partners/', options);
