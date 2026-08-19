# SIDRAHSOFT-NEWSTYLE-BACKGROUND-IMPLEMENTATION-001

**Date:** 2026-07-16
**Status:** COMPLETE
**Predecessor:** SIDRAHSOFT-EDUCATION-AND-NEWSTYLE-INVESTIGATION-001-REPORT.md
**Scope:** Replace the heavy Canvas/mood/mouse-glow global background system with a lightweight CSS-only grid + static ambient glow, inspired by `newstyle/styles.css`.

---

## 1. Objective

Implement the approved recommendation from the investigation report: replace the three-component global background system (`InteractiveNetworkBackground` Canvas, `CinematicLayers` mood system, `MouseGlow` pointer tracking) with a single lightweight CSS-only grid background. Simplify the Hero's continuous infinite animations where they caused expensive repaints.

---

## 2. What Was Removed

### 2.1 Deleted Files (6 files, ~668 lines)

| File | Lines | Reason |
|------|-------|--------|
| `src/components/InteractiveNetworkBackground.jsx` | 243 | Canvas-based network animation. Continuous `requestAnimationFrame` loop, GPU-intensive. Replaced by CSS grid. |
| `src/components/MouseGlow.jsx` | 20 | Cursor-following blurred glow. Required continuous `--cursor-x/y` CSS var updates via rAF. |
| `src/hooks/useMousePosition.js` | 74 | rAF loop that tracked smoothed mouse position and wrote 4 CSS custom properties on `:root` every frame. Only consumer was `MouseGlow`. |
| `src/components/cinematic/CinematicLayers.jsx` | 22 | Mood-based multi-layer fixed background with dynamic per-section styling. Replaced by static ambient glows. |
| `src/hooks/usePublicSectionMood.js` | 85 | `IntersectionObserver` + scroll handler that computed the "closest section mood" and drove `CinematicLayers`. Only consumer was `CinematicLayers`. |
| `src/styles/cinematic.css` | 224 | All styles for `CinematicLayers`, mood gradients, scroll progress bar, and `.public-website-shell` base. Migrated shell + progress bar to `background.css`; remainder discarded. |

### 2.2 Removed CSS Rules

**From `src/styles/global.css` (~69 lines removed):**
- `.mouse-glow` — fixed 24rem blurred radial gradient tracking cursor. Required `filter: blur(3rem)` + continuous transform updates.
- `.interactive-network-background` — fixed full-viewport Canvas container.
- `.cinematic-canvas-wrapper` — sticky canvas wrapper with mouse parallax transform.
- All associated `@media` guards for the above (reduced-motion, coarse-pointer).

**From `src/styles/hero.css` (~59 lines removed):**
- `@keyframes hero-aura-drift-purple` / `hero-aura-drift-gold` — infinite 12s/14s alternate animations on large blurred (4rem) elements.
- `@keyframes hero-smoke-rise` — infinite 24-28s animation on 3 large blurred (3rem) wisps with `translateY(-60vh) scale(1.3)`.
- `.hero-content-overlay` pointer-depth parallax — used `--mouse-x/y` from the deleted `useMousePosition`; was a no-op after removal.
- `will-change: opacity, transform` declarations on aura/smoke (no longer animating).

### 2.3 Simplified CSS Rules

- `.hero-aura-glow--purple/gold` — kept as static blurred radial gradients with fixed opacity. No animation.
- `.hero-smoke-wisp--purple/gold/copper` — kept as static blurred radial gradients with fixed opacity. No animation. The scroll-driven opacity fade in `CinematicHero.jsx` (via `smokeRef`) still works.
- `.mouse-depth-card:hover` — removed the `perspective(1000px) rotateX/Y` 3D tilt (depended on `--mouse-x/y` from deleted `useMousePosition`). Kept the `translateY(-0.35rem) scale(1.01)` hover lift.

---

## 3. What Was Added

### 3.1 New Files (2 files, ~228 lines)

| File | Lines | Purpose |
|------|-------|---------|
| `src/components/SidrahGridBackground.jsx` | 31 | React component rendering 4 static divs (base, grid lines, ambient glows, scroll progress bar). Zero continuous JS. |
| `src/styles/background.css` | 197 | All styles for the new background system + migrated `.public-website-shell` / `.public-route-content` base rules. |

### 3.2 Architecture

The new `SidrahGridBackground` renders four layers, all `position: fixed` with negative `z-index` inside an `isolation: isolate` shell:

1. **`.sidrah-grid-base`** (z-index: -3) — dark plum gradient (`#0a0b10 → #0c0a14 → #08090f`) with two subtle radial color spots (purple top-right, gold bottom-left). Static.
2. **`.sidrah-grid-lines`** (z-index: -2) — 72px CSS grid via two `linear-gradient` backgrounds, faded vertically with a `mask-image`. Single composited pseudo-element. Static.
3. **`.sidrah-grid-ambient`** (z-index: -2) — two static blurred (`blur(90px)`) radial glow divs in SidrahSoft purple and gold. No animation, no drift.
4. **`.sidrah-scroll-progress`** (z-index: 600) — 2px top progress bar. Scroll-driven via the existing `useScrollProgress` hook (rAF only fires on scroll/resize). Disabled under reduced motion.

**Performance profile:**
- Zero `requestAnimationFrame` loops for the background itself.
- Zero Canvas / WebGL.
- Zero continuous CSS custom property writes.
- Zero infinite CSS animations on the global background.
- The only runtime JS is `useScrollProgress`, which only schedules a rAF frame on `scroll`/`resize` events (not continuous).

### 3.3 Accessibility / Responsive

- `prefers-reduced-motion: reduce` → scroll progress bar hidden. Background is already fully static.
- `prefers-reduced-transparency: reduce` → ambient glows hidden.
- `prefers-contrast: more` → ambient glows hidden (preserve text contrast).
- Mobile (≤767px) → grid size reduced to 56px, opacity 0.7; purple glow softened; gold glow hidden.
- Mobile (≤430px) → purple glow further reduced.
- RTL → scroll progress bar `transform-origin: right center`.

---

## 4. Hero Atmospheric Components — Audit Results

| Component | Decision | Rationale |
|-----------|----------|-----------|
| `HeroAura` | **Simplified** | Removed infinite 12s/14s drift keyframes. Kept the 2 static blurred radial glows (purple + gold). Visual depth preserved, continuous repaints eliminated. |
| `HeroSmoke` | **Simplified** | Removed infinite 24-28s `hero-smoke-rise` keyframes on 3 large `blur(3rem)` wisps. Kept as static blurred gradients with fixed opacity. Scroll-driven opacity fade in `CinematicHero.jsx` still works. |
| `HeroLeaves` | **Kept** | 6 small elements (3-7px), transform-only animation (translate+rotate), no blur filter. Scroll-controlled opacity. Already gated on touch/reduced-motion. Lightweight. |
| `HeroMotes` | **Kept** | 8 small elements (2-5px), transform-only animation (translate), no blur. Scroll-controlled. Already gated. Lightweight. |
| `HeroSheen` | **Kept** | Single element, transform-only (translateX), no blur. 18s sweep. Already gated. Lightweight. |

---

## 5. Files Modified

| File | Change |
|------|--------|
| `src/App.jsx` | Replaced imports of `InteractiveNetworkBackground`, `MouseGlow`, `CinematicLayers` with single `SidrahGridBackground`. Removed `useLocation` import and `getPublicRouteMood` function. Simplified `PublicWebsiteShell` (no mood prop). Shell div now has both `public-website-shell` and `sidrah-grid-shell` classes. |
| `src/main.jsx` | Replaced `import './styles/cinematic.css'` with `import './styles/background.css'`. |
| `src/styles/global.css` | Removed `.mouse-glow`, `.interactive-network-background`, `.cinematic-canvas-wrapper` rules + associated media queries. Simplified `.mouse-depth-card:hover` (removed 3D tilt). Kept `.magnetic-button/link`, `.mouse-depth-card`, `.hero-poster-wrapper`, `.app-content`. |
| `src/styles/hero.css` | Removed aura drift keyframes, smoke rise keyframes, content-overlay pointer-depth parallax. Simplified aura/smoke to static. Updated reduced-motion block (smoke no longer hidden, just `animation: none`). |

---

## 6. Files Kept (Still In Use)

| File | Reason |
|------|--------|
| `src/hooks/useScrollProgress.js` | Still used by `SidrahGridBackground` for the scroll progress bar. Scroll-driven (rAF only on scroll/resize). |
| `src/components/MagneticButton.jsx` | Sets its own `--magnetic-x/y` CSS vars locally via refs. No dependency on deleted `useMousePosition`. |
| `src/components/MagneticLink.jsx` | Same as above. |
| `src/components/ScrollToTop.jsx` | Unrelated to background system. |

---

## 7. Verification

### 7.1 Build

```
npm run build
✓ 160 modules transformed (down from 164)
✓ built in 6.45s
✓ dist/assets/index-BDcnahN3.js  531.70 KB (down from ~537 KB)
✓ dist/assets/index-CzBo2TO5.css  216.59 KB (down from ~221.85 KB)
```

No new errors or warnings. Pre-existing warnings unchanged:
- Duplicate `form.status` key in `CMSLanguageContext.jsx` (not related to this task)
- `insightsApi.js` mixed static/dynamic import (not related)
- Chunk size > 500 KB (not related)

### 7.2 Runtime Verification

- Preview server started on port 4173, HTTP 200.
- All public routes return 200: `/`, `/training`, `/case-studies`, `/careers`, `/insights`, `/leads/login`.
- Built CSS contains all new classes: `sidrah-grid-base`, `sidrah-grid-lines`, `sidrah-grid-glow`, `sidrah-scroll-progress`.
- Built JS contains new class strings: `sidrah-grid-base`, `sidrah-grid-lines`, `sidrah-grid-ambient`, `public-website-shell`, `sidrah-grid-shell`, `app-content`, `floating-social-bar`.
- Built JS does NOT contain old class strings: `interactive-network`, `mouse-glow`, `cinematic-layers`.

### 7.3 Visual

Browser preview confirmed the page loads with the new grid background. The user was invited to inspect via the preview URL.

---

## 8. Trade-offs & Known Limitations

1. **`.mouse-depth-card` 3D tilt removed.** The `perspective(1000px) rotateX/Y` hover effect on `InsightCard` and `CaseStudyCard` depended on `--mouse-x/y` from the deleted `useMousePosition`. The hover lift (`translateY + scale`) still works. The 3D tilt would require a per-card mouse tracker to restore.

2. **`.hero-content-overlay` mouse parallax removed.** The content overlay no longer shifts based on global mouse position. The Hero's poster parallax (`--poster-parallax-x/y`) still works — it's set locally by `CinematicHero.jsx`'s own `handleMouseMove`.

3. **No per-section mood colors.** The old `CinematicLayers` system changed background tints based on which section was in view (e.g., purple for services, gold for industries). The new background is uniform across all sections. This is by design — the section-specific gradients in `sections.css` (`.public-website-shell .services-section::before`, etc.) still provide per-section ambient differentiation.

4. **`DNA/` directory shows as deleted in git status.** This was a pre-existing state before this implementation session — not caused by this task. No action taken.

---

## 9. Performance Impact Summary

| Metric | Before | After | Delta |
|--------|--------|-------|-------|
| Continuous rAF loops (background) | 2 (network canvas + mouse position) | 0 | -2 |
| Continuous rAF loops (total) | 2 | 0 (scroll progress is event-driven) | -2 |
| Infinite CSS animations (global) | 0 | 0 | 0 |
| Infinite CSS animations (hero aura) | 2 (12s + 14s drift) | 0 | -2 |
| Infinite CSS animations (hero smoke) | 3 (24-28s rise) | 0 | -3 |
| Infinite CSS animations (hero kept) | 3 (motes, leaves, sheen) | 3 | 0 |
| Blur filters animating continuously | 5 (mouse-glow + 3 smoke + 2 aura) | 0 | -5 |
| JS modules | 164 | 160 | -4 |
| Bundle size (JS) | ~537 KB | 531.70 KB | -5.3 KB |
| Bundle size (CSS) | ~221.85 KB | 216.59 KB | -5.26 KB |

The most significant improvement is the elimination of 5 continuously animating `blur()` filters, which were the primary cause of GPU/CPU usage on the previous site. The Canvas rAF loop and mouse-position rAF loop are also gone.
