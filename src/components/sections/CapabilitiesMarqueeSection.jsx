import { useI18n } from '../../i18n/I18nProvider.jsx';
import { useHomepageConfig } from '../../hooks/useHomepageConfig';
import { useServices } from '../../hooks/useServices';
import SectionHeading from '../ui/SectionHeading';
import { Link } from 'react-router-dom';

/**
 * CapabilitiesMarqueeSection — canonical homepage services preview.
 *
 * Source of truth: the Service CMS model (via /api/v1/services/?show_on_homepage=true).
 * The MarqueeItem homepage model is no longer used for service identity —
 * Service is the single canonical source.
 *
 * The heading/description still come from HomepageSettings (marquee_heading_*)
 * for presentation control, but service identity and links come from Service.
 */
const FALLBACK_CAPABILITIES = [
  {
    slug: 'web-development',
    name: { en: 'Web Development', ar: 'تطوير الويب' },
    shortDescription: {
      en: 'Custom web platforms built for scale, performance, and long-term growth.',
      ar: 'منصات ويب مخصصة مبنية للتوسع والأداء والنمو طويل المدى.',
    },
    detailUrl: '/services/web-development',
  },
  {
    slug: 'mobile-app-development',
    name: { en: 'Mobile App Development', ar: 'تطوير تطبيقات الجوال' },
    shortDescription: {
      en: 'Native and cross-platform mobile apps for iOS and Android.',
      ar: 'تطبيقات جوال أصلية ومتعددة المنصات لنظامي iOS وAndroid.',
    },
    detailUrl: '/services/mobile-app-development',
  },
  {
    slug: 'erp-business-systems',
    name: { en: 'ERP & Business Systems', ar: 'أنظمة ERP وحلول الأعمال' },
    shortDescription: {
      en: 'Integrated systems that connect operations, finance, and data.',
      ar: 'أنظمة متكاملة تربط العمليات والمالية والبيانات.',
    },
    detailUrl: '/services/erp-business-systems',
  },
  {
    slug: 'ai-automation',
    name: { en: 'AI & Automation', ar: 'الذكاء الاصطناعي والأتمتة' },
    shortDescription: {
      en: 'Intelligent workflows that reduce manual work and surface insights.',
      ar: 'سير عمل ذكي يقلل العمل اليدوي ويكشف الرؤى.',
    },
    detailUrl: '/services/ai-automation',
  },
  {
    slug: 'custom-software-development',
    name: { en: 'Custom Software Development', ar: 'تطوير البرمجيات المخصصة' },
    shortDescription: {
      en: 'Tailored software for specific business requirements.',
      ar: 'برمجيات مخصصة لمتطلبات أعمال محددة.',
    },
    detailUrl: '/services/custom-software-development',
  },
];

const FEATURED_INDEX = 0;
const SUPPORTING_INDICES = [1, 2, 3, 4];

function CapabilitiesMarqueeSection() {
  const { config } = useHomepageConfig();
  const { services: cmsServices } = useServices();
  const { lang } = useI18n();

  const marquee = config?.marquee;
  const heading = lang === 'ar'
    ? (marquee?.heading_ar || 'ما نبنيه')
    : (marquee?.heading_en || 'What We Build');

  const description = lang === 'ar'
    ? (marquee?.description_ar || 'منصات وأدوات وأنظمة ذكية تبنيها SidrahSoft لتقود عمليات المؤسسات الحديثة.')
    : (marquee?.description_en || 'Platforms, tools, and intelligent systems built by SidrahSoft to power modern organization operations.');

  // Service CMS is the source of truth. Fallback only when CMS is empty.
  const items = cmsServices && cmsServices.length > 0
    ? cmsServices.map((s) => ({
        title: lang === 'ar' ? (s.name?.ar || s.name?.en) : (s.name?.en || s.name?.ar),
        description: lang === 'ar'
          ? (s.shortDescription?.ar || s.shortDescription?.en)
          : (s.shortDescription?.en || s.shortDescription?.ar),
        link: s.detailUrl || `/services/${s.slug}`,
      }))
    : FALLBACK_CAPABILITIES.map((item) => ({
        title: lang === 'ar' ? item.name.ar : item.name.en,
        description: lang === 'ar' ? item.shortDescription.ar : item.shortDescription.en,
        link: item.detailUrl,
      }));

  const featured = items[FEATURED_INDEX];
  const supporting = SUPPORTING_INDICES.map((i) => items[i]).filter(Boolean);
  const remaining = items.slice(5).slice(0, 5);

  return (
    <section id="capabilities" className="capabilities-section" aria-labelledby="capabilities-heading">
      <div className="capabilities-content">
        <SectionHeading
          id="capabilities-heading"
          title={heading}
          description={description}
          className="capabilities-heading-block motion-clip-reveal is-visible"
        />

        <div className="capabilities-showcase">
          {featured && (
            <Link to={featured.link} className="capability-featured card-base card-surface-glass card-edge-purple card-hover-glow card-padding-lg motion-scale-in is-visible" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="capability-featured__topline">
                <span className="capability-featured__badge">
                  {lang === 'ar' ? 'قدرة أساسية' : 'Core Capability'}
                </span>
                <span className="capability-featured__number" aria-hidden="true">01</span>
              </div>
              <div className="capability-featured__body">
                <h3 className="capability-featured__title">{featured.title}</h3>
                <p className="capability-featured__description">{featured.description}</p>
              </div>
            </Link>
          )}

          <div className="capability-supporting">
            {supporting.map((cap, idx) => {
              const content = (
                <>
                  <span className="capability-item__number" aria-hidden="true">0{idx + 2}</span>
                  <h3 className="capability-item__title">{cap.title}</h3>
                  <p className="capability-item__description">{cap.description}</p>
                </>
              );
              const className = `capability-item card-base card-surface-solid card-edge-purple card-hover-lift card-padding-md motion-fade-up is-visible stagger-${idx + 1}`;
              return (
                <Link key={`cap-${idx}`} to={cap.link} className={className} style={{ textDecoration: 'none', color: 'inherit' }}>
                  {content}
                </Link>
              );
            })}
          </div>
        </div>

        {remaining.length > 0 && (
          <div className="capability-remaining" aria-label={lang === 'ar' ? 'قدرات إضافية' : 'Additional capabilities'}>
            {remaining.map((cap, idx) => (
              <Link key={`rem-${idx}`} to={cap.link} className="capability-tag">
                {cap.title}
              </Link>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}

export default CapabilitiesMarqueeSection;
