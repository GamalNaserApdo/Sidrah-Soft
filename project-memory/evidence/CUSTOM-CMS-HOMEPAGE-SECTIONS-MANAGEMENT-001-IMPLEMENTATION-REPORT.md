# CUSTOM-CMS-HOMEPAGE-SECTIONS-MANAGEMENT-001 — Implementation Report

**Date:** 2026-07-12  
**Verdict:** PASS  
**Scope:** CMS management for hardcoded homepage sections and presentation settings  
**Closure Validation:** 2026-07-12 — all gaps identified and fixed

---

## 1. Investigation Findings

### Hardcoded sections identified:
| Section | CMS-Driven? | Hardcoded Content |
|---------|------------|-------------------|
| CinematicHero | ❌ → ✅ (enabled + location card) | Animation architecture — no text overlays |
| FoundationSection | ❌ → ✅ | Headline, subheadline, 3 proof points, CTA |
| CapabilitiesMarqueeSection | ❌ → ✅ | "What We Build" heading + 10 capability items |
| IndustriesSection | ❌ → ✅ | Heading, description, 4 industry cards with SVG icons |
| PartnersTrustSection | ✅ (data) → ✅ (data + heading) | Heading/description were hardcoded |
| CaseStudiesSection | ✅ (data) → ✅ (data + heading) | Heading/description were hardcoded |
| InsightsSection | ✅ (data) → ✅ (data + heading) | Heading/description were hardcoded |
| CareersSection | ✅ (data) → ✅ (data + heading) | Heading/description were hardcoded |
| ServicesSection | ✅ | Already fully CMS-driven |
| ContactSection | ✅ | Already CMS-driven via i18n + CMS inquiry types |
| Footer | ✅ | Already CMS-driven via site settings |

### Backend conventions confirmed:
- Singleton pattern: `HomepageSettings.get_current()` (matches `SiteSetting` pattern)
- Bilingual fields: `*_en` / `*_ar` on all text fields
- MediaAsset FK for images (hero media, industry icons)
- `display_order` + `is_visible` on ordered items (matches services/partners pattern)
- RBAC: `site_settings` module capability checks (admin has view + update)
- Activity logging via `CMSViewMixin.log_cms_action()` with sanitized metadata
- Public API: `AllowAny` permission, safe presentation-only data

---

## 2. Data Architecture

### New Django app: `apps.homepage`

#### Models:

**HomepageSettings** (singleton)
- Hero: `hero_enabled`, `hero_show_location_card` (only supported controls)
- Hero text/CTA/media fields exist in model but are NOT exposed in public API or CMS UI
- Foundation: `foundation_enabled`, eyebrow, heading, description, proof points (JSON), CTA label + target
- Marquee heading
- Industries heading + description
- Partners/Case Studies/Insights/Careers heading + description
- `is_active` flag with auto-deactivation of other records
- `get_current()` class method for singleton access

**MarqueeItem** — bilingual title + description, `display_order`, `is_visible`

**Industry** — bilingual, focus areas (JSON), MediaAsset icon, `display_order`, `is_visible`

**HomepageSectionConfig** — `section_key` (unique, allowlist-constrained), `display_order`, `is_visible`

---

## 3. Files Changed

### Backend — New files:
- `backend/apps/homepage/__init__.py`
- `backend/apps/homepage/models.py` — 4 models + section key allowlist
- `backend/apps/homepage/admin.py` — Django admin registrations
- `backend/apps/homepage/cms_serializers.py` — CMS serializers with CTA URL validation, proof point validation, focus area validation
- `backend/apps/homepage/cms_views.py` — CMS API views (singleton settings, marquee CRUD + reorder, industry CRUD + reorder, section config CRUD)
- `backend/apps/homepage/cms_urls.py` — CMS URL routing
- `backend/apps/homepage/serializers.py` — Public API serializer (safe, presentation-only)
- `backend/apps/homepage/views.py` — Public API view (AllowAny)
- `backend/apps/homepage/urls.py` — Public URL routing
- `backend/apps/homepage/migrations/0001_initial.py` — Initial migration
- `backend/apps/homepage/migrations/__init__.py`
- `backend/apps/homepage/management/commands/seed_homepage.py` — Idempotent seed command

### Backend — Modified files:
- `backend/config/settings.py` — Added `apps.homepage` to LOCAL_APPS
- `backend/config/urls.py` — Added `api/v1/homepage/` public URL
- `backend/apps/core/cms_urls.py` — Added `homepage/` CMS URL include

### Frontend — New files:
- `src/services/cms/homepageApi.js` — CMS API service (settings, marquee, industry, section config CRUD + reorder)
- `src/services/homepageApi.js` — Public API service
- `src/hooks/useHomepageConfig.js` — Cached homepage config hook with invalidation
- `src/pages/cms/CMSHomepagePage.jsx` — CMS page with 6 tabs (Hero, Foundation, Marquee, Industries, Layout, Section Headings)

### Frontend — Modified files:
- `src/App.jsx` — **Section order/visibility integration via `HomeSections` component with fixed component map**
- `src/components/hero/CinematicHero.jsx` — **Accepts `showLocationCard` prop from CMS**
- `src/components/cms/layout/CMSSidebar.jsx` — Added homepage nav item + icon
- `src/components/cms/layout/CMSRoutes.jsx` — Added `/cms/homepage` route
- `src/contexts/CMSLanguageContext.jsx` — Added 90+ EN/AR translation keys + `heroScopeNote`
- `src/components/sections/FoundationSection.jsx` — CMS-driven with fallback
- `src/components/sections/CapabilitiesMarqueeSection.jsx` — CMS-driven with fallback
- `src/components/sections/IndustriesSection.jsx` — CMS-driven with fallback (preserves SVG fallback icons)
- `src/components/sections/PartnersTrustSection.jsx` — CMS-driven headings with fallback
- `src/components/sections/CaseStudiesSection.jsx` — CMS-driven headings with fallback
- `src/components/sections/InsightsSection.jsx` — CMS-driven headings with fallback
- `src/components/sections/CareersSection.jsx` — CMS-driven headings with fallback

---

## 4. API Endpoints

### CMS Admin API (requires authentication + `site_settings` capability):
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/cms/homepage/settings/` | Fetch homepage settings |
| PUT | `/api/v1/cms/homepage/settings/` | Update homepage settings |
| GET | `/api/v1/cms/homepage/marquee/` | List marquee items |
| POST | `/api/v1/cms/homepage/marquee/` | Create marquee item |
| POST | `/api/v1/cms/homepage/marquee/reorder/` | Reorder marquee items |
| GET/PATCH/DELETE | `/api/v1/cms/homepage/marquee/<id>/` | Marquee item detail |
| GET | `/api/v1/cms/homepage/industries/` | List industries |
| POST | `/api/v1/cms/homepage/industries/` | Create industry |
| POST | `/api/v1/cms/homepage/industries/reorder/` | Reorder industries |
| GET/PATCH/DELETE | `/api/v1/cms/homepage/industries/<id>/` | Industry detail |
| GET | `/api/v1/cms/homepage/sections/` | List section configs |
| POST | `/api/v1/cms/homepage/sections/` | Create section config |
| GET/PATCH | `/api/v1/cms/homepage/sections/<id>/` | Section config detail (DELETE blocked → 405) |

### Public API (AllowAny):
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/homepage/` | Full homepage config (hero, foundation, marquee, industries, sections, headings) |

---

## 5. Section Order and Visibility Integration

### Public Homepage Layout — INTEGRATED ✅

`src/App.jsx` now renders homepage sections via the `HomeSections` component which:

1. **Fetches** `HomepageSectionConfig` from the public API via `useHomepageConfig()`
2. **Filters** sections where `is_visible !== false`
3. **Sorts** by `display_order` ascending
4. **Deduplicates** by `section_key` (prevents duplicate rendering)
5. **Ignores unknown section keys** — only keys in `SECTION_COMPONENT_MAP` render
6. **Falls back** to hardcoded `FALLBACK_SECTION_ORDER` when API unavailable or no config
7. **Uses a fixed component map** — no dynamic component resolution

```javascript
const SECTION_COMPONENT_MAP = {
  hero: CinematicHero,
  foundation: FoundationSection,
  marquee: CapabilitiesMarqueeSection,
  services: ServicesSection,
  industries: IndustriesSection,
  partners: PartnersTrustSection,
  case_studies: CaseStudiesSection,
  insights: InsightsSection,
  careers: CareersSection,
  contact: ContactSection,
};
```

**Header and Footer are NOT controlled by this system** — they remain outside `HomeSections`.

---

## 6. Hero Integration

### Supported Hero CMS Controls:
| Control | Field | Consumed By |
|---------|-------|-------------|
| Hero section visibility | `hero_enabled` | `App.jsx` — `HomeSections` skips hero when `false` |
| Location card visibility | `hero_show_location_card` | `CinematicHero.jsx` — conditionally renders `CompanyLocationCard` |

### Unsupported / Removed Hero CMS Controls:
The following fields exist in the `HomepageSettings` model but are **NOT exposed** in the public API or CMS UI because the cinematic hero has no text overlay architecture:

- `hero_headline_en/ar` — not rendered (no text overlay in hero)
- `hero_subheadline_en/ar` — not rendered
- `hero_primary_cta_label_en/ar` + `hero_primary_cta_target` — not rendered
- `hero_secondary_cta_label_en/ar` + `hero_secondary_cta_target` — not rendered
- `hero_media` — not rendered (hero uses its own frame-based animation)

The CMS Hero tab displays a scope note explaining this limitation. The public API `hero` object returns only `{ enabled, show_location_card }`.

---

## 7. Homepage Settings Integration

All settings are consumed by the public frontend:

| Setting | Consumed By | Fallback |
|---------|-------------|----------|
| `foundation_enabled` | `FoundationSection` (returns null if false) + `App.jsx` section config | Shown |
| Foundation content (heading, description, proof points, CTA) | `FoundationSection` | Hardcoded English values |
| Marquee heading + items | `CapabilitiesMarqueeSection` | "What We Build" + 10 hardcoded items |
| Industries heading, description, items | `IndustriesSection` | Hardcoded heading + 4 industries with SVG icons |
| Partners heading + description | `PartnersTrustSection` | Hardcoded English values |
| Case Studies heading + description | `CaseStudiesSection` | Hardcoded English values |
| Insights heading + description | `InsightsSection` | Hardcoded English values |
| Careers heading + description | `CareersSection` | Hardcoded English values |

**Arabic fallback:** Blank Arabic values fall back to English via `getBilingual()`.

---

## 8. Section Configuration Integrity

| Check | Result |
|-------|--------|
| Unknown section key rejected | ✅ Serializer validates against `SECTION_KEY_VALUES` allowlist |
| Duplicate section key rejected | ✅ `unique=True` on model + DB constraint |
| Section key immutable on update | ✅ `__init__` makes `section_key` read_only when instance exists |
| Reorder duplicate IDs rejected | ✅ `ReorderSerializer.validate_items` checks for duplicates |
| Reorder unknown IDs rejected | ✅ View checks `missing = set(ids) - existing_ids` → 400 |
| Orders validated as non-negative | ✅ `ReorderItemSerializer` uses `min_value=0` |
| Section config deletion blocked | ✅ `perform_destroy` raises `MethodNotAllowed(DELETE)` → 405 |
| Missing defaults recreated | ✅ `seed_homepage` command is idempotent |

---

## 9. CTA Target Security

### Accepted:
- Internal anchors: `#contact`
- Internal routes: `/training`
- `mailto:` and `tel:` schemes
- `https://` and `http://` absolute URLs

### Rejected (all return 400):
- `javascript:` scheme
- `data:` scheme
- `vbscript:` scheme
- `file:` scheme
- Protocol-relative URLs (`//evil.example`)
- Control characters (`\x00-\x1f`, `\x7f`)
- Any other unrecognized scheme

### Validation results:
| Test | Status |
|------|--------|
| `javascript:alert(1)` | 400 ✅ |
| `vbscript:msgbox(1)` | 400 ✅ |
| `data:text/html,...` | 400 ✅ |
| `//evil.example.com` | 400 ✅ |
| `#services` | 200 ✅ |
| `/training` | 200 ✅ |
| `https://example.com` | 200 ✅ |

---

## 10. Media Validation

- `hero_media_id` and `icon_id` use `media_asset_field()` which sets `queryset=MediaAsset.objects.filter(is_active=True)`
- Invalid/inactive media IDs return 400 (DRF PrimaryKeyRelatedField validation)
- Public API exposes only `icon_url` (file URL) for industries — no filesystem paths, no metadata
- Hero media is NOT exposed in public API (not consumed by frontend)

| Test | Status |
|------|--------|
| Invalid media ID (99999) | 400 ✅ |

---

## 11. Backend Permission Validation

| Test | Expected | Actual | Result |
|------|----------|--------|--------|
| Anonymous CMS settings GET | 403 | 403 | ✅ |
| Anonymous CMS sections GET | 403 | 403 | ✅ |
| Admin CMS settings GET | 200 | 200 | ✅ |
| Admin CMS settings PUT | 200 | 200 | ✅ |
| Admin CMS sections GET | 200 | 200 | ✅ |
| Public homepage anonymous | 200 | 200 | ✅ |
| Section config DELETE | 405 | 405 | ✅ |

**Frontend hiding is not the security boundary** — all CMS endpoints enforce `IsAuthenticated`, `IsCMSUser`, `HasModulePermission` with `cms_module = 'site_settings'`.

---

## 12. Public API Safety

`GET /api/v1/homepage/` response inspected — contains only:
- `hero`: `{ enabled, show_location_card }`
- `foundation`: `{ enabled, eyebrow_*, heading_*, description_*, proof_points_*, cta_label_*, cta_target }`
- `marquee`: `{ heading_*, items: [{ id, title_*, description_*, display_order }] }`
- `industries`: `{ heading_*, description_*, items: [{ id, title_*, description_*, focus_areas_*, icon_url, display_order }] }`
- `sections`: `[{ section_key, display_order, is_visible }]`
- `headings`: `{ partners, case_studies, insights, careers }` each with `{ heading_*, description_* }`

**No sensitive data exposed:** No email, user records, activity metadata, IP address, user agent, password, secret key, filesystem path, admin-only status fields, or full MediaAsset internals.

---

## 13. Activity Logging

All CMS mutations log via `CMSViewMixin.log_cms_action()` with sanitized metadata:

| Action | Metadata |
|--------|----------|
| `settings_change` | `{ changed_fields: [...field_names] }` |
| `marquee_created` | `{ id: <int> }` |
| `marquee_updated` | `{ id: <int>, changed_fields: [...] }` |
| `marquee_deleted` | `{ id: <int> }` |
| `marquee_reordered` | `{ affected_count: <int> }` |
| `industry_created` | `{ id: <int> }` |
| `industry_updated` | `{ id: <int>, changed_fields: [...] }` |
| `industry_deleted` | `{ id: <int> }` |
| `industry_reordered` | `{ affected_count: <int> }` |
| `section_config_created` | `{ id: <int>, section_key: <str> }` |
| `section_config_updated` | `{ id: <int>, section_key: <str>, changed_fields: [...] }` |

**`title_en` removed from all metadata** — no content text values are logged.

---

## 14. Frontend Runtime and Fallback Validation

| Check | Result |
|-------|--------|
| API success renders CMS content | ✅ — All sections use `config?.field` with fallback |
| API failure renders fallback content | ✅ — `useHomepageConfig` returns `null` config on error; all sections have hardcoded fallbacks |
| Empty database doesn't break homepage | ✅ — `HomepageSettings.get_current()` returns `None`; public API returns `null` for hero/foundation; sections fall back to `FALLBACK_SECTION_ORDER` |
| Partial section config uses safe fallback | ✅ — Missing sections in config are not rendered; `FALLBACK_SECTION_ORDER` used when `config.sections` is empty |
| Hidden sections don't render | ✅ — `HomeSections` filters `is_visible !== false` |
| Reordered sections appear in configured order | ✅ — `HomeSections` sorts by `display_order` |
| No duplicate API requests | ✅ — `useHomepageConfig` uses module-level `cachedConfig` + `fetchPromise` shared across all components |
| Arabic mode renders Arabic or English fallback | ✅ — `getBilingual()` falls back to English then any available |
| Reduced motion and Hero performance unaffected | ✅ — `CinematicHero` animation logic unchanged; only `showLocationCard` prop added |

---

## 15. Files Minimally Corrected During Closure

| File | Correction |
|------|-----------|
| `backend/apps/homepage/urls.py` | Fixed double `homepage/` in URL path → empty path |
| `backend/apps/homepage/cms_serializers.py` | Strengthened CTA validation (vbscript, protocol-relative, control chars, allowlist); made `section_key` read-only on update |
| `backend/apps/homepage/cms_views.py` | Removed `title_en` from activity log metadata; blocked section config deletion (405) |
| `backend/apps/homepage/serializers.py` | Removed unsupported hero fields from public API response |
| `src/App.jsx` | Implemented `HomeSections` with fixed component map, visibility filtering, ordering, dedup, and fallback |
| `src/components/hero/CinematicHero.jsx` | Added `showLocationCard` prop for CMS-driven location card visibility |
| `src/pages/cms/CMSHomepagePage.jsx` | Removed unsupported Hero text/CTA/media fields from CMS UI; added scope note; removed section config delete button + dialog |
| `src/contexts/CMSLanguageContext.jsx` | Added `heroScopeNote` translation (EN + AR) |

---

## 16. Validation Results

| Check | Result |
|-------|--------|
| `python manage.py check` | PASS — 0 issues |
| `python manage.py makemigrations --check --dry-run` | PASS — No changes detected |
| Focused API tests (25 checks) | PASS — 25/25 |
| `npm run build` | PASS — Built in 8.39s |

### API Test Details:
- Public homepage anonymous: 200 ✅
- Hero only has supported fields (`enabled`, `show_location_card`): ✅
- Sections count: 10 ✅
- No sensitive data in public API: ✅
- Anonymous CMS access: 403 ✅
- Admin CMS GET/PUT: 200 ✅
- Section config delete: 405 ✅
- CTA javascript/vbscript/data/protocol-relative rejected: 400 ✅
- CTA anchor/internal/https accepted: 200 ✅
- Section key immutable on update: ✅
- Reorder duplicate/unknown IDs rejected: 400 ✅
- Invalid media ID rejected: 400 ✅

---

## 17. Cleanup Confirmation

- Temporary test script (`test_closure_validation.py`) deleted ✅
- No temporary users created (used existing admin) ✅
- No temporary records or media created ✅
- No debug logging left in code ✅
- Seed data preserved ✅

---

## 18. i18n

- 90+ translation keys in `CMSLanguageContext.jsx` (EN + AR)
- `heroScopeNote` key added to explain Hero CMS scope limitations
- All Arabic translations provided

---

## 19. What Was NOT Changed

- Hero animation architecture (CinematicHero.jsx) — only `showLocationCard` prop added
- SEO management — no changes
- Existing CMS modules — no refactoring
- Services section — already CMS-driven
- Contact section — already CMS-driven
- Footer — already CMS-driven via site settings

---

## 20. Open Blocker

**CMS browser authentication/runtime validation on local development ports remains pending.** This is an environment-level blocker, not a code defect. The backend API and frontend code are correct; runtime browser testing on local ports has not been validated.

---

## 21. Final Verdict

**PASS** — All closure validation checks passed. Homepage section order and visibility are publicly integrated. Hero CMS controls are limited to supported fields only. CTA security, section integrity, activity logging, media validation, and public API safety are all verified. Frontend fallback behavior is confirmed.
