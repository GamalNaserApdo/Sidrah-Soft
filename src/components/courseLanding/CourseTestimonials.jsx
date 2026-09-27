import { useState } from 'react';
import { useI18n } from '../../i18n/I18nProvider.jsx';

/**
 * Student Testimonials Section
 *
 * Features:
 * - Student name, review, rating, optional avatar
 * - Manual carousel with prev/next buttons
 * - Swipe on mobile (touch events, no new library)
 * - Keyboard support
 * - No auto-play (manual only)
 *
 * Hidden if no testimonials are configured — no fake reviews.
 *
 * To add a testimonial, push to landing.testimonials:
 *   { studentName: {ar, en}, review: {ar, en}, rating: 5, avatar: '' }
 */
function CourseTestimonials({ landing }) {
  const { lang, dir } = useI18n();
  const isAr = lang === 'ar';

  const testimonials = landing?.testimonials || [];
  if (!testimonials || testimonials.length === 0) return null;

  const heading = isAr ? 'آراء الطلاب' : 'Student Reviews';
  const prevLabel = isAr ? 'السابق' : 'Previous';
  const nextLabel = isAr ? 'التالي' : 'Next';

  const [currentIdx, setCurrentIdx] = useState(0);
  let touchStart = 0;

  const goTo = (idx) => {
    const total = testimonials.length;
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

  const testimonial = testimonials[currentIdx];
  const studentName = isAr ? testimonial.studentName.ar : testimonial.studentName.en;
  const review = isAr ? testimonial.review.ar : testimonial.review.en;
  const rating = testimonial.rating || 5;

  return (
    <section className="course-landing-section" dir={dir}>
      <div className="course-landing-section__content">
        <h2 className="course-landing-section__heading">{heading}</h2>
        <div
          className="course-landing-testimonials"
          onKeyDown={handleKeyDown}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          tabIndex={0}
          role="region"
          aria-label={heading}
        >
          <div className="course-landing-testimonial">
            <div className="course-landing-testimonial__rating" aria-label={`${rating} / 5`}>
              {Array.from({ length: 5 }, (_, i) => (
                <span
                  key={i}
                  className={`course-landing-testimonial__star ${i < rating ? 'course-landing-testimonial__star--filled' : ''}`}
                  aria-hidden="true"
                >
                  ★
                </span>
              ))}
            </div>
            <blockquote className="course-landing-testimonial__review">
              "{review}"
            </blockquote>
            <div className="course-landing-testimonial__author">
              {testimonial.avatar && (
                <img
                  src={testimonial.avatar}
                  alt={studentName}
                  className="course-landing-testimonial__avatar"
                  loading="lazy"
                />
              )}
              <span className="course-landing-testimonial__name">{studentName}</span>
            </div>
          </div>

          {testimonials.length > 1 && (
            <div className="course-landing-testimonial__nav">
              <button
                type="button"
                className="course-landing-testimonial__nav-btn"
                onClick={goPrev}
                aria-label={prevLabel}
              >
                {isAr ? '→' : '←'}
              </button>
              <span className="course-landing-testimonial__nav-count">
                {currentIdx + 1} / {testimonials.length}
              </span>
              <button
                type="button"
                className="course-landing-testimonial__nav-btn"
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

export default CourseTestimonials;
