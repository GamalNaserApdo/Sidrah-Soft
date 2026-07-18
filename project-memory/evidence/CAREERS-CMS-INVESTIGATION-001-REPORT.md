# CAREERS-CMS-INVESTIGATION-001 — Final Report

## Executive Summary

The SidrahSoft project currently has a **frontend-only Careers section** with no backend representation of jobs, vacancies, departments, or applications. The existing section displays four hardcoded "role-area" cards (Software Engineering, AI & Automation, UI/UX Design, Business & Operations) rather than concrete job postings, and all career-related CTAs route users to the general contact form. There is no job detail page, no application form, no CV upload, and no Django model for careers or applications.

The backend already provides reusable foundations (`TimeStampedModel`, `MediaAsset`, bilingual field conventions, slug patterns, public API patterns, and Django Admin conventions) and has a dedicated `support_recruiter` user role ready for future recruitment workflows. A clean first CMS phase can add a `careers` app with a minimal `Job` model and public list/detail APIs, then optionally add a `JobApplication` model later if internal submissions are required.

**CMS Readiness Score: 4 / 10**

Reasoning: The frontend has a visible Careers anchor and reusable section/card styles, but zero backend support, no real job inventory, no application flow, no privacy safeguards, and no CMS management surface. The score reflects the gap between presentation and data management.

---

## Current Frontend State

### Careers-related files

| File | Role |
| --- | --- |
| `src/components/sections/CareersSection.jsx` | Hardcoded careers section with 4 role-area cards and a contact CTA |
| `src/components/Footer.jsx` | Footer link labeled "Careers" pointing to `#careers` anchor |
| `src/components/Header.jsx` | Header navigation is now CMS-driven via `useHeaderNavigation`; a Careers link can be added in Django Admin `NavigationItem` |
| `src/components/sections/ContactSection.jsx` | General contact form with an inquiry type that includes "career" |
| `src/styles/global.css` | `.careers-section`, `.career-card`, `.careers-cta-*` styles |
| `src/i18n/en.js` | `footer.links.careers`, `contact.inquiryTypes.career` |
| `src/i18n/ar.js` | Arabic translations for the above |
| `src/config/contactSettings.js` | Default contact recipient and required fields |
| `src/config/seo.js` | No careers page SEO entry exists |

### CareersSection.jsx structure

- Uses `IntersectionObserver` reveal with `prefers-reduced-motion` support.
- Cards fade up with a 100ms stagger.
- Desktop: 4-column grid. Tablet: 2-column. Mobile: 1-column.
- CTA block smooth-scrolls to `#contact`.
- No routing, no detail view, no apply button per card.

### Current hardcoded role-area cards

```jsx
const careerCards = [
  {
    title: 'Software Engineering',
    description: 'Build scalable web platforms, enterprise applications, and next-generation digital products.',
  },
  {
    title: 'AI & Automation',
    description: 'Design intelligent systems, automation workflows, and AI-powered solutions.',
  },
  {
    title: 'UI/UX Design',
    description: 'Craft intuitive experiences, interfaces, and digital journeys that users love.',
  },
  {
    title: 'Business & Operations',
    description: 'Support growth, partnerships, project delivery, and operational excellence.',
  },
];
```

These are **not job postings**. They are aspirational hiring areas used as a culture/opportunity teaser.

### Contact form career path

- `ContactSection.jsx` offers an inquiry type selector with keys `['general', 'projectConsultation', 'partnership', 'career', 'other']`.
- Selecting "career" only changes the dropdown value; no additional fields appear.
- Form submission is currently client-side only: `console.log(submissionPayload)` and `setIsSubmitted(true)`.
- No backend endpoint receives the submission.
- No CV upload field exists.

### Missing frontend pieces

- No `/careers` route.
- No `CareersPage.jsx`.
- No job detail page (`/careers/:slug`).
- No job application form.
- No CV upload component.
- No job filters UI.
- No careers page SEO in `src/config/seo.js`.
- No Arabic content for the four role-area cards.

---

## Current Job Inventory

There are **zero concrete job postings** in the project today. The only career-related content is the four role-area cards in `CareersSection.jsx`:

| # | Title | Department | Location | Type | Workplace | Level | Description | Apply URL | Active | Featured | Arabic |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Software Engineering | Engineering | — | — | — | — | Build scalable web platforms, enterprise applications, and next-generation digital products. | `#contact` | Yes (static) | No | No |
| 2 | AI & Automation | Engineering / R&D | — | — | — | — | Design intelligent systems, automation workflows, and AI-powered solutions. | `#contact` | Yes (static) | No | No |
| 3 | UI/UX Design | Design | — | — | — | — | Craft intuitive experiences, interfaces, and digital journeys that users love. | `#contact` | Yes (static) | No | No |
| 4 | Business & Operations | Operations / Growth | — | — | — | — | Support growth, partnerships, project delivery, and operational excellence. | `#contact` | Yes (static) | No | No |

All other fields (responsibilities, requirements, benefits, salary, deadline, posted date, experience level, employment type, workplace type) are **missing**.

---

## Current Backend State

### Existing Django apps

- `accounts`
- `core`
- `media_library`
- `navigation`
- `partners`
- `services`
- `site_settings`
- `case_studies`

### No careers app

There is no `backend/apps/careers/` directory and no `careers` entry in `INSTALLED_APPS` or migrations.

### No job/career models

A search for `class .*Job`, `class .*Career`, `class .*Vacancy`, `class .*Applicant`, `class .*Department`, `cv`, `resume`, `position` returned zero model definitions.

### No contact submission model

There is no `ContactSubmission`, `Inquiry`, or `Application` model. The `site_settings` app has contact email/social fields but no submission storage.

### Migration status

```text
accounts          [X] 0001_initial
admin             [X] 0001_initial ... 0012
auth              [X] 0001_initial ... 0012
case_studies      [X] 0001_initial
contenttypes      [X] 0001_initial ... 0002
core              (no migrations)
media_library     [X] 0001_initial
navigation        [X] 0001_initial
partners          [X] 0001_initial
services          [X] 0001_initial
sessions          [X] 0001_initial
site_settings     [X] 0001_initial ... 0002
```

No careers or contact-submission tables exist.

---

## Reusable Foundations

### Abstract base

`backend/apps/core/models.py` provides:

```python
class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### Media uploads

`backend/apps/media_library/models.py` provides `MediaAsset` with `FileField`, media type choices, alt text, usage context, and active flag. Files are stored under hashed paths. This is suitable for job-related imagery, but **CVs/resumes should not be served publicly through the same public URL path**.

### Bilingual conventions

Existing models use explicit `*_en` / `*_ar` fields (e.g., `title_en`, `title_ar`, `short_description_en`, `short_description_ar`) rather than a translation library. Frontend uses `getBilingual(value, lang)` with fallback to the other language.

### Slug + ordering + visibility patterns

- `slug` is a unique `SlugField` populated from the English title.
- `display_order` is a `PositiveIntegerField` for manual ordering.
- `is_active`, `is_featured`, and `show_on_homepage` boolean flags are used consistently.
- Public APIs filter by `is_active=True`.

### API patterns

- Public read endpoints use DRF `APIView` with `AllowAny`.
- List endpoints support query-string filtering (e.g., `is_featured`, `show_on_homepage`, `service`, `partner`, `industry`).
- Detail endpoints return 404 for inactive/unknown records.
- Serializers emit bilingual objects `{ en, ar }` and resolve media URLs.

### Django Admin conventions

- Model-specific admin classes with fieldsets.
- List display, filters, search, ordering, prepopulated slug, horizontal M2M selectors, and bulk actions are already established in partners, services, navigation, and case_studies admins.

### User roles

`accounts.User` includes a `support_recruiter` role, which maps naturally to managing contact/job applications in the future.

---

## Application Flow Analysis

### How users currently "apply"

1. User scrolls to the Careers section or clicks the footer/header Careers link.
2. They see four role-area cards but no apply button per card.
3. The "Don't See The Right Role?" CTA smooth-scrolls to the contact form.
4. The user selects "career" from the inquiry type dropdown and fills name/email/phone/company/message.
5. The form logs to the browser console and shows a fake success message.
6. Nothing is persisted or emailed.

### CV upload support

None.

### Backend submission endpoint

None.

### Applicant storage / status tracking

None.

### Email notification behavior

None.

### Recommended MVP application method

**Option A — External Apply Link** is the safest and fastest MVP.

Rationale:

- The current site has no application infrastructure.
- The existing contact form is not wired to a backend.
- Internal application storage introduces privacy, security, spam, and retention responsibilities immediately.
- The four current role-area cards are not real jobs; linking them to an email or external form matches the current "Get In Touch" intent.
- A future phase can add Option B (internal application storage) once the contact-submission backend and file-privacy controls are in place.

If internal applications are required later, use **Option C — Hybrid**: each job can choose between an external URL/email and an internal application form.

---

## Recommended Job Model

Proposed model: `careers.Job` extending `TimeStampedModel`.

### Fields

| Field | Type | Notes |
| --- | --- | --- |
| `title_en` | `CharField(255)` | Required |
| `title_ar` | `CharField(255)` | Optional, fallback to English |
| `slug` | `SlugField(255, unique=True)` | From English title |
| `department_en` | `CharField(120, blank=True)` | e.g. Engineering |
| `department_ar` | `CharField(120, blank=True)` | |
| `location_en` | `CharField(120, blank=True)` | e.g. Remote, Egypt |
| `location_ar` | `CharField(120, blank=True)` | |
| `employment_type` | `CharField(32, choices)` | full_time, part_time, contract, internship |
| `workplace_type` | `CharField(32, choices)` | remote, on_site, hybrid |
| `experience_level` | `CharField(32, choices)` | entry, mid, senior, lead |
| `short_description_en` | `TextField(blank=True)` | For cards |
| `short_description_ar` | `TextField(blank=True)` | |
| `description_en` | `TextField(blank=True)` | Full detail |
| `description_ar` | `TextField(blank=True)` | |
| `responsibilities_en` | `TextField(blank=True)` | Bullet list stored as text or JSON |
| `responsibilities_ar` | `TextField(blank=True)` | |
| `requirements_en` | `TextField(blank=True)` | |
| `requirements_ar` | `TextField(blank=True)` | |
| `preferred_qualifications_en` | `TextField(blank=True)` | |
| `preferred_qualifications_ar` | `TextField(blank=True)` | |
| `benefits_en` | `TextField(blank=True)` | |
| `benefits_ar` | `TextField(blank=True)` | |
| `application_method` | `CharField(32, choices)` | external_url, email, internal_form |
| `external_apply_url` | `URLField(blank=True)` | Used when method is external_url |
| `application_email` | `EmailField(blank=True)` | Used when method is email |
| `display_order` | `PositiveIntegerField(default=0)` | |
| `is_featured` | `BooleanField(default=False)` | |
| `is_active` | `BooleanField(default=True)` | |
| `show_on_homepage` | `BooleanField(default=False)` | |
| `posted_date` | `DateField(blank=True, null=True)` | |
| `closing_date` | `DateField(blank=True, null=True)` | Auto-expire if past |
| `seo_title_en` | `CharField(120, blank=True)` | |
| `seo_title_ar` | `CharField(120, blank=True)` | |
| `seo_description_en` | `TextField(blank=True)` | |
| `seo_description_ar` | `TextField(blank=True)` | |

### Indexes

- `careers_active_featured_idx` on `is_active`, `is_featured`, `display_order`
- `careers_active_homepage_idx` on `is_active`, `show_on_homepage`, `display_order`

If PostgreSQL 30-character index name limits apply, shorten to `jobs_active_featured_idx` / `jobs_active_homepage_idx`.

### Salary fields

**Defer.** There are no salary fields in current content, and exposing salary ranges requires market research and internal approval. Add later only if justified.

---

## Department and Taxonomy Decision

| Taxonomy | Recommendation | Reason |
| --- | --- | --- |
| Department | CharField with choices | Only 4 departments implied by current cards; no need for a separate model yet. Easy to promote later. |
| Location | CharField with choices | Current content has no locations. Choices (Remote, Egypt, Hybrid) are enough. |
| Employment Type | CharField with choices | Standard values; no separate model needed. |
| Workplace Type | CharField with choices | Standard values; no separate model needed. |
| Experience Level | CharField with choices | Standard values; no separate model needed. |

**Decision:** Use controlled choices on the `Job` model for the MVP. Promote to separate models only after the taxonomy grows beyond ~8 values or requires CMS-managed translations.

---

## JobApplication Model Decision

**Defer for MVP.**

If internal applications are required in a later phase, propose a minimal `careers.JobApplication` model:

| Field | Type |
| --- | --- |
| `job` | `ForeignKey(Job, on_delete=CASCADE, related_name='applications')` |
| `full_name` | `CharField(255)` |
| `email` | `EmailField()` |
| `phone` | `CharField(40, blank=True)` |
| `cover_letter` | `TextField(blank=True)` |
| `portfolio_url` | `URLField(blank=True)` |
| `linkedin_url` | `URLField(blank=True)` |
| `cv` | `FileField(upload_to=private_cv_path)` or FK to a private media model |
| `status` | `CharField(choices=new, in_review, interviewed, hired, rejected, archived)` |
| `internal_notes` | `TextField(blank=True)` |
| `consent_given` | `BooleanField(default=False)` |
| `submitted_at` | `DateTimeField(auto_now_add=True)` |

### CV storage

Do **not** reuse `MediaAsset` for CVs. `MediaAsset` files are served through the public media URL and would expose applicant documents. Create a separate private upload path (e.g., `uploads/cvs/`) with a dedicated model or `FileField`, served only through an admin-protected view.

---

## API Contract Proposal

### Public read endpoints

| Endpoint | Purpose |
| --- | --- |
| `GET /api/v1/jobs/` | Active jobs list with filters |
| `GET /api/v1/jobs/<slug>/` | Single active job detail; 404 if inactive or missing |

### Filters (query string)

- `department`
- `employment_type`
- `workplace_type`
- `experience_level`
- `is_featured=true`
- `show_on_homepage=true`
- `location`

### List payload shape

```json
[
  {
    "id": 1,
    "slug": "software-engineer",
    "title": { "en": "Software Engineer", "ar": "..." },
    "department": { "en": "Engineering", "ar": "..." },
    "location": { "en": "Remote", "ar": "..." },
    "employment_type": "full_time",
    "workplace_type": "remote",
    "experience_level": "mid",
    "short_description": { "en": "...", "ar": "..." },
    "posted_date": "2026-07-01",
    "closing_date": "2026-08-01",
    "display_order": 1,
    "is_featured": true,
    "show_on_homepage": true,
    "application_method": "email",
    "application_email": "careers@sidrahsoft.com"
  }
]
```

### Detail payload shape

Adds `description`, `responsibilities`, `requirements`, `preferred_qualifications`, `benefits`, and `seo` bilingual objects.

### Application submission endpoint (if implemented later)

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `POST /api/v1/job-applications/` | POST | Submit an internal application |

Required fields: `job` (slug or ID), `full_name`, `email`, `consent_given`.
Optional fields: `phone`, `cover_letter`, `portfolio_url`, `linkedin_url`, `cv` (file).

Validation:

- `consent_given` must be `true`.
- Email format valid.
- `job` must exist and be active with a future or no closing date.
- File type restricted to PDF, DOC, DOCX; max size 5MB.

Rate limiting and spam protection:

- Per-IP rate limit (e.g., 3 submissions per hour).
- Optional honeypot field.
- reCAPTCHA/hCaptcha integration later.

---

## Django Admin Plan

### Job Admin

- List display: title, department, location, employment type, workplace type, experience level, display order, closing date, is_active, is_featured, show_on_homepage.
- List filters: is_active, is_featured, show_on_homepage, employment_type, workplace_type, experience_level, department.
- Search: title, department, location, description.
- Ordering: `display_order`, `title_en`.
- Fieldsets: Identity, Organization, Classification, Content, Application, Display & Status, SEO, Timestamps.
- Prepopulated slug from `title_en`.
- Bulk actions: activate/deactivate, mark/remove featured, show/hide on homepage.
- Highlight expired/closing-soon rows with custom `list_display` coloring.

### JobApplication Admin (deferred)

- List display: job, full_name, email, status, submitted_at.
- Filters: status, job, submitted_at.
- Search: full_name, email, job title.
- Read-only fields: submitted_at, email.
- In-line CV download link.
- Internal notes text area.
- Export to CSV action.

---

## Custom CMS Dashboard Readiness

Future Sidrah-branded CMS modules needed for recruitment:

- **Job list**: paginated, searchable, filterable by status/department/type.
- **Create/edit job**: bilingual fields, classification dropdowns, deadline picker, application method selector, SEO.
- **Publish/unpublish**: toggle `is_active`.
- **Reorder**: drag-and-drop or `display_order` editor.
- **Duplicate job**: copy existing job as draft.
- **Application inbox**: list internal applications with status pipeline.
- **Applicant detail**: view application, download CV, add notes, change status.
- **Status pipeline**: New → In Review → Interviewed → Hired/Rejected/Archived.
- **Filters/search/export**: for both jobs and applications.
- **Bilingual editing**: all text fields must support en/ar.
- **SEO panel**: per-job title/description.
- **Application settings**: default recipient email, file size/type limits, consent text.

Authenticated APIs needed later:

- `GET /api/admin/jobs/`
- `POST /api/admin/jobs/`
- `PATCH /api/admin/jobs/<id>/`
- `DELETE /api/admin/jobs/<id>/`
- `GET /api/admin/job-applications/`
- `PATCH /api/admin/job-applications/<id>/`
- `GET /api/admin/job-applications/<id>/cv/` (protected download)

Use Django Admin for the MVP; build custom dashboard later.

---

## Frontend Migration Plan

### Files likely to change

- Create `src/services/jobsApi.js`
- Create `src/hooks/useJobs.js`
- Create `src/pages/CareersPage.jsx`
- Create `src/components/careers/JobCard.jsx`
- Modify `src/components/sections/CareersSection.jsx` to fetch CMS data and fall back to the four hardcoded cards.
- Modify `src/App.jsx` to add `/careers` route.
- Modify `src/config/seo.js` to add a careers page entry.
- Optionally modify `src/components/Footer.jsx` to link to `/careers` instead of `#careers` once the page exists.

### Card normalization

Map CMS fields to the existing `.career-card` style:

```js
{
  title: getBilingual(job.title, lang),
  department: getBilingual(job.department, lang),
  location: getBilingual(job.location, lang),
  description: getBilingual(job.short_description, lang),
  employmentType: job.employment_type,
  workplaceType: job.workplace_type,
  experienceLevel: job.experience_level,
  applyUrl: job.application_method === 'external_url' ? job.external_apply_url : `mailto:${job.application_email}`,
  postedDate: job.posted_date,
  closingDate: job.closing_date,
}
```

### Loading, empty-state, error, fallback

- `useJobs` should return `null` until valid data is received.
- `CareersSection` renders the four hardcoded cards when CMS data is `null` (preserves current design).
- `CareersPage` renders a static "No open positions" message if the API returns an empty list.
- API errors are logged; UI continues to show fallback content.

### Bilingual rendering

Continue using `getBilingual(value, lang)` and fall back to English if Arabic is missing.

### Animations and responsive behavior

Reuse existing `.career-card` CSS classes and `IntersectionObserver` reveal pattern. No redesign needed.

---

## Privacy and Security Review

| Concern | Current State | MVP Recommendation |
| --- | --- | --- |
| CV file privacy | No upload exists | Use private upload path, never public media URLs; serve only through admin-protected view |
| Applicant personal data | Not collected | Collect only name, email, phone; store securely; avoid retaining rejected applicants indefinitely |
| Public media exposure | `MediaAsset` is public | Do not link CVs to `MediaAsset` |
| Admin-only file access | N/A | CV downloads restricted to users with `support_recruiter` or `super_admin` role |
| Email handling | No backend email | Use Django `send_mail` to notify recruiter; do not expose recipient list publicly |
| Spam protection | None | Rate limiting + honeypot; add reCAPTCHA later |
| Rate limiting | None | Apply per-IP throttling on application and contact endpoints |
| Consent | None | Require explicit `consent_given` checkbox before submission |
| Data retention | N/A | Define retention policy (e.g., delete rejected applications after 12 months) |
| Export access | N/A | Limit CSV export to recruiters/super admins |
| Role permissions | `support_recruiter` exists | Assign view/change `JobApplication` permissions to that role |

---

## Risks and Gaps

| Risk / Gap | Severity | Notes |
| --- | --- | --- |
| No real job inventory | High | Current cards are role areas, not postings |
| No application backend | High | Contact form is client-side only |
| No CV upload | Medium | Blocks internal application method |
| Missing Arabic content | Medium | All current career content is English-only |
| No privacy policy linkage | Medium | Required once personal data is collected |
| No `/careers` page | Medium | Footer/header anchor is acceptable for now |
| No deadline logic | Low | Not needed until real postings exist |
| Hardcoded content | Medium | Cannot be managed without code changes |
| Overengineering risk | Medium | Resist adding separate Department/Location models until taxonomy grows |
| Future Academy/internship overlap | Low | Training page already exists; internships may be a separate "Internship" flag or category |

---

## Recommended Implementation Phases

1. **Minimal Job model** — create `careers` app, `Job` model, migration.
2. **Django Admin** — `JobAdmin` with list/filter/search/fieldsets/bulk actions.
3. **Public list/detail API** — `GET /api/v1/jobs/` and `GET /api/v1/jobs/<slug>/`.
4. **Seed current roles** — seed the four role-area cards as active jobs with `application_method='email'`.
5. **Frontend integration** — `useJobs`, `CareersPage`, `JobCard`, update `CareersSection` with CMS + fallback.
6. **Application model** — add `JobApplication` only after deciding to support internal submissions.
7. **Application submission endpoint** — `POST /api/v1/job-applications/` with file upload, rate limiting, consent.
8. **Admin recruitment workflow** — `JobApplicationAdmin` with status pipeline, CV download, notes.
9. **Custom CMS recruitment UI** — build after Django Admin workflow is proven.

---

## Lightweight Validation Checklist

For use when implementation begins:

- [ ] `apps.careers` registered in `INSTALLED_APPS`
- [ ] `python manage.py makemigrations` and `migrate` succeed
- [ ] `python manage.py seed_jobs` creates/updates without duplicates on second run
- [ ] `GET /api/v1/jobs/` returns 200 with active jobs only
- [ ] `GET /api/v1/jobs/<slug>/` returns 200 for active job, 404 for inactive/unknown
- [ ] Filtering by `department`, `employment_type`, `workplace_type`, `experience_level`, `is_featured`, `show_on_homepage` works
- [ ] Jobs with past `closing_date` are excluded from public list
- [ ] Frontend Careers section renders CMS data when available, falls back to hardcoded cards when not
- [ ] A CMS update (title/visibility/order) reflects on the frontend after refresh
- [ ] `POST /api/v1/job-applications/` succeeds only with valid data and consent (if implemented)

No full backend test suite required.

---

## Final Investigation Verdict

**Investigation complete. The project has no Careers CMS today, but the groundwork is favorable for a clean first implementation.**

Recommended next action: implement a minimal `careers` app with a `Job` model, Django Admin, public list/detail APIs, and a seed command that converts the four existing role-area cards into manageable CMS records. Defer `JobApplication` storage until the business is ready to receive and secure applicant data.
