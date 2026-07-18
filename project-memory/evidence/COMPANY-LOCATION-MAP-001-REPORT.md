# COMPANY-LOCATION-MAP-001 REPORT

## Files Created

- `f:\What_i_Made\New\sidrah_web\src\data\company\companyLocation.js` — centralized company location data
- `f:\What_i_Made\New\sidrah_web\src\components\location\CompanyLocationCard.jsx` — reusable glass-style location card with embedded map

## Files Modified

- `f:\What_i_Made\New\sidrah_web\src\components\sections\ContactSection.jsx` — added `CompanyLocationCard` below the contact form
- `f:\What_i_Made\New\sidrah_web\src\components\Footer.jsx` — added a subtle Google Maps location link in the contact column
- `f:\What_i_Made\New\sidrah_web\src\styles\global.css` — added premium dark/glass styles for the location card and responsive rules

---

## Where the Map/Location Appears

1. **Contact Section** — a full-width glass card appears below the inquiry form. It includes:
   - Embedded Google Maps iframe with a dark, desaturated treatment
   - Company name and address
   - Phone, email, and working hours
   - "Open in Google Maps" button

2. **Footer** — the contact column now ends with a subtle link to the Google Maps location using the company address.

---

## CMS Readiness

All location values live in `src/data/company/companyLocation.js`:

```js
{
  companyName,
  address,
  googleMapsUrl,
  mapEmbedUrl,
  latitude,
  longitude,
  phone,
  email,
  workingHours,
  seoLocationTitle,
  seoLocationDescription,
}
```

The component consumes this object directly, so replacing the data file with a CMS fetch later requires no JSX changes. The shape is designed to mirror a future API response.

---

## Placeholder/Final Location Values Used

- **Company name:** Sidrah Soft
- **Address:** Riyadh, Saudi Arabia
- **Google Maps URL:** search query for Riyadh, Saudi Arabia
- **Map embed URL:** Google Maps embed centered on Riyadh
- **Coordinates:** latitude `24.7136`, longitude `46.6753`
- **Phone:** `+966 50 000 0000`
- **Email:** `sidrahsoft@gmail.com`
- **Working hours:** Sun - Thu, 9:00 AM - 5:00 PM
- **SEO title/description:** included for future location page use

When the final office address is confirmed, only `companyLocation.js` needs to be updated.

---

## Visual Direction

- Premium dark enterprise style with glassmorphism (`backdrop-filter: blur`).
- Map iframe is desaturated and dimmed so it does not look like a default iframe.
- Soft border, rounded corners, and the existing purple accent for the CTA link.
- Hover state slightly brightens the map and link background.
- Responsive: map height reduces and meta stacks vertically on mobile.

---

## Validation

Ran:

```bash
npm run build
```

Result: **success**, exit code `0`.

Dev-server verification confirmed:

- `/` works — no page errors
- `/training` works — no page errors
- `/case-studies` works — no page errors
- Contact section still works
- Footer still works
- No console/build errors

---

## Issues Found

None.

---

## Final Status

**Complete.** A reusable, CMS-ready company location card has been added to the Contact section and Footer, styled to match the premium SidrahSoft dark identity, with all location data cleanly separated from JSX.
