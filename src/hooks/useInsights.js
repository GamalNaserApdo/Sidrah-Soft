import { useEffect, useState } from 'react';
import { useI18n } from '../i18n/I18nProvider';
import { getInsights } from '../services/insightsApi';
import getBilingual from '../utils/getBilingual';
import resolveMediaUrl from '../utils/resolveMediaUrl';

const PLACEHOLDER_IMAGE = '/assets/insights/placeholder.svg';

function normalizeArticle(article, lang) {
  const title = getBilingual(article.title, lang);
  const excerpt = getBilingual(article.excerpt, lang);
  const category = getBilingual(article.category, lang);
  const body = article.body ? getBilingual(article.body, lang) : '';
  const authorName = article.author?.name
    ? getBilingual(article.author.name, lang)
    : '';
  const coverImage = resolveMediaUrl(article.featured_image) || PLACEHOLDER_IMAGE;
  const publishedAt = article.published_at || null;
  const readTime = article.read_time_minutes ?? null;
  const seo = article.seo
    ? {
        title: getBilingual(article.seo.title, lang),
        description: getBilingual(article.seo.description, lang),
      }
    : { title: '', description: '' };

  return {
    id: article.id,
    slug: article.slug,
    contentType: article.content_type,
    title,
    excerpt,
    category,
    authorName,
    body,
    coverImage,
    publishedAt,
    readTime,
    displayOrder: article.display_order ?? 0,
    featured: article.is_featured ?? false,
    showOnHomepage: article.show_on_homepage ?? false,
    seo,
  };
}

function isValid(data) {
  return Array.isArray(data) && data.length > 0;
}

/**
 * Fetch insights/articles from the CMS.
 *
 * @param {object} [options={}] - Hook options.
 * @param {object} [options.filters={}] - Query filters (e.g. { show_on_homepage: true }).
 * @returns {{ articles: Array|null, loading: boolean, error: Error|null }}
 *   Returns `null` until valid data is received. Consumers should render their
 *   own hardcoded fallback when the returned value is null.
 */
export function useInsights({ filters = {} } = {}) {
  const { lang } = useI18n();
  const [articles, setArticles] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    getInsights(filters, { signal: controller.signal })
      .then((data) => {
        if (isValid(data)) {
          setArticles(data.map((item) => normalizeArticle(item, lang)));
        }
      })
      .catch((err) => {
        if (err?.status !== 0) {
          setError(err);
          console.error('Insights fetch failed:', err.message);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [lang]);

  return { articles, loading, error };
}

export function useInsight(slug) {
  const { lang } = useI18n();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    import('../services/insightsApi')
      .then(({ getInsight }) =>
        getInsight(slug, { signal: controller.signal })
      )
      .then((data) => {
        if (data && data.slug) {
          setArticle(normalizeArticle(data, lang));
        } else {
          setError({ status: 404, message: 'Article not found' });
        }
      })
      .catch((err) => {
        if (err?.status !== 0) {
          setError(err);
          console.error('Insight detail fetch failed:', err.message);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [slug, lang]);

  return { article, loading, error };
}
