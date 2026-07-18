# COMPANY-SINGLE-SOURCE-OF-TRUTH-INVESTIGATION-001-REPORT

**Investigation Date:** 2026-07-12  
**Investigator:** Cascade AI  
**Status:** Investigation & Architecture Report Only — No Code Modified  
**Deliverable:** `project-memory/evidence/COMPANY-SINGLE-SOURCE-OF-TRUTH-INVESTIGATION-001-REPORT.md`

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State: Hardcoded Company Data Inventory](#2-current-state-hardcoded-company-data-inventory)
3. [Existing Backend CMS Models Assessment](#3-existing-backend-cms-models-assessment)
4. [Gaps Analysis](#4-gaps-analysis)
5. [Recommended Architecture](#5-recommended-architecture)
6. [Database Schema Proposal](#6-database-schema-proposal)
7. [API Structure Proposal](#7-api-structure-proposal)
8. [Frontend Integration Strategy](#8-frontend-integration-strategy)
9. [Migration Strategy](#9-migration-strategy)
10. [Future Feature Support](#10-future-feature-support)
11. [Implementation Phasing](#11-implementation-phasing)
12. [Risk Assessment](#12-risk-assessment)

---

## 1. Executive Summary

The SidrahSoft website has a **partial** centralized company information system already in place. The backend `SiteSetting` model serves as a singleton source of truth for general info, contact, social links, location, SEO defaults, and branding assets. The frontend `useSiteSettings` hook fetches this data and most major components (Header, Footer, FloatingSocialBar, SEO) already consume it with hardcoded fallback values.

However, the system is **not yet a complete single source of truth**. Significant gaps remain:

- **Frontend fallback values** are hardcoded across 15+ files and serve as the de facto source when the API is unavailable or fields are empty.
- **i18n translation files** contain hardcoded company name, email, and copyright text that bypass the CMS entirely.
- **Leads dashboard** components hardcode "SidrahSoft" brand text without reading from `useSiteSettings`.
- **Backend services** (email templates, contact services, SEO views) have hardcoded company name, email, and base URL fallbacks that bypass `SiteSetting`.
- **Workflow showcase content** (AutomationShowcaseSection) is entirely hardcoded with no CMS backing.
- **Partner fallback data** includes hardcoded logo imports and website URLs.
- **Case studies and careers** have hardcoded fallback data files.
- **No dark/light mode** support exists — all design tokens are dark-mode-only in `tokens.css`.
- **No bilingual address** in `SiteSetting` — the model has a single `address` field while the frontend fallback provides both EN/AR.
- **No design token management** — brand colors, typography, and spacing are CSS-only with no CMS control.

**CMS Readiness Score: 6/10** — Strong foundation exists, but critical gaps prevent full centralization.

---

## 2. Current State: Hardcoded Company Data Inventory

### 2.1 Frontend Config Files

#### `src/config/seo.js` (lines 1-17)
```javascript
export const SITE = {
  name: 'Sidrah Soft',
  baseUrl: 'https://sidrahsoft.com',
  defaultTitle: 'Sidrah Soft | Business Automation',
  defaultDescription: 'SidrahSoft helps organizations accelerate growth...',
  keywords: 'Business Automation, ERP Systems, AI Solutions, ...',
  ogImage: '/assets/og-default.png',
  twitterCard: 'summary_large_image',
  email: 'sidrahsoft@gmail.com',
  logo: '/assets/logo.svg',
  sameAs: [
    'https://linkedin.com/company/PLACEHOLDER',
    'https://wa.me/PLACEHOLDER',
  ],
};
```
**Status:** Used as fallback by `SEO.jsx` when `useSiteSettings` returns null. The `getOrganizationJsonLd()` function also uses these values directly. The `SITE.keywords` value has no CMS equivalent — keywords are not in `SiteSetting`.

#### `src/config/contactSettings.js` (lines 11-21)
```javascript
const contactSettings = {
  emailRecipient: 'sidrahsoft@gmail.com',
  form: {
    requiredFields: ['inquiryType', 'name', 'email', 'message'],
  },
};
```
**Status:** `emailRecipient` duplicates `SiteSetting.recipient_email`. The `requiredFields` config has no CMS equivalent. This file appears to be legacy — the contact form now submits to the backend API directly.

#### `src/data/company/companyLocation.js` (lines 1-17)
```javascript
export const companyLocation = {
  companyName: 'Sidrah Soft',
  address: { en: 'Etay Al Baroud, Egypt', ar: 'إيتاي البارود، مصر' },
  googleMapsUrl: 'https://www.google.com/maps?sca_esv=...',
  latitude: 30.8833,
  longitude: 30.6667,
  phone: '+966 50 000 0000',
  email: 'sidrahsoft@gmail.com',
  workingHours: 'Sun - Thu, 9:00 AM - 5:00 PM',
  seoLocationTitle: 'Sidrah Soft Office | Business Automation',
  seoLocationDescription: 'Visit Sidrah Soft in Etay Al Baroud, Egypt...',
};
```
**Status:** Imported by `Footer.jsx` as fallback for address, googleMapsUrl. Contains **bilingual address** (EN/AR) while `SiteSetting.address` is a single `TextField`. Also has `seoLocationTitle`/`seoLocationDescription` with no CMS equivalent. Note the **conflicting data**: seed says "Riyadh, Saudi Arabia", fallback says "Etay Al Baroud, Egypt", phone says "+966 50 000 0000" (Saudi format).

### 2.2 Frontend i18n Files

#### `src/i18n/en.js` (lines 1-47)
```javascript
site: { title: 'Sidrah Soft — Business Automation' },
header: { brandSubtitle: 'Business Automation' },
footer: {
  copyright: '© 2026 Sidrah Soft. All rights reserved.',
  links: {
    email: 'sidrahsoft@gmail.com',
    location: 'Egypt',
  },
},
```

#### `src/i18n/ar.js` (lines 1-47)
```javascript
site: { title: 'سِدرة سوفت — أتمتة الأعمال' },
header: { brandSubtitle: 'أتمتة الأعمال' },
footer: {
  copyright: '© 2026 سِدرة سوفت. جميع الحقوق محفوظة.',
  links: {
    email: 'sidrahsoft@gmail.com',
    location: 'مصر',
  },
},
```
**Status:** Company name, copyright text, email, and location are embedded in i18n files. These are **not** read from CMS. The `footer.links.email` is used as link text in the footer contact column. The `header.brandSubtitle` is used in both Header and Footer with no CMS equivalent.

### 2.3 Frontend Components — Hardcoded Fallbacks

| Component | File | Hardcoded Values | CMS Integration |
|-----------|------|-------------------|-----------------|
| **Header** | `src/components/Header.jsx` | `brandName = settings?.general?.site_name \|\| 'Sidrah Soft'`, `logo` import from `src/assets/logo.svg` | ✅ Reads `useSiteSettings` |
| **Footer** | `src/components/Footer.jsx` | `brandName \|\| 'Sidrah Soft'`, `contactEmail \|\| 'sidrahsoft@gmail.com'`, `whatsappUrl \|\| 'https://wa.me/PLACEHOLDER'`, `linkedinUrl \|\| 'https://linkedin.com/company/PLACEHOLDER'`, imports `companyLocation` fallback, `logo` import | ✅ Reads `useSiteSettings` |
| **FloatingSocialBar** | `src/components/FloatingSocialBar.jsx` | `whatsapp_url \|\| 'https://wa.me/PLACEHOLDER'`, `telegram_url \|\| 'https://t.me/PLACEHOLDER'`, `contact_email \|\| 'mailto:hello@sidrahsoft.com'`, `linkedin_url \|\| 'https://linkedin.com/company/PLACEHOLDER'` | ✅ Reads `useSiteSettings` |
| **SEO** | `src/components/SEO.jsx` | Falls back to `SITE` config for all values, `SITE.keywords` used directly (no CMS equivalent) | ✅ Reads `useSiteSettings` |
| **ContactSection** | `src/components/sections/ContactSection.jsx` | 7 hardcoded `FALLBACK_INQUIRY_TYPES` with bilingual names | ✅ Reads `useInquiryTypes` hook |
| **PartnersTrustSection** | `src/components/sections/PartnersTrustSection.jsx` | 6 hardcoded fallback partners with logo imports from `src/assets/partiners/` | ✅ Reads `usePartners` hook |
| **AutomationShowcaseSection** | `src/components/sections/AutomationShowcaseSection.jsx` | Entirely hardcoded: pipeline nodes, integration nodes, headlines, descriptions — all inline | ❌ No CMS integration |
| **CareersSection** | `src/components/sections/CareersSection.jsx` | 4 hardcoded `careerCards` (title + description, English only) | ✅ Reads `useJobs` for active postings, but career category cards are hardcoded |
| **LeadsHeader** | `src/components/leads/LeadsHeader.jsx` | Hardcoded `SidrahSoft` text in brand link | ❌ No `useSiteSettings` integration |
| **LeadsLoginPage** | `src/components/leads/LeadsLoginPage.jsx` | Hardcoded `SidrahSoft` in brand name span | ❌ No `useSiteSettings` integration |

### 2.4 Frontend Data Files (Fallback Content)

| File | Content | CMS Equivalent |
|------|---------|----------------|
| `src/data/company/companyLocation.js` | Company name, bilingual address, maps URL, lat/lng, phone, email, working hours, SEO location | Partial — `SiteSetting` has most fields but lacks bilingual address and SEO location fields |
| `src/data/caseStudies/caseStudiesData.js` | 3 hardcoded case studies with client names, industries, technologies, metrics, SEO | ✅ `CaseStudy` model exists with full bilingual support |
| `src/data/insights/insightsData.js` | 5 hardcoded insight articles | ✅ `Article` model exists with full bilingual support |

### 2.5 Frontend Branding Assets

| Asset | Location | Usage |
|-------|----------|-------|
| `src/assets/logo.svg` | Imported directly in `Header.jsx` and `Footer.jsx` | Fallback when `settings?.branding?.primary_logo_url` is null |
| `src/assets/partiners/*.png/webp` | 6 partner logos imported in `PartnersTrustSection.jsx` | Fallback when CMS partners API unavailable |
| `src/assets/hero/*` | Hero video/image assets | Referenced in hero section |
| `public/assets/og-default.png` | Referenced in `seo.js` as `SITE.ogImage` | Fallback OG image, no CMS upload equivalent |
| `public/assets/insights/placeholder.svg` | Placeholder for insight articles | Static file |
| `public/assets/case-studies/placeholder.png` | Placeholder for case studies | Static file |

### 2.6 Backend Hardcoded Values

#### `backend/config/settings.py` (lines 252-266)
```python
DEFAULT_FROM_EMAIL = os.environ.get(
    'DEFAULT_FROM_EMAIL',
    'Sidrah Soft <sidrahsoft@gmail.com>',
)
CONTACT_NOTIFICATION_EMAIL = os.environ.get(
    'CONTACT_NOTIFICATION_EMAIL',
    'sidrahsoft@gmail.com',
)
LEADS_DASHBOARD_BASE_URL = os.environ.get(
    'LEADS_DASHBOARD_BASE_URL',
    'http://localhost:5174',
)
```
**Status:** Environment-variable-driven with hardcoded defaults. `DEFAULT_FROM_EMAIL` and `CONTACT_NOTIFICATION_EMAIL` should ideally read from `SiteSetting` but currently don't — they're resolved at Django startup time before the database is available.

#### `backend/apps/contact/services.py` (lines 18, 79, 82, 99, 105-107)
```python
DEFAULT_FALLBACK_EMAIL = 'sidrahsoft@gmail.com'
# ...
context = { 'site_name': 'SidrahSoft', ... }
subject = f"New SidrahSoft Lead — {inquiry_name} — {submission.full_name}"
# ...
subject = f"Thank you for contacting SidrahSoft — {inquiry_name}"
```
**Status:** `DEFAULT_FALLBACK_EMAIL` is a last-resort fallback. The `site_name` is hardcoded as `'SidrahSoft'` in email rendering context and email subjects. Should read from `SiteSetting.get_current().site_name`.

#### `backend/apps/core/seo_views.py` (line 20)
```python
return 'https://sidrahsoft.com'
```
**Status:** Fallback base URL when `SiteSetting.canonical_base_url` is empty. Acceptable as a last resort.

#### `backend/apps/site_settings/management/commands/seed_site_settings.py`
```python
SiteSetting.objects.create(
    site_name='SidrahSoft',
    site_tagline='Building intelligent digital ecosystems',
    contact_email='sidrahsoft@gmail.com',
    recipient_email='sidrahsoft@gmail.com',
    address='Riyadh, Saudi Arabia',
    working_hours='Sun - Thu, 9:00 AM - 5:00 PM',
)
```
**Status:** Seed data with hardcoded values. Acceptable for initial setup, but values conflict with frontend fallbacks (address: "Riyadh" vs "Etay Al Baroud").

#### Email Templates
- `backend/templates/contact/notification_email.txt` — "New SidrahSoft Lead" (hardcoded in template, but `site_name` is passed as context variable)
- `backend/templates/contact/confirmation_email.txt` — Uses `{{ site_name }}` variable (good), but the variable is hardcoded in `services.py`

---

## 3. Existing Backend CMS Models Assessment

### 3.1 SiteSetting (site_settings app)

**Model:** `backend/apps/site_settings/models.py`  
**Table:** `site_settings_sitesetting`  
**Pattern:** Singleton (enforced via `is_active` flag + `save()` override)  
**Helper:** `SiteSetting.get_current()` — returns active record or first record

| Field Group | Fields | Bilingual? | Gaps |
|-------------|--------|------------|------|
| **General** | `site_name`, `site_tagline`, `default_language`, `supported_languages` | ❌ No | `site_name` has no Arabic variant |
| **Contact** | `contact_email`, `recipient_email`, `phone`, `whatsapp_url`, `telegram_url` | ❌ No | No bilingual phone display |
| **Social** | `facebook_url`, `linkedin_url`, `instagram_url`, `youtube_url`, `x_url` | N/A | Complete |
| **Location** | `address`, `google_maps_url`, `map_embed_url`, `latitude`, `longitude`, `working_hours` | ❌ No | **`address` is single-language** — frontend fallback has EN/AR. `working_hours` not bilingual |
| **SEO** | `default_meta_title`, `default_meta_description`, `default_og_title`, `default_og_description`, `default_og_image`, `twitter_card_type`, `canonical_base_url`, `robots_index`, `organization_description` | ❌ No | No bilingual SEO fields. No `keywords` field |
| **Branding** | `primary_logo`, `secondary_logo`, `favicon` (all FK to `MediaAsset`) | N/A | No alt text fields for logos. No theme/color fields |

**Public API:** `GET /api/v1/site-settings/` → returns nested JSON:
```json
{
  "general": { "site_name", "site_tagline", "default_language", "supported_languages" },
  "contact": { "contact_email", "phone", "whatsapp_url", "telegram_url" },
  "social": { "facebook_url", "linkedin_url", "instagram_url", "youtube_url", "x_url" },
  "location": { "address", "google_maps_url", "map_embed_url", "latitude", "longitude", "working_hours" },
  "seo": { "default_meta_title", "default_meta_description", ... },
  "branding": { "primary_logo_url", "secondary_logo_url", "favicon_url" }
}
```

**CMS API:** `GET/PUT /api/v1/cms/site-settings/` — admin editing with `CMSSiteSettingSerializer`

**Assessment:** Strong foundation. Covers ~70% of company data needs. Key gaps: bilingual address, bilingual site name/tagline, SEO keywords, logo alt text, theme tokens.

### 3.2 HomepageSettings (homepage app)

**Model:** `backend/apps/homepage/models.py`  
**Pattern:** Singleton (same as SiteSetting)

Covers: hero headlines, CTAs, foundation section, marquee heading, industries heading, partners heading, case studies heading, insights heading, careers heading — all bilingual EN/AR.

**Assessment:** Well-structured. Already CMS-controlled. No changes needed for company info centralization.

### 3.3 NavigationMenu / NavigationItem (navigation app)

**Assessment:** Fully CMS-controlled with bilingual labels, link types (internal/external/anchor/email/phone), hierarchy support. Already consumed by `Header.jsx` via `useHeaderNavigation` hook. No changes needed.

### 3.4 Partner (partners app)

**Assessment:** Full bilingual model with `name_en/ar`, `description_en/ar`, `logo` (FK MediaAsset), `website_url`, `partner_type` (client/strategic/academic/technology/training/other), `display_order`, `is_featured`, `is_active`. Already consumed by `PartnersTrustSection.jsx` via `usePartners` hook. No changes needed.

### 3.5 Service (services app)

**Assessment:** Full bilingual model with descriptions, CTA labels, SEO fields, icon/featured image (FK MediaAsset), `display_order`, `is_featured`, `is_active`, `show_on_homepage`. No changes needed.

### 3.6 CaseStudy (case_studies app)

**Assessment:** Full bilingual model with problem/solution/technology/outcome sections, partner FK, services M2M, industry, SEO fields, OG fields. Already has CMS API. Frontend fallback data in `caseStudiesData.js` is legacy.

### 3.7 Article (insights app)

**Assessment:** Full bilingual model with content types, status workflow, scheduling, SEO fields. Already has CMS API and frontend integration with fallback.

### 3.8 Job (careers app)

**Assessment:** Full bilingual model with employment type, workplace type, experience level, application method, responsibilities/requirements/benefits, SEO fields. Already has CMS API.

### 3.9 InquiryType / ContactSubmission (contact app)

**Assessment:** `InquiryType` is bilingual with `recipient_email` override per type. `ContactSubmission` has full lead management workflow. Already integrated with frontend contact form.

### 3.10 MediaAsset (media_library app)

**Assessment:** Reusable media with `title`, `alt_text`, `media_type`, `usage_context`, file metadata. Used as FK target by all other models. No changes needed.

### 3.11 HomepageSectionConfig / MarqueeItem / Industry (homepage app)

**Assessment:** `HomepageSectionConfig` controls section visibility/ordering. `MarqueeItem` and `Industry` are bilingual ordered models. All CMS-controlled.

---

## 4. Gaps Analysis

### 4.1 Critical Gaps (Block Full Centralization)

| # | Gap | Impact | Affected Files |
|---|-----|--------|----------------|
| G1 | **No bilingual address in SiteSetting** | Frontend fallback provides `{ en, ar }` but CMS stores single `address` TextField. Arabic users get English address or nothing. | `companyLocation.js`, `Footer.jsx`, `SiteSetting model` |
| G2 | **No bilingual site_name/tagline in SiteSetting** | Arabic site name "سِدرة سوفت" is only in i18n files, not in CMS. | `i18n/en.js`, `i18n/ar.js`, `Header.jsx`, `Footer.jsx` |
| G3 | **No SEO keywords field in SiteSetting** | `SITE.keywords` in `seo.js` is the only source. SEO.jsx uses it directly with no CMS fallback. | `seo.js`, `SEO.jsx` |
| G4 | **Leads dashboard doesn't read SiteSettings** | `LeadsHeader.jsx` and `LeadsLoginPage.jsx` hardcode "SidrahSoft" without calling `useSiteSettings`. | `LeadsHeader.jsx`, `LeadsLoginPage.jsx` |
| G5 | **Backend email services hardcode company name** | `contact/services.py` uses `'SidrahSoft'` string literal instead of `SiteSetting.get_current().site_name`. | `contact/services.py` |
| G6 | **No CMS backing for AutomationShowcaseSection** | Pipeline nodes, integration nodes, headlines are all inline JSX. | `AutomationShowcaseSection.jsx` |
| G7 | **No CMS backing for career category cards** | 4 hardcoded cards in `CareersSection.jsx` (English only). | `CareersSection.jsx` |
| G8 | **No logo alt text in SiteSetting** | `primary_logo` FK to MediaAsset has `alt_text` on the asset, but no brand-specific alt text. | `Header.jsx`, `Footer.jsx` |

### 4.2 Moderate Gaps (Improve Consistency)

| # | Gap | Impact |
|---|-----|--------|
| G9 | **No bilingual working_hours in SiteSetting** | Single `CharField`, Arabic users see English hours |
| G10 | **No bilingual SEO location fields** | `companyLocation.js` has `seoLocationTitle`/`seoLocationDescription` with no CMS equivalent |
| G11 | **No theme/design token management in CMS** | Brand colors, typography, spacing are CSS-only in `tokens.css` |
| G12 | **No dark/light mode support** | All tokens are dark-mode-only |
| G13 | **Conflicting seed/fallback data** | Seed says "Riyadh, Saudi Arabia", fallback says "Etay Al Baroud, Egypt", phone is "+966 50 000 0000" (Saudi format) |
| G14 | **No `header.brandSubtitle` in CMS** | "Business Automation" / "أتمتة الأعمال" is only in i18n files |
| G15 | **No copyright year text in CMS** | "© 2026 Sidrah Soft" is hardcoded in i18n files |
| G16 | **No footer description in CMS** | Footer description text is in i18n files, not in SiteSetting |

### 4.3 Low Priority Gaps

| # | Gap | Impact |
|---|-----|--------|
| G17 | **`contactSettings.js` is legacy** | `emailRecipient` duplicates `SiteSetting.recipient_email`. File may be unused. |
| G18 | **Fallback partner logos are bundled assets** | 6 logo files in `src/assets/partiners/` are imported directly. Not harmful but adds bundle size. |
| G19 | **No favicon management in frontend** | `SiteSetting.favicon` exists but frontend doesn't use it — favicon is likely in `index.html` or `public/` |

---

## 5. Recommended Architecture

### 5.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    SINGLE SOURCE OF TRUTH                    │
│                                                              │
│  ┌─────────────────┐  ┌──────────────────┐                  │
│  │  SiteSetting    │  │ HomepageSettings │                  │
│  │  (singleton)    │  │ (singleton)      │                  │
│  │                 │  │                  │                  │
│  │ • Identity      │  │ • Hero           │                  │
│  │ • Contact       │  │ • Foundation     │                  │
│  │ • Social        │  │ • Section heads  │                  │
│  │ • Location      │  │ • Marquee items  │                  │
│  │ • SEO defaults  │  │ • Industries     │                  │
│  │ • Branding      │  │ • Section config │                  │
│  │ • Theme tokens  │  │                  │                  │
│  └────────┬────────┘  └────────┬─────────┘                  │
│           │                    │                             │
│  ┌────────┴────────┐  ┌───────┴──────────┐                  │
│  │  Navigation     │  │  Partners        │                  │
│  │  (Menu/Items)   │  │  (Partner)       │                  │
│  └────────┬────────┘  └────────┬─────────┘                  │
│           │                    │                             │
│  ┌────────┴────────┐  ┌───────┴──────────┐                  │
│  │  Services       │  │  Case Studies    │                  │
│  │  (Service)      │  │  (CaseStudy)     │                  │
│  └────────┬────────┘  └────────┬─────────┘                  │
│           │                    │                             │
│  ┌────────┴────────┐  ┌───────┴──────────┐                  │
│  │  Insights       │  │  Careers         │                  │
│  │  (Article)      │  │  (Job)           │                  │
│  └────────┬────────┘  └────────┬─────────┘                  │
│           │                    │                             │
│  ┌────────┴────────┐  ┌───────┴──────────┐                  │
│  │  Contact        │  │  Media Library   │                  │
│  │  (Inquiry/Lead) │  │  (MediaAsset)    │                  │
│  └─────────────────┘  └──────────────────┘                  │
│                                                              │
│  ┌─────────────────────────────────────────┐                │
│  │  NEW: WorkflowShowcase (proposed)        │                │
│  │  • Pipeline nodes (bilingual)            │                │
│  │  • Integration nodes (bilingual)         │                │
│  │  • Headlines/descriptions (bilingual)    │                │
│  └─────────────────────────────────────────┘                │
│                                                              │
│  ┌─────────────────────────────────────────┐                │
│  │  NEW: CareerCategory (proposed)          │                │
│  │  • Category cards (bilingual)            │                │
│  └─────────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Architecture Principles

1. **SiteSetting remains the singleton** for all global company identity data. Extend it with bilingual fields rather than creating a separate model.

2. **No new app needed** — extend `site_settings` app with additional fields and add new models to `homepage` app for workflow showcase and career categories.

3. **Frontend `useSiteSettings` hook is the primary consumer** — all components should read from it. Fallback values should be minimal and clearly marked as last-resort defaults.

4. **Backend services read from `SiteSetting.get_current()`** — no hardcoded company name, email, or URL in service code.

5. **i18n files contain UI labels only** — company name, email, copyright, and address should come from CMS, not from translation files.

6. **Design tokens remain CSS-based** for performance, but a CMS-controlled `ThemeConfig` model can override key brand colors at runtime via CSS custom properties injected in `<style>` tags.

---

## 6. Database Schema Proposal

### 6.1 SiteSetting Model Extensions

Add the following fields to the existing `SiteSetting` model:

```python
# Bilingual General
site_name_ar = models.CharField(max_length=120, blank=True, help_text='Arabic site name')
site_tagline_ar = models.CharField(max_length=255, blank=True, help_text='Arabic tagline')

# Bilingual Location
address_ar = models.TextField(blank=True, help_text='Arabic address')
working_hours_ar = models.CharField(max_length=120, blank=True, help_text='Arabic working hours')

# Bilingual SEO (optional — for Arabic SEO pages)
default_meta_title_ar = models.CharField(max_length=120, blank=True)
default_meta_description_ar = models.TextField(blank=True)
default_og_title_ar = models.CharField(max_length=120, blank=True)
default_og_description_ar = models.TextField(blank=True)

# SEO keywords
default_keywords = models.TextField(
    blank=True,
    help_text='Comma-separated default SEO keywords.',
)

# Bilingual SEO location
seo_location_title_en = models.CharField(max_length=200, blank=True)
seo_location_title_ar = models.CharField(max_length=200, blank=True)
seo_location_description_en = models.TextField(blank=True)
seo_location_description_ar = models.TextField(blank=True)

# Branding alt text
primary_logo_alt = models.CharField(max_length=255, blank=True, help_text='Alt text for primary logo')
secondary_logo_alt = models.CharField(max_length=255, blank=True)
favicon_alt = models.CharField(max_length=255, blank=True, default='Sidrah Soft Favicon')

# Brand subtitle (header.brandSubtitle equivalent)
brand_subtitle_en = models.CharField(max_length=120, blank=True, default='Business Automation')
brand_subtitle_ar = models.CharField(max_length=120, blank=True, default='أتمتة الأعمال')

# Footer
footer_description_en = models.TextField(blank=True)
footer_description_ar = models.TextField(blank=True)
copyright_text_en = models.CharField(max_length=255, blank=True, default='© 2026 Sidrah Soft. All rights reserved.')
copyright_text_ar = models.CharField(max_length=255, blank=True, default='© 2026 سِدرة سوفت. جميع الحقوق محفوظة.')

# Theme tokens (for future dark/light mode)
theme_mode = models.CharField(
    max_length=10,
    choices=[('dark', 'Dark'), ('light', 'Light'), ('auto', 'Auto')],
    default='dark',
    help_text='Default theme mode. Auto follows user preference.',
)
```

### 6.2 New Model: WorkflowShowcase (homepage app)

```python
class WorkflowShowcase(TimeStampedModel):
    """CMS-managed automation showcase section content."""
    
    eyebrow_en = models.CharField(max_length=80, blank=True)
    eyebrow_ar = models.CharField(max_length=80, blank=True)
    headline_en = models.CharField(max_length=200, blank=True)
    headline_ar = models.CharField(max_length=200, blank=True)
    description_en = models.TextField(blank=True)
    description_ar = models.TextField(blank=True)
    
    pipeline_label_en = models.CharField(max_length=120, blank=True)
    pipeline_label_ar = models.CharField(max_length=120, blank=True)
    pipeline_caption_en = models.CharField(max_length=255, blank=True)
    pipeline_caption_ar = models.CharField(max_length=255, blank=True)
    
    integrations_label_en = models.CharField(max_length=80, blank=True)
    integrations_label_ar = models.CharField(max_length=80, blank=True)
    
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'homepage_workflowshowcase'
        verbose_name = 'Workflow Showcase'
        verbose_name_plural = 'Workflow Showcases'


class WorkflowNode(TimeStampedModel):
    """A single node in the workflow pipeline or integrations row."""
    
    NODE_TYPE_PIPELINE = 'pipeline'
    NODE_TYPE_INTEGRATION = 'integration'
    NODE_TYPE_CHOICES = [
        (NODE_TYPE_PIPELINE, 'Pipeline'),
        (NODE_TYPE_INTEGRATION, 'Integration'),
    ]
    
    showcase = models.ForeignKey(
        WorkflowShowcase, related_name='nodes', on_delete=models.CASCADE
    )
    node_type = models.CharField(max_length=16, choices=NODE_TYPE_CHOICES, default=NODE_TYPE_PIPELINE)
    label_en = models.CharField(max_length=120)
    label_ar = models.CharField(max_length=120, blank=True)
    sublabel_en = models.CharField(max_length=120, blank=True)
    sublabel_ar = models.CharField(max_length=120, blank=True)
    variant = models.CharField(max_length=30, blank=True, help_text='Visual variant: gold, ai, accent, or blank')
    display_order = models.PositiveIntegerField(default=0)
    is_visible = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'homepage_workflownode'
        ordering = ['node_type', 'display_order', 'id']
```

### 6.3 New Model: CareerCategory (homepage app or careers app)

```python
class CareerCategory(TimeStampedModel):
    """CMS-managed career category card for the homepage careers section."""
    
    title_en = models.CharField(max_length=120)
    title_ar = models.CharField(max_length=120, blank=True)
    description_en = models.TextField(blank=True)
    description_ar = models.TextField(blank=True)
    icon = models.ForeignKey(
        MediaAsset, related_name='+', on_delete=models.SET_NULL,
        blank=True, null=True,
    )
    display_order = models.PositiveIntegerField(default=0)
    is_visible = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'careers_careercategory'
        ordering = ['display_order', 'id']
```

### 6.4 New Model: ThemeToken (site_settings app) — Future

```python
class ThemeToken(TimeStampedModel):
    """CMS-managed design token override for brand theming."""
    
    THEME_DARK = 'dark'
    THEME_LIGHT = 'light'
    THEME_CHOICES = [(THEME_DARK, 'Dark'), (THEME_LIGHT, 'Light')]
    
    theme = models.CharField(max_length=10, choices=THEME_CHOICES, default=THEME_DARK)
    token_name = models.CharField(max_length=120, help_text='CSS custom property name, e.g. --color-gold')
    token_value = models.CharField(max_length=255, help_text='CSS value, e.g. #c9a96e')
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'site_settings_themetoken'
        unique_together = [('theme', 'token_name')]
        ordering = ['theme', 'token_name']
```

---

## 7. API Structure Proposal

### 7.1 Existing APIs (No Changes Needed)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/site-settings/` | GET | Public site settings (nested JSON) |
| `/api/v1/cms/site-settings/` | GET/PUT | CMS admin editing |
| `/api/v1/navigation/` | GET | Navigation menus/items |
| `/api/v1/partners/` | GET | Partners list |
| `/api/v1/services/` | GET | Services list |
| `/api/v1/case-studies/` | GET | Case studies list |
| `/api/v1/insights/` | GET | Articles list |
| `/api/v1/insights/<slug>/` | GET | Article detail |
| `/api/v1/jobs/` | GET | Jobs list |
| `/api/v1/homepage/` | GET | Homepage config |
| `/api/v1/contact/inquiry-types/` | GET | Inquiry types |
| `/api/v1/contact/submit/` | POST | Contact form submission |

### 7.2 Extended API: Site Settings (Modified)

The existing `GET /api/v1/site-settings/` response will be extended with new fields:

```json
{
  "general": {
    "site_name": "Sidrah Soft",
    "site_name_ar": "سِدرة سوفت",
    "site_tagline": "Building intelligent digital ecosystems",
    "site_tagline_ar": "بناء أنظمة رقمية ذكية",
    "brand_subtitle_en": "Business Automation",
    "brand_subtitle_ar": "أتمتة الأعمال",
    "default_language": "en",
    "supported_languages": ["en", "ar"]
  },
  "contact": {
    "contact_email": "sidrahsoft@gmail.com",
    "phone": "+966 50 000 0000",
    "whatsapp_url": "https://wa.me/...",
    "telegram_url": "https://t.me/..."
  },
  "social": {
    "facebook_url": "",
    "linkedin_url": "https://linkedin.com/company/...",
    "instagram_url": "",
    "youtube_url": "",
    "x_url": ""
  },
  "location": {
    "address": "Etay Al Baroud, Egypt",
    "address_ar": "إيتاي البارود، مصر",
    "google_maps_url": "https://...",
    "map_embed_url": "",
    "latitude": "30.883300",
    "longitude": "30.666700",
    "working_hours": "Sun - Thu, 9:00 AM - 5:00 PM",
    "working_hours_ar": "الأحد - الخميس، 9:00 ص - 5:00 م",
    "seo_location_title_en": "Sidrah Soft Office | Business Automation",
    "seo_location_title_ar": "مكتب سِدرة سوفت | أتمتة الأعمال",
    "seo_location_description_en": "Visit Sidrah Soft...",
    "seo_location_description_ar": "زر سِدرة سوفت..."
  },
  "seo": {
    "default_meta_title": "...",
    "default_meta_description": "...",
    "default_meta_title_ar": "...",
    "default_meta_description_ar": "...",
    "default_og_title": "...",
    "default_og_description": "...",
    "default_og_title_ar": "...",
    "default_og_description_ar": "...",
    "default_og_image_url": "/media/uploads/...",
    "default_keywords": "Business Automation, ERP Systems, ...",
    "twitter_card_type": "summary_large_image",
    "canonical_base_url": "https://sidrahsoft.com",
    "robots_index": true,
    "organization_description": "..."
  },
  "branding": {
    "primary_logo_url": "/media/uploads/...",
    "primary_logo_alt": "Sidrah Soft Logo",
    "secondary_logo_url": null,
    "secondary_logo_alt": "",
    "favicon_url": null,
    "favicon_alt": "Sidrah Soft Favicon"
  },
  "footer": {
    "description_en": "Building intelligent digital systems...",
    "description_ar": "نبني أنظمة رقمية ذكية...",
    "copyright_text_en": "© 2026 Sidrah Soft. All rights reserved.",
    "copyright_text_ar": "© 2026 سِدرة سوفت. جميع الحقوق محفوظة."
  },
  "theme": {
    "theme_mode": "dark"
  }
}
```

### 7.3 New API: Workflow Showcase

```
GET /api/v1/homepage/workflow-showcase/
```

Response:
```json
{
  "eyebrow": { "en": "Intelligent Automation", "ar": "أتمتة ذكية" },
  "headline": { "en": "From intake to delivery...", "ar": "..." },
  "description": { "en": "Every lead flows...", "ar": "..." },
  "pipeline": {
    "label": { "en": "Lead Processing Pipeline", "ar": "مسار معالجة العملاء" },
    "caption": { "en": "AI qualification → ...", "ar": "..." },
    "nodes": [
      { "label": { "en": "Lead", "ar": "وارد" }, "sublabel": { "en": "Inbound", "ar": "وارد" }, "variant": "gold" },
      ...
    ]
  },
  "integrations": {
    "label": { "en": "Integrations", "ar": "تكاملات" },
    "nodes": [
      { "label": { "en": "Email", "ar": "بريد" }, "variant": "accent" },
      ...
    ]
  }
}
```

### 7.4 New API: Career Categories

```
GET /api/v1/jobs/categories/
```

Response:
```json
[
  {
    "title": { "en": "Software Engineering", "ar": "هندسة البرمجيات" },
    "description": { "en": "Build scalable web platforms...", "ar": "..." },
    "icon_url": "/media/uploads/..."
  },
  ...
]
```

### 7.5 New API: Theme Tokens (Future)

```
GET /api/v1/site-settings/theme/?theme=dark
GET /api/v1/site-settings/theme/?theme=light
```

Response:
```json
{
  "theme": "dark",
  "tokens": [
    { "name": "--color-bg", "value": "#0c0e13" },
    { "name": "--color-gold", "value": "#c9a96e" },
    ...
  ]
}
```

---

## 8. Frontend Integration Strategy

### 8.1 Current Pattern (Keep & Extend)

The existing pattern is sound and should be extended:

1. **`useSiteSettings` hook** fetches `/api/v1/site-settings/` once and caches the result. All components share the same cached data.
2. **Components read from `settings` object** with fallback values: `const brandName = settings?.general?.site_name || 'Sidrah Soft'`
3. **Fallback values are last-resort defaults** — they should be minimal and not contain business-critical data.

### 8.2 Changes Required

#### 8.2.1 Extend `useSiteSettings` Hook

No structural change needed — the hook already fetches the full settings object. The extended API response will automatically include new fields.

#### 8.2.2 Create `useWorkflowShowcase` Hook

```javascript
// src/hooks/useWorkflowShowcase.js
export function useWorkflowShowcase() {
  // Fetch from /api/v1/homepage/workflow-showcase/
  // Cache result
  // Return { showcase, loading, error }
}
```

#### 8.2.3 Create `useCareerCategories` Hook

```javascript
// src/hooks/useCareerCategories.js
export function useCareerCategories() {
  // Fetch from /api/v1/jobs/categories/
  // Cache result
  // Return { categories, loading, error }
}
```

#### 8.2.4 Update Component Fallbacks

| Component | Current Fallback | Proposed Change |
|-----------|-----------------|-----------------|
| **Header.jsx** | `brandName \|\| 'Sidrah Soft'` | Use `settings?.general?.site_name` with `getBilingual()` for AR support. Brand subtitle from `settings?.general?.brand_subtitle_en/ar` instead of `t('header.brandSubtitle')` |
| **Footer.jsx** | Multiple hardcoded fallbacks | Read `footer.description_en/ar`, `footer.copyright_text_en/ar` from settings. Remove `companyLocation.js` import. |
| **FloatingSocialBar.jsx** | PLACEHOLDER URLs | Keep minimal fallbacks but ensure CMS values take priority |
| **SEO.jsx** | `SITE.keywords` used directly | Read `settings?.seo?.default_keywords` with fallback to `SITE.keywords` |
| **LeadsHeader.jsx** | Hardcoded "SidrahSoft" | Add `useSiteSettings` hook, read `settings?.general?.site_name` |
| **LeadsLoginPage.jsx** | Hardcoded "SidrahSoft" | Add `useSiteSettings` hook, read `settings?.general?.site_name` |
| **AutomationShowcaseSection.jsx** | All inline | Use `useWorkflowShowcase` hook with current inline data as fallback |
| **CareersSection.jsx** | 4 hardcoded cards | Use `useCareerCategories` hook with current data as fallback |
| **ContactSection.jsx** | 7 hardcoded inquiry types | Already uses `useInquiryTypes` — keep fallback as-is |

#### 8.2.5 i18n File Changes

Remove company-specific data from i18n files and read from CMS:

| i18n Key | Current | Proposed |
|----------|---------|----------|
| `site.title` | `'Sidrah Soft — Business Automation'` | Keep as fallback, but SEO.jsx should construct from `settings?.general?.site_name` + `settings?.general?.brand_subtitle_en` |
| `header.brandSubtitle` | `'Business Automation'` | Read from `settings?.general?.brand_subtitle_en/ar`. Keep i18n as fallback. |
| `footer.description` | `'Building intelligent digital systems...'` | Read from `settings?.footer?.description_en/ar`. Keep i18n as fallback. |
| `footer.copyright` | `'© 2026 Sidrah Soft. All rights reserved.'` | Read from `settings?.footer?.copyright_text_en/ar`. Keep i18n as fallback. |
| `footer.links.email` | `'sidrahsoft@gmail.com'` | Read from `settings?.contact?.contact_email`. Keep i18n as fallback. |
| `footer.links.location` | `'Egypt'` / `'مصر'` | Read from `settings?.location?.address` (bilingual). Keep i18n as fallback. |

#### 8.2.6 Bilingual Helper

Create a utility to read bilingual fields from CMS settings:

```javascript
// src/utils/getSettingsBilingual.js
export function getSettingsBilingual(settings, fieldPath, lang, fallback = '') {
  const parts = fieldPath.split('.');
  let obj = settings;
  for (const part of parts) {
    obj = obj?.[part];
    if (!obj) return fallback;
  }
  // If obj has { en, ar } shape, return the right language
  if (typeof obj === 'object' && (obj.en || obj.ar)) {
    return obj[lang] || obj.en || fallback;
  }
  return obj || fallback;
}
```

---

## 9. Migration Strategy

### 9.1 Principles

1. **No breaking changes** — every change must preserve the fallback pattern so the site works even if the CMS API is down.
2. **Backend first** — add model fields, run migration, update serializer, update seed command.
3. **Frontend second** — update components to read new CMS fields, keeping existing fallbacks.
4. **Clean up last** — remove hardcoded values only after CMS data is confirmed working in production.

### 9.2 Phase 1: SiteSetting Bilingual Extension (Backend)

**Scope:** Add bilingual fields to `SiteSetting` model.

1. Add fields: `site_name_ar`, `site_tagline_ar`, `address_ar`, `working_hours_ar`, `brand_subtitle_en/ar`, `footer_description_en/ar`, `copyright_text_en/ar`, `default_keywords`, `primary_logo_alt`, `secondary_logo_alt`, `favicon_alt`, SEO location fields, Arabic SEO fields.
2. Create migration `0004_bilingual_and_extended_fields`.
3. Update `SiteSettingSerializer` to include new fields in the nested JSON response.
4. Update `CMSSiteSettingSerializer` to allow editing new fields.
5. Update `seed_site_settings.py` with bilingual seed values.
6. Run `makemigrations --check` and `migrate`.

**Risk:** Low — additive only, no existing fields changed.

### 9.3 Phase 2: Frontend Bilingual Integration

**Scope:** Update frontend components to read new CMS fields.

1. Update `Footer.jsx` — read bilingual address, copyright, description, brand subtitle from settings.
2. Update `Header.jsx` — read bilingual brand name and subtitle from settings.
3. Update `SEO.jsx` — read `default_keywords` from settings.
4. Update `LeadsHeader.jsx` and `LeadsLoginPage.jsx` — add `useSiteSettings` hook.
5. Update i18n files — mark company-specific entries as fallbacks with comments.
6. Run `npm run build` to verify.

**Risk:** Low — fallbacks preserved, CMS values are additive.

### 9.4 Phase 3: Backend Service Hardcode Elimination

**Scope:** Remove hardcoded company name/email from backend services.

1. Update `contact/services.py` — replace `'SidrahSoft'` with `SiteSetting.get_current().site_name`.
2. Update email subjects to use dynamic site name.
3. Update `DEFAULT_FALLBACK_EMAIL` to read from `SiteSetting.get_current().contact_email`.
4. Keep `settings.py` env vars as bootstrap defaults (needed before DB is ready).

**Risk:** Low — `SiteSetting.get_current()` already used elsewhere. Edge case: if DB is down, fallback to env vars.

### 9.5 Phase 4: Workflow Showcase CMS (Backend + Frontend)

**Scope:** Create CMS backing for AutomationShowcaseSection.

1. Create `WorkflowShowcase` and `WorkflowNode` models in `homepage` app.
2. Create migration, admin registration, serializers, views, URLs.
3. Create seed command with current hardcoded data.
4. Create `useWorkflowShowcase` hook on frontend.
5. Update `AutomationShowcaseSection.jsx` to read from hook with fallback.
6. Add CMS admin page for editing workflow showcase content.

**Risk:** Medium — new model and API, but follows existing patterns.

### 9.6 Phase 5: Career Categories CMS (Backend + Frontend)

**Scope:** Create CMS backing for career category cards.

1. Create `CareerCategory` model in `careers` app.
2. Create migration, admin, serializers, views, URLs.
3. Create seed command with current 4 hardcoded cards.
4. Create `useCareerCategories` hook.
5. Update `CareersSection.jsx` to read from hook with fallback.

**Risk:** Low — simple model, follows existing patterns.

### 9.7 Phase 6: Data Cleanup & Fallback Removal

**Scope:** Remove redundant hardcoded data and legacy files.

1. Remove `src/data/company/companyLocation.js` — all data now in CMS.
2. Remove `src/config/contactSettings.js` — legacy, unused.
3. Remove `src/config/seo.js` `SITE` object — replace with minimal constants file with only structural defaults (e.g., `defaultCanonical = '/'`).
4. Remove hardcoded partner logo imports from `PartnersTrustSection.jsx` — rely on CMS only.
5. Remove hardcoded `careerCards` from `CareersSection.jsx`.
6. Clean up i18n files — remove company-specific entries that are now CMS-managed.
7. Resolve data conflicts (Riyadh vs Etay Al Baroud, phone format).

**Risk:** Medium — removing fallbacks means CMS must be available. Consider keeping minimal fallbacks for critical fields (site_name, contact_email) but removing business-specific fallbacks (address, social links).

### 9.8 Phase 7: Theme Token Management (Future)

**Scope:** CMS-controlled design tokens for dark/light mode.

1. Create `ThemeToken` model in `site_settings` app.
2. Add `theme_mode` field to `SiteSetting`.
3. Create API endpoint for theme tokens.
4. Create frontend `ThemeProvider` component that injects CSS custom properties.
5. Implement light mode token set.
6. Add theme toggle UI in header.

**Risk:** High — requires comprehensive CSS audit and light mode design work.

---

## 10. Future Feature Support

### 10.1 Dark Mode / Light Mode

**Current State:** All design tokens in `src/styles/tokens.css` are dark-mode-only. No `[data-theme="light"]` selector exists.

**Recommended Approach:**
1. Add `theme_mode` field to `SiteSetting` (dark/light/auto).
2. Create `ThemeToken` model for CMS-managed token overrides.
3. Frontend `ThemeProvider` component reads theme settings and sets `data-theme` attribute on `<html>`.
4. CSS uses `:root[data-theme="light"]` selector to override tokens.
5. Auto mode uses `prefers-color-scheme` media query.
6. Theme toggle in header persisted to `localStorage`.

**Architecture Impact:**
- `tokens.css` needs a parallel light-mode token set.
- All CSS that uses `rgba(242, 242, 242, ...)` for surfaces needs light-mode equivalents.
- Images and media may need light-mode variants.
- The hero video/animation may need a light-mode fallback.

### 10.2 Multi-Language Content

**Current State:** Bilingual (EN/AR) support exists in all CMS models via `*_en`/`*_ar` field pairs. The frontend `useI18n` provider handles language switching. `getBilingual()` utility picks the right field.

**Recommended Approach for Additional Languages:**
1. **Option A (Recommended): JSONField approach** — for new fields that need multi-language support, use `JSONField` with `{ "en": "...", "ar": "...", "fr": "..." }` structure. More flexible than adding `*_fr`, `*_tr` columns.
2. **Option B: Translation table** — create a generic `Translation` model with `(model, field, language, value)`. More normalized but complex to query.
3. **Keep current pattern for existing models** — EN/AR pairs are sufficient for the current market. Add new languages only when needed.
4. `SiteSetting.supported_languages` already exists as a JSONField list — extend it when adding languages.
5. Frontend `I18nProvider` needs to support dynamic language lists, not just EN/AR toggle.

### 10.3 Leads Dashboard

**Current State:** Fully functional with login, list, detail, status/priority/notes management, email notifications, activity logging. Brand text is hardcoded.

**Recommended Changes:**
1. Add `useSiteSettings` to leads components (LeadsHeader, LeadsLoginPage).
2. Read `LEADS_DASHBOARD_BASE_URL` from `SiteSetting` instead of `settings.py` env var (or keep env var as bootstrap, override from CMS at runtime).
3. Email notification templates should use `SiteSetting.site_name` instead of hardcoded string.
4. Future: lead scoring rules, auto-assignment rules, and email templates could be CMS-managed.

### 10.4 Future Academy/LMS

**Recommended Approach:**
1. Create new `apps.academy` Django app.
2. Models: `Course`, `Module`, `Lesson`, `Enrollment`, `Progress`.
3. Reuse existing patterns: bilingual fields, `MediaAsset` for media, `display_order`, `is_active`, SEO fields.
4. Public API: `GET /api/v1/courses/`, `GET /api/v1/courses/<slug>/`.
5. Frontend: new `/academy` routes, reuse `useSiteSettings` for branding.
6. No changes to `SiteSetting` needed — academy is content, not company identity.

### 10.5 Future Mobile App

**Recommended Approach:**
1. The existing REST API is already mobile-friendly (JSON, session auth, CORS configured).
2. Mobile app should consume the same `/api/v1/site-settings/` endpoint for company identity.
3. Consider adding a `GET /api/v1/app-config/` endpoint that returns a consolidated response (site settings + navigation + feature flags) to reduce mobile startup requests.
4. Add `SiteSetting.app_name` and `SiteSetting.app_short_name` fields if the app needs a different brand name than the website.
5. Push notification tokens and mobile-specific settings could go in a new `MobileAppConfig` model.

---

## 11. Implementation Phasing

| Phase | Scope | Effort | Priority | Dependencies |
|-------|-------|--------|----------|--------------|
| **P1** | SiteSetting bilingual extension (backend) | Small | High | None |
| **P2** | Frontend bilingual integration | Small | High | P1 |
| **P3** | Backend service hardcode elimination | Small | High | P1 |
| **P4** | Workflow showcase CMS | Medium | Medium | None |
| **P5** | Career categories CMS | Small | Medium | None |
| **P6** | Data cleanup & fallback removal | Small | Low | P1-P5 |
| **P7** | Theme token management + light mode | Large | Low | P1-P6 |

**Recommended order:** P1 → P2 → P3 → P4 → P5 → P6 → P7

---

## 12. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| CMS API unavailable causes broken UI | Low | High | Keep minimal fallbacks for critical fields (site_name, contact_email, logo). Fallback pattern already in place. |
| Bilingual field migration corrupts existing data | Low | Medium | Migration is additive only — no existing fields modified. New fields default to blank. |
| Seed data conflicts with production data | Medium | Low | Seed command is idempotent — only creates if no records exist. Admin should update via CMS UI. |
| Light mode requires extensive CSS rework | High | High | Defer to Phase 7. Conduct a full CSS audit before starting. Budget significant design time. |
| Performance impact of additional API calls | Low | Low | `useSiteSettings` already caches. New hooks (`useWorkflowShowcase`, `useCareerCategories`) should follow the same cache pattern. Consider bundling into a single `/api/v1/homepage/all/` endpoint. |
| Backend service changes break email delivery | Low | Medium | Test email sending after Phase 3. Keep env var fallbacks for bootstrap scenarios. |

---

## Appendix A: Complete File Inventory

### Frontend Files with Hardcoded Company Data

| File | Data Type | CMS Integrated? |
|------|-----------|-----------------|
| `src/config/seo.js` | Company name, URL, email, logo, social links, keywords, SEO defaults | ✅ (fallback only) |
| `src/config/contactSettings.js` | Email recipient, form fields | ❌ (legacy) |
| `src/data/company/companyLocation.js` | Company name, bilingual address, maps URL, lat/lng, phone, email, hours, SEO location | ✅ (fallback only) |
| `src/data/caseStudies/caseStudiesData.js` | 3 case studies with client names, industries, metrics | ✅ (fallback only) |
| `src/data/insights/insightsData.js` | 5 insight articles | ✅ (fallback only) |
| `src/i18n/en.js` | Site title, brand subtitle, footer description, copyright, email, location | ❌ |
| `src/i18n/ar.js` | Same as above (Arabic) | ❌ |
| `src/components/Header.jsx` | Brand name fallback, logo import | ✅ |
| `src/components/Footer.jsx` | Brand name, email, whatsapp, linkedin, address fallbacks, logo import | ✅ |
| `src/components/FloatingSocialBar.jsx` | WhatsApp, Telegram, email, LinkedIn fallback URLs | ✅ |
| `src/components/SEO.jsx` | SITE config fallback for all SEO values | ✅ |
| `src/components/sections/ContactSection.jsx` | 7 fallback inquiry types | ✅ |
| `src/components/sections/PartnersTrustSection.jsx` | 6 fallback partners with logo imports | ✅ |
| `src/components/sections/AutomationShowcaseSection.jsx` | Pipeline nodes, integration nodes, headlines | ❌ |
| `src/components/sections/CareersSection.jsx` | 4 career category cards | ❌ |
| `src/components/leads/LeadsHeader.jsx` | "SidrahSoft" brand text | ❌ |
| `src/components/leads/LeadsLoginPage.jsx` | "SidrahSoft" brand text | ❌ |

### Backend Files with Hardcoded Company Data

| File | Data Type | CMS Integrated? |
|------|-----------|-----------------|
| `backend/config/settings.py` | `DEFAULT_FROM_EMAIL`, `CONTACT_NOTIFICATION_EMAIL`, `LEADS_DASHBOARD_BASE_URL` | ❌ (env vars with hardcoded defaults) |
| `backend/apps/contact/services.py` | `DEFAULT_FALLBACK_EMAIL`, `'SidrahSoft'` in email context/subjects | ✅ (partially — reads `SiteSetting.recipient_email`) |
| `backend/apps/core/seo_views.py` | Fallback `'https://sidrahsoft.com'` | ✅ (reads `SiteSetting.canonical_base_url`) |
| `backend/apps/site_settings/seed_site_settings.py` | Seed values | N/A (seed only) |
| `backend/templates/contact/notification_email.txt` | "New SidrahSoft Lead" | ✅ (uses `{{ site_name }}` variable) |
| `backend/templates/contact/confirmation_email.txt` | Uses `{{ site_name }}` | ✅ |

### Backend CMS Models (Existing)

| Model | App | Table | Bilingual | Singleton |
|-------|-----|-------|-----------|-----------|
| `SiteSetting` | site_settings | `site_settings_sitesetting` | ❌ (needs extension) | ✅ |
| `HomepageSettings` | homepage | `homepage_homepagesettings` | ✅ | ✅ |
| `HomepageSectionConfig` | homepage | `homepage_hompagesectionconfig` | N/A | ❌ |
| `MarqueeItem` | homepage | `homepage_marqueeitem` | ✅ | ❌ |
| `Industry` | homepage | `homepage_industry` | ✅ | ❌ |
| `NavigationMenu` | navigation | `navigation_navigationmenu` | N/A | ❌ |
| `NavigationItem` | navigation | `navigation_navigationitem` | ✅ | ❌ |
| `Partner` | partners | `partners_partner` | ✅ | ❌ |
| `Service` | services | `services_service` | ✅ | ❌ |
| `CaseStudy` | case_studies | `case_studies_casestudy` | ✅ | ❌ |
| `Article` | insights | (insights table) | ✅ | ❌ |
| `Job` | careers | `careers_job` | ✅ | ❌ |
| `InquiryType` | contact | `contact_inquirytype` | ✅ | ❌ |
| `ContactSubmission` | contact | `contact_contactsubmission` | N/A | ❌ |
| `MediaAsset` | media_library | `media_library_mediaasset` | N/A | ❌ |

---

## Appendix B: Data Conflict Summary

| Field | Seed Value | Frontend Fallback | Notes |
|-------|-----------|-------------------|-------|
| Address | "Riyadh, Saudi Arabia" | "Etay Al Baroud, Egypt" | **Conflict** — must resolve in CMS |
| Phone | (empty in seed) | "+966 50 000 0000" | Saudi format, placeholder number |
| Site name | "SidrahSoft" | "Sidrah Soft" | **Minor conflict** — spacing difference |
| Email | "sidrahsoft@gmail.com" | "sidrahsoft@gmail.com" | ✅ Consistent |
| Working hours | "Sun - Thu, 9:00 AM - 5:00 PM" | "Sun - Thu, 9:00 AM - 5:00 PM" | ✅ Consistent |

---

**End of Report**  
**Investigation ID:** COMPANY-SINGLE-SOURCE-OF-TRUTH-INVESTIGATION-001  
**Verdict:** Architecture ready for phased implementation. Existing `SiteSetting` model provides a strong foundation. 7 implementation phases recommended, with Phases 1-3 as high-priority immediate work.
