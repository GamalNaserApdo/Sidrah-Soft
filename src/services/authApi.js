/**
 * CMS Authentication API service.
 *
 * Uses credentials: 'include' for session cookies.
 * Reads CSRF token from cookie for unsafe requests.
 * No tokens stored in localStorage.
 */

import { API_BASE_URL } from './apiClient';

function getCsrfToken() {
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? match[1] : null;
}

async function authFetch(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const headers = { ...options.headers };

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes((options.method || '').toUpperCase())) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
    }
  }

  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.detail || `Request failed: ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

/**
 * Ensure CSRF cookie is set (call before login).
 */
export async function fetchCsrf() {
  return authFetch('/api/v1/auth/csrf/');
}

/**
 * Login with username and password.
 * Returns user data on success.
 */
export async function login(username, password) {
  await fetchCsrf();
  return authFetch('/api/v1/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

/**
 * Logout — invalidates session.
 */
export async function logout() {
  return authFetch('/api/v1/auth/logout/', {
    method: 'POST',
  });
}

/**
 * Get the current authenticated user.
 * Returns null if not authenticated (401).
 */
export async function getCurrentUser() {
  try {
    return await authFetch('/api/v1/auth/me/');
  } catch (error) {
    if (error.status === 401 || error.status === 403) {
      return null;
    }
    throw error;
  }
}

/**
 * Check admin dashboard access.
 */
export async function checkDashboardAccess() {
  return authFetch('/api/v1/admin/dashboard/access/');
}
