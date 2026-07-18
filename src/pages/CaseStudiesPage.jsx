import { useMemo, useState } from 'react';
import { useI18n } from '../i18n/I18nProvider';
import CaseStudyCard from '../components/caseStudies/CaseStudyCard';
import Footer from '../components/Footer';
import Header from '../components/Header';
import SEO from '../components/SEO';
import { PAGES } from '../config/seo';
import { useCaseStudies } from '../hooks/useCaseStudies';
import {
  CASE_STUDY_INDUSTRIES,
  filterAndSortCaseStudies,
  filterCMSCaseStudiesByIndustry,
  getIndustriesFromCMS,
} from '../utils/content/caseStudies';
import { getBilingualCaseStudyIndustry } from '../data/caseStudies/caseStudiesData.js';

function CaseStudiesPage() {
  const [activeIndustry, setActiveIndustry] = useState(
    CASE_STUDY_INDUSTRIES.all
  );
  const { caseStudies: cmsCaseStudies } = useCaseStudies();
  const { t, lang, dir } = useI18n();

  const industries = useMemo(
    () =>
      cmsCaseStudies
        ? getIndustriesFromCMS(cmsCaseStudies)
        : Object.values(CASE_STUDY_INDUSTRIES),
    [cmsCaseStudies]
  );

  const caseStudies = useMemo(() => {
    if (cmsCaseStudies) {
      return filterCMSCaseStudiesByIndustry(cmsCaseStudies, activeIndustry);
    }
    return filterAndSortCaseStudies(activeIndustry, 'newest');
  }, [activeIndustry, cmsCaseStudies]);

  return (
    <>
      <SEO {...PAGES.caseStudies} breadcrumbItems={[
        { name: lang === 'ar' ? 'الرئيسية' : 'Home', url: '/' },
        { name: t('caseStudies.pageTitle'), url: '/case-studies' },
      ]} />
      <Header />
      <main className="case-studies-page" dir={dir}>
        <section className="case-studies-page-hero">
          <div className="case-studies-page-hero-content">
            <h1 className="case-studies-page-title">{t('caseStudies.pageTitle')}</h1>
            <p className="case-studies-page-intro">
              {t('caseStudies.pageIntro')}
            </p>
          </div>
        </section>

        <section className="case-studies-page-listing">
          <div className="case-studies-page-content">
            <div
              className="case-studies-filter-bar"
              role="group"
              aria-label={t('caseStudies.filterAriaLabel')}
            >
              {industries.map((industry) => (
                <button
                  key={industry}
                  type="button"
                  className={`case-studies-filter-button ${activeIndustry === industry ? 'case-studies-filter-button--active' : ''}`}
                  onClick={() => setActiveIndustry(industry)}
                  aria-pressed={activeIndustry === industry}
                >
                  {getBilingualCaseStudyIndustry(industry, lang)}
                </button>
              ))}
            </div>

            <div className="case-studies-page-grid">
              {caseStudies.map((study, index) => (
                <CaseStudyCard
                  key={study.slug}
                  caseStudy={study}
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

export default CaseStudiesPage;
