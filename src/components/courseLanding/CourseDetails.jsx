import { useI18n } from '../../i18n/I18nProvider.jsx';

/**
 * Course Details Section — Info Cards
 *
 * Displays only available, verified data as cards with icons.
 * Each card: icon + label + value.
 * Empty/missing data is hidden — no empty cards.
 *
 * Supported fields (all optional):
 * - startDate, duration, hours, trainingMode
 * - hasRecordings, level, language, practicalType
 * - certificate, support, finalProject, sessionsCount
 */
function CourseDetails({ landing }) {
  const { lang, dir } = useI18n();
  const isAr = lang === 'ar';

  const heading = isAr ? 'تفاصيل الدورة التدريبية' : 'Course Details';

  // Build cards only from available data
  const cards = [];

  // Level
  if (landing?.quickFacts?.level) {
    cards.push({
      icon: '📊',
      label: isAr ? 'المستوى' : 'Level',
      value: isAr ? landing.quickFacts.level.ar : landing.quickFacts.level.en,
    });
  }

  // Training mode
  if (landing?.quickFacts?.trainingMode) {
    cards.push({
      icon: '🎯',
      label: isAr ? 'نمط التدريب' : 'Training Mode',
      value: isAr ? landing.quickFacts.trainingMode.ar : landing.quickFacts.trainingMode.en,
    });
  }

  // Language of instruction (only if explicitly set)
  if (landing?.quickFacts?.language) {
    cards.push({
      icon: '🌐',
      label: isAr ? 'لغة الشرح' : 'Language of Instruction',
      value: isAr ? landing.quickFacts.language.ar : landing.quickFacts.language.en,
    });
  }

  // Practical type
  if (landing?.quickFacts?.practicalType) {
    cards.push({
      icon: '🛠️',
      label: isAr ? 'نوع التطبيق العملي' : 'Practical Application',
      value: isAr ? landing.quickFacts.practicalType.ar : landing.quickFacts.practicalType.en,
    });
  }

  // Final project
  if (landing?.finalProject) {
    const finalProjectText = isAr ? landing.finalProject.ar : landing.finalProject.en;
    cards.push({
      icon: '🏗️',
      label: isAr ? 'المشروع النهائي' : 'Final Project',
      value: finalProjectText || (isAr ? 'مشروع عملي كامل' : 'Complete practical project'),
    });
  }

  // Certificate (only if explicitly confirmed)
  if (landing?.quickFacts?.certificate) {
    cards.push({
      icon: '🎓',
      label: isAr ? 'الشهادة' : 'Certificate',
      value: isAr ? landing.quickFacts.certificate.ar : landing.quickFacts.certificate.en,
    });
  }

  // Support
  if (landing?.quickFacts?.support) {
    cards.push({
      icon: '💬',
      label: isAr ? 'الدعم والمتابعة' : 'Support & Follow-up',
      value: isAr ? landing.quickFacts.support.ar : landing.quickFacts.support.en,
    });
  }

  // Sessions count (only if confirmed)
  if (landing?.quickFacts?.sessionsCount) {
    cards.push({
      icon: '📅',
      label: isAr ? 'عدد الجلسات' : 'Sessions',
      value: String(landing.quickFacts.sessionsCount),
    });
  }

  // Duration (only if confirmed)
  if (landing?.quickFacts?.duration) {
    cards.push({
      icon: '⏱️',
      label: isAr ? 'مدة الكورس' : 'Duration',
      value: isAr ? landing.quickFacts.duration.ar : landing.quickFacts.duration.en,
    });
  }

  // Hours (only if confirmed)
  if (landing?.quickFacts?.hours) {
    cards.push({
      icon: '🕐',
      label: isAr ? 'عدد الساعات' : 'Hours',
      value: String(landing.quickFacts.hours),
    });
  }

  // Start date (only if confirmed)
  if (landing?.quickFacts?.startDate) {
    cards.push({
      icon: '🚀',
      label: isAr ? 'تاريخ البداية' : 'Start Date',
      value: isAr ? landing.quickFacts.startDate.ar : landing.quickFacts.startDate.en,
    });
  }

  // Recordings (only if explicitly confirmed)
  if (landing?.quickFacts?.hasRecordings !== undefined) {
    cards.push({
      icon: '🎥',
      label: isAr ? 'تسجيلات المحاضرات' : 'Lecture Recordings',
      value: landing.quickFacts.hasRecordings
        ? (isAr ? 'متوفرة' : 'Available')
        : (isAr ? 'غير متوفرة' : 'Not available'),
    });
  }

  if (cards.length === 0) return null;

  return (
    <section className="course-landing-section course-landing-section--alt" dir={dir}>
      <div className="course-landing-section__content course-landing-section__content--wide">
        <h2 className="course-landing-section__heading">{heading}</h2>
        <div className="course-landing-details-grid">
          {cards.map((card, idx) => (
            <div key={idx} className="course-landing-detail-card">
              <span className="course-landing-detail-card__icon" aria-hidden="true">{card.icon}</span>
              <span className="course-landing-detail-card__label">{card.label}</span>
              <span className="course-landing-detail-card__value">{card.value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CourseDetails;
