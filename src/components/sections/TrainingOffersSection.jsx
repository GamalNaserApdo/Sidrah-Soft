/**
 * TrainingOffersSection — homepage preview of current training offers.
 *
 * Behavior:
 * - Fetches active offer campaigns from the public offers API.
 * - Renders NOTHING (null) when no offers are active — the homepage must
 *   not show an empty offers section. The navbar link and /training/offers
 *   landing page remain available regardless.
 * - Shows at most 4 offer cards (the first campaign's top items by display
 *   order) so the homepage stays a preview, not a catalog.
 * - CTA links to /training/offers ("View All Offers").
 *
 * Section visibility/order can additionally be controlled through the CMS
 * HomepageSectionConfig using the 'training_offers' section key.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nProvider';
import { fetchOffers } from '../../services/trainingApi';
import OfferCard from '../offers/OfferCard';

const MAX_HOMEPAGE_OFFER_CARDS = 4;

export default function TrainingOffersSection() {
  const { lang } = useI18n();
  const isAr = lang === 'ar';
  const [campaigns, setCampaigns] = useState(null); // null = loading

  useEffect(() => {
    let cancelled = false;
    fetchOffers()
      .then((data) => {
        if (!cancelled) setCampaigns(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setCampaigns([]);
      });
    return () => { cancelled = true; };
  }, []);

  // While loading, render nothing (avoids layout shift for a section that
  // is usually absent).
  if (campaigns === null) return null;

  const campaign = campaigns.find((c) => (c.items || []).length > 0);
  if (!campaign) return null;

  const items = campaign.items.slice(0, MAX_HOMEPAGE_OFFER_CARDS);
  const heading = isAr ? 'عروض التدريب الحالية' : 'Current Training Offers';
  const viewAllLabel = isAr ? 'عرض جميع العروض' : 'View All Offers';

  return (
    <section className="training-offers" id="training-offers">
      <div className="training-offers__content">
        <h2 className="training-offers__heading">{heading}</h2>
        {campaign.title_en && (
          <p className="training-offers__campaign">
            {isAr ? (campaign.title_ar || campaign.title_en) : campaign.title_en}
          </p>
        )}
        <div className="training-offers__grid">
          {items.map((item) => (
            <OfferCard
              key={item.id}
              item={item}
              campaignSlug={campaign.slug}
              placement="homepage"
            />
          ))}
        </div>
        <Link to="/training/offers" className="training-offers__view-all">
          {viewAllLabel}
          <span aria-hidden="true">{isAr ? ' ←' : ' →'}</span>
        </Link>
      </div>
    </section>
  );
}
