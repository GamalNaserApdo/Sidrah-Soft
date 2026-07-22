"""Focused authentication/CSRF/site-settings validation tests.

Run with:
    python manage.py test accounts.tests_focused_auth -v 2
"""
from django.test import Client, TestCase, override_settings
from django.urls import reverse

from apps.accounts.models import User


@override_settings(
    CORS_ALLOW_CREDENTIALS=True,
    CORS_ALLOWED_ORIGINS=['https://frontend-production-5863.up.railway.app'],
    CSRF_TRUSTED_ORIGINS=['https://frontend-production-5863.up.railway.app'],
    CSRF_COOKIE_SECURE=True,
    SESSION_COOKIE_SECURE=True,
    CSRF_COOKIE_SAMESITE='None',
    SESSION_COOKIE_SAMESITE='None',
)
class AuthFlowTests(TestCase):
    """Validate the exact production auth and site-settings flow."""

    def setUp(self):
        self.client = Client(enforce_csrf_checks=True)
        self.user = User.objects.create_user(
            username='gamal',
            password='StrongPass123!',
            is_staff=True,
            role=User.ROLE_ADMIN,
        )

    def test_csrf_endpoint_returns_token(self):
        response = self.client.get('/api/v1/auth/csrf/')
        self.assertEqual(response.status_code, 200)
        self.assertIn('csrfToken', response.json())
        self.assertTrue(response.json()['csrfToken'])

    def test_login_rejected_without_csrf_token(self):
        response = self.client.post(
            '/api/v1/auth/login/',
            {'username': 'gamal', 'password': 'StrongPass123!'},
            content_type='application/json',
        )
        # csrf_protect rejects with 403 when the token is missing.
        self.assertEqual(response.status_code, 403)

    def test_login_and_me_flow(self):
        # 1. Obtain CSRF token via the JSON endpoint.
        csrf_response = self.client.get('/api/v1/auth/csrf/')
        csrf_token = csrf_response.json()['csrfToken']

        # 2. Login with the token in the X-CSRFToken header.
        login_response = self.client.post(
            '/api/v1/auth/login/',
            {'username': 'gamal', 'password': 'StrongPass123!'},
            content_type='application/json',
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        self.assertEqual(login_response.status_code, 200)
        self.assertIn('id', login_response.json())

        # 3. /auth/me/ now returns 200 for the authenticated user.
        me_response = self.client.get('/api/v1/auth/me/')
        self.assertEqual(me_response.status_code, 200)
        self.assertEqual(me_response.json()['id'], self.user.id)

    def test_unauthenticated_me_returns_403(self):
        response = self.client.get('/api/v1/auth/me/')
        # IsCMSUser returns False for anonymous users, so DRF returns 403.
        self.assertEqual(response.status_code, 403)

    def test_site_settings_endpoint_returns_defaults(self):
        response = self.client.get('/api/v1/site-settings/')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn('general', data)
        self.assertIn('contact', data)
        self.assertIn('social', data)
        self.assertIn('location', data)
        self.assertIn('seo', data)
        self.assertIn('branding', data)
        self.assertEqual(data['general']['site_name'], 'Sidrah Soft')
