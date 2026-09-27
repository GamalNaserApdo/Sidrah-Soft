/**
 * Public certificate verification API.
 */
import { apiFetch } from './apiClient';

export async function verifyCertificate(reference) {
  return apiFetch(`/api/v1/training/certificates/${reference}/verify/`);
}
