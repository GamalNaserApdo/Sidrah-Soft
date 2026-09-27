/**
 * Scroll to the registration form section on the current page.
 * Used by all CTA buttons to navigate to the native form.
 */
export function scrollToRegistrationForm() {
  const form = document.getElementById('course-registration-form');
  if (form) {
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Focus the first input for accessibility
    setTimeout(() => {
      const firstInput = form.querySelector('input:not([type="hidden"]):not([tabindex="-1"])');
      if (firstInput) firstInput.focus({ preventScroll: true });
    }, 500);
  }
}

/**
 * Handle CTA click — scrolls to the registration form.
 * Falls back to the external URL if the form is not present on the page.
 */
export function handleRegisterClick(e, fallbackUrl) {
  const form = document.getElementById('course-registration-form');
  if (form) {
    e.preventDefault();
    scrollToRegistrationForm();
  } else if (fallbackUrl) {
    // Form not found — let the link work normally
    return;
  } else {
    e.preventDefault();
  }
}
