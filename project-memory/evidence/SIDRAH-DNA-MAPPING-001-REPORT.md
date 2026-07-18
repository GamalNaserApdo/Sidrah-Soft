# SIDRAH-DNA-MAPPING-001 — Full-Site Experience Mapping Report

**Audit ID:** SIDRAH-DNA-MAPPING-001  
**Date:** 2026-07-16  
**Scope:** Full-site refactor mapping from reference DNA to SidrahSoft  
**Status:** Investigation + Mapping + Architecture only — no code modified

---

## 1. Executive Summary

This report maps the cinematic landing kit DNA (`DNA/` folder) to the current SidrahSoft website for a full-site refactor. The current site has a solid foundation: React 19 + Vite 7, GSAP 3.13, a Django/PostgreSQL backend with CMS, leads dashboard, i18n (EN/AR), RTL support, and a canvas-based cinematic hero. However, the site suffers from **visual monotony** — every section uses the same card pattern, the same fade-up reveal, the same purple glow hover, and the same dark background. There is no scroll choreography, no ambient mood differentiation, no smooth scroll, and no cinematic layering beyond the hero.

The DNA reference provides a proven system for scroll-driven cinematic storytelling: Lenis smooth scroll, GSAP ScrollTrigger with pinned sections, ambient per-section color tweening, film grain/vignette/progress bar overlays, editorial typography, and a vocabulary of motion presets. This report maps each concept to a specific SidrahSoft target, proposes a complete visual identity upgrade (dark plum + gold + copper + controlled blue accents), redesigns the card system with 10 distinct variants, and lays out a 20-phase implementation roadmap.

**Key finding:** The refactor does NOT require a rebuild. All backend, CMS, leads, routing, SEO, i18n, and RTL infrastructure is preserved. The work is primarily frontend: new design tokens, new CSS, new motion infrastructure, and UI rebuilds for specific components while keeping data/logic layers intact.

---

## 2. Confirmed Refactor Vision

The goal is to transform SidrahSoft from a **functional dark website** into a **premium cinematic technology experience**:

- **Premium:** Editorial spacing, large headlines, considered typography, section-specific color moods
- **Cinematic:** Smooth scroll, scroll-driven reveals, ambient background transitions, film grain, progress bar
- **Modern:** Glass surfaces, gradient edges, controlled depth, strong contrast
- **Cohesive:** Unified motion vocabulary, shared design tokens, consistent card system with variants
- **Visually distinctive:** Dark plum base with gold/copper warmth and blue tech accents — not another generic dark site
- **Smooth and enjoyable scroll:** Lenis + ScrollTrigger choreography with pinned moments and seamless handoffs
- **Clear and usable:** Strong information hierarchy, readable text, obvious CTAs, accessible interactions
- **Appropriate for a software/tech company:** Professional, not flashy; confident, not noisy

**Preserved systems (no changes):**
- Django backend, PostgreSQL, all APIs
- CMS models, admin, RBAC, activity logging
- Leads dashboard (separate visual system)
- React Router routes
- i18n (EN/AR) and RTL infrastructure
- SEO configuration
- Contact form submission flow
- Homepage config API (section ordering)

**Rebuilt systems (UI only):**
- All section component visual layers
- Card components
- Header and footer visual design
- Motion/animation system
- Design tokens
- Typography system
- Background/ambient system

---

## 3. Current Homepage Audit

### Section Order (from `App.jsx` FALLBACK_SECTION_ORDER)

```
hero → foundation → marquee → services → automation_showcase → industries → partners → case_studies → insights → careers → contact
```

### Full Component Audit Table

| # | Section | Component Path | Current Purpose | Current Layout | Visual Quality | Card Style | Animation | CMS/API Dependency | EN/AR Dependency | Reusability Score | Refactor Severity |
|---|---------|---------------|-----------------|----------------|----------------|------------|-----------|-------------------|------------------|-------------------|-------------------|
| 1 | Global App Shell | `src/App.jsx` | Route provider, global layers | Full-page with fixed bg | Functional | N/A | Network bg + mouse glow | None | None | 8/10 | Light Refactor |
| 2 | Header | `src/components/Header.jsx` | Nav, branding, lang switcher | Fixed pill, blurred | Good — pill design | N/A | Scrolled padding shrink | CMS nav links | i18n labels | 7/10 | Light Refactor |
| 3 | Hero | `src/components/hero/CinematicHero.jsx` | Canvas frame-sequence scrub | 250vh sticky canvas | Strong but isolated | N/A | ScrollTrigger scrub, fade-out | Hero config from CMS | None | 6/10 | Major Refactor |
| 4 | Foundation/About | `src/components/sections/FoundationSection.jsx` | Brand statement, proof points | Centered text, -100vh margin | Weak — plain text block | N/A | CSS keyframe fade-up | Homepage config headings | i18n | 4/10 | UI Rebuild |
| 5 | Capabilities Marquee | `src/components/sections/CapabilitiesMarqueeSection.jsx` | Featured + supporting caps + WorkflowFlow | 1.4fr/1fr grid + tags | Moderate — unique layout | Featured card + small items | None (static) | CMS marquee config | i18n | 6/10 | Major Refactor |
| 6 | Services | `src/components/sections/ServicesSection.jsx` | Service cards with icon+title+desc+flow | 3-col grid | Monotonous — same card pattern | Surface card, purple hover | IntersectionObserver fade-up | CMS services | i18n | 3/10 | UI Rebuild |
| 7 | Automation Showcase | `src/components/sections/AutomationShowcaseSection.jsx` | Pipeline visual + integrations | WorkflowFlow + pill tags | Moderate — CSS-only flow | Pill tags | None (static) | None (hardcoded) | Inline ternary | 5/10 | Major Refactor |
| 8 | Industries/Solutions | `src/components/sections/IndustriesSection.jsx` | Industry cards with focus areas | 4-col grid | Monotonous — same card pattern | Surface card, gold hover | IntersectionObserver fade-up | CMS industries | i18n | 3/10 | UI Rebuild |
| 9 | Partners | `src/components/sections/PartnersTrustSection.jsx` | Partner logos with links | Auto-fit grid | Weak — small logo boxes | Small card with logo frame | IntersectionObserver fade-up | CMS partners | i18n | 4/10 | Major Refactor |
| 10 | Case Studies | `src/components/sections/CaseStudiesSection.jsx` | Featured case study cards | 3-col grid | Moderate — story format | Surface card, gold hover | IntersectionObserver fade-up | CMS case studies | i18n | 5/10 | Major Refactor |
| 11 | Insights | `src/components/sections/InsightsSection.jsx` | Article preview cards + CTA link | 3-col grid | Monotonous — same card pattern | Surface card, purple hover | IntersectionObserver fade-up | CMS insights API | i18n | 4/10 | UI Rebuild |
| 12 | Careers | `src/components/sections/CareersSection.jsx` | Career category cards + CTA block | 4-col grid + CTA block | Weak — hardcoded, EN-only cards | Surface card, purple hover | IntersectionObserver fade-up | CMS jobs (partial) | i18n (partial) | 3/10 | UI Rebuild |
| 13 | Contact/CTA | `src/components/sections/ContactSection.jsx` | Contact form with validation | Centered, 52rem max | Moderate — functional form | Form wrapper card | IntersectionObserver fade-up | CMS inquiry types | i18n | 5/10 | Major Refactor |
| 14 | Footer | `src/components/Footer.jsx` | Links, CTA band, brand, legal | 4-col grid + CTA band | Good — has CTA band + accent line | N/A | None | CMS site settings | i18n | 6/10 | Light Refactor |
| 15 | Floating Social Bar | `src/components/FloatingSocialBar.jsx` | WhatsApp/Telegram/Email/LinkedIn | Fixed right pill | Good — platform colors | N/A | Hover scale + label | CMS site settings | None | 7/10 | Keep |
| 16 | Network Background | `src/components/InteractiveNetworkBackground.jsx` | Cursor-reactive node network | Fixed full-screen canvas | Subtle, good ambient | N/A | rAF node animation | None | None | 6/10 | Light Refactor |
| 17 | Mouse Glow | `src/components/MouseGlow.jsx` | Cursor-following ambient glow | Fixed radial gradient | Subtle, good ambient | N/A | CSS var tracking | None | None | 7/10 | Keep |
| 18 | Mouse Depth Card | Global CSS class | 3D tilt on hover for cards | Per-card perspective | Good — adds depth | N/A | CSS transform on hover | None | None | 6/10 | Light Refactor |
| 19 | Magnetic Button | `src/components/MagneticButton.jsx` | Magnetic cursor attraction | Per-button transform | Good — premium feel | N/A | CSS var tracking | None | None | 8/10 | Keep |
| 20 | Magnetic Link | `src/components/MagneticLink.jsx` | Magnetic cursor attraction for links | Per-link transform | Good — premium feel | N/A | CSS var tracking | None | None | 8/10 | Keep |
| 21 | WorkflowFlow | `src/components/WorkflowFlow.jsx` | CSS-only node/connector visual | Horizontal chain | Moderate — clean but static | Node + connector | None (static) | None | None | 5/10 | Major Refactor |
| 22 | Mobile Navigation | `src/components/Header.jsx` (mobile portion) | Hamburger menu, dropdown | Absolute positioned panel | Good — pill dropdown | N/A | Opacity + transform | CMS nav links | i18n | 6/10 | Light Refactor |

**Components examined:** 22  
**UI Rebuild needed:** 6 (Foundation, Services, Industries, Insights, Careers, Contact)  
**Major Refactor:** 6 (Hero, Capabilities, Automation, Partners, Case Studies, WorkflowFlow)  
**Light Refactor:** 5 (App Shell, Header, Footer, Network BG, Mobile Nav)  
**Keep:** 4 (Floating Social, Mouse Glow, Magnetic Button, Magnetic Link)

---

## 4. Current Visual Weaknesses

### 4.1 Card Monotony
Every content section (Services, Industries, Insights, Careers, Case Studies) uses the **exact same card pattern**:
- `background-color: var(--color-surface-card)`
- `border: 1px solid var(--color-border)`
- `border-radius: var(--radius-xl)`
- `padding: 2.5rem`
- Hover: `translateY(-0.375rem)` + `box-shadow: 0 1rem 3rem var(--color-purple-glow)`

There is zero visual differentiation between a service card, an industry card, an insight card, and a career card. The site feels like a template repeated 5 times.

### 4.2 Animation Monotony
Every section uses the **same IntersectionObserver pattern**:
- `opacity: 0` → `opacity: 1`
- `transform: translateY(1.25rem)` → `translateY(0)`
- `transition: opacity 0.6s ease-out, transform 0.6s ease-out`
- Stagger via `transitionDelay: ${index * 100}ms`

No scroll-driven scrubbing, no clip reveals, no mask reveals, no scale reveals, no pinned sections. The entire site below the hero is a sequence of fade-up cards.

### 4.3 No Smooth Scroll
The site uses native `scroll-behavior: auto`. There is no Lenis or any smooth scroll library. Scrolling feels jumpy and disconnected from the cinematic hero.

### 4.4 No Ambient Layering
The DNA reference has 5 fixed cinematic layers: `#ambient`, `#glow`, `#vignette`, `#grain`, `#progress`. SidrahSoft has:
- `InteractiveNetworkBackground` — a canvas node network (subtle, good)
- `MouseGlow` — a cursor glow (subtle, good)
- No vignette, no film grain, no scroll progress bar, no ambient color tweening

### 4.5 No Section Mood Differentiation
All sections use the same `--color-bg` or `--color-bg-elevated` with a `--gradient-section` or `--gradient-section-gold` radial. The visual difference between sections is negligible. There are no per-section color moods, no ambient transitions, no sense of journey.

### 4.6 Typography Is System-Only
The site uses `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`. No custom display fonts. No Arabic-specific display fonts. Headlines use `font-weight: 300` with `letter-spacing: -0.02em` — thin and generic. The DNA reference specifies El Messiri (Arabic display) + Tajawal (Arabic body) and a distinct display font for English.

### 4.7 No Header Hide/Show
The header shrinks on scroll but never hides. The DNA reference hides the header when scrolling down and reveals it when scrolling up, giving more immersive viewport space.

### 4.8 No Scroll Progress Indicator
There is no visual scroll progress bar. The DNA reference has a fixed `#progress` bar at the top.

### 4.9 Foundation Section Is Weak
The Foundation/About section is a centered text block with `margin-top: -100vh` (overlapping the hero). It uses CSS keyframe animations (not ScrollTrigger), has no visual treatment, and feels like a placeholder.

### 4.10 Partners Section Lacks Premium Feel
Partner logos are in small boxes with `min-height: 9rem`. The logos are tiny (`max-height: 2.75rem`). There is no premium framing, no hover elegance, no trust signals beyond a text note.

### 4.11 Careers Cards Are Hardcoded and English-Only
The `careerCards` array in `CareersSection.jsx` is hardcoded in English. The CTA block heading "Don't See The Right Role?" is not translated. This is a significant i18n gap.

### 4.12 Automation Showcase Is Static
The `AutomationShowcaseSection` uses a CSS-only `WorkflowFlow` with static nodes. There is no scroll-driven progression, no animated data flow, no interactive diagram. It's a labeled chain of boxes.

### 4.13 No Pinned Sections
No section uses GSAP ScrollTrigger pinning. The entire page is a linear scroll with fade-up reveals. There are no moments where the scroll pauses to tell a story.

### 4.14 Contact Section Is Functional But Not Cinematic
The contact form is a standard form in a card. No cinematic background, no form reveal animation, no map integration, no trust signals alongside the form.

---

## 5. Reference DNA Mapping

| # | Reference DNA Concept | SidrahSoft Target | Proposed Adaptation | Complexity | Performance Cost | Recommendation |
|---|----------------------|-------------------|---------------------|------------|-----------------|----------------|
| 1 | Lenis smooth scrolling | All public routes | Install `lenis` npm package, wrap in `SmoothScrollProvider`, integrate with ScrollTrigger via `lenis.on('scroll', ScrollTrigger.update)` | Low | Low — rAF-based, cancels native scroll | **Implement** — foundational for all other motion |
| 2 | GSAP + ScrollTrigger integration | Already installed (gsap 3.13) | Register ScrollTrigger plugin, create centralized motion utilities, add route-change cleanup via `ScrollTrigger.refresh()` | Low | Low — already in bundle | **Implement** — extend existing usage |
| 3 | Ambient per-section color transitions | Body background or fixed layer | Fixed `#ambient` div, GSAP timeline tweens `background-color` per section via ScrollTrigger `onEnter`/`onLeave` | Medium | Low — CSS color tween | **Implement** — highest visual impact per effort |
| 4 | Global glow | Fixed layer behind content | Fixed radial gradient that shifts position/color with scroll progress | Low | Low | **Implement** — complements existing MouseGlow |
| 5 | Vignette | Fixed overlay | Fixed `pointer-events: none` div with `radial-gradient` darkening edges | Low | Negligible | **Implement** — adds cinematic depth |
| 6 | Film grain | Fixed overlay | CSS `background-image` with SVG noise, `opacity: 0.03`, optional `mix-blend-mode: overlay` | Low | Low — static image | **Implement** — subtle but transformative |
| 7 | Scroll progress bar | Fixed top bar | Fixed 2px bar, `scaleX` driven by ScrollTrigger progress | Low | Negligible | **Implement** — simple, high value |
| 8 | Header hide/show behavior | Header component | Track scroll direction, `translateY(-100%)` on down, `translateY(0)` on up, with 300ms transition | Low | Negligible | **Implement** — more immersive viewport |
| 9 | Cinematic typography | All headings | Load El Messiri (Arabic display) + Tajawal (Arabic body) via Google Fonts, add display font for English (e.g., Space Grotesk or Outfit) | Low | Low — font swap | **Implement** — instant visual upgrade |
| 10 | Section numbering | Section headings | Add `01`, `02`, `03` prefix to section eyebrows, styled in gold/ copper | Low | Negligible | **Implement** — editorial sophistication |
| 11 | Large editorial headlines | All section headings | Increase `clamp()` ranges, use `font-weight: 200` for display, `clamp(2.5rem, 6vw, 5rem)` for hero-level | Low | Negligible | **Implement** — visual hierarchy upgrade |
| 12 | Sticky sections | Foundation, Automation | `position: sticky; top: 0` with scroll-driven content changes inside | Medium | Low | **Implement selectively** — Foundation + Automation only |
| 13 | Pinned sections | Automation Showcase, Contact | GSAP `ScrollTrigger pin: true` with scrubbed timeline | Medium | Medium — extends scroll height | **Implement selectively** — 2 sections max |
| 14 | Canvas frame sequences | Hero (already implemented) | Keep existing, optimize frame count, add aura/motes/sheen layers | High | High — frame loading | **Enhance existing** — add layers, don't rebuild |
| 15 | Caption reveal windows | Hero, Case Studies | Text that fades in/out at specific scroll progress points | Medium | Low | **Implement** — for hero overlay text |
| 16 | Aura | Hero layer | Radial gradient pulse behind product, `@keyframes` scale/opacity | Low | Low | **Implement** — hero polish |
| 17 | Motes | Hero layer | 15-20 small particles drifting via CSS animation | Low | Low | **Implement** — hero polish |
| 18 | Sheen | Hero layer | Diagonal gradient sweep, 8s loop, `mix-blend-mode: screen` | Low | Low | **Implement** — hero polish |
| 19 | Pointer-based parallax | Hero (already partial) | Already have `mouse-depth-card` and canvas wrapper parallax. Extend to hero text layers | Low | Low | **Enhance existing** |
| 20 | Ken Burns effects | Case study images, Partner section | Slow `scale(1.1) + translate` on hover or scroll-driven | Low | Low | **Implement selectively** — case study covers |
| 21 | Dim/wash CTA transitions | Contact section | Background dims/washes to focused state as form enters viewport | Medium | Low | **Implement** — cinematic CTA |
| 22 | Editorial grids | Services, Insights | Asymmetric grids, varying column spans, not uniform 3-col | Medium | Negligible | **Implement** — breaks monotony |
| 23 | Premium card hover | All card types | Vary hover per card type: lift, glow, border-trace, image-zoom, content-shift | Medium | Low | **Implement** — card system core |
| 24 | Large spacing and visual breathing room | All sections | Increase section padding from `8rem` to `10-12rem`, increase card gaps from `2rem` to `3-4rem` | Low | Negligible | **Implement** — instant premium feel |
| 25 | Seamless section handoff | Between all sections | Ambient color tween + border fade + scroll-driven opacity creates visual continuity | Medium | Low | **Implement** — via ambient system |

---

## 6. Recommended Full-Site Visual Direction

The new visual identity for SidrahSoft moves away from "generic dark website" to **"cinematic technology studio"**:

- **Base palette:** Dark plum (not pure black) with depth layers
- **Primary accent:** Warm gold (existing, refined)
- **Secondary accent:** Purple (existing, deepened)
- **Tertiary accents:** Copper (warmth), Soft blue (technology signal)
- **Section moods:** Each section has a subtle color temperature shift
- **Surfaces:** Mix of glass, solid, and gradient-edge cards
- **Typography:** Custom display fonts for both EN and AR
- **Motion:** Lenis smooth scroll + GSAP ScrollTrigger vocabulary
- **Atmosphere:** Film grain, vignette, ambient glow, progress bar

The result should feel like a **technology company that understands craft** — not a startup template, not a luxury brand, but something in between that commands respect.

---

## 7. Color System

### 7.1 Proposed Design Tokens

```css
:root {
  /* ── Base Backgrounds (dark plum, not pure black) ── */
  --color-bg: #0a0b10;           /* deepest base — slight plum undertone */
  --color-bg-elevated: #12101c;  /* one step up — plum tinted */
  --color-bg-raised: #1a1530;    /* raised surface — stronger plum */
  --color-bg-deep: #07080c;      /* below base — for footer/vignette */
  --color-bg-input: #08090f;     /* form inputs */

  /* ── Section-Specific Surfaces ── */
  --section-bg-hero: #0a0b10;
  --section-bg-foundation: #0e0c16;    /* warm dark — brand statement */
  --section-bg-capabilities: #12101c;  /* elevated plum */
  --section-bg-services: #0c0a14;      /* deeper, focused */
  --section-bg-automation: #100e1a;    /* tech-forward, slightly blue */
  --section-bg-industries: #0e0c16;    /* warm, gold-tinted */
  --section-bg-partners: #12101c;      /* trust, elevated */
  --section-bg-casestudies: #0a0b10;   /* base — let cards shine */
  --section-bg-insights: #100e1a;      /* editorial, slightly blue */
  --section-bg-careers: #0e0c16;      /* warm, inviting */
  --section-bg-contact: #0c0a14;      /* focused, dim */
  --section-bg-footer: #07080c;       /* deepest — visual closure */

  /* ── Primary Gold (refined) ── */
  --color-gold: #c9a96e;
  --color-gold-hover: #d8b87a;
  --color-gold-soft: rgba(201, 169, 110, 0.08);
  --color-gold-border: rgba(201, 169, 110, 0.25);
  --color-gold-glow: rgba(201, 169, 110, 0.15);

  /* ── Secondary Purple (deepened) ── */
  --color-purple: #8b5ca6;
  --color-purple-deep: #6d4a8a;
  --color-purple-soft: rgba(139, 92, 166, 0.10);
  --color-purple-border: rgba(139, 92, 166, 0.25);
  --color-purple-glow: rgba(139, 92, 166, 0.15);

  /* ── Tertiary Copper (warmth) ── */
  --color-copper: #b87333;
  --color-copper-soft: rgba(184, 115, 51, 0.08);
  --color-copper-border: rgba(184, 115, 51, 0.25);
  --color-copper-glow: rgba(184, 115, 51, 0.12);

  /* ── Tech Blue Accent (sparingly) ── */
  --color-tech-blue: #4a9eff;
  --color-tech-blue-soft: rgba(74, 158, 255, 0.08);
  --color-tech-blue-border: rgba(74, 158, 255, 0.25);
  --color-tech-blue-glow: rgba(74, 158, 255, 0.12);

  /* ── Card Surfaces (varied) ── */
  --card-surface-glass: rgba(242, 242, 242, 0.04);
  --card-surface-glass-hover: rgba(242, 242, 242, 0.07);
  --card-surface-solid: #161420;
  --card-surface-solid-hover: #1c1730;
  --card-surface-premium: linear-gradient(180deg, rgba(139, 92, 166, 0.04), rgba(242, 242, 242, 0.02));
  --card-surface-gold: linear-gradient(180deg, rgba(201, 169, 110, 0.03), rgba(242, 242, 242, 0.02));

  /* ── Borders ── */
  --color-border: rgba(242, 242, 242, 0.08);
  --color-border-subtle: rgba(242, 242, 242, 0.05);
  --color-border-strong: rgba(242, 242, 242, 0.12);
  --color-border-solid: #1e1c2e;
  --color-border-gradient: linear-gradient(135deg, rgba(139, 92, 166, 0.3), rgba(201, 169, 110, 0.2), transparent);

  /* ── Text Hierarchy ── */
  --color-text-primary: #f0eef4;     /* warm white — not pure */
  --color-text-secondary: #9088a0;   /* muted purple-gray */
  --color-text-muted: #6b6580;       /* deeper muted */
  --color-text-dim: #4a4458;         /* dimmest */
  --color-text-inverse: #0a0b10;

  /* ── Status (preserved) ── */
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  --color-info: #3b82f6;

  /* ── Glow Colors ── */
  --glow-purple: 0 0 3rem rgba(139, 92, 166, 0.12);
  --glow-gold: 0 0 3rem rgba(201, 169, 110, 0.10);
  --glow-copper: 0 0 2.5rem rgba(184, 115, 51, 0.08);
  --glow-tech: 0 0 2.5rem rgba(74, 158, 255, 0.08);

  /* ── Gradient Combinations ── */
  --gradient-ambient-default: radial-gradient(ellipse 80% 50% at 50% 0%, rgba(139, 92, 166, 0.04), transparent 70%);
  --gradient-ambient-gold: radial-gradient(ellipse 80% 50% at 50% 0%, rgba(201, 169, 110, 0.03), transparent 70%);
  --gradient-ambient-tech: radial-gradient(ellipse 80% 50% at 50% 0%, rgba(74, 158, 255, 0.03), transparent 70%);
  --gradient-ambient-copper: radial-gradient(ellipse 80% 50% at 50% 0%, rgba(184, 115, 51, 0.03), transparent 70%);
  --gradient-card-edge: linear-gradient(135deg, rgba(139, 92, 166, 0.15), transparent 50%, rgba(201, 169, 110, 0.08));
  --gradient-section-transition: linear-gradient(180deg, transparent, rgba(139, 92, 166, 0.02), transparent);
}
```

### 7.2 Section Color Mood Map

| Section | Background | Ambient Gradient | Accent | Mood |
|---------|-----------|-----------------|--------|------|
| Hero | `#0a0b10` | None (canvas-driven) | Gold + Purple | Cinematic, awakening |
| Foundation | `#0e0c16` | `--gradient-ambient-gold` | Gold | Warm, brand statement |
| Capabilities | `#12101c` | `--gradient-ambient-default` | Purple | Elevated, confident |
| Services | `#0c0a14` | `--gradient-ambient-default` | Purple | Focused, technical |
| Automation | `#100e1a` | `--gradient-ambient-tech` | Tech Blue | Forward, intelligent |
| Industries | `#0e0c16` | `--gradient-ambient-copper` | Copper + Gold | Warm, industry |
| Partners | `#12101c` | `--gradient-ambient-gold` | Gold | Trust, established |
| Case Studies | `#0a0b10` | `--gradient-ambient-default` | Purple + Gold | Results, proof |
| Insights | `#100e1a` | `--gradient-ambient-tech` | Tech Blue + Purple | Editorial, thoughtful |
| Careers | `#0e0c16` | `--gradient-ambient-copper` | Copper + Gold | Warm, inviting |
| Contact | `#0c0a14` | `--gradient-ambient-default` | Purple | Focused, converging |
| Footer | `#07080c` | `--gradient-ambient-gold` | Gold (dim) | Closure, warm exit |

---

## 8. Typography System

### 8.1 Font Selection

| Role | English Font | Arabic Font | Weights | Source |
|------|-------------|-------------|---------|--------|
| Display (headlines) | Space Grotesk | El Messiri | 300, 400, 500, 700 | Google Fonts |
| Body | Inter | Tajawal | 400, 500, 700 | Google Fonts |
| Eyebrow/Label | Inter | Tajawal | 500 | Google Fonts |

**Rationale:**
- **Space Grotesk:** Geometric, modern, tech-adjacent without being sterile. Pairs well with gold accents on dark backgrounds.
- **El Messiri:** Arabic display font with calligraphic character but modern proportions. Well-suited for editorial headlines.
- **Inter:** Clean, highly legible body font with excellent screen rendering.
- **Tajawal:** Modern Arabic body font, clean and readable, pairs well with El Messiri.

### 8.2 Font Loading Strategy

```html
<!-- Preconnect for performance -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- Display: Space Grotesk + El Messiri -->
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;700&family=El+Messiri:wght@400;500;600;700&display=swap" rel="stylesheet">

<!-- Body: Inter + Tajawal -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet">
```

### 8.3 Typography Scale

```css
:root {
  /* Font families */
  --font-display: 'Space Grotesk', 'El Messiri', system-ui, sans-serif;
  --font-body: 'Inter', 'Tajawal', system-ui, sans-serif;
  
  /* Arabic-specific overrides */
  --font-display-ar: 'El Messiri', 'Space Grotesk', system-ui, sans-serif;
  --font-body-ar: 'Tajawal', 'Inter', system-ui, sans-serif;
}

[dir='rtl'] {
  --font-display: var(--font-display-ar);
  --font-body: var(--font-body-ar);
}

/* Heading Scale */
--font-size-display: clamp(2.75rem, 6vw, 5rem);     /* Hero headline */
--font-size-h1: clamp(2.25rem, 4.5vw, 3.75rem);     /* Section headlines */
--font-size-h2: clamp(1.75rem, 3.5vw, 2.75rem);     /* Sub-headlines */
--font-size-h3: clamp(1.375rem, 2vw, 1.75rem);      /* Card titles */
--font-size-h4: clamp(1.125rem, 1.5vw, 1.375rem);   /* Small headings */

/* Body Scale */
--font-size-body-lg: 1.125rem;    /* Large body / descriptions */
--font-size-body: 1rem;           /* Standard body */
--font-size-body-sm: 0.875rem;    /* Small body / metadata */
--font-size-caption: 0.75rem;     /* Captions / eyebrows */

/* Eyebrow Style */
--eyebrow-font-size: 0.75rem;
--eyebrow-font-weight: 500;
--eyebrow-letter-spacing: 0.12em;
--eyebrow-text-transform: uppercase;
--eyebrow-color: var(--color-gold);  /* Default eyebrow in gold */

/* Line Heights */
--line-height-display: 1.05;
--line-height-heading: 1.15;
--line-height-body: 1.6;
--line-height-relaxed: 1.7;
```

### 8.4 Arabic Typography Rules

- **No negative letter-spacing on Arabic.** Already handled via `[dir='rtl']` override.
- **El Messiri for display only** — it has calligraphic character that works for headlines but is too decorative for body text.
- **Tajawal for body** — clean, modern, highly legible.
- **Headline line-height for Arabic:** Use `1.2` minimum (vs `1.05` for English) to account for Arabic's taller character forms.
- **Prevent headline breaking:** Use `text-wrap: balance` on Arabic headlines, avoid `hyphens`, ensure `word-break: keep-all` for short Arabic phrases.
- **Eyebrow letter-spacing:** Set to `0` for Arabic (already done in current code).

---

## 9. Spacing and Layout System

### 9.1 Container Widths

```css
--container-narrow: 48rem;    /* 768px — text-focused sections */
--container-standard: 64rem;  /* 1024px — standard content */
--container-wide: 80rem;      /* 1280px — card grids */
--container-full: 90rem;      /* 1440px — max page width */
```

### 9.2 Section Spacing

| Viewport | Section Padding (top/bottom) | Section Padding (left/right) |
|----------|------------------------------|------------------------------|
| Desktop (≥1024px) | `10rem` (160px) | `2rem` (32px) |
| Tablet (768-1023px) | `7rem` (112px) | `1.5rem` (24px) |
| Mobile (≤767px) | `5rem` (80px) | `1.25rem` (20px) |

**Rationale:** Current sections use `8rem` top/bottom. Increasing to `10rem` creates more visual breathing room and a more premium feel. The DNA reference emphasizes large spacing as a core quality signal.

### 9.3 Card Gaps

| Layout | Gap |
|--------|-----|
| 3-column grid | `2.5rem` (40px) |
| 4-column grid | `2rem` (32px) |
| 2-column grid | `3rem` (48px) |
| Asymmetric/Editorial | `2rem - 4rem` (varied) |
| Mobile (all) | `1.5rem` (24px) |

### 9.4 Large-Card System

For sections that use large feature cards (Capabilities featured, Case Studies):
- **Min-height:** `20rem` (320px) desktop, `auto` mobile
- **Padding:** `3rem` (48px) desktop, `2rem` (32px) mobile
- **Border-radius:** `var(--radius-2xl)` (1.25rem)

### 9.5 Grid Behavior

| Section | Desktop | Tablet | Mobile |
|---------|---------|--------|--------|
| Services | 3-col → asymmetric (see §11) | 2-col | 1-col |
| Industries | 4-col → 2x2 featured + list | 2-col | 1-col |
| Case Studies | 3-col → 1 large + 2 small | 2-col | 1-col |
| Insights | 3-col → 1 featured + 2 compact | 2-col | 1-col |
| Careers | 4-col → 2x2 | 2-col | 1-col |
| Partners | Auto-fit → marquee/carousel | 3-col | 2-col |

### 9.6 Max Text Widths

| Content Type | Max Width |
|-------------|-----------|
| Headlines | `56rem` (896px) |
| Descriptions | `48rem` (768px) |
| Body text | `42rem` (672px) |
| Card descriptions | `32rem` (512px) |
| Eyebrow | Auto (inline) |

### 9.7 Negative Space Strategy

- **Section headers:** `6rem` margin-bottom from heading to content
- **Between card groups:** `4rem` gap between different card clusters
- **After CTAs:** `3rem` breathing room below CTA buttons
- **Hero-to-content transition:** The `-100vh` margin on Foundation creates a natural overlap — preserve this but add a scroll-driven fade instead of CSS keyframes
- **Intentional emptiness:** Some sections should have large empty areas on one side (asymmetric layout) to create editorial tension

---

## 10. New Card Design System

### 10.1 Card Type Catalog

| # | Card Type | Purpose | Size | Aspect Ratio | Background | Border | Radius | Shadow | Hover | Scroll Reveal | Mobile | Content Hierarchy | Used By |
|---|-----------|---------|------|-------------|------------|--------|--------|--------|-------|---------------|--------|------------------|---------|
| 1 | **Editorial Card** | Text-focused content with strong typography | Variable (16:9 to 4:3) | Flexible | `--card-surface-glass` | `--color-border` | `--radius-2xl` | `--shadow-card` | Border-trace + slight lift | Fade + lift | Full width, reduced padding | Eyebrow → Title → Body | Foundation, Insights (featured) |
| 2 | **Cinematic Media Card** | Image/video-led content with overlay text | 16:9 or 21:9 | Fixed | Image/gradient | None (edge gradient) | `--radius-2xl` | `--shadow-elevated` | Image zoom + overlay darken | Clip reveal | Stack: image → text | Image → Eyebrow → Title | Case Studies (large) |
| 3 | **Feature Card** | Icon + title + description (compact) | 1:1 or 4:3 | Fixed | `--card-surface-solid` | `--color-border` | `--radius-xl` | `--shadow-card` | Icon scale + border glow | Stagger fade | Full width | Icon → Title → Description | Services (supporting) |
| 4 | **Service Spotlight Card** | Large service with flow steps | 3:2 | Fixed | `--card-surface-premium` | `--color-purple-border` | `--radius-2xl` | `--shadow-premium` | Border brighten + glow intensify | Scale reveal | Stack vertically | Icon → Title → Description → Flow | Services (featured) |
| 5 | **Metric Card** | Number + label (results/proof) | 16:9 compact | Fixed | Transparent | Top border accent | `--radius-lg` | None | Number count-up | Fade + lift | Full width | Number (large) → Label | Case Studies (metrics), Foundation (proof points) |
| 6 | **Glass Surface Card** | Translucent content over textured bg | Variable | Flexible | `--card-surface-glass` with `backdrop-filter` | `--color-border-subtle` | `--radius-2xl` | `--shadow-card` | Surface brighten | Fade + lift | Solid bg (disable blur) | Title → Body | Contact form, Capabilities |
| 7 | **Gradient Edge Card** | Premium card with animated gradient border | 3:2 | Fixed | `--card-surface-solid` | `--color-border-gradient` (animated) | `--radius-xl` | `--shadow-premium` | Gradient shift + glow | Scale reveal | Full width | Title → Body → CTA | Careers (featured), Partners (premium) |
| 8 | **Large Project Card** | Case study with full visual + story | 16:9 to 2:1 | Fixed | Image/gradient + overlay | None | `--radius-2xl` | `--shadow-elevated` | Image zoom + content slide-up | Clip reveal | Stack: image → content | Image → Industry → Title → Story → Metrics | Case Studies (homepage featured) |
| 9 | **Compact Insight Card** | Article preview with category + title | 4:3 | Fixed | `--card-surface-glass` | Top accent line | `--radius-xl` | `--shadow-card` | Accent line brighten + lift | Stagger fade | Full width | Category → Title → Excerpt → Date | Insights (grid items) |
| 10 | **Premium CTA Card** | Call-to-action with gradient + button | Variable (wide) | Flexible | `--card-surface-premium` | `--color-border-gradient` | `--radius-2xl` | `--shadow-premium` | Glow pulse + button magnetic | Scale reveal | Full width, stacked | Heading → Subtext → Button | Contact CTA, Careers CTA, Footer CTA |

### 10.2 Card Design Principles

1. **Not all glassmorphism:** Only Glass Surface Card and Compact Insight Card use `backdrop-filter`. Others use solid or gradient surfaces.
2. **Not all same size:** Editorial cards are variable, Media cards are 16:9, Feature cards are 1:1, Project cards are large.
3. **Not hover-dependent:** All content is visible at rest. Hover adds delight, not information.
4. **Varied internal padding:** Feature cards: `1.5rem`. Spotlight: `3rem`. Editorial: `2.5rem`. Glass: `2rem`.
5. **Section-appropriate:** Each section uses 1-2 card types, never all the same.
6. **Mobile degradation:** Glass cards become solid on mobile (disable `backdrop-filter`). Media cards stack image above text.

---

## 11. Section-by-Section New Experience

### 11.1 Hero

| Attribute | Value |
|-----------|-------|
| **Goal** | Cinematic first impression — "this is a premium technology studio" |
| **Main message** | SidrahSoft builds intelligent digital systems |
| **Proposed layout** | Full-viewport canvas (existing) + overlay text layers (new) |
| **Heading** | Brand tagline (CMS-configurable, bilingual) |
| **Heading size** | `--font-size-display` (clamp 2.75-5rem) |
| **Card type** | None — cinematic canvas with text overlay |
| **Background** | Canvas frame sequence (existing) |
| **Colors** | Canvas-driven (gold → purple → copper progression) |
| **Scroll behavior** | Sticky canvas, scrubbed frames (existing), fade-out at 85% (existing) |
| **Animation entrance** | Text layers: fade + lift with stagger (eyebrow → headline → subtext → CTA) |
| **Animation exit** | Canvas fades at 85%, text layers fade at 70% |
| **Hover behavior** | 3D pointer parallax on text layers (extend existing canvas parallax) |
| **Mobile version** | Mobile frame set (existing), reduced text size, no parallax |
| **RTL behavior** | Text aligns right, parallax direction mirrors |
| **Required assets** | Existing hero frames (desktop + mobile), aura/motes/sheen layers (CSS-generated) |
| **CMS dependency** | Hero config (enabled, frame sets) |
| **Implementation complexity** | Medium — add text overlay + aura/motes/sheen to existing canvas |
| **Recommendation** | Enhance existing — do NOT rebuild the canvas engine |

**New elements to add:**
- Hero text overlay: eyebrow ("01 — SidrahSoft"), headline, subtext, CTA button
- Aura: radial gradient pulse behind canvas (CSS keyframe)
- Motes: 15-20 small particles (CSS animation, `prefers-reduced-motion` disabled)
- Sheen: diagonal gradient sweep (CSS keyframe, 8s loop)
- Caption reveal windows: text that appears at specific scroll progress points

### 11.2 Foundation/About

| Attribute | Value |
|-----------|-------|
| **Goal** | Strong brand statement — not a generic "about us" |
| **Main message** | We build systems that perform, scale, and endure |
| **Proposed layout** | Editorial: left-aligned large headline + right-aligned proof points, asymmetric |
| **Heading** | "Systems that perform, scale, and endure" (CMS-configurable) |
| **Heading size** | `--font-size-h1` (clamp 2.25-3.75rem), `font-weight: 200` |
| **Card type** | Metric Card (for proof points) |
| **Background** | `--section-bg-foundation` + `--gradient-ambient-gold` |
| **Colors** | Gold accent, warm dark background |
| **Scroll behavior** | Sticky for first 50vh, then releases to next section |
| **Animation entrance** | Mask reveal on headline (clip-path), stagger on proof points |
| **Animation exit** | Fade + slight scale down as section leaves viewport |
| **Hover behavior** | Proof point cards: border-trace + number count-up |
| **Mobile version** | Single column, centered, reduced sticky |
| **RTL behavior** | Headline right-aligned, proof points reverse order |
| **Required assets** | None (CSS-driven) |
| **CMS dependency** | Homepage config headings (foundation) |
| **Implementation complexity** | Medium — sticky + mask reveal + asymmetric layout |
| **Recommendation** | UI Rebuild — current is a plain centered text block |

### 11.3 Capabilities Marquee

| Attribute | Value |
|-----------|-------|
| **Goal** | Show breadth of capabilities without a generic grid |
| **Main message** | "What we build" — from core to supporting |
| **Proposed layout** | Editorial: 1 large featured card (left) + 4 compact feature cards (right grid) + tag row + WorkflowFlow |
| **Heading** | "What We Build" (CMS-configurable) |
| **Heading size** | `--font-size-h2` (clamp 1.75-2.75rem) |
| **Card type** | Service Spotlight Card (featured) + Feature Card (supporting) |
| **Background** | `--section-bg-capabilities` + `--gradient-ambient-default` |
| **Colors** | Purple accent |
| **Scroll behavior** | Standard scroll, staggered card reveals |
| **Animation entrance** | Featured: scale reveal. Supporting: stagger fade + lift |
| **Animation exit** | None (natural scroll) |
| **Hover behavior** | Featured: border brighten + glow. Supporting: icon scale + border glow |
| **Mobile version** | Single column: featured → supporting → tags → flow |
| **RTL behavior** | Featured card on right, supporting on left |
| **Required assets** | None (CSS-driven, existing WorkflowFlow) |
| **CMS dependency** | CMS marquee config |
| **Implementation complexity** | Medium — restructure grid + new card styles |
| **Recommendation** | Major Refactor — keep data/CMS, rebuild layout and cards |

### 11.4 Services

| Attribute | Value |
|-----------|-------|
| **Goal** | Present services as premium offerings, not a checklist |
| **Main message** | "Services that transform operations" |
| **Proposed layout** | Asymmetric editorial grid: 1 featured (large, top-left) + 4 compact (2x2, right) OR alternating wide/compact rows |
| **Heading** | CMS-configurable |
| **Heading size** | `--font-size-h1` (clamp 2.25-3.75rem) |
| **Card type** | Service Spotlight Card (featured) + Feature Card (compact) |
| **Background** | `--section-bg-services` + `--gradient-ambient-default` |
| **Colors** | Purple accent, deeper background |
| **Scroll behavior** | Pinned for 100vh with horizontal card progression OR standard scroll with staggered reveals |
| **Animation entrance** | Featured: clip reveal. Compact: stagger fade + lift |
| **Animation exit** | If pinned: horizontal slide-out. If standard: natural |
| **Hover behavior** | Spotlight: border brighten + flow step highlight. Feature: icon scale + glow |
| **Mobile version** | Single column, all Feature Cards, no pinning |
| **RTL behavior** | Grid mirrors, flow arrows reverse (already handled) |
| **Required assets** | Service icons (existing or CMS-provided) |
| **CMS dependency** | CMS services API |
| **Implementation complexity** | High if pinned, Medium if standard |
| **Recommendation** | UI Rebuild — break the 3-col grid monotony entirely |

**Layout decision:** Start with asymmetric grid (no pinning) for v1. Add pinning in v2 if scroll testing supports it.

### 11.5 Automation Showcase

| Attribute | Value |
|-----------|-------|
| **Goal** | Show the AI automation pipeline as a living, scroll-driven diagram |
| **Main message** | "From intake to delivery — intelligent systems connecting every stage" |
| **Proposed layout** | Pinned section: pipeline stays fixed while scroll drives node activation + data flow animation |
| **Heading** | Existing bilingual headline |
| **Heading size** | `--font-size-h2` (clamp 1.75-2.75rem) |
| **Card type** | None — pipeline nodes are custom elements |
| **Background** | `--section-bg-automation` + `--gradient-ambient-tech` |
| **Colors** | Tech blue accent (primary), gold (output nodes), purple (process nodes) |
| **Scroll behavior** | Pinned for ~150vh. ScrollTrigger drives: node 1 active → connector animates → node 2 active → ... → all active |
| **Animation entrance** | Headline: mask reveal. Pipeline: nodes appear sequentially with scrub |
| **Animation exit** | Pin releases, section scrolls away |
| **Hover behavior** | Nodes expand slightly + show tooltip with detail |
| **Mobile version** | No pinning. Vertical stack with sequential fade-in. Connectors become vertical arrows. |
| **RTL behavior** | Pipeline flows right-to-left, connectors mirror |
| **Required assets** | None (CSS/SVG-driven) |
| **CMS dependency** | None (hardcoded bilingual content) |
| **Implementation complexity** | High — ScrollTrigger pin + scrubbed timeline |
| **Recommendation** | Major Refactor — transform from static CSS to scroll-driven pinned scene |

### 11.6 Industries/Solutions

| Attribute | Value |
|-----------|-------|
| **Goal** | Show industry expertise with visual distinction from Services |
| **Main message** | "Solutions built for your industry" |
| **Proposed layout** | 2-column: left = large industry showcase (alternating on scroll), right = compact list of all industries |
| **Heading** | CMS-configurable |
| **Heading size** | `--font-size-h1` (clamp 2.25-3.75rem) |
| **Card type** | Editorial Card (showcase) + Feature Card (list items) |
| **Background** | `--section-bg-industries` + `--gradient-ambient-copper` |
| **Colors** | Copper + Gold accent (differentiates from Services' purple) |
| **Scroll behavior** | Left showcase changes on scroll (scrubbed content swap), right list is static |
| **Animation entrance** | Showcase: clip reveal. List: stagger fade |
| **Animation exit** | Natural scroll |
| **Hover behavior** | List items: border-trace + copper glow. Showcase: subtle Ken Burns on bg |
| **Mobile version** | Single column: list items expand to full cards |
| **RTL behavior** | Showcase on right, list on left |
| **Required assets** | Industry icons (existing or CMS-provided) |
| **CMS dependency** | CMS industries API |
| **Implementation complexity** | Medium — scrubbed content swap + new layout |
| **Recommendation** | UI Rebuild — must look different from Services |

### 11.7 Partners

| Attribute | Value |
|-----------|-------|
| **Goal** | Premium trust signal — not a logo wall |
| **Main message** | "Trusted by organizations that value reliable technology" |
| **Proposed layout** | Horizontal marquee/carousel of large logo cards with subtle auto-scroll, OR 3-row staggered grid with large frames |
| **Heading** | CMS-configurable |
| **Heading size** | `--font-size-h2` (clamp 1.75-2.75rem) |
| **Card type** | Gradient Edge Card (premium partner card) |
| **Background** | `--section-bg-partners` + `--gradient-ambient-gold` |
| **Colors** | Gold accent |
| **Scroll behavior** | Marquee: continuous slow auto-scroll (pauses on hover). Grid: staggered reveal |
| **Animation entrance** | Cards: scale reveal with stagger |
| **Animation exit** | Natural |
| **Hover behavior** | Card: gradient edge animates, logo brightens, subtle lift |
| **Mobile version** | 2-col grid, smaller cards, no marquee |
| **RTL behavior** | Marquee direction reverses |
| **Required assets** | Partner logos (existing, CMS-provided) |
| **CMS dependency** | CMS partners API |
| **Implementation complexity** | Medium — marquee animation or restructured grid |
| **Recommendation** | Major Refactor — current logo boxes are too small and generic |

### 11.8 Case Studies

| Attribute | Value |
|-----------|-------|
| **Goal** | Show measurable results with cinematic project cards |
| **Main message** | "Selected digital transformation initiatives" |
| **Proposed layout** | 1 large featured project card (full-width, 16:9) + 2 compact cards below (side-by-side) |
| **Heading** | CMS-configurable |
| **Heading size** | `--font-size-h1` (clamp 2.25-3.75rem) |
| **Card type** | Large Project Card (featured) + Cinematic Media Card (compact) |
| **Background** | `--section-bg-casestudies` (base — let cards shine) |
| **Colors** | Purple + Gold accent |
| **Scroll behavior** | Featured card: pinned for 100vh with story reveal (Challenge → Solution → Outcome). Compact: standard scroll |
| **Animation entrance** | Featured: clip reveal + story steps fade in on scrub. Compact: stagger fade |
| **Animation exit** | Pin releases after story complete |
| **Hover behavior** | Compact: image zoom + overlay darken. Featured: no hover (pinned) |
| **Mobile version** | All cards stacked, no pinning, story steps as accordion |
| **RTL behavior** | Story arrows reverse, grid mirrors |
| **Required assets** | Case study images (CMS-provided or placeholder gradients) |
| **CMS dependency** | CMS case studies API |
| **Implementation complexity** | High — pinned story reveal + large card design |
| **Recommendation** | Major Refactor — transform from text-only cards to visual project cards |

### 11.9 Insights

| Attribute | Value |
|-----------|-------|
| **Goal** | Editorial article previews — not a blog grid |
| **Main message** | "Perspectives on software, automation, and AI" |
| **Proposed layout** | 1 featured (large, left, 60%) + 2 compact (right, stacked, 40%) |
| **Heading** | CMS-configurable |
| **Heading size** | `--font-size-h2` (clamp 1.75-2.75rem) |
| **Card type** | Editorial Card (featured) + Compact Insight Card (grid items) |
| **Background** | `--section-bg-insights` + `--gradient-ambient-tech` |
| **Colors** | Tech Blue + Purple accent |
| **Scroll behavior** | Standard scroll, staggered reveals |
| **Animation entrance** | Featured: mask reveal on title. Compact: stagger fade + accent line brighten |
| **Animation exit** | Natural |
| **Hover behavior** | Featured: border-trace + slight lift. Compact: accent line animates + lift |
| **Mobile version** | All Compact Insight Cards, single column |
| **RTL behavior** | Featured on right, compact on left |
| **Required assets** | Article images (CMS-provided or placeholder) |
| **CMS dependency** | CMS insights API |
| **Implementation complexity** | Medium — asymmetric layout + new card styles |
| **Recommendation** | UI Rebuild — break the 3-col grid, add editorial layout |

### 11.10 Careers

| Attribute | Value |
|-----------|-------|
| **Goal** | Careers as part of the brand identity, not a separate feeling |
| **Main message** | "Build the future with SidrahSoft" |
| **Proposed layout** | 2x2 grid of Gradient Edge Cards (career categories) + Premium CTA Card below |
| **Heading** | CMS-configurable |
| **Heading size** | `--font-size-h2` (clamp 1.75-2.75rem) |
| **Card type** | Gradient Edge Card (categories) + Premium CTA Card (CTA block) |
| **Background** | `--section-bg-careers` + `--gradient-ambient-copper` |
| **Colors** | Copper + Gold accent (warm, inviting) |
| **Scroll behavior** | Standard scroll, staggered reveals |
| **Animation entrance** | Cards: scale reveal with stagger. CTA: fade + lift |
| **Animation exit** | Natural |
| **Hover behavior** | Cards: gradient edge animates + glow. CTA: button magnetic (existing) |
| **Mobile version** | Single column, all cards full width |
| **RTL behavior** | Grid mirrors |
| **Required assets** | None (CSS-driven) |
| **CMS dependency** | CMS jobs API (partial), hardcoded career cards need i18n |
| **Implementation complexity** | Medium — new card types + fix hardcoded EN-only content |
| **Recommendation** | UI Rebuild — fix i18n gap, upgrade cards, match brand identity |

### 11.11 Contact / CTA

| Attribute | Value |
|-----------|-------|
| **Goal** | Strong lead generation experience with trust signals |
| **Main message** | "Start a conversation" |
| **Proposed layout** | 2-column: left = form (Glass Surface Card), right = trust signals (location, map, social, stats) |
| **Heading** | CMS-configurable |
| **Heading size** | `--font-size-h1` (clamp 2.25-3.75rem) |
| **Card type** | Glass Surface Card (form) + Metric Card (trust stats) |
| **Background** | `--section-bg-contact` + `--gradient-ambient-default`, dim/wash effect on enter |
| **Colors** | Purple accent (form focus), Gold accent (trust signals) |
| **Scroll behavior** | Dim/wash: background darkens as section enters viewport. Form reveal: fields slide in sequentially. |
| **Animation entrance** | Headline: mask reveal. Form: field-by-field stagger. Trust: fade + lift |
| **Animation exit** | Natural |
| **Hover behavior** | Form fields: focus glow (existing). Trust cards: border-trace |
| **Mobile version** | Single column: form → trust signals → map |
| **RTL behavior** | Form on right, trust on left |
| **Required assets** | Google Maps embed (existing URL from CMS) |
| **CMS dependency** | CMS inquiry types, site settings (contact info, location) |
| **Implementation complexity** | High — dim/wash + form reveal + 2-column layout + map embed |
| **Recommendation** | Major Refactor — from plain form to cinematic lead gen experience |

### 11.12 Footer

| Attribute | Value |
|-----------|-------|
| **Goal** | Strong visual closure — not just links |
| **Main message** | Final brand impression + CTA |
| **Proposed layout** | CTA band (existing, enhanced) + accent line (existing) + 4-col grid (existing, restyled) + bottom bar |
| **Heading** | Existing CTA band heading |
| **Heading size** | `--font-size-h2` (clamp 1.5-2rem) |
| **Card type** | None — footer is a structural element |
| **Background** | `--section-bg-footer` (deepest) + `--gradient-ambient-gold` (dim) |
| **Colors** | Gold accent (dim, warm exit) |
| **Scroll behavior** | Standard scroll |
| **Animation entrance** | CTA band: fade + lift. Grid: stagger fade. Accent line: width expand |
| **Animation exit** | Natural |
| **Hover behavior** | Links: color shift to gold (existing pattern, refine) |
| **Mobile version** | Single column (existing, keep) |
| **RTL behavior** | Grid mirrors (existing) |
| **Required assets** | Logo (existing) |
| **CMS dependency** | CMS site settings (branding, contact, social, location) |
| **Implementation complexity** | Low — restyle existing structure |
| **Recommendation** | Light Refactor — enhance existing good structure |

---

## 12. Scroll and Motion Architecture

### 12.1 Global Smooth Scroll Strategy

**Library:** Lenis (`lenis` npm package)  
**Scope:** Public routes only (homepage, /insights, /insights/:slug, /case-studies, /careers, /training)  
**Excluded:** `/leads/*` (dashboard uses native scroll for data tables)

**Integration:**
```javascript
// SmoothScrollProvider.jsx (proposed)
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Lenis instance
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  smoothTouch: false,  // native touch scroll
});

// Sync with ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);

// rAF loop
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
```

**Route-change cleanup:** On route change, call `ScrollTrigger.refresh()` and `lenis.scrollTo(0, { immediate: true })`.

### 12.2 ScrollTrigger Lifecycle

- **Registration:** Once in `SmoothScrollProvider` (top-level)
- **Creation:** Per-section in component `useEffect` with cleanup
- **Refresh:** On route change, on font load, on image load
- **Cleanup:** `ScrollTrigger.kill()` on component unmount
- **Batch:** Use `ScrollTrigger.batch()` for staggered card reveals

### 12.3 Motion Vocabulary (Unified Presets)

| Preset Name | Description | Used For | Where NOT to Use |
|-------------|-------------|----------|-----------------|
| **Fade + Lift** | `opacity: 0 → 1`, `y: 30 → 0`, 0.6s ease-out | Default reveal for most content | Hero (use clip), Pinned sections (use scrub) |
| **Clip Reveal** | `clip-path: inset(0 100% 0 0) → inset(0 0 0 0)`, scrubbed | Headlines, large cards, section titles | Small cards, body text |
| **Mask Reveal** | `clip-path: inset(0 0 100% 0) → inset(0 0 0 0)`, scrubbed | Hero text, editorial headlines | Cards, body text |
| **Scale Reveal** | `scale: 0.95 → 1`, `opacity: 0 → 1`, 0.8s | Featured cards, CTA cards | Text, small cards |
| **Stagger** | Sequential Fade + Lift with 80-120ms delay | Card grids, list items | Single elements, pinned content |
| **Scrubbed Transform** | Driven by ScrollTrigger progress, not time | Pinned section content, pipeline nodes | Non-pinned sections |
| **Ambient Color Tween** | `background-color` tween on fixed layer, scrubbed | Section mood transitions | Card backgrounds (use CSS) |
| **Slow Media Drift** | `transform: translate + scale`, 20s loop | Background images, hero canvas | Text, cards |
| **Controlled Glow Pulse** | `box-shadow` opacity oscillation, 4s loop | CTA cards, featured cards on hover | Body text, borders |

### 12.4 Sticky/Pinned Rules

- **Maximum 2 pinned sections** on the homepage (Automation Showcase + Case Studies featured)
- **Pin duration:** Never exceed 200vh of scroll per pinned section
- **Mobile:** Disable all pinning, use sequential reveals instead
- **Reduced motion:** Disable all pinning, show all content immediately

### 12.5 Card Hover Presets

| Card Type | Hover Preset |
|-----------|-------------|
| Editorial Card | Border-trace (gradient border animates in) + `translateY(-0.25rem)` |
| Cinematic Media Card | Image `scale(1.05)` + overlay darken + content `translateY(-0.5rem)` |
| Feature Card | Icon `scale(1.1)` + border glow + `translateY(-0.25rem)` |
| Service Spotlight Card | Border brighten + flow step sequential highlight + glow intensify |
| Metric Card | Number count-up (if not already shown) + border-trace |
| Glass Surface Card | Surface brighten (opacity increase) + `translateY(-0.25rem)` |
| Gradient Edge Card | Gradient shift (animation plays) + glow + `translateY(-0.25rem)` |
| Large Project Card | Image zoom + content slide-up from bottom |
| Compact Insight Card | Accent line brighten + `translateY(-0.25rem)` |
| Premium CTA Card | Glow pulse + button magnetic (existing MagneticButton) |

### 12.6 Typography Reveals

- **Section headlines:** Mask reveal (clip-path bottom-to-top, scrubbed)
- **Card titles:** Fade + lift (part of card stagger)
- **Eyebrows:** Fade + slide from left (scrubbed, 20px)
- **Body text:** Fade + lift (simple, 0.6s)

### 12.7 Parallax Limits

- **Hero canvas:** ±5px (existing, keep)
- **Hero text layers:** ±3px (new, subtle)
- **Section backgrounds:** None (ambient handles mood)
- **Card images:** ±10px on scroll (subtle Ken Burns)
- **Maximum parallax on any element:** 15px (prevents disorientation)

### 12.8 Mouse Interactions

- **MouseGlow:** Keep existing (cursor-following radial gradient)
- **MagneticButton/MagneticLink:** Keep existing
- **mouse-depth-card:** Keep existing 3D tilt, apply to new card types
- **Hero pointer parallax:** Extend to text layers (not just canvas)
- **Disable on:** Touch devices, reduced motion (already handled)

### 12.9 Progress Bar

```css
.scroll-progress {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, var(--color-gold), var(--color-purple));
  transform-origin: left;
  transform: scaleX(0);
  z-index: 600;
}
```
Driven by `ScrollTrigger.create({ start: 'top top', end: 'bottom bottom', scrub: true })` updating `scaleX`.

### 12.10 Header Behavior

- **Scroll down:** `translateY(-100%)` with 300ms transition
- **Scroll up:** `translateY(0)` with 300ms transition
- **At top:** Always visible, transparent background
- **Scrolled:** Visible with blurred background (existing behavior)
- **Mobile:** Same hide/show, but hamburger always visible when menu is open

### 12.11 Reduced Motion Fallback

All motion is disabled:
- Lenis: Not initialized (native scroll)
- ScrollTrigger: All triggers fire immediately (no scrub, no pin)
- CSS animations: `animation: none` (existing pattern)
- Parallax: `transform: none` (existing pattern)
- MouseGlow: `display: none` (existing)
- MagneticButton/Link: `transform: none` (existing)
- Progress bar: Static at 100%
- Film grain: Keep (static, not motion)
- Vignette: Keep (static, not motion)

### 12.12 Mobile Motion Reduction

- **No pinning:** All pinned sections become sequential
- **No parallax:** All parallax transforms disabled
- **No Lenis:** Native touch scroll (`smoothTouch: false`)
- **Simpler reveals:** Fade only (no clip, no mask, no scale)
- **No mouse interactions:** Already disabled via `@media (hover: none)`

### 12.13 Low-End Device Fallback

- **Detect:** `navigator.hardwareConcurrency < 4` or `navigator.deviceMemory < 4`
- **Actions:** Disable film grain, disable ambient color tweening, reduce hero frame count, disable all parallax
- **Keep:** Basic fade reveals, progress bar, header hide/show

---

## 13. Ambient and Background Architecture

### 13.1 Fixed Cinematic Layers

```html
<!-- Inside App.jsx, before app-content -->
<div className="cinematic-layers" aria-hidden="true">
  <div className="layer-ambient" />    <!-- Color tween background -->
  <div className="layer-glow" />       <!-- Global radial glow -->
  <div className="layer-vignette" />   <!-- Edge darkening -->
  <div className="layer-grain" />      <!-- Film noise -->
  <div className="scroll-progress" />  <!-- Progress bar -->
</div>
```

### 13.2 Layer Specifications

**Ambient (`layer-ambient`):**
- `position: fixed; inset: 0; z-index: 0;`
- `background-color` tweened by GSAP based on scroll position
- Transitions through: `#0a0b10` → `#0e0c16` → `#12101c` → `#0c0a14` → `#100e1a` → `#0e0c16` → `#0a0b10`
- `pointer-events: none; transition: background-color 0.8s ease;`

**Glow (`layer-glow`):**
- `position: fixed; inset: 0; z-index: 0;`
- `background: radial-gradient(circle at var(--glow-x, 50%) var(--glow-y, 30%), rgba(139, 92, 166, 0.06), transparent 60%);`
- Position shifts with scroll progress
- `pointer-events: none;`

**Vignette (`layer-vignette`):**
- `position: fixed; inset: 0; z-index: 9998;`
- `background: radial-gradient(ellipse 100% 100% at 50% 50%, transparent 60%, rgba(0, 0, 0, 0.4) 100%);`
- `pointer-events: none;`

**Grain (`layer-grain`):**
- `position: fixed; inset: 0; z-index: 9997;`
- `background-image: url("data:image/svg+xml,...noise...");`
- `opacity: 0.025; mix-blend-mode: overlay;`
- `pointer-events: none;`
- SVG noise: `<svg><filter><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2"/></filter><rect filter="url(#noise)"/></svg>`

**Progress (`scroll-progress`):**
- `position: fixed; top: 0; left: 0; width: 100%; height: 2px; z-index: 600;`
- `transform: scaleX(var(--scroll-progress, 0)); transform-origin: left;`
- `background: linear-gradient(90deg, var(--color-gold), var(--color-purple));`

### 13.3 Ambient Transition Architecture

```javascript
// In a useAmbientSections hook or provider
const sectionColors = [
  { trigger: '#home', color: '#0a0b10' },
  { trigger: '#foundation', color: '#0e0c16' },
  { trigger: '#capabilities', color: '#12101c' },
  { trigger: '#services', color: '#0c0a14' },
  { trigger: '#automation-showcase', color: '#100e1a' },
  { trigger: '#industries', color: '#0e0c16' },
  { trigger: '#partners', color: '#12101c' },
  { trigger: '#case-studies', color: '#0a0b10' },
  { trigger: '#insights', color: '#100e1a' },
  { trigger: '#careers', color: '#0e0c16' },
  { trigger: '#contact', color: '#0c0a14' },
  { trigger: '.footer', color: '#07080c' },
];

sectionColors.forEach(({ trigger, color }) => {
  ScrollTrigger.create({
    trigger,
    start: 'top 50%',
    end: 'bottom 50%',
    onEnter: () => gsap.to('.layer-ambient', { backgroundColor: color, duration: 0.8 }),
    onEnterBack: () => gsap.to('.layer-ambient', { backgroundColor: color, duration: 0.8 }),
  });
});
```

### 13.4 Existing Background System Integration

- **InteractiveNetworkBackground:** Keep as-is. It's a fixed canvas at `z-index: 0`. The ambient layer will be at the same z-index but behind it (or the network can be at `z-index: 1` with ambient at `z-index: 0`).
- **MouseGlow:** Keep as-is. It's at `z-index: 9999`. Vignette and grain are below it.
- **Section backgrounds:** Sections currently set their own `background-color`. In the new system, sections should have `background: transparent` and let the ambient layer handle color. This creates seamless transitions.

---

## 14. Header and Navigation Experience

### 14.1 Header Redesign

**Current:** Fixed pill with blur, shrinks on scroll, never hides.  
**Proposed:** Fixed pill with blur, shrinks on scroll, **hides on scroll-down**, **reveals on scroll-up**, adds **scroll progress indicator** at very top.

**New behaviors:**
1. **Hide/Show:** Track scroll direction via Lenis or scroll event. `translateY(-110%)` when scrolling down, `translateY(0)` when scrolling up. 300ms `cubic-bezier(0.22, 1, 0.36, 1)` transition.
2. **At top:** Transparent background (no blur), more padding.
3. **Scrolled:** Blurred background (existing), tighter padding (existing).
4. **Progress bar:** 2px line at very top of header, `scaleX` driven by scroll progress.
5. **Logo treatment:** Slightly larger at top, shrinks on scroll (existing behavior, refine).

### 14.2 Navigation Link Treatment

**Current:** Plain text links with gradient underline on hover.  
**Proposed:** Same but with:
- Gold underline instead of purple (brand alignment)
- Slightly larger font (0.9375rem vs 0.875rem)
- Active section indicator: link glows when its section is in viewport (via ScrollTrigger)

### 14.3 CTA Button

**Current:** Purple-soft background with purple border.  
**Proposed:** Same but with:
- Gold border on hover (instead of purple)
- Magnetic effect (already has MagneticButton, but header CTA is a plain button — wrap it)
- Glow on hover: `box-shadow: 0 0 1rem rgba(201, 169, 110, 0.15)`

### 14.4 Mobile Navigation

**Current:** Hamburger opens absolute-positioned dropdown panel.  
**Proposed:** Same structure but:
- Panel has film grain overlay
- Links stagger in (fade + slide from right)
- Active section indicator
- Close on link click (existing)
- Full-height panel option (instead of compact dropdown)

---

---

## 15. Footer Experience

### 15.1 Footer Redesign

**Current:** CTA band + accent line + 4-col grid + bottom bar. Good structure.  
**Proposed:** Keep structure, enhance styling and add scroll-driven entrance animations.

**Enhancements:**
1. **CTA band:** Increase heading size, add gold gradient text on hover, make button magnetic (wrap in MagneticButton)
2. **Accent line:** Animate width expand on scroll enter (from 0 to 100%), nodes pulse sequentially
3. **Grid columns:** Stagger fade-in on scroll enter, links get gold hover color
4. **Bottom bar:** Subtle top border gradient instead of solid border
5. **Background:** Deepest plum (`#07080c`) with dim gold ambient glow
6. **Brand area:** Add a subtle brand tagline below the description (CMS-configurable)

### 15.2 Footer Animation Sequence

1. CTA band: fade + lift (0.6s)
2. Accent line: width expand (0.8s, 200ms delay)
3. Accent nodes: sequential pulse (100ms stagger)
4. Grid columns: stagger fade (120ms each, starting after accent line)
5. Bottom bar: fade (300ms after grid)

---

## 16. Floating Social Bar Experience

### 16.1 Current State

The floating social bar is already well-designed:
- Fixed right-center pill with blur
- WhatsApp (green), Telegram (blue), Email (gold), LinkedIn (blue)
- Hover: platform color glow + icon scale + label tooltip
- Hidden on mobile (`max-width: 767px`)
- RTL: moves to left side

### 16.2 Proposed Enhancements

1. **Entrance animation:** Slide in from right after page load (300ms delay, 500ms transition)
2. **Scroll behavior:** Slight opacity reduction when hero is in viewport (to not distract from canvas), full opacity after hero exits
3. **Active state:** Subtle continuous glow on the primary CTA platform (WhatsApp) to draw attention
4. **Label tooltip:** Already good — keep as-is
5. **Mobile:** Keep hidden (existing). Consider a bottom-bar alternative for mobile in v2.

**Recommendation:** Light Refactor — add entrance animation and scroll-based opacity only.

---

## 17. Interactive Elements Catalog

### 17.1 Global Interactive Elements

| Element | Component | Current State | Proposed Change | Reuse Value |
|---------|-----------|---------------|-----------------|-------------|
| MouseGlow | `MouseGlow.jsx` | Cursor-following radial gradient | Keep as-is | 8/10 |
| MagneticButton | `MagneticButton.jsx` | Magnetic cursor attraction | Keep, apply to more CTAs | 8/10 |
| MagneticLink | `MagneticLink.jsx` | Magnetic cursor attraction for links | Keep, apply to nav links | 8/10 |
| mouse-depth-card | CSS class | 3D tilt on hover | Keep, apply to new card types | 7/10 |
| InteractiveNetworkBackground | `InteractiveNetworkBackground.jsx` | Canvas node network | Keep, adjust z-index for ambient layer | 6/10 |
| FloatingSocialBar | `FloatingSocialBar.jsx` | Social links pill | Light enhancement (entrance anim) | 7/10 |

### 17.2 New Interactive Elements to Create

| Element | Purpose | Implementation | Where Used |
|---------|---------|----------------|------------|
| SmoothScrollProvider | Lenis integration | React context provider wrapping public routes | App.jsx |
| CinematicLayers | Fixed ambient/grain/vignette/progress | Static div with CSS + ScrollTrigger | App.jsx |
| ScrollProgressBar | Top progress indicator | Fixed div with ScrollTrigger scrub | CinematicLayers |
| AmbientSectionColor | Per-section background tweening | ScrollTrigger batch on section IDs | CinematicLayers |
| useScrollReveal | Hook for scroll-driven reveals | ScrollTrigger.create with cleanup | All sections |
| useStaggerReveal | Hook for staggered card reveals | ScrollTrigger.batch | Card grids |
| CountUp | Number count-up on scroll enter | GSAP timeline with ScrollTrigger | Metric Cards |
| MarqueeScroll | Continuous horizontal scroll | CSS animation or GSAP | Partners section |
| SectionHeading | Reusable heading with eyebrow + number | React component | All sections |
| Card components (10 types) | See §10 Card Design System | Individual React components | Various sections |

---

## 18. Responsive Design Rules

### 18.1 Breakpoint System

| Breakpoint | Min Width | Target |
|-----------|-----------|--------|
| `xs` | 0 | Mobile portrait |
| `sm` | 640px | Mobile landscape / small tablet |
| `md` | 768px | Tablet portrait |
| `lg` | 1024px | Tablet landscape / small desktop |
| `xl` | 1280px | Desktop |
| `2xl` | 1536px | Large desktop |

### 18.2 Section Behavior per Breakpoint

| Feature | Mobile (<768px) | Tablet (768-1023px) | Desktop (≥1024px) |
|---------|-----------------|---------------------|-------------------|
| Lenis smooth scroll | Disabled (native touch) | Enabled | Enabled |
| ScrollTrigger pinning | Disabled | Disabled | Enabled (max 2 sections) |
| Parallax | Disabled | Limited (±5px) | Full (±15px) |
| Card hover effects | Disabled (tap only) | Enabled | Enabled |
| mouse-depth-card | Disabled | Enabled | Enabled |
| MouseGlow | Disabled | Enabled | Enabled |
| Film grain | Disabled (perf) | Enabled | Enabled |
| Ambient color tween | Simplified (CSS transition) | Enabled | Enabled |
| Card grids | 1-column | 2-column | Full layout |
| Header | Hamburger menu | Hamburger menu | Full nav |
| Floating social bar | Hidden | Visible | Visible |
| Hero canvas | Mobile frame set | Desktop frame set | Desktop frame set |
| Section padding | 5rem | 7rem | 10rem |
| Headline size | Reduced clamp | Medium clamp | Full clamp |

### 18.3 Mobile-Specific Rules

1. **No `position: sticky` or `position: fixed` for content sections** (only header and overlays)
2. **All grids collapse to 1-column** with `1.5rem` gap
3. **Card padding reduced** to `1.5rem` (from `2.5-3rem`)
4. **Headlines reduce** by ~30% via clamp
5. **No backdrop-filter** on cards (performance)
6. **No box-shadow glows** on hover (performance, no hover state)
7. **Tap targets minimum 44x44px**
8. **Form fields full-width, stacked**
9. **RTL layout fully preserved** — all flexbox/grid directions mirror

### 18.4 Tablet-Specific Rules

1. **2-column grids** for most sections
2. **Reduced parallax** (±5px max)
3. **Hamburger menu** (same as mobile)
4. **Floating social bar** visible
5. **Film grain** enabled
6. **No pinning** (performance on lower-end tablets)

---

## 19. RTL and i18n Considerations

### 19.1 Current RTL State

The site already has solid RTL support:
- `[dir='rtl']` on `<html>` via `I18nProvider`
- RTL-specific CSS overrides for letter-spacing, flexbox direction, floating social bar position
- `getBilingual(value, lang)` utility for CMS content
- Arabic translations in `i18n/index.js`

### 19.2 RTL Enhancements for Refactor

1. **Typography:** El Messiri (display) + Tajawal (body) loaded specifically for `[dir='rtl']`
2. **Headline line-height:** `1.2` for Arabic (vs `1.05` for English)
3. **Eyebrow letter-spacing:** `0` for Arabic (already handled)
4. **Clip reveals:** Direction mirrors — `clip-path: inset(0 0 0 100%)` → `inset(0 0 0 0)` for RTL (right-to-left reveal)
5. **Stagger direction:** Cards stagger from right-to-left in RTL
6. **Marquee direction:** Reverses for RTL (partners section)
7. **Pipeline flow:** Right-to-left in RTL (automation showcase)
8. **Progress bar:** `transform-origin: right` in RTL
9. **Header hide/show:** Same behavior (translateY, not translateX)
10. **Accent line:** Nodes flow right-to-left

### 19.3 i18n Gaps to Fix

1. **CareersSection hardcoded cards:** The `careerCards` array is English-only. Move to CMS or add Arabic translations.
2. **CareersSection CTA heading:** "Don't See The Right Role?" is not translated. Add to i18n.
3. **AutomationShowcaseSection:** Uses inline ternary (`lang === 'ar' ? ... : ...`) instead of `t()` keys. Refactor to use i18n keys.
4. **Footer subheading:** Inline ternary. Move to i18n key.

### 19.4 Bilingual Content Strategy

- **CMS-driven content:** Uses `getBilingual(field, lang)` — keep this pattern
- **Static content:** Uses `t('key')` from i18n — keep this pattern
- **New content:** All new static text must have both `en` and `ar` translations in `i18n/index.js`
- **Section headings:** CMS-configurable where possible, i18n fallback for hardcoded

---

## 20. Accessibility Requirements

### 20.1 Motion Accessibility

- **`prefers-reduced-motion: reduce`:** All animations disabled, all content visible immediately, no pinning, no parallax, no Lenis
- **`prefers-reduced-transparency: reduce`:** Disable backdrop-filter, use solid surfaces
- **`prefers-contrast: more`:** Increase text contrast ratios

### 20.2 Color Contrast

| Element | Current | Target | WCAG Level |
|---------|---------|--------|------------|
| Primary text on bg | `#f2f2f2` on `#0d0f12` (18.3:1) | `#f0eef4` on `#0a0b10` (18.1:1) | AAA |
| Secondary text on bg | `#9088a0` on `#0a0b10` (7.2:1) | `#9088a0` on `#0a0b10` (7.2:1) | AAA |
| Muted text on bg | `#6b6580` on `#0a0b10` (4.1:1) | `#6b6580` on `#0a0b10` (4.1:1) | AA |
| Gold accent on bg | `#c9a96e` on `#0a0b10` (8.9:1) | `#c9a96e` on `#0a0b10` (8.9:1) | AAA |
| Purple accent on bg | `#8b5ca6` on `#0a0b10` (4.8:1) | `#8b5ca6` on `#0a0b10` (4.8:1) | AA |
| Tech blue on bg | N/A | `#4a9eff` on `#0a0b10` (6.3:1) | AA |
| Copper on bg | N/A | `#b87333` on `#0a0b10` (5.5:1) | AA |

### 20.3 Focus States

- **All interactive elements:** Visible focus ring (`outline: 2px solid var(--color-gold); outline-offset: 2px;`)
- **Cards:** Focus moves to the primary link/action inside the card
- **Form fields:** Existing focus glow (keep, refine to gold for brand consistency)
- **Header links:** Focus underline appears
- **Keyboard navigation:** Tab order follows visual order, skip-to-content link at top

### 20.4 Screen Reader Considerations

- **Section landmarks:** `<section aria-labelledby="section-heading">` on each section
- **Card semantics:** Use `<article>` for content cards, `<nav>` for link groups
- **Decorative elements:** `aria-hidden="true"` on all cinematic layers, grain, vignette, progress bar, accent lines
- **Form labels:** Existing labels (keep), add `aria-describedby` for error messages
- **Live regions:** Form success/error messages use `role="status"` and `role="alert"`
- **Scroll progress:** `aria-hidden="true"` (decorative)

### 20.5 Touch Accessibility

- **Tap targets:** Minimum 44x44px (already met on most elements)
- **No hover-dependent information:** All content visible without hover
- **Swipe gestures:** None required (native scroll)
- **Mobile menu:** Hamburger button ≥44x44px, close button ≥44x44px

---

## 21. Performance Budget

### 21.1 Bundle Size Targets

| Asset | Current | Target | Notes |
|-------|---------|--------|-------|
| Total JS (gzipped) | ~180KB | ~200KB | Lenis adds ~8KB |
| Total CSS (gzipped) | ~25KB | ~40KB | New tokens, card styles, layers |
| Total fonts | 0 (system) | ~80KB (woff2) | 4 font families, 2-3 weights each |
| Hero frames | ~8MB | ~8MB | Keep existing (already optimized) |
| Images | CMS-driven | CMS-driven | No change |

### 21.2 Runtime Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| First Contentful Paint | <1.5s | Lighthouse |
| Largest Contentful Paint | <2.5s | Lighthouse |
| Cumulative Layout Shift | <0.1 | Lighthouse |
| Total Blocking Time | <200ms | Lighthouse |
| Smooth scroll FPS | 55-60fps | DevTools Performance |
| ScrollTrigger FPS | 55-60fps | DevTools Performance |
| Hero canvas FPS | 55-60fps | DevTools Performance |

### 21.3 Performance Optimizations

1. **Font loading:** `font-display: swap` (already in Google Fonts URL), preload critical fonts
2. **Lenis:** `requestAnimationFrame`-based, minimal overhead
3. **ScrollTrigger:** Use `batch()` for card grids (reduces trigger count), `once: true` for non-scrubbed reveals
4. **Ambient color tween:** CSS `transition` instead of GSAP for color changes (GPU-accelerated)
5. **Film grain:** Static SVG data URI (no network request, no animation)
6. **Vignette:** Static CSS gradient (no animation)
7. **Progress bar:** Single ScrollTrigger, `will-change: transform`
8. **Card hover:** CSS transitions only (no JS), `will-change: transform` on hover-enabled cards
9. **Ambient layer:** `will-change: background-color` only during scroll, removed when idle
10. **Reduced motion:** All ScrollTriggers set to `once: true, scrub: false` — content appears immediately

### 21.4 Image Strategy

- **Case study images:** CMS-provided, lazy-loaded with `loading="lazy"`, `decoding="async"`
- **Partner logos:** Existing small SVGs/PNGs, no change
- **Hero frames:** Existing preloaded sequence, no change
- **Placeholder gradients:** CSS-generated for cards without images (no network request)

---

## 22. SEO Considerations

### 22.1 Preserved SEO Systems

- **`SEO` component:** Already handles meta tags, OpenGraph, Twitter cards per route
- **`PAGES` config:** Centralized SEO config in `src/config/seo.js`
- **`sitemap.xml` and `robots.txt`:** Already in `public/`
- **Semantic HTML:** Existing structure uses `<main>`, `<footer>`, `<nav>`, `<section>`

### 22.2 SEO Enhancements for Refactor

1. **Semantic structure:** Add `<article>` for cards, `<section aria-labelledby>` for sections
2. **Heading hierarchy:** Ensure single `<h1>` per page, logical `<h2>` → `<h3>` nesting
3. **Alt text:** All images have alt text (existing, verify new images)
4. **Internal linking:** Case study cards link to detail pages (existing), ensure new card designs preserve links
5. **Page speed:** Performance improvements (§21) boost Lighthouse SEO score
6. **Structured data:** Consider adding `Organization` and `BreadcrumbList` JSON-LD in v2

### 22.3 SEO Risks and Mitigations

| Risk | Mitigation |
|------|-----------|
| Lenis may affect scroll-based SEO crawlers | Googlebot renders with native scroll; Lenis only activates in browser |
| ScrollTrigger pinning may hide content | All content is in DOM regardless of pin state; pinning is visual only |
| Film grain may increase render time | Static SVG, `opacity: 0.025`, negligible impact |
| Font loading may delay text render | `font-display: swap` ensures text is visible immediately |
| New CSS may increase page weight | Target 40KB gzipped — well within budget |

---

## 23. Backend and API Dependencies

### 23.1 APIs Used by Refactored Sections

| Section | API | Endpoint | Data Used | Changes Needed |
|---------|-----|----------|-----------|----------------|
| Hero | Homepage Config | `GET /api/v1/homepage/config/` | `hero.enabled`, frame sets | None |
| Foundation | Homepage Config | `GET /api/v1/homepage/config/` | `foundation` headings | None |
| Capabilities | Homepage Config | `GET /api/v1/homepage/config/` | `marquee` config | None |
| Services | Services | `GET /api/v1/services/` | All service data | None |
| Automation | None | N/A | Hardcoded bilingual | Move to CMS in v2 |
| Industries | Industries | `GET /api/v1/industries/` | All industry data | None |
| Partners | Partners | `GET /api/v1/partners/` | All partner data | None |
| Case Studies | Case Studies | `GET /api/v1/case-studies/` | All case study data | None |
| Insights | Insights | `GET /api/v1/insights/` | Published articles | None |
| Careers | Jobs | `GET /api/v1/careers/jobs/` | Active jobs | None |
| Careers | Homepage Config | `GET /api/v1/homepage/config/` | `careers` headings | None |
| Contact | Inquiry Types | `GET /api/v1/contact/inquiry-types/` | Inquiry type list | None |
| Contact | Contact Form | `POST /api/v1/contact/submit/` | Form submission | None |
| Contact | Site Settings | `GET /api/v1/site-settings/` | Contact info, location | None |
| Footer | Site Settings | `GET /api/v1/site-settings/` | Branding, social, contact | None |
| Floating Social | Site Settings | `GET /api/v1/site-settings/` | Social URLs | None |
| Header | Site Settings | `GET /api/v1/site-settings/` | Nav links, branding | None |

**Key finding:** Zero backend changes needed for the refactor. All data is already available via existing APIs.

### 23.2 CMS Configuration Dependencies

The homepage config API already supports section ordering and visibility. The refactor preserves this system:
- `SECTION_COMPONENT_MAP` in `App.jsx` stays the same
- `FALLBACK_SECTION_ORDER` stays the same
- `HomeSections` component stays the same
- Each section component receives no props (fetches its own data) — this pattern is preserved

### 23.3 Future CMS Enhancements (Not Required for Refactor)

These are optional enhancements for v2:
1. **Automation Showcase content:** Move hardcoded pipeline nodes to CMS
2. **Career category cards:** Move hardcoded `careerCards` to CMS
3. **Section-specific SEO fields:** Add meta description per section
4. **Hero text overlay:** Add CMS fields for hero headline/subtext/CTA text

---

## 24. Implementation Phases

### 24.1 Phase Overview

| Phase | Name | Duration | Dependencies | Risk | Output |
|-------|------|----------|-------------|------|--------|
| 1 | Foundation: Design Tokens + Fonts | 1 day | None | Low | New CSS variables, font loading |
| 2 | Foundation: Cinematic Layers | 1 day | Phase 1 | Low | Ambient, grain, vignette, progress |
| 3 | Foundation: Smooth Scroll + Motion Utils | 1 day | Phase 2 | Low | Lenis provider, ScrollTrigger utils |
| 4 | Header Redesign | 0.5 day | Phase 3 | Low | Hide/show, progress bar, restyled nav |
| 5 | Hero Enhancement | 1 day | Phase 3 | Medium | Text overlay, aura, motes, sheen |
| 6 | Foundation Section Rebuild | 0.5 day | Phase 3 | Low | Sticky, mask reveal, asymmetric layout |
| 7 | Card System: Core Components | 1 day | Phase 1 | Medium | 10 card type components |
| 8 | Services Section Rebuild | 0.5 day | Phase 7 | Low | Asymmetric grid, new cards |
| 9 | Capabilities Section Refactor | 0.5 day | Phase 7 | Low | Editorial layout, new cards |
| 10 | Automation Showcase Refactor | 1 day | Phase 3 | High | Pinned scroll-driven pipeline |
| 11 | Industries Section Rebuild | 0.5 day | Phase 7 | Low | Scrubbed showcase + list |
| 12 | Partners Section Refactor | 0.5 day | Phase 7 | Low | Marquee or premium grid |
| 13 | Case Studies Section Refactor | 1 day | Phase 7 | High | Pinned story reveal, large cards |
| 14 | Insights Section Rebuild | 0.5 day | Phase 7 | Low | Editorial layout, new cards |
| 15 | Careers Section Rebuild | 0.5 day | Phase 7 | Low | New cards, fix i18n gap |
| 16 | Contact Section Refactor | 1 day | Phase 3, 7 | High | Dim/wash, form reveal, 2-col + map |
| 17 | Footer Enhancement | 0.5 day | Phase 3 | Low | Animate entrance, restyle |
| 18 | Floating Social Bar Enhancement | 0.25 day | Phase 3 | Low | Entrance animation, scroll opacity |
| 19 | Responsive + Mobile Polish | 1 day | Phases 4-18 | Medium | All breakpoints tested |
| 20 | Accessibility + Reduced Motion | 0.5 day | Phases 4-18 | Low | All a11y verified |
| 21 | Performance Optimization | 0.5 day | Phases 4-18 | Medium | Lighthouse audit, optimizations |
| 22 | RTL + i18n Verification | 0.5 day | Phases 4-18 | Low | Full Arabic layout verified |
| 23 | Cross-Browser Testing | 0.5 day | Phases 4-18 | Low | Chrome, Firefox, Safari, Edge |
| 24 | Build + Deploy Verification | 0.25 day | Phases 4-23 | Low | npm build, deploy check |

**Total estimated duration:** ~15 working days  
**Critical path:** Phases 1 → 2 → 3 → 7 → (parallel: 4,5,6,8,9,10,11,12,13,14,15,16,17,18) → 19 → 20 → 21 → 22 → 23 → 24

### 24.2 Phase Dependencies Graph

```
Phase 1 (Tokens + Fonts)
  ├── Phase 2 (Cinematic Layers)
  │     └── Phase 3 (Smooth Scroll + Motion)
  │           ├── Phase 4 (Header)
  │           ├── Phase 5 (Hero)
  │           ├── Phase 6 (Foundation)
  │           ├── Phase 10 (Automation)
  │           ├── Phase 16 (Contact)
  │           ├── Phase 17 (Footer)
  │           └── Phase 18 (Social Bar)
  └── Phase 7 (Card System)
        ├── Phase 8 (Services)
        ├── Phase 9 (Capabilities)
        ├── Phase 11 (Industries)
        ├── Phase 12 (Partners)
        ├── Phase 13 (Case Studies)
        ├── Phase 14 (Insights)
        ├── Phase 15 (Careers)
        └── Phase 16 (Contact)
```

### 24.3 Parallelization Opportunities

After Phase 7 (Card System), all section rebuilds (Phases 8-16) can proceed in parallel since they only depend on the card components and motion utilities. In practice, they should be done sequentially to maintain visual consistency, but the dependency graph allows parallel work.

### 24.4 Risk Assessment

| Risk | Phases | Mitigation |
|------|--------|------------|
| Lenis conflicts with ScrollTrigger | Phase 3 | Use `lenis.on('scroll', ScrollTrigger.update)` + `gsap.ticker.add` pattern (proven in DNA reference) |
| Pinned sections cause layout issues on resize | Phase 10, 13 | `ScrollTrigger.refresh()` on resize, `invalidateOnRefresh: true` |
| Font loading causes FOUT/FOIT | Phase 1 | `font-display: swap`, preload critical weights |
| Film grain impacts performance on low-end devices | Phase 2 | Detect low-end devices, disable grain |
| Ambient color tween causes jank | Phase 2 | Use CSS `transition` not GSAP for color, `will-change` management |
| Hero text overlay obscures canvas | Phase 5 | Position text at bottom, fade out early (70% scroll) |
| Mobile pinning causes scroll jumps | Phase 10, 13 | Disable pinning on mobile via `matchMedia` |
| Card system too complex | Phase 7 | Start with 5 most-used types, add others later |
| i18n gaps in Careers section | Phase 15 | Fix hardcoded EN-only content, add Arabic translations |

---

## 25. File Structure for Refactored Components

### 25.1 New Files to Create

```
src/
├── providers/
│   ├── SmoothScrollProvider.jsx          # Lenis integration
│   └── CinematicLayers.jsx               # Fixed ambient/grain/vignette/progress
├── hooks/
│   ├── useScrollReveal.js                # ScrollTrigger reveal hook
│   ├── useStaggerReveal.js               # Staggered card reveal hook
│   ├── useAmbientColor.js                # Section ambient color tween
│   └── useCountUp.js                     # Number count-up on scroll
├── components/
│   ├── ui/
│   │   ├── SectionHeading.jsx            # Reusable heading with eyebrow + number
│   │   ├── ScrollProgressBar.jsx         # Top progress bar (if not in CinematicLayers)
│   │   └── cards/
│   │       ├── EditorialCard.jsx
│   │       ├── CinematicMediaCard.jsx
│   │       ├── FeatureCard.jsx
│   │       ├── ServiceSpotlightCard.jsx
│   │       ├── MetricCard.jsx
│   │       ├── GlassSurfaceCard.jsx
│   │       ├── GradientEdgeCard.jsx
│   │       ├── LargeProjectCard.jsx
│   │       ├── CompactInsightCard.jsx
│   │       └── PremiumCTACard.jsx
│   └── hero/
│       ├── HeroTextOverlay.jsx           # Text layers over canvas
│       ├── HeroAura.jsx                  # Radial gradient pulse
│       ├── HeroMotes.jsx                 # Floating particles
│       └── HeroSheen.jsx                 # Diagonal gradient sweep
├── styles/
│   ├── tokens.css                        # New design tokens (replaces parts of global.css)
│   ├── cinematic.css                     # Cinematic layers, grain, vignette, progress
│   ├── typography.css                    # Font faces, type scale, RTL typography
│   ├── cards.css                         # All 10 card type styles
│   ├── motion.css                        # Motion preset classes, reduced motion overrides
│   └── sections.css                      # (Existing, refactored with new tokens)
```

### 25.2 Files to Modify

| File | Changes |
|------|---------|
| `src/App.jsx` | Add SmoothScrollProvider, CinematicLayers, wrap public routes |
| `src/components/Header.jsx` | Add hide/show behavior, scroll progress, restyle |
| `src/components/hero/CinematicHero.jsx` | Add text overlay, aura, motes, sheen |
| `src/components/sections/FoundationSection.jsx` | Full UI rebuild |
| `src/components/sections/CapabilitiesMarqueeSection.jsx` | Layout refactor + new cards |
| `src/components/sections/ServicesSection.jsx` | Full UI rebuild |
| `src/components/sections/AutomationShowcaseSection.jsx` | Pinned scroll-driven pipeline |
| `src/components/sections/IndustriesSection.jsx` | Full UI rebuild |
| `src/components/sections/PartnersTrustSection.jsx` | Marquee or premium grid |
| `src/components/sections/CaseStudiesSection.jsx` | Pinned story reveal + large cards |
| `src/components/sections/InsightsSection.jsx` | Editorial layout + new cards |
| `src/components/sections/CareersSection.jsx` | New cards + fix i18n gap |
| `src/components/sections/ContactSection.jsx` | Dim/wash + form reveal + 2-col |
| `src/components/Footer.jsx` | Animate entrance, restyle |
| `src/components/FloatingSocialBar.jsx` | Entrance animation, scroll opacity |
| `src/styles/global.css` | Replace tokens, add new utility classes |
| `src/styles/sections.css` | Refactor with new tokens, new section styles |
| `src/i18n/index.js` | Add new translation keys for new content |
| `index.html` | Add Google Fonts links, preconnect |

### 25.3 Files NOT Modified

| File | Reason |
|------|--------|
| `backend/**` | No backend changes needed |
| `src/contexts/AuthContext.jsx` | Auth unchanged |
| `src/contexts/CMSLanguageContext.jsx` | CMS language unchanged |
| `src/contexts/CMSToastContext.jsx` | Toast unchanged |
| `src/hooks/useHomepageConfig.js` | Homepage config API unchanged |
| `src/hooks/useSiteSettings.js` | Site settings API unchanged |
| `src/hooks/useServices.js` | Services API unchanged |
| `src/hooks/useIndustries.js` | Industries API unchanged |
| `src/hooks/usePartners.js` | Partners API unchanged |
| `src/hooks/useCaseStudies.js` | Case studies API unchanged |
| `src/hooks/useInsights.js` | Insights API unchanged |
| `src/hooks/useJobs.js` | Jobs API unchanged |
| `src/services/*.js` | All API service files unchanged |
| `src/components/leads/**` | Leads dashboard unchanged |
| `src/pages/CMS*.jsx` | CMS pages unchanged |
| `src/config/seo.js` | SEO config unchanged |
| `vite.config.js` | Build config unchanged (Lenis is npm install) |
| `package.json` | Add `lenis` dependency only |

---

## 26. Testing and Verification Plan

### 26.1 Visual Testing

| Test | Method | Pass Criteria |
|------|--------|---------------|
| Section color moods | Manual scroll through homepage | Each section has distinct color temperature |
| Card variety | Manual review of all sections | No two adjacent sections use the same card type |
| Typography | Manual review EN + AR | Display fonts load, headlines are editorial scale |
| Hover states | Manual hover on all card types | Each card type has unique hover behavior |
| Scroll smoothness | Manual scroll on desktop | Lenis provides buttery scroll, no jank |
| Pinned sections | Manual scroll through Automation + Case Studies | Pin holds, content animates, pin releases cleanly |
| Progress bar | Manual scroll | Bar fills smoothly, reaches 100% at bottom |
| Header hide/show | Manual scroll up/down | Header hides on down, reveals on up |
| Ambient transitions | Manual scroll | Background color shifts smoothly between sections |
| Film grain | Visual inspection | Subtle noise visible, not distracting |
| Vignette | Visual inspection | Edges slightly darkened, center bright |

### 26.2 Responsive Testing

| Breakpoint | Device | Tests |
|-----------|--------|-------|
| <768px | iPhone SE, iPhone 14, Pixel 7 | All grids 1-col, no pinning, no parallax, hamburger menu, social bar hidden |
| 768-1023px | iPad Mini, iPad Air | 2-col grids, no pinning, hamburger menu, social bar visible |
| 1024-1279px | Small laptop | Full layouts, pinning enabled, full nav |
| 1280-1535px | Desktop | Full layouts, all features |
| ≥1536px | Large desktop | Content max-widths respected, no stretching |

### 26.3 RTL Testing

| Test | Method | Pass Criteria |
|------|--------|---------------|
| Layout direction | Switch to Arabic | All content right-aligned, grids mirror |
| Typography | Switch to Arabic | El Messiri + Tajawal fonts active |
| Clip reveals | Scroll in Arabic | Reveal direction is right-to-left |
| Pipeline flow | Scroll Automation in Arabic | Nodes flow right-to-left |
| Marquee | Scroll Partners in Arabic | Marquee direction reversed |
| Progress bar | Scroll in Arabic | Bar fills from right to left |
| Header | Scroll in Arabic | Hide/show same, nav right-aligned |
| Form fields | Fill contact form in Arabic | Labels right-aligned, inputs RTL |

### 26.4 Accessibility Testing

| Test | Method | Pass Criteria |
|------|--------|---------------|
| Reduced motion | Enable `prefers-reduced-motion` | All content visible, no animation, no pinning |
| Keyboard nav | Tab through homepage | Logical order, visible focus rings |
| Screen reader | NVDA/VoiceOver on homepage | Section landmarks announced, card semantics correct |
| Color contrast | Lighthouse or axe-core | All text meets WCAG AA minimum |
| Focus visible | Tab through all interactive | Gold outline visible on all focused elements |
| Touch targets | Measure tap targets on mobile | All ≥44x44px |

### 26.5 Performance Testing

| Test | Method | Target |
|------|--------|--------|
| Lighthouse Performance | Chrome DevTools | ≥90 |
| Lighthouse Accessibility | Chrome DevTools | ≥95 |
| Lighthouse Best Practices | Chrome DevTools | ≥95 |
| Lighthouse SEO | Chrome DevTools | ≥95 |
| Scroll FPS | DevTools Performance | 55-60fps |
| Bundle size | `npm run build` + check | <200KB JS gzipped |
| Font loading | Network tab | Fonts load with `swap`, no FOIT |
| Hero frames | Network tab | Existing preload behavior preserved |

### 26.6 Functional Testing

| Test | Method | Pass Criteria |
|------|--------|---------------|
| Contact form submission | Fill and submit form | Success message appears, API receives data |
| CMS section ordering | Change order in CMS | Homepage reflects new order |
| CMS content updates | Edit content in CMS | Updated content appears on homepage |
| Language switch | Toggle EN/AR | All text updates, layout mirrors |
| Route navigation | Click all nav links | Routes load correctly, scroll resets |
| Leads dashboard | Navigate to /leads | Dashboard works, not affected by refactor |
| Insights pages | Navigate to /insights | Listing and detail pages work |
| Case studies page | Navigate to /case-studies | Page works with new card styles |
| Careers page | Navigate to /careers | Page works with new card styles |

### 26.7 Build Testing

| Test | Command | Pass Criteria |
|------|---------|---------------|
| npm build | `npm run build` | No errors, no warnings, output in `dist/` |
| Bundle analysis | `npm run build -- --analyze` | Check bundle sizes within budget |
| Django check | `python manage.py check` | No backend changes, should pass |
| Django migrations | `python manage.py makemigrations --check` | No migrations needed |

---

## 27. Key Decisions Log

| # | Decision | Rationale | Date |
|---|----------|-----------|------|
| 1 | Use Lenis for smooth scroll (not CSS `scroll-behavior`) | Lenis provides rAF-based smoothing, integrates with ScrollTrigger, proven in DNA reference | 2026-07-16 |
| 2 | Keep existing hero canvas engine | Already functional with 250 frames, desktop+mobile sets, ScrollTrigger scrub. Rebuilding would be high risk. | 2026-07-16 |
| 3 | Max 2 pinned sections (Automation + Case Studies) | More than 2 creates scroll fatigue and excessive page height | 2026-07-16 |
| 4 | 10 card types (not 3-4) | Current monotony comes from 1 card pattern used everywhere. Variety is the core fix. | 2026-07-16 |
| 5 | Space Grotesk + El Messiri for display | Space Grotesk is geometric/tech without being sterile. El Messiri is modern Arabic with calligraphic character. | 2026-07-16 |
| 6 | Inter + Tajawal for body | Inter is the industry standard for UI body text. Tajawal is clean, modern Arabic. | 2026-07-16 |
| 7 | Dark plum base (not pure black) | `#0a0b10` has a subtle plum undertone that feels warmer and more premium than `#000` or `#0d0f12` | 2026-07-16 |
| 8 | Copper as tertiary accent | Differentiates Industries/Careers from Services' purple. Adds warmth without competing with gold. | 2026-07-16 |
| 9 | Tech blue as quaternary accent (sparingly) | Signals "technology" in Automation and Insights without making the site feel like a generic tech blue site | 2026-07-16 |
| 10 | No backend changes | All data is available via existing APIs. Refactor is purely frontend. | 2026-07-16 |
| 11 | Preserve homepage config system | CMS-driven section ordering is a good system. Keep `SECTION_COMPONENT_MAP` and `FALLBACK_SECTION_ORDER`. | 2026-07-16 |
| 12 | Disable Lenis on `/leads/*` | Dashboard uses data tables that need native scroll behavior | 2026-07-16 |
| 13 | Film grain as SVG data URI | No network request, no animation, negligible performance cost | 2026-07-16 |
| 14 | CSS transition for ambient color (not GSAP) | GPU-accelerated, smoother than JS-driven color tween, less main thread work | 2026-07-16 |
| 15 | Section backgrounds transparent (ambient layer handles color) | Creates seamless transitions between sections instead of hard color cuts | 2026-07-16 |
| 16 | No `position: sticky` on mobile | Causes scroll issues on iOS Safari, especially with dynamic content | 2026-07-16 |
| 17 | Keep InteractiveNetworkBackground | Subtle, well-implemented, adds depth without distraction | 2026-07-16 |
| 18 | Keep MouseGlow, MagneticButton, MagneticLink | Already premium, well-built. No reason to rebuild. | 2026-07-16 |
| 19 | Fix Careers i18n gap during refactor | Hardcoded EN-only career cards are a known issue. Fix as part of Careers rebuild. | 2026-07-16 |
| 20 | Asymmetric grids (not uniform 3-col) | Editorial grids break monotony and create visual interest | 2026-07-16 |

---

## 28. Verdict and Next Steps

### 28.1 Verdict

**The SidrahSoft website is ready for a full-site cinematic refactor.** The backend, CMS, API, routing, i18n, and RTL infrastructure is solid and needs no changes. The frontend visual layer is the primary work area. The DNA reference provides a proven system for scroll-driven cinematic storytelling that can be adapted to SidrahSoft's brand.

**Key strengths to preserve:**
- Canvas-based cinematic hero (already unique and impressive)
- CMS-driven section ordering and content
- Bilingual EN/AR with RTL support
- Leads dashboard (separate, focused system)
- MouseGlow, MagneticButton, MagneticLink, mouse-depth-card
- InteractiveNetworkBackground

**Key weaknesses to fix:**
- Card monotony (1 pattern everywhere → 10 distinct types)
- Animation monotony (fade-up everywhere → 9 motion presets)
- No smooth scroll (native → Lenis)
- No ambient layering (add grain, vignette, progress, ambient color)
- No section mood differentiation (all same dark bg → per-section color temperatures)
- System-only fonts (→ custom display + body fonts for EN and AR)
- No header hide/show (→ scroll-direction-aware header)
- No scroll progress indicator (→ fixed progress bar)
- Weak Foundation section (→ sticky editorial layout with mask reveals)
- Static Automation showcase (→ pinned scroll-driven pipeline)
- Small partner logos (→ premium marquee or large grid)
- Hardcoded EN-only careers cards (→ fix i18n, new card design)

### 28.2 Recommended Implementation Order

1. **Start with Phase 1 (Design Tokens + Fonts)** — this is the foundation for everything else
2. **Then Phase 2 (Cinematic Layers)** — ambient, grain, vignette, progress bar
3. **Then Phase 3 (Smooth Scroll + Motion Utils)** — Lenis + ScrollTrigger utilities
4. **Then Phase 7 (Card System)** — build the 10 card type components
5. **Then section rebuilds in order of visual impact:** Hero → Foundation → Services → Automation → Case Studies → Contact → Industries → Insights → Careers → Capabilities → Partners → Footer → Social Bar
6. **Then polish phases:** Responsive → Accessibility → Performance → RTL → Cross-Browser → Build

### 28.3 Open Questions for USER

1. **Font choice confirmation:** Space Grotesk + El Messiri (display), Inter + Tajawal (body) — or does the USER have preferences?
2. **Pinned sections:** Is 2 pinned sections (Automation + Case Studies) acceptable, or should we start with 0 and add later?
3. **Partners section:** Marquee (auto-scrolling logos) or premium grid (static, large frames)?
4. **Contact section:** Should we add a Google Maps embed, or keep it form-only?
5. **Automation Showcase:** Should pipeline content move to CMS (v2), or stay hardcoded bilingual for now?
6. **Career cards:** Should hardcoded career categories move to CMS, or just fix the i18n gap for now?
7. **Implementation approach:** Full refactor at once, or phase-by-phase with deployments between phases?

### 28.4 Report Status

- **Report ID:** SIDRAH-DNA-MAPPING-001
- **Status:** Complete
- **Code modified:** None (investigation and mapping only)
- **Files created:** This report only
- **Next action:** Await USER decision on open questions, then begin Phase 1 implementation

---

*End of Report*
