import { useMemo } from 'react';
import { useCaseStudies } from '../../hooks/useCaseStudies';
import { useHomepageConfig } from '../../hooks/useHomepageConfig';
import { useI18n } from '../../i18n/I18nProvider.jsx';
import getBilingual from '../../utils/getBilingual';
import { getFeaturedCaseStudies } from '../../utils/content/caseStudies';
import SectionHeading from '../ui/SectionHeading';

function CaseStudiesSection() {
  const { caseStudies: cmsCaseStudies } = useCaseStudies({
    filters: { show_on_homepage: true },
  });
  const { config } = useHomepageConfig();
  const { lang } = useI18n();

  const allStudies = useMemo(
    () => cmsCaseStudies ?? getFeaturedCaseStudies(5),
    [cmsCaseStudies]
  );

  const csHeading = config?.headings?.case_studies;
  const heading = lang === 'ar'
    ? (csHeading?.heading_ar || 'أعمال مختارة')
    : (csHeading?.heading_en || 'Selected Work');

  const description = lang === 'ar'
    ? (csHeading?.description_ar || 'نظرة على أنظمة بنيناها لعملائنا في التعليم والمؤسسات والأعمال.')
    : (csHeading?.description_en || 'A look at systems we have built for clients across education, enterprise, and business operations.');

  const featuredStudy = useMemo(() => {
    const featured = allStudies.find((s) => s.featured || s.is_featured);
    return featured || allStudies[0];
  }, [allStudies]);

  const supportingStudies = useMemo(
    () => allStudies.filter((s) => s !== featuredStudy).slice(0, 4),
    [allStudies, featuredStudy]
  );

  if (!featuredStudy) return null;

  const featuredTechnologies = featuredStudy.technologies || [];
  const featuredMetrics = featuredStudy.metrics || [];
  const featuredUrl = featuredStudy.projectUrl || featuredStudy.project_url || '';
  const featuredOpenInNewTab = featuredStudy.openInNewTab ?? true;
  const featuredIndustry = (lang === 'ar' && featuredStudy.industry_ar) ? featuredStudy.industry_ar : (featuredStudy.industry || (lang === 'ar' ? 'دراسة حالة' : 'Case Study'));
  const featuredTitle = (lang === 'ar' && featuredStudy.title_ar) ? featuredStudy.title_ar : (featuredStudy.title || featuredStudy.industry);
  const featuredSummary = (lang === 'ar' && featuredStudy.excerpt_ar) ? featuredStudy.excerpt_ar : (featuredStudy.excerpt || featuredStudy.outcome || featuredStudy.solution || '');
  const featuredClient = featuredStudy.clientName || '';
  const featuredYear = featuredStudy.projectYear || '';

  const FeaturedTag = featuredUrl ? 'a' : 'article';
  const featuredLinkProps = featuredUrl
    ? {
        href: featuredUrl,
        target: featuredOpenInNewTab ? '_blank' : undefined,
        rel: featuredOpenInNewTab ? 'noopener noreferrer' : undefined,
        'aria-label': `${lang === 'ar' ? 'عرض دراسة الحالة' : 'View case study'}: ${featuredTitle}${featuredOpenInNewTab ? ` ${lang === 'ar' ? '(يفتح في نافذة جديدة)' : '(opens in new tab)'}` : ''}`,
      }
    : {};

  return (
    <section id="case-studies" className="case-studies-section" aria-labelledby="case-studies-heading">
      <div className="case-studies-content">
        <SectionHeading
          id="case-studies-heading"
          title={heading}
          description={description}
          className="case-studies-heading-block motion-clip-reveal is-visible"
        />

        <div className="case-studies-showcase">
          <FeaturedTag
            className="case-study-featured card-base card-surface-premium card-edge-purple card-hover-glow card-padding-lg motion-scale-in is-visible"
            {...featuredLinkProps}
          >
            <div className="case-study-featured__topline">
              <span className="case-study-featured__badge">
                {lang === 'ar' ? 'مشروع مميز' : 'Featured Project'}
              </span>
              <span className="case-study-featured__number" aria-hidden="true">01</span>
            </div>
            <div className="case-study-featured__body">
              <span className="case-study-featured__category">{featuredIndustry}</span>
              <h3 className="case-study-featured__title">{featuredTitle}</h3>
              {featuredClient && (
                <p className="case-study-featured__client">
                  {featuredClient}{featuredYear && ` · ${featuredYear}`}
                </p>
              )}
              <p className="case-study-featured__summary">{featuredSummary}</p>
              {featuredTechnologies.length > 0 && (
                <div className="case-study-featured__tech" role="list" aria-label={lang === 'ar' ? 'التقنيات' : 'Technologies'}>
                  {featuredTechnologies.map((tech) => (
                    <span key={tech} className="case-study-tech-chip" role="listitem">{tech}</span>
                  ))}
                </div>
              )}
              {featuredMetrics.length > 0 && (
                <ul className="case-study-featured__metrics">
                  {featuredMetrics.map((metric) => (
                    <li key={metric} className="case-study-featured__metric">{metric}</li>
                  ))}
                </ul>
              )}
              {featuredUrl && (
                <span className="case-study-featured__cta">
                  {lang === 'ar' ? 'عرض المشروع' : 'View Project'}
                  <span className="case-study-featured__cta-arrow" aria-hidden="true">→</span>
                </span>
              )}
            </div>
          </FeaturedTag>

          <div className="case-study-supporting">
            {supportingStudies.map((study, idx) => {
              const tech = study.technologies || [];
              const url = study.projectUrl || study.project_url || '';
              const openInNewTab = study.openInNewTab ?? true;
              const title = (lang === 'ar' && study.title_ar) ? study.title_ar : (study.title || study.industry);
              const summary = (lang === 'ar' && study.excerpt_ar) ? study.excerpt_ar : (study.excerpt || study.outcome || '');
              const industry = (lang === 'ar' && study.industry_ar) ? study.industry_ar : (study.industry || '');
              const CardTag = url ? 'a' : 'article';
              const linkProps = url
                ? {
                    href: url,
                    target: openInNewTab ? '_blank' : undefined,
                    rel: openInNewTab ? 'noopener noreferrer' : undefined,
                    'aria-label': `${lang === 'ar' ? 'عرض دراسة الحالة' : 'View case study'}: ${title}${openInNewTab ? ` ${lang === 'ar' ? '(يفتح في نافذة جديدة)' : '(opens in new tab)'}` : ''}`,
                  }
                : {};

              return (
                <CardTag
                  key={study.slug || idx}
                  className={`case-study-summary card-base card-surface-solid card-edge-gold card-hover-lift card-padding-md motion-fade-up is-visible stagger-${Math.min(idx + 1, 6)}`}
                  {...linkProps}
                >
                  <span className="case-study-summary__category">{industry}</span>
                  <h4 className="case-study-summary__title">{title}</h4>
                  <p className="case-study-summary__text">{summary}</p>
                  {tech.length > 0 && (
                    <div className="case-study-summary__tech">
                      {tech.map((t) => (
                        <span key={t} className="case-study-tech-chip case-study-tech-chip--compact">{t}</span>
                      ))}
                    </div>
                  )}
                  {url && (
                    <span className="case-study-summary__cta">
                      {lang === 'ar' ? 'التفاصيل' : 'Details'}
                      <span className="case-study-summary__cta-arrow" aria-hidden="true">→</span>
                    </span>
                  )}
                </CardTag>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default CaseStudiesSection;
