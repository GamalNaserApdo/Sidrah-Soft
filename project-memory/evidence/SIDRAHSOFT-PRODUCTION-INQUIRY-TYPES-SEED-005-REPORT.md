# SidrahSoft Production Inquiry Types Seed Report

**Task ID:** SIDRAHSOFT-PRODUCTION-INQUIRY-TYPES-SEED-005  
**Date:** 2026-07-21

---

## 1. Root Cause

The public contact form submits `inquiry_type` as a slug (e.g., `website-development`). The backend serializer uses `SlugRelatedField` with `queryset=InquiryType.objects.filter(is_active=True)`. After the Railway PostgreSQL migration ran, the `contact_inquirytype` table existed but contained no records, so any contact form submission with an `inquiry_type` value returned:

```text
Object with slug=website-development does not exist.
```

## 2. Files Changed

### Created

- `backend/apps/contact/management/commands/seed_inquiry_types.py`

### Modified

- `backend/start.sh` — added `python manage.py seed_inquiry_types` after migrations and before `collectstatic`

---

## 3. Exact Slugs Created

The seed command creates the same 7 inquiry types used by the frontend fallback in `src/components/sections/ContactSection.jsx`:

| Slug | English | Arabic | Order |
|---|---|---|---|
| `website-development` | Website Development | تطوير مواقع الويب | 0 |
| `mobile-applications` | Mobile Application | تطبيق جوال | 1 |
| `erp-business-system` | ERP / Business System | نظام تخطيط الموارد / نظام أعمال | 2 |
| `consultation` | Consultation | استشارة | 3 |
| `training` | Training | تدريب | 4 |
| `technical-support` | Technical Support | الدعم الفني | 5 |
| `other` | Other | أخرى | 6 |

---

## 4. Idempotency Behavior

The command uses `InquiryType.objects.update_or_create(slug=..., defaults=...)`.

- **First run:** creates the 7 records.
- **Subsequent runs:** updates only the seeded fields (`name_en`, `name_ar`, `order`, `is_active`) without deleting records or creating duplicates.
- **Manually edited records:** `update_or_create` preserves the object and updates only the listed defaults; no records are deleted.
- **Database IDs:** no hardcoded primary keys are used; slugs are the natural key.

---

## 5. Startup Integration

### `backend/start.sh`

```bash
#!/usr/bin/env bash
set -euo pipefail

echo "==> Running Django migrations..."
python manage.py migrate --noinput

echo "==> Seeding default inquiry types..."
python manage.py seed_inquiry_types

echo "==> Collecting static files..."
python manage.py collectstatic --noinput

echo "==> Starting Gunicorn server..."
exec gunicorn config.wsgi:application \
  --bind "0.0.0.0:${PORT:-8000}" \
  ...
```

The command runs on every Railway restart. Because it is idempotent, repeated execution is safe.

---

## 6. Validation Results

### `python manage.py check`

```text
System check identified no issues (0 silenced).
```

**Result: PASS**

### First `python manage.py seed_inquiry_types`

```text
Created inquiry type: website-development
Created inquiry type: mobile-applications
Created inquiry type: erp-business-system
Created inquiry type: consultation
Created inquiry type: training
Created inquiry type: technical-support
Created inquiry type: other
Seeded inquiry types: 7 created, 0 updated.
```

**Result: PASS**

### Second `python manage.py seed_inquiry_types`

```text
Updated inquiry type: website-development
Updated inquiry type: mobile-applications
Updated inquiry type: erp-business-system
Updated inquiry type: consultation
Updated inquiry type: training
Updated inquiry type: technical-support
Updated inquiry type: other
Seeded inquiry types: 0 created, 7 updated.
```

**Result: PASS — no duplicates created.**

---

## 7. GO / NO-GO Decision

**Decision: GO**

The `seed_inquiry_types` command is implemented, idempotent, and integrated into the production startup sequence. The contact form will now be able to submit `website-development` and the other required inquiry type slugs without receiving a "does not exist" error. No deployment has been performed.
