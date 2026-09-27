/**
 * ServiceDetailPage — generic public /services/:slug detail page.
 *
 * Fetches a single service from the Service CMS model and renders a
 * professional detail page with hero, description, related case studies,
 * and a contact CTA with service preselection.
 *
 * Note: /services/ai-automation has a dedicated static route in App.jsx that
 * takes precedence over this generic route, so the bespoke AI Automation
 * page is rendered for that slug instead.
 */

import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n/I18nProvider';
import Footer from '../components/Footer';
import Header from '../components/Header';
import SEO from '../components/SEO';
import { getService } from '../services/servicesApi';
import resolveMediaUrl from '../utils/resolveMediaUrl';

function ServiceDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { lang, dir } = useI18n();
  const isAr = lang === 'ar';

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setService(null);

    getService(slug, { signal: controller.signal })
      .then((data) => {
        setService(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err?.status === 404) {
          setError('not_found');
        } else if (err?.status !== 0) {
          setError('error');
        }
        setLoading(false);
      });

    return () => controller.abort();
  }, [slug]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="service-detail-page" dir={dir}>
          <div className="service-detail-loading">
            <p>{isAr ? 'جاري التحميل...' : 'Loading...'}</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error === 'not_found') {
    return (
      <>
        <Header />
        <main className="service-detail-page" dir={dir}>
          <div className="service-detail-error">
            <h1>{isAr ? 'الخدمة غير موجودة' : 'Service Not Found'}</h1>
            <p>
              {isAr
                ? 'الخدمة المطلوبة غير متوفرة أو لم تعد نشطة.'
                : 'The requested service is not available or no longer active.'}
            </p>
            <Link to="/services" className="service-detail-back">
              {isAr ? '← العودة إلى الخدمات' : '← Back to Services'}
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !service) {
    return (
      <>
        <Header />
        <main className="service-detail-page" dir={dir}>
          <div className="service-detail-error">
            <h1>{isAr ? 'حدث خطأ' : 'Something went wrong'}</h1>
            <p>
              {isAr
                ? 'تعذر تحميل بيانات الخدمة. يرجى المحاولة مرة أخرى.'
                : 'Could not load service data. Please try again.'}
            </p>
            <Link to="/services" className="service-detail-back">
              {isAr ? '← العودة إلى الخدمات' : '← Back to Services'}
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const name = isAr
    ? (service.name?.ar || service.name?.en)
    : (service.name?.en || service.name?.ar);
  const shortDescription = isAr
    ? (service.short_description?.ar || service.short_description?.en)
    : (service.short_description?.en || service.short_description?.ar);
  const description = isAr
    ? (service.description?.ar || service.description?.en)
    : (service.description?.en || service.description?.ar);
  const imageUrl = resolveMediaUrl(service.featured_image || service.icon);
  const caseStudies = service.case_studies || [];

  // SEO from service model
  const seoTitle = isAr
    ? (service.seo?.title?.ar || service.seo?.title?.en || name)
    : (service.seo?.title?.en || service.seo?.title?.ar || name);
  const seoDescription = isAr
    ? (service.seo?.description?.ar || service.seo?.description?.en || shortDescription)
    : (service.seo?.description?.en || service.seo?.description?.ar || shortDescription);
  const canonical = `/services/${service.slug}`;

  const ctaLabel = isAr ? 'ابدأ مشروعاً' : 'Start a Project';
  const ctaHref = `/#contact?service=${service.slug}`;

  const backLabel = isAr ? '← كل الخدمات' : '← All Services';
  const caseStudiesTitle = isAr ? 'أعمال ذات صلة' : 'Related Work';

  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: name,
    provider: {
      '@type': 'Organization',
      name: 'Sidrah Soft',
      url: 'https://sidrahsoft.com',
    },
    serviceType: name,
    areaServed: { '@type': 'Country', name: 'Egypt' },
    description: seoDescription,
  };

  return (
    <>
      <SEO
        title={seoTitle}
        description={seoDescription}
        canonical={canonical}
        breadcrumbItems={[
          { name: isAr ? 'الرئيسية' : 'Home', url: '/' },
          { name: isAr ? 'الخدمات' : 'Services', url: '/services' },
          { name: name, url: canonical },
        ]}
        jsonLd={serviceJsonLd}
      />
      <Header />
      <main className="service-detail-page" dir={dir}>
        {/* Hero */}
        <section className="service-detail-hero">
          <div className="service-detail-hero-content">
            <Link to="/services" className="service-detail-back-link">
              {backLabel}
            </Link>
            <h1 className="service-detail-hero-title">{name}</h1>
            {shortDescription && (
              <p className="service-detail-hero-subtitle">{shortDescription}</p>
            )}
            <Link to={ctaHref} className="service-detail-hero-cta">
              {ctaLabel}
              <span className="service-detail-hero-cta-arrow" aria-hidden="true">→</span>
            </Link>
          </div>
          {imageUrl && (
            <div className="service-detail-hero-media">
              <img
                src={imageUrl}
                alt=""
                loading="lazy"
                decoding="async"
              />
            </div>
          )}
        </section>

        {/* Description */}
        {description && (
          <section className="service-detail-description-section">
            <div className="service-detail-description-content">
              <h2 className="service-detail-section-title">
                {isAr ? 'نظرة عامة' : 'Overview'}
              </h2>
              <p className="service-detail-description-text">{description}</p>
            </div>
          </section>
        )}

        {/* Related Case Studies */}
        {caseStudies.length > 0 && (
          <section className="service-detail-case-studies-section">
            <div className="service-detail-case-studies-content">
              <h2 className="service-detail-section-title">{caseStudiesTitle}</h2>
              <div className="service-detail-case-studies-grid">
                {caseStudies.map((cs) => {
                  const csTitle = isAr
                    ? (cs.title?.ar || cs.title?.en)
                    : (cs.title?.en || cs.title?.ar);
                  const csDesc = isAr
                    ? (cs.short_description?.ar || cs.short_description?.en)
                    : (cs.short_description?.en || cs.short_description?.ar);
                  const csImage = resolveMediaUrl(cs.featured_image);
                  return (
                    <Link
                      key={cs.slug || cs.id}
                      to={`/case-studies`}
                      className="service-detail-case-study-card"
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      {csImage && (
                        <div className="service-detail-case-study-media">
                          <img src={csImage} alt="" loading="lazy" />
                        </div>
                      )}
                      <div className="service-detail-case-study-body">
                        <h3 className="service-detail-case-study-title">{csTitle}</h3>
                        {csDesc && (
                          <p className="service-detail-case-study-desc">{csDesc}</p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Final CTA */}
        <section className="service-detail-cta-section">
          <div className="service-detail-cta-content">
            <h2 className="service-detail-cta-title">
              {isAr ? 'هل أنت مستعد للبدء؟' : 'Ready to start?'}
            </h2>
            <p className="service-detail-cta-text">
              {isAr
                ? `حدد ${name} كخدمة مهتم بها وابدأ محادثة مع فريقنا.`
                : `Identify ${name} as the service you're interested in and start a conversation with our team.`}
            </p>
            <Link to={ctaHref} className="service-detail-cta-button">
              {ctaLabel}
              <span className="service-detail-cta-arrow" aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default ServiceDetailPage;
