# SEO Foundation

This document describes the technical SEO foundation implemented for the SidrahSoft website.

---

## Goals

- Provide a clean, reusable SEO architecture before content expansion and CMS integration.
- Avoid duplicate title tags, duplicate descriptions, and invalid structured data.
- Keep the implementation lightweight and dependency-free.
- Leave clear placeholders for the final domain, OG images, and social links.

---

## File Structure

```text
index.html                        # Static SEO defaults (title, meta, OG, Twitter, JSON-LD)
public/
  sitemap.xml                     # Static sitemap
  robots.txt                      # Robots rules + sitemap reference
src/
  config/seo.js                   # Site + page SEO config
  components/SEO.jsx              # Reusable head-management component
  i18n/I18nProvider.jsx           # No longer overrides document.title
  App.jsx                         # Uses SEO for Home
  components/pages/TrainingPage.jsx # Uses SEO for Training
```

---

## Metadata Strategy

### Global defaults (`index.html`)

The static HTML contains the default metadata for the home page:

- `<title>` — `Sidrah Soft | Business Automation`
- `<meta name="description">` — primary description
- `<meta name="keywords">` — primary keywords
- `<meta name="robots" content="index, follow">`
- canonical link
- Open Graph tags
- Twitter/X card tags
- Organization JSON-LD

These defaults are used by crawlers and social scrapers before the SPA hydrates.

### Per-page metadata (`src/components/SEO.jsx`)

The `SEO` component updates the document head at runtime:

```jsx
<SEO
  title="Professional Training Programs | Sidrah Soft"
  description="..."
  keywords="..."
  ogImage="/assets/og-training.png"
  canonical="/training"
  jsonLd={organizationJsonLd}
/>
```

It updates:

- `document.title`
- `description`, `keywords`
- `og:title`, `og:description`, `og:type`, `og:url`, `og:image`
- `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
- `canonical` link
- JSON-LD script (Organization by default)

The helper functions reuse existing tags by selector if they exist, otherwise create new ones. This prevents duplicate tags.

### Page configuration (`src/config/seo.js`)

Centralized configuration for current and future routes:

- `SITE` — base URL, default title/description, keywords, OG image, Twitter card type, logo, email, social placeholders.
- `PAGES` — configurations for `home`, `training`, `insights`, and `caseStudies`.
- `getOrganizationJsonLd()` — reusable Organization JSON-LD.

New pages can be added to `PAGES` and rendered with `<SEO {...PAGES.pageName} />`.

---

## Canonical URL Strategy

- Production base URL: `https://sidrahsoft.com` (placeholder; update in `src/config/seo.js` when the final domain is known).
- Each page has a canonical path (e.g., `/`, `/training`, `/insights`, `/case-studies`).
- The `SEO` component builds the full canonical URL: `${SITE.baseUrl}${canonical}`.
- The canonical link is also present in `index.html` as a fallback.

Update later: change `SITE.baseUrl` in `src/config/seo.js` and all hardcoded URLs in `index.html`, `public/sitemap.xml`, and `public/robots.txt`.

---

## Open Graph & Twitter Images

- Default OG/Twitter image: `/assets/og-default.png` (placeholder).
- Page-specific placeholders: `/assets/og-training.png`, `/assets/og-insights.png`, `/assets/og-case-studies.png`.
- Replace these images in the `public/assets` directory when final assets are ready and update `src/config/seo.js` if paths change.

---

## Sitemap Strategy

`public/sitemap.xml` currently includes the two existing routes:

- `/`
- `/training`

Future CMS pages (insights, case studies, blog posts, academy pages) should be appended as `<url>` entries here. If the site grows, consider generating the sitemap dynamically at build time from a CMS index.

---

## Robots Strategy

`public/robots.txt`:

```text
User-agent: *
Allow: /

Sitemap: https://sidrahsoft.com/sitemap.xml
```

This allows all indexing and references the sitemap. Update the sitemap URL if the domain changes.

---

## Structured Data Strategy

A JSON-LD `Organization` block is included in `index.html` and updated by `SEO.jsx` on every route:

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Sidrah Soft",
  "url": "https://sidrahsoft.com",
  "logo": "https://sidrahsoft.com/assets/logo.svg",
  "email": "sidrahsoft@gmail.com",
  "sameAs": [
    "https://linkedin.com/company/PLACEHOLDER",
    "https://wa.me/PLACEHOLDER"
  ]
}
```

Replace the `PLACEHOLDER` values with real social URLs when available. Future pages can pass custom `jsonLd` to `SEO` for `Course`, `WebPage`, or `Article` schema.

---

## Future CMS SEO Integration

1. Add the CMS-driven route to `PAGES` in `src/config/seo.js` with a fallback title/description.
2. In the page component, fetch the CMS content and call `SEO` with the dynamic values:

```jsx
const { title, description, ogImage } = cmsPageData;
<SEO title={title} description={description} ogImage={ogImage} canonical={`/insights/${slug}`} />
```
3. Add the new route to `public/sitemap.xml` (or generate it at build time).
4. For blog/article pages, pass a custom `jsonLd` with `@type: Article` and author/publisher fields.

---

## Validation Checklist

- [x] Single title tag per page (updated via `document.title`).
- [x] Single description and keywords meta (updated in place).
- [x] Open Graph and Twitter tags present and unique.
- [x] Canonical URL present.
- [x] Valid Organization JSON-LD.
- [x] `robots.txt` allows indexing and references sitemap.
- [x] `sitemap.xml` lists current routes.
- [x] No additional dependencies added.
- [x] Production build passes.
