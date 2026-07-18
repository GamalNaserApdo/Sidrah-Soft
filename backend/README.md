# SidrahSoft CMS Backend

Django + PostgreSQL CMS backend for the SidrahSoft website rebuild.

## Project Structure

```
backend/
├── manage.py
├── requirements.txt
├── .env.example
├── README.md
├── config/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
└── apps/
    ├── __init__.py
    ├── core/
    ├── accounts/
    ├── site_settings/
    ├── navigation/
    └── media_library/
```

## Requirements

- Python 3.10+
- PostgreSQL 16 or 17
- pip + virtualenv

## Local Setup

1. Create and activate a virtual environment:

   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```

2. Install dependencies:

   ```powershell
   pip install -r requirements.txt
   ```

3. Copy the example environment file and fill in your values:

   ```powershell
   cp .env.example .env
   ```

4. Create the PostgreSQL user and database:

   ```sql
   CREATE USER sidrahsoft_user WITH PASSWORD 'YOUR_SECURE_PASSWORD';

   CREATE DATABASE sidrahsoft_db
       OWNER sidrahsoft_user
       ENCODING 'UTF8';

   GRANT ALL PRIVILEGES
       ON DATABASE sidrahsoft_db
       TO sidrahsoft_user;
   ```

5. Install dependencies:

   ```powershell
   python -m pip install -r requirements.txt
   ```

6. Run migrations:

   ```powershell
   python manage.py check
   python manage.py migrate
   ```

7. Create a superuser if one does not already exist:

   ```powershell
   python manage.py createsuperuser
   ```

8. Start the development server:

   ```powershell
   python manage.py runserver
   ```

## Available API Endpoints

- `GET /api/v1/health/` — Health check
- `GET /api/v1/site-settings/` — Public site settings
- `GET /api/v1/navigation/` — List all active navigation menus (optionally `?location=header|footer|mobile|legal`)
- `GET /api/v1/navigation/<slug>/` — Detail a single menu by slug

Admin panel: `http://127.0.0.1:8000/admin/`

Seed commands (idempotent):

```powershell
python manage.py seed_site_settings
python manage.py seed_navigation
```

## Environment Variables

See `.env.example` for all available options.

Key variables:

- `SECRET_KEY` — Django secret key (keep private)
- `DEBUG` — `True` or `False`
- `ALLOWED_HOSTS` — Comma-separated list
- `CORS_ALLOWED_ORIGINS` — Comma-separated list of frontend origins
- `DB_*` — PostgreSQL connection settings
- `DEFAULT_LANGUAGE` / `SUPPORTED_LANGUAGES` — Language foundation

## Apps Overview

| App | Purpose |
| --- | --- |
| `core` | Shared abstract models and health-check endpoint |
| `accounts` | Custom user model with role foundation |
| `site_settings` | Global site configuration |
| `navigation` | Header/footer menus and links |
| `media_library` | Reusable media assets |

## Notes

- The backend is intentionally lightweight at this stage. CMS content apps (services, partners, case studies, insights, etc.) will be added in later tasks.
- Keep all real secrets inside `.env` and never commit them.
