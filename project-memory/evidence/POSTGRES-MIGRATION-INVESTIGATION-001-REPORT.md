# POSTGRES-MIGRATION-INVESTIGATION-001 REPORT

## Executive Recommendation

**APPROVED** — Migrating the SidrahSoft backend from MySQL to PostgreSQL is technically safe and architecturally sound at this stage. The current codebase is database-agnostic and PostgreSQL will provide better support for the CMS, LMS, reporting, and future AI features.

---

## 1. Current State

### 1.1. Settings

`f:\What_i_Made\New\sidrah_web\backend\config\settings.py:93-113`

```python
_DB_ENGINE = os.environ.get('DB_ENGINE', 'django.db.backends.mysql')
_DB_OPTIONS = (
    {
        'charset': 'utf8mb4',
        'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
    }
    if 'mysql' in _DB_ENGINE
    else {}
)

DATABASES = {
    'default': {
        'ENGINE': _DB_ENGINE,
        'NAME': os.environ.get('DB_NAME', 'sidrahsoft_cms'),
        'USER': os.environ.get('DB_USER', ''),
        'PASSWORD': os.environ.get('DB_PASSWORD', ''),
        'HOST': os.environ.get('DB_HOST', ''),
        'PORT': os.environ.get('DB_PORT', ''),
        'OPTIONS': _DB_OPTIONS,
    }
}
```

- **Current ENGINE**: `django.db.backends.mysql` (default fallback) read from `DB_ENGINE`.
- **MySQL-specific options**: `charset: utf8mb4` and `init_command: SET sql_mode='STRICT_TRANS_TABLES'` are only applied when the engine string contains `mysql`.
- **Default host**: `localhost`.
- **Default port**: from `.env` = `3306`.

### 1.2. Environment Files

`f:\What_i_Made\New\sidrah_web\backend\.env:6-11`

```
DB_ENGINE=django.db.backends.mysql
DB_NAME=sidrahsoft_cms
DB_USER=root
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=3306
```

`f:\What_i_Made\New\sidrah_web\backend\.env.example:6-11` — identical.

### 1.3. Dependencies

`f:\What_i_Made\New\sidrah_web\backend\requirements.txt:1-6`

```
Django>=5.1,<6.0
...
mysqlclient>=2.2.4
```

- Installed Django version: **5.2.16**.
- MySQL adapter: **mysqlclient 2.2.8**.
- No `psycopg2`, `psycopg`, or `dj-database-url` currently present.
- No `pyproject.toml` found in the repository.

### 1.4. Documentation

`f:\What_i_Made\New\sidrah_web\backend\README.md:3,31,55-59,95` references MySQL setup, `utf8mb4`, and port 3306.

---

## 2. Files Requiring Changes

| File | Why it changes |
| --- | --- |
| `f:\What_i_Made\New\sidrah_web\backend\requirements.txt` | Replace `mysqlclient` with `psycopg2-binary` or `psycopg[binary]`; optionally add `dj-database-url`. |
| `f:\What_i_Made\New\sidrah_web\backend\.env.example` | Update `DB_ENGINE`, `DB_PORT`, `DB_USER`, defaults for PostgreSQL. |
| `f:\What_i_Made\New\sidrah_web\backend\.env` | Same local overrides (kept out of version control). |
| `f:\What_i_Made\New\sidrah_web\backend\config\settings.py` | Update default `DB_ENGINE`, remove/reshape MySQL-specific `_DB_OPTIONS`, add PostgreSQL-friendly defaults (e.g. `conn_max_age`). |
| `f:\What_i_Made\New\sidrah_web\backend\README.md` | Replace MySQL instructions with PostgreSQL instructions. |

**No application source files need changes.** Models, migrations, admin, serializers, views, and management commands are database-agnostic.

---

## 3. Search Results (MySQL-Specific References)

Searched `f:\What_i_Made\New\sidrah_web\backend` for: `mysql`, `MySQL`, `mysqlclient`, `MariaDB`, `utf8mb4`, `3306`, `DATABASE_URL`.

Matches found in:

- `f:\What_i_Made\New\sidrah_web\backend\README.md` — documentation only.
- `f:\What_i_Made\New\sidrah_web\backend\config\settings.py:93-101` — engine default and MySQL-specific options.
- `f:\What_i_Made\New\sidrah_web\backend\.env` — environment values.
- `f:\What_i_Made\New\sidrah_web\backend\.env.example` — environment examples.
- `f:\What_i_Made\New\sidrah_web\backend\requirements.txt:6` — `mysqlclient` dependency.

No matches found inside:

- App `models.py` files
- App `admin.py` files
- App `views.py` / `serializers.py` files
- Migrations
- Management commands

Specifically, migration search for `RawSQL`, `mysql`, `utf8mb4`, `sql_mode`, `RunSQL`, `RunPython` returned **no results**.

---

## 4. Migration Agnosticity / Risk Analysis

### 4.1. Existing Migrations Reviewed

- `f:\What_i_Made\New\sidrah_web\backend\apps\accounts\migrations\0001_initial.py`
- `f:\What_i_Made\New\sidrah_web\backend\apps\media_library\migrations\0001_initial.py`
- `f:\What_i_Made\New\sidrah_web\backend\apps\navigation\migrations\0001_initial.py`
- `f:\What_i_Made\New\sidrah_web\backend\apps\site_settings\migrations\0001_initial.py`
- `f:\What_i_Made\New\sidrah_web\backend\apps\site_settings\migrations\0002_sitesetting_address_and_more.py`

All migrations use standard Django operations (`CreateModel`, `AddField`, `AlterField`) with standard model fields. No raw SQL, no database-specific indexes, no `RunSQL`, no `RunPython`, no vendor-specific types.

### 4.2. Model Field Compatibility

| Feature | PostgreSQL support | Notes |
| --- | --- | --- |
| `BigAutoField` | Yes | Native `bigint`. |
| `CharField`, `TextField` | Yes | No `utf8mb4` concern; UTF-8 default. |
| `EmailField`, `URLField` | Yes | Stored as `varchar` with validation in Django. |
| `BooleanField` | Yes | Native `boolean`. |
| `DateTimeField` | Yes | Strong `timestamptz` support. |
| `PositiveIntegerField` | Yes | `integer` with CHECK constraint. |
| `DecimalField` | Yes | Native `numeric`. |
| `JSONField` | Yes | Native `jsonb` in PostgreSQL vs JSON/text fallback in older MySQL. |
| `FileField` | Yes | Path storage is DB-agnostic. |
| `ForeignKey` with `SET_NULL` | Yes | Fully supported. |
| `ManyToManyField` (auth groups/permissions) | Yes | Django handles the through table. |
| `AbstractUser` subclass | Yes | Standard auth tables. |

### 4.3. Risks

| Risk | Severity | Mitigation |
| --- | --- | --- |
| MySQL-specific `_DB_OPTIONS` | Low | Already conditional; removing/changing is trivial. |
| `mysqlclient` removal | Low | Replace with `psycopg2-binary` or `psycopg[binary]`. |
| `JSONField` behavior differences | Low | PostgreSQL uses native `jsonb`; better indexing/query support. No negative impact expected. |
| Existing MySQL data migration | None currently | MySQL was never actually populated. Plan is to create a fresh PostgreSQL database and run migrations. |
| Future third-party apps assuming MySQL | Medium (future) | Vet any future packages for PostgreSQL compatibility before adding. |

---

## 5. PostgreSQL Compatibility Status

| Component | Status |
| --- | --- |
| Django 5.2.x | ✅ Supported (PostgreSQL 12–16) |
| Django 6.x (future) | ✅ Expected; recommend PostgreSQL 16+ |
| Django REST Framework 3.15+ | ✅ Database-agnostic |
| django-cors-headers | ✅ Database-agnostic |
| Custom User model (`accounts.User`) | ✅ Compatible |
| Site settings module | ✅ Compatible |
| Media library module | ✅ Compatible |
| Navigation module | ✅ Compatible |
| Roles system | ✅ Compatible |

---

## 6. Architecture Review — Why PostgreSQL

| Future Capability | PostgreSQL Advantage |
| --- | --- |
| CMS | Native `jsonb` for flexible content blocks; full-text search (`tsvector`) for content search. |
| Academy / LMS | Robust transactional integrity for enrollments, progress tracking, certificates. |
| Certificates | Immutable audit-friendly storage; JSONB metadata. |
| Learning Paths | CTEs and recursive queries for path prerequisites. |
| Student Progress | Time-series-friendly via `GENERATED` columns or TimescaleDB extension. |
| Analytics / Reporting | Window functions, advanced aggregations, materialized views. |
| AI integrations | `pgvector` extension for vector embeddings and similarity search. |

PostgreSQL is a better long-term fit than MySQL for this roadmap.

---

## 7. Recommended PostgreSQL Version

**PostgreSQL 16 or 17**.

- PostgreSQL 16 is fully supported by Django 5.2 and provides good performance and extension support.
- PostgreSQL 17 is current stable and also safe if the hosting provider supports it.
- For managed cloud (AWS RDS, Azure, GCP Cloud SQL), PostgreSQL 16 is the safest choice today.

---

## 8. Required Python Dependencies

Replace in `requirements.txt`:

```
mysqlclient>=2.2.4
```

With one of:

```
psycopg2-binary>=2.9.10
```

or the modern v3 binary package:

```
psycopg[binary]>=3.2.0
```

Optional but recommended for production:

```
dj-database-url>=2.2.0
```

**No other dependency changes are needed.**

---

## 9. Exact Migration Plan

### Phase 1 — Preparation

1. **Backup** current code state (already versioned).
2. Create a fresh feature branch for the migration.
3. Confirm no existing MySQL data needs to be migrated (current MySQL was never successfully used).

### Phase 2 — Code Changes

1. Update `f:\What_i_Made\New\sidrah_web\backend\requirements.txt`:
   - Remove `mysqlclient>=2.2.4`.
   - Add `psycopg2-binary>=2.9.10` (or `psycopg[binary]>=3.2.0`).
2. Update `f:\What_i_Made\New\sidrah_web\backend\.env.example`:
   - `DB_ENGINE=django.db.backends.postgresql`
   - `DB_PORT=5432`
   - `DB_USER=sidrahsoft` (or local default)
   - `DB_PASSWORD=secure-password`
   - `DB_HOST=localhost`
3. Update local `f:\What_i_Made\New\sidrah_web\backend\.env` with the same values.
4. Update `f:\What_i_Made\New\sidrah_web\backend\config\settings.py`:
   - Change `_DB_ENGINE` default to `django.db.backends.postgresql`.
   - Remove or simplify `_DB_OPTIONS` block (PostgreSQL does not need `utf8mb4` or `sql_mode`).
   - Optionally add `'CONN_MAX_AGE': 600` for connection pooling.
5. Update `f:\What_i_Made\New\sidrah_web\backend\README.md`:
   - Replace MySQL setup instructions with PostgreSQL equivalents.

### Phase 3 — Environment Setup

1. Install PostgreSQL 16/17 locally or provision a managed instance.
2. Create database and user:

   ```sql
   CREATE USER sidrahsoft WITH PASSWORD 'secure-password';
   CREATE DATABASE sidrahsoft_cms OWNER sidrahsoft ENCODING 'UTF8' LC_COLLATE='en_US.UTF-8' LC_CTYPE='en_US.UTF-8';
   ```

3. Create the virtual environment (or reuse existing) and install updated requirements:

   ```powershell
   pip install -r requirements.txt
   ```

### Phase 4 — Apply Migrations and Validate

1. Run checks:

   ```powershell
   python manage.py check
   ```

2. Create migrations if needed:

   ```powershell
   python manage.py makemigrations
   ```

3. Apply migrations:

   ```powershell
   python manage.py migrate
   ```

4. Seed default data:

   ```powershell
   python manage.py seed_site_settings
   ```

5. Create superuser:

   ```powershell
   python manage.py createsuperuser
   ```

6. Run server and verify endpoints:

   ```powershell
   python manage.py runserver
   ```

   Test:

   - `GET http://127.0.0.1:8000/api/v1/health/`
   - `GET http://127.0.0.1:8000/api/v1/site-settings/`
   - `/admin` login

### Phase 5 — Cleanup

1. Delete any stale SQLite test databases if still present.
2. Verify no `mysqlclient` remains installed.
3. Merge feature branch.

---

## 10. APPROVED / NOT APPROVED

**APPROVED** for migration.

Rationale:

- Codebase is 100% database-agnostic.
- No existing production data in MySQL to migrate.
- PostgreSQL is a stronger strategic fit for CMS, LMS, analytics, and AI features.
- Migration is low-risk and reversible by reverting settings/requirements.

---

## 11. Pending Decisions

| # | Decision | Recommendation |
| --- | --- | --- |
| 1 | PostgreSQL adapter | Use `psycopg2-binary` for simplicity; consider `psycopg[binary]` v3 for new projects. |
| 2 | `dj-database-url` | Optional now; add later if moving to container/cloud platforms. |
| 3 | Connection pooling | Add `CONN_MAX_AGE` in settings after migration for production. |
| 4 | Managed vs local PostgreSQL | Use local PostgreSQL for development; plan managed service (RDS/Cloud SQL/Azure Database) for production. |
| 5 | Migration timing | Execute when ready; no external blockers identified. |
