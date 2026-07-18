# Leads Dashboard Hardening & Runtime Validation

## Report metadata
- **Code name:** LEADS-DASHBOARD-HARDENING-AND-RUNTIME-VALIDATION-001
- **Scope:** Backend + frontend Leads Dashboard contact flow
- **Status:** PASS
- **Date:** 2026-07-15
- **Django focused tests:** 25/25 PASS
- **Frontend build:** PASS
- **Migrations check:** PASS
- **System checks:** PASS

## Objective
Audit and harden the Leads Dashboard implementation by closing critical security and behavior gaps around:
- production environment safety
- non-destructive archive/spam handling
- sensitive-data sanitization in activity logs
- accurate dashboard statistics
- module-based RBAC on frontend routes
- clear, safe email UI actions

## Changes implemented

### Backend
- **Production safety checks** (`backend/apps/contact/checks.py`)
  - New Django system checks that run during `manage.py check`.
  - `LEADS_DASHBOARD_BASE_URL` must not be a localhost/127.0.0.1 URL in production.
  - `EMAIL_BACKEND` must not be `console`, `locmem`, or `dummy` in production.
  - `DEFAULT_FROM_EMAIL` must be non-empty.
  - Checks are registered via `AppConfig.ready()` in `backend/apps/contact/apps.py`.
- **Email timeout** (`backend/config/settings.py`)
  - Added `EMAIL_TIMEOUT` so SMTP sends fail fast instead of hanging indefinitely.
- **Activity log sanitization** (`backend/apps/contact/services.py`)
  - Added `_mask_email()` to redact the local part of email addresses in logs.
  - Email activity metadata stores masked recipient only.
  - `object_repr` no longer exposes email/phone.
- **ContactSubmission string safety** (`backend/apps/contact/models.py`)
  - `__str__` no longer includes the submitter's email address.
- **Hard delete disabled** (`backend/apps/contact/cms_views.py`)
  - `CMSContactSubmissionDetailView.delete` returns `405 Method Not Allowed` with a clear message to archive or mark as spam.
- **Stats endpoint** (`backend/apps/contact/cms_views.py`, `cms_urls.py`)
  - New `GET /api/v1/cms/contact/submissions-stats/` returns full-queryset counts per status, respecting the same filters as the list endpoint.
- **Assigned-to validation** (`backend/apps/contact/cms_serializers.py`)
  - `CMSContactSubmissionUpdateSerializer.validate_assigned_to` now only accepts active users who are superusers or have a CMS role.

### Frontend
- **Module RBAC route guard** (`src/components/auth/ProtectedRoute.jsx`)
  - Added optional `requiredModule` prop.
  - Authenticated users without the required module are shown an access-denied screen instead of the route content.
- **Leads routes protected** (`src/components/leads/LeadsRoutes.jsx`)
  - All `/leads/*` private routes now pass `requiredModule="contact"`.
- **Dashboard stats from API** (`src/components/leads/LeadsDashboardPage.jsx`, `src/services/leadsApi.js`)
  - Summary cards use the dedicated `getLeadStats()` endpoint instead of computing counts from the paginated list.
- **Email action clarity** (`src/components/leads/LeadDetailPage.jsx`, `src/contexts/CMSLanguageContext.jsx`)
  - Replaced the ambiguous "Email Customer" button with a distinct "Open in email client" mailto link.
  - Added EN/AR translations for the new label.

## Focused tests

File: `backend/apps/contact/tests.py`

Coverage areas:
- Public submission creates a lead and sends internal + confirmation emails.
- Honeypot field blocks submission.
- SMTP failure still creates the lead and records the failure.
- Anonymous users are rejected from all CMS leads endpoints.
- Non-CMS users (`editor`, `lms_admin`, generic `web_visitor`) are rejected.
- Support agent can list, retrieve, and update leads.
- Invalid status/priority values are rejected.
- Archive and spam actions are non-destructive and create activity logs.
- Hard delete returns `405` even for a superuser.
- Internal notes are never written into activity log metadata or descriptions.
- Activity logs do not contain email, phone, or message content.
- Email activity log masks the recipient.
- Search, status, priority, inquiry-type filters and pagination work.
- Stats endpoint returns full-queryset counts and respects filters.
- Lead-only users cannot access unrelated CMS modules.
- Lead login/logout activity is logged.
- `assigned_to` accepts active CMS users, rejects inactive users, rejects non-CMS users, and supports unassignment.

### Test command
```powershell
$env:DB_ENGINE='django.db.backends.sqlite3'
$env:DB_NAME=':memory:'
python manage.py test apps.contact.tests.LeadHardeningTests -v 2
```

### Result
```
Ran 25 tests in 406.185s
OK
```

## Runtime validation checklist

Use the following steps before releasing to production or after any change in this area.

| # | Check | How to verify | Expected result |
|---|-------|---------------|-----------------|
| 1 | System checks | `python manage.py check` | `System check identified no issues` |
| 2 | Migrations | `python manage.py makemigrations --check` | `No changes detected` |
| 3 | Focused tests | Run command above | `Ran 25 tests ... OK` |
| 4 | Frontend build | `npm run build` | `✓ built` with exit code 0 |
| 5 | Production URL check | In production env, set `LEADS_DASHBOARD_BASE_URL=http://localhost:5174` then run `python manage.py check` | Check fails with `E001`/`E002` warning about localhost URL |
| 6 | Console email check | In production env, set `EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend` then run `python manage.py check` | Check fails with warning about unsafe email backend |
| 7 | Hard delete via API | Log in as superuser, `DELETE /api/v1/cms/contact/submissions/<id>/` | `405 Method Not Allowed`; record still exists |
| 8 | Stats endpoint | `GET /api/v1/cms/contact/submissions-stats/?status=new` as support agent | JSON with `total`, `new`, `contacted`, `in_progress`, `closed`, `spam`, `archived` matching filtered DB counts |
| 9 | Activity log sanitization | Update a lead with an internal note and inspect `ActivityLog` rows for `module='leads'` | No full email, phone, or note text appears in `metadata` or `description` |
| 10 | Email log masking | Submit a lead and inspect the `email_notification_sent` log | `metadata.recipient` contains `***` |
| 11 | Assigned-to validation | `PATCH /api/v1/cms/contact/submissions/<id>/` with an inactive or non-CMS `assigned_to` | `400 Bad Request` with `assigned_to` error |
| 12 | Frontend route RBAC | Log in as a user without `contact` module access and navigate to `/leads/dashboard` | Access-denied screen shown |
| 13 | Email client action | Open a lead detail and click "Open in email client" | Browser opens system mailto handler with `to=<lead email>` |

## Environment notes
- Tests use an in-memory SQLite database by setting `DB_ENGINE` and `DB_NAME` environment variables.
- The test suite intentionally mocks SMTP failures and asserts that the lead record is still persisted with `email_delivery_status=failed`.
- The SMTP tracebacks printed during the `test_smtp_failure_still_creates_lead` test are expected behavior from the service's error logging, not test failures.

## Verdict
All focused fixes are implemented, all 25 backend tests pass, and the frontend production build succeeds. The Leads Dashboard is hardened against the targeted security and behavior gaps and is ready for runtime validation on a staging/production environment.
