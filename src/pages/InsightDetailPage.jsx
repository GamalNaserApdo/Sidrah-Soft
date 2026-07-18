import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useI18n } from '../i18n/I18nProvider';
import Footer from '../components/Footer';
import Header from '../components/Header';
import SEO from '../components/SEO';
import { useInsight } from '../hooks/useInsights';
import { getInsightBySlug, getInsightsIndexPath } from '../utils/content/insights';

const PLACEHOLDER_IMAGE = '/assets/insights/placeholder.svg';

function formatDate(dateValue, lang) {
  if (!dateValue) return '';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function InsightDetailPage() {
  const { slug } = useParams();
  const { article: cmsArticle, loading, error } = useInsight(slug);
  const { t, lang, dir } = useI18n();

  const article = useMemo(() => {
    if (cmsArticle) return cmsArticle;
    const fallback = getInsightBySlug(slug);
    if (!fallback) return null;
    return {
      id: fallback.id,
      slug: fallback.slug,
      title: fallback.title,
      excerpt: fallback.excerpt,
      category: fallback.category,
      authorName: '',
      body: '',
      coverImage: fallback.coverImage || PLACEHOLDER_IMAGE,
      publishedAt: fallback.publishDate,
      readTime: parseInt(fallback.readingTime, 10) || null,
      seo: fallback.seo || { title: fallback.title, description: fallback.excerpt },
    };
  }, [cmsArticle, slug]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="case-studies-page" dir={dir}>
          <section className="case-studies-page-hero">
            <div className="case-studies-page-hero-content">
              <p className="case-studies-page-intro">{t('insights.loading')}</p>
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  if (!article) {
    return (
      <>
        <SEO title={`${t('insights.notFoundTitle')} | Sidrah Soft`} description={t('insights.notFoundText')} />
        <Header />
        <main className="case-studies-page" dir={dir}>
          <section className="case-studies-page-hero">
            <div className="case-studies-page-hero-content">
              <h1 className="case-studies-page-title">{t('insights.notFoundTitle')}</h1>
              <p className="case-studies-page-intro">
                {t('insights.notFoundText')}
              </p>
              <Link to={getInsightsIndexPath()} className="insights-cta">
                {t('insights.backToInsights')}
              </Link>
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  const coverImage = article.coverImage || PLACEHOLDER_IMAGE;

  return (
    <>
      <SEO
        title={article.seo?.title || `${article.title} | Sidrah Soft`}
        description={article.seo?.description || article.excerpt}
        ogTitle={article.seo?.og_title || article.seo?.title || article.title}
        ogDescription={article.seo?.og_description || article.seo?.description || article.excerpt}
        ogImage={article.seo?.og_image?.url || article.coverImage}
        canonical={article.seo?.canonical_url || `/insights/${article.slug}`}
        robotsIndex={article.seo?.robots_index}
        robotsFollow={article.seo?.robots_follow}
        articleData={{
          title: article.title,
          description: article.excerpt,
          datePublished: article.publishedAt,
          author: article.authorName,
        }}
        breadcrumbItems={[
          { name: lang === 'ar' ? 'الرئيسية' : 'Home', url: '/' },
          { name: t('insights.pageTitle'), url: '/insights' },
          { name: article.title },
        ]}
      />
      <Header />
      <main className="case-studies-page" dir={dir}>
        <article>
          <section className="case-studies-page-hero">
            <div className="case-studies-page-hero-content">
              <span className="insight-card__topic">{article.category}</span>
              <h1 className="case-studies-page-title">{article.title}</h1>
              <div className="case-studies-page-intro" style={{ marginTop: '1rem' }}>
                {article.authorName && (
                  <span>{t('insights.byAuthor', { author: article.authorName })}</span>
                )}
                {article.publishedAt && (
                  <span style={{ marginLeft: '1rem' }}>
                    {formatDate(article.publishedAt, lang)}
                  </span>
                )}
                {article.readTime && (
                  <span style={{ marginLeft: '1rem' }}>
                    {t('insights.minRead', { minutes: article.readTime })}
                  </span>
                )}
              </div>
            </div>
          </section>

          <section className="case-studies-page-listing">
            <div className="case-studies-page-content">
              {coverImage && (
                <img
                  src={coverImage}
                  alt={article.title}
                  className="insight-detail-image"
                  style={{
                    width: '100%',
                    maxHeight: '24rem',
                    objectFit: 'cover',
                    borderRadius: '0.5rem',
                    marginBottom: '2rem',
                  }}
                  onError={(e) => {
                    e.currentTarget.src = PLACEHOLDER_IMAGE;
                  }}
                />
              )}

              <p
                className="insight-card__description"
                style={{ fontSize: '1.125rem', marginBottom: '2rem' }}
              >
                {article.excerpt}
              </p>

              {article.body ? (
                <div
                  className="insight-detail-body"
                  style={{
                    color: '#f2f2f2',
                    lineHeight: 1.7,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {article.body}
                </div>
              ) : (
                <p className="insight-card__description">
                  {t('insights.comingSoon')}
                </p>
              )}

              <div style={{ marginTop: '3rem' }}>
                <Link to={getInsightsIndexPath()} className="insights-cta">
                  {lang === 'ar' ? '→' : '←'} {t('insights.backToInsights')}
                </Link>
              </div>
            </div>
          </section>
        </article>
      </main>
      <Footer />
    </>
  );
}

export default InsightDetailPage;
