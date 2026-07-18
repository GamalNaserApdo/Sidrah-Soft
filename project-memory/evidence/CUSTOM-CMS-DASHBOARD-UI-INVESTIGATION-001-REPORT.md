# CUSTOM-CMS-DASHBOARD-UI-INVESTIGATION-001 — Investigation Report

**Task:** CUSTOM-CMS-DASHBOARD-UI-INVESTIGATION-001  
**Date:** 2026-07-11  
**Type:** Read-only investigation (no code or data modified)  
**Objective:** Create an exact implementation blueprint for CUSTOM-CMS-DASHBOARD-UI-001

---

## Table of Contents

1. [Current CMS Routes](#1-current-cms-routes)
2. [CMS Layout Architecture](#2-cms-layout-architecture)
3. [Authentication Frontend](#3-authentication-frontend)
4. [RBAC and Capability Visibility](#4-rbac-and-capability-visibility)
5. [Dashboard API Contract](#5-dashboard-api-contract)
6. [Existing Dashboard UI](#6-existing-dashboard-ui)
7. [Admin API Inventory](#7-admin-api-inventory)
8. [Response and Pagination Contracts](#8-response-and-pagination-contracts)
9. [Shared CMS Frontend Components](#9-shared-cms-frontend-components)
10. [Styling and Design System](#10-styling-and-design-system)
11. [Internationalization and RTL](#11-internationalization-and-rtl)
12. [Site Settings UI Requirements](#12-site-settings-ui-requirements)
13. [Navigation Management UI](#13-navigation-management-ui)
14. [Partners Management UI](#14-partners-management-ui)
15. [Services Management UI](#15-services-management-ui)
16. [Case Studies Management UI](#16-case-studies-management-ui)
17. [Insights Management UI](#17-insights-management-ui)
18. [Careers Management UI](#18-careers-management-ui)
19. [Contact Management UI](#19-contact-management-ui)
20. [Activity Logs UI](#20-activity-logs-ui)
21. [Media Library Integration](#21-media-library-integration)
22. [Form Architecture](#22-form-architecture)
23. [Data Listing Architecture](#23-data-listing-architecture)
24. [Mutation Feedback](#24-mutation-feedback)
25. [Delete and Confirmation UX](#25-delete-and-confirmation-ux)
26. [Workflow UX](#26-workflow-ux)
27. [Route Architecture](#27-route-architecture)
28. [Frontend File Plan](#28-frontend-file-plan)
29. [Backend Change Assessment](#29-backend-change-assessment)
30. [User Management Boundary](#30-user-management-boundary)
31. [Rich Text Editor Decision](#31-rich-text-editor-decision)
32. [Performance](#32-performance)
33. [Accessibility](#33-accessibility)
34. [Security](#34-security)
35. [Implementation Sequence](#35-implementation-sequence)
36. [Validation Plan](#36-validation-plan)
37. [Verdict and Summary](#37-verdict-and-summary)

---

## 1. Current CMS Routes

### Frontend Routes (React Router)

Defined in `@/f:/What_i_Made/New/sidrah_web/src/App.jsx`:

| Route | Component | Auth | Purpose |
|-------|-----------|------|---------|
| `/cms/login` | `CMSLoginPage` | Public | Login form |
| `/cms` | `CMSDashboardPage` | `AuthProvider` + `ProtectedRoute` | Dashboard home |
| `/cms/activity-logs` | `CMSActivityLogsPage` | `AuthProvider` + `ProtectedRoute` | Activity log viewer |
| `/cms/media` | `MediaLibraryPage` | `AuthProvider` + `ProtectedRoute` | Media library |

**Total CMS routes today: 4** (login + 3 authenticated pages).

### Backend API Routes

Defined in `@/f:/What_i_Made/New/sidrah_web/backend/config/urls.py`:

| Prefix | Include | Purpose |
|--------|---------|---------|
| `/api/v1/auth/` | `apps.accounts.urls` | CSRF, login, logout, me |
| `/api/v1/admin/` | `apps.accounts.admin_urls` | Dashboard access check |
| `/api/v1/admin/activity-logs/` | `apps.activity_logs.urls` | Read-only activity log API |
| `/api/v1/cms/` | `apps.core.cms_urls` | Central CMS admin API router |

**CMS admin API sub-routes** (under `/api/v1/cms/`):

| Path | Module |
|------|--------|
| `dashboard/` | Accounts (dashboard aggregation) |
| `site-settings/` | Site Settings (singleton) |
| `navigation/` | Navigation (menus + items + reorder) |
| `partners/` | Partners (list/detail/reorder) |
| `services/` | Services (list/detail/reorder) |
| `case-studies/` | Case Studies (list/detail/reorder) |
| `insights/` | Insights (list/detail/workflow) |
| `careers/` | Careers (list/detail) |
| `contact/` | Contact (inquiry-types + submissions) |
| `media/` | Media Library (list/detail/usage) |

---

## 2. CMS Layout Architecture

### Current State

There is **no shared CMS layout component**. Each CMS page independently renders its own header, navigation, and footer. This results in:

- **Duplicated header markup** in `CMSDashboardPage`, `CMSActivityLogsPage`, and `MediaLibraryPage`.
- **Inconsistent navigation**: Each page has a slightly different nav set. `CMSDashboardPage` shows Media Library + Activity Logs links. `CMSActivityLogsPage` shows a Dashboard link. `MediaLibraryPage` shows Dashboard + Activity Logs + Media Library links.
- **No sidebar** — all pages use a top header bar only.
- **No breadcrumb** or page-level navigation context.
- **No shared layout wrapper** — each page handles its own `minHeight: 100vh`, background, and font.

### Current Header Pattern

Each page renders:
```
[Brand: "Sidrah CMS"]  [Nav links]  [User badge / Sign Out]
```

### Recommendation

Create a shared `CMSLayout` component that provides:
- Persistent header with brand, module-aware navigation, user badge, and logout.
- Optional sidebar for secondary navigation (e.g., subsections within a module).
- Main content area with consistent padding and max-width.
- Footer with version/copyright.
- Outlet for child routes (if using nested routes) or children prop.

---

## 3. Authentication Frontend

### AuthContext

`@/f:/What_i_Made/New/sidrah_web/src/contexts/AuthContext.jsx`

- **State:** `user`, `isAuthenticated`, `isLoading`, `error`.
- **Methods:** `login(username, password)`, `logout()`, `refreshUser()`, `hasCapability(capability)`, `hasModuleAccess(module)`.
- **Initialization:** On mount, calls `getCurrentUser()` to restore session from HttpOnly cookie.
- **CSRF:** The `authApi.js` service calls `fetchCsrf()` before login to ensure the CSRF cookie is set. All unsafe requests include `X-CSRFToken` header from the `csrftoken` cookie.
- **No tokens in localStorage** — session auth only.

### ProtectedRoute

`@/f:/What_i_Made/New/sidrah_web/src/components/auth/ProtectedRoute.jsx`

- Shows loading state while `isLoading` is true.
- Redirects to `/cms/login` if not authenticated.
- Shows "Access Denied" if authenticated but has no permitted modules (and is not superuser).
- Renders children if authorized.

### Login Page

`@/f:/What_i_Made/New/sidrah_web/src/pages/cms/CMSLoginPage.jsx`

- Username + password form.
- Redirects to `/cms` if already authenticated.
- Error display for invalid credentials.
- Calls `login()` from AuthContext.

### Auth API Service

`@/f:/What_i_Made/New/sidrah_web/src/services/authApi.js`

| Function | Endpoint | Method |
|----------|----------|--------|
| `fetchCsrf()` | `/api/v1/auth/csrf/` | GET |
| `login(username, password)` | `/api/v1/auth/login/` | POST |
| `logout()` | `/api/v1/auth/logout/` | POST |
| `getCurrentUser()` | `/api/v1/auth/me/` | GET |
| `checkDashboardAccess()` | `/api/v1/admin/dashboard/access/` | GET |

---

## 4. RBAC and Capability Visibility

### Role Policy

`@/f:/What_i_Made/New/sidrah_web/backend/apps/accounts/roles.py`

**12 modules** defined:
- `dashboard`, `site_settings`, `navigation`, `partners`, `services`, `case_studies`, `careers`, `insights`, `contact`, `media`, `users`, `activity_logs`

**8 actions** defined:
- `view`, `create`, `update`, `delete`, `publish`, `export`, `assign`, `manage_users`

**11 CMS roles** defined:
- `super_admin`, `admin`, `content_manager`, `editor`, `marketing_manager`, `marketing_seo` (legacy → marketing_manager), `recruiter`, `support_agent`, `support_recruit` (legacy → support_agent), `lms_admin`, `finance_sales`

### Permission Matrix (role → module → actions)

| Role | Modules |
|------|---------|
| **super_admin** | All modules, all actions (bypass) |
| **admin** | All modules; users=view only; activity_logs=view only |
| **content_manager** | dashboard, navigation, partners, services, case_studies, insights, media (CRUD+publish); contact=view |
| **editor** | dashboard; services/case_studies/insights/partners (view+create+update); navigation (view+update); media (view+create) |
| **marketing_manager** | dashboard; partners (CRUD+publish); services (view+update); case_studies (view+update); insights (CRUD+publish); navigation (view+update); media (view+create); site_settings (view+update) |
| **recruiter** | dashboard; careers (CRUD+publish); media (view+create); contact (view) |
| **support_agent** | dashboard; contact (view+update+assign) |
| **lms_admin** | dashboard only |
| **finance_sales** | dashboard; contact (view) |

### Frontend Capability Checks

- `hasCapability('module.action')` — checks `user.capabilities` array (e.g., `'media.create'`).
- `hasModuleAccess('module')` — checks `user.permitted_modules` array.
- Superuser bypasses both checks.
- Used in existing pages: `MediaLibraryPage` checks `hasModuleAccess('media')` and `hasCapability('media.create')`. `CMSActivityLogsPage` checks `hasCapability('activity_logs.view')`.

### Permission Classes (Backend)

`@/f:/What_i_Made/New/sidrah_web/backend/apps/accounts/permissions.py`

| Class | Purpose |
|-------|---------|
| `IsCMSUser` | Authenticated + active + CMS role or superuser/staff |
| `IsSuperAdmin` | Superuser or super_admin role |
| `CanManageUsers` | super_admin or admin role |
| `HasCMSRole` | Configurable role-based check |
| `HasModulePermission` | Checks `cms_module` + `cms_action` on the view |
| `CanPublishContent` | Checks `publish` action on `cms_module` |

### CMSViewMixin

`@/f:/What_i_Made/New/sidrah_web/backend/apps/core/cms_permissions.py`

- `CMSModulePermissionMixin`: Maps HTTP methods to CMS actions (GET→view, POST→create, PUT/PATCH→update, DELETE→delete).
- `CMSViewMixin`: Combines permission enforcement with `log_cms_action()` for activity logging.
- All CMS module views inherit from `CMSViewMixin`.

---

## 5. Dashboard API Contract

### Endpoint

`GET /api/v1/cms/dashboard/`

`@/f:/What_i_Made/New/sidrah_web/backend/apps/accounts/cms_dashboard_views.py`

### Response Shape

```json
{
  "user": { /* CMSUserSerializer */ },
  "modules": ["dashboard", "partners", "services", ...],
  "capabilities": ["partners.view", "partners.create", ...],
  "stats": {
    "partners": { "total": N, "active": N, "featured": N },
    "services": { "total": N, "active": N, "featured": N, "on_homepage": N },
    "case_studies": { "total": N, "active": N, "featured": N, "on_homepage": N },
    "insights": { "total": N, "published": N, "draft": N, "archived": N, "featured": N },
    "careers": { "total": N, "active": N, "expired": N, "featured": N },
    "contact": { "total": N, "new": N, "contacted": N, "in_progress": N, "closed": N, "spam": N, "archived": N, "inquiry_types": N },
    "activity_logs": { "total": N }
  },
  "recent_activity": [ /* ActivityLogSerializer[], latest 5 */ ],
  "recent_contact_submissions": [ /* {id, public_id, full_name, email, status, priority, created_at}[], latest 5 */ ]
}
```

### Key Details

- Stats are **scoped to the user's permitted modules** — only modules the user can access appear in `stats`.
- `recent_activity` is only included if `activity_logs` is in the user's modules.
- `recent_contact_submissions` is only included if `contact` is in the user's modules.
- **No `media` stats** in the current dashboard payload (gap — see §29).
- **No `site_settings` or `navigation` stats** (appropriate — singletons/structural).
- **No `users` stats** (user management is out of scope for this phase).

---

## 6. Existing Dashboard UI

`@/f:/What_i_Made/New/sidrah_web/src/pages/cms/CMSDashboardPage.jsx`

### Current State

The dashboard is a **temporary foundation page** (self-described in comments: "Will be replaced by the full dashboard UI in later phases"). It shows:

1. **Header** with brand, nav links (Media Library, Activity Logs), and Sign Out button.
2. **RecentActivityWidget** — shows latest 5 activity log entries (if user has `activity_logs.view`).
3. **User Identity section** — display name, email, role badge, staff/superuser flags.
4. **Permitted Modules section** — list of module badges.
5. **Capabilities section** — list of capability code badges.

### Gaps

- **No stat cards** — the dashboard API returns stats but the UI doesn't render them.
- **No recent contact submissions widget** — the API returns them but the UI doesn't show them.
- **No module quick-links** — no cards/links to navigate to module management pages.
- **No media stats** — the API doesn't return media stats (backend gap).
- **Not a real dashboard** — it's a debug/foundation page showing auth state.

---

## 7. Admin API Inventory

### Complete Endpoint Matrix

#### Dashboard

| Method | Endpoint | View | Permissions |
|--------|----------|------|-------------|
| GET | `/api/v1/cms/dashboard/` | `CMSDashboardView` | `IsAuthenticated`, `IsCMSUser` |

#### Site Settings (Singleton)

| Method | Endpoint | View | Permissions |
|--------|----------|------|-------------|
| GET | `/api/v1/cms/site-settings/` | `CMSSiteSettingView` | `IsAuthenticated`, `IsCMSUser`, `HasModulePermission` (view) |
| PUT | `/api/v1/cms/site-settings/` | `CMSSiteSettingView` | `IsAuthenticated`, `IsCMSUser`, `HasModulePermission` (update) |

#### Navigation

| Method | Endpoint | View | Permissions |
|--------|----------|------|-------------|
| GET | `/api/v1/cms/navigation/menus/` | `CMSNavigationMenuListCreateView` | view |
| POST | `/api/v1/cms/navigation/menus/` | `CMSNavigationMenuListCreateView` | create |
| GET | `/api/v1/cms/navigation/menus/<id>/` | `CMSNavigationMenuDetailView` | view |
| PUT/PATCH | `/api/v1/cms/navigation/menus/<id>/` | `CMSNavigationMenuDetailView` | update |
| DELETE | `/api/v1/cms/navigation/menus/<id>/` | `CMSNavigationMenuDetailView` | delete |
| GET | `/api/v1/cms/navigation/items/` | `CMSNavigationItemListCreateView` | view |
| POST | `/api/v1/cms/navigation/items/` | `CMSNavigationItemListCreateView` | create |
| GET | `/api/v1/cms/navigation/items/<id>/` | `CMSNavigationItemDetailView` | view |
| PUT/PATCH | `/api/v1/cms/navigation/items/<id>/` | `CMSNavigationItemDetailView` | update |
| DELETE | `/api/v1/cms/navigation/items/<id>/` | `CMSNavigationItemDetailView` | delete |
| POST | `/api/v1/cms/navigation/reorder/` | `CMSNavigationReorderView` | update |

#### Partners

| Method | Endpoint | View | Permissions |
|--------|----------|------|-------------|
| GET | `/api/v1/cms/partners/` | `CMSPartnerListCreateView` | view |
| POST | `/api/v1/cms/partners/` | `CMSPartnerListCreateView` | create |
| GET | `/api/v1/cms/partners/<id>/` | `CMSPartnerDetailView` | view |
| PUT/PATCH | `/api/v1/cms/partners/<id>/` | `CMSPartnerDetailView` | update |
| DELETE | `/api/v1/cms/partners/<id>/` | `CMSPartnerDetailView` | delete |
| POST | `/api/v1/cms/partners/reorder/` | `CMSPartnerReorderView` | update |

#### Services

| Method | Endpoint | View | Permissions |
|--------|----------|------|-------------|
| GET | `/api/v1/cms/services/` | `CMSServiceListCreateView` | view |
| POST | `/api/v1/cms/services/` | `CMSServiceListCreateView` | create |
| GET | `/api/v1/cms/services/<id>/` | `CMSServiceDetailView` | view |
| PUT/PATCH | `/api/v1/cms/services/<id>/` | `CMSServiceDetailView` | update |
| DELETE | `/api/v1/cms/services/<id>/` | `CMSServiceDetailView` | delete |
| POST | `/api/v1/cms/services/reorder/` | `CMSServiceReorderView` | update |

#### Case Studies

| Method | Endpoint | View | Permissions |
|--------|----------|------|-------------|
| GET | `/api/v1/cms/case-studies/` | `CMSCaseStudyListCreateView` | view |
| POST | `/api/v1/cms/case-studies/` | `CMSCaseStudyListCreateView` | create |
| GET | `/api/v1/cms/case-studies/<id>/` | `CMSCaseStudyDetailView` | view |
| PUT/PATCH | `/api/v1/cms/case-studies/<id>/` | `CMSCaseStudyDetailView` | update |
| DELETE | `/api/v1/cms/case-studies/<id>/` | `CMSCaseStudyDetailView` | delete |
| POST | `/api/v1/cms/case-studies/reorder/` | `CMSCaseStudyReorderView` | update |

#### Insights

| Method | Endpoint | View | Permissions |
|--------|----------|------|-------------|
| GET | `/api/v1/cms/insights/` | `CMSArticleListCreateView` | view |
| POST | `/api/v1/cms/insights/` | `CMSArticleListCreateView` | create |
| GET | `/api/v1/cms/insights/<id>/` | `CMSArticleDetailView` | view |
| PUT/PATCH | `/api/v1/cms/insights/<id>/` | `CMSArticleDetailView` | update |
| DELETE | `/api/v1/cms/insights/<id>/` | `CMSArticleDetailView` | delete |
| POST | `/api/v1/cms/insights/<id>/publish/` | `CMSArticlePublishView` | publish |
| POST | `/api/v1/cms/insights/<id>/unpublish/` | `CMSArticleUnpublishView` | publish |
| POST | `/api/v1/cms/insights/<id>/archive/` | `CMSArticleArchiveView` | publish |

#### Careers

| Method | Endpoint | View | Permissions |
|--------|----------|------|-------------|
| GET | `/api/v1/cms/careers/` | `CMSJobListCreateView` | view |
| POST | `/api/v1/cms/careers/` | `CMSJobListCreateView` | create |
| GET | `/api/v1/cms/careers/<id>/` | `CMSJobDetailView` | view |
| PUT/PATCH | `/api/v1/cms/careers/<id>/` | `CMSJobDetailView` | update |
| DELETE | `/api/v1/cms/careers/<id>/` | `CMSJobDetailView` | delete |

#### Contact

| Method | Endpoint | View | Permissions |
|--------|----------|------|-------------|
| GET | `/api/v1/cms/contact/inquiry-types/` | `CMSInquiryTypeListCreateView` | view |
| POST | `/api/v1/cms/contact/inquiry-types/` | `CMSInquiryTypeListCreateView` | create |
| GET | `/api/v1/cms/contact/inquiry-types/<id>/` | `CMSInquiryTypeDetailView` | view |
| PUT/PATCH | `/api/v1/cms/contact/inquiry-types/<id>/` | `CMSInquiryTypeDetailView` | update |
| DELETE | `/api/v1/cms/contact/inquiry-types/<id>/` | `CMSInquiryTypeDetailView` | delete (protected — 409 if referenced) |
| GET | `/api/v1/cms/contact/submissions/` | `CMSContactSubmissionListView` | view |
| POST | `/api/v1/cms/contact/submissions/` | *(rejected — 405)* | — |
| GET | `/api/v1/cms/contact/submissions/<id>/` | `CMSContactSubmissionDetailView` | view |
| PATCH | `/api/v1/cms/contact/submissions/<id>/` | `CMSContactSubmissionDetailView` | update (management fields only) |
| PUT | `/api/v1/cms/contact/submissions/<id>/` | *(rejected — 405)* | — |
| DELETE | `/api/v1/cms/contact/submissions/<id>/` | `CMSContactSubmissionDetailView` | delete |

#### Media Library

| Method | Endpoint | View | Permissions |
|--------|----------|------|-------------|
| GET | `/api/v1/cms/media/` | `CMSMediaListCreateView` | view |
| POST | `/api/v1/cms/media/` | `CMSMediaListCreateView` (multipart) | create |
| GET | `/api/v1/cms/media/<id>/` | `CMSMediaDetailView` | view |
| PATCH | `/api/v1/cms/media/<id>/` | `CMSMediaDetailView` | update |
| DELETE | `/api/v1/cms/media/<id>/` | `CMSMediaDetailView` | delete (protected — 409 if in use) |
| GET | `/api/v1/cms/media/<id>/usage/` | `CMSMediaUsageView` | view |

#### Activity Logs

| Method | Endpoint | View | Permissions |
|--------|----------|------|-------------|
| GET | `/api/v1/admin/activity-logs/` | `ActivityLogListView` | `IsCMSUser`, `HasModulePermission` (activity_logs.view) |
| GET | `/api/v1/admin/activity-logs/<id>/` | `ActivityLogDetailView` | `IsCMSUser`, `HasModulePermission` (activity_logs.view) |
| POST/PUT/PATCH/DELETE | `/api/v1/admin/activity-logs/...` | *(rejected — 405)* | — |

**Total CMS API endpoints: 42** (excluding auth and public endpoints).

---

## 8. Response and Pagination Contracts

### Pagination

`@/f:/What_i_Made/New/sidrah_web/backend/apps/core/cms_pagination.py`

- **Class:** `CMSPagination(PageNumberPagination)`
- **Page size:** 20
- **Page size param:** `page_size`
- **Max page size:** 100
- **Response shape:**
  ```json
  {
    "count": 100,
    "next": "http://...?page=3",
    "previous": "http://...?page=1",
    "results": [ ... ]
  }
  ```

Activity logs use a separate but identical pagination class (`StandardResultsSetPagination`).

### Filtering Patterns

All list views follow the same pattern:

| Param Type | Examples | Implementation |
|------------|----------|----------------|
| Search | `search=term` | `Q(field__icontains=term)` across multiple fields |
| Boolean | `active=true`, `featured=false` | `is_active__lower() == 'true'` |
| FK filter | `partner=3`, `inquiry_type=5` | `qs.filter(fk_id=value)` |
| Ordering | `ordering=-created_at` | Whitelist of allowed ordering fields |
| Date range | `from=ISO`, `to=ISO` | `created_at__gte` / `created_at__lte` |
| Status | `status=published` | `qs.filter(status=value)` |

### MediaAsset Reference Pattern

`@/f:/What_i_Made/New/sidrah_web/backend/apps/core/cms_serializers.py`

- **Read:** `MediaAssetReferenceSerializer` — nested object `{ id, url, alt_text, title, media_type }`.
- **Write:** `media_asset_field()` — `PrimaryKeyRelatedField` (write-only, accepts asset ID).
- **Write field naming:** For serializers with multiple media FKs, write fields use `_id` suffix (e.g., `default_og_image_id`, `primary_logo_id`). For single-FK fields, the field name matches the model field name (e.g., `logo`, `featured_image`, `icon`).

---

## 9. Shared CMS Frontend Components

### Currently Existing

| Component | Path | Purpose |
|-----------|------|---------|
| `AuthProvider` | `src/contexts/AuthContext.jsx` | Auth context provider |
| `ProtectedRoute` | `src/components/auth/ProtectedRoute.jsx` | Route guard |
| `RecentActivityWidget` | `src/components/cms/RecentActivityWidget.jsx` | Dashboard widget for recent activity |
| `MediaCard` | `src/components/cms/media/MediaCard.jsx` | Media asset thumbnail card |
| `MediaGrid` | `src/components/cms/media/MediaGrid.jsx` | Responsive grid of MediaCards |
| `MediaUploadDialog` | `src/components/cms/media/MediaUploadDialog.jsx` | Upload modal with drag-and-drop |
| `MediaDetailsDialog` | `src/components/cms/media/MediaDetailsDialog.jsx` | Asset detail/edit/usage/delete modal |
| `MediaAssetPicker` | `src/components/cms/media/MediaAssetPicker.jsx` | Reusable asset picker modal |

### Missing Shared Components (Required for Implementation)

| Component | Purpose |
|-----------|---------|
| `CMSLayout` | Shared layout with header, nav, content area |
| `CMSDataTable` | Reusable table for list views (sorting, pagination) |
| `CMSFormDialog` | Reusable modal form wrapper |
| `CMSConfirmDialog` | Reusable confirmation dialog for deletes |
| `CMSFormField` | Form field wrapper with label, error, hint |
| `CMSMediaPickerField` | Form field that opens MediaAssetPicker |
| `CMSToggle` | Boolean toggle switch |
| `CMSSelect` | Styled select dropdown |
| `CMSInput` | Styled text input |
| `CMSTextarea` | Styled textarea |
| `CMSBadge` | Status/role badge |
| `CMSPagination` | Reusable pagination controls |
| `CMSToolbar` | Search + filter toolbar for list pages |
| `CMSEmptyState` | Empty state placeholder |
| `CMSLoadingState` | Loading spinner/skeleton |
| `CMSErrorState` | Error display |
| `CMSNotification` | Toast/notification for mutation feedback |
| `CMSBreadcrumb` | Breadcrumb navigation |
| `CMSTabBar` | Tab navigation for detail views |

---

## 10. Styling and Design System

### Current Approach

**All CMS pages use inline CSS style objects** — no CSS framework, no CSS-in-JS library, no CSS modules.

### Design Tokens (extracted from existing code)

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#0a0a14` | Page background |
| `--bg-secondary` | `#12121e` | Cards, header, sections |
| `--bg-tertiary` | `#1a1a2e` | Capability badges |
| `--border-primary` | `#1e1e2e` | Card borders, dividers |
| `--border-secondary` | `#2a2a3e` | Input borders |
| `--border-tertiary` | `#333` | Button borders |
| `--text-primary` | `#e0e0e0` | Body text |
| `--text-secondary` | `#aaa` | Nav links, secondary text |
| `--text-muted` | `#888` | Labels, muted text |
| `--text-dim` | `#555` | Footer, hints |
| `--accent` | `#c9a96e` | Brand gold — logo, titles, active states, buttons |
| `--accent-bg` | `rgba(201, 169, 110, 0.1)` | Badge backgrounds |
| `--accent-border` | `rgba(201, 169, 110, 0.3)` | Badge borders |
| `--error` | `#e74c3c` / `#ef4444` / `#e05050` | Error states |
| `--error-bg` | `rgba(231, 76, 60, 0.1)` / `rgba(220, 50, 50, 0.1)` | Error backgrounds |
| `--success` | `#22c55e` | Success badges |
| `--success-bg` | `rgba(34, 197, 94, 0.15)` | Success badge backgrounds |
| `--radius-sm` | `3px` / `4px` | Small badges |
| `--radius-md` | `6px` | Inputs, buttons |
| `--radius-lg` | `8px` / `12px` | Cards, modals |
| `--font-family` | `system-ui, -apple-system, sans-serif` | All text |

### Typography

- Headers: `1.25rem` / `1.5rem`, `font-weight: 600`
- Body: `0.875rem`
- Small/labels: `0.8125rem`
- Tiny/badges: `0.75rem` / `0.6875rem`

### Recommendation

**Continue with inline styles** for consistency. Extract a shared `cmsStyles.js` file with design tokens and reusable style objects. Do NOT introduce a CSS framework during this phase — it would create inconsistency with existing pages.

---

## 11. Internationalization and RTL

### Current State

- **Backend models** use bilingual fields (`*_en` / `*_ar`) throughout all content models.
- **Backend serializers** expose both `*_en` and `*_ar` fields.
- **Frontend CMS** is **English-only** — no language toggle, no RTL support, no i18n library.
- **No `i18n` package installed** — no `react-i18next`, no `react-intl`.
- **Activity log page** has hardcoded English labels.
- **Media library page** has hardcoded English labels.

### Recommendation

- **Do NOT implement full i18n in this phase.** The CMS is an admin tool; English-only is acceptable for now.
- **Render both `*_en` and `*_ar` fields in forms** using side-by-side or tabbed inputs.
- **Plan for future RTL** by keeping `dir` attribute configurable on the CMSLayout, but default to `ltr`.
- **Do NOT install an i18n package** unless explicitly required.

---

## 12. Site Settings UI Requirements

### Model

`@/f:/What_i_Made/New/sidrah_web/backend/apps/site_settings/models.py`

### Fields (Singleton — GET/PUT only)

| Section | Fields | Type | Media FK |
|---------|--------|------|----------|
| **General** | `site_name`, `site_tagline`, `default_language`, `supported_languages` (JSON array) | Char/JSON | — |
| **Contact** | `contact_email`, `recipient_email`, `phone`, `whatsapp_url`, `telegram_url` | Email/URL/Char | — |
| **Social** | `facebook_url`, `linkedin_url`, `instagram_url`, `youtube_url`, `x_url` | URL | — |
| **Location** | `address`, `google_maps_url`, `map_embed_url`, `latitude`, `longitude`, `working_hours` | Text/URL/Decimal | — |
| **SEO** | `default_meta_title`, `default_meta_description` | Char/Text | `default_og_image` |
| **Branding** | `primary_logo`, `secondary_logo`, `favicon` | FK MediaAsset | Yes |
| **Status** | `is_active` | Boolean | — |

### API

- `GET /api/v1/cms/site-settings/` — returns full settings with nested media references.
- `PUT /api/v1/cms/site-settings/` — partial update; media fields accept `_id` suffixed write fields.

### UI Requirements

- **Single page, no list.** Form-based UI with sections (accordion or tabbed).
- **Media picker** for `default_og_image`, `primary_logo`, `secondary_logo`, `favicon`.
- **JSON array editor** for `supported_languages` (simple tag input or comma-separated).
- **Read-only display** for users without `site_settings.update` capability.
- **Save button** triggers PUT request.
- **No delete** — singleton.

---

## 13. Navigation Management UI

### Models

`@/f:/What_i_Made/New/sidrah_web/backend/apps/navigation/models.py`

#### NavigationMenu

| Field | Type | Notes |
|-------|------|-------|
| `name` | CharField(120) | Human-readable |
| `slug` | SlugField(64) | Unique, frontend code |
| `location` | CharField(32) | Choices: header, footer, mobile, legal |
| `description` | CharField(255) | Optional |
| `order` | PositiveInt | Display order |
| `is_active` | Boolean | — |

#### NavigationItem

| Field | Type | Notes |
|-------|------|-------|
| `menu` | FK NavigationMenu | CASCADE |
| `parent` | FK self (nullable) | Max depth 2, same menu |
| `label_en` / `label_ar` | CharField(120) | Bilingual |
| `link_type` | CharField(16) | internal, external, anchor, email, phone |
| `url` | CharField(512) | Internal path or external URL |
| `route_name` | CharField(120) | Django URL name |
| `anchor` | CharField(120) | For anchor links |
| `email` | EmailField | For email links |
| `phone` | CharField(40) | For phone links |
| `order` | PositiveInt | — |
| `open_in_new_tab` | Boolean | — |
| `icon` | CharField(120) | Icon class/identifier |
| `icon_asset` | FK MediaAsset | Optional |
| `is_visible` | Boolean | — |

### API Endpoints

- Menus: CRUD at `/api/v1/cms/navigation/menus/` and `/api/v1/cms/navigation/menus/<id>/`
- Items: CRUD at `/api/v1/cms/navigation/items/` and `/api/v1/cms/navigation/items/<id>/`
- Reorder: POST `/api/v1/cms/navigation/reorder/` with `{ menu_id, items: [{id, order}] }`

### UI Requirements

- **Two-tab layout**: "Menus" and "Items".
- **Menus tab**: List of menus with create/edit/delete. Filter by location and active status.
- **Items tab**: List of items filtered by menu. Hierarchical display (parent → children). Create/edit/delete. Conditional fields based on `link_type`. Media picker for `icon_asset`.
- **Reorder**: Drag-and-drop or up/down arrows calling the reorder endpoint.
- **Parent selector**: Only items without a parent in the same menu can be parents (max depth 2).

---

## 14. Partners Management UI

### Model

`@/f:/What_i_Made/New/sidrah_web/backend/apps/partners/models.py`

| Field | Type | Notes |
|-------|------|-------|
| `name_en` / `name_ar` | CharField(255) | Bilingual |
| `slug` | SlugField(255) | Unique |
| `description_en` / `description_ar` | TextField | Bilingual |
| `logo` | FK MediaAsset | SET_NULL |
| `website_url` | URLField | — |
| `open_in_new_tab` | Boolean | — |
| `partner_type` | CharField(32) | Choices: client, strategic_partner, academic_partner, technology_partner, training_partner, other |
| `display_order` | PositiveInt | — |
| `is_featured` | Boolean | — |
| `is_active` | Boolean | — |

### API Endpoints

- List/Create: `GET/POST /api/v1/cms/partners/`
- Detail: `GET/PUT/PATCH/DELETE /api/v1/cms/partners/<id>/`
- Reorder: `POST /api/v1/cms/partners/reorder/`
- Filters: `search`, `partner_type`, `active`, `featured`, `ordering`
- Ordering whitelist: `display_order`, `-display_order`, `name_en`, `-name_en`, `created_at`, `-created_at`

### UI Requirements

- **List view**: Table with columns: name, type, logo thumbnail, featured, active, display order. Search + filter by type/active/featured. Sortable.
- **Create/Edit form**: Bilingual name fields, slug (auto-suggest from name_en), description textareas, logo media picker, website URL, partner type select, display order, featured/active toggles.
- **Reorder**: Up/down arrows or drag-and-drop.

---

## 15. Services Management UI

### Model

`@/f:/What_i_Made/New/sidrah_web/backend/apps/services/models.py`

| Field | Type | Notes |
|-------|------|-------|
| `name_en` / `name_ar` | CharField(255) | Bilingual |
| `slug` | SlugField(255) | Unique |
| `short_description_en` / `short_description_ar` | TextField | Bilingual |
| `description_en` / `description_ar` | TextField | Bilingual |
| `icon` | FK MediaAsset | SET_NULL |
| `featured_image` | FK MediaAsset | SET_NULL |
| `display_order` | PositiveInt | — |
| `is_featured` / `is_active` / `show_on_homepage` | Boolean | — |
| `cta_label_en` / `cta_label_ar` | CharField(120) | Bilingual |
| `cta_url` | CharField(512) | — |
| `seo_title_en` / `seo_title_ar` | CharField(255) | Bilingual SEO |
| `seo_description_en` / `seo_description_ar` | TextField | Bilingual SEO |

### API Endpoints

- List/Create: `GET/POST /api/v1/cms/services/`
- Detail: `GET/PUT/PATCH/DELETE /api/v1/cms/services/<id>/`
- Reorder: `POST /api/v1/cms/services/reorder/`
- Filters: `search`, `active`, `featured`, `homepage`, `ordering`
- Ordering whitelist: `display_order`, `-display_order`, `name_en`, `-name_en`, `created_at`, `-created_at`

### UI Requirements

- **List view**: Table with name, icon thumbnail, featured, active, homepage, display order.
- **Create/Edit form**: Bilingual fields for name, short description, full description. Media pickers for icon and featured_image. CTA fields. SEO section (collapsible). Display flags (featured, active, show_on_homepage). Display order.
- **Reorder**: Up/down arrows or drag-and-drop.

---

## 16. Case Studies Management UI

### Model

`@/f:/What_i_Made/New/sidrah_web/backend/apps/case_studies/models.py`

| Field | Type | Notes |
|-------|------|-------|
| `title_en` / `title_ar` | CharField(255) | Bilingual |
| `slug` | SlugField(255) | Unique |
| `partner` | FK Partner | SET_NULL |
| `client_name_en` / `client_name_ar` | CharField(255) | Bilingual |
| `short_description_en` / `short_description_ar` | TextField | Bilingual |
| `problem_en` / `problem_ar` | TextField | Bilingual |
| `solution_en` / `solution_ar` | TextField | Bilingual |
| `technology_en` / `technology_ar` | TextField | Bilingual |
| `outcome_en` / `outcome_ar` | TextField | Bilingual |
| `featured_image` | FK MediaAsset | SET_NULL |
| `logo` | FK MediaAsset | SET_NULL |
| `industry_en` / `industry_ar` | CharField(120) | Bilingual |
| `services` | M2M Service | — |
| `project_url` | URLField | — |
| `open_in_new_tab` | Boolean | — |
| `project_year` | PositiveInt | Nullable |
| `display_order` | PositiveInt | — |
| `is_featured` / `is_active` / `show_on_homepage` | Boolean | — |
| `seo_title_en` / `seo_title_ar` | CharField(255) | Bilingual SEO |
| `seo_description_en` / `seo_description_ar` | TextField | Bilingual SEO |

### API Endpoints

- List/Create: `GET/POST /api/v1/cms/case-studies/`
- Detail: `GET/PUT/PATCH/DELETE /api/v1/cms/case-studies/<id>/`
- Reorder: `POST /api/v1/cms/case-studies/reorder/`
- Filters: `search`, `active`, `featured`, `homepage`, `partner`, `industry`, `ordering`
- Ordering whitelist: `display_order`, `-display_order`, `title_en`, `-title_en`, `created_at`, `-created_at`

### UI Requirements

- **List view**: Table with title, partner name, featured image thumbnail, industry, featured, active, display order.
- **Create/Edit form**: Large form with sections:
  - Identity: bilingual title, slug
  - Attribution: partner select, client name (bilingual)
  - Summary: short description (bilingual)
  - Content: problem, solution, technology, outcome (all bilingual textareas)
  - Media: featured_image picker, logo picker
  - Classification: industry (bilingual), services multi-select
  - Links: project URL, open_in_new_tab, project_year
  - Display: display_order, featured, active, show_on_homepage
  - SEO: collapsible section
- **Reorder**: Up/down arrows or drag-and-drop.

---

## 17. Insights Management UI

### Model

`@/f:/What_i_Made/New/sidrah_web/backend/apps/insights/models.py`

| Field | Type | Notes |
|-------|------|-------|
| `title_en` / `title_ar` | CharField(255) | Bilingual |
| `slug` | SlugField(255) | Unique |
| `content_type` | CharField(32) | Choices: insight, article, news, announcement |
| `excerpt_en` / `excerpt_ar` | TextField | Bilingual |
| `body_en` / `body_ar` | TextField | Bilingual — **rich text content** |
| `category_en` / `category_ar` | CharField(120) | Bilingual free-text |
| `author_name_en` / `author_name_ar` | CharField(120) | Bilingual free-text |
| `featured_image` | FK MediaAsset | SET_NULL |
| `status` | CharField(16) | draft, published, archived (read-only in write serializer) |
| `published_at` | DateTimeField | Nullable (read-only in write serializer) |
| `is_featured` / `show_on_homepage` | Boolean | — |
| `display_order` | PositiveInt | — |
| `read_time_minutes` | PositiveInt | Nullable |
| `seo_title_en` / `seo_title_ar` | CharField(255) | Bilingual SEO |
| `seo_description_en` / `seo_description_ar` | TextField | Bilingual SEO |

### API Endpoints

- List/Create: `GET/POST /api/v1/cms/insights/`
- Detail: `GET/PUT/PATCH/DELETE /api/v1/cms/insights/<id>/`
- Workflow: `POST /api/v1/cms/insights/<id>/publish/`, `/unpublish/`, `/archive/`
- Filters: `search`, `status`, `content_type`, `featured`, `homepage`, `ordering`
- Ordering whitelist: `display_order`, `-display_order`, `published_at`, `-published_at`, `created_at`, `-created_at`

### Workflow Transitions

| Current → | publish | unpublish | archive |
|-----------|---------|-----------|---------|
| **draft** | ✅ → published | ❌ | ✅ → archived |
| **published** | ❌ | ✅ → draft | ✅ → archived |
| **archived** | ✅ → published | ❌ | ❌ |

### UI Requirements

- **List view**: Table with title, content_type, status badge, category, featured, published_at. Filter by status, content_type, featured. Status badge color-coded (draft=gray, published=green, archived=orange).
- **Create/Edit form**: Bilingual title, slug, content_type select, excerpt (bilingual textareas), body (bilingual — **requires rich text editor**, see §31), category (bilingual), author (bilingual), featured_image picker, display flags, read_time_minutes, SEO section.
- **Status controls**: Buttons for Publish/Unpublish/Archive based on current status and `publish` capability. Disabled states for invalid transitions.
- **No delete in list view** — delete only in detail view with confirmation.

---

## 18. Careers Management UI

### Model

`@/f:/What_i_Made/New/sidrah_web/backend/apps/careers/models.py`

| Field | Type | Notes |
|-------|------|-------|
| `title_en` / `title_ar` | CharField(255) | Bilingual |
| `slug` | SlugField(255) | Unique |
| `department_en` / `department_ar` | CharField(120) | Bilingual |
| `location_en` / `location_ar` | CharField(120) | Bilingual |
| `employment_type` | CharField(32) | 7 choices: full_time, part_time, contract, internship, freelance, temporary, other |
| `workplace_type` | CharField(32) | 3 choices: onsite, remote, hybrid |
| `experience_level` | CharField(32) | 7 choices: entry, junior, mid, senior, lead, manager, unspecified |
| `short_description_en` / `short_description_ar` | TextField | Bilingual |
| `description_en` / `description_ar` | TextField | Bilingual |
| `responsibilities_en` / `responsibilities_ar` | TextField | Bilingual |
| `requirements_en` / `requirements_ar` | TextField | Bilingual |
| `preferred_qualifications_en` / `preferred_qualifications_ar` | TextField | Bilingual |
| `benefits_en` / `benefits_ar` | TextField | Bilingual |
| `application_method` | CharField(32) | 3 choices: external_url, email, contact_page |
| `external_apply_url` | URLField | Required if method=external_url |
| `application_email` | EmailField | Required if method=email |
| `posted_date` | DateField | Default: today |
| `closing_date` | DateField | Nullable, expired jobs hidden from public |
| `display_order` | PositiveInt | — |
| `is_featured` / `is_active` / `show_on_homepage` | Boolean | — |
| `seo_title_en` / `seo_title_ar` | CharField(255) | Bilingual SEO |
| `seo_description_en` / `seo_description_ar` | TextField | Bilingual SEO |

### API Endpoints

- List/Create: `GET/POST /api/v1/cms/careers/`
- Detail: `GET/PUT/PATCH/DELETE /api/v1/cms/careers/<id>/`
- Filters: `search`, `active`, `featured`, `homepage`, `employment_type`, `workplace_type`, `experience_level`, `expired`, `ordering`
- Ordering whitelist: `display_order`, `-display_order`, `posted_date`, `-posted_date`, `created_at`, `-created_at`

### UI Requirements

- **List view**: Table with title, department, location, employment type, status (active/expired), featured, posted date. Filter by active, featured, employment_type, workplace_type, experience_level, expired.
- **Create/Edit form**: Large form with sections:
  - Identity: bilingual title, slug
  - Organization: department (bilingual), location (bilingual)
  - Classification: employment_type, workplace_type, experience_level (selects)
  - Description: short_description, description, responsibilities, requirements, preferred_qualifications, benefits (all bilingual textareas)
  - Application: application_method (select), conditional fields (external_apply_url or application_email)
  - Dates: posted_date, closing_date
  - Display: display_order, featured, active, show_on_homepage
  - SEO: collapsible section
- **Conditional validation**: Show external_apply_url when method=external_url, application_email when method=email.

---

## 19. Contact Management UI

### Models

`@/f:/What_i_Made/New/sidrah_web/backend/apps/contact/models.py`

#### InquiryType

| Field | Type | Notes |
|-------|------|-------|
| `name_en` / `name_ar` | CharField(120) | Bilingual |
| `slug` | SlugField(120) | Unique |
| `description_en` / `description_ar` | TextField | Bilingual |
| `recipient_email` | EmailField | Optional override |
| `order` | PositiveInt | — |
| `is_active` | Boolean | — |

#### ContactSubmission

| Field | Type | Editable | Notes |
|-------|------|----------|-------|
| `public_id` | UUID | Read-only | Public identifier |
| `full_name` | CharField | Read-only | — |
| `email` | EmailField | Read-only | — |
| `phone` | CharField | Read-only | — |
| `company` | CharField | Read-only | — |
| `job_title` | CharField | Read-only | — |
| `inquiry_type` | FK InquiryType | Read-only | — |
| `related_service` | FK Service | Read-only | — |
| `subject` | CharField | Read-only | — |
| `message` | TextField | Read-only | — |
| `preferred_contact_method` | CharField | Read-only | email, phone, whatsapp, any |
| `privacy_consent` | Boolean | Read-only | — |
| `source_page` | CharField | Read-only | — |
| `language` | CharField | Read-only | — |
| `status` | CharField | **Editable** | new, contacted, in_progress, closed, spam, archived |
| `priority` | CharField | **Editable** | low, normal, high, urgent |
| `assigned_to` | FK User | **Editable** | — |
| `internal_notes` | TextField | **Editable** | — |
| `email_delivery_status` | CharField | Read-only | pending, sent, failed, not_configured |
| `email_attempted_at` / `email_sent_at` | DateTime | Read-only | — |
| `email_error_summary` | TextField | Read-only | — |
| `recipient_email_used` | EmailField | Read-only | — |
| `ip_address` | GenericIPAddress | Read-only | — |
| `user_agent` | TextField | Read-only | — |
| `contacted_at` / `closed_at` | DateTime | Read-only (auto) | — |

### API Endpoints

**Inquiry Types:**
- List/Create: `GET/POST /api/v1/cms/contact/inquiry-types/`
- Detail: `GET/PUT/PATCH/DELETE /api/v1/cms/contact/inquiry-types/<id>/`
- Delete is **protected** — returns 409 if submissions reference it.

**Submissions:**
- List: `GET /api/v1/cms/contact/submissions/` (POST returns 405)
- Detail: `GET /api/v1/cms/contact/submissions/<id>/` (PUT returns 405)
- Update: `PATCH /api/v1/cms/contact/submissions/<id>/` — only `status`, `priority`, `assigned_to`, `internal_notes`
- Delete: `DELETE /api/v1/cms/contact/submissions/<id>/`
- Filters: `search`, `status`, `inquiry_type`, `assigned_to`, `priority`, `from`, `to`

### UI Requirements

- **Two-tab layout**: "Submissions" and "Inquiry Types".
- **Submissions tab**: Table with full_name, email, status badge, priority badge, inquiry_type, assigned_to, created_at. Filter by status, priority, inquiry_type, assigned_to, date range. Search. Click row → detail view.
- **Submission detail**: Read-only contact info section + editable management section (status, priority, assigned_to, internal_notes). Save via PATCH. Display delivery audit fields (read-only).
- **Inquiry Types tab**: List with name, slug, order, active, submission_count. Create/edit/delete. Delete shows confirmation with warning if submissions reference it.
- **No create for submissions** — they come from the public contact form.

---

## 20. Activity Logs UI

### Model

`@/f:/What_i_Made/New/sidrah_web/backend/apps/activity_logs/models.py`

### Existing UI

`@/f:/What_i_Made/New/sidrah_web/src/pages/cms/CMSActivityLogsPage.jsx` — already implemented with:
- Search, module filter, action filter, success filter, date range filters.
- Table with time, user, action, module, description, object, status badge.
- Pagination.
- Read-only (no create/edit/delete).

### API

- `GET /api/v1/admin/activity-logs/` — paginated, filterable list.
- `GET /api/v1/admin/activity-logs/<id>/` — single detail.
- All write methods return 405.

### Assessment

**Activity Logs UI is complete and production-ready.** No changes needed for this phase. The only enhancement would be adding it to the shared CMS layout navigation.

---

## 21. Media Library Integration

### Existing Implementation

The Media Library is **fully implemented** (backend + frontend) as of MEDIA-LIBRARY-CMS-001.

### Frontend Components

| Component | Path |
|-----------|------|
| `MediaLibraryPage` | `src/pages/cms/MediaLibraryPage.jsx` |
| `MediaCard` | `src/components/cms/media/MediaCard.jsx` |
| `MediaGrid` | `src/components/cms/media/MediaGrid.jsx` |
| `MediaUploadDialog` | `src/components/cms/media/MediaUploadDialog.jsx` |
| `MediaDetailsDialog` | `src/components/cms/media/MediaDetailsDialog.jsx` |
| `MediaAssetPicker` | `src/components/cms/media/MediaAssetPicker.jsx` |
| `mediaApi.js` | `src/services/cms/mediaApi.js` |

### Integration with Content Forms

The `MediaAssetPicker` component is **ready for reuse** in content forms. It provides:
- Search and pagination of existing assets.
- Upload toggle for adding new assets.
- Selection callback returning the chosen asset ID.
- The `media_asset_field()` on the backend accepts the asset ID as a primary key.

**Integration pattern for forms:**
```jsx
<MediaPickerField
  label="Featured Image"
  value={formData.featured_image}
  onChange={(id) => setFormData({ ...formData, featured_image: id })}
/>
```

The `MediaPickerField` wrapper would render a thumbnail preview (if value set), a "Choose" button that opens `MediaAssetPicker`, and a "Remove" button to clear the FK.

---

## 22. Form Architecture

### Current State

No shared form architecture exists. The `MediaUploadDialog` and `MediaDetailsDialog` have their own inline form handling.

### Recommended Architecture

1. **Form State Management:** Use React `useState` for form data. For complex forms (case studies, careers), consider `useReducer` or a lightweight form hook.
2. **Validation:** Client-side validation mirrors backend serializer validation. Display field-level errors from API response (`error.data` contains field-keyed error arrays).
3. **Submit:** JSON body for normal forms, `FormData` for file uploads.
4. **CSRF:** Include `X-CSRFToken` header from cookie for all unsafe requests.
5. **Media fields:** Use `MediaPickerField` wrapper component that opens `MediaAssetPicker`.
6. **Bilingual fields:** Side-by-side or tabbed (EN/AR) inputs for all `*_en` / `*_ar` field pairs.
7. **Slug fields:** Auto-generate from `*_en` title field with edit override.
8. **Boolean toggles:** Styled toggle switches for `is_active`, `is_featured`, `show_on_homepage`, etc.
9. **Select fields:** Styled dropdowns for choice fields (partner_type, employment_type, etc.).
10. **SEO section:** Collapsible section at the bottom of content forms.

### API Service Pattern

Each module needs a CMS API service file (e.g., `src/services/cms/partnersApi.js`) following the `mediaApi.js` pattern:
- Custom `moduleFetch` function with CSRF handling.
- `list(params)`, `get(id)`, `create(data)`, `update(id, data)`, `delete(id)`, and module-specific functions (reorder, workflow, etc.).

---

## 23. Data Listing Architecture

### Current State

`CMSActivityLogsPage` and `MediaLibraryPage` each implement their own listing logic independently. No shared table or pagination component exists.

### Recommended Architecture

1. **`CMSDataTable` component:** Accepts columns config, data, loading/error/empty states, and pagination props. Renders a styled table consistent with the activity logs table.
2. **`CMSToolbar` component:** Search input + filter selects + clear button. Configurable per module.
3. **`CMSPagination` component:** Previous/Next buttons + page info. Reusable across all list views.
4. **State management:** Each list page manages its own state (data, loading, error, filters, page). A custom `useCMSList` hook could standardize this.
5. **Filter synchronization:** URL search params could be used for shareable filter state (optional enhancement).

### Listing Page Pattern

```
CMSLayout
  └── Page Header (title + create button)
      └── CMSToolbar (search + filters)
          └── CMSDataTable (columns + data)
              └── CMSPagination
```

---

## 24. Mutation Feedback

### Current State

No notification/toast system exists. The `MediaUploadDialog` shows inline success/error messages. The `MediaDetailsDialog` shows inline error messages for delete conflicts.

### Recommendation

**Do NOT install a notification package.** Build a lightweight inline notification system:

1. **`CMSNotification` component:** Fixed-position toast that shows success/error messages. Auto-dismisses after 3-5 seconds.
2. **Notification context:** A `NotificationProvider` that wraps the CMS and provides `showSuccess(message)` and `showError(message)` functions.
3. **Inline error display:** Form errors are displayed inline per-field (from API `error.data`).
4. **Mutation feedback pattern:**
   - Create success: "Partner created successfully." + auto-navigate to list or detail.
   - Update success: "Changes saved." + refresh data.
   - Delete success: "Partner deleted." + refresh list.
   - Error: Show error message from API response.

---

## 25. Delete and Confirmation UX

### Current State

`MediaDetailsDialog` has a delete confirmation flow with typed confirmation for protected assets (in-use check). `CMSActivityLogsPage` has no delete (read-only).

### Recommendation

1. **`CMSConfirmDialog` component:** Reusable confirmation modal with:
   - Title, message, confirm button text, cancel button text.
   - Destructive style (red confirm button) for deletes.
   - Optional typed confirmation (type the item name to confirm).
2. **Delete flow:**
   - User clicks delete → `CMSConfirmDialog` opens.
   - Confirm → API DELETE call.
   - Success → notification + list refresh.
   - 409 conflict → show conflict message ("This item is referenced by N other items and cannot be deleted. Deactivate it instead.").
3. **Protected deletes:**
   - Inquiry Types: 409 if submissions reference them.
   - Media Assets: 409 if in use (checked via FK traversal).
4. **Hard deletes:** Partners, Services, Case Studies, Insights, Careers, Navigation Items/Menus — all use hard delete. No soft delete / trash recovery exists.

---

## 26. Workflow UX

### Current State

Only Insights (Articles) have workflow actions: publish, unpublish, archive.

### Workflow Pattern

1. **Status badge:** Color-coded in list view (draft=gray, published=green, archived=orange).
2. **Action buttons:** In detail view, show buttons based on valid transitions:
   - draft → [Publish] [Archive]
   - published → [Unpublish] [Archive]
   - archived → [Publish]
3. **Capability check:** Only show workflow buttons if user has `publish` capability.
4. **API call:** POST to `/api/v1/cms/insights/<id>/publish/` (or unpublish/archive).
5. **Invalid transition:** API returns 400 with `code: 'invalid_transition'`. Show error message.
6. **Success:** Refresh detail data, update status badge, update available action buttons.

### Future Workflow Candidates

- **Careers:** Could add publish/unpublish (currently just is_active boolean).
- **Contact submissions:** Status workflow (new → contacted → in_progress → closed) is managed via PATCH, not dedicated endpoints.

---

## 27. Route Architecture

### Recommended CMS Routes

| Route | Page | Module |
|-------|------|--------|
| `/cms/login` | Login | — |
| `/cms` | Dashboard | dashboard |
| `/cms/site-settings` | Site Settings | site_settings |
| `/cms/navigation` | Navigation Management | navigation |
| `/cms/partners` | Partners List | partners |
| `/cms/partners/:id` | Partner Detail/Edit | partners |
| `/cms/services` | Services List | services |
| `/cms/services/:id` | Service Detail/Edit | services |
| `/cms/case-studies` | Case Studies List | case_studies |
| `/cms/case-studies/:id` | Case Study Detail/Edit | case_studies |
| `/cms/insights` | Insights List | insights |
| `/cms/insights/:id` | Article Detail/Edit | insights |
| `/cms/careers` | Careers List | careers |
| `/cms/careers/:id` | Job Detail/Edit | careers |
| `/cms/contact` | Contact Submissions List | contact |
| `/cms/contact/:id` | Submission Detail | contact |
| `/cms/contact/inquiry-types` | Inquiry Types List | contact |
| `/cms/contact/inquiry-types/:id` | Inquiry Type Detail/Edit | contact |
| `/cms/media` | Media Library | media |
| `/cms/activity-logs` | Activity Logs | activity_logs |

**Recommended CMS route count: 20** (1 login + 1 dashboard + 9 module list pages + 8 detail/edit pages + 1 contact inquiry-types list + 1 contact inquiry-types detail).

### Alternative: Modal-based Detail

Instead of separate detail routes, detail/edit could be modals over the list page (as `MediaLibraryPage` does). This reduces route count to ~12 but limits deep-linking and browser back button support.

**Recommendation:** Use separate routes for detail/edit pages for all modules except Media Library (which already has a modal-based UI). This provides better UX for large forms (case studies, careers) and enables deep-linking.

---

## 28. Frontend File Plan

### New Files to Create

#### Shared Components

```
src/components/cms/
  CMSLayout.jsx                    — Shared layout wrapper
  CMSHeader.jsx                    — Shared header (brand, nav, user, logout)
  CMSBreadcrumb.jsx                — Breadcrumb navigation
  CMSDataTable.jsx                 — Reusable table for list views
  CMSToolbar.jsx                   — Search + filter toolbar
  CMSPagination.jsx                — Pagination controls
  CMSFormDialog.jsx                — Modal form wrapper
  CMSConfirmDialog.jsx             — Delete confirmation modal
  CMSFormField.jsx                 — Form field wrapper (label, error, hint)
  CMSInput.jsx                     — Styled text input
  CMSTextarea.jsx                  — Styled textarea
  CMSSelect.jsx                    — Styled select dropdown
  CMSToggle.jsx                    — Boolean toggle switch
  CMSBadge.jsx                     — Status/role badge
  CMSMediaPickerField.jsx          — Media asset picker form field
  CMSEmptyState.jsx                — Empty state placeholder
  CMSLoadingState.jsx              — Loading spinner/skeleton
  CMSErrorState.jsx                — Error display
  CMSNotification.jsx              — Toast notification
  CMSTabBar.jsx                    — Tab navigation
  cmsStyles.js                     — Shared design tokens and style objects
```

#### Notification Context

```
src/contexts/
  NotificationContext.jsx          — Toast notification provider
```

#### CMS API Services

```
src/services/cms/
  dashboardApi.js                  — Dashboard aggregated data
  siteSettingsApi.js               — Site settings CMS endpoints
  navigationApi.js                 — Navigation CMS endpoints
  partnersApi.js                   — Partners CMS endpoints
  servicesApi.js                   — Services CMS endpoints
  caseStudiesApi.js                — Case studies CMS endpoints
  insightsApi.js                   — Insights CMS endpoints
  careersApi.js                    — Careers CMS endpoints
  contactApi.js                    — Contact CMS endpoints (inquiry types + submissions)
```

#### CMS Pages

```
src/pages/cms/
  CMSDashboardPage.jsx             — (REPLACE existing) Real dashboard with stats
  SiteSettingsPage.jsx             — Site settings form
  NavigationPage.jsx               — Navigation management (menus + items)
  PartnersPage.jsx                 — Partners list
  PartnerDetailPage.jsx            — Partner create/edit
  ServicesPage.jsx                 — Services list
  ServiceDetailPage.jsx            — Service create/edit
  CaseStudiesPage.jsx              — Case studies list
  CaseStudyDetailPage.jsx          — Case study create/edit
  InsightsPage.jsx                 — Insights list
  InsightDetailPage.jsx            — Article create/edit
  CareersPage.jsx                  — Careers list
  CareerDetailPage.jsx             — Job create/edit
  ContactSubmissionsPage.jsx       — Contact submissions list
  ContactSubmissionDetailPage.jsx  — Submission detail/management
  InquiryTypesPage.jsx             — Inquiry types list
  InquiryTypeDetailPage.jsx        — Inquiry type create/edit
```

#### Custom Hooks (Optional)

```
src/hooks/
  useCMSList.js                    — Standardized list data fetching + pagination
  useCMSDetail.js                  — Standardized detail data fetching
  useCMSMutation.js                — Standardized create/update/delete with feedback
```

### Files to Modify

| File | Change |
|------|--------|
| `src/App.jsx` | Add all new CMS routes |
| `src/pages/cms/CMSDashboardPage.jsx` | Replace with real dashboard UI |
| `src/pages/cms/CMSActivityLogsPage.jsx` | Wrap in CMSLayout (optional) |
| `src/pages/cms/MediaLibraryPage.jsx` | Wrap in CMSLayout (optional) |

### Files NOT to Modify

- All backend files (no backend changes required for UI phase — see §29).
- All public-facing frontend components.
- `src/contexts/AuthContext.jsx` (sufficient as-is).
- `src/components/auth/ProtectedRoute.jsx` (sufficient as-is).
- `src/services/authApi.js` (sufficient as-is).
- `src/services/activityLogsApi.js` (sufficient as-is).
- `src/services/cms/mediaApi.js` (sufficient as-is).
- All `src/components/cms/media/*` components (sufficient as-is).

---

## 29. Backend Change Assessment

### Assessment: **No backend changes required for the UI phase.**

All 42 CMS API endpoints are fully functional with:
- RBAC enforcement via `CMSViewMixin` + `HasModulePermission`.
- Activity logging via `log_cms_action`.
- Pagination via `CMSPagination`.
- Filtering, search, and ordering on all list endpoints.
- Media asset references via `MediaAssetReferenceSerializer` + `media_asset_field()`.
- Workflow actions for insights (publish/unpublish/archive).
- Protected deletion for inquiry types and media assets (409 conflict).
- Read-only activity logs with 405 for all write methods.

### Minor Backend Gaps (Optional, Not Blocking)

1. **Dashboard API missing media stats:** `CMSDashboardView` does not include media library counts. This is a minor enhancement — add `if 'media' in modules: stats['media'] = { 'total': ..., 'active': ... }`. **Not blocking for UI implementation** — the dashboard can show media stats if present and gracefully omit if absent.

2. **No reorder endpoint for case studies:** Partners and services have reorder endpoints. Case studies also have a reorder endpoint (confirmed in `cms_urls.py`). Careers and insights do **not** have reorder endpoints. This is acceptable — display_order can be set via the update form.

3. **No bulk actions:** No bulk publish, bulk delete, or bulk status change endpoints. This is acceptable for the initial UI phase.

---

## 30. User Management Boundary

### Current State

- `users` module is defined in `roles.py` with `view` action for admin role.
- `CanManageUsers` permission class exists.
- **No user management API endpoints exist.**
- **No user management UI exists.**
- The `/api/v1/admin/` namespace only has `dashboard/access/`.

### Recommendation

**User management is explicitly out of scope for CUSTOM-CMS-DASHBOARD-UI-001.** The CMS dashboard should:
- Show a "Users" nav link only if `hasModuleAccess('users')` returns true.
- The link can be a placeholder page saying "User management coming soon" or simply not rendered.
- Do NOT create user management API endpoints or UI in this phase.

---

## 31. Rich Text Editor Decision

### Need

The `Article` model (insights) has `body_en` and `body_ar` TextField fields that store rich text content. The current public `InsightDetailPage` renders this as raw text (no HTML parsing). The CMS needs a way for content editors to format articles.

### Options

| Option | Pros | Cons |
|--------|------|------|
| **A. Plain textarea** | Zero dependencies, simplest | No formatting, poor UX for articles |
| **B. Lightweight markdown editor** (e.g., `react-markdown` + `marked`) | Simple, no heavy deps, stores markdown | Limited formatting, learning curve for non-technical users |
| **C. TipTap (ProseMirror)** | Rich WYSIWYG, extensible, React-friendly | ~100KB bundle, moderate complexity |
| **D. Quill** | Popular, simple WYSIWYG | Larger bundle, less React-native |
| **E. Slate.js** | Full control, React-native | Steep learning curve, more code |

### Recommendation

**Decision: Use TipTap (`@tiptap/react` + `@tiptap/starter-kit`).**

Rationale:
- **React-native** — integrates cleanly with the existing React 19 stack.
- **Modular** — start with starter-kit (bold, italic, headings, lists, links, code), add extensions later.
- **Stores HTML** — compatible with the existing `TextField` storage and the public site's rendering.
- **~100KB gzipped** — acceptable for a CMS admin bundle (not on the public site).
- **Active maintenance** and good documentation.
- **No server-side changes needed** — the editor outputs HTML strings stored in `body_en` / `body_ar`.

### Implementation Notes

- Install: `npm install @tiptap/react @tiptap/starter-kit`
- Create `src/components/cms/RichTextEditor.jsx` wrapping TipTap with the CMS dark theme styles.
- Use in `InsightDetailPage` for `body_en` and `body_ar` fields.
- **Do NOT install during investigation** — install during implementation phase only.

### Sanitization

- **Backend:** Consider adding HTML sanitization on the backend (e.g., `bleach`) in a future phase. For now, trust CMS editors (authenticated, authorized users).
- **Frontend public rendering:** The public `InsightDetailPage` should use `dangerouslySetInnerHTML` with caution. Consider a sanitization library on the public side in a future phase.

---

## 32. Performance

### Considerations

1. **Bundle size:** Adding ~15 new pages and ~20 new components will increase the bundle. Use **React.lazy** + **Suspense** for code-splitting CMS routes (not currently done).
2. **API calls:** The dashboard API is a single aggregated call — efficient. List pages make one call per page. Detail pages make one call. No N+1 issues.
3. **Pagination:** All list endpoints are paginated (20 per page, max 100). No unbounded queries.
4. **Media assets:** Media library uses thumbnail previews. Consider adding thumbnail generation on the backend in a future phase (currently serves full images as thumbnails).
5. **Search:** All search uses `icontains` — acceptable for moderate data volumes. Full-text search can be added later if needed.
6. **Caching:** No frontend caching layer exists. Consider `useMemo` for expensive renders and optional `stale-while-revalidate` pattern for list data.

### Recommendations

- Use `React.lazy` for all CMS pages except the dashboard (which should load eagerly).
- Implement a `useCMSList` hook with built-in debouncing for search input.
- Do NOT add a caching library (React Query, SWR) in this phase — keep dependencies minimal.

---

## 33. Accessibility

### Current State

- Login page has proper `label` + `input` associations with `htmlFor` / `id`.
- Media library page has `aria-label` on search input and filter selects.
- Media cards have keyboard support (Enter/Space to open).
- No `aria-live` regions for dynamic content.
- No focus trapping in modals (upload/details dialogs).

### Recommendations

1. **Modals:** Implement focus trapping in all dialog components. Return focus to trigger element on close. Add `role="dialog"` and `aria-modal="true"`.
2. **Tables:** Use proper `<table>` semantics with `<thead>`, `<tbody>`, `<th scope="col">`.
3. **Forms:** All inputs have associated `<label>` elements. Error messages have `aria-describedby` pointing to error text.
4. **Navigation:** Use `<nav>` with `aria-label="CMS navigation"`. Active link has `aria-current="page"`.
5. **Notifications:** Toast notifications have `role="alert"` or `aria-live="polite"`.
6. **Keyboard:** All interactive elements are keyboard accessible. Tab order is logical.
7. **Color contrast:** The dark theme with gold accent (`#c9a96e` on `#0a0a14`) has sufficient contrast for text. Error red (`#ef4444`) on dark background is also sufficient.

---

## 34. Security

### Current Security Posture (Validated)

From SIDRAHSOFT-CMS-FOCUSED-E2E-VALIDATION-001:
- ✅ CSRF enforced on login/logout (via `@csrf_protect` decorator).
- ✅ Session cookies HttpOnly + SameSite=Lax.
- ✅ No tokens in localStorage.
- ✅ Login throttle: 5/min.
- ✅ Contact throttle: 5/min.
- ✅ Activity logs append-only (POST/PATCH/DELETE = 405).
- ✅ No sensitive data in log metadata.
- ✅ Serializer safety confirmed (no internal field injection).
- ✅ All CMS models registered in Django admin.

### Security Considerations for UI Phase

1. **XSS via rich text:** If using TipTap, the editor outputs HTML. The public site must sanitize before rendering. In the CMS itself, the editor is trusted (authenticated users). **Add HTML sanitization to public rendering in a future phase.**
2. **CSRF on all mutations:** All CMS API services must include the `X-CSRFToken` header for POST/PUT/PATCH/DELETE. The `mediaApi.js` pattern should be followed.
3. **RBAC enforcement:** The backend enforces RBAC via `HasModulePermission`. The frontend should **also** hide UI elements based on capabilities, but this is UX only — the backend is the security boundary.
4. **No secrets in frontend:** The frontend never has access to passwords, tokens, or session secrets. The `CMSUserSerializer` excludes sensitive fields.
5. **Media upload validation:** Already implemented (extension, MIME, size, dimensions, decompression bomb).
6. **Delete confirmation:** All deletes require confirmation. Protected deletes (inquiry types, media assets) return 409 if referenced.

---

## 35. Implementation Sequence

### Phase 1: Foundation (Shared Components + Layout)

1. Create `cmsStyles.js` with design tokens.
2. Create `CMSLayout`, `CMSHeader`, `CMSBreadcrumb`.
3. Create `CMSNotification` + `NotificationContext`.
4. Create form components: `CMSInput`, `CMSTextarea`, `CMSSelect`, `CMSToggle`, `CMSFormField`, `CMSMediaPickerField`.
5. Create `CMSDataTable`, `CMSToolbar`, `CMSPagination`.
6. Create `CMSConfirmDialog`, `CMSFormDialog`.
7. Create state components: `CMSEmptyState`, `CMSLoadingState`, `CMSErrorState`, `CMSBadge`, `CMSTabBar`.

### Phase 2: CMS API Services

8. Create `src/services/cms/dashboardApi.js`.
9. Create `src/services/cms/siteSettingsApi.js`.
10. Create `src/services/cms/navigationApi.js`.
11. Create `src/services/cms/partnersApi.js`.
12. Create `src/services/cms/servicesApi.js`.
13. Create `src/services/cms/caseStudiesApi.js`.
14. Create `src/services/cms/insightsApi.js`.
15. Create `src/services/cms/careersApi.js`.
16. Create `src/services/cms/contactApi.js`.

### Phase 3: Dashboard

17. Replace `CMSDashboardPage` with real dashboard: stat cards, recent activity widget, recent contact submissions widget, module quick-links.

### Phase 4: Simple CRUD Modules (No Workflow)

18. Implement `PartnersPage` + `PartnerDetailPage`.
19. Implement `ServicesPage` + `ServiceDetailPage`.
20. Implement `CaseStudiesPage` + `CaseStudyDetailPage`.
21. Implement `CareersPage` + `CareerDetailPage`.

### Phase 5: Complex Modules (Workflow / Special UI)

22. Implement `InsightsPage` + `InsightDetailPage` (with rich text editor + workflow buttons).
23. Implement `ContactSubmissionsPage` + `ContactSubmissionDetailPage` + `InquiryTypesPage` + `InquiryTypeDetailPage`.
24. Implement `NavigationPage` (menus + items + reorder).
25. Implement `SiteSettingsPage` (singleton form).

### Phase 6: Integration + Polish

26. Update `App.jsx` with all new routes.
27. Wrap existing pages (`MediaLibraryPage`, `CMSActivityLogsPage`) in `CMSLayout`.
28. Add all module nav links to `CMSHeader` with capability-based visibility.
29. Run `npm run build` for regression.
30. Run lightweight validation script.

### Phase 7: Rich Text Editor

31. Install TipTap (`@tiptap/react @tiptap/starter-kit`).
32. Create `RichTextEditor.jsx`.
33. Integrate into `InsightDetailPage` for `body_en` / `body_ar`.

---

## 36. Validation Plan

### Build Validation

```bash
npm run build
```
Must succeed with no errors.

### Backend Health Check

```bash
python manage.py check
python manage.py migrate --plan
```
Must pass with no warnings.

### Route Verification

- All CMS routes defined in `App.jsx`.
- All CMS API services can be imported without errors.
- No broken imports or missing dependencies.

### Visual Verification

- Dashboard renders stat cards, recent activity, recent contact submissions.
- Each module list page renders table with search/filter/pagination.
- Each module detail page renders form with all model fields.
- Media picker opens and returns selected asset ID.
- Delete confirmation works for all modules.
- Workflow buttons work for insights (publish/unpublish/archive).
- Navigation links are capability-aware (hidden for users without access).
- All pages use shared `CMSLayout` with consistent header.

### Regression

- Existing `MediaLibraryPage` still works.
- Existing `CMSActivityLogsPage` still works.
- Existing `CMSLoginPage` still works.
- Public site routes unaffected.

---

## 37. Verdict and Summary

### Final Verdict

**READY FOR CUSTOM-CMS-DASHBOARD-UI-001**

### Backend Change Requirement

**None.** All 42 CMS API endpoints are fully functional with RBAC, activity logging, pagination, filtering, and media asset references. No backend changes are required for the UI implementation phase.

### Rich-Text Editor Decision

**TipTap (`@tiptap/react` + `@tiptap/starter-kit`)** — React-native, modular, stores HTML, ~100KB gzipped. Install during implementation, not during investigation.

### Recommended CMS Route Count

**20 routes** (1 login + 1 dashboard + 9 module list pages + 8 detail/edit pages + 1 inquiry-types list + 1 inquiry-types detail).

### Concise Blockers or Deferred Items

1. **User Management** — explicitly out of scope. No API or UI.
2. **Rich text HTML sanitization on public rendering** — deferred to a future security phase.
3. **Backend media stats in dashboard API** — minor gap, not blocking. Dashboard UI gracefully handles missing stats.
4. **Thumbnail generation for media assets** — deferred. Currently serves full images as thumbnails.
5. **Full i18n / RTL for CMS** — deferred. English-only is acceptable for admin tool.
6. **Bulk actions** (bulk publish, bulk delete) — deferred to a future enhancement phase.
7. **Reorder endpoints for careers and insights** — not available. Display order is set via update form.

### Confirmation

**No code or database data was modified during this investigation.** All inspection was read-only. No packages were installed. No migrations were created. No tests were executed. No temporary data was created.
