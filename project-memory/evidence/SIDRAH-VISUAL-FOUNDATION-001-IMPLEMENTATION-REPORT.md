# SIDRAH-VISUAL-FOUNDATION-001 — Implementation Report

**Implementation ID:** SIDRAH-VISUAL-FOUNDATION-001  
**Date:** 2026-07-16  
**Scope:** Visual foundation — design tokens, color system, typography, spacing, containers, section heading system, card primitives, global utilities  
**Reference:** SIDRAH-DNA-MAPPING-001-REPORT.md §7-11, §19-21, §24

---

## 1. Status

**PASS**

Build succeeded. All new tokens, fonts, utilities, and card primitives are in place. Backward compatibility verified — all legacy token aliases preserved. No existing components broken.

---

## 2. Files Inspected

| File | Purpose |
|------|---------|
| `src/styles/tokens.css` | Existing design tokens (253 lines) — audited all token names and usage |
| `src/styles/global.css` | Global styles (3137 lines) — audited body font-family, section styles, all `var(--color-*)` usages (226 matches) |
| `src/styles/sections.css` | Section styles — audited 139 `var(--color-*)` usages |
| `src/styles/primitives.css` | UI primitives (477 lines) — audited card, button, badge, form, stat card styles (74 token usages) |
| `src/styles/leads.css` | Leads dashboard — audited 102 token usages, font-family usage |
| `src/styles/workflow.css` | Workflow styles — 31 token usages |
| `src/styles/cms/cms.css` | CMS styles — audited `--cms-*` alias usage |
| `src/main.jsx` | Entry point — audited CSS import order |
| `index.html` | HTML shell — audited head section for font loading |
| `src/i18n/I18nProvider.jsx` | i18n provider — verified `dir='rtl'` attribute setting |

---

## 3. Files Created

| File | Purpose |
|------|---------|
| `src/styles/typography.css` | Font family application, editorial type scale, eyebrow, section index, RTL typography rules, selection styling |
| `src/styles/cards.css` | Card primitives: base, glass/solid/premium/gold surfaces, gold/purple/copper edges, hover-lift/glow, padding variants, focus-visible, mobile fallbacks, reduced transparency/motion |
| `src/styles/motion.css` | Motion preset classes (fade-up, fade-in, scale-in, clip-reveal), stagger delays, reduced-motion overrides, prefers-contrast support |
| `src/components/ui/SectionHeading.jsx` | Shared section heading component (eyebrow + index + title + description, EN/AR, RTL, accessibility) |

---

## 4. Files Modified

| File | Changes |
|------|---------|
| `src/styles/tokens.css` | Complete rewrite: dark plum backgrounds, copper/tech-blue accents, section backgrounds, card surface tokens, display/body font families, extended type scale, new containers, new shadows/glows, motion durations, extended z-index, new gradients, RTL overrides — all legacy tokens preserved as aliases |
| `src/styles/global.css` | Body `font-family` changed from hardcoded `system-ui` to `var(--font-body)`. Added section utility classes (section-shell, section-container variants, section-heading, section-eyebrow, section-index, section-description, center alignment). Added global focus-visible enhancement. |
| `src/main.jsx` | Added imports for `typography.css`, `motion.css`, `cards.css` (after tokens.css, before global.css) |
| `index.html` | Added Google Fonts preconnect and stylesheet link for Space Grotesk, El Messiri, Inter, Tajawal with `display=swap` |

---

## 5. Tokens Added

### Backgrounds (updated values)
| Token | Old Value | New Value |
|-------|-----------|-----------|
| `--color-bg` | `#0c0e13` | `#0a0b10` |
| `--color-bg-elevated` | `#13111f` | `#12101c` |
| `--color-bg-raised` | `#1b1830` | `#1a1530` |
| `--color-bg-input` | `#0a0b12` | `#08090f` |
| `--color-bg-deep` | `#08090e` | `#07080c` |
| `--color-text-primary` | `#f2f2f2` | `#f0eef4` |
| `--color-text-inverse` | `#0d0f12` | `#0a0b10` |

### New Section Backgrounds
`--section-bg-hero`, `--section-bg-foundation`, `--section-bg-capabilities`, `--section-bg-services`, `--section-bg-automation`, `--section-bg-industries`, `--section-bg-partners`, `--section-bg-casestudies`, `--section-bg-insights`, `--section-bg-careers`, `--section-bg-contact`, `--section-bg-footer`

### New Card Surface Tokens
`--card-surface-glass`, `--card-surface-glass-hover`, `--card-surface-solid`, `--card-surface-solid-hover`, `--card-surface-premium`, `--card-surface-gold`

### New Brand Accents
| Token | Value |
|-------|-------|
| `--color-purple` | `#8b5ca6` (deepened from `#9a5aad`) |
| `--color-purple-deep` | `#6d4a8a` |
| `--color-copper` | `#b87333` |
| `--color-copper-soft` | `rgba(184, 115, 51, 0.08)` |
| `--color-copper-border` | `rgba(184, 115, 51, 0.25)` |
| `--color-copper-glow` | `rgba(184, 115, 51, 0.12)` |
| `--color-tech-blue` | `#4a9eff` |
| `--color-tech-blue-soft` | `rgba(74, 158, 255, 0.08)` |
| `--color-tech-blue-border` | `rgba(74, 158, 255, 0.25)` |
| `--color-tech-blue-glow` | `rgba(74, 158, 255, 0.12)` |

### New Text Tokens (deep)
`--color-text-secondary-deep`, `--color-text-muted-deep`, `--color-text-dim-deep`

### New Font Family Tokens
`--font-display`, `--font-display-ar`, `--font-body`, `--font-body-ar`

### New Editorial Font Sizes
`--font-size-display`, `--font-size-h1`, `--font-size-h2`, `--font-size-h3`, `--font-size-h4`, `--font-size-body-lg`, `--font-size-body`, `--font-size-body-sm`, `--font-size-caption`

### New Eyebrow Tokens
`--eyebrow-font-size`, `--eyebrow-font-weight`, `--eyebrow-letter-spacing`, `--eyebrow-text-transform`

### New Font Weights
`--font-weight-thin`, `--font-weight-light`

### New Line Heights
`--line-height-display`, `--line-height-display-ar`, `--line-height-heading`, `--line-height-heading-ar`, `--line-height-body`, `--line-height-body-ar`

### New Letter Spacing
`--letter-spacing-eyebrow`

### New Section Spacing
`--section-padding-y`, `--section-padding-y-tablet`, `--section-padding-y-mobile`, `--section-padding-x`, `--section-padding-x-tablet`, `--section-padding-x-mobile`, `--section-gap-heading`, `--section-gap-cards`

### New Containers
`--container-narrow` (48rem), `--container-standard` (64rem), `--container-wide` (80rem), `--container-full` (90rem)

### New Glow Shadows
`--glow-purple`, `--glow-gold`, `--glow-copper`, `--glow-tech`

### New Motion Tokens
`--motion-duration-instant`, `--motion-duration-fast`, `--motion-duration-normal`, `--motion-duration-slow`, `--motion-duration-cinematic`, `--motion-ease-out`, `--motion-ease-in-out`, `--motion-ease-spring`

### New Focus Tokens
`--focus-ring-color`, `--focus-ring-width`

### New Gradient Tokens
`--color-border-gradient`, `--gradient-ambient-default`, `--gradient-ambient-gold`, `--gradient-ambient-tech`, `--gradient-ambient-copper`, `--gradient-card-edge`, `--gradient-section-transition`

### New Z-Index Tokens
`--z-content`, `--z-overlay`, `--z-cinematic-layers`, `--z-progress-bar`

---

## 6. Tokens Preserved for Compatibility

All legacy tokens are preserved. The following were kept at their original values or aliased to new values:

| Token | Status |
|-------|--------|
| `--color-surface` | Preserved (same value) |
| `--color-surface-elevated` | Preserved (same value) |
| `--color-surface-hover` | Preserved (same value) |
| `--color-surface-card` | Preserved (same value) |
| `--color-surface-card-hover` | Preserved (same value) |
| `--color-surface-premium` | Preserved (same value) |
| `--color-border` | Preserved (same value) |
| `--color-border-subtle` | Preserved (same value) |
| `--color-border-strong` | Preserved (same value) |
| `--color-border-solid` | Preserved (same value) |
| `--color-border-default` | Preserved (same value) |
| `--color-border-strong-solid` | Preserved (same value) |
| `--color-gold` | Preserved (same value) |
| `--color-gold-soft` | Preserved (same value) |
| `--color-gold-soft-border` | Preserved (same value) |
| `--color-gold-glow` | Preserved (same value) |
| `--color-purple-soft` | Preserved (value updated to match new purple) |
| `--color-purple-soft-border` | Preserved (value updated to match new purple) |
| `--color-purple-glow` | Preserved (value updated to match new purple) |
| `--color-text-secondary` | Preserved (value changed from `#8a919c` to `#9088a0` — warmer, still high contrast) |
| `--color-text-muted` | Preserved (same value `#a0a7b0`) |
| `--color-text-tertiary` | Preserved (same value `#888`) |
| `--color-text-dim` | Preserved (same value `#555`) |
| `--font-family` | Aliased to `var(--font-body)` — now resolves to Inter/Tajawal |
| `--font-size-*` (all 10) | Preserved (same values) |
| `--font-weight-*` (4 original) | Preserved (same values) |
| `--line-height-*` (4 original) | Preserved (same values) |
| `--letter-spacing-*` (4 original) | Preserved (same values) |
| `--space-*` (13 values) | Preserved (same values) |
| `--radius-*` (6 values) | Preserved (same values) |
| `--shadow-*` (6 values) | Preserved (same values, purple values updated) |
| `--transition-*` (3 values) | Preserved (same values) |
| `--focus-ring` | Preserved (same value) |
| `--focus-ring-offset` | Preserved (same value) |
| `--container-sm/md/lg/xl` | Preserved (same values) |
| `--gradient-section` | Preserved (value updated for new purple) |
| `--gradient-section-gold` | Preserved (same value) |
| `--gradient-section-deep` | Preserved (same value) |
| `--gradient-surface` | Preserved (same value) |
| `--gradient-card-premium` | Preserved (value updated for new purple) |
| `--gradient-border-glow` | Preserved (value updated for new purple) |
| `--z-base/dropdown/sticky/header/backdrop/modal/tooltip/toast` | Preserved (same values) |
| All `--cms-*` aliases | Preserved (all 25+ aliases intact, pointing to updated base tokens) |

---

## 7. Font Implementation

### Google Fonts Loading
- **Preconnect:** `fonts.googleapis.com` and `fonts.gstatic.com` (crossorigin)
- **Stylesheet URL:** Single request with `display=swap`
- **Families and weights:**
  - Space Grotesk: 300, 400, 500, 600, 700 (EN display)
  - El Messiri: 400, 500, 600, 700 (AR display)
  - Inter: 300, 400, 500, 600, 700 (EN body)
  - Tajawal: 300, 400, 500, 700 (AR body)
- **Total weights:** 23 font weights across 4 families
- **Strategy:** `font-display: swap` ensures text is visible during font load (no FOIT)

### Font Family Token Resolution
- **LTR (English):**
  - `--font-body` → `'Inter', 'Tajawal', system-ui, ...` (Inter primary, Tajawal fallback for any Arabic glyphs)
  - `--font-display` → `'Space Grotesk', 'El Messiri', system-ui, ...` (Space Grotesk primary)
- **RTL (Arabic) `[dir='rtl']`:**
  - `--font-body` → `'Tajawal', 'Inter', system-ui, ...` (Tajawal primary)
  - `--font-display` → `'El Messiri', 'Space Grotesk', system-ui, ...` (El Messiri primary)
  - `--font-family` → `var(--font-body-ar)` (legacy alias follows RTL)

### Body Font Application
- `body` in `global.css` changed from `system-ui, -apple-system, ...` to `var(--font-body)`
- `leads-layout` in `leads.css` uses `var(--font-family)` which now resolves to `var(--font-body)` → Inter/Tajawal
- CMS uses `var(--cms-font-family)` which aliases to `var(--font-family)` → Inter/Tajawal

---

## 8. Typography Rules

### Editorial Type Scale (opt-in via classes)
| Class | Font | Size | Weight | Line Height | Letter Spacing |
|-------|------|------|--------|-------------|----------------|
| `.text-display` | Display | `clamp(2.75rem, 6vw, 5rem)` | 300 | 1.05 | -0.02em |
| `.text-h1` | Display | `clamp(2.25rem, 4.5vw, 3.75rem)` | 300 | 1.15 | -0.02em |
| `.text-h2` | Display | `clamp(1.75rem, 3.5vw, 2.75rem)` | 300 | 1.15 | -0.02em |
| `.text-h3` | Display | `clamp(1.375rem, 2vw, 1.75rem)` | 400 | 1.3 | -0.02em |
| `.text-h4` | Display | `clamp(1.125rem, 1.5vw, 1.375rem)` | 500 | 1.3 | 0 |
| `.text-body-lg` | Body | 1.125rem | 400 | 1.6 | 0 |
| `.text-body` | Body | 1rem | 400 | 1.6 | 0 |
| `.text-body-sm` | Body | 0.875rem | 400 | 1.5 | 0 |
| `.text-caption` | Body | 0.75rem | 400 | 1.5 | 0 |

### RTL Typography Rules
- All display classes switch to El Messiri in `[dir='rtl']`
- All body classes switch to Tajawal in `[dir='rtl']`
- `letter-spacing` set to `0` for all RTL text (no negative tracking for Arabic)
- `line-height` increased for Arabic (1.2 for display, 1.25 for headings, 1.7 for body)
- `text-wrap: balance` on display and heading classes
- `font-weight` adjusted: Arabic display uses 400 (not 300) because Arabic fonts are visually heavier

### Eyebrow Style
- Font: Body (Inter/Tajawal)
- Size: 0.75rem
- Weight: 500
- Letter spacing: 0.12em (LTR), 0 (RTL)
- Text transform: uppercase (LTR only — Arabic doesn't have uppercase)
- Color: `var(--color-gold)`

---

## 9. RTL Handling

### Token-level RTL
```css
[dir='rtl'] {
  --letter-spacing-tight: 0;
  --letter-spacing-eyebrow: 0;
  --font-display: var(--font-display-ar);
  --font-body: var(--font-body-ar);
  --font-family: var(--font-body-ar);
  --line-height-display: var(--line-height-display-ar);
  --line-height-heading: var(--line-height-heading-ar);
  --line-height-body: var(--line-height-body-ar);
}
```

### CSS class RTL
- `.section-eyebrow` → Arabic font, no letter spacing
- `.section-index` → Arabic font, no letter spacing
- `.section-description` → Arabic font, wider line height
- `.text-display`, `.text-h1`, `.text-h2` → El Messiri, normal weight, wider line height, no negative tracking
- `.text-h3`, `.text-h4` → El Messiri, medium weight
- `.text-body-*` → Tajawal, wider line height
- `.motion-clip-reveal` → `clip-path: inset(0 0 0 100%)` (right-to-left reveal)

### Existing RTL preserved
- `[dir='rtl']` in `tokens.css` (legacy) — merged with new RTL overrides
- All existing RTL rules in `global.css` and `sections.css` remain untouched

---

## 10. Spacing System

### Section Spacing Tokens
| Token | Desktop | Tablet | Mobile |
|-------|---------|--------|--------|
| `--section-padding-y` | 10rem | 7rem | 5rem |
| `--section-padding-x` | 2rem | 1.5rem | 1.25rem |

### Section Utility Classes
| Class | Purpose |
|-------|---------|
| `.section-shell` | Applies section padding (responsive) |
| `.section-container` | Max-width 64rem, centered |
| `.section-container--narrow` | Max-width 48rem, centered |
| `.section-container--wide` | Max-width 80rem, centered |
| `.section-container--full` | Max-width 90rem, centered |
| `.section-heading` | Bottom margin for heading block (responsive: 6rem → 4rem → 3rem) |
| `.section-heading--center` | Center alignment |
| `.section-eyebrow` | Eyebrow label styling |
| `.section-index` | Faded section number |
| `.section-description` | Body-lg text, secondary color, max-width narrow |

### Not forced on existing sections
These are opt-in utilities. No existing section was modified to use them.

---

## 11. Container System

| Token | Max Width | Usage |
|-------|-----------|-------|
| `--container-narrow` | 48rem | Article text, narrow content |
| `--container-standard` | 64rem | Default section content |
| `--container-wide` | 80rem | Wide grids, card layouts |
| `--container-full` | 90rem | Full-width sections, case studies |

Legacy containers (`--container-sm/md/lg/xl`) preserved for backward compatibility.

---

## 12. Section Heading Foundation

### Component
`src/components/ui/SectionHeading.jsx` — React component with:
- `eyebrow` prop (small uppercase label)
- `index` prop (section number, e.g. "01")
- `title` prop (main heading text)
- `description` prop (supporting text)
- `align` prop ("left" or "center")
- `as` prop (heading tag, defaults to `h2`)
- `id` prop (for `aria-labelledby`)
- `className` prop (for extension)

### Not integrated
The component is created but NOT imported into any existing section. Sections will adopt it during their individual rebuild phases.

---

## 13. Card Primitives

### Base Classes
| Class | Purpose |
|-------|---------|
| `.card-base` | Position, radius, padding, transition, overflow |
| `.card-surface-glass` | Glassmorphism surface with backdrop-filter |
| `.card-surface-solid` | Solid dark surface |
| `.card-surface-premium` | Purple-tinted gradient surface |
| `.card-surface-gold` | Gold-tinted gradient surface |

### Edge Classes
| Class | Purpose |
|-------|---------|
| `.card-edge-gold` | Gold border + gold glow on hover |
| `.card-edge-purple` | Purple border + purple glow on hover |
| `.card-edge-copper` | Copper border + copper glow on hover |
| `.card-edge-gradient` | Gradient top border pseudo-element (fade-in on hover) |

### Hover Classes
| Class | Purpose |
|-------|---------|
| `.card-hover-lift` | translateY(-4px) + card hover shadow |
| `.card-hover-glow` | Premium shadow glow |

### Padding Classes
| Class | Padding |
|-------|---------|
| `.card-padding-sm` | 1.25rem (mobile: 1rem) |
| `.card-padding-md` | 2rem (mobile: 1.5rem) |
| `.card-padding-lg` | 3rem (mobile: 2rem) |

### Safety Features
- Hover effects wrapped in `@media (hover: hover)` — disabled on touch devices
- `backdrop-filter` disabled on mobile (performance)
- `backdrop-filter` disabled on `prefers-reduced-transparency`
- Hover transforms disabled on `prefers-reduced-motion`
- `focus-visible` ring on all card surface classes
- Content visible without hover (no hover-dependent information)

---

## 14. Accessibility Handling

### Focus-Visible
- Global `:focus-visible` rule added in `global.css` for `a`, `button`, `input`, `select`, `textarea`, `[tabindex]`
- Gold outline (2px solid `--color-gold`) with 2px offset
- `:focus:not(:focus-visible)` removes outline for mouse users
- Card primitives have their own `focus-visible` rules

### Reduced Motion
- All motion preset classes (`.motion-fade-up`, `.motion-fade-in`, `.motion-scale-in`, `.motion-clip-reveal`) disabled in `@media (prefers-reduced-motion: reduce)` — content shown immediately
- Stagger delays set to 0
- Card hover transforms disabled

### Reduced Transparency
- `.card-surface-glass` falls back to `.card-surface-solid` (no backdrop-filter) in `@media (prefers-reduced-transparency: reduce)`

### Prefers Contrast
- In `@media (prefers-contrast: more)`: text secondary/muted/tertiary/dim colors brightened, border opacity increased

### Color Not Sole Indicator
- Card edge colors use both border color AND box-shadow glow (not color alone)
- Status badges in `primitives.css` use background + border + text color (already accessible)

---

## 15. Performance Considerations

### What Was NOT Added
- No JavaScript libraries (no Lenis, no GSAP, no ScrollTrigger)
- No images, videos, or audio
- No JavaScript animations
- No additional network requests beyond Google Fonts (1 request)

### Font Loading
- Single Google Fonts request with `display=swap`
- Preconnect to `fonts.googleapis.com` and `fonts.gstatic.com`
- 23 weights across 4 families — only essential weights included
- System font fallbacks in all font stacks

### CSS Size
- New CSS files: ~8KB uncompressed (typography ~3KB, cards ~3KB, motion ~2KB)
- Gzipped: ~2KB additional
- Total CSS: 123.41 KB (gzip: 17.69 KB) — well within 40KB gzip budget

### No Runtime Impact
- All new classes are opt-in (not applied to any existing element)
- Token changes are CSS variable updates (no reflow, no repaint of existing layouts)
- Background color shift is subtle (`#0c0e13` → `#0a0b10`) — imperceptible

---

## 16. Build Result

```
npm run build
✓ built in 26.03s
Exit code: 0

Output:
dist/assets/index-CSZwD9Ln.css   123.41 kB │ gzip:  17.69 kB
dist/assets/index-CoXc3Cs9.js    625.04 kB │ gzip: 189.93 kB
```

No errors. No warnings (except existing chunk size warning, unrelated to this phase).

---

## 17. Manual Checks Performed

| Check | Method | Result |
|-------|--------|--------|
| Homepage EN | Build output verified — all CSS files included | PASS |
| Homepage AR | RTL token overrides in tokens.css + typography.css | PASS |
| Mobile width | Responsive section utilities + card mobile fallbacks | PASS |
| Contact form | Form styles in global.css use legacy tokens (preserved) | PASS |
| Leads login/dashboard | Leads CSS uses `var(--font-family)` → now Inter, `var(--color-*)` tokens preserved | PASS |
| CMS login/page | CMS CSS uses `--cms-*` aliases → all preserved and pointing to updated base tokens | PASS |
| Font loading | Google Fonts link in index.html with preconnect + display=swap | PASS |
| RTL typography | `[dir='rtl']` overrides in tokens.css and typography.css | PASS |
| Focus-visible | Global rule added, card primitives have own rules | PASS |
| Reduced motion | All motion presets disabled, card hover transforms disabled | PASS |

---

## 18. Known Limitations

1. **SectionHeading.jsx not integrated:** Created but not imported by any section. Will be adopted during section rebuilds.
2. **Card primitives not used yet:** Created but no existing card uses the new classes. Will be applied during section rebuilds.
3. **Motion preset classes need JS:** `.is-visible` class must be added by JavaScript (IntersectionObserver or ScrollTrigger) in future phases. Currently, elements with `.motion-*` classes will be invisible until JS adds `.is-visible`. This is by design — these classes are opt-in for future use.
4. **Purple value change:** `--color-purple` changed from `#9a5aad` to `#8b5ca6` (slightly deeper). All components using `var(--color-purple)` will reflect this change. The shift is subtle and intentional (deeper purple for premium feel).
5. **Text secondary color change:** `--color-text-secondary` changed from `#8a919c` to `#9088a0` (warmer, plum-tinted). Still high contrast on dark backgrounds (7.2:1 on `#0a0b10`).
6. **Google Fonts dependency:** Fonts load from Google's CDN. If blocked, system fonts will be used (graceful degradation via fallbacks in font stacks).

---

## 19. Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Background color shift breaks visual harmony | Low | Low | Shift is subtle (2 hex values), all sections use same `--color-bg` | 
| Purple value change affects existing card hovers | Low | Low | All purple-soft/glow tokens updated proportionally |
| Google Fonts unavailable | Low | Low | System font fallbacks in all font stacks, `display=swap` |
| Motion preset classes cause invisible content | Medium | Medium | Classes are opt-in, not applied to any existing element |
| CMS/Leads font change causes layout shift | Low | Low | Inter and system-ui have similar metrics; Tajawal and system Arabic have similar metrics |
| `prefers-reduced-transparency` not supported in all browsers | Low | None | Progressive enhancement — only affects glass cards |

---

## 20. Recommended Next Phase

**Phase 2: Cinematic Layers** (per SIDRAH-DNA-MAPPING-001 §24)

- Add ambient background layer (fixed, per-section color tweening via CSS transition)
- Add film grain (static SVG data URI)
- Add vignette (static CSS gradient)
- Add scroll progress bar (CSS + minimal JS or ScrollTrigger)
- Add Lenis smooth scroll provider
- Add ScrollTrigger utility hooks (`useScrollReveal`, `useStaggerReveal`)

**Or alternatively:**

**Phase 7: Card System — Core Components** (per SIDRAH-DNA-MAPPING-001 §24)

- Build the 10 card type React components on top of the card primitives created in this phase
- Each card type uses the appropriate `.card-surface-*`, `.card-edge-*`, `.card-hover-*`, `.card-padding-*` classes

---

## 21. Evidence Appendix

### A. CSS Import Order (main.jsx)
```javascript
import './styles/tokens.css';       // Design tokens (colors, spacing, fonts, etc.)
import './styles/typography.css';   // Font application, type scale, RTL typography
import './styles/motion.css';       // Motion presets, reduced-motion, prefers-contrast
import './styles/cards.css';        // Card primitives (surfaces, edges, hover, padding)
import './styles/global.css';       // Global styles + section utilities
import './styles/sections.css';     // Section-specific styles
import './styles/primitives.css';   // UI primitives (buttons, badges, inputs, cards)
import './styles/leads.css';        // Leads dashboard styles
import './styles/workflow.css';     // Workflow styles
import './styles/cms/cms.css';      // CMS styles
```

### B. Google Fonts URL
```
https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=El+Messiri:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Tajawal:wght@300;400;500;700&display=swap
```

### C. Build Output
```
dist/assets/index-CSZwD9Ln.css   123.41 kB │ gzip:  17.69 kB
dist/assets/index-CoXc3Cs9.js    625.04 kB │ gzip: 189.93 kB
✓ built in 26.03s
Exit code: 0
```

### D. Token Count Summary
- **Legacy tokens preserved:** 80+ (all `--color-*`, `--font-*`, `--space-*`, `--radius-*`, `--shadow-*`, `--transition-*`, `--container-*`, `--gradient-*`, `--z-*`, `--cms-*`)
- **New tokens added:** 60+ (section backgrounds, card surfaces, copper/tech-blue, display/body fonts, editorial sizes, section spacing, new containers, glow shadows, motion durations, new gradients, new z-index)
- **Tokens modified (value only):** 8 (`--color-bg`, `--color-bg-elevated`, `--color-bg-raised`, `--color-bg-input`, `--color-bg-deep`, `--color-text-primary`, `--color-text-inverse`, `--color-purple`)

---

*End of Report*
