# CAREERS-SECTION-IMPLEMENTATION-001 REPORT

## Files Created

- `src/components/sections/CareersSection.jsx`
- `project-memory/evidence/CAREERS-SECTION-IMPLEMENTATION-001-REPORT.md`

## Files Modified

- `src/App.jsx`
- `src/components/Header.jsx`
- `src/styles/global.css`

## Section Structure

`CareersSection` is inserted directly after `InsightsSection` and before `ContactSection` in the page flow:

```
Insights
↓
Careers
↓
Contact
```

The section includes:

1. **Section Title:** *Build the future with SidrahSoft*
2. **Supporting Text:** Describes digital systems, learning platforms, and automation solutions.
3. **Three Cards:** Engineering Culture, Learning & Growth, Future Opportunities.
4. **CTA:** *Explore opportunities* linking to `#contact`.

## Cards

### Engineering Culture

- **Description:** Work on software, ERP, AI, and automation systems with real operational impact.

### Learning & Growth

- **Description:** A future-ready environment where technical growth, product thinking, and innovation matter.

### Future Opportunities

- **Description:** Upcoming roles, internships, and training opportunities will be shared as SidrahSoft expands.

No fake jobs, salaries, hiring claims, or team photos are used.

## CTA Behavior

- Text: *Explore opportunities*
- Currently links to `#contact` with smooth scroll.
- Can later be replaced with `/careers` or a CMS jobs page URL.

## Header Update

Added a `Careers` link to the header navigation between `Insights` and `Contact` in `src/components/Header.jsx`.

## Responsive Behavior

- **Desktop:** 3-column grid.
- **Tablet (≤ 1024px):** 2-column grid.
- **Mobile (≤ 767px):** Single-column layout with reduced padding.

## Motion Behavior

- Cards fade up using the same `IntersectionObserver` pattern as the other sections.
- Staggered reveal with a 100ms delay between cards.
- Soft hover refinement on border and background using the purple accent (`#8d51a0`).
- Respects `prefers-reduced-motion: reduce`.
- No parallax or complex timelines.

## Visual Result

- Dark `#0d0f12` background and existing muted palette.
- Cards match the subtle border, low-contrast background, and rounded corners used throughout the site.
- Clean typography with lightweight headings.

## Build Verification

```powershell
npm run build
```

- Build completed successfully with exit code `0`.
- No errors or warnings related to the new section.

## Issues Found

- None.

## Final Status

**Complete.** The Careers section is built, placed before Contact, fully responsive, accessible, visually consistent, and verified by a clean production build. The header navigation now includes a Careers anchor.
