# Case Studies CMS Investigation Report

**Task ID:** CASE-STUDIES-CMS-INVESTIGATION-001  
**Date:** 2026-07-10  
**Objective:** Investigate how projects and case studies are currently represented across the SidrahSoft frontend, backend, and supporting systems. No implementation.  
**Verdict:** Investigation complete. A dedicated backend app does not yet exist, but the existing patterns make it straightforward to add one.

---

## 1. Executive Summary

The frontend already has a complete, hardcoded case studies experience: a homepage section, a listing page with industry filtering, a reusable card component, and utility helpers. However, there is no dedicated Django backend app, no public API, no detail page route, and no Arabic content. The existing CMS foundations (`TimeStampedModel`, `MediaAsset`, `Partner`, `Service`, bilingual serializers, public read-only API views) are mature and can be reused. The recommended next step is a minimal `case_studies` app with a `CaseStudy` model, public list/detail endpoints, and a matching frontend integration.

---

## 2. Current Frontend State

### Exact file paths
- `f:/What_i_Made/New/sidrah_web/src/components/sections/CaseStudiesSection.jsx`
- `f:/What_i_Made/New/sidrah_web/src/components/caseStudies/CaseStudyCard.jsx`
- `f:/What_i_Made/New/sidrah_web/src/pages/CaseStudiesPage.jsx`
- `f:/What_i_Made/New/sidrah_web/src/data/caseStudies/caseStudiesData.js`
- `f:/What_i_Made/New/sidrah_web/src/utils/content/caseStudies.js`
- `f:/What_i_Made/New/sidrah_web/src/App.jsx` (route `/case-studies`)
- `f:/What_i_Made/New/sidrah_web/src/config/seo.js` (page SEO for `/case-studies`)
- `f:/What_i_Made/New/sidrah_web/src/styles/global.css` (case-study card and page styles)
- `f:/What_i_Made/New/sidrah_web/src/i18n/en.js` and `ar.js` (only footer link translations exist)

### Components
- **`CaseStudiesSection`** – renders the first 3 featured case studies on the homepage using `IntersectionObserver` visibility animation. Uses `variant="compact"` cards.
- **`CaseStudyCard`** – dual-mode card:
  - `compact` (homepage): shows `industry`, `problem`, `solution`, `technologies`, `outcome`.
  - `preview` (listing page): shows `title`, `clientName`, `excerpt`, `metrics`.
- **`CaseStudiesPage`** – full listing page with an industry filter bar (`All`, `Enterprise Operations`, `Education Technology`, `AI & Automation`, `Healthcare`, `Logistics`) and sort by `newest`, `oldest`, `featured`.
- **No detail page** exists; `getCaseStudyPath(slug)` returns `/case-studies/${slug}` but there is no route or component for it.

### Hardcoded data source
All data lives in `src/data/caseStudies/caseStudiesData.js` and is exported through `src/utils/content/caseStudies.js`. There is no API consumption yet.

### Animation and interactions
- Cards fade in via `IntersectionObserver` with a staggered transition delay.
- The listing page uses a simple filter bar with `aria-pressed` and `role="group"`.
- The compact card uses a `mouse-depth-card` class for hover depth.

### i18n and SEO gaps
- Page title and intro are English-only.
- Industry filter values are English-only.
- Footer links have case-study translations (`Case Studies` / `دراسات الحالة`), but the case studies page itself is not bilingual.

### Image situation
- All case studies use `coverImage: '/assets/case-studies/placeholder.png'`.
- No actual assets exist in `public/assets/case-studies/`.

---

## 3. Current Project Inventory

| Field | Status | Notes |
|-------|--------|-------|
| 5 visible projects | Present | See table below |
| `id` | Present | Simple string |
| `slug` | Present | URL-safe English slug |
| `title` | Present | English only |
| `clientName` | Present | English only; sometimes "Confidential" |
| `industry` | Present | English-only choice from `CASE_STUDY_INDUSTRIES` |
| `excerpt` | Present | English only |
| `problem` | Present | English only |
| `solution` | Present | English only |
| `technologies` | Present | Array of English strings |
| `outcome` | Present | English only |
| `metrics` | Present | Array of English strings (up to 2) |
| `coverImage` | Present | Placeholder only |
| `featured` | Present | Boolean |
| `publishDate` | Present | Used for sorting |
| `language` | Present | Always `'en'` |
| `seo` | Present | Title and description, English only |
| **Arabic title** | Missing | |
| **Arabic client name** | Missing | |
| **Arabic industry** | Missing | Filter values are not translated |
| **Arabic problem/solution/outcome** | Missing | |
| **Display order field** | Missing | Relies on `publishDate` |
| **Active/visible flag** | Missing | All items are always shown |
| **Project URL** | Missing | |
| **Case study detail URL** | Missing | |
| **Gallery** | Missing | |
| **Real featured image** | Missing | Placeholder used |
| **Partner/client relationship** | Missing | Client names are plain text |
| **Service relationship** | Missing | Technologies are free-form strings |

### Project list

| # | Slug | Title | Client | Industry | Featured |
|---|------|-------|--------|----------|----------|
| 1 | `enterprise-erp-transformation` | Enterprise ERP Transformation | Confidential Enterprise Client | Enterprise Operations | Yes |
| 2 | `education-learning-platform` | Education Learning Platform | Vision & AlQalam Education Network | Education Technology | Yes |
| 3 | `ai-assisted-workflows` | AI-Assisted Workflow Automation | Confidential Operations Client | AI & Automation | Yes |
| 4 | `healthcare-appointment-system` | Healthcare Appointment & Records System | Regional Healthcare Provider | Healthcare | No |
| 5 | `logistics-tracking-platform` | Logistics Tracking Platform | Regional Logistics Operator | Logistics | No |

---

## 4. Current Backend State

### Existing apps
- `apps.core` – `TimeStampedModel`
- `apps.media_library` – `MediaAsset` with file upload, alt text, media type
- `apps.accounts` – custom `User` model with roles (`content_manager`, `marketing_seo`, etc.)
- `apps.site_settings` – global configuration
- `apps.navigation` – menus and items
- `apps.partners` – `Partner` model with bilingual name, description, logo, partner type, display order, featured/active flags
- `apps.services` – `Service` model with bilingual name, descriptions, icon, featured image, CTA, SEO fields, display order, featured/active/homepage flags

### No case studies app
- There is no `apps.case_studies`.
- `INSTALLED_APPS` in `config/settings.py` does not include one.
- The database contains no tables with `case`, `project`, or `portfolio` in the name.

### Reusable foundations
| Foundation | File | Reusable for case studies? |
|------------|------|---------------------------|
| `TimeStampedModel` | `apps/core/models.py` | Yes – abstract base |
| `MediaAsset` | `apps/media_library/models.py` | Yes – featured image, logo, gallery |
| `Partner` | `apps/partners/models.py` | Yes – optional client attribution |
| `Service` | `apps/services/models.py` | Yes – many-to-many relationship |
| Bilingual serializer pattern | `apps/partners/serializers.py`, `apps/services/serializers.py` | Yes – `name`, `description`, `seo` objects |
| Public API view pattern | `apps/partners/views.py`, `apps/services/views.py` | Yes – `APIView` + `get_object_or_404` |
| URL pattern | `config/urls.py` | Yes – `path('api/v1/case-studies/', include(...))` |
| Admin pattern | `apps/services/admin.py` | Yes – fieldsets, bilingual fields, actions |

---

## 5. Relationship Analysis

### Partner relationship
**Recommendation:** Add an optional `ForeignKey` to `Partner` plus fallback `client_name_en` and `client_name_ar` fields.

Rationale:
- Some visible clients (e.g., AlQalam Education Network) are already partners and have logos.
- Reusing a `Partner` logo and website URL avoids duplicate media.
- Confidential clients can leave the FK empty and use the plain text `client_name` instead.

### Service relationship
**Recommendation:** Add a `ManyToManyField` to `Service`.

Rationale:
- Enables future homepage/service-detail filtering by related case studies.
- Aligns with the existing service-driven site architecture.
- Keeps technology strings free-form for MVP while still tying a case study to official services.

### Industry
**Recommendation:** Use a `CharField` with choices matching the current frontend `CASE_STUDY_INDUSTRIES`.

Rationale:
- The industry list is small and stable.
- A separate model is overengineering for the first version.
- Bilingual labels can be handled in the frontend or by adding `industry_ar` later.

### Technology
**Recommendation:** Store as a `JSONField` list of strings for MVP.

Rationale:
- The frontend currently displays technologies as plain strings (`ERP + Integrations + Automation`).
- A separate `Technology` model adds UI complexity without clear reuse elsewhere.
- Can be promoted to a model later if technologies become a primary filter.

### Media
**Recommendation:** Use `ForeignKey` to `MediaAsset` for `featured_image` and `client_logo` (or reuse the related `Partner.logo`).

Rationale:
- `MediaAsset` already handles uploads, hashing, and absolute URLs.
- The existing serializers can be reused for absolute URL generation.

---

## 6. Recommended Data Model (MVP)

Proposed app: `apps.case_studies`

### `CaseStudy` model

```python
class CaseStudy(TimeStampedModel):
    # Identity
    title_en = models.CharField(_('Title (English)'), max_length=255)
    title_ar = models.CharField(_('Title (Arabic)'), max_length=255, blank=True)
    slug = models.SlugField(_('Slug'), max_length=255, unique=True)

    # Attribution
    partner = models.ForeignKey(
        Partner, on_delete=models.SET_NULL, blank=True, null=True,
        related_name='case_studies', verbose_name=_('Partner / Client'),
    )
    client_name_en = models.CharField(_('Client name (English)'), max_length=255, blank=True)
    client_name_ar = models.CharField(_('Client name (Arabic)'), max_length=255, blank=True)

    # Summary
    short_description_en = models.TextField(_('Short description (English)'), blank=True)
    short_description_ar = models.TextField(_('Short description (Arabic)'), blank=True)

    # Core case study content
    problem_en = models.TextField(_('Problem (English)'), blank=True)
    problem_ar = models.TextField(_('Problem (Arabic)'), blank=True)
    solution_en = models.TextField(_('Solution (English)'), blank=True)
    solution_ar = models.TextField(_('Solution (Arabic)'), blank=True)
    technology_en = models.TextField(_('Technology (English)'), blank=True)
    technology_ar = models.TextField(_('Technology (Arabic)'), blank=True)
    outcome_en = models.TextField(_('Outcome (English)'), blank=True)
    outcome_ar = models.TextField(_('Outcome (Arabic)'), blank=True)

    # Media
    featured_image = models.ForeignKey(
        MediaAsset, on_delete=models.SET_NULL, blank=True, null=True,
        related_name='+', verbose_name=_('Featured image'),
    )
    client_logo = models.ForeignKey(
        MediaAsset, on_delete=models.SET_NULL, blank=True, null=True,
        related_name='+', verbose_name=_('Client logo'),
    )
    gallery = models.JSONField(_('Gallery'), default=list, blank=True,
        help_text=_('List of MediaAsset IDs or image URLs for future gallery use.'))

    # Classification
    INDUSTRY_CHOICES = [
        ('enterprise', _('Enterprise Operations')),
        ('education', _('Education Technology')),
        ('ai', _('AI & Automation')),
        ('healthcare', _('Healthcare')),
        ('logistics', _('Logistics')),
    ]
    industry = models.CharField(_('Industry'), max_length=32, choices=INDUSTRY_CHOICES, blank=True)
    services = models.ManyToManyField(Service, blank=True, related_name='case_studies',
        verbose_name=_('Related services'))
    technologies = models.JSONField(_('Technologies'), default=list, blank=True,
        help_text=_('Free-form list of technology labels, e.g. ["ERP", "Integrations", "Automation"].'))

    # Links
    project_url = models.URLField(_('Project URL'), blank=True)
    case_study_url = models.URLField(_('Case study URL'), blank=True)
    open_in_new_tab = models.BooleanField(_('Open in new tab'), default=True)

    # Display and visibility
    display_order = models.PositiveIntegerField(_('Display order'), default=0)
    is_featured = models.BooleanField(_('Featured'), default=False)
    is_active = models.BooleanField(_('Active'), default=True)
    show_on_homepage = models.BooleanField(_('Show on homepage'), default=False)
    status = models.CharField(_('Status'), max_length=16, default='published',
        choices=[('draft', _('Draft')), ('published', _('Published'))])
    project_year = models.PositiveIntegerField(_('Project year'), blank=True, null=True)

    # SEO
    seo_title_en = models.CharField(_('SEO title (English)'), max_length=255, blank=True)
    seo_title_ar = models.CharField(_('SEO title (Arabic)'), max_length=255, blank=True)
    seo_description_en = models.TextField(_('SEO description (English)'), blank=True)
    seo_description_ar = models.TextField(_('SEO description (Arabic)'), blank=True)

    class Meta:
        db_table = 'case_studies_casestudy'
        ordering = ['display_order', '-project_year', 'title_en']
        indexes = [
            models.Index(fields=['is_active', 'is_featured', 'display_order']),
            models.Index(fields=['is_active', 'show_on_homepage', 'display_order']),
            models.Index(fields=['industry', 'is_active', 'display_order']),
        ]
```

Notes:
- The `gallery` field is intentionally a simple `JSONField` placeholder so future gallery expansion does not require a migration later if we only store image IDs/URLs.
- `status` supports a future CMS dashboard draft/publish workflow.
- `project_year` is optional metadata.

---

## 7. Gallery and Metrics Decision

**Decision:** Defer separate `CaseStudyImage` and `CaseStudyMetric` models for the first version.

Justification:
- The current `CaseStudyCard` compact view only needs `problem`, `solution`, `technology`, and `outcome`.
- The preview view only needs `metrics` as a list of strings; a `JSONField` is sufficient.
- The homepage section does not use galleries.
- Adding proper child models now would increase admin complexity without improving the current site.

**Trade-off:** If the detail page later requires a rich gallery or multiple structured KPIs, we will add `CaseStudyImage` and `CaseStudyMetric` models and migrate the `JSONField` gallery into them. The `JSONField` placeholder makes that migration safe and reversible.

---

## 8. API Contract Proposal

### Endpoints
- `GET /api/v1/case-studies/` – list active case studies
- `GET /api/v1/case-studies/<slug>/` – detail a single active case study

### Query parameters for list
- `is_featured=true`
- `show_on_homepage=true`
- `industry=education|enterprise|ai|healthcare|logistics`
- `service=<service-slug>`
- `partner=<partner-slug>`
- `ordering=display_order|project_year|title_en`

### Response shape (list card)
```json
{
  "id": 1,
  "slug": "enterprise-erp-transformation",
  "title": { "en": "...", "ar": "..." },
  "client_name": { "en": "...", "ar": "..." },
  "industry": "enterprise",
  "excerpt": { "en": "...", "ar": "..." },
  "featured_image": { "id": 1, "url": "...", "alt_text": { "en": "...", "ar": "..." } },
  "metrics": ["40% faster reporting", "Unified data layer"],
  "is_featured": true,
  "display_order": 1,
  "project_year": 2026
}
```

### Response shape (detail)
```json
{
  "id": 1,
  "slug": "enterprise-erp-transformation",
  "title": { "en": "...", "ar": "..." },
  "client_name": { "en": "...", "ar": "..." },
  "partner": { "id": 1, "slug": "...", "name": { "en": "...", "ar": "..." }, "logo": {...} },
  "industry": "enterprise",
  "services": [...],
  "technologies": ["ERP", "Integrations", "Automation"],
  "short_description": { "en": "...", "ar": "..." },
  "problem": { "en": "...", "ar": "..." },
  "solution": { "en": "...", "ar": "..." },
  "technology": { "en": "...", "ar": "..." },
  "outcome": { "en": "...", "ar": "..." },
  "metrics": [...],
  "featured_image": {...},
  "client_logo": {...},
  "gallery": [...],
  "project_url": "...",
  "case_study_url": "...",
  "open_in_new_tab": true,
  "project_year": 2026,
  "seo": { "title": {...}, "description": {...} }
}
```

### Serializer strategy
Use two separate serializers (`CaseStudyListSerializer` and `CaseStudyDetailSerializer`) to keep list payloads small and avoid exposing long text blocks in the list endpoint.

---

## 9. Django Admin Plan

### `CaseStudyAdmin`
- **list_display:** `title_en`, `title_ar`, `industry`, `partner`, `display_order`, `is_featured`, `show_on_homepage`, `is_active`, `status`, `updated_at`
- **list_filter:** `industry`, `is_active`, `is_featured`, `show_on_homepage`, `status`, `services`, `partner`
- **search_fields:** `title_en`, `title_ar`, `slug`, `client_name_en`, `client_name_ar`, `short_description_en`, `short_description_ar`, `problem_en`, `problem_ar`, `solution_en`, `solution_ar`
- **ordering:** `display_order`, `title_en`
- **prepopulated_fields:** `slug: ('title_en',)`
- **readonly_fields:** `created_at`, `updated_at`
- **filter_horizontal:** `services`
- **autocomplete_fields:** `partner`, `featured_image`, `client_logo`

### Fieldsets
1. **Identity** – `title_en`, `title_ar`, `slug`
2. **Attribution** – `partner`, `client_name_en`, `client_name_ar`
3. **Summary** – `short_description_en`, `short_description_ar`
4. **Core Content** – `problem_en`, `problem_ar`, `solution_en`, `solution_ar`, `technology_en`, `technology_ar`, `outcome_en`, `outcome_ar`
5. **Media** – `featured_image`, `client_logo`, `gallery`
6. **Classification** – `industry`, `services`, `technologies`
7. **Links** – `project_url`, `case_study_url`, `open_in_new_tab`
8. **Display & Visibility** – `display_order`, `is_featured`, `is_active`, `show_on_homepage`, `status`, `project_year`
9. **SEO** – `seo_title_en`, `seo_title_ar`, `seo_description_en`, `seo_description_ar`
10. **Timestamps** – `created_at`, `updated_at`

### Admin actions
- Activate selected case studies
- Deactivate selected case studies
- Mark as featured
- Remove featured status
- Show on homepage
- Hide from homepage

This keeps the admin usable for non-technical content managers while remaining the technical fallback.

---

## 10. Custom CMS Dashboard Readiness

The proposed backend architecture supports the future Sidrah-branded CMS dashboard through the following foundations:

| Future screen | Current backend support |
|---------------|------------------------|
| Case Studies list | `CaseStudy` model with `is_active`, `status`, `ordering` |
| Create / Edit Case Study | Bilingual fields, `status` draft/published, `display_order` |
| Media picker | Existing `MediaAsset` model and FK fields |
| Partner selector | Existing `Partner` model with autocomplete |
| Service selector | Existing `Service` model with M2M |
| Preview | `status` can drive preview logic; public API already read-only |
| Draft / publish | `status` field |
| Reordering | `display_order` field |
| Bilingual editing | `_en` / `_ar` field pairs |
| SEO editing | `seo_title_*`, `seo_description_*` fields |

### Missing for the custom dashboard (to be built later)
- Authenticated write APIs (DRF viewsets with token/JWT authentication and role-based permissions).
- Media upload endpoint (currently media is uploaded through Django Admin or directly to `MediaAsset`).
- A dedicated dashboard user permission model beyond the current `User.role` field.

No dashboard work is needed now.

---

## 11. Frontend Migration Plan

### Phase 1: API layer (no UI change)
- Create `src/services/caseStudiesApi.js` mirroring `partnersApi.js` / `servicesApi.js`.
- Create `src/hooks/useCaseStudies.js` and `src/hooks/useCaseStudy.js`.
- Reuse `getBilingual` and `resolveMediaUrl` helpers.

### Phase 2: Replace hardcoded data
- `CaseStudiesSection` fetches `show_on_homepage=true` or `is_featured=true` CMS case studies and falls back to the 5 hardcoded ones if the API fails.
- `CaseStudiesPage` fetches all active case studies, keeps the industry filter, and falls back to hardcoded data.
- `CaseStudyCard` already supports both card variants; map the CMS data shape to the existing props.

### Phase 3: Add detail page
- Add route `/case-studies/:slug` in `App.jsx`.
- Create `src/pages/CaseStudyDetailPage.jsx` using the existing card's content pattern (problem, solution, technology, outcome, metrics, optional gallery).
- Add bilingual detail SEO using `seo_title` / `seo_description` from the CMS.

### Preserve
- Keep `IntersectionObserver` animations.
- Keep the responsive grid.
- Keep the current CTA behavior (Book Consultation).
- Keep the existing fallback arrays so the site never renders blank sections.

### Files likely to change
- `src/App.jsx` (new route)
- `src/services/caseStudiesApi.js` (new)
- `src/hooks/useCaseStudies.js`, `src/hooks/useCaseStudy.js` (new)
- `src/components/sections/CaseStudiesSection.jsx`
- `src/pages/CaseStudiesPage.jsx`
- `src/components/caseStudies/CaseStudyCard.jsx` (minor data-shape adaptation)
- `src/config/seo.js` (individual detail SEO fallback)
- `src/styles/global.css` (only if detail page needs new layout)

---

## 12. Risks and Gaps

| Risk / Gap | Impact | Recommendation |
|------------|--------|----------------|
| No Arabic case-study content | Blocks full bilingual launch | Add Arabic fields and content during implementation |
| Placeholder images only | Visual quality | Replace placeholders with real `MediaAsset` uploads |
| No detail page architecture | Incomplete user journey | Add `/case-studies/:slug` route and detail component |
| English-only industry labels | Inconsistent Arabic UX | Provide Arabic industry labels or translate via frontend |
| Hardcoded technology strings | Limits reuse | Move to `JSONField` in CMS; later evaluate `Technology` model |
| No partner/client linkage | Duplicate media/logos | Use optional `Partner` FK plus fallback text |
| No draft/publish workflow | Content managers cannot stage | Add `status` field now |
| No individual case-study SEO | SEO gap | Add bilingual SEO fields now |
| Missing `display_order` field | Sorting controlled only by date | Add `display_order` now |
| No active/visible flag | All items always public | Add `is_active` and `show_on_homepage` now |
| Future Academy/LMS implications | Unknown | Keep case-study model generic; do not add LMS-specific fields until requirements are clear |

---

## 13. Recommended Implementation Phases

1. **Backend app scaffold** – Create `apps.case_studies`, register in `INSTALLED_APPS`, create model, migration, admin.
2. **Relationships** – Add optional `Partner` FK and `Service` M2M.
3. **Public API** – Implement list and detail endpoints with filters.
4. **Seed** – Create an idempotent `seed_case_studies` command matching the 5 existing projects.
5. **Frontend integration** – Replace hardcoded data with API hooks and helpers.
6. **Detail page** – Add route and detail page component.
7. **Gallery and metrics enhancement** – Add `CaseStudyImage` and `CaseStudyMetric` child models only when the detail page design requires them.
8. **Authenticated CMS API** – Add write endpoints for the future custom dashboard when that phase begins.

---

## 14. Lightweight Validation Checklist (for future implementation)

- [ ] `apps.case_studies` is registered in `INSTALLED_APPS` and migrations run successfully.
- [ ] `python manage.py seed_case_studies` runs twice without creating duplicates.
- [ ] `GET /api/v1/case-studies/` returns active case studies only, ordered by `display_order`.
- [ ] `GET /api/v1/case-studies/<slug>/` returns the full detail shape.
- [ ] Inactive (`is_active=false`) case studies are excluded from public APIs.
- [ ] `is_featured` and `show_on_homepage` filters work.
- [ ] `partner` relationship returns the correct partner data when set.
- [ ] `services` relationship returns the correct related services.
- [ ] Frontend renders the homepage section and listing page with CMS data.
- [ ] Changing a case study title in Django Admin appears after a frontend refresh.
- [ ] API failure falls back to the existing hardcoded data.

No full test suite is required.

---

## 15. CMS Readiness Score

**6 / 10**

Reasoning:
- The frontend design and component structure are ready (4/5 points).
- The backend has strong reusable patterns but no case-study app yet (3/5 points).
- The integration layer from the previous CMS work (`apiClient`, `getBilingual`, `resolveMediaUrl`) is reusable (+1).
- Missing: model, API, detail page, Arabic content, real images, draft/publish workflow (-4).

The score indicates that the project is well-positioned to add case studies cleanly, but the feature is not yet implemented end-to-end.

---

## 16. Final Investigation Verdict

**Investigation complete.**

A case-studies CMS is not yet present, but all prerequisites are in place. The recommended path is a minimal `apps.case_studies` app with a single `CaseStudy` model, public list/detail APIs, and a frontend integration that preserves the existing hardcoded fallback. No code was modified during this investigation.
