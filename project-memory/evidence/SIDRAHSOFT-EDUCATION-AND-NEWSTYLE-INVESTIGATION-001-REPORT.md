# SIDRAHSOFT-EDUCATION-AND-NEWSTYLE-INVESTIGATION-001 — Final Report

**Task ID:** `SIDRAHSOFT-EDUCATION-AND-NEWSTYLE-INVESTIGATION-001`
**Type:** Investigation-only (no implementation, no refactoring, no CSS changes, no route additions, no commits, no deploys)
**Date:** 2026-08-18
**Repository root:** `F:\What_i_Made\New\sidrah_web`
**Reference directory (read-only):** `F:\What_i_Made\New\sidrah_web\newstyle`

> This report investigates two proposed changes: (A) adding a Secondary School / Baccalaureate education offering to the Training sector, and (B) replacing the current heavy global background system with the lightweight grid/network background found in `newstyle/`. No project implementation files were modified. The only file created is this report.

---

## 1. Executive Summary

**Two proposed changes are investigated:**

**(A) Secondary School / Baccalaureate Education.** SidrahSoft already has a Training & Education sector at `/training` with 7 professional courses (Frontend, Backend, Flutter, Python, C++, Problem Solving & DSA, DevOps) served from a static `src/data/courses.js` file. The proposed secondary-school offering targets First Secondary, Second Secondary, and Baccalaureate students learning programming inside a real software company's ecosystem. After evaluating four placement options, the recommended architecture is **Option D (hybrid): Homepage teaser → `/training` (with a clear "Professional" vs "Secondary School" split) → dedicated `/training/secondary` landing page → program detail pages.** This preserves the existing routing pattern (`/training/:courseSlug`), reuses the existing `CourseDetailPage`, and avoids creating a parallel brand.

**(B) newstyle Background.** The `newstyle/` directory is a single-page "coming soon" landing for a different product ("VOLT Party Box"). It is **pure static HTML + CSS** (274 lines of CSS, no JavaScript animation loop, no Canvas, no WebGL, no external libraries). Its background is a **CSS-only grid** produced by two layered `linear-gradient` backgrounds at `72px × 72px` tile size, masked with a vertical fade, plus two blurred radial "ambient" blobs. It is dramatically lighter than SidrahSoft's current global background, which combines a continuous `requestAnimationFrame` Canvas network animation (`InteractiveNetworkBackground`, 36 nodes + O(n²) connection drawing every frame), four fixed full-viewport cinematic layers with blur/transitions, a cursor-following `MouseGlow`, and the Hero's own blurred aura layers (`blur(4rem)`). The recommendation is to **replace the global background system** (Canvas network + cinematic layers + mouse glow) with a SidrahSoft-branded adaptation of the `newstyle` CSS grid, while **preserving the Hero artwork, Hero content, and Hero scroll motion** untouched. Expected performance impact: **MAJOR** on continuous GPU/CPU, **MODERATE** on initial paint.

---

## 2. Current Training Architecture

Verified against current code (not just prior reports):

### Routes (`src/App.jsx`)
- `/training` → `TrainingPage` (lazy-loaded)
- `/training/:courseSlug` → `CourseDetailPage` (lazy-loaded)

### TrainingPage (`src/components/pages/TrainingPage.jsx`)
Three sections:
1. `TrainingHero` — title + subtitle from i18n (`training.heroTitle` / `training.heroSubtitle`), IntersectionObserver fade-in.
2. `CoursesGrid` — maps over `getAllCourses()` from `src/data/courses.js`, renders `CourseCard` per course with staggered transition delay.
3. `TrainingCta` — "Need Customized Training?" block with `MagneticButton` that navigates to `/#contact`.

### Course data (`src/data/courses.js`)
Static, hardcoded, bilingual (EN/AR). 7 courses:

| Slug | Category (EN) |
|---|---|
| `frontend-development` | Web Development |
| `backend-development` | Server & APIs |
| `flutter-development` | Mobile Development |
| `basic-python` | Programming Fundamentals |
| `cpp-programming` | Programming Fundamentals |
| `problem-solving-data-structures` | Algorithms & Interview Prep |
| `devops-engineering` | Infrastructure & Deployment |

Each course object has: `slug`, `image`, `categoryEn/Ar`, `titleEn/Ar`, `shortDescriptionEn/Ar`, `subtitleEn/Ar`, `overviewEn/Ar`, `audienceEn/Ar[]`, `modulesEn/Ar[]`, `skillsEn/Ar[]`, `projectEn/Ar`, `aiMessageEn/Ar`.

### CourseDetailPage (`src/pages/CourseDetailPage.jsx`)
Rich detail page with: hero (category, title, subtitle, intro, audience preview, CTA), overview, modules (numbered), skills (checkmark list), audience, practical project, "AI Will Not Replace the Fundamentals" section, final CTA. Breadcrumbs via `SEO`. CTA navigates to `/#contact`.

### Navigation
- Header (`src/components/Header.jsx`) uses `useHeaderNavigation` which fetches CMS navigation and falls back to `FALLBACK_NAV_LINKS` (`src/hooks/useHeaderNavigation.js:7-15`). The fallback includes `{ key: 'trainingCourses', path: '/training' }` labeled "Training Courses" (`src/i18n/en.js:22`).
- No homepage section is dedicated to training; the Foundation section CTA goes to `#services`, not training.

### CMS / Backend
- **No CMS model for courses.** Courses are entirely static (`src/data/courses.js`). There is no `courses` Django app, no `/api/v1/courses/` endpoint, no `cms/courses/` module.
- The homepage `HomepageSettings` model has no training-specific fields.
- The `navigation` CMS app can link to `/training` (via internal link type), but no training content management exists.

### Visual hierarchy
- Training page uses the global `PublicWebsiteShell` (cinematic layers + interactive network background + mouse glow) like all public routes.
- Course cards use `.training-course-card` styles; detail page uses `.course-detail-*` styles.
- No route-level mood override for `/training` — it defaults to the `hero` mood in `getPublicRouteMood` (`App.jsx:123-129`), except `/training/:courseSlug` which maps to `foundation`.

### CTA flow
All training CTAs route to `/#contact` (the homepage contact section) — there is no per-course inquiry type or dedicated training contact flow.

---

## 3. Recommended Baccalaureate / Secondary Education Placement

### Option evaluation

| Option | UX clarity | Hierarchy | Conversion | Visual consistency | Scalability | SEO | Route complexity | CMS impact | Maintainability |
|---|---|---|---|---|---|---|---|---|---|
| **A** (inside `/training` as a category) | Low — secondary students buried among professional courses | Flat | Low — hard to find | Good | Low — mixing audiences | Poor — one URL | Low | None | High |
| **B** (new `/training/baccalaureate` landing) | High — dedicated page | Clear | High | Good | High | Good — dedicated URL | Low | Low | High |
| **C** (homepage teaser only) | Medium — teaser but no depth | Shallow | Medium | Good | Low | Poor | Low | None | High |
| **D** (hybrid: homepage teaser → `/training` split → `/training/secondary` → program detail) | Highest | Deepest | Highest | Best | Highest | Best | Medium | Medium | Medium |

### Recommendation: **Option D (hybrid)**

**Why:**
- **Audience separation is critical.** Professional developers and secondary-school students have entirely different decision-makers (the student + parent vs. the professional themselves). Mixing them in one flat grid (Option A) dilutes both messages.
- **Reuse of existing routing.** `/training/secondary` follows the existing `/training/*` prefix pattern. Program detail pages can reuse `/training/secondary/:programSlug` or extend the existing `/training/:courseSlug` pattern with a `track` field — no new top-level route needed.
- **Homepage discoverability.** A small teaser in the Foundation section (or a new "Education" entry point) gives the offering visibility without forcing every visitor through it.
- **SEO.** A dedicated `/training/secondary` page with its own meta/breadcrumbs targets "programming for secondary school students" search intent, which a flat `/training` page cannot.
- **Scalability.** The split pattern ("Professional" vs "Secondary School") can later extend to "University Programs", "Corporate Training", etc., without restructuring.

**Why not Option A:** burying secondary-school content inside the professional course grid makes it invisible to parents/students and untargetable for SEO.

**Why not Option B alone:** a dedicated page without a homepage entry point relies entirely on direct links and search; the homepage teaser in Option D adds organic discovery.

**Why not Option C alone:** a teaser with no dedicated page has no conversion path.

---

## 4. Proposed User Journey

```
Homepage (Foundation teaser: "Education for the next generation")
  → /training (split: "Professional Training" | "Secondary School Education")
    → /training/secondary (dedicated landing: why SidrahSoft for school students)
      → /training/secondary/:programSlug (program detail: learning path, methodology, structure)
        → /#contact (CTA: "Enroll / Ask about the program")
```

Alternative quick path: Header nav "Training" → `/training` → "Secondary School Education" tab → `/training/secondary`.

---

## 5. Proposed Page / Section Structure

### `/training` (modified)
- Hero (existing, updated copy to position SidrahSoft as both professional and educational).
- **Track selector** (new): two cards/tabs — "Professional Training" (existing 7 courses) and "Secondary School Education" (links to `/training/secondary`).
- Professional courses grid (existing).
- CTA (existing).

### `/training/secondary` (new)
Recommended blocks (no final copy yet):
1. **Hero / message** — "Learn programming inside a real software company." Position the ecosystem advantage.
2. **Why SidrahSoft for school students** — 3–4 proof points: real engineering environment, instructors connected to live projects, practical not theoretical, industry-grade tools.
3. **Who it is for** — First Secondary, Second Secondary, Baccalaureate (clear year-by-year framing).
4. **Learning paths** — cards per path (e.g., "First Secondary: Programming Foundations", "Second Secondary: Web & App Basics", "Baccalaureate: Specialization Track").
5. **Teaching methodology** — project-based, inside a real company, mentorship from working engineers.
6. **Exposure to real software engineering** — what students see/access (real codebase tours, shadowing, tools, workflows).
7. **Program structure** — duration, format (in-person/online), schedule compatible with school.
8. **CTA** — "Enroll / Ask about the program" → `/#contact` (or a dedicated inquiry type).

### `/training/secondary/:programSlug` (new, reuses CourseDetailPage pattern)
- Reuse the existing `CourseDetailPage` block structure (hero, overview, modules, skills, audience, project, AI message, CTA) but sourced from a new secondary-programs data set (or CMS model).

---

## 6. CMS / Backend Impact

### Current state
- **Courses are 100% static** (`src/data/courses.js`). No backend model, no API, no CMS module for courses/training.

### Options for the secondary offering

**Option 1 (lowest effort, recommended for MVP): Static data file.**
- Add a new `src/data/secondaryPrograms.js` (mirroring `courses.js` structure).
- Add a new `SecondaryProgramsPage` + reuse `CourseDetailPage` (or a `SecondaryProgramDetailPage`).
- **Backend impact: zero.** No new models, endpoints, or migrations.
- Trade-off: content edits require code changes + redeploy.

**Option 2 (medium effort, recommended for future): CMS-managed.**
- New Django app `apps/education` (or extend a generic `apps/training` app) with `Program` model (bilingual fields, track field: `professional` | `secondary`, audience year, modules JSON, etc.).
- Public endpoint `/api/v1/programs/` + CMS module `/api/v1/cms/programs/`.
- Add `education`/`training` to the RBAC role matrix (`accounts/roles.py`).
- Add CMS SPA page (`src/pages/cms/CMSProgramsPage.jsx`).
- Trade-off: full CMS capability but requires backend + frontend + migration work.

**Recommendation:** Start with **Option 1** (static data file) to ship the offering fast and validate the concept, then migrate to **Option 2** (CMS) when content iteration frequency justifies it. The static file structure should be designed to map cleanly onto a future `Program` model.

### Contact flow
- The contact form already supports `InquiryType` (CMS-managed). A new "Secondary School Program Inquiry" inquiry type can be added via the existing CMS (or `seed_inquiry_types`) with **no code change** — only a data entry.

---

## 7. newstyle Directory Architecture

`newstyle/` contains exactly two files:
- `newstyle/index.html` (83 lines) — a single-page "coming soon" landing for "VOLT Party Box" (a speaker product, unrelated to SidrahSoft).
- `newstyle/styles.css` (274 lines) — all styling.

**Technology:** Pure static HTML + CSS. **No JavaScript framework, no JavaScript animation, no Canvas, no WebGL, no SVG animation, no external libraries.** The only JS is a one-line year stamp (`document.getElementById('year')...`).

**Note:** `newstyle/index.html` line 13 contains an injected `<script>` tag from Kaspersky antivirus (`gc.kis.v2.scr.kaspersky-labs.com`). This is **browser-antivirus injection, not part of the source project** — it was added by the local machine's AV when the file was saved/viewed. It must be ignored and must never be copied.

**Structure:**
- `<main class="hero">` is the full-viewport container with `isolation: isolate` and `overflow: hidden`.
- Three background layers inside `.hero`:
  1. `.ambient ambient-one` — blurred violet blob (360×360, `filter: blur(80px)`, `#4722cf`).
  2. `.ambient ambient-two` — blurred cyan blob (250×250, `filter: blur(80px)`, `#156b91`, opacity 0.3).
  3. `.grid` — empty `<div>` styled by `.hero::before` (the grid is a pseudo-element on `.hero`, not on `.grid`; the `.grid` div is present but the actual grid effect comes from `.hero::before`).
- Content layers: `.topbar` (brand + mail link), `.hero-content` (copy + visual), `footer`.

**Responsive:** Two breakpoints — `@media (max-width: 900px)` (collapses grid to 1 column) and `@media (max-width: 600px)` (tighter spacing, smaller type). No mobile-specific background simplification beyond layout collapse.

---

## 8. Exact Background Implementation

The grid/network background is **entirely CSS**, produced by a single pseudo-element.

**File:** `newstyle/styles.css`
**Selector:** `.hero::before` (lines 36–45)

```css
.hero::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px),
              linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px);
  background-size: 72px 72px;
  mask-image: linear-gradient(to bottom, transparent, black 20%, black 72%, transparent);
  z-index: -3;
}
```

**How it works:**
1. **Two layered `linear-gradient` backgrounds** create the grid lines:
   - The first gradient (`90deg`) draws **vertical lines** every 72px (a 1px white-ish line at `rgba(255,255,255,.03)`, then transparent).
   - The second gradient (default `to bottom`, i.e. `180deg`) draws **horizontal lines** every 72px.
   - `background-size: 72px 72px` tiles both gradients into a 72×72 grid.
2. **`mask-image`** applies a vertical linear-gradient fade: transparent at top → solid black (visible) from 20%–72% → transparent at bottom. This fades the grid in/out vertically so it doesn't hit the edges harshly.
3. **`z-index: -3`** places it behind everything (`.hero` has `isolation: isolate` to contain the negative z-index).
4. **`pointer-events: none`** ensures it never blocks clicks.

**Ambient blobs** (`.ambient`, lines 47–56): two absolutely-positioned circles with `filter: blur(80px)` and low opacity, providing colored glow. These are static (no animation).

**Base background** (`.hero`, lines 23–34): a three-layer `background` shorthand — two `radial-gradient` color spots (violet at 78%/48%, cyan at 12%/14%) over a `linear-gradient` dark base (`#050509 → #08070e → #030306`).

**Rendering method:** 100% CSS — no Canvas, no WebGL, no SVG, no JS, no image assets for the background. The only image assets in `newstyle/` are referenced (`assets/volt-logo.png`, `assets/volt-party-box.jpeg`) but **not present in the directory** (the `assets/` folder does not exist in `newstyle/`).

---

## 9. Current SidrahSoft Background Architecture

The current global background is a **multi-layer system** mounted once in `App.jsx` (lines 146–149) and present on every public route:

### Layer 1: `InteractiveNetworkBackground` (`src/components/InteractiveNetworkBackground.jsx`)
- **Canvas-based**, full-viewport (`window.innerWidth × innerHeight`), DPR-capped at 2.
- **36 nodes** (`NODE_COUNT = 36`), each with position, velocity, base position, radius.
- **O(n²) connection drawing** every frame: for each pair of nodes within `CONNECTION_DISTANCE` (130px), draws a line with opacity/width/brightness modulated by mouse proximity.
- **Continuous `requestAnimationFrame` loop** (`loop()` → `updateNodes()` + `draw()` → rAF again).
- Per-frame work: 36 node updates (return force + ambient drift + mouse force + friction) + up to 36×35/2 = 630 distance checks + line strokes + radial gradient fill for cursor glow.
- **Disabled on touch devices** (`hover: none` / `pointer: coarse` / `maxTouchPoints > 0`) and **reduced motion** (line 42: `if (isTouch || reducedMotion) return;`).
- Mouse interaction via `mousemove` listener (passive).

### Layer 2: `CinematicLayers` (`src/components/cinematic/CinematicLayers.jsx` + `src/styles/cinematic.css`)
- 4 fixed full-viewport (`position: fixed; inset: 0`) divs: `.cinematic-ambient` (base color), `.cinematic-glow` (two radial gradients), `.cinematic-vignette` (radial darkening), `.cinematic-grain` (inline SVG noise via `data:` URI).
- **Mood system**: `data-ambient` attribute switches CSS custom properties per route/section (hero, foundation, capabilities, services, automation, industries, careers, partners, casestudies, insights, contact, footer) — 12 mood definitions in `cinematic.css`.
- **Transitions** on `background-color` and `opacity` (`--motion-duration-cinematic`) when mood changes.
- `.cinematic-progress` — a 2px top scroll-progress bar driven by `useScrollProgress` (transform-based, `will-change: transform`).
- Mobile: glow opacity reduced ×0.7, vignette softened, grain hidden (`@media (max-width: 767px)`).
- Reduced motion: transitions disabled, progress bar hidden.

### Layer 3: `MouseGlow` (`src/components/MouseGlow.jsx` + `useMousePosition` hook)
- A single `.mouse-glow` div whose position is driven by CSS variables set from `useMousePosition` (mouse tracking).
- Disabled on touch / reduced motion (per the hook).

### Layer 4: Hero atmospheric layers (`src/styles/hero.css`)
- `.hero-aura-glow--purple` / `--gold`: large blurred radial gradients (`filter: blur(4rem)`, 40rem/32rem diameter) with **infinite alternate keyframe animations** (`hero-aura-drift-purple` 12s, `hero-aura-drift-gold` 14s).
- Additional `blur(3rem)` layers (line 433) and smoke/leaves/motes/sheen layers.
- Mobile/coarse-pointer: blur reduced to `blur(1.5rem)` / `blur(2rem)` (`@media (hover: none), (pointer: coarse)` at line 833).

### Summary of current cost
- 1 continuous Canvas rAF loop (36 nodes, O(n²) lines, radial gradient per frame).
- 4 fixed full-viewport divs with transitions + 1 inline SVG noise.
- 1 mouse-tracked glow div (CSS-variable driven).
- Hero: 2+ infinitely-animating `blur(4rem)` layers + several `will-change` layers.
- Multiple `will-change` declarations (transform, opacity) promoting layers.

---

## 10. Performance Comparison

| Dimension | Current SidrahSoft | newstyle | Winner |
|---|---|---|---|
| **Continuous JS loop** | Yes — rAF Canvas (36 nodes, ~630 distance checks/frame, line strokes, radial gradient) | None | **newstyle** |
| **Continuous GPU usage** | Yes — Canvas redraw every frame + 2 infinite CSS blur animations + transitions | None — fully static CSS | **newstyle** |
| **Canvas/WebGL** | Yes (Canvas 2D) | No | **newstyle** |
| **Large blur filters** | Yes — `blur(4rem)` ×2 on hero aura, `blur(3rem)` elsewhere, `blur(80px)` not used | Yes — `blur(80px)` ×2 on ambient blobs (static, not animated) | **newstyle** (static blur is cheaper than animated blur) |
| **DOM nodes for background** | ~6 React components + canvas + 4 fixed divs | 3 divs (2 ambient + 1 grid) + 1 pseudo-element | **newstyle** |
| **Large assets required** | Hero AVIF/WebP (194 KB desktop / 43 KB mobile) — but that's Hero, not background | None for background (grid is CSS) | **newstyle** (for background) |
| **Mouse interaction** | Canvas mouse force + MouseGlow CSS-var tracking | None | **newstyle** (cost-wise); current wins on interactivity |
| **Mobile behavior** | Canvas disabled on touch; cinematic glow reduced; grain hidden; hero blur reduced to 1.5–2rem | Same CSS applies; no special mobile simplification | **newstyle** (lighter) |
| **Reduced motion** | Canvas disabled; cinematic transitions off; progress bar hidden; hero animations still run (CSS keyframes not gated by `prefers-reduced-motion` in hero.css except via the coarse-pointer media query) | No animations to gate | **newstyle** |
| **First paint** | Canvas init + 4 fixed layers + hero assets | 1 pseudo-element + 2 blobs | **newstyle** |
| **Layer promotion (`will-change`)** | Many (`transform`, `opacity` across hero + cinematic) | None | **newstyle** |

**Conclusion:** `newstyle` is **dramatically lighter** because it has **zero continuous rendering**. The grid is a single tiled CSS gradient (composited once), and the ambient blobs are static blurred divs (composited once). The current system pays per-frame CPU (Canvas) + per-frame GPU (animated blur keyframes) for the entire session.

**Caveat:** The current `InteractiveNetworkBackground` is already disabled on touch/reduced-motion, so mobile users don't pay the Canvas cost today. The biggest win is on **desktop**, where the Canvas rAF loop + animated hero blur run continuously. The cinematic layers (fixed divs) are relatively cheap on their own; the expensive parts are the Canvas loop and the hero's animated `blur(4rem)` keyframes.

---

## 11. REUSE / ADAPT / REJECT Matrix

| newstyle feature | Classification | Why |
|---|---|---|
| **CSS grid background** (`.hero::before`, two `linear-gradient` at 72px, mask fade) | **REUSE** | Lightweight, premium, technological feel. Perfect base for SidrahSoft global background. |
| **Vertical mask fade** (`mask-image` transparent→black→transparent) | **REUSE** | Elegant edge fade; prevents harsh grid edges. |
| **Static ambient blobs** (`.ambient`, `blur(80px)`, low opacity) | **ADAPT** | Useful for subtle color depth, but recolor to SidrahSoft palette (gold `#c9a96e` / purple `#8b5ca6` / deep blue) instead of newstyle's violet/cyan. Keep static (no animation). |
| **Three-layer radial+linear base background** (`.hero` background shorthand) | **ADAPT** | Good technique; recolor to SidrahSoft's dark palette (`--color-bg` family). |
| **Orbitron display font** | **REJECT** | Wrong brand voice for SidrahSoft (which uses Space Grotesk / El Messiri). |
| **Violet/cyan accent colors** (`#6d39ff`, `#55d7ff`) | **REJECT** | Not SidrahSoft brand colors. |
| **`backdrop-filter: blur()` on buttons/cards** (`.mail-link`, `.power-badge`) | **ADAPT** | Useful for glassmorphism on SidrahSoft cards/buttons, but apply selectively (backdrop-filter is GPU-costly on mobile). |
| **Gradient-text headline** (`h1 span` with `background-clip: text`) | **ADAPT** | Could enhance SidrahSoft hero headline, but use SidrahSoft gradient (gold→purple), not newstyle's violet→cyan. |
| **Product visual shell** (`.speaker-shell` with perspective transform, border, shadow) | **REJECT** | Product-specific (speaker). Not applicable. |
| **"Coming Soon" / domain-card / live-dot** | **REJECT** | Landing-page-specific. Not applicable. |
| **Topbar/footer layout** | **REJECT** | SidrahSoft has its own Header/Footer. |
| **`clamp()` responsive typography** | **REUSE** | Good practice; already used in SidrahSoft hero. |
| **`isolation: isolate` stacking context** | **REUSE** | Clean way to contain negative z-index background layers. |
| **No JS animation** approach | **REUSE** | The core performance lesson: prefer composited-once CSS over per-frame JS. |

---

## 12. Recommended SidrahSoft Background Direction

Replace the current global background system with a **SidrahSoft-branded CSS grid** adapted from `newstyle`:

### Base background
- Dark SidrahSoft base (`var(--color-bg, #0a0b10)` family) via a `linear-gradient` (subtle, not flat black).
- 1–2 very low-opacity radial color spots using SidrahSoft accents (gold + purple), positioned to echo the current cinematic glow but **static** (no transition, no mood switching).

### Grid
- Two layered `linear-gradient` lines at **64–80px tile** (tunable), white at very low opacity (`rgba(255,255,255,0.025–0.04)`).
- `mask-image` vertical fade (top + bottom transparent) — reuse newstyle's mask technique.
- Optional: a second horizontal-only fade or radial mask to focus the grid toward the viewport center.
- `pointer-events: none`, `z-index` below content, `isolation: isolate` on the shell.

### Accent glow
- 1–2 static blurred radial blobs (`filter: blur(80px)`, low opacity) in SidrahSoft gold/purple, replacing the current `.cinematic-glow` radial gradients. **No animation.**

### Line behavior
- Static lines (no mouse-reactive line brightening). The current Canvas mouse-reactive network is the most expensive part and the least essential for a premium feel.

### Section-to-section transitions
- Drop the 12-mood system. Use a single consistent global background. If section differentiation is needed, do it via **section background tokens** (subtle per-section `background-color` on the section itself, not fixed full-viewport layers). This is cheaper and simpler.

### Mobile simplification
- Reduce grid opacity on mobile (`@media (max-width: 767px)`).
- Reduce or remove the ambient blobs on mobile (they're cheap but every bit helps).
- Keep the grid (it's a single composited layer — nearly free).

### Reduced motion
- The grid is already static, so `prefers-reduced-motion` requires no special handling for the background. (This is a major accessibility win vs. the current system which has to gate multiple animated layers.)

---

## 13. Hero Preservation Strategy

**The Hero should remain largely untouched.** The background replacement targets the **global** system, not the Hero.

### What should remain (Hero visual system)
- **Hero artwork** — the AVIF/WebP `<picture>` responsive poster (`src/assets/hero/digital-sidrah/`) is the approved KF05→KF06 visual identity (per decision log 2026-07-09). **Keep.**
- **Hero content** — `HeroContent` (headline, subheadline, CTAs, location card). **Keep.**
- **Hero scroll motion** — GSAP ScrollTrigger scale/translate/fade driven by scroll progress (`CinematicHero.jsx`). This is scroll-driven (not continuous rAF), so it's already performant. **Keep.**
- **Hero foreground layers** — `HeroSheen`, `HeroScrollCue`. **Keep** (cheap).
- **Hero preload** — `vite.config.js` `heroPreloadPlugin`. **Keep.**

### What should be simplified (Hero atmospheric layers)
- **`HeroAura`** (`.hero-aura-glow--purple` / `--gold` with `blur(4rem)` + infinite 12s/14s keyframe animations): these are the most expensive Hero layers. **Recommend: keep the visual but remove the infinite animation** — make them static blurred glows (composited once). The scroll-driven motion already provides dynamism. If a subtle pulse is desired, use a very slow (20s+) opacity-only animation (cheaper than transform + blur).
- **`HeroSmoke` / `HeroLeaves` / `HeroMotes`**: inspect individually; if any run continuous rAF or expensive filters, convert to static or scroll-driven. If they're already scroll-driven or CSS-only, keep.

### Boundary
- **Global background** (Canvas network + cinematic layers + mouse glow) → **replace** with CSS grid.
- **Hero atmospheric layers** → **simplify** (remove infinite animations, keep static visuals).
- **Hero artwork + content + scroll motion** → **preserve untouched**.

---

## 14. Components Likely to Change

| File / Component | Action | Reason |
|---|---|---|
| `src/components/InteractiveNetworkBackground.jsx` | **Remove** (or replace with CSS grid) | Continuous Canvas rAF is the single most expensive global element. |
| `src/components/cinematic/CinematicLayers.jsx` | **Remove** | Replaced by static CSS grid + 1–2 ambient blobs. |
| `src/styles/cinematic.css` | **Remove** (or drastically simplify) | No more mood system, grain, vignette, progress bar (progress bar could be kept standalone if desired). |
| `src/hooks/usePublicSectionMood.js` | **Remove** | No mood system. |
| `src/hooks/useScrollProgress.js` | **Preserve** if keeping the progress bar; otherwise remove. | Independent of background. |
| `src/components/MouseGlow.jsx` + `src/hooks/useMousePosition.js` | **Remove** | Cursor-following glow is non-essential and adds mouse tracking cost. |
| `src/App.jsx` (lines 146–149) | **Modify** — remove `<InteractiveNetworkBackground />`, `<MouseGlow />`, and `<CinematicLayers>` from `PublicWebsiteShell`. | Mount points for removed components. |
| `src/styles/global.css` / `tokens.css` | **Modify** — add the new grid background CSS (or a new `src/styles/background.css`). | New background implementation. |
| `src/components/hero/HeroAura.jsx` + `src/styles/hero.css` (aura keyframes) | **Simplify** — remove infinite `hero-aura-drift-*` animations; keep static blurred glows. | Most expensive Hero layers. |
| `src/components/hero/HeroSmoke.jsx`, `HeroLeaves.jsx`, `HeroMotes.jsx` | **Review** — keep if scroll-driven/CSS-only; simplify if rAF-based. | Per-component cost audit needed. |
| `src/components/hero/CinematicHero.jsx` | **Preserve** (possibly remove mood/aura refs if those layers are removed). | Core hero logic. |
| `src/components/hero/HeroContent.jsx`, `HeroSheen.jsx`, `HeroScrollCue.jsx` | **Preserve** | Cheap, on-brand. |
| `src/styles/sections.css` | **Possibly modify** — if per-section background tokens replace the mood system. | Section differentiation. |
| `src/components/pages/TrainingPage.jsx` | **Modify** (for education offering) — add track selector. | Part A. |
| `src/data/courses.js` | **Preserve** — keep professional courses. | |
| `src/data/secondaryPrograms.js` | **Create** (new static data file). | Part A, Option 1. |
| `src/pages/SecondaryEducationPage.jsx` | **Create** (new). | Part A. |
| `src/App.jsx` (routes) | **Modify** — add `/training/secondary` + `/training/secondary/:programSlug`. | Part A. |
| `src/i18n/en.js`, `ar.js` | **Modify** — add secondary education keys. | Part A. |
| `src/config/seo.js` | **Modify** — add `secondary` page meta. | Part A. |
| `src/hooks/useHeaderNavigation.js` | **Possibly modify** — update fallback nav. | Part A (if nav changes). |

---

## 15. Mobile / Reduced Motion Strategy

### Mobile (`max-width: 767px`)
- **Grid**: keep, but reduce opacity by ~40% (e.g., `rgba(255,255,255,0.025)` → `0.015`) to save pixel fill.
- **Ambient blobs**: reduce to 1 blob (or remove entirely on `<600px`).
- **No Canvas, no mouse interaction** (already the case for the current Canvas, but now it's global).
- **No `backdrop-filter`** on mobile (it's GPU-costly on low-end devices).
- **Hero**: keep AVIF mobile poster (43 KB), keep scroll motion (scroll-driven is cheap), remove/simplify animated aura.

### Tablet (768–1024px)
- Same as desktop but with reduced grid opacity and 1 ambient blob.

### Desktop
- Full grid + 2 ambient blobs. No continuous JS. No mouse-reactive background.

### Reduced motion (`prefers-reduced-motion: reduce`)
- The new background is **already fully static** — no special handling needed. This is a major win: the current system has to gate Canvas + cinematic transitions + hero keyframes + mouse glow separately.
- Hero scroll motion (GSAP) should still respect reduced motion (it already does — `CinematicHero.jsx` checks `prefers-reduced-motion`).
- If any subtle CSS animation is added later (e.g., a 20s opacity pulse on an ambient blob), gate it with `@media (prefers-reduced-motion: reduce) { animation: none; }`.

### Contrast/readability
- Grid line opacity must stay low enough (≤0.04) that it never reduces text contrast below WCAG AA on dark sections.
- The vertical mask fade ensures the grid doesn't compete with header/footer content.

---

## 16. Risks

| Risk | Severity | Mitigation |
|---|---|---|
| **Global CSS conflicts** — new grid CSS vs. existing `cinematic.css` / `global.css` z-index/stacking | MEDIUM | Remove cinematic CSS cleanly; use `isolation: isolate` on the shell; verify z-index tokens (`--z-base`, `--z-content`). |
| **z-index / stacking context** — grid `z-index: -3` requires a containing `isolation: isolate` or the grid disappears behind `body` | MEDIUM | Mirror newstyle's `isolation: isolate` on the shell container. |
| **`pointer-events`** — grid must be `pointer-events: none` or it blocks all clicks | LOW | Already in newstyle; copy the rule. |
| **Performance regression on the Hero** — if Hero animated blur layers are not simplified, the global win is partial | MEDIUM | Treat Hero aura simplification as part of the same change. |
| **Visual flatness** — removing the mood system may make sections feel uniform | MEDIUM | Compensate with per-section subtle background tokens (cheaper than fixed full-viewport transitioning layers). |
| **Loss of mouse interactivity** — the Canvas network responded to cursor; removing it may feel less "alive" | LOW–MEDIUM | Acceptable trade-off for performance. The Hero scroll motion + MagneticButton/MagneticLink still provide interactivity. |
| **`backdrop-filter` cost** if borrowed from newstyle on cards/buttons | MEDIUM | Use sparingly; disable on mobile. |
| **Reduced-motion regression** — current hero CSS keyframes (`hero-aura-drift-*`) are **not gated** by `prefers-reduced-motion` (only by coarse-pointer) | MEDIUM | Add `@media (prefers-reduced-motion: reduce)` gates to any remaining hero animations. |
| **Responsive inconsistency** — grid tile size (72px) may look wrong on very wide or very narrow screens | LOW | Use a `clamp()` or viewport-relative tile size, or keep 72px fixed (it scales naturally). |
| **Hydration/runtime** — n/a (no SSR; Vite SPA) | LOW | None. |
| **Contrast/readability** — grid lines over light-on-dark text | LOW | Keep opacity ≤0.04; verify with WCAG contrast checker. |
| **Education offering dilutes professional brand** if not visually separated | MEDIUM | Use the track selector + distinct page; keep premium tone. |
| **Kaspersky injected script** in `newstyle/index.html` line 13 | HIGH (if copied) | **Never copy `newstyle/index.html` line 13.** It is AV injection, not source. Only port CSS techniques. |

---

## 17. Recommended Implementation Phases

(Do not implement yet — for approval.)

### Phase 1 — Background replacement (P3 visual, P2 performance)
1. Create new `src/styles/background.css` with the SidrahSoft-branded grid + ambient blobs.
2. Remove `InteractiveNetworkBackground`, `CinematicLayers`, `MouseGlow` from `App.jsx`.
3. Remove/simplify `cinematic.css`, `usePublicSectionMood`, `useMousePosition`.
4. Simplify `HeroAura` (remove infinite animations, keep static glows).
5. Audit `HeroSmoke`/`HeroLeaves`/`HeroMotes` for rAF usage; simplify as needed.
6. Add per-section background tokens if mood differentiation is needed.
7. Verify build, mobile, reduced motion, contrast.

### Phase 2 — Secondary Education offering (P1 core)
1. Create `src/data/secondaryPrograms.js` (static, bilingual, mirroring `courses.js` structure).
2. Create `src/pages/SecondaryEducationPage.jsx` (the `/training/secondary` landing).
3. Add routes in `App.jsx`: `/training/secondary`, `/training/secondary/:programSlug`.
4. Modify `TrainingPage.jsx` to add the track selector (Professional | Secondary School).
5. Reuse `CourseDetailPage` (or a thin `SecondaryProgramDetailPage` wrapper) for program details.
6. Add i18n keys (EN/AR) for the new section.
7. Add SEO entries in `src/config/seo.js`.
8. Add a homepage teaser (Foundation section or a new small entry point).
9. Add a "Secondary School Program Inquiry" inquiry type via CMS/seed (no code change).

### Phase 3 — CMS migration for training (future, P2)
1. New `apps/education` (or `apps/training`) Django app with `Program` model.
2. Public + CMS API endpoints.
3. RBAC module addition.
4. CMS SPA page.
5. Migrate static data → CMS.

---

## 18. Final Recommendation

### Education
The Secondary/Baccalaureate offering should live at **`/training/secondary`** (a dedicated landing page) with program detail pages at **`/training/secondary/:programSlug`**, accessed via a track selector on the existing `/training` page and a small homepage teaser. This is **Option D (hybrid)**. For MVP, use a static data file (`src/data/secondaryPrograms.js`) — no backend changes required. Migrate to a CMS `Program` model later when content iteration demands it.

### Background
Replace the current global background system (`InteractiveNetworkBackground` Canvas + `CinematicLayers` mood system + `MouseGlow`) with a **SidrahSoft-branded CSS grid** adapted from `newstyle/styles.css` `.hero::before` (two layered `linear-gradient` lines at ~72px tile, vertical `mask-image` fade, `pointer-events: none`, `z-index: -3` inside an `isolation: isolate` shell) plus 1–2 **static** blurred ambient blobs in SidrahSoft gold/purple. **Do not copy newstyle's colors, fonts, or the Kaspersky-injected script.** Port only the CSS grid technique and the static-blob approach.

### Hero
**Preserve the Hero artwork (AVIF/WebP KF05→KF06 poster), Hero content, and Hero GSAP scroll motion untouched.** Only simplify the Hero's atmospheric layers: remove the infinite `hero-aura-drift-*` keyframe animations (the `blur(4rem)` animated glows) and replace them with static blurred glows. The Hero's expense is in its animated blur, not its artwork or scroll motion.

### Performance
**MAJOR** improvement on continuous CPU/GPU: removes a per-frame Canvas rAF loop (36 nodes + O(n²) lines + radial gradient) and infinite CSS blur keyframes, replacing them with composited-once CSS layers. **MODERATE** improvement on first paint (fewer background layers to initialize). Mobile already disables the Canvas today, so mobile gains are smaller (mainly removing cinematic transitions + mouse glow tracking + hero animated blur). The biggest win is on **desktop continuous rendering cost**, which drops to near-zero for the global background.

---

## Appendix: Evidence Index

| Finding | Evidence |
|---|---|
| newstyle grid implementation | `newstyle/styles.css:36-45` (`.hero::before`) |
| newstyle ambient blobs | `newstyle/styles.css:47-56` (`.ambient`, `.ambient-one`, `.ambient-two`) |
| newstyle base background | `newstyle/styles.css:23-34` (`.hero` background shorthand) |
| newstyle is CSS-only (no JS/Canvas) | `newstyle/index.html` (only JS is year stamp, line 79-81); `newstyle/styles.css` (no animation keyframes except hover transitions) |
| Kaspersky injection | `newstyle/index.html:13` (must not be copied) |
| Current Canvas network | `src/components/InteractiveNetworkBackground.jsx:3-9` (constants), `101-209` (update/draw), `211-215` (rAF loop), `36-42` (touch/reduced-motion gate) |
| Current cinematic layers | `src/components/cinematic/CinematicLayers.jsx:11-19`, `src/styles/cinematic.css:28-180` (mood definitions) |
| Current mouse glow | `src/components/MouseGlow.jsx:9-17`, `src/hooks/useMousePosition.js` |
| Current hero animated blur | `src/styles/hero.css:279-302` (`.hero-aura-glow--purple/--gold`, `blur(4rem)`, 12s/14s infinite alternate keyframes) |
| Hero reduced-motion gap | `src/styles/hero.css:712` (`@media (prefers-reduced-motion: reduce)`) — exists but the aura keyframes are gated only by coarse-pointer (line 833), not reduced-motion |
| App.jsx background mount | `src/App.jsx:146-149` (`<InteractiveNetworkBackground />`, `<MouseGlow />`), `136` (`<CinematicLayers>`) |
| Training route | `src/App.jsx:153` (`/training`), `154` (`/training/:courseSlug`) |
| TrainingPage structure | `src/components/pages/TrainingPage.jsx:49-65` (hero), `110-136` (courses grid), `138-164` (CTA) |
| Course data (static) | `src/data/courses.js:1-7` (array), 7 slugs confirmed via grep |
| CourseDetailPage | `src/pages/CourseDetailPage.jsx:78-214` (full detail layout) |
| Header nav fallback | `src/hooks/useHeaderNavigation.js:7-15` (`trainingCourses` → `/training`) |
| No CMS for courses | No `apps/courses` or `apps/training` in `backend/apps/`; no `/api/v1/courses/` in `backend/config/urls.py` |
| InquiryType is CMS-managed | `backend/apps/contact/models.py:12-68` (`InquiryType`), `backend/apps/contact/management/commands/seed_inquiry_types.py` |

---

## Confirmation

This was an **investigation-only** task. The **only file created** is:
`project-memory/evidence/SIDRAHSOFT-EDUCATION-AND-NEWSTYLE-INVESTIGATION-001-REPORT.md`

No project implementation files (source code, CSS, routes, components, `.env`, dependencies, CMS, migrations) were modified, created, deleted, or committed. The `newstyle/` directory was read but not touched. No commands were run that changed the repository.
