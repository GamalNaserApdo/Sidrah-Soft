# INSIGHTS-CMS-INVESTIGATION-001 REPORT

**Date:** 2026-07-11
**Scope:** Frontend, backend, database, APIs, admin, and navigation for Insights / Blog / Articles / News
**Investigator:** Cascade (AI pair programmer)
**Repository:** `F:\What_i_Made\New\sidrah_web`
**Backend root:** `F:\What_i_Made\New\sidrah_web\backend`

---

## 1. Executive Summary

The public website already displays an **Insights** section on the homepage, but it is currently driven by a hardcoded JavaScript array with five English-only article cards. No backend app, model, API, or route exists for Insights yet. The Case Studies and Services apps provide a proven, reusable pattern (bilingual fields, `MediaAsset` relations, `is_active`/`is_featured`/`show_on_homepage`, SEO fields, slug-based APIs) that the Insights implementation should mirror. The shortest path to a CMS-ready insights system is to add a new `apps.insights` app with a single `Article` model supporting a controlled `content_type` (insight/article/news/announcement), optional category labels, and a publish workflow.

**CMS readiness score: 3/10**
- Frontend card UI and data shape are ready: 6/10
- Backend infrastructure exists: 8/10
- No backend content model, no routes, no listing/detail pages, no body content: 0/10

---

## 2. Current Frontend State

### 2.1 Exact insight-related files

- `f:\What_i_Made\New\sidrah_web\src\data\insights\insightsData.js` — source of truth for all five insight cards
- `f:\What_i_Made\New\sidrah_web\src\utils\content\insights.js` — filters, sorting, slug lookup, path helpers
- `f:\What_i_Made\New\sidrah_web\src\components\insights\InsightCard.jsx` — card component
- `f:\What_i_Made\New\sidrah_web\src\components\sections\InsightsSection.jsx` — homepage section rendering three featured cards
- `f:\What_i_Made\New\sidrah_web\src\styles\global.css` — insight section and card styles (lines ~1213–1350)
- `f:\What_i_Made\New\sidrah_web\src\config\seo.js` — static `PAGES.insights` metadata (unused because no route exists)
- `f:\What_i_Made\New\sidrah_web\src\i18n\en.js` and `f:\What_i_Made\New\sidrah_web\src\i18n\ar.js` — navigation labels only (`insights` / `الرؤى`)

### 2.2 What currently exists

- **Homepage cards only.** `InsightsSection` renders `getFeaturedInsights(3)` from `insightsData.js`.
- **Category constants:** `INSIGHT_CATEGORIES` defines `all`, `ai`, `softwareDevelopment`, `mobileApps`, `automation`, `educationTechnology`.
- **Sort options:** `newest`, `oldest`, `featured`.
- **Bilingual helpers already exist:** `getBilingual`, `resolveMediaUrl`.
- **No listing page, no detail page, no route.**
- **Card does not render cover images, authors, dates, or reading time.** `InsightCard` only shows `category`, `title`, and `excerpt`.

### 2.3 Routing

- `f:\What_i_Made\New\sidrah_web\src\App.jsx` defines only `/`, `/training`, `/case-studies`, `/careers`. No `/insights` or `/insights/:slug` route.
- `f:\What_i_Made\New\sidrah_web\src\utils\content\insights.js` already defines `getInsightsIndexPath()` → `/insights` and `getInsightPath(slug)` → `/insights/:slug`, but they are not wired to React Router.
- The "View all insights" CTA in `InsightsSection` is an anchor to `#insights` with an explicit `aria-label="View all insights - coming soon"`.

### 2.4 Navigation and footer

- `f:\What_i_Made\New\sidrah_web\src\hooks\useHeaderNavigation.js` fallback links `insights` → `#insights` (anchor).
- `f:\What_i_Made\New\sidrah_web\src\components\Footer.jsx` company links map `insights` → `#insights` anchor.

---

## 3. Current Content Inventory

All five items are defined in `f:\What_i_Made\New\sidrah_web\src\data\insights\insightsData.js`.

| # | Title | Slug | Category | Excerpt | Featured | Publish Date | Reading Time | Author | Body | Arabic | Cover Image |
|---|-------|------|----------|---------|----------|--------------|--------------|--------|------|--------|-------------|
| 1 | Building systems that scale beyond the first launch | `building-systems-that-scale` | Software Development | Why successful digital products need architecture, operations, and long-term maintainability from day one. | Yes | 2026-01-15 | 5 min read | **missing** | **missing** | **missing** | `/assets/insights/placeholder.png` (missing asset) |
| 2 | Where automation creates real business value | `where-automation-creates-real-business-value` | Automation | How organizations can identify repeatable workflows and turn them into measurable operational efficiency. | Yes | 2026-02-03 | 4 min read | **missing** | **missing** | **missing** | `/assets/insights/placeholder.png` (missing asset) |
| 3 | Designing digital foundations for modern learning | `designing-digital-foundations-for-modern-learning` | Education Technology | How academic institutions can prepare platforms, student systems, and future learning experiences. | Yes | 2026-02-20 | 6 min read | **missing** | **missing** | **missing** | `/assets/insights/placeholder.png` (missing asset) |
| 4 | Moving AI from experiment to production | `ai-from-experiment-to-production` | AI | Practical steps for taking machine-learning prototypes into reliable, maintainable production systems. | No | 2026-03-05 | 7 min read | **missing** | **missing** | **missing** | `/assets/insights/placeholder.png` (missing asset) |
| 5 | Mobile apps that enterprises actually use | `mobile-apps-that-enterprises-actually-use` | Mobile Apps | What makes internal and customer-facing mobile applications succeed inside large organizations. | No | 2026-03-18 | 5 min read | **missing** | **missing** | **missing** | `/assets/insights/placeholder.png` (missing asset) |

All five items have identical nested SEO fields:

```js
seo: {
  title: '<article title> | Sidrah Soft',
  description: '<same as excerpt>',
}
```

All five items are `language: 'en'`. No Arabic titles, excerpts, or SEO fields exist in the frontend data.

---

## 4. Current Backend State

### 4.1 No dedicated insights app

- `f:\What_i_Made\New\sidrah_web\backend\config\settings.py` `LOCAL_APPS` lists: `core`, `accounts`, `site_settings`, `navigation`, `media_library`, `partners`, `services`, `case_studies`, `careers`. No `insights` app.
- No backend model contains "insight", "article", "blog", or "news" in its name.
- PostgreSQL table list confirmed (no `insights_*`, `articles_*`, `blog_*`, or `news_*` tables):

```
accounts_user
accounts_user_groups
accounts_user_user_permissions
auth_group
auth_group_permissions
auth_permission
careers_job
case_studies_casestudy
case_studies_casestudy_services
django_admin_log
django_content_type
django_migrations
django_session
media_library_mediaasset
navigation_navigationitem
navigation_navigationmenu
partners_partner
services_service
site_settings_sitesetting
```

### 4.2 Existing apps that can serve as templates

The `apps.case_studies` and `apps.services` apps provide the closest blueprint for an Insights app:

- `f:\What_i_Made\New\sidrah_web\backend\apps\case_studies\models.py` — `CaseStudy` model with bilingual title/description, `MediaAsset` featured image, `slug`, `display_order`, `is_active`, `is_featured`, `show_on_homepage`, SEO fields.
- `f:\What_i_Made\New\sidrah_web\backend\apps\services\models.py` — `Service` model with the same pattern plus `cta_label`/`cta_url`.
- `f:\What_i_Made\New\sidrah_web\backend\apps\partners\models.py` — `Partner` model with `partner_type` choices, website URL, open-in-new-tab.
- `f:\What_i_Made\New\sidrah_web\backend\apps\careers\models.py` — `Job` model with a `public_qs()` classmethod and a `closing_date`/`posted_date` publishing filter.

---

## 5. Reusable Foundations

### 5.1 Abstract base model

`f:\What_i_Made\New\sidrah_web\backend\apps\core\models.py`:

```python
class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
```

### 5.2 Media asset

`f:\What_i_Made\New\sidrah_web\backend\apps\media_library\models.py`:

- `MediaAsset` with `title`, `file`, `alt_text`, `media_type`, `usage_context`, `is_active`.
- ForeignKey pattern used by other apps: `on_delete=models.SET_NULL`, `blank=True`, `null=True`.
- Serializers return `{id, url, alt_text}` objects with bilingual `alt_text` (`en`/`ar`).

### 5.3 User model and roles

`f:\What_i_Made\New\sidrah_web\backend\apps\accounts\models.py`:

- Custom `User(AbstractUser)` with roles: `super_admin`, `content_manager`, `marketing_seo`, `support_recruiter`, `lms_admin`, `finance_sales`.
- `content_manager` is the default role, suitable for future article authors/editors.

### 5.4 Bilingual field pattern

Every existing CMS model uses paired fields:

- `name_en` (required) + `name_ar` (blank)
- `description_en` + `description_ar`
- `seo_title_en` + `seo_title_ar`
- `seo_description_en` + `seo_description_ar`

Serializers expose them as `{en, ar}` objects with Arabic falling back to English when empty. Example: `f:\What_i_Made\New\sidrah_web\backend\apps\case_studies\serializers.py`.

### 5.5 Slug, ordering, and display flags

- Slug is `unique=True`, `max_length=255`, `prepopulated_fields={'slug':('title_en',)}` in admin.
- Ordering is `['display_order', 'title_en']`.
- Display flags: `is_active`, `is_featured`, `show_on_homepage`, `display_order`.

### 5.6 API conventions

- Public API views are `APIView` subclasses with `permission_classes=[AllowAny]`.
- URL pattern: `path('api/v1/<app>/', include('apps.<app>.urls'))` with `path('', ListView)` and `path('<slug:slug>/', DetailView)`.
- List endpoints accept query filters (e.g., `?is_featured=true`, `?show_on_homepage=true`).
- Detail endpoints use `get_object_or_404` and filter on `is_active=True`.

### 5.7 Frontend API pattern

- `f:\What_i_Made\New\sidrah_web\src\services\apiClient.js` provides `apiFetch` with `API_BASE_URL` from `VITE_API_BASE_URL`.
- `f:\What_i_Made\New\sidrah_web\src\hooks\useCaseStudies.js` shows the CMS + fallback pattern: fetch CMS data; if valid, normalize it; otherwise return `null` so the consumer uses hardcoded fallback data.
- `resolveMediaUrl` already handles relative `/media/...` paths and absolute URLs.

---

## 6. Article Type Decision

**Recommendation:** One unified model with a controlled `content_type` choice field.

Justification:
- The current frontend only has one content type on display: "Insights".
- Future needs (blog posts, news, announcements) share the same fields: title, excerpt, body, image, category, author, publish date, SEO.
- Separate models would create near-duplicate code, migrations, admin classes, and serializers.

Proposed choices:

```python
CONTENT_TYPE_INSIGHT = 'insight'
CONTENT_TYPE_ARTICLE = 'article'
CONTENT_TYPE_NEWS = 'news'
CONTENT_TYPE_ANNOUNCEMENT = 'announcement'

CONTENT_TYPE_CHOICES = [
    (CONTENT_TYPE_INSIGHT, 'Insight'),
    (CONTENT_TYPE_ARTICLE, 'Article'),
    (CONTENT_TYPE_NEWS, 'News'),
    (CONTENT_TYPE_ANNOUNCEMENT, 'Announcement'),
]
```

The public API can filter by `?content_type=insight` for the homepage section, or expose all types on the listing page. This avoids splitting while keeping future taxonomies possible.

---

## 7. Category and Tag Decision

### 7.1 Category

**Recommendation:** Controlled bilingual `CharField` labels on the `Article` model for the MVP, not a separate `ArticleCategory` model.

Justification:
- The frontend already uses five simple category strings: `AI`, `Software Development`, `Mobile Apps`, `Automation`, `Education Technology`.
- No hierarchy or category landing pages are currently needed.
- A separate model adds admin overhead without immediate benefit; defer it until category pages, SEO, or CMS category management is required.

Proposed fields:

```python
category_en = models.CharField(max_length=120, blank=True)
category_ar = models.CharField(max_length=120, blank=True)
```

### 7.2 Tags

**Recommendation:** Defer tags in the first version.

Justification:
- The current frontend has no tag UI or filtering.
- Tags can be added later as a separate `Tag` model or `ArrayField`/`JSONField` without changing the core article model if the schema is designed to be extensible.
- Avoids premature normalization and admin complexity.

---

## 8. Author Decision

**Recommendation:** Free-text bilingual author fields for the MVP, with a `ForeignKey` to `MediaAsset` for the author avatar.

Justification:
- No author pages or public author profiles exist in the current design.
- Staff accounts are not yet a public feature.
- Linking to the `User` model prematurely would expose internal usernames and complicate permissions/public author pages.
- The recommended approach keeps author data public and editable without requiring a CMS user account per author.

Proposed fields:

```python
author_name_en = models.CharField(max_length=120, blank=True)
author_name_ar = models.CharField(max_length=120, blank=True)
author_role_en = models.CharField(max_length=120, blank=True)
author_role_ar = models.CharField(max_length=120, blank=True)
author_image = models.ForeignKey(MediaAsset, on_delete=models.SET_NULL, blank=True, null=True)
```

A future `AuthorProfile` model can be introduced when public author pages or multi-article attribution is needed.

---

## 9. Rich-Text Decision

**Recommendation:** Use plain HTML stored in `TextField` for the MVP body.

Justification:
- Security: Django admin can render `TextField` as a textarea; frontend can sanitize HTML before rendering with `dangerouslySetInnerHTML` if needed.
- Bilingual editing is straightforward with `body_en`/`body_ar` textareas.
- No WYSIWYG or Markdown dependency is required now, avoiding package lock-in.
- Future upgrades (Markdown, block editor, WYSIWYG) can be swapped without changing the model shape if the field is a plain-text field.

Sanitization recommendation:
- Backend: accept HTML but validate it for allowed tags/attributes (e.g., `bleach` or Django's `strip_tags` utility).
- Frontend: render with a sanitizer such as `DOMPurify` before injecting into the DOM.

---

## 10. Recommended Article Model

A new model in a new `apps.insights` app. Name it `Article` internally, expose it publicly as "Insights" where appropriate.

```python
class Article(TimeStampedModel):
    # Identity
    title_en = models.CharField(_('Title (English)'), max_length=255)
    title_ar = models.CharField(_('Title (Arabic)'), max_length=255, blank=True)
    slug = models.SlugField(_('Slug'), max_length=255, unique=True)

    # Content type
    content_type = models.CharField(
        max_length=32,
        choices=CONTENT_TYPE_CHOICES,
        default=CONTENT_TYPE_INSIGHT,
    )

    # Summary
    excerpt_en = models.TextField(_('Excerpt (English)'), blank=True)
    excerpt_ar = models.TextField(_('Excerpt (Arabic)'), blank=True)

    # Body
    body_en = models.TextField(_('Body (English)'), blank=True)
    body_ar = models.TextField(_('Body (Arabic)'), blank=True)

    # Classification
    category_en = models.CharField(_('Category (English)'), max_length=120, blank=True)
    category_ar = models.CharField(_('Category (Arabic)'), max_length=120, blank=True)
    # tags deferred

    # Author (public, free-text)
    author_name_en = models.CharField(_('Author name (English)'), max_length=120, blank=True)
    author_name_ar = models.CharField(_('Author name (Arabic)'), max_length=120, blank=True)
    author_role_en = models.CharField(_('Author role (English)'), max_length=120, blank=True)
    author_role_ar = models.CharField(_('Author role (Arabic)'), max_length=120, blank=True)
    author_image = models.ForeignKey(
        MediaAsset,
        related_name='+',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        verbose_name=_('Author image'),
    )

    # Media
    featured_image = models.ForeignKey(
        MediaAsset,
        related_name='+',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        verbose_name=_('Featured image'),
    )

    # Publishing
    STATUS_DRAFT = 'draft'
    STATUS_PUBLISHED = 'published'
    STATUS_ARCHIVED = 'archived'
    STATUS_CHOICES = [
        (STATUS_DRAFT, _('Draft')),
        (STATUS_PUBLISHED, _('Published')),
        (STATUS_ARCHIVED, _('Archived')),
    ]
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default=STATUS_DRAFT)
    published_at = models.DateTimeField(_('Published at'), blank=True, null=True)
    is_featured = models.BooleanField(_('Featured'), default=False)
    show_on_homepage = models.BooleanField(_('Show on homepage'), default=False)
    display_order = models.PositiveIntegerField(_('Display order'), default=0)

    # Reading metadata
    read_time_minutes = models.PositiveIntegerField(_('Read time (minutes)'), blank=True, null=True)

    # External content
    external_url = models.URLField(_('External URL'), blank=True)
    open_in_new_tab = models.BooleanField(_('Open in new tab'), default=True)

    # SEO
    seo_title_en = models.CharField(_('SEO title (English)'), max_length=255, blank=True)
    seo_title_ar = models.CharField(_('SEO title (Arabic)'), max_length=255, blank=True)
    seo_description_en = models.TextField(_('SEO description (English)'), blank=True)
    seo_description_ar = models.TextField(_('SEO description (Arabic)'), blank=True)

    class Meta:
        db_table = 'insights_article'
        verbose_name = _('Article')
        verbose_name_plural = _('Articles')
        ordering = ['display_order', '-published_at', 'title_en']
        indexes = [
            models.Index(fields=['status', 'is_featured', 'display_order'], name='insights_status_featured_idx'),
            models.Index(fields=['status', 'show_on_homepage', 'display_order'], name='insights_status_homepage_idx'),
            models.Index(fields=['content_type', 'status', 'published_at'], name='insights_type_status_date_idx'),
        ]

    def __str__(self):
        return self.title_en

    @classmethod
    def public_qs(cls):
        now = timezone.now()
        return cls.objects.filter(
            status=cls.STATUS_PUBLISHED,
            published_at__lte=now,
        )
```

---

## 11. Publishing Workflow Decision

**Recommendation:** Three statuses: `draft`, `published`, `archived`.

Justification:
- Draft and published are the minimum for a CMS.
- Adding `archived` now avoids a redesign later and maps cleanly to the existing `is_active` pattern in other apps (archived is equivalent to inactive but semantically explicit).
- Public API filters on `status='published'` and `published_at__lte=now()`. This allows scheduled publication without extra fields.

Admin actions should include: publish selected, unpublish (to draft), archive selected.

---

## 12. API Contract Proposal

### 12.1 Endpoints

Register under `f:\What_i_Made\New\sidrah_web\backend\config\urls.py`:

```python
path('api/v1/insights/', include('apps.insights.urls')),
```

URL configuration in `apps.insights.urls`:

```python
app_name = 'insights'
urlpatterns = [
    path('', views.ArticleListView.as_view(), name='article-list'),
    path('<slug:slug>/', views.ArticleDetailView.as_view(), name='article-detail'),
]
```

Resulting public URLs:
- `GET /api/v1/insights/`
- `GET /api/v1/insights/<slug>/`

### 12.2 List query parameters

| Parameter | Example | Behavior |
|-----------|---------|----------|
| `content_type` | `?content_type=insight` | filter by content type |
| `category` | `?category=AI` | case-insensitive exact match on `category_en` |
| `is_featured` | `?is_featured=true` | featured articles only |
| `show_on_homepage` | `?show_on_homepage=true` | homepage articles only |
| `search` | `?search=automation` | search `title_en`, `title_ar`, `excerpt_en`, `excerpt_ar`, `body_en`, `body_ar` |
| `ordering` | `?ordering=-published_at` | default: `display_order`, `-published_at` |

### 12.3 Serializer output shape

List serializer (card data):

```json
{
  "id": 1,
  "slug": "building-systems-that-scale",
  "content_type": "insight",
  "title": { "en": "...", "ar": "..." },
  "excerpt": { "en": "...", "ar": "..." },
  "category": { "en": "Software Development", "ar": "..." },
  "featured_image": { "id": 1, "url": "https://.../media/...", "alt_text": { "en": "...", "ar": "..." } },
  "author": { "name": { "en": "...", "ar": "..." }, "role": { "en": "...", "ar": "..." }, "image": { ... } },
  "published_at": "2026-01-15T00:00:00Z",
  "read_time_minutes": 5,
  "display_order": 0,
  "is_featured": true,
  "show_on_homepage": true
}
```

Detail serializer extends list with `body`, `external_url`, `open_in_new_tab`, and `seo`.

### 12.4 Unpublished behavior

List and detail APIs use `Article.public_qs()` only. Draft and archived articles return 404 in detail and are excluded from list. The API returns empty array `[]` if no published articles exist.

---

## 13. Django Admin Plan

Recommended `ArticleAdmin` for `f:\What_i_Made\New\sidrah_web\backend\apps\insights\admin.py`:

### 13.1 List view

```python
list_display = (
    'title_en',
    'title_ar',
    'content_type',
    'category_en',
    'status',
    'published_at',
    'is_featured',
    'show_on_homepage',
    'display_order',
    'updated_at',
)
list_filter = (
    'status',
    'content_type',
    'is_featured',
    'show_on_homepage',
    'category_en',
    'published_at',
)
search_fields = (
    'title_en',
    'title_ar',
    'slug',
    'excerpt_en',
    'excerpt_ar',
    'body_en',
    'body_ar',
    'category_en',
    'category_ar',
    'author_name_en',
    'author_name_ar',
)
ordering = ('display_order', 'title_en')
readonly_fields = ('created_at', 'updated_at')
prepopulated_fields = {'slug': ('title_en',)}
```

### 13.2 Fieldsets

1. Identity — `title_en`, `title_ar`, `slug`, `content_type`
2. Summary — `excerpt_en`, `excerpt_ar`
3. Body — `body_en`, `body_ar` (large textareas)
4. Classification — `category_en`, `category_ar`
5. Author — `author_name_en`, `author_name_ar`, `author_role_en`, `author_role_ar`, `author_image`
6. Media — `featured_image`
7. Publishing — `status`, `published_at`, `is_featured`, `show_on_homepage`, `display_order`
8. Reading / External — `read_time_minutes`, `external_url`, `open_in_new_tab`
9. SEO — `seo_title_en`, `seo_title_ar`, `seo_description_en`, `seo_description_ar` (collapsed)
10. Timestamps — `created_at`, `updated_at` (readonly)

### 13.3 Actions

```python
@admin.action(description='Publish selected articles')
def publish_articles(modeladmin, request, queryset):
    queryset.update(status=Article.STATUS_PUBLISHED)

@admin.action(description='Unpublish selected articles to draft')
def unpublish_articles(modeladmin, request, queryset):
    queryset.update(status=Article.STATUS_DRAFT)

@admin.action(description='Archive selected articles')
def archive_articles(modeladmin, request, queryset):
    queryset.update(status=Article.STATUS_ARCHIVED)

@admin.action(description='Mark as featured')
def mark_featured(modeladmin, request, queryset):
    queryset.update(is_featured=True)

@admin.action(description='Remove featured status')
def remove_featured(modeladmin, request, queryset):
    queryset.update(is_featured=False)

@admin.action(description='Show on homepage')
def show_on_homepage(modeladmin, request, queryset):
    queryset.update(show_on_homepage=True)

@admin.action(description='Hide from homepage')
def hide_from_homepage(modeladmin, request, queryset):
    queryset.update(show_on_homepage=False)
```

---

## 14. Custom CMS Dashboard Readiness

Future Sidrah-branded CMS screens should manage:

- Article list with filters (status, content type, category, featured, homepage, search)
- Create / edit article with bilingual fields
- Status toggle (draft / published / archived) with `published_at` scheduling
- Preview button (render article with draft content in a sandbox route)
- Duplicate article (copy all fields except slug, append `-copy`)
- Reorder homepage content via `display_order`
- Category autocomplete based on existing `category_en`/`category_ar` values
- Tag management deferred (add later)
- Author selection via text fields or future `AuthorProfile` dropdown
- Media picker for `featured_image` and `author_image`
- Bilingual SEO editor
- Search and filters matching the public API query parameters

Authenticated API requirements later:
- `POST /api/v1/cms/articles/`
- `PUT/PATCH /api/v1/cms/articles/<id>/`
- `DELETE /api/v1/cms/articles/<id>/`
- `POST /api/v1/cms/articles/<id>/preview/`
- `POST /api/v1/cms/articles/<id>/duplicate/`
- `PATCH /api/v1/cms/articles/reorder/`

These are not needed now; the public API can remain read-only.

---

## 15. Frontend Migration Plan

### 15.1 Files likely to change

1. `f:\What_i_Made\New\sidrah_web\backend\config\urls.py` — add insights API route.
2. `f:\What_i_Made\New\sidrah_web\backend\apps\insights\*` — new app (model, admin, serializers, views, urls, seed).
3. `f:\What_i_Made\New\sidrah_web\src\services\insightsApi.js` — new API wrapper (mirror `caseStudiesApi.js`).
4. `f:\What_i_Made\New\sidrah_web\src\hooks\useInsights.js` — fetch CMS insights and normalize to current card shape (mirror `useCaseStudies.js`).
5. `f:\What_i_Made\New\sidrah_web\src\components\sections\InsightsSection.jsx` — use `useInsights` and fall back to `insightsData.js`.
6. `f:\What_i_Made\New\sidrah_web\src\pages\InsightsPage.jsx` — new listing page.
7. `f:\What_i_Made\New\sidrah_web\src\pages\InsightDetailPage.jsx` — new detail page.
8. `f:\What_i_Made\New\sidrah_web\src\App.jsx` — add `/insights` and `/insights/:slug` routes.
9. `f:\What_i_Made\New\sidrah_web\src\components\insights\InsightCard.jsx` — wrap with `Link` if a slug route exists.
10. `f:\What_i_Made\New\sidrah_web\src\components\Header.jsx` / `Footer.jsx` — update `insights` links to use `/insights` route instead of `#insights` anchor when the page is ready.
11. `f:\What_i_Made\New\sidrah_web\src\hooks\useHeaderNavigation.js` — update fallback nav path from `target: 'insights'` to `path: '/insights'`.
12. `f:\What_i_Made\New\sidrah_web\src\config\seo.js` — keep `PAGES.insights` for the listing page; add dynamic per-article SEO in the detail page.

### 15.2 Preserving current design

- The existing `InsightCard` CSS classes (`insights-section`, `insights-grid`, `insight-card`, etc.) should remain unchanged.
- `InsightCard` currently renders `category`, `title`, and `excerpt`; the CMS payload can be normalized to the same shape via `getBilingual`.
- IntersectionObserver fade-in animation in `InsightsSection` is already decoupled from data source.
- Keep `insightsData.js` as a hardcoded fallback so the homepage still renders if the backend is unavailable.

### 15.3 Bilingual rendering

- Use the existing `getBilingual` helper for `title`, `excerpt`, `body`, `category`, `author.name`, and `seo`.
- Fallback to English when Arabic is missing, matching the existing CMS normalization pattern.

---

## 16. Routing and SEO Findings

### 16.1 Current state

- No `/insights` or `/insights/:slug` routes exist.
- Header and footer use `#insights` anchors that scroll to the homepage section.
- `PAGES.insights` in `f:\What_i_Made\New\sidrah_web\src\config\seo.js` is defined but never rendered because there is no route to render it.
- No dynamic SEO for individual articles.

### 16.2 Recommended minimum route architecture

```jsx
<Route path="/insights" element={<InsightsPage />} />
<Route path="/insights/:slug" element={<InsightDetailPage />} />
```

The detail page should:
- Fetch the article by slug from `/api/v1/insights/<slug>/`.
- Render `<SEO title={...} description={...} />` using the article's bilingual SEO fields (or fall back to title + excerpt).
- Return a 404 / Not Found page for unknown slugs (the backend API already returns 404).

---

## 17. Search and Filtering Decision

**Recommendation:** Implement only category filtering and sorting for the MVP listing page. Defer full-text search, pagination, and infinite scrolling.

Justification:
- There are only five articles today; pagination and infinite scroll are unnecessary overhead.
- The frontend utility `filterAndSortInsights(category, sortKey)` already exists and can be reused for the initial listing page.
- When the CMS has more content (e.g., > 20 articles), add backend `search` query parameter and pagination on the API, then update `useInsights` hook.

---

## 18. Risks and Gaps

| Risk | Evidence | Recommendation |
|------|----------|----------------|
| English-only content | `insightsData.js` has `language: 'en'` and no Arabic fields | Add `title_ar`, `excerpt_ar`, `body_ar`, `seo_title_ar`, `seo_description_ar` in the model and seed data; update frontend normalization |
| Placeholder images | All five cards use `/assets/insights/placeholder.png`, which does not exist in `public/` or `dist/assets/` | Upload real `MediaAsset` records and replace `coverImage` in seed data; add a frontend placeholder fallback |
| No article body | `body` field is absent everywhere | Add `body_en`/`body_ar` fields and build the detail page |
| No detail route | `App.jsx` has no `/insights/:slug` | Add React Router routes and a `InsightDetailPage` |
| No publish workflow | Only a static `featured` boolean exists in frontend | Implement `status` + `published_at` in backend and filter public APIs |
| No sanitization strategy | HTML body is planned | Use `bleach` on save or `DOMPurify` on render; document allowed tags |
| Duplicate category labels | Category constants are hardcoded in frontend; backend will store free text | Keep a canonical list in the model help_text or a small choices list to avoid duplicates |
| Author ambiguity | No author fields exist | Add `author_name`/`author_role`/`author_image` fields but keep them optional |
| SEO gaps | Per-article SEO is not rendered | Detail page must consume `seo.title`/`seo.description` from CMS |
| Media limitations | `MediaAsset` supports images but not external URLs well | Article `featured_image` should be a `MediaAsset` FK; external URL can be a separate `external_url` field |
| Overengineering risk | Could create separate `Blog`, `News`, `Insight` models | Use one `Article` model with `content_type` |
| Future Academy overlap | Training content may also need articles later | Keep `content_type` generic and add an `academy` or `resource` type later if needed |

---

## 19. Recommended Implementation Phases

### Phase 1 — Minimal backend app
- Create `apps.insights` with `models.py`, `apps.py`, and add to `INSTALLED_APPS`.
- Create migration.
- Register `Article` in Django Admin with the fieldsets and actions above.

### Phase 2 — Public API and seed
- Add `serializers.py`, `views.py`, `urls.py` for `/api/v1/insights/` and `/api/v1/insights/<slug>/`.
- Add `seed_insights.py` management command that mirrors the five articles in `insightsData.js`.
- Wire `path('api/v1/insights/', include('apps.insights.urls'))` in `config/urls.py`.

### Phase 3 — Frontend homepage integration
- Create `src/services/insightsApi.js` and `src/hooks/useInsights.js` using the CMS + fallback pattern.
- Update `InsightsSection` to use `useInsights({ show_on_homepage: true })` and fall back to `getFeaturedInsights(3)`.
- Add `public/assets/insights/placeholder.png` or rely on a fallback image.

### Phase 4 — Listing page
- Create `src/pages/InsightsPage.jsx` with category filter bar and sort dropdown.
- Add `/insights` route in `App.jsx`.
- Update header/footer fallback links to point to `/insights`.

### Phase 5 — Detail page
- Create `src/pages/InsightDetailPage.jsx` that fetches by slug and renders body, author, date, read time, and SEO.
- Add `/insights/:slug` route in `App.jsx`.
- Update `InsightCard` to wrap with `Link` to `/insights/:slug` when no `external_url` is set.

### Phase 6 — Rich text and enhancements (later)
- Evaluate `DOMPurify` + a lightweight Markdown or HTML editor.
- Add tags and category model if volume justifies it.
- Add authenticated CMS APIs when building the custom dashboard.

---

## 20. Lightweight Validation Checklist

- [ ] `apps.insights` is registered in `INSTALLED_APPS`.
- [ ] `python manage.py migrate` creates `insights_article` table successfully.
- [ ] `python manage.py seed_insights` runs idempotently (creates/updates the five articles without duplicates).
- [ ] `GET /api/v1/insights/` returns published articles only.
- [ ] `GET /api/v1/insights/<slug>/` returns the full article with body, author, and SEO.
- [ ] Draft and archived articles are excluded from public list and detail APIs (return 404).
- [ ] Articles with `published_at` in the future are excluded from public APIs.
- [ ] Ordering respects `display_order` then `published_at` descending.
- [ ] `?show_on_homepage=true` returns only homepage articles.
- [ ] `?is_featured=true` returns only featured articles.
- [ ] `?category=AI` filters by category.
- [ ] Homepage renders the CMS cards when the API is available.
- [ ] Homepage falls back to the hardcoded `insightsData.js` when the API is unavailable.
- [ ] Listing page renders all published articles with filters and sorting.
- [ ] Detail page renders the correct article for a known slug and SEO metadata changes.
- [ ] Unknown slugs return a 404 / Not Found page.
- [ ] Updating an article in Django Admin reflects on the frontend within one refresh (no cache delay during development).
- [ ] Django Admin publish/unpublish/archive actions work and immediately affect the public API.

---

## 21. CMS Readiness Score

**3/10**

- The frontend data layer and card component are already well-structured (6/10 for frontend readiness).
- The backend has reusable patterns but no content model yet (8/10 for infrastructure, 0/10 for content).
- There are no routes, no body content, no listing/detail pages, and no real images.
- The project is ready for a clean implementation of the phases above.

---

## 22. Final Investigation Verdict

The Insights section is currently a **hardcoded homepage component** with no backend support. Implementing a full CMS-ready insights/blog/articles system requires a new `apps.insights` Django app following the established `case_studies`/`services` patterns, plus two new React routes and pages. The recommended first step is a minimal, unified `Article` model with a `content_type` field, bilingual fields, a `MediaAsset` featured image, and a `draft/published/archived` workflow. This will let the existing five articles move into the CMS while preserving the current homepage design and enabling a future listing page and detail page without a second redesign.

No code was modified during this investigation. No migrations were created. No tests were run except short Django inspection commands.
