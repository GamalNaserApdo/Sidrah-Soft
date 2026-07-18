import { apiFetch } from './apiClient';

export const getHeaderNavigation = (options = {}) =>
  apiFetch('/api/v1/navigation/?location=header', options);

export const getMobileNavigation = (options = {}) =>
  apiFetch('/api/v1/navigation/?location=mobile', options);

export const getFooterNavigation = (options = {}) =>
  apiFetch('/api/v1/navigation/?location=footer', options);

export const getLegalNavigation = (options = {}) =>
  apiFetch('/api/v1/navigation/?location=legal', options);
