/**
 * Application-owned analytics events for Training Offers and registration conversion.
 *
 * Follows the existing SpaAnalytics conventions:
 * - Events are pushed to `window.dataLayer` for GTM/GA4.
 * - dataLayer events are gated on *analytics* consent.
 * - Meta Pixel events are gated on *marketing* consent AND the pixel being
 *   loaded (MetaPixel component only loads fbevents.js when marketing consent
 *   is granted and a valid pixel ID is configured).
 * - No new tracking system is introduced; this module only pushes to the
 *   existing dataLayer/fbq surfaces.
 *
 * Registration conversion hard rule:
 * - `trackRegistrationSuccess` fires ONLY after a confirmed successful NEW
 *   registration response (is_new === true). It must never fire on CTA click,
 *   form open, submit button click, client-side validation failure, backend
 *   validation failure, network failure, or duplicate registrations.
 */

function ensureDataLayer() {
  if (typeof window === 'undefined') return null;
  window.dataLayer = window.dataLayer || [];
  return window.dataLayer;
}

/**
 * Track an offer card impression (offer_view).
 * Gated by analytics consent — the caller passes the consent state.
 */
export function trackOfferView({ campaignSlug, offerItemId, programSlug, productType, placement }) {
  const dataLayer = ensureDataLayer();
  if (!dataLayer) return;
  dataLayer.push({
    event: 'sidrah_offer_view',
    campaign_slug: campaignSlug || '',
    offer_item_id: offerItemId ?? null,
    program_slug: programSlug || '',
    product_type: productType || '',
    placement: placement || '',
  });
}

/**
 * Track an offer card click (offer_click).
 * Gated by analytics consent — the caller passes the consent state.
 */
export function trackOfferClick({ campaignSlug, offerItemId, programSlug, productType, placement }) {
  const dataLayer = ensureDataLayer();
  if (!dataLayer) return;
  dataLayer.push({
    event: 'sidrah_offer_click',
    campaign_slug: campaignSlug || '',
    offer_item_id: offerItemId ?? null,
    program_slug: programSlug || '',
    product_type: productType || '',
    placement: placement || '',
  });
}

/**
 * Track a confirmed successful NEW training registration (conversion).
 *
 * Fires BOTH:
 * 1. `sidrah_registration_success` to dataLayer (GA4 via GTM) — gated on
 *    analytics consent.
 * 2. Meta Pixel standard event `CompleteRegistration` — gated on marketing
 *    consent and the pixel being initialized. CompleteRegistration is the
 *    semantically correct Meta standard event for a completed registration
 *    form (vs. Lead, which targets sales lead generation).
 *
 * The caller MUST only invoke this after receiving a successful API response
 * with is_new === true. All failure paths (validation, network, duplicates)
 * must never call this function.
 */
export function trackRegistrationSuccess({ programSlug, productType, sourcePage, campaignSlug, offerItemId, analyticsGranted, marketingGranted }) {
  const dataLayer = ensureDataLayer();

  if (analyticsGranted && dataLayer) {
    dataLayer.push({
      event: 'sidrah_registration_success',
      program_slug: programSlug || '',
      product_type: productType || '',
      source_page: sourcePage || '',
      campaign_slug: campaignSlug || '',
      offer_item_id: offerItemId ?? null,
    });
  }

  if (marketingGranted && typeof window !== 'undefined' && typeof window.fbq === 'function') {
    try {
      window.fbq('track', 'CompleteRegistration', {
        content_name: programSlug || '',
        content_type: productType || '',
      });
    } catch {
      // Meta Pixel blocked or unavailable — must never break registration UX.
    }
  }
}
