import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nProvider';
import { useHomepageConfig } from '../../hooks/useHomepageConfig';

/**
 * Fallback training path cards — used when CMS training_paths is empty.
 * Mirrors the 3-path Training IA: Professional, Starter, Summer.
 */
const FALLBACK_TRAINING_PATHS = [
  {
    key: 'professional',
    label_en: 'Professional Courses',
    label_ar: 'الكورسات الاحترافية',
    description_en:
      'Intensive courses built on market needs to prepare you for work in software companies.',
    description_ar:
      'برامج تدريبية متخصصة لتطوير المهارات العملية والاستعداد لسوق العمل من خلال محتوى تطبيقي ومشروعات عملية.',
    cta_label_en: 'Explore Courses',
    cta_label_ar: 'استكشف الكورسات',
    url: '/training#professional-courses',
  },
  {
    key: 'starter',
    label_en: 'Starter Courses',
    label_ar: 'كورسات المبتدئين',
    description_en:
      'Start from zero — 6 weeks, 12 live sessions, and a practical final project.',
    description_ar:
      'ابدأ من الأساسيات من خلال كورسات مبسطة وعملية تساعدك على بناء قاعدة قوية قبل الانتقال للمستويات المتقدمة.',
    cta_label_en: 'Explore Starter Courses',
    cta_label_ar: 'ابدأ الآن',
    url: '/training/starter',
  },
  {
    key: 'summer',
    label_en: 'Summer Training',
    label_ar: 'التدريب الصيفي',
    description_en:
      'Hands-on summer training inside a real software company environment — practical sessions, projects, and mentorship.',
    description_ar:
      'تجربة تدريبية عملية للطلاب تساعدهم على اكتساب خبرة حقيقية وتطوير مهاراتهم خلال فترة الصيف.',
    cta_label_en: 'Register for Summer Training',
    cta_label_ar: 'استكشف التدريب الصيفي',
    url: '/training/summer-training',
  },
];

function TrainingEducationEntry() {
  const { lang } = useI18n();
  const isAr = lang === 'ar';
  const { config } = useHomepageConfig();
  const training = config?.training;

  const heading = isAr
    ? (training?.heading_ar || 'مسارات التدريب')
    : (training?.heading_en || 'We Build Capabilities. We Teach Learners.');

  const description = isAr
    ? (training?.description_ar ||
        'اختر المسار التدريبي المناسب لمرحلتك وهدفك، من البداية وحتى التدريب الاحترافي والتطبيق العملي.')
    : (training?.description_en ||
        'Practical training for professionals, technology pathways for beginners, and summer training inside a real software company environment.');

  const ctaLabel = isAr
    ? (training?.cta_label_ar || 'استكشف جميع برامج التدريب')
    : (training?.cta_label_en || 'Explore Training');

  const ctaTarget = training?.cta_target || '/training';

  const cmsPaths = training?.paths;
  const paths = (Array.isArray(cmsPaths) && cmsPaths.length > 0)
    ? cmsPaths
    : FALLBACK_TRAINING_PATHS;

  return (
    <section className="training-education-entry" id="training-education">
      <div className="training-education-entry__content">
        <h2 className="training-education-entry__title">{heading}</h2>
        <p className="training-education-entry__text">{description}</p>
        <div className="training-education-entry__paths">
          {paths.map((path) => {
            const pathLabel = isAr
              ? (path.label_ar || path.label_en)
              : (path.label_en || path.label_ar);
            const pathDesc = isAr
              ? (path.description_ar || path.description_en)
              : (path.description_en || path.description_ar);
            const pathCta = isAr
              ? (path.cta_label_ar || path.cta_label_en)
              : (path.cta_label_en || path.cta_label_ar);
            return (
              <Link
                key={path.key || path.url}
                to={path.url}
                className="training-education-entry__path"
              >
                <h3 className="training-education-entry__path-title">{pathLabel}</h3>
                <p className="training-education-entry__path-desc">{pathDesc}</p>
                <span className="training-education-entry__path-cta">
                  {pathCta}
                  <span aria-hidden="true">{isAr ? ' ←' : ' →'}</span>
                </span>
              </Link>
            );
          })}
        </div>
        <Link to={ctaTarget} className="training-education-entry__link">
          {ctaLabel}
          <span aria-hidden="true">{isAr ? ' ←' : ' →'}</span>
        </Link>
      </div>
    </section>
  );
}

export default TrainingEducationEntry;
