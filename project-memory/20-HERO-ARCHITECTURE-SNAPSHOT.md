# 20 · Hero Architecture Snapshot

**Snapshot date:** 2026-07-09  
**Hero status:** LOCKED — KF05→KF06  

This is a concise snapshot of the official hero system. It is the current source of truth for the hero implementation.

---

## 1. Current Hero System

```
┌─────────────────────────────────────────────────────┐
│                    Hero Section                     │
│  .cinematic-hero (height: 250vh desktop / 200vh)  │
│  ┌─────────────────────────────────────────────┐  │
│  │ .cinematic-canvas-wrapper (sticky, 100vh) │  │
│  │  ┌─────────────────────────────────────┐  │  │
│  │  │ <canvas> draws current frame         │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  │  ┌─────────────────┐                       │  │
│  │  │ scroll indicator│                       │  │
│  │  └─────────────────┘                       │  │
│  └─────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                    ↓ (scroll, then fade last 15%)
┌─────────────────────────────────────────────────────┐
│              .foundation-section                    │
│          (margin-top: -100vh, z-index: 1)           │
│              Content appears here                  │
└─────────────────────────────────────────────────────┘
```

### Component
- `src/components/hero/CinematicHero.jsx`

### Core responsibilities
- Detect desktop/mobile frame set.
- Load manifest and frames progressively.
- Set up GSAP ScrollTrigger.
- Draw current frame to canvas on scroll.
- Fade canvas wrapper over last 15% of scroll.
- Hide scroll indicator after 5% scroll.
- Support `prefers-reduced-motion: reduce` with a static final frame.

---

## 2. Current Scroll System

### GSAP ScrollTrigger
```js
ScrollTrigger.create({
  trigger: containerRef.current,
  start: 'top top',
  end: 'bottom bottom',
  scrub: 0.5,
  onUpdate: (self) => {
    const frameIndex = getLinearFrameIndex(self.progress, totalFrames);
    // draw frame
  }
});
```

### Linear Frame Mapping
```js
function getLinearFrameIndex(progress, totalFrames) {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  return Math.round(clampedProgress * (totalFrames - 1));
}
```

### Hero Heights
- Desktop: `250vh`
- Mobile: `200vh` (breakpoint `max-width: 767px`)

### Fade / Dissolve
- Starts at 85% scroll progress.
- Ends at 100% scroll progress.
- Canvas wrapper opacity goes from `1` to `0`.

---

## 3. Current Asset Pipeline

```
┌──────────────────────────────────────────────┐
│  hero_kf05_to_kf06_v1.mp4 (source clip)      │
│  1920×1080, 24fps, 5.04s, 121 frames          │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ extract_kf05kf06_    │
        │ frames.py            │
        │ OpenCV + Pillow      │
        └──────────────────────┘
                   │
         ┌─────────┴──────────┐
         ▼                    ▼
  ┌──────────────┐      ┌──────────────┐
  │ Desktop      │      │ Mobile       │
  │ 1920×1080   │      │ 960×540      │
  │ WebP q85    │      │ WebP q80     │
  │ 121 frames  │      │ 121 frames   │
  └──────────────┘      └──────────────┘
```

### Tool location
- `project-memory/tools/extract_kf05kf06_frames.py`

### Output locations
- `src/assets/hero/frames-kf05kf06/`
- `src/assets/hero/frames-kf05kf06-mobile/`

---

## 4. Current Performance Characteristics

| Metric | Value |
|---|---|
| Active desktop frames | 121 |
| Active mobile frames | 121 |
| Desktop payload | ~13.7 MB total |
| Mobile payload | ~11.2 MB total |
| Avg desktop frame size | ~115.9 KB |
| Avg mobile frame size | ~94.7 KB |
| Progressive load batch size | 60 frames |
| Batch delay | 50 ms |
| Scroll scrub | 0.5s |
| Fade range | 0.85–1.0 scroll progress |

### Performance Impact vs Old System
- Desktop total payload reduced by ~51% (27.8 MB → 13.7 MB).
- Mobile payload slightly higher due to visual complexity of KF05→KF06 segment, but still only 121 frames.
- Scroll mapping is simpler and more predictable (linear instead of weighted stages).
- Progressive loading is faster because there are fewer total frames.

---

## 5. Key Files

| File | Role |
|---|---|
| `src/components/hero/CinematicHero.jsx` | Hero implementation |
| `src/styles/global.css` | Hero layout, sticky, fade, scroll indicator |
| `src/assets/hero/frames-kf05kf06/hero_manifest.json` | Desktop manifest |
| `src/assets/hero/frames-kf05kf06-mobile/hero_manifest.json` | Mobile manifest |
| `project-memory/tools/extract_kf05kf06_frames.py` | Frame generation tool |
| `project-memory/18-HERO-SYSTEM.md` | Full hero documentation |
| `project-memory/19-ASSET-REGISTRY.md` | Asset registry |
| `project-memory/20-HERO-ARCHITECTURE-SNAPSHOT.md` | This snapshot |

---

## 6. No-Change Rules

Until a new formal approval is recorded:

- Do not redesign the hero.
- Do not regenerate frames.
- Do not change scroll behavior.
- Do not add hero text or buttons.
- Do not delete `src/assets/hero/frames/` or `src/assets/hero/frames-mobile/` (legacy, retained).
- Do not delete any source clips.
