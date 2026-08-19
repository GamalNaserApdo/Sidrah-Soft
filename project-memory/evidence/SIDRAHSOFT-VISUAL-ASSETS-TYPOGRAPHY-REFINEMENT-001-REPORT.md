# SIDRAHSOFT-VISUAL-ASSETS-TYPOGRAPHY-REFINEMENT-001-REPORT

**Task ID:** `SIDRAHSOFT-VISUAL-ASSETS-TYPOGRAPHY-REFINEMENT-001`  
**Date:** 2026-08-19  
**Repository:** `F:\What_i_Made\New\sidrah_web`  
**Preview URL:** `http://127.0.0.1:63395` (served from `dist/` via `npm run preview`)

---

## Summary

Implemented a focused visual/assets refinement pass across the SidrahSoft public website and CMS login/sidebar branding surfaces. Changes are limited to frontend assets, imports, and CSS — no backend or database changes were made.

---

## 1. Files Modified

| File | What changed |
|---|---|
| `index.html` | Replaced Google Fonts link with Space Grotesk + Inter + Cairo; removed stale static Organization JSON-LD that referenced the old `logo.svg`. |
| `src/styles/tokens.css` | Updated `--font-display-ar` and `--font-body-ar` to `Cairo`; removed `El Messiri` and `Tajawal` fallbacks from display/body tokens. |
| `src/components/Header.jsx` | Imported new logo from `src/assets/logo.png` as the public fallback. |
| `src/components/Footer.jsx` | Imported new logo from `src/assets/logo.png` as the public fallback. |
| `src/pages/cms/CMSLoginPage.jsx` | Imported new logo; removed circular crop/border-radius so the logo keeps its aspect ratio. |
| `src/components/cms/layout/CMSSidebar.jsx` | Imported new logo; removed circular crop/border-radius so the logo keeps its aspect ratio. |
| `src/config/seo.js` | Imported `brandLogo` from `src/assets/logo.png` and set `SITE.logo` to the Vite-managed asset path. |
| `src/data/courses.js` | Added Vite imports for all six training images and replaced public-folder string paths with imported asset references. |
| `src/styles/global.css` | Removed default link underlines from `.insight-card` and descendants; updated training/course-detail sections to transparent ambient gradients. |
| `src/styles/sections.css` | Added subtle ambient radial-gradient backgrounds to all major homepage sections while keeping the technical grid visible. |
| `src/styles/training.css` | Added subtle ambient radial-gradient backgrounds to training/secondary/program-detail sections while keeping the grid visible. |

---

## 2. Logo Consumers Found and Updated

### Public website

| Location | Before | After |
|---|---|---|
| Header logo fallback | `/assets/logo.png` | `import publicLogo from '../assets/logo.png'` |
| Footer logo fallback | `/assets/logo.png` | `import publicLogo from '../assets/logo.png'` |
| SEO organization/publisher logo | `SITE.logo = '/assets/logo.svg'` | `SITE.logo = brandLogo` (Vite-hashed asset) |
| `index.html` static JSON-LD | referenced `https://sidrahsoft.com/assets/logo.svg` | removed; SEO component injects the correct logo dynamically |

### CMS branding

| Location | Before | After |
|---|---|---|
| CMS login page logo | `/assets/logo.png` + `border-radius: 50%` circular crop | `import brandLogo from '../../assets/logo.png'` + aspect-ratio preserved |
| CMS sidebar logo | `/assets/logo.png` + `border-radius: 50%` circular crop | `import brandLogo from '../../../assets/logo.png'` + aspect-ratio preserved |

The CMS intentionally uses the same public logo asset; there is no separate CMS-only logo requirement in the codebase.

---

## 3. Old / New Training Image Architecture

### Before

- Images were expected to exist under `public/assets/training_images/`.
- `src/data/courses.js` stored raw strings: `image: '/assets/training_images/frontend-development.png'`.
- This path is no longer populated in `public/`, so all six training course cards would show broken images.

### After

- Images are imported from `src/assets/training_images/`:

```js
import frontendImg from '../assets/training_images/frontend-development.png';
import backendImg from '../assets/training_images/backend-development.png';
import flutterImg from '../assets/training_images/flutter-development.png';
import pythonImg from '../assets/training_images/python-programming.png';
import cppImg from '../assets/training_images/cpp-programming.png';
import devopsImg from '../assets/training_images/devops-engineering.png';
```

- Each course object now stores the imported module reference, e.g. `image: frontendImg`.
- Vite hashes and emits the images as `/assets/frontend-development-XXXX.png`, etc.

### Verification

- `grep` confirms no runtime references to `/assets/training_images/` remain in `src/` outside of the import statements themselves.
- The built `dist/assets/courses-XXXX.js` contains hashed paths such as `/assets/frontend-development-2GGK9PPL.png`.

---

## 4. Insights Card Lines — Root Cause and Fix

### Root cause

The `InsightCard` component renders each card as an `<a>` or `<Link>` with the class `insight-card`. The CSS for `.insight-card` in `src/styles/global.css` did not explicitly set `text-decoration: none`. Because the card root is an anchor element, the browser's default anchor underline was being inherited by the topic, title, and description text.

### Exact fix

In `src/styles/global.css`:

```css
.insight-card,
.insight-card:hover,
.insight-card * {
  text-decoration: none;
}
```

This removes only the unwanted underline. Intentional card borders, top gradient accents, and hover lift/glow effects are preserved.

---

## 5. Arabic Font Architecture — Before / After

### Before

- Google Fonts loaded `Space Grotesk`, `El Messiri`, `Inter`, `Tajawal`.
- Arabic display fallback was `El Messiri`; Arabic body fallback was `Tajawal`.

### After

- Google Fonts loads `Space Grotesk` (English display), `Inter` (English body), and `Cairo` (Arabic display + body, weights 300/400/500/600/700).
- Design tokens now use `Cairo` for Arabic:

```css
--font-display-ar: 'Cairo', 'Space Grotesk', system-ui, sans-serif;
--font-body-ar: 'Cairo', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

- The existing RTL block in `tokens.css` reassigns `--font-display` and `--font-body` to the Arabic variants when `[dir='rtl']` is active, so all Arabic text across the site uses Cairo without per-component overrides.

### Confirmation that Cairo is actually loaded

- `dist/index.html` contains the updated Google Fonts link:

```html
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;600&family=Cairo:wght@300;400;500;600;700&family=Inter:wght@400;500&display=swap" rel="stylesheet" />
```

- The built CSS still references `var(--font-body-ar)` and `var(--font-display-ar)`, which now resolve to `Cairo`.

---

## 6. Section Separation Design Implemented

Goal: continuity + separation, not different backgrounds for every section.

Approach:

- Kept the existing lightweight technical grid background (`background.css`).
- Replaced opaque/solid section backgrounds with `transparent` + low-opacity radial-gradient tints using the existing design-token gradients.
- Used a restrained rotation of brand tints: gold, purple, copper, tech-blue.

Major sections updated:

| Section | Tint |
|---|---|
| Hero | unchanged |
| Foundation | `--gradient-ambient-gold` |
| Capabilities | `--gradient-ambient-default` (purple) |
| Services | `--gradient-ambient-default` |
| Automation Showcase | `--gradient-section-transition` |
| Industries | `--gradient-ambient-copper` |
| Partners | `--gradient-ambient-gold` |
| Case Studies | `--gradient-ambient-default` |
| Insights | `--gradient-ambient-tech` (cyan/blue) |
| Careers | `--gradient-ambient-copper` |
| Contact | `--gradient-ambient-gold` |
| Training hero | `--gradient-ambient-gold` |
| Training tracks/courses/CTA | `--gradient-ambient-default` / `--gradient-section-gold` |
| Secondary / program detail pages | alternating gold / default / copper / section-transition |
| Course detail page | alternating gold / default / copper / section-gold |

All tints are transparent at the edges so the grid remains visible. Existing subtle border separators were preserved.

---

## 7. Build Result

```
npm run build
```

- Exit code: 0
- Built successfully in 8.30s.
- New logo emitted as `dist/assets/logo-CIXcYquw.png`.
- Training images emitted as hashed assets in `dist/assets/`.
- One pre-existing Vite warning about `insightsApi.js` being both statically and dynamically imported; unrelated to this task.

---

## 8. Visual Validation

A preview server was started at `http://127.0.0.1:63395`. The user chose to skip sending browser captures during this session and will review the site locally. The following checklist is provided for that review:

- [ ] English homepage desktop — new logo in header/footer, no old logo
- [ ] Arabic homepage desktop — new logo, hero anchored right, Cairo typography
- [ ] English homepage mobile — logo proportions correct, no old logo
- [ ] Arabic homepage mobile — RTL layout intact, hero right-aligned
- [ ] `/training` — all six course cards display images
- [ ] `/insights` — no underlines on card topic/title/description text; hover states remain polished
- [ ] Arabic text renders in Cairo (inspect any heading/body in RTL mode)
- [ ] Section separation visible but grid remains continuous

---

## 9. Remaining Issues / Notes

| Item | Status |
|---|---|
| Old `/assets/training_images/` public directory | Not present in `public/`; no cleanup needed. |
| Old `src/assets/logo.svg` | Still exists but is no longer referenced by the public website or CMS. Left in place because deletion was not required. |
| `dist/` still contains previously built artifacts | Expected; will refresh on next build. |
| Browser capture validation | Skipped by user request; preview server is available for local review. |

---

## 10. Git Safety

- No `git commit`, `git push`, `git reset`, `git stash`, or `git clean` was performed.
- All changes remain in the working tree for review.

---

## Conclusion

The visual refinement pass is complete and builds successfully. Logo, training images, Insights card typography, Arabic font, and section separation have been updated centrally while preserving the existing grid, hero architecture, RTL behavior, and CMS functionality.
