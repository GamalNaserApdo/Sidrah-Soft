"""CMS Dashboard aggregated API view."""
from datetime import timedelta

from django.db.models import Count, Q, Sum, Case, When, IntegerField
from rest_framework import serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsCMSUser
from apps.accounts.roles import (
    get_user_capabilities, get_user_modules,
    has_permission, ACTION_MANAGE_USERS, MODULE_USERS, MODULE_ACTIVITY_LOGS,
)
from apps.accounts.serializers import CMSUserSerializer
from apps.activity_logs.models import ActivityLog
from apps.careers.models import Job
from apps.case_studies.models import CaseStudy
from apps.contact.models import ContactSubmission, InquiryType
from apps.insights.models import Article, STATUS_PUBLISHED, STATUS_DRAFT, STATUS_ARCHIVED
from apps.media_library.models import MediaAsset
from apps.partners.models import Partner
from apps.services.models import Service


class DashboardActivitySerializer(serializers.Serializer):
    """Minimal activity log serializer for dashboard — excludes sensitive fields."""

    id = serializers.IntegerField(read_only=True)
    username = serializers.CharField(read_only=True)
    action = serializers.CharField(read_only=True)
    module = serializers.CharField(read_only=True)
    is_success = serializers.BooleanField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    display_name = serializers.SerializerMethodField()

    def get_display_name(self, obj):
        user = getattr(obj, 'user', None)
        if user:
            full = f'{user.first_name} {user.last_name}'.strip()
            return full or user.username or user.email
        return obj.username or ''


def _user_can(user, module, action):
    """Check capability for non-superuser; superuser bypasses."""
    if user.is_superuser:
        return True
    return has_permission(getattr(user, 'role', None), module, action)


def _cond(field, value):
    """Helper: Case/When for counting rows where field == value."""
    return Sum(Case(When(**{field: value, 'then': 1}), default=0, output_field=IntegerField()))


def _clean_agg(agg):
    """Coerce None values from Sum aggregate to 0."""
    return {k: (v if v is not None else 0) for k, v in agg.items()}


class CMSDashboardView(APIView):
    """
    GET /api/v1/cms/dashboard/

    Returns an aggregated dashboard payload with stats, recent activity,
    and recent contact submissions — scoped to the user's permitted modules.

    Security:
    - User statistics only included when user has users.manage_users.
    - Recent activity only included when user has activity_logs.view.
    - Recent contact submissions exclude email and message;
      only id, name, inquiry_type, status, priority, created_at are returned.
    - Activity log entries exclude ip_address, user_agent, origin,
      metadata, request_method, and request_path.
    """

    permission_classes = [IsAuthenticated, IsCMSUser]

    def get(self, request):
        from django.utils import timezone

        user = request.user
        modules = get_user_modules(user) if not user.is_superuser else [
            'dashboard', 'site_settings', 'navigation', 'partners', 'services',
            'case_studies', 'careers', 'insights', 'contact', 'media',
            'users', 'activity_logs',
        ]
        capabilities = get_user_capabilities(user) if not user.is_superuser else [
            f'{m}.{a}' for m in modules for a in
            ['view', 'create', 'update', 'delete', 'publish', 'export', 'assign', 'manage_users']
        ]

        stats = {}

        if 'partners' in modules:
            agg = Partner.objects.aggregate(
                total=Count('pk'),
                active=_cond('is_active', True),
                featured=Sum(Case(
                    When(is_active=True, is_featured=True, then=1),
                    default=0, output_field=IntegerField()
                )),
            )
            stats['partners'] = _clean_agg(agg)

        if 'services' in modules:
            agg = Service.objects.aggregate(
                total=Count('pk'),
                active=_cond('is_active', True),
                featured=Sum(Case(
                    When(is_active=True, is_featured=True, then=1),
                    default=0, output_field=IntegerField()
                )),
                on_homepage=Sum(Case(
                    When(is_active=True, show_on_homepage=True, then=1),
                    default=0, output_field=IntegerField()
                )),
            )
            stats['services'] = _clean_agg(agg)

        if 'case_studies' in modules:
            agg = CaseStudy.objects.aggregate(
                total=Count('pk'),
                active=_cond('is_active', True),
                featured=Sum(Case(
                    When(is_active=True, is_featured=True, then=1),
                    default=0, output_field=IntegerField()
                )),
                on_homepage=Sum(Case(
                    When(is_active=True, show_on_homepage=True, then=1),
                    default=0, output_field=IntegerField()
                )),
            )
            stats['case_studies'] = _clean_agg(agg)

        if 'insights' in modules:
            agg = Article.objects.aggregate(
                total=Count('pk'),
                published=_cond('status', STATUS_PUBLISHED),
                draft=_cond('status', STATUS_DRAFT),
                archived=_cond('status', STATUS_ARCHIVED),
                featured=Sum(Case(
                    When(status=STATUS_PUBLISHED, is_featured=True, then=1),
                    default=0, output_field=IntegerField()
                )),
            )
            stats['insights'] = _clean_agg(agg)

        if 'careers' in modules:
            today = timezone.now().date()
            agg = Job.objects.aggregate(
                total=Count('pk'),
                active=_cond('is_active', True),
                expired=Sum(Case(
                    When(is_active=True, closing_date__lt=today, then=1),
                    default=0, output_field=IntegerField()
                )),
                featured=Sum(Case(
                    When(is_active=True, is_featured=True, then=1),
                    default=0, output_field=IntegerField()
                )),
            )
            stats['careers'] = _clean_agg(agg)

        if 'contact' in modules:
            recent_cutoff = timezone.now() - timedelta(days=7)
            agg = ContactSubmission.objects.aggregate(
                total=Count('pk'),
                new=_cond('status', 'new'),
                contacted=_cond('status', 'contacted'),
                in_progress=_cond('status', 'in_progress'),
                closed=_cond('status', 'closed'),
                spam=_cond('status', 'spam'),
                archived=_cond('status', 'archived'),
                high_priority=Sum(Case(
                    When(priority__in=['high', 'urgent'], then=1),
                    default=0, output_field=IntegerField()
                )),
                recent_count=Sum(Case(
                    When(created_at__gte=recent_cutoff, then=1),
                    default=0, output_field=IntegerField()
                )),
            )
            agg = _clean_agg(agg)
            agg['inquiry_types'] = InquiryType.objects.count()
            stats['contact'] = agg

        if 'media' in modules:
            agg = MediaAsset.objects.aggregate(
                total=Count('pk'),
                active=_cond('is_active', True),
                images=_cond('media_type', 'image'),
                documents=_cond('media_type', 'document'),
            )
            stats['media'] = _clean_agg(agg)

        if 'activity_logs' in modules:
            stats['activity_logs'] = {
                'total': ActivityLog.objects.count(),
            }

        # User statistics — gated by users.manage_users capability
        if _user_can(user, MODULE_USERS, ACTION_MANAGE_USERS):
            from apps.accounts.models import User
            user_qs = User.objects.all()
            role_counts = dict(
                user_qs.values('role').annotate(count=Count('role')).values_list('role', 'count')
            )
            agg = user_qs.aggregate(
                total=Count('pk'),
                active=_cond('is_active', True),
                inactive=_cond('is_active', False),
            )
            agg = _clean_agg(agg)
            agg['by_role'] = role_counts
            stats['users'] = agg

        # Recent activity (latest 5) — gated by activity_logs.view
        recent_activity = []
        if _user_can(user, MODULE_ACTIVITY_LOGS, 'view'):
            recent_logs = ActivityLog.objects.select_related('user').order_by('-created_at')[:5]
            recent_activity = DashboardActivitySerializer(
                recent_logs, many=True
            ).data

        # Recent contact submissions (latest 5) — safe fields only
        recent_contact_submissions = []
        if 'contact' in modules:
            recent_subs = (
                ContactSubmission.objects
                .select_related('inquiry_type')
                .order_by('-created_at')[:5]
                .values(
                    'id', 'full_name', 'status', 'priority', 'created_at',
                    'inquiry_type__name_en',
                )
            )
            recent_contact_submissions = [
                {
                    'id': s['id'],
                    'full_name': s['full_name'],
                    'status': s['status'],
                    'priority': s['priority'],
                    'created_at': s['created_at'],
                    'inquiry_type': s.get('inquiry_type__name_en') or '',
                }
                for s in recent_subs
            ]

        user_data = CMSUserSerializer(user, context={'request': request}).data

        return Response({
            'user': user_data,
            'modules': modules,
            'capabilities': capabilities,
            'stats': stats,
            'recent_activity': recent_activity,
            'recent_contact_submissions': recent_contact_submissions,
        })
