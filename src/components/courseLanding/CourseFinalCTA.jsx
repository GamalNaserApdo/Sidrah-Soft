import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nProvider.jsx';
import { formatPrice } from '../../utils/formatPrice.js';
import { scrollToRegistrationForm } from '../../utils/scrollToForm';
import { showComingSoonPricing, PRICING_COMING_SOON } from '../../config/campaignPricing.js';
import { useSiteSettings } from '../../hooks/useSiteSettings';

/**
 * Final CTA Section
 * - Course name
 * - Short message
 * - Price (if available) — formatted per locale
 * - Register Now button
 * - Back to courses link
 *
 * Price formatting:
 *   - Arabic:  6,000 جنيه مصري
 *   - English: EGP 6,000
 *
 * Campaign mode: When CAMPAIGN_PRICING_MODE is true, numeric price is replaced
 * with "pricing coming soon" copy. DB/CMS price values are preserved.
 */
function CourseFinalCTA({ course, landing, registrationUrl }) {
  const { lang, dir } = useI18n();
  const isAr = lang === 'ar';
  const { settings } = useSiteSettings();
  const campaignPricingMode = settings?.general?.campaign_pricing_mode;

  const title = isAr ? course.titleAr : course.titleEn;
  const registerLabel = isAr ? 'سجل الآن' : 'Register Now';
  const backLabel = isAr ? '→ العودة إلى الدورات' : '← Back to Courses';

  const message = isAr
    ? `ابدأ رحلتك في ${title} اليوم. سجل الآن واحصل على تدريب عملي يبني مهارات حقيقية.`
    : `Start your journey in ${title} today. Register now and get hands-on training that builds real skills.`;

  const pricing = landing?.pricing;
  const hasPrice = pricing?.currentPrice != null && pricing.currentPrice > 0;
  const comingSoon = showComingSoonPricing(course?.branch, campaignPricingMode);

  return (
    <section className="course-landing-cta" dir={dir}>
      <div className="course-landing-cta__content">
        <h2 className="course-landing-cta__title">{title}</h2>
        <p className="course-landing-cta__message">{message}</p>
        {comingSoon ? (
          <p className="course-landing-cta__price course-landing-cta__price--coming-soon">
            {isAr ? PRICING_COMING_SOON.ar : PRICING_COMING_SOON.en}
          </p>
        ) : hasPrice && (
          <p className="course-landing-cta__price">
            {formatPrice(pricing.currentPrice, lang)}
            {course?.branch === 'starter' && (
              <span className="course-landing-cta__price-note"> {isAr ? 'للكورس كاملًا' : 'for the full course'}</span>
            )}
          </p>
        )}
        <button
          type="button"
          onClick={scrollToRegistrationForm}
          className="course-landing-cta__button"
        >
          {registerLabel}
        </button>
        <Link to="/training" className="course-landing-cta__back">
          {backLabel}
        </Link>
      </div>
    </section>
  );
}

export default CourseFinalCTA;
