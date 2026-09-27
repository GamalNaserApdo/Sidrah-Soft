import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Header';
import Footer from '../Footer';
import MagneticButton from '../MagneticButton';
import SEO from '../SEO';
import { useI18n } from '../../i18n/I18nProvider.jsx';
import { useStaticPageSEO } from '../../hooks/useStaticPageSEO';
import { useAIAutomation } from '../../hooks/useAIAutomation';
import DynamicFormRenderer from '../forms/DynamicFormRenderer';

function useInView(threshold = 0.15, rootMargin = '0px 0px -10% 0px') {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotionQuery.matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    const element = sectionRef.current;
    if (element) observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [threshold, rootMargin]);

  return { sectionRef, isVisible };
}

/**
 * Resolve a CMS bilingual field → i18n fallback.
 * Returns CMS value if populated, otherwise the i18n fallback.
 */
function cmsOr(cmsValue, fallback) {
  return (cmsValue && cmsValue.trim()) ? cmsValue : fallback;
}

/**
 * Resolve CMS items for a specific section → i18n fallback.
 * Returns an array of {title, desc} objects.
 */
function resolveItems(cmsItems, section, isAr, t, i18nKey) {
  const filtered = (cmsItems || []).filter((item) => item.section === section);
  if (filtered.length > 0) {
    return filtered.map((item) => ({
      title: cmsOr(isAr ? item.title_ar : item.title_en, ''),
      desc: cmsOr(isAr ? item.description_ar : item.description_en, ''),
    }));
  }
  // Fallback to i18n
  return t(i18nKey) || [];
}

function AIAutomationHero({ cms, t, isAr }) {
  const { sectionRef, isVisible } = useInView(0.2, '0px 0px 0px 0px');
  const navigate = useNavigate();

  const handleContactClick = () => {
    const dest = cms?.hero?.cta_destination || '/#contact';
    if (dest.startsWith('/#')) {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(dest.slice(2));
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
    } else if (dest.startsWith('/')) {
      navigate(dest);
    }
  };

  const handleSecondaryClick = () => {
    const dest = cms?.hero?.secondary_cta_destination || '/#contact';
    if (dest.startsWith('/#')) {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(dest.slice(2));
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
    } else if (dest.startsWith('/')) {
      navigate(dest);
    }
  };

  return (
    <section ref={sectionRef} className="ai-automation-hero">
      <div className="ai-automation-hero__content">
        <span className={`ai-automation-hero__eyebrow ${isVisible ? 'is-visible' : ''}`}>
          {cmsOr(isAr ? cms?.hero?.eyebrow_ar : cms?.hero?.eyebrow_en, t('aiAutomation.heroEyebrow'))}
        </span>
        <h1 className={`ai-automation-hero__title ${isVisible ? 'is-visible' : ''}`}>
          {cmsOr(isAr ? cms?.hero?.title_ar : cms?.hero?.title_en, t('aiAutomation.heroTitle'))}
        </h1>
        <p className={`ai-automation-hero__subtitle ${isVisible ? 'is-visible' : ''}`}>
          {cmsOr(isAr ? cms?.hero?.subtitle_ar : cms?.hero?.subtitle_en, t('aiAutomation.heroSubtitle'))}
        </p>
        <div className={`ai-automation-hero__cta-group ${isVisible ? 'is-visible' : ''}`}>
          <MagneticButton className="ai-automation-hero__cta ai-automation-hero__cta--primary" onClick={handleContactClick}>
            {cmsOr(isAr ? cms?.hero?.cta_label_ar : cms?.hero?.cta_label_en, t('aiAutomation.heroCta'))}
          </MagneticButton>
          <MagneticButton className="ai-automation-hero__cta ai-automation-hero__cta--secondary" onClick={handleSecondaryClick}>
            {cmsOr(isAr ? cms?.hero?.secondary_cta_label_ar : cms?.hero?.secondary_cta_label_en, t('aiAutomation.heroCtaSecondary'))}
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}

function CardSection({ cms, cmsItems, sectionKey, sectionTitleKey, sectionDescKey, itemsKey, isAr, t, alt, gridClass, cardClass }) {
  const { sectionRef, isVisible } = useInView();
  const section = cms?.sections?.[sectionKey] || {};
  const items = resolveItems(cmsItems, sectionKey, isAr, t, `aiAutomation.${itemsKey}`);

  if (items.length === 0) return null;

  return (
    <section ref={sectionRef} className={`ai-automation-section${alt ? ' ai-automation-section--alt' : ''}`}>
      <div className="ai-automation-section__content">
        <h2 className={`ai-automation-section__title ${isVisible ? 'is-visible' : ''}`}>
          {cmsOr(isAr ? section.title_ar : section.title_en, t(`aiAutomation.${sectionTitleKey}`))}
        </h2>
        <p className={`ai-automation-section__description ${isVisible ? 'is-visible' : ''}`}>
          {cmsOr(isAr ? section.desc_ar : section.desc_en, t(`aiAutomation.${sectionDescKey}`))}
        </p>
        <div className={`ai-automation-grid ${gridClass}`}>
          {items.map((item, i) => (
            <article
              key={i}
              className={`ai-automation-card ${cardClass} ${isVisible ? 'is-visible' : ''}`}
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <h3 className="ai-automation-card__title">{item.title}</h3>
              <p className="ai-automation-card__desc">{item.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProcessSection({ cms, cmsSteps, isAr, t }) {
  const { sectionRef, isVisible } = useInView();
  const section = cms?.sections?.process || {};

  // Resolve process steps: CMS → i18n fallback
  let steps;
  if (cmsSteps && cmsSteps.length > 0) {
    steps = cmsSteps.map((step) => ({
      number: step.step_number,
      title: cmsOr(isAr ? step.title_ar : step.title_en, ''),
      desc: cmsOr(isAr ? step.description_ar : step.description_en, ''),
    }));
  } else {
    steps = t('aiAutomation.process') || [];
  }

  if (steps.length === 0) return null;

  return (
    <section ref={sectionRef} className="ai-automation-section">
      <div className="ai-automation-section__content">
        <h2 className={`ai-automation-section__title ${isVisible ? 'is-visible' : ''}`}>
          {cmsOr(isAr ? section.title_ar : section.title_en, t('aiAutomation.processSectionTitle'))}
        </h2>
        <p className={`ai-automation-section__description ${isVisible ? 'is-visible' : ''}`}>
          {cmsOr(isAr ? section.desc_ar : section.desc_en, t('aiAutomation.processSectionDescription'))}
        </p>
        <div className="ai-automation-process">
          {steps.map((step, i) => (
            <div
              key={i}
              className={`ai-automation-process__step ${isVisible ? 'is-visible' : ''}`}
              style={{ transitionDelay: `${i * 50}ms` }}
            >
              <span className="ai-automation-process__number">{step.number}</span>
              <h3 className="ai-automation-process__title">{step.title}</h3>
              <p className="ai-automation-process__desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection({ cms, cmsFaqs, isAr, t }) {
  const { sectionRef, isVisible } = useInView();
  const section = cms?.sections?.faq || {};
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = useCallback((i) => {
    setOpenIndex((prev) => (prev === i ? null : i));
  }, []);

  // Resolve FAQs: CMS → i18n fallback
  let faqs;
  if (cmsFaqs && cmsFaqs.length > 0) {
    faqs = cmsFaqs.map((faq) => ({
      q: cmsOr(isAr ? faq.question_ar : faq.question_en, ''),
      a: cmsOr(isAr ? faq.answer_ar : faq.answer_en, ''),
    }));
  } else {
    faqs = t('aiAutomation.faq') || [];
  }

  if (faqs.length === 0) return null;

  return (
    <section ref={sectionRef} className="ai-automation-section ai-automation-section--alt">
      <div className="ai-automation-section__content">
        <h2 className={`ai-automation-section__title ${isVisible ? 'is-visible' : ''}`}>
          {cmsOr(isAr ? section.title_ar : section.title_en, t('aiAutomation.faqSectionTitle'))}
        </h2>
        <div className="ai-automation-faq">
          {faqs.map((faq, i) => (
            <div key={i} className={`ai-automation-faq__item ${isVisible ? 'is-visible' : ''}`} style={{ transitionDelay: `${i * 40}ms` }}>
              <button
                className="ai-automation-faq__question"
                onClick={() => toggle(i)}
                aria-expanded={openIndex === i}
                aria-controls={`faq-answer-${i}`}
              >
                <span>{faq.q}</span>
                <span className="ai-automation-faq__icon" aria-hidden="true">
                  {openIndex === i ? '−' : '+'}
                </span>
              </button>
              <div
                id={`faq-answer-${i}`}
                className={`ai-automation-faq__answer ${openIndex === i ? 'is-open' : ''}`}
              >
                <p>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection({ cms, t, isAr }) {
  const { sectionRef, isVisible } = useInView(0.2, '0px 0px 0px 0px');
  const navigate = useNavigate();
  const cta = cms?.cta || {};

  const handleContactClick = () => {
    const dest = cta.button_destination || '/#contact';
    if (dest.startsWith('/#')) {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(dest.slice(2));
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
    } else if (dest.startsWith('/')) {
      navigate(dest);
    }
  };

  return (
    <section ref={sectionRef} className="ai-automation-cta">
      <div className={`ai-automation-cta__content ${isVisible ? 'is-visible' : ''}`}>
        <h2 className="ai-automation-cta__title">
          {cmsOr(isAr ? cta.title_ar : cta.title_en, t('aiAutomation.ctaTitle'))}
        </h2>
        <p className="ai-automation-cta__text">
          {cmsOr(isAr ? cta.text_ar : cta.text_en, t('aiAutomation.ctaText'))}
        </p>
        <MagneticButton className="ai-automation-cta__button" onClick={handleContactClick}>
          {cmsOr(isAr ? cta.button_label_ar : cta.button_label_en, t('aiAutomation.ctaButton'))}
        </MagneticButton>
      </div>
    </section>
  );
}

function AssignedFormSection({ isAr }) {
  const { sectionRef, isVisible } = useInView(0.1);
  return (
    <section ref={sectionRef} className="ai-automation-section ai-automation-section--alt">
      <div className="ai-automation-section__content">
        <div style={{ minHeight: 'auto' }}>
          {/* DynamicFormRenderer handles its own loading/error/empty states.
              If no active form is assigned to 'ai_automation', it renders nothing
              (returns null when formData is null after a 404). */}
          <DynamicFormRenderer target="ai_automation" />
        </div>
      </div>
    </section>
  );
}

function AIAutomationPage() {
  const { t, lang } = useI18n();
  const isAr = lang === 'ar';
  const { seo } = useStaticPageSEO('ai_automation', lang);
  const { data: cms } = useAIAutomation();

  // Resolve FAQs for structured data — uses the same source as visible content
  let faqs;
  if (cms?.faqs && cms.faqs.length > 0) {
    faqs = cms.faqs.map((faq) => ({
      q: cmsOr(isAr ? faq.question_ar : faq.question_en, ''),
      a: cmsOr(isAr ? faq.answer_ar : faq.answer_en, ''),
    }));
  } else {
    faqs = t('aiAutomation.faq') || [];
  }

  // FAQ structured data — only if FAQ content is visibly present
  const faqJsonLd = faqs && faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  } : null;

  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'AI Automation Services',
    provider: {
      '@type': 'Organization',
      name: 'Sidrah Soft',
      url: 'https://sidrahsoft.com',
    },
    serviceType: 'AI Automation',
    areaServed: { '@type': 'Country', name: 'Egypt' },
    description: seo.description,
  };

  const jsonLd = faqJsonLd ? [serviceJsonLd, faqJsonLd] : serviceJsonLd;

  return (
    <>
      <SEO
        {...seo}
        breadcrumbItems={[
          { name: isAr ? 'الرئيسية' : 'Home', url: '/' },
          { name: isAr ? 'أتمتة الذكاء الاصطناعي' : 'AI Automation', url: '/services/ai-automation' },
        ]}
        jsonLd={jsonLd}
      />
      <Header />
      <main className="ai-automation-page">
        <AIAutomationHero cms={cms} t={t} isAr={isAr} />
        <CardSection
          cms={cms} cmsItems={cms?.items} sectionKey="problems"
          sectionTitleKey="problemsSectionTitle" sectionDescKey="problemsSectionDescription"
          itemsKey="problems" isAr={isAr} t={t}
          gridClass="ai-automation-grid--2col"
        />
        <CardSection
          cms={cms} cmsItems={cms?.items} sectionKey="solutions"
          sectionTitleKey="solutionsSectionTitle" sectionDescKey="solutionsSectionDescription"
          itemsKey="solutions" isAr={isAr} t={t} alt
          gridClass="ai-automation-grid--3col"
          cardClass="ai-automation-card--accent"
        />
        <ProcessSection cms={cms} cmsSteps={cms?.process_steps} isAr={isAr} t={t} />
        <CardSection
          cms={cms} cmsItems={cms?.items} sectionKey="use_cases"
          sectionTitleKey="useCasesSectionTitle" sectionDescKey="useCasesSectionDescription"
          itemsKey="useCases" isAr={isAr} t={t} alt
          gridClass="ai-automation-grid--2col"
        />
        <CardSection
          cms={cms} cmsItems={cms?.items} sectionKey="why"
          sectionTitleKey="whySectionTitle" sectionDescKey="whySectionDescription"
          itemsKey="whyPoints" isAr={isAr} t={t}
          gridClass="ai-automation-grid--2col"
          cardClass="ai-automation-card--highlight"
        />
        <FAQSection cms={cms} cmsFaqs={cms?.faqs} isAr={isAr} t={t} />
        <CTASection cms={cms} t={t} isAr={isAr} />
        <AssignedFormSection isAr={isAr} />
      </main>
      <Footer />
    </>
  );
}

export default AIAutomationPage;
