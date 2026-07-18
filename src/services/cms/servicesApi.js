/**
 * CMS Services API service.
 */
import { cmsFetch, buildQuery } from './cmsFetch';

export function listServices(params = {}) {
  return cmsFetch(`/api/v1/cms/services/${buildQuery(params)}`);
}

export function getService(id) {
  return cmsFetch(`/api/v1/cms/services/${id}/`);
}

export function createService(data) {
  return cmsFetch('/api/v1/cms/services/', { method: 'POST', body: data });
}

export function updateService(id, data) {
  return cmsFetch(`/api/v1/cms/services/${id}/`, { method: 'PATCH', body: data });
}

export function deleteService(id) {
  return cmsFetch(`/api/v1/cms/services/${id}/`, { method: 'DELETE' });
}

export function reorderServices(items) {
  return cmsFetch('/api/v1/cms/services/reorder/', { method: 'POST', body: { items } });
}
