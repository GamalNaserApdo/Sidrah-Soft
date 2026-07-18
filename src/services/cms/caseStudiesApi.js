/**
 * CMS Case Studies API service.
 */
import { cmsFetch, buildQuery } from './cmsFetch';

export function listCaseStudies(params = {}) {
  return cmsFetch(`/api/v1/cms/case-studies/${buildQuery(params)}`);
}

export function getCaseStudy(id) {
  return cmsFetch(`/api/v1/cms/case-studies/${id}/`);
}

export function createCaseStudy(data) {
  return cmsFetch('/api/v1/cms/case-studies/', { method: 'POST', body: data });
}

export function updateCaseStudy(id, data) {
  return cmsFetch(`/api/v1/cms/case-studies/${id}/`, { method: 'PATCH', body: data });
}

export function deleteCaseStudy(id) {
  return cmsFetch(`/api/v1/cms/case-studies/${id}/`, { method: 'DELETE' });
}

export function reorderCaseStudies(items) {
  return cmsFetch('/api/v1/cms/case-studies/reorder/', { method: 'POST', body: { items } });
}
