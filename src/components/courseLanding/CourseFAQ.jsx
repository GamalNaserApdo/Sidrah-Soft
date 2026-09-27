import { useState } from 'react';
import { useI18n } from '../../i18n/I18nProvider.jsx';

/**
 * FAQ Section — Accordion
 *
 * Features:
 * - First item open by default
 * - Smooth open/close
 * - Arrow indicator
 * - Keyboard support (Enter/Space)
 * - aria-expanded, aria-controls
 * - RTL and LTR correct
 *
 * Hidden if no FAQ items are configured.
 */
function CourseFAQ({ landing }) {
  const { lang, dir } = useI18n();
  const isAr = lang === 'ar';

  const faq = landing?.faq || [];
  if (!faq || faq.length === 0) return null;

  const heading = isAr ? 'الأسئلة الشائعة' : 'Frequently Asked Questions';

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
    <section className="course-landing-section" dir={dir}>
      <div className="course-landing-section__content">
        <h2 className="course-landing-section__heading">{heading}</h2>
        <div className="course-landing-faq">
          {faq.map((item, idx) => {
            const question = isAr ? item.question.ar : item.question.en;
            const answer = isAr ? item.answer.ar : item.answer.en;
            const isOpen = openIndex === idx;
            const panelId = `faq-panel-${idx}`;
            const buttonId = `faq-button-${idx}`;

            return (
              <div key={idx} className="course-landing-faq-item">
                <h3 className="course-landing-faq-item__header">
                  <button
                    type="button"
                    id={buttonId}
                    className="course-landing-faq-item__button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggle(idx)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                  >
                    <span className="course-landing-faq-item__question">{question}</span>
                    <span
                      className={`course-landing-faq-item__arrow ${isOpen ? 'course-landing-faq-item__arrow--open' : ''}`}
                      aria-hidden="true"
                    >
                      {isAr ? '◂' : '▸'}
                    </span>
                  </button>
                </h3>
                <div
                  id={panelId}
                  className={`course-landing-faq-item__panel ${isOpen ? 'course-landing-faq-item__panel--open' : ''}`}
                  role="region"
                  aria-labelledby={buttonId}
                  hidden={!isOpen}
                >
                  <p className="course-landing-faq-item__answer">{answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default CourseFAQ;
