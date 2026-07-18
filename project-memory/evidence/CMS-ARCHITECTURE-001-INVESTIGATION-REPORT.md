# CMS-ARCHITECTURE-001 INVESTIGATION REPORT

## 1. Current Frontend Findings

The SidrahSoft frontend is a React + Vite SPA with the following content sources as of today:

### 1.1 Static/global configuration
- `src/config/seo.js` — site-wide SEO defaults (`SITE`), per-page SEO (`PAGES`), and JSON-LD helper.
- `src/config/contactSettings.js` — contact form recipient and required fields.
- `src/data/company/companyLocation.js` — company address, map URLs, phone, email, hours, SEO fields.

### 1.2 Translation/i18n
- `src/i18n/config.js` — languages (`en`, `ar`), default language, storage key.
- `src/i18n/en.js` / `src/i18n/ar.js` — nested JSON translation objects covering header, footer, training page, contact form, and site-wide labels.
- Translations are currently client-side JS files; no backend language management exists yet.

### 1.3 Section content still hardcoded in JSX
- `src/components/Header.jsx` — `navLinks` array (anchor targets + route paths).
- `src/components/Footer.jsx` — company/service/contact/legal link arrays plus brand description.
- `src/components/sections/ServicesSection.jsx` — `services` array with inline SVG icons, titles, descriptions.
- `src/components/sections/IndustriesSection.jsx` — `industries` array with inline SVG icons, focus areas.
- `src/components/sections/CareersSection.jsx` — `careerCards` array.
- `src/components/pages/TrainingPage.jsx` — `courseItems` array keyed to translation strings; course copy lives in `en.js`/`ar.js`.

### 1.4 Content already extracted to data layer
- `src/data/caseStudies/caseStudiesData.js` — full CMS-ready case-study objects.
- `src/data/insights/insightsData.js` — full CMS-ready blog/insight objects.
- `src/components/sections/PartnersTrustSection.jsx` — partner list inline but names/logos structured.

### 1.5 Contact form
- `src/components/sections/ContactSection.jsx` — form fields: inquiry type, name, email, phone (optional), company (optional), message.
- Currently client-side only; submissions are not persisted or emailed by a backend.

### 1.6 Routes
- `/` — Home (multiple sections)
- `/training` — Training page
- `/case-studies` — Case Studies listing page
- Future-ready slugs prepared for `/insights/:slug` and `/case-studies/:slug`.

---

## 2. Recommended Django App Structure

Proposed Django apps (each responsible for a bounded context):

| App | Responsibility |
| --- | --- |
| `core` | Abstract base models (`TimestampedModel`, `OrderedModel`, `TranslatableModel`, `SlugModel`), shared utilities, middleware, and admin mixins. |
| `site_settings` | Global settings: site name, base URL, contact email, social links, default language, brand subtitle, analytics IDs. |
| `navigation` | Header and footer navigation links, ordering, visibility per language, mobile-only flags. |
| `pages` | Static page-level content for the homepage (hero, foundation, capabilities marquee, stats) and future `/about`, `/services`, etc. |
| `services` | Service cards and service categories/solutions. |
| `industries` | Industry/solution entries, focus areas, icons. |
| `partners` | Partner logos, names, websites, ordering, active flag. |
| `case_studies` | Case studies with full detail fields and SEO. |
| `insights` | Blog/insight articles with categories, publishing workflow, SEO. |
| `careers` | Career categories and job postings. |
| `training` | Courses, course categories, curriculum modules, duration/level metadata. |
| `contacts` | Contact form submissions and contact/recipient settings. |
| `locations` | Company location/map data. |
| `media_library` | Image/file uploads and reusable media assets. |
| `seo` | Per-page SEO metadata overrides and global SEO defaults. |

---

## 3. Recommended MySQL Model Groups

High-level models and relationships. All translatable content should support `en` and `ar` from day one.

### `core`
- Abstract models only; no tables.
- Common fields to inherit: `id`, `created_at`, `updated_at`, `is_active`, `display_order`, `language`, `translation_of` (for manual translation trees) or use `django-parler`.

### `site_settings`
- `SiteSetting` (singleton) — `site_name`, `base_url`, `default_title`, `default_description`, `keywords`, `logo`, `email`, `social_links` (JSON), `default_language`.

### `navigation`
- `NavLink` — `title` (translatable), `url`, `target`, `position` (`header`/`footer`), `order`, `is_active`, `parent` (self-referential for dropdowns).

### `pages`
- `HomepageSection` — `key` (`hero`, `foundation`, `capabilities`, etc.), `title`, `description`, `extra_content` (JSON), `background_media`, `cta_text`, `cta_url`, `order`, `is_active`.
- `StaticPage` — for future `/about`, `/privacy`, `/terms` pages: `slug`, `title`, `content` (rich text), `template`.

### `services`
- `Service` — `slug`, `title`, `description`, `icon` (SVG string or FK to Media), `order`, `is_active`.
- `ServiceCategory` / `Solution` — optional grouping model with M2M to `Service`.

### `industries`
- `Industry` — `slug`, `title`, `description`, `focus_areas` (JSON list), `icon` (SVG/Media), `order`, `is_active`.

### `partners`
- `Partner` — `name`, `website`, `logo` (FK to Media), `order`, `is_active`.

### `case_studies`
- `CaseStudy` — `slug`, `title`, `client_name`, `industry` (FK or string), `excerpt`, `problem`, `solution`, `technologies` (JSON), `outcome`, `metrics` (JSON), `cover_image` (FK to Media), `featured`, `publish_date`, `language`, `seo_title`, `seo_description`.

### `insights`
- `InsightCategory` — `slug`, `name`, `order`.
- `Insight` — `slug`, `title`, `excerpt`, `category` (FK), `cover_image` (FK to Media), `publish_date`, `reading_time`, `featured`, `language`, `content` (rich text), `seo_title`, `seo_description`.

### `careers`
- `CareerCategory` — `title`, `description`, `order`.
- `JobPosting` — `slug`, `title`, `category` (FK), `location`, `description`, `requirements`, `is_active`.

### `training`
- `Course` — `slug`, `title`, `summary`, `description`, `icon` (SVG/Media), `level`, `duration`, `curriculum` (JSON/modules), `is_active`, `featured`, `language`.
- `CourseCategory` — optional grouping.

### `contacts`
- `ContactSubmission` — `inquiry_type`, `name`, `email`, `phone`, `company`, `message`, `submitted_at`, `status` (`new`, `in_progress`, `resolved`), `assigned_to`, `notes`.
- `ContactSetting` — `recipient_email`, `cc_emails`, `thank_you_subject`, `thank_you_body`.

### `locations`
- `CompanyLocation` (singleton or one-per-language) — `company_name`, `address`, `google_maps_url`, `map_embed_url`, `latitude`, `longitude`, `phone`, `email`, `working_hours`, `seo_title`, `seo_description`.

### `media_library`
- `MediaFile` — `file`, `alt_text`, `mime_type`, `uploaded_at`.

### `seo`
- `SeoMetadata` — `page_path`, `language`, `title`, `description`, `keywords`, `og_image` (FK to Media), `canonical`, `json_ld` (JSON).

---

## 4. CMS Modules

| CMS Module | What Admins Manage |
| --- | --- |
| **Global Settings** | Site name, logo, default language, contact email, social links, analytics. |
| **Navigation** | Header/footer links, ordering, visibility, parent/child relationships. |
| **Homepage Builder** | Toggle sections, edit hero/foundation/capabilities copy, CTA links. |
| **Services** | Service cards, titles, descriptions, icons, categories/solutions. |
| **Industries** | Industry cards, focus areas, icons. |
| **Partners** | Partner name, logo, website, ordering, active status. |
| **Case Studies** | Full case study content, featured flag, publish date, cover image, SEO. |
| **Insights/Blog** | Articles, categories, publishing schedule, featured flag, SEO, cover images. |
| **Careers** | Career categories and active job postings. |
| **Training/Courses** | Courses, summaries, duration, level, curriculum, icons, active status. |
| **Contact Submissions** | View, assign, mark status, export; configure recipient email. |
| **Company Location** | Address, coordinates, map URLs, hours, phone, email. |
| **Footer** | Footer columns, links, descriptions (linked to Navigation + Site Settings). |
| **SEO** | Per-page titles, descriptions, keywords, OG images, canonical overrides. |
| **Media Library** | Upload images, SVGs, files; manage alt text. |
| **Language Management** | Enable/disable languages, manage translated copies, fallback rules. |

---

## 5. API Endpoint Plan

Proposed REST endpoints under `/api/v1/`:

| Endpoint | Purpose |
| --- | --- |
| `GET /api/v1/settings/` | Global site settings, social links, default language. |
| `GET /api/v1/navigation/` | Header and footer navigation links grouped by position. |
| `GET /api/v1/seo/?path=/case-studies` | SEO metadata for a given page path. |
| `GET /api/v1/homepage/` | Aggregated homepage section content. |
| `GET /api/v1/services/` | Service cards and categories. |
| `GET /api/v1/industries/` | Industry cards. |
| `GET /api/v1/partners/` | Active partner logos/links. |
| `GET /api/v1/case-studies/` | Case study list with filtering/sorting/pagination. |
| `GET /api/v1/case-studies/<slug>/` | Single case study detail. |
| `GET /api/v1/insights/` | Insight/blog list with filtering/sorting/pagination. |
| `GET /api/v1/insights/<slug>/` | Single insight article detail. |
| `GET /api/v1/careers/` | Career categories and active job postings. |
| `GET /api/v1/training/courses/` | Training courses. |
| `GET /api/v1/training/courses/<slug>/` | Course detail. |
| `GET /api/v1/location/` | Company location data. |
| `POST /api/v1/contact/` | Contact form submission. |

Authentication:
- Public endpoints are read-only and require no auth.
- `POST /api/v1/contact/` should be rate-limited and protected by CSRF/recaptcha later.
- Admin write access via Django admin or a separate React admin dashboard with JWT/session auth.

---

## 6. Admin Roles/Permissions Direction

| Role | Permissions |
| --- | --- |
| **Super Admin** | Full access to all apps, users, settings, and media. |
| **Content Manager** | CRUD on Pages, Services, Industries, Partners, Case Studies, Insights, Careers, Training, Location. |
| **Marketing / SEO Manager** | Edit SEO metadata, site settings, media library, social links. |
| **Support / Recruiter** | Read and manage Contact Submissions and Job Applications. |
| **Future LMS Admin** | CRUD on courses, modules, enrollments, certificates (once academy is built). |
| **Future Finance / Sales** | View course payments, invoices, student data (once payments are added). |

Django’s built-in `Group` + `Permission` model plus object-level permissions (`django-guardian`) can enforce this.

---

## 7. Frontend Integration Migration Plan

Recommended phased replacement of static data files with API calls:

### Phase 0 — API adapters and feature flags
- Create `src/api/` folder with thin fetch wrappers (e.g., `apiClient`, `fetchSettings`, `fetchCaseStudies`, `fetchInsights`).
- Add a `VITE_ENABLE_CMS=false` flag so the frontend can keep using local data files while the backend is built.

### Phase 1 — Global shell
- Replace `src/config/seo.js` defaults and `site_settings` via `GET /api/v1/settings/`.
- Replace `navLinks` and footer links via `GET /api/v1/navigation/`.

### Phase 2 — Module-by-module content migration
- Partners → `/api/v1/partners/`
- Case Studies → `/api/v1/case-studies/` (listing) and `/api/v1/case-studies/<slug>/` (detail)
- Insights → `/api/v1/insights/` and `/api/v1/insights/<slug>/`
- Training Courses → `/api/v1/training/courses/`
- Services, Industries, Careers → respective endpoints
- Company Location → `/api/v1/location/`

For each module:
1. Create a data-fetching hook.
2. Make the section/page accept a `data` prop and use the static file as fallback.
3. When the backend endpoint is ready, flip the feature flag for that module.

### Phase 3 — Contact form
- Wire `POST /api/v1/contact/` and replace `contactSettings` recipient via backend.

### Phase 4 — i18n
- Start with Django translations (`.po`/`.mo`) for static labels, then add translatable CMS models for dynamic content.
- Keep the existing `useI18n` hook; just change where translations are loaded from.

### Phase 5 — New pages
- Build `/insights/:slug` and `/case-studies/:slug` detail pages using the slug lookup APIs.

---

## 8. Future Academy/LMS Readiness

The proposed architecture supports future LMS growth without rewrites:

- `training.Course` already acts as the root entity.
- New models can be added under `training` or a dedicated `academy` app:
  - `CourseModule`, `Lesson` (video/text/quiz)
  - `Enrollment`, `StudentProfile`
  - `CertificateTemplate`, `Certificate`
  - `LearningPath` (M2M to courses)
  - `CourseReview`, `CoursePayment` (later)
- User authentication can be added with `django.contrib.auth` + custom `UserProfile`.
- Payments can be introduced later via a separate `payments` app integrated with Stripe/HyperPay.
- Role-based admin permissions already accommodate LMS admins.

Recommendation: keep course catalog public in `training`, and move enrolled-student features into `academy` when needed.

---

## 9. Risks and Pending Decisions

| # | Risk / Decision | Impact |
| --- | --- | --- |
| 1 | **Hosting & deployment** — Where will Django and MySQL run? | CI/CD, scaling, cost. |
| 2 | **Authentication strategy** — Django sessions vs JWT for admin and future students. | Affects mobile app readiness and security. |
| 3 | **Translation strategy** — `django-parler`, separate translation tables, or JSON overrides? | Affects admin UX and query performance. |
| 4 | **Media storage** — Local filesystem vs S3-compatible object storage. | Backup, CDN, file size limits. |
| 5 | **Rich text content** — Plain text, Markdown, or HTML editor? | Security (XSS), export/import, frontend rendering. |
| 6 | **Contact form email backend** — SMTP, SendGrid, AWS SES, etc. | Deliverability and spam handling. |
| 7 | **Google Maps** — Embed API key and billing required for production map embeds. | Cost and compliance. |
| 8 | **Search** — Will insights/case studies need full-text search? | May require MySQL full-text indexes or Elasticsearch later. |
| 9 | **Privacy/GDPR** — Contact submissions contain personal data; retention policy needed. | Legal compliance. |
| 10 | **URL strategy for languages** — Path prefix (`/ar/insights`) vs query param vs subdomain. | SEO and routing complexity. |
| 11 | **Existing inline SVG icons** — Should services/industries store SVG strings in DB or use an icon mapping system? | Admin UX and icon consistency. |

---

## 10. Clear Recommendation for Next Implementation Step

**Step 1: Bootstrap the Django project with the smallest possible vertical slice.**

1. Create a new Django project and configure MySQL.
2. Create the `core`, `site_settings`, `media_library`, and `partners` apps first.
3. Build the `Partner` model and a simple `SiteSetting` singleton.
4. Expose `GET /api/v1/settings/` and `GET /api/v1/partners/`.
5. In the React frontend, add an API adapter and a feature flag, then make the Partners section consume the live endpoint while keeping the static file as fallback.

This proves end-to-end CMS integration (database → API → React) before committing to the full model suite. Once the slice is validated, repeat the pattern for case studies, insights, services, training, and contact submissions in priority order.

---

## Summary

The frontend is already organized into reusable sections and several CMS-ready data files (case studies, insights, company location). The remaining hardcoded sections (services, industries, partners, careers, training, header, footer, homepage copy) map cleanly to a small set of Django apps. A phased API-replacement strategy keeps the site live while the backend is built, and the proposed app/model structure leaves room for future academy, payments, and role-based admin growth without major rewrites.
