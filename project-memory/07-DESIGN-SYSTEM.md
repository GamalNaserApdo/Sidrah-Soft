# 07 · Design System

## Visual Identity
See `05-BRAND-DNA.md`.

## Color Palette
Primary logo colors (from `src/assets/logo.svg`):
- Red: `#ee3224`
- Green: `#70bf44`
- Yellow: `#f9bd15`
- Purple: `#8d51a0`

## Design System Details
- Neutral palette: **STATUS: PENDING DECISION**
- Typography scale: **STATUS: PENDING DECISION**
- Spacing scale: **STATUS: PENDING DECISION**
- Component library: **STATUS: PENDING DECISION**
- Iconography style: **STATUS: PENDING DECISION**
- Grid system: **STATUS: PENDING DECISION**
- Breakpoints: **STATUS: PENDING DECISION**
- Shadow / elevation system: **STATUS: PENDING DECISION**

## Accessibility
- Contrast requirements: **STATUS: PENDING DECISION**
- Motion preferences handling: **APPROVED — `prefers-reduced-motion: reduce` displays final KF05→KF06 frame statically, no scroll animation**
- RTL readiness: **STATUS: PENDING DECISION** (future Arabic support required)

## Motion Preferences (Implemented)
- `prefers-reduced-motion: reduce` skips the scroll-driven canvas sequence.
- Only the final frame (index 120) is loaded and displayed.
- No scroll indicator, no scroll-triggered animation.

## Animation Guidelines
- Performance is more important than effects.
- Animations must not harm SEO, accessibility, mobile experience, or Core Web Vitals.
