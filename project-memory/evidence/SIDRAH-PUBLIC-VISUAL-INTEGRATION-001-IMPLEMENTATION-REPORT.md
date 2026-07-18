# SIDRAH-PUBLIC-VISUAL-INTEGRATION-001 — Implementation Report

**Implementation ID:** SIDRAH-PUBLIC-VISUAL-INTEGRATION-001  
**Date:** 2026-07-16  
**Scope:** Public homepage visual integration — Foundation, Services, and Industries only  
**References:** `SIDRAH-DNA-MAPPING-001-REPORT.md` §10–11, `SIDRAH-VISUAL-FOUNDATION-001-IMPLEMENTATION-REPORT.md`, `SIDRAH-CINEMATIC-SHELL-001-IMPLEMENTATION-REPORT.md`

---

## 1. Status

**PASS — build verified.**

The public visual system is now exposed in Foundation, Services, and Industries. The implementation adds selective background integration, shared heading adoption, asymmetric public layouts, existing card primitives, responsive behavior, RTL mirroring, and safe visible motion states.

---

## 2. Scope Confirmation

Work was restricted to the public website and these homepage sections:

- Foundation
- Services
- Industries
- Public styles supporting those sections

Not modified, tested, or intentionally inspected:

- CMS pages, components, or styles
- Leads Dashboard pages, components, or styles
- Backend
- APIs
- Database
- Authentication dashboard UI
- `src/components/leads/**`
- `src/pages/CMS*`
- `src/styles/leads.css`
- `src/styles/cms/**`
- `backend/**`

No Hero, Automation, Case Studies, Contact, Insights, Careers, Lenis, pinning, smooth scroll, or global motion infrastructure changes were made.

---

## 3. Files Inspected

| File | Purpose |
|---|---|
| `src/components/sections/FoundationSection.jsx` | Existing CMS-backed Foundation content, proof points, and CTA target |
| `src/components/sections/ServicesSection.jsx` | Existing public service data, icons, fallback services, order, and display structure |
| `src/components/sections/IndustriesSection.jsx` | Existing public industry data, fallback icons, CMS mapping, and focus areas |
| `src/components/ui/SectionHeading.jsx` | Existing heading contract, heading tag support, and IDs |
| `src/hooks/useServices.js` | Public normalized service shape: title, description, icon, CTA, order, featured flag |
| `src/hooks/useHomepageConfig.js` | Public homepage configuration source |
| `src/utils/getBilingual.js` | Existing bilingual string resolution behavior |
| `src/styles/sections.css` | Existing public section-specific styling and final scoped integration location |
| `src/styles/cards.css` | Existing public card primitives and accessibility behavior |
| `src/styles/motion.css` | Existing CSS motion presets and reduced-motion rules |
| `src/styles/typography.css` | Existing type scale and RTL font rules |
| `src/styles/global.css` | Existing Foundation/Services/Industries baseline styles and section stacking |
| `SIDRAH-DNA-MAPPING-001-REPORT.md` | Section layout and card recommendations |

---

## 4. Files Created

No new runtime component, hook, dependency, asset, or abstraction was created.

| File | Purpose |
|---|---|
| `project-memory/evidence/SIDRAH-PUBLIC-VISUAL-INTEGRATION-001-IMPLEMENTATION-REPORT.md` | This implementation report |

---

## 5. Files Modified

| File | Change |
|---|---|
| `src/components/sections/FoundationSection.jsx` | Adopted `SectionHeading`; rebuilt markup as editorial statement plus proof-point cards; added section landmark association |
| `src/components/sections/ServicesSection.jsx` | Adopted `SectionHeading`; rebuilt from uniform grid to featured-first showcase plus supporting cards; added public CTA resolution and flow presentation |
| `src/components/sections/IndustriesSection.jsx` | Adopted `SectionHeading`; rebuilt from uniform grid to primary industry showcase plus compact supporting industry cards |
| `src/styles/sections.css` | Added all visual integration styles, scoped to `.public-website-shell` and the three permitted public sections |

---

## 6. Background Integration

The existing cinematic ambient shell remains in place. These three sections now use selective, translucent local surfaces instead of globally changing backgrounds.

| Section | Surface | Local ambient treatment | Readability control |
|---|---|---|---|
| Foundation | Warm dark plum `rgba(14, 12, 22, 0.88)` | Soft gold radial field at upper start edge; subtle gold border fades | Local surface remains nearly opaque, text is above the background plane |
| Services | Deep plum `rgba(12, 10, 20, 0.90)` | Purple radial field at upper end edge; restrained purple border fades | Premium card surfaces retain solid/tinted backgrounds |
| Industries | Warm dark plum `rgba(14, 12, 22, 0.89)` | Copper field at upper start edge plus low gold field at lower end edge | Showcase and compact cards preserve distinct opaque contrast surfaces |

No section was made fully transparent. Ambient remains visible only through controlled alpha backgrounds and gradients, preserving current contrast while allowing the cinematic shell to contribute to the overall mood.

---

## 7. SectionHeading Adoption

All three sections now use `SectionHeading` and bind semantic section landmarks with `aria-labelledby`.

| Section | Landmark ID | Index | Heading tag | Eyebrow |
|---|---|---:|---|---|
| Foundation | `foundation-heading` | `02` | `h1` | `SidrahSoft` |
| Services | `services-heading` | `04` | default `h2` | EN: `What We Do`; AR: `ما نقدمه` |
| Industries | `industries-heading` | `06` | default `h2` | EN: `Industries & Solutions`; AR: `الصناعات والحلول` |

The order follows existing homepage order: Hero → Foundation → Capabilities → Services → Automation → Industries.

Titles and descriptions continue to resolve from existing public CMS/homepage data where available. Existing `getBilingual` behavior is preserved.

---

## 8. Foundation Rebuild

### Layout

Foundation now uses an editorial asymmetric grid:

- **Desktop:** Large statement block on the start side; proof-point stack on the end side.
- **RTL desktop:** Grid areas mirror, placing proof points on the start side and the statement on the end side.
- **Mobile:** Statement then proof-point stack in a single column.

### Content preservation

- Existing Foundation headline preserved.
- Existing description preserved.
- Existing proof-point source preserved.
- Existing CTA label and CTA target preserved.
- No metrics or new business claims added.

### Visual treatment

- Gold eyebrow and editorial index.
- Large display heading.
- Gold-accented proof-point cards, each with an ordinal marker.
- CTA remains visible without hover and retains the existing `MagneticLink` component.

---

## 9. Services Rebuild

### Featured-first strategy

The section now deterministically selects:

1. First ordered service with `isFeatured === true`.
2. Otherwise, the first service after `displayOrder` sorting.

No backend field or API contract was changed.

### Layout

- **Desktop:** Featured spotlight card occupies the larger start-side area; supporting services appear in a two-column staggered supporting composition.
- **Tablet:** Two main columns; supporting services collapse to a one-column stack within their column.
- **Mobile:** Spotlight first, then one supporting service card per row.
- **RTL desktop:** Spotlight and supporting areas mirror.

### Data and interactions preserved

- `useServices()` remains the data source.
- CMS title/short description bilingual resolution remains through `getBilingual`.
- CMS/public icon URLs remain supported; SVG fallback icons remain supported.
- Service order remains `displayOrder` driven.
- Existing `isFeatured` flag is honored.
- A CTA is visible in the featured service. It uses `cta.label` and `cta.url`/`cta.href` when supplied; otherwise it safely falls back to the existing contact anchor.
- Existing fallback service flow values (`problem`, `automation`, `outcome`) are displayed only when present.

### Visual treatment

- Spotlight: `card-base`, `card-surface-premium`, `card-edge-purple`, `card-hover-glow`, `card-padding-lg`.
- Supporting cards: `card-base`, `card-surface-solid`, `card-edge-purple`, `card-hover-lift`, `card-padding-md`.
- Purple remains the dominant Services accent.

---

## 10. Industries Rebuild

### Layout

Industries deliberately differs from Services:

- **Desktop:** Editorial two-column layout with a large primary industry showcase on the start side and compact industry list on the end side.
- **RTL desktop:** The primary showcase moves to the end side; compact list moves to the start side.
- **Tablet:** Two-column editorial composition retained with reduced gaps.
- **Mobile:** Primary showcase followed by full-width compact industry cards.

### Data preservation

- First rendered industry is the showcase.
- Remaining industries become compact cards.
- Existing homepage-config CMS item mapping is retained.
- Existing fallback industry data, fallback icon mapping, focus areas, and image icon support are retained.
- No carousel, interactive selection, or API change added.

### Visual treatment

- Copper is the primary accent.
- Gold appears as restrained secondary surface detail.
- Showcase: `card-base`, `card-surface-gold`, `card-edge-copper`, `card-hover-lift`, `card-padding-lg`.
- Compact list: `card-base`, `card-surface-solid`, `card-edge-copper`, `card-hover-lift`, `card-padding-md`.
- Purple is not used as the dominant Industries accent.

---

## 11. Card Primitive Usage

| Section | Component type | Primitives |
|---|---|---|
| Foundation | Proof-point cards | `card-base`, `card-surface-gold`, `card-edge-gold` |
| Services | Spotlight | `card-base`, `card-surface-premium`, `card-edge-purple`, `card-hover-glow`, `card-padding-lg` |
| Services | Supporting cards | `card-base`, `card-surface-solid`, `card-edge-purple`, `card-hover-lift`, `card-padding-md` |
| Industries | Primary showcase | `card-base`, `card-surface-gold`, `card-edge-copper`, `card-hover-lift`, `card-padding-lg` |
| Industries | Supporting cards | `card-base`, `card-surface-solid`, `card-edge-copper`, `card-hover-lift`, `card-padding-md` |

Content remains present at rest. Hover adds only visual feedback. Existing card primitive hover transforms are already restricted to hover-capable devices. Existing focus-visible and reduced-motion rules remain available to all primitive classes.

---

## 12. Motion Usage

Only existing motion primitives are used:

| Element | Class |
|---|---|
| Foundation statement | `motion-fade-up is-visible` |
| Foundation proof cards | `motion-fade-up is-visible` with existing stagger classes |
| Services heading | `motion-clip-reveal is-visible` |
| Services spotlight | `motion-scale-in is-visible` |
| Services supporting cards | `motion-fade-up is-visible` with existing stagger classes |
| Industries heading | `motion-clip-reveal is-visible` |
| Industries showcase | `motion-scale-in is-visible` |
| Industries supporting cards | `motion-fade-up is-visible` with existing stagger classes |

The `is-visible` class is rendered directly. No element is left hidden while waiting for JavaScript, IntersectionObserver, network activity, or an animation completion. Existing reduced-motion CSS makes all motion classes immediately visible with transitions removed.

No Lenis, ScrollTrigger setup, pinned section, global GSAP system, parallax, canvas, or animation loop was introduced.

---

## 13. RTL Handling

- Grid areas mirror for all three desktop compositions.
- Mobile uses the same practical reading order in LTR and RTL: main statement/showcase first, supporting content second.
- Services CTA and service flow arrows mirror horizontally under `[dir='rtl']`.
- Arabic labels remove Latin-style letter spacing.
- Existing Arabic display/body font rules from the typography foundation continue to apply.
- Existing `getBilingual` behavior remains the public content resolver.

---

## 14. Responsive Handling

| Breakpoint | Foundation | Services | Industries |
|---|---|---|---|
| Desktop `>=1024px` | Asymmetric two columns | Spotlight + two-column staggered support | Showcase + compact list |
| Tablet `768–1023px` | Two columns with reduced gap | Two main columns; support stack | Two columns with reduced gap |
| Mobile `<768px` | Statement then proof cards | Spotlight then one-column support | Showcase then compact full-width cards |

Mobile-specific safeguards:

- All three sections use `min-height: auto`.
- Section padding switches to visual foundation mobile tokens.
- Spotlight cards remove fixed visual pressure by using `min-height: 0`.
- Supporting content stacks to prevent overflow.
- Service flow becomes a simple stacked representation; arrows are hidden.
- Card primitive mobile padding reductions continue to apply.

---

## 15. Accessibility

- Each section has `aria-labelledby` pointing to its `SectionHeading` title ID.
- Existing semantic `<section>`, `<article>`, `<h1>`, `<h2>`, `<h3>`, `<ul>`, and `<a>` elements are retained or improved.
- Service and industry icon containers are decorative with `aria-hidden="true"`; image alternatives are empty.
- Featured Service CTA is visible without hover.
- Card hover behavior adds no hidden-only content.
- Existing global and card `:focus-visible` rules remain active.
- Existing reduced-motion rules remain active; local reduced-motion styling also removes new CTA/card transitions.
- Local surfaces preserve high-contrast text tokens and avoid transparent-only text backgrounds.

---

## 16. Performance

- No dependency added.
- No image, video, canvas, animation loop, or new network request added.
- Existing CMS icon URLs remain lazy-loaded and async-decoded.
- All visual integration uses CSS gradients and existing card primitives.
- No new `IntersectionObserver` or scroll listener was added.
- No forced equal card heights or fixed mobile section heights were added.
- New visual CSS is scoped to the public shell and only the three target sections.

---

## 17. Build Result

Command run:

```bash
npm run build
```

Result:

```text
✓ built in 11.88s
Exit code: 0

dist/assets/index-DdRLe5Fa.css  142.15 kB │ gzip: 20.43 kB
dist/assets/index-CN_QaDwf.js   630.06 kB │ gzip: 191.76 kB
```

The existing Vite warning about a minified JavaScript chunk above 500kB remains. No build errors were reported.

---

## 18. Browser Review

### Static implementation review

| Check | Result |
|---|---|
| Public-only style scoping | PASS — new rules start with `.public-website-shell` |
| Foundation desktop/mobile layout rules | PASS — grid-to-single-column breakpoints present |
| Services featured-first logic | PASS — `isFeatured`, then first ordered fallback |
| Services CTA visibility | PASS — CTA rendered in spotlight without hover dependency |
| Industries primary/supporting composition | PASS — first industry plus remaining list |
| RTL mirroring | PASS — desktop grid areas and arrows have RTL rules |
| Motion fallback | PASS — all motion classes are rendered with `is-visible` |
| Build | PASS |

### Live browser review

**PENDING — not run.** The requested command scope was limited to `npm run build`; no development server or browser session was launched. The following remain recommended visual checks:

- Homepage English desktop
- Homepage Arabic desktop
- Homepage English mobile
- Homepage Arabic mobile
- Ambient visibility and network visibility through each target section
- Header continuity while scrolling through target sections
- Contact continuity after Industries

CMS and Leads were not reviewed, per scope.

---

## 19. Known Issues

1. Existing fallback Foundation and Industries content remains English if public CMS content is unavailable, matching the pre-existing fallback data behavior. CMS-provided bilingual values continue to resolve correctly.
2. The three local section surfaces remain deliberately high-opacity to protect readability; ambient visibility is subtle rather than dominant.
3. No live browser viewport review was run in this implementation session.
4. The existing large JS chunk warning remains unrelated to this phase.

---

## 20. Risks

| Risk | Mitigation |
|---|---|
| Local gradients could reduce ambient visibility | Alpha surfaces and no full opaque replacement allow controlled ambient contribution; browser review can tune opacity if needed |
| Unknown CTA shape from public service data | CTA resolver accepts `label`, `url`, and `href`; safe contact fallback prevents a missing CTA |
| Long CMS text could stress spotlight cards | Layout uses intrinsic content flow, flexible grid tracks, and no fixed card height on mobile |
| Arabic service/industry fallback data is English-only | CMS bilingual data is used when available; fallback localization can be handled as a dedicated content task |
| Motion may be too subtle due visible-first safety | Existing primitives are present but do not gate content; a later approved reveal phase can add non-blocking observer choreography |

---

## 21. Recommended Next Phase

Run the pending public browser visual QA first. Then, if approved, proceed with one isolated public section at a time:

1. Capabilities or Partners visual integration.
2. Preserve the current cinematic shell and visual foundation.
3. Do not start Hero redesign, Automation rebuild, Case Studies, Contact, Lenis, pinned sections, or global motion infrastructure as part of the next immediate change.

---

## 22. Evidence Appendix

### A. Actual homepage order used for section indices

```text
01 Hero
02 Foundation
03 Capabilities
04 Services
05 Automation
06 Industries
```

### B. Services featured selection

```javascript
const featuredService = orderedServices.find((service) => service.isFeatured) || orderedServices[0];
```

### C. Card primitive mapping

```text
Foundation proof points: gold surface + gold edge
Services spotlight: premium surface + purple edge + glow
Services supporting: solid surface + purple edge + lift
Industries showcase: gold surface + copper edge + lift
Industries supporting: solid surface + copper edge + lift
```

### D. Build evidence

```text
npm run build
✓ built in 11.88s
Exit code: 0
```

---

*End of Report*
