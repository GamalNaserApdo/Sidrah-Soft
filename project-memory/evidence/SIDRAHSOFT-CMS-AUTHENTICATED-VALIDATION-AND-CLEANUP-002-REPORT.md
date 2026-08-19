# SIDRAHSOFT-CMS-AUTHENTICATED-VALIDATION-AND-CLEANUP-002-REPORT

**Task ID:** `SIDRAHSOFT-CMS-AUTHENTICATED-VALIDATION-AND-CLEANUP-002`
**Date:** 2026-08-18
**Type:** Authenticated end-to-end validation + limited, directly-related cleanup
**Repository root:** `F:\What_i_Made\New\sidrah_web`
**Final status:** **CMS READY WITH NOTES**

---

## 1. Executive Summary

The restored CMS at `/cms/*` was validated end-to-end in a real browser (Playwright/Chromium) against the real Django backend with a real superuser session. The full chain works:

`Login (200) → Session → /auth/me (200) → Dashboard → Sidebar → RBAC → 13/13 module routes → CRUD (create 201 / update 200 / delete 204) → Deep-link refresh (list + nested) → Logout (200, session invalidated)`

Validation surfaced and fixed **two genuine blocking bugs** that made the CMS non-functional for real write operations, plus three permitted cleanup items:

1. **CSRF token lifecycle bug (blocking):** all unsafe requests (logout, create/update/delete) failed with 403 after (a) login — because Django rotates the CSRF token on login and the frontend cache was never refreshed — and (b) any full page reload — because the token cache is module-level in-memory state that is wiped on reload and was never lazily re-fetched.
2. **Partner form choices mismatch (blocking for Partners create):** the frontend sent `partner_type: 'partner'` (and offered `partner`/`technology`/`strategic`), none of which are valid backend choices (`client`, `strategic_partner`, `academic_partner`, `technology_partner`, `training_partner`, `other`). Partner creation via the UI always failed with 400.
3. Dead `CMSRouteGuards.jsx` deleted (zero consumers, confirmed by search).
4. Duplicate `form.status` translation key removed (identical values; build warning eliminated).
5. CMS branding switched from text-only placeholder to the approved `public/assets/logo.png` on the login page and sidebar.

No backend code, no public site, no Hero/background, no `/leads/*`, no Training/Education files were modified. No migrations, no user creation, no password resets. No commit/push.

---

## 2. Environment

| Component | Value |
|---|---|
| Backend | Django (venv at `backend/venv`), `python manage.py check` → no issues, all migrations applied (`[X]` across all apps) |
| Backend runtime | `runserver` on `127.0.0.1:8002` (frontend's configured API origin; nothing was listening there) |
| Frontend | Existing Vite dev server for this project on `http://localhost:5174` (matches backend `CORS_ALLOWED_ORIGINS` / `CSRF_TRUSTED_ORIGINS`) |
| Frontend API target | `http://localhost:8002` (`apiClient.js` default; no `VITE_API_BASE_URL` override) |
| DB | PostgreSQL `sidrahsoft_db` — 3 existing superusers, none created/modified |
| Browser automation | Playwright 1.61.1 / Chromium (headless), viewport 1440×900 |
| Account used | existing superuser (role `content_manager`); credentials supplied by the operator, used only via env vars, never persisted |

Note: two stray `runserver` instances on port 8000 from previous sessions were left untouched.

---

## 3. CMS Login Result

| Check | Result |
|---|---|
| `/cms/login` renders `CMSLoginPage` | ✅ |
| Sidrah CMS branding, no Leads branding | ✅ (logo image + "CMS" label; no "Leads" text) |
| Console errors on login page | ✅ none (only expected pre-auth `/auth/me` 403s) |
| Username/password fields functional | ✅ |
| Language toggle on login page | N/A — login page has no toggle by design (English-only); toggle lives in CMS header |
| Login API status | **200** |
| Redirect after login | **`/cms`** (exact match, `?next=` respected: unauth `/cms/services` → `/cms/login?next=/cms/services`) |

## 4. `/auth/me` Result

| Field | Value |
|---|---|
| Status | **200** |
| Role | `content_manager` |
| `is_superuser` / `is_staff` | `true` / `true` |
| Permitted modules | **12** — dashboard, site_settings, navigation, partners, services, case_studies, careers, insights, contact, media, users, activity_logs |
| Capabilities | **96** |

## 5. Dashboard Result

| Check | Result |
|---|---|
| `/cms` renders after login, no redirect loop | ✅ |
| No 401/403 for authorized account | ✅ (`/api/v1/cms/dashboard/` → 200) |
| Header renders (`.cms-header`) | ✅ |
| Sidebar renders (`.cms-sidebar`) | ✅ |
| User name/role in header | ✅ (`gamal`, role badge in dropdown) |
| Dashboard welcome/stats content | ✅ |
| Sidebar logo image loads | ✅ (`naturalWidth > 0`) |

## 6. Sidebar / RBAC Result

- Sidebar shows exactly 13 items matching all 12 permitted modules (+ Homepage under `site_settings`) — 1:1 with `user.permitted_modules` for superuser. ✅
- Backend enforcement verified: anonymous `GET /api/v1/cms/partners/` and `/api/v1/cms/dashboard/` → **403**. ✅
- Frontend guard verified unauthenticated: `/cms` → `/cms/login?next=/cms`; deep paths preserve `?next=`. ✅
- **Note:** all 3 local accounts are superusers, so non-superuser sidebar narrowing could not be exercised at runtime. That path remains statically verified (`CMSSidebar` filters via `hasModuleAccess`; `ProtectedRoute` checks `requiredModule`; backend `HasModulePermission` enforces per-module). No RBAC behavior was changed.

## 7. Route-by-Route Smoke Matrix

| Route | Component | API status | Classification |
|---|---|---|---|
| `/cms` | CMSDashboardPage | 200 | PASS |
| `/cms/site-settings` | CMSSiteSettingsPage | 404 (see §20 note 1) | PASS (route/render/RBAC fine; intentional 404 data state) |
| `/cms/homepage` | CMSHomepagePage | 200 ×8 | PASS |
| `/cms/navigation` | CMSNavigationPage | 200 | PASS |
| `/cms/partners` | CMSPartnersPage | 200 | PASS |
| `/cms/services` | CMSServicesPage | 200 | PASS |
| `/cms/case-studies` | CMSCaseStudiesPage | 200 | PASS |
| `/cms/insights` | CMSInsightsPage | 200 | PASS |
| `/cms/careers` | CMSCareersPage | 200 | PASS |
| `/cms/contact` | CMSContactPage | 200 | PASS |
| `/cms/media` | MediaLibraryPage | 200 | PASS |
| `/cms/users` | CMSUsersPage | 200 | PASS |
| `/cms/activity-logs` | CMSActivityLogsPage | 200 | PASS |

**13/13 PASS.** No UI errors, no 5xx, no unexpected 401/403. Console contained only expected entries (pre-login `/auth/me` 403, site-settings 404, post-logout `/auth/me` 403).

## 8. CRUD Test (Partners)

Record: `CMS Smoke Test - Delete Me` (slug `cms-smoke-test-delete-me`).

| Step | Result |
|---|---|
| List | ✅ 200, table renders |
| Create via UI form | ✅ **201**, record appears in list |
| Detail/edit (`/cms/partners/22`) | ✅ form loads with data |
| Update | ✅ **200** |
| Delete via UI confirm dialog | ✅ **204**, removed from list |
| Post-test DB check | ✅ zero leftovers (`Partner.objects.filter(slug='cms-smoke-test-delete-me').count() == 0`) |

Users / Site Settings / Navigation / real content were not modified.

## 9. Media Result

`/cms/media` renders with header/sidebar, `GET /api/v1/cms/media/` → 200, no permission denial. No test uploads performed (not essential). Media mutation CSRF was hardened as part of the CSRF fix (§15).

## 10. Contact / Leads Coexistence

- `/cms/contact` renders, `GET /api/v1/cms/contact/` → 200. ✅
- Same session navigates to `/leads` → Leads dashboard renders; `/api/v1/contact/submissions*` → 200 ×8. ✅
- Both surfaces operate on the same submissions backend; neither was modified. Unauthenticated `/leads/login` still renders Leads branding. ✅

## 11. Deep-Link Refresh

| Route | After refresh | `/auth/me` restored | Content |
|---|---|---|---|
| `/cms/services` | `/cms/services` (no 404/redirect) | ✅ 200 | ✅ list renders |
| `/cms/partners/22` (nested) | `/cms/partners/22` | ✅ 200 | ✅ edit form renders (Slug/Display Order fields present) |

## 12. Logout

| Check | Result |
|---|---|
| Logout API status | **200** `{"detail":"Logged out successfully."}` |
| User state cleared, protected content disappears | ✅ |
| Final location | `/cms/login` (login form visible) |
| `/cms` after logout | redirects to `/cms/login` (session genuinely invalidated server-side) |

**This failed before the CSRF fix** (403; session stayed alive; `/cms` remained accessible). After the fix it fully passes, including genuine server-side invalidation. The implicit `ProtectedRoute` redirect landed on `/cms/login` promptly in testing, so no explicit-navigate change was needed.

## 13. Arabic RTL Review

| Check | Result |
|---|---|
| `dir` attribute toggles | `ltr` → `rtl` via header toggle ✅ |
| Sidebar placement in RTL | moves to the **right** (x: 0 → 1200 of 1440 viewport) — true RTL composition, not just translated text ✅ |
| Arabic strings render | ✅ (مرحباً / لوحة / الشركاء etc.) |
| Arabic form inputs | `dir="rtl"` on Arabic name/description inputs (verified in `CMSPartnerFormPage`) ✅ |
| Login page | English-only by design (no toggle present) — noted, not changed |

## 14. Logo Review

- Previous state: CMS login + sidebar used text-only "Sidrah CMS" placeholder (no logo asset, old `src/assets/logo.svg` not involved).
- Action taken (per §15 of task): both brand slots now use the approved `public/assets/logo.png` (`<img alt="SidrahSoft">`, circle-clipped via `border-radius: 50%` since the PNG has an opaque background; fixed dimensions 2.75rem login / 1.875rem sidebar; "CMS" label retained).
- Verified in browser: image loads (`naturalWidth > 0`), layout intact, no console errors.
- Public site Header/Footer still reference the old `src/assets/logo.svg` — **out of scope** (public site), documented here for a future branding task.

## 15. Dead Code Cleanup

- `src/components/cms/layout/CMSRouteGuards.jsx` — confirmed zero consumers (search for `CMSRouteGuards`/`CMSProtectedRoute`/`CMSCapabilityRoute` across `src/` returns only self-references). **Deleted.** Build unaffected.
- No change to the working `ProtectedRoute` architecture.

## 16. Translation Warning Cleanup

- `form.status` was duplicated in both EN and AR objects in `CMSLanguageContext.jsx` with **identical values** (`'Status'` / `'الحالة'`). Removed the earlier of each pair; kept the canonical entry in the generic form-fields block. Behavior-identical.
- Build warning for the duplicate key is **eliminated**. No other translations touched.

## 17. Bugs Found & Fixed During Validation (directly related, proven at runtime)

### 17a. CSRF token lifecycle — blocking, all CMS mutations + logout broken

**Symptom (proven):** `POST /api/v1/auth/logout/` → 403, session not invalidated; `POST /api/v1/cms/partners/` → 403 `{"detail":"CSRF Failed: CSRF token missing."}`.

**Root causes (both in frontend token caching):**
1. `authApi.login()` fetched the CSRF token *before* login; Django rotates the CSRF token on login, leaving the cached token stale → logout 403 (`CSRF token incorrect`-class).
2. `cachedCsrfToken` is module-level memory; any full page reload (deep-link refresh, F5) wipes it, and nothing re-fetched it → subsequent mutations sent **no** `X-CSRFToken` header → 403 (`CSRF token missing`).

**Fix (frontend only, no backend change):**
- `src/services/authApi.js` — added `ensureCsrfToken()` (lazy fetch on empty cache, single in-flight request dedupe); `authFetch` now awaits it for unsafe methods; `login()` re-fetches the token after successful login (post-rotation refresh).
- `src/services/cms/cmsFetch.js` — unsafe methods now `await ensureCsrfToken()` instead of reading the possibly-empty sync cache.
- `src/services/cms/mediaApi.js` — replaced the `document.cookie` read (only works same-host; broken cross-origin on Railway) with the shared `ensureCsrfToken()`.

**Verified after fix:** partner create 201 / update 200 / delete 204; logout 200 with real server-side invalidation; mutations still work after full page reload (deep-link tests exercise exactly that path).

### 17b. Partner form `partner_type` choices mismatch — blocking for Partners create

**Symptom (proven):** create via UI → 400 `{"partner_type":["\"partner\" is not a valid choice."]}`.

**Root cause:** frontend default/options (`partner`, `technology`, `strategic`) didn't match backend `PARTNER_TYPE_CHOICES` (`client`, `strategic_partner`, `academic_partner`, `technology_partner`, `training_partner`, `other`).

**Fix (frontend only):** `CMSPartnerFormPage.jsx` default changed to `client`; dropdown options now exactly match backend choices. Public site does not consume `partner_type`; no other references exist. Verified: create 201 via UI.

## 18. Build Result

```
npm run build → ✓ 208 modules transformed, built in 8.62s
CMSRoutes chunk: 199.96 KB (gzip 38.78 KB)
python manage.py check → no issues (backend code unchanged)
```

- Duplicate `form.status` warning: **gone**.
- Remaining warnings are pre-existing and unrelated: `insightsApi.js` mixed static/dynamic import; main chunk 528.64 KB > 500 KB Vite threshold.
- No dependencies installed.

## 19. Files Modified (by THIS task)

| File | Change |
|---|---|
| `src/services/authApi.js` | `ensureCsrfToken()` lazy/deduped CSRF fetch; post-login token refresh |
| `src/services/cms/cmsFetch.js` | unsafe methods await `ensureCsrfToken()` |
| `src/services/cms/mediaApi.js` | shared `ensureCsrfToken()` replaces `document.cookie` read |
| `src/pages/cms/CMSPartnerFormPage.jsx` | `partner_type` default/options aligned with backend choices |
| `src/pages/cms/CMSLoginPage.jsx` | branding → `/assets/logo.png` + "CMS" label |
| `src/components/cms/layout/CMSSidebar.jsx` | branding → `/assets/logo.png` + "CMS" label |
| `src/contexts/CMSLanguageContext.jsx` | removed duplicate `form.status` key (EN + AR) |

## 20. Files Deleted (by THIS task)

| File | Reason |
|---|---|
| `src/components/cms/layout/CMSRouteGuards.jsx` | Dead code — zero consumers (confirmed by repo-wide search) |

Temporary validation scripts (`cms-validate-*.mjs`, diag scripts, result JSONs) were created for testing and **deleted afterward**. Test partner record deleted (DB verified clean).

Pre-existing working-tree changes (Hero/Grid background, App.jsx/CMSRoutes.jsx restoration, DNA deletion, `db_check.sqlite3`, `db_test.sqlite3`, `truction]`, `newstyle/`, etc.) were left exactly as found — documented in the prior reports.

## 21. Remaining Issues / Notes

1. **CMS Site Settings shows an error state locally** — `GET /api/v1/cms/site-settings/` returns intentional 404 "Site settings are not configured yet." because the local DB has no `SiteSetting` row (`seed_site_settings` never ran locally). Not a routing/RBAC/frontend bug; creating the row is a DB change and was out of scope. Recommend running the idempotent seed in a future task or accepting as local-only state.
2. **Non-superuser RBAC narrowing not runtime-exercised** — all 3 local accounts are superusers. Sidebar filtering/`ProtectedRoute`/backend enforcement verified statically; backend 403 verified for anonymous access. Consider a role-limited test account in a future task (requires user creation, out of scope here).
3. **Public `useSiteSettings` hook fires on CMS pages** without session credentials, consuming the `anon: 100/hour` throttle (observed as cosmetic 429s during heavy automated testing; CMS APIs are authenticated and unaffected). Pre-existing; worth deduplicating in a future task.
4. **Media library is sparse locally** (page renders fine; API 200). Upload flow not exercised (not essential per task).
5. **Public Header/Footer still use old `src/assets/logo.svg`** — public site was out of scope; flagged for a future branding-consistency task.
6. Pre-existing stray files (`db_check.sqlite3`, `db_test.sqlite3`, `truction]`) remain untouched.

## 22. CMS Readiness Decision

**CMS READY WITH NOTES**

All acceptance criteria pass:
- ✅ login works (200, correct redirect incl. `?next=`)
- ✅ `/auth/me` works (12 modules / 96 capabilities)
- ✅ dashboard renders (header/sidebar/user/stats)
- ✅ permitted sidebar modules render
- ✅ module routes load per RBAC (13/13)
- ✅ one safe CRUD flow succeeds end-to-end (after fixing two proven blockers)
- ✅ deep-link refresh succeeds (list + nested)
- ✅ logout succeeds (200, real server-side invalidation)
- ✅ `/leads/*` still works
- ✅ build passes; backend check passes
- ✅ no security regression (RBAC untouched; backend enforcement verified; CSRF posture strictly improved; throttles unchanged)

Notes (non-blocking): §21 items 1–5.

## 23. Recommended Next Task

1. **Seed/verify local Site Setting row** (or accept production-only state), then re-verify `/cms/site-settings` form rendering.
2. **Create a role-limited (non-superuser) CMS account** and runtime-verify sidebar narrowing, `ProtectedRoute` denial, and backend 403 on unauthorized modules.
3. Then proceed with **Training & Education module** implementation on the now-validated CMS foundation.
