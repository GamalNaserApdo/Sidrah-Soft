/**
 * useStaticPageSEO — hook to resolve CMS SEO → seo.js fallback.
 *
 * Usage:
 *   const { seo, loading } = useStaticPageSEO('home', lang);
 *
 * Returns an object with resolved SEO values:
 *   { title, description, ogTitle, ogDescription, ogImage, canonical, robotsIndex, robotsFollow }
 *
 * Resolution order:
 *   1. CMS StaticPageSEO (if populated)
 *   2. seo.js PAGES.* (fallback)
 */

import { useState, useEffect } from 'react';
import { getStaticPageSEO } from '../services/staticSeoApi';
import { resolvePageSEO } from '../config/seo';

export function useStaticPageSEO(pageKey, lang) {
  const [seoData, setSeoData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getStaticPageSEO().then((data) => {
      if (!mounted) return;
      setSeoData(data);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const fallback = resolvePageSEO(pageKey, lang);
  const cms = seoData?.[pageKey];
  const isAr = lang === 'ar';

  // Resolve each field: CMS value if populated, otherwise seo.js fallback
  const seo = {
    title: (cms && (isAr ? cms.seo_title_ar : cms.seo_title_en)) || fallback.title,
    description: (cms && (isAr ? cms.meta_description_ar : cms.meta_description_en)) || fallback.description,
    ogTitle: (cms && (isAr ? cms.og_title_ar : cms.og_title_en)) || fallback.title,
    ogDescription: (cms && (isAr ? cms.og_description_ar : cms.og_description_en)) || fallback.description,
    ogImage: (cms && cms.og_image_url) || fallback.ogImage,
    canonical: (cms && cms.canonical_path) || fallback.canonical,
    robotsIndex: cms ? cms.robots_index : true,
    robotsFollow: cms ? cms.robots_follow : true,
    keywords: fallback.keywords,
  };

  return { seo, loading };
}
