# SIDRAH-HERO-HIGGSFIELD-INTEGRATION-003A — Digital Sidrah Integration Architecture

**Date:** 2026-07-16  
**Status:** PASS  
**Phase:** Architecture and integration planning only — no code modified, no assets generated  
**Visual Approval:** PENDING USER VISUAL APPROVAL

---

## 1. Current Hero Architecture Review

### 1.1 Component Stack

```
<App>
  <InteractiveNetworkBackground />          z: fixed, behind everything
  <MouseGlow />                             z: fixed, pointer follower
  <FloatingSocialBar />                     z: fixed, social links
  <PublicWebsiteShell>
    <CinematicLayers>                       z: --z-base (0), fixed
      <cinematic-ambient />                 fixed, mood-colored background
      <cinematic-glow />                    fixed, radial gradient glow
      <cinematic-vignette />                fixed, edge darkening
      <cinematic-grain />                   fixed, SVG noise texture
      <cinematic-progress />                fixed, scroll progress bar
    </CinematicLayers>
    <public-route-content>                  z: --z-content (1)
      <HomeSections>
        <CinematicHero>                     z: 2, height: 250vh (desktop) / 200vh (mobile)
          <cinematic-canvas-wrapper>
            <canvas>                        z: implicit (in-flow)
            <hero-text-protection />         z: 2, gradient overlay
            <HeroAura>                      z: 1, purple + gold radial glows
              <hero-aura-glow--purple />
              <hero-aura-glow--gold />
            <HeroMotes>                     z: 1, 12 floating gold particles
              <hero-mote /> × 12
            <HeroSheen>                     z: 1, diagonal light sweep
              <hero-sheen-sweep />
            <hero-foundation-transition />   z: 5, bottom gradient blend
            <hero-content-overlay>           z: 3, text content
              <hero-content-inner>
                <HeroContent>               eyebrow, h1, supporting, CTAs, capability
              </hero-content-inner>
            <hero-scroll-cue-wrapper>        z: 4, scroll indicator
              <HeroScrollCue />
            <cinematic-status>              loading/error display
          </cinematic-canvas-wrapper>
        </CinematicHero>
        <FoundationSection>                 next section in flow
        ...
      </HomeSections>
    </public-route-content>
  </PublicWebsiteShell>
</App>
```

### 1.2 Z-Index Map (inside `.cinematic-canvas-wrapper`)

| Layer | z-index | Element |
|---|---|---|
| Canvas (base) | auto | `<canvas>` — frame sequence |
| Text protection | 2 | `.hero-text-protection` — gradient |
| Aura | 1 | `.hero-aura` — purple/gold glows |
| Motes | 1 | `.hero-motes` — floating particles |
| Sheen | 1 | `.hero-sheen` — light sweep |
| Foundation transition | 5 | `.hero-foundation-transition` — bottom blend |
| Content overlay | 3 | `.hero-content-overlay` — text + CTAs |
| Scroll cue | 4 | `.hero-scroll-cue-wrapper` — indicator |

### 1.3 Scroll Narrative (from `CinematicHero.jsx:164-193`)

| Progress | What happens |
|---|---|
| 0.00-0.12 | Content fully visible, scroll cue visible |
| 0.12-0.42 | Content fades out + lifts up (opacity 1→0, translateY 0→-2rem) |
| 0.42-0.85 | Content hidden, canvas frames scrub through transformation |
| 0.85-1.00 | Canvas wrapper fades out (opacity 1→0) — handoff to Foundation |

### 1.4 Key Observations

- **Canvas is the base layer** — all decorative layers (aura, motes, sheen) sit at z-index 1, above the canvas but below text protection and content
- **Aura/motes/sheen are generic** — they float over whatever the canvas shows, with no connection to a visual subject
- **No "tree" layer exists** — the current architecture has no dedicated layer for a central visual subject
- **Text protection is heavy** — 0.55-0.92 opacity gradient compensates for lack of compositional negative space
- **Foundation transition is a simple gradient** — bottom 8rem blends to `rgba(14, 12, 22, 0.95)`
- **Pointer depth only affects content overlay** — `--mouse-x`/`--mouse-y` translate the content, not the visual layers
- **Section height is 250vh** (desktop) / 200vh (mobile) — scroll distance drives the frame sequence

---

## 2. Digital Sidrah Integration Plan

### 2.1 New Layer Architecture

Proposed z-index stack inside `.cinematic-canvas-wrapper`:

| z-index | Layer | Purpose | Status |
|---|---|---|---|
| 0 | Canvas (frame sequence) | Scroll-scrubbed Digital Sidrah transformation | **Future asset swap** |
| 1 | HeroSmoke (NEW) | Volumetric upward digital smoke/energy | **New component** |
| 1 | HeroAura (existing) | Purple + gold radial glows — retained | **Adjust opacity** |
| 1 | HeroMotes (existing) | Floating gold particles — repurposed as data particles | **Reduce count, adjust behavior** |
| 1 | HeroSheen (existing) | Light sweep — retained | **Adjust opacity** |
| 1.5 | HeroLeaves (NEW) | Falling digital leaves / data fragments | **New component** |
| 2 | Text protection (existing) | Gradient overlay — reduced opacity | **Adjust** |
| 3 | Content overlay (existing) | Text + CTAs | **Unchanged** |
| 4 | Scroll cue (existing) | Scroll indicator | **Unchanged** |
| 5 | Foundation transition (existing) | Bottom blend | **Adjust color** |

### 2.2 Digital Tree Core Visual — Placement

**Recommendation: The tree IS the canvas frame sequence.**

The Digital Sidrah tree should be the content of the scroll-scrubbed canvas frames — not a separate DOM element layered on top. This is the safest approach because:

1. **No new rendering engine needed** — the canvas already handles scroll-synchronized frame display
2. **No layering conflicts** — the tree doesn't compete with other layers for z-index
3. **Scroll synchronization is built-in** — the tree grows as you scroll, driven by the existing ScrollTrigger
4. **Performance is proven** — 121 WebP frames preloaded in batches, drawn to canvas

**What changes:** Only the frame content (asset swap, planned for phase 003B/003C). The code architecture remains identical.

**What this phase adds:** Atmospheric layers (smoke, leaves) that complement the future tree visual without requiring it to exist yet.

### 2.3 Text-Safe Zones

With the Digital Sidrah concept, the tree occupies the upper 60% of the frame, centered. The lower third is intentionally dark negative space.

| Zone | Area | Content |
|---|---|---|
| **Tree zone** | Upper 60%, centered | Digital Sidrah (canvas frames) |
| **Text zone (LTR)** | Lower-left, 42rem wide, bottom 40% | Eyebrow, h1, supporting, CTAs, capability |
| **Text zone (RTL)** | Lower-right, 42rem wide, bottom 40% | Same content, right-aligned |
| **Atmosphere zone** | Full frame, behind tree | Smoke, aura, motes |
| **Leaf zone** | Full frame, in front of tree but behind text | Falling data fragments |

**Text protection adjustment:** With intentional dark negative space in the new frames, reduce the gradient from 0.55/0.92 to 0.35/0.75. The composition provides primary contrast; the gradient is a safety net.

### 2.4 Interaction with Current Hero Content

- `HeroContent.jsx` — **no change needed**. Content sits in the lower portion, below the tree.
- `HeroScrollCue.jsx` — **no change needed**. Sits at bottom center, below the tree.
- Pointer depth — **potential enhancement**: currently only translates the content overlay. Could also subtly translate the smoke/leaf layers for added depth. This is optional and should be evaluated during implementation.

---

## 3. Atmospheric Smoke System Recommendation

### 3.1 Concept

Soft, volumetric upward digital smoke — energy emerging from where the Digital Sidrah's roots meet the ground. Not fire, not fog, not magic. Digital energy: thin wisps of purple and gold that rise slowly and dissipate.

### 3.2 Technical Approach: CSS-First

**Recommendation: Pure CSS implementation using layered radial gradients with mask animation.**

No JavaScript animation loop needed. No canvas. No WebGL. Just CSS `@keyframes` and `mask-image`.

#### Component: `HeroSmoke.jsx`

```jsx
function HeroSmoke() {
  return (
    <div className="hero-smoke" aria-hidden="true">
      <div className="hero-smoke-wisp hero-smoke-wisp--1" />
      <div className="hero-smoke-wisp hero-smoke-wisp--2" />
      <div className="hero-smoke-wisp hero-smoke-wisp--3" />
    </div>
  );
}
```

#### CSS Architecture

```css
.hero-smoke {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  overflow: hidden;
}

.hero-smoke-wisp {
  position: absolute;
  bottom: -10%;
  width: 40%;
  height: 70%;
  background: radial-gradient(
    ellipse at bottom,
    rgba(139, 92, 246, 0.04) 0%,
    rgba(201, 169, 110, 0.02) 40%,
    transparent 70%
  );
  filter: blur(2rem);
  will-change: transform, opacity;
  animation: hero-smoke-rise 20s ease-in-out infinite;
}

.hero-smoke-wisp--1 {
  left: 20%;
  animation-delay: 0s;
  animation-duration: 22s;
}

.hero-smoke-wisp--2 {
  left: 45%;
  animation-delay: -7s;
  animation-duration: 28s;
  background: radial-gradient(
    ellipse at bottom,
    rgba(201, 169, 110, 0.035) 0%,
    rgba(139, 92, 246, 0.02) 40%,
    transparent 70%
  );
}

.hero-smoke-wisp--3 {
  left: 65%;
  animation-delay: -14s;
  animation-duration: 25s;
}

@keyframes hero-smoke-rise {
  0% {
    transform: translateY(0) scaleY(0.8);
    opacity: 0;
  }
  20% {
    opacity: 0.6;
  }
  80% {
    opacity: 0.3;
  }
  100% {
    transform: translateY(-60%) scaleY(1.2);
    opacity: 0;
  }
}
```

### 3.3 Design Principles

- **3 wisps only** — sparse, not a fog bank
- **Extremely low opacity** (0.02-0.04 base alpha) — barely perceptible, adds atmosphere without distraction
- **Slow movement** (20-28 second cycles) — contemplative, not urgent
- **Purple + gold tones** — matches brand palette, emerges from the tree's base
- **Large blur radius** (2rem) — soft, volumetric, not sharp edges
- **Upward motion only** — energy rising, never descending

### 3.4 Why Not Canvas/JS Smoke?

- CSS gradients with blur are GPU-accelerated and nearly free
- A canvas-based smoke system would require a particle simulation (requestAnimationFrame loop, per-particle physics) — significant CPU/GPU cost
- The visual difference between 3 CSS blurred gradients and a 100-particle canvas simulation is negligible at these opacity levels
- CSS approach is trivially mobile-safe and reduced-motion safe

### 3.5 Mobile Considerations

- Reduce to 2 wisps on mobile (hide `--3`)
- Reduce blur radius to 1.5rem
- Reduce wisp height to 50%
- Already disabled on touch devices if desired (can gate with `@media (hover: hover)`)

### 3.6 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .hero-smoke-wisp {
    animation: none;
    opacity: 0;
  }
}
```

Smoke is purely decorative — hiding it entirely under reduced motion is correct.

### 3.7 Scroll Interaction

Smoke should **intensify slightly at the beginning** (when the tree spark is visible) and **fade as the tree reaches full bloom** (the energy has been absorbed into the structure).

Implementation: In `CinematicHero.jsx`'s `updateScrollUi()`, set a CSS custom property on the smoke container:

```javascript
if (smokeRef.current) {
  const smokeIntensity = Math.max(0, 1 - progress * 1.5); // fades by 67% scroll
  smokeRef.current.style.opacity = String(smokeIntensity);
}
```

This is a single opacity setter — no per-frame animation, no rAF loop. The CSS keyframes continue running; only the container opacity changes.

---

## 4. Digital Leaves / Data Particles Recommendation

### 4.1 Concept

Sparse, slow-falling digital leaves — small glowing fragments that drift downward like data settling from the tree's canopy. They suggest intelligence, data, transformation. Not confetti, not snow, not sparks.

### 4.2 Technical Approach: CSS-First with JS Positioning

**Recommendation: CSS keyframe animations with JS-generated random positions (same pattern as existing `HeroMotes.jsx`).**

This follows the proven pattern already in the codebase — `HeroMotes.jsx` generates 12 particles with deterministic pseudo-random positions via `useMemo` and animates them with CSS keyframes.

#### Component: `HeroLeaves.jsx`

```jsx
import { useMemo } from 'react';

const LEAF_COUNT = 6;  // sparse — premium, not busy

function HeroLeaves() {
  const leaves = useMemo(() => {
    return Array.from({ length: LEAF_COUNT }, (_, i) => {
      const seed = i * 211 + 73;
      const x = (seed * 7919) % 100;
      const delay = ((seed * 389) % 1000) / 100;
      const duration = 12 + ((seed * 127) % 800) / 100;  // 12-20s — very slow
      const size = 3 + ((seed * 53) % 40) / 10;           // 3-7px — small
      const drift = ((seed * 97) % 60) - 30;               // -30 to +30px horizontal drift
      const opacity = 0.08 + ((seed * 97) % 12) / 100;     // 0.08-0.20 — very subtle
      return { id: i, x, delay, duration, size, drift, opacity };
    });
  }, []);

  return (
    <div className="hero-leaves" aria-hidden="true">
      {leaves.map((leaf) => (
        <span
          key={leaf.id}
          className="hero-leaf"
          style={{
            left: `${leaf.x}%`,
            width: `${leaf.size}px`,
            height: `${leaf.size}px`,
            opacity: leaf.opacity,
            animationDelay: `${leaf.delay}s`,
            animationDuration: `${leaf.duration}s`,
            '--leaf-drift': `${leaf.drift}px`,
          }}
        />
      ))}
    </div>
  );
}
```

#### CSS Architecture

```css
.hero-leaves {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  overflow: hidden;
}

.hero-leaf {
  position: absolute;
  top: -5%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201, 169, 110, 0.5), transparent 70%);
  box-shadow: 0 0 4px rgba(201, 169, 110, 0.15);
  animation: hero-leaf-fall linear infinite;
  will-change: transform, opacity;
}

@keyframes hero-leaf-fall {
  0% {
    transform: translateY(0) translateX(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: var(--leaf-opacity, 0.15);
  }
  85% {
    opacity: var(--leaf-opacity, 0.15);
  }
  100% {
    transform: translateY(100vh) translateX(var(--leaf-drift, 0px)) rotate(180deg);
    opacity: 0;
  }
}
```

### 4.3 Design Principles

- **6 leaves only** — extremely sparse. Premium = restraint.
- **Very slow** (12-20 second fall duration) — contemplative, not busy
- **Very small** (3-7px) — subtle glints of data, not prominent shapes
- **Very low opacity** (0.08-0.20) — barely visible, adds texture without distraction
- **Gold color** — matches the tree's primary light color
- **Gentle horizontal drift** — organic, not straight-line falling
- **Slow rotation** — suggests a leaf/data fragment, not a pixel
- **Fades in at top, fades out at bottom** — no sudden appearance/disappearance

### 4.4 Relationship to Existing HeroMotes

`HeroMotes` (12 particles) currently float **upward** with small translate movements. `HeroLeaves` (6 particles) would fall **downward** through the full viewport.

**Recommendation: Repurpose HeroMotes as "rising energy" and add HeroLeaves as "falling data."**

- `HeroMotes` (reduce to 8): upward-floating gold dust — energy rising from the tree's base
- `HeroLeaves` (6): downward-falling data fragments — data settling from the canopy

Together they create a **bidirectional flow**: energy rises, data falls. This visualizes the transformation cycle of the Digital Sidrah.

### 4.5 Mobile Considerations

- Reduce to 4 leaves on mobile
- Increase fall duration (slower on mobile — less distracting)
- Already disabled on touch devices if desired (gate with `@media (hover: hover)`)

### 4.6 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .hero-leaf {
    animation: none;
    opacity: 0;
  }
}
```

### 4.7 Scroll Interaction

Leaves should **increase in density slightly as the tree grows** (more data fragments as the system becomes more complex), then **fade as the hero resolves**.

Implementation: In `updateScrollUi()`, adjust container opacity:

```javascript
if (leavesRef.current) {
  // Ramp up from 0-50%, fade out from 85-100%
  let leafIntensity;
  if (progress < 0.5) {
    leafIntensity = progress * 2;  // 0 → 1 at 50%
  } else if (progress < 0.85) {
    leafIntensity = 1;
  } else {
    leafIntensity = 1 - ((progress - 0.85) / 0.15);  // 1 → 0 at 100%
  }
  leavesRef.current.style.opacity = String(leafIntensity);
}
```

---

## 5. Scroll Interaction Recommendation

### 5.1 Principle: Do NOT Change Existing Narrative Phases

The existing scroll narrative (`CinematicHero.jsx:164-193`) is well-tuned:
- Content fade: 12-42%
- Canvas fade: 85-100%

These phases remain **unchanged**. New layers (smoke, leaves) respond to the same `progress` value via CSS custom properties set in `updateScrollUi()`.

### 5.2 Scroll-Responsive Layer Behavior

| Progress | Canvas (tree) | Smoke | Leaves | Aura | Motes | Sheen |
|---|---|---|---|---|---|---|
| 0.00 (spark) | Frame 0 | Full intensity | 0 (ramping in) | Full | Full | Full |
| 0.15 (sapling) | ~Frame 18 | High | 0.3 | Full | Full | Full |
| 0.35 (mid-growth) | ~Frame 42 | Medium | 0.7 | Full | Full | Full |
| 0.50 (full bloom) | ~Frame 60 | Low | 1.0 (peak) | Full | Full | Full |
| 0.85 (resolution) | ~Frame 102 | 0 | 0 (fading) | Full | Full | Full |
| 1.00 (handoff) | Frame 120 | 0 | 0 | Fading | Fading | Fading |

### 5.3 Implementation

All scroll-responsive behavior is handled in `updateScrollUi()` by setting CSS custom properties or opacity on container refs. No new ScrollTrigger instances needed. No new rAF loops.

```javascript
// In updateScrollUi():
if (smokeRef.current) {
  smokeRef.current.style.opacity = String(Math.max(0, 1 - progress * 1.5));
}
if (leavesRef.current) {
  let leafIntensity;
  if (progress < 0.5) leafIntensity = progress * 2;
  else if (progress < 0.85) leafIntensity = 1;
  else leafIntensity = Math.max(0, 1 - (progress - 0.85) / 0.15);
  leavesRef.current.style.opacity = String(leafIntensity);
}
```

### 5.4 Tree Prominence

The tree's prominence is already driven by the canvas frame sequence — as you scroll, the tree grows from spark to full bloom. No additional scroll interaction is needed for the tree itself. The smoke and leaves **complement** the tree's growth narrative.

### 5.5 Hero Atmosphere

The existing `CinematicLayers` ambient system (`cinematic.css:86-95`) already shifts the ambient mood from `hero` to `foundation` based on scroll position via `usePublicSectionMood`. This continues to work — no change needed.

---

## 6. Foundation Transition Recommendation

### 6.1 Current State

- `.hero-foundation-transition` (`hero.css:577-592`): bottom 8rem gradient from transparent to `rgba(14, 12, 22, 0.95)`
- Canvas wrapper fades out at 85-100% progress
- `CinematicLayers` ambient shifts from `hero` mood to `foundation` mood

### 6.2 Recommended Changes

1. **Adjust gradient end color**: Change `rgba(14, 12, 22, 0.95)` to `rgba(10, 11, 16, 0.95)` to match the Digital Sidrah's edge color (`#0a0b10`)

2. **Add smoke dissipation to transition**: The smoke should be fully gone by 67% scroll (well before the transition). This ensures no smoke bleeds into Foundation.

3. **Add leaf fade to transition**: Leaves fade out at 85-100%, synchronized with the canvas fade. Data fragments dissolve as the hero resolves.

4. **Enhanced transition gradient**: Consider a two-stop gradient that also incorporates a subtle gold tint at the very bottom, suggesting the tree's residual glow:

```css
.hero-foundation-transition {
  background: linear-gradient(180deg,
    transparent 0%,
    rgba(10, 11, 16, 0.4) 40%,
    rgba(10, 11, 16, 0.85) 70%,
    rgba(10, 11, 16, 0.95) 100%
  );
}
```

5. **No structural change** — the transition element remains a simple gradient div. No new components needed.

### 6.3 Readability Preservation

- The transition gradient ensures text in the lower portion of the hero remains readable against the Foundation section's background
- Foundation's h2 heading (demoted from h1 in SIDRAH-HERO-REBUILD-001) sits below the transition, so no overlap
- The gradient is `pointer-events: none` — no interaction blocking

### 6.4 Performance

The transition is a single CSS gradient — zero performance impact. No change to rendering cost.

---

## 7. Performance Impact Assessment

### 7.1 New Layers Cost

| Layer | Rendering Cost | GPU | CPU | Memory |
|---|---|---|---|---|
| HeroSmoke (3 wisps) | Very low — 3 blurred CSS gradients | ✓ GPU-accelerated | 0 (CSS only) | ~ negligible |
| HeroLeaves (6 particles) | Very low — 6 CSS-animated dots | ✓ GPU-accelerated | 0 (CSS only) | ~ negligible |
| Scroll opacity setters | Negligible — 2 style writes per scroll frame | N/A | 2 assignments | 0 |

### 7.2 Total Impact

- **No new JavaScript animation loops** — all animation is CSS `@keyframes`
- **No new canvas contexts** — no WebGL, no 2D canvas additions
- **No new ScrollTrigger instances** — existing `onUpdate` handles everything
- **No new image assets** — smoke and leaves are CSS gradients
- **No new network requests** — zero additional asset downloads
- **Estimated additional CPU**: <0.1% (2 style writes per scroll frame)
- **Estimated additional GPU**: ~2-3 composited layers (browser auto-optimizes blurred gradients)

### 7.3 Comparison to Current

| Metric | Current | With New Layers | Delta |
|---|---|---|---|
| DOM elements in hero | ~30 | ~39 | +9 (3 smoke + 6 leaves) |
| CSS animations | 4 (aura×2, motes, sheen) | 7 (+smoke×3, +leaves) | +3 |
| JS rAF loops | 0 (CSS-driven) | 0 | 0 |
| ScrollTrigger instances | 1 | 1 | 0 |
| Network requests | 0 new | 0 new | 0 |

**Verdict: Negligible performance impact.** The new layers are CSS-only, GPU-accelerated, and add no JavaScript runtime cost.

---

## 8. Mobile Impact Assessment

### 8.1 Layer Behavior on Mobile

| Layer | Desktop | Mobile | Rationale |
|---|---|---|---|
| Canvas frames | 121 frames, 1920×1080 | 121 frames, 960×540 | Existing — no change |
| HeroSmoke | 3 wisps, 2rem blur | 2 wisps, 1.5rem blur | Reduce for smaller viewport |
| HeroLeaves | 6 leaves, 12-20s | 4 leaves, 16-24s | Fewer, slower on mobile |
| HeroAura | Full | Reduced (existing) | Already handled |
| HeroMotes | 12 → 8 motes | Disabled on touch | Already handled |
| HeroSheen | Full | Disabled on touch | Already handled |
| Pointer depth | Active | Disabled | Already handled |

### 8.2 Mobile CSS

```css
@media (max-width: 767px) {
  .hero-smoke-wisp--3 {
    display: none;
  }
  .hero-smoke-wisp {
    height: 50%;
    filter: blur(1.5rem);
  }
  .hero-leaf {
    animation-duration: calc(var(--leaf-duration, 16s) * 1.3);
  }
}

@media (hover: none), (pointer: coarse) {
  .hero-leaves {
    display: none;
  }
  .hero-smoke {
    opacity: 0.5;
  }
}
```

### 8.3 Mobile Performance

- Smoke: 2 blurred gradients — negligible on any device
- Leaves: disabled on touch devices (coarse pointer) — zero cost
- No rAF loops, no canvas, no JS animation — purely CSS
- **Verdict: Mobile-safe. No measurable performance degradation.**

---

## 9. Accessibility Assessment

### 9.1 Reduced Motion (`prefers-reduced-motion: reduce`)

| Layer | Behavior |
|---|---|
| Canvas frame sequence | Static last frame (existing) |
| HeroSmoke | Hidden (opacity: 0, animation: none) |
| HeroLeaves | Hidden (opacity: 0, animation: none) |
| HeroAura | No animation (existing) |
| HeroMotes | No animation (existing) |
| HeroSheen | Hidden (existing) |
| HeroScrollCue | No animation (existing) |
| Content | Immediately visible (existing) |

**All new layers are purely decorative and fully hidden under reduced motion.** No information is lost.

### 9.2 Screen Readers

- `HeroSmoke` and `HeroLeaves` both have `aria-hidden="true"` — invisible to assistive technology
- No new semantic content added — the hero's text content (`HeroContent.jsx`) remains the only accessible information
- No new focusable elements

### 9.3 Contrast

- New layers (smoke, leaves) are extremely low opacity (0.02-0.20) — they do not reduce text contrast
- Text protection gradient is being **reduced** (0.55→0.35 top), but the future frames will have intentional dark negative space, so net contrast should improve
- `prefers-contrast: more` — smoke and leaves should be hidden:

```css
@media (prefers-contrast: more) {
  .hero-smoke,
  .hero-leaves {
    display: none;
  }
}
```

### 9.4 RTL

- Smoke: wisps positioned with `left` percentages — work identically in RTL (they're symmetric atmospheric effects)
- Leaves: positioned with `left` percentages — drift is symmetric (random -30 to +30px)
- No RTL-specific adjustments needed for new layers

### 9.5 `prefers-reduced-transparency`

```css
@media (prefers-reduced-transparency: reduce) {
  .hero-smoke,
  .hero-leaves {
    display: none;
  }
}
```

---

## 10. Files Expected to Change

### During This Phase (003A — Architecture Planning)

**No files modified.** This is a planning phase only.

### During Implementation Phase (003B)

| File | Change | Scope |
|---|---|---|
| `src/components/hero/HeroSmoke.jsx` | **Create** | New component — 3 CSS-animated smoke wisps |
| `src/components/hero/HeroLeaves.jsx` | **Create** | New component — 6 CSS-animated data fragments |
| `src/components/hero/HeroMotes.jsx` | **Edit** | Reduce `MOTE_COUNT` from 12 to 8 |
| `src/components/hero/CinematicHero.jsx` | **Edit** | Import + render `HeroSmoke` and `HeroLeaves`, add refs, add scroll opacity setters in `updateScrollUi()` |
| `src/styles/hero.css` | **Edit** | Add `.hero-smoke`, `.hero-leaves` styles + keyframes + mobile/reduced-motion/contrast queries; adjust `.hero-text-protection` opacity; adjust `.hero-foundation-transition` color |
| `src/styles/hero.css` | **Edit** | Increase `.hero-sheen-sweep` opacity slightly (0.03 → 0.05) |

### Files That Should Remain Unchanged

- `src/components/hero/HeroContent.jsx`
- `src/components/hero/HeroAura.jsx`
- `src/components/hero/HeroSheen.jsx`
- `src/components/hero/HeroScrollCue.jsx`
- `src/i18n/en.js`, `src/i18n/ar.js`
- `src/components/cinematic/CinematicLayers.jsx`
- `src/styles/cinematic.css`
- `src/styles/tokens.css`
- `src/styles/global.css`
- `src/App.jsx`
- All backend files
- All CMS files
- All Leads files

---

## 11. Risks

| Risk | Severity | Mitigation |
|---|---|---|
| **Smoke too visible** — could look like fog/haze if opacity is too high | Medium | Start at 0.02-0.04 alpha. Easier to increase than decrease. Visual QA required. |
| **Leaves too busy** — 6 falling particles could feel like snow/confetti | Medium | 6 is already very sparse. 12-20s duration is very slow. If still busy, reduce to 4. |
| **Layer stacking conflicts** — new z-index values could conflict with existing | Low | New layers use z-index 1 (same as existing aura/motes/sheen). No conflict — they're siblings. |
| **Scroll opacity setter performance** — 2 additional style writes per scroll frame | Very Low | Style writes on existing refs are negligible. Browser optimizes compositor-only changes. |
| **Mobile visual clutter** — smoke + leaves on small screens | Low | Leaves disabled on touch devices. Smoke reduced to 2 wisps with smaller blur. |
| **Future frame asset mismatch** — new layers designed for "Digital Sidrah" but frames still show old content | Medium | This phase adds layers that work with ANY frame content. They're atmospheric, not content-dependent. When frames are swapped, they'll complement the new tree. |
| **Blur performance on low-end mobile** — CSS `filter: blur()` can be expensive on weak GPUs | Low | 2rem blur on 2 elements is well within budget. If issues arise, reduce blur radius or disable on low-end devices. |

---

## 12. Final Recommendation

### Summary

The Digital Sidrah integration is **architecturally safe and low-risk**. The plan adds two new CSS-only atmospheric layers (smoke + leaves) that complement the future tree visual without requiring it to exist yet. No engine rewrite, no new JavaScript animation loops, no new network requests, and no structural changes to the existing Hero component.

### Key Decisions

1. **Tree = canvas frames** — no separate DOM element for the tree. The canvas frame sequence IS the tree.
2. **Smoke = 3 CSS blurred gradients** — volumetric upward energy, 20-28s cycles, 0.02-0.04 alpha
3. **Leaves = 6 CSS-animated dots** — slow falling data fragments, 12-20s duration, 0.08-0.20 alpha
4. **Motes reduced 12 → 8** — repurposed as rising energy, paired with falling leaves for bidirectional flow
5. **Scroll interaction = 2 opacity setters** — smoke fades by 67%, leaves ramp 0-50% then fade 85-100%
6. **Foundation transition = gradient color adjustment** — `rgba(14, 12, 22)` → `rgba(10, 11, 16)`
7. **Text protection reduced** — 0.55/0.92 → 0.35/0.75 (future frames have intentional negative space)
8. **All new layers fully hidden under reduced-motion** — zero accessibility impact

### Implementation Phase

**Next phase:** `SIDRAH-HERO-HIGGSFIELD-INTEGRATION-003B` — implement the two new components (`HeroSmoke.jsx`, `HeroLeaves.jsx`), update `CinematicHero.jsx` and `hero.css`, reduce motes, adjust gradients, run `npm run build`, visual QA.

**Phase 003C** (separate): Generate Higgsfield assets (keyframes, clips, frame sequence, posters) and swap frame files.

### Visual Approval

**HUMAN VISUAL APPROVAL: PENDING USER VISUAL APPROVAL**

No browser visual inspection was performed. The atmospheric layer opacities, blur radii, and animation timings specified in this report are engineering estimates based on the approved concept and brand DNA. Final values should be tuned during implementation with live visual QA.
