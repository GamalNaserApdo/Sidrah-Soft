import { useEffect, useState } from 'react';
import { useI18n } from '../i18n/I18nProvider';
import { getCaseStudies } from '../services/caseStudiesApi';
import getBilingual from '../utils/getBilingual';
import resolveMediaUrl from '../utils/resolveMediaUrl';

const PLACEHOLDER_IMAGE = '/assets/case-studies/placeholder.png';

function normalizeCaseStudy(study, lang) {
  const title = getBilingual(study.title, lang);
  const clientName = study.client?.name
    ? getBilingual(study.client.name, lang)
    : '';
  const industry = getBilingual(study.industry, lang);
  const excerpt = getBilingual(study.short_description, lang);
  const problem = study.problem ? getBilingual(study.problem, lang) : '';
  const solution = study.solution ? getBilingual(study.solution, lang) : '';
  const technologyText = study.technology
    ? getBilingual(study.technology, lang)
    : '';
  const technologies = technologyText
    ? technologyText.split(',').map((item) => item.trim()).filter(Boolean)
    : [];
  const outcome = study.outcome ? getBilingual(study.outcome, lang) : '';
  const coverImage = resolveMediaUrl(study.featured_image) || PLACEHOLDER_IMAGE;
  const logoUrl = resolveMediaUrl(study.logo);
  const projectUrl = study.project_url || '';
  const seo = study.seo
    ? {
        title: getBilingual(study.seo.title, lang),
        description: getBilingual(study.seo.description, lang),
      }
    : { title: '', description: '' };

  return {
    id: study.id,
    slug: study.slug,
    title,
    clientName,
    industry,
    excerpt,
    problem,
    solution,
    technologies,
    outcome,
    metrics: [],
    coverImage,
    logoUrl,
    projectUrl,
    openInNewTab: study.open_in_new_tab ?? true,
    projectYear: study.project_year || null,
    displayOrder: study.display_order ?? 0,
    featured: study.is_featured ?? false,
    showOnHomepage: study.show_on_homepage ?? false,
    seo,
  };
}

function isValid(data) {
  return Array.isArray(data) && data.length > 0;
}

/**
 * Fetch case studies from the CMS.
 *
 * @param {object} [options={}] - Hook options.
 * @param {object} [options.filters={}] - Query filters (e.g. { show_on_homepage: true }).
 * @returns {{ caseStudies: Array|null, loading: boolean, error: Error|null }}
 *   Returns `null` until valid data is received. Consumers should render their
 *   own hardcoded fallback when the returned value is null.
 */
export function useCaseStudies({ filters = {} } = {}) {
  const { lang } = useI18n();
  const [caseStudies, setCaseStudies] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    getCaseStudies(filters, { signal: controller.signal })
      .then((data) => {
        if (isValid(data)) {
          setCaseStudies(data.map((item) => normalizeCaseStudy(item, lang)));
        }
      })
      .catch((err) => {
        if (err?.status !== 0) {
          setError(err);
          console.error('Case studies fetch failed:', err.message);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [lang]);

  return { caseStudies, loading, error };
}
