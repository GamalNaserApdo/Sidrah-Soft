# SIDRAH-INSIGHTS-CAREERS-VISUAL-INTEGRATION-001 — IMPLEMENTATION REPORT

| Field | Value |
|---|---|
| **Report ID** | SIDRAH-INSIGHTS-CAREERS-VISUAL-INTEGRATION-001 |
| **Date** | 2026-07-16 |
| **Scope** | Public website — Homepage Insights Section + Careers Section |
| **Status** | IMPLEMENTED |
| **Build** | PASS (`npm run build` exit 0, 10.64s) |
| **Human Visual Approval** | PENDING — live browser QA deferred |

---

## 1. Status

**IMPLEMENTED** — Both Insights and Careers sections transformed from generic grids into premium editorial showcases. Insights features a thought-leadership layout with tech blue + purple visual identity. Careers features a culture statement + featured role + supporting openings with copper + gold visual identity. Both adopt SectionHeading, visible-first motion, bilingual EN/AR, and full RTL support.

---

## 2. Public-Only Scope Confirmation

| Constraint | Status |
|---|---|
| No CMS/Leads/backend/API changes | ✅ Verified |
| No Hero/Foundation/Services/Capabilities/WorkflowFlow/Partners/Case Studies changes | ✅ Verified |
| No Automation/Contact/Footer changes | ✅ Verified |
| No Lenis/pinned sections/global motion infrastructure | ✅ Verified |
| No new dependencies or animation libraries | ✅ Verified |
| All styles scoped to `.public-website-shell` | ✅ Verified |
| No `src/components/leads/**` or `src/pages/CMS*` or `backend/**` modifications | ✅ Verified |

---

## 3. Current Audit (Pre-Implementation)

### Files Inspected

| File | Purpose |
|---|---|
| `src/components/sections/InsightsSection.jsx` | Homepage insights section |
| `src/components/sections/CareersSection.jsx` | Homepage careers section |
| `src/components/insights/InsightCard.jsx` | Insight card component (topic, title, description) |
| `src/data/insights/insightsData.js` | Fallback data (5 insights, 3 featured) |
| `src/utils/content/insights.js` | Content utilities (getFeaturedInsights, filtering, sorting) |
| `src/hooks/useInsights.js` | CMS insights hook with normalization |
| `src/hooks/useJobs.js` | CMS jobs hook with normalization |
| `src/styles/sections.css` | Existing Insights + Careers baseline styles |
| `src/styles/global.css` | Existing section container styles |
| `src/styles/cards.css` | Card primitives (no card-edge-tech existed) |
| `src/styles/tokens.css` | Color tokens (tech blue, copper, gold, purple) |
| `src/App.jsx` | Homepage section order verification |

### Pre-Implementation State — Insights

- **Layout**: Uniform 3-column grid, all cards equal size
- **Card**: `InsightCard` with topic, title, description only
- **Hierarchy**: Flat — no featured/supporting distinction
- **Heading**: Hardcoded `<p>` eyebrow + `<h2>` + `<p>` description
- **Visibility**: IntersectionObserver-based `isVisible` state (JS-dependent)
- **Data**: 5 fallback insights (3 featured); CMS via `useInsights({ filters: { show_on_homepage: true } })`
- **Fields available**: `title`, `excerpt`, `category`, `authorName`, `readTime`, `publishedAt`, `featured`
- **CTA**: `MagneticLink` to `/insights` (English-only label)
- **Weaknesses**: No editorial hierarchy, no featured spotlight, no author/read-time display, JS-dependent visibility, English-only CTA

### Pre-Implementation State — Careers

- **Layout**: Uniform 4-column grid of career category cards
- **Card**: Simple `<article>` with title + description only
- **Hierarchy**: Flat — no featured role, no culture statement
- **Heading**: Hardcoded `<p>` eyebrow + `<h2>` + `<p>` description
- **Visibility**: IntersectionObserver-based `isVisible` state (JS-dependent)
- **Data**: 4 hardcoded career category cards (not actual job listings); CMS via `useJobs({ filters: { show_on_homepage: true } })`
- **Fields available (CMS)**: `title`, `department`, `location`, `employmentType`, `shortDescription`, `applicationUrl`, `applicationMethod`, `isFeatured`
- **CTA**: `MagneticButton` scrolling to `#contact` (English-only label)
- **Weaknesses**: No culture/growth/impact messaging, no featured role, no department/location/type display, no apply CTA per card, JS-dependent visibility, English-only content

---

## 4. Files Inspected

(Listed in section 3 above)

---

## 5. Files Created

None. No new files were needed — existing components and style files were sufficient. No unused card sub-components were created since the editorial layout was implemented directly in the section components.

---

## 6. Files Modified

| File | Changes |
|---|---|
| `src/components/sections/InsightsSection.jsx` | Complete rebuild: SectionHeading (index 09), editorial featured + supporting layout, visible-first motion, bilingual EN/AR, accessible links, author/read-time metadata, removed IntersectionObserver |
| `src/components/sections/CareersSection.jsx` | Complete rebuild: SectionHeading (index 10), culture statement + featured role + supporting grid, visible-first motion, bilingual EN/AR, accessible apply links, department/location/type display, removed IntersectionObserver and MagneticButton |
| `src/styles/cards.css` | Added `card-edge-tech` class using existing `--color-tech-blue` tokens |
| `src/styles/sections.css` | Added ~700 lines of `.public-website-shell` scoped styles for Insights (tech blue + purple) and Careers (copper + gold) sections, including responsive breakpoints, RTL mirroring, and reduced-motion rules |

---

## 7. SectionHeading Adoption

### Insights

- **Component**: `src/components/ui/SectionHeading.jsx`
- **Index**: `09` (verified: hero=00, foundation=02, marquee=03, services=04, automation=05, industries=06, partners=07, case_studies=08, insights=09)
- **Eyebrow**: EN "Insights" / AR "رؤى"
- **Title**: CMS `headings.insights.heading_en/ar` with bilingual fallback
- **Description**: CMS `headings.insights.description_en/ar` with bilingual fallback
- **ID**: `insights-heading` with `aria-labelledby` on `<section>`

### Careers

- **Index**: `10` (verified: follows insights)
- **Eyebrow**: EN "Careers" / AR "وظائف"
- **Title**: CMS `headings.careers.heading_en/ar` with bilingual fallback
- **Description**: CMS `headings.careers.description_en/ar` with bilingual fallback
- **ID**: `careers-heading` with `aria-labelledby` on `<section>`

---

## 8. Featured Insight Strategy

```javascript
const featuredInsight = useMemo(() => {
  const featured = allInsights.find((a) => a.featured || a.is_featured);
  return featured || allInsights[0];
}, [allInsights]);
```

- Primary: `insight.featured` (fallback data) or `insight.is_featured` (CMS normalized via `useInsights`)
- Fallback: First ordered insight
- No backend changes, no new API fields

---

## 9. Insights Implementation

### Layout Structure

```
SectionHeading (index 09)
├── insights-showcase (grid: featured | supporting)
│   ├── insight-featured (card-surface-premium, card-edge-tech)
│   │   ├── badge "Featured Article" + number "01"
│   │   ├── category (tech blue)
│   │   ├── title (display font, clamp 1.75rem–3rem)
│   │   ├── excerpt (body-lg)
│   │   ├── meta (author + read time)
│   │   └── CTA "Read Article →"
│   └── insight-supporting (2×2 grid)
│       └── insight-summary × 4 (card-surface-solid, card-edge-purple)
│           ├── category (purple)
│           ├── title (h4)
│           ├── excerpt (body-sm)
│           └── CTA "Read →"
└── insights-view-all "View all insights →"
```

### Visual Identity

- **Section mood**: Dark plum (`rgba(12, 12, 22, 0.92)`) with tech blue radial at 20% 12% and purple radial at 80% 85%
- **Featured card**: `card-surface-premium` with tech blue radial gradient + `card-edge-tech` border + tech blue glow on hover
- **Supporting cards**: `card-surface-solid` with `card-edge-purple` border + lift on hover
- **Staggered offset**: `nth-child(2n)` margin-top for editorial rhythm
- **Distinct from**: Services (purple+gold), Case Studies (purple+gold), Partners (gold)

### Card Primitives Used

- `card-base`, `card-surface-premium`, `card-surface-solid`, `card-edge-tech` (new), `card-edge-purple`, `card-hover-glow`, `card-hover-lift`, `card-padding-lg`, `card-padding-md`

---

## 10. Featured Role Strategy

```javascript
const featuredJob = useMemo(() => {
  const featured = allJobs.find((j) => j.isFeatured || j.featured);
  return featured || allJobs[0];
}, [allJobs]);
```

- Primary: `job.isFeatured` (CMS normalized via `useJobs`) or `job.featured`
- Fallback: First job in list
- No backend changes

---

## 11. Careers Implementation

### Layout Structure

```
SectionHeading (index 10)
├── careers-showcase (grid: culture | featured, then supporting below)
│   ├── careers-culture
│   │   ├── culture statement (display font, light weight)
│   │   └── culture pillars (Growth | Learning | Impact — copper pills)
│   ├── career-featured (card-surface-premium, card-edge-copper)
│   │   ├── badge "Featured Opportunity" + number "01"
│   │   ├── title (display font, clamp 1.75rem–2.75rem)
│   │   ├── details (Department | Location | Type — copper labels)
│   │   ├── description
│   │   └── CTA "Apply Now →"
│   └── career-supporting (4-column grid, desktop only)
│       └── career-summary × 4 (card-surface-solid, card-edge-gold)
│           ├── title (h4)
│           ├── meta pills (dept, location, type)
│           ├── description
│           └── CTA "Apply →"
└── careers-open-cta
    ├── "Don't see the right role?" text
    └── "Get In Touch →" button (copper)
```

### Visual Identity

- **Section mood**: Dark plum (`rgba(14, 12, 18, 0.92)`) with copper radial at 18% 14% and gold radial at 82% 86%
- **Culture statement**: Display font, light weight, secondary color — communicates meaning, growth, and impact
- **Featured card**: `card-surface-premium` with copper radial gradient + `card-edge-copper` border + copper glow on hover
- **Supporting cards**: `card-surface-solid` with `card-edge-gold` border + lift on hover
- **Culture pillars**: Copper-tinted pills (Growth, Learning, Impact)
- **Open CTA**: Copper-tinted surface with copper-bordered button
- **Distinct from**: Case Studies (purple+gold), Insights (tech blue+purple), Services (purple+gold)

### Card Primitives Used

- `card-base`, `card-surface-premium`, `card-surface-solid`, `card-edge-copper`, `card-edge-gold`, `card-hover-glow`, `card-hover-lift`, `card-padding-lg`, `card-padding-md`

---

## 12. Ambient Integration

### Insights

- **Gradients**: Tech blue radial at 20% 12% (0.08 opacity) + purple radial at 80% 85% (0.08 opacity)
- **Surface layering**: Featured uses `card-surface-premium` (semi-transparent), supporting uses `card-surface-solid` (opaque)
- **Controlled transparency**: `isolation: isolate` + `overflow: hidden`
- **Readability**: All text uses design tokens (`--color-text-primary`, `--color-text-secondary`, `--color-text-muted`)

### Careers

- **Gradients**: Copper radial at 18% 14% (0.08 opacity) + gold radial at 82% 86% (0.06 opacity)
- **Surface layering**: Featured uses `card-surface-premium`, supporting uses `card-surface-solid`
- **Controlled transparency**: Same pattern as Insights
- **Readability**: Same token-based text colors

---

## 13. Motion Usage

### Insights

| Element | Motion Class | Visible-First |
|---|---|---|
| Heading block | `motion-clip-reveal is-visible` | ✅ |
| Featured card | `motion-scale-in is-visible` | ✅ |
| Supporting cards | `motion-fade-up is-visible stagger-N` | ✅ |
| View all link | `motion-fade-in is-visible` | ✅ |
| CTA arrows | CSS `transform` on hover | ✅ |

### Careers

| Element | Motion Class | Visible-First |
|---|---|---|
| Heading block | `motion-clip-reveal is-visible` | ✅ |
| Culture statement | `motion-fade-up is-visible` | ✅ |
| Featured card | `motion-scale-in is-visible` | ✅ |
| Supporting cards | `motion-fade-up is-visible stagger-N` | ✅ |
| Open CTA | `motion-fade-in is-visible` | ✅ |
| CTA arrows | CSS `transform` on hover | ✅ |

- No Lenis, ScrollTrigger, pinned sections, parallax, canvas, or animation libraries
- All content visible by default via `is-visible` class — no JS dependency
- `prefers-reduced-motion: reduce` disables all transitions

---

## 14. RTL Handling

### Insights

| Feature | Implementation |
|---|---|
| Grid area mirroring | `grid-template-areas: 'supporting featured'` in RTL |
| CTA arrow mirroring | `transform: scaleX(-1)` in RTL |
| CTA arrow hover | `transform: scaleX(-1) translateX(0.25rem)` in RTL |
| Letter-spacing | Normalized on badge, category labels, view-all link |

### Careers

| Feature | Implementation |
|---|---|
| Grid area mirroring | `grid-template-areas: 'featured culture'` in RTL (desktop: `'featured culture' / 'supporting supporting'`) |
| CTA arrow mirroring | `transform: scaleX(-1)` in RTL |
| CTA arrow hover | `transform: scaleX(-1) translateX(0.25rem)` in RTL |
| Letter-spacing | Normalized on badge, detail labels, open CTA button |

---

## 15. Responsive Behavior

### Insights

| Breakpoint | Featured | Supporting | Notes |
|---|---|---|---|
| Desktop (>1023px) | 1.2fr column | 2×2 grid in 0.8fr column | Staggered offset on even cards |
| Tablet (≤1023px) | 1fr 1fr split | 2×2 grid | Stagger offset removed |
| Mobile (≤767px) | Full width | 1×2 grid | Featured min-height removed, title scales to h2 |
| Small (≤430px) | Full width | 1 column | Featured padding reduced, title scales to xl |

### Careers

| Breakpoint | Culture | Featured | Supporting | Notes |
|---|---|---|---|---|
| Desktop (>1023px) | Left column | Right column | 4-column row below | Full editorial layout |
| Tablet (≤1023px) | Stacked | Below culture | 2×2 grid | Culture → Featured → Supporting |
| Mobile (≤767px) | Stacked | Below culture | 1×2 grid | Open CTA becomes column layout |
| Small (≤430px) | Stacked | Below culture | 1 column | Featured padding reduced, title scales to xl |

---

## 16. Accessibility

| Feature | Insights | Careers |
|---|---|---|
| Section landmark | `aria-labelledby="insights-heading"` | `aria-labelledby="careers-heading"` |
| Featured link | `aria-label="Read: {title}"` | `aria-label="Apply for: {title}"` |
| Supporting links | `aria-label="Read: {title}"` | `aria-label="Apply for: {title}"` |
| External links | N/A (internal routes) | `rel="noopener noreferrer"` + `target="_blank"` when `applicationMethod === 'external_url'` |
| Focus visible | Inherited from `card-base:focus-visible` | Inherited from `card-base:focus-visible` |
| Reduced motion | All transitions disabled | All transitions disabled |
| No hover-only content | ✅ All content visible without hover | ✅ All content visible without hover |

---

## 17. Performance

- No new dependencies added
- No videos, images, animation loops, or heavy JS
- Removed IntersectionObserver from both sections (was JS-dependent for visibility)
- All motion is CSS-only via existing motion primitives
- `card-edge-tech` added as pure CSS class using existing tokens
- Build output: 181.81 kB CSS (gzip: 23.61 kB), 640.62 kB JS (gzip: 194.13 kB)

---

## 18. Build Result

```
npm run build
✓ built in 10.64s
exit code: 0
```

No errors. Pre-existing chunk size warning only (unrelated to this change).

---

## 19. Browser Review

Live browser visual QA deferred per user instruction. Code-based visual review completed via:
- DOM structure inspection
- CSS rule verification
- Responsive breakpoint analysis
- RTL mirroring compliance check
- Card primitive usage verification
- Data contract preservation check
- `card-edge-tech` token validation

---

## 20. Known Issues

- The existing `InsightCard.jsx` component is no longer imported by the homepage InsightsSection but remains unchanged for use by the Insights listing page (`/insights`) and `InsightsPage.jsx`.
- The `MagneticLink` and `MagneticButton` imports were removed from Insights and Careers sections respectively. These components remain available for other sections.
- The `featuredDate` variable in InsightsSection is computed but not currently rendered in the UI (available for future enhancement if date display is desired).
- Careers fallback data (`careerCards`) uses simple title/description objects without department, location, or employment type fields. When CMS jobs are available, these fields are populated. The UI gracefully handles missing fields by conditionally rendering only available data.

---

## 21. Risks

- **Low risk**: The `InsightCard.jsx` component is now unused by the homepage but still used by `InsightsPage.jsx`. No change was made to it.
- **Low risk**: CMS data with `show_on_homepage: true` filter may return different items than the fallback. The featured selection logic handles both `featured` and `is_featured` fields.
- **Low risk**: Careers fallback data doesn't include department/location/type fields. When CMS data is unavailable, the featured and supporting cards will show title and description only, with meta pills omitted.
- **Minimal risk**: Bilingual fallback strings for heading, description, and culture statement are hardcoded in the components. CMS values take priority when available.

---

## 22. Recommended Next Phase

No next phase started. Per user instruction, do not start Contact, Footer, Hero, Automation, Lenis, or Pinned Sections after completion.

---

## 23. Evidence Appendix

### Files Modified

```
src/components/sections/InsightsSection.jsx  (complete rebuild)
src/components/sections/CareersSection.jsx  (complete rebuild)
src/styles/cards.css  (+8 lines, card-edge-tech class)
src/styles/sections.css  (+700 lines, Insights + Careers scoped styles)
```

### New Card Primitive

```
card-edge-tech  (uses --color-tech-blue, --color-tech-blue-border, --color-tech-blue-glow)
```

### Data Fields Used (No New Fields)

**Insights:**
```
title, excerpt, category, authorName, readTime/readingTime,
publishedAt/publishDate, featured/is_featured, slug
```

**Careers:**
```
title, department, location, employmentType,
shortDescription/description, applicationUrl, applicationMethod,
isFeatured/featured, slug
```

### Card Primitives Used

**Insights:**
```
card-base, card-surface-premium, card-surface-solid,
card-edge-tech (new), card-edge-purple,
card-hover-glow, card-hover-lift,
card-padding-lg, card-padding-md
```

**Careers:**
```
card-base, card-surface-premium, card-surface-solid,
card-edge-copper, card-edge-gold,
card-hover-glow, card-hover-lift,
card-padding-lg, card-padding-md
```

### Motion Primitives Used

```
motion-clip-reveal, motion-scale-in, motion-fade-up, motion-fade-in,
is-visible, stagger-N
```

### Color Tokens Used

**Insights:**
```
--color-tech-blue, --color-tech-blue-soft, --color-tech-blue-border, --color-tech-blue-glow
--color-purple, --color-purple-soft, --color-purple-soft-border
```

**Careers:**
```
--color-copper, --color-copper-soft, --color-copper-border, --color-copper-glow
--color-gold, --color-gold-soft, --color-gold-soft-border
```

---

## Completion Summary

```text
STATUS: IMPLEMENTED
REPORT PATH: project-memory/evidence/SIDRAH-INSIGHTS-CAREERS-VISUAL-INTEGRATION-001-IMPLEMENTATION-REPORT.md
PUBLIC WEBSITE ONLY: YES
FILES CREATED: 0
FILES MODIFIED: 4 (InsightsSection.jsx, CareersSection.jsx, cards.css, sections.css)
INSIGHTS RESULT: Editorial thought-leadership section with tech blue + purple identity, featured article spotlight + 2×2 supporting grid, author/read-time metadata, view-all CTA
FEATURED INSIGHT RESULT: Premium card with card-edge-tech border, tech blue badge, display-font title, excerpt, author + read time, "Read Article" CTA
CAREERS RESULT: Culture-driven "Join Our Team" experience with copper + gold identity, culture statement + pillars, featured role + 4-column supporting grid, open CTA block
FEATURED ROLE RESULT: Premium card with card-edge-copper border, copper badge, title, Department/Location/Type details, description, "Apply Now" CTA
AMBIENT RESULT: Insights — tech blue + purple radial gradients on dark plum; Careers — copper + gold radial gradients on dark plum; both with controlled transparency and no bleed
CARD SYSTEM RESULT: New card-edge-tech primitive added; reused card-base, card-surface-premium/solid, card-edge-purple/copper/gold, card-hover-glow/lift, card-padding-lg/md
MOTION RESULT: CSS-only visible-first (motion-clip-reveal, motion-scale-in, motion-fade-up, motion-fade-in with stagger), no JS dependency, reduced-motion respected
RTL RESULT: Grid area mirroring, CTA arrow flipping, letter-spacing normalization for both sections
MOBILE RESULT: Progressive collapse — tablet 2-col split → mobile stacked featured→supporting → small 1-col; Careers culture→featured→supporting on all breakpoints
BUILD RESULT: PASS (exit 0, 10.64s)
HUMAN VISUAL APPROVAL: PENDING
KNOWN ISSUES: InsightCard.jsx unused by homepage but retained for listing page; careers fallback lacks dept/location/type fields; featuredDate computed but not rendered
NEXT RECOMMENDED PHASE: None (per user instruction)
```
