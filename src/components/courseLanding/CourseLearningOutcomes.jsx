import { useI18n } from '../../i18n/I18nProvider.jsx';

/**
 * What Will You Learn Section
 * Displays learning outcomes with checkmark icons.
 * Hidden if no outcomes are configured.
 */
function CourseLearningOutcomes({ landing }) {
  const { lang, dir } = useI18n();
  const isAr = lang === 'ar';

  const outcomes = landing?.learningOutcomes
    ? (isAr ? landing.learningOutcomes.ar : landing.learningOutcomes.en)
    : [];

  if (!outcomes || outcomes.length === 0) return null;

  const heading = isAr ? 'ماذا ستتعلم في هذا الكورس؟' : 'What Will You Learn?';

  return (
    <section className="course-landing-section course-landing-section--alt" dir={dir}>
      <div className="course-landing-section__content">
        <h2 className="course-landing-section__heading">{heading}</h2>
        <ul className="course-landing-outcomes">
          {outcomes.map((outcome, idx) => (
            <li key={idx} className="course-landing-outcome">
              <span className="course-landing-outcome__icon" aria-hidden="true">✓</span>
              <span className="course-landing-outcome__text">{outcome}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default CourseLearningOutcomes;
