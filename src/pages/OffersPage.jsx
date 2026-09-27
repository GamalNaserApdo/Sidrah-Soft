/**
 * OffersPage — stable marketing landing page at /training/offers.
 *
 * Behavior:
 * - ALWAYS rendered (never 404 / never removed) so the route, navbar link,
 *   canonical, and sitemap entry remain stable regardless of campaign state.
 * - With active offers: page hero + active campaign sections + offer cards.
 * - With no active offers: friendly empty state + "Explore Training" CTA
 *   linking to /training. No conditional noindex — the page stays indexable.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/I18nProvider';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { useStaticPageSEO } from '../hooks/useStaticPageSEO';
import { fetchOffers } from '../services/trainingApi';
import OfferCard from '../components/offers/OfferCard';

function OffersPage() {
  const { lang, dir } = useI18n();
  const isAr = lang === 'ar';
  const { seo } = useStaticPageSEO('training_offers', lang);

  const [campaigns, setCampaigns] = useState(null); // null = loading
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchOffers()
      .then((data) => {
        if (!cancelled) setCampaigns(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) {
          setCampaigns([]);
          setError(true);
        }
      });
    return () => { cancelled = true; };
  }, []);

  const title = isAr ? 'عروض التدريب' : 'Training Offers';
  const intro = isAr
    ? 'عروض وخصومات محدودة على برامج التدريب والكورسات التقنية من Sidrah Soft.'
    : 'Limited-time offers and promotions on training programs and tech courses from Sidrah Soft.';

  const hasOffers = Array.isArray(campaigns) && campaigns.some((c) => (c.items || []).length > 0);

  return (
    <>
      <SEO
        {...seo}
        breadcrumbItems={[
          { name: isAr ? 'الرئيسية' : 'Home', url: '/' },
          { name: title, url: '/training/offers' },
        ]}
      />
      <Header />
      <main className="offers-page" dir={dir}>
        <section className="offers-page-hero">
          <div className="offers-page-hero-content">
            <h1 className="offers-page-title">{title}</h1>
            <p className="offers-page-intro">{intro}</p>
          </div>
        </section>

        <section className="offers-page-listing">
          <div className="offers-page-content">
            {campaigns === null && (
              <div className="offers-page-loading" role="status">
                <p>{isAr ? 'جاري تحميل العروض...' : 'Loading offers...'}</p>
              </div>
            )}

            {campaigns !== null && !hasOffers && (
              <div className="offers-page-empty">
                <p className="offers-page-empty-message">
                  {error
                    ? (isAr ? 'تعذر تحميل العروض حاليًا.' : 'Failed to load offers right now.')
                    : (isAr ? 'لا توجد عروض متاحة حاليًا.' : 'No active offers right now.')}
                </p>
                <Link to="/training" className="offers-page-empty-cta">
                  {isAr ? 'استكشف برامج التدريب' : 'Explore Training'}
                  <span aria-hidden="true">{isAr ? ' ←' : ' →'}</span>
                </Link>
              </div>
            )}

            {campaigns !== null && hasOffers && (
              <>
                {campaigns.map((campaign) => {
                  const items = campaign.items || [];
                  if (items.length === 0) return null;
                  const campaignTitle = isAr
                    ? (campaign.title_ar || campaign.title_en)
                    : campaign.title_en;
                  const campaignDesc = isAr
                    ? (campaign.description_ar || campaign.description_en)
                    : campaign.description_en;
                  return (
                    <div key={campaign.id || campaign.slug} className="offers-page-campaign">
                      <h2 className="offers-page-campaign-title">{campaignTitle}</h2>
                      {campaignDesc && (
                        <p className="offers-page-campaign-description">{campaignDesc}</p>
                      )}
                      {campaign.ends_at && (
                        <p className="offers-page-campaign-ends">
                          {isAr ? 'ينتهي العرض في ' : 'Offer ends '}
                          {new Date(campaign.ends_at).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      )}
                      <div className="offers-page-grid">
                        {items.map((item) => (
                          <OfferCard
                            key={item.id}
                            item={item}
                            campaignSlug={campaign.slug}
                            placement="offers_page"
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
                <div className="offers-page-footer-cta">
                  <Link to="/training" className="offers-page-explore-cta">
                    {isAr ? 'استكشف جميع برامج التدريب' : 'Explore All Training Programs'}
                    <span aria-hidden="true">{isAr ? ' ←' : ' →'}</span>
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default OffersPage;
