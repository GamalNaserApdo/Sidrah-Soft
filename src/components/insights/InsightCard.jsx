import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nProvider';
import { getBilingualInsightCategory } from '../../data/insights/insightsData.js';

function InsightCard({
  insight,
  isVisible,
  transitionDelay = '0ms',
  className = '',
  href = null,
  externalUrl = null,
}) {
  const { lang } = useI18n();
  const title = lang === 'ar' && insight.title_ar ? insight.title_ar : insight.title;
  const excerpt = lang === 'ar' && insight.excerpt_ar ? insight.excerpt_ar : insight.excerpt;
  const category = insight.category_ar
    ? getBilingualInsightCategory(insight.category, lang)
    : insight.category;
  const cardContent = (
    <>
      <p className="insight-card__topic">{category}</p>
      <h3 className="insight-card__title">{title}</h3>
      <p className="insight-card__description">{excerpt}</p>
    </>
  );

  const baseClasses = `insight-card mouse-depth-card ${isVisible ? 'insight-card--visible' : ''} ${className}`;

  if (externalUrl) {
    return (
      <a
        href={externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={baseClasses}
        style={{ transitionDelay }}
      >
        {cardContent}
      </a>
    );
  }

  if (href) {
    return (
      <Link to={href} className={baseClasses} style={{ transitionDelay }}>
        {cardContent}
      </Link>
    );
  }

  return (
    <article className={baseClasses} style={{ transitionDelay }}>
      {cardContent}
    </article>
  );
}

export default InsightCard;
