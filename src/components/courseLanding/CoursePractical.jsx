import { useI18n } from '../../i18n/I18nProvider.jsx';

/**
 * Practical Training & Final Project Section
 * - Nature of exercises
 * - Practical applications
 * - Mini projects
 * - Final project
 * - Outcome the student leaves with
 *
 * Hidden if neither practicalTraining nor finalProject is configured.
 */
function CoursePractical({ landing }) {
  const { lang, dir } = useI18n();
  const isAr = lang === 'ar';

  const practical = landing?.practicalTraining
    ? (isAr ? landing.practicalTraining.ar : landing.practicalTraining.en)
    : null;
  const finalProject = landing?.finalProject
    ? (isAr ? landing.finalProject.ar : landing.finalProject.en)
    : null;

  if (!practical && !finalProject) return null;

  const practicalHeading = isAr ? 'الجانب العملي والمشروع النهائي' : 'Practical Training & Final Project';
  const practicalLabel = isAr ? 'طبيعة التدريب العملي' : 'Practical Training';
  const projectLabel = isAr ? 'المشروع النهائي' : 'Final Project';

  return (
    <section className="course-landing-section" dir={dir}>
      <div className="course-landing-section__content">
        <h2 className="course-landing-section__heading">{practicalHeading}</h2>
        {practical && (
          <div className="course-landing-practical">
            <h3 className="course-landing-practical__label">{practicalLabel}</h3>
            <p className="course-landing-practical__text">{practical}</p>
          </div>
        )}
        {finalProject && (
          <div className="course-landing-project">
            <h3 className="course-landing-project__label">{projectLabel}</h3>
            <p className="course-landing-project__text">{finalProject}</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default CoursePractical;
