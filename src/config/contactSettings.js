/**
 * Contact configuration settings.
 *
 * This file centralizes contact-form behavior so values can later be
 * overridden by a CMS or admin settings fetch without touching component code.
 *
 * In production, the application should fetch the latest settings from the
 * backend/CMS and merge them on top of these defaults.
 */

const contactSettings = {
  // Default recipient for all contact form submissions.
  // Future CMS/Admin key: contact_settings.email_recipient
  emailRecipient: 'sidrahsoft@gmail.com',

  // Contact form configuration.
  form: {
    // Fields required by the current frontend form.
    requiredFields: ['inquiryType', 'name', 'email', 'message'],
  },
};

export default contactSettings;
