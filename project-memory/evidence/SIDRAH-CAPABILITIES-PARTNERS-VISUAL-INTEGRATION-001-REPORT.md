# SIDRAH-CAPABILITIES-PARTNERS-VISUAL-INTEGRATION-001

## Implementation Report

| Field | Value |
|---|---|
| **Report ID** | SIDRAH-CAPABILITIES-PARTNERS-VISUAL-INTEGRATION-001 |
| **Date** | 2026-07-13 |
| **Scope** | Public website — Capabilities Marquee Section, WorkflowFlow, Partners Trust Section |
| **Status** | IMPLEMENTED |
| **Build** | PASS (`npm run build` exit 0) |
| **Human Visual Approval** | PENDING — live browser QA deferred per user instruction |

---

## 1. Objective

Implement the second visual integration phase for the SidrahSoft public website, covering:

- **CapabilitiesMarqueeSection** — editorial featured capability card, supporting cards, capability tag strip, WorkflowFlow integration
- **WorkflowFlow** — enhanced accessibility semantics, RTL arrow mirroring, preserved CSS-only static diagram
- **PartnersTrustSection** — premium static partner grid with resilient logo fallback, accessible links, visible-first motion

All changes scoped exclusively to `.public-website-shell` and the three permitted components. No modifications to CMS, Leads, backend, APIs, authentication UI, Hero, Automation, Case Studies, Insights, Careers, Contact, Footer, or global motion infrastructure.

---

## 2. Files Modified

### Components

| File | Changes |
|---|---|
| `src/components/sections/CapabilitiesMarqueeSection.jsx` | Adopted `SectionHeading`; rebuilt as editorial featured card + 2×2 supporting grid + tag strip + WorkflowFlow; preserved CMS config data, bilingual content, fallback capabilities, ordering |
| `src/components/WorkflowFlow.jsx` | Enhanced accessibility with `role="list"`, `role="listitem"`, `aria-label` support; preserved CSS-only static node/connector diagram with gradient variant |
| `src/components/sections/PartnersTrustSection.jsx` | Rebuilt as premium 3-column grid with `SectionHeading`, resilient logo fallback (`onError` → text name), accessible partner links (`aria-label`, `rel="noopener noreferrer"`), visible-first motion classes, preserved public data ordering |

### Styles

| File | Changes |
|---|---|
| `src/styles/sections.css` | Added ~370 lines of `.public-website-shell` scoped styles for Capabilities (section mood, featured card, supporting grid, tag strip, workflow separator) and Partners (section mood, heading block, 3-col grid, logo frame, fallback text, hover states, note); responsive rules at 1023px, 767px, 430px breakpoints; RTL grid area mirroring; reduced-motion rules |

---

## 3. Design Decisions

### 3.1 Capabilities Section

- **Section mood**: Purple-accented dark background with radial gradients at 82% 6% and 8% 92%, matching the Services section's purple identity but with a distinct deeper tone
- **Featured card**: Large glass-surface card with `radial-gradient` accent, badge ("Core Capability"), display-font number, and top-padded body — mirrors the Services spotlight pattern
- **Supporting cards**: 2×2 grid with staggered `nth-child(2n)` vertical offset for editorial asymmetry, matching Services feature cards
- **Tag strip**: Pill-shaped tags with purple-tinted background and border, replacing the old marquee concept
- **WorkflowFlow**: Integrated below tag strip with top border separator, gradient variant, bilingual EN/AR nodes

### 3.2 WorkflowFlow

- **No structural changes** to the CSS-only node/connector rendering
- **Accessibility**: `role="list"` on flow container, `role="listitem"` on each node, `aria-label` prop for screen reader context
- **Bilingual nodes**: EN (Data → AI → Workflow → ERP → Outcome) and AR (البيانات → الذكاء الاصطناعي → سير العمل → ERP → النتيجة) with variant flags (gold, ai, accent)

### 3.3 Partners Section

- **Section mood**: Gold-accented dark background with centered radial gradient at 50% 0%, warm and trustworthy tone
- **Grid**: 3-column on desktop, 3 on tablet, 2 on mobile, 1 on small mobile — denser than the old `auto-fit` grid
- **Logo frame**: Elevated container with subtle gold-tinted border, `object-fit: contain` for resilient logo display
- **Logo fallback**: `onError` handler swaps to display-font partner name text in gold — no broken image icons
- **Hover**: Lift + gold glow + logo brightness boost + name color promotion
- **Note**: Italic muted closing statement below grid

### 3.4 Responsive & RTL

- **1023px**: Capabilities showcase collapses to 1fr 1fr, supporting offset removed; Partners stays 3-col
- **767px**: All sections stack to single column; Capabilities showcase becomes featured→supporting; Partners becomes 2-col
- **430px**: Partners becomes 1-col; Capabilities supporting becomes 1-col; featured padding reduced
- **RTL**: Capabilities showcase grid areas mirrored (supporting | featured); partner name letter-spacing normalized; badge letter-spacing normalized

### 3.5 Motion

- All motion classes use `is-visible` for visible-first rendering (no content hidden on load)
- `motion-clip-reveal` on heading blocks, `motion-fade-up` with `stagger-N` on cards, `motion-scale-in` on featured, `motion-fade-in` on workflow
- `prefers-reduced-motion: reduce` disables all transitions on featured, items, tags, partner cards, logos, and card-base

---

## 4. Data & Content Preservation

- **Capabilities**: CMS `marquee.items` from `useHomepageConfig` with bilingual `title_en/ar`, `description_en/ar`; fallback to 10 hardcoded capabilities; featured = index 0, supporting = indices 1–4, remaining = indices 5–9 as tags
- **Partners**: CMS partners from `usePartners` with fallback to 6 hardcoded partners (Eurofins, Orangetheory, Club Pilates, Safa, Vision, AlQalam); bilingual name resolution via `getBilingual`; logo from `logoUrl` (CMS) or `logo` (fallback import); website link with `openInNewTab` default true
- **WorkflowFlow**: Static bilingual node definitions, no external data dependency

---

## 5. Accessibility

| Feature | Implementation |
|---|---|
| Section landmarks | `<section>` with `aria-labelledby` pointing to `SectionHeading` id |
| WorkflowFlow | `role="list"` + `role="listitem"` + `aria-label` on flow container |
| Partner links | `aria-label` with "Visit {name} (opens in new tab)" pattern; `rel="noopener noreferrer"` |
| Partner grid | `role="list"` on grid, `role="listitem"` on each card |
| Logo images | `alt="{name} logo"`, `loading="lazy"`, `decoding="async"` |
| Logo fallback | `aria-hidden="true"` on text fallback (name is already in adjacent `partner-name` span) |
| Focus visible | Inherited from `card-base:focus-visible` (outline + offset) |
| Reduced motion | Transitions disabled for all interactive elements |

---

## 6. Scope Compliance

| Constraint | Status |
|---|---|
| No CMS/Leads/backend/API changes | ✅ Verified |
| No Hero/Automation/Case Studies/Insights/Careers/Contact/Footer changes | ✅ Verified |
| No new dependencies or animation libraries | ✅ Verified |
| No Lenis, pinned sections, or global GSAP/ScrollTrigger | ✅ Verified |
| All styles scoped to `.public-website-shell` | ✅ Verified |
| Existing data contracts and fallbacks preserved | ✅ Verified |
| Existing card primitives used (`card-base`, `card-surface-*`, `card-edge-*`, `card-hover-*`, `card-padding-*`) | ✅ Verified |
| Bilingual EN/AR support with `getBilingual` | ✅ Verified |
| RTL mirroring for grid areas and letter-spacing | ✅ Verified |

---

## 7. Build Verification

```
npm run build
✓ built in 9.87s
exit code: 0
```

No errors, no warnings beyond the existing chunk size notice (pre-existing, unrelated to this change).

---

## 8. Pending Items

- **Human visual approval**: Live browser QA deferred per user instruction. Code-based visual review completed via DOM structure, CSS inspection, responsive rules, and RTL compliance checks.
- **Live browser review**: Recommended to verify visual rendering, logo display quality, WorkflowFlow connector alignment, and RTL layout in both EN and AR modes.

---

## 9. Verdict

**PASS** — Implementation complete, build verified, scope compliance confirmed. Human visual approval pending.
