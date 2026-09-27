import { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../Header';
import Footer from '../Footer';
import MagneticButton from '../MagneticButton';
import SEO from '../SEO';
import { useI18n } from '../../i18n/I18nProvider.jsx';
import { useStaticPageSEO } from '../../hooks/useStaticPageSEO';
import { listPrograms, fetchOffers } from '../../services/trainingApi';

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
  const { lang, t } = useI18n();
  const isAr = lang === 'ar';

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
          <Link to="/training/summer-training" className={`training-track-card ${isVisible ? 'training-track-card--visible' : ''}`}>
            <h3 className="training-track-card__title">
              {isAr ? 'التدريب الصيفي' : 'Summer Training'}
            </h3>
            <p className="training-track-card__description">
              {isAr
                ? 'تدريب صيفي عملي داخل بيئة شركة برمجيات حقيقية — جلسات تطبيقية ومشاريع وإشراف.'
                : 'Hands-on summer training inside a real software company environment — practical sessions, projects, and mentorship.'}
            </p>
            <span className="training-track-card__cta">
              {isAr ? 'سجل في التدريب الصيفي' : 'Register for Summer Training'}
              <span aria-hidden="true">{isAr ? ' ←' : ' →'}</span>
            </span>
          </Link>
          <Link to="/training#professional-courses" className={`training-track-card ${isVisible ? 'training-track-card--visible' : ''}`}>
            <h3 className="training-track-card__title">
              {isAr ? 'الكورسات الاحترافية' : 'Professional Courses'}
            </h3>
            <p className="training-track-card__description">
              {isAr
                ? 'دورات مكثفة بناءً على احتياجات سوق العمل لتأهيلك للعمل في شركات البرمجيات.'
                : 'Intensive courses built on market needs to prepare you for work in software companies.'}
            </p>
            <span className="training-track-card__cta">
              {isAr ? 'استكشف الكورسات' : 'Explore Courses'}
              <span aria-hidden="true">{isAr ? ' ←' : ' →'}</span>
            </span>
          </Link>
          <Link to="/training/starter" className={`training-track-card ${isVisible ? 'training-track-card--visible' : ''}`}>
            <h3 className="training-track-card__title">
              {isAr ? 'كورسات Sidrah للمبتدئين' : 'Sidrah Starter Courses'}
            </h3>
            <p className="training-track-card__description">
              {isAr
                ? 'ابدأ مجالك من الصفر — 6 أسابيع، 12 جلسة مباشرة، ومشروع عملي.'
                : 'Start from zero — 6 weeks, 12 live sessions, and a practical final project.'}
            </p>
            <span className="training-track-card__cta">
              {isAr ? 'استكشف كورسات البداية' : 'Explore Starter Courses'}
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
  const title = isAr ? course.title_ar : course.title_en;
  const summary = isAr ? course.short_description_ar : course.short_description_en;
  const ctaLabel = isAr ? 'استكشف الكورس' : 'Explore Course';

  return (
    <Link
      to={`/training/${course.slug}`}
      className={`training-course-card ${isVisible ? 'training-course-card--visible' : ''}`}
      style={{ transitionDelay: `${index * 80}ms` }}
      aria-label={`${ctaLabel}: ${title}`}
    >
      <div className="training-course-card__image-wrapper">
        {course.image_url && (
          <img
            src={course.image_url}
            alt={title}
            className="training-course-card__image"
            loading="lazy"
          />
        )}
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
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listPrograms({ branch: 'professional' });
      setCourses(data.results || data);
    } catch (err) {
      setError(err.message || (isAr ? 'تعذر تحميل الدورات' : 'Failed to load courses'));
    } finally {
      setLoading(false);
    }
  }, [isAr]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <section ref={sectionRef} className="training-courses" id="professional-courses">
      <div className="training-courses__content">
        <h2 className={`training-courses__headline ${isVisible ? 'training-courses__headline--visible' : ''}`}>
          {isAr ? 'الكورسات الاحترافية' : 'Professional Courses'}
        </h2>
        <p className={`training-courses__description ${isVisible ? 'training-courses__description--visible' : ''}`}>
          {isAr
            ? 'منهجية مركزة حول التقنيات والممارسات التي تدفع فرق البرمجيات الحديثة.'
            : 'A focused curriculum built around the technologies and practices that drive modern software teams.'}
        </p>
        {loading && (
          <div className="training-courses__loading">
            <p>{isAr ? 'جاري تحميل الدورات...' : 'Loading courses...'}</p>
          </div>
        )}
        {error && (
          <div className="training-courses__error">
            <p>{error}</p>
            <button onClick={load} className="training-courses__retry">
              {isAr ? 'إعادة المحاولة' : 'Retry'}
            </button>
          </div>
        )}
        {!loading && !error && (
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
        )}
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

function TrainingOffersBanner() {
  const { lang } = useI18n();
  const isAr = lang === 'ar';
  const [campaign, setCampaign] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchOffers()
      .then((data) => {
        if (cancelled) return;
        const found = (Array.isArray(data) ? data : []).find((c) => (c.items || []).length > 0);
        setCampaign(found || null);
      })
      .catch(() => {
        if (!cancelled) setCampaign(null);
      });
    return () => { cancelled = true; };
  }, []);

  if (!campaign) return null;

  const title = isAr ? (campaign.title_ar || campaign.title_en) : campaign.title_en;
  const badge = isAr ? (campaign.badge_ar || campaign.badge_en) : campaign.badge_en;
  const ctaLabel = isAr ? 'عرض جميع العروض' : 'View All Offers';

  return (
    <section className="training-offers-banner" id="training-offers-banner">
      <div className="training-offers-banner__content">
        {badge && <span className="training-offers-banner__badge">{badge}</span>}
        <h2 className="training-offers-banner__title">{title}</h2>
        <p className="training-offers-banner__text">
          {isAr
            ? `عروض محدودة على ${campaign.items.length} من برامجنا التدريبية.`
            : `Limited-time offers across ${campaign.items.length} of our training programs.`}
        </p>
        <Link to="/training/offers" className="training-offers-banner__cta">
          {ctaLabel}
          <span aria-hidden="true">{isAr ? ' ←' : ' →'}</span>
        </Link>
      </div>
    </section>
  );
}

function TrainingPage() {
  const { lang } = useI18n();
  const { seo } = useStaticPageSEO('training', lang);
  return (
    <>
      <SEO {...seo} />
      <Header />
      <main className="training-page">
        <TrainingHero />
        <TrackSelector />
        <TrainingOffersBanner />
        <CoursesGrid />
        <TrainingCta />
      </main>
      <Footer />
    </>
  );
}

export default TrainingPage;
