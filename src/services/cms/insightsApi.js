/**
 * CMS Insights API service.
 * Articles CRUD + workflow actions (publish/unpublish/archive).
 */
import { cmsFetch, buildQuery } from './cmsFetch';

export function listArticles(params = {}) {
  return cmsFetch(`/api/v1/cms/insights/${buildQuery(params)}`);
}

export function getArticle(id) {
  return cmsFetch(`/api/v1/cms/insights/${id}/`);
}

export function createArticle(data) {
  return cmsFetch('/api/v1/cms/insights/', { method: 'POST', body: data });
}

export function updateArticle(id, data) {
  return cmsFetch(`/api/v1/cms/insights/${id}/`, { method: 'PATCH', body: data });
}

export function deleteArticle(id) {
  return cmsFetch(`/api/v1/cms/insights/${id}/`, { method: 'DELETE' });
}

// ─── Workflow ───────────────────────────────────────────────────────────────
export function publishArticle(id) {
  return cmsFetch(`/api/v1/cms/insights/${id}/publish/`, { method: 'POST' });
}

export function unpublishArticle(id) {
  return cmsFetch(`/api/v1/cms/insights/${id}/unpublish/`, { method: 'POST' });
}

export function archiveArticle(id) {
  return cmsFetch(`/api/v1/cms/insights/${id}/archive/`, { method: 'POST' });
}
