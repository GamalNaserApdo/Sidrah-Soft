import { useEffect, useState, useCallback } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { useI18n } from '../i18n/I18nProvider';
import { getProgramBySlug, getProgramPreview, resolveRegistrationUrl } from '../services/trainingApi';
import { transformProgramData } from '../utils/transformProgramData';

import {
  CourseHero,
  CourseIntroVideo,
  CourseOverview,
  CourseLearningOutcomes,
  CourseCurriculum,
  CourseDetails,
  CourseTargetAudience,
  CourseTools,
  CoursePractical,
  CourseTrainingExperience,
  CourseInstructors,
  CourseTestimonials,
  CoursePricing,
  CourseFAQ,
  CourseRegistrationForm,
  CourseFinalCTA,
  StickyRegisterBar,
  CourseBreadcrumb,
  CourseMiniCTA,
} from '../components/courseLanding';

function CourseDetailPage() {
  const { courseSlug } = useParams();
  const { lang, dir } = useI18n();
  const isAr = lang === 'ar';
  const [searchParams, setSearchParams] = useSearchParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      // Check for preview token (from CMS preview button)
      const previewToken = searchParams.get('preview');
      let apiData;
      if (previewToken) {
        apiData = await getProgramPreview(courseSlug, previewToken);
        // Clean the preview token from the URL after successful load
        // (security: don't leave the token in the address bar)
        setSearchParams({}, { replace: true });
      } else {
        apiData = await getProgramBySlug(courseSlug);
      }
      const transformed = transformProgramData(apiData);
      if (!transformed) {
        setNotFound(true);
      } else {
        setData(transformed);
      }
    } catch (err) {
      if (err.status === 404) {
        setNotFound(true);
      } else {
        setError(err.message || (isAr ? 'تعذر تحميل البيانات' : 'Failed to load data'));
      }
    } finally {
      setLoading(false);
    }
  }, [courseSlug, searchParams, isAr]);

  useEffect(() => {
    load();
  }, [load]);

  // Loading state
  if (loading) {
    return (
      <>
        <SEO
          title={isAr ? 'تحميل... | SidrahSoft' : 'Loading... | SidrahSoft'}
        />
        <Header />
        <main className="course-landing-page" dir={dir}>
          <div className="course-landing-loading">
            <div className="course-landing-loading__spinner" />
            <p>{isAr ? 'جاري تحميل الكورس...' : 'Loading course...'}</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Error state (not 404 — actual connection error)
  if (error) {
    return (
      <>
        <SEO
          title={isAr ? 'خطأ | SidrahSoft' : 'Error | SidrahSoft'}
        />
        <Header />
        <main className="course-landing-page" dir={dir}>
          <div className="course-landing-error">
            <h1>{isAr ? 'تعذر تحميل الكورس' : 'Unable to load course'}</h1>
            <p>{error}</p>
            <button onClick={load} className="course-landing-error__retry">
              {isAr ? 'إعادة المحاولة' : 'Retry'}
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // 404 — invalid slug or not found
  if (notFound || !data || !data.course || !data.landing) {
    return (
      <>
        <SEO
          title={isAr ? 'الكورس غير موجود | SidrahSoft' : 'Course Not Found | Sidrah Soft'}
          description={isAr ? 'لم يتم العثور على هذا الكورس.' : 'This course was not found.'}
          canonical="/training"
          robotsIndex={false}
          robotsFollow={true}
        />
        <Header />
        <main className="course-detail-page" dir={dir}>
          <section className="course-detail-not-found">
            <div className="course-detail-not-found__content">
              <h1 className="course-detail-not-found__title">
                {isAr ? 'الكورس غير موجود' : 'Course Not Found'}
              </h1>
              <p className="course-detail-not-found__text">
                {isAr
                  ? 'لم نتمكن من العثور على الكورس الذي تبحث عنه. تصفح جميع الدورات التدريبية المتاحة.'
                  : 'We could not find the course you are looking for. Browse all available training courses.'}
              </p>
              <Link to="/training" className="course-detail-back-btn">
                {isAr ? '→ العودة إلى الدورات' : '← Back to Courses'}
              </Link>
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  const { course, landing } = data;
  const title = isAr ? course.titleAr : course.titleEn;
  const shortDesc = isAr ? course.shortDescriptionAr : course.shortDescriptionEn;
  // CMS landing SEO fields take priority. Fallback uses a keyword-targeted
  // pattern aligned with the P1 SEO strategy ("Course Egypt" intent).
  const seoTitle = landing.seoTitle && (isAr ? landing.seoTitle.ar : landing.seoTitle.en) || `${title} Course Egypt | Sidrah Soft`;
  const seoDescription = landing.seoDescription && (isAr ? landing.seoDescription.ar : landing.seoDescription.en) || shortDesc;

  const registrationUrl = resolveRegistrationUrl(course);

  // Canonical: if the CMS landing provides a canonical_slug override, use it.
  // Otherwise fall back to the actual program slug.
  // canonical_slug is a relative path component (e.g. "my-old-course"), so
  // it resolves to /training/{canonical_slug}. Empty/whitespace values are
  // ignored. Absolute URLs or malformed values are rejected for safety.
  const canonicalSlugRaw = (landing.canonicalSlug || '').trim();
  const canonicalSlugValid = canonicalSlugRaw &&
    !canonicalSlugRaw.startsWith('http') &&
    !canonicalSlugRaw.includes('://') &&
    /^[a-zA-Z0-9_-]+$/.test(canonicalSlugRaw);
  const canonicalPath = canonicalSlugValid
    ? `/training/${canonicalSlugRaw}`
    : `/training/${course.slug}`;

  // Course structured data (only with verified data)
  const courseJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: title,
    description: seoDescription,
    provider: {
      '@type': 'Organization',
      name: 'Sidrah Soft',
      sameAs: 'https://sidrahsoft.com',
    },
    url: `https://sidrahsoft.com${canonicalPath}`,
    ...(course.image ? { image: course.image } : {}),
  };

  // FAQPage structured data — only when visible FAQ items exist.
  // Schema FAQ text must match the public visible FAQ content (same data source).
  // Omitted entirely when no FAQ exists. EN/AR uses the rendered language content.
  const faqItems = landing?.faq || [];
  const faqJsonLd = faqItems.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => {
      const question = isAr ? item.question.ar : item.question.en;
      const answer = isAr ? item.answer.ar : item.answer.en;
      return {
        '@type': 'Question',
        name: question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: answer,
        },
      };
    }),
  } : null;

  // Combine Course and FAQPage JSON-LD (breadcrumb is auto-appended by SEO.jsx)
  const allJsonLd = faqJsonLd ? [courseJsonLd, faqJsonLd] : courseJsonLd;

  return (
    <>
      <SEO
        title={seoTitle}
        description={seoDescription}
        ogTitle={seoTitle}
        ogDescription={seoDescription}
        ogImage={course.image || undefined}
        canonical={canonicalPath}
        robotsIndex={!landing.seoNoindex}
        breadcrumbItems={[
          { name: isAr ? 'الرئيسية' : 'Home', url: '/' },
          { name: isAr ? 'التدريب' : 'Training', url: '/training' },
          { name: title },
        ]}
        jsonLd={allJsonLd}
      />
      <Header />
      <main className="course-landing-page" dir={dir}>
        <CourseBreadcrumb course={course} />
        <CourseHero course={course} landing={landing} registrationUrl={registrationUrl} />
        <CourseIntroVideo course={course} landing={landing} />
        <CourseOverview course={course} />
        <CourseLearningOutcomes landing={landing} />
        <CourseMiniCTA registrationUrl={registrationUrl} />
        <CourseCurriculum landing={landing} />
        <CourseMiniCTA registrationUrl={registrationUrl} />
        <CourseDetails landing={landing} />
        <CourseTargetAudience landing={landing} />
        <CourseTools landing={landing} />
        <CoursePractical landing={landing} />
        <CourseTrainingExperience landing={landing} />
        <CourseInstructors landing={landing} />
        <CourseTestimonials landing={landing} />
        <CoursePricing course={course} landing={landing} registrationUrl={registrationUrl} />
        <CourseFAQ landing={landing} />
        <CourseRegistrationForm program={data} slug={courseSlug} />
        <CourseFinalCTA course={course} landing={landing} registrationUrl={registrationUrl} />
      </main>
      <Footer />
      <StickyRegisterBar course={course} landing={landing} registrationUrl={registrationUrl} />
    </>
  );
}

export default CourseDetailPage;
