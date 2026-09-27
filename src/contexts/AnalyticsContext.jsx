/**
 * Analytics Consent Context — centralized cookie/tracking consent state.
 *
 * Categories:
 * - necessary: always true (required for site function)
 * - analytics: granted / denied / unknown
 * - marketing: granted / denied / unknown
 *
 * State is persisted in localStorage with a version number so privacy-policy
 * updates can require a renewed decision. Corrupt/invalid stored values fall
 * back safely to an unknown state and the banner is shown.
 *
 * Google Consent Mode v2:
 * The context also exposes the mapping from Sidrah consent categories to
 * Google's consent signals:
 *   analytics_storage, ad_storage, ad_user_data, ad_personalization.
 * It initializes `window.dataLayer` and a `gtag()` helper so GTM can receive
 * default/update consent events. This is NOT a standalone `gtag.js` loader;
 * it only pushes events to the dataLayer that GTM owns.
 */
import { createContext, useContext, useEffect, useState, useCallback, useRef, useLayoutEffect } from 'react';

const STORAGE_KEY = 'sidrah-consent';
const CONSENT_VERSION = '1';

export const CONSENT_CATEGORIES = {
  NECESSARY: 'necessary',
  ANALYTICS: 'analytics',
  MARKETING: 'marketing',
};

export const GOOGLE_CONSENT_SIGNALS = {
  ANALYTICS_STORAGE: 'analytics_storage',
  AD_STORAGE: 'ad_storage',
  AD_USER_DATA: 'ad_user_data',
  AD_PERSONALIZATION: 'ad_personalization',
};

const VALID_DECISIONS = new Set(['granted', 'denied', 'unknown']);

function isValidDecision(value) {
  return typeof value === 'string' && VALID_DECISIONS.has(value);
}

function getDefaultConsent() {
  return {
    necessary: 'granted', // always required
    analytics: 'unknown',
    marketing: 'unknown',
  };
}

function loadStoredConsent() {
  if (typeof window === 'undefined') return { consent: getDefaultConsent(), version: CONSENT_VERSION };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { consent: getDefaultConsent(), version: CONSENT_VERSION };
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== CONSENT_VERSION) {
      return { consent: getDefaultConsent(), version: CONSENT_VERSION };
    }
    const consent = {
      necessary: 'granted',
      analytics: isValidDecision(parsed.consent?.analytics) ? parsed.consent.analytics : 'unknown',
      marketing: isValidDecision(parsed.consent?.marketing) ? parsed.consent.marketing : 'unknown',
    };
    return { consent, version: CONSENT_VERSION };
  } catch {
    return { consent: getDefaultConsent(), version: CONSENT_VERSION };
  }
}

function saveConsent(consent) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: CONSENT_VERSION, consent }));
  } catch {
    // Fail silently in private browsing or storage restriction.
  }
}

/**
 * Map Sidrah consent categories to Google Consent Mode v2 signals.
 */
export function getGoogleConsentState(consent) {
  const granted = consent.analytics === 'granted';
  const marketingGranted = consent.marketing === 'granted';
  return {
    [GOOGLE_CONSENT_SIGNALS.ANALYTICS_STORAGE]: granted ? 'granted' : 'denied',
    [GOOGLE_CONSENT_SIGNALS.AD_STORAGE]: marketingGranted ? 'granted' : 'denied',
    [GOOGLE_CONSENT_SIGNALS.AD_USER_DATA]: marketingGranted ? 'granted' : 'denied',
    [GOOGLE_CONSENT_SIGNALS.AD_PERSONALIZATION]: marketingGranted ? 'granted' : 'denied',
  };
}

function ensureDataLayerAndGtag() {
  if (typeof window === 'undefined') return { dataLayer: [], gtag: () => {} };
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
  }
  return { dataLayer: window.dataLayer, gtag: window.gtag };
}

function pushDefaultConsent(consent) {
  const { gtag } = ensureDataLayerAndGtag();
  gtag('consent', 'default', {
    ...getGoogleConsentState(consent),
    wait_for_update: 500,
  });
}

function pushUpdateConsent(consent) {
  const { gtag } = ensureDataLayerAndGtag();
  gtag('consent', 'update', getGoogleConsentState(consent));
}

const AnalyticsContext = createContext(null);

export function AnalyticsProvider({ children }) {
  const [{ consent, version }, setState] = useState(loadStoredConsent);
  const [showBanner, setShowBanner] = useState(false);
  const initialConsentRef = useRef(null);

  useEffect(() => {
    saveConsent(consent);
  }, [consent]);

  // Establish Google Consent Mode default state before GTM loads.
  // useLayoutEffect runs before child useEffect hooks, so this default is
  // guaranteed to be in dataLayer before the GTM script is injected.
  useLayoutEffect(() => {
    pushDefaultConsent(consent);
    if (initialConsentRef.current === null) {
      initialConsentRef.current = consent;
    }
  }, []);

  // Push consent updates when the user changes their decision.
  useEffect(() => {
    if (initialConsentRef.current === consent) return;
    pushUpdateConsent(consent);
  }, [consent]);

  // Listen for cross-tab/localStorage consent changes so an external privacy
  // settings link can update consent without a full page reload.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleStorage = (e) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return;
      try {
        const parsed = JSON.parse(e.newValue);
        if (parsed.version !== CONSENT_VERSION || !parsed.consent) return;
        const next = {
          necessary: 'granted',
          analytics: isValidDecision(parsed.consent.analytics) ? parsed.consent.analytics : 'unknown',
          marketing: isValidDecision(parsed.consent.marketing) ? parsed.consent.marketing : 'unknown',
        };
        setState({ consent: next, version: CONSENT_VERSION });
      } catch {
        // Invalid storage value: ignore silently.
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const setCategory = useCallback((category, decision) => {
    if (category === CONSENT_CATEGORIES.NECESSARY) return;
    setState((prev) => ({
      ...prev,
      consent: { ...prev.consent, [category]: decision },
    }));
  }, []);

  const acceptAll = useCallback(() => {
    setState((prev) => ({
      ...prev,
      consent: { ...prev.consent, analytics: 'granted', marketing: 'granted' },
    }));
  }, []);

  const rejectOptional = useCallback(() => {
    setState((prev) => ({
      ...prev,
      consent: { ...prev.consent, analytics: 'denied', marketing: 'denied' },
    }));
  }, []);

  const hideBanner = useCallback(() => {
    setShowBanner(false);
  }, []);

  const value = {
    consent,
    version,
    showBanner,
    setCategory,
    acceptAll,
    rejectOptional,
    hideBanner,
    isGranted: (category) => consent[category] === 'granted',
    isDecided: (category) => consent[category] !== 'unknown',
    getGoogleConsentState: () => getGoogleConsentState(consent),
  };

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
}

export function useAnalyticsConsent() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalyticsConsent must be used within AnalyticsProvider');
  }
  return context;
}
