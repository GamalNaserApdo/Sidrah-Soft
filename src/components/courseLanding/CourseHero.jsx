import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nProvider.jsx';
import { scrollToRegistrationForm } from '../../utils/scrollToForm';

/**
 * Course Landing Hero Section
 * - Course category chip
 * - Course title
 * - Marketing headline
 * - Short description (outcome-focused)
 * - Course image / video poster
 * - Primary CTA: Register Now
 * - Secondary CTA: View Curriculum (scroll)
 * - Quick facts (level / training mode) when available
 */
function CourseHero({ course, landing, registrationUrl }) {
  const { lang, dir } = useI18n();
  const isAr = lang === 'ar';

  const title = isAr ? course.titleAr : course.titleEn;
  const category = isAr ? course.categoryAr : course.categoryEn;
  const shortDesc = isAr ? course.shortDescriptionAr : course.shortDescriptionEn;
  const headline = landing?.headline ? (isAr ? landing.headline.ar : landing.headline.en) : (isAr ? course.subtitleAr : course.subtitleEn);
  const registerLabel = isAr ? 'سجل الآن' : 'Register Now';
  const curriculumLabel = isAr ? 'استعرض محتوى الكورس' : 'View Curriculum';
  const backLabel = isAr ? '→ العودة إلى الدورات' : '← Back to Courses';

  const quickFacts = landing?.quickFacts || {};
  const facts = [];
  if (quickFacts.level) facts.push({ label: isAr ? 'المستوى' : 'Level', value: isAr ? quickFacts.level.ar : quickFacts.level.en });
  if (quickFacts.trainingMode) facts.push({ label: isAr ? 'نمط التدريب' : 'Training Mode', value: isAr ? quickFacts.trainingMode.ar : quickFacts.trainingMode.en });

  const scrollToCurriculum = (e) => {
    e.preventDefault();
    const el = document.getElementById('course-curriculum');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="course-landing-hero" dir={dir}>
      <div className="course-landing-hero__content">
        <Link to="/training" className="course-landing-hero__back">
          {backLabel}
        </Link>
        <span className="course-landing-hero__category">{category}</span>
        <h1 className="course-landing-hero__title">{title}</h1>
        <p className="course-landing-hero__headline">{headline}</p>
        <p className="course-landing-hero__intro">{shortDesc}</p>

        {facts.length > 0 && (
          <div className="course-landing-hero__facts">
            {facts.map((f, i) => (
              <span key={i} className="course-landing-hero__fact">
                <span className="course-landing-hero__fact-label">{f.label}:</span>{' '}
                <span className="course-landing-hero__fact-value">{f.value}</span>
              </span>
            ))}
          </div>
        )}

        <div className="course-landing-hero__ctas">
          <button
            type="button"
            onClick={scrollToRegistrationForm}
            className="course-landing-hero__cta-primary"
          >
            {registerLabel}
          </button>
          <a
            href="#course-curriculum"
            onClick={scrollToCurriculum}
            className="course-landing-hero__cta-secondary"
          >
            {curriculumLabel}
          </a>
        </div>
      </div>

      {course.image && (
        <div className="course-landing-hero__image-wrapper">
          <img
            src={course.image}
            alt={title}
            className="course-landing-hero__image"
          />
        </div>
      )}
    </section>
  );
}

export default CourseHero;
