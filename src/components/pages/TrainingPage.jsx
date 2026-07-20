import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../Header';
import Footer from '../Footer';
import MagneticButton from '../MagneticButton';
import SEO from '../SEO';
import { useI18n } from '../../i18n/I18nProvider.jsx';
import { PAGES } from '../../config/seo';
import { getAllCourses } from '../../data/courses';

const courses = getAllCourses();

function useInView(threshold = 0.2, rootMargin = '0px 0px -50px 0px') {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotionQuery.matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    const element = sectionRef.current;
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, rootMargin]);

  return { sectionRef, isVisible };
}

function TrainingHero() {
  const { sectionRef, isVisible } = useInView(0.2, '0px 0px 0px 0px');
  const { t } = useI18n();

  return (
    <section ref={sectionRef} className="training-hero">
      <div className="training-hero__content">
        <h1 className={`training-hero__title ${isVisible ? 'training-hero__title--visible' : ''}`}>
          {t('training.heroTitle')}
        </h1>
        <p className={`training-hero__subtitle ${isVisible ? 'training-hero__subtitle--visible' : ''}`}>
          {t('training.heroSubtitle')}
        </p>
      </div>
    </section>
  );
}

function CourseCard({ course, index, isVisible }) {
  const { lang } = useI18n();
  const isAr = lang === 'ar';
  const title = isAr ? course.titleAr : course.titleEn;
  const summary = isAr ? course.shortDescriptionAr : course.shortDescriptionEn;
  const category = isAr ? course.categoryAr : course.categoryEn;
  const ctaLabel = isAr ? 'استكشف الكورس' : 'Explore Course';

  return (
    <Link
      to={`/training/${course.slug}`}
      className={`training-course-card ${isVisible ? 'training-course-card--visible' : ''}`}
      style={{ transitionDelay: `${index * 80}ms` }}
      aria-label={`${ctaLabel}: ${title}`}
    >
      <div className="training-course-card__image-wrapper">
        {course.image ? (
          <img
            src={course.image}
            alt={title}
            className="training-course-card__image"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="training-course-card__image-fallback" aria-hidden="true">
            <span className="training-course-card__image-fallback-text">{category}</span>
          </div>
        )}
        <span className="training-course-card__category">{category}</span>
      </div>
      <div className="training-course-card__body">
        <h3 className="training-course-card__title">{title}</h3>
        <p className="training-course-card__summary">{summary}</p>
        <span className="training-course-card__cta">
          {ctaLabel}
          <span className="training-course-card__cta-arrow" aria-hidden="true">{isAr ? '←' : '→'}</span>
        </span>
      </div>
    </Link>
  );
}

function CoursesGrid() {
  const { sectionRef, isVisible } = useInView(0.1);
  const { t } = useI18n();

  return (
    <section ref={sectionRef} className="training-courses">
      <div className="training-courses__content">
        <h2 className={`training-courses__headline ${isVisible ? 'training-courses__headline--visible' : ''}`}>
          {t('training.coursesTitle')}
        </h2>
        <p className={`training-courses__description ${isVisible ? 'training-courses__description--visible' : ''}`}>
          {t('training.coursesDescription')}
        </p>
        <div className="training-courses__grid">
          {courses.map((course, index) => (
            <CourseCard
              key={course.slug}
              course={course}
              index={index}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function TrainingCta() {
  const { sectionRef, isVisible } = useInView(0.2, '0px 0px 0px 0px');
  const navigate = useNavigate();
  const { t } = useI18n();

  const handleContactClick = () => {
    navigate('/#contact');
    setTimeout(() => {
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 0);
  };

  return (
    <section ref={sectionRef} className="training-cta">
      <div className={`training-cta__content ${isVisible ? 'training-cta__content--visible' : ''}`}>
        <h2 className="training-cta__title">{t('training.ctaTitle')}</h2>
        <p className="training-cta__text">{t('training.ctaText')}</p>
        <MagneticButton className="training-cta__button" onClick={handleContactClick}>
          {t('training.ctaButton')}
        </MagneticButton>
      </div>
    </section>
  );
}

function TrainingPage() {
  return (
    <>
      <SEO {...PAGES.training} />
      <Header />
      <main className="training-page">
        <TrainingHero />
        <CoursesGrid />
        <TrainingCta />
      </main>
      <Footer />
    </>
  );
}

export default TrainingPage;
