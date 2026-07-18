# SIDRAH-HERO-HYBRID-INTEGRATION-003D — Implementation Report

**Date:** 2026-07-16  
**Status:** PASS  
**Scope:** Hero section implementation — Digital Sidrah poster + scroll-linked motion + atmospheric layers

---

## 1. Executive Summary

The approved Digital Sidrah asset (Variation 05) has been integrated as the primary Hero visual identity for SidrahSoft. The old 121-frame canvas system has been replaced with a lightweight WebP poster image with scroll-linked cinematic push-in motion. Digital smoke (3 CSS wisps) and digital leaves (6 CSS data fragments) have been added as atmospheric layers. The existing aura, motes (reduced to 8), sheen, content, and scroll cue have been retained. The Hero-to-Foundation transition has been color-matched to the approved asset's dark graphite palette.

**Final status:** PASS  
**Integration method:** Hybrid — poster image + scroll-linked transform motion + CSS atmospheric layers  
**Old canvas runtime removed:** Yes — frame loading, batch loading, canvas context, frame indexing, and manifest imports have been removed from the active Hero  
**Final asset sizes:** Desktop poster 437 KB, Mobile poster 95 KB (total: 532 KB vs previous 24.9 MB)

---

## 2. Approved Asset

### Source Asset

| Property | Value |
|---|---|
| **Variation** | 05 |
| **Source file** | `project-memory/evidence/higgsfield/digital-sidrah-master/variation-05.png` |
| **Source dimensions** | 2688×1520 (16:9, 2K) |
| **Source file size** | 6.7 MB (PNG) |
| **Job ID** | `d4a0612a-4a46-43f6-accd-9f6442548558` |

### Desktop Production Asset

| Property | Value |
|---|---|
| **File** | `src/assets/hero/digital-sidrah/hero-digital-sidrah-desktop.webp` |
| **Dimensions** | 1920×1080 |
| **Format** | WebP, quality 87, method 6 |
| **File size** | 426.7 KB (437 KB in build output) |
| **Conversion method** | Python Pillow — `Image.resize((1920, 1080), Image.LANCZOS)` + `Image.save('...', 'WEBP', quality=87, method=6)` |

### Mobile Production Asset

| Property | Value |
|---|---|
| **File** | `src/assets/hero/digital-sidrah/hero-digital-sidrah-mobile.webp` |
| **Dimensions** | 960×540 |
| **Format** | WebP, quality 82, method 6 |
| **File size** | 93.1 KB (95 KB in build output) |
| **Conversion method** | Python Pillow — `Image.resize((960, 540), Image.LANCZOS)` + `Image.save('...', 'WEBP', quality=82, method=6)` |

### Original PNG Not Duplicated

The 6.7 MB PNG source remains only in `project-memory/evidence/higgsfield/digital-sidrah-master/`. No PNG copy exists in `src/assets/`.

---

## 3. Hero Architecture Changes

### Previous Active Architecture

- `CinematicHero.jsx` imported desktop and mobile frame manifests
- 121 WebP frames loaded in batches of 60 with 50ms delay
- Canvas 2D context drew frames based on scroll progress
- `ScrollTrigger` scrubbed frame index on scroll update
- `ResizeObserver` monitored canvas for dimension changes
- `AbortController` managed frame loading cancellation
- Loading percentage displayed during frame preloading
- Reduced-motion path loaded only the final frame

### New Active Architecture

- `CinematicHero.jsx` imports desktop and mobile poster WebP images
- Single `<img>` element with `loading="eager"` and `decoding="async"`
- `ScrollTrigger` drives poster scale/translate, content fade, atmosphere opacity
- No canvas, no frame loading, no batch loading, no manifest imports
- Poster load status tracked via `onLoad`/`onError` handlers
- Reduced-motion path shows static poster with no atmosphere
- Mouse parallax applies subtle poster shift (4px depth) on desktop only
- Touch devices disable poster parallax, motes, and leaves

### Scroll-Motion Implementation

The poster wrapper receives compositor-friendly `transform: scale() translateY()` updates via the existing `updateScrollUi()` function. No second ScrollTrigger is created. The same single ScrollTrigger that drives content fade also drives poster motion and atmosphere opacity. All transforms use `will-change: transform, opacity` for GPU acceleration. No layout-triggering properties are used.

### Loading Behavior

- Poster image loads immediately with `loading="eager"`
- `fetchpriority="high"` is implicit via eager loading
- Status transitions: `loading` → `ready` (on load) or `error` (on error)
- No batch loading, no percentage counter
- LCP element is the poster image

### Rollback Strategy

- Old frame assets in `src/assets/hero/frames-kf05kf06/` and `src/assets/hero/frames-kf05kf06-mobile/` are preserved
- Old manifests are preserved but no longer imported
- Old canvas code has been removed from `CinematicHero.jsx` but can be restored from git history
- Rollback: revert `CinematicHero.jsx` and restore manifest imports

---

## 4. Atmospheric Systems

### HeroSmoke

**Component:** `src/components/hero/HeroSmoke.jsx`  
**Technique:** 3 CSS-animated blurred radial gradient wisps  
**Colors:** Purple (0.035 alpha), Gold (0.025 alpha), Copper (0.022 alpha)  
**Animation:** `hero-smoke-rise` keyframes — 24-28 second cycles, upward translateY(-60vh) with scale(1.3)  
**Blur:** `filter: blur(3rem)` desktop, `blur(2rem)` mobile  
**Mobile:** Copper wisp hidden, purple and gold wisps reduced in size  
**Reduced motion:** `opacity: 0`, `animation: none`  
**Reduced transparency:** `opacity: 0 !important`, `animation: none`  
**High contrast:** `opacity: 0 !important`, `animation: none`  
**Scroll behavior:** Full opacity at 0%, begins fading at 42%, fully gone by 67%  
**Container:** `.hero-smoke-container` wraps the component, scroll-controlled opacity via `smokeRef`

### HeroLeaves

**Component:** `src/components/hero/HeroLeaves.jsx`  
**Technique:** 6 CSS-animated falling data fragments  
**Colors:** Gold radial gradient with subtle box-shadow glow  
**Animation:** `hero-leaf-fall` keyframes — 12-20 second duration, downward translateY(100vh) with horizontal drift and rotation  
**Sizes:** 3-7px, varied  
**Opacity:** 0.08-0.20 per leaf  
**Positions:** Deterministic using same seed pattern as HeroMotes  
**Mobile:** Hidden on touch/coarse-pointer devices  
**Reduced motion:** `opacity: 0`, `animation: none`  
**High contrast:** `opacity: 0 !important`, `animation: none`  
**Scroll behavior:** Invisible at 0%, ramps from 8% to 50%, full at 50-85%, fades 85-100%  
**Container:** `.hero-leaves-container` wraps the component, scroll-controlled opacity via `leavesRef`

### HeroMotes Changes

- `MOTE_COUNT` reduced from 12 to 8
- Existing animation, sizing, and opacity logic unchanged
- Now wrapped in `.hero-motes-container` for scroll-controlled opacity
- Motes fade during 85-100% scroll progress
- Hidden on touch devices (via container `display: none`)

### HeroAura Changes

- Gold aura opacity reduced from 0.08 to 0.05 (V05 has strong gold illumination)
- Purple aura unchanged (0.12)
- All animation keyframes and drift behavior retained
- Mobile sizing and opacity reductions retained

### HeroSheen Changes

- Sheen opacity reduced from 0.015/0.03 to 0.008/0.018 (avoid competing with V05's lighting)
- Animation duration and sweep behavior unchanged
- Hidden on touch devices and reduced motion

---

## 5. Scroll Narrative

### 0–12%: Opening State

- **Poster:** Scale 1.00, no translateY. Fully visible.
- **Content:** Fully visible, staggered reveal animation plays (eyebrow → headline → supporting → CTAs → capability line).
- **Scroll cue:** Visible.
- **Smoke:** Full opacity (strongest).
- **Leaves:** Invisible (opacity 0).
- **Motes:** Full opacity.
- **Aura:** Active, drifting.
- **Sheen:** Active, sweeping.

### 12–42%: Content Fade + Push-In

- **Poster:** Scale ramps from 1.00 to 1.035. translateY ramps from 0 to -2%. Gentle cinematic push-in begins.
- **Content:** Fades from opacity 1 to 0. Lifts up by -2rem.
- **Scroll cue:** Hidden.
- **Smoke:** Full opacity (begins fading at 42%).
- **Leaves:** Ramps from 0 to ~0.8 opacity (becoming visible).
- **Motes:** Full opacity.
- **Aura/Sheen:** Active.

### 42–85%: Deep Push-In + Atmosphere

- **Poster:** Scale ramps from 1.035 to 1.07. translateY ramps from -2% to -5%. Maximum gentle push-in.
- **Content:** Hidden (opacity 0).
- **Smoke:** Fades from full to 0 (gone by ~67%).
- **Leaves:** Full opacity (most visible state).
- **Motes:** Full opacity.
- **Aura/Sheen:** Active.

### 85–100%: Foundation Handoff

- **Poster:** Scale 1.07, translateY -5%. Fades from opacity 1 to 0.
- **Content:** Hidden.
- **Smoke:** Gone (opacity 0).
- **Leaves:** Fades from 1 to 0.
- **Motes:** Fades from 1 to 0.
- **Foundation transition gradient:** Takes over visually.
- **Aura/Sheen:** Fade with poster wrapper.

---

## 6. Responsive and RTL Behavior

### Desktop (≥768px)

- **Poster:** Desktop WebP (1920×1080, 437 KB), `object-fit: cover`
- **Text protection:** Directional — LTR has stronger gradient on left (content side), RTL mirrors to right
- **Atmosphere:** All layers active (smoke ×3, leaves ×6, motes ×8, aura ×2, sheen)
- **Pointer depth:** Poster parallax (4px) + content parallax (8px/6px) on mouse move
- **No horizontal overflow:** Poster wrapper `overflow: hidden`

### Tablet (768px)

- **Poster:** Desktop WebP (same image, responsive via `object-fit: cover`)
- **Text protection:** Directional (LTR/RTL)
- **Atmosphere:** All layers active
- **Pointer depth:** Active if hover capability detected

### Mobile (≤767px, including 320px, 390px, 430px)

- **Poster:** Mobile WebP (960×540, 95 KB) via `detectFrameSet()` JS detection
- **Text protection:** Balanced vertical-only gradient (no directional bias)
- **Smoke:** 2 wisps only (copper hidden), reduced blur and size
- **Leaves:** Hidden (container `display: none`)
- **Motes:** Hidden (container `display: none`)
- **Sheen:** Hidden
- **Pointer depth:** Disabled (poster wrapper `transform: none !important`)
- **Content:** Centered, full-width, stacked CTAs
- **No horizontal overflow:** Poster wrapper `overflow: hidden`, content `max-width: 100%`

### English LTR

- Text protection gradient: `linear-gradient(90deg, ...)` — stronger on left (0.55 alpha) fading to right (0.15 alpha)
- Content overlay: `align-items: flex-start` (left-aligned)
- CTA arrow: Points right

### Arabic RTL

- Text protection gradient: `linear-gradient(270deg, ...)` — stronger on right (0.55 alpha) fading to left (0.15 alpha)
- Content overlay: `align-items: flex-end` (right-aligned), centered on mobile
- CTA arrow: Mirrored via `scaleX(-1)`
- Fonts: Arabic font families applied via `[dir='rtl']` selectors

---

## 7. Accessibility

### Reduced Motion (`prefers-reduced-motion: reduce`)

- Poster: Static, `transform: none`, no scroll-linked motion
- Smoke: `opacity: 0`, `animation: none`
- Leaves: `opacity: 0`, `animation: none`
- Motes: `animation: none`
- Aura: `animation: none`
- Sheen: `animation: none`, `display: none`
- Scroll cue: Hidden immediately
- Content: Immediately visible, no transition delays
- Pointer depth: Disabled

### Reduced Transparency (`prefers-reduced-transparency: reduce`)

- Smoke: `opacity: 0 !important`, `animation: none`
- Aura: `opacity: 0 !important`, `animation: none`

### High Contrast (`prefers-contrast: more`)

- Smoke: `opacity: 0 !important`, `animation: none`
- Leaves: `opacity: 0 !important`, `animation: none`
- Text protection: Strengthened — directional gradient 0.75 alpha on content side, vertical gradient 0.50/0.95

### Screen Reader Behavior

- Poster image: `alt=""`, `aria-hidden="true"` — decorative, not announced
- Smoke: `aria-hidden="true"` — not announced
- Leaves: `aria-hidden="true"` — not announced
- Motes: `aria-hidden="true"` — not announced
- Aura: `aria-hidden="true"` — not announced
- Sheen: `aria-hidden="true"` — not announced
- Scroll cue: `aria-hidden="true"` — not announced
- Content: Fully accessible — `h1` with `id="hero-heading"`, CTAs with `aria-label`

### Keyboard and CTA Preservation

- CTAs remain as `<a>` elements with `href` attributes — keyboard focusable
- `:focus-visible` styles retained
- Click handlers with smooth scroll navigation preserved
- Tab order: Eyebrow → Headline → Supporting → Primary CTA → Secondary CTA → Capability line

---

## 8. Performance

### Previous Active Hero Asset Weight

| Asset | Count | Total Size |
|---|---|---|
| Desktop frames (`frames-kf05kf06/`) | 121 WebP | 13.7 MB |
| Mobile frames (`frames-kf05kf06-mobile/`) | 121 WebP | 11.2 MB |
| **Total** | 242 frames | **24.9 MB** |

### New Active Hero Asset Weight

| Asset | Count | Total Size |
|---|---|---|
| Desktop poster WebP | 1 | 437 KB |
| Mobile poster WebP | 1 | 95 KB |
| **Total** | 2 images | **532 KB** |

### Approximate Reduction

**97.9% reduction** in Hero asset weight (24.9 MB → 532 KB)

### Runtime Animation Cost

- **JavaScript animation loops:** 0 (all CSS-driven)
- **ScrollTrigger instances:** 1 (drives poster transform + content fade + atmosphere opacity)
- **Canvas contexts:** 0 (poster is an `<img>`)
- **Batch loading:** Eliminated (single image with eager loading)
- **ResizeObserver:** Eliminated (no canvas to resize)
- **CSS animations:** 7 (aura purple, aura gold, smoke ×3, leaves, sheen) — all GPU-accelerated
- **rAF callbacks:** 0 (no custom rAF loops)

### Old Assets Status

Old frame assets remain in `src/assets/hero/frames-kf05kf06/` and `src/assets/hero/frames-kf05kf06-mobile/` but are **not imported, not loaded, not decoded, and not included in the build**. The build output confirms only the two new poster WebP files are bundled.

---

## 9. Files Created

| File | Purpose |
|---|---|
| `src/assets/hero/digital-sidrah/hero-digital-sidrah-desktop.webp` | Desktop poster image (1920×1080, 437 KB) |
| `src/assets/hero/digital-sidrah/hero-digital-sidrah-mobile.webp` | Mobile poster image (960×540, 95 KB) |
| `src/components/hero/HeroSmoke.jsx` | Digital smoke component (3 CSS wisps) |
| `src/components/hero/HeroLeaves.jsx` | Digital leaves component (6 CSS data fragments) |

---

## 10. Files Modified

| File | Purpose of Change |
|---|---|
| `src/components/hero/CinematicHero.jsx` | Replaced canvas frame system with poster image; added scroll-linked poster motion (scale 1→1.07, translateY 0→-5%); added smoke/leaves/motes scroll-controlled opacity; added poster mouse parallax (4px depth, desktop only); removed frame loading, batch loading, canvas context, manifest imports, ResizeObserver, AbortController; retained ScrollTrigger, content fade, scroll cue, reduced-motion path |
| `src/components/hero/HeroMotes.jsx` | Reduced `MOTE_COUNT` from 12 to 8 |
| `src/styles/hero.css` | Added `.hero-poster-wrapper` and `.hero-poster` styles; added `.hero-smoke-container`, `.hero-leaves-container`, `.hero-motes-container` styles; added `.hero-smoke`, `.hero-smoke-wisp` styles with `hero-smoke-rise` keyframes; added `.hero-leaves`, `.hero-leaf` styles with `hero-leaf-fall` keyframes; updated `.hero-text-protection` to direction-aware gradient (LTR: 90deg, RTL: 270deg); updated `.hero-foundation-transition` colors from rgba(14,12,22) to rgba(10,11,16); reduced `.hero-aura-glow--gold` opacity from 0.08 to 0.05; reduced `.hero-sheen-sweep` opacity from 0.015/0.03 to 0.008/0.018; added mobile smoke reduction rules; added mobile balanced text protection; added reduced-motion smoke/leaf disable; added reduced-transparency media query; added high-contrast media query with strengthened text protection; updated touch-device rules to hide motes/leaves containers and disable poster parallax |
| `src/styles/global.css` | Added `.hero-poster-wrapper` alongside `.cinematic-canvas-wrapper` for sticky positioning and transition rules; added `.hero-poster-wrapper` to reduced-motion transform disable |
| `src/styles/sections.css` | Updated `.public-website-shell .foundation-section` background-color from `rgba(14, 12, 22, 0.88)` to `rgba(10, 11, 16, 0.92)` and gradient from `rgba(14, 12, 22, 0.34)` to `rgba(10, 11, 16, 0.34)` |

---

## 11. Files Preserved for Rollback

| Asset | Location | Status |
|---|---|---|
| Desktop frame sequence (121 WebP) | `src/assets/hero/frames-kf05kf06/` | Preserved, not imported, not in build |
| Mobile frame sequence (121 WebP) | `src/assets/hero/frames-kf05kf06-mobile/` | Preserved, not imported, not in build |
| Desktop manifest | `src/assets/hero/frames-kf05kf06/hero_manifest.json` | Preserved, not imported |
| Mobile manifest | `src/assets/hero/frames-kf05kf06-mobile/hero_manifest.json` | Preserved, not imported |
| Original frame assets (older) | `src/assets/hero/frames/` and `src/assets/hero/frames-mobile/` | Preserved, not imported |
| Source PNG | `project-memory/evidence/higgsfield/digital-sidrah-master/variation-05.png` | Preserved, not in src/assets |

These assets may be deleted in a future cleanup phase after user visual approval.

---

## 12. Build Result

```
> npm run build

vite v7.3.6 building client environment for production...
✓ 158 modules transformed.

dist/index.html                                                3.06 kB
dist/assets/hero-digital-sidrah-mobile-Dh3ZU4_w.webp          95.30 kB
dist/assets/hero-digital-sidrah-desktop-CfNFTmCz.webp        436.97 kB
dist/assets/index-BCON-rNJ.css                               209.40 kB
dist/assets/index-D0bx9E-f.js                                564.73 kB

✓ built in 6.11s
```

**Exit status:** 0 (success)  
**Build time:** 6.11 seconds  
**Warnings:** Pre-existing (CMS duplicate keys in `CMSLanguageContext.jsx`, insights API dynamic import, chunk size > 500 KB) — not related to this implementation  
**New assets in build:** `hero-digital-sidrah-desktop-CfNFTmCz.webp` (437 KB), `hero-digital-sidrah-mobile-Dh3ZU4_w.webp` (95 KB)  
**Old frame assets in build:** None (confirmed — old frames are not imported)

---

## 13. Manual Approval Checklist

| Check | Status |
|---|---|
| Desktop English | HUMAN VISUAL APPROVAL: PENDING USER VISUAL APPROVAL |
| Desktop Arabic (RTL) | HUMAN VISUAL APPROVAL: PENDING USER VISUAL APPROVAL |
| Mobile English | HUMAN VISUAL APPROVAL: PENDING USER VISUAL APPROVAL |
| Mobile Arabic (RTL) | HUMAN VISUAL APPROVAL: PENDING USER VISUAL APPROVAL |
| Poster crop (tree centered, trunk visible) | HUMAN VISUAL APPROVAL: PENDING USER VISUAL APPROVAL |
| Scroll push-in (gentle, no pixelation) | HUMAN VISUAL APPROVAL: PENDING USER VISUAL APPROVAL |
| Smoke (subtle, rising, not fire/fog) | HUMAN VISUAL APPROVAL: PENDING USER VISUAL APPROVAL |
| Digital leaves (sparse, falling, not snow/confetti) | HUMAN VISUAL APPROVAL: PENDING USER VISUAL APPROVAL |
| Text contrast (readable over image) | HUMAN VISUAL APPROVAL: PENDING USER VISUAL APPROVAL |
| CTAs (usable, accessible) | HUMAN VISUAL APPROVAL: PENDING USER VISUAL APPROVAL |
| Hero-to-Foundation transition (smooth, no color jump) | HUMAN VISUAL APPROVAL: PENDING USER VISUAL APPROVAL |
| Reduced-motion mode (static poster, no animation) | HUMAN VISUAL APPROVAL: PENDING USER VISUAL APPROVAL |

---

## 14. Final Status

**PASS**

- Approved asset integrated: ✓
- Canvas runtime removed: ✓
- Scroll-linked poster motion implemented: ✓
- Digital smoke implemented: ✓
- Digital leaves implemented: ✓
- Motes reduced (12→8): ✓
- Aura gold opacity reduced: ✓
- Sheen opacity reduced: ✓
- Text protection direction-aware (LTR/RTL): ✓
- Foundation transition color-matched: ✓
- Foundation background color-matched: ✓
- Mobile poster detection: ✓
- Reduced-motion behavior: ✓
- Reduced-transparency behavior: ✓
- High-contrast behavior: ✓
- Screen-reader behavior (all decorative aria-hidden): ✓
- Build passed: ✓
- No backend/CMS/Leads files touched: ✓
- No new dependencies added: ✓
- Old frame assets preserved for rollback: ✓
- Original PNG not duplicated in src/assets: ✓

**HUMAN VISUAL APPROVAL: PENDING USER VISUAL APPROVAL**

---

## Arabic Note

بعد التنفيذ، تم فتح الموقع في المتصفح للمعاينة. إذا أعطتك الصورة مع الـscroll والدخان والأوراق الإحساس المطلوب، فلن نحتاج إلى مسار الـ120 frame حاليًا. إذا أحسست أن الشجرة يجب أن تنمو فعلًا أثناء التمرير، يمكن استخدام Variation 05 لاحقًا كمرجع ثابت لتوليد الحركة دون تغيير الهوية.
