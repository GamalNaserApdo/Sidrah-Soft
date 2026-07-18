import { useEffect, useState } from 'react';
import { getHomepageServices } from '../services/servicesApi';
import resolveMediaUrl from '../utils/resolveMediaUrl';

function normalizeService(service) {
  return {
    id: service.id,
    slug: service.slug,
    name: service.name,
    shortDescription: service.short_description,
    description: service.description,
    iconUrl: resolveMediaUrl(service.icon),
    featuredImageUrl: resolveMediaUrl(service.featured_image),
    cta: service.cta,
    displayOrder: service.display_order,
    isFeatured: service.is_featured,
    showOnHomepage: service.show_on_homepage,
  };
}

function isValid(data) {
  return Array.isArray(data) && data.length > 0;
}

/**
 * Fetch homepage services from the CMS.
 *
 * Returns `null` until valid data is received. Consumers should render their
 * own hardcoded fallback when the returned value is null.
 */
export function useServices() {
  const [services, setServices] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    getHomepageServices({ signal: controller.signal })
      .then((data) => {
        if (isValid(data)) {
          setServices(data.map(normalizeService));
        }
      })
      .catch((err) => {
        if (err?.status !== 0) {
          setError(err);
          console.error('Services fetch failed:', err.message);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  return { services, loading, error };
}
