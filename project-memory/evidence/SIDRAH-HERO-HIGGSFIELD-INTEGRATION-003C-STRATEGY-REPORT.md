# SIDRAH-HERO-HIGGSFIELD-INTEGRATION-003C — Integration Strategy Report

**Date:** 2026-07-16  
**Status:** PASS  
**Scope:** Integration strategy decision only — no production code modified, no assets generated, no implementation started

---

## 1. Asset Review

### 1.1 Approved Asset

| Property | Value |
|---|---|
| **Variation** | 05 |
| **File** | `project-memory/evidence/higgsfield/digital-sidrah-master/variation-05.png` |
| **Source** | Higgsfield GPT Image 2 (`videotape-alpha`) |
| **Dimensions** | 2688×1520 (16:9, 2K) |
| **File size** | 6.7 MB (PNG) |
| **Estimated WebP size** | ~200-400 KB (q=87, 1920×1080 downscale) |
| **Job ID** | `d4a0612a-4a46-43f6-accd-9f6442548558` |

### 1.2 Visual Characteristics

- **Subject:** Digital Sidrah tree — golden light streams forming trunk, branches, canopy
- **Trunk:** Large, stable, architectural — converging energy streams
- **Branches:** Organic yet engineered — glowing data nodes, interconnected pathways
- **Environment:** Vast dark architectural space, cinematic depth
- **Palette:** Dark graphite, deep plum, warm antique gold, burnished copper, muted purple
- **Lighting:** Volumetric gold from tree, copper rim light, purple atmospheric haze, floor reflections
- **Composition:** Tree center-upper, dark negative space on sides and bottom
- **Evaluation score:** 47/50 (highest of 8 variations)

### 1.3 Current Hero Frame System

| Property | Desktop | Mobile |
|---|---|---|
| **Frames** | 121 WebP | 121 WebP |
| **Resolution** | 1920×1080 | 960×540 |
| **Quality** | q=85 | q=80 |
| **Total size** | 13.7 MB | 11.2 MB |
| **Combined weight** | — | 24.9 MB |
| **Source** | Extracted from `hero_kf05_to_kf06_v1.mp4` | Same clip, downscaled |
| **Scroll mapping** | Linear (progress → frame index) | Linear |
| **Loading** | Batched (60 frames/batch, 50ms delay) | Same |

### 1.4 Current Scroll Narrative

| Progress | Canvas | Content | Scroll Cue |
|---|---|---|---|
| 0.00-0.12 | Frame 0 (start state) | Fully visible, staggered reveal | Visible |
| 0.12-0.42 | Frames ~14-50 (transformation) | Fades out + lifts up (opacity 1→0, translateY 0→-2rem) | Hidden |
| 0.42-0.85 | Frames ~50-102 (continuation) | Hidden | Hidden |
| 0.85-1.00 | Frames ~102-120 (final state) | Hidden | Hidden |
| 1.00 | Frame 120 (final state) | Hidden | Hidden |

Canvas wrapper fades out (opacity 1→0) during 0.85-1.00, handing off to Foundation section.

### 1.5 Current Atmospheric Layers

| Layer | z-index | Technique | Mobile | Reduced Motion |
|---|---|---|---|---|
| HeroAura | 1 | 2 CSS radial gradients with blur(4rem), 12-14s drift animations | Reduced size/opacity | Animation stopped |
| HeroMotes | 1 | 12 CSS-animated gold dots, float upward | Hidden on touch | Animation stopped |
| HeroSheen | 1 | CSS diagonal light sweep, 18s cycle | Hidden on touch | Hidden |
| Text protection | 2 | 5-stop linear gradient (0.55→0.92 opacity) | Same | Same |
| Foundation transition | 5 | Bottom 8rem gradient to rgba(14,12,22,0.95) | 5rem height | Same |

---

## 2. Recommended Integration Method

### 2.1 Option Evaluation

#### Option A: Poster Only

Replace the 121-frame canvas system with a single static WebP image of Variation 05.

**Pros:**
- Simplest implementation — swap canvas for `<img>` or CSS `background-image`
- Eliminates 24.9 MB of frame assets
- Eliminates canvas rendering, batch loading, frame indexing
- Eliminates GSAP ScrollTrigger for frame scrubbing
- Instant load (single ~300 KB WebP vs progressive 13.7 MB batch loading)
- Perfect mobile experience (1 image, no frame loading at all)
- Zero scroll-driven rendering cost

**Cons:**
- Loses scroll-driven tree growth animation — the tree is always "full bloom"
- No transformation narrative — the tree doesn't grow from spark to ecosystem
- Feels static and less premium than the current scroll experience
- Wastes the existing canvas engine investment
- The approved concept specifically calls for "growth from idea to ecosystem"

**Verdict:** Insufficient — loses the core cinematic scroll narrative that defines the Hero experience.

---

#### Option B: Poster + Atmosphere

Single static WebP image of Variation 05 + CSS atmospheric layers (smoke, leaves, motes, aura, sheen).

**Pros:**
- All pros of Option A
- Atmospheric layers add life and motion without scroll-scrubbing
- CSS smoke (3 wisps) + leaves (6 particles) add subtle dynamism
- Existing aura/motes/sheen retained
- Performance is excellent — 1 image + CSS animations
- Mobile is trivial — 1 image + reduced atmosphere
- Immediate visual upgrade from current frames to approved Digital Sidrah

**Cons:**
- Still loses scroll-driven tree growth animation
- No transformation narrative — tree is always at full bloom
- Atmospheric motion is generic (not tied to tree growth stages)
- The scroll narrative phases (content fade, canvas fade) become meaningless without frame scrubbing
- Would require restructuring the scroll interaction (what does scrolling do if not scrubbing frames?)

**Verdict:** Better than A, but still sacrifices the core scroll narrative. The existing Hero architecture is built around scroll-driven frame scrubbing — removing that wastes the entire engine.

---

#### Option C: Frame Sequence

Generate a new frame sequence from Variation 05 using Seedance 2.0 (image-to-video), then extract frames and replace the current frame set.

**Pros:**
- Preserves the existing canvas engine entirely — no code architecture change
- Scroll-driven tree growth animation continues to work
- Full cinematic scroll narrative preserved
- The approved asset becomes the "full bloom" final frame (K5)
- Existing scroll phases, content fade, canvas fade all continue working
- Batch loading, frame indexing, reduced-motion fallback all intact

**Cons:**
- Requires generating 4 additional keyframes (K1-K4) showing earlier growth stages
- Requires generating 4 boundary-matched video clips via Seedance 2.0
- Requires frame extraction (~120 desktop + ~96 mobile frames)
- Significant production effort and Higgsfield credits
- Still 24+ MB of frame assets to load
- Mobile still needs separate frame set
- Cannot be done in this phase (user forbade asset generation)

**Verdict:** Architecturally ideal — preserves everything — but requires substantial asset production work before integration.

---

#### Option D: Hybrid Approach (RECOMMENDED)

**Two-phase integration:**

**Phase 1 (Immediate):** Replace current frames with Variation 05 as a high-quality poster image + CSS atmospheric layers. Adapt the scroll narrative to work with a static image (content fade + atmosphere intensity changes on scroll, but no frame scrubbing). This delivers the approved visual identity immediately.

**Phase 2 (Next):** Generate keyframes K1-K4 from Variation 05 using Seedance 2.0, produce video clips, extract frame sequences, and swap the poster back to a full frame sequence. Restore full scroll-driven tree growth animation.

**Pros:**
- Immediate visual upgrade — Digital Sidrah live on the website now
- Minimal risk — poster + CSS is simple and well-understood
- Performance is excellent in Phase 1 (1 image vs 121 frames)
- Mobile is trivial in Phase 1 (1 image)
- Existing scroll narrative adapted, not destroyed — content fade and atmosphere still respond to scroll
- Phase 2 is a drop-in upgrade — when frames are ready, swap poster for frame sequence
- No wasted work — Phase 1 CSS atmosphere is retained in Phase 2
- Existing canvas engine code is preserved (dormant in Phase 1, reactivated in Phase 2)
- Budget-friendly — Phase 1 costs zero Higgsfield credits

**Cons:**
- Phase 1 has no scroll-driven tree growth (tree is static at full bloom)
- Two-phase approach means a temporary visual compromise
- Phase 2 requires Higgsfield video generation and frame extraction
- Users in Phase 1 won't see the "spark to ecosystem" growth narrative

**Verdict:** Best balance of immediate impact, low risk, performance, and future-proofing. Delivers the approved visual now while preserving the architecture for full frame sequence integration later.

---

### 2.2 Recommendation: Option D — Hybrid Approach

**Rationale:**

1. **Visual quality:** Variation 05 as a high-quality WebP poster at 1920×1080 will look dramatically better than the current frame sequence (which was extracted from an older video clip). The Digital Sidrah identity is immediately live.

2. **Performance:** Phase 1 reduces Hero asset weight from 24.9 MB (242 frames) to ~300 KB (1 poster image) + ~50 KB (mobile poster). That's a 99% reduction. No batch loading, no canvas rendering, no frame indexing.

3. **Mobile experience:** A single responsive image with `object-fit: cover` is the most performant mobile Hero possible. No frame loading, no canvas, no memory pressure. CSS atmosphere is disabled on touch devices (existing pattern).

4. **Existing Hero architecture:** The canvas engine code is preserved but bypassed in Phase 1. The `<canvas>` element is replaced by an `<img>` element. All other layers (aura, motes, sheen, content, scroll cue, text protection, foundation transition) remain unchanged. In Phase 2, the `<img>` is swapped back to `<canvas>` with new frames.

5. **Existing scroll narrative:** Content fade (12-42%) and canvas wrapper fade (85-100%) continue working — they're CSS opacity transitions on DOM elements, not tied to frame scrubbing. The only thing that changes is that scrolling no longer advances frames. Instead, scroll controls atmosphere intensity (smoke fades, leaves ramp then fade) as designed in the 003A report.

6. **Accessibility:** Reduced-motion users get the static poster immediately (no frame loading, no `loadStaticPurposeFrame()`). All atmospheric layers are hidden under reduced-motion. The poster is `aria-hidden` (decorative). Text content remains fully accessible.

7. **Future maintainability:** Phase 2 is a clean swap — replace `<img>` with `<canvas>`, restore frame loading logic, point to new frame manifest. No architectural rework needed. The 003A atmospheric layers (smoke, leaves) added in Phase 1 continue working in Phase 2 without modification.

---

## 3. Smoke Recommendation

### 3.1 Should Smoke Be Added?

**Yes.** Smoke adds volumetric depth and the sense of digital energy rising from the tree's base. Without frame scrubbing (Phase 1), atmospheric layers are the primary source of motion. Smoke is the most impactful atmospheric addition.

### 3.2 Implementation Approach

**CSS only.** Three blurred radial gradient wisps with `@keyframes` upward animation.

- No canvas, no WebGL, no particle simulation
- GPU-accelerated via `filter: blur()` and `will-change: transform, opacity`
- 20-28 second animation cycles — extremely slow, contemplative
- 0.02-0.04 base alpha — barely perceptible
- Purple and gold tones matching the tree's palette

### 3.3 Performance Impact

**Negligible.** 3 composited layers with CSS blur. No JavaScript animation loop. No rAF. No per-frame computation. Browser auto-optimizes blurred gradients on GPU.

### 3.4 Scroll Interaction

Smoke container opacity set via `updateScrollUi()`:
- Progress 0.00-0.67: Smoke fades from full to zero (energy absorbed as tree reaches full bloom)
- Progress 0.67-1.00: Smoke is invisible (tree is resolved, handoff to Foundation)

### 3.5 Mobile

- Reduce to 2 wisps (hide wisp 3)
- Reduce blur radius to 1.5rem
- Reduce wisp height to 50%
- Further reduce opacity on touch devices (0.5× container opacity)

### 3.6 Reduced Motion

Smoke is hidden entirely (`opacity: 0`, `animation: none`). It is purely decorative.

---

## 4. Leaves Recommendation

### 4.1 Should Leaves Be Added?

**Yes, but only on desktop.** Leaves add the "data settling from the canopy" effect that reinforces the digital intelligence theme. They complement the rising energy motes to create bidirectional flow.

### 4.2 Recommended Density

**6 particles** on desktop, **0 on touch devices**. Sparse is premium. The existing motes (reduced from 12 to 8) provide upward motion; leaves provide downward motion. Together: 14 particles total, barely perceptible.

### 4.3 Motion Style

- **Direction:** Downward (top to bottom of viewport)
- **Speed:** 12-20 second fall duration — very slow
- **Size:** 3-7px — small glints, not prominent shapes
- **Color:** Gold radial gradient with subtle box-shadow glow
- **Drift:** ±30px horizontal drift — organic, not straight-line
- **Rotation:** 0→180deg during fall — suggests a leaf/data fragment
- **Opacity:** 0.08-0.20 — barely visible, adds texture
- **Fade:** Fades in at 10%, fades out at 100% — no sudden appearance

### 4.4 Performance Impact

**Negligible.** 6 CSS-animated dots. No JavaScript animation loop. Same pattern as existing `HeroMotes.jsx`. GPU-accelerated transforms.

### 4.5 Scroll Interaction

Leaves container opacity set via `updateScrollUi()`:
- Progress 0.00-0.50: Ramps from 0 to 1 (more data fragments as system grows)
- Progress 0.50-0.85: Full intensity
- Progress 0.85-1.00: Fades from 1 to 0 (data dissolves as hero resolves)

---

## 5. Foundation Transition Recommendation

### 5.1 Current State

- `.hero-foundation-transition`: bottom 8rem gradient, transparent → `rgba(14, 12, 22, 0.6)` at 60% → `rgba(14, 12, 22, 0.95)` at 100%
- Foundation section background: `rgba(14, 12, 22, 0.88)` with gold radial gradient overlay
- Canvas wrapper fades from opacity 1→0 during progress 0.85-1.00

### 5.2 Required Changes

**Color adjustment:** The current gradient target is `rgba(14, 12, 22, ...)` which is a dark plum. Variation 05's environment is darker — closer to `rgba(10, 11, 16, ...)` (dark graphite). The transition gradient should be updated to match:

```css
background: linear-gradient(180deg,
  transparent 0%,
  rgba(10, 11, 16, 0.4) 40%,
  rgba(10, 11, 16, 0.85) 70%,
  rgba(10, 11, 16, 0.95) 100%
);
```

**Additional gradient:** No additional gradients required. The existing single gradient is sufficient. The 4-stop version above is a refinement, not a new element.

**Foundation section background:** The Foundation section's `background-color: rgba(14, 12, 22, 0.88)` should be adjusted to `rgba(10, 11, 16, 0.92)` to match the darker Digital Sidrah palette. This is a one-line CSS change.

### 5.3 Dissolve Behavior

The canvas wrapper (or poster image wrapper) fades from opacity 1→0 during progress 0.85-1.00. This is retained unchanged. As the poster fades, the Foundation section's background becomes visible underneath. The transition gradient ensures a smooth visual blend.

### 5.4 Text Protection Gradient

The text protection gradient should be **reduced** because Variation 05 has intentional dark negative space:

```css
background: linear-gradient(180deg,
  rgba(10, 11, 16, 0.35) 0%,
  rgba(10, 11, 16, 0.08) 30%,
  rgba(10, 11, 16, 0.15) 55%,
  rgba(10, 11, 16, 0.55) 85%,
  rgba(10, 11, 16, 0.75) 100%
);
```

Reduced from 0.55/0.92 to 0.35/0.75. The composition provides primary contrast; the gradient is a safety net.

---

## 6. Mobile Recommendation

### 6.1 Phase 1 Mobile Strategy

**Single responsive poster image.** No frames, no canvas, no batch loading.

| Property | Value |
|---|---|
| **Image** | Variation 05, downscaled to 960×540, WebP q=80 |
| **File size** | ~80-120 KB |
| **Loading** | Standard `<img>` with `loading="eager"` + `fetchpriority="high"` |
| **Rendering** | `object-fit: cover` on the image element |
| **Atmosphere** | Aura (reduced), smoke (2 wisps, reduced). No motes, no leaves, no sheen on touch. |
| **Scroll narrative** | Content fade (12-42%), wrapper fade (85-100%) — same as desktop |
| **Reduced motion** | Static poster, no atmosphere, content immediately visible |

### 6.2 Why Not Frames on Mobile?

- 11.2 MB of mobile frames is excessive for mobile data plans
- Canvas rendering on mobile GPUs is battery-intensive
- Batch loading 121 frames causes memory pressure on low-end devices
- A single 100 KB poster image is 99% lighter and loads instantly
- The scroll-driven tree growth is a nice-to-have, not essential on mobile
- Mobile users scroll faster — frame scrubbing is less noticeable

### 6.3 Phase 2 Mobile Strategy

When full frame sequences are generated (Phase 2), mobile can optionally use a reduced frame count (~60 frames at 720×405, WebP q=75) instead of 121. But the poster fallback should remain as the reduced-motion and low-end-device path.

---

## 7. Performance Recommendation

### 7.1 Phase 1 Performance Budget

| Metric | Current | Phase 1 Target | Delta |
|---|---|---|---|
| **Hero asset weight (desktop)** | 13.7 MB (121 frames) | ~300 KB (1 poster) | -97.8% |
| **Hero asset weight (mobile)** | 11.2 MB (121 frames) | ~100 KB (1 poster) | -99.1% |
| **Total Hero weight** | 24.9 MB | ~400 KB | -98.4% |
| **JS animation loops** | 0 (CSS-driven) | 0 (CSS-driven) | 0 |
| **ScrollTrigger instances** | 1 (frame scrub) | 1 (atmosphere only) | 0 |
| **Canvas contexts** | 1 (2D) | 0 (poster) | -1 |
| **Batch loading** | 121 images in 3 batches | 1 image (eager) | Eliminated |
| **DOM elements in Hero** | ~30 | ~39 (+smoke +leaves) | +9 |
| **CSS animations** | 4 | 7 (+smoke×3, +leaves) | +3 |
| **LCP element** | Canvas first frame | Poster image | Faster |

### 7.2 Poster Optimization

| Format | Resolution | Quality | Estimated Size |
|---|---|---|---|
| Desktop WebP | 1920×1080 | q=87 | ~250-350 KB |
| Mobile WebP | 960×540 | q=80 | ~60-100 KB |
| Desktop poster (reduced motion) | 1920×1080 | q=87 | Same (used as static) |

### 7.3 Loading Strategy

```html
<!-- Desktop -->
<img
  src="/assets/hero/digital-sidrah-poster-desktop.webp"
  alt=""
  aria-hidden="true"
  loading="eager"
  fetchpriority="high"
  decoding="async"
/>

<!-- Mobile (detected via JS, same element, different src) -->
```

The poster image should be the LCP element. With `loading="eager"` and `fetchpriority="high"`, it loads immediately on first paint — no batch loading, no loading percentage, no canvas initialization.

### 7.4 Phase 2 Performance Budget

| Metric | Phase 2 Target |
|---|---|
| Desktop frames | ~120 WebP, 1280px width, q=80, ~8-10 MB total |
| Mobile frames | ~60 WebP, 720px width, q=75, ~3-4 MB total |
| Total weight | ~12-14 MB (50% reduction from current 24.9 MB) |
| Batch loading | Retained (60 frames/batch) |
| Canvas | Reactivated |
| ScrollTrigger | 1 (frame scrub + atmosphere) |

---

## 8. Exact Implementation Plan

### Phase 1: Poster + Atmosphere (Implementation Phase 003D)

**Step 1: Prepare poster assets**
- Convert `variation-05.png` to WebP at 1920×1080 (q=87) → `digital-sidrah-poster-desktop.webp`
- Convert `variation-05.png` to WebP at 960×540 (q=80) → `digital-sidrah-poster-mobile.webp`
- Save to `src/assets/hero/`

**Step 2: Create `HeroSmoke.jsx`**
- 3 CSS-animated smoke wisps (purple/gold radial gradients, blur, upward keyframes)
- `aria-hidden="true"`, `pointer-events: none`

**Step 3: Create `HeroLeaves.jsx`**
- 6 CSS-animated falling data fragments (gold dots, slow fall, drift, rotation)
- `aria-hidden="true"`, `pointer-events: none`
- Disabled on touch devices via CSS

**Step 4: Edit `HeroMotes.jsx`**
- Reduce `MOTE_COUNT` from 12 to 8

**Step 5: Edit `CinematicHero.jsx`**
- Replace `<canvas>` element with `<img>` element (poster image)
- Remove canvas context, frame loading, batch loading, frame indexing logic
- Retain ScrollTrigger for atmosphere scroll interaction
- Add `smokeRef` and `leavesRef` for scroll-driven opacity control
- Add smoke/leaves opacity setters in `updateScrollUi()`
- Retain content fade (12-42%) and wrapper fade (85-100%) unchanged
- Retain reduced-motion path (show poster immediately, no atmosphere)
- Retain loading/error states (simplified — image onload/onerror)

**Step 6: Edit `hero.css`**
- Add `.hero-smoke`, `.hero-smoke-wisp` styles + `@keyframes hero-smoke-rise`
- Add `.hero-leaves`, `.hero-leaf` styles + `@keyframes hero-leaf-fall`
- Add mobile, reduced-motion, reduced-transparency, contrast media queries
- Adjust `.hero-text-protection` gradient (0.55/0.92 → 0.35/0.75)
- Adjust `.hero-foundation-transition` gradient (rgba(14,12,22) → rgba(10,11,16))
- Add `.hero-poster` styles (position, object-fit, z-index 0)

**Step 7: Edit `sections.css`**
- Adjust `.public-website-shell .foundation-section` background-color (rgba(14,12,22,0.88) → rgba(10,11,16,0.92))

**Step 8: Verify**
- Run `npm run build`
- Visual QA: desktop + mobile + RTL + reduced motion
- Confirm no backend/CMS/Leads files touched

### Phase 2: Full Frame Sequence (Future Phase 003E)

**Step 1:** Generate 4 keyframes (K1: spark, K2: sapling, K3: mid-growth, K4: near-full) using Variation 05 as K5 (full bloom) reference

**Step 2:** Generate 4 boundary-matched video clips (V1-V4) via Seedance 2.0 connecting K1→K2, K2→K3, K3→K4, K4→K5

**Step 3:** Extract desktop frame sequence (~120 frames, 1280px, WebP q=80)

**Step 4:** Generate mobile 9:16 keyframes and clips, extract mobile frame sequence (~60 frames, 720px, WebP q=75)

**Step 5:** Swap `<img>` back to `<canvas>`, restore frame loading logic, point to new manifest

**Step 6:** Retain all Phase 1 atmospheric layers (smoke, leaves, motes, aura, sheen)

**Step 7:** Run `npm run build` + visual QA

---

## 9. Files Expected to Change (Phase 1 Only)

| File | Action | Scope |
|---|---|---|
| `src/assets/hero/digital-sidrah-poster-desktop.webp` | **Create** | Desktop poster (1920×1080, q=87) |
| `src/assets/hero/digital-sidrah-poster-mobile.webp` | **Create** | Mobile poster (960×540, q=80) |
| `src/components/hero/HeroSmoke.jsx` | **Create** | 3 CSS smoke wisps |
| `src/components/hero/HeroLeaves.jsx` | **Create** | 6 CSS falling data fragments |
| `src/components/hero/HeroMotes.jsx` | **Edit** | MOTE_COUNT 12 → 8 |
| `src/components/hero/CinematicHero.jsx` | **Edit** | Canvas → poster image, add smoke/leaves, scroll atmosphere |
| `src/styles/hero.css` | **Edit** | Add smoke/leaves CSS, adjust text protection + foundation transition |
| `src/styles/sections.css` | **Edit** | Foundation background-color adjustment (1 line) |

### Files NOT Touched

- `src/components/hero/HeroContent.jsx`
- `src/components/hero/HeroAura.jsx`
- `src/components/hero/HeroSheen.jsx`
- `src/components/hero/HeroScrollCue.jsx`
- `src/components/cinematic/CinematicLayers.jsx`
- `src/styles/cinematic.css`
- `src/styles/tokens.css`
- `src/styles/global.css`
- `src/i18n/en.js`, `src/i18n/ar.js`
- `src/App.jsx`
- All backend files
- All CMS files
- All Leads files
- Existing frame assets (retained for Phase 2)

---

## 10. Risks

| Risk | Severity | Mitigation |
|---|---|---|
| **Phase 1 feels static** — no scroll-driven tree growth | Medium | Atmospheric layers (smoke, leaves, motes, aura) provide motion. Content fade + wrapper fade preserve scroll narrative structure. Phase 2 restores full animation. |
| **Poster image text readability** — tree branches may overlap text area | Medium | Text protection gradient (reduced but present) + V05's dark negative space. Visual QA required. Adjust gradient if needed. |
| **Phase 2 delay** — frame sequence generation may take time | Low | Phase 1 is a complete, shippable Hero. Phase 2 is an enhancement, not a fix. No timeline pressure. |
| **Existing frame assets orphaned** — 242 frames unused in Phase 1 | Very Low | Frames are retained in `frames-kf05kf06/` directories. Not deleted. Reactivated in Phase 2 or removed if new frames are generated. |
| **ScrollTrigger without frame scrubbing** — may feel underutilized | Low | ScrollTrigger still drives content fade, wrapper fade, and atmosphere intensity. It's not idle. |
| **Poster LCP regression** — if image is not optimized | Low | WebP at q=87, 1920×1080 is ~300 KB. With `fetchpriority="high"`, LCP should be faster than current canvas first-frame. |

---

## 11. Final Verdict

**PASS**

### Summary

The Hybrid approach (Option D) is recommended for integrating the approved Digital Sidrah asset (Variation 05) into the SidrahSoft Hero:

1. **Phase 1 (Immediate):** High-quality WebP poster + CSS atmospheric layers (smoke, leaves, reduced motes). Delivers the approved visual identity now. 98.4% asset weight reduction. Zero Higgsfield credits needed. Minimal code changes. Full mobile and accessibility support.

2. **Phase 2 (Future):** Generate keyframes and frame sequences from Variation 05 via Seedance 2.0. Restore full scroll-driven tree growth animation. All Phase 1 atmospheric layers retained.

### Key Decisions

| Decision | Choice |
|---|---|
| Integration method | D — Hybrid (poster now, frames later) |
| Smoke | Yes — CSS only, 3 wisps, 0.02-0.04 alpha |
| Leaves | Yes — CSS only, 6 particles, desktop only |
| Motes | Retained, reduced 12 → 8 |
| Aura | Retained unchanged |
| Sheen | Retained unchanged |
| Text protection | Reduced (0.55/0.92 → 0.35/0.75) |
| Foundation transition | Color adjusted (rgba(14,12,22) → rgba(10,11,16)) |
| Foundation background | Color adjusted (1 line in sections.css) |
| Mobile | Single poster image, no frames, reduced atmosphere |
| Scroll narrative | Content fade + atmosphere intensity (Phase 1), full frame scrub (Phase 2) |
| Existing frame assets | Retained, not deleted |
| Canvas engine | Bypassed in Phase 1, reactivated in Phase 2 |

### Confirmation

- No production code modified: ✓
- No assets generated: ✓
- No Higgsfield content generated: ✓
- No implementation started: ✓
- No backend/CMS/Leads touched: ✓
- No frontend build run: ✓
