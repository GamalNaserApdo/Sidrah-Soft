/**
 * AnalyticsManager — single application-level owner for third-party analytics.
 *
 * This component centralizes the decision to mount or skip analytics integrations
 * so that separate components cannot independently inject conflicting scripts.
 *
 * Current integrations:
 * - GoogleTagManager (loads the GTM bootstrap; Consent Mode default is set by
 *   AnalyticsProvider before GTM loads)
 * - SpaAnalytics (pushes application-owned SPA navigation events to dataLayer)
 * - MetaPixel (requires marketing consent, valid CMS config, and integration enabled)
 *
 * Future GA4 configuration lives inside the external GTM container; this
 * application does NOT load a standalone `gtag.js` or GA4 script.
 */
import GoogleTagManager from './GoogleTagManager';
import SpaAnalytics from './SpaAnalytics';
import MetaPixel from './MetaPixel';

export default function AnalyticsManager() {
  return (
    <>
      <GoogleTagManager />
      <SpaAnalytics />
      <MetaPixel />
    </>
  );
}
