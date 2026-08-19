import { useHomepageConfig } from '../../hooks/useHomepageConfig';
import { useI18n } from '../../i18n/I18nProvider.jsx';
import getBilingual from '../../utils/getBilingual';
import SectionHeading from '../ui/SectionHeading';

const FALLBACK_CAPABILITIES = [
  { title: 'Web Applications', title_ar: 'تطبيقات الويب', description: 'Scalable platforms built for real business use.', description_ar: 'منصات قابلة للتوسع مبنية لاستخدامات عملية.' },
  { title: 'Mobile Applications', title_ar: 'تطبيقات الجوال', description: 'Native and cross-platform apps for iOS and Android.', description_ar: 'تطبيقات أصلية وعبر المنصات لنظامي iOS و Android.' },
  { title: 'ERP / Business Systems', title_ar: 'أنظمة ERP والأعمال', description: 'Integrated systems that connect operations, finance, and data.', description_ar: 'أنظمة متكاملة تربط العمليات والمالية والبيانات.' },
  { title: 'AI & Automation', title_ar: 'الذكاء الاصطناعي والأتمتة', description: 'Intelligent workflows that reduce manual work.', description_ar: 'سير عمل ذكي يقلل العمل اليدوي.' },
  { title: 'Custom Software Solutions', title_ar: 'حلول برمجية مخصصة', description: 'Tailored software for specific requirements.', description_ar: 'برمجيات مخصصة لمتطلبات محددة.' },
];

const FEATURED_INDEX = 0;
const SUPPORTING_INDICES = [1, 2, 3, 4];

function CapabilitiesMarqueeSection() {
  const { config } = useHomepageConfig();
  const { lang } = useI18n();

  const marquee = config?.marquee;
  const heading = lang === 'ar'
    ? (marquee?.heading_ar || 'ما نبنيه')
    : (marquee?.heading_en || 'What We Build');

  const description = lang === 'ar'
    ? (marquee?.description_ar || 'منصات وأدوات وأنظمة ذكية تبنيها SidrahSoft لتقود عمليات المؤسسات الحديثة.')
    : (marquee?.description_en || 'Platforms, tools, and intelligent systems built by SidrahSoft to power modern organization operations.');

  const FALLBACK_BY_TITLE = Object.fromEntries(
    FALLBACK_CAPABILITIES.map(f => [f.title, f])
  );

  const cmsItems = marquee?.items;
  const items = cmsItems?.length
    ? cmsItems.map((item) => {
        const fb = FALLBACK_BY_TITLE[item.title_en];
        return {
          title: lang === 'ar'
            ? (item.title_ar || fb?.title_ar || item.title_en)
            : (item.title_en || item.title_ar),
          description: lang === 'ar'
            ? (item.description_ar || fb?.description_ar || item.description_en)
            : (item.description_en || item.description_ar),
        };
      })
    : FALLBACK_CAPABILITIES.map((item) => ({
        title: (lang === 'ar' && item.title_ar) ? item.title_ar : item.title,
        description: (lang === 'ar' && item.description_ar) ? item.description_ar : item.description,
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
            <article className="capability-featured card-base card-surface-glass card-edge-purple card-hover-glow card-padding-lg motion-scale-in is-visible">
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
            </article>
          )}

          <div className="capability-supporting">
            {supporting.map((cap, idx) => (
              <article
                key={`cap-${idx}`}
                className={`capability-item card-base card-surface-solid card-edge-purple card-hover-lift card-padding-md motion-fade-up is-visible stagger-${idx + 1}`}
              >
                <span className="capability-item__number" aria-hidden="true">0{idx + 2}</span>
                <h3 className="capability-item__title">{cap.title}</h3>
                <p className="capability-item__description">{cap.description}</p>
              </article>
            ))}
          </div>
        </div>

        {remaining.length > 0 && (
          <div className="capability-remaining" aria-label={lang === 'ar' ? 'قدرات إضافية' : 'Additional capabilities'}>
            {remaining.map((cap, idx) => (
              <span key={`rem-${idx}`} className="capability-tag">{cap.title}</span>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}

export default CapabilitiesMarqueeSection;
