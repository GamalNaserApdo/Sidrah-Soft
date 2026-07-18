# CAREERS-REFACTOR-002 — LAYOUT CORRECTION REPORT

| Field | Value |
|---|---|
| **Report ID** | CAREERS-REFACTOR-002 |
| **Date** | 2026-07-16 |
| **Scope** | Careers Section layout architecture only |
| **Build** | PASS (`npm run build` exit 0, 15.43s) |

---

## Problem Identified

The previous Careers implementation (`SIDRAH-INSIGHTS-CAREERS-VISUAL-INTEGRATION-001`) had a layout architecture issue:

1. **4-column supporting grid inside the showcase** — job cards were squeezed into ultra-narrow columns (1/4 of container width), causing title truncation and cramped descriptions
2. **Excessive empty space in featured card** — `min-height: 26rem` + `padding-top: clamp(3rem, 8vw, 6rem)` created a large void between the badge and the title
3. **Thin culture panel** — only one sentence + 3 pill labels, visually unbalanced against the featured card
4. **No "Open Positions" heading** — job listings were embedded inside the showcase grid with no visual separation from the culture/featured area
5. **Overall feel** — "Job Cards + Large Job Card" instead of "Join Our Team Experience"

---

## Layout Changes

### Before

```
SectionHeading
├── careers-showcase (grid: culture | featured, then 4-col row below)
│   ├── careers-culture (thin: 1 sentence + 3 pills)
│   ├── career-featured (min-height 26rem, padding-top 6rem)
│   └── career-supporting (4-column grid — NARROW CARDS)
└── careers-open-cta
```

### After

```
SectionHeading
├── careers-showcase (grid: culture | featured — 1fr | 1fr)
│   ├── careers-culture (enriched: statement + 3 themed blocks)
│   └── career-featured (no min-height, padding-top space-8, tighter density)
├── careers-open-positions
│   ├── heading "Open Positions"
│   └── careers-open-positions__grid (2-column — WIDE CARDS)
│       └── career-position × N (title + arrow, meta pills, description)
└── careers-open-cta
```

### Key Architectural Changes

| Change | Before | After |
|---|---|---|
| Showcase grid | `1fr : 1.2fr` with 4-col row below | `1fr : 1fr` — culture and featured only |
| Job cards location | Inside showcase grid (4 columns) | Separate `careers-open-positions` section (2 columns) |
| Job card width | ~25% of container (narrow) | ~50% of container (wide, readable) |
| Culture panel | 1 sentence + 3 pill labels | 1 statement + 3 themed blocks (title + text) |
| Featured min-height | `26rem` | `0` (content-driven) |
| Featured padding-top | `clamp(3rem, 8vw, 6rem)` | `var(--space-8)` |
| Featured title size | `clamp(1.75rem, 3vw, 2.75rem)` | `clamp(1.5rem, 2.5vw, 2.25rem)` |
| Open Positions heading | None | `h3` "Open Positions" / "المناصب الشاغرة" |
| Position card CTA | Inline "Apply →" at bottom | Arrow in header (cleaner, more compact) |

---

## Files Modified

| File | Changes |
|---|---|
| `src/components/sections/CareersSection.jsx` | Replaced `career-supporting` grid with separate `careers-open-positions` section; enriched culture panel with themed blocks; added `level` field; new `career-position` card class with header+arrow layout |
| `src/styles/sections.css` | Replaced `career-supporting`/`career-summary` styles with `careers-open-positions`/`career-position` styles; reduced featured card empty space; enriched culture panel styles; updated responsive breakpoints and RTL rules |

---

## Build Result

```
npm run build
✓ built in 15.43s
exit code: 0
```

No errors. Pre-existing chunk size warning only (unrelated).

---

## Before/After Architecture

### Before

```
DESKTOP:
┌──────────────┬───────────────────┐
│  Culture     │  Featured Role    │
│  (thin)      │  (lots of space)  │
├──────────────┴───────────────────┤
│  Job Card │ Job Card │ Job Card │ Job Card  ← NARROW (4-col)
└──────────────────────────────────┘
```

### After

```
DESKTOP:
┌──────────────┬──────────────┐
│  Culture     │  Featured    │
│  Panel       │  Role        │
│  (enriched)  │  (dense)     │
└──────────────┴──────────────┘

Open Positions
┌──────────────┬──────────────┐
│  Position 1  │  Position 2  │  ← WIDE (2-col)
├──────────────┼──────────────┤
│  Position 3  │  Position 4  │
└──────────────┴──────────────┘

┌────────────────────────────────┐
│  Don't see the right role?     │
│  Get In Touch →                │
└────────────────────────────────┘
```

---

## Responsive Result

### Desktop (>1023px)

- Showcase: `1fr : 1fr` grid — culture panel left, featured role right
- Open Positions: 2-column grid — wide, readable cards
- Culture panel: statement + 3 themed blocks in a bordered surface
- Featured: tight padding, no excessive min-height

### Tablet (≤1023px)

- Showcase: single column — culture stacked above featured
- Open Positions: 1-column grid
- All content readable, no truncation

### Mobile (≤767px)

- Same as tablet — culture → featured → open positions (1-col) → open CTA
- Featured title scales to `h2`
- Open CTA becomes column layout

### Small (≤430px)

- Culture panel padding reduced to `space-6`
- Culture statement font reduced to `lg`
- Featured padding reduced to `space-6 : space-4`
- Featured title scales to `xl`

---

## RTL Result

| Feature | Implementation |
|---|---|
| Showcase grid | `grid-template-areas: 'featured culture'` in RTL |
| CTA arrow mirroring | `transform: scaleX(-1)` on featured and position arrows |
| CTA arrow hover | `transform: scaleX(-1) translateX(0.25rem)` in RTL |
| Letter-spacing | Normalized on badge, detail labels, theme titles, open positions heading, open CTA button |
| Responsive | RTL showcase areas match LTR at all breakpoints (stacked) |

---

## Featured Role Result

- **Width**: Equal to culture panel (`1fr : 1fr` grid) — no longer oversized
- **Empty space**: Removed `min-height: 26rem` and reduced `padding-top` from `clamp(3rem, 8vw, 6rem)` to `var(--space-8)`
- **Information density**: Title size reduced from `2.75rem` max to `2.25rem` max; detail gaps reduced from `space-6` to `space-5`; description margin reduced from `space-6` to `space-5`
- **CTA prominence**: "Apply Now →" with copper color on hover, arrow translates on hover
- **Hierarchy**: Badge → Title → Details (Dept/Location/Type/Level) → Description → CTA
- **Level field**: Added `featuredJob?.level || featuredJob?.seniority` — only rendered if data exists

---

## Open Positions Result

- **Grid**: 2-column desktop, 1-column tablet/mobile
- **Card width**: ~50% of container — full titles, readable descriptions, visible arrows
- **Card structure**: Header (title + arrow) → Meta pills (dept/location/type/level) → Description
- **No truncation**: Titles use `font-size-h4` with `line-height-snug`, no max-height or overflow hidden
- **No horizontal scroll**: Grid uses `minmax(0, 1fr)` columns with `gap: clamp(1rem, 2vw, 1.5rem)`
- **Heading**: "Open Positions" / "المناصب الشاغرة" in display font, `h3` size, light weight

---

## Known Limitations

- Careers fallback data (`careerCards`) only has `title` and `description` — no department, location, type, or level. When CMS jobs are unavailable, meta pills are omitted gracefully.
- Culture theme texts are derived from existing company messaging (growth, learning, impact) — not fabricated statistics or benefits.
- The `level` field is checked via `job.level || job.seniority` — only rendered if the CMS provides this data.
- No changes to motion, color palette, typography, or ambient integration — only layout architecture was corrected.

---

## Completion Summary

```text
STATUS: IMPLEMENTED
FILES MODIFIED: 2 (CareersSection.jsx, sections.css)
LAYOUT FIX RESULT: Separated showcase (culture | featured) from open positions (2-col grid below); removed 4-col narrow cards; added "Open Positions" heading
FEATURED ROLE RESULT: Reduced width (1fr:1fr), removed min-height, reduced padding-top, tighter spacing, added Level field
OPEN POSITIONS RESULT: 2-column desktop / 1-column mobile; wide cards with title+arrow header, meta pills, description; no truncation
MOBILE RESULT: Progressive stack — culture → featured → positions (1-col) → open CTA; all titles readable at all breakpoints
RTL RESULT: Grid areas mirrored, arrows flipped, letter-spacing normalized
BUILD RESULT: PASS (exit 0, 15.43s)
KNOWN ISSUES: Fallback data lacks dept/location/type/level fields; culture themes derived from existing messaging only
```
