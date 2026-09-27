/**
 * CMS Courses Offers API service (OfferCampaign -> OfferItem -> Program).
 * Reuses the existing 'training' CMS module endpoints and RBAC.
 */
import { cmsFetch } from './cmsFetch';

function buildQuery(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.status) query.set('status', params.status);
  if (params.page) query.set('page', params.page);
  if (params.page_size) query.set('page_size', params.page_size);
  const qs = query.toString();
  return qs ? `?${qs}` : '';
}

// OfferCampaign CRUD
export function listOfferCampaigns(params = {}) {
  return cmsFetch(`/api/v1/cms/training/offers/${buildQuery(params)}`);
}

export function getOfferCampaign(id) {
  return cmsFetch(`/api/v1/cms/training/offers/${id}/`);
}

export function createOfferCampaign(data) {
  return cmsFetch('/api/v1/cms/training/offers/', { method: 'POST', body: data });
}

export function updateOfferCampaign(id, data) {
  return cmsFetch(`/api/v1/cms/training/offers/${id}/`, { method: 'PATCH', body: data });
}

export function deleteOfferCampaign(id) {
  return cmsFetch(`/api/v1/cms/training/offers/${id}/`, { method: 'DELETE' });
}

// OfferItem management (nested under a campaign)
export function listOfferItems(campaignId) {
  return cmsFetch(`/api/v1/cms/training/offers/${campaignId}/items/`);
}

export function addOfferItem(campaignId, data) {
  return cmsFetch(`/api/v1/cms/training/offers/${campaignId}/items/`, { method: 'POST', body: data });
}

export function updateOfferItem(itemId, data) {
  return cmsFetch(`/api/v1/cms/training/offer-items/${itemId}/`, { method: 'PATCH', body: data });
}

export function deleteOfferItem(itemId) {
  return cmsFetch(`/api/v1/cms/training/offer-items/${itemId}/`, { method: 'DELETE' });
}

export function reorderOfferItems(campaignId, items) {
  return cmsFetch(`/api/v1/cms/training/offers/${campaignId}/items/reorder/`, {
    method: 'POST',
    body: { items },
  });
}
