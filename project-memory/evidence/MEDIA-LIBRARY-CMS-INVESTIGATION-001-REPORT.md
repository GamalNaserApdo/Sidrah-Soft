# MEDIA-LIBRARY-CMS-INVESTIGATION-001

**Date:** 2026-07-12  
**Task:** Read-only investigation of the existing SidrahSoft Media Library architecture  
**Investigator:** Cascade (AI pair programmer)  
**Verdict:** READY FOR MEDIA-LIBRARY-CMS-001

---

# Executive Summary

A thorough read-only investigation was performed on the SidrahSoft backend and frontend to assess readiness for implementing a Custom CMS Media Library. The existing `MediaAsset` model is minimal but functional, with 0 records currently in the database. All content models (Partners, Services, Case Studies, Insights, Site Settings, Navigation) already reference `MediaAsset` via `ForeignKey(on_delete=SET_NULL)`, but there are **no dedicated media API endpoints, no CMS serializers, no upload views, and no media URL routes**. The media library app is a shell with only a model, admin registration, and empty URLs.

**Key findings:**

- `MediaAsset` model exists at `backend/apps/media_library/models.py` with 8 fields (title, file, alt_text, media_type, usage_context, is_active, created_at, updated_at). It lacks file size, MIME type, dimensions, uploader, and checksum fields.
- **MIGRATIONS REQUIRED** — 5 new fields needed: `file_size`, `mime_type`, `width`, `height`, `uploaded_by`. All are nullable to ensure safe addition without breaking existing zero records.
- Pillow 11.3.0 is installed and available for image validation and dimension extraction.
- RBAC roles already define `MODULE_MEDIA = 'media'` with capabilities assigned to admin, content_manager, editor, marketing_manager, and recruiter. No new modules or code-level capability changes needed.
- ActivityLog model already includes `MODULE_MEDIA = 'media'` in its module choices.
- No existing media serializers, views, or CMS URLs exist — all must be created.
- Frontend CMS is minimal (dashboard, login, activity logs page). No upload components, modals, or file pickers exist. React 19 + react-router-dom 7, no UI library (Tailwind/shadcn not installed).
- Media is served via Django's `static()` helper in DEBUG mode only. No production storage backend configured.
- All content model FKs use `on_delete=SET_NULL` with `related_name='+'` (no reverse relations), making usage detection require explicit queries rather than reverse FK traversal.

---

# Existing MediaAsset Model

**Application:** `apps.media_library`  
**File path:** `backend/apps/media_library/models.py`  
**Migration:** `0001_initial` (applied)  
**Database table:** `media_library_mediaasset`  
**Current record count:** 0

## Fields

| Field | Type | Max Length | Nullable | Default | Notes |
|-------|------|-----------|----------|---------|-------|
| `id` | BigAutoField | — | No | Auto | Primary key |
| `created_at` | DateTimeField | — | No | `auto_now_add` | From `TimeStampedModel` |
| `updated_at` | DateTimeField | — | No | `auto_now` | From `TimeStampedModel` |
| `title` | CharField | 255 | Yes (blank=True) | `''` | Human-readable label |
| `file` | FileField | — | No | — | Upload path via `media_file_path()` |
| `alt_text` | CharField | 255 | Yes (blank=True) | `''` | Accessibility text |
| `media_type` | CharField | 32 | No | `'other'` | Choices: image, document, video, audio, other |
| `usage_context` | CharField | 120 | Yes (blank=True) | `''` | Free-text usage hint (e.g. "partner logo") |
| `is_active` | BooleanField | — | No | `True` | Soft-delete / visibility flag |

## Upload Path Function

```python
def media_file_path(instance, filename):
    ext = filename.split('.')[-1]
    filename = f'{uuid.uuid4()}.{ext}'
    return os.path.join('uploads', filename[:2], filename[2:4], filename)
```

- UUID-based filename, original name discarded
- Stored under `uploads/<2-char>/<2-char>/<uuid>.<ext>`
- Prevents filename collisions and traversal attacks
- Extension preserved from original filename (no sanitization of extension itself)

## Fields That Already Exist

- `title`, `file`, `alt_text`, `media_type`, `usage_context`, `is_active`, `created_at`, `updated_at`

## Fields That Would Require Migrations

| Proposed Field | Type | Purpose | Nullable |
|----------------|------|---------|----------|
| `file_size` | PositiveBigIntegerField | File size in bytes | Yes (nullable for backward compat) |
| `mime_type` | CharField(255) | Detected MIME type | Yes |
| `width` | PositiveIntegerField | Image width in pixels | Yes |
| `height` | PositiveIntegerField | Image height in pixels | Yes |
| `uploaded_by` | ForeignKey(User) | Uploader/owner relation | Yes |

## Meta Options

- `db_table = 'media_library_mediaasset'`
- `ordering = ['-created_at']`
- No custom indexes or constraints

## `__str__` Behavior

```python
def __str__(self):
    return self.title or self.file.name or str(self.id)
```

Returns title, or filename, or ID as fallback.

## Deletion Behavior

- No custom `delete()` method
- No `pre_delete` or `post_delete` signals
- Django default: deletes the database record AND the physical file (via `FileField`)
- All content model FKs use `on_delete=SET_NULL`, so content records survive asset deletion (FK becomes NULL)
- **Risk:** Physical file deletion is irreversible. If an asset is deleted while referenced, the content record's FK becomes NULL and the public page loses the image silently.

## Bilingual Fields

None. `title` and `alt_text` are single-language fields.

## Folder/Category Support

None. No folder, category, or tag fields exist.

## Usage Metadata

`usage_context` is a free-text CharField with no validation or FK. It is not automatically populated.

---

# Current Media Configuration

## Settings (from `backend/config/settings.py`)

| Setting | Value | Source |
|---------|-------|--------|
| `MEDIA_URL` | `/media/` | `os.environ.get('MEDIA_URL', '/media/')` |
| `MEDIA_ROOT` | `<BASE_DIR>/media` | `BASE_DIR / 'media'` |
| `STATIC_URL` | `/static/` | `os.environ.get('STATIC_URL', '/static/')` |
| `STATIC_ROOT` | `<BASE_DIR>/staticfiles` | `BASE_DIR / 'staticfiles'` |

## URL Configuration (from `backend/config/urls.py`)

```python
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
```

- Media is served via Django's `django.conf.urls.static.static()` helper **only in DEBUG mode**
- No production media serving configured
- No WhiteNoise configuration for media (WhiteNoise is not installed)
- Static and media URLs are properly separated (`/static/` vs `/media/`)

## File Storage Backend

- Default Django filesystem storage (`django.core.files.storage.FileSystemStorage`)
- No custom `DEFAULT_FILE_STORAGE` setting
- No `STORAGES` configuration dict
- No cloud storage (S3, GCS, Azure) configured
- No environment variable for storage backend

## Upload Size Limits

| Setting | Value | Notes |
|---------|-------|-------|
| `DATA_UPLOAD_MAX_MEMORY_SIZE` | Default (2.5 MB) | Not overridden |
| `FILE_UPLOAD_MAX_MEMORY_SIZE` | Default (2.5 MB) | Not overridden |
| `DATA_UPLOAD_MAX_NUMBER_FIELDS` | Default (1000) | Not overridden |
| `FILE_UPLOAD_HANDLERS` | Default | Not overridden |

No custom upload size limits are configured. Django defaults apply.

## Production Storage Readiness

**Not ready.** Media serving in production requires either:
- Nginx/Apache direct file serving for `MEDIA_ROOT`
- A cloud storage backend (django-storages + S3/GCS)
- WhiteNoise for static (already not installed)

This investigation recommends deferring production storage configuration to a deployment phase.

---

# Existing Media APIs

## Public Media APIs

**None.** The `media_library/urls.py` file contains an empty `urlpatterns = []` with only `app_name = 'media_library'`. No public endpoints expose MediaAsset records.

## CMS Media APIs

**None.** The CMS URL router at `backend/apps/core/cms_urls.py` does not include any media library URLs. No `cms_views.py` or `cms_serializers.py` files exist in the `media_library` app.

## Media Exposure Through Related Content Serializers

MediaAsset is currently exposed only through related content serializers:

- **`MediaAssetReferenceSerializer`** (`backend/apps/core/cms_serializers.py`): Read-only nested serializer used by CMS detail serializers for Site Settings, Partners, Services, Case Studies, Insights, and Navigation. Returns `id`, `url`, `alt_text`, `title`, `media_type`.
- **`media_asset_field()`** (`backend/apps/core/cms_serializers.py`): Write-only `PrimaryKeyRelatedField` used by CMS write serializers for setting media FKs by ID. Queries `MediaAsset.objects.filter(is_active=True)`.
- **`ServiceMediaAssetSerializer`** (`backend/apps/services/serializers.py`): Public serializer for services, returns `id`, `url`, `alt_text`.
- **Public partner serializer** (`backend/apps/partners/serializers.py`): Returns nested media asset data for partner logos.

## DRF Parsers

No multipart parser configuration found. DRF's default parser list includes `JSONParser` only (via `DEFAULT_RENDERER_CLASSES` setting, but no `DEFAULT_PARSER_CLASSES` is set). The implementation must add `MultiPartParser` and `FormParser` to upload views.

## Media-Specific Permissions

**None.** No media-specific permission classes exist. The existing `HasModulePermission` with `cms_module = 'media'` will be used.

---

# CMS Content Dependencies

## Dependency Matrix

| Module | Model | Media Field | Required Asset Type | Single/Multiple | Nullable | on_delete | Deletion Risk |
|--------|-------|-------------|---------------------|-----------------|----------|-----------|---------------|
| Site Settings | `SiteSetting` | `default_og_image` | Image | Single | Yes | SET_NULL | Low — OG image disappears |
| Site Settings | `SiteSetting` | `primary_logo` | Image | Single | Yes | SET_NULL | Medium — branding disappears |
| Site Settings | `SiteSetting` | `secondary_logo` | Image | Single | Yes | SET_NULL | Low — secondary branding |
| Site Settings | `SiteSetting` | `favicon` | Image | Single | Yes | SET_NULL | Medium — favicon disappears |
| Partners | `Partner` | `logo` | Image | Single | Yes | SET_NULL | Low — logo disappears |
| Services | `Service` | `icon` | Image | Single | Yes | SET_NULL | Low — icon disappears |
| Services | `Service` | `featured_image` | Image | Single | Yes | SET_NULL | Low — image disappears |
| Case Studies | `CaseStudy` | `featured_image` | Image | Single | Yes | SET_NULL | Low — image disappears |
| Case Studies | `CaseStudy` | `logo` | Image | Single | Yes | SET_NULL | Low — logo disappears |
| Insights | `Article` | `featured_image` | Image | Single | Yes | SET_NULL | Low — cover disappears |
| Navigation | `NavigationItem` | `icon_asset` | Image | Single | Yes | SET_NULL | Low — icon disappears |
| Careers | `Job` | — | — | — | — | — | No media dependency |

**Total MediaAsset FK references:** 11 fields across 6 models  
**All FKs use `related_name='+'`** — no reverse relations, meaning usage detection must query each model individually  
**All FKs use `on_delete=SET_NULL`** — content records survive asset deletion, but public pages silently lose images

---

# Django Admin Compatibility

## Current Admin Configuration (`backend/apps/media_library/admin.py`)

```python
@admin.register(MediaAsset)
class MediaAssetAdmin(admin.ModelAdmin):
    list_display = ('title', 'media_type', 'usage_context', 'is_active', 'created_at', 'updated_at')
    list_filter = ('media_type', 'is_active', 'usage_context')
    search_fields = ('title', 'alt_text', 'file')
```

| Feature | Status |
|---------|--------|
| Registered | Yes |
| List display | title, media_type, usage_context, is_active, created_at, updated_at |
| Search fields | title, alt_text, file |
| Filters | media_type, is_active, usage_context |
| Preview behavior | None (no image preview in list) |
| Upload behavior | Standard Django admin file upload |
| Delete behavior | Standard Django admin delete with confirmation |
| Custom validation | None |

**Compatibility note:** The new CMS must not modify the existing admin registration. New fields added via migration will automatically appear in the admin if `list_display` or `search_fields` are updated, but the current admin configuration should remain as-is or be enhanced separately.

---

# File Upload Security Assessment

## Current State

| Threat | Status | Notes |
|--------|--------|-------|
| MIME spoofing | **VULNERABLE** | No MIME validation exists. `media_file_path()` preserves the original extension without checking content type. |
| Dangerous file extensions | **VULNERABLE** | No extension allowlist. Any file type can be uploaded. |
| Executable files | **VULNERABLE** | No check for `.exe`, `.php`, `.sh`, `.bat`, etc. |
| SVG script injection | **VULNERABLE** | SVG files can contain `<script>` tags. No sanitization. |
| HTML uploads | **VULNERABLE** | `.html` files could be uploaded and served, enabling XSS. |
| Double extensions | **VULNERABLE** | `file.jpg.exe` would preserve `.exe` extension. |
| Oversized files | **VULNERABLE** | No upload size limit beyond Django defaults (2.5 MB memory). |
| Decompression bombs | **VULNERABLE** | No PIL-based image validation. |
| Invalid image content | **VULNERABLE** | No image integrity check. |
| Filename traversal | **MITIGATED** | UUID-based filenames prevent traversal. Original filename is discarded. |
| Unicode filename issues | **MITIGATED** | UUID-based filenames avoid unicode issues. |
| Duplicate filenames | **MITIGATED** | UUID-based filenames prevent collisions. |
| Malicious metadata | **NOT CHECKED** | EXIF data is not stripped. |
| Publicly accessible sensitive documents | **VULNERABLE** | All media under `/media/` is publicly accessible in DEBUG mode. |
| User-controlled storage paths | **MITIGATED** | Upload path is determined by `media_file_path()`, not user input. |

## Required Validation for Implementation

1. **Extension allowlist** — Check file extension against an approved list
2. **MIME type detection** — Use `python-magic` or Pillow to detect actual file type, not trust `Content-Type` header
3. **Image integrity validation** — Open with Pillow to verify valid image data
4. **File size enforcement** — Explicit max size check before saving
5. **SVG sanitization** — If SVG is allowed, strip `<script>` tags and event handlers
6. **Double extension prevention** — Reject files with multiple extensions
7. **Dimension limits** — Check image dimensions against maximums

---

# Allowed Media Types

| Type | Decision | Rationale |
|------|----------|-----------|
| JPEG | **ALLOW** | Standard web image format. Pillow validates integrity. |
| PNG | **ALLOW** | Standard web image format with transparency. Pillow validates. |
| WebP | **ALLOW** | Modern web format. Pillow 11.3 supports WebP. |
| GIF | **ALLOW** | Animated images for CMS content. Pillow validates. |
| SVG | **DENY** (Phase 1) | SVG can carry `<script>` tags and event handlers. Sanitization requires a dedicated parser (e.g., `defusedxml` or `svg-sanitizer`). Defer to a later phase with proper sanitization. |
| PDF | **DEFER** | PDF upload is useful but requires separate validation, antivirus scanning, and different storage considerations. Defer to a later phase. |
| Video | **DENY** (Phase 1) | Video requires significant storage, transcoding, and streaming infrastructure. Not appropriate for a corporate website CMS in Phase 1. |
| Audio | **DENY** | Not needed for the current website. |
| HTML | **DENY** | XSS risk. Never allow HTML uploads. |
| Documents (doc, docx, xls, xlsx) | **DEFER** | Defer with PDF to a document management phase. |

**Phase 1 allowed extensions:** `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`

---

# File Size and Dimension Recommendations

## Upload Size Limits

| Asset Category | Max File Size | Rationale |
|----------------|---------------|-----------|
| Partner logos | 2 MB | Logos are small graphics |
| Service icons | 1 MB | Icons are tiny graphics |
| Hero/section images | 5 MB | Higher resolution needed for hero sections |
| Insight cover images | 5 MB | Cover images need decent resolution |
| Case-study images | 5 MB | Case study images may be detailed |
| SEO/Open Graph images | 2 MB | OG images are typically 1200x630 |
| Default max upload | 5 MB | Global maximum for Phase 1 |

## Dimension Limits

| Asset Category | Min Dimensions | Max Dimensions | Aspect Ratio Guidance |
|----------------|----------------|----------------|----------------------|
| Partner logos | 64x64 | 2000x2000 | Any |
| Service icons | 32x32 | 512x512 | Square preferred |
| Hero/section images | 1200x400 | 4000x2000 | Wide banner |
| Insight cover images | 800x400 | 2400x1200 | 2:1 or 16:9 |
| Case-study images | 800x600 | 2400x1800 | 4:3 or 16:9 |
| SEO/OG images | 1200x630 | 2400x1260 | 1.91:1 (OG standard) |
| Favicon | 16x16 | 512x512 | Square |
| Global max dimensions | — | 4000x4000 | Reject larger images |

## Validation Approach

- **Reject** oversized files and invalid dimensions (not just warn)
- **Warn** on aspect ratio mismatch (do not reject — content manager may have intentional crops)
- Dimension validation only for image types (skip for non-images)
- Use Pillow's `Image.open()` to detect dimensions without loading full image into memory

---

# Image Processing Decision

## Current State

| Feature | Available | Notes |
|---------|-----------|-------|
| Pillow | Yes (11.3.0) | Installed in requirements.txt |
| Thumbnail generation | No | Not configured |
| Image compression | No | Not configured |
| WebP conversion | No | Not configured |
| EXIF stripping | No | Not configured |
| Orientation correction | No | Not configured (Pillow supports via `ImageOps.exif_transpose`) |
| Image resizing | No | Not configured |
| Responsive variants | No | Not configured |
| Hashing/deduplication | No | Not configured |

## Phase 1 Decision

| Feature | Include in Phase 1 | Rationale |
|---------|---------------------|-----------|
| Image integrity validation | **YES** | Open with Pillow to verify valid image |
| Dimension extraction | **YES** | Extract width/height for metadata |
| EXIF stripping | **YES** | Simple `ImageOps.exif_transpose()` + save without EXIF |
| Orientation correction | **YES** | Via `ImageOps.exif_transpose()` |
| Thumbnail generation | **DEFER** | Adds complexity, storage management |
| Image compression | **DEFER** | Pillow can do this but adds processing time |
| WebP conversion | **DEFER** | Conversion pipeline adds complexity |
| Responsive variants | **DEFER** | Requires thumbnail infrastructure |
| Hashing/deduplication | **DEFER** | Requires new model field (checksum) |

**Phase 1 approach:** Use Pillow only for validation (integrity check, dimension extraction, EXIF orientation correction). No image transformation or variant generation.

---

# Media Usage and Deletion Strategy

## Usage Detection

Since all content model FKs use `related_name='+'` (no reverse relations), usage detection requires explicit queries to each model:

```python
def get_asset_usage(asset_id):
    usage = []
    if Partner.objects.filter(logo_id=asset_id).exists():
        usage.append({'model': 'Partner', 'field': 'logo', 'count': Partner.objects.filter(logo_id=asset_id).count()})
    if Service.objects.filter(icon_id=asset_id).exists():
        usage.append({'model': 'Service', 'field': 'icon', ...})
    if Service.objects.filter(featured_image_id=asset_id).exists():
        usage.append({'model': 'Service', 'field': 'featured_image', ...})
    if CaseStudy.objects.filter(featured_image_id=asset_id).exists():
        usage.append({'model': 'CaseStudy', 'field': 'featured_image', ...})
    if CaseStudy.objects.filter(logo_id=asset_id).exists():
        usage.append({'model': 'CaseStudy', 'field': 'logo', ...})
    if Article.objects.filter(featured_image_id=asset_id).exists():
        usage.append({'model': 'Article', 'field': 'featured_image', ...})
    if NavigationItem.objects.filter(icon_asset_id=asset_id).exists():
        usage.append({'model': 'NavigationItem', 'field': 'icon_asset', ...})
    if SiteSetting.objects.filter(default_og_image_id=asset_id).exists():
        usage.append({'model': 'SiteSetting', 'field': 'default_og_image', ...})
    if SiteSetting.objects.filter(primary_logo_id=asset_id).exists():
        usage.append({'model': 'SiteSetting', 'field': 'primary_logo', ...})
    if SiteSetting.objects.filter(secondary_logo_id=asset_id).exists():
        usage.append({'model': 'SiteSetting', 'field': 'secondary_logo', ...})
    if SiteSetting.objects.filter(favicon_id=asset_id).exists():
        usage.append({'model': 'SiteSetting', 'field': 'favicon', ...})
    return usage
```

## Recommended Deletion Behavior

**REJECT DELETION WHEN REFERENCED** — Return a 409 Conflict with usage details.

Rationale:
- `on_delete=SET_NULL` means the content record survives, but the public page silently loses the image
- Content managers should explicitly detach the asset from content before deleting
- The usage endpoint provides the information needed to find and update references
- Hard delete when unused is safe — no references to break

| Scenario | Behavior |
|----------|----------|
| Asset not referenced by any content | Hard delete (record + file) |
| Asset referenced by one or more content records | Return 409 with usage list |
| Asset is_active=False (soft-deleted) | Allow hard delete if not referenced |

## Django's on_delete Sufficiency

Django's `on_delete=SET_NULL` prevents database integrity errors but does NOT prevent silent content breakage. The CMS API layer must add an explicit usage check before allowing deletion. This is a service-layer check, not a model-level constraint.

---

# Media Usage Endpoint

## Recommendation

**YES — include in Phase 1.** A usage endpoint is essential for safe deletion.

## Endpoint

```
GET /api/v1/cms/media/<id>/usage/
```

## Response Structure

```json
{
  "asset_id": 42,
  "is_referenced": true,
  "references": [
    {
      "model": "Partner",
      "field": "logo",
      "count": 2,
      "items": [
        {"id": 5, "label": "Acme Corp"},
        {"id": 12, "label": "TechStart"}
      ]
    },
    {
      "model": "SiteSetting",
      "field": "primary_logo",
      "count": 1,
      "items": [
        {"id": 1, "label": "Main Site Settings"}
      ]
    }
  ]
}
```

- `items` limited to first 10 results per model to prevent payload bloat
- `is_referenced` is a boolean for quick frontend checks
- Response includes enough detail for the user to find and detach references

---

# Recommended Admin API Architecture

## Endpoints

| Method | Path | Purpose | Permission |
|--------|------|---------|------------|
| GET | `/api/v1/cms/media/` | Paginated list with search/filter | `media.view` |
| POST | `/api/v1/cms/media/` | Upload new asset (multipart) | `media.create` |
| GET | `/api/v1/cms/media/<id>/` | Asset detail | `media.view` |
| PATCH | `/api/v1/cms/media/<id>/` | Update metadata (alt_text, title, usage_context) | `media.update` |
| DELETE | `/api/v1/cms/media/<id>/` | Delete asset (blocked if referenced) | `media.delete` |
| GET | `/api/v1/cms/media/<id>/usage/` | Usage references before deletion | `media.view` |

## Design Decisions

- **No separate upload and metadata endpoints** — Single POST handles both file upload and optional metadata in one request
- **PATCH for metadata only** — File cannot be replaced via PATCH (would require a new upload)
- **No PUT** — Full replacement is not needed for media assets
- **Usage endpoint** — Separate GET for deletion safety checks
- **No bulk operations** — Bulk upload and bulk delete are deferred
- **Compatible with existing `/api/v1/cms/` namespace** — Registered via `apps/core/cms_urls.py`

---

# Serializer Architecture

## Recommended Serializers

### 1. CMSMediaListSerializer (read-only)

| Field | Type | Writable |
|-------|------|----------|
| id | Integer | No |
| title | String | No |
| url | String (absolute) | No |
| alt_text | String | No |
| media_type | String | No |
| file_size | Integer | No |
| width | Integer | No |
| height | Integer | No |
| mime_type | String | No |
| usage_context | String | No |
| is_active | Boolean | No |
| uploaded_by | Object {id, username} | No |
| created_at | DateTime | No |
| updated_at | DateTime | No |

### 2. CMSMediaDetailSerializer (read-only)

Same as list serializer plus:
- `file_name` (original stored filename)
- `thumbnail_url` (if generated, deferred — omit in Phase 1)

### 3. CMSMediaUploadSerializer (write-only)

| Field | Type | Writable | Required |
|-------|------|----------|----------|
| file | FileField | Yes | Yes |
| title | String | Yes | No |
| alt_text | String | Yes | No |
| usage_context | String | Yes | No |

**System-generated fields (read-only, set by the service layer):**
- `id`, `file_size`, `mime_type`, `width`, `height`, `media_type`, `uploaded_by`, `created_at`, `updated_at`, `is_active`

### 4. CMSMediaUpdateSerializer (writable metadata only)

| Field | Type | Writable |
|-------|------|----------|
| title | String | Yes |
| alt_text | String | Yes |
| usage_context | String | Yes |
| is_active | Boolean | Yes |

**Read-only:** `id`, `file`, `file_size`, `mime_type`, `width`, `height`, `media_type`, `uploaded_by`, `created_at`, `updated_at`

### 5. MediaUsageResponseSerializer (read-only)

| Field | Type |
|-------|------|
| asset_id | Integer |
| is_referenced | Boolean |
| references | List of {model, field, count, items} |

---

# Upload Workflow

## Recommended Steps

1. **Receive multipart request** — `MultiPartParser` on the view
2. **Validate authentication and CSRF** — `IsAuthenticated`, `IsCMSUser`, `HasModulePermission` with `cms_module='media'`, `cms_action='create'`
3. **Validate capability** — `has_permission(role, 'media', 'create')` via `HasModulePermission`
4. **Validate extension** — Check file extension against allowlist (`jpg`, `jpeg`, `png`, `webp`, `gif`)
5. **Validate file size** — Check against max upload size (5 MB default)
6. **Validate image integrity** — Open with Pillow to verify valid image data
7. **Extract dimensions** — Get width/height from Pillow
8. **Detect MIME type** — Use Pillow's format detection (not `Content-Type` header)
9. **Sanitize filename** — Already handled by `media_file_path()` (UUID-based)
10. **Save MediaAsset** — Create record with system-generated fields
11. **Create Activity Log entry** — `cms.media.uploaded` with safe metadata
12. **Return CMS media response** — `CMSMediaDetailSerializer` data with 201 status

## Validation Location

| Validation | Layer | Rationale |
|------------|-------|-----------|
| Extension check | **Upload service** | Single source of truth, reusable |
| File size check | **Upload service** | Before file is saved to disk |
| Image integrity | **Upload service** | Requires Pillow, not serializer concern |
| Dimension extraction | **Upload service** | Pillow operation |
| MIME detection | **Upload service** | Pillow format detection |
| Field validation | **Serializer** | DRF field validation for title, alt_text, etc. |

**Recommendation:** Create a `backend/apps/media_library/services.py` with an `upload_media_asset()` function that handles steps 4-10. The serializer handles field-level validation only. The view calls the service after serializer validation passes.

---

# RBAC and Capability Requirements

## Existing Media Capabilities in `roles.py`

| Role | Module | Capabilities | Sufficient? |
|------|--------|-------------|-------------|
| super_admin | media | All (bypass) | Yes |
| admin | media | view, create, update, delete, publish | Yes — full CRUD |
| content_manager | media | view, create, update, delete, publish | Yes — full CRUD |
| editor | media | view, create | Yes — upload and list, no delete |
| marketing_manager | media | view, create | Yes — upload and list, no delete |
| recruiter | media | view, create | Yes — upload and list, no delete |
| support_agent | media | — | No access (correct) |
| lms_admin | media | — | No access (correct) |
| finance_sales | media | — | No access (correct) |

## Capability Mapping

| Action | Required Capability | Roles That Have It |
|--------|---------------------|-------------------|
| List/select media | `media.view` | admin, content_manager, editor, marketing_manager, recruiter |
| Upload media | `media.create` | admin, content_manager, editor, marketing_manager, recruiter |
| Edit metadata | `media.update` | admin, content_manager |
| Delete media | `media.delete` | admin, content_manager |
| View usage | `media.view` | admin, content_manager, editor, marketing_manager, recruiter |

## New Capabilities Required?

**No.** The existing `MODULE_MEDIA` with `CONTENT_CRUD` (for admin/content_manager) and `{view, create}` (for editor/marketing_manager/recruiter) is sufficient. No code changes to `roles.py` are needed.

## Migration Required for RBAC?

**No.** Capabilities are code-defined in `roles.py`, not database-stored. No migration needed.

---

# Activity Logging Requirements

## Activity Events

| Event | Action | Module | Description Convention |
|-------|--------|--------|----------------------|
| Upload | `create` | `media` | `cms.media.uploaded` |
| Metadata update | `update` | `media` | `cms.media.updated` |
| Delete | `delete` | `media` | `cms.media.deleted` |
| Delete blocked | `delete` | `media` | `cms.media.delete_blocked` (with `is_success=False`) |

## Safe Metadata Fields

| Field | Safe to Log | Notes |
|-------|-------------|-------|
| asset_id | Yes | Integer ID |
| title | Yes | User-provided title |
| media_type | Yes | Detected type |
| file_size | Yes | Integer bytes |
| width | Yes | Integer pixels |
| height | Yes | Integer pixels |
| mime_type | Yes | Detected MIME |
| usage_context | Yes | Free-text, user-provided |
| changed_fields | Yes | List of field names (for update) |

## Fields That Must NOT Be Logged

- Raw file contents
- File path on disk
- Cookies
- Session data
- Full request payload
- CSRF token
- Authorization headers
- Sensitive filesystem paths

## ActivityLog Model Compatibility

The existing `ActivityLog` model already includes:
- `MODULE_MEDIA = 'media'` in `MODULE_CHOICES`
- `ACTION_CREATE`, `ACTION_UPDATE`, `ACTION_DELETE` in `ACTION_CHOICES`
- `sanitize_metadata()` in `services.py` that strips sensitive keys
- Append-only enforcement via `MethodNotAllowed` on POST/PUT/PATCH/DELETE in API views

No changes to the ActivityLog model are needed.

---

# Search Filtering Pagination and Ordering

## Pagination

Use existing `CMSPagination` (`backend/apps/core/cms_pagination.py`):
- `page_size = 20`
- `page_size_query_param = 'page_size'`
- `max_page_size = 100`

## Search

| Parameter | Search Fields | Method |
|-----------|--------------|--------|
| `search` | title, alt_text, file (icontains) | OR query |

## Filters

| Parameter | Filter | Method |
|-----------|--------|--------|
| `media_type` | Exact match | `media_type=image` |
| `is_active` | Boolean | `is_active=true` |
| `usage_context` | Exact match | `usage_context=partner_logo` |
| `uploaded_by` | User ID | `uploaded_by=1` |
| `min_size` | File size >= | `min_size=1024` |
| `max_size` | File size <= | `max_size=5242880` |

## Ordering

| Parameter | Allowed Values |
|-----------|---------------|
| `ordering` | `created_at`, `-created_at`, `title`, `-title`, `file_size`, `-file_size`, `updated_at`, `-updated_at` |

**Allowlist enforcement:** Only values in the allowed list are accepted; invalid values are ignored.

## django-filter

**Not installed.** Use manual `query_params` filtering in the view's `get_queryset()` method, consistent with existing CMS views (e.g., partners, services).

---

# Duplicate Detection Decision

## Recommendation

**DEFER** duplicate detection to a later phase.

## Rationale

- Duplicate detection via file hash/checksum requires a new model field (`file_hash` CharField)
- This adds migration complexity for minimal value in Phase 1
- The CMS has 0 existing media assets and low upload volume
- UUID-based filenames already prevent filename collisions
- Content managers can visually identify duplicates in the media library grid

## Future Implementation

When implemented:
- Add `file_hash = models.CharField(max_length=64, blank=True, db_index=True)` to `MediaAsset`
- Compute SHA-256 hash during upload
- Return a warning (not rejection) if a matching hash exists
- Do not auto-reuse — let the user decide

---

# Frontend CMS Requirements

## Existing Frontend Stack

| Feature | Status |
|---------|--------|
| Framework | React 19.1 |
| Router | react-router-dom 7.6 |
| UI Library | None (no Tailwind, no shadcn/ui) |
| Icons | None (no Lucide) |
| API Client | `src/services/apiClient.js` (fetch wrapper) |
| Auth Context | `src/contexts/AuthContext.jsx` |
| CSRF Handling | `src/services/authApi.js` (reads `csrftoken` cookie) |
| Protected Routes | `src/components/auth/ProtectedRoute.jsx` |
| CMS Pages | `CMSLoginPage.jsx`, `CMSDashboardPage.jsx`, `CMSActivityLogsPage.jsx` |
| CMS Components | `RecentActivityWidget.jsx` |
| Upload Components | None |
| Modal/Dialog Components | None |
| Table/Card Components | None (inline styles used) |
| Form Controls | None (no form library) |

## CMS Layout

The current CMS dashboard (`CMSDashboardPage.jsx`) uses:
- Inline styles (no CSS framework)
- Dark theme (`#0a0a14` background, `#c9a96e` accent)
- Header with brand, nav links, sign-out button
- Main content area with sections
- `useAuth()` hook for user info, `hasModuleAccess()` for module visibility

## Required Frontend Pages/Components for `/cms/media`

| Component | Purpose | Priority |
|-----------|---------|----------|
| `CMSMediaLibraryPage.jsx` | Media grid/list page with search, filters, pagination | High |
| `MediaUploadDialog.jsx` | Upload modal with file input, drag-drop, metadata fields | High |
| `MediaAssetCard.jsx` | Individual asset card in the grid (thumbnail, title, type) | High |
| `MediaAssetDetailModal.jsx` | Detail drawer with full info, edit metadata, copy URL, delete | High |
| `MediaDeleteConfirm.jsx` | Delete confirmation with usage warning | High |
| `MediaPickerModal.jsx` | Reusable asset picker for content forms | Medium |
| `mediaApi.js` | API service for media endpoints | High |

## Frontend Route

```
/cms/media → CMSMediaLibraryPage
```

Must be wrapped in `AuthProvider` + `ProtectedRoute`, consistent with existing CMS routes.

## Styling Approach

Continue the existing inline-style approach used in `CMSDashboardPage.jsx` and `CMSActivityLogsPage.jsx`. Do not introduce a new CSS framework in this phase. The media library page should match the existing dark theme with `#c9a96e` accent.

---

# Asset Picker Contract

## API Contract

The media list endpoint supports query parameters for asset picker filtering:

| Parameter | Purpose | Example |
|-----------|---------|---------|
| `media_type` | Filter by type | `?media_type=image` |
| `usage_context` | Filter by intended usage | `?usage_context=partner_logo` |
| `search` | Search title/alt_text | `?search=logo` |
| `is_active` | Only active assets | `?is_active=true` |

## UI Contract

The `MediaPickerModal` component should:
- Accept `onSelect(asset)` callback
- Accept `mediaType` prop (default: `image`)
- Accept `usageContext` prop (optional, for filtering)
- Display a grid of assets with thumbnail previews
- Allow search and filter
- Return selected asset object: `{id, url, alt_text, title, media_type}`

## Usage in Content Forms

```jsx
<MediaPickerModal
  mediaType="image"
  usageContext="partner_logo"
  onSelect={(asset) => setFieldValue('logo', asset.id)}
/>
```

## Tight Coupling Avoidance

The media API does not need `?min_width=` or `?min_height=` parameters. Dimension constraints should be validated on the content form side after selection, not in the media API. The media API remains generic.

---

# Public Media URL Contract

## Current Behavior

- Media files are served from `/media/` in DEBUG mode via Django's `static()` helper
- `MediaAssetReferenceSerializer.get_url()` uses `request.build_absolute_uri(url)` to return absolute URLs
- In production, media would be served by Nginx or a CDN

## Assessment

| Concern | Status | Notes |
|---------|--------|-------|
| Media URLs are public | Yes | All files under `/media/` are publicly accessible |
| Absolute or relative URLs | Absolute | `request.build_absolute_uri()` returns full URL |
| Local development URLs | `http://127.0.0.1:8001/media/uploads/...` | Works with Vite dev server |
| Production domain compatibility | Yes | `build_absolute_uri()` uses the request's host |
| CORS implications | Minimal | Media files are same-origin, no CORS headers needed |
| Signed/private URLs | Not needed | Corporate website content is public |

## Recommendation

- **No private media support needed** for the current corporate website
- **No signed URLs needed** — all media is public content
- Continue using `request.build_absolute_uri()` for URL generation
- Defer private media support to a future phase if needed (e.g., for internal documents)

---

# Database and Migration Impact

```
MIGRATIONS REQUIRED
```

## Required Migration: `media_library/0002_media_asset_fields.py`

| Field | Model | Type | Nullable | Purpose |
|-------|-------|------|----------|---------|
| `file_size` | MediaAsset | PositiveBigIntegerField | Yes | File size in bytes |
| `mime_type` | MediaAsset | CharField(255) | Yes | Detected MIME type |
| `width` | MediaAsset | PositiveIntegerField | Yes | Image width in pixels |
| `height` | MediaAsset | PositiveIntegerField | Yes | Image height in pixels |
| `uploaded_by` | MediaAsset | ForeignKey(User, SET_NULL) | Yes | Uploader relation |

## Safety Assessment

- All new fields are **nullable** — existing zero records will not break
- No existing data to migrate (0 records in database)
- Migration can proceed safely before implementation
- No data migration needed — only schema migration
- `uploaded_by` uses `on_delete=SET_NULL` to preserve asset records if a user is deleted

## Deferred Fields (Not in Phase 1)

| Field | Purpose | Phase |
|-------|---------|-------|
| `file_hash` | Duplicate detection | Later phase |
| `thumbnail` | Generated thumbnail file | Later phase |
| `folder` | Folder/category support | Later phase |

---

# Exact Implementation Scope

## Included in MEDIA-LIBRARY-CMS-001

| Feature | Included | Notes |
|---------|----------|-------|
| Image upload (JPEG, PNG, WebP, GIF) | **YES** | Via multipart POST |
| Image list/detail | **YES** | Paginated, searchable, filterable |
| Metadata editing (title, alt_text, usage_context, is_active) | **YES** | Via PATCH |
| Deletion with usage check | **YES** | 409 if referenced, hard delete if unused |
| Usage endpoint | **YES** | `GET /api/v1/cms/media/<id>/usage/` |
| Image preview (thumbnail in list) | **YES** | Use file URL directly (no generated thumbnail) |
| Copy URL | **YES** | Frontend copies the absolute URL from detail response |
| Asset picker modal | **YES** | Reusable component for content forms |
| Activity logging | **YES** | Upload, update, delete, delete_blocked events |
| File size validation | **YES** | 5 MB max |
| Image integrity validation | **YES** | Pillow `Image.open()` |
| Dimension extraction | **YES** | Width/height from Pillow |
| MIME detection | **YES** | Pillow format detection |
| Extension allowlist | **YES** | jpg, jpeg, png, webp, gif only |
| EXIF orientation correction | **YES** | `ImageOps.exif_transpose()` on save |
| RBAC enforcement | **YES** | Existing media capabilities |
| Frontend media library page | **YES** | `/cms/media` route |
| Frontend upload dialog | **YES** | Modal with file input |
| Frontend asset detail modal | **YES** | View/edit/delete |
| Frontend asset picker | **YES** | Reusable modal |

---

# Deferred Features

| Feature | Deferred To | Rationale |
|---------|-------------|-----------|
| SVG upload | Later phase | Requires SVG sanitizer (defusedxml or svg-sanitizer) |
| PDF upload | Later phase | Requires separate validation and storage strategy |
| Video upload | Later phase | Requires transcoding and streaming infrastructure |
| Audio upload | Later phase | Not needed for corporate website |
| Document uploads (doc, docx, xls, xlsx) | Later phase | Defer with PDF |
| Automatic resizing | Later phase | Adds processing complexity |
| WebP conversion | Later phase | Requires conversion pipeline |
| Thumbnail generation | Later phase | Requires storage management for variants |
| Responsive variants | Later phase | Requires thumbnail infrastructure |
| Duplicate detection (file hash) | Later phase | Requires new model field and migration |
| Folders/tags | Later phase | Requires new model fields and UI |
| Bulk upload | Later phase | Adds UI and API complexity |
| Bulk delete | Later phase | Adds safety concerns |
| Private/signed media URLs | Later phase | Not needed for public corporate website |
| Production storage backend (S3/GCS) | Deployment phase | Requires django-storages and cloud configuration |
| Image compression | Later phase | Pillow can do this but adds processing time |

---

# Risks and Blockers

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| SVG denial could break existing workflows that expect SVG | Low | 0 media assets exist; no existing SVG usage |
| 5 MB limit may be too small for high-res hero images | Low | Can be adjusted via environment variable |
| No thumbnail generation means large images loaded in grid | Medium | Frontend can use CSS `object-fit` and fixed-size containers |
| `related_name='+'` makes usage detection manual | Medium | Service layer queries each model explicitly |
| No production media serving configured | Medium | Defer to deployment phase; DEBUG mode sufficient for development |
| Inline styles in frontend may not scale | Low | Consistent with existing CMS pages; defer CSS framework to later phase |

## Blockers

**None.** No blockers identified. All prerequisites are met:
- MediaAsset model exists
- Pillow is installed
- RBAC capabilities are defined
- ActivityLog supports media module
- CMS URL namespace is established
- Frontend auth and routing infrastructure exist

---

# Exact Implementation File Plan

## Backend

| File | Action | Purpose |
|------|--------|---------|
| `backend/apps/media_library/models.py` | **MODIFY** | Add `file_size`, `mime_type`, `width`, `height`, `uploaded_by` fields |
| `backend/apps/media_library/migrations/0002_media_asset_fields.py` | **CREATE** | Schema migration for new fields |
| `backend/apps/media_library/services.py` | **CREATE** | Upload validation service (extension, size, integrity, dimensions, MIME, EXIF) |
| `backend/apps/media_library/cms_serializers.py` | **CREATE** | List, detail, upload, update, usage serializers |
| `backend/apps/media_library/cms_views.py` | **CREATE** | ListCreate, RetrieveUpdateDestroy, Usage views |
| `backend/apps/media_library/cms_urls.py` | **CREATE** | CMS URL patterns for media endpoints |
| `backend/apps/media_library/urls.py` | **DO NOT MODIFY** | Public URLs remain empty (no public media API) |
| `backend/apps/media_library/admin.py` | **MODIFY** | Add new fields to `list_display` and `search_fields` |
| `backend/apps/core/cms_urls.py` | **MODIFY** | Add `path('media/', include('apps.media_library.cms_urls'))` |
| `backend/config/settings.py` | **DO NOT MODIFY** | Media config is sufficient for Phase 1 |
| `backend/config/urls.py` | **DO NOT MODIFY** | Media serving already configured for DEBUG |
| `backend/apps/accounts/roles.py` | **DO NOT MODIFY** | Media capabilities already defined |
| `backend/apps/activity_logs/models.py` | **DO NOT MODIFY** | Media module already in choices |
| `backend/apps/core/cms_serializers.py` | **DO NOT MODIFY** | `MediaAssetReferenceSerializer` and `media_asset_field()` remain as-is |
| `backend/apps/core/cms_permissions.py` | **DO NOT MODIFY** | `CMSViewMixin` works for media views |
| `backend/apps/core/cms_pagination.py` | **DO NOT MODIFY** | `CMSPagination` works for media list |

## Frontend

| File | Action | Purpose |
|------|--------|---------|
| `src/services/mediaApi.js` | **CREATE** | API service for media CRUD + usage |
| `src/pages/cms/CMSMediaLibraryPage.jsx` | **CREATE** | Media library page with grid, search, filters, pagination |
| `src/components/media/MediaUploadDialog.jsx` | **CREATE** | Upload modal with file input and metadata fields |
| `src/components/media/MediaAssetCard.jsx` | **CREATE** | Asset card for grid display |
| `src/components/media/MediaAssetDetailModal.jsx` | **CREATE** | Detail modal with edit, copy URL, delete |
| `src/components/media/MediaDeleteConfirm.jsx` | **CREATE** | Delete confirmation with usage warning |
| `src/components/media/MediaPickerModal.jsx` | **CREATE** | Reusable asset picker for content forms |
| `src/App.jsx` | **MODIFY** | Add `/cms/media` route with ProtectedRoute |

## Validation

| File | Action | Purpose |
|------|--------|---------|
| `backend/validate_media.py` | **CREATE** (temporary) | Lightweight validation script; deleted after use |

## Report

| File | Action | Purpose |
|------|--------|---------|
| `project-memory/evidence/MEDIA-LIBRARY-CMS-001-REPORT.md` | **CREATE** | Implementation report |

---

# Lightweight Validation Plan

## Test Categories

| # | Test | Expected | Method |
|---|------|----------|--------|
| 1 | Anonymous upload denied | 401/403 | POST without session |
| 2 | User without capability denied | 403 | POST as support_agent |
| 3 | Authorized upload succeeds | 201 | POST as content_manager with valid image |
| 4 | CSRF enforced | 403 | POST without CSRF token |
| 5 | Invalid extension denied | 400 | Upload `.txt` file |
| 6 | Fake MIME denied | 400 | Upload `.jpg` file with text content |
| 7 | Corrupt image denied | 400 | Upload truncated image data |
| 8 | Oversized image denied | 400 | Upload image > 5 MB |
| 9 | Metadata update works | 200 | PATCH title and alt_text |
| 10 | Read-only field injection blocked | 200 | PATCH with `file_size=999` — value ignored |
| 11 | Referenced asset deletion blocked | 409 | DELETE asset referenced by Partner.logo |
| 12 | Unused asset deletion succeeds | 204 | DELETE asset with no references |
| 13 | Activity events created | 1 each | Check ActivityLog for upload, update, delete |
| 14 | Public content referencing assets remains intact | 200 | GET public partners API after asset operations |
| 15 | Django Admin remains operational | 200 | GET `/admin/media_library/mediaasset/` |
| 16 | No migrations unless explicitly approved | 0 | `makemigrations --dry-run` after implementation |
| 17 | Temporary files and records cleaned | 0 | Verify no temp assets remain |
| 18 | Usage endpoint returns references | 200 | GET `/api/v1/cms/media/<id>/usage/` with referenced asset |
| 19 | List search and filter work | 200 | GET with `?search=test&media_type=image` |
| 20 | Pagination works | 200 | GET with `?page=1&page_size=10` |

## Validation Approach

- Use Django test client with temporary users and temporary image files
- Create temporary `SimpleUploadedFile` with valid image content (Pillow-generated)
- Clean up all temporary records and files after validation
- Do not run full Django test suite or pytest
- Script deleted after validation

---

# Final Recommendation

## READY FOR MEDIA-LIBRARY-CMS-001

The SidrahSoft CMS is fully prepared for Media Library implementation. All prerequisites are met:

- **MediaAsset model** exists and is migrated
- **Pillow 11.3.0** is installed for image validation
- **RBAC capabilities** for `media` module are defined in `roles.py`
- **ActivityLog** supports `media` module and all required actions
- **CMS URL namespace** (`/api/v1/cms/`) is established with consistent patterns
- **Frontend auth infrastructure** (AuthProvider, ProtectedRoute, CSRF handling) is in place
- **Content model dependencies** are well-mapped with `on_delete=SET_NULL`
- **0 existing media records** means zero risk of breaking existing data

**Migration requirement:** 1 schema migration adding 5 nullable fields (`file_size`, `mime_type`, `width`, `height`, `uploaded_by`)

**Recommended allowed media types:** JPEG, PNG, WebP, GIF (SVG, PDF, Video deferred)

**Deferred items:** SVG upload, PDF upload, video upload, thumbnail generation, WebP conversion, duplicate detection, bulk operations, production storage backend, private media URLs

**No code, database records, or media files were modified during this investigation.**
