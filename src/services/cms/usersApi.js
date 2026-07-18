/**
 * CMS Users Management API service.
 *
 * Uses cmsFetch for CSRF handling and session credentials.
 * Never stores passwords or sensitive data in localStorage.
 */

import { cmsFetch, buildQuery } from './cmsFetch';

export function listUsers(params = {}) {
  return cmsFetch(`/api/v1/admin/users/${buildQuery(params)}`);
}

export function getUser(id) {
  return cmsFetch(`/api/v1/admin/users/${id}/`);
}

export function createUser(data) {
  return cmsFetch('/api/v1/admin/users/', { method: 'POST', body: data });
}

export function updateUser(id, data) {
  return cmsFetch(`/api/v1/admin/users/${id}/`, { method: 'PATCH', body: data });
}

export function activateUser(id) {
  return cmsFetch(`/api/v1/admin/users/${id}/activate/`, { method: 'POST' });
}

export function deactivateUser(id) {
  return cmsFetch(`/api/v1/admin/users/${id}/deactivate/`, { method: 'POST' });
}

export function resetUserPassword(id, data) {
  return cmsFetch(`/api/v1/admin/users/${id}/reset_password/`, { method: 'POST', body: data });
}
