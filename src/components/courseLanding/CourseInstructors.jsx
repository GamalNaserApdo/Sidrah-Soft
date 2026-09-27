import { useState } from 'react';
import { useI18n } from '../../i18n/I18nProvider.jsx';

/**
 * Instructors Section
 *
 * Features:
 * - Real instructor photo
 * - Name, title, short bio
 * - Optional LinkedIn link
 * - Slider/Carousel when more than one instructor
 * - Previous/Next buttons
 * - Keyboard support
 * - Swipe on mobile (touch events, no new library)
 * - Auto-play disabled (manual only)
 *
 * Hidden if no instructors are configured — no fake cards.
 *
 * To add an instructor, push to landing.instructors:
 *   { name: {ar, en}, title: {ar, en}, bio: {ar, en}, image: '', linkedInUrl: '' }
 */
function CourseInstructors({ landing }) {
  const { lang, dir } = useI18n();
  const isAr = lang === 'ar';

  const instructors = landing?.instructors || [];
  if (!instructors || instructors.length === 0) return null;

  const heading = isAr ? 'المدربون' : 'Instructors';
  const prevLabel = isAr ? 'السابق' : 'Previous';
  const nextLabel = isAr ? 'التالي' : 'Next';
  const linkedinLabel = isAr ? 'صفحة LinkedIn' : 'LinkedIn Profile';

  const [currentIdx, setCurrentIdx] = useState(0);
  const touchStartX = useState(0)[0];
  let touchStart = 0;

  const goTo = (idx) => {
    const total = instructors.length;
    setCurrentIdx(((idx % total) + total) % total);
  };

  const goPrev = () => goTo(currentIdx - 1);
  const goNext = () => goTo(currentIdx + 1);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      isAr ? goNext() : goPrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      isAr ? goPrev() : goNext();
    }
  };

  const handleTouchStart = (e) => {
    touchStart = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        isAr ? goPrev() : goNext();
      } else {
        isAr ? goNext() : goPrev();
      }
    }
  };

  const instructor = instructors[currentIdx];
  const name = isAr ? instructor.name.ar : instructor.name.en;
  const title = isAr ? instructor.title.ar : instructor.title.en;
  const bio = isAr ? instructor.bio.ar : instructor.bio.en;

  return (
    <section className="course-landing-section course-landing-section--alt" dir={dir}>
      <div className="course-landing-section__content">
        <h2 className="course-landing-section__heading">{heading}</h2>
        <div
          className="course-landing-instructors"
          onKeyDown={handleKeyDown}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          tabIndex={0}
          role="region"
          aria-label={heading}
        >
          <div className="course-landing-instructor">
            {instructor.image && (
              <div className="course-landing-instructor__image-wrapper">
                <img
                  src={instructor.image}
                  alt={name}
                  className="course-landing-instructor__image"
                  loading="lazy"
                />
              </div>
            )}
            <div className="course-landing-instructor__info">
              <h3 className="course-landing-instructor__name">{name}</h3>
              <p className="course-landing-instructor__title">{title}</p>
              <p className="course-landing-instructor__bio">{bio}</p>
              {instructor.linkedInUrl && (
                <a
                  href={instructor.linkedInUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="course-landing-instructor__linkedin"
                >
                  {linkedinLabel}
                </a>
              )}
            </div>
          </div>

          {instructors.length > 1 && (
            <div className="course-landing-instructor__nav">
              <button
                type="button"
                className="course-landing-instructor__nav-btn"
                onClick={goPrev}
                aria-label={prevLabel}
              >
                {isAr ? '→' : '←'}
              </button>
              <span className="course-landing-instructor__nav-count">
                {currentIdx + 1} / {instructors.length}
              </span>
              <button
                type="button"
                className="course-landing-instructor__nav-btn"
                onClick={goNext}
                aria-label={nextLabel}
              >
                {isAr ? '←' : '→'}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default CourseInstructors;
