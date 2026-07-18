import { useEffect, useRef, useState } from 'react';
import { getHomepageConfig } from '../services/homepageApi';

let cachedConfig = null;
let fetchPromise = null;
let cachedError = null;

/**
 * Fetch homepage configuration once and share across all mounted components.
 * Returns { config, error } where config is null until loaded.
 * Callers should provide their own fallback values.
 */
export function useHomepageConfig() {
  const [config, setConfig] = useState(cachedConfig);
  const [error, setError] = useState(cachedError);
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (cachedConfig || cachedError) return;

    if (!fetchPromise) {
      fetchPromise = getHomepageConfig().catch((err) => {
        cachedError = err;
        console.error('Homepage config fetch failed:', err.message);
        throw err;
      });
    }

    fetchPromise
      .then((data) => {
        cachedConfig = data;
        if (isMounted.current) {
          setConfig(data);
        }
      })
      .catch((err) => {
        if (isMounted.current) {
          setError(err);
        }
      });
  }, []);

  return { config, error };
}

/**
 * Clear the cached homepage config — useful after CMS updates.
 */
export function invalidateHomepageCache() {
  cachedConfig = null;
  cachedError = null;
  fetchPromise = null;
}
