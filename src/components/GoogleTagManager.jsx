/**
 * GoogleTagManager — safe, idempotent GTM bootstrap loader.
 *
 * Strict consent architecture:
 * - GTM loads ONLY when ALL of the following are true:
 *   (1) CMS GTM integration is enabled
 *   (2) GTM container ID is valid (GTM- + ASCII alphanumeric suffix)
 *   (3) CMS GA4 integration is enabled
 *   (4) GA4 Measurement ID is valid AND matches the expected property
 *   (5) Analytics consent is granted
 * - This is intentionally stricter than Google Advanced Consent Mode:
 *   no GTM network request occurs before analytics consent, so no
 *   cookieless analytics pings are emitted.
 * - Loads the GTM container script at most once per browser document.
 * - Initializes `window.dataLayer` only if not already present.
 * - Consent Mode default is pushed by AnalyticsProvider (useLayoutEffect)
 *   before this component's useEffect runs.
 * - Does not reload on React remount, StrictMode, HMR, or SPA navigation.
 * - Fails silently if the network is blocked or GTM is unavailable.
 *
 * No direct `gtag.js` or standalone GA4 script is injected. GA4 is delivered
 * through GTM configuration external to this application.
 *
 * Consent revocation (granted → denied):
 * - A consent update event is pushed to dataLayer by AnalyticsProvider.
 * - The already-loaded GTM container remains in the DOM; Google tags inside
 *   GTM are expected to honor the updated consent signals. This application
 *   does not attempt unsafe DOM/script removal.
 * - Future SPA page-view events are stopped by SpaAnalytics.
 */
import { useEffect } from 'react';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { useAnalyticsConsent } from '../contexts/AnalyticsContext';

const GTM_SCRIPT_SRC_TEMPLATE = 'https://www.googletagmanager.com/gtm.js?id=';
const GLOBAL_KEY = '__sidrahGTM';

// Expected GA4 Measurement ID. The CMS-stored value must match this before
// GTM is allowed to load, preventing tracking to an unknown property if the
// CMS value is accidentally or maliciously changed.
const EXPECTED_GA4_MEASUREMENT_ID = 'G-9XBV5CNWSW';

function getGlobalState() {
  if (typeof window === 'undefined') {
    return { scriptLoaded: false };
  }
  if (!window[GLOBAL_KEY]) {
    window[GLOBAL_KEY] = { scriptLoaded: false };
  }
  return window[GLOBAL_KEY];
}

function ensureDataLayer() {
  if (typeof window === 'undefined') return [];
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
  }
  return window.dataLayer;
}

function isValidContainerId(value) {
  if (typeof value !== 'string') return false;
  if (value !== value.trim()) return false;
  const cleaned = value.trim().toUpperCase();
  return /^GTM-[A-Z0-9]+$/.test(cleaned);
}

function isValidGa4Id(value) {
  if (typeof value !== 'string') return false;
  return /^G-[A-Z0-9]{10}$/.test(value.trim().toUpperCase());
}

function loadGTM(containerId) {
  const g = getGlobalState();
  if (g.scriptLoaded) return;

  const existingScript = document.querySelector(`script[src*="${GTM_SCRIPT_SRC_TEMPLATE}${containerId}"]`);
  if (existingScript) {
    g.scriptLoaded = true;
    return;
  }

  g.scriptLoaded = true;

  const dataLayer = ensureDataLayer();
  dataLayer.push({
    'gtm.start': new Date().getTime(),
    event: 'gtm.js',
  });

  const script = document.createElement('script');
  script.async = true;
  script.src = `${GTM_SCRIPT_SRC_TEMPLATE}${containerId}`;
  script.onerror = () => {
    // Silent failure — ad blocker, network, or CSP issue. Website must not break.
  };
  document.head.appendChild(script);
}

export default function GoogleTagManager() {
  const { settings } = useSiteSettings();
  const { isGranted } = useAnalyticsConsent();

  const gtm = settings?.analytics?.google_tag_manager;
  const ga4 = settings?.analytics?.google_analytics;

  const gtmEnabled = gtm?.enabled === true;
  const rawContainerId = typeof gtm?.container_id === 'string' ? gtm.container_id : '';
  const containerId = isValidContainerId(rawContainerId) ? rawContainerId.toUpperCase() : '';

  const ga4Enabled = ga4?.enabled === true;
  const rawGa4Id = typeof ga4?.measurement_id === 'string' ? ga4.measurement_id : '';
  const ga4IdValid = isValidGa4Id(rawGa4Id);
  const ga4IdMatches = ga4IdValid && rawGa4Id.trim().toUpperCase() === EXPECTED_GA4_MEASUREMENT_ID;

  const analyticsConsentGranted = isGranted('analytics');

  // Fail-closed: in development, warn about configuration mismatches.
  useEffect(() => {
    if (gtmEnabled && containerId && ga4Enabled && ga4IdValid && !ga4IdMatches) {
      console.warn(
        `[Sidrah Analytics] GA4 Measurement ID mismatch. CMS value "${rawGa4Id.trim().toUpperCase()}" ` +
        `does not match expected "${EXPECTED_GA4_MEASUREMENT_ID}". GTM will not load.`
      );
    }
  }, [gtmEnabled, containerId, ga4Enabled, ga4IdValid, ga4IdMatches, rawGa4Id]);

  useEffect(() => {
    if (!gtmEnabled || !containerId) return;
    if (!ga4Enabled || !ga4IdValid || !ga4IdMatches) return;
    if (!analyticsConsentGranted) return;
    loadGTM(containerId);
  }, [gtmEnabled, containerId, ga4Enabled, ga4IdValid, ga4IdMatches, analyticsConsentGranted]);

  return null;
}
