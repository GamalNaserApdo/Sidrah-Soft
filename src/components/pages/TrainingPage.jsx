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
  const { lang } = useI18n();
  const isAr = lang === 'ar';

  return (
    <section ref={sectionRef} className="training-hero">
      <div className="training-hero__content">
        <h1 className={`training-hero__title ${isVisible ? 'training-hero__title--visible' : ''}`}>
          {isAr ? 'التدريب والتعليم' : 'Training & Education'}
        </h1>
        <p className={`training-hero__subtitle ${isVisible ? 'training-hero__subtitle--visible' : ''}`}>
          {isAr
            ? 'بناء الكفاءات التقنية من خلال التدريب المهني والتعليم البرمجي داخل بيئة شركة برمجيات حقيقية.'
            : 'Building technical capability through professional training and programming education inside a real software company environment.'}
        </p>
      </div>
    </section>
  );
}

function TrackSelector() {
  const { sectionRef, isVisible } = useInView(0.15);
  const { lang } = useI18n();
  const isAr = lang === 'ar';

  return (
    <section ref={sectionRef} className="training-tracks">
      <div className="training-tracks__content">
        <h2 className={`training-tracks__headline ${isVisible ? 'training-tracks__headline--visible' : ''}`}>
          {isAr ? 'اختر مسارك' : 'Choose Your Path'}
        </h2>
        <div className="training-tracks__grid">
          <Link to="#professional-courses" className={`training-track-card ${isVisible ? 'training-track-card--visible' : ''}`} onClick={(e) => { e.preventDefault(); document.getElementById('professional-courses')?.scrollIntoView({ behavior: 'smooth' }); }}>
            <div className="training-track-card__icon" aria-hidden="true">⚡</div>
            <h3 className="training-track-card__title">
              {isAr ? 'التدريب المهني' : 'Professional Training'}
            </h3>
            <p className="training-track-card__description">
              {isAr
                ? 'دورات متخصصة في تطوير البرمجيات والتقنيات الحديثة للمحترفين والمطورين.'
                : 'Specialized courses in software development and modern technologies for professionals and developers.'}
            </p>
            <span className="training-track-card__cta">
              {isAr ? 'استعرض الدورات' : 'Browse Courses'}
              <span aria-hidden="true">{isAr ? ' ←' : ' →'}</span>
            </span>
          </Link>

          <Link to="/training/secondary" className={`training-track-card training-track-card--education ${isVisible ? 'training-track-card--visible' : ''}`} style={{ transitionDelay: '120ms' }}>
            <div className="training-track-card__icon" aria-hidden="true">🎓</div>
            <h3 className="training-track-card__title">
              {isAr ? 'تعليم الثانوية / البكالوريا' : 'Secondary / Baccalaureate Education'}
            </h3>
            <p className="training-track-card__description">
              {isAr
                ? 'تعلّم البرمجة داخل بيئة شركة برمجيات حقيقية. برامج مصممة لطلاب الثانوية والبكالوريا.'
                : 'Learn programming inside a real software company ecosystem. Programs designed for secondary and baccalaureate students.'}
            </p>
            <span className="training-track-card__cta">
              {isAr ? 'اكتشف البرامج' : 'Explore Programs'}
              <span aria-hidden="true">{isAr ? ' ←' : ' →'}</span>
            </span>
          </Link>
        </div>
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
  const { lang } = useI18n();
  const isAr = lang === 'ar';

  return (
    <section ref={sectionRef} className="training-courses" id="professional-courses">
      <div className="training-courses__content">
        <h2 className={`training-courses__headline ${isVisible ? 'training-courses__headline--visible' : ''}`}>
          {isAr ? 'الدورات المهنية' : 'Professional Courses'}
        </h2>
        <p className={`training-courses__description ${isVisible ? 'training-courses__description--visible' : ''}`}>
          {isAr
            ? 'منهجية مركزة حول التقنيات والممارسات التي تدفع فرق البرمجيات الحديثة.'
            : 'A focused curriculum built around the technologies and practices that drive modern software teams.'}
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
  const { lang } = useI18n();
  const isAr = lang === 'ar';

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
        <h2 className="training-cta__title">
          {isAr ? 'هل تحتاج تدريباً مخصصاً؟' : 'Need Customized Training?'}
        </h2>
        <p className="training-cta__text">
          {isAr
            ? 'نساعد الجامعات والمؤسسات والشركات في بناء برامج تعليمية وورش عمل تقنية مخصصة.'
            : 'We help universities, organizations, and companies build tailored learning programs and technology workshops.'}
        </p>
        <MagneticButton className="training-cta__button" onClick={handleContactClick}>
          {isAr ? 'تواصل معنا' : 'Contact Us'}
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
        <TrackSelector />
        <CoursesGrid />
        <TrainingCta />
      </main>
      <Footer />
    </>
  );
}

export default TrainingPage;
