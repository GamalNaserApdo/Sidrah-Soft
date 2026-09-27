import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { useI18n } from '../i18n/I18nProvider';
import { useStaticPageSEO } from '../hooks/useStaticPageSEO';
import { listPrograms } from '../services/trainingApi';
import { formatPrice } from '../utils/formatPrice';

/**
 * Sidrah Starter Courses — public listing page.
 *
 * Third product path under /training: beginner, from-zero courses.
 * Cards show level / duration / sessions / the live full-course price
 * (Starter pricing is public — unlike Professional "coming soon").
 */
function StarterCourseCard({ course, isAr }) {
  const title = isAr ? course.title_ar : course.title_en;
  const summary = isAr ? course.short_description_ar : course.short_description_en;
  const duration = isAr ? course.duration_ar : course.duration_en;
  const format = isAr ? course.format_ar : course.format_en;
  const ctaLabel = isAr ? 'عرض الكورس' : 'View Course';
  const price = course.current_price ? parseFloat(course.current_price) : null;

  return (
    <Link
      to={`/training/${course.slug}`}
      className="training-course-card training-course-card--visible starter-course-card"
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
        <span className="training-course-card__category-chip">
          {isAr ? 'كورس للمبتدئين' : 'Starter Course'}
        </span>
        <h3 className="training-course-card__title">{title}</h3>
        <p className="training-course-card__summary">{summary}</p>
        <div className="starter-course-card__meta">
          <span className="starter-course-card__badge">{isAr ? 'مبتدئ / من الصفر' : 'Beginner / From Zero'}</span>
          {duration && <span className="starter-course-card__badge">{duration}</span>}
          {format && <span className="starter-course-card__badge">{format}</span>}
        </div>
        {price != null && price > 0 && (
          <p className="starter-course-card__price">
            {formatPrice(price, isAr ? 'ar' : 'en')}
            <span className="starter-course-card__price-note">
              {isAr ? ' للكورس كاملًا' : ' for the full course'}
            </span>
          </p>
        )}
        <span className="training-course-card__cta">
          {ctaLabel}
          <span className="training-course-card__cta-arrow" aria-hidden="true">{isAr ? '←' : '→'}</span>
        </span>
      </div>
    </Link>
  );
}

function StarterCoursesPage() {
  const { lang, dir } = useI18n();
  const isAr = lang === 'ar';
  const { seo } = useStaticPageSEO('trainingStarter', lang);

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const data = await listPrograms({ branch: 'starter' });
        if (mounted) {
          setCourses(Array.isArray(data) ? data : []);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err);
          setCourses([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <>
      <SEO
        {...seo}
        breadcrumbItems={[
          { name: isAr ? 'الرئيسية' : 'Home', url: '/' },
          { name: isAr ? 'التدريب والتعليم' : 'Training & Education', url: '/training' },
          { name: isAr ? 'كورسات Sidrah للمبتدئين' : 'Sidrah Starter Courses' },
        ]}
      />
      <Header />
      <main className="secondary-page starter-page" dir={dir}>
        <section className="secondary-hero">
          <div className="secondary-hero__content">
            <span className="secondary-hero__eyebrow">
              {isAr ? 'كورسات Sidrah للمبتدئين' : 'Sidrah Starter Courses'}
            </span>
            <h1 className="secondary-hero__title">
              {isAr ? 'ابدأ مجالك من الصفر' : 'Start Your Field from Zero'}
            </h1>
            <p className="secondary-hero__subtitle">
              {isAr
                ? 'كورسات تأسيسية للمبتدئين — 6 أسابيع، 12 جلسة مباشرة، ومشروع عملي. السعر موضّح في بطاقة كل كورس.'
                : 'Beginner foundation courses — 6 weeks, 12 live sessions, and a practical final project. Each course price is shown on its card.'}
            </p>
            <div className="secondary-hero__ctas">
              <Link to="/training" className="secondary-hero__cta secondary-hero__cta--secondary">
                {isAr ? '← كل مسارات التدريب' : '← All Training Paths'}
              </Link>
            </div>
          </div>
        </section>

        <section className="secondary-section">
          <div className="secondary-section__content">
            <h2 className="secondary-section__heading">
              {isAr ? 'الكورسات المتاحة' : 'Available Starter Courses'}
            </h2>
            {loading && <p className="secondary-loading">{isAr ? 'جارٍ التحميل...' : 'Loading...'}</p>}
            {error && (
              <div className="secondary-error">
                <p>{isAr ? 'تعذر تحميل الكورسات' : 'Failed to load courses'}</p>
              </div>
            )}
            {!loading && !error && courses.length === 0 && (
              <div className="secondary-empty">
                <p>{isAr ? 'لا توجد كورسات متاحة حاليًا.' : 'No courses are currently available.'}</p>
              </div>
            )}
            {!loading && !error && courses.length > 0 && (
              <div className="training-courses__grid starter-courses__grid">
                {courses.map((course) => (
                  <StarterCourseCard key={course.slug} course={course} isAr={isAr} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default StarterCoursesPage;
