import { useI18n } from '../../i18n/I18nProvider.jsx';
import { formatStickyPrice } from '../../utils/formatPrice.js';
import { scrollToRegistrationForm } from '../../utils/scrollToForm';
import { showComingSoonPricing, PRICING_COMING_SOON } from '../../config/campaignPricing.js';
import { useSiteSettings } from '../../hooks/useSiteSettings';

/**
 * Sticky Mobile Registration Bar
 *
 * Fixed at the bottom of the screen on mobile only.
 * Contains:
 * - Short course name
 * - Price (if available) — formatted per locale
 * - Register Now button (scrolls to form)
 *
 * Respects Mobile Safe Area (env(safe-area-inset-bottom)).
 * Does not cover Footer (CSS handles padding on body/main).
 *
 * Campaign mode: When CAMPAIGN_PRICING_MODE is true, numeric price is replaced
 * with "pricing coming soon" copy. DB/CMS price values are preserved.
 */
function StickyRegisterBar({ course, landing }) {
  const { lang, dir } = useI18n();
  const isAr = lang === 'ar';
  const { settings } = useSiteSettings();
  const campaignPricingMode = settings?.general?.campaign_pricing_mode;

  const title = isAr ? course.titleAr : course.titleEn;
  const registerLabel = isAr ? 'سجل الآن' : 'Register Now';

  const pricing = landing?.pricing;
  const hasPrice = pricing?.currentPrice != null && pricing.currentPrice > 0;
  const comingSoon = showComingSoonPricing(course?.branch, campaignPricingMode);

  return (
    <div className="course-landing-sticky-bar" dir={dir} role="region" aria-label={isAr ? 'شريط التسجيل' : 'Registration bar'}>
      <span className="course-landing-sticky-bar__title">{title}</span>
      {comingSoon ? (
        <span className="course-landing-sticky-bar__price course-landing-sticky-bar__price--coming-soon">
          {isAr ? PRICING_COMING_SOON.ar : PRICING_COMING_SOON.en}
        </span>
      ) : hasPrice && (
        <span className="course-landing-sticky-bar__price">
          {formatStickyPrice(pricing.currentPrice, lang)}
        </span>
      )}
      <button
        type="button"
        onClick={scrollToRegistrationForm}
        className="course-landing-sticky-bar__cta"
      >
        {registerLabel}
      </button>
    </div>
  );
}

export default StickyRegisterBar;
