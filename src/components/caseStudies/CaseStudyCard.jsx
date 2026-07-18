import { useI18n } from '../../i18n/I18nProvider';

function CaseStudyCard({
  caseStudy,
  isVisible,
  transitionDelay = '0ms',
  variant = 'preview',
  className = '',
}) {
  const { t, lang } = useI18n();
  const isCompact = variant === 'compact';
  const technologies = caseStudy.technologies || [];
  const metrics = caseStudy.metrics || [];
  const projectUrl = caseStudy.projectUrl || '';

  const title = lang === 'ar' && caseStudy.title_ar ? caseStudy.title_ar : caseStudy.title;
  const excerpt = lang === 'ar' && caseStudy.excerpt_ar ? caseStudy.excerpt_ar : caseStudy.excerpt;
  const problem = lang === 'ar' && caseStudy.problem_ar ? caseStudy.problem_ar : caseStudy.problem;
  const solution = lang === 'ar' && caseStudy.solution_ar ? caseStudy.solution_ar : caseStudy.solution;
  const outcome = lang === 'ar' && caseStudy.outcome_ar ? caseStudy.outcome_ar : caseStudy.outcome;
  const industry = lang === 'ar' && caseStudy.industry_ar ? caseStudy.industry_ar : caseStudy.industry;

  const cardContent = (
    <>
      <p className="case-study-card__eyebrow">{t('caseStudy.eyebrow')}</p>

      {isCompact ? (
        <>
          <h3 className="case-study-card__category">{industry}</h3>
          <div className="case-study-card__story">
            <div className="case-study-card__story-step">
              <span className="case-study-card__story-label">{t('caseStudy.challenge')}</span>
              <span className="case-study-card__story-text">{problem}</span>
            </div>
            <div className="case-study-card__story-divider" aria-hidden="true">
              <span className="case-study-card__story-arrow">↓</span>
            </div>
            <div className="case-study-card__story-step">
              <span className="case-study-card__story-label">{t('caseStudy.solution')}</span>
              <span className="case-study-card__story-text">{solution}</span>
            </div>
            <div className="case-study-card__story-divider" aria-hidden="true">
              <span className="case-study-card__story-arrow">↓</span>
            </div>
            <div className="case-study-card__story-step case-study-card__story-step--outcome">
              <span className="case-study-card__story-label">{t('caseStudy.outcome')}</span>
              <span className="case-study-card__story-text">{outcome}</span>
            </div>
          </div>
          {technologies.length > 0 && (
            <div className="case-study-card__tech">
              {technologies.map((tech) => (
                <span key={tech} className="case-study-card__tech-tag">{tech}</span>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <h3 className="case-study-card__title">{title}</h3>
          {caseStudy.clientName && (
            <p className="case-study-card__client">
              {caseStudy.clientName}
              {caseStudy.projectYear && ` · ${caseStudy.projectYear}`}
            </p>
          )}
          <p className="case-study-card__excerpt">{excerpt}</p>
          {metrics.length > 0 && (
            <ul className="case-study-card__metrics">
              {metrics.map((metric) => (
                <li key={metric}>{metric}</li>
              ))}
            </ul>
          )}
        </>
      )}
    </>
  );

  const commonClasses = `case-study-card mouse-depth-card ${isVisible ? 'case-study-card--visible' : ''} ${className}`;

  if (projectUrl) {
    return (
      <a
        href={projectUrl}
        className={commonClasses}
        style={{ transitionDelay, textDecoration: 'none' }}
        target={caseStudy.openInNewTab ? '_blank' : undefined}
        rel={caseStudy.openInNewTab ? 'noopener noreferrer' : undefined}
      >
        {cardContent}
      </a>
    );
  }

  return (
    <article className={commonClasses} style={{ transitionDelay }}>
      {cardContent}
    </article>
  );
}

export default CaseStudyCard;
