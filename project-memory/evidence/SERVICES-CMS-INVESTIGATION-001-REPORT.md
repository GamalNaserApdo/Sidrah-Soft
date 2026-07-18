# SERVICES-CMS-INVESTIGATION-001 REPORT

## Executive Summary

Services are currently represented only in the frontend as hardcoded arrays. There is no Django app, model, admin, or API for services. The website displays two overlapping service-like lists: a 5-card "Services" section and a 10-card "Capabilities" marquee. Translations exist only for footer service-link labels; the actual service content is English-only and embedded in JSX. The backend already provides reusable foundations (`TimeStampedModel`, `MediaAsset`, navigation patterns, and the recently added `partners` app as a blueprint), so a Services CMS can be added without architectural disruption.

**CMS readiness score: 6/10.**

The frontend structure is clean and API-ready, but there is no backend representation yet, no Arabic service copy, and two separate hardcoded lists that should be reconciled before implementation.

---

## 1. Current Frontend State

### 1.1 Main Services Section

**File:** `f:\What_i_Made\New\sidrah_web\src\components\sections\ServicesSection.jsx`

- Defines a local `services` array of **5 hardcoded services**.
- Each item has: `title` (English), `description` (English), `Icon` (inline SVG component).
- No Arabic content, no slugs, no external links, no CTA inside cards.
- Rendered as a 5-column grid with staggered scroll-triggered fade-in.
- Section `id="services"`, anchor target `#services`.

Current service items:

| # | Title | Description | Icon |
| --- | --- | --- | --- |
| 1 | Web Applications | Custom web platforms built for scale, performance, and long-term growth. | Inline SVG (browser window) |
| 2 | Mobile Applications | Native and cross-platform apps for iOS and Android. | Inline SVG (mobile device) |
| 3 | ERP Solutions | Integrated systems that connect operations, finance, and data. | Inline SVG (grid/network) |
| 4 | AI Solutions | Intelligent systems that automate decisions and surface insights. | Inline SVG (neural-node pattern) |
| 5 | Automation Solutions | Workflow automation that reduces cost and increases speed. | Inline SVG (arrow flow) |

### 1.2 Capabilities Marquee Section

**File:** `f:\What_i_Made\New\sidrah_web\src\components\sections\CapabilitiesMarqueeSection.jsx`

- Defines a local `capabilities` array of **10 hardcoded capabilities**.
- Each item has `title` and `description` only (no icons).
- Rendered as a horizontally scrolling marquee duplicated for infinite scroll.
- Not translated.

Current capabilities:

1. Business Automation
2. ERP Systems
3. AI Solutions
4. Web Development
5. Mobile Applications
6. System Integration
7. Data & Analytics
8. Digital Transformation
9. Training Programs
10. Custom Software Development

**Observation:** The capabilities list overlaps with the services list and with the footer service links. This is a candidate for consolidation in the CMS or for keeping as a separate "Capabilities" model.

### 1.3 Footer Service Links

**File:** `f:\What_i_Made\New\sidrah_web\src\components\Footer.jsx`

```javascript
const serviceLinks = [
  { key: 'businessAutomation', target: 'services' },
  { key: 'erpSystems', target: 'services' },
  { key: 'aiSolutions', target: 'services' },
  { key: 'webDevelopment', target: 'services' },
  { key: 'mobileApplications', target: 'services' },
  { key: 'systemIntegration', target: 'services' },
];
```

- These links all scroll to the `#services` anchor.
- Labels are translated in `en.js` and `ar.js` under `footer.links.*`.
- They do not point to dedicated service pages.

### 1.4 Header Navigation

**File:** `f:\What_i_Made\New\sidrah_web\src\components\Header.jsx`

```javascript
const navLinks = [
  { key: 'services', target: 'services' },
  { key: 'solutions', target: 'services' },
  ...
];
```

- Both "Services" and "Solutions" point to the same `#services` anchor.
- Translations exist in `header.nav.services` and `header.nav.solutions`.

### 1.5 Foundation CTA

**File:** `f:\What_i_Made\New\sidrah_web\src\components\sections\FoundationSection.jsx`

- Main CTA links to `#services` with text "Explore Services".

### 1.6 Dedicated Services Page

- **No dedicated `/services` route or page exists.**
- `App.jsx` routes:
  - `/`
  - `/training`
  - `/case-studies`

### 1.7 Contact Form

**File:** `f:\What_i_Made\New\sidrah_web\src\components\sections\ContactSection.jsx`

- Inquiry types: `general`, `projectConsultation`, `partnership`, `career`, `other`.
- No service-specific selection.
- Submission is currently `console.log` only; backend endpoint not wired.
- `contactSettings.js` notes future CMS override key: `contact_settings.email_recipient`.

### 1.8 Case Studies

**File:** `f:\What_i_Made\New\sidrah_web\src\data\caseStudies\caseStudiesData.js`

- 5 case studies with fields: `title`, `clientName`, `industry`, `excerpt`, `problem`, `solution`, `technologies`, `outcome`, `metrics`, `coverImage`, `featured`, `publishDate`, `language`, `seo`.
- Industries: `All`, `Enterprise Operations`, `Education Technology`, `AI & Automation`, `Healthcare`, `Logistics`.
- Technologies are free-text arrays (e.g., `['ERP', 'Integrations', 'Automation']`).
- **No explicit service relationship.** Case studies only map to industries and technologies.

### 1.9 Insights

**File:** `f:\What_i_Made\New\sidrah_web\src\data\insights\insightsData.js`

- Categories include `AI`, `Software Development`, `Mobile Apps`, `Automation`, `Education Technology`.
- No explicit service relationship.

### 1.10 Styling

**File:** `f:\What_i_Made\New\sidrah_web\src\styles\global.css` (lines 159–283)

- `.services-section`, `.services-grid`, `.service-card`, `.service-card__icon`, `.service-card__title`, `.service-card__description`.
- Grid: 5 columns desktop, 3 columns tablet, 1 column mobile.
- Cards have scroll-triggered fade-up animation, hover border/background transition, and icon color `#8d51a0`.
- All styles are class-based and independent of data source; API-driven replacement will not require CSS changes.

---

## 2. Current Backend State

### 2.1 Existing Apps

```
f:\What_i_Made\New\sidrah_web\backend\apps\
  accounts/
  core/
  media_library/
  navigation/
  partners/
  site_settings/
```

### 2.2 No Services Backend

- No `services` app.
- No `Service`, `ServiceCategory`, `ServiceFeature`, `Technology`, `InquiryType`, or `ContactRequest` models.
- No service-related admin, serializer, view, URL, or migration.

### 2.3 Reusable Foundations

| Foundation | File | Notes |
| --- | --- | --- |
| `TimeStampedModel` | `backend/apps/core/models.py` | Provides `created_at` / `updated_at`; used by all CMS apps. |
| `MediaAsset` | `backend/apps/media_library/models.py` | File upload with `title`, `alt_text`, `media_type`, `usage_context`, `is_active`. Used for logos and branding. |
| Bilingual field pattern | `apps.navigation.models.NavigationItem` | `label_en` / `label_ar` pattern. |
| Slug pattern | `apps.navigation.models.NavigationMenu`, `apps.partners.models.Partner` | `SlugField(unique=True)`, prepopulated from English name. |
| Visibility / ordering pattern | `NavigationItem`, `Partner` | `is_active` / `is_visible`, `display_order` / `order`. |
| API convention | `apps.partners.views` | Public read-only `ListAPIView` + `RetrieveAPIView`, filter by query params, exclude inactive. |
| Admin convention | `apps.partners.admin.PartnerAdmin` | Fieldsets, `list_display`, `list_filter`, search, prepopulated slug, bulk actions. |
| URL convention | `backend/config/urls.py` | `path('api/v1/partners/', include('apps.partners.urls'))`. |
| App registration | `backend/config/settings.py` LOCAL_APPS | Add `apps.<app_name>`. |

### 2.4 Database

- PostgreSQL on port `5433`, database `sidrahsoft_db`, user `sidrahsoft_user`.
- Current tables (from existing apps): accounts, admin, auth, contenttypes, media_library, navigation, partners, sessions, site_settings.
- No services tables.

---

## 3. Current Service Inventory

### 3.1 ServicesSection Items

| English Name | Arabic Name | Description | Icon | Link/Anchor | Order | Active | Related Case Studies | Related Technologies |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Web Applications | **missing** | Custom web platforms built for scale, performance, and long-term growth. | inline SVG | #services | 1 | yes (hardcoded) | none explicit | none explicit |
| Mobile Applications | **missing** | Native and cross-platform apps for iOS and Android. | inline SVG | #services | 2 | yes | none explicit | none explicit |
| ERP Solutions | **missing** | Integrated systems that connect operations, finance, and data. | inline SVG | #services | 3 | yes | Enterprise ERP Transformation | ERP, Integrations, Automation |
| AI Solutions | **missing** | Intelligent systems that automate decisions and surface insights. | inline SVG | #services | 4 | yes | AI-Assisted Workflow Automation | AI, Automation, Analytics |
| Automation Solutions | **missing** | Workflow automation that reduces cost and increases speed. | inline SVG | #services | 5 | yes | AI-Assisted Workflow Automation | AI, Automation, Analytics |

### 3.2 CapabilitiesMarquee Items

All English-only, no icons, no links, order fixed in source.

| # | Title | Description |
| --- | --- | --- |
| 1 | Business Automation | Automate repetitive workflows and business processes. |
| 2 | ERP Systems | Centralized management for operations, finance, HR, and inventory. |
| 3 | AI Solutions | Intelligent assistants, automation, and decision support. |
| 4 | Web Development | Modern scalable web platforms. |
| 5 | Mobile Applications | Cross-platform mobile experiences. |
| 6 | System Integration | Connect multiple systems into one ecosystem. |
| 7 | Data & Analytics | Business intelligence and reporting. |
| 8 | Digital Transformation | Modernization of business operations. |
| 9 | Training Programs | Professional technical education and workforce development. |
| 10 | Custom Software Development | Tailored software solutions for unique business requirements. |

### 3.3 Footer Service Link Labels (Translated)

| Key | English | Arabic |
| --- | --- | --- |
| businessAutomation | Business Automation | أتمتة الأعمال |
| erpSystems | ERP Systems | أنظمة ERP |
| aiSolutions | AI Solutions | حلول الذكاء الاصطناعي |
| webDevelopment | Web Development | تطوير الويب |
| mobileApplications | Mobile Applications | تطبيقات الجوال |
| systemIntegration | System Integration | تكامل الأنظمة |

These labels are only used in the footer; they are not linked to actual service objects.

---

## 4. Reusable Foundations for Services CMS

| Foundation | How to Reuse |
| --- | --- |
| `TimeStampedModel` | Inherit for `Service` (and future `ServiceFeature`). |
| `MediaAsset` | Use for `icon` and `featured_image` fields. |
| Bilingual fields | Follow `name_en` / `name_ar`, `description_en` / `description_ar` pattern from `Partner`. |
| Slug pattern | `SlugField(unique=True)`, prepopulated from `name_en`. |
| Ordering | `display_order` PositiveIntegerField, default 0. |
| Visibility | `is_active` BooleanField; exclude inactive from public APIs. |
| Featured / homepage | `is_featured`, `show_on_homepage` BooleanFields. |
| API pattern | `ListAPIView` + `RetrieveAPIView`, filter by query params, exclude inactive. |
| Admin pattern | Fieldsets, list columns, filters, search, prepopulated slug, bulk actions. |

---

## 5. Recommended Data Model

### 5.1 Service (minimum viable)

```python
class Service(TimeStampedModel):
    name_en = models.CharField(max_length=255)
    name_ar = models.CharField(max_length=255, blank=True)
    slug = models.SlugField(max_length=255, unique=True)

    short_description_en = models.CharField(max_length=255, blank=True)
    short_description_ar = models.CharField(max_length=255, blank=True)
    description_en = models.TextField(blank=True)
    description_ar = models.TextField(blank=True)

    icon = models.ForeignKey(
        MediaAsset,
        on_delete=models.SET_NULL,
        blank=True, null=True,
        related_name='+',
        help_text='SVG or icon image for the service card.',
    )
    featured_image = models.ForeignKey(
        MediaAsset,
        on_delete=models.SET_NULL,
        blank=True, null=True,
        related_name='+',
        help_text='Optional larger image for a detail page.',
    )

    display_order = models.PositiveIntegerField(default=0)
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    show_on_homepage = models.BooleanField(default=True)

    # SEO
    meta_title_en = models.CharField(max_length=120, blank=True)
    meta_title_ar = models.CharField(max_length=120, blank=True)
    meta_description_en = models.TextField(blank=True)
    meta_description_ar = models.TextField(blank=True)

    # CTA
    cta_label_en = models.CharField(max_length=120, blank=True)
    cta_label_ar = models.CharField(max_length=120, blank=True)
    cta_url = models.URLField(blank=True)
    open_in_new_tab = models.BooleanField(default=False)

    class Meta:
        db_table = 'services_service'
        ordering = ['display_order', 'name_en']
        indexes = [
            models.Index(fields=['is_active', 'show_on_homepage', 'display_order']),
            models.Index(fields=['is_featured', 'is_active', 'display_order']),
        ]

    def __str__(self):
        return self.name_en
```

### 5.2 Service Features (deferred)

Do **not** implement in the first phase. The current frontend does not show feature lists for services. If a future service detail page needs bullet points, add a child `ServiceFeature` model later with `service` FK, `title_en/title_ar`, `description_en/description_ar`, and `display_order`.

For now, the marquee/service cards only need title + description + icon.

### 5.3 Service Categories (deferred)

Do **not** implement categories initially. The current website has no category filter or category pages. Categories would add complexity without a frontend use case. Re-evaluate if a future `/services` page or filtering UI is added.

### 5.4 Technology Relationships (deferred)

Do **not** create a `Technology` model yet. Case studies currently store technologies as free-text arrays. Relating services to case studies or technologies is justified only after the case-study CMS is built. Keep the first services implementation self-contained.

### 5.5 Contact Inquiry Mapping (deferred)

The contact form currently uses generic inquiry types. A future enhancement could add a "Service of interest" dropdown populated from the Service API, but this couples the contact form to services and is not required for launch.

---

## 6. Recommended API Contract

### 6.1 Endpoints

- `GET /api/v1/services/` — list active services.
- `GET /api/v1/services/<slug>/` — retrieve a single active service by slug.

### 6.2 Query Parameters

| Param | Values | Effect |
| --- | --- | --- |
| `is_featured` | `true` / `false` | Filter featured services. |
| `show_on_homepage` | `true` / `false` | Filter homepage-visible services. |
| `ordering` | `display_order`, `-display_order`, `name_en`, etc. | Override default ordering. |

### 6.3 Response Payload (List / Detail)

```json
{
  "id": 1,
  "slug": "web-applications",
  "name": {
    "en": "Web Applications",
    "ar": "تطبيقات الويب"
  },
  "short_description": {
    "en": "Custom web platforms built for scale.",
    "ar": ""
  },
  "description": {
    "en": "Custom web platforms built for scale, performance, and long-term growth.",
    "ar": ""
  },
  "icon": {
    "id": 12,
    "url": "http://127.0.0.1:8000/media/uploads/.../icon.svg",
    "alt_text": {
      "en": "Web Applications icon",
      "ar": ""
    }
  },
  "featured_image": null,
  "display_order": 1,
  "is_featured": false,
  "show_on_homepage": true,
  "cta": {
    "label": {
      "en": "Learn more",
      "ar": "اعرف المزيد"
    },
    "url": "",
    "open_in_new_tab": false
  },
  "seo": {
    "meta_title": {
      "en": "",
      "ar": ""
    },
    "meta_description": {
      "en": "",
      "ar": ""
    }
  }
}
```

Inactive services are excluded from public APIs.

---

## 7. Django Admin Plan

Register `Service` in Django Admin as the immediate content-management fallback.

Recommended `ServiceAdmin`:

- **Fieldsets**
  - Names: `name_en`, `name_ar`, `slug`
  - Content: `short_description_en`, `short_description_ar`, `description_en`, `description_ar`
  - Media: `icon`, `featured_image`
  - Display & Visibility: `display_order`, `is_featured`, `show_on_homepage`, `is_active`
  - CTA: `cta_label_en`, `cta_label_ar`, `cta_url`, `open_in_new_tab`
  - SEO: `meta_title_en`, `meta_title_ar`, `meta_description_en`, `meta_description_ar`
  - Status (read-only): `created_at`, `updated_at`
- **list_display**: `name_en`, `name_ar`, `display_order`, `is_featured`, `show_on_homepage`, `is_active`, `updated_at`
- **list_filter**: `is_active`, `is_featured`, `show_on_homepage`
- **search_fields**: `name_en`, `name_ar`, `slug`, `description_en`, `description_ar`
- **ordering**: `display_order`, `name_en`
- **prepopulated_fields**: `slug` from `name_en`
- **readonly_fields**: `created_at`, `updated_at`
- **Bulk actions**: activate, deactivate, mark featured, remove featured, show on homepage, hide from homepage.

---

## 8. Custom CMS Dashboard Readiness

The same `Service` model will power the future custom CMS dashboard. Design considerations:

- Expose `Service` through a writeable DRF endpoint (admin-only) using the same serializer shape.
- Media picker should reuse `MediaAsset`.
- Bilingual form fields should be grouped (English / Arabic) to match the frontend i18n pattern.
- Slug should be auto-generated but editable.
- Drag-and-drop ordering can be implemented by updating `display_order`.
- Preview mode can fetch the public detail endpoint by slug.

Django Admin remains the fallback until the dashboard is built.

---

## 9. Frontend Migration Plan

### 9.1 ServicesSection.jsx Changes (future task)

1. Replace the hardcoded `services` array with a `useEffect` fetch from `GET /api/v1/services/?show_on_homepage=true`.
2. Render cards using API data:
   - `service.name[lang]` → `service-card__title`
   - `service.description[lang]` or `service.short_description[lang]` → `service-card__description`
   - `service.icon.url` → render as `<img>` inside `.service-card__icon`, or keep inline SVG mapping for icons if SVG components are preferred.
3. Preserve existing `isVisible` animation, `transitionDelay`, hover effects, and grid layout.
4. Add loading skeleton and error fallback that match current card styling.

### 9.2 CapabilitiesMarqueeSection.jsx Decision

Options:

- **Option A (recommended):** Keep capabilities as a separate, simpler CMS model (`Capability`) or a static curated list. The marquee is visually distinct and uses different styling.
- **Option B:** Merge capabilities into services and render a subset of services in the marquee. This risks overloading the service concept.

Recommendation: defer capabilities CMS until after services CMS is live. The current hardcoded list can remain static or be replaced by a lightweight `Capability` app later.

### 9.3 Footer Service Links

Currently the footer service links are translated labels that all anchor to `#services`. After the services CMS is live:

- Option 1: keep them as static anchor links and update labels to match CMS service names manually.
- Option 2 (future): fetch a `services` mini-list and render footer links dynamically, still pointing to `#services` or a future `/services` page.

### 9.4 Header Navigation

No change required initially. `services` and `solutions` can continue to point to `#services`.

### 9.5 Design Preservation

The CSS is fully class-based; replacing data source will not affect:

- visual layout
- scroll-triggered fade-up animations
- hover border/background transitions
- responsive grid behavior
- icon color and sizing

### 9.6 Required Refactoring Before Integration

- Add a data-fetching hook (or use existing project fetch pattern) for `/api/v1/services/`.
- Add Arabic copy for each service in the CMS; the frontend i18n already supports language switching.
- Decide whether to store icons as `MediaAsset` SVG files or keep a hardcoded icon-name-to-component map. Recommendation: store an `icon_name` string field on `Service` and map it to React SVG components, keeping `MediaAsset` for raster/featured images.

---

## 10. Risks and Limitations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Two overlapping lists (services vs capabilities) | Confusion about canonical service inventory | Decide before implementation whether to model both or consolidate. |
| No Arabic service content | Arabic site visitors see English service cards | Add `name_ar` / `description_ar` for every service at CMS seed time. |
| Icons are inline React components | Cannot be driven by `MediaAsset` URLs without component mapping | Add `icon_name` field and a frontend icon registry, or use SVG files via `MediaAsset`. |
| No dedicated service pages | Footer links cannot deep-link to individual services | Either create service detail pages later, or keep anchor-only links for now. |
| Contact form not connected to backend | Inquiries are lost | Implement a `ContactRequest` model/API separately; do not block services CMS on this. |
| Case studies not related to services | Cannot show "related case studies" on service cards | Defer relationship until case-study CMS exists. |
| Over-engineering risk (categories, features, technologies) | Delay and complexity | Start with the minimal `Service` model; add child/related models only when frontend needs them. |
| Future Academy/LMS coupling | Services and courses may overlap conceptually | Keep services focused on "what we build"; keep courses/training as a separate future LMS model. |

---

## 11. Recommended Implementation Order

1. Create `backend/apps/services/` app structure.
2. Implement `Service` model with bilingual fields, icon/featured image FKs to `MediaAsset`, ordering, visibility, featured, homepage, SEO, and CTA fields.
3. Create migration and apply against PostgreSQL.
4. Register `Service` in Django Admin with fieldsets, filters, search, and bulk actions.
5. Create public read-only API: `ServiceListView`, `ServiceDetailView`, `ServiceSerializer`.
6. Wire URLs in `backend/config/urls.py`.
7. Write model, API, and admin tests.
8. Create an idempotent seed command mapping the 5 current `ServicesSection` items into the CMS.
9. Validate API responses.
10. In a separate future task, wire the frontend `ServicesSection` to the API (preserving design).

---

## 12. Final Investigation Verdict

**Investigation complete. Implementation recommended.**

The frontend is already structured to accept CMS-driven service data with minimal changes. The backend has strong reusable foundations and a clear pattern established by the `partners` app. The main blockers before implementation are content decisions (reconciling services vs capabilities, adding Arabic copy) and an icon strategy, not technical architecture.

---

*Report generated: 2026-07-10*
