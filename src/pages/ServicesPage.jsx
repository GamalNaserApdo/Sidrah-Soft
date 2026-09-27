/**
 * ServicesPage — public /services overview page.
 *
 * Displays all canonical Sidrah services from the Service CMS model.
 * Each card links to the service detail page (generic or bespoke).
 */

import { useI18n } from '../i18n/I18nProvider';
import Footer from '../components/Footer';
import Header from '../components/Header';
import SEO from '../components/SEO';
import { useStaticPageSEO } from '../hooks/useStaticPageSEO';
import { useAllServices } from '../hooks/useServices';
import { Link } from 'react-router-dom';
import resolveMediaUrl from '../utils/resolveMediaUrl';

const FALLBACK_SERVICES = [
  {
    slug: 'web-development',
    name: { en: 'Web Development', ar: 'تطوير الويب' },
    shortDescription: {
      en: 'Custom web platforms built for scale, performance, and long-term growth.',
      ar: 'منصات ويب مخصصة مبنية للتوسع والأداء والنمو طويل المدى.',
    },
    detailUrl: '/services/web-development',
    isFeatured: true,
  },
  {
    slug: 'mobile-app-development',
    name: { en: 'Mobile App Development', ar: 'تطوير تطبيقات الجوال' },
    shortDescription: {
      en: 'Native and cross-platform mobile apps for iOS and Android.',
      ar: 'تطبيقات جوال أصلية ومتعددة المنصات لنظامي iOS وAndroid.',
    },
    detailUrl: '/services/mobile-app-development',
    isFeatured: true,
  },
  {
    slug: 'erp-business-systems',
    name: { en: 'ERP & Business Systems', ar: 'أنظمة ERP وحلول الأعمال' },
    shortDescription: {
      en: 'Integrated systems that connect operations, finance, and data.',
      ar: 'أنظمة متكاملة تربط العمليات والمالية والبيانات.',
    },
    detailUrl: '/services/erp-business-systems',
    isFeatured: true,
  },
  {
    slug: 'ai-automation',
    name: { en: 'AI & Automation', ar: 'الذكاء الاصطناعي والأتمتة' },
    shortDescription: {
      en: 'Intelligent workflows that reduce manual work and surface insights.',
      ar: 'سير عمل ذكي يقلل العمل اليدوي ويكشف الرؤى.',
    },
    detailUrl: '/services/ai-automation',
    isFeatured: true,
  },
  {
    slug: 'custom-software-development',
    name: { en: 'Custom Software Development', ar: 'تطوير البرمجيات المخصصة' },
    shortDescription: {
      en: 'Tailored software for specific business requirements.',
      ar: 'برمجيات مخصصة لمتطلبات أعمال محددة.',
    },
    detailUrl: '/services/custom-software-development',
    isFeatured: false,
  },
  {
    slug: 'data-analytics',
    name: { en: 'Data & Analytics', ar: 'البيانات والتحليلات' },
    shortDescription: {
      en: 'Data pipelines, dashboards, and analytics that turn raw data into decisions.',
      ar: 'خطوط بيانات ولوحات تحكم وتحليلات تحول البيانات الخام إلى قرارات.',
    },
    detailUrl: '/services/data-analytics',
    isFeatured: false,
  },
  {
    slug: 'system-integration',
    name: { en: 'System Integration', ar: 'تكامل الأنظمة' },
    shortDescription: {
      en: 'Connect disparate systems into a unified, reliable workflow.',
      ar: 'ربط الأنظمة المتباينة في سير عمل موحد وموثوق.',
    },
    detailUrl: '/services/system-integration',
    isFeatured: false,
  },
];

function ServicesPage() {
  const { t, lang, dir } = useI18n();
  const { seo } = useStaticPageSEO('services', lang);
  const { services: cmsServices, loading } = useAllServices();
  const isAr = lang === 'ar';

  const services = cmsServices && cmsServices.length > 0 ? cmsServices : FALLBACK_SERVICES;

  const heroEyebrow = isAr ? 'خدماتنا' : 'Our Services';
  const heroTitle = isAr
    ? 'نبني البرمجيات التي تقود المؤسسات الحديثة'
    : 'Building the software that powers modern organizations';
  const heroSubtitle = isAr
    ? 'من المنصات المخصصة إلى الأتمتة الذكية، نقدم خدمات برمجية متكاملة تساعد المؤسسات على البناء بثقة.'
    : 'From custom platforms to intelligent automation, we deliver integrated software services that help organizations build with confidence.';

  const ctaTitle = isAr ? 'هل أنت مستعد للبدء؟' : 'Ready to start?';
  const ctaText = isAr
    ? 'حدد الخدمة التي تحتاجها وابدأ محادثة مع فريقنا.'
    : 'Identify the service you need and start a conversation with our team.';
  const ctaLabel = isAr ? 'ابدأ مشروعاً' : 'Start a Project';
  const ctaHref = '/#contact';

  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: services.map((service, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: isAr ? (service.name?.ar || service.name?.en) : (service.name?.en || service.name?.ar),
      url: `https://sidrahsoft.com${service.detailUrl || `/services/${service.slug}`}`,
    })),
  };

  return (
    <>
      <SEO
        {...seo}
        breadcrumbItems={[
          { name: isAr ? 'الرئيسية' : 'Home', url: '/' },
          { name: isAr ? 'الخدمات' : 'Services', url: '/services' },
        ]}
        jsonLd={serviceJsonLd}
      />
      <Header />
      <main className="services-page" dir={dir}>
        {/* Hero */}
        <section className="services-page-hero">
          <div className="services-page-hero-content">
            <span className="services-page-hero-eyebrow">{heroEyebrow}</span>
            <h1 className="services-page-hero-title">{heroTitle}</h1>
            <p className="services-page-hero-subtitle">{heroSubtitle}</p>
          </div>
        </section>

        {/* Services Grid */}
        <section className="services-page-grid-section">
          <div className="services-page-grid">
            {loading && (
              <p className="services-page-loading">
                {isAr ? 'جاري التحميل...' : 'Loading...'}
              </p>
            )}
            {!loading && services.map((service, idx) => {
              const name = isAr
                ? (service.name?.ar || service.name?.en)
                : (service.name?.en || service.name?.ar);
              const desc = isAr
                ? (service.shortDescription?.ar || service.shortDescription?.en)
                : (service.shortDescription?.en || service.shortDescription?.ar);
              const href = service.detailUrl || `/services/${service.slug}`;
              const imageUrl = resolveMediaUrl(service.featuredImageUrl || service.iconUrl);

              return (
                <Link
                  key={service.slug}
                  to={href}
                  className={`services-page-card ${service.isFeatured ? 'services-page-card--featured' : ''}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  {imageUrl && (
                    <div className="services-page-card__media">
                      <img
                        src={imageUrl}
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  )}
                  <div className="services-page-card__body">
                    <h2 className="services-page-card__title">{name}</h2>
                    <p className="services-page-card__description">{desc}</p>
                    <span className="services-page-card__cta">
                      {isAr ? 'اعرف المزيد' : 'Learn More'}
                      <span className="services-page-card__cta-arrow" aria-hidden="true">→</span>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Final CTA */}
        <section className="services-page-cta">
          <div className="services-page-cta-content">
            <h2 className="services-page-cta-title">{ctaTitle}</h2>
            <p className="services-page-cta-text">{ctaText}</p>
            <Link to={ctaHref} className="services-page-cta-button">
              {ctaLabel}
              <span className="services-page-cta-arrow" aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default ServicesPage;
