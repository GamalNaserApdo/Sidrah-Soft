# SIDRAH-DATABASE-MIGRATION-INTEGRITY-FIX-001 — Report

- **Date:** 2026-07-11
- **Scope:** Repair and validate Django/PostgreSQL migration state before continuing `CUSTOM-CMS-ACTIVITY-LOGGING-FOUNDATION-001`.
- **Report path:** `project-memory/evidence/SIDRAH-DATABASE-MIGRATION-INTEGRITY-FIX-001-REPORT.md`

## Final Status

- **Migration graph:** VALID
- **All migrations applied:** YES
- **Contact tables present:** YES
- **ORM create/delete works:** YES
- **No raw SQL cleanup needed:** YES (after migrations)
- **Existing account intact:** YES
- **Authentication regression:** PASS
- **Public API regression:** PASS
- **Data loss:** NONE
- **Activity Logging safe to implement:** YES

## Initial Migration State

```text
accounts
 [X] 0001_initial
 [ ] 0002_alter_user_role

admin
 [X] 0001_initial
 [X] 0002_logentry_remove_auto_add
 [X] 0003_logentry_add_action_flag_choices

auth
 [X] 0001_initial ... [X] 0012_alter_user_first_name_max_length

careers
 [ ] 0001_initial

case_studies
 [ ] 0001_initial

contact
 [ ] 0001_initial

contenttypes
 [X] 0001_initial
 [X] 0002_remove_content_type_name

core
 (no migrations)

insights
 [ ] 0001_initial

media_library
 [X] 0001_initial

navigation
 [X] 0001_initial

partners
 [ ] 0001_initial

services
 [ ] 0001_initial

sessions
 [X] 0001_initial

site_settings
 [X] 0001_initial
 [X] 0002_sitesetting_address_and_more
```

Unapplied migrations:

- `accounts.0002_alter_user_role`
- `careers.0001_initial`
- `case_studies.0001_initial`
- `contact.0001_initial`
- `insights.0001_initial`
- `partners.0001_initial`
- `services.0001_initial`

## Initial Migration Plan

```text
Planned operations:
accounts.0002_alter_user_role
    Alter field role on user
careers.0001_initial
    Create model Job
services.0001_initial
    Create model Service
partners.0001_initial
    Create model Partner
case_studies.0001_initial
    Create model CaseStudy
contact.0001_initial
    Create model InquiryType
    Create model ContactSubmission
insights.0001_initial
    Create model Article
```

`makemigrations --check` reported: **No changes detected**.

## Initial Missing Tables

Before applying migrations, the following tables were present:

```text
accounts_user
accounts_user_groups
accounts_user_user_permissions
auth_group
auth_group_permissions
auth_permission
django_admin_log
django_content_type
django_migrations
django_session
media_library_mediaasset
navigation_navigationitem
navigation_navigationmenu
site_settings_sitesetting
```

The following tables were missing:

- `careers_job`
- `case_studies_casestudy`
- `case_studies_casestudy_services` (M2M)
- `contact_contactsubmission`
- `contact_inquirytype`
- `insights_article`
- `partners_partner`
- `services_service`

## Migrations Applied

Command executed:

```powershell
Set-Location "f:\What_i_Made\New\sidrah_web\backend"
python .\manage.py migrate
```

Output:

```text
Operations to perform:
  Apply all migrations: accounts, admin, auth, careers, case_studies, contact, contenttypes, insights, media_library, navigation, partners, services, sessions, site_settings
Running migrations:
  Applying accounts.0002_alter_user_role... OK
  Applying careers.0001_initial... OK
  Applying services.0001_initial... OK
  Applying partners.0001_initial... OK
  Applying case_studies.0001_initial... OK
  Applying contact.0001_initial... OK
  Applying insights.0001_initial... OK
```

No faking was required.

## Final Migration State

```text
accounts
 [X] 0001_initial
 [X] 0002_alter_user_role

admin
 [X] 0001_initial
 [X] 0002_logentry_remove_auto_add
 [X] 0003_logentry_add_action_flag_choices

auth
 [X] 0001_initial ... [X] 0012_alter_user_first_name_max_length

careers
 [X] 0001_initial

case_studies
 [X] 0001_initial

contact
 [X] 0001_initial

contenttypes
 [X] 0001_initial
 [X] 0002_remove_content_type_name

core
 (no migrations)

insights
 [X] 0001_initial

media_library
 [X] 0001_initial

navigation
 [X] 0001_initial

partners
 [X] 0001_initial

services
 [X] 0001_initial

sessions
 [X] 0001_initial

site_settings
 [X] 0001_initial
 [X] 0002_sitesetting_address_and_more
```

## Final Validation Commands

```powershell
python .\manage.py migrate --plan
# Planned operations:
#   No planned migration operations.

python .\manage.py makemigrations --check
# No changes detected

python .\manage.py check
# System check identified no issues (0 silenced).
```

## Final Schema State

All expected tables now exist:

```text
accounts_user
accounts_user_groups
accounts_user_user_permissions
auth_group
auth_group_permissions
auth_permission
careers_job
case_studies_casestudy
case_studies_casestudy_services
contact_contactsubmission
contact_inquirytype
django_admin_log
django_content_type
django_migrations
django_session
insights_article
media_library_mediaasset
navigation_navigationitem
navigation_navigationmenu
partners_partner
services_service
site_settings_sitesetting
```

## Contact ORM Validation

Verified via Django ORM:

```text
InquiryType.objects.exists() -> True
ContactSubmission.objects.count() -> 0
Created temporary ContactSubmission id=1
Deleted temporary ContactSubmission
Final ContactSubmission count -> 0
```

Cascade/SET_NULL behavior no longer raises missing-table errors. Raw SQL was not needed.

## Accounts Migration Validation

Existing superuser account after migration:

```text
id: 1
username: admin
is_active: True
is_staff: True
is_superuser: True
role: content_manager
total users: 1
```

- Password was not changed.
- Role value remained valid.
- No user flags were modified.

## Authentication Regression

Validation performed against `http://127.0.0.1:8001` due to a port conflict on `8000` (see Environment Note below).

| Step | Status | Notes |
|------|--------|-------|
| `GET /api/v1/auth/csrf/` | 200 | CSRF cookie set, 32-char token |
| `POST /api/v1/auth/login/` (temp superuser) | 200 | `is_superuser=True`, `role=content_manager` |
| `GET /api/v1/auth/me/` | 200 | Current user returned |
| `GET /api/v1/admin/dashboard/access/` | 200 | `{"access":"granted"}` |
| `POST /api/v1/auth/logout/` | 200 | `{"detail":"Logged out successfully."}` |
| `GET /api/v1/auth/me/` after logout | 401 | Expected |

No CSRF origin regression occurred.

Temporary validation user `tmpmigratecheck` was created and then deleted via ORM.

## Public API Regression

| Endpoint | Status | Notes |
|----------|--------|-------|
| `GET /api/v1/site-settings/` | 200 (with temp data) / 404 (empty) | Endpoint responds correctly. 404 returned when no SiteSetting exists. |
| `GET /api/v1/navigation/` | 200 | 4 menus, 21 items |
| `GET /api/v1/partners/` | 200 | 0 items |
| `GET /api/v1/services/` | 200 | 0 items |
| `GET /api/v1/case-studies/` | 200 | 0 items |
| `GET /api/v1/jobs/` | 200 | 0 items |
| `GET /api/v1/insights/` | 200 | 0 items |
| `GET /api/v1/contact/inquiry-types/` | 200 | Returns inquiry types |
| `POST /api/v1/contact/submissions/` | 201 | Created and deleted temporary submission via ORM |

All temporary data was removed after validation.

## Temporary-Data Cleanup

Created and removed during validation:

- `InquiryType` records created for contact validation — deleted.
- `ContactSubmission` records created for ORM and API validation — deleted.
- `SiteSetting` record created to test site-settings endpoint — deleted.
- `User` record `tmpmigratecheck` created for auth regression — deleted via ORM.

No raw SQL was needed for cleanup after migrations.

## Data-Loss Verification

Final counts after cleanup:

```text
users: 1
inquiry_types: 0
contact_submissions: 0
site_settings: 0
navigation_menus: 4
navigation_items: 21
media_assets: 0
partners: 0
services: 0
case_studies: 0
jobs: 0
insights: 0
```

- The existing `admin` user remains.
- Navigation menus/items counts are unchanged.
- No real content was lost.

## Commands Executed

```powershell
Set-Location "f:\What_i_Made\New\sidrah_web\backend"
python .\manage.py showmigrations
python .\manage.py migrate --plan
python .\manage.py makemigrations --check
python .\manage.py migrate
python .\manage.py showmigrations
python .\manage.py migrate --plan
python .\manage.py makemigrations --check
python .\manage.py check
```

## Files Modified

No source files were modified. The only file that changed was the PostgreSQL database schema, which was updated by Django migrations.

## Environment Note

During authentication regression, a conflicting Django development server was discovered listening on `127.0.0.1:8000` for a different project:

```text
ProcessId: 22140
Path: F:\What_i_Made\New\Final_Year_4\...\manage.py runserver
```

To avoid interfering with that project, the SidrahSoft backend was validated on port `8001`. The frontend is currently configured for `http://127.0.0.1:8000`. To use the frontend with the backend, either:

1. Stop the other project's dev server and restart SidrahSoft on `8000`, or
2. Update `VITE_API_BASE_URL` / `src/services/apiClient.js` to point to `http://127.0.0.1:8001`.

## Final Database Readiness Verdict

**PASS.**

- Migration graph is valid and fully applied.
- All CMS tables exist.
- ORM operations work without raw SQL.
- Authentication and public API endpoints respond correctly.
- No data loss occurred.
- Activity Logging implementation can now proceed safely.

## Next Step

Proceed with `CUSTOM-CMS-ACTIVITY-LOGGING-FOUNDATION-001`.
