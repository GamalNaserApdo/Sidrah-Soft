# MOTION-ARCHITECTURE-001 — Animation & Transition Refactor Architecture Report

**Date:** 2026-07-16  
**Status:** ARCHITECTURE — No implementation yet  
**Scope:** Unified motion language, token system redesign, reveal animation strategy, hover/interaction transitions, reduced-motion coverage, JS hook architecture, Lenis evaluation

---

## 1. Executive Summary

The SidrahSoft web project has accumulated **three generations of motion CSS** and **four different IntersectionObserver configurations** with no shared abstraction. A token system exists in `tokens.css` but is bypassed in 80%+ of transitions. The motion preset classes in `motion.css` are dead code — `is-visible` is hardcoded in JSX, so entrance animations never fire. The `sections.css` enhanced styles defensively neutralize all entrance motion with `opacity: 1; transform: none; animation: none` on every card.

This report proposes a **unified motion language** with a single token system, one reveal animation pattern, one hover transition scale, a shared `useReveal` hook, and complete `prefers-reduced-motion` coverage — all without adding new dependencies (Lenis rejected, GSAP retained only for hero canvas).

**Key decisions:**
- **Consolidate to one token system** (`--motion-*`), deprecate `--transition-*`
- **One reveal pattern**: `auto-reveal` + `is-visible` via shared `useReveal` hook
- **Three hover durations only**: instant (100ms), fast (200ms), normal (300ms)
- **One easing curve** for all interactions: `--motion-ease-out`
- **Lenis**: Not adopted (insufficient benefit, adds complexity)
- **GSAP**: Retained only for `CinematicHero.jsx` canvas frame sequence

---

## 2. Current State Audit

### 2.1 CSS Files Reviewed

| File | Lines | Role | Motion Approach |
|---|---|---|---|
| `tokens.css` | 430+ | Design tokens | Defines both `--transition-*` and `--motion-*` systems |
| `motion.css` | 113 | Motion preset classes | 4 presets + 6 stagger delays + reduced-motion overrides |
| `hero.css` | 790+ | Hero section | 7 `@keyframes`, hardcoded durations, good reduced-motion |
| `cinematic.css` | 200+ | Ambient background | **Only file using `--motion-*` tokens consistently** |
| `cards.css` | 224 | Card design system | Uses `--transition-normal`, good touch/reduced-motion |
| `sections.css` | 4047 | Public website sections | 80+ hardcoded `0.3s ease`, `opacity:1;transform:none;animation:none` on all cards |
| `global.css` | 3438 | Header, footer, legacy, training | Mixed: `0.2s`/`0.3s`/`0.6s`/`0.8s`, some `--transition-*` |
| `primitives.css` | 430+ | UI primitives | Uses `--transition-fast`, has `@keyframes ui-spin` |
| `cms/cms.css` | 190+ | CMS admin UI | Own `@keyframes`, own `--cms-transition-*` aliases |

### 2.2 JS Hooks Reviewed

| Hook | File | Purpose | Reduced Motion | rAF | Cleanup |
|---|---|---|---|---|---|
| `useScrollProgress` | `src/hooks/useScrollProgress.js` | Scroll progress bar | Yes | Yes | Yes |
| `useMousePosition` | `src/hooks/useMousePosition.js` | Mouse → CSS custom props | Yes (skips) | Yes (permanent loop) | Yes |
| `usePublicSectionMood` | `src/hooks/usePublicSectionMood.js` | Section closest to center | N/A | No | Yes |

### 2.3 IntersectionObserver Usage

| Component | rootMargin | threshold | Reveal Class | Shared Hook |
|---|---|---|---|---|
| `AutomationShowcaseSection` | `0px 0px -10% 0px` | 0.15 | `.auto-reveal` → `.is-visible` | No (inline) |
| `TrainingPage` (hero) | `0px 0px -20% 0px` | 0.1 | `.training-hero__title--visible` | No (inline) |
| `TrainingPage` (courses) | `0px 0px -20% 0px` | 0.1 | `.training-courses__headline--visible` | No (inline) |
| `TrainingPage` (CTA) | `0px 0px -20% 0px` | 0.1 | `.training-cta__content--visible` | No (inline) |
| `usePublicSectionMood` | `-45% 0px -45% 0px` | 0 | N/A (mood state) | No |

### 2.4 GSAP Usage

Installed (`gsap@^3.13.0`) but used **only** in `src/components/hero/CinematicHero.jsx` for `ScrollTrigger`-based canvas frame-sequence scrub.

### 2.5 Keyframe Animations

| Keyframe | File | Duration | Reduced-Motion Override |
|---|---|---|---|
| `hero-aura-drift-purple/gold` | `hero.css` | 12-14s | Yes |
| `hero-mote-float` | `hero.css` | — | Yes |
| `hero-sheen-sweep` | `hero.css` | 18s | Yes |
| `hero-smoke-rise` | `hero.css` | — | Yes |
| `hero-leaf-fall` | `hero.css` | — | Yes |
| `hero-scroll-cue-pulse` | `hero.css` | 2s | Yes |
| `foundation-fade-up` | `global.css` | 0.8s | Yes |
| `cinematic-bob` | `global.css` | 2s | No |
| `ui-spin` | `primitives.css` | 0.8s | No (intentional) |
| `cms-pulse/spin/slide-in/fade-out` | `cms/cms.css` | various | No (CMS-only) |

---

## 3. Inconsistencies and Problems

### 3.1 Token System: Defined but Mostly Ignored

Tokens defined in `tokens.css:300-312` include both `--transition-*` (150ms/250ms/350ms, all `ease`) and `--motion-duration-*` (100ms/200ms/400ms/600ms/800ms, no easing). Usage:
- `var(--motion-*)`: Only in `motion.css` and `cinematic.css`
- `var(--transition-*)`: ~20 places
- **Hardcoded `0.3s ease`**: 80+ places — the dominant pattern
- **Hardcoded `0.2s ease`**: 15+ places
- **Hardcoded `0.6s ease-out`**: 10+ places
- **Hardcoded `0.8s ease-out`**: 4+ places

### 3.2 Two Parallel Token Systems

`--transition-normal` = 250ms but `--motion-duration-normal` = 400ms. No convention for when to use which. `--transition-*` bakes in `ease` while `--motion-*` separates duration from easing.

### 3.3 Three Incompatible Reveal Systems

**System A — `motion.css` presets**: 4 classes using `var(--motion-duration-normal)` (400ms). Require JS to add `.is-visible`. **All section components hardcode `is-visible`** — animation never fires.

**System B — `auto-reveal`** in `sections.css:1193`: Used only by `AutomationShowcaseSection.jsx`. Hardcoded `0.6s` (not `--motion-duration-slow`).

**System C — Legacy per-element** in `global.css`: `.contact-headline`, `.training-hero__title`, etc. Each with own duration (0.6s/0.8s), easing, translate distance (1.25rem), and `--visible` class.

### 3.4 Dead Motion Presets

Section components apply `className="motion-clip-reveal is-visible"` — preset sets `opacity: 0`, `is-visible` overrides to `opacity: 1`. Transition never fires.

### 3.5 Defensive Motion Neutralization

11 card selectors in `sections.css` have `opacity: 1; transform: none; animation: none;` — defensive patching against dead presets.

### 3.6 Eight Different Hover Durations

`0.2s`, `0.25s`, `0.3s`, `0.5s`, `0.6s`, `0.8s`, `var(--transition-fast)` (150ms), `var(--transition-normal)` (250ms). No convention.

### 3.7 Easing: Custom Curves Unused

~90% of transitions use browser-default `ease`. The `--motion-ease-out` curve is virtually unused.

### 3.8 Incomplete Reduced-Motion Coverage

**Gaps in `global.css`**: Header, mouse system, floating bar, marquee, footer links, contact form, training reveals.

### 3.9 No Shared `useReveal` Hook

Four different IntersectionObserver configs. `TrainingPage.jsx` creates 3 separate observers.

### 3.10 `will-change` Inconsistent

Set on non-animating `.career-card`, missing on all `sections.css` hover-transform cards.

### 3.11 No Scroll Smoothing

`scrollIntoView({ behavior: 'smooth' })` relies on native browser behavior.

---

## 4. Unified Motion Language Design

### 4.1 Design Principles

1. **One token system** — Consolidate into `--motion-*`
2. **One reveal pattern** — `auto-reveal` + `is-visible` via `useReveal` hook
3. **Three hover durations** — instant (100ms), fast (200ms), normal (300ms)
4. **One easing** — `--motion-ease-out` for all interactions
5. **One stagger interval** — 80ms
6. **Complete reduced-motion** — every transition has an override
7. **No new dependencies** — Lenis rejected, GSAP for hero only
8. **CSS-first** — JS only toggles classes

### 4.2 Motion Categories

| Category | Duration | Easing | Example |
|----------|----------|--------|---------|
| **Instant** | 100ms | `--motion-ease-out` | Link color hover, tag hover |
| **Fast** | 200ms | `--motion-ease-out` | Header padding, form fields, icon transforms |
| **Normal** | 300ms | `--motion-ease-out` | Card lift, border-color, box-shadow, arrows |
| **Slow** | 600ms | `--motion-ease-out` | `auto-reveal` entrances |
| **Cinematic** | 800ms | `--motion-ease-out` | Ambient color shift, foundation fade-up |

### 4.3 Interaction → Category Mapping

| Interaction | Category |
|-------------|----------|
| Link/text color hover | Instant |
| Tag/chip border hover | Instant |
| Header padding on scroll | Fast |
| Form field border/box-shadow | Fast |
| Icon transform | Fast |
| Header link underline | Fast |
| Card border + box-shadow | Normal |
| Card transform (translateY) | Normal |
| CTA arrow translateX | Normal |
| Button background/border | Normal |
| Partner logo filter | Normal |
| Footer social link | Normal |
| Section heading reveal | Slow |
| Card grid reveal (staggered) | Slow |
| Training hero title | Cinematic |
| Ambient color shift | Cinematic |
| Foundation fade-up | Cinematic |

---

## 5. Token System Redesign

### 5.1 Proposed Token Set

```css
:root {
  --motion-duration-instant: 100ms;
  --motion-duration-fast: 200ms;
  --motion-duration-normal: 300ms;
  --motion-duration-slow: 600ms;
  --motion-duration-cinematic: 800ms;

  --motion-ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --motion-ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --motion-ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

  --motion-transition-instant: var(--motion-duration-instant) var(--motion-ease-out);
  --motion-transition-fast: var(--motion-duration-fast) var(--motion-ease-out);
  --motion-transition-normal: var(--motion-duration-normal) var(--motion-ease-out);
  --motion-transition-slow: var(--motion-duration-slow) var(--motion-ease-out);
  --motion-transition-cinematic: var(--motion-duration-cinematic) var(--motion-ease-out);

  --motion-stagger-interval: 80ms;
  --motion-reveal-distance: 1.5rem;
}
```

### 5.2 Token Migration

| Old Token | New Token | Value Change |
|-----------|-----------|--------------|
| `--transition-fast: 150ms ease` | `--motion-duration-fast: 200ms` | 150→200ms |
| `--transition-normal: 250ms ease` | `--motion-duration-normal: 300ms` | 250→300ms |
| `--transition-slow: 350ms ease` | `--motion-duration-slow: 600ms` | 350→600ms |
| `--motion-duration-normal: 400ms` | `--motion-duration-normal: 300ms` | 400→300ms |

### 5.3 Deprecation Phases

1. Add new `--motion-*` tokens alongside existing `--transition-*`
2. Replace hardcoded `0.3s ease` → `var(--motion-transition-normal)`
3. Replace hardcoded `0.2s ease` → `var(--motion-transition-fast)`
4. Replace `var(--transition-*)` → `var(--motion-transition-*)`
5. Remove `--transition-*` from `tokens.css`
6. Update `--cms-transition-*` aliases

---

## 6. Reveal Animation Strategy

### 6.1 Unified `auto-reveal` Class

```css
.auto-reveal {
  opacity: 0;
  transform: translateY(var(--motion-reveal-distance));
  transition:
    opacity var(--motion-duration-slow) var(--motion-ease-out),
    transform var(--motion-duration-slow) var(--motion-ease-out);
  will-change: opacity, transform;
}
.auto-reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
}
```

### 6.2 Variants

```css
.auto-reveal--scale { transform: scale(0.96); }
.auto-reveal--scale.is-visible { transform: scale(1); }

.auto-reveal--clip {
  clip-path: inset(0 100% 0 0); transform: none;
  transition: clip-path var(--motion-duration-slow) var(--motion-ease-out);
}
.auto-reveal--clip.is-visible { clip-path: inset(0 0 0 0); }
[dir='rtl'] .auto-reveal--clip { clip-path: inset(0 0 0 100%); }
```

### 6.3 Stagger

```css
.stagger-1 { transition-delay: calc(var(--motion-stagger-interval) * 1); }
/* ... through stagger-6 */
```

### 6.4 Migration

- **System A**: Remove presets from `motion.css`, remove `is-visible` hardcoding, use `auto-reveal` + `useReveal`
- **System B**: Update to `var(--motion-duration-slow)` and `var(--motion-reveal-distance)`
- **System C**: Replace per-element classes with `auto-reveal`, remove `--visible` classes, use `useReveal`
- **Card neutralization**: Remove `opacity:1;transform:none;animation:none;` from 11 selectors

---

## 7. Hover/Interaction Transition Strategy

### 7.1 Standardized Durations

| Token | Value | Use For |
|-------|-------|---------|
| `--motion-transition-instant` | 100ms | Text color, tag border |
| `--motion-transition-fast` | 200ms | Header, form fields, icons, underlines |
| `--motion-transition-normal` | 300ms | Cards, buttons, CTA arrows, social links |

### 7.2 Replacement Mapping

| Current | Count | New |
|---------|-------|-----|
| `0.2s ease` | ~15 | `var(--motion-transition-fast)` |
| `0.25s ease` | ~2 | `var(--motion-transition-fast)` |
| `0.3s ease` | ~80+ | `var(--motion-transition-normal)` |
| `0.5s ease` | ~2 | `var(--motion-transition-slow)` |
| `0.6s ease-out` | ~10 | `var(--motion-transition-slow)` |
| `0.8s ease-out` | ~4 | `var(--motion-transition-cinematic)` |
| `var(--transition-fast)` | ~10 | `var(--motion-transition-fast)` |
| `var(--transition-normal)` | ~10 | `var(--motion-transition-normal)` |

---

## 8. Reduced-Motion Coverage Strategy

### 8.1 Global Catch-All

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .ui-spinner, .cms-skeleton, .cms-spinner {
    animation-duration: var(--motion-duration-fast) !important;
    animation-iteration-count: infinite !important;
  }
}
```

### 8.2 Gaps to Fill

| File | Missing Selectors |
|---|---|
| `global.css` | Header, mouse system, floating bar, marquee, footer, contact form, training |
| `primitives.css` | `.ui-input` (keep spinner) |
| `leads.css` | All transitions |
| `cms/cms.css` | All transitions (keep skeleton/spinner) |

---

## 9. JS Hook Architecture

### 9.1 `useReveal` Hook

```js
function useReveal(options = {}) {
  const config = { rootMargin: '0px 0px -10% 0px', threshold: 0.15, once: true, ...options };
  const containerRef = useRef(null);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const els = container.querySelectorAll('.auto-reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          if (config.once) observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: config.rootMargin, threshold: config.threshold });
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [config.rootMargin, config.threshold, config.once]);
  return containerRef;
}
```

### 9.2 Migration

| Component | Current | After |
|---|---|---|
| `AutomationShowcaseSection` | Inline IO | `useReveal()` |
| `TrainingPage` | 3 inline IOs | 3 `useReveal()` calls |
| 6 section components | `is-visible` hardcoded | `useReveal()` + remove `is-visible` |

### 9.3 Existing Hooks

`useScrollProgress`, `useMousePosition`, `usePublicSectionMood` — all well-implemented, no changes needed.

---

## 10. Lenis Evaluation

### Decision: Do Not Adopt

**Rationale**:
1. Site's motion identity is cinematic but subtle — not the inertia-heavy feel Lenis provides
2. DNA quality bar emphasizes "Smooth Scroll Storytelling" but native smooth scroll + IO reveals already deliver this
3. Adds a permanent rAF scroll loop competing with existing `useMousePosition` and `useScrollProgress` loops
4. `AutomationShowcaseSection.jsx` explicitly states "No Lenis" — existing architectural decision
5. Native `scroll-behavior: smooth` + `scrollIntoView({ behavior: 'smooth' })` covers anchor navigation
6. 2KB savings vs added complexity not justified

**Alternative**: Add `scroll-behavior: smooth` to `html` in `global.css` (currently missing) for one-line improvement.

---

## 11. Implementation Phases

### Phase 1: Token Consolidation
- Add `--motion-*` tokens to `tokens.css`
- Add composite `--motion-transition-*` presets
- Update `--cms-transition-*` aliases
- **No visual change**

### Phase 2: Hover Transition Migration
- Replace hardcoded durations in `sections.css`, `global.css`, `hero.css`
- Replace `var(--transition-*)` references
- **Slight timing adjustments** (250→300ms, 150→200ms)

### Phase 3: Reveal Animation Unification
- Update `auto-reveal` to use tokens
- Add variants to `motion.css`
- Remove dead preset classes
- Create `useReveal` hook
- Migrate `AutomationShowcaseSection`, `TrainingPage`, 6 section components
- Remove `is-visible` hardcoding
- Remove card neutralization from `sections.css`
- **Section content now animates on scroll**

### Phase 4: Reduced-Motion Coverage
- Add global catch-all in `motion.css`
- Fill gaps in `global.css`, `primitives.css`, `leads.css`, `cms/cms.css`
- **Reduced-motion users see no transitions**

### Phase 5: Cleanup
- Remove `--transition-*` tokens from `tokens.css`
- Remove legacy per-element reveal CSS from `global.css`
- Remove `foundation-fade-up` keyframe (replaced by `auto-reveal`)
- Add `will-change` to `sections.css` hover-transform cards
- Remove `will-change` from non-animating `.career-card`
- Add `scroll-behavior: smooth` to `html` in `global.css`

---

## 12. Files Affected

| File | Phase | Changes |
|---|---|---|
| `src/styles/tokens.css` | 1, 5 | Add `--motion-*` tokens, remove `--transition-*` |
| `src/styles/motion.css` | 3, 4 | Replace presets with `auto-reveal`, add global catch-all |
| `src/styles/sections.css` | 2, 3 | Replace hardcoded durations, remove card neutralization, update `auto-reveal` |
| `src/styles/global.css` | 2, 3, 4, 5 | Replace durations, replace legacy reveals, fill reduced-motion gaps, add `scroll-behavior` |
| `src/styles/hero.css` | 2 | Replace hardcoded durations with tokens |
| `src/styles/cards.css` | 2 | Update `--transition-*` to `--motion-*` |
| `src/styles/primitives.css` | 2, 4 | Update tokens, add reduced-motion block |
| `src/styles/leads.css` | 2, 4 | Update tokens, add reduced-motion block |
| `src/styles/cms/cms.css` | 4 | Add reduced-motion block |
| `src/styles/cinematic.css` | 2 | Update `--motion-duration-normal` value (400→300ms) |
| `src/hooks/useReveal.js` | 3 | **New file** — shared reveal hook |
| `src/components/sections/AutomationShowcaseSection.jsx` | 3 | Replace inline IO with `useReveal` |
| `src/components/sections/ServicesSection.jsx` | 3 | Use `useReveal`, remove `is-visible` |
| `src/components/sections/PartnersTrustSection.jsx` | 3 | Same |
| `src/components/sections/InsightsSection.jsx` | 3 | Same |
| `src/components/sections/CaseStudiesSection.jsx` | 3 | Same |
| `src/components/sections/ContactSection.jsx` | 3 | Same |
| `src/components/sections/FoundationSection.jsx` | 3 | Same |
| `src/components/pages/TrainingPage.jsx` | 3 | Replace 3 IOs with `useReveal` |

---

## 13. Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Reveal animations appearing where they didn't before | Medium | Phase 3 is the most visible change. Test each section individually. If any section looks wrong with entrance animation, simply omit `auto-reveal` class from that element. |
| Token value changes causing jarring timing shifts | Low | The changes are small (250→300ms, 150→200ms). Most users won't notice. |
| `useReveal` hook not firing for dynamically rendered content | Medium | Hook queries `.auto-reveal` on mount. If content loads async (CMS), add a re-query mechanism or use a MutationObserver. |
| Global reduced-motion catch-all breaking loading spinners | Low | Explicit exemptions for `.ui-spinner`, `.cms-skeleton`, `.cms-spinner` in the catch-all. |
| GSAP ScrollTrigger conflict with new reveal animations | Low | GSAP is isolated to `CinematicHero.jsx`. No conflict with `auto-reveal` in section components. |

---

## 14. Verdict

**Status**: ARCHITECTURE COMPLETE — Ready for implementation  
**Approach**: CSS-first unified motion language with shared `useReveal` hook  
**New dependencies**: Zero  
**New files**: 1 (`src/hooks/useReveal.js`)  
**Files modified**: ~19  
**Estimated effort**: 3-4 implementation sessions (one per phase)  
**Risk level**: Medium (Phase 3 is most visible — entrance animations will appear where they didn't before)
