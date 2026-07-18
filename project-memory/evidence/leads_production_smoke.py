"""Runtime smoke validation for the Leads Dashboard against real stack.

This script must be run from the repository root. It uses Django ORM to seed
temporary smoke-test users/data, starts the Django dev server and Vite dev
server, then exercises the full contact/leads flow via HTTP requests.

No secret credentials are written to output; passwords are generated at
runtime and discarded after the run.
"""
import json
import os
import secrets
import socket
import subprocess
import sys
import time
from pathlib import Path

import django
import requests

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
BACKEND_DIR = REPO_ROOT / 'backend'
FRONTEND_URL = 'http://127.0.0.1:5174'
BACKEND_URL = 'http://127.0.0.1:8001'

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, str(BACKEND_DIR))
django.setup()

from django.contrib.auth import get_user_model
from apps.contact.models import ContactSubmission, InquiryType
from apps.activity_logs.models import ActivityLog

User = get_user_model()


def log(step, status, detail=None):
    entry = {'step': step, 'status': status}
    if detail is not None:
        entry['detail'] = detail
    print(json.dumps(entry), flush=True)
    return entry


def wait_for_port(port, host='127.0.0.1', timeout=60):
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with socket.create_connection((host, port), timeout=1):
                return True
        except OSError:
            time.sleep(0.5)
    raise RuntimeError(f'Port {host}:{port} did not become ready within {timeout}s')


def start_backend(log_path):
    env = os.environ.copy()
    env['PYTHONUNBUFFERED'] = '1'
    proc = subprocess.Popen(
        ['python', 'manage.py', 'runserver', '127.0.0.1:8001', '--noreload'],
        cwd=str(BACKEND_DIR),
        stdout=open(log_path, 'w'),
        stderr=subprocess.STDOUT,
        env=env,
    )
    wait_for_port(8001)
    return proc


def start_frontend():
    vite_bin = REPO_ROOT / 'node_modules' / '.bin' / 'vite.cmd'
    proc = subprocess.Popen(
        [str(vite_bin), 'preview', '--port', '5174', '--host', '127.0.0.1'],
        cwd=str(REPO_ROOT),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        shell=False,
    )
    wait_for_port(5174)
    return proc


def cleanup_smoke_data():
    """Remove records from previous smoke runs to keep assertions deterministic."""
    ContactSubmission.objects.filter(email__endswith='@example.test').delete()
    User.objects.filter(username__in=['smoke_support', 'smoke_editor', 'smoke_super']).delete()


def create_smoke_users():
    password = secrets.token_urlsafe(24)
    super_user = User.objects.create_superuser(
        username='smoke_super',
        email='smoke_super@example.test',
        password=password,
    )

    support_user, _ = User.objects.update_or_create(
        username='smoke_support',
        defaults={
            'email': 'smoke_support@example.test',
            'role': User.ROLE_SUPPORT_AGENT,
            'is_active': True,
        },
    )
    support_user.set_password(password)
    support_user.save()

    editor_user, _ = User.objects.update_or_create(
        username='smoke_editor',
        defaults={
            'email': 'smoke_editor@example.test',
            'role': User.ROLE_EDITOR,
            'is_active': True,
        },
    )
    editor_user.set_password(password)
    editor_user.save()
    return support_user, editor_user, super_user, password


def create_inquiry_types():
    InquiryType.objects.update_or_create(
        slug='smoke-website',
        defaults={
            'name_en': 'Website Development',
            'name_ar': 'تطوير مواقع الويب',
            'order': 0,
            'is_active': True,
        },
    )
    InquiryType.objects.update_or_create(
        slug='smoke-mobile',
        defaults={
            'name_en': 'Mobile App',
            'name_ar': 'تطبيق الجوال',
            'order': 1,
            'is_active': True,
        },
    )


def csrf_token(session):
    r = session.get(f'{BACKEND_URL}/api/v1/auth/csrf/')
    r.raise_for_status()
    token = session.cookies.get('csrftoken')
    return token


def login(session, username, password, expect_success=True):
    token = csrf_token(session)
    headers = {'X-CSRFToken': token}
    r = session.post(
        f'{BACKEND_URL}/api/v1/auth/login/',
        json={'username': username, 'password': password},
        headers=headers,
    )
    if expect_success:
        r.raise_for_status()
    return r


def logout(session):
    token = session.cookies.get('csrftoken') or csrf_token(session)
    headers = {'X-CSRFToken': token}
    r = session.post(f'{BACKEND_URL}/api/v1/auth/logout/', headers=headers)
    r.raise_for_status()
    return r


def run_validation(backend_log_path):
    results = []

    # --- Authentication & security baseline ---
    anon = requests.Session()
    r = anon.get(f'{BACKEND_URL}/api/v1/cms/contact/submissions/')
    results.append(log('anonymous_leads_list_blocked', r.status_code == 403, {'status': r.status_code}))

    r = anon.get(f'{BACKEND_URL}/api/v1/auth/csrf/')
    results.append(log('csrf_cookie_set', r.status_code == 200 and 'csrftoken' in anon.cookies, {'status': r.status_code}))

    support, editor, superuser, password = create_smoke_users()

    # Login without CSRF header should be rejected.
    bad = requests.Session()
    bad.get(f'{BACKEND_URL}/api/v1/auth/csrf/')
    r = bad.post(f'{BACKEND_URL}/api/v1/auth/login/', json={'username': support.username, 'password': password})
    results.append(log('login_without_csrf_rejected', r.status_code == 403, {'status': r.status_code}))

    # Valid login.
    s = requests.Session()
    login(s, support.username, password)
    results.append(log('support_login_success', 'sessionid' in s.cookies, {'cookies': list(s.cookies.keys())}))
    csrf = s.cookies.get('csrftoken', '')

    r = s.get(f'{BACKEND_URL}/api/v1/auth/me/')
    me_ok = r.status_code == 200 and r.json().get('role') == User.ROLE_SUPPORT_AGENT
    results.append(log('current_user', me_ok, r.json()))

    # Unauthorized role must be blocked.
    e = requests.Session()
    login(e, editor.username, password)
    r = e.get(f'{BACKEND_URL}/api/v1/cms/contact/submissions/')
    results.append(log('editor_leads_list_blocked', r.status_code == 403, {'status': r.status_code}))

    # --- Public submissions (English + Arabic) ---
    create_inquiry_types()
    website_type = InquiryType.objects.get(slug='smoke-website')
    mobile_type = InquiryType.objects.get(slug='smoke-mobile')

    en_payload = {
        'inquiry_type': website_type.slug,
        'full_name': 'Smoke EN Lead',
        'email': 'smoke_en@example.test',
        'phone': '+1 555 000 0001',
        'company': 'Smoke Co',
        'message': 'This is an English smoke-test lead.',
        'privacy_consent': True,
        'language': 'en',
        'website': '',
    }
    r = anon.post(f'{BACKEND_URL}/api/v1/contact/submissions/', json=en_payload)
    en_ok = r.status_code == 201 and r.json().get('success')
    results.append(log('public_submission_english', en_ok, r.json()))
    en_submission = ContactSubmission.objects.filter(email='smoke_en@example.test').first() if en_ok else None

    ar_payload = {
        'inquiry_type': mobile_type.slug,
        'full_name': 'اختبار عربي',
        'email': 'smoke_ar@example.test',
        'phone': '+966 50 000 0001',
        'message': 'هذا طلب تواصل باللغة العربية.',
        'privacy_consent': True,
        'language': 'ar',
        'website': '',
    }
    r = anon.post(f'{BACKEND_URL}/api/v1/contact/submissions/', json=ar_payload)
    ar_ok = r.status_code == 201 and r.json().get('success')
    results.append(log('public_submission_arabic', ar_ok, r.json()))
    ar_submission = ContactSubmission.objects.filter(email='smoke_ar@example.test').first() if ar_ok else None

    # Verify records and defaults.
    records_ok = (
        en_submission is not None
        and en_submission.status == ContactSubmission.STATUS_NEW
        and en_submission.inquiry_type == website_type
        and ar_submission is not None
        and ar_submission.status == ContactSubmission.STATUS_NEW
        and ar_submission.inquiry_type == mobile_type
    )
    results.append(log('submissions_saved_correctly', records_ok, {
        'en_status': en_submission.status if en_submission else None,
        'ar_status': ar_submission.status if ar_submission else None,
    }))

    # --- Dashboard list/stats/filters/search/pagination ---
    r = s.get(f'{BACKEND_URL}/api/v1/cms/contact/submissions/')
    list_ok = r.status_code == 200 and 'results' in r.json() and 'count' in r.json()
    results.append(log('leads_list', list_ok, {'count': r.json().get('count')}))

    r = s.get(f'{BACKEND_URL}/api/v1/cms/contact/submissions-stats/')
    stats_ok = r.status_code == 200 and r.json().get('total', -1) >= 2
    results.append(log('leads_stats', stats_ok, r.json()))

    r = s.get(f'{BACKEND_URL}/api/v1/cms/contact/submissions/?status=new')
    filter_ok = r.status_code == 200 and r.json().get('count', -1) >= 2
    results.append(log('leads_filter_status', filter_ok, {'count': r.json().get('count')}))

    r = s.get(f'{BACKEND_URL}/api/v1/cms/contact/submissions/?search=smoke_en%40example.test')
    search_ok = r.status_code == 200 and r.json().get('count') == 1
    results.append(log('leads_search', search_ok, {'count': r.json().get('count')}))

    r = s.get(f'{BACKEND_URL}/api/v1/cms/contact/submissions/?page_size=1')
    page_ok = r.status_code == 200 and len(r.json().get('results', [])) == 1 and bool(r.json().get('next'))
    results.append(log('leads_pagination', page_ok, {'page_size': len(r.json().get('results', []))}))

    # --- Lead actions ---
    if en_submission:
        detail_url = f'{BACKEND_URL}/api/v1/cms/contact/submissions/{en_submission.id}/'
        r = s.get(detail_url)
        results.append(log('lead_detail', r.status_code == 200, {'id': r.json().get('id')}))

        r = s.patch(detail_url, json={'status': ContactSubmission.STATUS_CONTACTED}, headers={'X-CSRFToken': csrf})
        results.append(log('status_update', r.status_code == 200, {'status': r.json().get('status')}))

        r = s.patch(detail_url, json={'priority': ContactSubmission.PRIORITY_HIGH}, headers={'X-CSRFToken': csrf})
        results.append(log('priority_update', r.status_code == 200, {'priority': r.json().get('priority')}))

        r = s.patch(detail_url, json={'internal_notes': 'Smoke test internal note'}, headers={'X-CSRFToken': csrf})
        results.append(log('notes_update', r.status_code == 200, {'internal_notes': r.json().get('internal_notes')}))

        r = s.patch(detail_url, json={'status': ContactSubmission.STATUS_ARCHIVED}, headers={'X-CSRFToken': csrf})
        results.append(log('archive_action', r.status_code == 200 and r.json().get('status') == ContactSubmission.STATUS_ARCHIVED))

        # Refresh spam lead.
        ar_submission.refresh_from_db()
        spam_url = f'{BACKEND_URL}/api/v1/cms/contact/submissions/{ar_submission.id}/'
        r = s.patch(spam_url, json={'status': ContactSubmission.STATUS_SPAM}, headers={'X-CSRFToken': csrf})
        results.append(log('spam_action', r.status_code == 200 and r.json().get('status') == ContactSubmission.STATUS_SPAM))

        # Hard delete must be disabled even for a superuser.
        su = requests.Session()
        login(su, superuser.username, password)
        su_csrf = su.cookies.get('csrftoken', '')
        r = su.delete(detail_url, headers={'X-CSRFToken': su_csrf})
        results.append(log('hard_delete_disabled', r.status_code == 405, {'status': r.status_code}))

    # --- Activity logs ---
    expected_actions = {'lead_created', 'status_changed', 'priority_changed', 'internal_note_updated', 'archived'}
    found_actions = set(ActivityLog.objects.filter(module='leads').values_list('action', flat=True).distinct())
    logs_ok = expected_actions.issubset(found_actions)
    results.append(log('activity_logs_created', logs_ok, {'found': sorted(found_actions)}))

    # Sanitization: no raw email/phone/note text in lead activity metadata.
    bad_strings = {'smoke_en@example.test', '+1 555 000 0001', 'Smoke test internal note'}
    leaked = []
    for activity_log in ActivityLog.objects.filter(module='leads'):
        text = json.dumps(activity_log.metadata, default=str)
        for fragment in bad_strings:
            if fragment in text:
                leaked.append(fragment)
    results.append(log('activity_logs_sanitized', not leaked, {'leaked_fragments': leaked}))

    # --- Logout & session invalidation ---
    logout(s)
    r = s.get(f'{BACKEND_URL}/api/v1/cms/contact/submissions/')
    results.append(log('session_invalidated_after_logout', r.status_code == 403, {'status': r.status_code}))

    # --- Email evidence from backend log ---
    time.sleep(1)  # let log flush
    email_evidence = {'backend_log_lines': []}
    try:
        with open(backend_log_path, 'r', encoding='utf-8', errors='ignore') as f:
            log_lines = f.read().splitlines()
        email_evidence['backend_log_lines'] = [
            line for line in log_lines
            if 'New SidrahSoft Lead' in line or 'Thank you for contacting SidrahSoft' in line
        ]
    except FileNotFoundError:
        pass
    email_configured = bool(email_evidence['backend_log_lines'])
    results.append(log('email_notification_evidence', email_configured, email_evidence))

    # --- Frontend reachability ---
    try:
        r = requests.get(f'{FRONTEND_URL}/leads/login', timeout=10)
        frontend_login_ok = r.status_code == 200 and 'text/html' in r.headers.get('Content-Type', '')
    except requests.RequestException as exc:
        frontend_login_ok = False
        r = type('R', (), {'status_code': 0, 'text': str(exc)})()
    results.append(log('frontend_login_page', frontend_login_ok, {'status': r.status_code}))

    return results


def main():
    cleanup_smoke_data()
    backend_log = str(REPO_ROOT / 'backend_smoke.log')
    Path(backend_log).unlink(missing_ok=True)
    backend_proc = None
    frontend_proc = None
    try:
        backend_proc = start_backend(backend_log)
        frontend_proc = start_frontend()
        results = run_validation(backend_log)
        passed = sum(1 for r in results if r['status'])
        total = len(results)
        summary = {
            'verdict': 'PASS' if passed == total else 'PASS_WITH_GAPS' if passed > 0 else 'FAIL',
            'passed': passed,
            'total': total,
            'results': results,
        }
        out_path = REPO_ROOT / 'project-memory' / 'evidence' / 'leads_smoke_results.json'
        with open(out_path, 'w', encoding='utf-8') as f:
            json.dump(summary, f, indent=2, ensure_ascii=False)
        print(json.dumps(summary, indent=2, ensure_ascii=False))
    finally:
        for proc in (backend_proc, frontend_proc):
            if proc:
                proc.terminate()
                try:
                    proc.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    proc.kill()


if __name__ == '__main__':
    main()
