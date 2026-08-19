# SIDRAHSOFT-ARABIC-HERO-RTL-ALIGNMENT-FIX-001-REPORT

**Task ID:** `SIDRAHSOFT-ARABIC-HERO-RTL-ALIGNMENT-FIX-001`  
**Date:** 2026-08-19  
**Repository root:** `F:\What_i_Made\New\sidrah_web`

---

## 1. Root cause

The Arabic Hero was using the wrong `align-items` value for RTL.

`.hero-content-overlay` is a `flex-direction: column` container where the cross-axis is horizontal. In `dir="rtl"`, the flex cross-axis starts on the **right** side. The previous CSS used `align-items: flex-end` for RTL, which placed the content at the **left** end of the cross-axis (`end` in RTL = left). This made the entire Hero content block stay on the left and read as an LTR composition.

The fix is to use `align-items: flex-start` for RTL, which in `dir="rtl"` means the **right** side.

## 2. Files modified

- `src/styles/hero.css`

## 3. Exact RTL positioning change

1. Added `text-align: start;` to `.hero-content` so all hero copy is direction-aware (left in LTR, right in RTL) without explicitly overriding other sections.

2. Changed the RTL override:

```css
/* before */
[dir='rtl'] .hero-content-overlay {
  align-items: flex-end;  /* wrong: flex-end is left in RTL */
}

/* after */
[dir='rtl'] .hero-content-overlay {
  align-items: flex-start; /* correct: flex-start is right in RTL */
}
```

3. In the mobile breakpoint, kept the flex alignment centered for responsiveness but added `text-align: right;` to the RTL overlay so Arabic text still anchors to the right on small screens.

## 4. Arabic desktop result

**PASS.**

At `1440×900` and `1920×1080` the Hero content block is now anchored to the **right** side. The eyebrow, headline, supporting paragraph, CTA group, and capability/meta line all begin from the right and form a coherent RTL composition. The CTA arrow is mirrored for RTL and the primary/secondary buttons order correctly from right to left.

## 5. Arabic mobile result

**PASS.**

At `390×844` the Arabic Hero text aligns to the right, fits within the viewport, CTA buttons stack correctly, and there is no horizontal overflow.

## 6. English regression check

**PASS — English Hero unchanged.**

The LTR Hero composition remains identical: content stays anchored to the left, headline, paragraph, CTA group, and capability line all begin from the left.

## 7. Build result

`npm run build` completed successfully:

- 216 modules transformed
- `✓ built in 9.77s`
- only pre-existing chunk-size warning remains

## 8. Remaining issues

None for this focused Hero RTL alignment. The `dist/` output is generated and ignored by `.gitignore`. No commit or push was performed.

---

**Visual evidence:**
- `project-memory/evidence/hero-arabic-desktop.png`
- `project-memory/evidence/hero-arabic-wide.png`
- `project-memory/evidence/hero-arabic-mobile.png`
- `project-memory/evidence/hero-english-desktop.png`
