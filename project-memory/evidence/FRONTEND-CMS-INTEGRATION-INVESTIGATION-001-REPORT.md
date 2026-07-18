# Frontend CMS Integration Investigation — FRONTEND-CMS-INTEGRATION-INVESTIGATION-001

## Executive Summary

The SidrahSoft React frontend can be integrated with the four completed Django CMS modules with minimal, focused changes. The backend APIs for **Site Settings**, **Navigation**, **Partners**, and **Services** are public, read-only, CORS-ready, and already include the bilingual fields the frontend needs. The frontend currently has no shared API layer, no data-fetch utilities, and hardcoded data in the components that will be replaced. The integration is therefore mostly a matter of:

1. Adding a small, centralized fetch helper and environment variable.
2. Mapping the existing components to the CMS payload shapes.
3. Preserving hardcoded fallback data while the CMS content is verified.
4. Resolving a handful of media-URL and navigation-structure mismatches.

**Final readiness score: 8/10.** Backend is ready; the remaining work is frontend wiring and content alignment.

---

## 1. Frontend Architecture Investigation

### Application entry point and shell

- **Entry point:** `f:/What_i_Made/New/sidrah_web/src/main.jsx:1-17`
  - Creates the React root, wraps the app in `I18nProvider` and `BrowserRouter`, and imports `f:/What_i_Made/New/sidrah_web/src/styles/global.css`.
- **App shell:** `f:/What_i_Made/New/sidrah_web/src/App.jsx:1-62`
  - Renders the global `InteractiveNetworkBackground`, `MouseGlow`, `FloatingSocialBar`, and `Routes`.
  - Home route renders `Header`, the main section stack, and `Footer`.

### Routing

- React Router v7 is used (`f:/What_i_Made/New/sidrah_web/package.json:15`).
- Routes are defined in `f:/What_i_Made/New/sidrah_web/src/App.jsx:51-55`:
  - `/` → `Home`
  - `/training` → `TrainingPage`
  - `/case-studies` → `CaseStudiesPage`

### Key section components

- **Header:** `f:/What_i_Made/New/sidrah_web/src/components/Header.jsx:1-199`
- **Footer:** `f:/What_i_Made/New/sidrah_web/src/components/Footer.jsx:1-183`
- **Services section:** `f:/What_i_Made/New/sidrah_web/src/components/sections/ServicesSection.jsx:1-145`
- **Partners section:** `f:/What_i_Made/New/sidrah_web/src/components/sections/PartnersTrustSection.jsx:1-124`
- **SEO component:** `f:/What_i_Made/New/sidrah_web/src/components/SEO.jsx:1-62`
- **Contact / location:** `f:/What_i_Made/New/sidrah_web/src/components/sections/ContactSection.jsx:1-208` and `f:/What_i_Made/New/sidrah_web/src/components/location/CompanyLocationCard.jsx:1-67`
- **Floating social bar:** `f:/What_i_Made/New/sidrah_web/src/components/FloatingSocialBar.jsx:1-69`

### Internationalization and RTL

- Provider: `f:/What_i_Made/New/sidrah_web/src/i18n/I18nProvider.jsx:1-56`
  - Context exposes `lang`, `dir`, `setLanguage`, and `t()`.
  - Language is persisted in `localStorage` under key `sidrah-language` (`f:/What_i_Made/New/sidrah_web/src/i18n/config.js:1-8`).
  - `dir` is set on the `<html>` element (`f:/What_i_Made/New/sidrah_web/src/i18n/I18nProvider.jsx:24-25`).
- Translations: `f:/What_i_Made/New/sidrah_web/src/i18n/en.js` and `f:/What_i_Made/New/sidrah_web/src/i18n/ar.js`.
- Default language: `en`.

### State management and data flow

- No global state management library is used.
- Each section manages its own `isVisible` state via `IntersectionObserver` (e.g., `f:/What_i_Made/New/sidrah_web/src/components/sections/ServicesSection.jsx:81-112`).
- No API client, fetch utilities, or `axios` exist. The only `utils` files are content helpers for case studies and insights (`f:/What_i_Made/New/sidrah_web/src/utils/content/caseStudies.js` and `f:/What_i_Made/New/sidrah_web/src/utils/content/insights.js`).

### Environment variables

- The frontend currently does **not** read any environment variables.
- Vite is configured to run on port `5173` with `host: true` (`f:/What_i_Made/New/sidrah_web/vite.config.js:1-11`).

---

## 2. Backend API Readiness

### 2.1 Site Settings

- **Endpoint:** `GET /api/v1/site-settings/`
- **Implementation:** `f:/What_i_Made/New/sidrah_web/backend/apps/site_settings/views.py:10-24`
- **Serializer:** `f:/What_i_Made/New/sidrah_web/backend/apps/site_settings/serializers.py:13-110`
- **Response shape:**

```json
{
  "general": {
    "site_name": "SidrahSoft",
    "site_tagline": "...",
    "default_language": "en",
    "supported_languages": ["en", "ar"]
  },
  "contact": {
    "contact_email": "...",
    "phone": "...",
    "whatsapp_url": "...",
    "telegram_url": "..."
  },
  "social": {
    "facebook_url": "...",
    "linkedin_url": "...",
    "instagram_url": "...",
    "youtube_url": "...",
    "x_url": "..."
  },
  "location": {
    "address": "...",
    "google_maps_url": "...",
    "map_embed_url": "...",
    "latitude": "...",
    "longitude": "...",
    "working_hours": "..."
  },
  "seo": {
    "default_meta_title": "...",
    "default_meta_description": "...",
    "default_og_image_url": "..."
  },
  "branding": {
    "primary_logo_url": "...",
    "secondary_logo_url": "...",
    "favicon_url": "..."
  }
}
```

- **Empty-state behavior:** `404` with `{"detail": "Site settings are not configured yet."}` if no record exists.
- **Media URL behavior:** The serializer does **not** pass the request context, so `*_logo_url` and `default_og_image_url` are returned as **relative** paths such as `/media/uploads/...`. The frontend must resolve these to the backend host.
- **Ordering/filtering:** Single-record endpoint; returns the active record (`is_active=True`) or the first record.

### 2.2 Navigation

- **Endpoints:**
  - `GET /api/v1/navigation/` → list all active menus
  - `GET /api/v1/navigation/<slug>/` → single menu
  - `?location=header|footer|mobile|legal` filter on the list
- **Implementation:** `f:/What_i_Made/New/sidrah_web/backend/apps/navigation/views.py:12-80`
- **Serializer:** `f:/What_i_Made/New/sidrah_web/backend/apps/navigation/serializers.py:7-81`
- **Response shape (single menu):**

```json
{
  "name": "Main Header",
  "slug": "main-header",
  "location": "header",
  "items": [
    {
      "id": 1,
      "label": { "en": "Services", "ar": "الخدمات" },
      "href": "#services",
      "link_type": "anchor",
      "open_in_new_tab": false,
      "icon": "",
      "icon_asset": null,
      "order": 2,
      "children": [
        {
          "id": 2,
          "label": { "en": "Training", "ar": "التدريب" },
          "href": "/training",
          "link_type": "internal",
          "open_in_new_tab": false,
          "icon": "",
          "icon_asset": null,
          "order": 1,
          "children": []
        }
      ]
    }
  ]
}
```

- **Ordering:** menus are ordered by `location`, `order`, `name`; items by `order`, `id`; children by `order`, `id`.
- **Filtering:** `location` query parameter; inactive menus and hidden items are excluded.
- **Empty-state behavior:** list returns `[]`; detail returns `404` for inactive/non-existent slugs.
- **Media URL behavior:** `icon_asset` is returned as an **absolute** URL because the serializer uses `request.build_absolute_uri()`.

### 2.3 Partners

- **Endpoints:**
  - `GET /api/v1/partners/`
  - `GET /api/v1/partners/<slug>/`
  - `?partner_type=...` and `?is_featured=true|false` filters on the list
- **Implementation:** `f:/What_i_Made/New/sidrah_web/backend/apps/partners/views.py:11-53`
- **Serializer:** `f:/What_i_Made/New/sidrah_web/backend/apps/partners/serializers.py:35-76`
- **Response shape (list item):**

```json
{
  "id": 1,
  "slug": "eurofins",
  "name": { "en": "Eurofins", "ar": "" },
  "description": { "en": "", "ar": "" },
  "partner_type": "client",
  "logo": {
    "id": 1,
    "url": "http://127.0.0.1:8000/media/uploads/.../eurofins.png",
    "alt_text": { "en": "...", "ar": "..." }
  },
  "website_url": "https://www.eurofins.com/",
  "open_in_new_tab": true,
  "is_featured": false,
  "display_order": 1
}
```

- **Ordering:** `display_order`, `name_en`.
- **Media URL behavior:** `logo.url` is **absolute**.
- **Empty-state behavior:** list returns `[]` if no active partners.

### 2.4 Services

- **Endpoints:**
  - `GET /api/v1/services/`
  - `GET /api/v1/services/<slug>/`
  - `?is_featured=true|false` and `?show_on_homepage=true|false` filters
- **Implementation:** `f:/What_i_Made/New/sidrah_web/backend/apps/services/views.py:11-61`
- **Serializer:** `f:/What_i_Made/New/sidrah_web/backend/apps/services/serializers.py:36-118`
- **Response shape (list item):**

```json
{
  "id": 1,
  "slug": "web-applications",
  "name": { "en": "Web Applications", "ar": "تطبيقات الويب" },
  "short_description": {
    "en": "Custom web platforms built for scale, performance, and long-term growth.",
    "ar": "..."
  },
  "description": { "en": "", "ar": "" },
  "icon": null,
  "featured_image": null,
  "cta": {
    "label": { "en": "Learn More", "ar": "اعرف المزيد" },
    "url": "#contact"
  },
  "seo": {
    "title": { "en": "", "ar": "" },
    "description": { "en": "", "ar": "" }
  },
  "display_order": 1,
  "is_featured": true,
  "show_on_homepage": true
}
```

- **Ordering:** `display_order`, `name_en`.
- **Media URL behavior:** `icon.url` and `featured_image.url` are **absolute**.

### 2.5 CORS and Host Configuration

- CORS is enabled via `django-cors-headers` (`f:/What_i_Made/New/sidrah_web/backend/config/settings.py:45` and `f:/What_i_Made/New/sidrah_web/backend/config/settings.py:60-61`).
- Default allowed origins include the Vite dev server: `http://localhost:5173` and `http://127.0.0.1:5173` (`f:/What_i_Made/New/sidrah_web/backend/config/settings.py:178-181`).
- The same values are in `f:/What_i_Made/New/sidrah_web/backend/.env.example:4`.
- **Readiness:** CORS is already configured for the current frontend development setup. No backend code change is required unless the frontend host/port changes.

---

## 3. Site Settings Mapping

| Frontend hardcoded field | Current source(s) | CMS API source | Consumed today? | Notes |
|---|---|---|---|---|
| Company name | `SITE.name` in `f:/What_i_Made/New/sidrah_web/src/config/seo.js:2`, `index.html` title, `Header` brand, `Footer` brand, `CompanyLocationCard` | `general.site_name` | Partially | Used in many places; should become the single source. |
| Tagline / subtitle | `header.brandSubtitle` translations | `general.site_tagline` | No | CMS has a tagline; frontend currently uses a translation key. |
| Primary logo | `logo` import in `Header` and `Footer` | `branding.primary_logo_url` | Partially | Currently imported from `src/assets/logo.svg`. |
| Secondary logo | — | `branding.secondary_logo_url` | No | Not used in current design. |
| Favicon | `favicon` via `index.html` (none) | `branding.favicon_url` | No | Could be wired to dynamic favicon link. |
| Contact email | `SITE.email` in `seo.js`, `contactSettings.emailRecipient` in `f:/What_i_Made/New/sidrah_web/src/config/contactSettings.js:14`, footer email link | `contact.contact_email` | Partially | `recipient_email` is intentionally not exposed. |
| Phone | `companyLocation.phone` in `f:/What_i_Made/New/sidrah_web/src/data/company/companyLocation.js:10` | `contact.phone` | Partially | Only used in `CompanyLocationCard`. |
| Address | `companyLocation.address` in `f:/What_i_Made/New/sidrah_web/src/data/company/companyLocation.js:3` | `location.address` | Partially | Used in footer and location card. |
| Google Maps URL | `companyLocation.googleMapsUrl` | `location.google_maps_url` | Partially | Consumed in `CompanyLocationCard` and footer. |
| Map embed URL | `companyLocation.mapEmbedUrl` | `location.map_embed_url` | Partially | Consumed in `CompanyLocationCard`. |
| Latitude / Longitude | `companyLocation.latitude`, `companyLocation.longitude` | `location.latitude`, `location.longitude` | No | Available in model but not rendered. |
| Working hours | `companyLocation.workingHours` | `location.working_hours` | Partially | Consumed in `CompanyLocationCard`. |
| WhatsApp | `FloatingSocialBar` and footer contact links | `contact.whatsapp_url` | Partially | Currently uses placeholder URLs. |
| Telegram | `FloatingSocialBar` | `contact.telegram_url` | Partially | Currently uses placeholder URL. |
| LinkedIn | `FloatingSocialBar`, footer, `seo.sameAs` | `social.linkedin_url` | Partially | Currently uses placeholder URL. |
| Facebook | — | `social.facebook_url` | No | Field exists but not used. |
| Instagram | — | `social.instagram_url` | No | Field exists but not used. |
| YouTube | — | `social.youtube_url` | No | Field exists but not used. |
| X / Twitter | — | `social.x_url` | No | Field exists but not used. |
| Default meta title | `SITE.defaultTitle` and page `title` in `seo.js` | `seo.default_meta_title` | Partially | `SEO` component uses page-level config. |
| Default meta description | `SITE.defaultDescription` | `seo.default_meta_description` | Partially | Same as above. |
| Default OG image | `SITE.ogImage` | `seo.default_og_image_url` | Partially | Relative path in config; CMS returns relative URL. |
| Default language | `DEFAULT_LANGUAGE` in `i18n/config.js` | `general.default_language` | No | Frontend has its own default. |
| Supported languages | `LANGUAGES` in `i18n/config.js` | `general.supported_languages` | No | Frontend has its own list. |
| Footer description | `footer.description` translation | — | No (CMS) | Currently translation-based. |
| Footer copyright | `footer.copyright` translation | — | No (CMS) | Currently translation-based. |

**Key finding:** The CMS exposes more branding and social fields than the frontend currently consumes. The integration should map the consumed fields first and leave the extra fields available for future use.

---

## 4. Navigation Mapping

### Current frontend navigation structure

- **Desktop header:** hardcoded array `navLinks` in `f:/What_i_Made/New/sidrah_web/src/components/Header.jsx:6-14`:
  - Services (anchor `#services`)
  - Solutions (anchor `#services`)
  - Case Studies (path `/case-studies`)
  - Training Courses (path `/training`)
  - Insights (anchor `#insights`)
  - About (anchor `#foundation`)
  - Contact (anchor `#contact`)
- **Mobile header:** renders the same `navLinks` with a mobile prefix (`f:/What_i_Made/New/sidrah_web/src/components/Header.jsx:167`).
- **Footer:** four hardcoded arrays (`f:/What_i_Made/New/sidrah_web/src/components/Footer.jsx:6-33`):
  - Company links (About, Services, Solutions, Case Studies, Insights, Careers)
  - Service links (Business Automation, ERP Systems, AI Solutions, Web Development, Mobile Applications, System Integration)
  - Contact links (Email, WhatsApp, LinkedIn + location link)
  - Legal links (Privacy Policy, Terms of Service) — currently `href="#"` with `preventDefault`.

### CMS navigation structure (from seed)

- `main-header` (`location=header`) in `f:/What_i_Made/New/sidrah_web/backend/apps/navigation/management/commands/seed_navigation.py:15-90`:
  - Home, Services (with children Training / Case Studies), Industries, Partners, Insights, Careers, Contact.
- `mobile-menu` (`location=mobile`) in `f:/What_i_Made/New/sidrah_web/backend/apps/navigation/management/commands/seed_navigation.py:91-129`:
  - Home, Training, Case Studies, Contact.
- `main-footer` (`location=footer`) in `f:/What_i_Made/New/sidrah_web/backend/apps/navigation/management/commands/seed_navigation.py:130-182`:
  - Services, Industries, Partners, Insights, Careers, Contact.
- `legal-links` (`location=legal`) in `f:/What_i_Made/New/sidrah_web/backend/apps/navigation/management/commands/seed_navigation.py:183-207`:
  - Privacy Policy (`/privacy`), Terms of Service (`/terms`).

### Mapping rules

| Frontend behavior | CMS source | Notes |
|---|---|---|
| Desktop header links | `GET /api/v1/navigation/?location=header` or slug `main-header` | Render `items` array. |
| Mobile header links | `GET /api/v1/navigation/?location=mobile` or slug `mobile-menu` | Render `items` array; preserve the open/close animation and hamburger icon. |
| Footer company links | `GET /api/v1/navigation/?location=footer` or slug `main-footer` | Render `items` array in the “Company” column. |
| Footer legal links | `GET /api/v1/navigation/?location=legal` or slug `legal-links` | Render `items` array in the footer bottom row. |
| Anchor links | `link_type === 'anchor'` + `anchor` field | Call `handleAnchorNav(anchor)`; same as current scroll behavior. |
| Internal links | `link_type === 'internal'` + `url` / `route_name` | Use `<Link to={href}>` from `react-router-dom`. |
| External links | `link_type === 'external'` | Use `<a>` with `target="_blank"` and `rel="noopener noreferrer"` when `open_in_new_tab` is true. |
| Email / phone links | `link_type === 'email'` / `phone` | Use `mailto:` / `tel:` hrefs. |
| Two-level hierarchy | `children` array on each item | The current header has **no dropdown UI**. Either implement a lightweight dropdown, or agree to flatten the header menu so that top-level items remain unchanged. |
| Bilingual labels | `label.en` / `label.ar` | Use the current language from `useI18n`. |
| Active link | no active class today | Can be derived by comparing `useLocation().pathname` with `href`. |

### Mismatch to resolve

The seeded CMS header does **not** match the current hardcoded header:

- CMS has **Solutions** and **About** only indirectly (or not at all), while the current header has explicit entries.
- CMS puts **Training** and **Case Studies** as children of **Services**; the current header lists them as top-level items.
- The CMS footer is missing the current **service links** column (Business Automation, ERP Systems, etc.).
- The CMS legal links point to `/privacy` and `/terms`, which do not exist as pages today.

**Recommendation:** Before going live, either update the CMS navigation records to match the current frontend structure, or update the frontend to match the CMS hierarchy. The safest implementation phase keeps the current hardcoded fallback so the site never breaks if the CMS menu is restructured.

---

## 5. Partners Mapping

### Current hardcoded data

- File: `f:/What_i_Made/New/sidrah_web/src/components/sections/PartnersTrustSection.jsx:1-41`
- Six partners: Eurofins, Orangetheory Fitness KSA, Club Pilates Saudi Arabia, Safa Invest, Vision, AlQalam Schools.
- Each partner has:
  - `name` (string)
  - `logo` (Vite-imported asset URL)
  - `website` (string)
- The logos are imported from `src/assets/partiners/...`.
- Cards are rendered as external links with `target="_blank"` and `rel="noopener noreferrer"` (`f:/What_i_Made/New/sidrah_web/src/components/sections/PartnersTrustSection.jsx:90-110`).
- Visibility and stagger are driven by `IntersectionObserver` (`f:/What_i_Made/New/sidrah_web/src/components/sections/PartnersTrustSection.jsx:43-74`).

### CMS API mapping

| Current field | CMS field | Notes |
|---|---|---|
| `name` | `name.en` or `name.ar` (bilingual object) | Use `lang` to pick. |
| `logo` | `logo.url` (absolute) | CMS returns an object `{ id, url, alt_text }`. Use `logo.url` as `img src`. |
| `website` | `website_url` | Use as `href`. |
| `target="_blank"` | `open_in_new_tab` | Current code always opens in a new tab; use the CMS boolean. |
| Ordering | `display_order` | Use `display_order` to sort; matches CMS default ordering. |
| Filtering | `partner_type`, `is_featured` | The section can query `?partner_type=client` if needed, but current design shows all six. |
| Alt text | `logo.alt_text.en` / `logo.alt_text.ar` | Currently generated as `${name} logo`. Use CMS alt text if provided. |

### Media URL resolution

The Partners API returns absolute URLs (`http://127.0.0.1:8000/media/...`). The frontend can use these URLs directly; no additional resolver is needed for this endpoint.

### Fallback strategy

Keep the current `partners` array as a fallback. If the API request fails or returns an empty array, render the hardcoded partners so the section remains visible.

---

## 6. Services Mapping

### Current hardcoded data

- File: `f:/What_i_Made/New/sidrah_web/src/components/sections/ServicesSection.jsx:1-79`
- Five services: Web Applications, Mobile Applications, ERP Solutions, AI Solutions, Automation Solutions.
- Each service has:
  - `title` (string, English only)
  - `description` (string, English only)
  - `Icon` (inline SVG component)
- Cards have no CTA, no featured image, and no long-form description.
- Animation is identical to Partners: `IntersectionObserver` + `transitionDelay` based on index.
- CSS grid is 5 columns on desktop (`f:/What_i_Made/New/sidrah_web/src/styles/global.css` or component class).

### CMS API mapping

| Current field | CMS field | Notes |
|---|---|---|
| `title` | `name.en` / `name.ar` | `name` is bilingual. Use `lang` to pick. |
| `description` | `short_description.en` / `short_description.ar` | The current short copy maps to `short_description`. The CMS `description` field is long-form and unused today. |
| `Icon` | `icon.url` (optional) | CMS `icon` is an optional media asset. If present, render `<img src={icon.url}>`; otherwise fall back to the matching inline SVG component. |
| Featured image | `featured_image` | Not used in the current card design. Available for future detail pages. |
| CTA | `cta.label` + `cta.url` | Current cards have no CTA. Can be ignored for the first pass, or added as a small “Learn more” link. |
| Ordering | `display_order` | Use CMS ordering. |
| Homepage filter | `show_on_homepage` | The section should query `?show_on_homepage=true` if only homepage services are desired. |
| Featured filter | `is_featured` | Available for future featured-service sections. |
| SEO | `seo.title` / `seo.description` | Available for future service detail pages. |

### Inline SVG fallback strategy

Because the CMS does not store the inline SVG icons, the frontend should keep the five icon components (`WebIcon`, `MobileIcon`, `ErpIcon`, `AiIcon`, `AutomationIcon`) and select the correct fallback by matching the CMS slug or English name. Only when `icon.url` is present should the CMS media icon be used. This keeps the current visual design intact while making icons optional in the CMS.

### Fallback strategy

Keep the current `services` array as a fallback. If the API fails or returns empty, render the hardcoded five services with their inline SVG icons.

---

## 7. Shared API Layer Recommendation

### Minimum clean architecture

The project does **not** need Redux or a new state-management library. A thin layer of helpers is sufficient:

1. **API base URL config** — `src/config/api.js`
   - Export `API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'`.
2. **Shared fetch client** — `src/utils/api.js`
   - `apiFetch(path, options = {})`:
     - Prefix the path with `API_BASE_URL`.
     - Set a request timeout (e.g., 10 s) using `AbortController`.
     - Throw on non-OK responses.
     - Return parsed JSON.
3. **Service-specific API modules** — `src/api/siteSettings.js`, `src/api/navigation.js`, `src/api/partners.js`, `src/api/services.js`
   - Each module exports a single async function (`getSiteSettings`, `getNavigation(location)`, `getPartners()`, `getServices()`).
   - Keep them thin; they call `apiFetch` and return the raw CMS payload.
4. **Media URL resolver** — `src/utils/media.js`
   - `resolveMediaUrl(url)`: if the URL already starts with `http`, return it; otherwise prepend `API_BASE_URL`. This fixes the relative URLs returned by `/api/v1/site-settings/`.
5. **Bilingual helper** — `src/utils/i18n.js`
   - `getBilingual(value, lang, fallback = 'en')`: returns `value[lang] || value[fallback] || ''`.
   - Works for `name`, `short_description`, `description`, `label`, and `alt_text` objects.
6. **Local component state** — keep `useState` + `useEffect` in each section.
   - No global caching is needed for these small, low-frequency payloads.
   - Optional: cache site settings for the session in a small context to avoid refetching on every route.

### What to avoid

- Do not add Redux, Zustand, TanStack Query, or SWR unless a later phase justifies it.
- Do not add request/response interceptors beyond a timeout and a simple error throw.
- Do not normalize the CMS payload into a complex schema; map the existing nested shapes directly in the components.

---

## 8. Environment and Local Development

### Required configuration changes

1. **Frontend environment variable:** create a new file `f:/What_i_Made/New/sidrah_web/.env` (or `.env.local`) containing:

   ```env
   VITE_API_BASE_URL=http://127.0.0.1:8000
   ```

   The frontend modules should use this for the backend host. The `/api/v1` path can be hardcoded in each API module, or the base URL can include it; the recommended pattern is `VITE_API_BASE_URL=http://127.0.0.1:8000` and paths like `/api/v1/services/`.

2. **Frontend port:** `5173` (from `f:/What_i_Made/New/sidrah_web/vite.config.js:7`).
3. **Backend port:** `8000` (Django `runserver` default).
4. **CORS:** already configured for `http://localhost:5173` and `http://127.0.0.1:5173` in `f:/What_i_Made/New/sidrah_web/backend/config/settings.py:178-181`. If the frontend is served from a different origin in development, add it to `CORS_ALLOWED_ORIGINS` in `backend/.env`.
5. **Media serving in development:** Django serves `/media/` in `DEBUG` mode (`f:/What_i_Made/New/sidrah_web/backend/config/urls.py:16-18`).

### Production-readiness concerns

- `DEBUG` must be `False` and `ALLOWED_HOSTS` must list the production domain.
- `CORS_ALLOWED_ORIGINS` must list the production frontend origin(s).
- Media files should be served by the web server or a CDN; `MEDIA_URL` can be pointed to the CDN in production.
- `SECURE_SSL_REDIRECT`, HSTS, and secure cookies are enabled when `DEBUG` is `False` (`f:/What_i_Made/New/sidrah_web/backend/config/settings.py:189-196`).
- The frontend `SITE.baseUrl` in `f:/What_i_Made/New/sidrah_web/src/config/seo.js:3` is hardcoded to `https://sidrahsoft.com`; keep it as a build-time constant or eventually move it to an environment variable (`VITE_SITE_BASE_URL`).

---

## 9. CORS and Media Findings

- **CORS:** ready for the default Vite dev server. No backend changes required.
- **Media URL inconsistency:**
  - Site Settings returns **relative** media URLs (`/media/...`).
  - Navigation, Partners, and Services return **absolute** media URLs.
  - The shared `resolveMediaUrl()` helper (recommended above) normalizes both cases.
- **Media serving:** only works automatically in `DEBUG`. Production needs a separate media serving strategy.
- **No media upload endpoint is exposed to the public**; uploads are managed through Django admin, which is correct for a CMS-backed site.

---

## 10. Language Strategy

### Current state

- The frontend supports English (`en`) and Arabic (`ar`) via the `I18nProvider` context.
- Translation keys are plain JSON objects (`f:/What_i_Made/New/sidrah_web/src/i18n/en.js` and `f:/What_i_Made/New/sidrah_web/src/i18n/ar.js`).
- CMS fields are returned as bilingual objects, e.g. `{ "en": "...", "ar": "..." }`.

### Recommended helper

Create `src/utils/i18n.js`:

```js
export function getBilingual(value, lang, fallback = 'en') {
  if (!value || typeof value !== 'object') return '';
  return value[lang] || value[fallback] || '';
}
```

Use it everywhere CMS bilingual data is consumed:

```jsx
const title = getBilingual(service.name, lang);
```

### RTL implications

- The `I18nProvider` already sets `dir="rtl"` on the `<html>` element when Arabic is selected.
- `f:/What_i_Made/New/sidrah_web/src/styles/global.css` is mostly direction-agnostic, but it uses physical `left`/`right` borders in some places (e.g., `foundation-proof-point`).
- The integration should not redesign the language system. Keep the existing behavior; only map dynamic Arabic content through the helper.

---

## 11. Loading, Error, and Fallback Strategy

### Navigation

- Fetch in `Header` (and `Footer` for footer menus) on mount.
- If the API returns an error or an empty array, fall back to the current hardcoded `navLinks` arrays in `Header` and `Footer`.
- This prevents layout breakage and preserves the existing design while the CMS menu is being aligned.

### Site Settings

- Fetch once at the top of the app (e.g., in `App` or in a lightweight context provider).
- Merge CMS values over safe defaults taken from `seo.js`, `companyLocation.js`, and `contactSettings.js`.
- If the API fails, the site continues to use the current hardcoded values.

### Partners

- Fetch `GET /api/v1/partners/` in `PartnersTrustSection`.
- If the API fails or returns `[]`, render the current six hardcoded partners.
- Remove the fallback once the CMS partner list is verified and stable.

### Services

- Fetch `GET /api/v1/services/?show_on_homepage=true` in `ServicesSection`.
- If the API fails or returns `[]`, render the current five hardcoded services with inline SVG icons.
- Keep the inline SVG components as permanent fallbacks for icons when the CMS `icon` field is empty.

### When to remove fallback data

Fallbacks can be removed after:
- All CMS records are populated and visually verified in staging.
- The API has been stable for at least one release cycle.
- The frontend team has confirmed that hardcoded data is no longer referenced by any component.

---

## 12. Implementation Phasing

### Phase 1 — Shared API configuration
- **New files:**
  - `src/config/api.js`
  - `src/utils/api.js`
  - `src/utils/media.js`
  - `src/utils/i18n.js`
  - `src/api/siteSettings.js`
  - `src/api/navigation.js`
  - `src/api/partners.js`
  - `src/api/services.js`
- **Risks:** very low. No visual changes.
- **Visible result:** none; the app still uses hardcoded data.

### Phase 2 — Site Settings integration
- **Files to change:**
  - `f:/What_i_Made/New/sidrah_web/src/App.jsx`
  - `f:/What_i_Made/New/sidrah_web/src/components/Header.jsx`
  - `f:/What_i_Made/New/sidrah_web/src/components/Footer.jsx`
  - `f:/What_i_Made/New/sidrah_web/src/components/SEO.jsx`
  - `f:/What_i_Made/New/sidrah_web/src/components/location/CompanyLocationCard.jsx`
- **Risks:**
  - Logo path change: verify the CMS logo asset renders correctly.
  - Site settings media URLs are relative; must pass through `resolveMediaUrl()`.
- **Visible result:** brand name, email, phone, address, social links, and SEO defaults update from the CMS.
- **Dependencies:** Phase 1.

### Phase 3 — Navigation integration
- **Files to change:**
  - `f:/What_i_Made/New/sidrah_web/src/components/Header.jsx`
  - `f:/What_i_Made/New/sidrah_web/src/components/Footer.jsx`
- **Risks:**
  - CMS menu structure differs from current hardcoded structure. Decide whether to update the CMS records or add a dropdown/flatten UI.
  - Internal links like `/privacy` and `/terms` do not exist yet; keep them as placeholders or create pages first.
- **Visible result:** header and footer links update from the CMS; mobile menu remains functional.
- **Dependencies:** Phase 1 and 2 (for consistent branding in the header).

### Phase 4 — Partners integration
- **Files to change:**
  - `f:/What_i_Made/New/sidrah_web/src/components/sections/PartnersTrustSection.jsx`
- **Risks:**
  - Media URL format change from Vite asset to absolute backend URL.
  - Empty Arabic names in seed data (`name_ar: ""`) will fall back to English.
- **Visible result:** partner list, logos, and links update from the CMS.
- **Dependencies:** Phase 1.

### Phase 5 — Services integration
- **Files to change:**
  - `f:/What_i_Made/New/sidrah_web/src/components/sections/ServicesSection.jsx`
- **Risks:**
  - Inline SVG icons must remain as fallback while CMS icons are optional.
  - Arabic names/descriptions may wrap differently in the 5-column grid.
- **Visible result:** service cards update from the CMS while keeping the same icon fallback and animation.
- **Dependencies:** Phase 1.

### Phase 6 — Cleanup and fallback removal
- **Files to change:**
  - `f:/What_i_Made/New/sidrah_web/src/data/company/companyLocation.js` (remove if fully replaced)
  - `f:/What_i_Made/New/sidrah_web/src/config/contactSettings.js` (update defaults or remove if CMS drives them)
  - `f:/What_i_Made/New/sidrah_web/src/components/sections/PartnersTrustSection.jsx` (remove hardcoded fallback)
  - `f:/What_i_Made/New/sidrah_web/src/components/sections/ServicesSection.jsx` (remove hardcoded fallback, keep icon components)
- **Risks:** removing fallback too early can leave sections blank if the CMS is empty.
- **Visible result:** none; code simplification only.
- **Dependencies:** Phases 2–5 complete and verified.

### Phase 7 — Focused validation
- Run the lightweight validation checklist in Section 14.
- Do not run the full backend test suite; rely on targeted manual checks and the existing CMS unit tests.
- **Dependencies:** all previous phases.

---

## 13. Risk Register

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| Site Settings media URLs are relative and will break on the Vite dev host. | High | High | Implement `resolveMediaUrl()` in the frontend. |
| CMS navigation seed does not match the current header/footer structure. | Medium | High | Keep hardcoded fallbacks and align CMS content before removing them. |
| Current header has no dropdown UI for CMS `children`. | Medium | Medium | Either add a dropdown component or flatten the menu in the CMS. |
| Partners seed has empty Arabic names; Arabic page may show English names. | Low | High | Use the `getBilingual()` fallback to English. Populate Arabic names later. |
| Service inline SVG icons are not in the CMS; CMS `icon` field is optional. | Low | Medium | Keep SVG fallback keyed by slug. |
| CORS errors if frontend host changes. | Medium | Low | Update `CORS_ALLOWED_ORIGINS` in `backend/.env`. |
| API downtime leaves sections blank. | High | Low | Keep hardcoded fallback arrays in every integrated section. |
| RTL layout issues with longer Arabic text. | Medium | Medium | Test Arabic after integration; do not redesign the language system now. |
| Production media files not served. | High | Low | Configure production web server or CDN for `/media/`. |

---

## 14. Lightweight Validation Checklist

Use this checklist after implementation, not during this investigation.

### Startup
- [ ] Frontend starts with `npm run dev` (Vite on port 5173).
- [ ] Backend starts with `python manage.py runserver` (port 8000).
- [ ] `GET /api/v1/health/` returns `{"status":"ok"}`.
- [ ] `GET /api/v1/site-settings/` returns JSON.
- [ ] `GET /api/v1/navigation/?location=header` returns JSON.
- [ ] `GET /api/v1/partners/` returns JSON.
- [ ] `GET /api/v1/services/?show_on_homepage=true` returns JSON.

### Functionality
- [ ] Header navigation renders items from the CMS.
- [ ] Mobile menu opens/closes and shows CMS items.
- [ ] Footer company links and legal links render from the CMS.
- [ ] Partner updates made in the CMS appear on the site without code changes.
- [ ] Service updates made in the CMS appear on the site without code changes.
- [ ] Site settings updates (name, email, phone, address) appear in the frontend.
- [ ] CMS-provided logos load correctly in header and footer.

### Resilience
- [ ] If the Site Settings API fails, the site still renders with current defaults.
- [ ] If the Navigation API fails, the header and footer fall back to the hardcoded menus.
- [ ] If the Partners API fails, the six hardcoded partners are still shown.
- [ ] If the Services API fails, the five hardcoded services are still shown.

### Quality
- [ ] No 404 or CORS errors in the browser console.
- [ ] No visual regression on desktop or mobile.
- [ ] Arabic content displays correctly and falls back to English when missing.
- [ ] Inline SVG icons still render when the CMS `icon` field is empty.
- [ ] All external links (partners, social, navigation) use `target="_blank"` and `rel="noopener noreferrer"` correctly.

---

## 15. Final Readiness Score and Recommendation

**Readiness score: 8/10.**

- Backend APIs: **ready** (3 points).
- CORS and media dev serving: **ready** (2 points).
- Frontend architecture: **simple and clean, but no fetch layer yet** (2 points).
- Data mapping and bilingual support: **straightforward** (1 point).
- Risks and mismatches: **manageable** (0 points, but tracked).

**Final recommendation:** Proceed with the integration in the order defined in Section 12. The first priority is to add the shared API configuration (Phase 1), then Site Settings (Phase 2), then Navigation (Phase 3) with the explicit CMS content alignment. Partners and Services can follow in parallel because they are self-contained section replacements. Keep hardcoded fallback data in all components until the CMS content is fully populated and verified in staging.
