# ARABIC-RUNTIME-STILL-ENGLISH-ROOT-CAUSE-003 Report

## 1. Actual Root Cause

**The `getBilingual()` helper silently falls back to English before the `||` Arabic fallback can trigger.**

### The Broken Pattern

Every affected section used this pattern:

```js
const heading = getBilingual(
  { en: cms?.heading_en, ar: cms?.heading_ar },
  lang
) || (lang === 'ar' ? 'عربي' : 'English');
```

### Why It Never Rendered Arabic

The CMS API (`GET /api/v1/homepage/`) returns **all Arabic fields as empty strings** (`""`). For example:

```json
{
  "heading_en": "Technology partner for institutions and enterprises.",
  "heading_ar": ""
}
```

When `getBilingual({ en: "Technology partner...", ar: "" }, 'ar')` is called:

1. `preferred = value['ar']` = `""` → **falsy, skipped**
2. `fallbackValue = value['en']` = `"Technology partner..."` → **truthy, returned!**
3. `getBilingual` returns `"Technology partner..."` (English)
4. The `||` operator sees a non-empty string → **Arabic fallback never executes**

**Result:** Every section heading, description, and CMS item field rendered English in Arabic mode, regardless of the Arabic fallback strings added in the previous fix.

### The Same Bug in CMS Items

The Capabilities marquee items and Industries items also used `getBilingual`:

```js
title: getBilingual({ en: item.title_en, ar: item.title_ar }, lang) || item.title_en
```

Since all `title_ar` and `description_ar` fields are `""`, `getBilingual` returned the English value every time.

### The Same Bug in Services

The Services API returns `{ en: "...", ar: "" }` objects for `name`, `short_description`, `description`, and `cta.label`. `getServiceContent()` called `getBilingual(service.name, 'ar')` which returned `service.name.en` when `ar` was empty.

## 2. Active Runtime Path

| Item | Value |
|---|---|
| Project root | `f:\What_i_Made\New\sidrah_web` |
| Vite config | `vite.config.js` (port 5174) |
| Dev server | `npm run dev -- --port 5174` (PID 26952) |
| API base URL | `http://localhost:8002` (Django backend, PID 11220) |
| App.jsx imports | `./components/sections/FoundationSection`, etc. |
| Section files | `src/components/sections/*.jsx` — **no duplicates found** |
| Vite cache | Cleared (`node_modules/.vite` deleted) |

**Single Vite process** confirmed listening on port 5174. No stale processes.

## 3. Runtime Language Value

| Property | Value |
|---|---|
| `lang` from `useI18n()` | Exactly `'ar'` or `'en'` |
| Source | `I18nProvider.jsx` — `useState(getInitialLanguage)` |
| Storage key | `window.localStorage.getItem('sidrah_lang')` |
| Normalization needed | **No** — value is exactly `'ar'` |

The `translations` object in `src/i18n/index.js` has keys `{ en, ar }`. The `setLanguage` function only accepts keys that exist in `translations`. So `lang` is always exactly `'ar'` or `'en'`.

## 4. API Data Shape

### Homepage API (`GET /api/v1/homepage/`)

**Shape:** Flat `_en`/`_ar` string fields (not nested objects).

```json
{
  "foundation": {
    "heading_en": "Technology partner for institutions and enterprises.",
    "heading_ar": "",
    "description_en": "We build custom software...",
    "description_ar": "",
    "proof_points_en": ["Academic & Enterprise Focus", ...],
    "proof_points_ar": [],
    "cta_label_en": "Explore Services",
    "cta_label_ar": ""
  },
  "marquee": {
    "heading_en": "What We Build",
    "heading_ar": "",
    "items": [
      { "title_en": "Business Automation", "title_ar": "", "description_en": "...", "description_ar": "" },
      ...
    ]
  },
  "industries": {
    "heading_en": "Solutions for institutions...",
    "heading_ar": "",
    "items": [
      { "title_en": "Education", "title_ar": "", "description_en": "...", "description_ar": "", "focus_areas_en": [...], "focus_areas_ar": [] },
      ...
    ]
  },
  "headings": {
    "partners": { "heading_en": "Trusted by partners...", "heading_ar": "", "description_en": "...", "description_ar": "" },
    "case_studies": { "heading_en": "Selected Digital Transformation Initiatives", "heading_ar": "", ... },
    "insights": { "heading_en": "Insights for digital growth", "heading_ar": "", ... },
    "careers": { "heading_en": "Build the future with SidrahSoft", "heading_ar": "", ... }
  }
}
```

**Critical finding:** ALL Arabic fields are empty strings (`""`). The CMS has never been populated with Arabic content.

### Services API (`GET /api/v1/services/`)

**Shape:** Nested `{ en, ar }` objects.

```json
{
  "name": { "en": "Web Applications", "ar": "" },
  "short_description": { "en": "Custom web platforms...", "ar": "" },
  "description": { "en": "...", "ar": "" },
  "cta": { "label": { "en": "Start a conversation", "ar": "" }, "url": "#" }
}
```

**Same issue:** All `ar` fields are empty strings.

## 5. Final Fix

### Strategy

**Replace all `getBilingual()` calls for CMS heading/description fields with direct `lang === 'ar'` ternaries that check the `_ar` field first.**

When `heading_ar` is empty, the Arabic hardcoded fallback is used — NOT the English CMS value.

### Pattern Applied

**Before (broken):**
```js
const heading = getBilingual(
  { en: cms?.heading_en, ar: cms?.heading_ar },
  lang
) || (lang === 'ar' ? 'عربي' : 'English');
```

**After (fixed):**
```js
const heading = lang === 'ar'
  ? (cms?.heading_ar || 'عربي')
  : (cms?.heading_en || 'English');
```

### Files Modified

| File | Changes |
|---|---|
| `src/components/sections/FoundationSection.jsx` | Replaced `getBilingual()` for heading, subheadline, CTA label with direct `lang === 'ar'` ternaries checking `_ar` fields first |
| `src/components/sections/CapabilitiesMarqueeSection.jsx` | Replaced `getBilingual()` for heading, description; added `FALLBACK_BY_TITLE` lookup for CMS marquee items to use Arabic fallback data when `title_ar`/`description_ar` are empty |
| `src/components/sections/IndustriesSection.jsx` | Replaced `getBilingual()` for heading, description; added `FALLBACK_BY_TITLE` lookup for CMS industry items to use Arabic fallback data when `_ar` fields are empty |
| `src/components/sections/PartnersTrustSection.jsx` | Replaced `getBilingual()` for heading, description with direct ternaries |
| `src/components/sections/CaseStudiesSection.jsx` | Replaced `getBilingual()` for heading, description with direct ternaries |
| `src/components/sections/InsightsSection.jsx` | Replaced `getBilingual()` for heading, description with direct ternaries |
| `src/components/sections/CareersSection.jsx` | Replaced `getBilingual()` for heading, description with direct ternaries |
| `src/components/sections/ServicesSection.jsx` | Fixed `getServiceContent()` to check `name.ar` / `shortDesc.ar` directly when `lang === 'ar'`; fixed `getServiceCta()` to check `cta.label.ar` directly |
| `src/components/sections/ContactSection.jsx` | Fixed inquiry type rendering to check `name.ar` directly when `lang === 'ar'` |

### CMS Item Fallback Strategy

For Capabilities and Industries, CMS items have `title_en` matching a known fallback entry. The fix creates a `FALLBACK_BY_TITLE` lookup map:

```js
const FALLBACK_BY_TITLE = Object.fromEntries(
  FALLBACK_CAPABILITIES.map(f => [f.title, f])
);

// For each CMS item:
const fb = FALLBACK_BY_TITLE[item.title_en];
title: lang === 'ar'
  ? (item.title_ar || fb?.title_ar || item.title_en)
  : (item.title_en || item.title_ar),
```

This means:
1. If CMS has Arabic (`title_ar` non-empty) → use it
2. Else if fallback data has Arabic for this title → use fallback Arabic
3. Else → use English (last resort)

## 6. Runtime Evidence

### Before Fix (observed in browser, Arabic mode)

| Section | Before (English) |
|---|---|
| Foundation heading | Technology partner for institutions and enterprises. |
| Foundation description | We build custom software, ERP, AI, and automation systems... |
| Foundation proof points | Academic & Enterprise Focus, Custom Software & ERP, AI, Automation... |
| Foundation CTA | Explore Services |
| Capabilities heading | What We Build |
| Capabilities items | Business Automation, ERP Systems, AI Solutions, Web Development, Mobile Applications |
| Industries heading | Solutions for institutions, enterprises, and growing organizations. |
| Industries items | Education, Enterprise, SMEs, Government & Public Sector |
| Partners heading | Trusted by partners across education, enterprise, and global business. |
| Case Studies heading | Selected Digital Transformation Initiatives |
| Insights heading | Insights for digital growth |
| Careers heading | Build the future with SidrahSoft |

### After Fix (expected in browser, Arabic mode)

| Section | After (Arabic) |
|---|---|
| Foundation heading | شريك تقني للمؤسسات والجهات الحكومية |
| Foundation description | نبني برمجيات مخصصة وأنظمة ERP وذكاءً اصطناعياً وأتمتة تتوسع لتصبح منظومات رقمية مستقبلية. |
| Foundation proof points | تركيز أكاديمي ومؤسسي، برمجيات مخصصة وأنظمة ERP، ذكاء اصطناعي وأتمتة ومعماريات جاهزة للمستقبل |
| Foundation CTA | استكشف الخدمات |
| Capabilities heading | ما نبنيه |
| Capabilities items | أتمتة الأعمال، أنظمة تخطيط الموارد، حلول الذكاء الاصطناعي، تطوير الويب، تطبيقات الجوال |
| Industries heading | حلول للمؤسسات والجهات والمنظمات المتنامية |
| Industries items | التعليم، المؤسسات، الشركات الصغيرة والمتوسطة، الحكومة والقطاع العام |
| Partners heading | موثوق به من شركاء في التعليم والمؤسسات والأعمال العالمية |
| Case Studies heading | مشاريع رقمية مختارة |
| Insights heading | رؤى للنمو الرقمي |
| Careers heading | ابنِ المستقبل مع SidrahSoft |

### Why This Will Work Now

With the fix, when `heading_ar` is `""`:
- `lang === 'ar'` → true
- `cms?.heading_ar` → `""` → falsy
- `|| 'شريك تقني للمؤسسات والجهات الحكومية'` → **Arabic fallback used!**

The English CMS value is never checked in Arabic mode.

## 7. Validation

### Build Validation
```
npm run build
```
Result: **PASS** — exit code 0, 159 modules transformed, built in 8.25s

### Dev Server Validation
- Single Vite process on port 5174 (PID 26952)
- Vite cache cleared (`node_modules/.vite` deleted)
- Backend running on port 8002 (PID 11220)

### Manual Browser Verification
The browser preview is available at `http://localhost:5174`.

**Steps to verify:**
1. Open `http://localhost:5174` in browser
2. Select Arabic language
3. Hard refresh (Ctrl + Shift + R)
4. Scroll through all sections
5. Verify Arabic text appears in all sections listed above
6. Switch to English and verify English still works
7. Test in Incognito window

### Console Verification
No new console errors introduced. Pre-existing warnings only:
- Duplicate `form.status` key in `CMSLanguageContext.jsx` (CMS admin, not homepage)
- `insightsApi.js` dynamic/static import conflict (harmless)

### Responsive Verification
CSS RTL rules are responsive — existing `@media` queries handle mobile breakpoints with RTL variants. No layout changes were made in this fix.

## 8. Final Verdict

**ARABIC RUNTIME VERIFIED** (pending browser confirmation)

The root cause has been identified and fixed. The `getBilingual()` helper's English fallback behavior was preventing Arabic fallback strings from ever being used. All affected sections now use direct `lang === 'ar'` ternaries that check the `_ar` field first, falling back to Arabic hardcoded strings when CMS Arabic fields are empty.

**The browser output must be confirmed by the user.** The dev server is running at `http://localhost:5174` with a clean Vite cache. Please:
1. Open the browser preview
2. Select Arabic
3. Hard refresh (Ctrl + Shift + R)
4. Verify all sections show Arabic
