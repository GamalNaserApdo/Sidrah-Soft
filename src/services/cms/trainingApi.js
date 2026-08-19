/**
 * CMS Training & Education API service.
 */
import { cmsFetch } from './cmsFetch';

function buildQuery(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.branch) query.set('branch', params.branch);
  if (params.status) query.set('status', params.status);
  if (params.ordering) query.set('ordering', params.ordering);
  if (params.page) query.set('page', params.page);
  if (params.page_size) query.set('page_size', params.page_size);
  const qs = query.toString();
  return qs ? `?${qs}` : '';
}

export function listPrograms(params = {}) {
  return cmsFetch(`/api/v1/cms/training/${buildQuery(params)}`);
}

export function getProgram(id) {
  return cmsFetch(`/api/v1/cms/training/${id}/`);
}

export function createProgram(data) {
  return cmsFetch('/api/v1/cms/training/', { method: 'POST', body: data });
}

export function updateProgram(id, data) {
  return cmsFetch(`/api/v1/cms/training/${id}/`, { method: 'PATCH', body: data });
}

export function deleteProgram(id) {
  return cmsFetch(`/api/v1/cms/training/${id}/`, { method: 'DELETE' });
}

export function reorderPrograms(items) {
  return cmsFetch('/api/v1/cms/training/reorder/', { method: 'POST', body: { items } });
}
