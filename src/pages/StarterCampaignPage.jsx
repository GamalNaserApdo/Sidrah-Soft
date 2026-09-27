/**
 * /training/starter/register — public Starter campaign landing page.
 *
 * Thin data-loading wrapper around the shared StarterCampaignRenderer.
 * Sections come from the Page Builder:
 *   - default: PUBLISHED payload (GET /api/v1/training/starter-page/)
 *   - ?preview=<signed-token>: DRAFT payload for CMS preview — submission
 *     is inert, no registrations are created.
 * If the sections request fails the page falls back to the compiled
 * default layout (hero + registration form) so registration never breaks.
 */
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { useI18n } from '../i18n/I18nProvider';
import {
  listPrograms,
  getStarterPage,
  getStarterPagePreview,
} from '../services/trainingApi';
import { apiFetch } from '../services/apiClient';
import StarterCampaignRenderer from '../components/starterCampaign/StarterCampaignRenderer';

// Safety net only — the backend serves the same compiled default when no
// published page row exists. Used only if the starter-page endpoint fails.
const FALLBACK_SECTIONS = [
  {
    id: 'hero',
    type: 'hero',
    enabled: true,
    props: {
      badge_en: 'Beginner Course — From Zero',
      badge_ar: 'كورس للمبتدئين — من الصفر',
      title_en: 'Start Your Field from Zero with Sidrah Soft',
      title_ar: 'ابدأ مجالك من الصفر مع Sidrah Soft',
      tagline_en: '6 weeks · 12 live sessions · 2 per week · from zero',
      tagline_ar: '6 أسابيع · 12 جلسة مباشرة · جلستين أسبوعيًا · من الصفر',
      brand_en: 'Sidrah Soft — Enter The Next Era.',
      brand_ar: 'Sidrah Soft — ادخل الحقبة القادمة.',
      cta_en: 'Register Now',
      cta_ar: 'سجّل الآن',
      price_display: 'shared',
    },
  },
  { id: 'register', type: 'registration_form', enabled: true, props: {} },
];

export default function StarterCampaignPage() {
  const { lang } = useI18n();
  const isAr = lang === 'ar';
  const [searchParams] = useSearchParams();
  const previewToken = searchParams.get('preview') || '';
  const isPreview = Boolean(previewToken);

  const [sections, setSections] = useState(null);
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState(null);
  const [formConfig, setFormConfig] = useState(null);

  const loadCourses = useCallback(async () => {
    setCoursesLoading(true);
    setCoursesError(null);
    try {
      const data = await listPrograms({ branch: 'starter' });
      const list = Array.isArray(data) ? data : (data.results || []);
      setCourses(list);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('[StarterCampaignPage] Failed to load Starter courses', err);
      }
      setCourses([]);
      setCoursesError(err);
    } finally {
      setCoursesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  // Page-builder sections: published by default, draft when a valid
  // CMS preview token is present.
  useEffect(() => {
    let cancelled = false;
    const loader = isPreview ? getStarterPagePreview(previewToken) : getStarterPage();
    loader
      .then((data) => {
        if (cancelled) return;
        const list = data?.sections;
        setSections(Array.isArray(list) && list.length ? list : FALLBACK_SECTIONS);
      })
      .catch(() => {
        if (!cancelled) setSections(FALLBACK_SECTIONS);
      });
    return () => { cancelled = true; };
  }, [isPreview, previewToken]);

  // Fetch shared Starter form configuration. On failure the page
  // falls back to the hardcoded copy — registration must never
  // be blocked by a missing config endpoint.
  useEffect(() => {
    let cancelled = false;
    apiFetch('/api/v1/training/starter-form-config/')
      .then((data) => {
        if (!cancelled) setFormConfig(data);
      })
      .catch(() => {
        // Silently fall back to hardcoded defaults.
      });
    return () => { cancelled = true; };
  }, []);

  const seoTitle = isAr ? 'كورسات Sidrah Starter | التسجيل' : 'Sidrah Starter Courses | Registration';
  const seoDescription = isAr
    ? 'ابدأ مجالك من الصفر مع Sidrah Soft. كورسات تدريبية عملية للمبتدئين — 6 أسابيع، 12 جلسة مباشرة، ومشروع تطبيقي نهائي.'
    : 'Start your field from zero with Sidrah Soft. Practical beginner training courses — 6 weeks, 12 live sessions, and a practical final project.';

  return (
    <>
      <SEO
        title={seoTitle}
        description={seoDescription}
        robotsIndex={false}
        ogTitle={seoTitle}
        ogDescription={seoDescription}
      />
      <Header />

      {sections && (
        <StarterCampaignRenderer
          sections={sections}
          courses={courses}
          coursesLoading={coursesLoading}
          coursesError={coursesError}
          onRetryCourses={loadCourses}
          formConfig={formConfig}
          isPreview={isPreview}
        />
      )}

      <Footer />
    </>
  );
}
