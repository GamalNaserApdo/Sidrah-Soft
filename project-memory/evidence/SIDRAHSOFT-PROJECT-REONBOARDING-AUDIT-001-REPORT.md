# SIDRAHSOFT-PROJECT-REONBOARDING-AUDIT-001 — Final Report

**Task ID:** `SIDRAHSOFT-PROJECT-REONBOARDING-AUDIT-001`
**Type:** Investigation-only re-onboarding audit (no implementation, no refactoring, no migrations, no commits)
**Date:** 2026-08-18
**Repository root:** `F:\What_i_Made\New\sidrah_web`
**Branch:** `main` (up to date with `origin/main`)
**Overall status:** **PARTIAL**

> This report reconstructs the current state of the SidrahSoft Website project strictly from repository evidence. Old PASS reports were cross-checked against the live code; claims that no longer hold are flagged. No project implementation files were modified during this audit. The only file created is this report.

---

## 1. Executive Summary

SidrahSoft is a **monorepo** containing a premium bilingual (EN/AR) corporate website plus a custom Django/DRF CMS and a Leads/CRM dashboard. The project is mature: the public website, the full CMS admin SPA, the Leads dashboard, RBAC, activity logging, session auth + CSRF, Railway deployment configuration, and PostgreSQL migration are all implemented and were at one point validated.

The last committed work (2026-08-02) optimized Hero loading performance. The working tree currently has **one uncommitted source change** (`src/pages/CourseDetailPage.jsx` — removal of a redundant scroll effect, paired with a new untracked `ScrollToTop.jsx` component and its evidence report) plus several untracked evidence reports and stray local artifacts.

The project is **deployable and largely functional**, but it is **not verified-healthy in production**. The most recent production verification evidence is from 2026-07-15 (Leads smoke) and 2026-07-22 (auth/CSRF fix). No live production health check was performed in this audit (out of scope and no credentials). Several latent issues exist: a duplicated CORS middleware entry, an unrouted full CMS dashboard SPA, orphaned hero frame/video assets, stray local files in the repo root, and a `truction]` file that is a captured git-diff artifact.

**Top concern:** The full CMS admin SPA (`src/components/cms/**`, `src/pages/cms/**`) is fully built and wired to backend CMS endpoints, but `App.jsx` redirects `/cms/*` → `/leads/login`, so the broad CMS dashboard is **not reachable in the current routing**. Only the Leads dashboard (`/leads/*`) is routed. This is either an intentional scope reduction or an unfinished re-wiring — it must be clarified before continuing.

---

## 2. Current Project Status

| Dimension | State |
|---|---|
| Public website | Implemented, builds clean, routes defined |
| CMS backend (Django) | Implemented across 13 apps, `manage.py check` passes, migrations consistent |
| CMS admin SPA (frontend) | Implemented but **not routed** (`/cms/*` redirects to `/leads/login`) |
| Leads dashboard | Implemented and routed at `/leads/*`, RBAC-guarded |
| Auth (session + CSRF) | Implemented; cross-origin cookie fix applied |
| RBAC | Implemented (role matrix + permission classes) |
| Activity logging | Implemented (append-only, sanitized) |
| Railway deployment | Configured (backend + frontend `railway.toml`, `Procfile`, `start.sh`) |
| PostgreSQL | Migrated (PostgreSQL is the configured engine; SQLite no longer used) |
| i18n / RTL | Implemented (EN/AR, `dir` switching, bilingual CMS models) |
| Hero | Cinematic, performance-optimized (AVIF/WebP `<picture>`, preload, lazy routes) |
| Tests | Limited: focused tests exist for `contact`, `accounts`, `navigation`, `partners`, `services`, `careers`; no frontend test runner |
| Production health | **Not verified in this audit**; last live evidence 2026-07-22 |

---

## 3. Architecture Overview

```
sidrah_web/ (monorepo, single git repo)
├── (root)                      → React/Vite frontend (public site + CMS/Leads SPA)
│   ├── src/
│   │   ├── App.jsx             → Routes: / , /training, /case-studies, /insights, /careers, /leads/*, /cms/*→redirect
│   │   ├── components/         → sections, hero, cinematic, leads, cms, auth, ui
│   │   ├── pages/              → public pages + cms/ pages
│   │   ├── services/           → apiClient + per-domain API services + cms/
│   │   ├── contexts/           → Auth, CMSLanguage, CMSToast
│   │   ├── hooks/              → useHomepageConfig, useSiteSettings, useServices, etc. + cms/
│   │   ├── i18n/               → EN/AR translations + provider
│   │   ├── styles/             → tokens, typography, cinematic, hero, cards, sections, leads, cms/
│   │   └── data/               → static fallback content (courses, company, caseStudies, insights)
│   ├── vite.config.js          → React plugin + hero preload plugin
│   ├── railway.frontend.toml   → Railway frontend service (nixpacks, `npm run start` → serve dist)
│   └── package.json            → React 19, react-router-dom 7, gsap, serve, playwright (dev)
│
├── backend/                    → Django 5.x + DRF CMS API
│   ├── config/                 → settings, urls, wsgi, asgi
│   ├── apps/
│   │   ├── accounts/           → Custom User, roles, permissions, auth views, dashboard view
│   │   ├── activity_logs/      → Append-only audit log + sanitized logging service
│   │   ├── contact/            → InquiryType + ContactSubmission (leads), email service, CMS views
│   │   ├── homepage/           → HomepageSettings, MarqueeItem, Industry, HomepageSectionConfig
│   │   ├── insights/           → Article (blog) + CMS
│   │   ├── case_studies/       → CaseStudy + CMS
│   │   ├── services/           → Service + CMS
│   │   ├── partners/           → Partner + CMS
│   │   ├── careers/            → Job + CMS
│   │   ├── navigation/         → Menu/Link + CMS
│   │   ├── site_settings/      → Singleton global settings + CMS
│   │   ├── media_library/      → MediaAsset + upload/validator services + CMS
│   │   └── core/               → TimeStampedModel, health, seo_views (robots/sitemap), cms_urls router
│   ├── templates/              → contact email templates
│   ├── start.sh                → migrate → seed_inquiry_types → collectstatic → gunicorn
│   ├── Procfile, railway.toml, runtime.txt (Python 3.12.7)
│   └── requirements.txt        → Django, DRF, cors-headers, Pillow, psycopg[binary], gunicorn, whitenoise, dj-database-url
│
├── project-memory/             → Knowledge base (00–20) + evidence/ (120+ reports) + logs/ + tools/
├── public/                     → robots.txt, sitemap.xml (static fallbacks), assets/
├── dist/                       → Vite build output (gitignored)
└── (stray local artifacts — see §17)
```

**Connection map:**
- Frontend `services/*Api.js` → `apiClient.js` (fetch wrapper, `VITE_API_BASE_URL`) → Django `/api/v1/*`.
- Public site reads CMS content via public endpoints (`/api/v1/partners/`, `/services/`, `/homepage/`, etc.) with graceful fallback to static `data/` when the API is unreachable.
- CMS/Leads SPA uses `services/authApi.js` (session cookies + cached CSRF token from `/api/v1/auth/csrf/`) and `services/cms/cmsFetch.js` for protected `/api/v1/cms/*` and `/api/v1/admin/*` endpoints.
- `config/urls.py` mounts `/api/v1/cms/` → `apps/core/cms_urls.py` which includes every module's `cms_urls.py`.

---

## 4. Technology Stack

### Frontend
| Item | Value | Evidence |
|---|---|---|
| Framework | React 19.1 | `package.json` |
| Build | Vite 7.1 (`@vitejs/plugin-react` 4.4) | `package.json`, `vite.config.js` |
| Routing | react-router-dom 7.6 | `App.jsx`, `main.jsx` |
| Styling | Hand-written CSS (tokens, typography, cinematic, sections, cms) | `src/styles/*`, `main.jsx` imports |
| State | React Context (Auth, CMSLanguage, CMSToast) + hooks | `src/contexts/*` |
| API client | Native `fetch` wrapper | `src/services/apiClient.js`, `authApi.js` |
| Animation | GSAP 3.13 + ScrollTrigger | `CinematicHero.jsx`, `package.json` |
| i18n | Custom provider + EN/AR dictionaries | `src/i18n/*` |
| Forms | Native (no form library) | CMS form pages |
| Testing | Playwright 1.61 (devDep, no test scripts defined) | `package.json` |
| Serving (prod) | `serve --single` on `dist` | `package.json` `start` script |

### Backend
| Item | Value | Evidence |
|---|---|---|
| Framework | Django >=5.1,<6.0 | `requirements.txt` |
| API | Django REST Framework >=3.15 | `settings.py` `INSTALLED_APPS` |
| Auth | Django session auth (SessionAuthentication) | `settings.py` `REST_FRAMEWORK` |
| RBAC | Custom role matrix + DRF permission classes | `accounts/roles.py`, `permissions.py` |
| Database | PostgreSQL (psycopg[binary] >=3.2) | `settings.py` `DATABASES`, `requirements.txt` |
| Email | Django core mail (console default, SMTP configurable) | `settings.py` `EMAIL_*` |
| Media | Django media + `media_library` app with Pillow | `media_library/` |
| Rate limiting | DRF throttling (anon 100/h, contact 5/m, cms_login 5/m) | `settings.py` `REST_FRAMEWORK` |
| Logging | Custom `activity_logs` app (append-only, sanitized) | `activity_logs/services.py` |
| Static | WhiteNoise (CompressedManifestStaticFilesStorage) | `settings.py` |
| WSGI server | Gunicorn 23 (4 workers, sync) | `start.sh` |
| Testing | Django TestCase (focused tests per app) | `apps/*/tests*.py` |

### Database
- Engine: **PostgreSQL** (hardcoded engine in `settings.py`; `DATABASE_URL` override via `dj-database-url`).
- Models: `User`, `ActivityLog`, `SiteSetting`, `Navigation*`, `MediaAsset`, `Partner`, `Service`, `CaseStudy`, `Article` (insights), `Job` (careers), `InquiryType`, `ContactSubmission`, `HomepageSettings`, `MarqueeItem`, `Industry`, `HomepageSectionConfig`.
- All migrations applied locally (`showmigrations` → all `[X]`).
- Bilingual fields (`*_en` / `*_ar`) throughout content models.

### Infrastructure
| Item | Value |
|---|---|
| Platform | Railway (config present) |
| Frontend service | `railway.frontend.toml` → nixpacks → `npm run start` (`serve --single dist`) |
| Backend service | `backend/railway.toml` → nixpacks → `bash start.sh` (migrate, seed, collectstatic, gunicorn) |
| DB service | Railway PostgreSQL (via `DATABASE_URL`) |
| Health check | `/api/v1/health/` (60s timeout) |
| Env strategy | `DJANGO_*` prefixed env vars; `VITE_API_BASE_URL` for frontend |
| Build (FE) | `npm run build` → `vite build` |
| Build (BE) | nixpacks auto-detects `requirements.txt` |

---

## 5. Repository Structure

See §3. Key points:
- **Frontend** lives at the repository root (`src/`, `index.html`, `vite.config.js`, `package.json`).
- **Backend** lives in `backend/` with its own `venv/` (gitignored), `.env` (gitignored), and Railway config.
- **`project-memory/`** is the knowledge base (20 numbered docs) plus `evidence/` (120+ historical reports), `logs/`, `tools/`.
- **`public/`** holds static `robots.txt` and `sitemap.xml` (note: backend also generates dynamic robots/sitemap at root URLs — potential duplication, see §17).
- **`DNA/`** and **`cinematic-landing-kit-main/`** are reference/inspiration directories (each contains `CLAUDE.md`, `README.md`, `memory/`, `templates/`). They are **not part of the build** and appear to be vendored reference material.
- **`dist/`** is the Vite build output (gitignored).
- Several **stray files** sit in the repo root (see §17).

---

## 6. Public Website Status

Routes (from `src/App.jsx`):

| Route | Component | Status |
|---|---|---|
| `/` | `Home` (CMS-driven sections via `useHomepageConfig` with fallback order) | COMPLETE |
| `/training` | `TrainingPage` (lazy) | COMPLETE |
| `/training/:courseSlug` | `CourseDetailPage` (lazy) | COMPLETE |
| `/case-studies` | `CaseStudiesPage` (lazy) | COMPLETE |
| `/insights` | `InsightsPage` (lazy) | COMPLETE |
| `/insights/:slug` | `InsightDetailPage` (lazy) | COMPLETE |
| `/careers` | `CareersPage` (lazy) | COMPLETE |
| `/leads/*` | `LeadsRoutes` (login, dashboard, detail) | COMPLETE |
| `/cms/*` | **Redirects to `/leads/login`** | See §8 — CMS SPA exists but is unrouted |

Homepage sections (`SECTION_COMPONENT_MAP`): `hero`, `foundation`, `marquee`, `services`, `automation_showcase`, `industries`, `partners`, `case_studies`, `insights`, `careers`, `contact`. Visibility/order driven by `HomepageSectionConfig` from the API, with a hardcoded fallback order.

Section classification:
- **Hero**: COMPLETE — cinematic, GSAP scroll, AVIF/WebP `<picture>`, preload, reduced-motion support.
- **Foundation**: COMPLETE.
- **Capabilities Marquee**: COMPLETE.
- **Services**: COMPLETE (CMS-backed).
- **Automation Showcase**: COMPLETE.
- **Industries/Solutions**: COMPLETE (CMS-backed `Industry` model).
- **Partners/Trust**: COMPLETE (CMS-backed).
- **Case Studies**: COMPLETE (CMS-backed; listing page only — no public detail route, noted in `seo_views.py`).
- **Insights**: COMPLETE (CMS-backed; list + detail routes).
- **Careers**: COMPLETE (CMS-backed; listing page).
- **Contact**: COMPLETE (form posts to `/api/v1/contact/submissions/`, throttled, email notification + visitor confirmation).
- **Header/Navigation**: COMPLETE (CMS-backed `navigation` app + `useHeaderNavigation`).
- **Footer**: COMPLETE.
- **Floating Social Bar**: COMPLETE.
- **i18n/RTL**: COMPLETE (`I18nProvider` sets `dir`/`lang`; bilingual CMS models; AR translations present).
- **Mobile responsiveness**: Implemented (responsive hero assets, coarse-pointer blur reduction, mobile frame sets).
- **Loading/error states**: `StateViews` (Loading/Empty/Error) used in CMS/Leads; public sections use fallback data.
- **SEO**: `SEO` component + `config/seo.js` per-route; backend dynamic `robots.txt`/`sitemap.xml`.

---

## 7. Visual / UX Status

- **Color system**: CSS custom properties in `styles/tokens.css` (dark premium palette; gold accent `#c9a96e` visible in Leads/CMS).
- **Typography**: Space Grotesk (EN display), El Messiri (AR display), Inter (EN body), Tajawal (AR body) — reduced from 18 to 7 weights in the last optimization.
- **Backgrounds**: `InteractiveNetworkBackground` + `CinematicLayers` (mood-based per route) + `MouseGlow`.
- **Motion**: GSAP + ScrollTrigger for hero; CSS transitions elsewhere; reduced-motion respected in hero.
- **Cards/buttons**: `styles/cards.css`, `components/ui/*` (Badge, Button, Card, Input, SectionHeader, StatCard).
- **Cinematic hero**: AVIF/WebP responsive poster, scroll-driven scale/translate, smoke/leaves/motes/aura/sheen layers, scroll cue.
- **Higgsfield**: Used for hero motion/asset generation historically (evidence in `project-memory/evidence/higgsfield/` and `14-HIGGSFIELD-STRATEGY.md` — motion-only per decision log). Generated master assets live in `src/assets/hero/digital-sidrah/`.

**Cohesiveness:** The public site reads as one cohesive premium dark system. The CMS/Leads dashboard uses a consistent gold-on-dark theme but is a separate visual generation (functional admin aesthetic). No obviously mismatched "old design generation" sections were found in the public site.

**Deferred/unfinished visual work:** None clearly identified as in-progress; the hero performance optimization (2026-08-02) was the last visual work and is marked PASS.

---

## 8. CMS Status

### Backend CMS (Django)
All CMS modules have `cms_urls.py`, `cms_views.py`, `cms_serializers.py`, and use `CMSViewMixin` + `HasModulePermission`:

| Module | Backend | Model | CRUD | Notes |
|---|---|---|---|---|
| Dashboard | `/api/v1/cms/dashboard/` | (aggregated) | read | Scoped to user modules; superuser bypass |
| Site Settings | `/api/v1/cms/site-settings/` | `SiteSetting` | read/update | Singleton |
| Navigation | `/api/v1/cms/navigation/` | Menu/Link | CRUD | |
| Partners | `/api/v1/cms/partners/` | `Partner` | CRUD | |
| Services | `/api/v1/cms/services/` | `Service` | CRUD | |
| Case Studies | `/api/v1/cms/case-studies/` | `CaseStudy` | CRUD | SEO fields |
| Insights | `/api/v1/cms/insights/` | `Article` | CRUD | SEO fields |
| Careers | `/api/v1/cms/careers/` | `Job` | CRUD | |
| Contact (Leads) | `/api/v1/cms/contact/` | `InquiryType`, `ContactSubmission` | list/detail/update | No hard delete; stats endpoint |
| Media | `/api/v1/cms/media/` | `MediaAsset` | CRUD + upload | Validators |
| Homepage | `/api/v1/cms/homepage/` | `HomepageSettings`, `MarqueeItem`, `Industry`, `HomepageSectionConfig` | CRUD | |
| Users | `/api/v1/admin/users/` | `User` | CRUD (gated) | `CanManageUsers` |
| Activity Logs | `/api/v1/admin/activity-logs/` | `ActivityLog` | read-only | |

Auth enforced on all CMS endpoints (`IsAuthenticated` + `IsCMSUser` + `HasModulePermission`). Validation present in serializers. Error handling present. Activity logging on mutations.

### Frontend CMS SPA
**Fully built** in `src/components/cms/` and `src/pages/cms/`:
- `CMSRoutes.jsx` defines 26 routes (dashboard, site-settings, homepage, navigation, partners, services, case-studies, insights, careers, contact, activity-logs, users, media + form pages).
- Reusable CMS UI kit: `CMSBadge`, `CMSButton`, `CMSConfirmDialog`, `CMSDialog`, `CMSFormInputs`, `CMSMediaField`, `CMSPageHeader`, `CMSPagination`, `CMSStateViews`, `CMSTable`, `CMSToolbar`.
- Media picker, SEO section, recent activity widget.

**Critical routing gap:** `src/App.jsx` line 168:
```jsx
<Route path="/cms/*" element={<Navigate to="/leads/login" replace />} />
```
The `CMSRoutes` component is **never imported or mounted** in `App.jsx`. The entire CMS dashboard SPA is therefore unreachable at runtime. Only the Leads subset (`/leads/*`) is routed. This is the single most significant architectural ambiguity in the current state.

---

## 9. Leads / CRM Status

Verified against current code (not just old reports):

| Feature | Backend | Frontend | Status |
|---|---|---|---|
| Login | `/api/v1/auth/login/` (CSRF + throttle) | `LeadsLoginPage` | COMPLETE |
| Logout | `/api/v1/auth/logout/` | `AuthContext.logout` | COMPLETE |
| Current user | `/api/v1/auth/me/` (`IsCMSUser`) | `AuthContext` | COMPLETE |
| Lead submission (public) | `POST /api/v1/contact/submissions/` (throttled 5/m) | `ContactSection` | COMPLETE |
| Inquiry types (public) | `GET /api/v1/contact/inquiry-types/` | `useInquiryTypes` | COMPLETE |
| Leads list | `GET /api/v1/cms/contact/submissions/` (search, status, inquiry_type, assigned_to, priority, date filters, pagination) | `LeadsDashboardPage` + `useCMSList` | COMPLETE |
| Lead detail | `GET /api/v1/cms/contact/submissions/<id>/` | `LeadDetailPage` | COMPLETE |
| Lead update | `PATCH .../<id>/` (status, priority, notes, assigned_to) | `LeadDetailPage` | COMPLETE |
| Stats | `GET /api/v1/cms/contact/submissions-stats/` | `LeadsDashboardPage` | COMPLETE |
| Archive/spam | Non-destructive status change | UI actions | COMPLETE |
| Hard delete | **Disabled** (returns 405) | n/a | COMPLETE |
| Email notification | Internal + visitor confirmation (console/SMTP) | n/a | COMPLETE |
| Rate limiting | contact_submission 5/m, cms_login 5/m | n/a | COMPLETE |
| RBAC | `HasModulePermission` (module=contact) | `ProtectedRoute requiredModule="contact"` | COMPLETE |
| Activity logging | login/logout/lead_created/status_changed/priority_changed/archived/marked_spam/email events | n/a | COMPLETE |
| Sanitization | Email masked in logs; no email/phone/message in metadata | n/a | COMPLETE |

**Previously reported Leads rendering/auth problems:** The 2026-07-26 RBAC fix report (`SIDRAHSOFT-PRODUCTION-CMS-SUPERUSER-RBAC-FIX-001`) attributes the 403 to cross-origin session cookies (SameSite=Lax default), not an RBAC bug. The current `settings.py` defaults `SameSite=None` in production (`DEBUG=False`) and `Lax` in development — **this fix is present in the current code** (lines 260–269). The CSRF token is now cached from the `/api/v1/auth/csrf/` response body rather than read from `document.cookie` (`authApi.js` lines 60–66) — **this fix is also present**. Both previously reported root causes are resolved in the current code.

---

## 10. Authentication / RBAC / CSRF Status

**End-to-end flow:**
1. Browser → `LeadsLoginPage` → `AuthContext.login()` → `authApi.login()`.
2. `login()` first calls `GET /api/v1/auth/csrf/` (`ensure_csrf_cookie`) → caches `csrfToken` from response body.
3. `POST /api/v1/auth/login/` with `X-CSRFToken` header + `credentials: 'include'` → Django `LoginView` (`@csrf_protect`) authenticates, creates session, returns `CMSUserSerializer` data (includes `capabilities`, `permitted_modules`, `is_superuser`).
4. Subsequent requests: session cookie sent cross-origin (SameSite=None + Secure in prod); `cmsFetch`/`authFetch` attach cached `X-CSRFToken` for unsafe methods.
5. `GET /api/v1/auth/me/` (`IsCMSUser`) returns current user; `AuthContext` populates state.
6. `ProtectedRoute` checks `isAuthenticated` + `requiredModule` against `user.permitted_modules` (superuser bypasses).

**Configuration (current `settings.py`):**
- `SESSION_COOKIE_HTTPONLY = True`
- `CSRF_COOKIE_HTTPONLY = False` (frontend reads token from API response, not cookie — comment is slightly stale but behavior is safe)
- `SameSite`: env-overridable; defaults `Lax` (dev) / `None` (prod)
- `Secure`: auto-enabled when `not DEBUG` (both session + CSRF cookies)
- `CORS_ALLOW_CREDENTIALS = True`
- `CSRF_TRUSTED_ORIGINS` + `CORS_ALLOWED_ORIGINS` env-driven (defaults to localhost:5174)
- `SECURE_PROXY_SSL_HEADER` trusted in prod; `SECURE_SSL_REDIRECT` env-overridable (disabled on Railway per evidence)

**RBAC:** Role matrix in `accounts/roles.py` (11 roles, 12 modules, 8 actions). Permission classes: `IsCMSUser`, `IsSuperAdmin`, `CanManageUsers`, `HasCMSRole`, `HasModulePermission`, `CanPublishContent`. Superuser bypasses all checks. Legacy roles mapped (`marketing_seo`→`marketing_manager`, `support_recruiter`→`support_agent`).

**Potential failure points:**
- **Local dev with `DEBUG=False`**: SameSite defaults to `None` but cookies require `Secure=True`; without HTTPS locally, browsers reject the cookies. Anyone running local dev with `DEBUG=False` over plain HTTP will hit auth failures. Mitigation: keep `DEBUG=True` locally.
- **Railway `SECURE_SSL_REDIRECT`**: defaults `True`; Railway healthcheck report (003) documents this caused healthcheck failures and recommends setting it `False` on Railway. The env var is respected but the default remains `True` — operators must remember to set `DJANGO_SECURE_SSL_REDIRECT=False` on Railway.
- **Duplicate CORS middleware** (see §17): `corsheaders.middleware.CorsMiddleware` is listed twice in `MIDDLEWARE` (lines 83–84). Harmless (idempotent) but is technical debt.

---

## 11. API Status

Grouped summary (all under `/api/v1/`):

| Group | Endpoints | Auth | Consumers |
|---|---|---|---|
| Health | `GET /health/` | AllowAny | Railway healthcheck |
| Auth | `csrf/`, `login/`, `logout/`, `me/` | AllowAny/csrf → IsCMSUser | AuthContext, LeadsLoginPage |
| Admin | `dashboard/access/`, `users/` (router) | IsCMSUser / CanManageUsers | (CMS SPA — currently unrouted) |
| Activity Logs | `admin/activity-logs/` list/detail | HasModulePermission | (CMS SPA — currently unrouted) |
| Site Settings | `site-settings/` (public read), `cms/site-settings/` | AllowAny / IsCMSUser | useSiteSettings, CMS SPA |
| Navigation | `navigation/` (public), `cms/navigation/` | AllowAny / IsCMSUser | useHeaderNavigation, CMS SPA |
| Partners | `partners/` (public), `cms/partners/` | AllowAny / IsCMSUser | PartnersTrustSection, CMS SPA |
| Services | `services/` (public), `cms/services/` | AllowAny / IsCMSUser | ServicesSection, CMS SPA |
| Case Studies | `case-studies/` (public), `cms/case-studies/` | AllowAny / IsCMSUser | CaseStudiesSection/Page, CMS SPA |
| Insights | `insights/` (public), `cms/insights/` | AllowAny / IsCMSUser | InsightsSection/Page, CMS SPA |
| Careers | `jobs/` (public), `cms/careers/` | AllowAny / IsCMSUser | CareersSection/Page, CMS SPA |
| Contact | `contact/inquiry-types/`, `contact/submissions/` (public POST), `cms/contact/` | AllowAny (throttled) / IsCMSUser | ContactSection, LeadsDashboard |
| Homepage | `homepage/` (public), `cms/homepage/` | AllowAny / IsCMSUser | useHomepageConfig, CMS SPA |
| Media | `cms/media/` | IsCMSUser | CMS SPA |
| SEO | `robots.txt`, `sitemap.xml` (root) | AllowAny | Search engines |

No obviously broken integrations detected. The public site gracefully falls back to static `data/` when CMS endpoints are unavailable (e.g., `useHomepageConfig`, `useSiteSettings`).

---

## 12. Database & Migration Status

- **Engine:** PostgreSQL (configured in `settings.py`; `DATABASE_URL` override for Railway).
- **Migration state:** `manage.py showmigrations` → **all applied** (`[X]` on every migration across all 13 apps). No `[ ]` pending.
- **Migration files:** Each app has `0001_initial` plus targeted follow-ups (`accounts/0002_alter_user_role`, `case_studies/0002_seo_management_fields`, `insights/0002_seo_management_fields`, `media_library/0002_media_asset_fields`, `site_settings/0002` + `0003_seo_management_fields`).
- **`core` app has no migrations** (`apps/core/migrations/` contains only `__init__.py`) — `core` provides `TimeStampedModel` (abstract) and view-only endpoints, so no table is needed. This is correct.
- **No SQLite artifacts in tracked code.** Two untracked local SQLite files exist in the repo root (`db_check.sqlite3`, `db_test.sqlite3`) — see §17; they are gitignored by `db.sqlite3` pattern but their distinct names evade that pattern.
- **No obsolete/duplicate models** detected. Bilingual fields are consistently modeled.
- **Data dependencies:** `start.sh` runs `seed_inquiry_types` on every deploy (idempotent). Other seeds (`seed_site_settings`, `seed_navigation`, `seed_partners`, `seed_services`, `seed_case_studies`, `seed_insights`, `seed_jobs`, `seed_homepage`, `seed_contact`) exist but are **not run in `start.sh`** — they are manual setup commands. A fresh production deploy would have empty content except inquiry types.

---

## 13. Security Review

| Area | Finding | Severity |
|---|---|---|
| `.gitignore` | Comprehensive: `.env`, secrets, `*.pem`, `*.key`, `credentials.json`, `db.sqlite3`, `media/`, `dist/`, IDE dirs | OK |
| `.env` files | Both root and `backend/.env` are gitignored and unreadable by tooling (confirmed) | OK |
| Hard-coded secrets | None found in inspected source. `DEFAULT_FALLBACK_EMAIL = 'sidrahsoft@gmail.com'` in `contact/services.py` is a public contact address, not a secret | OK |
| `SECRET_KEY` | Read from env (`DJANGO_SECRET_KEY`); no hard-coded fallback | OK |
| `DEBUG` | Defaults `False` (`env_bool('DEBUG', default='False')`) | OK |
| `ALLOWED_HOSTS` | Env-driven, defaults to localhost | OK |
| CORS | Env-driven, `CORS_ALLOW_CREDENTIALS=True` | OK |
| CSRF | `@csrf_protect` on login/logout; `CSRF_TRUSTED_ORIGINS` env-driven; token cached from API response | OK |
| Cookies | HttpOnly session; SameSite=None+Secure in prod; CSRF cookie not HttpOnly (required for header pattern) | OK |
| RBAC | Enforced server-side on every CMS endpoint; superuser bypass intentional | OK |
| Rate limiting | anon 100/h, contact 5/m, cms_login 5/m | OK |
| File uploads | `media_library/validators.py` + Pillow; CMS-gated | OK |
| Input validation | DRF serializers throughout | OK |
| Activity logging | Sanitized (sensitive keys redacted, email masked, bounded lengths) | OK |
| `X-Forwarded-For` | Not trusted by default (`ACTIVITY_LOG_TRUST_PROXY` defaults False); REMOTE_ADDR only | OK |
| Dependency risks | No pinned versions (all `>=`); `psycopg[binary]`; no lockfile for Python | LOW–MED |
| Sensitive reports in repo | `project-memory/evidence/` contains smoke results (`leads_smoke_results.json`) and logs — reviewed, no secrets leaked | OK |
| `higgsfield_error.txt` | Stray file with a CLI error (no secrets) | LOW |
| `seedance_model.json`, `seedance_params.txt` | Stray Higgsfield generation artifacts (no secrets) | LOW |
| `backend_smoke.log`, `build_output.txt` | Stray large log/build outputs in repo root (gitignored patterns may not catch these exact names) | LOW |

**No secret values were exposed in this report.** No high-severity security issues found. The main soft spots are unpinned Python dependencies and stray local artifacts in the repo root.

---

## 14. Dependency / Build / Test Health

### Frontend (`package.json`)
- `react` 19.1, `react-dom` 19.1, `react-router-dom` 7.6, `gsap` 3.13, `serve` 14.2 — all reasonable.
- devDeps: `vite` 7.1, `@vitejs/plugin-react` 4.4, `playwright` 1.61.
- `package-lock.json` present (tracked).
- **No test script defined** — Playwright is installed but no `test` script exists; no e2e tests found in `src/`.
- **Build result:** `npm run build` → **PASS** in 11.66s, 164 modules. Main bundle `index-mGfQBclZ.js` = **537.28 KB** (gzip 173.47 KB) — above the 500 KB Vite warning threshold. CSS 221.85 KB (gzip 29 KB). Lazy-split routes (Training, CourseDetail, CaseStudies, Insights, InsightDetail, Careers, LeadsRoutes) correctly chunked.
- One Vite warning: `insightsApi.js` is both statically and dynamically imported by `useInsights.js` — dynamic import won't move it to a separate chunk (minor optimization miss).

### Backend (`requirements.txt`)
- All `>=` ranges (no upper bounds pinned beyond Django `<6.0`): Django, DRF, cors-headers, python-dotenv, Pillow, psycopg[binary], gunicorn, whitenoise, dj-database-url.
- **No `requirements.lock` / `pip-tools` lockfile** — reproducibility relies on whatever resolves at build time. Newly published versions could be pulled. Recommend pinning or generating a lockfile.
- `venv/` is gitignored (present locally).

### Validation commands executed (this audit)
| Command | Result |
|---|---|
| `npm run build` | **PASS** — 164 modules, 11.66s, no errors (one chunk-size warning, one dynamic-import warning) |
| `python manage.py check` | **PASS** — "System check identified no issues (0 silenced)" |
| `python manage.py showmigrations` | **PASS** — all migrations `[X]` applied |
| `git status` / `git log` | Clean except 1 modified + 6 untracked (see §15) |

No destructive commands run. No dependencies installed/upgraded. No migrations created or applied.

---

## 15. Deployment / Railway Status

**Repository configuration evidence (not live verification):**

| Service | Config | Build | Start |
|---|---|---|---|
| Frontend | `railway.frontend.toml` (nixpacks, node provider) | `npm run build` (implicit) | `npm run start` → `serve --single --listen ${PORT:-3000} dist` |
| Backend | `backend/railway.toml` (nixpacks) | auto (requirements.txt) | `bash start.sh` → migrate → seed_inquiry_types → collectstatic → gunicorn (4 workers, port `$PORT`/8000) |
| Database | Railway PostgreSQL provisioned; `DATABASE_URL` injected | n/a | n/a |
| Healthcheck | `/api/v1/health/`, 60s timeout, 3 retries | n/a | n/a |

**Required env vars (from `.env.example` files):**
- Backend: `DJANGO_SECRET_KEY`, `DJANGO_DEBUG=False`, `DJANGO_ALLOWED_HOSTS`, `DJANGO_CORS_ALLOWED_ORIGINS`, `DJANGO_CSRF_TRUSTED_ORIGINS`, `DJANGO_SESSION_COOKIE_SAMESITE=None`, `DJANGO_CSRF_COOKIE_SAMESITE=None`, `DJANGO_SECURE_SSL_REDIRECT=False` (Railway), `DATABASE_URL`, `EMAIL_*`, `CONTACT_NOTIFICATION_EMAIL`, `LEADS_DASHBOARD_BASE_URL`.
- Frontend: `VITE_API_BASE_URL` (required in production build; `apiClient.js` throws if missing in `PROD`).

**Documented production domains (from 006 report, 2026-07-22 — may be stale):**
- Frontend: `https://frontend-production-5863.up.railway.app`
- Backend: `https://backend-production-23ed.up.railway.app`

**Deployability assessment:** The repository **appears deployable** — build passes, Django check passes, migrations consistent, start scripts present. However, **live production health was NOT verified in this audit**. The last live verification evidence is from 2026-07-22 (auth/CSRF) and 2026-07-15 (Leads smoke). The production domains above are from a 2026-07-22 report and may have changed.

**Caveats:**
- `start.sh` only seeds inquiry types; all other content seeds are manual. A fresh deploy will have an empty public site (graceful fallback to static `data/` will show).
- `SECURE_SSL_REDIRECT` defaults `True` — must be explicitly set `False` on Railway (per evidence 003).
- Cross-origin cookie config (`SameSite=None`) is mandatory for CMS/Leads auth to work on Railway.

---

## 16. Git / Repository Hygiene

- **Branch:** `main`, up to date with `origin/main`.
- **Last commit:** `af1f2f4` (2026-08-02) "optimize hero loading and responsive assets".
- **Working tree:**
  - **Modified (tracked):** `src/pages/CourseDetailPage.jsx` — removes redundant `useEffect` scroll-to-top (paired with the new global `ScrollToTop` component). This is a legitimate in-progress change matching the untracked `SIDRAHSOFT-GLOBAL-SCROLL-TO-TOP-FIX-001-REPORT.md`.
  - **Untracked:**
    - `src/components/ScrollToTop.jsx` — new component (mounted in `App.jsx` which is already committed).
    - `project-memory/evidence/SIDRAHSOFT-GLOBAL-SCROLL-TO-TOP-FIX-001-REPORT.md`
    - `project-memory/evidence/SIDRAHSOFT-HERO-PERFORMANCE-INVESTIGATION-001-REPORT.md`
    - `project-memory/evidence/SIDRAHSOFT-HERO-PERFORMANCE-OPTIMIZATION-001-REPORT.md`
    - `project-memory/evidence/SIDRAHSOFT-PRODUCTION-CMS-SUPERUSER-RBAC-FIX-001-REPORT.md`
    - `db_check.sqlite3` (0 bytes), `db_test.sqlite3` (180 KB) — **stray local DB artifacts**, should not be committed.
    - `truction]` — **stray file** containing a captured `git diff` output (34 lines). Clearly an accidental redirect artifact (likely `git diff > truction]` or similar typo). Should be deleted.
- **No commits/pushes/resets performed** during this audit.
- **`.gitignore`** is comprehensive (117 lines). Note: `db.sqlite3` pattern does not catch `db_check.sqlite3` / `db_test.sqlite3` (different basenames).

---

## 17. Technical Debt / Dead Code

| Item | Location | Confidence | Impact |
|---|---|---|---|
| **Unrouted CMS SPA** | `src/components/cms/**`, `src/pages/cms/**`, `CMSRoutes.jsx` (never imported in `App.jsx`); `/cms/*` redirects to `/leads/login` | High | Large amount of built, tested, but unreachable UI. Either re-wire or confirm intentional. |
| **Duplicate CORS middleware** | `backend/config/settings.py` lines 83–84 (`corsheaders.middleware.CorsMiddleware` listed twice) | High | Harmless (idempotent) but is a bug smell. |
| **Duplicate `CommonMiddleware`** | `settings.py` lines 82 and 89 (`django.middleware.common.CommonMiddleware` listed twice) | High | Harmless but should be deduplicated. |
| **Orphaned hero frame/video assets** | `src/assets/hero/frames/` (33 webp), `frames-mobile/`, `frames-kf05kf06/`, `frames-kf05kf06-mobile/`, `clips/*.mp4` + JSON job files | High | Performance optimization report (2026-08-02) explicitly verified these have zero runtime references and left them "as source material." They bloat the repo but are not bundled (Vite tree-shakes unreferenced imports). |
| **Stray repo-root files** | `truction]`, `db_check.sqlite3`, `db_test.sqlite3`, `api_partners_list.txt`, `backend_smoke.log`, `build_output.txt` (224 KB), `higgsfield_error.txt`, `query`, `screenshot-hero.mjs`, `seedance_model.json` (7 KB), `seedance_params.txt`, `hero-progress-*.png` (3 files, ~2 MB total) | High | Clutter; some are large; should be removed or gitignored. |
| **`version.txt`** | Root, contains Python version string `3.14.2...` | Med | Unclear purpose; runtime.txt already pins 3.12.7 for backend. |
| **`DNA/` and `cinematic-landing-kit-main/`** | Root, vendored reference repos with their own `CLAUDE.md`/`README.md`/`memory/` | Med | Not part of build; inflate repo size. Should be moved out or gitignored. |
| **Static + dynamic robots/sitemap duplication** | `public/robots.txt` + `public/sitemap.xml` (static) AND backend `seo_views.py` generating dynamic versions at root URLs | Med | The backend dynamic versions are routed at `/robots.txt` and `/sitemap.xml`; the `public/` files are Vite static assets. Which one wins depends on how `serve` and the backend are co-located. On Railway (separate services) the frontend serves the static files and the backend serves dynamic — the static ones may be stale. |
| **`CSRF_COOKIE_HTTPONLY = False` comment** | `settings.py` line 254 comment says "Frontend must read CSRF token from cookie" but `authApi.js` now reads it from the API response body | Low | Stale comment; behavior is fine. |
| **No frontend tests** | `package.json` has Playwright but no `test` script and no e2e specs in `src/` | Med | No automated frontend regression coverage. |
| **No Python lockfile** | `requirements.txt` uses `>=` ranges | Med | Non-reproducible backend builds. |
| **Main bundle > 500 KB** | `index-*.js` 537 KB (gzip 173 KB) | Low | Vite warning; acceptable for this app size but could be split further. |
| **`insightsApi.js` mixed import** | Both static and dynamic import in `useInsights.js` | Low | Dynamic import is a no-op for chunking. |
| **`ActivityLog.save` append-only comment** | `activity_logs/models.py` lines 191–196 — `save` has a `pass` with a comment about append-only but enforces nothing | Low | Real append-only enforcement is via read-only admin/API, not the model. Comment is misleading. |

No TODO/FIXME/HACK markers were searched exhaustively, but none were observed in the inspected files.

---

## 18. Historical Development Timeline

Reconstructed from `git log` + `project-memory/evidence/` modification dates + decision log. "Current validity" reflects cross-check against today's code.

| Phase | Date | Result | Evidence | Current validity |
|---|---|---|---|---|
| Project kickoff & knowledge base | 2026-07-06 | APPROVED decisions | `17-DECISION-LOG.md`, `00-PROJECT-VISION.md` | Valid (note: decision log says "MySQL" but stack is now PostgreSQL — superseded by later migration) |
| Initial production-ready site | 2026-07-19 | `20986d8` | git log | Superseded by later commits |
| Initial SidrahSoft release | 2026-07-21 | `250ef77` | git log | Base release |
| Railway backend preparation | 2026-07-21 | PASS | `SIDRAHSOFT-RAILWAY-BACKEND-PREPARATION-002` | Valid — `Procfile`, `start.sh`, `railway.toml`, `runtime.txt` present |
| Railway healthcheck SSL fix | 2026-07-21 | PASS | `SIDRAHSOFT-RAILWAY-HEALTHCHECK-SSL-FIX-003` | Valid — `SECURE_SSL_REDIRECT` is env-overridable |
| Railway frontend preparation | 2026-07-21 | PASS | `SIDRAHSOFT-RAILWAY-FRONTEND-PREPARATION-004` | Valid — `railway.frontend.toml`, `VITE_API_BASE_URL` enforced |
| Production inquiry types seed | 2026-07-21 | PASS | `SIDRAHSOFT-PRODUCTION-INQUIRY-TYPES-SEED-005` | Valid — `seed_inquiry_types` in `start.sh` |
| Production auth/CSRF fix | 2026-07-22 | PASS | `SIDRAHSOFT-PRODUCTION-AUTH-CSRF-INVESTIGATION-006` | **Valid** — `authApi.js` caches CSRF from response body; `settings.py` SameSite=None in prod (verified lines 260–269) |
| Leads dashboard hardening | 2026-07-15 | PASS (25/25 tests) | `LEADS-DASHBOARD-HARDENING-AND-RUNTIME-VALIDATION-001` | Valid — hard-delete disabled (405), stats endpoint, sanitization, RBAC route guard all present |
| Leads production smoke | 2026-07-15 | PASS (26/26) | `LEADS-PRODUCTION-SMOKE-VALIDATION-001` | Was local (console email); production not re-verified since |
| Production CMS superuser RBAC fix | 2026-07-26 | PASS | `SIDRAHSOFT-PRODUCTION-CMS-SUPERUSER-RBAC-FIX-001` | **Valid** — cookie fix present; RBAC superuser bypass confirmed in `permissions.py` |
| Global scroll-to-top fix | 2026-07-26 | PASS | `SIDRAHSOFT-GLOBAL-SCROLL-TO-TOP-FIX-001` | **Uncommitted** — `ScrollToTop.jsx` untracked, `CourseDetailPage.jsx` modified; `App.jsx` already imports it (committed) |
| Hero performance optimization | 2026-08-02 | PASS | `SIDRAHSOFT-HERO-PERFORMANCE-OPTIMIZATION-001` | **Valid** — `<picture>` AVIF/WebP, preload plugin, lazy routes, reduced font weights all present |
| Cross-origin session cookie fix | 2026-07-26 | `bd2b0d8` | git log | Valid — SameSite=None in prod |
| (Many earlier phase reports) | 2026-07-06 → 2026-07-20 | Various PASS | 120+ evidence files | Mostly valid; not all re-verified individually in this audit |

**Where development most likely stopped:** Hero performance optimization (2026-08-02) was the last committed work. The uncommitted scroll-to-top change (2026-07-26 evidence, but `App.jsx` import committed in `af1f2f4` on 2026-08-02) appears to be the last in-progress item. No work appears to have started after 2026-08-02.

---

## 19. Completed & Verified (against current code)

- Public website with all 11 homepage sections (CMS-driven + fallback).
- Public pages: training, course detail, case studies, insights, insight detail, careers.
- Bilingual EN/AR i18n with RTL switching.
- Cinematic hero (GSAP scroll, AVIF/WebP responsive, preload, reduced-motion).
- Cinematic shell (network background, mouse glow, mood-based layers).
- Header/footer/floating social bar.
- Django CMS backend: 13 apps, all migrations applied, `manage.py check` clean.
- Session auth + CSRF (cross-origin cookie fix applied; CSRF token cached from API).
- RBAC: 11 roles, 12 modules, permission classes on every CMS endpoint.
- Activity logging: append-only, sanitized, sensitive-key redaction, email masking.
- Leads/CRM: submission, list, detail, update, stats, archive/spam, hard-delete disabled, email notifications, throttling.
- Media library with uploads + validators.
- Site settings (singleton), navigation, homepage config CMS.
- SEO: per-route meta, dynamic robots.txt/sitemap.xml, structured data.
- Railway deployment config (frontend + backend).
- PostgreSQL migration complete.
- Frontend build passes (537 KB main bundle).
- Django system checks pass.

## 20. Implemented but Needs Verification

- **Live production health** — no live check performed since 2026-07-22; Railway domains may have changed.
- **Email delivery in production** — `EMAIL_BACKEND` defaults to console; production SMTP config must be set in Railway env. Not verified live.
- **Cross-origin auth on Railway** — fix is in code, but behavior depends on correct env vars (`SameSite=None`, `Secure`, `CORS`, `CSRF_TRUSTED_ORIGINS`, `ALLOWED_HOSTS`). Not verified live.
- **CMS dashboard SPA routing** — the SPA is built and backend endpoints exist, but `/cms/*` redirects to `/leads/login`. If the full CMS is intended to be live, routing must be re-wired and then verified.
- **Static vs dynamic robots/sitemap** — which version is actually served in production depends on Railway service routing; not verified.
- **Content seeds** — only `seed_inquiry_types` runs on deploy; all other content requires manual seeding. A fresh production deploy's content state is unverified.

## 21. Partial / Broken / Missing

| Item | Evidence | Impact | Severity | Recommended action |
|---|---|---|---|---|
| **CMS dashboard SPA not routed** | `App.jsx:168` redirects `/cms/*`→`/leads/login`; `CMSRoutes.jsx` never imported | Full CMS admin UI unreachable; only Leads usable | **HIGH** | Clarify intent. If CMS should be live, mount `CMSRoutes` under `/cms/*` with providers. If Leads-only is intended, consider removing dead CMS SPA code. |
| **Uncommitted scroll-to-top work** | `ScrollToTop.jsx` untracked, `CourseDetailPage.jsx` modified, evidence report untracked | In-progress change not committed; `App.jsx` already imports `ScrollToTop` (committed) so the import works only because the file exists locally | MED | Commit `ScrollToTop.jsx` + `CourseDetailPage.jsx` change + evidence report, or revert. |
| **Stray local artifacts in repo root** | `truction]`, `db_check.sqlite3`, `db_test.sqlite3`, `build_output.txt`, `backend_smoke.log`, `hero-progress-*.png`, `seedance_*`, `higgsfield_error.txt`, `query`, `api_partners_list.txt`, `screenshot-hero.mjs`, `version.txt` | Repo clutter; some large; risk of accidental commit | MED | Delete or gitignore; do not commit. |
| **Duplicate middleware entries** | `settings.py` lines 83–84 (CORS x2), 82 & 89 (Common x2) | Harmless but is a bug smell | LOW | Deduplicate. |
| **No frontend test suite** | `package.json` has Playwright devDep but no test script/specs | No FE regression coverage | MED | Add Playwright e2e for key flows (login, leads, public nav). |
| **No Python lockfile** | `requirements.txt` `>=` ranges | Non-reproducible builds; supply-chain risk | MED | Generate `requirements.lock` via pip-tools or `pip freeze`. |
| **Main bundle > 500 KB** | Vite build warning | Slightly heavy initial load | LOW | Further code-split or manualChunks. |
| **`ActivityLog.save` append-only not enforced** | `models.py:191-196` `pass` | Misleading; relies on admin/API read-only | LOW | Enforce in `save` or remove misleading comment. |
| **Stale `CSRF_COOKIE_HTTPONLY` comment** | `settings.py:254` | Misleading | LOW | Update comment to reflect response-body token caching. |
| **`DNA/` + `cinematic-landing-kit-main/` reference repos** | Root dirs | Repo bloat | LOW | Move out or gitignore. |

## 22. Risks & Blockers

1. **CMS routing ambiguity (blocker for CMS work):** Cannot continue CMS development without clarifying whether the full CMS dashboard should be live. The backend and frontend are both built; only the route is missing.
2. **Production unverified (risk):** No live health check since 2026-07-22. Cookie/auth/email behavior in production depends on correct Railway env vars that cannot be verified from the repo alone.
3. **Unpinned Python dependencies (risk):** A fresh Railway build could pull a newer, unvetted dependency version. Newly published packages have a non-trivial yank rate in the first days.
4. **Uncommitted in-progress change (risk):** `ScrollToTop.jsx` is untracked but imported by committed `App.jsx` — anyone cloning the repo today gets a broken build until the file is committed.
5. **Empty-content production deploy (risk):** Only inquiry types are seeded on deploy; all other public content requires manual seeding. A fresh deploy shows fallback static content, not real CMS content.

---

## 23. Recommended Next Roadmap

### P0 — Critical
1. **Commit or revert the in-progress scroll-to-top change.** `App.jsx` (committed) imports `ScrollToTop.jsx` (untracked) — the repo is currently in a state where a fresh clone breaks the build. Commit `ScrollToTop.jsx` + the `CourseDetailPage.jsx` modification + the evidence report, or revert the import.
2. **Verify live production health.** Hit the Railway frontend + backend URLs, confirm `/api/v1/health/`, login flow, leads dashboard, and a public page. Confirm Railway env vars (`SameSite=None`, `Secure`, `CORS`, `CSRF_TRUSTED_ORIGINS`, `ALLOWED_HOSTS`, `SECURE_SSL_REDIRECT=False`, `EMAIL_*`, `VITE_API_BASE_URL`).
3. **Confirm production email delivery.** Ensure `EMAIL_BACKEND` is SMTP (not console) and `CONTACT_NOTIFICATION_EMAIL` is set; submit a test lead and verify both internal + confirmation emails.

### P1 — Core Completion
4. **Resolve the CMS routing decision.** Either (a) mount `CMSRoutes` under `/cms/*` with `AuthProvider`/`CMSLanguageProvider`/`CMSToastProvider` and verify the full CMS dashboard end-to-end, or (b) confirm Leads-only is the intended scope and archive/remove the unrouted CMS SPA to reduce dead code.
5. **Seed production content.** Run the manual seed commands (`seed_site_settings`, `seed_navigation`, `seed_partners`, `seed_services`, `seed_case_studies`, `seed_insights`, `seed_jobs`, `seed_homepage`) against production, or add them to `start.sh` if idempotent.
6. **Pin Python dependencies.** Generate a lockfile (`pip-compile` or `pip freeze > requirements.lock`) and reference it in the Railway build for reproducibility.

### P2 — Quality
7. **Add frontend e2e tests.** Use the already-installed Playwright to cover: public nav, language toggle, contact form submission, leads login + list + detail + status change.
8. **Clean repo hygiene.** Remove stray root artifacts (`truction]`, `db_*.sqlite3`, `build_output.txt`, `backend_smoke.log`, hero-progress PNGs, seedance/higgsfield scratch files, `query`, `version.txt`) and gitignore patterns for `*.log`, `*_output.txt`, `db_*.sqlite3`. Decide on `DNA/` and `cinematic-landing-kit-main/` (move out or gitignore).
9. **Deduplicate middleware.** Remove the duplicate `CorsMiddleware` and `CommonMiddleware` entries in `settings.py`.
10. **Resolve static vs dynamic robots/sitemap.** Decide whether the frontend or backend owns `/robots.txt` and `/sitemap.xml` in production and remove the stale duplicate.

### P3 — Visual Polish
11. **Further split the main JS bundle** (537 KB) via `manualChunks` or additional lazy boundaries if Lighthouse scores warrant it.
12. **Remove orphaned hero frame/video assets** from `src/assets/hero/` once definitively confirmed unused, to reduce repo size (the 2026-08-02 report left them as "source material").
13. **Final branding polish** — review the placeholder social links in `index.html` structured data (`linkedin.com/company/PLACEHOLDER`, `wa.me/PLACEHOLDER`) and replace with real values.

---

## 24. Recommended Immediate Next Task

**Commit the in-progress scroll-to-top change (or revert it).**

Rationale: `src/App.jsx` (already committed in `af1f2f4`) contains `import ScrollToTop from './components/ScrollToTop';` and renders `<ScrollToTop />`, but `src/components/ScrollToTop.jsx` is **untracked**. A fresh `git clone` + `npm run build` will fail with a missing-module error. This is the only item that makes the current committed state broken for a fresh checkout. It is a 1-file commit (plus the paired `CourseDetailPage.jsx` modification and the evidence report) and unblocks everything else.

After that, the next decision point is **P1 #4: resolve the CMS routing question**, which determines whether the next phase is "wire up the full CMS dashboard" or "remove dead CMS SPA code."

---

## Appendix: Commands & Checks Executed

| # | Command | Result |
|---|---|---|
| 1 | `git status` | 1 modified, 6 untracked (see §16) |
| 2 | `git log --oneline -20` | 9 commits, last 2026-08-02 |
| 3 | `git branch --show-current` | `main` |
| 4 | `npm run build` | **PASS** — 164 modules, 11.66s, 537 KB main bundle (gzip 173 KB), 2 warnings (chunk size, dynamic-import) |
| 5 | `python manage.py check` | **PASS** — 0 issues |
| 6 | `python manage.py showmigrations` | **PASS** — all `[X]` applied |
| 7 | File reads (settings, urls, models, views, serializers, permissions, roles, services, frontend App/main/apiClient/authApi/AuthContext/LeadsRoutes/ProtectedRoute/CinematicHero/I18nProvider, package.json, vite.config.js, index.html, .gitignore, .env.example, railway.toml x2, Procfile, runtime.txt, start.sh, READMEs, decision log, vision, 6 evidence reports) | Cross-checked claims against current code |
| 8 | Directory listings (root, src/**, backend/apps/**, project-memory/**, public/, DNA/, cinematic-landing-kit-main/) | Mapped structure |

**No destructive commands run. No files modified. No dependencies installed/upgraded. No migrations created or applied. No commits/pushes/resets.**

---

## Confirmation

This audit was **investigation-only**. The **only file created** is:
`project-memory/evidence/SIDRAHSOFT-PROJECT-REONBOARDING-AUDIT-001-REPORT.md`

No project implementation files (source code, configuration, migrations, `.env`, lockfiles, dependencies) were modified, created, deleted, or committed.
