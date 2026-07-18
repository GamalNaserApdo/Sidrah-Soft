# SIDRAH-HERO-REBUILD-001 — Implementation Report

**Date:** 2026-07-13  
**Status:** PASS  
**Build:** npm run build — EXIT 0

---

## Summary

Rebuilt the cinematic hero section with bilingual content overlay, atmospheric visual layers (aura, motes, sheen), scroll-driven narrative phases, pointer-based depth parallax, and a smooth hero-to-foundation transition. Demoted Foundation heading from h1 to h2 to maintain single-h1 document structure.

---

## Files Created

| File | Purpose |
|------|---------|
| `src/components/hero/HeroContent.jsx` | Bilingual eyebrow, h1 headline, supporting text, dual CTAs, capability line |
| `src/components/hero/HeroAura.jsx` | Two animated radial glow blobs (purple + gold) with drift keyframes |
| `src/components/hero/HeroMotes.jsx` | 12 deterministic floating particle motes with pseudo-random positions |
| `src/components/hero/HeroSheen.jsx` | Slow diagonal light sweep across hero canvas |
| `src/components/hero/HeroScrollCue.jsx` | Bilingual "Scroll to explore" text with animated vertical line |
| `src/styles/hero.css` | All hero content, aura, motes, sheen, scroll cue, pointer depth, mobile, reduced motion CSS |

## Files Modified

| File | Changes |
|------|---------|
| `src/i18n/en.js` | Added `hero` object with 8 keys (eyebrow, headline, supporting, primaryCta, secondaryCta, capabilityLine, scrollCue, loadingText, errorText) |
| `src/i18n/ar.js` | Added matching Arabic `hero` translations |
| `src/main.jsx` | Added `import './styles/hero.css'` after cinematic.css |
| `src/components/hero/CinematicHero.jsx` | Full refactor: imported all sub-components, added content overlay/scroll cue refs, scroll narrative logic (content fade 12%-42%, canvas fade 85%-100%), pointer depth via --mouse-x/--mouse-y, i18n loading/error states, hero-foundation-transition div |
| `src/components/sections/FoundationSection.jsx` | Demoted `as="h1"` to `as="h2"` on SectionHeading |
| `src/styles/sections.css` | Changed `#foundation-heading` font-size from `--font-size-h1` to `--font-size-h2` |

---

## Architecture

### Scroll Narrative Phases

| Progress | Phase | Effect |
|----------|-------|--------|
| 0.00–0.03 | Intro | Content visible, scroll cue visible |
| 0.03–0.12 | Hold | Content visible, scroll cue hidden |
| 0.12–0.42 | Content fade | Content opacity 1→0, translateY 0→-2rem |
| 0.42–0.85 | Pure canvas | Only canvas frame sequence visible |
| 0.85–1.00 | Canvas fade | Canvas wrapper opacity 1→0, foundation revealed |

### Visual Layers (z-index stack)

| z-index | Layer |
|---------|-------|
| 1 | Canvas (existing) |
| 1 | HeroAura, HeroMotes, HeroSheen |
| 2 | HeroTextProtection (gradient overlay) |
| 3 | HeroContentOverlay (bilingual content) |
| 4 | HeroScrollCueWrapper |
| 5 | HeroFoundationTransition (bottom gradient) |

### Pointer Depth

- Uses existing `--mouse-x` / `--mouse-y` CSS variables set by `useMousePosition` hook (via `MouseGlow` component in App.jsx)
- Applied to `.hero-content-overlay` as `translate(mouse-x * 8px, mouse-y * 6px)`
- Desktop only: `(hover: hover) and (pointer: fine)`
- Disabled on touch devices and reduced motion

### Reduced Motion

- All content elements set to opacity:1, transform:none
- Aura/mote/sheen animations disabled
- Sheen display:none
- Pointer depth transform:none
- Content reveal class applied immediately (no transition delays)

### Mobile Responsive

- Content overlay: centered, text-align center
- Headline: clamp(1.625rem, 7vw, 2.25rem)
- CTAs: full-width stacked column
- Aura glows: reduced size (24rem/18rem)
- Motes and sheen: display:none on coarse pointer
- Scroll cue: reduced height
- Foundation transition: reduced height (5rem)

---

## Validation

| Check | Result |
|-------|--------|
| npm run build | PASS (exit 0, 10.32s) |
| Bundle size | 651.67 kB JS / 205.89 kB CSS |
| New files | 6 (5 components + 1 CSS) |
| Modified files | 6 |
| i18n keys added | 8 EN + 8 AR |

---

## Open Items

- Visual QA in browser recommended (scroll narrative timing, pointer depth intensity)
- Consider code-splitting hero frames to reduce bundle size warning
