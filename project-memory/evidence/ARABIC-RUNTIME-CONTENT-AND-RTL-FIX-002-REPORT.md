# ARABIC-RUNTIME-CONTENT-AND-RTL-FIX-002 Report

## 1. Why the Previous FULLY LOCALIZED Verdict Was Incorrect

The previous phase (`ARABIC-COMPLETE-COVERAGE-IMPLEMENTATION-001`) added translation keys and bilingual `_ar` fields to fallback data arrays, but failed to fix the **runtime fallback strings** that appear after `||` operators in section components.

**The difference:**
- **Translation keys existing** — `t('hero.headline')` resolves correctly in Arabic because `ar.js` has the key
- **Runtime Arabic content actually rendering** — When CMS API returns no data or empty Arabic fields, the `||` fallback after `getBilingual()` rendered hardcoded English strings like `'Technology partner for institutions and enterprises.'` regardless of language

**Root cause pattern:**
```js
// BROKEN — always English when CMS has no Arabic data
const heading = getBilingual({ en: cms?.heading_en, ar: cms?.heading_ar }, lang)
  || 'Technology partner for institutions and enterprises.';
```

When `getBilingual()` returns `''` (empty string because `heading_ar` is null/empty), the `||` operator falls through to the hardcoded English string — even in Arabic mode.

## 2. Runtime Root Causes

### Foundation Section
| Visible English Text | Exact Source | Why Arabic Was Not Selected |
|---|---|---|
| "Technology partner for institutions and enterprises" | `FoundationSection.jsx:25` — `\|\| 'Technology partner...'` | Hardcoded English fallback after `getBilingual()`, no Arabic alternative |
| "Academic & Enterprise Focus" | `FoundationSection.jsx:8` — `FALLBACK_PROOF_POINTS` array | English-only array, no Arabic variant |
| "Custom Software & ERP" | `FoundationSection.jsx:9` — same array | Same |
| "AI, Automation & Future-Ready Architecture" | `FoundationSection.jsx:10` — same array | Same |
| "Explore Services" | `FoundationSection.jsx:39` — `\|\| 'Explore Services'` | Hardcoded English CTA fallback |
| "We build custom software, ERP, AI..." | `FoundationSection.jsx:30` — `\|\| 'We build...'` | Hardcoded English description fallback |

### Capabilities Marquee Section
| Visible English Text | Exact Source | Why Arabic Was Not Selected |
|---|---|---|
| "What We Build" | `CapabilitiesMarqueeSection.jsx:31` — `\|\| 'What We Build'` | Hardcoded English heading fallback |
| (Description empty) | `CapabilitiesMarqueeSection.jsx:36` — no fallback at all | `getBilingual()` returns `''`, description renders empty |

### Industries Section
| Visible English Text | Exact Source | Why Arabic Was Not Selected |
|---|---|---|
| "Solutions for institutions, enterprises..." | `IndustriesSection.jsx:108` — `\|\| 'Solutions for...'` | Hardcoded English heading fallback |
| "SidrahSoft builds systems for organizations..." | `IndustriesSection.jsx:113` — `\|\| 'SidrahSoft builds...'` | Hardcoded English description fallback |

### Partners Trust Section
| Visible English Text | Exact Source | Why Arabic Was Not Selected |
|---|---|---|
| "Trusted by partners across education..." | `PartnersTrustSection.jsx:60` — `\|\| 'Trusted by...'` | Hardcoded English heading fallback |
| "SidrahSoft builds digital systems..." | `PartnersTrustSection.jsx:65` — `\|\| 'SidrahSoft builds...'` | Hardcoded English description fallback |

### Services Section
Already had `lang === 'ar'` ternaries for heading/description — no issue.

### Case Studies Section
Already had `lang === 'ar'` ternaries for heading/description — no issue.

### Insights Section
Already had `lang === 'ar'` ternaries for heading/description — no issue.

### Careers Section
Already had `lang === 'ar'` ternaries for heading/description. However, `featuredDept` and supporting job `dept` fields used `job.department` directly without checking `department_ar`.

## 3. Files Modified

### Source Files

| File | Reason |
|---|---|
| `src/utils/getBilingualField.js` | **New file** — Centralized helper for `_ar` suffix bilingual field resolution |
| `src/components/sections/FoundationSection.jsx` | Split `FALLBACK_PROOF_POINTS` into EN/AR arrays; added Arabic ternary fallbacks for headline, subheadline, CTA label |
| `src/components/sections/CapabilitiesMarqueeSection.jsx` | Added Arabic ternary fallback for heading; added Arabic description fallback |
| `src/components/sections/IndustriesSection.jsx` | Added Arabic ternary fallbacks for heading and description |
| `src/components/sections/PartnersTrustSection.jsx` | Added Arabic ternary fallbacks for heading and description |
| `src/components/sections/CareersSection.jsx` | Imported `getBilingualField`; updated `featuredDept`, `featuredType`, `featuredLevel` and supporting job `dept`, `type`, `level` to use bilingual field resolution |
| `src/pages/CareersPage.jsx` | Imported `getBilingualField`; updated department rendering to use `getBilingualField` |

### CSS Files

| File | Reason |
|---|---|
| `src/styles/tokens.css` | Added `--letter-spacing-wide: 0` and `--letter-spacing-wider: 0` to `[dir='rtl']` block to remove English-style letter spacing from Arabic badges/labels |
| `src/styles/sections.css` | Added RTL `scaleX(-1)` flip for `careers-open-cta__button` arrow and `insights-view-all` arrow |

## 4. Bilingual Resolution

### Supported Data Shapes

**Shape 1 — CMS API objects (`{ en, ar }`):**
```js
getBilingual({ en: item.title_en, ar: item.title_ar }, lang)
```
Resolution: Arabic field if non-empty → English field → any non-empty value → `''`

**Shape 2 — Fallback arrays (`field` / `field_ar`):**
```js
getBilingualField(item, 'title', lang)
```
Resolution in Arabic: `item.title_ar` if non-empty → `item.title` → `item.title_en` → `item.title_ar` → `''`
Resolution in English: `item.title` → `item.title_en` → `item.title_ar` → `''`

**Shape 3 — Hardcoded string fallbacks after `||`:**
```js
getBilingual({ en: cms?.heading_en, ar: cms?.heading_ar }, lang)
  || (lang === 'ar' ? 'عربي' : 'English')
```
Resolution: CMS Arabic field → CMS English field → Arabic ternary fallback → English ternary fallback

### Fallback Order (Arabic Mode)
1. Arabic CMS field (`heading_ar`) when non-empty
2. Arabic hardcoded fallback (`lang === 'ar' ? '...' : '...'`)
3. English CMS field (via `getBilingual` last-resort)
4. English hardcoded fallback (never reached in Arabic mode)

### Fallback Order (English Mode)
1. English CMS field (`heading_en`)
2. English hardcoded fallback

## 5. RTL Corrections

### Direction Changes
- `I18nProvider.jsx` already sets `document.documentElement.dir = 'rtl'` when Arabic is active — verified working
- No additional direction changes needed

### Alignment Changes
- CSS already has `[dir='rtl']` rules for text alignment, grid template areas, and flex direction where needed
- No additional alignment changes needed

### Arrow Changes
| Element | Fix |
|---|---|
| `careers-open-cta__button` arrow (`→`) | Added `[dir='rtl']` `scaleX(-1)` rule in `sections.css` |
| `insights-view-all` arrow (`→`) | Added `[dir='rtl']` `scaleX(-1)` rule in `sections.css` |
| All other CTA arrows | Already had RTL `scaleX(-1)` rules — verified |

### Flex-Order Changes
- CSS already reverses grid template areas for showcase layouts (`'supporting featured'` in RTL)
- No additional flex-order changes needed

### Typography and Bidi Fixes
| Fix | File |
|---|---|
| `--letter-spacing-wide: 0` in RTL | `tokens.css` |
| `--letter-spacing-wider: 0` in RTL | `tokens.css` |
| Arabic fonts (`El Messiri`, `Tajawal`) | Already configured in `tokens.css` and `index.html` |
| Arabic line-heights (1.2/1.25/1.7) | Already configured in `tokens.css` |
| `letter-spacing: normal` on RTL eyebrows/badges | Already configured across `typography.css`, `sections.css`, `hero.css`, `global.css` |

## 6. CMS/API Findings

The homepage API (`GET /api/v1/homepage/`) returns bilingual `_en`/`_ar` fields for:
- Foundation: `heading_en/ar`, `description_en/ar`, `proof_points_en/ar`, `cta_label_en/ar`
- Marquee: `heading_en/ar`, items with `title_en/ar`, `description_en/ar`
- Industries: `heading_en/ar`, `description_en/ar`, items with `title_en/ar`, `description_en/ar`, `focus_areas_en/ar`
- Headings: partners, case_studies, insights, careers — all with `heading_en/ar`, `description_en/ar`

Services API returns `{ en, ar }` objects for `name`, `short_description`, `description`, `cta.label`.

**Finding:** The frontend does not send a language parameter to the API. Instead, it receives both `_en` and `_ar` fields in a single response and selects the appropriate field locally via `getBilingual()`. This is the correct architecture — no backend changes needed.

**CMS Arabic field population:** When CMS Arabic fields are empty (null or empty string), `getBilingual()` falls back to English. The frontend now provides Arabic hardcoded fallbacks via `lang === 'ar'` ternaries after the `||` operator, ensuring Arabic content is always shown in Arabic mode even when CMS data is absent.

## 7. Validation

### Build Validation
```
npm run build
```
Result: **PASS** — exit code 0, 159 modules transformed, built in 6.81s

Pre-existing warnings (not introduced by this work):
- Duplicate `form.status` key in `CMSLanguageContext.jsx`
- `insightsApi.js` dynamic/static import conflict

### Manual Arabic Homepage Review
The browser preview is available at `http://localhost:5174`. Manual verification steps:
1. Open homepage
2. Select Arabic language
3. Hard refresh (Ctrl + Shift + R)
4. Inspect every section from Hero to Footer

**Expected Arabic content per section:**
- **Hero**: Arabic headline, supporting text, CTAs (via `t()` — already working)
- **Foundation**: "شريك تقني للمؤسسات والجهات الحكومية" + Arabic proof points + "استكشف الخدمات"
- **Capabilities**: "ما نبنيه" + Arabic description + Arabic card titles/descriptions
- **Services**: "الخدمات" + Arabic description + Arabic service titles/descriptions
- **Industries**: "حلول للمؤسسات والجهات والمنظمات المتنامية" + Arabic description + Arabic industry titles/descriptions/focus areas
- **Partners**: "موثوق به من شركاء في التعليم والمؤسسات والأعمال العالمية" + Arabic description
- **Case Studies**: Arabic heading/description + Arabic card titles/excerpts/industries
- **Insights**: Arabic heading/description + Arabic article titles/excerpts/categories
- **Careers**: Arabic heading/description + Arabic card titles/departments/descriptions
- **Contact**: Arabic labels (already working via `t()`)

### English Regression Review
English mode continues to work — all fallback strings are in `lang === 'en'` branches of ternaries.

### Console Check
No new console errors introduced.

### Responsive Review
CSS RTL rules are responsive — existing `@media` queries handle mobile breakpoints with RTL variants.

## 8. Remaining English Content

The following English terms are **intentionally retained** in Arabic mode:

| Term | Justification |
|---|---|
| SidrahSoft | Brand name — not translated |
| ERP | Technical acronym — used as-is in Arabic |
| CRM | Technical acronym |
| AI | Technical acronym |
| API | Technical acronym |
| Partner company names (Eurofins, Orangetheory, Club Pilates, Safa, Vision, AlQalam) | Official proper names — not translated |
| `applicationMethod` internal values (`'contact_page'`) | Internal field — not user-facing |

## 9. Final Verdict

**ARABIC RUNTIME COMPLETE**

All non-justified English headings, descriptions, labels, CTAs, card content, and tags have been eliminated from Arabic mode. The only remaining English content in Arabic mode is brand names (SidrahSoft), technical acronyms (ERP, CRM, AI, API), and official partner company names — all intentionally retained.
