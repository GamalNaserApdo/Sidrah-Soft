/**
 * Public Training & Education API service.
 */
import { apiFetch } from './apiClient';

const BASE_URL = '/api/v1/training/programs';

export const DEFAULT_REGISTRATION_URL = 'https://forms.gle/tjHRqBZrkNYtrWNL7';

export async function listPrograms(params = {}) {
  const query = new URLSearchParams();
  if (params.branch) query.set('branch', params.branch);
  const qs = query.toString();
  return apiFetch(`${BASE_URL}/${qs ? `?${qs}` : ''}`);
}

export async function getProgramBySlug(slug) {
  return apiFetch(`${BASE_URL}/${slug}/`);
}

/**
 * Fetch active training offer campaigns with their offer items.
 * Returns an array of campaigns; empty array when no offers are active.
 */
export async function fetchOffers(options = {}) {
  return apiFetch('/api/v1/training/offers/', options);
}

export async function getProgramPreview(slug, token) {
  const query = new URLSearchParams();
  if (token) query.set('token', token);
  const qs = query.toString();
  return apiFetch(`${BASE_URL}/${slug}/preview/${qs ? `?${qs}` : ''}`);
}

/**
 * Fetch the PUBLISHED Starter landing page section payload.
 * Falls back are handled by the backend (compiled defaults).
 */
export async function getStarterPage() {
  return apiFetch('/api/v1/training/starter-page/');
}

/**
 * Fetch the DRAFT Starter landing payload using a signed CMS preview token.
 */
export async function getStarterPagePreview(token) {
  const query = new URLSearchParams();
  if (token) query.set('token', token);
  return apiFetch(`/api/v1/training/starter-page/preview/?${query.toString()}`);
}

/**
 * Resolve the registration URL for a course.
 * Falls back to the default URL if the program doesn't have one.
 * Does NOT override CMS settings — uses the program's registration_url.
 */
export function resolveRegistrationUrl(program) {
  if (program && program.registration_url) {
    return program.registration_url;
  }
  if (program && program.registrationUrl) {
    return program.registrationUrl;
  }
  return DEFAULT_REGISTRATION_URL;
}

/**
 * Submit a native website registration form.
 * @param {string} slug - Program slug
 * @param {object} data - Form data (full_name, email, phone, etc.)
 * @param {object} utm - UTM attribution data
 * @returns {Promise<object>} API response
 */
export async function submitRegistration(slug, data, utm = {}) {
  const payload = {
    full_name: data.full_name,
    email: data.email,
    phone: data.phone,
    college_or_school: data.college_or_school || '',
    academic_year: data.academic_year || '',
    university: data.university || '',
    university_other: data.university_other || '',
    education_status: data.education_status || '',
    education_status_other: data.education_status_other || '',
    notes: data.notes || '',
    preferred_language: data.preferred_language || 'en',
    privacy_policy_consent: data.privacyConsent !== false,
    website_field: data.website_field || '', // honeypot
    utm_source: utm.utm_source || '',
    utm_medium: utm.utm_medium || '',
    utm_campaign: utm.utm_campaign || '',
    utm_content: utm.utm_content || '',
    utm_term: utm.utm_term || '',
    referrer: utm.referrer || '',
    landing_page_url: utm.landing_page_url || '',
  };

  [
    'current_level',
    'current_status',
    'current_status_other',
    'acquisition_source',
    'acquisition_source_other',
  ].forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(data, field)) {
      payload[field] = data[field] || '';
    }
  });

  return apiFetch(`${BASE_URL}/${slug}/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

/**
 * UTM / campaign attribution persistence.
 *
 * The registration form reads UTM params from the URL at submit time, but this
 * is a SPA — React Router drops the query string on client-side navigation, so
 * params present on the initial landing URL are lost before the user reaches a
 * course registration form. To make the existing attribution survive the real
 * ad -> landing -> browse -> register journey, we persist first-touch
 * attribution in sessionStorage (tab-scoped, cleared when the tab closes).
 *
 * This completes the existing mechanism; it is not a new tracking layer.
 */
const UTM_STORAGE_KEY = 'sidrah_utm_attribution';
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

function readUrlAttribution() {
  const params = new URLSearchParams(window.location.search);
  const data = {
    referrer: document.referrer || '',
    landing_page_url: window.location.href.split('?')[0] || '',
  };
  UTM_KEYS.forEach((key) => {
    data[key] = params.get(key) || '';
  });
  return data;
}

function hasAnyUtm(data) {
  return UTM_KEYS.some((key) => Boolean(data[key]));
}

function readStoredAttribution() {
  try {
    const raw = window.sessionStorage.getItem(UTM_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Capture first-touch campaign attribution as early as possible (app bootstrap)
 * while the landing URL still carries its UTM params. First-touch wins: once
 * stored, the original landing attribution is preserved for the session.
 */
export function persistAttribution() {
  const current = readUrlAttribution();
  if (!hasAnyUtm(current) || readStoredAttribution()) return;
  try {
    window.sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(current));
  } catch {
    // Storage unavailable (private mode, quota) — attribution simply won't persist.
  }
}

/**
 * Extract UTM parameters for a registration submission.
 * Prefers params on the current URL; otherwise falls back to the persisted
 * first-touch attribution captured on landing.
 * @returns {object} UTM data
 */
export function extractUTMFromURL() {
  const current = readUrlAttribution();
  if (hasAnyUtm(current)) return current;

  const stored = readStoredAttribution();
  if (stored) {
    return {
      ...stored,
      // Referrer for the submit page is more meaningful when present.
      referrer: stored.referrer || current.referrer,
      landing_page_url: stored.landing_page_url || current.landing_page_url,
    };
  }
  return current;
}
