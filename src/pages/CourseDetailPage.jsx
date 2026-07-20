import { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { useI18n } from '../i18n/I18nProvider';
import { getCourseBySlug } from '../data/courses';

function CourseDetailPage() {
  const { courseSlug } = useParams();
  const { lang, dir } = useI18n();
  const navigate = useNavigate();
  const isAr = lang === 'ar';
  const course = getCourseBySlug(courseSlug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [courseSlug]);

  if (!course) {
    return (
      <>
        <SEO
          title={isAr ? 'الكورس غير موجود | SidrahSoft' : 'Course Not Found | SidrahSoft'}
          description={isAr ? 'لم يتم العثور على هذا الكورس.' : 'This course was not found.'}
        />
        <Header />
        <main className="training-page" dir={dir}>
          <section className="course-detail-not-found">
            <div className="course-detail-not-found__content">
              <h1 className="course-detail-not-found__title">
                {isAr ? 'الكورس غير موجود' : 'Course Not Found'}
              </h1>
              <p className="course-detail-not-found__text">
                {isAr
                  ? 'لم نتمكن من العثور على الكورس الذي تبحث عنه. تصفح جميع الدورات التدريبية المتاحة.'
                  : 'We could not find the course you are looking for. Browse all available training courses.'}
              </p>
              <Link to="/training" className="course-detail-back-btn">
                {isAr ? '→ العودة إلى الدورات' : '← Back to Courses'}
              </Link>
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  const title = isAr ? course.titleAr : course.titleEn;
  const subtitle = isAr ? course.subtitleAr : course.subtitleEn;
  const category = isAr ? course.categoryAr : course.categoryEn;
  const shortDesc = isAr ? course.shortDescriptionAr : course.shortDescriptionEn;
  const overview = isAr ? course.overviewAr : course.overviewEn;
  const audience = isAr ? course.audienceAr : course.audienceEn;
  const modules = isAr ? course.modulesAr : course.modulesEn;
  const skills = isAr ? course.skillsAr : course.skillsEn;
  const project = isAr ? course.projectAr : course.projectEn;
  const aiMessage = isAr ? course.aiMessageAr : course.aiMessageEn;

  const aiHeadline = isAr ? 'الذكاء الاصطناعي لن يُلغي أهمية الأساسيات' : 'AI Will Not Replace the Fundamentals';
  const overviewLabel = isAr ? 'نظرة عامة على الكورس' : 'Course Overview';
  const modulesLabel = isAr ? 'ماذا ستتعلم' : 'What You Will Learn';
  const skillsLabel = isAr ? 'المهارات التي ستكتسبها' : 'Skills You Will Gain';
  const audienceLabel = isAr ? 'لمن هذا الكورس' : 'Who This Course Is For';
  const projectLabel = isAr ? 'المشروع العملي' : 'Practical Project';
  const ctaLabel = isAr ? 'ابدأ رحلة التعلم' : 'Start Your Learning Journey';
  const backLabel = isAr ? '→ العودة إلى الدورات' : '← Back to Courses';
  const finalCtaText = isAr
    ? 'لا تنتظر حتى تشعر أنك مستعد بالكامل. ابدأ ببناء الأساسيات، وطبّق ما تتعلمه في مشروعات حقيقية، وتعلّم كيف تستخدم أدوات الذكاء الاصطناعي الحديثة ضمن أسلوب عمل احترافي.'
    : 'Do not wait until you feel completely ready. Start by building the foundations, practice through real projects, and learn how to use modern AI tools as part of your professional workflow.';

  const handleContactClick = () => {
    navigate(`/#contact`);
    setTimeout(() => {
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <>
      <SEO
        title={`${title} Training | SidrahSoft`}
        description={shortDesc}
        ogTitle={`${title} Training | SidrahSoft`}
        ogDescription={shortDesc}
        ogImage={course.image || undefined}
        canonical={`/training/${course.slug}`}
        breadcrumbItems={[
          { name: isAr ? 'الرئيسية' : 'Home', url: '/' },
          { name: isAr ? 'التدريب' : 'Training', url: '/training' },
          { name: title },
        ]}
      />
      <Header />
      <main className="course-detail-page" dir={dir}>
        {/* Course Hero */}
        <section className="course-detail-hero">
          <div className="course-detail-hero__content">
            <Link to="/training" className="course-detail-back-link">
              {backLabel}
            </Link>
            <span className="course-detail-hero__category">{category}</span>
            <h1 className="course-detail-hero__title">{title}</h1>
            <p className="course-detail-hero__subtitle">{subtitle}</p>
            <p className="course-detail-hero__intro">{shortDesc}</p>
            <div className="course-detail-hero__audience">
              <span className="course-detail-hero__audience-label">
                {isAr ? 'مناسب لـ:' : 'Suitable for:'}
              </span>
              <span className="course-detail-hero__audience-value">
                {audience.slice(0, 3).join(isAr ? '، ' : ', ')}
              </span>
            </div>
            <button type="button" className="course-detail-hero__cta" onClick={handleContactClick}>
              {ctaLabel}
            </button>
          </div>
          {course.image && (
            <div className="course-detail-hero__image-wrapper">
              <img
                src={course.image}
                alt={title}
                className="course-detail-hero__image"
              />
            </div>
          )}
        </section>

        {/* Course Overview */}
        <section className="course-detail-section">
          <div className="course-detail-section__content">
            <h2 className="course-detail-section__heading">{overviewLabel}</h2>
            <p className="course-detail-section__text">{overview}</p>
          </div>
        </section>

        {/* What You Will Learn */}
        <section className="course-detail-section course-detail-section--alt">
          <div className="course-detail-section__content">
            <h2 className="course-detail-section__heading">{modulesLabel}</h2>
            <div className="course-detail-modules">
              {modules.map((mod, idx) => (
                <div key={idx} className="course-detail-module">
                  <span className="course-detail-module__number">{String(idx + 1).padStart(2, '0')}</span>
                  <span className="course-detail-module__text">{mod}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Skills You Will Gain */}
        <section className="course-detail-section">
          <div className="course-detail-section__content">
            <h2 className="course-detail-section__heading">{skillsLabel}</h2>
            <div className="course-detail-skills">
              {skills.map((skill, idx) => (
                <div key={idx} className="course-detail-skill">
                  <span className="course-detail-skill__icon" aria-hidden="true">✓</span>
                  <span className="course-detail-skill__text">{skill}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Who This Course Is For */}
        <section className="course-detail-section course-detail-section--alt">
          <div className="course-detail-section__content">
            <h2 className="course-detail-section__heading">{audienceLabel}</h2>
            <div className="course-detail-audience">
              {audience.map((item, idx) => (
                <div key={idx} className="course-detail-audience-item">
                  <span className="course-detail-audience-item__icon" aria-hidden="true">●</span>
                  <span className="course-detail-audience-item__text">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Practical Project */}
        <section className="course-detail-section">
          <div className="course-detail-section__content">
            <h2 className="course-detail-section__heading">{projectLabel}</h2>
            <div className="course-detail-project">
              <p className="course-detail-project__text">{project}</p>
            </div>
          </div>
        </section>

        {/* AI and the Future of This Career */}
        <section className="course-detail-section course-detail-section--ai">
          <div className="course-detail-section__content">
            <h2 className="course-detail-section__heading course-detail-section__heading--ai">{aiHeadline}</h2>
            <p className="course-detail-section__text course-detail-section__text--ai">{aiMessage}</p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="course-detail-cta">
          <div className="course-detail-cta__content">
            <p className="course-detail-cta__text">{finalCtaText}</p>
            <button type="button" className="course-detail-cta__button" onClick={handleContactClick}>
              {isAr ? 'اسأل عن هذا الكورس' : 'Ask About This Course'}
            </button>
            <Link to="/training" className="course-detail-cta__back">
              {backLabel}
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default CourseDetailPage;
