import { useEffect } from 'react';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { SITE, getOrganizationJsonLd } from '../config/seo';
import resolveMediaUrl from '../utils/resolveMediaUrl';

const MANAGED_META = [
  { attr: 'name', value: 'description' },
  { attr: 'name', 'value': 'keywords' },
  { attr: 'name', value: 'robots' },
  { attr: 'property', value: 'og:title' },
  { attr: 'property', value: 'og:description' },
  { attr: 'property', value: 'og:type' },
  { attr: 'property', value: 'og:url' },
  { attr: 'property', value: 'og:image' },
  { attr: 'name', value: 'twitter:card' },
  { attr: 'name', value: 'twitter:title' },
  { attr: 'name', value: 'twitter:description' },
  { attr: 'name', value: 'twitter:image' },
];

function setMeta(attr, value, content) {
  let el = document.querySelector(`meta[${attr}="${value}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, value);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function removeMeta(attr, value) {
  const el = document.querySelector(`meta[${attr}="${value}"]`);
  if (el) el.remove();
}

function removeLink(rel) {
  const el = document.querySelector(`link[rel="${rel}"]`);
  if (el) el.remove();
}

function removeJsonLd() {
  document.querySelectorAll('script[type="application/ld+json"]').forEach(el => el.remove());
}

function setLink(rel, href) {
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function setJsonLd(data) {
  let script = document.querySelector('script[type="application/ld+json"]');
  if (!script) {
    script = document.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

function SEO({
  title,
  description,
  keywords,
  ogTitle,
  ogDescription,
  ogImage,
  canonical,
  robotsIndex,
  robotsFollow,
  articleData,
  breadcrumbItems,
  jsonLd,
}) {
  const { settings } = useSiteSettings();

  const siteName = settings?.general?.site_name || SITE.name;
  const defaultTitle = settings?.seo?.default_meta_title || SITE.defaultTitle;
  const defaultDescription = settings?.seo?.default_meta_description || SITE.defaultDescription;
  const defaultOgTitle = settings?.seo?.default_og_title || defaultTitle;
  const defaultOgDescription = settings?.seo?.default_og_description || defaultDescription;
  const defaultOgImage = resolveMediaUrl(settings?.seo?.default_og_image_url) || SITE.ogImage;
  const defaultKeywords = SITE.keywords;
  const defaultCanonical = '/';
  const globalRobotsIndex = settings?.seo?.robots_index ?? true;
  const canonicalBaseUrl = settings?.seo?.canonical_base_url || SITE.baseUrl;
  const twitterCardType = settings?.seo?.twitter_card_type || SITE.twitterCard;
  const orgDescription = settings?.seo?.organization_description || SITE.defaultDescription;

  const pageTitle = title || defaultTitle;
  const pageDescription = description || defaultDescription;
  const pageKeywords = keywords || defaultKeywords;
  const pageOgTitle = ogTitle || defaultOgTitle;
  const pageOgDescription = ogDescription || defaultOgDescription;
  const pageOgImage = ogImage || defaultOgImage;
  const pageCanonical = canonical || defaultCanonical;

  const fullTitle = pageTitle.includes('|') ? pageTitle : `${pageTitle} | ${siteName}`;
  const absoluteUrl = pageCanonical.startsWith('http')
    ? pageCanonical
    : `${canonicalBaseUrl}${pageCanonical}`;
  const absoluteOgImage = pageOgImage.startsWith('http')
    ? pageOgImage
    : `${canonicalBaseUrl}${pageOgImage}`;

  const isIndexable = (robotsIndex !== undefined ? robotsIndex : true) && globalRobotsIndex;
  const shouldFollow = robotsFollow !== undefined ? robotsFollow : true;
  const robotsContent = `${isIndexable ? 'index' : 'noindex'}, ${shouldFollow ? 'follow' : 'nofollow'}`;

  const organizationJsonLd = settings
    ? {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: siteName,
        url: canonicalBaseUrl,
        logo: resolveMediaUrl(settings?.branding?.primary_logo_url) || `${canonicalBaseUrl}${SITE.logo}`,
        description: orgDescription,
        email: settings?.contact?.contact_email || SITE.email,
        sameAs: [
          settings?.social?.linkedin_url,
          settings?.contact?.whatsapp_url,
          settings?.social?.x_url,
          settings?.social?.facebook_url,
          settings?.social?.instagram_url,
          settings?.social?.youtube_url,
        ].filter(Boolean),
      }
    : getOrganizationJsonLd();

  const articleJsonLd = articleData
    ? {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: articleData.title || pageTitle,
        description: articleData.description || pageDescription,
        image: absoluteOgImage,
        datePublished: articleData.datePublished || undefined,
        dateModified: articleData.dateModified || undefined,
        author: articleData.author
          ? { '@type': 'Person', name: articleData.author }
          : undefined,
        publisher: {
          '@type': 'Organization',
          name: siteName,
          logo: resolveMediaUrl(settings?.branding?.primary_logo_url) || `${canonicalBaseUrl}${SITE.logo}`,
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': absoluteUrl,
        },
      }
    : null;

  const breadcrumbJsonLd = breadcrumbItems && breadcrumbItems.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbItems.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url ? (item.url.startsWith('http') ? item.url : `${canonicalBaseUrl}${item.url}`) : undefined,
        })),
      }
    : null;

  const combinedJsonLd = jsonLd || articleJsonLd || organizationJsonLd;

  useEffect(() => {
    document.title = fullTitle;

    setMeta('name', 'description', pageDescription);
    setMeta('name', 'keywords', pageKeywords);
    setMeta('name', 'robots', robotsContent);

    setMeta('property', 'og:title', pageOgTitle.includes('|') ? pageOgTitle : `${pageOgTitle} | ${siteName}`);
    setMeta('property', 'og:description', pageOgDescription);
    setMeta('property', 'og:type', articleData ? 'article' : 'website');
    setMeta('property', 'og:url', absoluteUrl);
    setMeta('property', 'og:image', absoluteOgImage);

    setMeta('name', 'twitter:card', twitterCardType);
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', pageDescription);
    setMeta('name', 'twitter:image', absoluteOgImage);

    setLink('canonical', absoluteUrl);

    const jsonLdItems = [combinedJsonLd];
    if (breadcrumbJsonLd) jsonLdItems.push(breadcrumbJsonLd);

    setJsonLd(jsonLdItems.length > 1 ? jsonLdItems : combinedJsonLd);

    return () => {
      // Clean up managed meta tags on unmount to prevent stale metadata
      MANAGED_META.forEach(({ attr, value }) => removeMeta(attr, value));
      // Clean up canonical link
      removeLink('canonical');
      // Clean up JSON-LD scripts
      removeJsonLd();
      // Reset title to a safe default
      document.title = SITE.defaultTitle;
    };
  }, [
    fullTitle,
    pageDescription,
    pageKeywords,
    pageOgTitle,
    pageOgDescription,
    absoluteUrl,
    absoluteOgImage,
    robotsContent,
    twitterCardType,
    siteName,
    articleData,
    combinedJsonLd,
    breadcrumbJsonLd,
  ]);

  return null;
}

export default SEO;
