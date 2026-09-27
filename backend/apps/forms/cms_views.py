"""CMS views for the Dynamic Form Builder.

All views use CMSViewMixin for RBAC + activity logging.
System fields are protected from unsafe operations.
CSV export follows the existing training registration export pattern.
"""
import csv

from django.http import HttpResponse
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsCMSUser, HasModulePermission
from apps.core.cms_permissions import CMSViewMixin

from .models import (
    FormDefinition, FormField, FormFieldOption,
    FormAssignment, FormSubmission, FormSubmissionValue,
    SYSTEM_FIELD_KEYS,
    ASSIGNMENT_TARGET_CHOICES, OPERATIONAL_TARGETS, ASSIGNMENT_TARGET_LABELS,
)
from .cms_serializers import (
    CMSFormDefinitionListSerializer,
    CMSFormDefinitionDetailSerializer,
    CMSFormDefinitionWriteSerializer,
    CMSFormFieldSerializer,
    CMSFormFieldOptionSerializer,
    CMSFormAssignmentSerializer,
    CMSFormSubmissionListSerializer,
    CMSFormSubmissionDetailSerializer,
    CMSFormSubmissionUpdateSerializer,
)


# ---------------------------------------------------------------------------
# Form Definition CRUD
# ---------------------------------------------------------------------------

class CMSFormListCreateView(CMSViewMixin, generics.ListCreateAPIView):
    cms_module = 'forms'
    permission_classes = [IsAuthenticated, IsCMSUser, HasModulePermission]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CMSFormDefinitionWriteSerializer
        return CMSFormDefinitionListSerializer

    def get_queryset(self):
        qs = FormDefinition.objects.all()
        search = self.request.query_params.get('search', '')
        if search:
            qs = qs.filter(name__icontains=search) | qs.filter(slug__icontains=search)
        active = self.request.query_params.get('active')
        if active is not None:
            qs = qs.filter(is_active=active == 'true')
        return qs

    def list(self, request, *args, **kwargs):
        from django.db.models import Count
        qs = self.get_queryset()
        qs = qs.annotate(submission_count=Count('submissions'))
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        instance = serializer.save()
        self.log_cms_action(
            self.request, 'create', instance=instance,
            description=f'cms.forms.created:{instance.slug}',
            metadata={'id': instance.id, 'name': instance.name},
        )


class CMSFormDetailView(CMSViewMixin, generics.RetrieveUpdateDestroyAPIView):
    cms_module = 'forms'
    permission_classes = [IsAuthenticated, IsCMSUser, HasModulePermission]

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return CMSFormDefinitionWriteSerializer
        return CMSFormDefinitionDetailSerializer

    queryset = FormDefinition.objects.all()
    lookup_field = 'id'
    lookup_url_kwarg = 'form_id'

    def perform_update(self, serializer):
        instance = serializer.save()
        self.log_cms_action(
            self.request, 'update', instance=instance,
            description=f'cms.forms.updated:{instance.slug}',
            metadata={'changed_fields': list(self.request.data.keys())},
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.has_submissions:
            return Response(
                {'detail': 'Cannot delete a form with existing submissions. Archive it instead.'},
                status=status.HTTP_409_CONFLICT,
            )
        form_name = instance.name
        self.perform_destroy(instance)
        self.log_cms_action(
            request, 'delete',
            description=f'cms.forms.deleted:{form_name}',
        )
        return Response(status=status.HTTP_204_NO_CONTENT)

    def perform_destroy(self, instance):
        instance.delete()


# ---------------------------------------------------------------------------
# Form Field CRUD (nested under form)
# ---------------------------------------------------------------------------

class CMSFormFieldListCreateView(CMSViewMixin, generics.ListCreateAPIView):
    cms_module = 'forms'
    permission_classes = [IsAuthenticated, IsCMSUser, HasModulePermission]
    serializer_class = CMSFormFieldSerializer

    def get_queryset(self):
        form_id = self.kwargs['form_id']
        return FormField.objects.filter(form_id=form_id).order_by('display_order', 'id')

    def perform_create(self, serializer):
        form_id = self.kwargs['form_id']
        form = FormDefinition.objects.get(id=form_id)
        instance = serializer.save(form=form, is_system=False)
        self.log_cms_action(
            self.request, 'create', instance=instance,
            description=f'cms.forms.field_created:{instance.label_en}',
            metadata={'form_id': form_id, 'field_id': instance.id},
        )


class CMSFormFieldDetailView(CMSViewMixin, generics.RetrieveUpdateDestroyAPIView):
    cms_module = 'forms'
    permission_classes = [IsAuthenticated, IsCMSUser, HasModulePermission]
    serializer_class = CMSFormFieldSerializer
    queryset = FormField.objects.all()
    lookup_field = 'pk'
    lookup_url_kwarg = 'field_id'

    def perform_update(self, serializer):
        instance = serializer.save()
        self.log_cms_action(
            self.request, 'update', instance=instance,
            description=f'cms.forms.field_updated:{instance.label_en}',
            metadata={'field_id': instance.id},
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.is_system:
            return Response(
                {'detail': 'Cannot delete a system field. Deactivate it instead.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        field_label = instance.label_en
        self.perform_destroy(instance)
        self.log_cms_action(
            request, 'delete',
            description=f'cms.forms.field_deleted:{field_label}',
        )
        return Response(status=status.HTTP_204_NO_CONTENT)

    def perform_destroy(self, instance):
        instance.delete()


# ---------------------------------------------------------------------------
# Form Field Option CRUD
# ---------------------------------------------------------------------------

class CMSFormFieldOptionListCreateView(CMSViewMixin, generics.ListCreateAPIView):
    cms_module = 'forms'
    permission_classes = [IsAuthenticated, IsCMSUser, HasModulePermission]
    serializer_class = CMSFormFieldOptionSerializer

    def get_queryset(self):
        field_id = self.kwargs['field_id']
        return FormFieldOption.objects.filter(field_id=field_id).order_by('display_order', 'id')

    def perform_create(self, serializer):
        field_id = self.kwargs['field_id']
        field = FormField.objects.get(id=field_id)
        instance = serializer.save(field=field)
        self.log_cms_action(
            self.request, 'create', instance=instance,
            description=f'cms.forms.option_created:{instance.value}',
            metadata={'field_id': field_id, 'option_id': instance.id},
        )


class CMSFormFieldOptionDetailView(CMSViewMixin, generics.RetrieveUpdateDestroyAPIView):
    cms_module = 'forms'
    permission_classes = [IsAuthenticated, IsCMSUser, HasModulePermission]
    serializer_class = CMSFormFieldOptionSerializer
    queryset = FormFieldOption.objects.all()
    lookup_field = 'pk'
    lookup_url_kwarg = 'option_id'

    def perform_update(self, serializer):
        instance = serializer.save()
        self.log_cms_action(
            self.request, 'update', instance=instance,
            description=f'cms.forms.option_updated:{instance.value}',
        )

    def perform_destroy(self, instance):
        option_value = instance.value
        instance.delete()
        self.log_cms_action(
            self.request, 'delete',
            description=f'cms.forms.option_deleted:{option_value}',
        )


# ---------------------------------------------------------------------------
# Form Assignment CRUD
# ---------------------------------------------------------------------------

class CMSFormAssignmentListCreateView(CMSViewMixin, generics.ListCreateAPIView):
    cms_module = 'forms'
    permission_classes = [IsAuthenticated, IsCMSUser, HasModulePermission]
    serializer_class = CMSFormAssignmentSerializer

    def get_queryset(self):
        return FormAssignment.objects.all().select_related('form')

    def perform_create(self, serializer):
        instance = serializer.save()
        self.log_cms_action(
            self.request, 'create', instance=instance,
            description=f'cms.forms.assigned:{instance.target}',
            metadata={'form_id': instance.form_id, 'target': instance.target},
        )


class CMSFormAssignmentDetailView(CMSViewMixin, generics.RetrieveUpdateDestroyAPIView):
    cms_module = 'forms'
    permission_classes = [IsAuthenticated, IsCMSUser, HasModulePermission]
    serializer_class = CMSFormAssignmentSerializer
    queryset = FormAssignment.objects.all()
    lookup_field = 'pk'
    lookup_url_kwarg = 'assignment_id'

    def perform_update(self, serializer):
        instance = serializer.save()
        self.log_cms_action(
            self.request, 'update', instance=instance,
            description=f'cms.forms.assignment_updated:{instance.target}',
        )

    def perform_destroy(self, instance):
        target = instance.target
        instance.delete()
        self.log_cms_action(
            self.request, 'delete',
            description=f'cms.forms.assignment_removed:{target}',
        )


class CMSFormAssignmentTargetsView(CMSViewMixin, APIView):
    """Returns the list of operational assignment targets for the CMS UI.

    Only targets in OPERATIONAL_TARGETS are returned — these are targets
    that have a real public frontend consumer. Non-operational targets
    (contact, landing_generic) are hidden from the CMS UI to avoid
    misleading staff.
    """
    cms_module = 'forms'
    cms_action = 'view'
    permission_classes = [IsAuthenticated, IsCMSUser, HasModulePermission]

    def get(self, request):
        targets = []
        for key in OPERATIONAL_TARGETS:
            labels = ASSIGNMENT_TARGET_LABELS.get(key, {})
            targets.append({
                'value': key,
                'label_en': labels.get('en', key),
                'label_ar': labels.get('ar', key),
            })
        return Response({'targets': targets})


# ---------------------------------------------------------------------------
# Submission Management
# ---------------------------------------------------------------------------

class CMSSubmissionListView(CMSViewMixin, generics.ListAPIView):
    cms_module = 'forms'
    cms_action = 'view'
    permission_classes = [IsAuthenticated, IsCMSUser, HasModulePermission]
    serializer_class = CMSFormSubmissionListSerializer

    def get_queryset(self):
        qs = FormSubmission.objects.select_related('form').prefetch_related('values')
        form_id = self.request.query_params.get('form')
        if form_id:
            qs = qs.filter(form_id=form_id)
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(values__value__icontains=search).distinct()
        from_date = self.request.query_params.get('from')
        if from_date:
            qs = qs.filter(submitted_at__date__gte=from_date)
        to_date = self.request.query_params.get('to')
        if to_date:
            qs = qs.filter(submitted_at__date__lte=to_date)
        return qs


class CMSSubmissionDetailView(CMSViewMixin, generics.RetrieveUpdateAPIView):
    cms_module = 'forms'
    permission_classes = [IsAuthenticated, IsCMSUser, HasModulePermission]

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return CMSFormSubmissionUpdateSerializer
        return CMSFormSubmissionDetailSerializer

    queryset = FormSubmission.objects.all()
    lookup_field = 'pk'
    lookup_url_kwarg = 'submission_id'

    def perform_update(self, serializer):
        instance = serializer.save()
        self.log_cms_action(
            self.request, 'update', instance=instance,
            description=f'cms.forms.submission_updated:{instance.public_id}',
            metadata={'status': instance.status},
        )


# ---------------------------------------------------------------------------
# Export
# ---------------------------------------------------------------------------

class CMSSubmissionExportView(CMSViewMixin, APIView):
    """CSV export of form submissions."""
    cms_module = 'forms'
    cms_action = 'export'
    permission_classes = [IsAuthenticated, IsCMSUser, HasModulePermission]

    def get(self, request):
        form_id = request.query_params.get('form')
        if not form_id:
            return Response({'detail': 'Form ID is required for export.'}, status=400)

        form = FormDefinition.objects.get(id=form_id)
        submissions = FormSubmission.objects.filter(form=form).prefetch_related('values')

        # Build column headers from form fields
        fields = form.fields.order_by('display_order', 'id')
        field_columns = [
            {'key': f.field_key or f'field_{f.id}', 'label': f.label_en}
            for f in fields
        ]

        response = HttpResponse(content_type='text/csv; charset=utf-8')
        response['Content-Disposition'] = f'attachment; filename="form_{form.slug}_submissions.csv"'
        response.write('\ufeff')  # UTF-8 BOM

        writer = csv.writer(response, quoting=csv.QUOTE_ALL)

        # Header row
        header = ['Submission ID', 'Submitted At', 'Language', 'Status', 'Source Page']
        header += [col['label'] for col in field_columns]
        writer.writerow(header)

        # Data rows
        for sub in submissions:
            row = [
                _sanitize_csv_cell(str(sub.public_id)),
                _sanitize_csv_cell(sub.submitted_at.isoformat()),
                _sanitize_csv_cell(sub.language),
                _sanitize_csv_cell(sub.status),
                _sanitize_csv_cell(sub.source_page),
            ]
            value_map = {v.field_key or '': v.value for v in sub.values.all()}
            for col in field_columns:
                row.append(_sanitize_csv_cell(value_map.get(col['key'], '')))
            writer.writerow(row)

        self.log_cms_action(
            request, 'export',
            description=f'cms.forms.exported:{form.slug}',
            metadata={'form_id': form.id, 'count': submissions.count()},
        )
        return response


def _sanitize_csv_cell(value):
    """Prevent CSV formula injection by prefixing dangerous characters.

    Values beginning with =, +, -, or @ are prefixed with a single quote
    so spreadsheet applications do not interpret them as formulas.
    """
    if not value:
        return value
    s = str(value)
    if s and s[0] in ('=', '+', '-', '@'):
        return f"'{s}"
    return s
