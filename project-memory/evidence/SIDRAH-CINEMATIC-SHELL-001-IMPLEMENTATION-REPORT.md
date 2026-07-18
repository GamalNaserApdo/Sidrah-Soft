# SIDRAH-CINEMATIC-SHELL-001 — Implementation Report

**Implementation ID:** SIDRAH-CINEMATIC-SHELL-001  
**Date:** 2026-07-16  
**Scope:** Public website cinematic shell only  
**References:** `SIDRAH-DNA-MAPPING-001-REPORT.md` §17–21; `SIDRAH-VISUAL-FOUNDATION-001-IMPLEMENTATION-REPORT.md`; project workflow rules

---

## 1. Status

**PASS — build verified.**

The public website now has a route-scoped cinematic shell with ambient background, mood-aware glow, vignette, static film grain, and scroll progress. No new dependency, smooth-scroll library, animation system, backend change, CMS change, or Leads change was introduced.

---

## 2. Scope Confirmation — Public Website Only

Implementation was limited to:

- Public homepage
- Public secondary routes
- Shared public layout behavior
- Public section IDs needed for mood registration
- Public visual CSS and hooks

The following were not modified:

- `src/components/leads/**`
- `src/pages/CMS*`
- `src/styles/leads.css`
- `src/styles/cms/**`
- `backend/**`
- APIs, database, authentication UI, CMS components, CMS styles, Leads components, Leads styles

`PublicWebsiteShell` is applied to these public routes only:

- `/`
- `/training`
- `/case-studies`
- `/insights`
- `/insights/:slug`
- `/careers`

`/leads/*` and `/cms/*` remain outside this shell.

---

## 3. Files Inspected

| File | Reason |
|---|---|
| `src/App.jsx` | Public/public-protected route boundaries and existing global background placement |
| `src/components/InteractiveNetworkBackground.jsx` | Existing network canvas behavior, accessibility, device gates, and rendering depth |
| `src/components/MouseGlow.jsx` | Existing mouse-follow glow scope |
| `src/components/hero/CinematicHero.jsx` | Actual homepage hero ID (`home`) and existing GSAP usage |
| `src/components/sections/FoundationSection.jsx` | Missing foundation ID |
| Homepage section components | Actual IDs for capabilities, services, automation, industries, partners, case studies, insights, careers, and contact |
| `src/components/Footer.jsx` | Footer element and missing footer ID |
| `src/components/pages/TrainingPage.jsx` | Public secondary route structure |
| `src/pages/CaseStudiesPage.jsx` | Public secondary route structure |
| `src/pages/InsightsPage.jsx` | Public secondary route structure |
| `src/pages/InsightDetailPage.jsx` | Public secondary route structure |
| `src/pages/CareersPage.jsx` | Public secondary route structure |
| `src/styles/global.css` | Existing z-index, network, mouse glow, header, and public background styles |
| `src/styles/tokens.css` | Existing color, motion, section background, and z-index tokens |
| `src/main.jsx` | CSS import order |

---

## 4. Files Created

| File | Purpose |
|---|---|
| `src/components/cinematic/CinematicLayers.jsx` | Decorative fixed cinematic layer tree and hook composition |
| `src/hooks/usePublicSectionMood.js` | One `IntersectionObserver` for active public homepage section mood detection |
| `src/hooks/useScrollProgress.js` | Passive scroll listener with `requestAnimationFrame` throttling and cleanup |
| `src/styles/cinematic.css` | Public shell layers, mood configuration, responsive/accessibility gates, progress styling |

---

## 5. Files Modified

| File | Change |
|---|---|
| `src/App.jsx` | Added `PublicWebsiteShell`, route-to-default-mood mapping, and public-only route wrapping |
| `src/main.jsx` | Added `cinematic.css` after `motion.css` and before general public styles |
| `src/components/sections/FoundationSection.jsx` | Added `id="foundation"` for mood registration |
| `src/components/Footer.jsx` | Added `id="footer"` for footer mood registration |

No section layout, card design, content, backend behavior, API behavior, CMS, or Leads implementation was changed.

---

## 6. Cinematic Layer Architecture

`CinematicLayers` renders the requested decorative tree:

```jsx
<div className="cinematic-layers" data-ambient={mood} aria-hidden="true">
  <div className="cinematic-ambient" />
  <div className="cinematic-glow" />
  <div className="cinematic-vignette" />
  <div className="cinematic-grain" />
  <div className="cinematic-progress" />
</div>
```

Layer behavior:

| Layer | Position | Stacking behavior | Interaction |
|---|---|---|---|
| Ambient | Fixed, full viewport | Above the existing network canvas and behind public route content | `pointer-events: none` |
| Global glow | Fixed, full viewport | Same background plane as ambient; behind content | `pointer-events: none` |
| Vignette | Fixed, full viewport | Above ambient/glow plane, behind public content | `pointer-events: none` |
| Grain | Fixed, full viewport | Above background plane, behind public content | `pointer-events: none` |
| Progress | Fixed top edge | `var(--z-progress-bar)` / above the header plane; only 2px tall | `pointer-events: none` |

`public-route-content` uses `var(--z-content)` to ensure public UI remains above background layers. Existing header behavior remains above the visual background and remains clickable. Existing `MouseGlow` stays at its existing `z-index: 9999`, so it remains unaffected.

---

## 7. Ambient Mood Mapping

### Homepage section map

| Actual DOM ID | Mood | Ambient token |
|---|---|---|
| `home` | `hero` | `--section-bg-hero` |
| `foundation` | `foundation` | `--section-bg-foundation` |
| `capabilities` | `capabilities` | `--section-bg-capabilities` |
| `services` | `services` | `--section-bg-services` |
| `automation-showcase` | `automation` | `--section-bg-automation` |
| `industries` | `industries` | `--section-bg-industries` |
| `partners` | `partners` | `--section-bg-partners` |
| `case-studies` | `casestudies` | `--section-bg-casestudies` |
| `insights` | `insights` | `--section-bg-insights` |
| `careers` | `careers` | `--section-bg-careers` |
| `contact` | `contact` | `--section-bg-contact` |
| `footer` | `footer` | `--section-bg-footer` |

### Secondary route defaults

| Public route | Default mood |
|---|---|
| `/training` | `foundation` |
| `/case-studies` | `casestudies` |
| `/insights` and `/insights/:slug` | `insights` |
| `/careers` | `careers` |
| `/` | `hero` |

Ambient color transitions use:

```css
transition:
  background-color var(--motion-duration-cinematic) var(--motion-ease-out),
  opacity var(--motion-duration-normal) var(--motion-ease-out);
```

The token values resolve to 800ms and 400ms respectively. Existing opaque section backgrounds were intentionally left unchanged; this produces a gradual, safe integration without compromising text contrast or redesigning sections.

---

## 8. Section Detection Strategy

`usePublicSectionMood` uses a single `IntersectionObserver`:

- Registers only sections whose documented actual IDs currently exist in the DOM.
- Uses `rootMargin: '-45% 0px -45% 0px'`, limiting the observer activation region to the middle 10% of the viewport.
- Chooses the candidate whose visual center is nearest the viewport center.
- Updates correctly for forward and reverse scrolling.
- Ignores disabled/non-rendered homepage sections naturally because absent elements are filtered out.
- Uses a closest-section fallback only when homepage sections exist.
- Does not let a persistent footer override a secondary page’s route default until the footer becomes active.
- Disconnects the observer when the shell unmounts or its default route mood changes.

No fixed section order is assumed at runtime. Homepage configuration can hide or reorder sections; only rendered DOM elements are considered.

---

## 9. Glow Implementation

The global glow is a fixed CSS radial-gradient plane that does not follow the pointer and is separate from both `MouseGlow` and `InteractiveNetworkBackground`.

Mood color configuration:

| Mood | Glow treatment |
|---|---|
| Hero | Purple primary plus gold secondary |
| Foundation | Gold |
| Capabilities | Purple |
| Services | Purple |
| Automation | Tech blue |
| Industries | Copper |
| Partners | Gold |
| Case studies | Purple primary plus gold secondary |
| Insights | Tech blue |
| Careers | Copper |
| Contact | Purple |
| Footer | Low-opacity gold |

CSS custom properties control each state:

- `--cinematic-glow-color`
- `--cinematic-glow-secondary-color`
- `--cinematic-glow-opacity`
- `--cinematic-glow-x`
- `--cinematic-glow-y`
- `--cinematic-glow-secondary-x`
- `--cinematic-glow-secondary-y`

Opacity stays low (0.28–0.52) and source colors are low-alpha. On mobile, glow opacity is reduced by 30%. In `prefers-reduced-transparency`, the glow is hidden.

---

## 10. Grain Implementation

- Uses a local inline SVG data URI with `feTurbulence` fractal noise.
- No external image, image request, canvas, animation, or timer.
- Opacity: `0.022`.
- Full viewport fixed decorative plane.
- `pointer-events: none`.
- Inherited `aria-hidden="true"` from the layer tree.
- Disabled under `max-width: 767px`.
- Disabled under `prefers-reduced-transparency: reduce`.
- Disabled under `prefers-contrast: more`.

---

## 11. Vignette Implementation

- Fixed radial CSS gradient.
- Center stays transparent through 65% of the ellipse.
- Edge color is `rgba(0, 0, 0, 0.25)` but the layer itself is only 0.42 opacity.
- Mobile uses a lighter treatment: transparent through 68%, edge color `rgba(0, 0, 0, 0.18)`, layer opacity 0.24.
- Disabled in `prefers-contrast: more`.
- Does not cover or intercept content interactions.

---

## 12. Scroll Progress Implementation

`useScrollProgress`:

- Computes `window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)`.
- Updates only through one passive `scroll` event listener and `requestAnimationFrame` throttle.
- Also recalculates on `resize`.
- Writes directly to the progress element’s `transform: scaleX(...)`; React does not re-render on scroll.
- Removes listeners and cancels pending animation frames on unmount.
- Responds to changes in `prefers-reduced-motion`.

Progress styling:

| Property | Value |
|---|---|
| Position | Fixed, top 0, left 0 |
| Height | 2px |
| Fill | Gold → Purple gradient |
| Paint update | `transform: scaleX()` |
| Performance | `will-change: transform` |
| Interaction | `pointer-events: none` |
| LTR origin | left center |
| RTL origin | right center |
| Reduced motion | hidden; listener is not kept active |

---

## 13. Existing Background Integration

### InteractiveNetworkBackground

- Kept intact.
- Remains the earliest fixed canvas layer at `z-index: 0`.
- Ambient lives inside public app content but on its local base plane, placing it visually above the canvas and behind public page content.
- The network is not removed, disabled, or redesigned.
- Existing device and reduced-motion disabling behavior remains unchanged.

### MouseGlow

- Kept intact and unmodified.
- Its current `z-index: 9999` leaves it above the cinematic planes.
- The new global glow does not track the pointer, avoiding duplication of its role.

### Hero Canvas

- Kept intact and unmodified.
- Vignette and grain are background-plane layers, behind `public-route-content`, so they do not overlay the hero canvas or lower its readability.

---

## 14. RTL Handling

- Progress direction mirrors through `[dir='rtl'] .cinematic-progress { transform-origin: right center; }`.
- Section mood selection is ID-based, independent of writing direction.
- Ambient/glow center positions are visual percentages and do not affect navigation, DOM direction, or content layout.
- Existing `I18nProvider` continues to set `[dir='rtl']`; no translation content was added.

---

## 15. Accessibility Handling

- The root `cinematic-layers` is `aria-hidden="true"`.
- All layer children are non-interactive and use `pointer-events: none`.
- Ambient and glow are background-plane layers behind public content.
- Progress is decorative and non-interactive.
- `prefers-reduced-motion: reduce` removes cinematic transitions and hides progress.
- `prefers-reduced-transparency: reduce` hides grain and global glow; ambient becomes fully opaque.
- `prefers-contrast: more` hides vignette and grain.
- No continuous grain animation, new focus management, keyboard event, focusable element, or scroll hijacking was introduced.

---

## 16. Performance Handling

- No dependency added.
- No Lenis, new GSAP logic, ScrollTrigger infrastructure, Three.js, new canvas, video, image asset, or Higgsfield asset added.
- One observer covers all active homepage section elements.
- One passive scroll listener and one rAF throttle drive the progress bar.
- Progress changes only a composited transform.
- Ambient changes use CSS custom properties and CSS transitions.
- Grain and vignette are static CSS layers.
- Grain is removed on mobile.
- Global glow is reduced on mobile and removed where reduced transparency is requested.
- All hooks clean up observers, listeners, and pending animation frames.

---

## 17. Public Route Behavior

`PublicWebsiteShell` is placed on the six public route definitions only. This gives public pages a consistent shell while keeping protected/internal paths outside it.

| Route family | Cinematic shell |
|---|---|
| Public homepage | Enabled |
| Public secondary routes | Enabled |
| `/leads/*` | Not mounted by `PublicWebsiteShell` |
| `/cms/*` redirect | Not mounted by `PublicWebsiteShell` |

The change does not restructure routing or alter route destinations.

---

## 18. Build Result

Command run:

```bash
npm run build
```

Result:

```text
✓ built in 15.44s
Exit code: 0

dist/assets/index-B_gcRgdA.css  128.79 kB │ gzip: 18.66 kB
dist/assets/index-CLWXTgiw.js   627.79 kB │ gzip: 190.86 kB
```

The build emitted the pre-existing Vite warning about a minified JavaScript chunk exceeding 500kB. It is unrelated to this implementation; no build errors occurred.

---

## 19. Manual Public-Site Checks

### Completed

| Check | Result |
|---|---|
| Public route shell placement | PASS — verified in route definitions |
| Homepage mood IDs | PASS — verified actual IDs against homepage section components |
| Foundation/footer registration IDs | PASS — limited ID additions applied |
| Public secondary fallback moods | PASS — route mapping verified |
| CMS/Leads shell exclusion | PASS — no `PublicWebsiteShell` wrapping in those route elements |
| LTR/RTL progress origin | PASS — CSS rules verified |
| Non-blocking visual layers | PASS — all layers use `pointer-events: none` |
| Build | PASS |

### Not Run

No dev server, browser session, CMS test, Leads test, backend test, or API test was run. The requested verification command was limited to `npm run build` and the task scope explicitly excludes CMS, Leads, backend, APIs, and database.

A browser visual pass remains recommended for the requested homepage EN/AR desktop/mobile scroll sequences.

---

## 20. Known Limitations

1. Existing public sections retain their current solid/local backgrounds. Ambient mood is therefore most visible where existing sections already have transparent or lower-opacity visual space; this is intentional for this shell-only phase.
2. Public secondary page section elements do not have new per-section IDs. They retain a route-level default mood until the shared footer enters the viewport.
3. No visual browser review was run because only `npm run build` was requested for command execution.
4. Existing `InteractiveNetworkBackground` is already disabled for touch/coarse pointer/reduced-motion environments. The cinematic shell does not change that behavior.
5. No smooth scrolling, scroll reveal system, section redesign, or card redesign is included.

---

## 21. Risks

| Risk | Mitigation |
|---|---|
| Existing opaque section backgrounds can mask ambient changes | No global transparency changes were made; future section phases can selectively expose the shell without reducing contrast now |
| Decorative layers could affect readability | Very low-opacity glow/grain, light vignette, `prefers-contrast` fallback, and content-above-background stacking |
| Scroll handler could cause jank | Passive listener, rAF throttling, direct transform write, cleanup on unmount |
| Footer could reset mood too early on secondary pages | Route default remains stable until the footer’s middle-viewport observer activation |
| Device capability varies | Grain disabled on mobile; existing network gating preserved; reduced motion/transparency gates added |

---

## 22. Recommended Next Phase

**Section-specific visual integration, not motion infrastructure.**

Recommended next work:

1. Selectively soften or layer only the public section backgrounds where ambient mood needs more visibility.
2. Adopt the `SectionHeading` foundation in individual sections.
3. Apply the new card primitives to individual public sections.
4. Run a browser visual QA pass for EN/AR desktop and mobile.

Do not start Lenis, a new global GSAP/ScrollTrigger system, cinematic pinning, or section redesign as part of this completed shell phase.

---

## 23. Evidence Appendix

### A. Actual homepage IDs used

```text
home
foundation
capabilities
services
automation-showcase
industries
partners
case-studies
insights
careers
contact
footer
```

### B. Public route mood defaults

```text
/                  → hero
/training          → foundation
/case-studies      → casestudies
/insights          → insights
/insights/:slug    → insights
/careers           → careers
```

### C. Key CSS gates

```text
max-width: 767px                    → grain disabled, vignette/glow reduced
prefers-reduced-motion: reduce      → transitions removed, progress hidden
prefers-reduced-transparency: reduce → grain/glow hidden, ambient opaque
prefers-contrast: more              → vignette/grain hidden
[dir='rtl']                         → progress transform origin right
```

### D. Build evidence

```text
npm run build
✓ built in 15.44s
Exit code: 0
```

---

*End of Report*
