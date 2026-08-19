import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { useI18n } from '../i18n/I18nProvider';
import { getProgramBySlug } from '../services/trainingApi';

function SecondaryProgramDetailPage() {
  const { programSlug } = useParams();
  const { lang, dir } = useI18n();
  const navigate = useNavigate();
  const isAr = lang === 'ar';

  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const data = await getProgramBySlug(programSlug);
        if (mounted) {
          setProgram(data);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err);
          setProgram(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [programSlug]);

  const handleContactClick = () => {
    navigate('/#contact');
    setTimeout(() => {
      const contactSection = document.getElementById('contact');
      if (contactSection) contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const audienceLabels = {
    first_secondary: isAr ? 'الصف الأول الثانوي' : 'First Secondary',
    second_secondary: isAr ? 'الصف الثاني الثانوي' : 'Second Secondary',
    baccalaureate: isAr ? 'البكالوريا' : 'Baccalaureate',
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="secondary-page" dir={dir}>
          <div className="program-detail-loading">{isAr ? 'جارٍ التحميل...' : 'Loading...'}</div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !program) {
    return (
      <>
        <SEO
          title={isAr ? 'البرنامج غير موجود | SidrahSoft' : 'Program Not Found | SidrahSoft'}
          description={isAr ? 'لم يتم العثور على هذا البرنامج.' : 'This program was not found.'}
        />
        <Header />
        <main className="secondary-page" dir={dir}>
          <section className="program-detail-not-found">
            <div className="program-detail-not-found__content">
              <h1 className="program-detail-not-found__title">
                {isAr ? 'البرنامج غير موجود' : 'Program Not Found'}
              </h1>
              <p className="program-detail-not-found__text">
                {isAr
                  ? 'لم نتمكن من العثور على البرنامج الذي تبحث عنه. تصفح جميع البرامج المتاحة.'
                  : 'We could not find the program you are looking for. Browse all available programs.'}
              </p>
              <Link to="/training/secondary" className="program-detail-back-btn">
                {isAr ? '→ العودة إلى البرامج' : '← Back to Programs'}
              </Link>
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  const title = isAr && program.title_ar ? program.title_ar : program.title_en;
  const subtitle = isAr && program.short_description_ar ? program.short_description_ar : program.short_description_en;
  const overview = isAr && program.overview_ar ? program.overview_ar : program.overview_en;
  const modules = isAr && program.modules_ar ? program.modules_ar : program.modules_en;
  const skills = isAr && program.skills_ar ? program.skills_ar : program.skills_en;
  const learningOutcomes = isAr && program.learning_outcomes_ar ? program.learning_outcomes_ar : program.learning_outcomes_en;
  const project = isAr && program.practical_project_ar ? program.practical_project_ar : program.practical_project_en;
  const duration = isAr && program.duration_ar ? program.duration_ar : program.duration_en;
  const format = isAr && program.format_ar ? program.format_ar : program.format_en;
  const schedule = isAr && program.schedule_ar ? program.schedule_ar : program.schedule_en;
  const ctaText = isAr && program.cta_text_ar ? program.cta_text_ar : program.cta_text_en;
  const ctaLabel = ctaText || (isAr ? 'سجّل الآن' : 'Register Now');

  const audienceLevels = Array.isArray(program.audience_levels)
    ? program.audience_levels
        .filter((l) => l && audienceLabels[l])
        .map((l) => audienceLabels[l])
    : [];

  const defaultCta = isAr ? 'ابدأ رحلة التعلم' : 'Start Your Learning Journey';

  return (
    <>
      <SEO
        title={`${title} | SidrahSoft`}
        description={subtitle}
        ogTitle={`${title} | SidrahSoft`}
        ogDescription={subtitle}
        ogImage={program.image_url || undefined}
        canonical={`/training/secondary/${program.slug}`}
        breadcrumbItems={[
          { name: isAr ? 'الرئيسية' : 'Home', url: '/' },
          { name: isAr ? 'التدريب والتعليم' : 'Training & Education', url: '/training' },
          { name: isAr ? 'الثانوية / البكالوريا' : 'Secondary / Baccalaureate', url: '/training/secondary' },
          { name: title },
        ]}
      />
      <Header />
      <main className="secondary-page program-detail-page" dir={dir}>
        <section className="program-detail-hero">
          <div className="program-detail-hero__content">
            <Link to="/training/secondary" className="program-detail-back-link">
              {isAr ? '→ العودة إلى البرامج' : '← Back to Programs'}
            </Link>
            <h1 className="program-detail-hero__title">{title}</h1>
            <p className="program-detail-hero__subtitle">{subtitle}</p>
            {audienceLevels.length > 0 && (
              <div className="program-detail-hero__audience">
                <span className="program-detail-hero__audience-label">
                  {isAr ? 'الفئة المستهدفة:' : 'Target Audience:'}
                </span>
                <span className="program-detail-hero__audience-value">
                  {audienceLevels.join(isAr ? '، ' : ', ')}
                </span>
              </div>
            )}
            <div className="program-detail-hero__meta">
              {duration && <span className="program-detail-hero__meta-item">{duration}</span>}
              {format && <span className="program-detail-hero__meta-item">{format}</span>}
            </div>
            <button type="button" className="program-detail-hero__cta" onClick={handleContactClick}>
              {ctaLabel}
            </button>
          </div>
          {program.image_url && (
            <div className="program-detail-hero__image-wrapper">
              <img src={program.image_url} alt={title} className="program-detail-hero__image" />
            </div>
          )}
        </section>

        {overview && (
          <section className="program-detail-section">
            <div className="program-detail-section__content">
              <h2 className="program-detail-section__heading">{isAr ? 'نظرة عامة' : 'Overview'}</h2>
              <p className="program-detail-section__text">{overview}</p>
            </div>
          </section>
        )}

        {Array.isArray(modules) && modules.length > 0 && (
          <section className="program-detail-section program-detail-section--alt">
            <div className="program-detail-section__content">
              <h2 className="program-detail-section__heading">{isAr ? 'المنهج' : 'Curriculum'}</h2>
              <div className="program-detail-modules">
                {modules.map((mod, idx) => {
                  const text = typeof mod === 'string' ? mod : (isAr ? mod.title_ar : mod.title_en);
                  return (
                    <div key={idx} className="program-detail-module">
                      <span className="program-detail-module__number">{String(idx + 1).padStart(2, '0')}</span>
                      <span className="program-detail-module__text">{text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {Array.isArray(skills) && skills.length > 0 && (
          <section className="program-detail-section">
            <div className="program-detail-section__content">
              <h2 className="program-detail-section__heading">{isAr ? 'المهارات' : 'Skills'}</h2>
              <div className="program-detail-skills">
                {skills.map((skill, idx) => {
                  const text = typeof skill === 'string' ? skill : (isAr ? skill.title_ar : skill.title_en);
                  return (
                    <div key={idx} className="program-detail-skill">
                      <span className="program-detail-skill__icon" aria-hidden="true">✓</span>
                      <span className="program-detail-skill__text">{text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {Array.isArray(learningOutcomes) && learningOutcomes.length > 0 && (
          <section className="program-detail-section program-detail-section--alt">
            <div className="program-detail-section__content">
              <h2 className="program-detail-section__heading">{isAr ? 'نتائج التعلم' : 'Learning Outcomes'}</h2>
              <div className="program-detail-outcomes">
                {learningOutcomes.map((outcome, idx) => {
                  const text = typeof outcome === 'string' ? outcome : (isAr ? outcome.title_ar : outcome.title_en);
                  return (
                    <div key={idx} className="program-detail-outcome">
                      <span className="program-detail-outcome__icon" aria-hidden="true">◆</span>
                      <span className="program-detail-outcome__text">{text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {project && (
          <section className="program-detail-section">
            <div className="program-detail-section__content">
              <h2 className="program-detail-section__heading">{isAr ? 'المشروع العملي' : 'Practical Project'}</h2>
              <div className="program-detail-project">
                <p className="program-detail-project__text">{project}</p>
              </div>
            </div>
          </section>
        )}

        {schedule && (
          <section className="program-detail-section program-detail-section--alt">
            <div className="program-detail-section__content">
              <h2 className="program-detail-section__heading">{isAr ? 'الجدول' : 'Schedule'}</h2>
              <p className="program-detail-section__text">{schedule}</p>
            </div>
          </section>
        )}

        <section className="program-detail-cta">
          <div className="program-detail-cta__content">
            <p className="program-detail-cta__text">{defaultCta}</p>
            <button type="button" className="program-detail-cta__button" onClick={handleContactClick}>
              {ctaLabel}
            </button>
            <Link to="/training/secondary" className="program-detail-cta__back">
              {isAr ? '→ العودة إلى البرامج' : '← Back to Programs'}
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default SecondaryProgramDetailPage;
