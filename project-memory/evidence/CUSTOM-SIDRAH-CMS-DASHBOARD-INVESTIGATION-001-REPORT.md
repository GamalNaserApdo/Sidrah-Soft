# CUSTOM-SIDRAH-CMS-DASHBOARD-INVESTIGATION-001

## 1. Executive Summary

The SidrahSoft website already has a solid Django CMS foundation covering eight domains. All CMS modules follow a consistent pattern: bilingual fields, `TimeStampedModel`, slugs, `MediaAsset` relationships, status/visibility flags, and public read-only DRF APIs.

However, **no custom admin dashboard exists yet**. The project still relies on Django Admin for content management. The authentication layer is only partially built: a custom `User` model with a `role` field exists, but there are no login endpoints, token endpoints, permission classes, or frontend auth context.

This report recommends a phased build of a **Custom Sidrah CMS Dashboard v1** that:

- Reuses existing Django models and public APIs where possible.
- Adds dedicated **admin-only APIs** under `/api/v1/admin/` for mutations.
- Builds a **separate admin UI** mounted at `/admin` in the React app, protected by auth.
- Implements a **role-based access control (RBAC)** layer mapped to the existing `User.role` field.
- Keeps Django Admin as the technical fallback and super-admin backdoor.

## 2. Current CMS State

### Completed backend apps

| App | Models | Public API | Admin | Notes |
|---|---|---|---|---|
| `site_settings` | `SiteSetting` | `GET /api/v1/site-settings/` | Yes | Single active record enforced at save time. Private `recipient_email` excluded from public serializer. |
| `navigation` | `NavigationMenu`, `NavigationItem` | `GET /api/v1/navigation/`, `GET /api/v1/navigation/<slug>/` | Yes | Two-level hierarchy, link types, icon assets. |
| `partners` | `Partner` | `GET /api/v1/partners/`, `GET /api/v1/partners/<slug>/` | Yes | Partner types, logo, featured flag. |
| `services` | `Service` | `GET /api/v1/services/`, `GET /api/v1/services/<slug>/` | Yes | Icon, featured image, CTA, SEO, homepage flag. |
| `case_studies` | `CaseStudy` | `GET /api/v1/case-studies/`, `GET /api/v1/case-studies/<slug>/` | Yes | Many-to-many services, partner/client attribution, problem/solution/technology/outcome. |
| `careers` | `Job` | `GET /api/v1/jobs/`, `GET /api/v1/jobs/<slug>/` | Yes | Employment/workplace/experience levels, application method, closing date. |
| `insights` | `Article` | `GET /api/v1/insights/`, `GET /api/v1/insights/<slug>/` | Yes | Draft/published/archived workflow, content types, scheduled publishing. |
| `contact` | `InquiryType`, `ContactSubmission` | `GET /api/v1/contact/inquiry-types/`, `POST /api/v1/contact/submissions/` | Yes | Lead workflow, assignment, email audit, CSV export. |
| `media_library` | `MediaAsset` | None | Yes | Reusable images/documents/videos/audio. |
| `core` | `TimeStampedModel` | `GET /api/v1/health-check/` | No | Shared abstract base. |
| `accounts` | `User` | None | Yes | Custom user with role field. |

### Common patterns observed

- All content models extend `TimeStampedModel` (`created_at`, `updated_at`).
- Bilingual fields are stored as `_en` / `_ar` pairs and exposed as `{en, ar}` objects in serializers.
- Public serializers fallback Arabic to English when blank.
- `MediaAsset` is referenced via `SET_NULL` foreign keys.
- Status/visibility is controlled by `is_active`, `is_featured`, `show_on_homepage`, plus domain-specific status fields (e.g., `Article.status`).
- Ordering is typically `display_order` then English name/title.
- Public views use `APIView` + `AllowAny` + filtering via query params.
- No mutations are exposed through public APIs; all write operations currently happen in Django Admin.

## 3. Existing Authentication Analysis

### User model

`backend/apps/accounts/models.py` defines a custom user:

```python
class User(AbstractUser):
    ROLE_SUPER_ADMIN = 'super_admin'
    ROLE_CONTENT_MANAGER = 'content_manager'
    ROLE_MARKETING_SEO = 'marketing_seo'
    ROLE_SUPPORT_RECRUITER = 'support_recruiter'
    ROLE_LMS_ADMIN = 'lms_admin'
    ROLE_FINANCE_SALES = 'finance_sales'

    role = models.CharField(
        max_length=32,
        choices=ROLE_CHOICES,
        default=ROLE_CONTENT_MANAGER,
    )
```

- `AUTH_USER_MODEL = 'accounts.User'` in settings.
- Role field is exposed in Django Admin but not used anywhere else.

### Authentication endpoints

- `backend/apps/accounts/urls.py` is empty.
- No login, logout, password reset, token, or session endpoints exist.
- No auth views/serializers exist.

### Session / token architecture

- Django session middleware is installed (`django.contrib.sessions.middleware.SessionMiddleware`).
- Django Admin uses session-cookie authentication today.
- DRF default permission is `AllowAny` globally.
- No DRF authentication classes configured.
- No JWT, token, or OAuth integration exists.

### Permissions

- Standard Django `auth_user`, `auth_group`, `auth_permission` tables are available.
- No custom permissions defined in any CMS app.
- No custom DRF permission classes tied to `User.role`.
- No `IsAdminUser` or `IsAuthenticated` usage in current views.

### Reusable components

- `User` model and role choices can be reused directly.
- Django session auth can be reused for a server-rendered admin, but a SPA dashboard will need token or session cookie auth with CSRF-safe handling.
- Django groups/permissions can supplement the role field.

### Missing pieces

- Login/logout/token endpoints.
- Password reset endpoints.
- DRF authentication configuration.
- Permission classes mapping `User.role` to dashboard features.
- Frontend auth state/context.
- CSRF-safe admin API strategy for a React SPA.

## 4. Existing Role Analysis

Current role choices are business-oriented but do not align cleanly with dashboard permissions:

| Role | Dashboard fit | Notes |
|---|---|---|
| `super_admin` | Super Admin | Full access; Django Admin fallback. |
| `content_manager` | Content Manager / Editor | Can manage most content but probably should not manage users or site-critical settings. |
| `marketing_seo` | Marketing Manager | Needs insights, site settings, partners, case studies, services. |
| `support_recruiter` | Support Agent + Recruiter | Needs contact submissions and careers. |
| `lms_admin` | Academy/LMS Admin | Future role; no LMS exists yet. |
| `finance_sales` | Finance/Sales | Could view leads and case studies; future payments access. |

**Recommendation:** keep the role field but add a dedicated permission matrix in code that maps each role to allowed modules and actions. Use Django groups/permissions as a secondary, more granular layer if needed later.

## 5. Existing CMS Module Analysis

### Site Settings

- Single-record pattern with `get_current()`.
- Public serializer groups fields into `general`, `contact`, `social`, `location`, `seo`, `branding`.
- Private `recipient_email` excluded from public API.
- Dashboard needs full edit form, single-record guard, and logo/favicon media pickers.

### Navigation

- Two-level hierarchy (`NavigationMenu` → `NavigationItem` → children).
- Link types: internal, external, anchor, email, phone.
- Icon asset FK.
- Dashboard needs nested drag-and-drop editor or parent/child form.

### Partners

- Flat model with logo FK.
- Bulk actions already exist in admin: activate/deactivate, mark featured.
- Dashboard needs standard list/create/edit with logo picker.

### Services

- Flat model with icon, featured image, CTA, SEO.
- Homepage flag.
- Dashboard needs standard CRUD plus media pickers.

### Case Studies

- Large model with problem/solution/technology/outcome bilingual fields.
- Many-to-many services.
- Partner FK or free-text client name.
- Dashboard needs multi-section form (accordion/tabs).

### Careers

- `Job` model with classification, dates, application method.
- Closing date drives public visibility.
- Dashboard needs standard CRUD plus expiration awareness.

### Insights

- `Article` model with draft/published/archived workflow and `published_at` scheduling.
- Content type field supports future taxonomy.
- Dashboard needs publishing workflow (save draft, schedule, publish now, archive).

### Contact

- `InquiryType`: CMS-managed categories.
- `ContactSubmission`: lead queue with status, priority, assignment, notes, email audit.
- Dashboard needs a dedicated lead-management UX, not a generic CRUD form.

### Media Library

- `MediaAsset` with file, title, alt text, media type, usage context.
- No public API.
- Dashboard needs a centralized picker/uploader reused by all content modules.

## 6. Dashboard Information Architecture

Recommended top-level structure for v1:

```
Dashboard Home
├── Content
│   ├── Services
│   ├── Case Studies
│   ├── Insights
│   ├── Partners
│   └── Careers
├── Website
│   ├── Navigation
│   ├── Site Settings
│   └── Media Library
├── Leads
│   ├── Inbox
│   ├── Inquiry Types
│   └── Archived
├── Users
│   ├── Users
│   └── Roles
└── Activity Logs
```

Future v2 expansion:

```
Academy (LMS)
├── Courses
├── Instructors
├── Students
├── Cohorts
├── Enrollments
├── Certificates
└── Payments
```

## 7. Recommended Navigation Structure

### Sidebar navigation

| Section | Icon suggestion | Roles |
|---|---|---|
| Dashboard | dashboard | All |
| Content | file-text | Content Manager, Marketing Manager, Admin |
| Website | globe | Content Manager, Marketing Manager, Admin |
| Leads | inbox | Support Agent, Recruiter, Admin |
| Users | users | Admin only |
| Settings | settings | Admin only |
| Activity Logs | activity | Admin only |

### Content submenu

- Services
- Case Studies
- Insights
- Partners
- Careers

### Website submenu

- Navigation
- Site Settings
- Media Library

### Leads submenu

- Inbox
- Inquiry Types
- Archived

## 8. Recommended Roles Matrix

| Module | Super Admin | Admin | Content Manager | Editor | Recruiter | Support Agent | Marketing Manager |
|---|---|---|---|---|---|---|---|
| Dashboard Home | View | View | View | View | View | View | View |
| Services | CRUD | CRUD | CRUD | Read/Update | — | — | Read |
| Case Studies | CRUD | CRUD | CRUD | Read/Update | — | — | Read |
| Insights | CRUD | CRUD | CRUD | Read/Update | — | — | Read |
| Partners | CRUD | CRUD | CRUD | Read/Update | — | — | Read |
| Careers | CRUD | CRUD | Read/Update | Read | CRUD | — | Read |
| Navigation | CRUD | CRUD | CRUD | Read/Update | — | — | Read |
| Site Settings | CRUD | Read/Update | Read | Read | — | — | Read/Update |
| Media Library | CRUD | CRUD | CRUD | Read/Upload | Read | Read | Read/Upload |
| Leads | CRUD + assign | CRUD + assign | Read/Notes | — | — | CRUD + assign | Read |
| Inquiry Types | CRUD | CRUD | Read/Update | — | — | — | Read |
| Users | CRUD | Read | — | — | — | — | — |
| Activity Logs | Read | Read | — | — | — | — | Read |

**Note:** "Admin" here refers to a dashboard admin role, separate from Django `superuser`.

## 9. Recommended Dashboard Widgets

### MVP widgets (v1)

- Total counts: services, case studies, insights, partners, careers.
- New contact submissions today / this week.
- Open submissions by status.
- Recent contact submissions (last 5).
- Recent content updates across all modules (last 5).
- Quick actions: add insight, add job, add partner, add service, view inbox.
- Expiring careers (closing date within 7 days).
- Draft insights count.

### Future widgets (v2)

- Traffic/SEO overview (once analytics integrated).
- Lead conversion funnel.
- Media storage usage.
- LMS enrollment summary.
- Revenue/payments summary.
- Recent academy activity.

## 10. Recommended Content Workflows

### Generic content workflow

1. **Create** → status defaults to draft/inactive.
2. **Edit** → save changes without publishing.
3. **Preview** → optional future feature; currently not implemented.
4. **Publish / Activate** → make visible publicly.
5. **Feature / Show on homepage** → optional promotion flags.
6. **Archive / Deactivate** → hide from public.
7. **Delete** → hard delete (with confirmation); consider soft-delete later.

### Insights-specific workflow

- `draft` → `published` (set `published_at` automatically or allow scheduling).
- `published` → `archived`.
- `archived` → `draft` or republish.

### Services / Partners / Case Studies workflow

- Toggle `is_active`.
- Toggle `is_featured`.
- Toggle `show_on_homepage`.
- Adjust `display_order`.

### Careers workflow

- Active while `is_active=True` and `closing_date` is null or future.
- Dashboard should warn when `closing_date` is within 7 days.

## 11. Recommended Contact Workflows

### Lead queue

- Default view: `new` submissions, newest first.
- Filters: status, priority, inquiry type, assigned user, date range.
- Search: name, email, company, message, public ID.

### Lead detail

- Read-only submission data on left.
- Editable workflow panel on right:
  - Status dropdown.
  - Priority dropdown.
  - Assigned to dropdown.
  - Internal notes textarea.
- Email audit section (read-only).
- Source metadata collapsed (admin-only).

### Bulk actions

- Mark contacted / in progress / closed / spam / archived.
- Assign to user.
- Export CSV.

### Inquiry Types management

- Standard CRUD with order and active flag.
- Optional recipient email override.

## 12. Media Library Assessment

### Current state

- `MediaAsset` supports image, document, video, audio, other.
- Files are hashed into `uploads/xx/yy/uuid.ext`.
- No public upload endpoint.
- No usage tracking (no reverse references).

### Recommendation

Build a centralized Media Library with:

- Upload endpoint (`POST /api/v1/admin/media/`).
- List endpoint with filters by type and search by title/alt text.
- Reusable media picker component in all content forms.
- Optional usage counter/where-used report in v2.
- Image thumbnail generation in v2.
- Storage limits and file-type validation by role.

### Expansion readiness

The current `MediaAsset` model is already generic enough to serve LMS content (course thumbnails, instructor photos, certificates, attachments).

## 13. Activity Log Recommendation

### Current state

- No activity logging exists.
- `TimeStampedModel` provides created/updated timestamps but no actor/action history.

### Recommended architecture

Create an `ActivityLog` model in `apps.core`:

```python
class ActivityLog(models.Model):
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    action = models.CharField(choices=[('create','Create'),('update','Update'),('delete','Delete'),('publish','Publish'),('status_change','Status Change')])
    target_type = models.CharField()  # app_label.model
    target_id = models.CharField()    # public_id or pk as string
    target_summary = models.CharField() # human-readable title
    metadata = models.JSONField(default=dict)  # changed fields, old/new values
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
```

Implementation strategy:

- Capture `post_save`/`post_delete` signals for CMS models.
- Log dashboard actions explicitly in admin API views.
- Do **not** log sensitive fields (passwords, tokens, raw IP in public logs).
- Retention policy: 90 days by default, archive to cold storage in v2.

Dashboard view:

- Filter by actor, module, action, date range.
- Expandable metadata diff.
- Export to CSV in v2.

## 14. Admin API Recommendation

### Strategy

Create a dedicated admin API namespace:

```
/api/v1/admin/
```

Do not reuse public read-only APIs for dashboard mutations.

### Rationale

- Public serializers shape data for frontend display and omit internal fields.
- Dashboard needs full internal fields, write access, and permission checks.
- Separating namespaces prevents accidental exposure and keeps public APIs stable.

### Suggested endpoints per module

```
GET    /api/v1/admin/dashboard/          # metrics/widgets
GET    /api/v1/admin/services/
POST   /api/v1/admin/services/
GET    /api/v1/admin/services/<slug>/
PUT    /api/v1/admin/services/<slug>/
PATCH  /api/v1/admin/services/<slug>/
DELETE /api/v1/admin/services/<slug>/
```

Repeat the same pattern for:

- `/api/v1/admin/case-studies/`
- `/api/v1/admin/insights/`
- `/api/v1/admin/partners/`
- `/api/v1/admin/careers/`
- `/api/v1/admin/navigation/`
- `/api/v1/admin/site-settings/`
- `/api/v1/admin/media/`
- `/api/v1/admin/contact-submissions/`
- `/api/v1/admin/inquiry-types/`
- `/api/v1/admin/users/`
- `/api/v1/admin/activity-logs/`

### Versioning

Use URL path versioning (`/api/v1/`, `/api/v2/`). Do not use header/media-type versioning unless required later.

### Pagination

Reuse `PageNumberPagination` from `REST_FRAMEWORK` defaults, but allow `page_size` up to a reasonable max (e.g., 100) for dashboard lists.

### Permissions

Introduce a `HasDashboardRole` DRF permission class:

```python
class HasDashboardRole(BasePermission):
    allowed_roles = []

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in self.allowed_roles
```

Module-specific subclasses:

- `IsContentManager` → services, case studies, insights, partners, navigation.
- `IsRecruiter` → careers.
- `IsSupportAgent` → contact submissions.
- `IsAdmin` → users, activity logs, site settings.
- `IsSuperAdmin` → fallback full access.

## 15. Frontend Architecture Recommendation

### Current frontend state

- React 19 + React Router 7 + Vite.
- `apiClient.js` wraps `fetch` with `ApiError`.
- `I18nProvider` handles language.
- No auth context.
- Public website only; no admin pages.

### Recommended dashboard structure

Add an admin subtree to the React app:

```
src/
├── admin/
│   ├── AdminApp.jsx          # admin-specific routes + layout
│   ├── components/
│   │   ├── AdminLayout.jsx
│   │   ├── Sidebar.jsx
│   │   ├── TopBar.jsx
│   │   ├── DataTable.jsx
│   │   ├── FilterBar.jsx
│   │   ├── FormModal.jsx
│   │   ├── MediaPicker.jsx
│   │   └── BilingualField.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useAdminApi.js
│   │   └── usePermissions.js
│   ├── pages/
│   │   ├── DashboardHome.jsx
│   │   ├── services/
│   │   ├── case-studies/
│   │   ├── insights/
│   │   ├── partners/
│   │   ├── careers/
│   │   ├── navigation/
│   │   ├── site-settings/
│   │   ├── media-library/
│   │   ├── leads/
│   │   ├── inquiry-types/
│   │   ├── users/
│   │   └── activity-logs/
│   ├── services/
│   │   └── adminApi.js
│   └── styles/
│       └── admin.css
```

### Routing

In `App.jsx`, split public and admin routes:

```jsx
<Routes>
  <Route path="/*" element={<PublicApp />} />
  <Route path="/admin/*" element={<AdminApp />} />
</Routes>
```

`AdminApp.jsx` wraps everything in `AuthProvider` and protected route guards.

### Shared components

- `DataTable`: sortable, filterable, paginated, with bulk actions.
- `FormModal`: create/edit in a slide-over or modal.
- `MediaPicker`: browse/upload/select media asset.
- `BilingualField`: side-by-side EN/AR inputs for all content forms.
- `StatusBadge`: color-coded workflow statuses.

### Auth context

```jsx
const AuthContext = createContext({ user: null, login: ..., logout: ... });
```

Store access token in `httpOnly` cookie (server) or memory-only JWT. Avoid local storage for tokens.

## 16. Security Recommendation

### Authentication

- Build a session-cookie or JWT login endpoint.
- If using JWT, keep it in memory and use refresh tokens in `httpOnly` cookies.
- Require strong passwords via existing validators.
- Add rate limiting on login (e.g., 5 attempts per 5 minutes per IP).

### Authorization

- Change DRF default permission from `AllowAny` to `IsAuthenticated` for admin API namespace only.
- Apply `HasDashboardRole` to every admin endpoint.
- Do not rely solely on `is_staff` or `is_superuser`; enforce `User.role` checks.

### CSRF

- For cookie-based session auth, send `X-CSRFToken` header from the React app.
- For JWT, CSRF is not a concern if token is not stored in cookies accessible to JavaScript.
- Consider SameSite cookie settings and HTTPS in production.

### Session management

- Short-lived access tokens (15 minutes).
- Sliding refresh tokens with revocation.
- Logout invalidates refresh token on server.

### Permission enforcement

- Enforce permissions in backend; do not trust frontend role checks for security.
- Hide UI elements based on role for UX only, but backend must reject unauthorized requests.

### Audit

- Log every admin mutation (actor, action, target, timestamp, IP).
- Do not log passwords, tokens, or full email bodies.

### API exposure risks

- Keep admin API under `/api/v1/admin/` with `IsAuthenticated`.
- Never expose internal notes, IP addresses, user agents, or recipient emails publicly.
- Continue excluding `recipient_email` from public site settings.

## 17. LMS Compatibility Review

### Future entities

- Courses, Instructors, Students, Cohorts, Enrollments, Certificates, Payments.

### Preparation steps in dashboard v1

- Use a generic role field with enough roles to include `lms_admin` (already present).
- Keep `MediaAsset` generic so it can store course thumbnails and instructor photos.
- Reserve dashboard navigation group "Academy" behind role checks.
- Design activity logging to support any app/model.
- Build reusable data table and form components that accept arbitrary schemas.
- Use app-based permission checks so new LMS apps plug in without rewriting auth.

### Recommended LMS module layout (future)

```
Academy
├── Courses
├── Instructors
├── Students
├── Cohorts
├── Enrollments
├── Certificates
└── Payments
```

## 18. Performance Considerations

### API growth

- Admin APIs will add list + detail + write endpoints for every module.
- Use pagination, `select_related`, and `prefetch_related` consistently.
- Avoid N+1 queries in admin serializers.
- Consider read-only replicas for dashboard list views in high-traffic future.

### Media growth

- Media files currently upload to local `media/uploads/`.
- For production, move to S3-compatible object storage (e.g., Cloudflare R2, AWS S3).
- Add CDN for public media delivery.

### PostgreSQL growth

- Contact submissions and activity logs will grow fastest.
- Add indexes on `ActivityLog.timestamp`, `target_type`, `target_id`.
- Consider partitioning or archiving old submissions/logs after 12–24 months.

### Permission complexity

- Keep permission checks simple (role list per view) to avoid complex joins.
- Cache user role/permissions in JWT or session.

### Dashboard bundle size

- Dashboard UI may use heavier tables/forms libraries.
- Lazy-load admin bundle separately from public website bundle if possible.
- Current Vite setup supports code splitting via dynamic imports.

## 19. Risks Ranked by Severity

### Critical

1. **No authentication endpoints exist.** The dashboard cannot be built without login/token infrastructure.
2. **DRF default permission is `AllowAny`.** Any future admin API accidentally mounted under `/api/v1/` instead of `/api/v1/admin/` could be publicly writable.
3. **No custom permission classes.** Role field is unused; any authenticated user could access everything if not properly gated.

### High

4. **No audit/activity logging.** Data changes cannot be traced to users.
5. **No media usage tracking.** Deleting a media asset could break pages if referenced.
6. **CSRF/session strategy undefined.** SPA dashboard needs explicit auth mechanism.
7. **Public and admin serializers mixed.** Mutations might leak internal fields if public serializers are reused.

### Medium

8. **Django Admin remains fallback.** Super-admins may bypass dashboard controls; permissions must stay consistent.
9. **Role granularity may be insufficient.** Business roles do not map 1:1 to dashboard permissions; matrix may need expansion.
10. **Frontend currently has no protected-route pattern.** Must be built from scratch.

### Low

11. **No preview workflow.** Content creators cannot preview before publishing in v1.
12. **No bulk import tools.** Initial content seeding relies on management commands or manual entry.
13. **Image thumbnails not generated.** Media picker could be slow for large libraries.

## 20. Final Dashboard Architecture

### CUSTOM SIDRAH CMS DASHBOARD v1

```
┌─────────────────────────────────────────┐
│           React SPA (Vite)            │
│  ┌─────────────┐  ┌──────────────────┐ │
│  │ Public Site │  │ /admin Dashboard │ │
│  └─────────────┘  └──────────────────┘ │
│         │                    │          │
│         └────────┬───────────┘          │
│                  fetch                  │
└──────────────────┼────────────────────┘
                   │
┌──────────────────▼────────────────────┐
│         Django + DRF Backend          │
│  ┌─────────────┐ ┌─────────────────┐  │
│  │ Public APIs │ │ Admin APIs      │  │
│  │ /api/v1/    │ │ /api/v1/admin/  │  │
│  │ AllowAny    │ │ IsAuthenticated │  │
│  └─────────────┘ │ + HasDashboardRole│  │
│                  └─────────────────┘  │
│  ┌─────────────────────────────────┐   │
│  │ Django Admin (superuser only)   │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Components

1. **Auth layer:** login/logout endpoints, JWT or session cookies, role-based permission classes.
2. **Admin APIs:** dedicated serializers and views for CRUD across all CMS modules.
3. **Media library API:** upload, list, delete.
4. **Dashboard UI:** separate admin route subtree with sidebar layout, reusable tables/forms/pickers.
5. **Activity logging:** signal-based or explicit logging for all mutations.
6. **Permission matrix:** role → module/action mapping enforced in backend.

## 21. Phased Implementation Plan

### Phase 1: Foundation (sprint 1)

- Build login/logout/token endpoints.
- Add DRF authentication classes.
- Create `HasDashboardRole` permission hierarchy.
- Add `/api/v1/admin/` URL namespace.
- Create frontend `AuthContext` and protected `/admin` route.
- Build `AdminLayout`, `Sidebar`, `TopBar`.

### Phase 2: Core content CRUD (sprint 2)

- Admin APIs + dashboard pages for:
  - Services
  - Partners
  - Case Studies
  - Insights
- Reusable `DataTable`, `FormModal`, `BilingualField`, `MediaPicker`.

### Phase 3: Website & settings (sprint 3)

- Navigation editor.
- Site Settings form.
- Media Library uploader/manager.

### Phase 4: Leads (sprint 4)

- Lead queue UX.
- Inquiry Types CRUD.
- Bulk actions and CSV export via admin API.

### Phase 5: Users & audit (sprint 5)

- User management page (admin only).
- Activity Log model + UI.
- Final permission matrix hardening.

### Phase 6: LMS prep (future)

- Add LMS models and admin APIs.
- Extend role checks for `lms_admin`.
- Add Academy navigation group.

## 22. Expected Files To Create

### Backend

- `backend/apps/accounts/views.py`
- `backend/apps/accounts/serializers.py`
- `backend/apps/accounts/permissions.py`
- `backend/apps/core/models.py` (extend with `ActivityLog`)
- `backend/apps/admin_api/__init__.py`
- `backend/apps/admin_api/apps.py`
- `backend/apps/admin_api/permissions.py`
- `backend/apps/admin_api/urls.py`
- `backend/apps/admin_api/serializers/` (per module)
- `backend/apps/admin_api/views/` (per module)
- `backend/apps/admin_api/services.py` (dashboard metrics)

### Frontend

- `src/admin/AdminApp.jsx`
- `src/admin/components/AdminLayout.jsx`
- `src/admin/components/Sidebar.jsx`
- `src/admin/components/TopBar.jsx`
- `src/admin/components/DataTable.jsx`
- `src/admin/components/FilterBar.jsx`
- `src/admin/components/FormModal.jsx`
- `src/admin/components/MediaPicker.jsx`
- `src/admin/components/BilingualField.jsx`
- `src/admin/contexts/AuthContext.jsx`
- `src/admin/hooks/useAuth.js`
- `src/admin/hooks/useAdminApi.js`
- `src/admin/hooks/usePermissions.js`
- `src/admin/services/adminApi.js`
- `src/admin/pages/DashboardHome.jsx`
- `src/admin/pages/services/ServicesListPage.jsx`
- `src/admin/pages/services/ServiceFormPage.jsx`
- (mirror for case-studies, insights, partners, careers, navigation, site-settings, media-library, leads, inquiry-types, users, activity-logs)
- `src/admin/styles/admin.css`

## 23. Expected Files To Modify

### Backend

- `backend/config/settings.py`
  - Add DRF authentication classes.
  - Configure admin API app.
- `backend/config/urls.py`
  - Add `/api/v1/admin/` include.
- `backend/apps/accounts/urls.py`
  - Add login/logout/token endpoints.
- `backend/apps/accounts/models.py` (optional)
  - Add `Meta.permissions` or keep role field as-is.
- `backend/apps/contact/admin.py`
  - Optionally expose via admin API (no changes needed for Django Admin fallback).

### Frontend

- `src/App.jsx`
  - Add `/admin/*` route.
- `src/services/apiClient.js`
  - Add auth header injection and 401 redirect.
- `src/main.jsx`
  - Wrap app with optional `AuthProvider` if it also serves dashboard.
- `vite.config.js`
  - Optional: configure build splitting for admin bundle.

## 24. Go / No-Go Recommendation

**GO — with conditions.**

Building the Custom Sidrah CMS Dashboard v1 is feasible because:

- The backend models are mature and consistent.
- Public APIs already define the shape of every content type.
- The `User` model already contains the role field needed for RBAC.
- Django Admin can remain the safety net during rollout.

**Conditions before starting implementation:**

1. Implement authentication endpoints and DRF auth configuration first.
2. Lock admin APIs behind `IsAuthenticated` + `HasDashboardRole`.
3. Build admin APIs separately from public serializers.
4. Add activity logging before any user-management features.
5. Decide on session-cookie vs. JWT auth and document the CSRF strategy.

---

## Investigation Integrity Statement

- No source code files were modified.
- No Django migrations were created.
- No database records were changed.
- No new APIs were implemented.
- No frontend pages were built.
- No packages were installed.
- No heavy test suites were executed.
- Only file/code inspection and lightweight analysis were performed.

The only file created is this investigation report.
