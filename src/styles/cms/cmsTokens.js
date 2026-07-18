/**
 * CMS Design Tokens
 *
 * Single source of truth for CMS visual identity.
 * Extracted from existing inline styles across CMS pages.
 * Premium enterprise dark theme with gold accent.
 */

export const tokens = {
  // Backgrounds
  bgPage: '#0a0a14',
  bgSurface: '#12121e',
  bgSurfaceAlt: '#1a1a2e',
  bgInput: '#0a0a14',
  bgHover: '#161624',

  // Borders
  borderSubtle: '#1e1e2e',
  borderDefault: '#2a2a3e',
  borderStrong: '#333',

  // Text
  textPrimary: '#e0e0e0',
  textSecondary: '#aaa',
  textMuted: '#888',
  textDim: '#555',

  // Accent (brand gold)
  accent: '#c9a96e',
  accentBg: 'rgba(201, 169, 110, 0.1)',
  accentBorder: 'rgba(201, 169, 110, 0.3)',
  accentHover: '#d4b878',

  // Status colors
  success: '#22c55e',
  successBg: 'rgba(34, 197, 94, 0.15)',
  successBorder: 'rgba(34, 197, 94, 0.3)',
  warning: '#f59e0b',
  warningBg: 'rgba(245, 158, 11, 0.15)',
  warningBorder: 'rgba(245, 158, 11, 0.3)',
  danger: '#ef4444',
  dangerBg: 'rgba(239, 68, 68, 0.1)',
  dangerBorder: 'rgba(239, 68, 68, 0.3)',
  info: '#3b82f6',
  infoBg: 'rgba(59, 130, 246, 0.15)',
  infoBorder: 'rgba(59, 130, 246, 0.3)',

  // Typography
  fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
  fontSizeXs: '0.6875rem',
  fontSizeSm: '0.75rem',
  fontSizeMd: '0.8125rem',
  fontSizeBase: '0.875rem',
  fontSizeLg: '1rem',
  fontSizeXl: '1.25rem',
  fontSize2xl: '1.5rem',
  fontWeightNormal: '400',
  fontWeightMedium: '500',
  fontWeightSemibold: '600',
  fontWeightBold: '700',

  // Spacing
  space1: '0.25rem',
  space2: '0.5rem',
  space3: '0.75rem',
  space4: '1rem',
  space5: '1.25rem',
  space6: '1.5rem',
  space8: '2rem',
  space10: '2.5rem',
  space12: '3rem',

  // Border radius
  radiusSm: '4px',
  radiusMd: '6px',
  radiusLg: '8px',
  radiusXl: '12px',

  // Shadows
  shadowSm: '0 1px 2px rgba(0,0,0,0.2)',
  shadowMd: '0 4px 6px rgba(0,0,0,0.3)',
  shadowLg: '0 10px 20px rgba(0,0,0,0.4)',

  // Focus ring
  focusRing: '0 0 0 2px rgba(201, 169, 110, 0.4)',

  // Breakpoints
  bpSm: 640,
  bpMd: 768,
  bpLg: 1024,
  bpXl: 1280,

  // Sidebar
  sidebarWidth: '240px',
  sidebarCollapsedWidth: '60px',

  // Transitions
  transitionFast: '150ms ease',
  transitionNormal: '250ms ease',
};

/**
 * Build a CSS custom properties string from tokens.
 * Used to inject tokens into a style element.
 */
export function tokensToCssVars(prefix = '--cms') {
  const cssVars = {};
  for (const [key, value] of Object.entries(tokens)) {
    const cssKey = `${prefix}-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    cssVars[cssKey] = value;
  }
  return cssVars;
}
