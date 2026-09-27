import { useI18n } from '../../i18n/I18nProvider.jsx';
import { scrollToRegistrationForm } from '../../utils/scrollToForm';

/**
 * Mid-page CTA — appears after Hero and after Curriculum.
 * Compact registration prompt.
 */
function CourseMiniCTA() {
  const { lang, dir } = useI18n();
  const isAr = lang === 'ar';

  const registerLabel = isAr ? 'سجل الآن' : 'Register Now';
  const message = isAr
    ? 'جاهز للبدء؟ سجل الآن واحجز مقعدك في الكورس.'
    : 'Ready to start? Register now and secure your seat in the course.';

  return (
    <section className="course-landing-mini-cta" dir={dir}>
      <div className="course-landing-mini-cta__content">
        <p className="course-landing-mini-cta__text">{message}</p>
        <button
          type="button"
          onClick={scrollToRegistrationForm}
          className="course-landing-mini-cta__button"
        >
          {registerLabel}
        </button>
      </div>
    </section>
  );
}

export default CourseMiniCTA;
