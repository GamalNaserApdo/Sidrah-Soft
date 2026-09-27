import { useI18n } from '../../i18n/I18nProvider.jsx';
import { formatPrice } from '../../utils/formatPrice.js';
import { scrollToRegistrationForm } from '../../utils/scrollToForm';
import { showComingSoonPricing, PRICING_COMING_SOON } from '../../config/campaignPricing.js';
import { useSiteSettings } from '../../hooks/useSiteSettings';

/**
 * Pricing Section
 *
 * Displays pricing only when confirmed data is available.
 * - Current price (formatted per locale)
 * - Original price + discount only when both are set and original > current
 * - What's included (only when items exist)
 * - Register button
 *
 * Price formatting:
 *   - Arabic:  6,000 جنيه مصري
 *   - English: EGP 6,000
 *
 * No fake prices, no fake discounts, no "Save" labels.
 *
 * Campaign mode: When CAMPAIGN_PRICING_MODE is true, numeric prices are
 * replaced with a consistent "pricing coming soon" message. DB/CMS price
 * values are preserved and not modified.
 */
function CoursePricing({ course, landing, registrationUrl }) {
  const { lang, dir } = useI18n();
  const isAr = lang === 'ar';
  const { settings } = useSiteSettings();
  const campaignPricingMode = settings?.general?.campaign_pricing_mode;

  const pricing = landing?.pricing;
  if (!pricing) return null;
  if (landing?.showPricing === false) return null;

  const registerLabel = isAr ? 'سجل الآن' : 'Register Now';
  const heading = isAr ? 'السعر' : 'Pricing';
  const includedLabel = isAr ? 'ما الذي يشمله السعر؟' : 'What\'s Included?';
  const fullCourseNote = isAr ? 'للكورس كاملًا' : 'for the full course';

  const isStarter = course?.branch === 'starter';
  const comingSoon = showComingSoonPricing(course?.branch, campaignPricingMode);
  const hasPrice = pricing.currentPrice != null && pricing.currentPrice > 0;
  const hasOriginal = pricing.originalPrice != null && pricing.originalPrice > 0;

  // Calculate discount percentage from prices (don't trust manual entry)
  let discountPercentage = null;
  if (hasPrice && hasOriginal && pricing.originalPrice > pricing.currentPrice) {
    discountPercentage = Math.round(
      ((pricing.originalPrice - pricing.currentPrice) / pricing.originalPrice) * 100
    );
  }

  const includedItems = pricing.includedItems
    ? (isAr ? pricing.includedItems.ar : pricing.includedItems.en)
    : [];

  return (
    <section className="course-landing-section course-landing-section--alt" dir={dir}>
      <div className="course-landing-section__content">
        <h2 className="course-landing-section__heading">{heading}</h2>
        <div className="course-landing-pricing">
          {comingSoon ? (
            <div className="course-landing-pricing__price-row">
              <span className="course-landing-pricing__coming-soon">
                {isAr ? PRICING_COMING_SOON.ar : PRICING_COMING_SOON.en}
              </span>
            </div>
          ) : hasPrice && (
            <div className="course-landing-pricing__price-row">
              {hasOriginal && pricing.originalPrice > pricing.currentPrice && (
                <span className="course-landing-pricing__original">
                  {formatPrice(pricing.originalPrice, lang)}
                </span>
              )}
              <span className="course-landing-pricing__current">
                {formatPrice(pricing.currentPrice, lang)}
              </span>
              {isStarter && (
                <span className="course-landing-pricing__full-course">{fullCourseNote}</span>
              )}
              {discountPercentage != null && discountPercentage > 0 && (
                <span className="course-landing-pricing__discount">
                  -{discountPercentage}%
                </span>
              )}
            </div>
          )}

          {includedItems && includedItems.length > 0 && (
            <div className="course-landing-pricing__included">
              <h3 className="course-landing-pricing__included-label">{includedLabel}</h3>
              <ul className="course-landing-pricing__included-list">
                {includedItems.map((item, idx) => (
                  <li key={idx} className="course-landing-pricing__included-item">
                    <span className="course-landing-pricing__included-icon" aria-hidden="true">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {landing?.installmentsAvailable && (
            <div className="course-landing-pricing__installments">
              <h3 className="course-landing-pricing__included-label">
                {isAr ? 'التقسيط متاح' : 'Installments Available'}
              </h3>
              <p className="course-landing-pricing__installments-text">
                {isAr
                  ? (landing.installmentsInfo?.ar || '')
                  : (landing.installmentsInfo?.en || '')}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={scrollToRegistrationForm}
            className="course-landing-pricing__cta"
          >
            {registerLabel}
          </button>
        </div>
      </div>
    </section>
  );
}

export default CoursePricing;
