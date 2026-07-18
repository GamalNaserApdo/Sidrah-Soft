# Contact Email Architecture

## Current Frontend Behavior

The Contact form is currently frontend-only. On submit, it builds a structured payload and logs it to the console. No backend endpoint or email service is wired yet.

The form collects:
- Inquiry type
- Name
- Email
- Phone (optional)
- Company / Organization (optional)
- Message

## Default Recipient Email

`sidrahsoft@gmail.com`

This value is stored in the centralized configuration file:
`src/config/contactSettings.js`

## Configuration Structure

```js
const contactSettings = {
  emailRecipient: 'sidrahsoft@gmail.com',
  form: {
    requiredFields: ['inquiryType', 'name', 'email', 'message'],
  },
};
```

## Future CMS Editable Setting

The default value is intended to be overridden by a CMS/Admin setting.

Suggested admin setting key:

```
contact_settings.email_recipient
```

Future implementation options:
1. Fetch settings at build time and generate `src/config/contactSettings.js` dynamically.
2. Fetch settings at runtime from an API endpoint (e.g., `/api/settings/contact`) and merge them into the config object.
3. Server-render the value into the page or inject it via environment variable at build time.

The component must always fall back to the default value if the CMS setting is unavailable.

## Contact Submission Payload

The frontend now builds the following payload on submit:

```json
{
  "name": "string",
  "email": "string",
  "company": "string",
  "inquiryType": "string",
  "message": "string",
  "phone": "string",
  "recipientEmail": "sidrahsoft@gmail.com"
}
```

## Expected Backend Email Flow

1. User submits the Contact form.
2. Frontend sends `POST /api/contact` with the payload.
3. Backend validates the payload (name, email, inquiry type, message).
4. Backend reads the recipient email from the CMS/Admin settings (`contact_settings.email_recipient`).
5. Backend sends an email to the configured recipient using the organization's email service.
6. Backend may also send a confirmation email to the user.
7. Backend returns a success response; frontend shows the thank-you state.

## Security Notes

- The recipient email must be controlled from the admin/CMS settings only.
- The frontend may include `recipientEmail` in the payload for logging or preview purposes, but the production backend must never trust this value from the client.
- Always validate and sanitize user inputs on the backend.
- Do not expose SMTP credentials, API keys, or secrets in frontend code or repositories.
- Rate-limit the contact endpoint to prevent abuse.

## Files Involved

- `src/config/contactSettings.js` — centralized default settings
- `src/components/sections/ContactSection.jsx` — contact form and payload builder
