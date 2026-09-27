import { useI18n } from '../../i18n/I18nProvider.jsx';

/**
 * Tools & Technologies Section
 * Displays only tools/technologies that are actually part of the curriculum.
 * Hidden if no tools are configured.
 */
function CourseTools({ landing }) {
  const { lang, dir } = useI18n();
  const isAr = lang === 'ar';

  const tools = landing?.tools
    ? (isAr ? landing.tools.ar : landing.tools.en)
    : [];

  if (!tools || tools.length === 0) return null;

  const heading = isAr ? 'الأدوات والتقنيات' : 'Tools & Technologies';

  return (
    <section className="course-landing-section course-landing-section--alt" dir={dir}>
      <div className="course-landing-section__content">
        <h2 className="course-landing-section__heading">{heading}</h2>
        <div className="course-landing-tools">
          {tools.map((tool, idx) => (
            <span key={idx} className="course-landing-tool-chip">
              {tool}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CourseTools;
