# VISUAL-POLISH-AND-BRANDING-001A

**Date:** 2026-07-15  
**Status:** Audit Complete  
**Final Recommendation:** READY FOR DIRECTION SELECTION

---

## 1. Executive Summary

The SidrahSoft product is functionally mature: public website, contact lead capture, email notifications, and private Leads Dashboard are all operational. The current visual quality, however, is uneven. The interface is serviceable but does not yet feel like a premium enterprise technology brand.

**Current state:**
- Strong cinematic Hero foundation (scroll-driven WebP sequence) that is the visual anchor of the site.
- Consistent dark-mode base (`#0d0f12` body, `#f2f2f2` text, purple accent `#8d51a0`, gold accent `#c9a96e`).
- Good i18n and RTL scaffolding.
- Solid responsive grid behavior.

**Main weaknesses:**
- No centralized design tokens — colors, shadows, border radii, spacing, and font sizes are duplicated and slightly inconsistent across components.
- Generic card pattern reused across Services, Industries, Insights, Careers, and Case Studies; cards lack distinct identity.
- Public section headings all use the same weight/structure, reducing hierarchy.
- Leads Dashboard uses inline styles instead of the shared CMS UI primitives, making it look detached from the rest of the product.
- Hero is the only premium-feeling element; downstream sections look flatter.
- No brand-specific imagery or visual assets beyond the logo.
- Accessibility is adequate but not polished (focus states, reduced-motion handling).
- Performance risk from the 619 kB JS bundle and the ~366-frame Hero asset sequence.

The project is ready for a controlled visual direction phase. No functional blockers remain.

---

## 2. Current UI Findings

### 2.1 Public Website

#### Header
- **Strengths:** Floating pill-shaped header with backdrop blur is modern and unobtrusive. RTL float direction corrected. CMS-driven nav supported.
- **Weaknesses:** Logo mark + brand name + subtitle can feel crowded on smaller desktop widths. CTA hover only changes opacity/background — no clear focus ring. Hamburger button has no visible focus state.
- **Responsive:** At 1024px, brand text hides abruptly; transition feels like data loss rather than progressive simplification.

#### Hero
- **Strengths:** Cinematic 366-frame scroll animation is genuinely distinctive. Mobile/low-end fallback loads lower-resolution frames. Loading/error states are present. `prefers-reduced-motion` falls back to static frame.
- **Weaknesses:** 250vh height is large; first-time users may not realize there is content below. No persistent skip-to-content or content preview. Scroll indicator disappears quickly. Canvas mouse-parallax is subtle but adds GPU load.
- **Performance:** Preloads a large batch of WebP frames on landing; bandwidth can be heavy on slower connections.

#### Foundation
- **Strengths:** Clean centered message, three proof points, single CTA. Reduced-motion fallback.
- **Weaknesses:** `h1` here competes semantically with the page Hero; there are two `h1`s on the page (Hero has no heading element, Foundation uses `h1`). Headline weight 300 is elegant but can look weak next to the heavy Hero.

#### What We Build (Capabilities Marquee)
- **Strengths:** Horizontal marquee creates motion and breadth. Pauses on hover. Works without CMS fallback.
- **Weaknesses:** Cards have no icons, no visual differentiation. Duplicated cards in the track rely on identical content being repeated, which looks like a bug if a user scrolls slowly. No anchor/CTA per capability. Reduced-motion path becomes a centered grid, which is acceptable but loses the " breadth" message.

#### Services
- **Strengths:** 3-column grid is balanced after recent resize. Icon per card. Decent hover lift + glow.
- **Weaknesses:** Section headline "Services" is plain English fallback (not translated in JSX). Icons are all thin-stroke SVGs in the same purple; differentiation is weak. Cards still share the same generic "glass-on-dark" look as every other section.

#### Industries / Solutions
- **Strengths:** Focus-area lists add specificity. Icon + fallback icon system.
- **Weaknesses:** Four-column desktop grid can feel dense. Industry icons are generic outline shapes. Same card pattern again.

#### Partners
- **Strengths:** Logo grid with hover scale. CMS-managed partner logos.
- **Weaknesses:** Without many partner logos, the grid can look empty or uneven (`auto-fit` causes ragged last rows). Placeholder behavior unclear.

#### Case Studies
- **Strengths:** Metric pills add credibility. CMS-driven featured selection.
- **Weaknesses:** Cards use the same glass surface; case studies should feel like premium portfolio items, not utility cards.

#### Insights
- **Strengths:** CMS integration complete. Linkable cards.
- **Weaknesses:** No featured images or topics styling beyond small eyebrow text. Cards look identical to Services/Industries cards.

#### Careers
- **Strengths:** CTA block and grid.
- **Weaknesses:** Same generic card surface.

#### Contact
- **Strengths:** Full bilingual fallback inquiry types. Honeypot field. Field error mapping. Success state. Form labels linked correctly.
- **Weaknesses:** Checkbox label wraps awkwardly on small screens. Error block uses hard red (`#fca5a5`) on dark background — readable but jarring. No visible focus ring on submit button.

#### Footer
- **Strengths:** Four-column layout, contact info preserved, legal links, CMS logo.
- **Weaknesses:** Legal links are no-ops (`href="#"`, `preventDefault`). Footer column titles are uppercase/tracked, which is fine but adds to the "same heading" pattern.

#### Floating Social Bar
- **Strengths:** Platform-specific colors, hover labels, hidden on mobile.
- **Weaknesses:** Fixed position can overlap content on short viewports. Labels animate from right; on RTL they switch to left but rely on manual overrides.

### 2.2 Leads Dashboard

#### /leads/login
- **Strengths:** Simple, focused, centered card.
- **Weaknesses:** Inline styles only — no shared CMS design language. Hardcoded English strings in JSX. No brand logo (text logo only). No focus ring on inputs/button. No "show password" toggle. Error box color is raw red.

#### /leads
- **Strengths:** Functional search, filters, pagination, stats cards, table.
- **Weaknesses:**
  - Entire page uses inline styles (`styles = { ... }`) instead of CSS classes or shared CMS tokens.
  - Stat cards are plain boxes with no trend/context.
  - Toolbar uses native `<select>` elements with custom CSS; dropdown options render with system styling (ugly on Windows/macOS).
  - Table text is small (0.8125rem / 13px), dense, and hard to scan.
  - Status badges are tiny; priority badges are barely larger.
  - No bulk actions, no column customization (acceptable for MVP).
  - Empty state message is plain.
  - Mobile: horizontal scroll works but table feels crammed.

#### /leads/:id
- **Strengths:** Clear two-column layout, internal notes, quick actions, copy email.
- **Weaknesses:**
  - Inline styles only.
  - Back button uses raw arrow character.
  - "Open in email client" link looks like text, not a button.
  - Form inputs reuse CMS inputs but the page wrapper is not consistent with CMS pages.
  - No confirmation on spam/archive.
  - `InfoRow` label is extremely small (0.6875rem / 11px).

### 2.3 Repeated Visual Patterns

The following pattern is repeated with only minor variations:

```css
background-color: rgba(242, 242, 242, 0.02);
border: 1px solid rgba(242, 242, 242, 0.08);
border-radius: 0.5rem;
padding: 2rem;
```

Appears in: service-card, industry-card, insight-card, career-card, case-study-card, training-course-card, partner-card, contact-form-wrapper.

This creates visual fatigue. Users cannot distinguish section identity by card style alone.

---

## 3. Design System Findings

### 3.1 Current Tokens (inferred)

| Token | Value(s) found | Issue |
|-------|---------------|-------|
| Background | `#0d0f12`, `#0a0a14`, `#12121e` | Three near-black surfaces; inconsistent usage |
| Surface | `rgba(242, 242, 242, 0.02)`, `rgba(13, 15, 18, 0.72)` | Hardcoded everywhere |
| Text primary | `#f2f2f2`, `#e0e0e0`, `#ccc` | Inconsistent; `#e0e0e0` used mostly in dashboard inline styles |
| Text muted | `#8a919c`, `#949ba6`, `#a0a7b0`, `#888`, `#aaa` | Five+ muted grays |
| Accent purple | `#8d51a0` | Consistent |
| Accent gold | `#c9a96e` | Consistent |
| Success | `#22c55e` | Tailwind-style value |
| Warning | `#f59e0b` | Tailwind-style value |
| Danger | `#ef4444`, `#e74c3c` | Two reds |
| Border | `rgba(242, 242, 242, 0.08)`, `rgba(30, 30, 46)` | Mixed RGBA and hex |
| Border radius | `0.375rem`, `0.5rem`, `0.75rem`, `9999px`, `12px` | No scale |
| Shadow | Various `box-shadow` strings | No shadow scale |
| Font family | `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` | Used in body; dashboard uses `system-ui, -apple-system, sans-serif` |
| Font size | Many `clamp(...)` and fixed rem values | No type scale |
| Spacing | Section padding `8rem 2rem` desktop, `5rem 1.5rem` mobile | Consistent for sections |
| Container width | `52rem`, `56rem`, `64rem`, `80rem` | Contextual but undocumented |
| Breakpoints | `1024px`, `767px`, `640px`, plus `1023px` | `1023px` and `1024px` are redundant |
| Transition | `0.2s`, `0.3s`, `0.6s ease-out` | No duration scale |

### 3.2 Hardcoded Duplication

- Card surface declaration duplicated across ~8 card types.
- Section heading pattern duplicated (`clamp(1.75rem, 3.5vw, 2.75rem)`, weight 300, letter-spacing -0.02em, max-width 56rem).
- Section description pattern duplicated.
- Button variants exist in `CMSButton.jsx` but public site buttons (contact, careers, training) re-implement similar styling in CSS.
- Dashboard inline styles re-declare `#12121e`, `#1e1e2e`, `#2a2a3e`, `#c9a96e` that already exist in the system.

### 3.3 Components That Should Share a Primitive

- **Card primitive:** All card types should share a base `.card` class, then modifiers for `.card--service`, `.card--insight`, etc.
- **Button primitive:** `CMSButton` is good; public buttons should use it or a public variant.
- **Section header primitive:** Headline + description + optional CTA.
- **Badge primitive:** `CMSBadge` covers status/priority but is small; public site has no equivalent.
- **Form input primitive:** Contact form inputs, CMS inputs, dashboard inputs should share focus states and sizing.

### 3.4 Conflicting Breakpoints

- `max-width: 1024px` and `max-width: 1023px` both exist. They target essentially the same viewport range and can cause overlapping specificity issues. Tablet is treated as a single point rather than a range.

---

## 4. Responsive Findings

Audit at required breakpoints:

| Breakpoint | Findings |
|------------|----------|
| **1440px** | Header has ample space; 3-column grids look balanced; marquee cards are large (24rem). Hero is 250vh. Good. |
| **1280px** | Similar to 1440px. Header still shows brand text. 3-column grids comfortable. |
| **1024px** | Header switches to mobile menu and hides brand text abruptly. Services/Industries/Case Studies/Insights/Careers switch to 2 columns. Good tablet behavior, but the header change is binary. |
| **768px** | Hero is 200vh. 2-column grids still active (because they switch at 1024px). Contact form rows stack. Footer stacks at 767px. |
| **430px** | All grids 1-column. Marquee cards 18rem wide. Header mobile menu with centered links. Floating social bar hidden. Text wrapping acceptable. |
| **390px** | Same as 430px; touch targets on table action buttons are small. |
| **360px** | Header logo-only; mobile menu compact. Table requires horizontal scroll. Filter select min-width 140px can overflow toolbar. |

### Tablet-specific concerns

- 768px still gets 2-column grids, which is good, but the switch from desktop to tablet happens at 1024px/1023px which is a wide gap. A 900px tablet may still show 2-column but with narrow cards.
- Dashboard filters wrap awkwardly because `CMSToolbar` layout is not audited for tablet.
- Lead detail page 2-column grid becomes 1-column at 320px minmax, which is fine, but the breakpoint is implicit.

### Specific fixes needed

1. Unify `1024px` and `1023px` breakpoints.
2. Add an explicit 768px–1024px tablet tuning for card padding.
3. Add dashboard toolbar responsive behavior.
4. Ensure contact form checkbox label does not collide with checkbox at 360px.
5. Hero 250vh/200vh may be too tall on short landscape tablets; consider clamping to `min(250vh, 1400px)` or similar.

---

## 5. Accessibility Findings

### Critical

- **Focus indicators are weak or absent.** Public site buttons, header links, service cards, and footer links have no visible `:focus-visible` ring. Keyboard users cannot track focus.
- **Hero scroll indicator is purely visual** and conveys no progress to assistive tech.
- **Marquee is auto-scrolling and cannot be paused by keyboard.** Only hover pauses it.
- **Dashboard table rows are clickable** but not keyboard-focusable or announced as links.

### Recommended

- Add `:focus-visible` rings using the accent color.
- Add `prefers-reduced-motion` behavior to marquee: already stops animation but cards remain duplicated.
- Add `aria-label` or visually hidden text to "Open in Google Maps" style links that rely on context.
- Contact form success message uses `role="status"` correctly; keep.
- Dashboard empty state should be announced via `aria-live`.
- Ensure color is not the only means of communicating status (priority/ status badges use both color and text — good).
- RTL: tested only via `[dir='rtl']` CSS; ensure logical properties (`margin-inline-start`) replace manual overrides where possible.

### Arabic Typography

- System font stack does not include Arabic-specific fonts (e.g., "Noto Sans Arabic", "Segoe UI"). Arabic can fall back to system defaults, which may not match weight/width of Latin.
- Headlines use `letter-spacing: -0.02em`; Arabic text generally should not use negative tracking.

---

## 6. Performance Review

### Highest-impact issues

1. **JS bundle size:** 619 kB (gzipped 188 kB) is above Rollup's warning threshold. Likely caused by all routes being bundled together and large dependency graph.
   - **Action:** Route-level code splitting for `/leads`, `/training`, `/case-studies`, `/insights`.

2. **Hero asset payload:** 366 frames across desktop + mobile, each ~130 kB. Total can exceed 45 MB before compression, plus the 121-frame mobile set.
   - **Action:** Limit frame count, lower quality on mobile, or consider a compressed video fallback.

3. **No lazy loading for below-fold sections:** All sections import and render eagerly.
   - **Action:** Lazy load non-critical sections after Hero.

4. **InteractiveNetworkBackground runs on every page** but is disabled on mobile/reduced-motion. Still adds canvas overhead on desktop.
   - **Action:** Keep, but throttle frame rate and respect reduced motion.

5. **MouseGlow fixed element** follows cursor and repaints continuously.
   - **Action:** Acceptable on desktop but should be disabled on battery/power-save mode.

6. **No visible font preload or font-display strategy.** Currently system fonts only, which is actually a performance win.

### Not urgent

- CSS is 48 kB (gzipped 7.75 kB) — fine.
- WebP usage is good.
- Image lazy loading is present on service icons and insight images.

---

## 7. Higgsfield Opportunities

The user has a full Higgsfield subscription. The following are high-value, non-generic uses:

### 7.1 Hero — Cinematic Loop (video)

- **Why:** Replace the current scroll-driven frame sequence with a polished generated video.
- **Asset type:** MP4/WebM loop, 8–12 seconds.
- **Aspect ratio:** 16:9.
- **Resolution:** 1920×1080 desktop, 1080×1920 mobile portrait.
- **Loop:** Seamless.
- **Fallback:** First frame as poster image.
- **Performance:** Use `<video muted loop playsInline>` with `preload="metadata"`; lazy on mobile.
- **Prompt direction:** Abstract dark technology formation — dormant crystal → purple/blue energy → gold network → luminous purpose.
- **Decision:** Wait until a visual direction is chosen. Direction B (Cinematic Digital Infrastructure) would use this immediately.

### 7.2 Section Transition Assets (video or transparent)

- **Why:** Break up the "same card everywhere" feeling between Hero and Foundation, and between major sections.
- **Asset type:** Short 2–3 second loop or transparent WebM.
- **Use:** Thin divider bands with subtle particle/network motion.
- **Decision:** CSS gradients can achieve 80% of this; use Higgsfield only if Direction B is chosen.

### 7.3 Service-Specific Abstract Visuals (still images)

- **Why:** Give each service card a unique visual identity without generic icons.
- **Asset type:** Square 1:1 still images, 512×512 or 1024×1024.
- **Style:** Minimal abstract icons rendered as 3D glass/gold objects on dark background.
- **Decision:** High value, low performance cost. Recommended for all directions.

### 7.4 Industry Visuals (still images or short loops)

- **Why:** Industries/Solutions section needs stronger identity than outline icons.
- **Asset type:** 4 still covers or 4 short 4-second loops.
- **Aspect ratio:** 16:10 or 4:3.
- **Decision:** Nice-to-have; CSS/illustration may be sufficient if Direction C is chosen.

### 7.5 Case Study Covers (still images)

- **Why:** Case studies currently look like utility cards. Premium covers would elevate trust.
- **Asset type:** 16:10 hero covers for each case study.
- **Decision:** High value for lead generation.

### 7.6 Insights Thumbnails (still images)

- **Why:** Listing page and homepage cards would be more engaging.
- **Asset type:** 16:10 covers per article.
- **Decision:** Medium value; can start with a single generated placeholder pattern.

### 7.7 Training Course Covers (still images)

- **Why:** Training page cards have a generic purple gradient visual.
- **Asset type:** 16:10 covers per course.
- **Decision:** Medium value.

### What NOT to generate

- Background videos for every section (too heavy, CSS is better).
- Animated icons (SVG/CSS is more performant).
- Full-screen looping backgrounds on internal pages (distracting).

---

## 8. Three Visual Directions

### Direction A — Refined Graphite and Gold

**Concept:** Premium corporate technology. Dark graphite surfaces, controlled gold accents, minimal motion, strong typography, enterprise trust.

- **Color approach:** Keep `#0d0f12` base. Add a richer surface palette: `graphite-900` `#0d0f12`, `graphite-800` `#15171c`, `graphite-700` `#1e2128`. Gold `#c9a96e` as primary accent; purple `#8d51a0` reduced to secondary/gradient usage.
- **Typography approach:** System font stack. Headlines weight 300–400, tighter line-height. Introduce a clear type scale (display, h1, h2, h3, body, caption). Increase body contrast slightly.
- **Hero concept:** Keep current cinematic scroll sequence, but frame edges with a subtle gold vignette. Add a small, persistent brand wordmark overlay in gold.
- **Card style:** Deep graphite surface (`#15171c`), 1px border in `rgba(201,169,110,0.12)`, border radius `0.75rem`. Gold top-border accent per card category. Hover lifts with soft gold glow.
- **Motion level:** Low. Hero scroll animation is the main motion. Everything else is subtle fade/slide.
- **Background strategy:** Solid dark surfaces with very subtle radial gradients. No particles.
- **Higgsfield usage:** Service abstract stills, case study covers.
- **Performance impact:** Low.
- **Mobile behavior:** Simplifies well; gold accents remain visible.
- **Advantages:** Fastest to implement; most enterprise-appropriate; strong trust signal for institutions.
- **Risks:** Can feel conservative if not balanced with strong imagery.
- **Estimated complexity:** Low-Medium.

### Direction B — Cinematic Digital Infrastructure

**Concept:** Motion-driven Hero, abstract networks, digital systems, data flow, cinematic section transitions, stronger visual storytelling.

- **Color approach:** Dark base with dynamic purple-to-gold gradients. Use purple `#8d51a0` as primary energy color, gold as achievement/highlight. Add gradient overlays between sections.
- **Typography approach:** Same system stack, but use more dramatic scale contrast. Large display headlines, smaller functional labels. Consider a monospace accent font for data/labels (optional, no new dependency).
- **Hero concept:** Replace frame sequence with a generated Higgsfield cinematic loop or keep the scroll sequence but add generated overlay motion lines/network nodes that react to scroll.
- **Card style:** Glassmorphism with blurred borders, subtle inner glow, category-based gradient tint. More rounded (`1rem`).
- **Motion level:** High. Hero video/loop, section transition motion, hover network lines, scroll reveals.
- **Background strategy:** Subtle animated network mesh (canvas/CSS), section dividers with light-trail motion.
- **Higgsfield usage:** Hero cinematic loop, transition bands, service/insight/case-study covers.
- **Performance impact:** High without optimization.
- **Mobile behavior:** Must disable heavy motion; fallback to static posters and CSS-only transitions.
- **Advantages:** Most distinctive and memorable; aligns with "digital infrastructure" positioning.
- **Risks:** Heavy assets, longer load times, reduced-motion path must be robust, can feel busy.
- **Estimated complexity:** High.

### Direction C — Modern Technical Minimalism

**Concept:** Cleaner backgrounds, more whitespace, fewer effects, strong card layouts, high readability, faster performance, professional global software-company appearance.

- **Color approach:** Lighter dark surfaces (`#111318` base, `#181b21` surface) with white text. Accents are restrained: gold for primary actions, purple for highlights. More contrast.
- **Typography approach:** System fonts, larger body text (`1rem` minimum), clear hierarchy, less use of uppercase/tracking for labels.
- **Hero concept:** Simplify Hero to a static or slow-loop abstract image with a single strong headline and CTA. Reduce height from 250vh to ~120vh. Remove scroll-driven frame dependency.
- **Card style:** Flat, clean cards with ample padding, subtle borders, no glass effect. Border radius `0.75rem`–`1rem`. Clear icon + title + description hierarchy.
- **Motion level:** Very low. Only scroll-fade reveals and button hover states.
- **Background strategy:** Mostly solid colors. One or two subtle gradients.
- **Higgsfield usage:** Service stills, case study covers only.
- **Performance impact:** Lowest.
- **Mobile behavior:** Excellent; minimal assets and simple layouts.
- **Advantages:** Fast, accessible, professional, easy to maintain, great for global audience with varying devices.
- **Risks:** Can feel less "premium" than Direction A if not executed with strong typography and spacing.
- **Estimated complexity:** Low.

---

## 9. Recommended Direction

### Direction A — Refined Graphite and Gold

**Rationale:**

1. **Enterprise clients and academic institutions** need trust and clarity above spectacle. Direction A signals stability, competence, and premium service without distraction.
2. **Lead generation** depends on readable value propositions and fast load times. Direction A improves both.
3. **Future training platform** will need a clean, professional environment for course content. Direction A's card system scales naturally.
4. **Performance** is preserved; no heavy video assets required.
5. **Arabic and English support** is easier because the typographic system is simpler and avoids motion-driven layout constraints.
6. **Implementation risk is lowest** while still delivering a meaningful visual upgrade.

Direction B is exciting but should be a later phase after the foundation is solid. Direction C is safe but risks underwhelming the brand given the existing cinematic Hero investment.

**Verdict:** Start with Direction A, then selectively borrow motion moments from Direction B in a future phase.

---

## 10. Proposed Implementation Phases

### Phase 1 — UI-DESIGN-SYSTEM-FOUNDATION-001

**Goal:** Centralize tokens and primitives.

- Create `src/styles/tokens.css` with CSS custom properties for colors, typography, spacing, radii, shadows, transitions.
- Create `src/styles/components/card.css`, `button.css`, `input.css`, `section.css`.
- Refactor `CMSButton`, `CMSBadge`, `CMSTable`, `CMSInput`, `CMSSelect`, `CMSTextarea` to use tokens.
- Add `:focus-visible` rings to all interactive elements.

**Files affected:**
- `src/styles/tokens.css` (new)
- `src/styles/global.css`
- `src/components/cms/ui/*.jsx`
- `src/components/Header.jsx`
- `src/components/Footer.jsx`

### Phase 2 — PUBLIC-WEBSITE-UI-POLISH-001

**Goal:** Apply Direction A to public sections.

- Refactor all cards to use `.card` primitive with category modifiers.
- Unify section headers into a reusable `SectionHeader` component.
- Improve Services/Industries visual identity (Direction A card style + future still assets).
- Polish Contact form focus states and error styling.
- Fix heading hierarchy (single `h1`, proper `h2`/`h3`).

**Files affected:**
- `src/components/sections/*.jsx`
- `src/components/sections/ContactSection.jsx`
- `src/components/caseStudies/CaseStudyCard.jsx`
- `src/components/Header.jsx`
- `src/components/Footer.jsx`

### Phase 3 — LEADS-DASHBOARD-UI-POLISH-001

**Goal:** Make dashboard feel professional and consistent.

- Replace inline styles in `LeadsLoginPage.jsx`, `LeadsDashboardPage.jsx`, `LeadDetailPage.jsx` with token-based CSS classes.
- Reuse `CMSButton`, `CMSBadge`, `CMSTable`, `CMSInput`, `CMSSelect`, `CMSTextarea` consistently.
- Add dashboard layout shell (`LeadsLayout.jsx` improvements).
- Improve stat cards with context/trends and better spacing.
- Add focus states and keyboard navigation to table rows.
- Translate login page strings.

**Files affected:**
- `src/components/leads/LeadsLoginPage.jsx`
- `src/components/leads/LeadsDashboardPage.jsx`
- `src/components/leads/LeadDetailPage.jsx`
- `src/components/leads/LeadsLayout.jsx`
- `src/contexts/CMSLanguageContext.jsx`

### Phase 4 — HIGGSFIELD-ASSET-PRODUCTION-001

**Goal:** Generate Direction A aligned still assets.

- Service abstract stills (5 images, 1:1).
- Industry visuals (4 images, 16:10).
- Case study covers (variable count).
- Insights placeholder pattern / covers.
- Training course covers.

**Files affected:**
- `public/assets/services/` (new)
- `public/assets/industries/` (new)
- `public/assets/case-studies/` (new)
- `public/assets/insights/` (existing placeholder replaced)
- `public/assets/training/` (new)

### Phase 5 — MOTION-INTEGRATION-001

**Goal:** Refine motion, not add more.

- Add `prefers-reduced-motion` to Hero (already partially present; harden).
- Replace duplicate marquee track with a single accessible pause/play control.
- Reduce `MouseGlow` / `InteractiveNetworkBackground` CPU cost.
- Standardize scroll-reveal timing.

**Files affected:**
- `src/components/hero/CinematicHero.jsx`
- `src/components/InteractiveNetworkBackground.jsx`
- `src/components/MouseGlow.jsx`
- `src/components/sections/CapabilitiesMarqueeSection.jsx`
- `src/styles/global.css`

### Phase 6 — RESPONSIVE-ACCESSIBILITY-POLISH-001

**Goal:** Close responsive and a11y gaps.

- Unify breakpoints.
- Tune tablet layout.
- Improve dashboard mobile table/filter UX.
- Add visible focus rings.
- Add Arabic font fallbacks and remove negative tracking from Arabic text.
- Add skip-to-content link.

**Files affected:**
- `src/styles/global.css`
- `src/components/leads/LeadsDashboardPage.jsx`
- `src/components/Header.jsx`
- `src/i18n/` files

### Phase 7 — PERFORMANCE-POLISH-001

**Goal:** Reduce bundle and asset weight.

- Route-level code splitting.
- Lazy load below-fold sections.
- Reduce hero frame count or add video fallback.
- Audit and remove unused CSS.
- Add `<link rel="preload">` for critical assets.

**Files affected:**
- `src/App.jsx`
- `vite.config.js`
- `index.html`
- `src/components/hero/CinematicHero.jsx`
- `src/styles/global.css`

---

## 11. Exact File Impact by Phase

| Phase | New files | Modified files |
|-------|-----------|----------------|
| UI-DESIGN-SYSTEM-FOUNDATION-001 | `src/styles/tokens.css`, `src/styles/components/*.css` | `global.css`, all `src/components/cms/ui/*.jsx`, `Header.jsx`, `Footer.jsx` |
| PUBLIC-WEBSITE-UI-POLISH-001 | `src/components/common/SectionHeader.jsx` (optional) | all `src/components/sections/*.jsx`, `CaseStudyCard.jsx`, `Header.jsx`, `Footer.jsx` |
| LEADS-DASHBOARD-UI-POLISH-001 | dashboard CSS module or classes | `LeadsLoginPage.jsx`, `LeadsDashboardPage.jsx`, `LeadDetailPage.jsx`, `LeadsLayout.jsx`, `CMSLanguageContext.jsx` |
| HIGGSFIELD-ASSET-PRODUCTION-001 | asset folders under `public/assets/` | component JSX to reference new assets |
| MOTION-INTEGRATION-001 | — | `CinematicHero.jsx`, `InteractiveNetworkBackground.jsx`, `MouseGlow.jsx`, `CapabilitiesMarqueeSection.jsx` |
| RESPONSIVE-ACCESSIBILITY-POLISH-001 | — | `global.css`, `LeadsDashboardPage.jsx`, `Header.jsx`, i18n files |
| PERFORMANCE-POLISH-001 | — | `App.jsx`, `vite.config.js`, `index.html`, `CinematicHero.jsx`, `global.css` |

---

## 12. Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Heavy Higgsfield assets slow down the site | Medium | High | Generate only still images first; video only after performance budget is defined; compress aggressively. |
| Refactoring inline dashboard styles introduces bugs | Medium | Medium | Phase 3 is isolated to `/leads`; run smoke tests after each file. |
| Design-token refactor breaks existing CMS pages | Medium | Medium | Keep old values as fallbacks during transition; test `/cms` routes even if not in active use. |
| Direction A feels too conservative | Low | Medium | Reserve Direction B motion assets for a later phase; use strong imagery to avoid plainness. |
| Arabic layout issues during token refactor | Medium | Medium | Test RTL after each phase; add logical properties and Arabic font fallbacks. |
| Hero performance remains a concern | High | High | Cap frame count; add video fallback; lazy load below-fold. |
| Scope creep into full CMS restoration | Medium | High | Strictly limit changes to public site and `/leads`; do not restore full CMS UI. |

---

## 13. Validation

- `npm run build` — PASS (2026-07-15, built in 10.82s).
- No code changes were made in this audit phase; the build was run to confirm the current baseline.

---

## 14. Final Recommendation

```
READY FOR DIRECTION SELECTION
```

The codebase is stable, the build passes, and the functional foundation is solid. The recommended direction is **Direction A — Refined Graphite and Gold**, implemented across the proposed seven phases. The user should review the three directions before any visual execution begins.
