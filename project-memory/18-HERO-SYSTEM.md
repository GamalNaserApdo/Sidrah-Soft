# 18 · Hero System Documentation

**Status:** LOCKED — KF05→KF06 is the official hero.

---

## 1. Overview

The SidrahSoft website hero is a cinematic, scroll-driven visual experience. It is **not** a marketing banner, CTA block, or feature list. It contains:

- **No hero text.**
- **No hero buttons.**
- **One scroll-driven canvas sequence.**
- **One content section below the hero.**
- **Reduced-motion fallback.**

The hero renders 121 WebP frames from the approved KF05→KF06 video clip, mapped linearly to scroll progress.

---

## 2. Hero Architecture

### Components
- `src/components/hero/CinematicHero.jsx` — React component that manages the hero lifecycle.
- `src/styles/global.css` — Hero layout, height, sticky canvas, fade, and scroll indicator styles.
- `src/components/hero/` — Reserved for future hero-related components (none expected).

### Rendering Pipeline
1. **Detect frame set** on mount (`desktop` vs `mobile`) based on viewport width, CPU cores, and device memory.
2. **Load manifest** (`hero_manifest.json`) from the detected frame set.
3. **Load frames** progressively in batches of 60 with 50ms delay between batches.
4. **First batch loaded** triggers status change from `loading` to `ready` and draws the first frame.
5. **ScrollTrigger** updates `currentFrameRef` on scroll using linear mapping.
6. **Canvas** draws the current frame with `cover` scaling and centering.
7. **Fade** begins when scroll progress exceeds 85%, revealing the foundation section below.
8. **Resize** behavior is handled via `window.resize` and `ResizeObserver`.
9. **Cleanup** aborts image loading, kills ScrollTrigger, and disconnects observers on unmount.

### Frame Set Detection
```
isMobileViewport = window.innerWidth < 768
isLowEndCpu = navigator.hardwareConcurrency <= 4
isLowEndMemory = navigator.deviceMemory <= 4

if (isMobileViewport || isLowEndCpu || isLowEndMemory) → mobile
else → desktop
```

---

## 3. Asset Pipeline

### Official Source Clip
- `src/assets/hero/clips/hero_kf05_to_kf06_v1.mp4`
- 1920×1080, 24 fps, 5.04s, 121 frames

### Generated Frame Sets
| Set | Folder | Resolution | Format | Quality | Frames |
|---|---|---|---|---|---|
| Desktop | `src/assets/hero/frames-kf05kf06/` | 1920×1080 | WebP | 85 | 121 |
| Mobile | `src/assets/hero/frames-kf05kf06-mobile/` | 960×540 | WebP | 80 | 121 |

### Manifest Files
Each frame folder contains `hero_manifest.json` with:
- `total_frames`
- `resolution`
- `quality`
- `format`
- `source_clip`
- `fps`
- `duration`
- `frame_naming`
- `scroll_mapping` = `"linear"`

### Frame Generation Tool
- `project-memory/tools/extract_kf05kf06_frames.py`
- Uses OpenCV + Pillow.
- Extracts each frame, cover-scales to the target resolution, crops to center, and saves as WebP.
- Generates both manifests and a `project-memory/logs/kf05kf06_extraction.log`.

### Frame Naming
```
frame_0001.webp → frame_0121.webp
```

---

## 4. Scroll Behavior

### Hero Height
- **Desktop:** `250vh`
- **Mobile:** `200vh`

The canvas wrapper is `position: sticky; top: 0; height: 100vh`, so the frame sequence plays while the user scrolls through the hero height.

### Frame Mapping
Linear mapping from scroll progress to frame index:

```js
frameIndex = Math.round(progress * (totalFrames - 1))
```

Where `progress` is clamped to `[0, 1]` from ScrollTrigger.

### Previous Mapping (Retired)
The old `STAGES` weighted mapping (Dormant → Awakening → Emergence → Intelligence → First External Awareness → Connection → Purpose) has been removed. The old frame sets are retained but inactive.

---

## 5. Reduced Motion Behavior

When `prefers-reduced-motion: reduce` is detected:

1. **No ScrollTrigger** is created.
2. **No scroll indicator** is shown.
3. Only the **final frame** (`frame_0121.webp`, index `totalFrames - 1`) is loaded.
4. The canvas displays that frame immediately and remains static.

This satisfies accessibility requirements without changing the visual language.

---

## 6. Fade into Content

The hero fades out over the last 15% of scroll progress (0.85 → 1.0). The CSS `opacity` of the canvas wrapper is driven by:

```js
const fadeProgress = Math.max(0, Math.min(1, (progress - 0.85) / 0.15));
canvasWrapper.style.opacity = 1 - fadeProgress;
```

The `.foundation-section` sits below the hero with `margin-top: -100vh`, so as the hero fades, the content appears to be revealed underneath.

---

## 7. Performance Characteristics

| Metric | Old (Full Narrative) | New (KF05→KF06) |
|---|---|---|
| Desktop frames | 366 | 121 |
| Desktop total payload | ~27.8 MB | ~13.7 MB |
| Mobile frames | 366 | 121 |
| Mobile total payload | ~8.5 MB | ~11.2 MB |
| Mapping | Stage-weighted | Linear |
| Hero height desktop | 400vh | 250vh |
| Hero height mobile | 350vh | 200vh |

Desktop payload decreased by ~51%. Mobile payload increased slightly because the KF05→KF06 segment has more visual complexity (golden glow, dense network) than the early dormant frames it replaced, but frame count is still 121, so progressive loading and scroll performance are improved.

---

## 8. Future Changes

No future hero redesign, asset regeneration, or behavior modification is expected. If the hero must change again, this document and `project-memory/19-ASSET-REGISTRY.md` must be updated.

---

## 9. Related Files

| File | Purpose |
|---|---|
| `src/components/hero/CinematicHero.jsx` | Hero component implementation |
| `src/styles/global.css` | Hero layout and visual styles |
| `project-memory/06-VISUAL-STORY-ARCHITECTURE.md` | Hero philosophy and visual direction |
| `project-memory/07-DESIGN-SYSTEM.md` | Accessibility and motion preferences |
| `project-memory/17-DECISION-LOG.md` | Hero decisions and approvals |
| `project-memory/19-ASSET-REGISTRY.md` | Hero and legacy asset registry |
| `project-memory/20-HERO-ARCHITECTURE-SNAPSHOT.md` | Concise architecture snapshot |
