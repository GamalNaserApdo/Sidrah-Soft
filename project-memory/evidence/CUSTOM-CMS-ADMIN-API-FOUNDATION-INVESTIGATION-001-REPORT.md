# CUSTOM-CMS-ADMIN-API-FOUNDATION-INVESTIGATION-001 — Report

**Date:** 2026-07-11  
**Investigator:** Cascade (Senior Django REST Framework Architect & CMS Security Engineer)  
**Task ID:** CUSTOM-CMS-ADMIN-API-FOUNDATION-INVESTIGATION-001  

---

# Executive Summary

A comprehensive investigation of the SidrahSoft backend, authentication, RBAC, serializers, APIs, activity logging, frontend CMS foundation, and content models was conducted to produce a precise implementation blueprint for `CUSTOM-CMS-ADMIN-API-FOUNDATION-001`.

The existing architecture is well-structured with clean app separation, consistent bilingual field patterns, a centralized RBAC policy, append-only activity logging, and session-based authentication with CSRF enforcement. All 12 CMS models are registered in Django Admin. All public APIs use `APIView` with `AllowAny` permissions and follow a consistent pattern of bilingual `SerializerMethodField` responses.

The Admin API Foundation can be implemented **without schema changes** (NO MIGRATIONS REQUIRED). All models already contain the fields needed for CMS management (status, ordering, visibility, SEO, bilingual content). The `django-filter` package is not installed; manual query param filtering (already used in public views and activity logs) should be reused.

**Final Verdict:** `READY FOR CUSTOM-CMS-ADMIN-API-FOUNDATION-001`

---

# Existing API Architecture

## URL Configuration

**Root URL conf:** `backend/config/urls.py`

```
admin/                                    → Django Admin
api/v1/                                   → apps.core.urls (health)
api/v1/                                   → apps.site_settings.urls
api/v1/auth/                              → apps.accounts.urls
api/v1/admin/                             → apps.accounts.admin_urls
api/v1/admin/activity-logs/               → apps.activity_logs.urls
api/v1/navigation/                        → apps.navigation.urls
api/v1/partners/                          → apps.partners.urls
api/v1/services/                          → apps.services.urls
api/v1/case-studies/                      → apps.case_studies.urls
api/v1/insights/                          → apps.insights.urls
api/v1/jobs/                              → apps.careers.urls
api/v1/contact/                           → apps.contact.urls
```

## API Versioning

All endpoints are under `/api/v1/`. No URL path versioning class is configured in DRF settings. Versioning is purely URL-prefix based.

## View Styles

| Style | Usage | Files |
|-------|-------|-------|
| `APIView` | All public endpoints + auth endpoints + dashboard access | `accounts/views.py`, `site_settings/views.py`, `navigation/views.py`, `partners/views.py`, `services/views.py`, `case_studies/views.py`, `insights/views.py`, `careers/views.py`, `contact/views.py` |
| `ListAPIView` / `RetrieveAPIView` | Activity logs admin API | `activity_logs/views.py` |
| `@api_view` function-based | Health check only | `core/views.py` |
| `GenericAPIView` / `ModelViewSet` / `ViewSet` | **Not used anywhere** | — |

**Recommendation:** Admin CRUD endpoints should use `GenericAPIView` subclasses (`ListCreateAPIView`, `RetrieveUpdateDestroyAPIView`) or `ModelViewSet` with `DRF Router` for consistency and reduced boilerplate. The activity logs already use `ListAPIView`/`RetrieveAPIView` from the generics family.

## Serializer Organization

Each app has its own `serializers.py` in `backend/apps/<app>/serializers.py`. Public serializers use:
- `ModelSerializer` as base
- `SerializerMethodField` for bilingual fields (returns `{'en': ..., 'ar': ...}`)
- Nested `MediaAssetSerializer` for media references
- List vs Detail serializer inheritance (e.g., `ArticleDetailSerializer(ArticleListSerializer)`, `CaseStudyDetailSerializer(CaseStudyListSerializer)`, `JobDetailSerializer(JobListSerializer)`)

## Pagination Conventions

- **Global:** `PageNumberPagination` with `PAGE_SIZE = 20` (in `REST_FRAMEWORK` settings)
- **Activity Logs:** Custom `StandardResultsSetPagination` with `page_size=20`, `page_size_query_param='page_size'`, `max_page_size=100`
- **Public APIs:** No pagination (return full querysets) — all public list endpoints return unpaginated arrays

**Recommendation:** Admin APIs must use the `StandardResultsSetPagination` from `activity_logs/views.py` (extract to shared module).

## Filtering and Ordering Conventions

All filtering is manual via `request.query_params.get(...)` in view `get()` methods. No `django-filter` or `FilterSet` is used. Ordering is applied via `.order_by()` on the queryset.

## Error-Response Structure

- **Auth:** `{'detail': 'message'}` with HTTP 401/403
- **Validation:** DRF default `{'field_name': ['error message']}` with HTTP 400
- **Not found:** DRF default 404 (via `get_object_or_404`)
- **Method not allowed:** `MethodNotAllowed` exception (activity logs)
- **No custom error envelope** — DRF default error format is used

## Service-Layer Conventions

- `apps/activity_logs/services.py` — `log_activity()` and `log_content_action()` helper functions
- `apps/contact/services.py` — `send_submission_notification()` email service
- `apps/site_settings/models.py` — `SiteSetting.get_current()` singleton helper
- No selector-layer pattern; queries are inline in views

## Reusable API Utilities

- `apps/core/models.py` — `TimeStampedModel` abstract base (created_at, updated_at)
- `apps/accounts/permissions.py` — 6 reusable permission classes
- `apps/activity_logs/views.py` — `StandardResultsSetPagination`
- `apps/activity_logs/services.py` — `log_activity()`, `log_content_action()`

---

# Authentication Contract

## Endpoints

| Endpoint | Method | Permission | CSRF | Throttle | File |
|----------|--------|------------|------|----------|------|
| `/api/v1/auth/csrf/` | GET | `AllowAny` | `ensure_csrf_cookie` | None | `accounts/views.py:CSRFTokenView` |
| `/api/v1/auth/login/` | POST | `AllowAny` | `csrf_protect` | `ScopedRateThrottle` (cms_login, 5/m) | `accounts/views.py:LoginView` |
| `/api/v1/auth/logout/` | POST | `IsAuthenticated` | `csrf_protect` | None | `accounts/views.py:LogoutView` |
| `/api/v1/auth/me/` | GET | `IsCMSUser` | SessionAuth (DRF) | None | `accounts/views.py:CurrentUserView` |
| `/api/v1/admin/dashboard/access/` | GET | `IsCMSUser` | SessionAuth (DRF) | None | `accounts/admin_views.py:DashboardAccessView` |

## Session Authentication

- **Only** `SessionAuthentication` is configured in `REST_FRAMEWORK['DEFAULT_AUTHENTICATION_CLASSES']`
- No JWT, no token auth
- Session cookies: `HttpOnly=True`, `SameSite='Lax'`, 8-hour age
- CSRF cookies: `HttpOnly=False` (frontend must read), `SameSite='Lax'`

## CSRF Enforcement

- Login and Logout: `@method_decorator(csrf_protect, name='dispatch')` (critical fix from AUTH-RBAC-FOUNDATION-001)
- All other authenticated endpoints: DRF `SessionAuthentication` enforces CSRF automatically for unsafe methods
- Frontend reads `csrftoken` from cookie and sends `X-CSRFToken` header

## Frontend Credential Handling

- `authApi.js`: `credentials: 'include'` on all requests
- `apiClient.js`: `credentials` not set (public API client) — admin API client must add `credentials: 'include'`
- CSRF token read from `document.cookie.match(/csrftoken=([^;]+)/)`
- No tokens in localStorage

## Admin API Authentication Requirements

Every Admin API endpoint MUST:
1. Use `permission_classes = [IsCMSUser, HasModulePermission]` (or more specific permission)
2. Set `cms_module` and `cms_action` view attributes
3. Rely on DRF `SessionAuthentication` for CSRF enforcement on unsafe methods
4. Never use `AllowAny`
5. Be registered under `/api/v1/admin/` or `/api/v1/cms/` URL prefix

---

# RBAC and Capability Matrix

## Custom User Model

**File:** `backend/apps/accounts/models.py`  
**Model:** `User(AbstractUser)`  
**Field:** `role` (CharField, max_length=32, choices=ROLE_CHOICES, default='content_manager')

## Role Constants

**File:** `backend/apps/accounts/roles.py`

| Constant | Value | Notes |
|----------|-------|-------|
| `ROLE_SUPER_ADMIN` | `super_admin` | Bypasses all checks |
| `ROLE_ADMIN` | `admin` | Full CRUD on most modules |
| `ROLE_CONTENT_MANAGER` | `content_manager` | Content CRUD, no user mgmt |
| `ROLE_EDITOR` | `editor` | Create/Update only, no delete/publish |
| `ROLE_MARKETING_MANAGER` | `marketing_manager` | Partners, Insights, Site Settings |
| `ROLE_MARKETING_SEO` | `marketing_seo` | **Legacy** → mapped to `marketing_manager` |
| `ROLE_RECRUITER` | `recruiter` | Careers CRUD only |
| `ROLE_SUPPORT_AGENT` | `support_agent` | Contact view/update/assign |
| `ROLE_SUPPORT_RECRUITER` | `support_recruiter` | **Legacy** → mapped to `support_agent` |
| `ROLE_LMS_ADMIN` | `lms_admin` | Dashboard only |
| `ROLE_FINANCE_SALES` | `finance_sales` | Dashboard + Contact view |

## Module Identifiers

```
dashboard, site_settings, navigation, partners, services, case_studies,
careers, insights, contact, media, users, activity_logs
```

## Action Identifiers

```
view, create, update, delete, publish, export, assign, manage_users
```

## Full Permission Matrix

| Module | admin | content_manager | editor | marketing_manager | recruiter | support_agent | lms_admin | finance_sales |
|--------|-------|----------------|--------|-------------------|----------|---------------|-----------|---------------|
| dashboard | view | view | view | view | view | view | view | view |
| site_settings | view, update | — | — | view, update | — | — | — | — |
| navigation | CRUD+publish | CRUD+publish | view, update | view, update | — | — | — | — |
| partners | CRUD+publish | CRUD+publish | view, create, update | CRUD+publish | — | — | — | — |
| services | CRUD+publish | CRUD+publish | view, create, update | view, update | — | — | — | — |
| case_studies | CRUD+publish | CRUD+publish | view, create, update | view, update | — | — | — | — |
| careers | CRUD+publish | — | — | — | CRUD+publish | — | — | — |
| insights | CRUD+publish | CRUD+publish | view, create, update | CRUD+publish | — | — | — | — |
| contact | view, update, assign, export | view | — | — | view | view, update, assign | — | view |
| media | CRUD+publish | CRUD+publish | view, create | view, create | view, create | — | — | — |
| users | view | — | — | — | — | — | — | — |
| activity_logs | view | — | — | — | — | — | — | — |

**Super Admin bypass:** `user.is_superuser` returns `True` for all permission checks.

## Permission Classes

**File:** `backend/apps/accounts/permissions.py`

| Class | Purpose |
|-------|---------|
| `IsCMSUser` | Authenticated + active + (superuser OR role in CMS_ROLES) |
| `IsSuperAdmin` | Superuser OR role=super_admin |
| `CanManageUsers` | Superuser OR role in (super_admin, admin) |
| `HasCMSRole` | Configurable via `allowed_roles` or `view.cms_allowed_roles` |
| `HasModulePermission` | Checks `view.cms_module` + `view.cms_action` (default 'view') |
| `CanPublishContent` | Checks `view.cms_module` + 'publish' action |

## Capability String Format

`{module}.{action}` — e.g., `insights.publish`, `contact.assign`, `users.manage_users`

## Legacy Role Mapping

`LEGACY_ROLE_MAP` in `roles.py`:
- `marketing_seo` → `marketing_manager`
- `support_recruiter` → `support_agent`

## Unauthorized/Forbidden Behavior

- Unauthenticated: 401 (DRF default for `IsAuthenticated`/`IsCMSUser`)
- Authenticated but lacks module: 403
- Inactive user: 401 on login (generic message), `IsCMSUser` returns False
- Non-CMS user: 403 on login ("You do not have CMS access.")

---

# Activity Logging Integration

## ActivityLog Model

**File:** `backend/apps/activity_logs/models.py`

| Field | Type | Notes |
|-------|------|-------|
| user | FK → User | `on_delete=SET_NULL`, null=True |
| username | CharField(150) | Denormalized for audit trail |
| action | CharField(32) | Choices: login, logout, login_failed, create, update, delete, publish, unpublish, archive, restore, status_change, assign, export, settings_change |
| module | CharField(32) | Choices: auth, dashboard, site_settings, navigation, partners, services, case_studies, careers, insights, contact, media, users, activity_logs |
| object_type | CharField(100) | e.g. "services.Service" |
| object_id | CharField(40) | PK or public identifier |
| object_repr | CharField(255) | Human-readable summary |
| description | TextField | Human-readable description |
| metadata | JSONField | Sanitized, no secrets |
| ip_address | GenericIPAddressField | null=True |
| user_agent | TextField | Bounded to 512 chars |
| origin | CharField(255) | Origin header |
| request_method | CharField(10) | HTTP method |
| request_path | CharField(255) | URL path |
| is_success | BooleanField | Default True |
| failure_reason | CharField(255) | Safe failure reason |
| created_at | DateTimeField | auto_now_add (from TimeStampedModel) |
| updated_at | DateTimeField | auto_now (from TimeStampedModel) |

## Logging Service

**File:** `backend/apps/activity_logs/services.py`

### `log_activity()` — Primary logging function

Keyword-only arguments: `user`, `action`, `module`, `request`, `object_instance`, `object_type`, `object_id`, `object_repr`, `description`, `metadata`, `is_success`, `failure_reason`

- Never raises (failures logged to Python logger)
- Sanitizes metadata recursively (removes sensitive keys: password, token, secret, csrf, session, etc.)
- Truncates strings to bounded lengths
- Extracts IP, user-agent, method, path from request

### `log_content_action()` — Reusable CRUD helper

Wraps `log_activity()` with `object_instance` auto-resolution. **Future admin API views should call this after successful mutations.**

## Existing Event Implementation

- `login` — logged on successful login (`accounts/views.py:LoginView`)
- `login_failed` — logged on failed login, inactive user, non-CMS user
- `logout` — logged on successful logout (`accounts/views.py:LogoutView`)

## Append-Only Enforcement

- Model `save()` has a safety net comment (currently pass)
- API: `POST` → `MethodNotAllowed`, `PUT`/`PATCH`/`DELETE` on detail → `MethodNotAllowed`
- Django Admin: `has_add_permission=False`, `has_change_permission=False`, `has_delete_permission=superuser only`

## Recommended Event Naming for Admin API Actions

| Admin API Action | ActivityLog action | module |
|------------------|-------------------|--------|
| Create record | `create` | module name |
| Update record | `update` | module name |
| Delete record | `delete` | module name |
| Publish article | `publish` | `insights` |
| Unpublish article | `unpublish` | `insights` |
| Archive article | `archive` | `insights` |
| Restore article | `restore` | `insights` |
| Activate/deactivate partner | `update` | `partners` |
| Reorder navigation items | `update` | `navigation` |
| Update site settings | `settings_change` | `site_settings` |
| Update contact status | `status_change` | `contact` |
| Assign contact lead | `assign` | `contact` |
| Export contact leads | `export` | `contact` |

**Standard pattern:** Call `log_content_action(user=request.user, action=..., module=..., instance=..., request=request, description=...)` after every successful mutation.

---

# Dashboard API Requirements

## Current Dashboard

**Frontend file:** `src/pages/cms/CMSDashboardPage.jsx`

Currently displays:
- User identity (name, email, role, staff, superuser)
- Permitted modules list
- Capabilities list
- Recent Activity widget (fetches `/api/v1/admin/activity-logs/?page_size=5`)

## Dashboard Data Requirements

| Widget | Data Source | Required |
|--------|------------|----------|
| User info | `/api/v1/auth/me/` (already exists) | ✅ Existing |
| Recent activity | `/api/v1/admin/activity-logs/?page_size=5` (already exists) | ✅ Existing |
| Content totals | Aggregate counts: Articles, Jobs, Partners, Services, CaseStudies, ContactSubmissions | **NEW** |
| Published/draft totals | Article status counts | **NEW** |
| Active jobs count | `Job.public_qs().count()` | **NEW** |
| Contact submission totals | Total + by status (new, contacted, in_progress, closed) | **NEW** |
| Recent contact submissions | Latest 5 submissions | **NEW** |
| Module visibility | Already in user response (`permitted_modules`) | ✅ Existing |

## Recommendation: Single Aggregated Dashboard Endpoint

**Endpoint:** `GET /api/v1/cms/dashboard/`

**Rationale:** The dashboard needs aggregated counts from multiple models. A single endpoint avoids 6+ separate requests from the frontend. The endpoint should:
- Return counts only for modules the user has `view` permission for
- Return recent activity (reuse activity log query)
- Return recent contact submissions (if user has `contact.view`)
- Be cached for 30-60 seconds in production

---

# Site Settings Admin API

## Model

**File:** `backend/apps/site_settings/models.py`  
**Model:** `SiteSetting(TimeStampedModel)`  
**Singleton behavior:** `save()` deactivates other records when `is_active=True`. `get_current()` returns active record.

## Fields

| Field | Type | CMS Editable | Notes |
|-------|------|-------------|-------|
| site_name | CharField(120) | ✅ | |
| site_tagline | CharField(255) | ✅ | |
| default_language | CharField(10) | ✅ | |
| supported_languages | JSONField(list) | ✅ | |
| contact_email | EmailField | ✅ | Public |
| recipient_email | EmailField | ✅ | **Internal** — not in public serializer |
| phone | CharField(40) | ✅ | |
| whatsapp_url | URLField | ✅ | |
| telegram_url | URLField | ✅ | |
| facebook_url, linkedin_url, instagram_url, youtube_url, x_url | URLField | ✅ | |
| address | TextField | ✅ | |
| google_maps_url | URLField | ✅ | |
| map_embed_url | URLField | ✅ | |
| latitude | DecimalField(9,6) | ✅ | |
| longitude | DecimalField(9,6) | ✅ | |
| working_hours | CharField(120) | ✅ | |
| default_meta_title | CharField(120) | ✅ | |
| default_meta_description | TextField | ✅ | |
| default_og_image | FK → MediaAsset | ✅ | |
| primary_logo | FK → MediaAsset | ✅ | |
| secondary_logo | FK → MediaAsset | ✅ | |
| favicon | FK → MediaAsset | ✅ | |
| is_active | BooleanField | ✅ | Singleton toggle |
| created_at | DateTimeField | ❌ Read-only | |
| updated_at | DateTimeField | ❌ Read-only | |

## Public Serializer

**File:** `backend/apps/site_settings/serializers.py`  
Exposes: site_name, tagline, language, contact_email, phone, social URLs, address, map data, SEO defaults, logo URLs.  
**Does NOT expose:** `recipient_email`, `id`, `is_active`, `created_at`, `updated_at`

## Public Endpoint

`GET /api/v1/site-settings/` → `SiteSettingSerializer` (nested grouped response: general, contact, social, location, seo, branding)

## Admin API Recommendation

**Single endpoint:** `GET/PUT /api/v1/cms/site-settings/`

**Rationale:** Singleton model — no list/create/delete needed. Only retrieve and update. The admin serializer should expose ALL fields including `recipient_email` (internal, CMS-only). Media FKs should accept media IDs (write) and return media URLs (read).

**Required capability:** `site_settings.view` (GET), `site_settings.update` (PUT)

---

# Navigation Admin API

## Models

**File:** `backend/apps/navigation/models.py`

### NavigationMenu

| Field | Type | Notes |
|-------|------|-------|
| name | CharField(120) | |
| slug | SlugField(64) | unique=True |
| location | CharField(32) | header, footer, mobile, legal |
| description | CharField(255) | |
| order | PositiveIntegerField | |
| is_active | BooleanField | |
| created_at, updated_at | DateTimeField | read-only |

### NavigationItem

| Field | Type | Notes |
|-------|------|-------|
| menu | FK → NavigationMenu | on_delete=CASCADE |
| parent | FK → self | on_delete=CASCADE, null=True, max depth 2 |
| label_en, label_ar | CharField(120) | Bilingual |
| link_type | CharField(16) | internal, external, anchor, email, phone |
| url | CharField(512) | |
| route_name | CharField(120) | |
| anchor | CharField(120) | |
| email | EmailField | |
| phone | CharField(40) | |
| order | PositiveIntegerField | |
| open_in_new_tab | BooleanField | |
| icon | CharField(120) | CSS class or identifier |
| icon_asset | FK → MediaAsset | on_delete=SET_NULL |
| is_visible | BooleanField | |
| created_at, updated_at | DateTimeField | read-only |

## Validation

`NavigationItem.clean()` enforces:
- No self-parenting
- Parent must be in same menu
- Max depth 2 (parent cannot have its own parent)
- Link-type-specific field requirements (internal needs url/route_name, external needs valid URL, etc.)

## Public Endpoint

`GET /api/v1/navigation/` → all active menus with visible items (prefetched, 2-level hierarchy)  
`GET /api/v1/navigation/<slug>/` → single menu by slug

## Admin API Recommendation

```
GET    /api/v1/cms/navigation/menus/           → list + create
GET    /api/v1/cms/navigation/menus/<id>/      → retrieve + update + delete
GET    /api/v1/cms/navigation/items/           → list + create (filter by menu)
GET    /api/v1/cms/navigation/items/<id>/      → retrieve + update + delete
POST   /api/v1/cms/navigation/items/reorder/   → bulk reorder within a menu
```

**Required capability:** `navigation.view` (GET), `navigation.create` (POST), `navigation.update` (PUT/PATCH), `navigation.delete` (DELETE)

**Circular parent risk:** Already handled in `clean()`. Admin serializer must call `full_clean()` or replicate validation.

**Reordering:** Bulk reorder endpoint accepting `[{id, order}, ...]` within a single menu. Must be transactional.

---

# Partners Admin API

## Model

**File:** `backend/apps/partners/models.py`  
**Model:** `Partner(TimeStampedModel)`

| Field | Type | Notes |
|-------|------|-------|
| name_en, name_ar | CharField(255) | Bilingual |
| slug | SlugField(255) | unique=True |
| description_en, description_ar | TextField | Bilingual |
| logo | FK → MediaAsset | on_delete=SET_NULL |
| website_url | URLField | |
| open_in_new_tab | BooleanField | |
| partner_type | CharField(32) | client, strategic_partner, academic_partner, technology_partner, training_partner, other |
| display_order | PositiveIntegerField | |
| is_featured | BooleanField | |
| is_active | BooleanField | |
| created_at, updated_at | DateTimeField | read-only |

## Public Endpoint

`GET /api/v1/partners/` → active partners, filter by partner_type, is_featured  
`GET /api/v1/partners/<slug>/` → single partner

## Admin API Recommendation

```
GET    /api/v1/cms/partners/           → paginated list (all, not just active)
POST   /api/v1/cms/partners/           → create
GET    /api/v1/cms/partners/<id>/      → retrieve
PUT    /api/v1/cms/partners/<id>/      → update
PATCH  /api/v1/cms/partners/<id>/      → partial update
DELETE /api/v1/cms/partners/<id>/      → hard delete (see Deletion Strategy)
```

**Required capability:** `partners.view`, `partners.create`, `partners.update`, `partners.delete`

**Delete risk:** Partners are referenced by CaseStudy.partner FK (SET_NULL). Safe to delete — case studies retain client_name fields. Activity log should record the delete.

---

# Services Admin API

## Model

**File:** `backend/apps/services/models.py`  
**Model:** `Service(TimeStampedModel)`

| Field | Type | Notes |
|-------|------|-------|
| name_en, name_ar | CharField(255) | Bilingual |
| slug | SlugField(255) | unique=True |
| short_description_en, short_description_ar | TextField | Bilingual |
| description_en, description_ar | TextField | Bilingual |
| icon | FK → MediaAsset | on_delete=SET_NULL |
| featured_image | FK → MediaAsset | on_delete=SET_NULL |
| display_order | PositiveIntegerField | |
| is_featured | BooleanField | |
| is_active | BooleanField | |
| show_on_homepage | BooleanField | |
| cta_label_en, cta_label_ar | CharField(120) | Bilingual |
| cta_url | CharField(512) | |
| seo_title_en, seo_title_ar | CharField(255) | Bilingual |
| seo_description_en, seo_description_ar | TextField | Bilingual |
| created_at, updated_at | DateTimeField | read-only |

## Public Endpoint

`GET /api/v1/services/` → active services, filter by is_featured, show_on_homepage  
`GET /api/v1/services/<slug>/` → single service

## Admin API Recommendation

```
GET    /api/v1/cms/services/           → paginated list
POST   /api/v1/cms/services/           → create
GET    /api/v1/cms/services/<id>/      → retrieve
PUT    /api/v1/cms/services/<id>/      → update
PATCH  /api/v1/cms/services/<id>/      → partial update
DELETE /api/v1/cms/services/<id>/      → hard delete
```

**Required capability:** `services.view`, `services.create`, `services.update`, `services.delete`

**Delete risk:** Services are referenced by CaseStudy.services M2M (blank=True) and ContactSubmission.related_service FK (SET_NULL). Safe to delete.

---

# Case Studies Coverage Decision

## Verdict: `INCLUDE IN FOUNDATION`

**Architectural reason:** Case Studies follow the exact same pattern as Partners and Services (bilingual fields, slug, display_order, is_active, is_featured, show_on_homepage, SEO fields, MediaAsset FKs). The model is fully defined with no missing fields. The RBAC matrix already includes `case_studies` module with CRUD+publish for admin, content_manager, and editor roles. Excluding it would create an inconsistency where content managers can manage Partners and Services but not Case Studies, requiring a separate phase for no architectural reason.

Additionally, Case Studies have FK references to Partners and M2M to Services, so the Admin API for Case Studies depends on the Partners and Services admin APIs being available. Including all three in the foundation ensures referential integrity from day one.

---

# Insights Admin API

## Model

**File:** `backend/apps/insights/models.py`  
**Model:** `Article(TimeStampedModel)`

| Field | Type | Notes |
|-------|------|-------|
| title_en, title_ar | CharField(255) | Bilingual |
| slug | SlugField(255) | unique=True |
| content_type | CharField(32) | insight, article, news, announcement |
| excerpt_en, excerpt_ar | TextField | Bilingual |
| body_en, body_ar | TextField | Bilingual |
| category_en, category_ar | CharField(120) | Bilingual free-text |
| author_name_en, author_name_ar | CharField(120) | Bilingual free-text |
| featured_image | FK → MediaAsset | on_delete=SET_NULL |
| status | CharField(16) | draft, published, archived |
| published_at | DateTimeField | null=True |
| is_featured | BooleanField | |
| show_on_homepage | BooleanField | |
| display_order | PositiveIntegerField | |
| read_time_minutes | PositiveIntegerField | null=True |
| seo_title_en, seo_title_ar | CharField(255) | Bilingual |
| seo_description_en, seo_description_ar | TextField | Bilingual |
| created_at, updated_at | DateTimeField | read-only |

## Public Endpoint

`GET /api/v1/insights/` → published articles only (`Article.public_qs()`), filter by content_type, category, is_featured, show_on_homepage  
`GET /api/v1/insights/<slug>/` → single published article

## Workflow

- `draft` → not visible publicly
- `published` → visible if `published_at <= now`
- `archived` → not visible publicly

## Admin API Recommendation

```
GET    /api/v1/cms/insights/            → paginated list (ALL statuses)
POST   /api/v1/cms/insights/            → create (default status=draft)
GET    /api/v1/cms/insights/<id>/       → retrieve (any status)
PUT    /api/v1/cms/insights/<id>/       → update
PATCH  /api/v1/cms/insights/<id>/       → partial update
DELETE /api/v1/cms/insights/<id>/       → hard delete
POST   /api/v1/cms/insights/<id>/publish/   → set status=published, published_at=now
POST   /api/v1/cms/insights/<id>/unpublish/ → set status=draft
POST   /api/v1/cms/insights/<id>/archive/   → set status=archived
POST   /api/v1/cms/insights/<id>/restore/   → set status=draft (from archived)
```

**Required capability:** `insights.view`, `insights.create`, `insights.update`, `insights.delete`, `insights.publish` (for publish/unpublish/archive/restore)

**Workflow actions should use dedicated endpoints** (not normal PATCH) because:
1. They require explicit permission checks (`publish` action vs `update` action)
2. They set `published_at` automatically
3. They should log specific activity actions (publish, unpublish, archive, restore)
4. They are state transitions, not field updates

---

# Careers Admin API

## Model

**File:** `backend/apps/careers/models.py`  
**Model:** `Job(TimeStampedModel)`

| Field | Type | Notes |
|-------|------|-------|
| title_en, title_ar | CharField(255) | Bilingual |
| slug | SlugField(255) | unique=True |
| department_en, department_ar | CharField(120) | Bilingual |
| location_en, location_ar | CharField(120) | Bilingual |
| employment_type | CharField(32) | full_time, part_time, contract, internship, freelance, temporary, other |
| workplace_type | CharField(32) | onsite, remote, hybrid |
| experience_level | CharField(32) | entry, junior, mid, senior, lead, manager, unspecified |
| short_description_en, short_description_ar | TextField | Bilingual |
| description_en, description_ar | TextField | Bilingual |
| responsibilities_en, responsibilities_ar | TextField | Bilingual |
| requirements_en, requirements_ar | TextField | Bilingual |
| preferred_qualifications_en, preferred_qualifications_ar | TextField | Bilingual |
| benefits_en, benefits_ar | TextField | Bilingual |
| application_method | CharField(32) | external_url, email, contact_page |
| external_apply_url | URLField | Required if application_method=external_url |
| application_email | EmailField | Required if application_method=email |
| posted_date | DateField | default=now |
| closing_date | DateField | null=True, blank=evergreen |
| display_order | PositiveIntegerField | |
| is_featured | BooleanField | |
| is_active | BooleanField | |
| show_on_homepage | BooleanField | |
| seo_title_en, seo_title_ar | CharField(255) | Bilingual |
| seo_description_en, seo_description_ar | TextField | Bilingual |
| created_at, updated_at | DateTimeField | read-only |

## Validation

`Job.clean()` enforces:
- `external_apply_url` required when `application_method=external_url`
- `application_email` required when `application_method=email`

## Public Endpoint

`GET /api/v1/jobs/` → active, non-expired jobs (`Job.public_qs()`), filter by employment_type, workplace_type, experience_level, department, is_featured, show_on_homepage  
`GET /api/v1/jobs/<slug>/` → single active, non-expired job

## Admin API Recommendation

```
GET    /api/v1/cms/careers/           → paginated list (ALL jobs, including inactive/expired)
POST   /api/v1/cms/careers/           → create
GET    /api/v1/cms/careers/<id>/      → retrieve
PUT    /api/v1/cms/careers/<id>/      → update
PATCH  /api/v1/cms/careers/<id>/      → partial update
DELETE /api/v1/cms/careers/<id>/      → hard delete
```

**Required capability:** `careers.view`, `careers.create`, `careers.update`, `careers.delete`

**Lifecycle actions:** No dedicated workflow endpoints needed — `is_active` toggle and `closing_date` management via normal PATCH. The public queryset automatically excludes expired jobs.

---

# Contact Leads Admin API

## Models

**File:** `backend/apps/contact/models.py`

### InquiryType

| Field | Type | Notes |
|-------|------|-------|
| name_en, name_ar | CharField(120) | Bilingual |
| slug | SlugField(120) | unique=True |
| description_en, description_ar | TextField | Bilingual |
| recipient_email | EmailField | Internal override |
| order | PositiveIntegerField | |
| is_active | BooleanField | |
| created_at, updated_at | DateTimeField | read-only |

### ContactSubmission

| Field | Type | Notes |
|-------|------|-------|
| public_id | UUIDField | editable=False, unique |
| full_name | CharField(255) | |
| email | EmailField | |
| phone | CharField(40) | |
| company | CharField(255) | |
| job_title | CharField(120) | |
| inquiry_type | FK → InquiryType | SET_NULL |
| related_service | FK → Service | SET_NULL |
| subject | CharField(255) | |
| message | TextField | |
| preferred_contact_method | CharField(16) | email, phone, whatsapp, any |
| privacy_consent | BooleanField | |
| source_page | CharField(512) | |
| language | CharField(10) | |
| status | CharField(16) | new, contacted, in_progress, closed, spam, archived |
| priority | CharField(16) | low, normal, high, urgent |
| assigned_to | FK → User | SET_NULL |
| internal_notes | TextField | |
| email_delivery_status | CharField(16) | pending, sent, failed, not_configured |
| email_attempted_at | DateTimeField | |
| email_sent_at | DateTimeField | |
| email_error_summary | TextField | |
| recipient_email_used | EmailField | |
| ip_address | GenericIPAddressField | |
| user_agent | TextField | |
| contacted_at | DateTimeField | Auto-set on status transition |
| closed_at | DateTimeField | Auto-set on status transition |
| created_at, updated_at | DateTimeField | read-only |

## Existing Lead-Management Fields

The model **already has** all required lead-management fields:
- ✅ Status (new, contacted, in_progress, closed, spam, archived)
- ✅ Priority (low, normal, high, urgent)
- ✅ Assignment (assigned_to FK → User)
- ✅ Internal notes
- ✅ Workflow timestamps (contacted_at, closed_at — auto-managed in `save()`)
- ✅ Email delivery audit

**No migrations needed.** The model is complete for lead management.

## Public Endpoint

`GET /api/v1/contact/inquiry-types/` → active inquiry types  
`POST /api/v1/contact/submissions/` → public submission (throttled 5/min)

## Public Serializer Protections

`ContactSubmissionCreateSerializer` only accepts: full_name, email, phone, company, job_title, inquiry_type, related_service, subject, message, preferred_contact_method, privacy_consent, source_page, language, website (honeypot).  
**Does NOT accept:** status, priority, assigned_to, internal_notes, email_delivery_status, etc. (validated in E2E validation — internal field injection blocked).

## Admin API Recommendation

### InquiryType CRUD

```
GET    /api/v1/cms/contact/inquiry-types/        → list
POST   /api/v1/cms/contact/inquiry-types/        → create
GET    /api/v1/cms/contact/inquiry-types/<id>/   → retrieve
PUT    /api/v1/cms/contact/inquiry-types/<id>/   → update
DELETE /api/v1/cms/contact/inquiry-types/<id>/   → hard delete
```

### ContactSubmission Management

```
GET    /api/v1/cms/contact/submissions/          → paginated list (filter by status, inquiry_type, assigned_to, date)
GET    /api/v1/cms/contact/submissions/<id>/     → retrieve (full detail including internal fields)
PATCH  /api/v1/cms/contact/submissions/<id>/     → update status, priority, assigned_to, internal_notes
DELETE /api/v1/cms/contact/submissions/<id>/     → hard delete (spam cleanup)
```

**No POST (create)** — submissions are created only via public endpoint.

**Required capability:** `contact.view` (GET), `contact.update` (PATCH), `contact.assign` (assign), `contact.export` (export), `contact.delete` (admin only)

## Sensitive Data

Contact submissions contain PII (name, email, phone, company). Admin serializers must:
- Expose all fields to authorized CMS users only
- Never expose `ip_address` or `user_agent` in list view (only in detail)
- Log status changes and assignments via `log_content_action()`

## Database Indexes

Already optimized: `contact_status_created_idx`, `contact_type_status_idx`, `contact_email_created_idx`, `contact_delivery_created_idx`.

---

# Media Library Dependency

## MediaAsset Model

**File:** `backend/apps/media_library/models.py`  
**Model:** `MediaAsset(TimeStampedModel)`

| Field | Type | Notes |
|-------|------|-------|
| title | CharField(255) | |
| file | FileField | upload_to=media_file_path (UUID-based) |
| alt_text | CharField(255) | |
| media_type | CharField(32) | image, document, video, audio, other |
| usage_context | CharField(120) | |
| is_active | BooleanField | |
| created_at, updated_at | DateTimeField | read-only |

## Current Upload Mechanism

No API endpoint exists for uploading media. Upload is only via Django Admin. No serializers or views are defined in the media_library app (only `admin.py`).

## Content Models Referencing MediaAsset

| Model | Field(s) | FK Behavior |
|-------|----------|-------------|
| SiteSetting | default_og_image, primary_logo, secondary_logo, favicon | SET_NULL |
| NavigationItem | icon_asset | SET_NULL |
| Partner | logo | SET_NULL |
| Service | icon, featured_image | SET_NULL |
| CaseStudy | featured_image, logo | SET_NULL |
| Article | featured_image | SET_NULL |

## Admin API Media Handling

**Admin APIs can safely accept existing media IDs** before the full Media Library CMS phase. The admin serializers should:
- Accept `media_asset_id` (integer) for write operations
- Return `{id, url, alt_text}` for read operations
- Validate that the MediaAsset exists and `is_active=True`
- Set FK to `None` if `media_asset_id` is null or missing

**What must be deferred to `MEDIA-LIBRARY-CMS-001`:**
- File upload endpoint
- Media library browser/list API
- Media asset CRUD API
- Bulk media operations
- Image transformation/resize

**The Admin API Foundation must NOT duplicate the future Media Library implementation.** It should only reference existing MediaAsset IDs.

---

# Deletion Strategy

| Model | Strategy | Rationale |
|-------|----------|-----------|
| SiteSetting | **No delete** | Singleton — only update |
| NavigationMenu | **Hard delete** | CASCADE to items; items are managed content |
| NavigationItem | **Hard delete** | No external references; CASCADE children |
| Partner | **Hard delete** | Referenced by CaseStudy.partner (SET_NULL); CaseStudy retains client_name |
| Service | **Hard delete** | Referenced by CaseStudy M2M (removed from M2M); ContactSubmission FK (SET_NULL) |
| CaseStudy | **Hard delete** | No inbound references; public URL may 404 (acceptable) |
| Article | **Hard delete** | No inbound references; public URL may 404 (acceptable) |
| Job | **Hard delete** | No inbound references; public URL may 404 (acceptable) |
| InquiryType | **Hard delete** | Referenced by ContactSubmission FK (SET_NULL); submissions retain data |
| ContactSubmission | **Hard delete** | No inbound references; used for spam cleanup |

**No soft-delete system is introduced.** Hard delete is safe because:
1. All FK references use `SET_NULL` or `CASCADE` (no `PROTECT`)
2. Activity logs record the delete action with `object_repr` for audit trail
3. Activity log `user` FK uses `SET_NULL` so deleting a user doesn't cascade
4. Public URLs returning 404 after deletion is acceptable (SEO impact is minimal for CMS-managed content)

**Delete permission:** Only roles with `delete` action on the module. Editor role (no delete) cannot delete. All deletes must be logged via `log_content_action(action='delete', ...)`.

---

# Recommended API Namespace

## Recommended Structure

```
/api/v1/cms/dashboard/                        → GET dashboard aggregates
/api/v1/cms/site-settings/                    → GET/PUT singleton settings
/api/v1/cms/navigation/menus/                 → CRUD menus
/api/v1/cms/navigation/menus/<id>/            → CRUD single menu
/api/v1/cms/navigation/items/                 → CRUD items
/api/v1/cms/navigation/items/<id>/            → CRUD single item
/api/v1/cms/navigation/items/reorder/         → POST bulk reorder
/api/v1/cms/partners/                         → CRUD partners
/api/v1/cms/partners/<id>/                    → CRUD single partner
/api/v1/cms/services/                         → CRUD services
/api/v1/cms/services/<id>/                    → CRUD single service
/api/v1/cms/case-studies/                     → CRUD case studies
/api/v1/cms/case-studies/<id>/                → CRUD single case study
/api/v1/cms/insights/                         → CRUD articles
/api/v1/cms/insights/<id>/                    → CRUD single article
/api/v1/cms/insights/<id>/publish/            → POST publish action
/api/v1/cms/insights/<id>/unpublish/          → POST unpublish action
/api/v1/cms/insights/<id>/archive/            → POST archive action
/api/v1/cms/insights/<id>/restore/            → POST restore action
/api/v1/cms/careers/                          → CRUD jobs
/api/v1/cms/careers/<id>/                     → CRUD single job
/api/v1/cms/contact/inquiry-types/            → CRUD inquiry types
/api/v1/cms/contact/inquiry-types/<id>/       → CRUD single inquiry type
/api/v1/cms/contact/submissions/              → GET/PATCH submissions
/api/v1/cms/contact/submissions/<id>/         → GET/PATCH/DELETE single submission
```

## Rationale for `/api/v1/cms/` vs `/api/v1/admin/`

The existing `/api/v1/admin/` namespace has `dashboard/access/` and `activity-logs/`. Two options:

1. **Use `/api/v1/cms/` for all new module Admin APIs** and keep `/api/v1/admin/` for dashboard/access + activity-logs (existing). This avoids breaking existing frontend code.
2. **Use `/api/v1/admin/` for everything** and add module endpoints under it.

**Recommendation:** Use `/api/v1/cms/` for new module APIs. Keep `/api/v1/admin/` for existing `dashboard/access/` and `activity-logs/`. This preserves backward compatibility with the existing frontend `activityLogsApi.js` and `authApi.js`.

## Public API Routes

**Must remain unchanged.** All public routes stay at their current paths (`/api/v1/partners/`, `/api/v1/services/`, etc.).

---

# Serializer Architecture

## Serializer Separation Strategy

| Layer | Purpose | Naming Convention |
|-------|---------|-------------------|
| Public read | Frontend website | `<Model>Serializer` (existing) |
| CMS list | Dashboard table rows | `CMS<Model>ListSerializer` |
| CMS detail | Detail/edit form | `CMS<Model>DetailSerializer` |
| CMS create/update | Write operations | `CMS<Model>WriteSerializer` |

## Fields That Must Never Be Writable

- `id` — auto-generated PK
- `created_at`, `updated_at` — auto-managed by `TimeStampedModel`
- `public_id` (ContactSubmission) — UUID, `editable=False`
- `ip_address`, `user_agent` (ContactSubmission) — set by public view only
- `email_delivery_status`, `email_attempted_at`, `email_sent_at`, `email_error_summary`, `recipient_email_used` — system-managed by email service
- `contacted_at`, `closed_at` — auto-managed by model `save()`
- `is_active` on SiteSetting — managed via singleton logic

## Per-Module Serializer Plan

### Site Settings
- `CMSSiteSettingSerializer` — all fields, media FKs as ID (write) + URL (read)

### Navigation
- `CMSNavigationMenuSerializer` — all fields
- `CMSNavigationItemSerializer` — all fields, `icon_asset_id` (write), nested icon_asset URL (read)
- `CMSNavigationItemReorderSerializer` — validates `[{id, order}, ...]`

### Partners
- `CMSPartnerListSerializer` — id, slug, name_en, name_ar, partner_type, is_active, is_featured, display_order, logo_url
- `CMSPartnerDetailSerializer` — all fields including description, website_url, open_in_new_tab
- `CMSPartnerWriteSerializer` — all editable fields, `logo_id` as FK

### Services
- `CMSServiceListSerializer` — id, slug, name_en, name_ar, is_active, is_featured, show_on_homepage, display_order
- `CMSServiceDetailSerializer` — all fields
- `CMSServiceWriteSerializer` — all editable fields, `icon_id`, `featured_image_id` as FKs

### Case Studies
- `CMSCaseStudyListSerializer` — id, slug, title_en, title_ar, is_active, is_featured, show_on_homepage, display_order, partner_name
- `CMSCaseStudyDetailSerializer` — all fields including problem/solution/technology/outcome
- `CMSCaseStudyWriteSerializer` — all editable fields, `featured_image_id`, `logo_id`, `partner_id`, `services_ids`

### Insights
- `CMSArticleListSerializer` — id, slug, title_en, title_ar, status, content_type, published_at, is_featured, display_order
- `CMSArticleDetailSerializer` — all fields
- `CMSArticleWriteSerializer` — all editable fields, `featured_image_id` as FK

### Careers
- `CMSJobListSerializer` — id, slug, title_en, title_ar, is_active, is_featured, employment_type, workplace_type, closing_date
- `CMSJobDetailSerializer` — all fields
- `CMSJobWriteSerializer` — all editable fields

### Contact
- `CMSInquiryTypeSerializer` — all fields
- `CMSContactSubmissionListSerializer` — id, public_id, full_name, email, status, priority, inquiry_type_name, created_at, assigned_to_name
- `CMSContactSubmissionDetailSerializer` — all fields including internal_notes, email audit, ip_address, user_agent
- `CMSContactSubmissionUpdateSerializer` — status, priority, assigned_to_id, internal_notes only

---

# Validation and Error Contract

## Current State

- DRF default validation errors: `{'field_name': ['error message']}` with HTTP 400
- Auth errors: `{'detail': 'message'}` with HTTP 401/403
- No custom error envelope

## Recommended Admin API Error Format

Keep DRF defaults. Do not introduce a custom error envelope to avoid refactoring public APIs.

| Scenario | HTTP Status | Response Body |
|----------|-------------|---------------|
| Field validation error | 400 | `{'field': ['message'], ...}` (DRF default) |
| Authentication failure | 401 | `{'detail': 'Authentication credentials were not provided.'}` (DRF default) |
| Permission denied | 403 | `{'detail': 'You do not have permission to perform this action.'}` (DRF default) |
| Not found | 404 | `{'detail': 'Not found.'}` (DRF default) |
| Conflict (duplicate slug) | 400 | `{'slug': ['This slug already exists.']}` (DRF default via unique validator) |
| Throttling | 429 | `{'detail': 'Request was throttled.'}` (DRF default) |
| Invalid workflow transition | 400 | `{'detail': 'Cannot publish an archived article. Restore it first.'}` |
| Method not allowed | 405 | `{'detail': 'Method "..." not allowed.'}` (DRF default) |

---

# Pagination Search Filtering and Ordering

## django-filter

**Not installed.** `requirements.txt` does not include `django-filter`. No `FilterSet` classes exist.

**Recommendation:** Do NOT install `django-filter`. Continue using manual query param filtering (consistent with existing public views and activity logs). This avoids a new dependency and keeps the pattern uniform.

## Per-Module Requirements

| Module | Search Fields | Filter Fields | Order Fields |
|--------|--------------|---------------|--------------|
| Site Settings | — | — | — (singleton) |
| Navigation Menus | name, slug | location, is_active | order, name |
| Navigation Items | label_en | menu, parent, is_visible, link_type | order |
| Partners | name_en, name_ar, slug | partner_type, is_active, is_featured | display_order, name_en, created_at |
| Services | name_en, name_ar, slug | is_active, is_featured, show_on_homepage | display_order, name_en, created_at |
| Case Studies | title_en, title_ar, slug | is_active, is_featured, show_on_homepage, partner, industry | display_order, title_en, created_at |
| Insights | title_en, title_ar, slug, category_en | status, content_type, is_featured, show_on_homepage | display_order, published_at, created_at |
| Careers | title_en, title_ar, slug, department_en | is_active, is_featured, employment_type, workplace_type, experience_level, closing_date | display_order, posted_date, created_at |
| Contact Inquiry Types | name_en, slug | is_active | order, name_en |
| Contact Submissions | full_name, email, phone, company, subject | status, priority, inquiry_type, assigned_to, created_at range | created_at, priority |

## Pagination

Use `StandardResultsSetPagination` (extract from `activity_logs/views.py` to a shared module):
- `page_size = 20`
- `page_size_query_param = 'page_size'`
- `max_page_size = 100`

---

# Reordering and Transaction Safety

## Ordering Fields

| Model | Field | Unique Constraint | Duplicates Permitted |
|-------|-------|-------------------|---------------------|
| NavigationMenu | `order` | None | ✅ Yes |
| NavigationItem | `order` | None | ✅ Yes |
| Partner | `display_order` | None | ✅ Yes |
| Service | `display_order` | None | ✅ Yes |
| CaseStudy | `display_order` | None | ✅ Yes |
| Article | `display_order` | None | ✅ Yes |
| Job | `display_order` | None | ✅ Yes |
| InquiryType | `order` | None | ✅ Yes |

**Duplicate order values are currently permitted** on all models. Ordering is applied via `.order_by('display_order', 'name_en')` (or similar secondary sort), so duplicates do not cause issues.

## Reorder Recommendations

1. **Navigation items:** Bulk reorder endpoint `POST /api/v1/cms/navigation/items/reorder/` accepting `[{id, order}, ...]`. Must:
   - Validate all items belong to the same menu
   - Validate all IDs exist
   - Use `transaction.atomic()` to update all orders
   - Log as a single `update` action

2. **Other models (Partners, Services, Case Studies, Articles, Jobs):** Reordering can be done via individual PATCH requests updating `display_order`. A bulk reorder endpoint is optional but recommended for UX.

3. **Cross-parent navigation items:** Reject items from a different menu in the reorder payload.

4. **Invalid IDs:** Return 400 with `{'invalid_ids': [1, 2, 3]}` if any IDs in the reorder payload don't exist or don't belong to the specified menu.

---

# Frontend CMS Integration Contract

## CMS Route Files

**File:** `src/App.jsx`

| Route | Component | Protected |
|-------|-----------|-----------|
| `/cms/login` | `CMSLoginPage` | No |
| `/cms` | `CMSDashboardPage` | Yes (AuthProvider + ProtectedRoute) |
| `/cms/activity-logs` | `CMSActivityLogsPage` | Yes (AuthProvider + ProtectedRoute) |

## Auth Provider/Context

**File:** `src/contexts/AuthContext.jsx`

Provides: `user`, `isAuthenticated`, `isLoading`, `error`, `login()`, `logout()`, `refreshUser()`, `hasCapability(cap)`, `hasModuleAccess(module)`

## API Client

**File:** `src/services/apiClient.js` — `apiFetch()` with timeout, `ApiError` class  
**File:** `src/services/authApi.js` — `fetchCsrf()`, `login()`, `logout()`, `getCurrentUser()`, `checkDashboardAccess()` — uses `credentials: 'include'`

**Note:** `apiClient.js` does NOT set `credentials: 'include'`. Admin API service files must either:
1. Use `authFetch()` from `authApi.js` (already has `credentials: 'include'` + CSRF)
2. Or create a new `cmsApiFetch()` that wraps `apiFetch` with credentials and CSRF

## CSRF Handling

`authApi.js` reads `csrftoken` from cookie and sends `X-CSRFToken` header on POST/PUT/PATCH/DELETE.

## Capability/Module Visibility

- `hasCapability('module.action')` — checks `user.capabilities` array
- `hasModuleAccess('module')` — checks `user.permitted_modules` array
- Superuser bypasses all checks (returns `true`)

## Existing Dashboard Components

- `CMSDashboardPage.jsx` — user identity, modules, capabilities, recent activity widget
- `RecentActivityWidget.jsx` — fetches latest 5 activity logs
- `CMSActivityLogsPage.jsx` — full activity log browser with filters

## Backend Response Contract for Frontend

Admin API responses should follow the existing patterns:
- **List:** `{count, next, previous, results: [...]}` (DRF pagination default)
- **Detail:** Flat object with field names matching model fields (not nested bilingual like public APIs)
- **CMS serializers should return flat `*_en` and `*_ar` fields** (not `{'en': ..., 'ar': ...}` objects) because the CMS UI needs to edit both languages separately
- **Media fields:** Return `{id, url, alt_text}` for reads; accept `media_id` (integer) for writes

---

# Security Requirements

## Session Authentication

- ✅ `SessionAuthentication` only — no token auth
- ✅ Session cookies: `HttpOnly=True`, `SameSite='Lax'`
- ✅ No tokens in localStorage

## CSRF

- ✅ Login/Logout: `@method_decorator(csrf_protect, name='dispatch')`
- ✅ All authenticated unsafe methods: DRF `SessionAuthentication` enforces CSRF
- ✅ Frontend sends `X-CSRFToken` header from cookie

## RBAC

- ✅ Every Admin API view must use `IsCMSUser` + `HasModulePermission`
- ✅ `cms_module` and `cms_action` view attributes required
- ✅ Superuser bypasses all checks
- ✅ Inactive users rejected at login and at permission check level

## Object-Level Access

- Not currently implemented (no object-level permissions)
- **Not needed for Admin API Foundation** — all CMS users with module access can manage all records in that module
- Future: May need object-level restrictions for contact lead assignment

## Mass Assignment Prevention

- ✅ Admin serializers must explicitly declare `fields` list
- ✅ Read-only fields: `id`, `created_at`, `updated_at`, `public_id`
- ✅ Contact submission: `ip_address`, `user_agent`, email audit fields must be read-only in admin serializer
- ✅ Validated in E2E: internal field injection on contact submissions blocked

## Internal-Field Injection

- ✅ Public `ContactSubmissionCreateSerializer` rejects `status`, `priority`, `assigned_to`, `internal_notes`
- Admin serializer must allow these fields but ONLY for authorized CMS users

## Sensitive Contact Data

- Contact submissions contain PII
- Admin list view: show name, email, status only (not phone, ip, user_agent)
- Admin detail view: show all fields (authorized users only)
- Never expose `recipient_email_used` or `email_error_summary` in public APIs

## Cross-Origin Credential Handling

- ✅ `CORS_ALLOWED_ORIGINS` restricted to `localhost:5174`, `127.0.0.1:5174`
- ✅ `CORS_ALLOW_CREDENTIALS = True`
- ✅ `CSRF_TRUSTED_ORIGINS` restricted to same origins
- ✅ No wildcard origins

## Rate Limiting

- ✅ Login: 5/min (`cms_login` scope)
- ✅ Contact submission: 5/min (`contact_submission` scope)
- ✅ Anon: 100/hour
- **Admin API:** No additional throttle needed (authenticated users, low volume)

## File/Media References

- Admin APIs accept `media_id` (integer) — must validate `MediaAsset.objects.filter(pk=id, is_active=True).exists()`
- No file upload in Admin API Foundation (deferred to MEDIA-LIBRARY-CMS-001)

## Destructive Actions

- All deletes must be logged via `log_content_action(action='delete', ...)`
- Delete permission enforced by `HasModulePermission` with `cms_action='delete'`
- Hard delete only (no soft delete) — see Deletion Strategy

## Activity Log Integrity

- ✅ Append-only enforced at API level (POST/PATCH/DELETE → 405)
- ✅ Metadata sanitized (no sensitive keys)
- ✅ All admin mutations must call `log_content_action()`
- ✅ Actor tracked via `request.user`

---

# Database and Migration Impact

## Verdict: `NO MIGRATIONS REQUIRED`

All models already contain the fields needed for CMS management:

- ✅ Bilingual fields (`*_en`, `*_ar`) on all content models
- ✅ Status fields (Article.status, ContactSubmission.status)
- ✅ Ordering fields (`display_order`, `order`) on all content models
- ✅ Visibility fields (`is_active`, `is_featured`, `show_on_homepage`)
- ✅ SEO fields on Services, Case Studies, Articles, Jobs
- ✅ Contact submission workflow fields (status, priority, assigned_to, internal_notes, email audit)
- ✅ Navigation item validation (clean() method)
- ✅ Job validation (clean() method)
- ✅ Database indexes on all filterable fields

The Admin API Foundation is purely a new API layer (serializers, views, URLs) on top of existing models. No schema changes are needed.

---

# Risks and Blockers

## No Blockers

The architecture is fully ready for the Admin API Foundation. No corrective foundation work is required.

## Low-Risk Items

1. **`apiClient.js` missing `credentials: 'include'`** — Admin API frontend services must use a credential-aware fetch wrapper. The existing `authFetch()` in `authApi.js` can be extracted to a shared module or a new `cmsApi.js` service.

2. **No `django-filter`** — Manual filtering must be implemented in each admin view's `get_queryset()`. This is consistent with existing patterns but requires more boilerplate.

3. **Public APIs return unpaginated arrays** — Admin APIs must add pagination. The `StandardResultsSetPagination` class exists in `activity_logs/views.py` and should be extracted to a shared location.

4. **Bilingual serializer format mismatch** — Public serializers return `{'en': ..., 'ar': ...}` objects. CMS serializers should return flat `*_en` and `*_ar` fields for form editing. This is a deliberate difference, not a bug.

5. **`media_library` app has no API** — Admin APIs can only reference existing MediaAsset IDs. No upload capability in this phase. CMS users must upload media via Django Admin first.

6. **No existing admin URL namespace for modules** — `apps/accounts/admin_urls.py` only has `dashboard/access/`. New module admin URLs need to be registered. Decision: use `/api/v1/cms/` prefix for module APIs, keep `/api/v1/admin/` for existing endpoints.

---

# Exact Implementation File Plan

## Shared Utilities

| File | Action | Purpose |
|------|--------|---------|
| `backend/apps/core/pagination.py` | **CREATE** | Extract `StandardResultsSetPagination` to shared module |
| `backend/apps/core/permissions.py` | **CREATE** | Shared CMS permission mixins (optional, or reuse `accounts.permissions`) |
| `backend/apps/core/admin_serializers.py` | **CREATE** | Shared `MediaAssetReferenceSerializer` for media FK representation |

## URL Configuration

| File | Action | Purpose |
|------|--------|---------|
| `backend/config/urls.py` | **MODIFY** | Add `path('api/v1/cms/', include('apps.core.cms_urls'))` |
| `backend/apps/core/cms_urls.py` | **CREATE** | Central CMS URL router that includes all module CMS URLs |

## Per-App Admin API Files

### Site Settings

| File | Action | Purpose |
|------|--------|---------|
| `backend/apps/site_settings/cms_serializers.py` | **CREATE** | `CMSSiteSettingSerializer` |
| `backend/apps/site_settings/cms_views.py` | **CREATE** | `CMSSiteSettingView` (GET/PUT singleton) |
| `backend/apps/site_settings/cms_urls.py` | **CREATE** | URL patterns for `site-settings/` |

### Navigation

| File | Action | Purpose |
|------|--------|---------|
| `backend/apps/navigation/cms_serializers.py` | **CREATE** | `CMSNavigationMenuSerializer`, `CMSNavigationItemSerializer`, `CMSNavigationItemReorderSerializer` |
| `backend/apps/navigation/cms_views.py` | **CREATE** | Menu CRUD, Item CRUD, Reorder endpoint |
| `backend/apps/navigation/cms_urls.py` | **CREATE** | URL patterns for `navigation/` |

### Partners

| File | Action | Purpose |
|------|--------|---------|
| `backend/apps/partners/cms_serializers.py` | **CREATE** | `CMSPartnerListSerializer`, `CMSPartnerDetailSerializer`, `CMSPartnerWriteSerializer` |
| `backend/apps/partners/cms_views.py` | **CREATE** | Partner CRUD ViewSet |
| `backend/apps/partners/cms_urls.py` | **CREATE** | URL patterns for `partners/` |

### Services

| File | Action | Purpose |
|------|--------|---------|
| `backend/apps/services/cms_serializers.py` | **CREATE** | `CMSServiceListSerializer`, `CMSServiceDetailSerializer`, `CMSServiceWriteSerializer` |
| `backend/apps/services/cms_views.py` | **CREATE** | Service CRUD ViewSet |
| `backend/apps/services/cms_urls.py` | **CREATE** | URL patterns for `services/` |

### Case Studies

| File | Action | Purpose |
|------|--------|---------|
| `backend/apps/case_studies/cms_serializers.py` | **CREATE** | `CMSCaseStudyListSerializer`, `CMSCaseStudyDetailSerializer`, `CMSCaseStudyWriteSerializer` |
| `backend/apps/case_studies/cms_views.py` | **CREATE** | CaseStudy CRUD ViewSet |
| `backend/apps/case_studies/cms_urls.py` | **CREATE** | URL patterns for `case-studies/` |

### Insights

| File | Action | Purpose |
|------|--------|---------|
| `backend/apps/insights/cms_serializers.py` | **CREATE** | `CMSArticleListSerializer`, `CMSArticleDetailSerializer`, `CMSArticleWriteSerializer` |
| `backend/apps/insights/cms_views.py` | **CREATE** | Article CRUD ViewSet + publish/unpublish/archive/restore actions |
| `backend/apps/insights/cms_urls.py` | **CREATE** | URL patterns for `insights/` |

### Careers

| File | Action | Purpose |
|------|--------|---------|
| `backend/apps/careers/cms_serializers.py` | **CREATE** | `CMSJobListSerializer`, `CMSJobDetailSerializer`, `CMSJobWriteSerializer` |
| `backend/apps/careers/cms_views.py` | **CREATE** | Job CRUD ViewSet |
| `backend/apps/careers/cms_urls.py` | **CREATE** | URL patterns for `careers/` |

### Contact

| File | Action | Purpose |
|------|--------|---------|
| `backend/apps/contact/cms_serializers.py` | **CREATE** | `CMSInquiryTypeSerializer`, `CMSContactSubmissionListSerializer`, `CMSContactSubmissionDetailSerializer`, `CMSContactSubmissionUpdateSerializer` |
| `backend/apps/contact/cms_views.py` | **CREATE** | InquiryType CRUD, Submission list/detail/update/delete |
| `backend/apps/contact/cms_urls.py` | **CREATE** | URL patterns for `contact/` |

### Dashboard

| File | Action | Purpose |
|------|--------|---------|
| `backend/apps/accounts/cms_dashboard_views.py` | **CREATE** | `CMSDashboardView` — aggregated counts and recent data |
| `backend/apps/accounts/cms_urls.py` | **CREATE** | URL pattern for `dashboard/` |

## Files NOT Modified

| File | Action |
|------|--------|
| `backend/apps/*/models.py` | **DO NOT MODIFY** |
| `backend/apps/*/admin.py` | **DO NOT MODIFY** |
| `backend/apps/*/views.py` (public) | **DO NOT MODIFY** |
| `backend/apps/*/serializers.py` (public) | **DO NOT MODIFY** |
| `backend/apps/*/urls.py` (public) | **DO NOT MODIFY** |
| `backend/apps/accounts/roles.py` | **DO NOT MODIFY** |
| `backend/apps/accounts/permissions.py` | **DO NOT MODIFY** |
| `backend/apps/activity_logs/services.py` | **DO NOT MODIFY** (use as-is) |
| `backend/config/settings.py` | **DO NOT MODIFY** |
| All frontend files | **DO NOT MODIFY** (frontend integration is a later phase) |

## Validation

| File | Action | Purpose |
|------|--------|---------|
| `backend/validation_admin_api.py` | **CREATE** | Lightweight validation script (temporary, cleaned up after) |

---

# Recommended Implementation Sequence

1. **Shared CMS API utilities** — Extract `StandardResultsSetPagination` to `apps/core/pagination.py`. Create `MediaAssetReferenceSerializer` in `apps/core/admin_serializers.py`.

2. **CMS URL router** — Create `apps/core/cms_urls.py` that includes all module CMS URLs. Add to `config/urls.py`.

3. **Dashboard API** — Create `CMSDashboardView` with aggregated counts. Register at `/api/v1/cms/dashboard/`.

4. **Site Settings Admin API** — Singleton GET/PUT. Simplest CRUD module to establish patterns.

5. **Partners Admin API** — Full CRUD. Establishes the pattern for ordered, bilingual content with media FK.

6. **Services Admin API** — Full CRUD. Similar to Partners but with two media FKs (icon + featured_image).

7. **Case Studies Admin API** — Full CRUD. Tests M2M (services) and FK (partner) relationships.

8. **Insights Admin API** — Full CRUD + workflow actions (publish/unpublish/archive/restore). Most complex module.

9. **Careers Admin API** — Full CRUD. Has model-level validation (application_method).

10. **Navigation Admin API** — Menu CRUD + Item CRUD + Reorder. Most complex due to hierarchy and reorder.

11. **Contact Inquiry Types Admin API** — Simple CRUD.

12. **Contact Submissions Admin API** — List/detail/update/delete. No create. Has sensitive data handling.

13. **Activity logging integration** — Add `log_content_action()` calls to all mutation views.

14. **Lightweight validation** — Run validation script to verify all endpoints, permissions, and logging.

15. **Documentation** — Update project memory with implementation report.

---

# Lightweight Validation Plan

After implementation, run a validation script that:

1. **Authentication:** Verify all CMS endpoints return 401 without session, 403 without module permission
2. **RBAC:** Verify each role gets correct access (e.g., editor cannot delete, recruiter cannot access insights)
3. **CRUD:** Create, read, update, delete a test record for each module
4. **Workflow:** Test publish/unpublish/archive/restore for insights
5. **Reorder:** Test navigation item reorder with valid and invalid IDs
6. **Activity logging:** Verify `create`, `update`, `delete`, `publish` actions are logged
7. **Mass assignment:** Verify internal fields cannot be injected via public endpoints
8. **Pagination:** Verify page_size parameter and max_page_size enforcement
9. **Filtering:** Verify search and filter parameters work
10. **Media references:** Verify media FK accepts integer ID and returns URL
11. **Cleanup:** Remove all temporary test data

**Method:** Use Django test client with `override_settings` for throttle bypass (same approach as `validation_e2e_fast.py`).

---

# Final Recommendation

The SidrahSoft backend is architecturally ready for the Custom CMS Admin API Foundation. All models, RBAC, authentication, activity logging, and security infrastructure are in place. No migrations are required. The implementation should follow the recommended sequence, creating `cms_*.py` files in each app to maintain clean separation from public APIs.

**Verdict:** `READY FOR CUSTOM-CMS-ADMIN-API-FOUNDATION-001`

---

## Confirmation

- **No source code was modified** during this investigation.
- **No database data was modified** during this investigation.
- **No packages were installed.**
- **No migrations were created or run.**
- **No frontend files were modified.**
- Only read-only inspection commands (`manage.py check`, `manage.py showmigrations`) and file reads were performed.
