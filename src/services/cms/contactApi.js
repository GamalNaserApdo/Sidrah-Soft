/**
 * CMS Contact API service.
 * Inquiry Types CRUD + Contact Submissions management.
 */
import { cmsFetch, buildQuery } from './cmsFetch';

// ─── Inquiry Types ──────────────────────────────────────────────────────────
export function listInquiryTypes(params = {}) {
  return cmsFetch(`/api/v1/cms/contact/inquiry-types/${buildQuery(params)}`);
}

export function getInquiryType(id) {
  return cmsFetch(`/api/v1/cms/contact/inquiry-types/${id}/`);
}

export function createInquiryType(data) {
  return cmsFetch('/api/v1/cms/contact/inquiry-types/', { method: 'POST', body: data });
}

export function updateInquiryType(id, data) {
  return cmsFetch(`/api/v1/cms/contact/inquiry-types/${id}/`, { method: 'PATCH', body: data });
}

export function deleteInquiryType(id) {
  return cmsFetch(`/api/v1/cms/contact/inquiry-types/${id}/`, { method: 'DELETE' });
}

// ─── Contact Submissions ────────────────────────────────────────────────────
export function listSubmissions(params = {}) {
  return cmsFetch(`/api/v1/cms/contact/submissions/${buildQuery(params)}`);
}

export function getSubmission(id) {
  return cmsFetch(`/api/v1/cms/contact/submissions/${id}/`);
}

export function updateSubmission(id, data) {
  return cmsFetch(`/api/v1/cms/contact/submissions/${id}/`, { method: 'PATCH', body: data });
}

export function deleteSubmission(id) {
  return cmsFetch(`/api/v1/cms/contact/submissions/${id}/`, { method: 'DELETE' });
}
