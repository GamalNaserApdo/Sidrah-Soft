import { useEffect, useState } from 'react';
import { getPartners } from '../services/partnersApi';
import resolveMediaUrl from '../utils/resolveMediaUrl';

function normalizePartner(partner) {
  return {
    id: partner.id,
    slug: partner.slug,
    name: partner.name,
    description: partner.description,
    logoUrl: resolveMediaUrl(partner.logo),
    websiteUrl: partner.website_url || '',
    openInNewTab: partner.open_in_new_tab ?? true,
    altText: partner.logo?.alt_text || partner.name,
    displayOrder: partner.display_order,
  };
}

function isValid(data) {
  return Array.isArray(data) && data.length > 0;
}

/**
 * Fetch active partners from the CMS.
 *
 * Returns `null` until valid data is received. Consumers should render their
 * own hardcoded fallback when the returned value is null.
 */
export function usePartners() {
  const [partners, setPartners] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    getPartners({ signal: controller.signal })
      .then((data) => {
        if (isValid(data)) {
          setPartners(data.map(normalizePartner));
        }
      })
      .catch((err) => {
        if (err?.status !== 0) {
          setError(err);
          console.error('Partners fetch failed:', err.message);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  return { partners, loading, error };
}
