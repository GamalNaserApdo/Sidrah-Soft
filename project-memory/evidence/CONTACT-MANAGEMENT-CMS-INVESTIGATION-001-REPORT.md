# CONTACT-MANAGEMENT-CMS-INVESTIGATION-001

## Investigation Status

- **Investigation ID:** CONTACT-MANAGEMENT-CMS-INVESTIGATION-001
- **Date:** 2026-07-11
- **Investigator:** Senior Django Architect / CMS Systems Analyst
- **Scope:** Complete current Contact system across frontend, backend, database, email, admin, and configuration
- **Verdict:** No functional contact backend exists. The frontend form is present but silently discards submissions (console-only). A greenfield Contact Management CMS is required.
- **Go / No-Go Recommendation:** **GO** for implementation, but only after the architecture and security controls documented below are approved.

---

## 1. Executive Summary

The SidrahSoft website has a polished frontend contact section (`src/components/sections/ContactSection.jsx`) that collects inquiry type, name, email, phone, company, and message. However, the form is **not wired to any backend**. On submit it prints a payload to `console.log`, sets a local success state, and resets the form. No data is persisted, no email is sent, and there is no spam, CSRF, or rate-limit protection.

The backend has no `contact` app, no contact models, no contact API endpoints, and no email sending configuration. `SiteSetting` already stores a `recipient_email` (`sidrahsoft@gmail.com` by default), `contact_email`, phone, WhatsApp/telegram URLs, address, and map data, so the public contact details are partially CMS-driven, but the submission pipeline is entirely absent.

The recommended path is to create a new `apps.contact` Django app with an `InquiryType` model and a `ContactSubmission` model, expose public `POST /api/v1/contact/submissions/` and `GET /api/v1/contact/inquiry-types/` endpoints, send email via a small service utility, and update the frontend to call the API. All work should follow the established project patterns: `TimeStampedModel`, bilingual fields with English fallback, controlled choice fields, Django Admin bulk actions, and `PageNumberPagination`.

---

## 2. Investigation Verdict

**CMS Readiness Score:** 2/10

- Public display data: partially CMS-driven through `SiteSetting` and hardcoded fallbacks.
- Submission capture: **none**.
- Email delivery: **none**.
- Spam/abuse protection: **none**.
- Admin workflow: **none**.
- Multilingual labels: present in frontend i18n only; inquiry type values are hardcoded keys.

A professional Contact Management CMS can be built cleanly because the surrounding architecture (PostgreSQL, DRF, CORS, `SiteSetting`, `MediaAsset`, `TimeStampedModel`, bilingual serializer patterns) is already mature and consistent.

---

## 3. Exact Files Inspected

### Frontend

- `f:\What_i_Made\New\sidrah_web\src\components\sections\ContactSection.jsx`
- `f:\What_i_Made\New\sidrah_web\src\components\Footer.jsx`
- `f:\What_i_Made\New\sidrah_web\src\components\Header.jsx`
- `f:\What_i_Made\New\sidrah_web\src\components\FloatingSocialBar.jsx`
- `f:\What_i_Made\New\sidrah_web\src\components\location\CompanyLocationCard.jsx`
- `f:\What_i_Made\New\sidrah_web\src\config\contactSettings.js`
- `f:\What_i_Made\New\sidrah_web\src\data\company\companyLocation.js`
- `f:\What_i_Made\New\sidrah_web\src\i18n\en.js`
- `f:\What_i_Made\New\sidrah_web\src\i18n\ar.js`
- `f:\What_i_Made\New\sidrah_web\src\hooks\useSiteSettings.js`
- `f:\What_i_Made\New\sidrah_web\src\services\siteSettingsApi.js`
- `f:\What_i_Made\New\sidrah_web\src\services\apiClient.js`
- `f:\What_i_Made\New\sidrah_web\src\App.jsx`
- `f:\What_i_Made\New\sidrah_web\src\components\sections\ServicesSection.jsx`
- `f:\What_i_Made\New\sidrah_web\src\hooks\useServices.js`
- `f:\What_i_Made\New\sidrah_web\src\services\servicesApi.js`

### Backend

- `f:\What_i_Made\New\sidrah_web\backend\config\settings.py`
- `f:\What_i_Made\New\sidrah_web\backend\config\urls.py`
- `f:\What_i_Made\New\sidrah_web\backend\.env.example`
- `f:\What_i_Made\New\sidrah_web\backend\requirements.txt`
- `f:\What_i_Made\New\sidrah_web\backend\apps\core\models.py`
- `f:\What_i_Made\New\sidrah_web\backend\apps\core\urls.py`
- `f:\What_i_Made\New\sidrah_web\backend\apps\site_settings\models.py`
- `f:\What_i_Made\New\sidrah_web\backend\apps\site_settings\admin.py`
- `f:\What_i_Made\New\sidrah_web\backend\apps\site_settings\serializers.py`
- `f:\What_i_Made\New\sidrah_web\backend\apps\site_settings\views.py`
- `f:\What_i_Made\New\sidrah_web\backend\apps\site_settings\urls.py`
- `f:\What_i_Made\New\sidrah_web\backend\apps\site_settings\management\commands\seed_site_settings.py`
- `f:\What_i_Made\New\sidrah_web\backend\apps\media_library\models.py`
- `f:\What_i_Made\New\sidrah_web\backend\apps\accounts\models.py`
- `f:\What_i_Made\New\sidrah_web\backend\apps\insights\models.py`
- `f:\What_i_Made\New\sidrah_web\backend\apps\insights\admin.py`
- `f:\What_i_Made\New\sidrah_web\backend\apps\insights\serializers.py`
- `f:\What_i_Made\New\sidrah_web\backend\apps\insights\views.py`
- `f:\What_i_Made\New\sidrah_web\backend\apps\insights\urls.py`
- `f:\What_i_Made\New\sidrah_web\backend\apps\careers\models.py`
- `f:\What_i_Made\New\sidrah_web\backend\apps\careers\admin.py`
- `f:\What_i_Made\New\sidrah_web\backend\apps\careers\serializers.py`
- `f:\What_i_Made\New\sidrah_web\backend\apps\careers\views.py`
- `f:\What_i_Made\New\sidrah_web\backend\apps\careers\urls.py`
- `f:\What_i_Made\New\sidrah_web\backend\apps\services\models.py`
- `f:\What_i_Made\New\sidrah_web\backend\apps\services\serializers.py`
- `f:\What_i_Made\New\sidrah_web\backend\apps\services\views.py`
- `f:\What_i_Made\New\sidrah_web\backend\apps\services\urls.py`
- `f:\What_i_Made\New\sidrah_web\backend\apps\partners\models.py`
- `f:\What_i_Made\New\sidrah_web\backend\apps\navigation\models.py`
- `f:\What_i_Made\New\sidrah_web\backend\apps\case_studies\models.py`

### Project metadata

- `f:\What_i_Made\New\sidrah_web\package.json`
- `f:\What_i_Made\New\sidrah_web\project-memory\evidence\INSIGHTS-CMS-INVESTIGATION-001-REPORT.md`
- `f:\What_i_Made\New\sidrah_web\project-memory\evidence\INSIGHTS-CMS-IMPLEMENTATION-001-REPORT.md`

---

## 4. Current Frontend Architecture

### 4.1 Homepage Contact Section

`f:\What_i_Made\New\sidrah_web\src\components\sections\ContactSection.jsx` is the only contact form in the application.

Responsibilities:
- Render the contact section anchored at `#contact`.
- Display headline, description, and a six-field form.
- Collect inquiry type, name, email, phone, company, and message.
- Show a client-side success state after fake submission.
- Embed `CompanyLocationCard` below the form.

Hardcoded values:
- Inquiry type options are hardcoded as keys:
  `['general', 'projectConsultation', 'partnership', 'career', 'other']`
- `contactSettings.emailRecipient` is used in the payload but not actually sent.
- Success text is read from i18n.

Data source:
- `useI18n()` for labels and placeholders.
- `contactSettings.emailRecipient` for the intended recipient.
- `useSiteSettings()` is **not** used by the form.

Submission behavior:
```js
const submissionPayload = {
  name: formData.name,
  email: formData.email,
  company: formData.company,
  inquiryType: formData.inquiryType,
  message: formData.message,
  phone: formData.phone,
  recipientEmail: contactSettings.emailRecipient,
};
console.log('Contact form submission:', submissionPayload);
setIsSubmitted(true);
setFormData(initialFormState);
```
No HTTP request is made.

Validation behavior:
- HTML5 validation via `required` attributes on `inquiryType`, `name`, `email`, and `message`.
- `type="email"` provides browser-level email validation.
- `noValidate` is **not** set, so browser validation runs.
- No custom regex, length limits, or server feedback.

Missing functionality:
- No real backend submission.
- No error state for server failures.
- No loading/spinner state during submission.
- No CSRF token, CAPTCHA, honeypot, or rate limiting.
- No tracking of source page, language, IP, or user agent.
- No file attachment support.
- No privacy/consent checkbox.

### 4.2 Header CTA

`f:\What_i_Made\New\sidrah_web\src\components\Header.jsx` provides a "Book Consultation" button that scrolls to `#contact` via `handleAnchorNav('contact')`. No header link navigates to a dedicated `/contact` route.

### 4.3 Footer Contact Details

`f:\What_i_Made\New\sidrah_web\src\components\Footer.jsx` uses `useSiteSettings()` and falls back to hardcoded values:
- `contactEmail` defaults to `sidrahsoft@gmail.com`.
- `whatsappUrl` defaults to `https://wa.me/PLACEHOLDER`.
- `linkedinUrl` defaults to `https://linkedin.com/company/PLACEHOLDER`.
- Address falls back to `companyLocation.address` ("Riyadh, Saudi Arabia").
- Google Maps URL falls back to `companyLocation.googleMapsUrl`.

### 4.4 Floating Social Bar

`f:\What_i_Made\New\sidrah_web\src\components\FloatingSocialBar.jsx` renders WhatsApp, Telegram, Email, and LinkedIn links from `settings.contact` and `settings.social`, with hardcoded `PLACEHOLDER` and `hello@sidrahsoft.com` fallbacks.

### 4.5 Company Location Card

`f:\What_i_Made\New\sidrah_web\src\components\location\CompanyLocationCard.jsx` merges CMS `SiteSetting` values with hardcoded `companyLocation` defaults and renders a Google Maps iframe, address, phone, email, and hours.

### 4.6 Dedicated Contact Page

No `/contact` route exists. `App.jsx` only exposes `/`, `/training`, `/case-studies`, `/insights`, `/insights/:slug`, and `/careers`. The contact experience is a homepage section only.

---

## 5. Current Backend Architecture

### 5.1 Installed Apps

`f:\What_i_Made\New\sidrah_web\backend\config\settings.py` `LOCAL_APPS`:
```python
'apps.core',
'apps.accounts',
'apps.site_settings',
'apps.navigation',
'apps.media_library',
'apps.partners',
'apps.services',
'apps.case_studies',
'apps.careers',
'apps.insights',
```
No `apps.contact` exists.

### 5.2 URL Configuration

`f:\What_i_Made\New\sidrah_web\backend\config\urls.py`:
```python
path('api/v1/', include('apps.core.urls')),
path('api/v1/', include('apps.site_settings.urls')),
path('api/v1/navigation/', include('apps.navigation.urls')),
path('api/v1/partners/', include('apps.partners.urls')),
path('api/v1/services/', include('apps.services.urls')),
path('api/v1/case-studies/', include('apps.case_studies.urls')),
path('api/v1/insights/', include('apps.insights.urls')),
path('api/v1/jobs/', include('apps.careers.urls')),
```
No contact URLs exist.

### 5.3 Reusable Base Model

`f:\What_i_Made\New\sidrah_web\backend\apps\core\models.py`:
```python
class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```
All CMS apps inherit from this.

### 5.4 Existing Email Infrastructure

**None.** A project-wide grep for `send_mail`, `EmailMessage`, `EMAIL_BACKEND`, and `DEFAULT_FROM_EMAIL` returned only model/serializer fields containing the word "email" (e.g., `contact_email`, `recipient_email`, `application_email`). No email sending code exists.

### 5.5 Media Asset System

`f:\What_i_Made\New\sidrah_web\backend\apps\media_library\models.py` exposes `MediaAsset(TimeStampedModel)` with `file`, `media_type` (image/document/video/audio/other), `alt_text`, `usage_context`, and `is_active`. This can be reused for future attachments.

### 5.6 Accounts / Roles

`f:\What_i_Made\New\sidrah_web\backend\apps\accounts\models.py` defines `User(AbstractUser)` with roles including `ROLE_SUPPORT_RECRUITER` and `ROLE_SUPER_ADMIN`, suitable for future contact ownership.

---

## 6. Current Submission Flow

```
User fills form in ContactSection.jsx
        |
        v
handleSubmit (client-side only)
        |
        v
Builds payload with hardcoded recipientEmail
        |
        v
console.log(payload)   <-- no network call
        |
        v
setIsSubmitted(true) and reset form
```

There is no persistence, no email, no API, no CORS transaction, no CSRF exchange, and no duplicate protection.

---

## 7. Current Form Fields Matrix

| Field | Label | Type | Required | Frontend Validation | Backend Validation | Default | Source | Recommendation |
|---|---|---|---|---|---|---|---|---|
| inquiryType | Inquiry Type | select | Yes | HTML `required` | N/A | `""` | Hardcoded keys | Keep; make CMS-driven via `InquiryType` |
| name | Name | text | Yes | HTML `required` | N/A | `""` | User input | Keep |
| email | Email | email | Yes | HTML `type="email"` + `required` | N/A | `""` | User input | Keep |
| phone | Phone | tel | No | None | N/A | `""` | User input | Keep (optional) |
| company | Company / Organization | text | No | None | N/A | `""` | User input | Keep (optional) |
| message | Message | textarea | Yes | HTML `required` | N/A | `""` | User input | Keep; add max-length |

Missing fields currently not present:
- Job title
- Subject
- Preferred contact method
- Budget
- Timeline
- Country
- Consent / privacy agreement
- Hidden tracking fields (source page, language, etc.)

---

## 8. Current Email Configuration

`f:\What_i_Made\New\sidrah_web\backend\config\settings.py`:
- No `EMAIL_BACKEND` setting.
- No `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `EMAIL_USE_TLS`, or `EMAIL_USE_SSL`.
- No `DEFAULT_FROM_EMAIL`.
- No server/email environment variables in `f:\What_i_Made\New\sidrah_web\backend\.env.example`.

`f:\What_i_Made\New\sidrah_web\backend\apps\site_settings\models.py` has:
- `contact_email` (public-facing)
- `recipient_email` (internal, help text: "Internal recipient for contact form submissions. Not exposed publicly.")

Default seed value in `f:\What_i_Made\New\sidrah_web\backend\apps\site_settings\management\commands\seed_site_settings.py`:
```python
contact_email='sidrahsoft@gmail.com',
recipient_email='sidrahsoft@gmail.com',
```

The `recipient_email` field is the natural CMS-managed destination for contact form submissions. The public serializer intentionally excludes `recipient_email`, so it is safe to use as the backend recipient.

Email sending is currently not implemented, so email failures cannot lose submissions. Once email is implemented, submissions must be persisted **before** attempting to send email to avoid data loss on SMTP failure.

---

## 9. Current Storage Behavior

No storage of contact submissions exists. There is no contact table, no migration, and no model. The only related stored data is `SiteSetting` contact fields.

Database conventions observed across the project:
- All CMS models inherit `TimeStampedModel` (`created_at`, `updated_at`).
- Primary keys use Django's default `BigAutoField`.
- Tables are explicitly named `<app>_<model>` (e.g., `insights_article`, `careers_job`).
- Soft-delete is implemented via `status` or `is_active` fields, not actual deletion.
- Media files use `MediaAsset` with a hashed UUID path.
- No audit log or versioning is present.

---

## 10. Current Admin Capability

No contact admin exists. Existing admin patterns are consistent:
- Fieldsets group related fields (`Identity`, `Contact`, `SEO`, `Timestamps`).
- `list_display` shows 8–12 key columns.
- `list_filter` covers status, type, booleans, and dates.
- `search_fields` covers bilingual text.
- Bulk actions update status, visibility, or featured flags.
- `readonly_fields` include `created_at` and `updated_at`.

This pattern can be copied directly for `ContactSubmission` and `InquiryType` admin classes.

---

## 11. Current Validation and Security

### What exists
- Browser-level HTML5 validation on four fields.
- `type="email"` input.
- `CORS_ALLOWED_ORIGINS` configured in backend.
- DRF default permission is `AllowAny`.

### What is missing
- Server-side validation.
- CSRF protection for the contact endpoint (DRF APIView sessions are CSRF exempt for non-session auth; explicit CSRF is not required for a public write endpoint, but `permission_classes = [AllowAny]` must remain).
- Rate limiting.
- CAPTCHA / reCAPTCHA / honeypot.
- Spam filtering.
- Length limits on message.
- Email header injection protection.
- XSS output encoding for the admin detail view.
- Attachment type/size validation.
- Privacy consent.
- IP/user-agent logging.

Current risk level: **High** once the form is wired to a backend without adding the above controls.

---

## 12. Confirmed Gaps

1. **No backend submission endpoint.** The form only logs to the console.
2. **No persistence.** Submissions are not stored.
3. **No email delivery.** No `EMAIL_BACKEND` or send logic.
4. **No inquiry type CMS.** Options are hardcoded in the frontend.
5. **No spam protection.** No CAPTCHA, honeypot, rate limit, or content filtering.
6. **No admin workflow.** Submissions cannot be reviewed, assigned, or exported.
7. **No CSV export.** No existing export utility was found.
8. **No attachment support.** The `MediaAsset` system exists but is not linked.
9. **No status workflow.** Submissions have no lifecycle.
10. **No CRM hooks.** No assignment, notes, activity log, or tags.
11. **No form availability switch.** Site settings cannot disable the form.
12. **No confirmation email** to the submitter.
13. **No source tracking.** Source page, language, IP, user agent are not captured.
14. **No dedicated `/contact` page.** Contact is a homepage section only.
15. **No recipient routing.** All inquiries would go to the same email.

---

## 13. Reusable Existing Components

| Component | Path | Reuse for Contact CMS |
|---|---|---|
| `TimeStampedModel` | `backend/apps/core/models.py` | Base for `InquiryType`, `ContactSubmission`, future `ContactActivity` |
| `MediaAsset` | `backend/apps/media_library/models.py` | Future attachment FK |
| `SiteSetting` | `backend/apps/site_settings/models.py` | Recipient email, public contact details, form availability |
| DRF `APIView` pattern | `backend/apps/insights/views.py` | Public POST/list endpoints |
| Bilingual serializer pattern | `backend/apps/insights/serializers.py` | Inquiry type labels |
| Admin fieldset/bulk-action pattern | `backend/apps/insights/admin.py` | Submission admin |
| `User` role foundation | `backend/apps/accounts/models.py` | Future staff assignment |
| `apiFetch` / `ApiError` | `src/services/apiClient.js` | Frontend contact API client |
| `useSiteSettings` | `src/hooks/useSiteSettings.js` | Fetch public contact config |
| i18n structure | `src/i18n/en.js`, `src/i18n/ar.js` | Labels, validation, success messages |

---

## 14. Recommended Models

### 14.1 `InquiryType` — Required now

```python
class InquiryType(TimeStampedModel):
    name_en = models.CharField(_('Name (English)'), max_length=120)
    name_ar = models.CharField(_('Name (Arabic)'), max_length=120, blank=True)
    slug = models.SlugField(_('Slug'), max_length=120, unique=True)
    description_en = models.TextField(_('Description (English)'), blank=True)
    description_ar = models.TextField(_('Description (Arabic)'), blank=True)
    recipient_email = models.EmailField(
        _('Recipient email override'),
        blank=True,
        help_text=_('Optional. If blank, SiteSetting.recipient_email is used.'),
    )
    display_order = models.PositiveIntegerField(_('Display order'), default=0)
    is_active = models.BooleanField(_('Active'), default=True)

    class Meta:
        db_table = 'contact_inquirytype'
        verbose_name = _('Inquiry Type')
        verbose_name_plural = _('Inquiry Types')
        ordering = ['display_order', 'name_en']
```

### 14.2 `ContactSubmission` — Required now

```python
class ContactSubmission(TimeStampedModel):
    # Identity and contact
    full_name = models.CharField(_('Full name'), max_length=255)
    email = models.EmailField(_('Email'))
    phone = models.CharField(_('Phone'), max_length=40, blank=True)
    company = models.CharField(_('Company / Organization'), max_length=255, blank=True)
    job_title = models.CharField(_('Job title'), max_length=120, blank=True)

    # Classification
    inquiry_type = models.ForeignKey(
        InquiryType,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        verbose_name=_('Inquiry type'),
    )
    related_service = models.ForeignKey(
        'services.Service',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        verbose_name=_('Related service'),
    )
    subject = models.CharField(_('Subject'), max_length=255, blank=True)
    message = models.TextField(_('Message'))
    preferred_contact_method = models.CharField(
        _('Preferred contact method'),
        max_length=16,
        choices=[('email', 'Email'), ('phone', 'Phone'), ('whatsapp', 'WhatsApp')],
        blank=True,
    )

    # Workflow
    STATUS_NEW = 'new'
    STATUS_CONTACTED = 'contacted'
    STATUS_IN_PROGRESS = 'in_progress'
    STATUS_CLOSED = 'closed'
    STATUS_SPAM = 'spam'
    STATUS_ARCHIVED = 'archived'
    STATUS_CHOICES = [
        (STATUS_NEW, _('New')),
        (STATUS_CONTACTED, _('Contacted')),
        (STATUS_IN_PROGRESS, _('In progress')),
        (STATUS_CLOSED, _('Closed')),
        (STATUS_SPAM, _('Spam')),
        (STATUS_ARCHIVED, _('Archived')),
    ]
    status = models.CharField(
        _('Status'),
        max_length=16,
        choices=STATUS_CHOICES,
        default=STATUS_NEW,
    )
    priority = models.CharField(
        _('Priority'),
        max_length=16,
        choices=[('low', 'Low'), ('normal', 'Normal'), ('high', 'High')],
        default='normal',
    )
    internal_notes = models.TextField(_('Internal notes'), blank=True)
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        verbose_name=_('Assigned to'),
        related_name='contact_submissions',
    )

    # Source and context
    source_page = models.CharField(_('Source page'), max_length=512, blank=True)
    language = models.CharField(_('Language'), max_length=10, blank=True, default='en')
    ip_address = models.GenericIPAddressField(_('IP address'), blank=True, null=True)
    user_agent = models.TextField(_('User agent'), blank=True)

    # Lifecycle timestamps
    contacted_at = models.DateTimeField(_('Contacted at'), blank=True, null=True)
    closed_at = models.DateTimeField(_('Closed at'), blank=True, null=True)

    # Email audit
    email_sent_at = models.DateTimeField(_('Notification email sent at'), blank=True, null=True)
    email_sent_to = models.EmailField(_('Notification email sent to'), blank=True)

    class Meta:
        db_table = 'contact_contactsubmission'
        verbose_name = _('Contact Submission')
        verbose_name_plural = _('Contact Submissions')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'created_at'], name='contact_status_created_idx'),
            models.Index(fields=['inquiry_type', 'status'], name='contact_type_status_idx'),
            models.Index(fields=['email', 'created_at'], name='contact_email_created_idx'),
        ]
```

### 14.3 Future entities (not recommended now)

- `ContactActivity` — Future only. Needed for CRM timeline.
- `ContactAssignment` — Future only. Can be covered by `assigned_to` and `ContactActivity` later.
- `ContactTag` — Future only.
- `ContactAttachment` — Recommended later; initially avoid attachments to reduce malware/surveillance risk.

---

## 15. Recommended Model Relationships

```
SiteSetting (1) --------------> recipient_email (used by ContactSubmission.save)
InquiryType (1) <------------ (0..n) ContactSubmission
Service (1) <---------------- (0..n) ContactSubmission
User (1) <------------------- (0..n) ContactSubmission (assigned_to)
MediaAsset (1) <------------- (0..n) ContactAttachment [future]
```

- `ContactSubmission` is the central fact table.
- `InquiryType` is a small lookup table with optional per-type email override.
- `Service` linkage enables "which service were they interested in?" reporting.
- `User` linkage reserves the assignment relationship without building a full CRM now.

---

## 16. Recommended Status Workflow

Minimum viable statuses:

| Status | Purpose | Allowed Transitions | Visible Publicly | Timestamp |
|---|---|---|---|---|
| `new` | Just submitted | `contacted`, `in_progress`, `spam`, `archived` | No | `created_at` |
| `contacted` | First reply sent | `in_progress`, `closed`, `archived` | No | `contacted_at` |
| `in_progress` | Active qualification/deal | `contacted`, `closed`, `archived` | No | — |
| `closed` | Done (won/lost/unqualified) | `archived`, `reopened` (manual) | No | `closed_at` |
| `spam` | Confirmed abuse | `archived` | No | — |
| `archived` | Hidden historical record | `new` (reopen) | No | — |

Notes:
- `qualified` / `unqualified` can be expressed through `closed` + `internal_notes` + `priority` in the MVP.
- `reopened` is a manual transition back to `new` or `in_progress`.
- Staff assignment is included as a nullable FK now to avoid schema migration later.

---

## 17. Recommended Django Admin Design

### `InquiryTypeAdmin`

```python
@admin.register(InquiryType)
class InquiryTypeAdmin(admin.ModelAdmin):
    list_display = ('name_en', 'name_ar', 'slug', 'recipient_email', 'display_order', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name_en', 'name_ar', 'slug')
    prepopulated_fields = {'slug': ('name_en',)}
    readonly_fields = ('created_at', 'updated_at')
```

### `ContactSubmissionAdmin`

```python
@admin.register(ContactSubmission)
class ContactSubmissionAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'created_at',
        'full_name',
        'email',
        'phone',
        'company',
        'inquiry_type',
        'related_service',
        'status',
        'priority',
        'assigned_to',
    )
    list_filter = (
        'status',
        'priority',
        'inquiry_type',
        'related_service',
        'language',
        'created_at',
    )
    search_fields = (
        'full_name',
        'email',
        'phone',
        'company',
        'subject',
        'message',
        'internal_notes',
    )
    date_hierarchy = 'created_at'
    readonly_fields = (
        'id',
        'created_at',
        'updated_at',
        'ip_address',
        'user_agent',
        'source_page',
        'language',
        'email_sent_at',
        'email_sent_to',
    )
    actions = (
        'mark_new',
        'mark_contacted',
        'mark_in_progress',
        'mark_closed',
        'mark_spam',
        'mark_archived',
        'export_csv',
    )

    fieldsets = (
        ('Submission', {
            'fields': ('full_name', 'email', 'phone', 'company', 'job_title'),
        }),
        ('Inquiry', {
            'fields': ('inquiry_type', 'related_service', 'subject', 'message', 'preferred_contact_method'),
        }),
        ('Workflow', {
            'fields': ('status', 'priority', 'assigned_to', 'internal_notes'),
        }),
        ('Source', {
            'fields': ('source_page', 'language', 'ip_address', 'user_agent'),
            'classes': ('collapse',),
        }),
        ('Email audit', {
            'fields': ('email_sent_at', 'email_sent_to'),
            'classes': ('collapse',),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
```

Editable fields: `status`, `priority`, `assigned_to`, `internal_notes`.
Immutable fields: all submission content and source metadata.

---

## 18. Recommended Public API Design

### Endpoints

```
GET    /api/v1/contact/inquiry-types/
POST   /api/v1/contact/submissions/
```

Optionally later:

```
GET    /api/v1/contact/config/
```

### `GET /api/v1/contact/inquiry-types/`

Response `200 OK`:
```json
[
  {
    "slug": "general",
    "name": { "en": "General Inquiry", "ar": "استفسار عام" },
    "description": { "en": "...", "ar": "..." },
    "display_order": 0
  }
]
```
Only `is_active=True` types returned. Ordered by `display_order`, `name_en`.

### `POST /api/v1/contact/submissions/`

Request payload:
```json
{
  "inquiry_type": "projectConsultation",
  "full_name": "Ahmed Ali",
  "email": "ahmed@example.com",
  "phone": "+966 50 000 0000",
  "company": "Example Co",
  "job_title": "CTO",
  "subject": "ERP project",
  "message": "We need an ERP system.",
  "preferred_contact_method": "email",
  "source_page": "/",
  "language": "en"
}
```

Required: `full_name`, `email`, `message`.
Optional: all others.

Response `201 Created`:
```json
{
  "id": 42,
  "status": "new",
  "created_at": "2026-07-11T09:00:00Z"
}
```

Response `400 Bad Request`:
```json
{
  "full_name": ["This field is required."],
  "email": ["Enter a valid email address."]
}
```

Response `429 Too Many Requests` when rate limit exceeded.
Response `503 Service Unavailable` if form is disabled via Site Settings (optional future switch).

### Permissions
- `AllowAny` for both endpoints.
- No authentication required.
- Throttle class for anonymous writes: e.g., `AnonRateThrottle` with `100/hour` per IP.

### Serializer separation
- `InquiryTypeSerializer` (public, read-only).
- `ContactSubmissionCreateSerializer` (public, write-only).
- `ContactSubmissionListSerializer` / `ContactSubmissionDetailSerializer` for future admin API.

---

## 19. Recommended Email Architecture

### Settings

Add to `f:\What_i_Made\New\sidrah_web\backend\config\settings.py`:

```python
EMAIL_BACKEND = os.environ.get(
    'EMAIL_BACKEND',
    'django.core.mail.backends.console.EmailBackend',
)
EMAIL_HOST = os.environ.get('EMAIL_HOST', '')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', '587'))
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
EMAIL_USE_TLS = os.environ.get('EMAIL_USE_TLS', 'True').strip().lower() in ('true', '1', 'yes')
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', 'Sidrah Soft <sidrahsoft@gmail.com>')
CONTACT_RECIPIENT_EMAIL = os.environ.get('CONTACT_RECIPIENT_EMAIL', '')
```

Development uses `console.EmailBackend`.
Production uses SMTP or a transactional provider (Mailgun, SendGrid, AWS SES, etc.) via env vars.

### Sending flow

```
POST /api/v1/contact/submissions/
        |
        v
Validate serializer
        |
        v
Create ContactSubmission (status=new)
        |
        v
Resolve recipient:
  submission.inquiry_type.recipient_email
  or SiteSetting.get_current().recipient_email
  or CONTACT_RECIPIENT_EMAIL
  or DEFAULT_FROM_EMAIL
        |
        v
Send email notification (best-effort)
        |
        v
Update email_sent_at / email_sent_to
        |
        v
Return 201 regardless of email success
```

Critical rule: **persist first, send second**. If email fails, the submission is not lost.

### Confirmation emails
Defer confirmation emails to users until a later phase. The MVP should focus on internal notification.

### Email templates
Use Django templates stored in `backend/templates/contact/`. Plain-text is required; HTML is optional.

---

## 20. Recommended Site Settings Integration

Values that belong in `SiteSetting` (already present or to add):

| Value | Current Field | Recommended Change |
|---|---|---|
| Public contact email | `contact_email` | Keep |
| Internal recipient email | `recipient_email` | Keep; make default for submissions |
| Phone | `phone` | Keep |
| WhatsApp URL | `whatsapp_url` | Keep |
| Telegram URL | `telegram_url` | Keep |
| Address | `address` | Keep |
| Google Maps URL | `google_maps_url` | Keep |
| Map embed URL | `map_embed_url` | Keep |
| Working hours | `working_hours` | Keep |
| Form availability switch | **missing** | Add `contact_form_enabled` BooleanField |
| Confirmation message | **missing** | Add `contact_confirmation_message_en/ar` (optional) |
| Default sender name | **missing** | Add `default_sender_name` (optional; or use env var) |

Values that belong in the Contact app:
- `InquiryType` records
- `ContactSubmission` records
- Per-inquiry-type recipient overrides
- Internal notes, status, priority, assignment

Keep `SiteSetting` as the global contact details container; keep `apps.contact` as the submission/lifecycle container.

---

## 21. Recommended Frontend Integration

### New / modified files

Create:
- `src/services/contactApi.js` — `getInquiryTypes()`, `submitContactForm(payload)`.
- `src/hooks/useInquiryTypes.js` — fetch active inquiry types.

Modify:
- `src/components/sections/ContactSection.jsx`
  - Replace hardcoded `inquiryTypeKeys` with API-driven options from `useInquiryTypes`.
  - Add `isLoading` and `error` states.
  - Call `submitContactForm()` in `handleSubmit`.
  - Pass `source_page` and `language` in payload.
  - Show real error message on failure.
  - Keep success state.

### Payload fields to send

```js
{
  inquiry_type,
  full_name,
  email,
  phone,
  company,
  job_title,
  subject,
  message,
  preferred_contact_method,
  source_page: window.location.pathname + window.location.search,
  language: lang,
}
```

### UX considerations
- Keep the same visual design; only behavior changes.
- Add a spinner on the submit button during submission.
- Disable submit button while loading to prevent duplicates.
- Display server validation errors under each field.
- Keep bilingual labels in `en.js` / `ar.js`.

---

## 22. Recommended CSV Export

Implement as a Django Admin action on `ContactSubmissionAdmin`:

```python
@admin.action(description='Export selected submissions to CSV')
def export_csv(modeladmin, request, queryset):
    response = HttpResponse(content_type='text/csv; charset=utf-8')
    response['Content-Disposition'] = 'attachment; filename="contact_submissions.csv"'
    response.write('\ufeff')  # UTF-8 BOM for Excel
    writer = csv.writer(response)
    writer.writerow([
        'Submission ID', 'Created date', 'Name', 'Email', 'Phone',
        'Company', 'Inquiry type', 'Requested service', 'Status',
        'Message', 'Internal notes',
    ])
    for obj in queryset:
        writer.writerow([...])
    return response
```

Encoding: UTF-8 with BOM for Arabic compatibility in Excel.
Date formatting: ISO 8601 or `YYYY-MM-DD HH:MM`.
Filtering: use admin `list_filter` before export.
Attachments: **not** included in CSV; provide a separate future admin view.
Privacy: restrict export to users with a custom permission; do not include `ip_address` or `user_agent` in the default export.

---

## 23. Spam and Security Recommendations

### MVP-safe controls (recommended now)

1. **Rate limiting**
   - DRF `AnonRateThrottle` on the submission endpoint.
   - Suggest 5 submissions / 15 minutes per IP, 100 / hour site-wide.

2. **Honeypot field**
   - Add a hidden `website` or `middle_name` field; reject if populated.

3. **Minimum message length**
   - Enforce `min_length=10` on `message`.

4. **Maximum field lengths**
   - `full_name` 255, `email` 254, `phone` 40, `message` 5000, `subject` 255.

5. **Email header injection protection**
   - Use Django's `send_mail` (which sanitizes headers) rather than raw strings.
   - Never use user input directly as a `Reply-To` without validation.

6. **HTML / XSS**
   - Escape output in email templates and admin detail view.
   - Store message as plain text; do not render HTML.

7. **SQL injection**
   - Use ORM/serializers exclusively; no raw SQL.

8. **No attachments in MVP**
   - Defer to avoid malware and storage risk.

9. **Privacy consent**
   - Add a required boolean `privacy_consent` to the public serializer, stored on the submission.

10. **IP / user-agent retention**
   - Capture for abuse analysis but do **not** expose publicly.
   - Document retention policy (e.g., 90 days).

### Deferrable controls

- CAPTCHA / reCAPTCHA (add if honeypot + rate limiting are insufficient).
- Akismet or ML spam classification.
- File attachment scanning.

---

## 24. Multilingual Readiness

Current state:
- Frontend i18n (`en.js`, `ar.js`) has complete Arabic labels for the contact form.
- Inquiry type values are hardcoded keys; Arabic labels are in i18n.

Recommended structure:
- `InquiryType` stores bilingual `name_en/name_ar` and `description_en/description_ar`.
- Public API returns `{ "en": ..., "ar": ... }` with English fallback.
- Validation messages use Django translations (`gettext_lazy`).
- Success message stored as key in frontend i18n.
- Email subject line stored as bilingual Site Setting or hardcoded with `gettext`.
- Admin `verbose_name` and `help_text` wrapped in `gettext_lazy`.
- CSV export: keep UTF-8 BOM; do not translate column headers unless required.

---

## 25. Future CRM Compatibility

Fields to include now to avoid destructive redesign later:

| Field | Purpose |
|---|---|
| `assigned_to` FK | Staff ownership |
| `status` with `new/contacted/in_progress/closed/spam/archived` | Lifecycle |
| `priority` | Lead triage |
| `internal_notes` | Follow-up context |
| `source_page`, `language` | Attribution |
| `ip_address`, `user_agent` | Abuse + analytics |
| `contacted_at`, `closed_at` | SLA reporting |
| `email_sent_at`, `email_sent_to` | Email history |
| `related_service` FK | Service-interest mapping |
| `InquiryType.recipient_email` | Routing per type |

Future-only entities:
- `ContactActivity` (calls, emails, WhatsApp)
- `ContactTag`
- `ContactAttachment`
- Lead scoring
- Webhooks

Keep the MVP schema normalized so these can be added as separate tables later.

---

## 26. Attachment Recommendation

**Defer attachments in the MVP.**

Rationale:
- The current form has no attachment field.
- No use case justifies the malware, storage, and privacy risk at this stage.
- `MediaAsset` already exists for future CV / project-brief uploads.

If added later:
- Restrict to `pdf`, `doc`, `docx`, `png`, `jpg`.
- Max size 5 MB.
- Virus scan before storage.
- Store via `MediaAsset` FK.
- Do not attach to email notifications automatically; provide secure admin download links.
- Consider a separate `CareerApplication` model to avoid mixing CVs with general contact submissions.

---

## 27. Risks Ranked by Severity

| Risk | Severity | Evidence / Rationale |
|---|---|---|
| Losing submissions when email fails | **Critical** | No persistence currently exists. Once email is added, failure would drop data unless persist-first pattern is used. |
| Exposing private submission data publicly | **Critical** | Public API must only return a minimal 201 response; never serialize full submission. |
| Form submissions are silently discarded today | **Critical** | `ContactSection.jsx` only `console.log`s the payload. |
| Spam abuse on public POST endpoint | **High** | No rate limiting, CAPTCHA, or honeypot. |
| Hardcoded inquiry types | **High** | Inquiry keys are hardcoded in `ContactSection.jsx`; marketing cannot change them. |
| Weak validation | **High** | Only HTML5 validation; no server-side length, format, or content checks. |
| Duplicate leads | **High** | No duplicate detection; same user can submit repeatedly. |
| Tight coupling with Site Settings | **Medium** | Recipient email is the only dependency; manageable if kept as a fallback chain. |
| Unsafe CSV exports | **Medium** | Export must respect permissions and exclude PII like IP/UA. |
| Mixing career applications with contact | **Medium** | Careers app already exists; keep contact form general only. |
| Breaking existing frontend design | **Low** | Changes are behavioral, not visual. |
| Future CRM migration difficulty | **Low** | Recommended schema already includes assignment, status, and activity timestamps. |
| Storing unnecessary personal data | **Low** | IP/UA are useful for abuse but should have retention policy. |

---

## 28. Exact Implementation Phases

### Phase 1 — Backend models and migration
- Create `backend/apps/contact/`.
- Create `models.py` with `InquiryType` and `ContactSubmission`.
- Create migration `0001_initial.py`.
- Register app in `backend/config/settings.py` `LOCAL_APPS`.
- Run `python manage.py check` and `python manage.py migrate`.

### Phase 2 — Django Admin
- Create `admin.py` for `InquiryType` and `ContactSubmission`.
- Add list display, filters, search, bulk actions, and CSV export.
- Validate in `/admin/`.

### Phase 3 — Public serializers and APIs
- Create `serializers.py` and `views.py`.
- Add `urls.py` and include in `config/urls.py`.
- Implement `GET /api/v1/contact/inquiry-types/` and `POST /api/v1/contact/submissions/`.

### Phase 4 — Email service
- Add email settings to `settings.py` and `.env.example`.
- Create `backend/apps/contact/services.py` with `send_contact_notification()`.
- Persist submission, then send email, then record `email_sent_at`/`email_sent_to`.
- Test with console backend in development.

### Phase 5 — Site Settings integration
- Add `contact_form_enabled` BooleanField to `SiteSetting` (optional but recommended).
- Update `seed_site_settings.py` to set sensible defaults.
- Update `SiteSettingSerializer` if new public fields are added.

### Phase 6 — Frontend form integration
- Create `src/services/contactApi.js` and `src/hooks/useInquiryTypes.js`.
- Refactor `ContactSection.jsx` to fetch inquiry types and submit to API.
- Add loading/error states.
- Keep existing i18n labels.

### Phase 7 — Validation and abuse prevention
- Add server-side validators (length, email format, message min length).
- Add honeypot field to serializer.
- Add DRF throttle for anonymous writes.
- Add rate-limit error handling in frontend.

### Phase 8 — CSV export
- Implement admin CSV action.
- Test Arabic output in Excel.

### Phase 9 — Seed data
- Create `backend/apps/contact/management/commands/seed_inquiry_types.py`.
- Seed the five current inquiry types with bilingual labels.

### Phase 10 — Lightweight validation
- Run `python manage.py check`, `makemigrations --check`, API smoke tests.
- Verify 201 response, admin list view, CSV export, and email console output.
- Run `npm run build` to confirm frontend still builds.

---

## 29. Expected Files to Create

Backend:
- `backend/apps/contact/__init__.py`
- `backend/apps/contact/apps.py`
- `backend/apps/contact/models.py`
- `backend/apps/contact/admin.py`
- `backend/apps/contact/serializers.py`
- `backend/apps/contact/views.py`
- `backend/apps/contact/urls.py`
- `backend/apps/contact/services.py`
- `backend/apps/contact/tests/__init__.py`
- `backend/apps/contact/tests/test_api.py`
- `backend/apps/contact/tests/test_models.py`
- `backend/apps/contact/management/commands/seed_inquiry_types.py`
- `backend/apps/contact/migrations/0001_initial.py`
- `backend/templates/contact/notification_email.txt`
- `backend/templates/contact/notification_email.html` (optional)

Frontend:
- `src/services/contactApi.js`
- `src/hooks/useInquiryTypes.js`

---

## 30. Expected Files to Modify

Backend:
- `backend/config/settings.py` — add `apps.contact`, email settings, throttle config.
- `backend/config/urls.py` — include contact URLs.
- `backend/apps/site_settings/models.py` — add `contact_form_enabled` (optional).
- `backend/apps/site_settings/admin.py` — expose new field.
- `backend/apps/site_settings/serializers.py` — expose public fields if needed.
- `backend/apps/site_settings/management/commands/seed_site_settings.py` — set default.
- `backend/.env.example` — add email env vars.
- `backend/requirements.txt` — no new packages needed for MVP.

Frontend:
- `src/components/sections/ContactSection.jsx` — wire to API, add loading/error.
- `src/i18n/en.js` / `src/i18n/ar.js` — add error/rate-limit messages.
- `src/App.jsx` — no route change required unless a dedicated contact page is desired later.

---

## 31. Lightweight Validation Plan

Commands to run after implementation (do not run now):

```powershell
cd f:\What_i_Made\New\sidrah_web\backend
python manage.py check
python manage.py makemigrations --check
python manage.py migrate
python manage.py seed_inquiry_types
python manage.py seed_site_settings
python manage.py runserver
```

API smoke tests:

```powershell
curl http://127.0.0.1:8000/api/v1/contact/inquiry-types/
curl -X POST http://127.0.0.1:8000/api/v1/contact/submissions/ \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Test","email":"test@example.com","message":"Hello"}'
```

Frontend:

```powershell
cd f:\What_i_Made\New\sidrah_web
npm run build
```

Django Admin checks:
- `/admin/contact/inquirytype/`
- `/admin/contact/contactsubmission/`
- Bulk actions and CSV export function.

---

## 32. Final Go / No-Go Recommendation

**GO** — with the following conditions:

1. Implement the persistence-first email architecture so submissions are never lost on SMTP failure.
2. Add at least rate limiting and a honeypot field before the endpoint is public.
3. Keep inquiry types CMS-driven from day one; do not hardcode them in the frontend.
4. Do not expose full submission data in any public API response.
5. Defer attachments, user confirmation emails, and advanced CRM features to later phases.
6. Preserve existing Site Setting contact fields; only add `contact_form_enabled` and optional confirmation message fields.
7. Follow the established project patterns (`TimeStampedModel`, bilingual fallback, `db_table` naming, admin fieldsets, bulk actions, `PageNumberPagination`).

---

## Source Code Integrity Statement

- **No source code was modified** during this investigation.
- **No migrations were created or applied**.
- **No packages were installed**.
- **No database records were changed**.
- **No heavy test suite was run**.
- The only file created is this investigation report.

---

## Most Important Confirmed Findings

1. The contact form in `src/components/sections/ContactSection.jsx` is **not connected to a backend**. It logs to the console and shows a fake success message.
2. There is **no `apps.contact`** in the Django backend, no contact models, and no contact API endpoints.
3. There is **no email configuration** in `settings.py` or `.env.example` and no email-sending code anywhere in the project.
4. `SiteSetting` already stores `recipient_email` defaulting to `sidrahsoft@gmail.com`, which is the intended CMS-managed recipient.
5. Inquiry type options (`general`, `projectConsultation`, `partnership`, `career`, `other`) are **hardcoded in the frontend**.
6. The project has reusable patterns (`TimeStampedModel`, `MediaAsset`, bilingual serializers, admin bulk actions) that make implementation straightforward.
7. The recommended architecture requires two new models (`InquiryType`, `ContactSubmission`), two public endpoints, a small email service, and a frontend API integration.

---

## Recommended Architecture Summary

Create a new `apps.contact` Django app containing:

- `InquiryType` — CMS-managed inquiry categories with bilingual labels, ordering, activation, and optional per-type recipient email.
- `ContactSubmission` — central submission record with contact fields, inquiry/service classification, status workflow, priority, assignment, internal notes, source metadata, and email audit.
- Public endpoints: `GET /api/v1/contact/inquiry-types/` and `POST /api/v1/contact/submissions/`.
- Email service that persists the submission first, then sends a notification to `InquiryType.recipient_email` or `SiteSetting.recipient_email`.
- Django Admin with list view, filters, search, bulk status actions, and CSV export.
- Frontend refactor to fetch inquiry types and submit via the API, with loading/error states and existing i18n labels.
- Security controls: rate limiting, honeypot, server-side validation, length limits, and privacy consent.

This architecture is compatible with PostgreSQL 17, the existing custom user model, Django Admin, the existing Site Settings CMS, the React frontend, and future CRM/LMS expansion.
