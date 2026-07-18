import { useEffect, useState } from 'react';
import { useI18n } from '../i18n/I18nProvider';
import { getJobs } from '../services/careersApi';
import getBilingual from '../utils/getBilingual';

function normalizeJob(job, lang) {
  const title = getBilingual(job.title, lang);
  const department = getBilingual(job.department, lang);
  const location = getBilingual(job.location, lang);
  const shortDescription = getBilingual(job.short_description, lang);
  const description = job.description ? getBilingual(job.description, lang) : '';
  const responsibilities = job.responsibilities
    ? getBilingual(job.responsibilities, lang)
    : '';
  const requirements = job.requirements
    ? getBilingual(job.requirements, lang)
    : '';
  const preferredQualifications = job.preferred_qualifications
    ? getBilingual(job.preferred_qualifications, lang)
    : '';
  const benefits = job.benefits ? getBilingual(job.benefits, lang) : '';
  const seo = job.seo
    ? {
        title: getBilingual(job.seo.title, lang),
        description: getBilingual(job.seo.description, lang),
      }
    : { title: '', description: '' };

  return {
    id: job.id,
    slug: job.slug,
    title,
    department,
    location,
    shortDescription,
    description,
    responsibilities,
    requirements,
    preferredQualifications,
    benefits,
    employmentType: job.employment_type || '',
    workplaceType: job.workplace_type || '',
    experienceLevel: job.experience_level || '',
    applicationMethod: job.application?.method || 'contact_page',
    applicationUrl: job.application?.url || '#contact',
    applicationEmail: job.application?.email || '',
    postedDate: job.posted_date || null,
    closingDate: job.closing_date || null,
    displayOrder: job.display_order ?? 0,
    isFeatured: job.is_featured ?? false,
    showOnHomepage: job.show_on_homepage ?? false,
    seo,
  };
}

function isValid(data) {
  return Array.isArray(data) && data.length > 0;
}

/**
 * Fetch active jobs from the CMS.
 *
 * @param {object} [options={}] - Hook options.
 * @param {object} [options.filters={}] - Query filters (e.g. { show_on_homepage: true }).
 * @returns {{ jobs: Array|null, loading: boolean, error: Error|null }}
 *   Returns `null` until valid data is received. Consumers should render their
 *   own hardcoded fallback when the returned value is null.
 */
export function useJobs({ filters = {} } = {}) {
  const { lang } = useI18n();
  const [jobs, setJobs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    getJobs(filters, { signal: controller.signal })
      .then((data) => {
        if (isValid(data)) {
          setJobs(data.map((job) => normalizeJob(job, lang)));
        }
      })
      .catch((err) => {
        if (err?.status !== 0) {
          setError(err);
          console.error('Jobs fetch failed:', err.message);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [lang, JSON.stringify(filters)]);

  return { jobs, loading, error };
}
