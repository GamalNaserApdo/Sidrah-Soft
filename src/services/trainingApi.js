/**
 * Public Training & Education API service.
 */
import { apiFetch } from './apiClient';

const BASE_URL = '/api/v1/training/programs';

export async function listPrograms(params = {}) {
  const query = new URLSearchParams();
  if (params.branch) query.set('branch', params.branch);
  const qs = query.toString();
  return apiFetch(`${BASE_URL}/${qs ? `?${qs}` : ''}`);
}

export async function getProgramBySlug(slug) {
  return apiFetch(`${BASE_URL}/${slug}/`);
}
