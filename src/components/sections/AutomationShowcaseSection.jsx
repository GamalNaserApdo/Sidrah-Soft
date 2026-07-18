/**
 * AutomationShowcaseSection — Premium narrative automation flow showcase.
 *
 * Replaces the old WorkflowFlow-based section with a 5-phase narrative:
 * Receive → Understand → Act → Connect → Deliver
 *
 * Uses IntersectionObserver for scroll-triggered CSS reveals.
 * No external animation libraries. No GSAP. No Lenis.
 */

import { useEffect, useRef } from 'react';
import { useI18n } from '../../i18n/I18nProvider.jsx';
import SectionHeading from '../ui/SectionHeading';

const PHASE_ICONS = {
  receive: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7l9 6 9-6" />
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  ),
  understand: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" />
    </svg>
  ),
  act: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
    </svg>
  ),
  connect: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="6" cy="18" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="M8.5 6h7M6 8.5v7M18 8.5v7M8.5 18h7" />
    </svg>
  ),
  deliver: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  ),
};

function AutomationShowcaseSection() {
  const { lang, t } = useI18n();
  const sectionRef = useRef(null);
  const observerRef = useRef(null);

  const isAr = lang === 'ar';

  const phases = [
    {
      key: 'receive',
      number: '01',
      icon: PHASE_ICONS.receive,
      title: isAr ? 'استقبال الطلب' : 'Receive Request',
      desc: isAr
        ? 'وكيل الذكاء الاصطناعي يستقبل الطلب عبر البريد، الواتساب، أو النموذج الإلكتروني.'
        : 'The AI agent receives requests via email, WhatsApp, web forms, or API calls.',
      tag: isAr ? 'متعدد القنوات' : 'Multi-channel',
      variant: 'gold',
    },
    {
      key: 'understand',
      number: '02',
      icon: PHASE_ICONS.understand,
      title: isAr ? 'فهم السياق' : 'Understand Context',
      desc: isAr
        ? 'تحليل النية، تصنيف الأولوية، واستخراج البيانات الأساسية تلقائياً.'
        : 'Intent analysis, priority scoring, and automatic data extraction from unstructured input.',
      tag: isAr ? 'تحليل ذكي' : 'Intelligent Analysis',
      variant: 'ai',
    },
    {
      key: 'act',
      number: '03',
      icon: PHASE_ICONS.act,
      title: isAr ? 'تنفيذ الإجراءات' : 'Perform Actions',
      desc: isAr
        ? 'تنفيذ المهام تلقائياً: إنشاء سجلات، إرسال ردود، جدولة متابعات، وتحديث الحالات.'
        : 'Automated task execution: create records, send responses, schedule follow-ups, update statuses.',
      tag: isAr ? 'تنفيذ تلقائي' : 'Automated Execution',
      variant: 'accent',
    },
    {
      key: 'connect',
      number: '04',
      icon: PHASE_ICONS.connect,
      title: isAr ? 'ربط الأنظمة' : 'Connect Systems',
      desc: isAr
        ? 'مزامنة فورية مع CRM، ERP، قواعد البيانات، وأدوات التحليل في الوقت الفعلي.'
        : 'Real-time sync with CRM, ERP, databases, and analytics platforms across the stack.',
      tag: isAr ? 'تكامل كامل' : 'Full Integration',
      variant: 'tech',
    },
    {
      key: 'deliver',
      number: '05',
      icon: PHASE_ICONS.deliver,
      title: isAr ? 'تسليم النتائج' : 'Deliver Outcomes',
      desc: isAr
        ? 'تقارير جاهزة، رؤى actionable، وتسليم النتائج لأصحاب القرار — بدون تدخل يدوي.'
        : 'Ready reports, actionable insights, and outcomes delivered to decision-makers — no manual work.',
      tag: isAr ? 'نتائج فورية' : 'Instant Results',
      variant: 'gold',
    },
  ];

  const integrations = [
    { label: t('integration.crm'), icon: 'crm' },
    { label: t('integration.erp'), icon: 'erp' },
    { label: t('integration.email'), icon: 'email' },
    { label: t('integration.whatsapp'), icon: 'whatsapp' },
    { label: t('integration.database'), icon: 'database' },
    { label: t('integration.analytics'), icon: 'analytics' },
    { label: t('integration.api'), icon: 'api' },
    { label: t('integration.aiModels'), icon: 'ai' },
  ];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const revealElements = section.querySelectorAll('.auto-reveal');

    if (!('IntersectionObserver' in window)) {
      revealElements.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observerRef.current.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.15,
      }
    );

    revealElements.forEach((el) => observerRef.current.observe(el));

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, []);

  return (
    <section
      id="automation-showcase"
      ref={sectionRef}
      className="automation-showcase-section"
      aria-labelledby="automation-heading"
    >
      <div className="automation-showcase-content">
        <SectionHeading
          id="automation-heading"
          index="05"
          eyebrow={isAr ? 'أتمتة ذكية' : 'Intelligent Automation'}
          title={isAr ? 'وكيل ذكاء اصطناعي يعمل من البداية إلى النهاية' : 'An AI agent that works end-to-end'}
          description={isAr
            ? 'من استقبال الطلب إلى تسليم النتائج — وكيل ذكي يفهم، ينفذ، يربط، ويسلّم دون تدخل يدوي.'
            : 'From receiving the request to delivering outcomes — an intelligent agent that understands, acts, connects, and delivers without manual intervention.'}
          className="auto-reveal"
        />

        <div className="automation-journey">
          <div className="automation-journey__spine" aria-hidden="true" />
          {phases.map((phase, index) => (
            <div
              key={phase.key}
              className={`automation-phase automation-phase--${phase.variant} auto-reveal stagger-${Math.min(index + 1, 6)}`}
            >
              <div className="automation-phase__node" aria-hidden="true">
                <span className="automation-phase__number">{phase.number}</span>
                <span className="automation-phase__icon">{phase.icon}</span>
              </div>
              <div className="automation-phase__card card-base card-surface-premium card-edge-purple card-hover-glow">
                <div className="automation-phase__card-header">
                  <span className={`automation-phase__tag automation-phase__tag--${phase.variant}`}>{phase.tag}</span>
                </div>
                <h3 className="automation-phase__title">{phase.title}</h3>
                <p className="automation-phase__desc">{phase.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="automation-integrations auto-reveal">
          <p className="automation-integrations__label">
            {isAr ? 'أنظمة متكاملة' : 'Connected Systems'}
          </p>
          <div className="automation-integrations__grid">
            {integrations.map((item, idx) => (
              <span
                key={`int-${idx}`}
                className="automation-integration-chip"
              >
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default AutomationShowcaseSection;
