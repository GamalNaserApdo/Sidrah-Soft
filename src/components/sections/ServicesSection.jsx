import { useI18n } from '../../i18n/I18nProvider.jsx';
import { useServices } from '../../hooks/useServices';
import SectionHeading from '../ui/SectionHeading';
import getBilingual from '../../utils/getBilingual';

const WebIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <line x1="2" y1="9" x2="22" y2="9" />
    <line x1="6" y1="2" x2="6" y2="6" />
    <line x1="10" y1="2" x2="10" y2="6" />
  </svg>
);

const MobileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="2" width="12" height="20" rx="3" />
    <line x1="10" y1="18" x2="14" y2="18" />
  </svg>
);

const ErpIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <line x1="10" y1="6.5" x2="14" y2="6.5" />
    <line x1="6.5" y1="10" x2="6.5" y2="14" />
    <line x1="17.5" y1="10" x2="17.5" y2="14" />
    <line x1="10" y1="17.5" x2="14" y2="17.5" />
  </svg>
);

const AiIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="2" />
    <circle cx="5" cy="12" r="2" />
    <circle cx="19" cy="12" r="2" />
    <circle cx="12" cy="19" r="2" />
    <line x1="12" y1="7" x2="12" y2="17" />
    <line x1="7" y1="12" x2="17" y2="12" />
    <line x1="6.5" y1="10.5" x2="17.5" y2="13.5" />
    <line x1="6.5" y1="13.5" x2="17.5" y2="10.5" />
  </svg>
);

const AutomationIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12h12" />
    <path d="M16 8l4 4-4 4" />
    <path d="M12 6v12" />
  </svg>
);

const fallbackServices = [
  {
    slug: 'web-applications',
    title: 'Web Applications',
    title_ar: 'تطبيقات الويب',
    description: 'Custom web platforms built for scale, performance, and long-term growth.',
    description_ar: 'منصات ويب مخصصة مبنية للتوسع والأداء والنمو طويل الأمد.',
    problem: 'Legacy systems that don\'t scale',
    problem_ar: 'أنظمة قديمة لا تتوسع',
    automation: 'Modern web architecture',
    automation_ar: 'بنية ويب حديثة',
    outcome: 'Scalable digital platforms',
    outcome_ar: 'منصات رقمية قابلة للتوسع',
    Icon: WebIcon,
  },
  {
    slug: 'mobile-applications',
    title: 'Mobile Applications',
    title_ar: 'تطبيقات الجوال',
    description: 'Native and cross-platform apps for iOS and Android.',
    description_ar: 'تطبيقات أصلية وعبر المنصات لنظامي iOS و Android.',
    problem: 'Disconnected mobile experiences',
    problem_ar: 'تجارب جوال غير متصلة',
    automation: 'Cross-platform development',
    automation_ar: 'تطوير عبر المنصات',
    outcome: 'Unified mobile presence',
    outcome_ar: 'حضور جوال موحد',
    Icon: MobileIcon,
  },
  {
    slug: 'erp-solutions',
    title: 'ERP Solutions',
    title_ar: 'حلول تخطيط الموارد',
    description: 'Integrated systems that connect operations, finance, and data.',
    description_ar: 'أنظمة متكاملة تربط العمليات والمالية والبيانات.',
    problem: 'Siloed operations & data',
    problem_ar: 'عمليات وبيانات معزولة',
    automation: 'Centralized ERP integration',
    automation_ar: 'تكامل مركزي لتخطيط الموارد',
    outcome: 'Connected business operations',
    outcome_ar: 'عمليات تجارية متصلة',
    Icon: ErpIcon,
  },
  {
    slug: 'ai-solutions',
    title: 'AI Solutions',
    title_ar: 'حلول الذكاء الاصطناعي',
    description: 'Intelligent systems that automate decisions and surface insights.',
    description_ar: 'أنظمة ذكية تؤتمت القرارات وتكشف الرؤى.',
    problem: 'Manual decisions & blind spots',
    problem_ar: 'قرارات يدوية ونقاط عمياء',
    automation: 'AI-powered intelligence',
    automation_ar: 'ذكاء مدعوم بالذكاء الاصطناعي',
    outcome: 'Automated, data-driven decisions',
    outcome_ar: 'قرارات مؤتمتة ومدفوعة بالبيانات',
    Icon: AiIcon,
  },
  {
    slug: 'automation-solutions',
    title: 'Automation Solutions',
    title_ar: 'حلول الأتمتة',
    description: 'Workflow automation that reduces cost and increases speed.',
    description_ar: 'أتمتة سير العمل تقلل التكلفة وتزيد السرعة.',
    problem: 'Repetitive manual workflows',
    problem_ar: 'سير عمل يدوي متكرر',
    automation: 'End-to-end automation',
    automation_ar: 'أتمتة من البداية إلى النهاية',
    outcome: 'Reduced cost, accelerated delivery',
    outcome_ar: 'تكلفة مخفضة وتسليم معجل',
    Icon: AutomationIcon,
  },
];

function getServiceContent(service, lang) {
  if (service.name || service.shortDescription) {
    const name = service.name;
    const shortDesc = service.shortDescription;
    const isAr = lang === 'ar';
    return {
      title: isAr
        ? ((name?.ar || name?.en || service.title || ''))
        : (getBilingual(name, lang) || service.title || ''),
      description: isAr
        ? ((shortDesc?.ar || shortDesc?.en || service.description || ''))
        : (getBilingual(shortDesc, lang) || service.description || ''),
    };
  }
  return {
    title: (lang === 'ar' && service.title_ar) ? service.title_ar : (service.title || ''),
    description: (lang === 'ar' && service.description_ar) ? service.description_ar : (service.description || ''),
  };
}

function getServiceCta(service, lang) {
  const cta = service.cta;
  const fallbackLabel = lang === 'ar' ? 'ابدأ محادثة' : 'Start a conversation';

  if (!cta || typeof cta !== 'object') {
    return { label: fallbackLabel, href: '#contact' };
  }

  const labelObj = cta.label;
  const isAr = lang === 'ar';
  const label = isAr
    ? (labelObj?.ar || labelObj?.en || fallbackLabel)
    : (getBilingual(labelObj, lang) || fallbackLabel);

  return {
    label,
    href: cta.url || cta.href || '#contact',
  };
}

function ServiceIcon({ service, title }) {
  const IconComponent = service.Icon || null;

  return (
    <div className="service-visual__icon" aria-hidden="true">
      {service.iconUrl ? (
        <img
          src={service.iconUrl}
          alt=""
          loading="lazy"
          decoding="async"
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        IconComponent && <IconComponent title={title} />
      )}
    </div>
  );
}

function ServiceFlow({ service, lang }) {
  if (!service.problem && !service.automation && !service.outcome) return null;

  const problemVal = (lang === 'ar' && service.problem_ar) ? service.problem_ar : service.problem;
  const automationVal = (lang === 'ar' && service.automation_ar) ? service.automation_ar : service.automation;
  const outcomeVal = (lang === 'ar' && service.outcome_ar) ? service.outcome_ar : service.outcome;

  const steps = [
    problemVal && { label: lang === 'ar' ? 'تحدي' : 'Problem', value: problemVal },
    automationVal && { label: lang === 'ar' ? 'حل' : 'Automation', value: automationVal },
    outcomeVal && { label: lang === 'ar' ? 'نتيجة' : 'Outcome', value: outcomeVal },
  ].filter(Boolean);

  return (
    <div className="service-spotlight__flow">
      {steps.map((step, index) => (
        <div key={step.label} className="service-spotlight__flow-step">
          <span className="service-spotlight__flow-label">{step.label}</span>
          <span className="service-spotlight__flow-value">{step.value}</span>
          {index < steps.length - 1 && <span className="service-spotlight__flow-arrow" aria-hidden="true">→</span>}
        </div>
      ))}
    </div>
  );
}

function ServicesSection() {
  const { lang } = useI18n();
  const { services: cmsServices } = useServices();
  const displayServices = cmsServices || fallbackServices;
  const orderedServices = [...displayServices].sort(
    (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
  );
  const featuredService = orderedServices.find((service) => service.isFeatured) || orderedServices[0];
  const supportingServices = orderedServices.filter((service) => service !== featuredService);
  const heading = lang === 'ar' ? 'الخدمات' : 'Services';
  const description = lang === 'ar'
    ? 'من المنصات المخصصة إلى الأتمتة الذكية، نبني الأنظمة التي تمكّن المؤسسات الحديثة.'
    : 'From custom platforms to intelligent automation, we build the systems that power modern organizations.';

  if (!featuredService) return null;

  const featuredContent = getServiceContent(featuredService, lang);
  const featuredCta = getServiceCta(featuredService, lang);

  return (
    <section id="services" className="services-section" aria-labelledby="services-heading">
      <div className="services-content">
        <SectionHeading
          id="services-heading"
          index="04"
          eyebrow={lang === 'ar' ? 'ما نقدمه' : 'What We Do'}
          title={heading}
          description={description}
          className="services-heading-block motion-clip-reveal is-visible"
        />
        <div className="services-showcase">
          <article className="service-spotlight card-base card-surface-premium card-edge-purple card-hover-glow card-padding-lg motion-scale-in is-visible">
            <div className="service-spotlight__topline">
              <span className="service-spotlight__label">{lang === 'ar' ? 'خدمة مميزة' : 'Featured Service'}</span>
              <ServiceIcon service={featuredService} title={featuredContent.title} />
            </div>
            <div className="service-spotlight__body">
              <h3 className="service-spotlight__title">{featuredContent.title}</h3>
              <p className="service-spotlight__description">{featuredContent.description}</p>
              <ServiceFlow service={featuredService} lang={lang} />
              <a className="service-spotlight__cta" href={featuredCta.href}>
                <span>{featuredCta.label}</span>
                <span className="service-spotlight__cta-arrow" aria-hidden="true">→</span>
              </a>
            </div>
          </article>
          <div className="services-supporting">
            {supportingServices.map((service, index) => {
              const content = getServiceContent(service, lang);
              const key = service.slug || service.title || index;

              return (
                <article
                  key={key}
                  className={`service-feature card-base card-surface-solid card-edge-purple card-hover-lift card-padding-md motion-fade-up is-visible stagger-${Math.min(index + 1, 6)}`}
                >
                  <ServiceIcon service={service} title={content.title} />
                  <h3 className="service-feature__title">{content.title}</h3>
                  <p className="service-feature__description">{content.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ServicesSection;
