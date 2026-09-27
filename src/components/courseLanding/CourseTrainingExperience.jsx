import { useI18n } from '../../i18n/I18nProvider.jsx';

/**
 * Training Experience & Mentor Support Section
 * - Live interactive training
 * - Recorded sessions
 * - Mentor support & follow-up
 * - Hands-on learning
 *
 * Hidden if neither trainingExperience nor mentorInfo is configured.
 */
function CourseTrainingExperience({ landing }) {
  const { lang, dir } = useI18n();
  const isAr = lang === 'ar';

  const experience = landing?.trainingExperience
    ? (isAr ? landing.trainingExperience.ar : landing.trainingExperience.en)
    : null;
  const mentor = landing?.mentorInfo
    ? (isAr ? landing.mentorInfo.ar : landing.mentorInfo.en)
    : null;

  if (!experience && !mentor) return null;

  const heading = isAr ? 'تجربة التدريب والدعم' : 'Training Experience & Support';
  const experienceLabel = isAr ? 'طريقة التدريب' : 'Training Approach';
  const mentorLabel = isAr ? 'الإشراف والمتابعة' : 'Mentor & Follow-up';

  return (
    <section className="course-landing-section" dir={dir}>
      <div className="course-landing-section__content">
        <h2 className="course-landing-section__heading">{heading}</h2>
        {experience && (
          <div className="course-landing-practical">
            <h3 className="course-landing-practical__label">{experienceLabel}</h3>
            <p className="course-landing-practical__text">{experience}</p>
          </div>
        )}
        {mentor && (
          <div className="course-landing-project">
            <h3 className="course-landing-project__label">{mentorLabel}</h3>
            <p className="course-landing-project__text">{mentor}</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default CourseTrainingExperience;
