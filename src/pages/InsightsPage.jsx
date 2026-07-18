import { useMemo, useState } from 'react';
import { useI18n } from '../i18n/I18nProvider';
import Footer from '../components/Footer';
import Header from '../components/Header';
import InsightCard from '../components/insights/InsightCard';
import SEO from '../components/SEO';
import { PAGES } from '../config/seo';
import { useInsights } from '../hooks/useInsights';
import { INSIGHT_CATEGORIES, getBilingualInsightCategory } from '../data/insights/insightsData.js';
import {
  filterAndSortInsights,
  getInsightPath,
} from '../utils/content/insights';

function InsightsPage() {
  const [activeCategory, setActiveCategory] = useState(INSIGHT_CATEGORIES.all);
  const { articles: cmsInsights } = useInsights();
  const { t, lang, dir } = useI18n();

  const categories = useMemo(
    () => Object.values(INSIGHT_CATEGORIES),
    []
  );

  const insights = useMemo(() => {
    if (cmsInsights) {
      if (activeCategory === INSIGHT_CATEGORIES.all) {
        return [...cmsInsights].sort(
          (a, b) =>
            (a.displayOrder ?? 0) - (b.displayOrder ?? 0) ||
            new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0)
        );
      }
      return cmsInsights.filter((item) => item.category === activeCategory);
    }
    return filterAndSortInsights(activeCategory, 'newest');
  }, [activeCategory, cmsInsights]);

  return (
    <>
      <SEO {...PAGES.insights} breadcrumbItems={[
        { name: lang === 'ar' ? 'الرئيسية' : 'Home', url: '/' },
        { name: t('insights.pageTitle'), url: '/insights' },
      ]} />
      <Header />
      <main className="case-studies-page" dir={dir}>
        <section className="case-studies-page-hero">
          <div className="case-studies-page-hero-content">
            <h1 className="case-studies-page-title">{t('insights.pageTitle')}</h1>
            <p className="case-studies-page-intro">
              {t('insights.pageIntro')}
            </p>
          </div>
        </section>

        <section className="case-studies-page-listing">
          <div className="case-studies-page-content">
            <div
              className="case-studies-filter-bar"
              role="group"
              aria-label={t('insights.filterAriaLabel')}
            >
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`case-studies-filter-button ${activeCategory === category ? 'case-studies-filter-button--active' : ''}`}
                  onClick={() => setActiveCategory(category)}
                  aria-pressed={activeCategory === category}
                >
                  {getBilingualInsightCategory(category, lang)}
                </button>
              ))}
            </div>

            <div className="insights-grid">
              {insights.map((insight, index) => (
                <InsightCard
                  key={insight.slug}
                  href={getInsightPath(insight.slug)}
                  insight={insight}
                  isVisible
                  transitionDelay={`${index * 80}ms`}
                />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default InsightsPage;
