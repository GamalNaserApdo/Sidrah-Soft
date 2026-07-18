/**
 * CMS Homepage API service.
 */
import { cmsFetch, buildQuery } from './cmsFetch';

// Settings singleton
export function fetchHomepageSettings() {
  return cmsFetch('/api/v1/cms/homepage/settings/');
}

export function updateHomepageSettings(data) {
  return cmsFetch('/api/v1/cms/homepage/settings/', { method: 'PUT', body: data });
}

// Marquee items
export function listMarqueeItems(params = {}) {
  return cmsFetch(`/api/v1/cms/homepage/marquee/${buildQuery(params)}`);
}

export function createMarqueeItem(data) {
  return cmsFetch('/api/v1/cms/homepage/marquee/', { method: 'POST', body: data });
}

export function updateMarqueeItem(id, data) {
  return cmsFetch(`/api/v1/cms/homepage/marquee/${id}/`, { method: 'PATCH', body: data });
}

export function deleteMarqueeItem(id) {
  return cmsFetch(`/api/v1/cms/homepage/marquee/${id}/`, { method: 'DELETE' });
}

export function reorderMarqueeItems(items) {
  return cmsFetch('/api/v1/cms/homepage/marquee/reorder/', { method: 'POST', body: { items } });
}

// Industries
export function listIndustries(params = {}) {
  return cmsFetch(`/api/v1/cms/homepage/industries/${buildQuery(params)}`);
}

export function createIndustry(data) {
  return cmsFetch('/api/v1/cms/homepage/industries/', { method: 'POST', body: data });
}

export function updateIndustry(id, data) {
  return cmsFetch(`/api/v1/cms/homepage/industries/${id}/`, { method: 'PATCH', body: data });
}

export function deleteIndustry(id) {
  return cmsFetch(`/api/v1/cms/homepage/industries/${id}/`, { method: 'DELETE' });
}

export function reorderIndustries(items) {
  return cmsFetch('/api/v1/cms/homepage/industries/reorder/', { method: 'POST', body: { items } });
}

// Section configs
export function listSectionConfigs() {
  return cmsFetch('/api/v1/cms/homepage/sections/');
}

export function createSectionConfig(data) {
  return cmsFetch('/api/v1/cms/homepage/sections/', { method: 'POST', body: data });
}

export function updateSectionConfig(id, data) {
  return cmsFetch(`/api/v1/cms/homepage/sections/${id}/`, { method: 'PATCH', body: data });
}

export function deleteSectionConfig(id) {
  return cmsFetch(`/api/v1/cms/homepage/sections/${id}/`, { method: 'DELETE' });
}
