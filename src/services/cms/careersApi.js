/**
 * CMS Careers API service.
 */
import { cmsFetch, buildQuery } from './cmsFetch';

export function listJobs(params = {}) {
  return cmsFetch(`/api/v1/cms/careers/${buildQuery(params)}`);
}

export function getJob(id) {
  return cmsFetch(`/api/v1/cms/careers/${id}/`);
}

export function createJob(data) {
  return cmsFetch('/api/v1/cms/careers/', { method: 'POST', body: data });
}

export function updateJob(id, data) {
  return cmsFetch(`/api/v1/cms/careers/${id}/`, { method: 'PATCH', body: data });
}

export function deleteJob(id) {
  return cmsFetch(`/api/v1/cms/careers/${id}/`, { method: 'DELETE' });
}
