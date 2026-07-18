import { useEffect, useState } from 'react';
import { getInquiryTypes } from '../services/contactApi';

/**
 * Fetch active inquiry types from the CMS.
 *
 * Returns `null` until valid data is received. Consumers should render
 * their own hardcoded fallback when the returned value is null.
 */
export function useInquiryTypes() {
  const [inquiryTypes, setInquiryTypes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    getInquiryTypes({ signal: controller.signal })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setInquiryTypes(data);
        }
      })
      .catch((err) => {
        if (err?.status !== 0) {
          setError(err);
          console.error('Inquiry types fetch failed:', err.message);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  return { inquiryTypes, loading, error };
}
