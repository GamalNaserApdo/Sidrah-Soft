import { useState } from 'react';
import { useI18n } from '../../i18n/I18nProvider.jsx';

/**
 * Course Curriculum Section — Accordion
 *
 * Features:
 * - First module open by default
 * - Smooth open/close
 * - Arrow indicator showing state
 * - Keyboard support (Enter/Space)
 * - aria-expanded, aria-controls
 * - RTL and LTR correct
 * - No horizontal overflow
 * - Mobile-friendly
 */
function CourseCurriculum({ landing }) {
  const { lang, dir } = useI18n();
  const isAr = lang === 'ar';

  const curriculum = landing?.curriculum || [];
  if (!curriculum || curriculum.length === 0) return null;

  const heading = isAr ? 'محتوى الكورس' : 'Course Curriculum';
  const moduleLabel = isAr ? 'الوحدة' : 'Module';
  const topicsLabel = isAr ? 'الموضوعات' : 'Topics';

  // First module open by default
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (idx) => {
    setOpenIndex((prev) => (prev === idx ? -1 : idx));
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle(idx);
    }
  };

  return (
    <section className="course-landing-section" id="course-curriculum" dir={dir}>
      <div className="course-landing-section__content course-landing-section__content--wide">
        <h2 className="course-landing-section__heading">{heading}</h2>
        <div className="course-landing-curriculum">
          {curriculum.map((module, idx) => {
            const moduleTitle = isAr ? module.title.ar : module.title.en;
            const moduleDesc = module.description ? (isAr ? module.description.ar : module.description.en) : null;
            const topics = module.topics ? (isAr ? module.topics.ar : module.topics.en) : [];
            const isOpen = openIndex === idx;
            const panelId = `curriculum-panel-${module.id || idx}`;
            const buttonId = `curriculum-button-${module.id || idx}`;

            return (
              <div key={module.id || idx} className="course-landing-module">
                <h3 className="course-landing-module__header">
                  <button
                    type="button"
                    id={buttonId}
                    className="course-landing-module__button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggle(idx)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                  >
                    <span className="course-landing-module__number">
                      {moduleLabel} {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="course-landing-module__title">{moduleTitle}</span>
                    <span
                      className={`course-landing-module__arrow ${isOpen ? 'course-landing-module__arrow--open' : ''}`}
                      aria-hidden="true"
                    >
                      {isAr ? '◂' : '▸'}
                    </span>
                  </button>
                </h3>
                <div
                  id={panelId}
                  className={`course-landing-module__panel ${isOpen ? 'course-landing-module__panel--open' : ''}`}
                  role="region"
                  aria-labelledby={buttonId}
                  hidden={!isOpen}
                >
                  {moduleDesc && (
                    <p className="course-landing-module__description">{moduleDesc}</p>
                  )}
                  {topics && topics.length > 0 && (
                    <>
                      <p className="course-landing-module__topics-label">{topicsLabel}</p>
                      <ul className="course-landing-module__topics">
                        {topics.map((topic, tIdx) => (
                          <li key={tIdx} className="course-landing-module__topic">
                            <span className="course-landing-module__topic-marker" aria-hidden="true">•</span>
                            <span className="course-landing-module__topic-text">{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default CourseCurriculum;
