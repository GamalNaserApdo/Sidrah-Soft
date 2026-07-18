# SIDRAH-HERO-CINEMATIC-ASSET-DIRECTION-002 — Higgsfield Visual Direction & Integration Planning

**Date:** 2026-07-16  
**Status:** PASS  
**Scope:** Hero visual assessment, Higgsfield asset direction, integration specification — no code modified, no assets generated

---

## 1. Executive Summary

The current Hero (SIDRAH-HERO-REBUILD-001) is technically functional — canvas frame-sequence engine, scroll narrative, pointer depth, and CSS atmospheric layers all work. However, the **frame content itself** is the weak link. The 121-frame sequence from `hero_kf05_to_kf06_v1.mp4` shows a generic abstract architectural environment with blue/teal dominance that doesn't reflect SidrahSoft's brand DNA (dark plum + gold + copper + purple), contains no brand identity, tells no recognizable story, and could belong to any tech company.

**Recommendation:** Generate a new Higgsfield cinematic asset — "The Digital Sidrah" — where a golden Sidrah tree emerges from digital data streams in a dark architectural space. Retain the existing canvas engine and CSS layers. Replace only frame assets and adjust gradients.

**Next phase:** `SIDRAH-HERO-HIGGSFIELD-INTEGRATION-003` (not started).

---

## 2. Current Hero Visual Assessment

### 2.1 What Currently Works

- **Canvas engine** (`CinematicHero.jsx:78-100`): Scroll-synchronized, zero-seek-lag, DPR-aware
- **Scroll narrative** (`CinematicHero.jsx:164-193`): Content fade 12-42%, canvas fade 85-100%
- **Bilingual content** (`HeroContent.jsx`): i18n in `en.js:5-15` and `ar.js:5-15`
- **CSS atmospheric layers** (`hero.css:258-358`): Aura, motes, sheen well-built
- **Pointer depth** (`hero.css:417-426`): Subtle, desktop-only, properly gated
- **Reduced-motion** (`CinematicHero.jsx:215-234`): Static last frame, immediate content reveal
- **Mobile responsive** (`hero.css:428-497`): Centered, stacked, touch-disabled layers
- **Hero-to-Foundation transition** (`hero.css:577-592`): Bottom gradient blend

### 2.2 What Feels Generic

- **Frame content**: Abstract architectural environment with blue/teal lighting — no brand identity, no Sidrah tree, reads as stock "tech atmosphere"
- **Color palette mismatch**: Frames are cool blue/teal; approved DNA specifies dark plum (`#0a0b10`) + gold (`#c9a96e`) + copper (`#b87333`) + purple (`#8b5ca6`)
- **No brand identity**: No Sidrah tree motif, no logo, no brand mark anywhere
- **No narrative**: Transitions between abstract states with no clear story or subject

### 2.3 What Feels Weak

- **Subject absence**: DNA (`memory/04`) calls for a hero subject. There is none.
- **Text readability**: Text protection gradient (`hero.css:29-42`) at 0.55-0.92 opacity does heavy lifting because frames have varying brightness
- **Foundation transition color mismatch**: Ending frame is blue/teal but transition blends to `rgba(14, 12, 22, 0.95)` (plum) — visible color jump
- **Performance weight**: Desktop 13.7 MB + mobile 11.2 MB + unused `frames/` at 27.8 MB still bundled
- **Sheen visibility**: 0.015-0.03 opacity is nearly invisible on busy frame backgrounds

### 2.4 What Should Remain Untouched

- `CinematicHero.jsx` scroll engine (frame loading, canvas drawing, ScrollTrigger)
- `HeroContent.jsx` structure and i18n
- `HeroScrollCue.jsx` and CSS
- Pointer depth mechanism
- Reduced-motion fallback
- Mobile breakpoints
- All i18n keys
- Foundation h2 demotion

### 2.5 What the Higgsfield Asset Must Solve

1. Brand identity — introduce Sidrah tree as visual subject
2. Color palette — dark plum, gold, copper, controlled purple
3. Narrative — transformation story (digital emergence → growth → resolution)
4. Text-safe negative space — intentional dark area for content overlay
5. Foundation transition — ending frame color must match `#0e0c16`
6. Compositional balance — subject must not conflict with text
7. Distinctive brand experience — unmistakably SidrahSoft

---

## 3. DNA Alignment Gaps

| DNA Requirement | Current State | Gap |
|---|---|---|
| Brand identity as hero subject | No subject — abstract environment | **Critical** |
| Dark plum base + gold highlights | Blue/teal dominant frames | **Critical** |
| Seamless transition to next section | Blue ending → plum Foundation | **Major** |
| Edge/background color unified | Frame edges vary in brightness | **Moderate** |
| Intentional negative space for text | Relies on gradient overlay | **Major** |
| Cinematic lighting (warm raking) | Flat ambient blue | **Major** |
| Editorial composition | Centered abstract, no hierarchy | **Moderate** |
| Arabic + English suitability | Symmetric — works for both | OK |
| Aura/motes/sheen complement subject | Layers float over nothing | **Moderate** |
| Frame count 90-120 | 121 frames | OK |
| Frame width ~1280px | 1920px desktop | Minor |

---

## 4. Recommended Higgsfield Asset Format

### Evaluation

| Format | Visual Quality | Scroll Sync | Mobile Perf | Asset Size | Integration | Engine Support | Verdict |
|---|---|---|---|---|---|---|---|
| A. Seamless video loop | High | None (can't scrub) | Medium | Small | Medium | Needs new engine | Rejected |
| B. Short cinematic sequence | High | Poor (currentTime stutter) | Medium | Medium | Medium | Needs new engine | Rejected |
| C. Image sequence (scroll canvas) | High | Excellent | Medium | Large | Excellent | Current engine | **Primary** |
| D. High-res still + CSS motion | Medium | None (CSS only) | Excellent | Tiny | Easy | Simple | **Fallback** |
| E. Hybrid: sequence + CSS layers | Highest | Excellent | Medium | Large | Good | Current engine | Already E |

### Primary: C — Image Sequence for Scroll-Controlled Canvas

- Current engine in `CinematicHero.jsx` already implements this — no rewrite needed
- Scroll-synchronization is the core premium experience (DNA `memory/02`)
- DNA explicitly forbids `video.currentTime` scrubbing (`memory/02`: "NEVER scrub a `<video>`")
- 90-120 frames at JPEG q≈80 is the proven recipe (~5-8 MB per `memory/02`)
- The problem is CONTENT, not FORMAT

### Fallback: D — High-Resolution Still with Layered CSS Motion

- For reduced-motion users (already implemented — loads last frame statically)
- For low-end devices / low-bandwidth connections
- A single keyframe from the new concept serves as poster + fallback

### What changes from current

The FORMAT stays. The CONTENT changes completely: new keyframes, new clips, new frame sequence, new posters, updated text protection gradient, updated Foundation transition gradient.

---

## 5. Primary Cinematic Concept

### Title: "The Digital Sidrah"

### Description

A cinematic scroll-driven sequence depicting the emergence of the Sidrah tree — SidrahSoft's namesake — from digital essence in a dark architectural space. The tree grows from a single golden spark into a fully formed digital organism whose branches are woven from data streams, network nodes, and light filaments. A metaphor for digital transformation: from seed to system, from idea to ecosystem.

### Visual Narrative

| State | Scroll | Visual |
|---|---|---|
| **Beginning** | 0.00-0.15 | Dark void. Single golden spark pulses at center-bottom. Faint purple ambient glow. |
| **Early growth** | 0.15-0.35 | Spark grows upward, splitting into branching stems of golden light. Data particles drift upward. Delicate sapling. |
| **Mid transformation** | 0.35-0.60 | Tree expands. Branches multiply with copper and purple tones. Network nodes glow at intersections. Background reveals dark architectural space. |
| **Full bloom** | 0.60-0.85 | Digital Sidrah complete — mature tree of light, canopy fills upper frame. Gold and copper branches, glowing nodes. Negative space in lower-left (LTR) / lower-right (RTL) for text. |
| **Resolution** | 0.85-1.00 | Tree glow settles to steady warm state. Background darkens toward `#0e0c16`. Calm, permanent — blends into Foundation. |

### Main Subject

The Digital Sidrah — a tree form of light filaments, data streams, and network nodes. Not literal — digital interpretation. Branches are thin golden light lines, leaves are glowing data points, trunk is converging light streams. Centered horizontally, positioned upper-frame, leaving lower third as dark negative space.

### Environment

Vast dark architectural space — a cathedral of data. Barely visible columns in deep background provide scale. Floor is dark reflective obsidian catching faint golden reflections. Space extends infinitely into darkness. Atmosphere has volume: purple haze, gold dust suspended.

### Camera Angle

Slight low angle (5-10 degrees upward), looking up at the tree. Monumentality and presence.

### Camera Movement

Slow continuous upward dolly + gentle 2-3 degree orbit. Starts at base, rises to mid-tree height. No cuts, no flicker, slow motion per DNA `memory/03`.

### Lighting

- **Primary**: Warm golden light from the tree itself (emissive)
- **Secondary**: Subtle purple ambient from atmosphere
- **Tertiary**: Faint copper rim light from lower-right
- **Background**: Near-black with deep purple undertone, volumetric depth
- **Contrast**: High — bright tree against dark space. Editorial luxury per DNA `memory/09`.

### Color Palette

| Element | Color | Hex |
|---|---|---|
| Background base | Dark plum | `#0a0b10` |
| Deep atmosphere | Purple | `#2a1a3a` → `#8b5ca6` (subtle) |
| Tree primary | Gold | `#c9a96e` |
| Tree secondary | Copper | `#b87333` |
| Network nodes | Warm gold | `#d4af6a` |
| Floor reflection | Dark plum | `#12101a` |
| Foundation blend | Dark plum | `#0e0c16` |

### Depth Layers

1. **Background**: Architectural space, barely visible, deep purple
2. **Mid-ground**: Tree trunk and primary branches, gold light
3. **Foreground**: Fine branch tips, floating data motes, gold dust
4. **Overlay**: Atmospheric purple haze, vignette edges

### Motion Behavior

- Tree growth is continuous and smooth — no sudden jumps
- Data motes drift upward continuously (ambient life)
- Network nodes pulse subtly (not synchronized — organic)
- Camera rise is imperceptible per frame, visible across full sequence
- No looping motion within the sequence — it's a one-way transformation

### Seamless-Loop Requirements

This is NOT a loop — it's a one-way scroll-driven sequence. The ending state (frame 121) is the "resolved" state that blends into Foundation. For reduced-motion users, the ending state is shown statically.

### Foundation Transition Behavior

- Ending frame background approaches `#0e0c16`
- Tree glow is steady, not flickering
- The `hero-foundation-transition` gradient (`hero.css:577-592`) blends the bottom 8rem into Foundation
- No visible color jump — the ending frame's lower portion should already be near-`#0e0c16`

### Text-Reserved Areas

- **LTR (English)**: Lower-left quadrant, 42rem max-width. Tree is centered-upper, so lower-left is dark negative space.
- **RTL (Arabic)**: Lower-right quadrant. Same composition — tree centered-upper, lower-right is dark.
- Both rely on the composition's negative space, not just the gradient overlay. The gradient is a secondary safety net.

### What Must Never Appear

- No literal realistic tree (it's digital, abstracted)
- No people or human figures in the hero sequence
- No text or watermarks in the generated frames
- No blue/teal color dominance
- No generic "tech grid" or circuit board patterns
- No stock-photo aesthetic
- No flickering, stuttering, or morphing artifacts
- No visible cuts between clips

---

## 6. Desktop Production Specification

| Parameter | Value | Rationale |
|---|---|---|
| **Aspect ratio** | 16:9 | Standard desktop hero, matches current canvas |
| **Resolution** | 1920×1080 (source), 1280px wide (extracted frames) | DNA `memory/02` recommends ~1280px; downscale from 1920p source |
| **Duration** | ~5 seconds (source clip) | 121 frames at 24fps = 5.04s, matches current manifest |
| **Frame rate** | 24fps | Cinematic standard, matches current manifest |
| **Frame count** | 96-120 frames | DNA `memory/02`: 90-120 range. Extract at 24 frames/clip. |
| **Camera movement** | Slow upward dolly + 2-3 degree orbit | Subtle, no cuts, no flicker |
| **Loop behavior** | One-way (not a loop) | Scroll-driven, ends at resolved state |
| **Compression target** | WebP q=80, ~80-115 KB/frame | Current frames average ~110 KB. Target ~8-12 MB total. |
| **Safe content zone** | Upper 60% of frame — tree subject | Tree centered, upper-frame positioned |
| **Text negative-space zone** | Lower-left quadrant, 42rem wide, bottom 40% of frame | Dark, uncluttered for LTR text overlay |
| **Subject position** | Centered horizontally, upper 60% vertically | Leaves lower third dark |
| **File format** | WebP (frames), MP4 H.264 (source clips) | WebP for quality/size ratio, MP4 for Higgsfield pipeline |
| **Edge color** | `#0a0b10` (dark plum) at all edges | DNA `memory/03`: unified edge color across all keyframes |
| **Frame naming** | `frame_%04d.webp` | Matches current convention |

### Keyframe Plan (5 keyframes, 4 boundary-matched clips)

Per DNA `memory/03` (boundary-matched clips) and `memory/06` (Higgsfield pipeline):

| Keyframe | Description | Higgsfield Model |
|---|---|---|
| K1 | Dark void, single golden spark at center-bottom, purple ambient | `gpt_image_2` (no product identity to preserve) |
| K2 | Sapling — thin golden stems branching upward, data motes rising | `gpt_image_2` |
| K3 | Mid-growth — tree expanding, copper/purple tones, network nodes appearing, architectural space visible | `gpt_image_2` |
| K4 | Full bloom — mature Digital Sidrah, canopy fills upper frame, gold+copper branches, glowing nodes | `gpt_image_2` |
| K5 | Resolution — tree glow settled, background darkened to `#0e0c16`, calm permanent state | `gpt_image_2` |

| Clip | Start → End | Movement |
|---|---|---|
| V1 | K1 → K2 | Spark grows into sapling, slow upward motion |
| V2 | K2 → K3 | Tree expands, branches multiply, camera rises |
| V3 | K3 → K4 | Full bloom, canopy fills, nodes activate |
| V4 | K4 → K5 | Glow settles, background darkens, resolution |

All clips: `seedance_2_0`, `--aspect_ratio 16:9`, `--resolution 1080p`, `--duration 5`, `--bitrate_mode high`, `--generate_audio false`.

### Shared Keyframe Prompt Spec

```
Edge/background: Deep near-black dark plum #0a0b10 fading to the same tone at every edge and corner, volumetric purple haze in the atmosphere.
Style: Editorial luxury, cinematic lighting, hyper-detailed, no extra text, no watermark, no people.
Palette: Gold #c9a96e primary, copper #b87333 secondary, purple #8b5ca6 ambient, dark plum #0a0b10 base.
Subject: A digital tree (the Sidrah tree) constructed from light filaments, data streams, and glowing network nodes — not a literal tree, a digital interpretation.
Composition: Subject centered horizontally, positioned in upper 60% of frame. Lower third is dark negative space.
```

---

## 7. Mobile Production Specification

### Decision: Dedicated mobile variation

**Rationale:** The tree's vertical extent and the need for text-safe negative space differ significantly between 16:9 (desktop) and 9:16 or 4:3 (mobile). A simple crop of the 16:9 frame would either cut off the canopy or compress the tree. A dedicated mobile asset with adjusted composition is better.

| Parameter | Value | Rationale |
|---|---|---|
| **Aspect ratio** | 9:16 (portrait) | Matches mobile viewport orientation |
| **Resolution** | 1080×1920 (source), 720px wide (extracted frames) | Smaller for mobile performance |
| **Duration** | ~5 seconds (same narrative) | Consistent story |
| **Frame rate** | 24fps | Same cinematic standard |
| **Frame count** | 72-96 frames | Fewer than desktop for mobile loading |
| **Subject placement** | Centered, upper 50% of frame | More vertical space, tree occupies upper half |
| **Safe crop rules** | If using desktop asset: crop to center, tree must remain visible | Fallback only — dedicated asset preferred |
| **Text-safe area** | Lower 40% of frame, full width | Dark negative space for centered mobile text |
| **Performance** | Target ~6-8 MB total frame weight | Current mobile set is 11.2 MB — reduce |
| **Export format** | WebP q=75 | Slightly lower quality for mobile size |
| **Edge color** | `#0a0b10` (same as desktop) | Consistent |

### Mobile Keyframe Adjustments

Same 5 keyframes but recomposed for 9:16:
- Tree is more vertically oriented (taller, narrower canopy)
- Lower 40% is intentionally dark
- Camera angle slightly more level (less upward tilt) to fit vertical frame
- Architectural background columns are cropped out (simpler background)

### Mobile Clips

Same 4 boundary-matched clips, `--aspect_ratio 9:16`, `--resolution 1080p`, `--duration 5`, `--generate_audio false`.

---

## 8. Poster and Fallback Requirements

| Asset | Desktop | Mobile | Purpose |
|---|---|---|---|
| **Poster image** | K5 keyframe (resolution state), 1920×1080, WebP q=87, ~200-400 KB | K5 mobile keyframe, 1080×1920, WebP q=85, ~150-300 KB | Shown before frames load, during loading, as `<img>` fallback |
| **Reduced-motion fallback** | K5 (same as poster) — shown statically | K5 mobile — shown statically | Already implemented in `CinematicHero.jsx:157-162` |
| **Loading fallback** | CSS gradient: `linear-gradient(180deg, #0a0b10, #12101a)` with centered gold pulse | Same | Shown if poster fails to load |
| **Missing-asset fallback** | `status === 'error'` message (`CinematicHero.jsx:278-282`) + gradient background | Same | Already implemented |
| **Low-bandwidth fallback** | Poster only — skip frame loading if `navigator.connection.effectiveType` is 2g/slow-2g | Same | New — add to `detectFrameSet()` logic |

### Poster-First Loading Strategy

1. Render poster `<img>` immediately (or CSS gradient if poster not yet loaded)
2. Begin frame preloading in background
3. At first batch ready (60 frames), crossfade poster → canvas
4. If frames fail, poster remains visible

This is a refinement of the current approach — the poster provides instant visual context while frames load.

---

## 9. Integration Architecture

### Approach: Replace frame assets in-place, retain all engine code

The safest path is to **swap the frame sequence files** and make **surgical CSS adjustments** — no structural rewrite of `CinematicHero.jsx`.

### Layer Decision Matrix

| Layer | Action | Rationale |
|---|---|---|
| Canvas frame sequence | **Replace** frames with new "Digital Sidrah" sequence | Core visual change |
| `HeroAura` | **Retain** — adjust opacity if needed | Purple/gold glows complement tree's gold light |
| `HeroMotes` | **Retain** — reduce count from 12 to 8 | Fewer motes to avoid clutter over branches |
| `HeroSheen` | **Retain** — increase opacity slightly (0.03 → 0.05) | More visible on darker frames |
| `HeroScrollCue` | **Retain unchanged** | No interaction with main asset |
| `hero-text-protection` | **Adjust** — reduce top opacity 0.55 → 0.35 | New frames have intentional dark negative space |
| `hero-foundation-transition` | **Adjust** — blend color to `rgba(10, 11, 16, 0.95)` | Match new ending frame edge color |
| Pointer depth | **Retain unchanged** | No interaction with main asset |
| Scroll narrative phases | **Retain unchanged** | Timing works with any content |

### Files Likely to Be Modified

| File | Change | Scope |
|---|---|---|
| `src/assets/hero/frames-kf05kf06/*.webp` | Replace all 121 frames | Asset swap |
| `src/assets/hero/frames-kf05kf06-mobile/*.webp` | Replace all mobile frames | Asset swap |
| `src/assets/hero/frames-kf05kf06/hero_manifest.json` | Update `source_clip`, possibly `total_frames` | Metadata |
| `src/assets/hero/frames-kf05kf06-mobile/hero_manifest.json` | Same | Metadata |
| `src/styles/hero.css` | Adjust `hero-text-protection` opacity, `hero-foundation-transition` color | 2 CSS values |
| `src/components/hero/HeroMotes.jsx` | Reduce mote count 12 → 8 | 1 constant |
| `src/components/hero/CinematicHero.jsx` | Add poster-first loading, low-bandwidth detection | ~15-20 lines |

### Files That Should Remain Unchanged

- `src/components/hero/HeroContent.jsx`
- `src/components/hero/HeroAura.jsx`
- `src/components/hero/HeroSheen.jsx`
- `src/components/hero/HeroScrollCue.jsx`
- `src/i18n/en.js`, `src/i18n/ar.js`
- `src/components/sections/FoundationSection.jsx`
- `src/styles/sections.css`
- `src/App.jsx`

### Asset Directory Structure

```
src/assets/hero/
├── frames-digital-sidrah/           # NEW desktop frames
│   ├── frame_0001.webp ... frame_0120.webp
│   └── hero_manifest.json
├── frames-digital-sidrah-mobile/    # NEW mobile frames
│   ├── frame_0001.webp ... frame_0096.webp
│   └── hero_manifest.json
├── posters/                         # NEW poster images
│   ├── hero-poster-desktop.webp
│   └── hero-poster-mobile.webp
├── clips/                           # Source clips (retained)
│   ├── digital-sidrah-v1.mp4 ... v4.mp4
└── src/                             # Source keyframes (retained)
    ├── k1.jpg ... k5.jpg
```

### Desktop/Mobile Source Selection

Current `detectFrameSet()` in `CinematicHero.jsx:19-32` already handles viewport/CPU/memory detection. **Enhancement:** Add `navigator.connection?.effectiveType` check for 2g/slow-2g → poster-only fallback.

### Preload Strategy

- **Current**: Batch loading (60 frames/batch, 50ms delay) — retain
- **Enhancement**: Load poster image first (high priority), then begin batch loading
- Poster gets `fetchpriority="high"`, frames get `fetchpriority="low"`
- First batch ready triggers canvas handoff from poster

### Poster-First Rendering

1. On mount: render poster `<img>` as background layer behind canvas
2. Canvas starts transparent
3. As first batch loads, canvas draws current scroll frame
4. Poster fades out once canvas is ready
5. If canvas fails, poster remains as static hero image

### Error Fallback

Already implemented (`CinematicHero.jsx:152-154`, `278-282`). No change needed.

### Reduced-Motion Fallback

Already implemented (`CinematicHero.jsx:215-234`) — loads last frame statically. K5 poster serves this. No change needed.

### Tab Visibility Handling

**New:** Pause batch loading when tab hidden, resume when visible. Prevents wasted bandwidth.

### Cleanup Requirements

- Remove old `frames/` directory (367 frames, 27.8 MB) — unused, still bundled
- Remove old `frames-mobile/` directory (367 frames) — unused
- Remove old `1.png` through `6.png` keyframes (10.8 MB) — superseded
- Remove old `clips/hero_kf*.mp4` files (34.9 MB) — superseded
- **Total cleanup**: ~73+ MB removed from bundle

### Scroll Narrative Interaction

No change. New sequence has same 5-beat structure mapping to existing content fade (12-42%) and canvas fade (85-100%).

### Blending into Foundation

- Ending frame background approaches `#0e0c16`
- Adjust `hero-foundation-transition` gradient end to `rgba(10, 11, 16, 0.95)`
- Seamless visual continuity

### Text Readability

- New frames have intentional dark negative space in lower third
- Reduce `hero-text-protection` top opacity from 0.55 to 0.35
- Composition provides primary contrast; gradient is secondary

### Preventing Decorative Layer Overload

- Aura: retained at current opacity — complements tree glow
- Motes: reduced 12 → 8 — prevents clutter over branches
- Sheen: slightly increased (0.03 → 0.05) — visible on darker frames
- All layers z-index 1, behind text protection z-index 2 — atmosphere without competition

---

## 10. Performance Budget

### Asset Size Targets

| Asset | Ideal Target | Maximum Acceptable | Current |
|---|---|---|---|
| Desktop frames (total) | 8 MB | 12 MB | 13.7 MB |
| Mobile frames (total) | 5 MB | 8 MB | 11.2 MB |
| Desktop poster | 200 KB | 400 KB | N/A (new) |
| Mobile poster | 150 KB | 300 KB | N/A (new) |
| **Total hero weight** | **13.5 MB** | **20.5 MB** | **24.9 MB** |

### Compression Strategy

| Asset | Format | Quality | Rationale |
|---|---|---|---|
| Desktop frames | WebP | q=80 | Current quality, good size/quality ratio |
| Mobile frames | WebP | q=75 | Slightly lower for mobile bandwidth |
| Desktop poster | WebP | q=87 | Single image, higher quality OK |
| Mobile poster | WebP | q=85 | Single image, moderate quality |
| Source clips | MP4 H.264 | high bitrate | Higgsfield output, not served to users |

### File Format Strategy

| Format | Use Case | Browser Support | Fallback |
|---|---|---|---|
| WebP | Primary format for all frames + posters | All modern browsers (Chrome, Firefox, Safari 16+, Edge) | JPEG fallback not needed — WebP is universally supported now |
| MP4 H.264 | Source clips only (not served) | N/A | N/A |

### Browser Fallback Strategy

1. **WebP supported** (all modern browsers): Load WebP frames + posters
2. **WebP not supported** (ancient browsers): CSS gradient fallback (already implemented via `status === 'error'`)
3. **JavaScript disabled**: CSS gradient background on `.cinematic-hero` section

### Adaptive Loading

| Condition | Behavior |
|---|---|
| Desktop, fast connection | Full frame sequence (120 frames) |
| Mobile, 4G+ | Mobile frame sequence (96 frames) |
| Mobile, 3G | Mobile frame sequence, slower batch loading |
| 2G / slow-2g | Poster only, no frame loading |
| Reduced motion | Static poster (last keyframe) |
| Low-end CPU (≤4 cores) | Mobile frame set regardless of viewport |
| Low memory (≤4 GB) | Mobile frame set regardless of viewport |

### Autoplay Constraints

Not applicable — no video element used. Canvas frame sequence is driven by scroll, not autoplay. No browser autoplay policy restrictions.

### Low-Data / Reduced-Motion Users

- **Reduced motion**: Static K5 poster shown, no scroll animation, content revealed immediately (already implemented)
- **Low data**: `navigator.connection.saveData === true` → poster only, no frames
- **Both**: Static poster + immediate content

---

## 11. Files Expected to Change During Integration

| File | Change Type | Scope |
|---|---|---|
| `src/assets/hero/frames-kf05kf06/*.webp` | Replace | 121 → 120 new frames |
| `src/assets/hero/frames-kf05kf06-mobile/*.webp` | Replace | 121 → 96 new mobile frames |
| `src/assets/hero/frames-kf05kf06/hero_manifest.json` | Update | `source_clip`, `total_frames`, `resolution` |
| `src/assets/hero/frames-kf05kf06-mobile/hero_manifest.json` | Update | Same |
| `src/assets/hero/posters/hero-poster-desktop.webp` | Create | New poster |
| `src/assets/hero/posters/hero-poster-mobile.webp` | Create | New poster |
| `src/styles/hero.css` | Edit | 2 values: text protection opacity, foundation transition color |
| `src/components/hero/HeroMotes.jsx` | Edit | Mote count 12 → 8 |
| `src/components/hero/CinematicHero.jsx` | Edit | Poster-first loading, low-bandwidth detection, tab visibility |
| Old `frames/`, `frames-mobile/`, `1-6.png`, old clips | Delete | ~73 MB cleanup |

---

## 12. Risks and Mitigations

| Risk | Severity | Mitigation |
|---|---|---|
| **Higgsfield generation inconsistency** — keyframes may not share identical edge colors | High | Use shared prompt spec with explicit edge color `#0a0b10`. Verify each keyframe visually before generating clips. |
| **Seedance video artifacts** — flickering, morphing, face distortion (if any people) | High | No people in hero sequence. Prompt "no cuts, no flicker, slow motion, no morphing artifacts". Retry 3-4× per DNA `memory/06`. |
| **Frame extraction count mismatch** — clips may yield different frame counts than expected | Medium | Use OpenCV extraction script from DNA `memory/06`. Update `hero_manifest.json` with actual count. Set `FRAME_COUNT` in sync. |
| **Color palette drift** — Higgsfield may introduce unwanted blue/teal tones | Medium | Explicit palette in every prompt: "gold #c9a96e, copper #b87333, purple #8b5ca6, dark plum #0a0b10. No blue, no teal." Verify visually. |
| **Text readability over tree branches** — canopy may extend into text zone | Medium | Composition specifies tree in upper 60%, lower third is dark. Verify K4/K5 frames have sufficient contrast in lower-left quadrant. |
| **Mobile performance** — 96 frames at 720px may still be heavy | Medium | Target 5-6 MB total. WebP q=75. Consider 72 frames if size exceeds 6 MB. |
| **Bundle size increase** — adding posters while old assets remain | Low | Delete old assets first, then add new ones. Net reduction expected. |
| **Foundation transition color mismatch** — ending frame may not perfectly match `#0e0c16` | Low | K5 prompt explicitly specifies background darkened to `#0e0c16`. Adjust gradient if needed. |
| **RTL text placement** — Arabic text in lower-right may overlap tree base | Low | Tree is centered, lower-right is dark by composition. Verify with Arabic text overlay on K4/K5. |

---

## 13. Exact Next Phase

**Phase name:** `SIDRAH-HERO-HIGGSFIELD-INTEGRATION-003`

**Scope:**
1. Generate 5 desktop keyframes (K1-K5) via Higgsfield `gpt_image_2`
2. Generate 5 mobile keyframes (9:16 recomposition) via Higgsfield `gpt_image_2`
3. Generate 4 desktop boundary-matched clips (V1-V4) via Higgsfield `seedance_2_0`
4. Generate 4 mobile boundary-matched clips via Higgsfield `seedance_2_0`
5. Extract desktop frame sequence (OpenCV, ~120 frames, 1280px, WebP q=80)
6. Extract mobile frame sequence (OpenCV, ~96 frames, 720px, WebP q=75)
7. Generate desktop + mobile poster images from K5
8. Replace frame assets in `src/assets/hero/`
9. Update `hero_manifest.json` files
10. Adjust `hero.css` (text protection opacity, foundation transition color)
11. Update `HeroMotes.jsx` (mote count 12 → 8)
12. Update `CinematicHero.jsx` (poster-first loading, low-bandwidth detection, tab visibility)
13. Delete old unused assets (`frames/`, `frames-mobile/`, `1-6.png`, old clips)
14. Run `npm run build`
15. Visual QA in browser (desktop + mobile viewports, LTR + RTL)
16. Create implementation report

**Not in scope:**
- Hero engine rewrite
- New scroll narrative phases
- Backend changes
- CMS, Leads, or other section modifications
- Lenis smooth scroll integration
- Global motion architecture
- Full mobile audit

---

## 14. Final Status

**PASS**

- Current Hero visual assessment: complete
- DNA alignment gaps: identified
- Higgsfield asset format: recommended (C — image sequence, primary; D — still + CSS, fallback)
- Cinematic concept: defined ("The Digital Sidrah")
- Desktop production specification: complete
- Mobile production specification: complete (dedicated 9:16 variation)
- Poster and fallback requirements: specified
- Integration architecture: specified (asset swap + surgical CSS/code adjustments)
- Performance budget: defined (13.5 MB ideal, 20.5 MB max)
- Files expected to change: listed
- Risks and mitigations: documented
- Next phase: `SIDRAH-HERO-HIGGSFIELD-INTEGRATION-003`
- No code modified, no assets generated, no unrelated phase started
