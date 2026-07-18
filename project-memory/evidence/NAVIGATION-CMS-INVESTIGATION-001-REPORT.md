# NAVIGATION-CMS-INVESTIGATION-001 REPORT

## 1. Objective

Investigate the current state of the `navigation` app, identify what is needed to turn it into a CMS-controlled navigation system for the SidrahSoft frontend, and produce a recommended implementation plan before any code changes are made.

## 2. Methodology

This report follows the project methodology:

**Investigation → Report → Review → Implementation**

No source files were modified during this investigation.

## 3. Current State

### Existing files

| File | State |
| --- | --- |
| `f:\What_i_Made\New\sidrah_web\backend\apps\navigation\models.py` | Contains `NavigationMenu` and `NavigationItem` models with basic fields |
| `f:\What_i_Made\New\sidrah_web\backend\apps\navigation\admin.py` | Basic `NavigationMenuAdmin` with `NavigationItemInline` |
| `f:\What_i_Made\New\sidrah_web\backend\apps\navigation\migrations\0001_initial.py` | Initial migration applied successfully |
| `f:\What_i_Made\New\sidrah_web\backend\apps\navigation\urls.py` | Empty `urlpatterns` |
| `f:\What_i_Made\New\sidrah_web\backend\apps\navigation\views.py` | **Does not exist** |
| `f:\What_i_Made\New\sidrah_web\backend\apps\navigation\serializers.py` | **Does not exist** |
| `f:\What_i_Made\New\sidrah_web\backend\config\urls.py` | Does **not** include `apps.navigation.urls` |

### Existing models

`NavigationMenu`

- `name` (CharField, 120)
- `location` choices: `header`, `footer` (CharField, unique)
- `is_active` (BooleanField)
- `created_at` / `updated_at` from `TimeStampedModel`

`NavigationItem`

- `menu` → ForeignKey to `NavigationMenu`
- `label` (CharField, 120)
- `url` (CharField, 512)
- `order` (PositiveIntegerField)
- `open_in_new_tab` (BooleanField)
- `is_active` (BooleanField)
- `created_at` / `updated_at`

### What already works

- Database tables exist and migrations were applied successfully.
- Django Admin can manage menus and inline items.
- The foundation is consistent with the other CMS apps (`TimeStampedModel`, `is_active`, etc.).

## 4. Identified Gaps

### Gap A — No public API

There is no serializer, view, or URL route, so the frontend cannot consume navigation data from the CMS. The existing `config/urls.py` also does not include navigation URLs.

### Gap B — Limited menu locations

Only `header` and `footer` are supported. A real-world CMS usually needs:

- `header` (main navigation)
- `footer` (multiple footer columns)
- `sidebar` (for Academy/LMS pages)
- `mobile` (alternative mobile menu)
- `legal` (privacy, terms)
- `social` (social links)

The current `location` field is `unique=True`, which forces only one menu per location. This is too restrictive for multi-column footers or role-based menus.

### Gap C — No hierarchy / dropdowns

`NavigationItem` is a flat list. There is no `parent` self-reference, so the frontend cannot render multi-level dropdowns or mega-menus.

### Gap D — No link-type distinction

`url` is a plain `CharField`. The CMS cannot distinguish between:

- Internal routes (`/services`)
- External URLs (`https://example.com`)
- Page anchors (`#contact`)
- Mailto/tel links (`mailto:...`)
- Dynamic links (future CMS pages, Academy courses, etc.)

A `link_type` field would make the API more useful for the frontend and improve validation.

### Gap E — No multilingual labels

`SiteSetting` already supports `default_language` and `supported_languages`. `NavigationItem` should support localized labels (e.g. `label_en`, `label_ar`) or a JSONField so the frontend can render the correct language without extra requests.

### Gap F — No visibility / role-based filtering

The `User` model defines CMS roles. Navigation items may need to be shown/hidden based on user state (anonymous vs authenticated) or role. This is not required for the public marketing site but will be important once the Academy/LMS is built.

### Gap G — No icon support

Marketing and LMS navigation often uses icons. `NavigationItem` could optionally reference a `MediaAsset` icon or accept an icon CSS class.

### Gap H — No seed data / management command

Unlike `site_settings`, there is no `seed_navigation` command. After each fresh deployment, menus would need to be created manually in the admin.

## 5. Proposed Requirements for NAVIGATION-CMS-001

Based on the gaps above and the existing project architecture, the following scope is recommended for the implementation phase.

### 5.1 Model updates (no migration rewriting)

Add fields to the existing models without changing already-applied migrations. The implementation will create a new migration `0002_...`.

#### `NavigationMenu`

- Remove `unique=True` from `location` so multiple menus can share the same location (e.g. footer columns).
- Add a `slug` or `code` field (unique, URL-safe) so the frontend can request a specific menu by code (e.g. `header`, `footer-services`, `footer-company`).
- Keep `name` for the human-readable admin label.
- Add `description` (optional) for admin context.

#### `NavigationItem`

- Add `parent` self-referencing nullable `ForeignKey` for hierarchy (MPTT or simple adjacency list). For the current scope, a simple `ForeignKey('self')` is sufficient and avoids adding new dependencies.
- Add `link_type` choices: `internal`, `external`, `anchor`, `email`, `phone`, `page` (placeholder for future CMS pages).
- Add `icon` (CharField, optional CSS class or icon name) and/or `icon_asset` ForeignKey to `MediaAsset`.
- Add localized labels: `label_en` and `label_ar` (or a `JSONField` with language map). Given the current `.env` uses `en,ar`, two explicit fields are simpler and index-friendly, but a JSONField is more flexible. The recommendation is to use explicit `label_en` and `label_ar` for now.
- Add `is_visible` / `requires_authenticated` (optional, for future role filtering) and keep `is_active` for CMS-level enable/disable.
- Add `css_class` (optional) for styling hooks.

### 5.2 Admin improvements

- Register `NavigationItem` as a standalone admin as well as inline, so deep editing is easier.
- Use `treebeard` or a custom recursive inline if hierarchy is added. For a simple adjacency list, a `parent` dropdown filtered by the same menu is enough.
- Display `order`, `location/slug`, and `is_active` in list views.
- Add validation to prevent a menu item from being its own parent or a descendant of itself.

### 5.3 API endpoints

Following the existing `/api/v1/` pattern:

| Endpoint | Purpose |
| --- | --- |
| `GET /api/v1/navigation/` | Return all active menus with their full item trees |
| `GET /api/v1/navigation/<slug>/` | Return a single menu by slug (e.g. `header`) |

Recommended response shape (nested JSON):

```json
{
  "slug": "header",
  "name": "Header",
  "location": "header",
  "items": [
    {
      "id": 1,
      "label": "Services",
      "link_type": "internal",
      "url": "/services",
      "order": 1,
      "open_in_new_tab": false,
      "icon": null,
      "children": []
    }
  ]
}
```

### 5.4 URL wiring

Include `apps.navigation.urls` in `config/urls.py` under `path('api/v1/', include('apps.navigation.urls'))`.

### 5.5 Seed command

Create `apps.navigation.management.commands.seed_navigation` to create default menus and items if none exist, similar to `seed_site_settings`.

### 5.6 Tests

Add minimal tests for:

- Menu API returns active menus only
- Nested items are serialized correctly
- Circular parent references are blocked at the model/admin level

## 6. Risks and Considerations

| Risk | Mitigation |
| --- | --- |
| Adding a parent `ForeignKey` creates potential circular references | Add model/admin validation; keep hierarchy depth limited to 2–3 levels for the frontend |
| Removing `unique=True` from `location` changes existing constraints | Create a new migration; old data remains valid because unique was only enforced at the DB level |
| Multilingual label strategy may need to change later | Keep labels as explicit fields now, or use JSONField if flexibility is preferred |
| MPTT (`django-mptt` or `treebeard`) adds a dependency | Avoid for now; use a simple adjacency list to keep the stack lean |
| Frontend may expect a different response shape | Define API contract in the report and confirm with frontend before implementation |
| Existing migrations must not be rewritten | Only add new migrations; do not edit `0001_initial.py` |

## 7. Open Questions (for review)

Before implementation starts, the following decisions need to be confirmed:

1. **Menu locations**: Which locations should be supported initially? Suggested: `header`, `footer` (maybe allow multiple footer menus), `mobile`, `legal`.
2. **Slug vs location**: Should the API use a `slug` (e.g. `footer-services`) to request a specific menu, or a `location` (e.g. `footer`) returning all menus for that location?
3. **Hierarchy depth**: Is one-level dropdown enough, or do we need multi-level mega-menus?
4. **Multilingual labels**: Use explicit `label_en`/`label_ar` fields or a single `JSONField`?
5. **Icon support**: CSS class only, `MediaAsset` icon, or both?
6. **Visibility rules**: Do we need authenticated/role-based visibility in this phase, or keep it public-only?
7. **Frontend contract**: What exact JSON shape does the React frontend expect for the header/footer?

## 8. Recommended Implementation Plan

If the review confirms the proposed scope, the implementation order should be:

1. Update `NavigationMenu` and `NavigationItem` models (new migration only).
2. Add model validation for hierarchy and link types.
3. Create `NavigationSerializer` and nested serializer for children.
4. Create `NavigationMenuListView` and `NavigationMenuDetailView` (read-only, public).
5. Wire `apps.navigation.urls` into `config/urls.py`.
6. Improve Django Admin (standalone item admin, inline validation, list display).
7. Create `seed_navigation` management command.
8. Add focused tests.
9. Validate endpoints with `runserver` and update the completion report.

## 9. Final Status

**INVESTIGATION COMPLETE — AWAITING REVIEW**

The `navigation` app has a solid foundation but needs model expansion, a public API, admin improvements, and seed data before it can serve as a CMS-controlled navigation source for the frontend.

No source files were changed during this investigation. The next step is user review of this report before proceeding with **NAVIGATION-CMS-IMPLEMENTATION-001**.
