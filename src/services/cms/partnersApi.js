/**
 * CMS Partners API service.
 */
import { cmsFetch, buildQuery } from './cmsFetch';

export function listPartners(params = {}) {
  return cmsFetch(`/api/v1/cms/partners/${buildQuery(params)}`);
}

export function getPartner(id) {
  return cmsFetch(`/api/v1/cms/partners/${id}/`);
}

export function createPartner(data) {
  return cmsFetch('/api/v1/cms/partners/', { method: 'POST', body: data });
}

export function updatePartner(id, data) {
  return cmsFetch(`/api/v1/cms/partners/${id}/`, { method: 'PATCH', body: data });
}

export function deletePartner(id) {
  return cmsFetch(`/api/v1/cms/partners/${id}/`, { method: 'DELETE' });
}

export function reorderPartners(items) {
  return cmsFetch('/api/v1/cms/partners/reorder/', { method: 'POST', body: { items } });
}
