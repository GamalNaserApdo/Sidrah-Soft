# 06 · Visual Story Architecture

## Hero Philosophy
The hero is NOT a marketing banner, CTA section, or feature list.

The hero IS:
- Cinematic visual experience
- Brand impression engine
- Curiosity generator
- Scroll-driven visual story

## Requirements
- Minimal text
- Visual-first
- Cinematic transformation
- First 100vh–200vh may be used as a storytelling experience
- No hero CTAs or buttons
- No hero text overlays

## Visual Direction
Prefer:
- Abstract technology visuals
- Data networks
- Connected systems
- Digital infrastructure
- Enterprise technology visuals
- High-end custom visual assets

Avoid:
- Generic stock photos
- Smiling office teams
- Generic SaaS templates
- Typical corporate photography

## Reference Library
- `cinematic-landing-kit-main/` is a reference library, not the source of truth.
- Use only relevant patterns. Do not blindly inherit its assumptions.

## Official Hero Direction
- **Full narrative hero (Dormant → Purpose) is retired but retained as legacy assets.**
- **KF05 → KF06 is the official, locked hero visual.**
- This segment shows the strongest visual identity: Connection / Purpose golden network and environmental integration.
- The hero is a single 5.04s cinematic sequence rendered as a 121-frame scroll-driven animation.

## Official Hero Assets
- **Source clip:** `src/assets/hero/clips/hero_kf05_to_kf06_v1.mp4`
- **Desktop frames:** `src/assets/hero/frames-kf05kf06/` (121 frames, 1920×1080, WebP q85)
- **Mobile frames:** `src/assets/hero/frames-kf05kf06-mobile/` (121 frames, 960×540, WebP q80)

## STATUS
- Hero narrative / story arc: **APPROVED — KF05→KF06 locked**
- Asset generation approach: **APPROVED — Single source clip, linear frame extraction, 121 frames**
- Motion complexity level: **APPROVED — Scroll-driven canvas, 121 frames, no text/buttons**
- Key scenes / beats for the hero: **APPROVED — Connection → Purpose only**
- Reduced motion behavior: **APPROVED — Final frame static display**
- Fade into content: **APPROVED — Last 15% of scroll progress**
- Hero text / buttons: **APPROVED — None**
