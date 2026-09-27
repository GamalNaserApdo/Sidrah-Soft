/**
 * Campaign pricing configuration.
 *
 * During the pre-campaign / campaign offer period, fixed numeric course prices
 * must NOT be publicly displayed on the website. Instead, a consistent
 * "pricing coming soon" message is shown across all courses.
 *
 * Source of truth: ``SiteSetting.campaign_pricing_mode`` (CMS-managed).
 * The backend reads the same flag in public API serializers so backend
 * serialization and frontend presentation stay aligned.
 *
 * The ``CAMPAIGN_PRICING_MODE`` constant below is a safe fallback used only
 * when the CMS setting has not loaded yet. The authoritative value comes from
 * ``useSiteSettings().settings.general.campaign_pricing_mode``.
 *
 * To re-enable public numeric pricing after the campaign:
 *   set SiteSetting.campaign_pricing_mode = False in CMS
 */
export const CAMPAIGN_PRICING_MODE = true;

/**
 * Consistent public pricing copy shown in place of numeric prices.
 * Used across CoursePricing, CourseFinalCTA, and StickyRegisterBar.
 */
export const PRICING_COMING_SOON = {
  ar: 'السعر والعروض سيتم الإعلان عنهما قريبًا',
  en: 'Pricing & offers coming soon',
};

/**
 * Product-aware pricing gate.
 *
 * The "pricing coming soon" suppression applies ONLY to Professional Courses
 * during the campaign. Sidrah Starter Courses (branch === 'starter') carry a
 * real, public price that must always be shown, and Summer Training
 * programs show whatever pricing their landing configures.
 *
 * Pass the course/program `branch` so the suppression is branch-aware instead
 * of global. Optionally pass the CMS ``campaignPricingMode`` value so the gate
 * reads from the single source of truth; falls back to the constant when the
 * CMS setting is not yet loaded.
 */
export function showComingSoonPricing(branch, campaignPricingMode) {
  const mode = campaignPricingMode !== undefined ? campaignPricingMode : CAMPAIGN_PRICING_MODE;
  return mode && branch === 'professional';
}
