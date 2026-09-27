import { useI18n } from '../../i18n/I18nProvider.jsx';

/**
 * Course Overview / About Section
 * - What is the course?
 * - What problem does it solve?
 * - What will the student be able to do?
 * - Theoretical and practical nature
 * - Professional value
 */
function CourseOverview({ course }) {
  const { lang, dir } = useI18n();
  const isAr = lang === 'ar';

  const overview = isAr ? course.overviewAr : course.overviewEn;
  const heading = isAr ? 'نبذة عن الكورس' : 'About This Course';

  return (
    <section className="course-landing-section" dir={dir}>
      <div className="course-landing-section__content">
        <h2 className="course-landing-section__heading">{heading}</h2>
        <p className="course-landing-section__text">{overview}</p>
      </div>
    </section>
  );
}

export default CourseOverview;
