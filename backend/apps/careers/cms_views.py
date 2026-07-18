"""CMS API views for the careers app."""
from django.db.models import Q
from django.utils import timezone
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated

from apps.accounts.permissions import IsCMSUser, HasModulePermission
from apps.core.cms_pagination import CMSPagination
from apps.core.cms_permissions import CMSViewMixin

from .models import Job
from .cms_serializers import (
    CMSJobListSerializer,
    CMSJobDetailSerializer,
    CMSJobWriteSerializer,
)


class CMSJobListCreateView(CMSViewMixin, ListCreateAPIView):
    """
    GET  /api/v1/cms/careers/           → paginated list (ALL jobs)
    POST /api/v1/cms/careers/           → create
    """

    cms_module = 'careers'
    pagination_class = CMSPagination

    def get_permissions(self):
        self.cms_action = self.get_cms_action()
        return [IsAuthenticated(), IsCMSUser(), HasModulePermission()]

    def get_queryset(self):
        qs = Job.objects.all().order_by('-posted_date')

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(title_en__icontains=search) |
                Q(title_ar__icontains=search) |
                Q(slug__icontains=search) |
                Q(department_en__icontains=search) |
                Q(department_ar__icontains=search)
            )

        is_active = self.request.query_params.get('active')
        if is_active is not None:
            qs = qs.filter(is_active=is_active.lower() == 'true')

        is_featured = self.request.query_params.get('featured')
        if is_featured is not None:
            qs = qs.filter(is_featured=is_featured.lower() == 'true')

        on_homepage = self.request.query_params.get('homepage')
        if on_homepage is not None:
            qs = qs.filter(show_on_homepage=on_homepage.lower() == 'true')

        employment_type = self.request.query_params.get('employment_type')
        if employment_type:
            qs = qs.filter(employment_type=employment_type)

        workplace_type = self.request.query_params.get('workplace_type')
        if workplace_type:
            qs = qs.filter(workplace_type=workplace_type)

        experience_level = self.request.query_params.get('experience_level')
        if experience_level:
            qs = qs.filter(experience_level=experience_level)

        expired = self.request.query_params.get('expired')
        if expired is not None:
            today = timezone.now().date()
            if expired.lower() == 'true':
                qs = qs.filter(closing_date__lt=today)
            else:
                qs = qs.filter(Q(closing_date__gte=today) | Q(closing_date__isnull=True))

        ordering = self.request.query_params.get('ordering')
        allowed_ordering = ['display_order', '-display_order', 'posted_date', '-posted_date',
                           'created_at', '-created_at']
        if ordering and ordering in allowed_ordering:
            qs = qs.order_by(ordering)

        return qs

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CMSJobWriteSerializer
        return CMSJobListSerializer

    def perform_create(self, serializer):
        instance = serializer.save()
        self.log_cms_action(
            self.request, 'create', instance=instance,
            description='cms.job.created',
            metadata={'id': instance.id, 'slug': instance.slug, 'title_en': instance.title_en},
        )


class CMSJobDetailView(CMSViewMixin, RetrieveUpdateDestroyAPIView):
    """
    GET    /api/v1/cms/careers/<id>/    → retrieve
    PUT    /api/v1/cms/careers/<id>/    → full update
    PATCH  /api/v1/cms/careers/<id>/    → partial update
    DELETE /api/v1/cms/careers/<id>/    → hard delete
    """

    cms_module = 'careers'
    queryset = Job.objects.all()

    def get_permissions(self):
        self.cms_action = self.get_cms_action()
        return [IsAuthenticated(), IsCMSUser(), HasModulePermission()]

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return CMSJobWriteSerializer
        return CMSJobDetailSerializer

    def perform_update(self, serializer):
        instance = serializer.save()
        self.log_cms_action(
            self.request, 'update', instance=instance,
            description='cms.job.updated',
            metadata={'id': instance.id, 'changed_fields': list(self.request.data.keys())},
        )

    def perform_destroy(self, instance):
        obj_id = instance.id
        obj_title = instance.title_en
        instance.delete()
        self.log_cms_action(
            self.request, 'delete', instance=None,
            description='cms.job.deleted',
            metadata={'id': obj_id, 'title_en': obj_title},
            object_id=str(obj_id),
            object_repr=obj_title,
        )
