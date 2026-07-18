/**
 * CMS Navigation API service.
 * Menus CRUD, Items CRUD, and bulk reorder.
 */
import { cmsFetch, buildQuery } from './cmsFetch';

// ─── Menus ──────────────────────────────────────────────────────────────────
export function listMenus(params = {}) {
  return cmsFetch(`/api/v1/cms/navigation/menus/${buildQuery(params)}`);
}

export function getMenu(id) {
  return cmsFetch(`/api/v1/cms/navigation/menus/${id}/`);
}

export function createMenu(data) {
  return cmsFetch('/api/v1/cms/navigation/menus/', { method: 'POST', body: data });
}

export function updateMenu(id, data) {
  return cmsFetch(`/api/v1/cms/navigation/menus/${id}/`, { method: 'PATCH', body: data });
}

export function deleteMenu(id) {
  return cmsFetch(`/api/v1/cms/navigation/menus/${id}/`, { method: 'DELETE' });
}

// ─── Items ──────────────────────────────────────────────────────────────────
export function listItems(params = {}) {
  return cmsFetch(`/api/v1/cms/navigation/items/${buildQuery(params)}`);
}

export function getItem(id) {
  return cmsFetch(`/api/v1/cms/navigation/items/${id}/`);
}

export function createItem(data) {
  return cmsFetch('/api/v1/cms/navigation/items/', { method: 'POST', body: data });
}

export function updateItem(id, data) {
  return cmsFetch(`/api/v1/cms/navigation/items/${id}/`, { method: 'PATCH', body: data });
}

export function deleteItem(id) {
  return cmsFetch(`/api/v1/cms/navigation/items/${id}/`, { method: 'DELETE' });
}

// ─── Reorder ────────────────────────────────────────────────────────────────
export function reorderItems(menuId, items) {
  return cmsFetch('/api/v1/cms/navigation/reorder/', {
    method: 'POST',
    body: { menu_id: menuId, items },
  });
}
