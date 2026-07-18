import { useHomepageConfig } from '../../hooks/useHomepageConfig';
import { useI18n } from '../../i18n/I18nProvider.jsx';
import SectionHeading from '../ui/SectionHeading';
import getBilingual from '../../utils/getBilingual';

const EducationIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3L2 9l10 6 10-6-10-6z" />
    <path d="M2 12v3l10 6 10-6v-3" />
    <path d="M12 18v6" />
  </svg>
);

const EnterpriseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="6" width="18" height="15" rx="1" />
    <line x1="8" y1="6" x2="8" y2="21" />
    <line x1="16" y1="6" x2="16" y2="21" />
    <line x1="8" y1="10" x2="16" y2="10" />
    <line x1="8" y1="14" x2="16" y2="14" />
  </svg>
);

const SmesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21h18" />
    <path d="M5 21V7l8-4 8 4v14" />
    <path d="M10 21v-6h4v6" />
  </svg>
);

const GovernmentIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7h20L12 2z" />
    <path d="M2 22h20" />
    <path d="M5 7v15" />
    <path d="M19 7v15" />
    <path d="M8 7v15" />
    <path d="M16 7v15" />
    <path d="M11 7v15" />
    <path d="M13 7v15" />
  </svg>
);

const FALLBACK_ICONS = {
  Education: EducationIcon,
  Enterprise: EnterpriseIcon,
  SMEs: SmesIcon,
  'Government & Public Sector': GovernmentIcon,
};

const FALLBACK_INDUSTRIES = [
  {
    title: 'Education',
    title_ar: 'التعليم',
    description: 'Learning platforms, student systems, academic portals, and institutional digital operations.',
    description_ar: 'منصات تعلم وأنظمة طلاب وبوابات أكاديمية وعمليات رقمية مؤسسية.',
    focusAreas: ['Learning platforms', 'Student management', 'Academic workflows'],
    focusAreas_ar: ['منصات التعلم', 'إدارة الطلاب', 'سير العمل الأكاديمي'],
  },
  {
    title: 'Enterprise',
    title_ar: 'المؤسسات',
    description: 'ERP, integrations, internal platforms, automation, and data-driven business systems.',
    description_ar: 'تخطيط الموارد والتكامل والمنصات الداخلية والأتمتة والأنظمة التجارية المدفوعة بالبيانات.',
    focusAreas: ['ERP systems', 'Business automation', 'Data integration'],
    focusAreas_ar: ['أنظمة تخطيط الموارد', 'أتمتة الأعمال', 'تكامل البيانات'],
  },
  {
    title: 'SMEs',
    title_ar: 'الشركات الصغيرة والمتوسطة',
    description: 'Growth-focused systems that help teams manage customers, operations, services, and digital channels.',
    description_ar: 'أنظمة تركز على النمو تساعد الفرق على إدارة العملاء والعمليات والخدمات والقنوات الرقمية.',
    focusAreas: ['Customer platforms', 'Operations tools', 'Scalable web/mobile apps'],
    focusAreas_ar: ['منصات العملاء', 'أدوات العمليات', 'تطبيقات ويب/جوال قابلة للتوسع'],
  },
  {
    title: 'Government & Public Sector',
    title_ar: 'الحكومة والقطاع العام',
    description: 'Digital service delivery, workflow systems, data management, and citizen-facing platforms.',
    description_ar: 'تقديم الخدمات الرقمية وأنظمة سير العمل وإدارة البيانات والمنصات الموجهة للمواطنين.',
    focusAreas: ['Service portals', 'Workflow digitization', 'Data management'],
    focusAreas_ar: ['بوابات الخدمات', 'رقمنة سير العمل', 'إدارة البيانات'],
  },
];

function IndustryIcon({ industry }) {
  const { iconUrl, FallbackIcon } = industry;

  return (
    <div className="industry-visual__icon" aria-hidden="true">
      {iconUrl ? (
        <img src={iconUrl} alt="" loading="lazy" decoding="async" />
      ) : (
        FallbackIcon && <FallbackIcon />
      )}
    </div>
  );
}

function IndustriesSection() {
  const { config } = useHomepageConfig();
  const { lang } = useI18n();
  const industriesData = config?.industries;
  const heading = lang === 'ar'
    ? (industriesData?.heading_ar || 'حلول للمؤسسات والجهات والمنظمات المتنامية')
    : (industriesData?.heading_en || 'Solutions for institutions, enterprises, and growing organizations.');

  const description = lang === 'ar'
    ? (industriesData?.description_ar || 'تبني SidrahSoft أنظمة للمؤسسات التي تحتاج بنية رقمية موثوقة وعمليات متصلة وأسساً تقنية قابلة للتوسع.')
    : (industriesData?.description_en || 'SidrahSoft builds systems for organizations that need reliable digital infrastructure, connected operations, and scalable technology foundations.');

  const FALLBACK_BY_TITLE = {};
  FALLBACK_INDUSTRIES.forEach(f => { FALLBACK_BY_TITLE[f.title] = f; });

  const cmsItems = industriesData?.items;
  const industries = cmsItems?.length
    ? cmsItems.map((item) => {
        const titleEn = item.title_en;
        const fb = FALLBACK_BY_TITLE[titleEn];
        const FallbackIcon = FALLBACK_ICONS[titleEn];
        return {
          title: lang === 'ar'
            ? (item.title_ar || fb?.title_ar || titleEn)
            : (item.title_en || item.title_ar),
          description: lang === 'ar'
            ? (item.description_ar || fb?.description_ar || item.description_en)
            : (item.description_en || item.description_ar),
          focusAreas: lang === 'ar'
            ? (item.focus_areas_ar?.length ? item.focus_areas_ar : (fb?.focusAreas_ar || item.focus_areas_en || []))
            : (item.focus_areas_en?.length ? item.focus_areas_en : (fb?.focusAreas || [])),
          iconUrl: item.icon_url || null,
          FallbackIcon: FallbackIcon || null,
        };
      })
    : FALLBACK_INDUSTRIES.map((ind) => ({
        title: (lang === 'ar' && ind.title_ar) ? ind.title_ar : ind.title,
        description: (lang === 'ar' && ind.description_ar) ? ind.description_ar : ind.description,
        focusAreas: (lang === 'ar' && ind.focusAreas_ar) ? ind.focusAreas_ar : ind.focusAreas,
        iconUrl: null,
        FallbackIcon: FALLBACK_ICONS[ind.title] || null,
      }));

  const [featuredIndustry, ...supportingIndustries] = industries;

  if (!featuredIndustry) return null;

  return (
    <section id="industries" className="industries-section" aria-labelledby="industries-heading">
      <div className="industries-content">
        <SectionHeading
          id="industries-heading"
          index="06"
          eyebrow={lang === 'ar' ? 'الصناعات والحلول' : 'Industries & Solutions'}
          title={heading}
          description={description}
          className="industries-heading-block motion-clip-reveal is-visible"
        />
        <div className="industries-showcase">
          <article className="industry-spotlight card-base card-surface-gold card-edge-copper card-hover-lift card-padding-lg motion-scale-in is-visible">
            <div className="industry-spotlight__topline">
              <span className="industry-spotlight__label">{lang === 'ar' ? 'عرض رئيسي' : 'Primary Focus'}</span>
              <IndustryIcon industry={featuredIndustry} />
            </div>
            <h3 className="industry-spotlight__title">{featuredIndustry.title}</h3>
            <p className="industry-spotlight__description">{featuredIndustry.description}</p>
            {featuredIndustry.focusAreas.length > 0 && (
              <ul className="industry-spotlight__focus-areas">
                {featuredIndustry.focusAreas.map((area) => (
                  <li key={area}>{area}</li>
                ))}
              </ul>
            )}
          </article>
          <div className="industries-supporting">
            {supportingIndustries.map((industry, index) => (
              <article
                key={industry.title}
                className={`industry-feature card-base card-surface-solid card-edge-copper card-hover-lift card-padding-md motion-fade-up is-visible stagger-${Math.min(index + 1, 6)}`}
              >
                <IndustryIcon industry={industry} />
                <div className="industry-feature__content">
                  <h3 className="industry-feature__title">{industry.title}</h3>
                  <p className="industry-feature__description">{industry.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default IndustriesSection;
