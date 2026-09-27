import { useEffect } from 'react';

/**
 * Sets meta robots to "noindex, nofollow" for private/auth surfaces
 * (CMS, Leads, admin) and restores the previous value on unmount.
 *
 * This ensures that when a user navigates:
 *   public → private → public
 * the robots meta tag correctly transitions:
 *   index → noindex → index
 *
 * The cleanup restores the tag to "index, follow" which is the safe
 * default for public pages. The public SEO component will overwrite
 * this with the correct per-page value via its own useEffect.
 */
const PRIVATE_ROBOTS = 'noindex, nofollow';
const DEFAULT_PUBLIC_ROBOTS = 'index, follow';

function PrivateRouteMeta() {
  useEffect(() => {
    let el = document.querySelector('meta[name="robots"]');
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('name', 'robots');
      document.head.appendChild(el);
    }
    el.setAttribute('content', PRIVATE_ROBOTS);

    return () => {
      // Restore to safe public default on unmount.
      // The public SEO component (if present on the next route) will
      // overwrite this with the correct per-page value.
      const current = document.querySelector('meta[name="robots"]');
      if (current) {
        current.setAttribute('content', DEFAULT_PUBLIC_ROBOTS);
      }
    };
  }, []);

  return null;
}

export default PrivateRouteMeta;
