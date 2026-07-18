import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useInsights } from '../../hooks/useInsights';
import { useHomepageConfig } from '../../hooks/useHomepageConfig';
import { useI18n } from '../../i18n/I18nProvider.jsx';
import getBilingual from '../../utils/getBilingual';
import { getFeaturedInsights, getInsightPath } from '../../utils/content/insights';
import SectionHeading from '../ui/SectionHeading';

function InsightsSection() {
  const { articles: cmsInsights } = useInsights({
    filters: { show_on_homepage: true },
  });
  const { config } = useHomepageConfig();
  const { lang } = useI18n();

  const allInsights = useMemo(() => {
    if (cmsInsights && cmsInsights.length > 0) return cmsInsights;
    return getFeaturedInsights(5);
  }, [cmsInsights]);

  const insHeading = config?.headings?.insights;
  const heading = lang === 'ar'
    ? (insHeading?.heading_ar || 'رؤى للنمو الرقمي')
    : (insHeading?.heading_en || 'Insights for digital growth');

  const description = lang === 'ar'
    ? (insHeading?.description_ar || 'وجهات نظر حول البرمجيات والأتمتة والذكاء الاصطناعي والأنظمة الرقمية القابلة للتوسع للمؤسسات التي تستعد للمستقبل.')
    : (insHeading?.description_en || 'Perspectives on software, automation, AI, and scalable digital systems for organizations preparing for the future.');

  const featuredInsight = useMemo(() => {
    const featured = allInsights.find((a) => a.featured || a.is_featured);
    return featured || allInsights[0];
  }, [allInsights]);

  const supportingInsights = useMemo(
    () => allInsights.filter((a) => a !== featuredInsight).slice(0, 4),
    [allInsights, featuredInsight]
  );

  if (!featuredInsight) return null;

  const featuredPath = getInsightPath(featuredInsight.slug);
  const featuredCategory = (lang === 'ar' && featuredInsight.category_ar) ? featuredInsight.category_ar : (featuredInsight.category || (lang === 'ar' ? 'رؤية' : 'Insight'));
  const featuredTitle = (lang === 'ar' && featuredInsight.title_ar) ? featuredInsight.title_ar : (featuredInsight.title || '');
  const featuredExcerpt = (lang === 'ar' && featuredInsight.excerpt_ar) ? featuredInsight.excerpt_ar : (featuredInsight.excerpt || '');
  const featuredAuthor = featuredInsight.authorName || '';
  const featuredReadTime = featuredInsight.readTime || featuredInsight.readingTime || '';
  const featuredDate = featuredInsight.publishedAt || featuredInsight.publishDate || '';

  return (
    <section id="insights" className="insights-section" aria-labelledby="insights-heading">
      <div className="insights-content">
        <SectionHeading
          id="insights-heading"
          index="09"
          eyebrow={lang === 'ar' ? 'رؤى' : 'Insights'}
          title={heading}
          description={description}
          className="insights-heading-block motion-clip-reveal is-visible"
        />

        <div className="insights-showcase">
          <Link
            to={featuredPath}
            className="insight-featured card-base card-surface-premium card-edge-tech card-hover-glow card-padding-lg motion-scale-in is-visible"
            aria-label={`${lang === 'ar' ? 'قراءة' : 'Read'}: ${featuredTitle}`}
          >
            <div className="insight-featured__topline">
              <span className="insight-featured__badge">
                {lang === 'ar' ? 'مقال مميز' : 'Featured Article'}
              </span>
              <span className="insight-featured__number" aria-hidden="true">01</span>
            </div>
            <div className="insight-featured__body">
              <span className="insight-featured__category">{featuredCategory}</span>
              <h3 className="insight-featured__title">{featuredTitle}</h3>
              <p className="insight-featured__excerpt">{featuredExcerpt}</p>
              <div className="insight-featured__meta">
                {featuredAuthor && (
                  <span className="insight-featured__author">{featuredAuthor}</span>
                )}
                {featuredReadTime && (
                  <span className="insight-featured__read-time" aria-hidden="true">·</span>
                )}
                {featuredReadTime && (
                  <span className="insight-featured__read-time">{featuredReadTime}</span>
                )}
              </div>
              <span className="insight-featured__cta">
                {lang === 'ar' ? 'اقرأ المقال' : 'Read Article'}
                <span className="insight-featured__cta-arrow" aria-hidden="true">→</span>
              </span>
            </div>
          </Link>

          <div className="insight-supporting">
            {supportingInsights.map((insight, idx) => {
              const path = getInsightPath(insight.slug);
              const category = (lang === 'ar' && insight.category_ar) ? insight.category_ar : (insight.category || '');
              const title = (lang === 'ar' && insight.title_ar) ? insight.title_ar : (insight.title || '');
              const excerpt = (lang === 'ar' && insight.excerpt_ar) ? insight.excerpt_ar : (insight.excerpt || '');

              return (
                <Link
                  key={insight.slug || idx}
                  to={path}
                  className={`insight-summary card-base card-surface-solid card-edge-purple card-hover-lift card-padding-md motion-fade-up is-visible stagger-${Math.min(idx + 1, 6)}`}
                  aria-label={`${lang === 'ar' ? 'قراءة' : 'Read'}: ${title}`}
                >
                  <span className="insight-summary__category">{category}</span>
                  <h4 className="insight-summary__title">{title}</h4>
                  <p className="insight-summary__excerpt">{excerpt}</p>
                  <span className="insight-summary__cta">
                    {lang === 'ar' ? 'اقرأ' : 'Read'}
                    <span className="insight-summary__cta-arrow" aria-hidden="true">→</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        <Link
          to="/insights"
          className="insights-view-all motion-fade-in is-visible"
          aria-label={lang === 'ar' ? 'عرض جميع الرؤى' : 'View all insights'}
        >
          {lang === 'ar' ? 'عرض جميع الرؤى' : 'View all insights'}
          <span aria-hidden="true"> →</span>
        </Link>
      </div>
    </section>
  );
}

export default InsightsSection;
