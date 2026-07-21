const DEFAULT_API_BASE_URL = 'http://localhost:8002';
const DEFAULT_TIMEOUT = 10000;

const envApiBaseUrl = import.meta.env?.VITE_API_BASE_URL;

if (import.meta.env.PROD && !envApiBaseUrl) {
  throw new Error(
    '[SidrahSoft] VITE_API_BASE_URL is required in production builds. ' +
      'Set it in your Railway Variables before building the frontend.',
  );
}

export const API_BASE_URL = envApiBaseUrl || DEFAULT_API_BASE_URL;

export class ApiError extends Error {
  constructor(status, statusText, data = null) {
    super(`API request failed: ${status} ${statusText || 'Unknown'}`);
    this.status = status;
    this.statusText = statusText;
    this.data = data;
    this.name = 'ApiError';
  }
}

/**
 * Thin wrapper around native fetch for the CMS API.
 *
 * @param {string} path - Relative API path (e.g. '/api/v1/partners/') or absolute URL.
 * @param {object} [options={}] - Fetch options.
 * @param {number} [options.timeout=10000] - Request timeout in milliseconds.
 * @param {AbortSignal} [options.signal] - Optional caller abort signal (merged with timeout).
 * @returns {Promise<any>} Parsed JSON response.
 * @throws {ApiError} On non-2xx responses, timeouts, or network failures.
 */
export async function apiFetch(path, options = {}) {
  const baseUrl = API_BASE_URL.endsWith('/')
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;

  const url = path.startsWith('http')
    ? path
    : `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;

  const timeout = options.timeout ?? DEFAULT_TIMEOUT;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  if (options.signal) {
    if (options.signal.aborted) {
      controller.abort();
    } else {
      options.signal.addEventListener('abort', () => controller.abort(), { once: true });
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    if (!response.ok) {
      let data = null;
      try {
        data = await response.json();
      } catch {
        // Ignore parse errors; status is enough.
      }
      throw new ApiError(response.status, response.statusText, data);
    }

    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError' || error.message === 'The operation was aborted.') {
      throw new ApiError(0, 'Request aborted or timed out');
    }
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, error?.message || 'Network error');
  } finally {
    clearTimeout(timeoutId);
  }
}
