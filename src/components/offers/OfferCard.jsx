/**
 * OfferCard — a single course offer card.
 *
 * Used by the homepage offers preview (max 4 cards) and the /training/offers
 * landing page. Reuses program data (image, title, branch) from the public
 * offers API; badge/copy/CTA are effective values resolved server-side
 * (item override falling back to campaign defaults).
 *
 * Analytics:
 * - Fires `sidrah_offer_view` when the card enters the viewport.
 * - Fires `sidrah_offer_click` when the card is clicked.
 * - Both events are consent-gated by the caller passing granted flags.
 *
 * Attribution: the CTA carries utm_campaign/utm_content so the existing
 * first-touch UTM persistence captures the offer attribution on landing
 * and submits it with any registration from this visit.
 */
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nProvider';
import { trackOfferView, trackOfferClick } from '../../utils/analyticsEvents';
import { useAnalyticsConsent } from '../../contexts/AnalyticsContext';

const BRANCH_LABELS = {
  professional: { en: 'Professional Course', ar: 'كورس احترافي' },
  starter: { en: 'Sidrah Starter Course', ar: 'كورس Sidrah للمبتدئين' },
  summer: { en: 'Summer Training', ar: 'التدريب الصيفي' },
  secondary: { en: 'Secondary Program', ar: 'برنامج ثانوي' },
};

export default function OfferCard({ item, campaignSlug, placement }) {
  const { lang } = useI18n();
  const isAr = lang === 'ar';
  const { isGranted } = useAnalyticsConsent();
  const analyticsGranted = isGranted('analytics');
  const cardRef = useRef(null);
  const viewFiredRef = useRef(false);

  const title = isAr ? (item.program_title_ar || item.program_title_en) : item.program_title_en;
  const badge = isAr ? (item.badge_ar || item.badge_en) : item.badge_en;
  const copy = isAr
    ? (item.promotional_copy_ar || item.promotional_copy_en)
    : (item.promotional_copy_en || item.promotional_copy_ar);
  const ctaLabel = isAr
    ? (item.cta_label_ar || item.cta_label_en || 'استكشف العرض')
    : (item.cta_label_en || item.cta_label_ar || 'Explore Offer');
  const branchLabel = BRANCH_LABELS[item.program_branch]
    ? (isAr ? BRANCH_LABELS[item.program_branch].ar : BRANCH_LABELS[item.program_branch].en)
    : '';
  const duration = isAr ? item.program_duration_ar : item.program_duration_en;

  const showPrice = Boolean(item.promo_price);
  const priceText = showPrice
    ? `${item.promo_price} ${item.promo_currency === 'EGP' ? (isAr ? 'جنيه' : 'EGP') : item.promo_currency}`
    : null;
  const hiddenPriceCopy = isAr ? 'عرض خاص' : 'Special Offer';

  // CTA carries offer attribution through the existing UTM persistence.
  const ctaUrl = item.cta_url && item.cta_url.startsWith('/')
    ? `${item.cta_url}${item.cta_url.includes('?') ? '&' : '?'}utm_source=training_offers&utm_medium=internal&utm_campaign=${encodeURIComponent(campaignSlug)}&utm_content=offer_${item.id}`
    : item.cta_url;

  const analyticsParams = {
    campaignSlug,
    offerItemId: item.id,
    programSlug: item.program_slug,
    productType: item.program_branch,
    placement,
  };

  // Fire offer_view once when the card becomes visible.
  // The observer marks the card as viewed; a separate effect pushes the
  // dataLayer event once consent is granted (handles the case where the
  // card is visible before the user grants consent).
  useEffect(() => {
    const node = cardRef.current;
    if (!node || viewFiredRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !viewFiredRef.current) {
            viewFiredRef.current = true;
            observer.disconnect();
          }
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id, campaignSlug]);

  // Push the offer_view event when the card has been viewed AND consent is granted.
  useEffect(() => {
    if (viewFiredRef.current && analyticsGranted) {
      trackOfferView(analyticsParams);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analyticsGranted, item.id, campaignSlug]);

  const handleClick = () => {
    if (isGranted('analytics')) {
      trackOfferClick(analyticsParams);
    }
  };

  return (
    <Link
      ref={cardRef}
      to={ctaUrl}
      onClick={handleClick}
      className="offer-card"
      aria-label={`${ctaLabel}: ${title}`}
    >
      <div className="offer-card__image-wrapper">
        {item.program_image_url && (
          <img
            src={item.program_image_url}
            alt={title}
            className="offer-card__image"
            loading="lazy"
          />
        )}
        {badge && (
          <span className="offer-card__badge">{badge}</span>
        )}
      </div>
      <div className="offer-card__body">
        <div className="offer-card__meta">
          {branchLabel && <span className="offer-card__branch">{branchLabel}</span>}
          {duration && <span className="offer-card__duration">{duration}</span>}
        </div>
        <h3 className="offer-card__title">{title}</h3>
        {copy && <p className="offer-card__copy">{copy}</p>}
        <div className="offer-card__footer">
          <span className="offer-card__cta">
            {ctaLabel}
            <span className="offer-card__cta-arrow" aria-hidden="true">{isAr ? '←' : '→'}</span>
          </span>
          {showPrice ? (
            <span className="offer-card__price">{priceText}</span>
          ) : (
            <span className="offer-card__price offer-card__price--hidden">{hiddenPriceCopy}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
