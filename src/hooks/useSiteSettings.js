import { useEffect, useRef, useState } from 'react';
import { getSiteSettings } from '../services/siteSettingsApi';

let cachedSettings = null;
let fetchPromise = null;
let cachedError = null;

/**
 * Fetch site settings once and share the result across all mounted components.
 *
 * Returns the CMS settings object, or null if the request has not completed
 * or failed. Callers should provide their own safe fallback values.
 */
export function useSiteSettings() {
  const [settings, setSettings] = useState(cachedSettings);
  const [error, setError] = useState(cachedError);
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (cachedSettings || cachedError) return;

    if (!fetchPromise) {
      fetchPromise = getSiteSettings().catch((err) => {
        cachedError = err;
        console.error('Site settings fetch failed:', err.message);
        throw err;
      });
    }

    fetchPromise
      .then((data) => {
        cachedSettings = data;
        if (isMounted.current) {
          setSettings(data);
        }
      })
      .catch((err) => {
        if (isMounted.current) {
          setError(err);
        }
      });
  }, []);

  return { settings, error };
}
