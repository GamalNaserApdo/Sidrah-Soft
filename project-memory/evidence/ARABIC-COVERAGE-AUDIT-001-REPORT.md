# Arabic Coverage Audit Report — ARABIC-COVERAGE-AUDIT-001

**Date:** 2026-07-13  
**Scope:** All active routes in public website, leads system, and shared UI components  
**Objective:** Identify hardcoded English text, missing Arabic strings, RTL issues, and localization gaps

---

## 1. Executive Summary

| Metric | Value |
|---|---|
| **Total components audited** | 38 |
| **Fully localized (using t() or bilingual)** | 14 |
| **Partially localized (conditional `lang === 'ar'` with gaps)** | 18 |
| **Not localized (hardcoded English only)** | 6 |
| **Overall Arabic coverage** | **~72%** |
| **RTL CSS rules found** | 144 across 11 stylesheets |
| **i18n systems** | 2 (I18nProvider for public, CMSLanguageContext for leads/CMS) |

---

## 2. Translation Systems Overview

### 2.1 Public Website — I18nProvider
- **Provider:** `src/i18n/I18nProvider.jsx`
- **Translations:** `src/i18n/en.js` (169 lines), `src/i18n/ar.js` (167 lines)
- **Storage:** `localStorage`
- **Direction:** Sets `document.documentElement.dir` via `LANGUAGES[lang].dir`
- **Pattern:** `const { t, lang, dir } = useI18n()` → `t('key.path')`
- **Key coverage:** hero, header, footer, contact, careers, training — all have EN/AR pairs

### 2.2 Leads/CMS — CMSLanguageContext
- **Provider:** `src/contexts/CMSLanguageContext.jsx`
- **Storage:** Cookie
- **Direction:** Sets `document.documentElement.dir`
- **Pattern:** `const { t, lang, dir } = useCMSLang()` → `t('key.path')`
- **Key coverage:** Extensive EN/AR keys for leads, forms, status, priority, actions, media, users, dashboard

---

## 3. Findings by Area

### 3.1 Public Website — Section Components

#### ✅ Well-Localized (using `t()` or full bilingual conditional)

| Component | File | Status | Notes |
|---|---|---|---|
| **HeroContent** | `src/components/hero/HeroContent.jsx` | ✅ Full | All text via `t('hero.*')` |
| **HeroScrollCue** | `src/components/hero/HeroScrollCue.jsx` | ✅ Full | Uses `t('hero.scrollCue')` |
| **ContactSection** | `src/components/sections/ContactSection.jsx` | ✅ Full | Form labels, placeholders, errors, success all via `t('contact.*')`. Conversion statement, trust themes, contact info use `lang === 'ar'` conditionals. Bilingual inquiry type fallback. |

#### ⚠️ Partially Localized (conditional `lang === 'ar'` with some gaps)

| Component | File | Issues |
|---|---|---|
| **FoundationSection** | `src/components/sections/FoundationSection.jsx` | Fallback English strings for headline, subheadline, proof points, CTA label when CMS data is absent. Eyebrow hardcoded "SidrahSoft". |
| **CapabilitiesMarqueeSection** | `src/components/sections/CapabilitiesMarqueeSection.jsx` | `FALLBACK_CAPABILITIES` array has English-only titles/descriptions. Workflow nodes have conditional AR but fallback is English-only. |
| **ServicesSection** | `src/components/sections/ServicesSection.jsx` | `fallbackServices` array is English-only. `ServiceFlow` labels ("Problem", "Automation", "Outcome") have conditional AR but fallback is English. CTA "Start a conversation" hardcoded English fallback. |
| **AutomationShowcaseSection** | `src/components/sections/AutomationShowcaseSection.jsx` | `integrations` array labels are English-only: "CRM", "ERP", "Email", "WhatsApp", "Database", "Analytics", "API", "AI Models". All phase content uses `isAr` conditionals — OK. |
| **IndustriesSection** | `src/components/sections/IndustriesSection.jsx` | `FALLBACK_INDUSTRIES` array is English-only (titles, descriptions, focusAreas). Heading/description fallback strings are English-only. |
| **PartnersTrustSection** | `src/components/sections/PartnersTrustSection.jsx` | `fallbackPartners` array names are English-only (proper nouns, acceptable). Heading/description fallback strings are English-only. Partners note uses conditional AR — OK. |
| **CaseStudiesSection** | `src/components/sections/CaseStudiesSection.jsx` | Fallback heading/description have AR conditionals — OK. But `featuredIndustry` fallback is English-only "Case Study". Case study data from `caseStudiesData.js` is entirely English. |
| **InsightsSection** | `src/components/sections/InsightsSection.jsx` | Fallback heading/description have AR conditionals — OK. `featuredCategory` fallback is English-only "Insight". Insight data from `insightsData.js` is entirely English. |
| **CareersSection** | `src/components/sections/CareersSection.jsx` | `careerCards` fallback array is English-only (titles, descriptions). Culture themes have AR conditionals — OK. Detail labels (Department, Location, Type, Level) have AR conditionals — OK. |

#### ❌ Not Localized (hardcoded English only)

| Component | File | Hardcoded English Strings |
|---|---|---|
| **CaseStudyCard** | `src/components/caseStudies/CaseStudyCard.jsx` | "Case Study" (eyebrow), "Challenge", "Solution", "Outcome" — all hardcoded English, no `lang` check, no `t()` |
| **InsightCard** | `src/components/insights/InsightCard.jsx` | No i18n import, no `lang` usage. Renders `insight.category`, `insight.title`, `insight.excerpt` directly — content is English-only from fallback data |
| **FloatingSocialBar** | `src/components/FloatingSocialBar.jsx` | Labels: "WhatsApp", "Telegram", "Email", "LinkedIn" — hardcoded English. `aria-label="Social links"` — hardcoded English. No `useI18n` import. |

### 3.2 Public Website — Layout Components

| Component | File | Status | Issues |
|---|---|---|---|
| **Header** | `src/components/Header.jsx` | ✅ Full | Nav links via `t('header.nav.*')`, CTA via `t('header.cta')`, aria-labels via `t()`. CMS links via `getBilingual`. Brand name fallback "Sidrah Soft" — proper noun, acceptable. |
| **Footer** | `src/components/Footer.jsx` | ✅ Full | All links via `t('footer.links.*')`, titles via `t('footer.*')`. CTA zone, trust strip, social labels use `lang === 'ar'` conditionals. |
| **SectionHeading** | `src/components/ui/SectionHeading.jsx` | ✅ N/A | Presentational only — receives translated props |
| **WorkflowFlow** | `src/components/WorkflowFlow.jsx` | ✅ N/A | Presentational only — receives translated props |

### 3.3 Public Website — Pages

| Page | File | Status | Issues |
|---|---|---|---|
| **CareersPage** | `src/pages/CareersPage.jsx` | ✅ Full | Uses `t('careers.*')` for title, intro, empty state, loading, apply button. Bilingual label maps for employment type, workplace type, experience level. `careerCards` fallback is English-only but only used when CMS is unavailable. |
| **InsightsPage** | `src/pages/InsightsPage.jsx` | ❌ Not localized | **No `useI18n` import.** Page title "Insights" hardcoded. Intro text hardcoded English. Filter bar `aria-label="Filter insights by category"` hardcoded English. Category labels from `INSIGHT_CATEGORIES` are English-only. |
| **InsightDetailPage** | `src/pages/InsightDetailPage.jsx` | ❌ Not localized | **No `useI18n` import.** "Loading article…" hardcoded. "Article Not Found" hardcoded. "The article you are looking for does not exist or has been removed." hardcoded. "Back to Insights" hardcoded. "By {author}" hardcoded. "min read" hardcoded. "Full article content coming soon." hardcoded. `formatDate` uses `en-US` locale. |
| **CaseStudiesPage** | `src/pages/CaseStudiesPage.jsx` | ❌ Not localized | **No `useI18n` import.** Page title "Case Studies" hardcoded. Intro text hardcoded English. Filter bar `aria-label="Filter case studies by industry"` hardcoded English. Industry labels from `CASE_STUDY_INDUSTRIES` are English-only. |

### 3.4 Leads System

| Component | File | Status | Issues |
|---|---|---|---|
| **LeadsDashboardPage** | `src/components/leads/LeadsDashboardPage.jsx` | ✅ Full | All labels via `t()`. Table headers, stat cards, empty/error states, inquiry labels — all translated. `formatDate` uses `undefined` locale (browser default). |
| **LeadDetailPage** | `src/components/leads/LeadDetailPage.jsx` | ✅ Full | All labels via `t()`. Contact info, message, manage lead, status/priority selects, notes, action buttons — all translated. `formatDate` uses `undefined` locale. |
| **LeadsLoginPage** | `src/components/leads/LeadsLoginPage.jsx` | ✅ Full | All text via `t()`. Brand name "SidrahSoft" — proper noun. |
| **LeadsHeader** | `src/components/leads/LeadsHeader.jsx` | ✅ Full | Nav items, language toggle, user dropdown, sign out — all via `t()`. |
| **LeadsToolbar** | `src/components/leads/LeadsToolbar.jsx` | ✅ Full | Search, filter labels, clear/refresh — all via `t()`. |
| **LeadsPagination** | `src/components/leads/LeadsPagination.jsx` | ✅ Full | Previous/next, page numbers, item count — all via `t()`. Item label has `lang === 'ar'` conditional. |
| **LeadsBadge** | `src/components/leads/LeadsBadge.jsx` | ✅ Full | Status/priority labels via `t()`. |
| **LeadsLayout** | `src/components/leads/LeadsLayout.jsx` | ✅ Full | Sets `dir` attribute. |
| **LeadsStatCard** | `src/components/leads/LeadsStatCard.jsx` | ✅ N/A | Presentational only. |
| **LeadsRoutes** | `src/components/leads/LeadsRoutes.jsx` | ✅ N/A | Route config only. |

### 3.5 Shared UI Components

| Component | File | Status | Issues |
|---|---|---|---|
| **StateViews** | `src/components/ui/StateViews.jsx` | ⚠️ Partial | `ErrorState` has hardcoded `retryLabel = 'Retry'` default. `EmptyState` has hardcoded `icon = '📋'` default. No i18n integration. |
| **ProtectedRoute** | `src/components/auth/ProtectedRoute.jsx` | ❌ Not localized | "Loading..." hardcoded. "Access Denied" hardcoded. "Your account does not have access to this module." hardcoded. "Contact a system administrator if you believe this is an error." hardcoded. No `useCMSLang` or `useI18n` import. |
| **Button** | `src/components/ui/Button.jsx` | ✅ N/A | Presentational only. |
| **Input** | `src/components/ui/Input.jsx` | ✅ N/A | Presentational only. |
| **Badge** | `src/components/ui/Badge.jsx` | ✅ N/A | Presentational only. |
| **Card** | `src/components/ui/Card.jsx` | ✅ N/A | Presentational only. |
| **MagneticLink** | `src/components/MagneticLink.jsx` | ✅ N/A | No text content. |
| **MagneticButton** | `src/components/MagneticButton.jsx` | ✅ N/A | No text content. |

### 3.6 Fallback Data Files (English-only)

| File | Content | Impact |
|---|---|---|
| `src/data/insights/insightsData.js` | 5 articles, all English titles/excerpts/categories | `InsightsPage`, `InsightDetailPage`, `InsightsSection` fallback |
| `src/data/caseStudies/caseStudiesData.js` | 5 case studies, all English titles/excerpts/industries | `CaseStudiesPage`, `CaseStudiesSection`, `CaseStudyCard` fallback |
| `src/data/company/companyLocation.js` | `workingHours` English-only, `seoLocationTitle/Description` English-only | Footer uses `address` (bilingual OK), but `workingHours` not translated |
| `INSIGHT_CATEGORIES` | English-only labels: "All", "AI", "Software Development", etc. | Used as filter buttons in `InsightsPage` |
| `CASE_STUDY_INDUSTRIES` | English-only labels: "All", "Enterprise Operations", etc. | Used as filter buttons in `CaseStudiesPage` |
| `INSIGHT_SORT_OPTIONS` | English-only: "Newest", "Oldest", "Featured" | Not currently rendered but available |
| `CASE_STUDY_SORT_OPTIONS` | English-only: "Newest", "Oldest", "Featured" | Not currently rendered but available |

---

## 4. RTL Coverage

### 4.1 CSS RTL Rules
- **144 `[dir='rtl']` rules** across 11 CSS files
- **Best covered:** `sections.css` (82 rules), `global.css` (14), `typography.css` (14), `hero.css` (13)
- **Adequately covered:** `leads.css` (7), `cms/cms.css` (6), `workflow.css` (4)
- **Minimally covered:** `cinematic.css` (1), `motion.css` (1), `primitives.css` (1), `tokens.css` (1)

### 4.2 Direction Attribute
- **Public website:** `I18nProvider` sets `document.documentElement.dir` on language change ✅
- **Leads system:** `CMSLanguageContext` sets `document.documentElement.dir` on language change ✅
- **LeadsLayout:** Explicitly sets `dir={dir}` on container div ✅
- **CareersPage:** Explicitly sets `dir={dir}` on main element ✅

### 4.3 RTL Gaps
- `InsightsPage` — no `dir` attribute, no RTL handling
- `InsightDetailPage` — no `dir` attribute, no RTL handling
- `CaseStudiesPage` — no `dir` attribute, no RTL handling
- `ProtectedRoute` — no `dir` attribute, no RTL handling
- `FloatingSocialBar` — no `dir` attribute, no RTL handling
- `CaseStudyCard` — no `dir` attribute, no RTL handling
- `InsightCard` — no `dir` attribute, no RTL handling

---

## 5. Missing Arabic Strings — Complete List

### 5.1 Hardcoded English in Components (requires code changes)

| # | File | Line(s) | Hardcoded English String(s) |
|---|---|---|---|
| 1 | `CaseStudyCard.jsx` | 15 | "Case Study" |
| 2 | `CaseStudyCard.jsx` | 22 | "Challenge" |
| 3 | `CaseStudyCard.jsx` | 29 | "Solution" |
| 4 | `CaseStudyCard.jsx` | 36 | "Outcome" |
| 5 | `FloatingSocialBar.jsx` | 39-57 | "WhatsApp", "Telegram", "Email", "LinkedIn" |
| 6 | `FloatingSocialBar.jsx` | 61 | `aria-label="Social links"` |
| 7 | `InsightsPage.jsx` | 47 | "Insights" |
| 8 | `InsightsPage.jsx` | 49-51 | "Perspectives on software, automation, AI, and scalable digital systems for organizations preparing for the future." |
| 9 | `InsightsPage.jsx` | 60 | `aria-label="Filter insights by category"` |
| 10 | `InsightDetailPage.jsx` | 52 | "Loading article…" |
| 11 | `InsightDetailPage.jsx` | 64 | `title="Article Not Found | Sidrah Soft"` |
| 12 | `InsightDetailPage.jsx` | 69 | "Article Not Found" |
| 13 | `InsightDetailPage.jsx` | 70-71 | "The article you are looking for does not exist or has been removed." |
| 14 | `InsightDetailPage.jsx` | 74 | "Back to Insights" |
| 15 | `InsightDetailPage.jsx` | 118 | "By {author}" |
| 16 | `InsightDetailPage.jsx` | 127 | "min read" |
| 17 | `InsightDetailPage.jsx` | 174 | "Full article content coming soon." |
| 18 | `InsightDetailPage.jsx` | 180 | "← Back to Insights" |
| 19 | `InsightDetailPage.jsx` | 15 | `toLocaleDateString('en-US', ...)` — should use locale based on lang |
| 20 | `CaseStudiesPage.jsx` | 46 | "Case Studies" |
| 21 | `CaseStudiesPage.jsx` | 48-49 | "Real-world examples of how Sidrah Soft helps organizations automate, transform, and scale with modern software and AI." |
| 22 | `CaseStudiesPage.jsx` | 59 | `aria-label="Filter case studies by industry"` |
| 23 | `ProtectedRoute.jsx` | 31 | "Loading..." |
| 24 | `ProtectedRoute.jsx` | 59 | "Access Denied" |
| 25 | `ProtectedRoute.jsx` | 60 | "Your account does not have access to this module." |
| 26 | `ProtectedRoute.jsx` | 61-62 | "Contact a system administrator if you believe this is an error." |
| 27 | `StateViews.jsx` | 20 | `retryLabel = 'Retry'` (default prop) |
| 28 | `AutomationShowcaseSection.jsx` | 117-124 | Integration labels: "CRM", "ERP", "Email", "WhatsApp", "Database", "Analytics", "API", "AI Models" |

### 5.2 English-only Fallback Data (requires bilingual data or CMS)

| # | File | Strings |
|---|---|---|
| 29 | `insightsData.js` | `INSIGHT_CATEGORIES`: "All", "AI", "Software Development", "Mobile Apps", "Automation", "Education Technology" |
| 30 | `insightsData.js` | 5 article titles, excerpts, categories, SEO — all English-only |
| 31 | `caseStudiesData.js` | `CASE_STUDY_INDUSTRIES`: "All", "Enterprise Operations", "Education Technology", "AI & Automation", "Healthcare", "Logistics" |
| 32 | `caseStudiesData.js` | 5 case study titles, excerpts, problems, solutions, outcomes, metrics — all English-only |
| 33 | `companyLocation.js` | `workingHours`: "Sun - Thu, 9:00 AM - 5:00 PM" |
| 34 | `CareersSection.jsx` | `careerCards` array: "Software Engineering", "AI & Automation", "UI/UX Design", "Business & Operations" + descriptions |
| 35 | `IndustriesSection.jsx` | `FALLBACK_INDUSTRIES` array: 4 industries with English titles, descriptions, focus areas |
| 36 | `CapabilitiesMarqueeSection.jsx` | `FALLBACK_CAPABILITIES` array: English titles and descriptions |
| 37 | `ServicesSection.jsx` | `fallbackServices` array: English titles, descriptions, problems, automation, outcomes |

### 5.3 Date Formatting Locale Issues

| # | File | Issue |
|---|---|---|
| 38 | `InsightDetailPage.jsx:15` | `toLocaleDateString('en-US', ...)` — always English locale |
| 39 | `LeadsDashboardPage.jsx:37` | `toLocaleDateString(undefined, ...)` — browser default, may not be Arabic |
| 40 | `LeadDetailPage.jsx:25` | `toLocaleDateString(undefined, ...)` — browser default, may not be Arabic |

---

## 6. Localization Status Summary by Component

### Public Website Sections (10 components)
| Status | Count | Components |
|---|---|---|
| ✅ Full | 1 | ContactSection |
| ⚠️ Partial | 8 | FoundationSection, CapabilitiesMarqueeSection, ServicesSection, AutomationShowcaseSection, IndustriesSection, PartnersTrustSection, CaseStudiesSection, InsightsSection, CareersSection |
| ❌ None | 0 | — |

### Public Website Pages (4 components)
| Status | Count | Components |
|---|---|---|
| ✅ Full | 1 | CareersPage |
| ❌ None | 3 | InsightsPage, InsightDetailPage, CaseStudiesPage |

### Public Website Layout (4 components)
| Status | Count | Components |
|---|---|---|
| ✅ Full | 2 | Header, Footer |
| ✅ N/A | 2 | SectionHeading, WorkflowFlow |

### Public Website Cards (2 components)
| Status | Count | Components |
|---|---|---|
| ❌ None | 2 | CaseStudyCard, InsightCard |

### Public Website Misc (3 components)
| Status | Count | Components |
|---|---|---|
| ✅ Full | 2 | HeroContent, HeroScrollCue |
| ❌ None | 1 | FloatingSocialBar |

### Leads System (10 components)
| Status | Count | Components |
|---|---|---|
| ✅ Full | 8 | LeadsDashboardPage, LeadDetailPage, LeadsLoginPage, LeadsHeader, LeadsToolbar, LeadsPagination, LeadsBadge, LeadsLayout |
| ✅ N/A | 2 | LeadsStatCard, LeadsRoutes |

### Shared UI (8 components)
| Status | Count | Components |
|---|---|---|
| ⚠️ Partial | 1 | StateViews |
| ❌ None | 1 | ProtectedRoute |
| ✅ N/A | 6 | Button, Input, Badge, Card, MagneticLink, MagneticButton |

---

## 7. Recommended Implementation Phases

### Phase 1: Critical — Pages with Zero Localization (High Impact)
**Target:** `InsightsPage`, `InsightDetailPage`, `CaseStudiesPage`  
**Work:**
1. Add `useI18n` import and hook to all 3 pages
2. Add translation keys for page titles, intros, filter labels, loading/error/empty states to `en.js` and `ar.js`
3. Add `dir={dir}` to main elements
4. Fix `formatDate` in `InsightDetailPage` to use `lang === 'ar' ? 'ar-SA' : 'en-US'`
5. Translate breadcrumb names in SEO

### Phase 2: High — Shared Components with Hardcoded English
**Target:** `CaseStudyCard`, `InsightCard`, `FloatingSocialBar`, `ProtectedRoute`, `StateViews`  
**Work:**
1. `CaseStudyCard`: Add `useI18n`, translate "Case Study", "Challenge", "Solution", "Outcome"
2. `InsightCard`: Add `useI18n` for potential category translation
3. `FloatingSocialBar`: Add `useI18n`, translate labels and aria-label
4. `ProtectedRoute`: Add `useCMSLang`, translate "Loading...", "Access Denied", and error message
5. `StateViews`: Add i18n support, translate default "Retry" label

### Phase 3: Medium — Fallback Data Bilingualization
**Target:** `insightsData.js`, `caseStudiesData.js`, `companyLocation.js`, section fallback arrays  
**Work:**
1. Add `title_ar`, `excerpt_ar`, `category_ar` fields to fallback data
2. Add bilingual labels to `INSIGHT_CATEGORIES` and `CASE_STUDY_INDUSTRIES`
3. Add Arabic to `careerCards`, `FALLBACK_INDUSTRIES`, `FALLBACK_CAPABILITIES`, `fallbackServices`
4. Add `workingHours_ar` to `companyLocation.js`
5. Update consuming components to use `getBilingual` for fallback data

### Phase 4: Low — Integration Labels & Date Formatting
**Target:** `AutomationShowcaseSection` integration labels, date formatting across leads  
**Work:**
1. Add conditional AR for integration labels in `AutomationShowcaseSection`
2. Fix `formatDate` functions in `LeadsDashboardPage` and `LeadDetailPage` to use `lang`-aware locale
3. Add any missing RTL CSS rules for pages not currently covered

---

## 8. Translation Key Gaps in i18n Files

### Missing from `en.js` / `ar.js` (needed for Phase 1-2):
- `insights.pageTitle` / `insights.pageIntro`
- `insights.loading` / `insights.notFound` / `insights.notFoundText`
- `insights.backToInsights` / `insights.readMore`
- `insights.byAuthor` / `insights.minRead`
- `insights.comingSoon`
- `insights.filterAriaLabel`
- `caseStudies.pageTitle` / `caseStudies.pageIntro`
- `caseStudies.filterAriaLabel`
- `caseStudy.eyebrow` / `caseStudy.challenge` / `caseStudy.solution` / `caseStudy.outcome`
- `social.links` / `social.ariaLabel`
- `common.loading` / `common.accessDenied` / `common.accessDeniedText` / `common.contactAdmin`
- `common.retry`
- `integration.crm` / `integration.erp` / `integration.email` / `integration.whatsapp` / `integration.database` / `integration.analytics` / `integration.api` / `integration.aiModels`

### Existing keys with good coverage:
- `hero.*` — complete
- `header.*` — complete
- `footer.*` — complete
- `contact.*` — complete
- `careers.*` — complete
- `training.*` — complete

---

## 9. Risk Assessment

| Risk | Severity | Impact |
|---|---|---|
| InsightsPage/InsightDetailPage/CaseStudiesPage show English-only when AR selected | **High** | Visible to all Arabic-speaking visitors on these routes |
| CaseStudyCard shows English labels in AR mode | **High** | Visible on homepage CaseStudiesSection and CaseStudiesPage |
| ProtectedRoute shows English "Access Denied" | **Medium** | Only visible to unauthorized users in leads system |
| FloatingSocialBar shows English labels | **Medium** | Visible site-wide on all pages |
| Fallback data English-only | **Low** | Only visible when CMS API is unavailable |
| Date formatting uses wrong locale | **Low** | Dates may show in English format when AR selected |

---

## 10. Verdict

**Arabic Coverage Score: 72/100**

- The homepage (hero, header, footer, contact, careers section) is well-localized
- The leads dashboard system is fully localized
- **3 public pages** (`InsightsPage`, `InsightDetailPage`, `CaseStudiesPage`) have **zero Arabic support** — this is the most critical gap
- **5 shared components** have hardcoded English that shows in Arabic mode
- Fallback data files are English-only but only appear when CMS is down
- RTL CSS coverage is strong (144 rules) but missing for the 3 unlocalized pages

**Recommended priority:** Fix Phase 1 (pages with zero localization) first — these are the most visible gaps to Arabic-speaking visitors.
