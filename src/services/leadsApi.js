/**
 * Leads Dashboard API service.
 *
 * Reuses the existing contact CMS endpoints behind the scenes.
 */
import { cmsFetch, buildQuery } from './cms/cmsFetch';

export function listLeads(params = {}) {
  return cmsFetch(`/api/v1/cms/contact/submissions/${buildQuery(params)}`);
}

export function getLead(id) {
  return cmsFetch(`/api/v1/cms/contact/submissions/${id}/`);
}

export function updateLead(id, data) {
  return cmsFetch(`/api/v1/cms/contact/submissions/${id}/`, {
    method: 'PATCH',
    body: data,
  });
}

export function getLeadStats(params = {}) {
  return cmsFetch(`/api/v1/cms/contact/submissions-stats/${buildQuery(params)}`);
}

export function listInquiryTypes(params = {}) {
  return cmsFetch(`/api/v1/cms/contact/inquiry-types/${buildQuery(params)}`);
}
