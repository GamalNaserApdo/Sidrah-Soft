/**
 * useAIAutomation — hook to resolve CMS AI Automation content → i18n fallback.
 *
 * Usage:
 *   const { data, loading } = useAIAutomation();
 *
 * Returns the CMS AI Automation page content, or null if not available.
 * The page component is responsible for falling back to i18n translations
 * when CMS values are empty.
 */

import { useState, useEffect } from 'react';
import { getAIAutomationContent } from '../services/aiAutomationApi';

export function useAIAutomation() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getAIAutomationContent().then((result) => {
      if (!mounted) return;
      setData(result);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  return { data, loading };
}
