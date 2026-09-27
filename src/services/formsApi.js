/**
 * Public Dynamic Forms API service.
 */
import { apiFetch } from './apiClient';

export const getForm = (slug, options = {}) =>
  apiFetch(`/api/v1/forms/${slug}/`, options);

export const getAssignedForm = (target, options = {}) =>
  apiFetch(`/api/v1/forms/assigned/${target}/`, options);

export const submitForm = (slug, payload, options = {}) =>
  apiFetch(`/api/v1/forms/${slug}/submit/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    ...options,
  });
