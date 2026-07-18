# 19 · Asset Registry

**Status:** LOCKED — KF05→KF06 hero assets are official. Legacy assets are retained but inactive.

---

## 1. Official Hero Assets

These are the active, production assets used by the current website hero.

| Asset | Path | Status | Details |
|---|---|---|---|
| Source clip | `src/assets/hero/clips/hero_kf05_to_kf06_v1.mp4` | ACTIVE | 1920×1080, 24 fps, 5.04s, 121 frames |
| Desktop frames | `src/assets/hero/frames-kf05kf06/` | ACTIVE | 121 frames, 1920×1080, WebP q85, `frame_0001.webp` → `frame_0121.webp` |
| Desktop manifest | `src/assets/hero/frames-kf05kf06/hero_manifest.json` | ACTIVE | Linear scroll mapping, 121 frames |
| Mobile frames | `src/assets/hero/frames-kf05kf06-mobile/` | ACTIVE | 121 frames, 960×540, WebP q80, `frame_0001.webp` → `frame_0121.webp` |
| Mobile manifest | `src/assets/hero/frames-kf05kf06-mobile/hero_manifest.json` | ACTIVE | Linear scroll mapping, 121 frames |

### Source Clip Metadata
```json
{
  "clip": "hero_kf05_to_kf06_v1.mp4",
  "resolution": { "width": 1920, "height": 1080 },
  "fps": 24.0,
  "frame_count": 121,
  "duration": "5.04s"
}
```

---

## 2. Legacy Assets (Retained but Inactive)

These assets were part of the retired full Dormant → Purpose narrative hero. They are **not** loaded by the current website. They are kept because:

- The project rule is "Do not delete source assets."
- They may be referenced for future analysis or reversion.
- They preserve the original generation and review work.

| Asset | Path | Status | Details |
|---|---|---|---|
| Legacy source clip — KF01→KF02 | `src/assets/hero/clips/hero_kf01_to_kf02_v1.mp4` | INACTIVE | Retained |
| Legacy source clip — KF02→KF03 | `src/assets/hero/clips/hero_kf02_to_kf03_v1.mp4` | INACTIVE | Retained |
| Legacy source clip — KF03→KF04 | `src/assets/hero/clips/hero_kf03_to_kf04_v1.mp4` | INACTIVE | Retained |
| Legacy source clip — KF04→KF045 | `src/assets/hero/clips/hero_kf04_to_kf045_v1.mp4` | INACTIVE | Retained |
| Legacy source clip — KF045→KF05 | `src/assets/hero/clips/hero_kf045_to_kf05_v1.mp4` | INACTIVE | Retained |
| Legacy desktop frames | `src/assets/hero/frames/` | INACTIVE | 366 frames, old full narrative |
| Legacy mobile frames | `src/assets/hero/frames-mobile/` | INACTIVE | 366 frames, old full narrative |
| Legacy JSON job files | `src/assets/hero/clips/job_*.json` | INACTIVE | Higgsfield generation metadata |

---

## 3. Other Hero-Related Assets

| Asset | Path | Status | Notes |
|---|---|---|---|
| Static PNGs | `src/assets/hero/1.png`, `2.png`, `3.png`, `4.png`, `4.5.png`, `5.png`, `6.png` | INACTIVE | Source/staging images from earlier iterations |
| Screenshot captures | `src/assets/hero/clips/screenshots/` | INACTIVE | Review screenshots |
| Logo | `src/assets/logo.svg` | ACTIVE | Brand logo used across site |

---

## 4. Asset Naming Conventions

### Source Clips
```
hero_kf{start}_to_kf{end}_v{n}.mp4
```
Example: `hero_kf05_to_kf06_v1.mp4`

### Generated Frames
```
frame_{index}.webp
```
Index is zero-padded to 4 digits. Example: `frame_0001.webp`, `frame_0121.webp`.

### Frame Folders
```
frames-kf{start}kf{end}/
frames-kf{start}kf{end}-mobile/
```
Example: `frames-kf05kf06/`, `frames-kf05kf06-mobile/`.

---

## 5. If Assets Must Change in the Future

1. Keep the old active assets as legacy.
2. Create a new folder with the `frames-kf{start}kf{end}` pattern.
3. Update `src/components/hero/CinematicHero.jsx` manifest imports and `getFrameUrl()` folder logic.
4. Update `src/styles/global.css` if heights change.
5. Update `project-memory/18-HERO-SYSTEM.md`, `19-ASSET-REGISTRY.md`, and `20-HERO-ARCHITECTURE-SNAPSHOT.md`.
6. Update `project-memory/17-DECISION-LOG.md`.
7. Store generation logs in `project-memory/logs/` and evidence in `project-memory/evidence/`.
