"""
Authentication views for the CMS dashboard.

Endpoints:
- GET  /api/v1/auth/csrf/   — Ensure CSRF cookie is set.
- POST /api/v1/auth/login/  — Authenticate and create session.
- POST /api/v1/auth/logout/ — Invalidate session.
- GET  /api/v1/auth/me/     — Return current authenticated user.
"""

from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie

from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from apps.activity_logs.services import log_activity

from .permissions import IsCMSUser
from .roles import CMS_ROLES, has_module_access
from .serializers import CMSUserSerializer


@method_decorator(ensure_csrf_cookie, name='dispatch')
class CSRFTokenView(APIView):
    """
    GET /api/v1/auth/csrf/

    Ensures the CSRF cookie is set on the client.
    The frontend must call this before making unsafe requests (POST/PUT/DELETE).
    Returns a safe acknowledgment only.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        get_token(request)
        return Response({'detail': 'CSRF cookie set.'})


@method_decorator(csrf_protect, name='dispatch')
class LoginView(APIView):
    """
    POST /api/v1/auth/login/

    Accepts: {"username": "...", "password": "..."}
    The 'username' field accepts the user's username (which is the login
    identifier for AbstractUser). Email-based login can be added later.

    Security:
    - CSRF enforced via @csrf_protect (DRF's SessionAuthentication only
      enforces CSRF for authenticated requests; login is unauthenticated).
    - Generic error on invalid credentials (no user enumeration).
    - Rejects inactive users.
    - Rejects non-CMS users (role not in CMS_ROLES and not superuser/staff).
    - Rotates session on successful login.
    - Scoped throttling to prevent brute-force.
    """
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'cms_login'

    INVALID_CREDENTIALS_MSG = 'Invalid credentials.'

    def post(self, request):
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '')

        if not username or not password:
            return Response(
                {'detail': self.INVALID_CREDENTIALS_MSG},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        user = authenticate(request, username=username, password=password)

        if user is None:
            log_activity(
                user=None,
                action='login_failed',
                module='auth',
                request=request,
                description='Failed login attempt.',
                is_success=False,
                failure_reason=self.INVALID_CREDENTIALS_MSG,
                metadata={'username_provided': bool(username)},
            )
            return Response(
                {'detail': self.INVALID_CREDENTIALS_MSG},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.is_active:
            log_activity(
                user=None,
                action='login_failed',
                module='auth',
                request=request,
                description='Failed login attempt for inactive account.',
                is_success=False,
                failure_reason=self.INVALID_CREDENTIALS_MSG,
                metadata={'username_provided': bool(username)},
            )
            return Response(
                {'detail': self.INVALID_CREDENTIALS_MSG},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # Check CMS access: must be superuser, staff, or have a CMS role.
        if not user.is_superuser and not user.is_staff:
            if getattr(user, 'role', None) not in CMS_ROLES:
                log_activity(
                    user=user,
                    action='login_failed',
                    module='auth',
                    request=request,
                    description='User lacks CMS dashboard access.',
                    is_success=False,
                    failure_reason='You do not have CMS access.',
                )
                return Response(
                    {'detail': 'You do not have CMS access.'},
                    status=status.HTTP_403_FORBIDDEN,
                )

        login(request, user)

        log_activity(
            user=user,
            action='login',
            module='auth',
            request=request,
            description='User logged in successfully.',
            is_success=True,
        )

        if has_module_access(getattr(user, 'role', None), 'contact'):
            log_activity(
                user=user,
                action='lead_login',
                module='leads',
                request=request,
                description='User signed in to the Leads dashboard.',
                is_success=True,
            )

        serializer = CMSUserSerializer(user)
        return Response(serializer.data)


@method_decorator(csrf_protect, name='dispatch')
class LogoutView(APIView):
    """
    POST /api/v1/auth/logout/

    Invalidates the current session.
    CSRF enforced via @csrf_protect.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user if request.user.is_authenticated else None
        user_role = getattr(user, 'role', None) if user else None
        log_activity(
            user=user,
            action='logout',
            module='auth',
            request=request,
            description='User logged out successfully.',
            is_success=True,
        )
        if user_role and has_module_access(user_role, 'contact'):
            log_activity(
                user=user,
                action='lead_logout',
                module='leads',
                request=request,
                description='User signed out of the Leads dashboard.',
                is_success=True,
            )
        logout(request)
        return Response({'detail': 'Logged out successfully.'})


class CurrentUserView(APIView):
    """
    GET /api/v1/auth/me/

    Returns safe representation of the authenticated user.
    Returns 401 if not authenticated.
    """
    permission_classes = [IsCMSUser]

    def get(self, request):
        serializer = CMSUserSerializer(request.user)
        return Response(serializer.data)
