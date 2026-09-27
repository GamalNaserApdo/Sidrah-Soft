import { useI18n } from '../../i18n/I18nProvider.jsx';

/**
 * Target Audience + Prerequisites Section
 * - Who is this course for?
 * - Is it suitable for beginners?
 * - Prerequisites (or "No prior experience required" if none)
 *
 * Hidden if no target audience data is configured.
 */
function CourseTargetAudience({ landing }) {
  const { lang, dir } = useI18n();
  const isAr = lang === 'ar';

  const audience = landing?.targetAudience
    ? (isAr ? landing.targetAudience.ar : landing.targetAudience.en)
    : [];
  const prerequisites = landing?.prerequisites
    ? (isAr ? landing.prerequisites.ar : landing.prerequisites.en)
    : [];

  if (!audience || audience.length === 0) return null;

  const audienceHeading = isAr ? 'لمن هذا الكورس؟' : 'Who Is This Course For?';
  const prereqHeading = isAr ? 'المتطلبات السابقة' : 'Prerequisites';

  return (
    <section className="course-landing-section" dir={dir}>
      <div className="course-landing-section__content course-landing-section__content--wide">
        <div className="course-landing-audience-prereq">
          <div className="course-landing-audience">
            <h2 className="course-landing-section__heading">{audienceHeading}</h2>
            <ul className="course-landing-list">
              {audience.map((item, idx) => (
                <li key={idx} className="course-landing-list__item">
                  <span className="course-landing-list__icon" aria-hidden="true">●</span>
                  <span className="course-landing-list__text">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {prerequisites && prerequisites.length > 0 && (
            <div className="course-landing-prereq">
              <h2 className="course-landing-section__heading course-landing-section__heading--small">
                {prereqHeading}
              </h2>
              <ul className="course-landing-list">
                {prerequisites.map((item, idx) => (
                  <li key={idx} className="course-landing-list__item">
                    <span className="course-landing-list__icon course-landing-list__icon--prereq" aria-hidden="true">▸</span>
                    <span className="course-landing-list__text">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default CourseTargetAudience;
