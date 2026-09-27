/**
 * CMS Training Registrations API service.
 */
import { cmsFetch, buildQuery } from './cmsFetch';

const BASE_URL = '/api/v1/cms/training/registrations';

export function listRegistrations(params = {}) {
  return cmsFetch(`${BASE_URL}/${buildQuery(params)}`);
}

export function getRegistration(id) {
  return cmsFetch(`${BASE_URL}/${id}/`);
}

export function createRegistration(data) {
  return cmsFetch(`${BASE_URL}/`, { method: 'POST', body: data });
}

export function updateRegistration(id, data) {
  return cmsFetch(`${BASE_URL}/${id}/`, { method: 'PATCH', body: data });
}

export function deleteRegistration(id) {
  return cmsFetch(`${BASE_URL}/${id}/`, { method: 'DELETE' });
}

export function getRegistrationStats(params = {}) {
  return cmsFetch(`${BASE_URL}/stats/${buildQuery(params)}`);
}

export function exportRegistrations(params = {}) {
  return cmsFetch(`${BASE_URL}/export/${buildQuery(params)}`, { responseType: 'text' });
}

/**
 * Atomically transition a registration's operational status
 * (lead/contacted/subscribed/cancelled). Server enforces transition rules.
 * Optional `note` is appended to internal_notes (e.g. cancellation reason).
 */
export function transitionOperationalStatus(id, status, note) {
  return cmsFetch(`${BASE_URL}/${id}/operational-status/`, {
    method: 'POST',
    body: { status, ...(note ? { note } : {}) },
  });
}
