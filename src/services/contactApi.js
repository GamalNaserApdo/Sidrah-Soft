import { apiFetch } from './apiClient';

export const getInquiryTypes = (options = {}) =>
  apiFetch('/api/v1/contact/inquiry-types/', options);

export const submitContactForm = (payload, options = {}) =>
  apiFetch('/api/v1/contact/submissions/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    ...options,
  });
