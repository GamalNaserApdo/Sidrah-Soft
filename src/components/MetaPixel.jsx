/**
 * MetaPixel — CMS-managed, consent-aware Meta (Facebook) Pixel integration.
 *
 * Rules:
 * - Loads fbevents.js at most once per browser document.
 * - Initializes a given Pixel ID at most once, even across React StrictMode/HMR.
 * - Only loads when:
 *   (1) CMS integration is enabled
 *   (2) Pixel ID is valid
 *   (3) marketing consent is granted
 * - Sends initial PageView once per path.
 * - Sends additional PageView on SPA route navigation without reinitializing.
 * - Fails silently if Meta is blocked or the API is unavailable.
 */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { useAnalyticsConsent } from '../contexts/AnalyticsContext';

const FB_EVENTS_SRC = 'https://connect.facebook.net/en_US/fbevents.js';
const GLOBAL_KEY = '__sidrahMetaPixel';

function getGlobalState() {
  if (typeof window === 'undefined') {
    return { scriptLoaded: false, initializedPixelId: null, lastTrackedPath: null };
  }
  if (!window[GLOBAL_KEY]) {
    window[GLOBAL_KEY] = { scriptLoaded: false, initializedPixelId: null, lastTrackedPath: null };
  }
  return window[GLOBAL_KEY];
}

function loadFbeventsScript() {
  const g = getGlobalState();
  if (g.scriptLoaded) return;
  g.scriptLoaded = true;

  // If the real Meta library is already loaded (e.g. from a previous HMR or
  // another legitimate source), do not redefine it and do not inject a second
  // script. This prevents the "Multiple pixels with conflicting versions" warning.
  if (window.fbq && typeof window.fbq === 'function' && window.fbq.version) {
    return;
  }

  // Only create the stub queue if fbq does not exist at all.
  // This matches the official Meta Pixel loader stub and is needed so
  // `fbq('init', ...)` commands emitted before the real library loads
  // are queued and then processed by fbevents.js.
  if (!window.fbq) {
    const fbq = function fbq() {
      if (fbq.callMethod) {
        fbq.callMethod.apply(fbq, arguments);
      } else {
        fbq.queue.push(arguments);
      }
    };
    fbq.queue = [];
    fbq.loaded = true;
    fbq.version = '2.0';
    fbq.push = fbq;
    window.fbq = fbq;
  }

  const script = document.createElement('script');
  script.async = true;
  script.src = FB_EVENTS_SRC;
  script.onerror = () => {
    // Silent failure — ad blocker or network issue. Website must not break.
  };
  document.head.appendChild(script);
}

function initPixel(pixelId) {
  if (!window.fbq) return;
  const g = getGlobalState();
  if (g.initializedPixelId === pixelId) return;
  window.fbq('init', pixelId);
  g.initializedPixelId = pixelId;
}

function trackPageView() {
  if (!window.fbq) return;
  window.fbq('track', 'PageView');
}

function isValidPixelId(value) {
  return /^\d{8,20}$/.test(typeof value === 'string' ? value.trim() : '');
}

export default function MetaPixel() {
  const { settings } = useSiteSettings();
  const { isGranted } = useAnalyticsConsent();
  const location = useLocation();

  const metaPixel = settings?.analytics?.meta_pixel;
  const enabled = metaPixel?.enabled === true;
  const rawPixelId = typeof metaPixel?.pixel_id === 'string' ? metaPixel.pixel_id.trim() : '';
  const pixelId = isValidPixelId(rawPixelId) ? rawPixelId : '';
  const marketingGranted = isGranted('marketing');

  const g = getGlobalState();

  // Initial load.
  useEffect(() => {
    if (!enabled || !pixelId || !marketingGranted) return;

    loadFbeventsScript();
    initPixel(pixelId);

    const currentPath = window.location.pathname + window.location.search;
    if (g.lastTrackedPath !== currentPath) {
      g.lastTrackedPath = currentPath;
      trackPageView();
    }
  }, [enabled, pixelId, marketingGranted]);

  // SPA route-change PageView tracking.
  useEffect(() => {
    if (!enabled || !pixelId || !marketingGranted) return;
    const currentPath = location.pathname + location.search;
    if (g.lastTrackedPath === currentPath) return;
    g.lastTrackedPath = currentPath;
    trackPageView();
  }, [enabled, pixelId, marketingGranted, location.pathname, location.search]);

  return null;
}
