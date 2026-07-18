# MEDIA-LIBRARY-CMS-001 — Implementation Report

**Date:** 2026-07-12  
**Task ID:** MEDIA-LIBRARY-CMS-001  
**Implementer:** Cascade (AI pair programmer)  
**Verdict:** PASS — MEDIA LIBRARY CMS READY

---

# Executive Summary

The complete first production-ready Media Library for the SidrahSoft React Custom CMS has been implemented. The implementation includes secure image uploads with Pillow validation, CMS admin API endpoints for list/detail/upload/update/delete/usage, RBAC enforcement using existing media capabilities, activity logging, Django Admin compatibility, and a full React frontend with media library page, upload dialog, details dialog, and reusable asset picker.

**Key results:**
- 1 migration created (`0002_media_asset_fields`) adding 5 nullable fields
- 6 backend files created, 4 modified
- 7 frontend files created, 2 modified
- 47/47 validation tests passed
- 0 temporary records or files remaining
- `npm run build` succeeds
- `python manage.py check` passes with no issues
- No pending migrations

---

# Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| MediaAsset model fields | Complete | 5 new nullable fields added |
| Migration | Complete | `0002_media_asset_fields` applied |
| Validators | Complete | Extension, MIME, Pillow, size, dimensions, decompression bomb |
| Upload service | Complete | Transactional with file cleanup on failure |
| Usage detection | Complete | All 11 FK references across 6 models |
| Protected deletion | Complete | 409 conflict when referenced, hard delete when unused |
| CMS serializers | Complete | List, detail, upload, update, usage |
| CMS views | Complete | ListCreate, RetrieveUpdateDestroy, Usage |
| CMS URLs | Complete | Registered under `/api/v1/cms/media/` |
| Admin update | Complete | New fields in list_display, readonly_fields |
| RBAC | Complete | Existing media capabilities reused |
| Activity logging | Complete | Upload, update, delete events |
| Frontend API service | Complete | `mediaApi.js` with CSRF and FormData |
| Frontend media page | Complete | `/cms/media` with grid, search, filters, pagination |
| Upload dialog | Complete | Drag-drop + file picker, metadata fields |
| Details dialog | Complete | Preview, edit, copy URL, usage, delete |
| Asset picker | Complete | Reusable modal with search, filter, upload |
| CMS navigation | Complete | Media Library link in dashboard |
| Frontend build | Complete | `npm run build` succeeds |
| Validation | Complete | 47/47 tests passed |

---

# Files Created

## Backend

| File | Purpose |
|------|---------|
| `backend/apps/media_library/validators.py` | Extension, MIME, Pillow integrity, size, dimension, decompression bomb validation |
| `backend/apps/media_library/services.py` | Upload creation, usage detection, protected deletion |
| `backend/apps/media_library/cms_serializers.py` | List, detail, upload, update, usage serializers |
| `backend/apps/media_library/cms_views.py` | ListCreate, RetrieveUpdateDestroy, Usage API views |
| `backend/apps/media_library/cms_urls.py` | CMS URL patterns for media endpoints |
| `backend/apps/media_library/migrations/0002_media_asset_fields.py` | Schema migration for 5 new fields |

## Frontend

| File | Purpose |
|------|---------|
| `src/services/cms/mediaApi.js` | CMS media API service (list, get, upload, update, usage, delete) |
| `src/pages/cms/MediaLibraryPage.jsx` | Media library page with grid, search, filters, pagination |
| `src/components/cms/media/MediaGrid.jsx` | Responsive grid of MediaCard components |
| `src/components/cms/media/MediaCard.jsx` | Individual asset card with thumbnail and metadata |
| `src/components/cms/media/MediaUploadDialog.jsx` | Upload modal with file picker, drag-drop, metadata fields |
| `src/components/cms/media/MediaDetailsDialog.jsx` | Detail modal with preview, edit, copy URL, usage, delete |
| `src/components/cms/media/MediaAssetPicker.jsx` | Reusable asset picker with search, filter, upload |

---

# Files Modified

## Backend

| File | Changes |
|------|---------|
| `backend/apps/media_library/models.py` | Added `file_size`, `mime_type`, `width`, `height`, `uploaded_by` fields; added `django.conf.settings` import |
| `backend/apps/media_library/admin.py` | Added new fields to `list_display`, `search_fields`, `list_filter`; added `readonly_fields` and `date_hierarchy` |
| `backend/apps/core/cms_urls.py` | Added `path('media/', include('apps.media_library.cms_urls'))` |

## Frontend

| File | Changes |
|------|---------|
| `src/App.jsx` | Added `MediaLibraryPage` import and `/cms/media` route |
| `src/pages/cms/CMSDashboardPage.jsx` | Added Media Library navigation link (capability-aware) |

---

# Migration Created

**Name:** `0002_media_asset_fields`  
**Path:** `backend/apps/media_library/migrations/0002_media_asset_fields.py`  
**Status:** Applied  

### Fields Added

| Field | Type | Nullable | Default | Notes |
|-------|------|----------|---------|-------|
| `file_size` | PositiveBigIntegerField | Yes | None | File size in bytes |
| `mime_type` | CharField(255) | Yes | `''` | Pillow-detected MIME type |
| `width` | PositiveIntegerField | Yes | None | Image width in pixels |
| `height` | PositiveIntegerField | Yes | None | Image height in pixels |
| `uploaded_by` | ForeignKey(User) | Yes | None | `on_delete=SET_NULL`, `related_name='uploaded_media'` |

### Safety

- All fields are nullable — existing zero records remain valid
- No data migration needed — only schema migration
- No unrelated fields included
- Migration verified with `makemigrations --dry-run` (no changes detected after)

---

# MediaAsset Model Changes

### Before (Phase 1 Investigation)

| Field | Type |
|-------|------|
| id | BigAutoField |
| created_at | DateTimeField (auto_now_add) |
| updated_at | DateTimeField (auto_now) |
| title | CharField(255, blank=True) |
| file | FileField (upload_to=media_file_path) |
| alt_text | CharField(255, blank=True) |
| media_type | CharField(32, choices, default='other') |
| usage_context | CharField(120, blank=True) |
| is_active | BooleanField(default=True) |

### After (Implementation)

| Field | Type | New? |
|-------|------|------|
| id | BigAutoField | No |
| created_at | DateTimeField (auto_now_add) | No |
| updated_at | DateTimeField (auto_now) | No |
| title | CharField(255, blank=True) | No |
| file | FileField (upload_to=media_file_path) | No |
| alt_text | CharField(255, blank=True) | No |
| media_type | CharField(32, choices, default='other') | No |
| usage_context | CharField(120, blank=True) | No |
| is_active | BooleanField(default=True) | No |
| **file_size** | **PositiveBigIntegerField(null=True, blank=True)** | **Yes** |
| **mime_type** | **CharField(255, blank=True, default='')** | **Yes** |
| **width** | **PositiveIntegerField(null=True, blank=True)** | **Yes** |
| **height** | **PositiveIntegerField(null=True, blank=True)** | **Yes** |
| **uploaded_by** | **ForeignKey(User, SET_NULL, null=True, blank=True)** | **Yes** |

---

# Upload Security

## Validation Pipeline

| Step | Layer | Implementation |
|------|-------|----------------|
| Extension allowlist | `validators.py` | `validate_extension()` — checks against `{jpg, jpeg, png, webp, gif}` |
| Double extension detection | `validators.py` | Rejects `file.jpg.exe` patterns |
| File size check | `validators.py` | `validate_file_size()` — 5 MB max |
| Pillow image verification | `validators.py` | `verify_image()` — `Image.open()` + `img.verify()` |
| Decompression bomb protection | `validators.py` | MAX_TOTAL_PIXELS = 40M pixels |
| Dimension limits | `validators.py` | MAX_DIMENSION = 4000px |
| MIME type detection | `validators.py` | Pillow format → MIME mapping |
| Extension/MIME cross-check | `validators.py` | Rejects mismatched extension and detected format |
| SVG rejection | `validators.py` | Explicit SVG check in `verify_image()` |
| Corrupt image rejection | `validators.py` | `img.verify()` raises on invalid data |
| Truncated image rejection | `validators.py` | `ImageFile.LOAD_TRUNCATED_IMAGES = False` |
| Transactional save | `services.py` | `@transaction.atomic` on `create_media_asset()` |
| Orphan prevention | `services.py` | File saved after validation passes; transaction rolls back on failure |

## Security Threat Coverage

| Threat | Protected | Method |
|--------|-----------|--------|
| Unauthorized upload | Yes | `IsAuthenticated`, `IsCMSUser`, `HasModulePermission` |
| CSRF bypass | Yes | SessionAuthentication + CSRF enforcement |
| Capability bypass | Yes | `HasModulePermission` with `cms_module='media'` |
| Mass assignment | Yes | Serializer explicit field lists; system fields read-only |
| MIME spoofing | Yes | Pillow format detection, not Content-Type header |
| Extension spoofing | Yes | Extension/MIME cross-check |
| Corrupted images | Yes | `img.verify()` + `img.load()` |
| SVG script payloads | Yes | SVG explicitly rejected |
| HTML upload | Yes | Not in allowed extensions |
| Path traversal | Yes | UUID-based filenames via `media_file_path()` |
| Filename collisions | Yes | UUID-based filenames |
| Oversized uploads | Yes | 5 MB file size + 40M pixel limit |
| Decompression bombs | Yes | MAX_TOTAL_PIXELS check |
| Referenced-file deletion | Yes | Usage check before delete, 409 if referenced |
| Internal path exposure | Yes | Serializers return `file_url` not `file.path` |
| Read-only metadata injection | Yes | Serializer ignores unknown fields; system fields not in writable list |
| Orphaned files | Yes | Transactional save; file only saved after validation passes |

---

# Allowed and Rejected Media Types

## Allowed

| Extension | MIME Type | Pillow Format | Validated |
|-----------|-----------|---------------|-----------|
| .jpg | image/jpeg | JPEG | Yes |
| .jpeg | image/jpeg | JPEG | Yes |
| .png | image/png | PNG | Yes |
| .webp | image/webp | WEBP | Yes |
| .gif | image/gif | GIF | Yes |

## Rejected

| Type | Rejection Method |
|------|-----------------|
| SVG | Extension not in allowlist + explicit SVG check in Pillow verification |
| HTML | Extension not in allowlist |
| JavaScript | Extension not in allowlist |
| Executable files | Extension not in allowlist |
| Unknown binary | Extension not in allowlist + Pillow verification fails |
| Double-extension payloads | `validate_extension()` detects misleading double extensions |
| Text renamed as image | Pillow `verify()` fails on non-image content |
| Corrupt images | Pillow `verify()` and `load()` raise exceptions |

---

# File Size and Dimension Limits

| Limit | Value | Enforcement |
|-------|-------|-------------|
| Max file size | 5 MB (5,242,880 bytes) | `validate_file_size()` |
| Max dimension (width or height) | 4000 px | `verify_image()` |
| Max total pixels | 40,000,000 (40 MP) | `verify_image()` — decompression bomb protection |
| Min dimension | 1 px (non-zero) | `verify_image()` — rejects 0×0 |

## Usage Guidance (Documented, Not Enforced)

| Use Case | Recommended Max | Notes |
|----------|----------------|-------|
| Partner logos | 2 MB, 2000×2000 | Logos are small graphics |
| Service icons | 1 MB, 512×512 | Icons are tiny |
| Hero/section images | 5 MB, 4000×2000 | Higher resolution for banners |
| Insight cover images | 5 MB, 2400×1200 | Cover images |
| Case-study images | 5 MB, 2400×1800 | Detailed images |
| SEO/OG images | 2 MB, 2400×1260 | 1.91:1 OG standard |
| Favicon | 512×512 | Square |

---

# Metadata Extraction

| Field | Source | Method | Client-Writable |
|-------|--------|--------|-----------------|
| `file_size` | Uploaded file | `uploaded_file.size` or `len(raw)` | No |
| `mime_type` | Pillow format detection | `PILLOW_FORMAT_TO_MIME[img.format]` | No |
| `width` | Pillow | `img.size[0]` | No |
| `height` | Pillow | `img.size[1]` | No |
| `uploaded_by` | Authenticated user | `request.user` | No |
| `media_type` | Derived from MIME | Set to `'image'` for all Phase 1 uploads | No |

All system-managed fields are populated by the service layer (`create_media_asset()`) and are read-only in all serializers.

---

# Media Admin API

## Endpoint Inventory

| Method | URL | Capability | Purpose |
|--------|-----|------------|---------|
| GET | `/api/v1/cms/media/` | `media.view` | Paginated list with search/filter/ordering |
| POST | `/api/v1/cms/media/` | `media.create` | Upload new image (multipart/form-data) |
| GET | `/api/v1/cms/media/<id>/` | `media.view` | Asset detail with usage count |
| PATCH | `/api/v1/cms/media/<id>/` | `media.update` | Update metadata (title, alt_text, usage_context, is_active) |
| DELETE | `/api/v1/cms/media/<id>/` | `media.delete` | Delete asset (409 if referenced, 204 if unused) |
| GET | `/api/v1/cms/media/<id>/usage/` | `media.view` | Usage references for deletion safety |

## Response Structures

### List Response (GET `/api/v1/cms/media/`)

```json
{
  "count": 10,
  "next": "http://127.0.0.1:8001/api/v1/cms/media/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Partner Logo",
      "filename": "uploads/ab/cd/uuid.jpg",
      "file_url": "http://127.0.0.1:8001/media/uploads/ab/cd/uuid.jpg",
      "alt_text": "Acme Corp logo",
      "media_type": "image",
      "mime_type": "image/jpeg",
      "file_size": 102400,
      "width": 200,
      "height": 150,
      "usage_context": "partner logo",
      "is_active": true,
      "uploaded_by": {"id": 1, "username": "admin", "display_name": "Admin"},
      "created_at": "2026-07-12T00:00:00Z",
      "updated_at": "2026-07-12T00:00:00Z"
    }
  ]
}
```

### Detail Response (GET `/api/v1/cms/media/<id>/`)

Same as list item plus `usage_count` field.

### Usage Response (GET `/api/v1/cms/media/<id>/usage/`)

```json
{
  "media_id": 1,
  "is_used": true,
  "usage_count": 2,
  "usages": [
    {
      "module": "partners",
      "model": "Partner",
      "field": "logo",
      "object_id": 10,
      "object_label": "Acme Corp"
    }
  ]
}
```

### Delete Conflict Response (DELETE on referenced asset)

```json
{
  "detail": "This media asset cannot be deleted because it is currently in use.",
  "code": "media_in_use",
  "usage_count": 2
}
```

---

# Search Filtering Ordering and Pagination

## Query Parameters

| Parameter | Purpose | Example |
|-----------|---------|---------|
| `page` | Page number | `?page=2` |
| `page_size` | Items per page (max 100) | `?page_size=10` |
| `search` | Search title, alt_text, file | `?search=logo` |
| `mime_type` | Filter by MIME type | `?mime_type=image/jpeg` |
| `uploaded_by` | Filter by uploader ID | `?uploaded_by=1` |
| `is_active` | Filter by active status | `?is_active=true` |
| `date_from` | Filter by creation date (>=) | `?date_from=2026-07-01` |
| `date_to` | Filter by creation date (<=) | `?date_to=2026-07-12` |
| `ordering` | Sort order | `?ordering=-file_size` |

## Allowed Ordering Values

| Value | Sort |
|-------|------|
| `created_at` | Oldest first |
| `-created_at` | Newest first |
| `updated_at` | Least recently updated |
| `-updated_at` | Most recently updated |
| `file_size` | Smallest first |
| `-file_size` | Largest first |
| `title` | Title A-Z |
| `-title` | Title Z-A |

## Pagination

Uses existing `CMSPagination`: page_size=20, max_page_size=100.

---

# Usage Detection

## Registered References

| Module | Model | Field | Count |
|--------|-------|-------|-------|
| partners | Partner | logo | 1 |
| services | Service | icon | 1 |
| services | Service | featured_image | 1 |
| case_studies | CaseStudy | featured_image | 1 |
| case_studies | CaseStudy | logo | 1 |
| insights | Article | featured_image | 1 |
| navigation | NavigationItem | icon_asset | 1 |
| site_settings | SiteSetting | default_og_image | 1 |
| site_settings | SiteSetting | primary_logo | 1 |
| site_settings | SiteSetting | secondary_logo | 1 |
| site_settings | SiteSetting | favicon | 1 |

**Total: 11 FK references across 6 models**

All references are checked in `services.py` via `_build_usage_registry()`. Results include module, model, field, object_id, and safe object_label (limited to first 10 items per model).

---

# Protected Deletion

## Behavior

| Scenario | Response | Action |
|----------|----------|--------|
| Asset referenced by content | 409 Conflict | No deletion, no file removal |
| Asset not referenced | 204 No Content | DB record deleted, physical file deleted |

## Deletion Ordering

1. Check usage (within `@transaction.atomic`)
2. Capture audit info (id, label, mime_type, file_size)
3. Delete DB record
4. Delete physical file (best-effort, logged on failure)

This ordering ensures:
- No orphaned DB records (DB deleted first)
- Orphaned files are better than orphaned DB records
- File deletion failure is logged but doesn't raise

---

# RBAC and CSRF

## RBAC

| Role | view | create | update | delete |
|------|------|--------|--------|--------|
| super_admin | ✓ (bypass) | ✓ | ✓ | ✓ |
| admin | ✓ | ✓ | ✓ | ✓ |
| content_manager | ✓ | ✓ | ✓ | ✓ |
| editor | ✓ | ✓ | ✗ | ✗ |
| marketing_manager | ✓ | ✓ | ✗ | ✗ |
| recruiter | ✓ | ✓ | ✗ | ✗ |
| support_agent | ✗ | ✗ | ✗ | ✗ |

No changes to `roles.py` were needed. Existing `MODULE_MEDIA` capabilities are reused.

## CSRF

- All unsafe requests (POST, PATCH, DELETE) require CSRF token
- SessionAuthentication enforces CSRF for authenticated users
- Frontend `mediaApi.js` reads `csrftoken` cookie and sends `X-CSRFToken` header
- No CSRF exemptions added
- Validation confirmed CSRF enforcement (test 47)

---

# Activity Logging

## Events Logged

| Event | Action | Module | Description |
|-------|--------|--------|-------------|
| Upload | `create` | `media` | `cms.media.uploaded` |
| Metadata update | `update` | `media` | `cms.media.updated` |
| Delete | `delete` | `media` | `cms.media.deleted` |

## Safe Metadata Fields

| Field | Logged | Notes |
|-------|--------|-------|
| id | Yes | Integer |
| title | Yes | User-provided |
| mime_type | Yes | Detected |
| file_size | Yes | Integer bytes |
| width | Yes | Integer pixels |
| height | Yes | Integer pixels |
| changed_fields | Yes | List of field names (update only) |

## Fields NOT Logged

- File contents
- Base64 data
- Cookies
- Session data
- CSRF tokens
- Authorization headers
- Filesystem paths
- Full request payload
- Full user-agent data

Activity logs remain append-only. No changes to ActivityLog model were needed.

---

# Django Admin Compatibility

## Admin Configuration

| Feature | Status |
|---------|--------|
| Registered | Yes |
| List display | title, media_type, mime_type, file_size, width, height, usage_context, uploaded_by, is_active, created_at, updated_at |
| List filter | media_type, is_active, mime_type, usage_context |
| Search fields | title, alt_text, file, mime_type |
| Read-only fields | file_size, mime_type, width, height, uploaded_by, created_at, updated_at |
| Date hierarchy | created_at |
| Upload behavior | Standard Django admin file upload (preserved) |

## Validation Reusability

The `validators.py` module uses Django's `ValidationError`, which is compatible with both:
- DRF (converted to `serializers.ValidationError` in the CMS serializer)
- Django Admin (model validation can use the same validators)

The `validate_uploaded_file()` function can be called from model `clean()` methods or admin `save()` methods for Django Admin upload validation.

---

# Frontend Media Library

## Route

```
/cms/media → MediaLibraryPage (protected by AuthProvider + ProtectedRoute)
```

## Page Features

| Feature | Implemented |
|---------|-------------|
| Image grid with lazy loading | Yes (`loading="lazy"` on `<img>`) |
| Search | Yes (title, alt_text, filename) |
| MIME type filter | Yes (JPEG, PNG, WebP, GIF) |
| Ordering | Yes (8 options) |
| Pagination | Yes (page navigation) |
| Upload button | Yes (capability-aware: only `media.create`) |
| Asset details | Yes (click opens details dialog) |
| Empty state | Yes |
| Loading state | Yes |
| Error state | Yes |
| Permission denied state | Yes |
| Count display | Yes |
| Accessible labels | Yes (aria-label on inputs and buttons) |

## Styling

Consistent with existing CMS dark theme:
- Background: `#0a0a14`
- Card background: `#12121e`
- Accent: `#c9a96e`
- Text: `#e0e0e0`
- Inline styles (no CSS framework introduced)

---

# Upload Interface

## Features

| Feature | Implemented |
|---------|-------------|
| Single-file upload | Yes |
| File picker (required) | Yes |
| Drag-and-drop (optional) | Yes |
| Accept hint | Yes (`.jpg,.jpeg,.png,.webp,.gif`) |
| Pre-upload file info | Yes (filename, size) |
| Upload pending state | Yes ("Uploading…") |
| Prevent double submission | Yes (disabled while uploading) |
| Field-specific validation errors | Yes |
| Reset after success | Yes |
| Refresh after upload | Yes (prepends to grid) |
| FormData transport | Yes (no base64) |
| Keyboard accessible | Yes (Enter/Space on drop zone) |

---

# Media Details Interface

## Features

| Feature | Implemented |
|---------|-------------|
| Large preview | Yes (max 300px height, object-fit: contain) |
| URL with copy action | Yes (clipboard API, "Copied!" feedback) |
| Filename | Yes |
| MIME type | Yes |
| File size | Yes (human-readable) |
| Width and height | Yes |
| Uploaded by | Yes (display_name or username) |
| Upload date | Yes (localized) |
| Editable metadata | Yes (title, alt_text, usage_context) |
| Usage count | Yes |
| Usage list | Yes (module, model, field, label) |
| Delete action | Yes (with confirmation) |
| Delete blocked when in use | Yes (button disabled + explanation) |
| File replacement blocked | Yes (no file field in edit mode) |
| Escape to close | Yes |

---

# Asset Picker

## Component

`src/components/cms/media/MediaAssetPicker.jsx`

## Props

| Prop | Type | Purpose |
|------|------|---------|
| `open` | boolean | Controls visibility |
| `onClose` | function | Close callback |
| `onSelect` | function(asset) | Selection callback |
| `acceptedMimeTypes` | string[] | Frontend guidance for filtering |
| `minimumWidth` | number | Frontend guidance for selection validation |
| `minimumHeight` | number | Frontend guidance for selection validation |
| `usageLabel` | string | Passed as usage_context on upload |

## Features

| Feature | Implemented |
|---------|-------------|
| Search existing images | Yes |
| Filter by image type | Yes |
| Paginate results | Yes |
| Select one asset | Yes |
| Return asset object | Yes (full asset data to parent) |
| Upload New action | Yes (reuses upload flow) |
| Refresh after upload | Yes |
| Clear selection | Yes (parent-controlled) |
| Not tightly coupled | Yes (generic, no partner/insight/service-specific logic) |
| Contextual validation props | Yes (minimumWidth, minimumHeight, acceptedMimeTypes) |

---

# Public Media URL Contract

## URL Generation

- `CMSMediaListSerializer.get_file_url()` uses `request.build_absolute_uri(obj.file.url)`
- Returns absolute URL in development: `http://127.0.0.1:8001/media/uploads/...`
- Returns absolute URL in production: uses request's host
- No Windows filesystem paths exposed
- No `F:\...` paths in API responses

## Compatibility

- Works with Vite dev server (port 5174) and Django backend (port 8001)
- Same-origin — no CORS headers needed for media files
- Media served via `django.conf.urls.static.static()` in DEBUG mode

---

# Public API Regression

| API | Status | Notes |
|-----|--------|-------|
| `GET /api/v1/partners/` | 200 | Unchanged |
| `GET /api/v1/services/` | 200 | Unchanged |
| `GET /api/v1/case-studies/` | 200 | Unchanged |
| `GET /api/v1/insights/` | 200 | Unchanged |
| `GET /api/v1/site-settings/` | 200 | Unchanged |
| `GET /api/v1/navigation/` | 200 | Unchanged |

All public APIs remain functional. No public API serializers were modified. `MediaAssetReferenceSerializer` and `media_asset_field()` in `apps/core/cms_serializers.py` were not modified.

---

# Validation Results

## Validation Table

| # | Test | Expected | Actual | Result |
|---|------|----------|--------|--------|
| 1 | Anonymous list denied | 401/403 | True | PASS |
| 2 | Anonymous upload denied | 401/403 | True | PASS |
| 3 | Support agent list denied | 403 | 403 | PASS |
| 4 | Content manager list allowed | 200 | 200 | PASS |
| 5 | Valid JPEG upload | 201 | 201 | PASS |
| 6 | JPEG mime_type set | image/jpeg | True | PASS |
| 7 | JPEG file_size set | >0 | True | PASS |
| 8 | JPEG width set | 200 | 200 | PASS |
| 9 | JPEG height set | 150 | 150 | PASS |
| 10 | JPEG uploaded_by set | True | True | PASS |
| 11 | Valid PNG upload | 201 | 201 | PASS |
| 12 | Valid WebP upload | 201 | 201 | PASS |
| 13 | Valid GIF upload | 201 | 201 | PASS |
| 14 | SVG rejected | 400 | 400 | PASS |
| 15 | Fake JPEG rejected | 400 | 400 | PASS |
| 16 | Text renamed .png rejected | 400 | 400 | PASS |
| 17 | Unsupported extension rejected | 400 | 400 | PASS |
| 18 | Oversized file rejected | 400 | 400 | PASS |
| 19 | PATCH metadata update | 200 | 200 | PASS |
| 20 | Title updated | Correct | Correct | PASS |
| 21 | Alt text updated | Correct | Correct | PASS |
| 22 | Read-only injection returns 200 | 200 | 200 | PASS |
| 23 | file_size not injected | True | True | PASS |
| 24 | mime_type not injected | True | True | PASS |
| 25 | width not injected | True | True | PASS |
| 26 | Usage endpoint | 200 | 200 | PASS |
| 27 | Usage is_used=True | True | True | PASS |
| 28 | Usage count >= 1 | True | True | PASS |
| 29 | Referenced deletion blocked | 409 | 409 | PASS |
| 30 | Partner.logo still set | True | True | PASS |
| 31 | Unused deletion succeeds | 204 | 204 | PASS |
| 32 | Asset record removed | False | False | PASS |
| 33 | Upload logged | 1 | 1 | PASS |
| 34 | Update logged | >=1 | True | PASS |
| 35 | Correct actor stored | True | True | PASS |
| 36 | No file contents in metadata | True | True | PASS |
| 37 | No cookies in metadata | True | True | PASS |
| 38 | Public partners API | 200 | 200 | PASS |
| 39 | Public services API | 200 | 200 | PASS |
| 40 | Search returns results | 200 | 200 | PASS |
| 41 | Search results > 0 | True | True | PASS |
| 42 | MIME filter | 200 | 200 | PASS |
| 43 | Ordering | 200 | 200 | PASS |
| 44 | Pagination | 200 | 200 | PASS |
| 45 | Page size respected | <=5 | True | PASS |
| 46 | Superuser list | 200 | 200 | PASS |
| 47 | CSRF enforced on POST | 403/302 | True | PASS |

**Total: 47 PASS, 0 FAIL**

---

# Temporary Data and File Cleanup

| Item | Status |
|------|--------|
| Temporary MediaAsset records | Deleted (0 remaining) |
| Temporary uploaded files | Deleted from storage |
| Temporary Partner records | Deleted (0 remaining) |
| Temporary User records | Deleted (0 remaining) |
| Activity Log entries | Preserved (append-only) |
| Validation script | Deleted from disk |

Verified with Django shell:
- `MediaAsset.objects.count()` = 0
- `Partner.objects.filter(name_en__startswith='__media_validation__').count()` = 0
- `User.objects.filter(username__startswith='__media_validation__').count()` = 0

---

# Deferred Features

| Feature | Deferred To | Rationale |
|---------|-------------|-----------|
| SVG upload | Later phase | Requires SVG sanitizer |
| PDF/document upload | Later phase | Separate validation strategy |
| Video upload | Later phase | Transcoding infrastructure |
| Audio upload | Later phase | Not needed for corporate website |
| Thumbnail generation | Later phase | Storage management for variants |
| Automatic resizing | Later phase | Processing complexity |
| Automatic compression | Later phase | Processing time |
| Automatic WebP conversion | Later phase | Conversion pipeline |
| EXIF processing pipeline | Later phase | Beyond Phase 1 scope |
| Duplicate detection | Later phase | Requires checksum field |
| Folders | Later phase | Requires new model fields |
| Tags | Later phase | Requires new model fields |
| Bulk upload | Later phase | UI and API complexity |
| Bulk delete | Later phase | Safety concerns |
| Private media | Later phase | Not needed for public website |
| Signed URLs | Later phase | Not needed for public content |
| Cloud storage migration | Deployment phase | Requires django-storages |
| CDN integration | Deployment phase | Requires CDN configuration |

---

# Known Limitations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| No thumbnail generation | Large images loaded in grid | CSS `object-fit: cover` + `loading="lazy"` |
| `related_name='+'` prevents reverse FK queries | Usage detection requires explicit queries | Centralized in `services.py` |
| No production media serving | Media only served in DEBUG mode | Defer to deployment phase |
| Inline styles in frontend | May not scale for large UI | Consistent with existing CMS; defer CSS framework |
| No `?used=true` list filter | Cannot filter used/unused in list | Omitted for efficiency (would require subquery per item) |
| Django Admin uploads bypass CMS validation | Admin can upload any file type | Validators are reusable; admin integration deferred |

---

# Final Verdict

```
PASS — MEDIA LIBRARY CMS READY
```

All completion criteria met:
- ✅ 5 approved fields migrated
- ✅ Secure image upload works (JPEG, PNG, WebP, GIF)
- ✅ SVG and dangerous files rejected
- ✅ Metadata is server-generated
- ✅ Media listing is paginated
- ✅ Search/filtering/ordering work
- ✅ Metadata editing is restricted
- ✅ Usage detection includes all 11 MediaAsset relations
- ✅ Referenced deletion is blocked (409)
- ✅ Unused deletion removes DB record and file
- ✅ RBAC and CSRF enforced
- ✅ Activity events correct
- ✅ Django Admin operational
- ✅ React `/cms/media` implemented
- ✅ Media navigation is capability-aware
- ✅ Upload UI works
- ✅ Details UI works
- ✅ Asset picker is reusable
- ✅ Frontend build succeeds
- ✅ Temporary files and records cleaned
- ✅ No unrelated schema changes
- ✅ Implementation report complete
