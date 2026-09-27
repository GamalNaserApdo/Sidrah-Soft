/**
 * Shared price formatting utility for course landing pages.
 *
 * Usage:
 *   formatPrice(6000, 'ar') -> "6,000 جنيه مصري"
 *   formatPrice(6000, 'en') -> "EGP 6,000"
 *   formatPrice(6000, 'ar', true) -> "6,000 ج.م" (compact for sticky bar)
 */
export function formatPrice(amount, lang = 'en', compact = false) {
  if (amount === null || amount === undefined || amount === '') return '';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '';
  const formatted = new Intl.NumberFormat('en-US').format(num);
  const isAr = lang === 'ar';
  if (compact) {
    return isAr ? `${formatted} ج.م` : `EGP ${formatted}`;
  }
  return isAr ? `${formatted} جنيه مصري` : `EGP ${formatted}`;
}

/**
 * Format price for sticky bar (compact mode).
 */
export function formatStickyPrice(amount, lang = 'en') {
  return formatPrice(amount, lang, true);
}
