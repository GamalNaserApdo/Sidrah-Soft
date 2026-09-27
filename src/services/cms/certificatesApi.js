/**
 * CMS Certificates API service.
 */
import { cmsFetch, buildQuery } from './cmsFetch';

const BASE_URL = '/api/v1/cms/training/certificates';

export function listCertificates(params = {}) {
  return cmsFetch(`${BASE_URL}/${buildQuery(params)}`);
}

export function getCertificate(id) {
  return cmsFetch(`${BASE_URL}/${id}/`);
}

export function createCertificate(data) {
  return cmsFetch(`${BASE_URL}/`, { method: 'POST', body: data });
}

export function updateCertificate(id, data) {
  return cmsFetch(`${BASE_URL}/${id}/`, { method: 'PATCH', body: data });
}

export function issueCertificate(id) {
  return cmsFetch(`${BASE_URL}/${id}/issue/`, { method: 'POST' });
}

export function revokeCertificate(id, data = {}) {
  return cmsFetch(`${BASE_URL}/${id}/revoke/`, { method: 'POST', body: data });
}

/**
 * Upload a certificate PDF/file via PATCH with multipart FormData.
 * The backend requires the filename (without extension) to match the certificate reference.
 * @param {number} id - Certificate ID
 * @param {File} file - The PDF file to upload
 * @param {object} [extraFields] - Optional extra fields to include in the PATCH
 */
export function uploadCertificateFile(id, file, extraFields = {}) {
  const formData = new FormData();
  formData.append('certificate_file', file);
  for (const [key, value] of Object.entries(extraFields)) {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  }
  return cmsFetch(`${BASE_URL}/${id}/`, { method: 'PATCH', body: formData });
}

/**
 * Remove the certificate file by sending an empty string for certificate_file.
 */
export function removeCertificateFile(id) {
  return cmsFetch(`${BASE_URL}/${id}/`, {
    method: 'PATCH',
    body: { certificate_file: '' },
  });
}

/**
 * Build the QR code download URL for a certificate.
 */
export function getQrCodeUrl(id) {
  return `${BASE_URL}/${id}/qr-code/`;
}
