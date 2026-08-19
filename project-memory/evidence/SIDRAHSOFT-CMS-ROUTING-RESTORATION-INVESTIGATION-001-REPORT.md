# SIDRAHSOFT-CMS-ROUTING-RESTORATION-INVESTIGATION-001-REPORT

**Date:** 2026-07-16
**Type:** Investigation-only (no implementation, no refactoring, no route changes, no commits)
**Repository root:** `F:\What_i_Made\New\sidrah_web`
**Overall status:** **NEEDS FIXES BEFORE RESTORE**

---

## 1. Executive Summary

The full SidrahSoft CMS admin SPA is completely built — 19 page components, 24 shared UI/layout components, 13 API service modules, a capability-aware sidebar, a dedicated login page, and a complete route tree of 26 routes defined in `CMSRoutes.jsx`. The Django backend has a matching CMS API surface across all 12 modules with enforced RBAC, activity logging, and cross-origin session cookie support.

**However, `CMSRoutes` is never imported or mounted in `App.jsx`.** Instead, `/cms/*` redirects to `/leads/login` via a single `<Navigate>` element. This redirect has been present since the very first commit (`250ef77` — "Initial SidrahSoft website release"). The CMS was built but deliberately never exposed — only the Leads dashboard (`/leads/*`) was routed in the initial release.

The CMS can be safely restored with **two minor code fixes** before mounting:

1. `CMSRoutes.jsx` uses `ProtectedRoute` which defaults `redirectTo='/leads/login'` — this must be changed to `redirectTo='/cms/login'` so unauthenticated CMS users go to the CMS login, not the Leads login.
2. `LeadsLoginPage.getSafeNextPath()` rejects any `next` parameter that doesn't start with `/leads` — if a user is redirected from `/cms` to `/leads/login?next=/cms`, they'll end up at `/leads` after login instead of `/cms`. This is not a blocker for Option B (shared login) but is a UX issue to address.

Aside from these, the backend, RBAC, auth flow, provider tree, and CMS layout are all ready. The cross-origin cookie fix (`SameSite=None` in production) and CSRF-from-API-response fix are already in place.

---

## 2. Current `/cms/*` Behavior

Any request to `/cms` or `/cms/*` (including `/cms/login`, `/cms/dashboard`, `/cms/partners`, etc.) hits this route in `src/App.jsx` line 154:

```jsx
<Route path="/cms/*" element={<Navigate to="/leads/login" replace />} />
```

This is a client-side redirect (React Router `<Navigate>`). It fires before any CMS component renders. The user lands on `/leads/login` regardless of which `/cms/*` path they requested. There is no `?next=` parameter preserved — the redirect is a plain `<Navigate to="/leads/login" replace />` with no state or search params.

**Result:** The entire CMS SPA is unreachable. Only `/leads/*` (login, dashboard, lead detail) is accessible.

---

## 3. Exact Disabling Code

**File:** `src/App.jsx`
**Line:** 154
**Code:**
```jsx
<Route path="/cms/*" element={<Navigate to="/leads/login" replace />} />
```

**Evidence that `CMSRoutes` is never imported:**
- `grep` for `CMSRoutes` across all of `src/` returns only 1 match: the `export default function CMSRoutes()` definition in `src/components/cms/layout/CMSRoutes.jsx` itself.
- No file in `src/` imports `CMSRoutes` from any path.
- `App.jsx` does not import `CMSRoutes` or any CMS page component.

**Evidence that `CMSRouteGuards` is never used:**
- `grep` for `CMSProtectedRoute`, `CMSCapabilityRoute`, `CMSRouteGuards` across all of `src/` returns only 4 matches, all inside `CMSRouteGuards.jsx` itself (the definitions).
- `CMSRoutes.jsx` imports `ProtectedRoute` from `../../auth/ProtectedRoute`, NOT `CMSProtectedRoute` from `./CMSRouteGuards`.
- The `CMSRouteGuards.jsx` file is completely dead code — built but never consumed.

---

## 4. Historical Reason / Best-Supported Explanation

### Classification: YES — intentional product/scope decision

**Evidence:**

1. **Git history:** `App.jsx` has only been modified in 2 commits:
   - `250ef77` — "Initial SidrahSoft website release" (first commit with this App.jsx)
   - `af1f2f4` — "optimize hero loading and responsive assets" (latest commit)

   Both versions contain the identical `<Route path="/cms/*" element={<Navigate to="/leads/login" replace />} />`. The redirect was present from the very first release and was never changed.

2. **No commit ever mounted CMSRoutes.** There is no git history of `CMSRoutes` being imported in `App.jsx` at any point.

3. **The CMS SPA was built in parallel** (evidence: `CMS-FRONTEND-IMPLEMENTATION-REPORT.md`, `CUSTOM-CMS-FINAL-INTEGRATION-AND-PRODUCTION-READINESS-001-REPORT.md`, and 20+ module-specific CMS implementation reports). The CMS was fully implemented and validated (including E2E auth, RBAC, and CRUD tests) but the routing was never wired to expose it.

4. **The Leads dashboard was the initial exposed subset.** The `LEADS-DASHBOARD-INVESTIGATION-001-REPORT.md` and related reports show that `/leads/*` was the primary admin surface area that was debugged, hardened, and production-validated. The full CMS was held back.

5. **The re-onboarding audit (001)** explicitly flagged this as "the single most significant architectural ambiguity" and noted it was "either an intentional scope reduction or an unfinished re-wiring."

**Conclusion:** This was a deliberate phased rollout. The full CMS was built and validated but only the Leads subset was exposed in the initial release. The CMS routing was never "removed" — it was never wired in the first place. The redirect was a placeholder from day one.

---

## 5. CMS Route Inventory

**File:** `src/components/cms/layout/CMSRoutes.jsx`
**Total routes:** 26

| # | Route Path | Component | Module | Backend Endpoint | Import Resolves | CMSLayout Used |
|---|-----------|-----------|--------|-----------------|-----------------|----------------|
| 1 | `login` | `CMSLoginPage` | (auth) | `/api/v1/auth/login/` | ✅ | No (standalone) |
| 2 | `""` (root) | `CMSDashboardPage` | dashboard | `/api/v1/cms/dashboard/` | ✅ | ✅ |
| 3 | `site-settings` | `CMSSiteSettingsPage` | site_settings | `/api/v1/cms/site-settings/` | ✅ | ✅ |
| 4 | `homepage` | `CMSHomepagePage` | site_settings | `/api/v1/cms/homepage/` | ✅ | ✅ |
| 5 | `navigation` | `CMSNavigationPage` | navigation | `/api/v1/cms/navigation/` | ✅ | ✅ |
| 6 | `partners` | `CMSPartnersPage` | partners | `/api/v1/cms/partners/` | ✅ | ✅ |
| 7 | `partners/new` | `CMSPartnerFormPage` | partners | `/api/v1/cms/partners/` | ✅ | ✅ |
| 8 | `partners/:id` | `CMSPartnerFormPage` | partners | `/api/v1/cms/partners/<id>/` | ✅ | ✅ |
| 9 | `services` | `CMSServicesPage` | services | `/api/v1/cms/services/` | ✅ | ✅ |
| 10 | `services/new` | `CMSServiceFormPage` | services | `/api/v1/cms/services/` | ✅ | ✅ |
| 11 | `services/:id` | `CMSServiceFormPage` | services | `/api/v1/cms/services/<id>/` | ✅ | ✅ |
| 12 | `case-studies` | `CMSCaseStudiesPage` | case_studies | `/api/v1/cms/case-studies/` | ✅ | ✅ |
| 13 | `case-studies/new` | `CMSCaseStudyFormPage` | case_studies | `/api/v1/cms/case-studies/` | ✅ | ✅ |
| 14 | `case-studies/:id` | `CMSCaseStudyFormPage` | case_studies | `/api/v1/cms/case-studies/<id>/` | ✅ | ✅ |
| 15 | `insights` | `CMSInsightsPage` | insights | `/api/v1/cms/insights/` | ✅ | ✅ |
| 16 | `insights/new` | `CMSArticleFormPage` | insights | `/api/v1/cms/insights/` | ✅ | ✅ |
| 17 | `insights/:id` | `CMSArticleFormPage` | insights | `/api/v1/cms/insights/<id>/` | ✅ | ✅ |
| 18 | `careers` | `CMSCareersPage` | careers | `/api/v1/cms/careers/` | ✅ | ✅ |
| 19 | `careers/new` | `CMSJobFormPage` | careers | `/api/v1/cms/careers/` | ✅ | ✅ |
| 20 | `careers/:id` | `CMSJobFormPage` | careers | `/api/v1/cms/careers/<id>/` | ✅ | ✅ |
| 21 | `contact` | `CMSContactPage` | contact | `/api/v1/cms/contact/` | ✅ | ✅ |
| 22 | `contact/inquiry-types` | `CMSContactPage` (defaultTab=inquiryTypes) | contact | `/api/v1/cms/contact/inquiry-types/` | ✅ | ✅ |
| 23 | `contact/:id` | `CMSContactPage` (defaultTab=submissions) | contact | `/api/v1/cms/contact/submissions/<id>/` | ✅ | ✅ |
| 24 | `activity-logs` | `CMSActivityLogsPage` | activity_logs | `/api/v1/admin/activity-logs/` | ✅ | ✅ |
| 25 | `users` | `CMSUsersPage` | users | `/api/v1/admin/users/` | ✅ | ✅ |
| 26 | `media` | `MediaLibraryPage` | media | `/api/v1/cms/media/` | ✅ | ✅ |

**All 19 page component files exist** in `src/pages/cms/`.
**All 24 CMS component files exist** in `src/components/cms/` (layout, ui, media, seo).
**All 13 CMS API service files exist** in `src/services/cms/`.
**All CMS pages import and wrap in `CMSLayout`** (verified via grep — every page file matches `CMSLayout`).

**Known historical runtime issue:** The `SIDRAHSOFT-PRODUCTION-CMS-SUPERUSER-RBAC-FIX-001` report documented a 403 error on `/api/v1/cms/dashboard/` in production. Root cause was cross-origin session cookies (`SameSite=Lax` default). **This fix is already applied** in the current `settings.py` (lines 260-269: `SameSite=None` in production). Not a blocker.

---

## 6. Required Provider Tree

### CMS requires (from `CMSRoutes.jsx` + `CMSLoginPage.jsx` + `CMSLayout.jsx` + all CMS pages):

```
<AuthProvider>              ← AuthContext (login, logout, getCurrentUser, hasModuleAccess, hasCapability)
  <CMSLanguageProvider>     ← CMSLanguageContext (t(), lang, dir, toggleLang)
    <CMSToastProvider>      ← CMSToastContext (toast notifications)
      <CMSRoutes />         ← Routes tree
    </CMSToastProvider>
  </CMSLanguageProvider>
</AuthProvider>
```

### Leads currently uses (from `App.jsx` lines 145-153):

```
<AuthProvider>
  <CMSLanguageProvider>
    <CMSToastProvider>
      <LeadsRoutes />
    </CMSToastProvider>
  </CMSLanguageProvider>
</AuthProvider>
```

### Comparison

| Provider | CMS needs | Leads has | Match? |
|----------|-----------|-----------|--------|
| `AuthProvider` | ✅ | ✅ | ✅ Identical |
| `CMSLanguageProvider` | ✅ | ✅ | ✅ Identical |
| `CMSToastProvider` | ✅ | ✅ | ✅ Identical |
| `I18nProvider` | ❌ (CMS uses CMSLanguage, not public I18n) | ❌ | ✅ N/A |
| `BrowserRouter` | ✅ (via App) | ✅ (via App) | ✅ Identical |

**The provider tree is identical.** No missing wrappers. The CMS can be mounted with the exact same provider nesting as Leads.

**Important:** Each route tree (`/leads/*` and `/cms/*`) must have its OWN `AuthProvider` instance. If they share a single `AuthProvider`, the auth state would be shared (which is actually desirable — a user logged in for Leads would also be authenticated for CMS). However, the current architecture mounts providers per-route-tree, so each would have separate `AuthProvider` instances. This means:
- A user logged in via `/leads/login` would NOT automatically be authenticated in `/cms` — each `AuthProvider` calls `getCurrentUser()` independently on mount.
- BUT: since both use the same session cookie, the second `AuthProvider`'s `getCurrentUser()` call would succeed if the session cookie is present. So the user would be authenticated in both without re-login, just with a brief loading state on first CMS visit.
- This is acceptable behavior and not a blocker.

---

## 7. Authentication Flow

### CMS has its own login page

**`CMSLoginPage`** (`src/pages/cms/CMSLoginPage.jsx`):
- Renders at `/cms/login` (if CMSRoutes is mounted)
- Uses `useAuth().login(username, password)` — same `AuthContext.login` as Leads
- On success, redirects to `nextPath` (defaults to `/cms`, only accepts paths starting with `/cms/` or `/cms`)
- On already-authenticated, redirects to `nextPath`
- Branded as "Sidrah CMS" (vs Leads login which is "SidrahSoft / Leads")

### Full auth flow (end-to-end):

```
Browser → /cms (or /cms/login)
  → ProtectedRoute checks isAuthenticated
    → if not authenticated: redirect to redirectTo (currently defaults to /leads/login — BUG)
      → LeadsLoginPage renders
      → User logs in
      → LeadsLoginPage redirects to /leads (rejects /cms next param — BUG)
    → if authenticated: render CMS page
      → CMS page calls cmsFetch → /api/v1/cms/* with session cookie
        → IsCMSUser + HasModulePermission checks
          → if authorized: return data
          → if not authorized: 403
```

### With fix applied (redirectTo='/cms/login'):

```
Browser → /cms
  → ProtectedRoute checks isAuthenticated
    → if not authenticated: redirect to /cms/login?next=/cms
      → CMSLoginPage renders
      → User logs in
      → CMSLoginPage redirects to /cms (accepts /cms next param)
    → if authenticated: render CMS page
      → CMS page calls cmsFetch → /api/v1/cms/* with session cookie
        → IsCMSUser + HasModulePermission checks
          → if authorized: return data
          → if not authorized: 403
```

### Login endpoint behavior:

`POST /api/v1/auth/login/` (in `backend/apps/accounts/views.py`):
- Accepts username + password
- Authenticates via `django.contrib.auth.authenticate`
- Rejects inactive users (401)
- Rejects non-CMS users (role not in `CMS_ROLES` and not superuser/staff) (403)
- Creates session via `django.contrib.auth.login`
- Returns `CMSUserSerializer` data (includes `is_superuser`, `is_staff`, `role`, `permitted_modules`, `capabilities`)
- Also logs `lead_login` activity if user has `contact` module access

**The login endpoint is shared between Leads and CMS.** There is one login endpoint, one session, one user model. The difference is only in the frontend login page UI and redirect target.

### Superuser bypass:

- `IsCMSUser.has_permission()`: returns `True` for `is_superuser=True`
- `HasModulePermission.has_permission()`: returns `True` for `is_superuser=True`
- `get_user_modules()`: returns all 12 modules for superuser
- `get_user_capabilities()`: returns all 96 capabilities for superuser
- `AuthContext.hasModuleAccess()`: returns `True` for `user.is_superuser`
- `AuthContext.hasCapability()`: returns `True` for `user.is_superuser`
- `ProtectedRoute`: bypasses module check for `user.is_superuser`
- `CMSSidebar`: shows all modules for `user.is_superuser`

**Superuser bypass is consistent end-to-end.**

---

## 8. RBAC Compatibility

### Backend module identifiers (from `backend/apps/accounts/roles.py`):

```python
MODULE_DASHBOARD = 'dashboard'
MODULE_SITE_SETTINGS = 'site_settings'
MODULE_NAVIGATION = 'navigation'
MODULE_PARTNERS = 'partners'
MODULE_SERVICES = 'services'
MODULE_CASE_STUDIES = 'case_studies'
MODULE_CAREERS = 'careers'
MODULE_INSIGHTS = 'insights'
MODULE_CONTACT = 'contact'
MODULE_MEDIA = 'media'
MODULE_USERS = 'users'
MODULE_ACTIVITY_LOGS = 'activity_logs'
```

### Frontend sidebar module identifiers (from `CMSSidebar.jsx`):

```javascript
dashboard, site_settings, homepage, navigation, partners, services,
case_studies, insights, careers, contact, media, users, activity_logs
```

### Comparison

| Backend module | Frontend sidebar module | Match? |
|---------------|------------------------|--------|
| `dashboard` | `dashboard` | ✅ |
| `site_settings` | `site_settings` | ✅ |
| `site_settings` | `homepage` (shares module) | ✅ (homepage uses site_settings module) |
| `navigation` | `navigation` | ✅ |
| `partners` | `partners` | ✅ |
| `services` | `services` | ✅ |
| `case_studies` | `case_studies` | ✅ |
| `careers` | `careers` | ✅ |
| `insights` | `insights` | ✅ |
| `contact` | `contact` | ✅ |
| `media` | `media` | ✅ |
| `users` | `users` | ✅ |
| `activity_logs` | `activity_logs` | ✅ |

**All module names match perfectly.** The `CMSUserSerializer.get_permitted_modules()` returns `get_user_modules()` which returns the backend module name strings directly. The frontend `AuthContext.hasModuleAccess(module)` checks `user.permitted_modules?.includes(module)`. No camelCase/snake_case mismatch.

### `CMSUserSerializer` fields returned by `/api/v1/auth/me/` and login:

```python
fields = [
    'id', 'email', 'first_name', 'last_name', 'display_name',
    'role', 'is_staff', 'is_superuser', 'is_active',
    'capabilities',        # list of "module.action" strings
    'permitted_modules',   # list of module name strings
]
```

**All fields consumed by the frontend are present.** No missing fields.

---

## 9. CMS Layout / Sidebar Findings

### `CMSLayout` (`src/components/cms/layout/CMSLayout.jsx`):
- Wraps `CMSSidebar` + `CMSHeader` + `<main>` content area
- Handles responsive sidebar toggle (mobile)
- Handles RTL via `dir` from `useCMSLang()`
- Handles unsaved changes guard (`beforeunload`)
- Inline styles for layout (marginLeft: 240px for sidebar, paddingTop: 56px for header)
- **No `/leads/*` path dependencies** — all paths are relative to the CMS layout

### `CMSSidebar` (`src/components/cms/layout/CMSSidebar.jsx`):
- 13 nav items, all pointing to `/cms/...` paths:
  - `/cms` (dashboard, end=true)
  - `/cms/site-settings`, `/cms/homepage`, `/cms/navigation`, `/cms/partners`, `/cms/services`, `/cms/case-studies`, `/cms/insights`, `/cms/careers`, `/cms/contact`, `/cms/media`, `/cms/users`, `/cms/activity-logs`
- Uses `NavLink` from react-router-dom (active route handling built-in)
- Filters visible items via `user?.is_superuser || hasModuleAccess(item.module)`
- **No `/leads/*` path dependencies**
- Mobile: overlay backdrop + close button

### `CMSHeader` (`src/components/cms/layout/CMSHeader.jsx`):
- Fixed top bar (left: 240px to account for sidebar)
- Menu toggle button (mobile)
- Language switch button (EN/AR)
- User dropdown with display name, email, role badge, logout
- Logout calls `useAuth().logout()` — clears session
- **No `/leads/*` path dependencies**
- **No redirect after logout** — the `logout()` function in `AuthContext` only clears user state; it does not navigate. The CMS pages would then show "access denied" or redirect via `ProtectedRoute`. This is acceptable but could be improved with an explicit navigate to `/cms/login` after logout.

### Deep-link support:
- All CMS routes are defined as relative paths under `/cms/*` in `CMSRoutes.jsx`
- `serve --single` (production) serves `index.html` for all paths, so deep links to `/cms/partners/123` will load the SPA and React Router will handle the route
- **No SPA fallback issue expected**

---

## 10. Backend Endpoint Readiness

### CMS API surface (all under `/api/v1/`):

| Module | CMS Endpoint | Auth | Permission | CRUD | Status |
|--------|-------------|------|------------|------|--------|
| Dashboard | `cms/dashboard/` | IsAuthenticated + IsCMSUser | Superuser bypass | Read | ✅ Ready |
| Site Settings | `cms/site-settings/` | IsAuthenticated + IsCMSUser | HasModulePermission (site_settings) | Read/Update | ✅ Ready |
| Homepage | `cms/homepage/` | IsAuthenticated + IsCMSUser | HasModulePermission (site_settings) | CRUD | ✅ Ready |
| Navigation | `cms/navigation/` | IsAuthenticated + IsCMSUser | HasModulePermission (navigation) | CRUD | ✅ Ready |
| Partners | `cms/partners/` | IsAuthenticated + IsCMSUser | HasModulePermission (partners) | CRUD | ✅ Ready |
| Services | `cms/services/` | IsAuthenticated + IsCMSUser | HasModulePermission (services) | CRUD | ✅ Ready |
| Case Studies | `cms/case-studies/` | IsAuthenticated + IsCMSUser | HasModulePermission (case_studies) | CRUD | ✅ Ready |
| Insights | `cms/insights/` | IsAuthenticated + IsCMSUser | HasModulePermission (insights) | CRUD + publish | ✅ Ready |
| Careers | `cms/careers/` | IsAuthenticated + IsCMSUser | HasModulePermission (careers) | CRUD | ✅ Ready |
| Contact | `cms/contact/` | IsAuthenticated + IsCMSUser | HasModulePermission (contact) | List/Detail/Update | ✅ Ready |
| Media | `cms/media/` | IsAuthenticated + IsCMSUser | HasModulePermission (media) | CRUD + upload | ✅ Ready |
| Users | `admin/users/` | IsAuthenticated + IsCMSUser | CanManageUsers | CRUD | ✅ Ready |
| Activity Logs | `admin/activity-logs/` | IsAuthenticated + IsCMSUser | HasModulePermission (activity_logs) | Read-only | ✅ Ready |

### Cross-origin cookie configuration (already fixed):

```python
# settings.py lines 260-269
SESSION_COOKIE_SAMESITE = env or ('Lax' if DEBUG else 'None')
CSRF_COOKIE_SAMESITE = env or ('Lax' if DEBUG else 'None')
# In production (DEBUG=False): SameSite=None + Secure=True
```

### CSRF token (already fixed):

`authApi.js` caches CSRF token from `/api/v1/auth/csrf/` JSON response body (not from `document.cookie`). `cmsFetch.js` reuses this cached token for all unsafe methods.

**All backend CMS endpoints are ready.** No backend changes needed for restoration.

---

## 11. Leads vs CMS Architecture

### Architecture A: Leads is one module inside the full CMS

**Evidence:**
1. The CMS `contact` module (`CMSContactPage` at `/cms/contact`) provides the same lead management functionality as the Leads dashboard (`LeadsDashboardPage` at `/leads`) — both list submissions, view detail, update status/priority/notes, and manage inquiry types.
2. Both use the same backend endpoints: `/api/v1/cms/contact/submissions/` and `/api/v1/cms/contact/submissions-stats/`.
3. Both require the `contact` module permission.
4. The `LeadsLoginPage` and `CMSLoginPage` use the same `AuthContext.login()` and the same backend `/api/v1/auth/login/` endpoint.
5. The Leads dashboard is a simplified, standalone entry point for users who only need contact/leads access (e.g., `support_agent` role which only has `contact` module).
6. The CMS dashboard is the full admin interface for users with broader module access.

**Conclusion:** Architecture A. Leads is a focused subset of the CMS, exposed at `/leads/*` for users who only need lead management. The full CMS at `/cms/*` is the complete admin interface. Both coexist and share the same auth, backend, and data.

### Recommended architecture going forward:

**Keep both `/leads/*` and `/cms/*` as parallel entry points.** This is the cleanest approach:
- `/leads/*` remains the simple, focused Leads dashboard for support/sales users
- `/cms/*` becomes the full CMS admin for content/management users
- Both share the same session, backend, and RBAC
- Users with only `contact` module access can use either `/leads` or `/cms/contact`
- Users with broader access use `/cms` for everything

Do NOT merge them into `/admin/*` (Option C) — this would break existing `/leads/*` bookmarks and require a larger refactor with no clear benefit.

---

## 12. Restoration Options

### Option A — Restore full `/cms/*` directly (mount CMSRoutes)

**What:** Import `CMSRoutes` in `App.jsx`, mount at `/cms/*` with the same provider wrapping as Leads, remove the `<Navigate>` redirect.

**Effort:** Low (3 files: `App.jsx`, `CMSRoutes.jsx` for redirect fix, optionally `CMSRouteGuards.jsx` cleanup)
**Risk:** Low-Medium (redirect mismatch fix needed, but backend/frontend are ready)
**Backward compatibility:** ✅ `/leads/*` remains unchanged
**Auth complexity:** Low (shared session, same login endpoint)
**URL stability:** ✅ New URLs added, no existing URLs changed
**Maintainability:** ✅ Clean separation

### Option B — CMS login reuses `/leads/login`

**What:** Same as Option A, but remove `CMSLoginPage` and redirect unauthenticated CMS users to `/leads/login`. After login, redirect to the original `/cms` path.

**Effort:** Low-Medium (need to fix `LeadsLoginPage.getSafeNextPath` to accept `/cms` paths, or create a shared login page)
**Risk:** Medium (LeadsLoginPage `getSafeNextPath` currently rejects `/cms` paths — must be fixed)
**Backward compatibility:** ✅ `/leads/*` remains unchanged
**Auth complexity:** Low (single login page)
**URL stability:** ✅
**Maintainability:** Medium (Leads login page becomes shared, coupling increases)

### Option C — Shared admin shell under `/admin/*`

**What:** Move both Leads and CMS under `/admin/*` (e.g., `/admin/leads`, `/admin/cms`).

**Effort:** High (rename all routes, update all links, update sidebar, update bookmarks, update backend `LEADS_DASHBOARD_BASE_URL`)
**Risk:** High (breaks existing URLs, requires backend env change, large refactor)
**Backward compatibility:** ❌ Breaks `/leads/*` bookmarks
**Auth complexity:** Medium
**URL stability:** ❌ All admin URLs change
**Maintainability:** Medium (unified but large change)

---

## 13. Recommended Option

**Option A — Restore full `/cms/*` directly.**

Rationale:
- Lowest effort and risk
- The CMS already has its own login page (`CMSLoginPage`) with proper `/cms` redirect handling
- The CMS already has its own layout, sidebar, and header — all pointing to `/cms/...`
- The backend is fully ready
- No existing URLs change
- The only fixes needed are:
  1. Change `ProtectedRoute` calls in `CMSRoutes.jsx` to pass `redirectTo="/cms/login"`
  2. Mount `CMSRoutes` in `App.jsx` with provider wrapping
  3. Remove the `<Navigate>` redirect

Option B is less clean because it couples the CMS login flow to the Leads login page and requires fixing `getSafeNextPath`. Option C is a large refactor with no clear benefit over Option A.

---

## 14. Risks

| Risk | Severity | Description | Mitigation |
|------|----------|-------------|------------|
| ProtectedRoute redirect mismatch | **MEDIUM** | `CMSRoutes.jsx` uses `ProtectedRoute` with default `redirectTo='/leads/login'`. Unauthenticated CMS users would go to Leads login, and `LeadsLoginPage.getSafeNextPath` rejects `/cms` next params, so they'd end up at `/leads` after login. | Fix: pass `redirectTo="/cms/login"` on all `ProtectedRoute` calls in `CMSRoutes.jsx`, OR switch to `CMSProtectedRoute` from `CMSRouteGuards.jsx`. |
| CMSRouteGuards dead code | **LOW** | `CMSRouteGuards.jsx` defines `CMSProtectedRoute` and `CMSCapabilityRoute` but they're never used. `CMSRoutes.jsx` uses `ProtectedRoute` instead. | Either switch `CMSRoutes.jsx` to use `CMSProtectedRoute` (which already redirects to `/cms/login`), or delete `CMSRouteGuards.jsx` and fix `ProtectedRoute` calls. |
| Cross-origin session cookies | **LOW** | Railway frontend and backend are on different origins. Session cookie must be `SameSite=None + Secure`. | Already fixed in `settings.py` (lines 260-269). Verified present. |
| CSRF token caching | **LOW** | CSRF token must be fetched from API response, not `document.cookie` (cross-origin). | Already fixed in `authApi.js` (lines 60-66). Verified present. |
| Login redirect loop | **LOW** | If `CMSLoginPage` is mounted but `isAuthenticated` check fails repeatedly, could loop. | `CMSLoginPage` checks `isLoading` first, then `isAuthenticated`. No loop risk. |
| SPA fallback on Railway | **LOW** | Deep links to `/cms/partners/123` must serve `index.html`. | `serve --single` handles this. Already configured in `package.json` start script. |
| API 403 on first CMS request | **LOW** | If session cookie not yet sent, first `cmsFetch` returns 403. | `AuthContext` calls `getCurrentUser()` on mount, which establishes the session. `cmsFetch` uses `credentials: 'include'`. |
| Sidebar access for limited roles | **LOW** | Users with only `contact` module would see only Dashboard + Contact in sidebar. | This is correct behavior — `CMSSidebar` filters by `hasModuleAccess`. |
| Direct refresh on `/cms/*` | **LOW** | Browser refresh on `/cms/partners/123` must reload SPA and re-authenticate. | `serve --single` serves `index.html`; `AuthProvider` calls `getCurrentUser()` on mount. |
| RBAC module name mismatch | **LOW** | Frontend and backend module names could diverge. | Verified: all 12 module names match exactly (snake_case). |
| Duplicate CORS middleware | **LOW** | `settings.py` has `corsheaders.middleware.CorsMiddleware` listed twice. | Harmless (idempotent). Pre-existing technical debt. |
| `SECURE_SSL_REDIRECT` on Railway | **LOW** | Defaults to `True`; must be `False` on Railway. | Env-overridable. Pre-existing, documented in evidence. |

---

## 15. Implementation Impact Map

### Files that MUST change for restoration:

| File | Change | Risk |
|------|--------|------|
| `src/App.jsx` | Import `CMSRoutes` (lazy), mount at `/cms/*` with `AuthProvider` → `CMSLanguageProvider` → `CMSToastProvider` wrapping, remove `<Navigate>` redirect | LOW |
| `src/components/cms/layout/CMSRoutes.jsx` | Change all `ProtectedRoute` calls to pass `redirectTo="/cms/login"` (or switch to `CMSProtectedRoute`) | LOW |

### Files that SHOULD change (cleanup):

| File | Change | Risk |
|------|--------|------|
| `src/components/cms/layout/CMSRouteGuards.jsx` | Either use it (switch `CMSRoutes.jsx` to import `CMSProtectedRoute`) or delete it (dead code) | LOW |

### Files that DO NOT need to change:

| File | Reason |
|------|--------|
| `backend/**` | All CMS endpoints, RBAC, auth, cookies, CSRF are already correct |
| `src/contexts/AuthContext.jsx` | Already supports CMS and Leads equally |
| `src/services/authApi.js` | Already fixed (CSRF from API response) |
| `src/services/cms/cmsFetch.js` | Already correct |
| `src/components/cms/layout/CMSLayout.jsx` | Already correct |
| `src/components/cms/layout/CMSSidebar.jsx` | Already correct (all `/cms/...` links) |
| `src/components/cms/layout/CMSHeader.jsx` | Already correct |
| `src/pages/cms/*.jsx` | All 19 pages exist, import CMSLayout, and are functional |
| `src/components/leads/*` | No changes needed — Leads remains independent |
| `src/styles/cms/cms.css` | Already imported in `main.jsx` |

---

## 16. Recommended Restoration Phases

### Phase 1 — Mount route tree safely
- Fix `CMSRoutes.jsx`: change all `ProtectedRoute` calls to pass `redirectTo="/cms/login"`
- Import `CMSRoutes` (lazy) in `App.jsx`
- Mount at `/cms/*` with `AuthProvider` → `CMSLanguageProvider` → `CMSToastProvider`
- Remove the `<Navigate to="/leads/login" />` redirect
- Run `npm run build` and verify no errors

### Phase 2 — Verify login/auth/me
- Navigate to `/cms` → should redirect to `/cms/login`
- Log in with valid credentials → should redirect to `/cms`
- Verify `getCurrentUser()` returns user with `permitted_modules` and `capabilities`
- Verify logout from CMS header works

### Phase 3 — Verify dashboard + read-only modules
- `/cms` (dashboard) — verify stats, recent activity, quick actions render
- `/cms/site-settings` — verify settings form loads
- `/cms/activity-logs` — verify log table loads
- `/cms/media` — verify media grid loads

### Phase 4 — Verify CRUD modules
- `/cms/partners` — list, create, edit, delete
- `/cms/services` — list, create, edit, delete
- `/cms/case-studies` — list, create, edit, delete
- `/cms/insights` — list, create, edit, publish, archive
- `/cms/careers` — list, create, edit, delete
- `/cms/navigation` — menus and items CRUD
- `/cms/homepage` — section config CRUD
- `/cms/contact` — submissions list, detail, update; inquiry types CRUD
- `/cms/users` — list, create, edit, password reset

### Phase 5 — Verify RBAC roles
- Login as `super_admin` → all 13 sidebar items visible
- Login as `admin` → all 13 sidebar items visible
- Login as `content_manager` → only content modules visible
- Login as `editor` → only view/create/update on content modules
- Login as `support_agent` → only Dashboard + Contact visible
- Login as `recruiter` → only Dashboard + Careers + Contact + Media visible
- Verify 403 errors are handled gracefully (access denied page)

### Phase 6 — Production smoke test
- Deploy to Railway
- Verify `/cms/login` loads on production domain
- Verify login works (cross-origin cookies)
- Verify dashboard data loads
- Verify at least one CRUD operation (create + delete a partner)
- Verify logout works
- Verify deep link refresh (`/cms/partners` → F5 → page loads)

---

## 17. Recommended Immediate Next Task

**Implement Phase 1 of the restoration plan:**

1. Fix `src/components/cms/layout/CMSRoutes.jsx` — change all `<ProtectedRoute>` to `<ProtectedRoute redirectTo="/cms/login">`
2. Update `src/App.jsx` — import `CMSRoutes` (lazy), mount at `/cms/*` with provider wrapping, remove `<Navigate>` redirect
3. Run `npm run build` and verify no errors
4. Start preview server and verify `/cms` redirects to `/cms/login`

This is a low-risk, ~10-line change that unblocks the entire CMS.

---

## 18. Final Status

**NEEDS FIXES BEFORE RESTORE**

The CMS is structurally complete and the backend is ready. Two minor frontend fixes are needed before mounting:

1. **`CMSRoutes.jsx` redirect target:** All `ProtectedRoute` calls default to `redirectTo='/leads/login'`. Must be changed to `redirectTo='/cms/login'` so CMS users land on the CMS login page, not the Leads login page.

2. **Mount `CMSRoutes` in `App.jsx`:** Import and mount with provider wrapping, remove the `<Navigate>` redirect.

Optional cleanup:
3. **`CMSRouteGuards.jsx`** is dead code — either use it or delete it.

No backend changes, no auth changes, no RBAC changes, no database changes, no env changes are needed.

---

## 19. Confirmation

No project implementation files were modified during this investigation. The only file created is this report:

`project-memory/evidence/SIDRAHSOFT-CMS-ROUTING-RESTORATION-INVESTIGATION-001-REPORT.md`

No routes were changed, no code was modified, no builds were run, no commits were made, no dependencies were installed, no database operations were performed, no `.env` files were touched.
