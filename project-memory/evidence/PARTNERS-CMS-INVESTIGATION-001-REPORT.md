# PARTNERS-CMS-INVESTIGATION-001 REPORT

## 1. Objective

Investigate the current Partners / Clients implementation across the SidrahSoft backend and frontend, determine CMS readiness, and produce a recommended architecture before any code changes are made.

**Methodology:** Investigation → Report → Review → Implementation. No source files were modified during this investigation.

---

## 2. Current State

### 2.1 Backend

There is **no dedicated partner or client app** in the Django backend. The existing CMS apps are:

| App | Purpose |
| --- | --- |
| `apps.core` | Shared `TimeStampedModel` abstract base; health-check endpoint only |
| `apps.accounts` | Custom `User` model with role foundation |
| `apps.site_settings` | Singleton global site configuration |
| `apps.navigation` | CMS-controlled menus and links |
| `apps.media_library` | Reusable media assets (`MediaAsset`) |

No model named `Partner`, `Client`, `Customer`, or similar exists. A full-text search across `.py`, `.jsx`, `.js`, `.md`, `.json`, and `.html` files for `partner|client|Client|Partner` returned **no backend results**; the only matches are in the frontend section component and asset folder.

### 2.2 Frontend

The partner UI lives in a single component:

- `f:\What_i_Made\New\sidrah_web\src\components\sections\PartnersTrustSection.jsx`

It imports six logo assets directly and defines a hardcoded `partners` array:

```@f:\What_i_Made\New\sidrah_web\src\components\sections\PartnersTrustSection.jsx:1-41
import { useEffect, useRef, useState } from 'react';

import eurofinsLogo from '../../assets/partiners/eurofins.png';
import orangeTheoryLogo from '../../assets/partiners/Orangetheory-Fitness-Logo.png';
import clubPilatesLogo from '../../assets/partiners/club-pilates-logo-g2gsvcvaj31u80ap.png';
import safaLogo from '../../assets/partiners/safa.webp';
import visionLogo from '../../assets/partiners/vision.png';
import alqalamLogo from '../../assets/partiners/alqalam.png';

const partners = [
  {
    name: 'Eurofins',
    logo: eurofinsLogo,
    website: 'https://www.eurofins.com/',
  },
  {
    name: 'Orangetheory Fitness KSA',
    logo: orangeTheoryLogo,
    website: 'https://join.otfksa.com/',
  },
  {
    name: 'Club Pilates Saudi Arabia',
    logo: clubPilatesLogo,
    website: 'https://clubpilates.sa/',
  },
  {
    name: 'Safa Invest',
    logo: safaLogo,
    website: 'https://safainvest.com/',
  },
  {
    name: 'Vision',
    logo: visionLogo,
    website: 'https://vision.edu.sa/',
  },
  {
    name: 'AlQalam Schools',
    logo: alqalamLogo,
    website: 'https://alqalamschools.com/',
  },
];
```

The section is rendered in the home page at `f:\What_i_Made\New\sidrah_web\src\App.jsx:33`:

```@f:\What_i_Made\New\sidrah_web\src\App.jsx:30-35
        <IndustriesSection />
        <PartnersTrustSection />
        <CaseStudiesSection />
```

### 2.3 Partner Assets

Static logo files are located at `f:\What_i_Made\New\sidrah_web\src\assets\partiners\`:

| File | Size | Format |
| --- | --- | --- |
| `eurofins.png` | 4,866 bytes | PNG |
| `Orangetheory-Fitness-Logo.png` | 17,029 bytes | PNG |
| `club-pilates-logo-g2gsvcvaj31u80ap.png` | 35,451 bytes | PNG |
| `safa.webp` | 8,804 bytes | WebP |
| `vision.png` | 58,684 bytes | PNG |
| `alqalam.png` | 159,214 bytes | PNG |
| `partteneres` | 125 bytes | Text file with five partner URLs |

All logos are also emitted into the production build under `f:\What_i_Made\New\sidrah_web\dist\assets\`.

### 2.4 Related Hardcoded Frontend Content

- **Services** are hardcoded in `f:\What_i_Made\New\sidrah_web\src\components\sections\ServicesSection.jsx`.
- **Industries** are hardcoded in `f:\What_i_Made\New\sidrah_web\src\components\sections\IndustriesSection.jsx`.
- **Case studies** are hardcoded in `f:\What_i_Made\New\sidrah_web\src\data\caseStudies\caseStudiesData.js` and referenced by `f:\What_i_Made\New\sidrah_web\src\utils\content\caseStudies.js`.

There is no backend API integration for any of these content areas yet.

---

## 3. Existing Files

### Backend

| File | Status | Notes |
| --- | --- | --- |
| `f:\What_i_Made\New\sidrah_web\backend\config\settings.py` | Exists | `LOCAL_APPS` lists `core`, `accounts`, `site_settings`, `navigation`, `media_library`; no `partners` app |
| `f:\What_i_Made\New\sidrah_web\backend\config\urls.py` | Exists | Includes `core`, `site_settings`, and `navigation` under `/api/v1/`; no partner routes |
| `f:\What_i_Made\New\sidrah_web\backend\apps\core\models.py` | Exists | Provides `TimeStampedModel` abstract base |
| `f:\What_i_Made\New\sidrah_web\backend\apps\media_library\models.py` | Exists | Provides `MediaAsset` with image/document/video/audio support |
| `f:\What_i_Made\New\sidrah_web\backend\apps\media_library\admin.py` | Exists | Basic `MediaAssetAdmin` |
| `f:\What_i_Made\New\sidrah_web\backend\apps\site_settings\models.py` | Exists | Singleton pattern with FKs to `MediaAsset` |
| `f:\What_i_Made\New\sidrah_web\backend\apps\site_settings\serializers.py` | Exists | Public grouped serializer pattern |
| `f:\What_i_Made\New\sidrah_web\backend\apps\site_settings\views.py` | Exists | Read-only public `APIView` |
| `f:\What_i_Made\New\sidrah_web\backend\apps\site_settings\urls.py` | Exists | Single endpoint wiring pattern |
| `f:\What_i_Made\New\sidrah_web\backend\apps\navigation\models.py` | Exists | Demonstrates bilingual fields (`label_en`, `label_ar`), ordering, visibility, and `MediaAsset` FK |
| `f:\What_i_Made\New\sidrah_web\backend\apps\navigation\serializers.py` | Exists | Shows nested, bilingual serializer pattern |
| `f:\What_i_Made\New\sidrah_web\backend\apps\navigation\views.py` | Exists | Shows public `APIView` with prefetching |
| `f:\What_i_Made\New\sidrah_web\backend\apps\accounts\models.py` | Exists | Custom `User` with CMS roles |

### Frontend

| File | Status | Notes |
| --- | --- | --- |
| `f:\What_i_Made\New\sidrah_web\src\components\sections\PartnersTrustSection.jsx` | Exists | Hardcoded partner data and UI |
| `f:\What_i_Made\New\sidrah_web\src\App.jsx` | Exists | Wires `PartnersTrustSection` into home route |
| `f:\What_i_Made\New\sidrah_web\src\assets\partiners\*` | Exists | Six logo files plus one text file |
| `f:\What_i_Made\New\sidrah_web\src\i18n\I18nProvider.jsx` | Exists | Bilingual context (`en`/`ar`) ready |
| `f:\What_i_Made\New\sidrah_web\src\config\seo.js` | Exists | No partner-specific SEO entries |

---

## 4. Reusable Components

### Backend

| Component | How It Can Be Reused |
| --- | --- |
| `apps.core.models.TimeStampedModel` | Inherit `created_at` / `updated_at` on any new partner model |
| `apps.media_library.models.MediaAsset` | FK for partner `logo`, `dark_logo`, and `white_logo`; already supports images and has `alt_text`, `usage_context`, `is_active` |
| `apps.site_settings` patterns | Singleton/global config pattern is not needed, but serializer grouping and admin fieldsets are good references |
| `apps.navigation` patterns | Bilingual fields (`*_en` / `*_ar`), ordering, visibility toggle, `MediaAsset` FK, and prefetching views |
| `apps.accounts.User` | Future role-based admin permissions for partner management |
| `config/urls.py` pattern | Wire new `apps.partners.urls` under `/api/v1/` |

### Frontend

| Component | How It Can Be Reused |
| --- | --- |
| `PartnersTrustSection.jsx` | Component structure, `IntersectionObserver` animation, responsive grid, and accessibility attributes can be kept; only the data source needs to change |
| `src/i18n` | Existing bilingual infrastructure can render Arabic partner names and descriptions |
| `src/utils/content/caseStudies.js` helper style | A similar `src/utils/content/partners.js` helper can centralize partner data logic |

---

## 5. Missing Components

To satisfy the future requirements, the following components do **not** currently exist:

### Backend

| Missing Component | Reason |
| --- | --- |
| `apps/partners/` Django app | No partner domain app exists |
| `Partner` model | No database table for partners |
| Partner category / industry / country models or choices | No taxonomy for partners |
| Case-study and service association fields | No FKs or M2Ms to related content |
| Partner admin configuration | No Django admin entry |
| Partner serializer | No public partner representation |
| Partner API views | No read endpoint for partner data |
| Partner URL routes | No `/api/v1/partners/` route |
| Seed / fixture data | No management command or fixture for initial partners |

### Frontend

| Missing Component | Reason |
| --- | --- |
| API client / data fetch for partners | Partners are hardcoded; no HTTP integration exists |
| Bilingual partner rendering | Partner names and descriptions are English-only in the component |
| Dark / white logo variants | Only one `logo` field is used |
| Featured partner flag handling | No UI distinction for featured partners |
| Category / industry filter UI | Not needed today, but required for scalability |
| Partner detail / case-study association links | Logos only link to external websites |

---

## 6. Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Partner data is fully hardcoded | Any change requires a frontend rebuild and code edit | Move data to CMS with a public API |
| Logo assets live in `src/assets` | CMS-uploaded logos will require frontend URL handling or asset migration | Reuse `MediaAsset`; migrate existing logos into the media library during implementation |
| No Arabic partner content | Bilingual site cannot localize partner names/descriptions | Add `name_ar` / `description_ar` fields from the start |
| Case studies and services are also hardcoded | Partner associations to case studies/services cannot be dynamic yet | Build partner associations now; wire them once case-study/service CMS apps exist |
| No existing partner model means new migrations and app | Low risk, but requires a new Django app and migrations | Follow existing app patterns; keep migrations additive |
| SEO metadata for partners is absent | Partner pages/section cannot be optimized per partner | Add `meta_title`, `meta_description`, and structured data fields |
| Build output currently bundles partner logos | Switching to CMS URLs changes how assets are loaded | Use absolute media URLs in production; keep fallback/default handling |

---

## 7. Recommended Architecture

### 7.1 New Django App: `apps.partners`

Create a new app with the following structure, consistent with existing CMS apps:

```
backend/apps/partners/
├── __init__.py
├── apps.py
├── admin.py
├── models.py
├── serializers.py
├── views.py
├── urls.py
└── migrations/
```

Register it in `LOCAL_APPS` in `f:\What_i_Made\New\sidrah_web\backend\config\settings.py` and include its URLs in `f:\What_i_Made\New\sidrah_web\backend\config\urls.py`.

### 7.2 Proposed `Partner` Model

Inherit from `TimeStampedModel` and use `MediaAsset` FKs for logos.

| Field | Type | Purpose |
| --- | --- | --- |
| `name` | `CharField(max_length=255)` | Primary partner name (English fallback) |
| `name_en` | `CharField(max_length=255, blank=True)` | English name |
| `name_ar` | `CharField(max_length=255, blank=True)` | Arabic name |
| `slug` | `SlugField(unique=True)` | URL-safe identifier |
| `logo` | `ForeignKey(MediaAsset, related_name='+')` | Default logo |
| `dark_logo` | `ForeignKey(MediaAsset, related_name='+', blank=True, null=True)` | Dark-theme logo |
| `white_logo` | `ForeignKey(MediaAsset, related_name='+', blank=True, null=True)` | Light/white logo |
| `website_url` | `URLField(blank=True)` | External partner website |
| `category` | `CharField(choices, blank=True)` | High-level group (e.g. enterprise, education) |
| `industry` | `CharField(choices, blank=True)` | Industry vertical |
| `country` | `CharField(max_length=120, blank=True)` | Partner country |
| `display_order` | `PositiveIntegerField(default=0)` | Manual sort order |
| `is_visible` | `BooleanField(default=True)` | Public visibility toggle |
| `is_featured` | `BooleanField(default=False)` | Featured partner flag |
| `description` | `TextField(blank=True)` | Description (English fallback) |
| `description_en` | `TextField(blank=True)` | English description |
| `description_ar` | `TextField(blank=True)` | Arabic description |
| `case_studies` | `ManyToManyField` (to future case-study model, optional) | Associated case studies |
| `services` | `ManyToManyField` (to future service model, optional) | Associated services |
| `meta_title` | `CharField(max_length=120, blank=True)` | SEO title |
| `meta_description` | `TextField(blank=True)` | SEO description |

**Associations:** Because case-study and service CMS apps do not yet exist, implement `case_studies` and `services` as nullable/optional M2Ms to placeholder models or defer them until those apps are built. Alternatively, use a `JSONField` for temporary slugs with a documented migration path.

### 7.3 Admin Configuration

- Register `Partner` with `list_display` including `name`, `category`, `industry`, `country`, `is_visible`, `is_featured`, `display_order`, `updated_at`.
- Use fieldsets for: Names, Logos, Links & Classification, Descriptions, Associations, SEO, Status.
- Add `list_filter` for `category`, `industry`, `is_visible`, `is_featured`, `country`.
- Add `search_fields` for `name`, `name_en`, `name_ar`, `description`, `website_url`.
- Enforce ordering by `display_order`, then `name`.

### 7.4 API Endpoints

Wire under `/api/v1/partners/`:

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/api/v1/partners/` | GET | List visible partners, ordered by `display_order` |
| `/api/v1/partners/<slug>/` | GET | Retrieve a single visible partner |
| `/api/v1/partners/featured/` | GET (optional) | Return featured partners only |

**Recommended response shape (list item):**

```json
{
  "slug": "eurofins",
  "name": {
    "en": "Eurofins",
    "ar": "يوروفينس"
  },
  "logo_url": "https://.../media/uploads/.../eurofins.png",
  "dark_logo_url": null,
  "white_logo_url": null,
  "website_url": "https://www.eurofins.com/",
  "category": "enterprise",
  "industry": "Healthcare",
  "country": "Global",
  "display_order": 1,
  "is_visible": true,
  "is_featured": false,
  "description": {
    "en": "...",
    "ar": "..."
  },
  "case_studies": [],
  "services": []
}
```

### 7.5 Frontend Changes

1. Create `src/utils/content/partners.js` (or equivalent) to fetch and normalize partner data from `/api/v1/partners/`.
2. Update `PartnersTrustSection.jsx` to consume the API/helper instead of the hardcoded array.
3. Preserve existing animation, grid, and accessibility behavior.
4. Add bilingual rendering using the `useI18n` hook.
5. Support `dark_logo` / `white_logo` fallbacks: prefer theme-aware logo, fall back to `logo`.
6. Add loading and empty states to avoid layout shifts.

### 7.6 Migration Strategy

1. Create the `partners` app and initial model migration.
2. Run `python manage.py makemigrations partners` and `python manage.py migrate`.
3. Upload the six existing partner logos into `MediaAsset` records.
4. Create a one-time data migration or management command to seed the six current partners from the hardcoded array.
5. Update ` PartnersTrustSection.jsx` to pull from the API.
6. Remove hardcoded partner imports once the CMS workflow is validated.

---

## 8. CMS Readiness Score

| Area | Score | Notes |
| --- | --- | --- |
| **Backend model foundation** | 6/10 | `TimeStampedModel`, `MediaAsset`, and bilingual patterns exist, but no partner app/model yet |
| **Admin readiness** | 2/10 | No partner admin exists; Django admin itself is configured for other apps |
| **API readiness** | 2/10 | DRF and public API patterns exist, but no partner endpoints |
| **Frontend component readiness** | 7/10 | `PartnersTrustSection.jsx` is well-structured and only needs a data-source swap |
| **Media relations** | 7/10 | `MediaAsset` can store logos; migration path from static files is straightforward |
| **SEO readiness** | 3/10 | No per-partner SEO fields; section-level SEO is hardcoded in `src/config/seo.js` |
| **Bilingual readiness** | 5/10 | Frontend i18n exists; backend has no partner localization fields |
| **Scalability** | 3/10 | Hardcoded data prevents scaling beyond manual code edits |

**Overall CMS Readiness Score: 5/10**

The frontend UI is ready to consume CMS data, and the backend has strong reusable patterns, but there is no actual partner domain layer (model, admin, API) yet.

---

## 9. Approval Status

**NOT APPROVED for production CMS use.**

The current implementation is a hardcoded frontend section with no backend support. It is acceptable as a static marketing section today, but it does **not** satisfy the future Partners CMS requirements.

**Conditions for approval:**

1. Create `apps.partners` with the proposed model.
2. Implement Django admin for partner management.
3. Implement public read-only API endpoints.
4. Wire the frontend to consume the API.
5. Migrate existing static partner logos into the media library.
6. Seed the six existing partners into the database.
7. Add per-partner SEO fields and structured data.
8. Add backend validation for bilingual fields and logo fallbacks.

---

## 10. Next Recommended Steps

If the review approves the proposed architecture, the implementation order should be:

1. Create `apps.partners` and the `Partner` model.
2. Generate and apply migrations.
3. Build `PartnerAdmin` with fieldsets, filters, and search.
4. Build `PartnerSerializer` and public `APIView` endpoints.
5. Wire `apps.partners.urls` into `config/urls.py`.
6. Create a data migration or `seed_partners` management command for the existing six partners.
7. Update `PartnersTrustSection.jsx` to fetch from the API and render bilingual content.
8. Add theme-aware logo fallback logic.
9. Add minimal backend tests for model validation, API visibility filtering, and ordering.
10. Validate end-to-end with the Vite dev server and Django runserver.

---

## 11. Evidence Summary

**Backend files reviewed (no partner app found):**
- `f:\What_i_Made\New\sidrah_web\backend\config\settings.py`
- `f:\What_i_Made\New\sidrah_web\backend\config\urls.py`
- `f:\What_i_Made\New\sidrah_web\backend\apps\core\models.py`
- `f:\What_i_Made\New\sidrah_web\backend\apps\media_library\models.py`
- `f:\What_i_Made\New\sidrah_web\backend\apps\media_library\admin.py`
- `f:\What_i_Made\New\sidrah_web\backend\apps\site_settings\models.py`
- `f:\What_i_Made\New\sidrah_web\backend\apps\site_settings\serializers.py`
- `f:\What_i_Made\New\sidrah_web\backend\apps\site_settings\views.py`
- `f:\What_i_Made\New\sidrah_web\backend\apps\site_settings\urls.py`
- `f:\What_i_Made\New\sidrah_web\backend\apps\site_settings\admin.py`
- `f:\What_i_Made\New\sidrah_web\backend\apps\navigation\models.py`
- `f:\What_i_Made\New\sidrah_web\backend\apps\navigation\serializers.py`
- `f:\What_i_Made\New\sidrah_web\backend\apps\navigation\views.py`
- `f:\What_i_Made\New\sidrah_web\backend\apps\accounts\models.py`

**Frontend files reviewed:**
- `f:\What_i_Made\New\sidrah_web\src\components\sections\PartnersTrustSection.jsx`
- `f:\What_i_Made\New\sidrah_web\src\App.jsx`
- `f:\What_i_Made\New\sidrah_web\src\components\sections\ServicesSection.jsx`
- `f:\What_i_Made\New\sidrah_web\src\components\sections\IndustriesSection.jsx`
- `f:\What_i_Made\New\sidrah_web\src\data\caseStudies\caseStudiesData.js`
- `f:\What_i_Made\New\sidrah_web\src\utils\content\caseStudies.js`
- `f:\What_i_Made\New\sidrah_web\src\i18n\I18nProvider.jsx`
- `f:\What_i_Made\New\sidrah_web\src\config\seo.js`
- `f:\What_i_Made\New\sidrah_web\src\assets\partiners\` (six logo files + one text file)

**Previous related reports reviewed:**
- `f:\What_i_Made\New\sidrah_web\project-memory\evidence\PARTNERS-TRUST-IMPLEMENTATION-001-REPORT.md`
- `f:\What_i_Made\New\sidrah_web\project-memory\evidence\PARTNERS-VISIBILITY-FIX-001-REPORT.md`
- `f:\What_i_Made\New\sidrah_web\project-memory\evidence\NAVIGATION-CMS-INVESTIGATION-001-REPORT.md`
- `f:\What_i_Made\New\sidrah_web\project-memory\evidence\SITE-SETTINGS-CMS-001-REPORT.md`

---

**Final Status: INVESTIGATION COMPLETE — AWAITING REVIEW**

No source files were changed during this investigation. The next step is user review of this report before proceeding with **PARTNERS-CMS-IMPLEMENTATION-001**.
