import { useHomepageConfig } from '../../hooks/useHomepageConfig';
import { useI18n } from '../../i18n/I18nProvider.jsx';
import getBilingual from '../../utils/getBilingual';
import WorkflowFlow from '../WorkflowFlow';
import SectionHeading from '../ui/SectionHeading';

const FALLBACK_CAPABILITIES = [
  { title: 'Business Automation', title_ar: 'أتمتة الأعمال', description: 'Automate repetitive workflows and business processes.', description_ar: 'أتمتة سير العمل المتكرر والعمليات التجارية.' },
  { title: 'ERP Systems', title_ar: 'أنظمة تخطيط الموارد', description: 'Centralized management for operations, finance, HR, and inventory.', description_ar: 'إدارة مركزية للعمليات والمالية والموارد البشرية والمخزون.' },
  { title: 'AI Solutions', title_ar: 'حلول الذكاء الاصطناعي', description: 'Intelligent assistants, automation, and decision support.', description_ar: 'مساعدون أذكياء وأتمتة ودعم اتخاذ القرار.' },
  { title: 'Web Development', title_ar: 'تطوير الويب', description: 'Modern scalable web platforms.', description_ar: 'منصات ويب حديثة قابلة للتوسع.' },
  { title: 'Mobile Applications', title_ar: 'تطبيقات الجوال', description: 'Cross-platform mobile experiences.', description_ar: 'تجارب جوال عبر المنصات.' },
  { title: 'System Integration', title_ar: 'تكامل الأنظمة', description: 'Connect multiple systems into one ecosystem.', description_ar: 'ربط أنظمة متعددة في منظومة واحدة.' },
  { title: 'Data & Analytics', title_ar: 'البيانات والتحليلات', description: 'Business intelligence and reporting.', description_ar: 'ذكاء الأعمال والتقارير.' },
  { title: 'Digital Transformation', title_ar: 'التحول الرقمي', description: 'Modernization of business operations.', description_ar: 'تحديث العمليات التجارية.' },
  { title: 'Training Programs', title_ar: 'برامج التدريب', description: 'Professional technical education and workforce development.', description_ar: 'تعليم تقني مهني وتطوير القوى العاملة.' },
  { title: 'Custom Software Development', title_ar: 'تطوير برمجيات مخصصة', description: 'Tailored software solutions for unique business requirements.', description_ar: 'حلول برمجية مخصصة لمتطلبات الأعمال الفريدة.' },
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

  const workflowNodes = lang === 'ar'
    ? [
        { label: 'البيانات', sublabel: 'مدخلات', variant: 'gold' },
        { label: 'الذكاء الاصطناعي', sublabel: 'معالجة', variant: 'ai' },
        { label: 'سير العمل', sublabel: 'أتمتة', variant: 'accent' },
        { label: 'ERP', sublabel: 'مزامنة' },
        { label: 'النتيجة', sublabel: 'تسليم', variant: 'gold' },
      ]
    : [
        { label: 'Data', sublabel: 'Input', variant: 'gold' },
        { label: 'AI', sublabel: 'Process', variant: 'ai' },
        { label: 'Workflow', sublabel: 'Automate', variant: 'accent' },
        { label: 'ERP', sublabel: 'Sync' },
        { label: 'Outcome', sublabel: 'Delivered', variant: 'gold' },
      ];

  return (
    <section id="capabilities" className="capabilities-section" aria-labelledby="capabilities-heading">
      <div className="capabilities-content">
        <SectionHeading
          id="capabilities-heading"
          index="03"
          eyebrow={lang === 'ar' ? 'القدرات' : 'Capabilities'}
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

        <WorkflowFlow
          className="capabilities-workflow motion-fade-in is-visible"
          label={lang === 'ar' ? 'مسار الأتمتة' : 'Automation Pipeline'}
          ariaLabel={lang === 'ar' ? 'مخطط مسار الأتمتة' : 'Automation pipeline diagram'}
          nodes={workflowNodes}
          variant="gradient"
          caption={lang === 'ar'
            ? 'من البيانات إلى النتائج — أنظمة ذكية تربط كل مرحلة من عملياتك.'
            : 'From data to outcomes — intelligent systems connecting every stage of your operations.'}
        />
      </div>
    </section>
  );
}

export default CapabilitiesMarqueeSection;
