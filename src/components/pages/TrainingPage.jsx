import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Header';
import MagneticButton from '../MagneticButton';
import SEO from '../SEO';
import { useI18n } from '../../i18n/I18nProvider.jsx';
import { PAGES } from '../../config/seo';

const FrontendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
    <polyline points="6,8 8,10 6,12" />
    <line x1="11" y1="10" x2="15" y2="10" />
  </svg>
);

const BackendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5v6a9 3 0 0 0 18 0V5" />
    <path d="M3 11v6a9 3 0 0 0 18 0v-6" />
  </svg>
);

const FlutterIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="3" />
    <line x1="12" y1="18" x2="12" y2="18.01" />
  </svg>
);

const PythonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2c-3 0-3 2.5-3 3.5S9 8 12 8c2.5 0 3-1 3-2.5S15 2 12 2z" />
    <path d="M12 16c-3 0-3-2.5-3-3.5S9 8 12 8c2.5 0 3 1 3 2.5S15 16 12 16z" />
    <path d="M9 5v-2" />
    <path d="M15 19v2" />
  </svg>
);

const CppIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M8 10h2" />
    <path d="M7 12h4" />
    <path d="M15 10h2" />
    <path d="M15 14h2" />
  </svg>
);

const ProblemSolvingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5" />
    <polyline points="12,6 16,9 16,15 12,18 8,15 8,9 12,6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const courseItems = [
  { key: 'frontend', Icon: FrontendIcon },
  { key: 'backend', Icon: BackendIcon },
  { key: 'flutter', Icon: FlutterIcon },
  { key: 'python', Icon: PythonIcon },
  { key: 'cpp', Icon: CppIcon },
  { key: 'problemSolving', Icon: ProblemSolvingIcon },
];

function TrainingHero() {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useI18n();

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
      { threshold: 0.2 }
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
  }, []);

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

function CoursesGrid() {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useI18n();

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
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
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
  }, []);

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
          {courseItems.map((course, index) => {
            const { Icon, key } = course;
            return (
              <article
                key={key}
                className={`training-course-card mouse-depth-card ${isVisible ? 'training-course-card--visible' : ''}`}
                style={{ transitionDelay: `${index * 80}ms` }}
              >
                <div className="training-course-card__visual" aria-hidden="true">
                  <div className="training-course-card__visual-inner">
                    <Icon />
                  </div>
                </div>
                <div className="training-course-card__body">
                  <h3 className="training-course-card__title">{t(`training.courses.${key}.title`)}</h3>
                  <p className="training-course-card__summary">{t(`training.courses.${key}.summary`)}</p>
                  <dl className="training-course-card__meta">
                    <div className="training-course-card__meta-item">
                      <dt>{t('training.meta.duration')}</dt>
                      <dd>{t('training.meta.comingSoon')}</dd>
                    </div>
                    <div className="training-course-card__meta-item">
                      <dt>{t('training.meta.level')}</dt>
                      <dd>{t('training.meta.comingSoon')}</dd>
                    </div>
                  </dl>
                  <button type="button" className="training-course-card__button" disabled>
                    {t('training.learnMore')}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function TrainingCta() {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const { t } = useI18n();

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
      { threshold: 0.2 }
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
  }, []);

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
    </>
  );
}

export default TrainingPage;
