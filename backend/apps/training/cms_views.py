"""CMS API views for the Training & Education module."""
import csv

from django.db import IntegrityError, transaction
from django.db.models import Count, Q
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import serializers, status
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsCMSUser, HasModulePermission
from apps.core.cms_pagination import CMSPagination
from apps.core.cms_permissions import CMSViewMixin
from apps.core.cms_serializers import ReorderSerializer

from .models import (
    Certificate,
    Instructor,
    ModuleTopic,
    OfferCampaign,
    OfferItem,
    Program,
    ProgramFAQ,
    ProgramInstructor,
    ProgramLanding,
    ProgramModule,
    ProgramTestimonial,
    StarterCampaignConfig,
    StarterLandingPage,
    TrainingRegistration,
)
from .cms_serializers import (
    CMSCertificateDetailSerializer,
    CMSCertificateListSerializer,
    CMSCertificateWriteSerializer,
    CMSInstructorListSerializer,
    CMSInstructorWriteSerializer,
    CMSModuleTopicWriteSerializer,
    CMSOfferCampaignDetailSerializer,
    CMSOfferCampaignListSerializer,
    CMSOfferCampaignWriteSerializer,
    CMSOfferItemSerializer,
    CMSOfferItemWriteSerializer,
    CMSProgramDetailSerializer,
    CMSProgramFAQWriteSerializer,
    CMSProgramInstructorWriteSerializer,
    CMSProgramListSerializer,
    CMSProgramModuleWriteSerializer,
    CMSProgramTestimonialWriteSerializer,
    CMSProgramWriteSerializer,
    CMSStarterCampaignConfigSerializer,
    CMSTrainingRegistrationDetailSerializer,
    CMSTrainingRegistrationExportSerializer,
    CMSTrainingRegistrationListSerializer,
    CMSTrainingRegistrationWriteSerializer,
)


class CMSProgramListCreateView(CMSViewMixin, ListCreateAPIView):
    """
    GET  /api/v1/cms/training/           -> paginated list (all programs)
    POST /api/v1/cms/training/           -> create new program
    """

    cms_module = 'training'
    pagination_class = CMSPagination

    def get_permissions(self):
        self.cms_action = self.get_cms_action()
        return [IsAuthenticated(), IsCMSUser(), HasModulePermission()]

    def get_queryset(self):
        qs = Program.objects.all().order_by('display_order', 'title_en')

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(title_en__icontains=search) |
                Q(title_ar__icontains=search) |
                Q(slug__icontains=search)
            )

        branch = self.request.query_params.get('branch')
        if branch and branch in dict(Program.BRANCH_CHOICES):
            qs = qs.filter(branch=branch)

        status = self.request.query_params.get('status')
        if status and status in dict(Program.STATUS_CHOICES):
            qs = qs.filter(status=status)

        ordering = self.request.query_params.get('ordering')
        allowed_ordering = [
            'display_order', '-display_order',
            'title_en', '-title_en',
            'created_at', '-created_at',
        ]
        if ordering and ordering in allowed_ordering:
            qs = qs.order_by(ordering)

        return qs

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CMSProgramWriteSerializer
        return CMSProgramListSerializer

    def perform_create(self, serializer):
        instance = serializer.save()
        self.log_cms_action(
            self.request, 'create', instance=instance,
            description='cms.training.created',
            metadata={'id': instance.id, 'slug': instance.slug, 'title_en': instance.title_en},
        )


class CMSProgramDetailView(CMSViewMixin, RetrieveUpdateDestroyAPIView):
    """
    GET    /api/v1/cms/training/<id>/    -> retrieve (with full landing data)
    PUT    /api/v1/cms/training/<id>/    -> full update
    PATCH  /api/v1/cms/training/<id>/    -> partial update
    DELETE /api/v1/cms/training/<id>/    -> hard delete (use archive instead)
    """

    cms_module = 'training'
    queryset = Program.objects.all()

    def get_permissions(self):
        self.cms_action = self.get_cms_action()
        return [IsAuthenticated(), IsCMSUser(), HasModulePermission()]

    def get_queryset(self):
        return Program.objects.prefetch_related(
            'curriculum_modules__topics',
            'program_faqs',
            'program_testimonials',
            'program_instructors__instructor__image',
        ).select_related('image', 'landing', 'landing__og_image')

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return CMSProgramWriteSerializer
        return CMSProgramDetailSerializer

    def perform_update(self, serializer):
        instance = serializer.save()
        self.log_cms_action(
            self.request, 'update', instance=instance,
            description='cms.training.updated',
            metadata={'id': instance.id, 'changed_fields': list(self.request.data.keys())},
        )

    def perform_destroy(self, instance):
        obj_id = instance.id
        obj_title = instance.title_en
        instance.delete()
        self.log_cms_action(
            self.request, 'delete', instance=None,
            description='cms.training.deleted',
            metadata={'id': obj_id, 'title_en': obj_title},
            object_id=str(obj_id),
            object_repr=obj_title,
        )


class CMSProgramPublishView(CMSViewMixin, APIView):
    """POST /api/v1/cms/training/<id>/publish/ -> publish (set status=active)."""

    cms_module = 'training'
    cms_action = 'publish'
    permission_classes = [IsAuthenticated, IsCMSUser, HasModulePermission]

    def post(self, request, pk):
        program = Program.objects.filter(pk=pk).first()
        if not program:
            return Response({'detail': 'Not found.'}, status=404)
        if program.status == Program.STATUS_ACTIVE:
            return Response({'detail': 'Already published.', 'code': 'already_published'}, status=400)
        old_status = program.status
        program.status = Program.STATUS_ACTIVE
        program.save(update_fields=['status'])
        self.log_cms_action(
            request, 'publish', instance=program,
            description='cms.training.published',
            metadata={'id': program.id, 'old_status': old_status, 'new_status': 'active'},
        )
        return Response({'detail': 'Published.', 'status': program.status})


class CMSProgramUnpublishView(CMSViewMixin, APIView):
    """POST /api/v1/cms/training/<id>/unpublish/ -> unpublish (set status=draft)."""

    cms_module = 'training'
    cms_action = 'publish'
    permission_classes = [IsAuthenticated, IsCMSUser, HasModulePermission]

    def post(self, request, pk):
        program = Program.objects.filter(pk=pk).first()
        if not program:
            return Response({'detail': 'Not found.'}, status=404)
        if program.status == Program.STATUS_DRAFT:
            return Response({'detail': 'Already draft.', 'code': 'already_draft'}, status=400)
        old_status = program.status
        program.status = Program.STATUS_DRAFT
        program.save(update_fields=['status'])
        self.log_cms_action(
            request, 'unpublish', instance=program,
            description='cms.training.unpublished',
            metadata={'id': program.id, 'old_status': old_status, 'new_status': 'draft'},
        )
        return Response({'detail': 'Unpublished.', 'status': program.status})


class CMSProgramArchiveView(CMSViewMixin, APIView):
    """POST /api/v1/cms/training/<id>/archive/ -> archive (set status=archived)."""

    cms_module = 'training'
    cms_action = 'update'
    permission_classes = [IsAuthenticated, IsCMSUser, HasModulePermission]

    def post(self, request, pk):
        program = Program.objects.filter(pk=pk).first()
        if not program:
            return Response({'detail': 'Not found.'}, status=404)
        if program.status == Program.STATUS_ARCHIVED:
            return Response({'detail': 'Already archived.', 'code': 'already_archived'}, status=400)
        old_status = program.status
        program.status = Program.STATUS_ARCHIVED
        program.save(update_fields=['status'])
        self.log_cms_action(
            request, 'archive', instance=program,
            description='cms.training.archived',
            metadata={'id': program.id, 'old_status': old_status, 'new_status': 'archived'},
        )
        return Response({'detail': 'Archived.', 'status': program.status})


class CMSProgramPreviewTokenView(CMSViewMixin, APIView):
    """POST /api/v1/cms/training/<id>/preview-token/ -> generate short-lived preview token.

    Returns a signed, time-limited token (10 minutes) that allows viewing
    a draft program via the public preview endpoint. The token is NOT stored
    in the database — it is cryptographically signed and bound to the program slug.
    Only authenticated CMS users with training.view permission can generate tokens.
    """

    cms_module = 'training'
    cms_action = 'view'
    permission_classes = [IsAuthenticated, IsCMSUser, HasModulePermission]

    def post(self, request, pk):
        program = Program.objects.filter(pk=pk).first()
        if not program:
            return Response({'detail': 'Not found.'}, status=404)

        from .preview_service import generate_preview_token, DEFAULT_MAX_AGE
        token = generate_preview_token(program.slug)
        preview_url = f'/api/v1/training/programs/{program.slug}/preview/?token={token}'
        frontend_preview_url = f'/training/{program.slug}?preview={token}'

        self.log_cms_action(
            request, 'view', instance=program,
            description='cms.training.preview_token_generated',
            metadata={'id': program.id, 'slug': program.slug, 'max_age': DEFAULT_MAX_AGE},
        )

        return Response({
            'token': token,
            'preview_url': preview_url,
            'frontend_preview_url': frontend_preview_url,
            'expires_in_seconds': DEFAULT_MAX_AGE,
        })


class CMSProgramReorderView(CMSViewMixin, APIView):
    """
    POST /api/v1/cms/training/reorder/   -> bulk reorder programs
    """

    cms_module = 'training'
    cms_action = 'update'
    permission_classes = [IsAuthenticated, IsCMSUser, HasModulePermission]

    def post(self, request):
        serializer = ReorderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        items = serializer.validated_data['items']

        ids = [item['id'] for item in items]
        existing = Program.objects.filter(id__in=ids)
        existing_ids = set(existing.values_list('id', flat=True))

        missing = set(ids) - existing_ids
        if missing:
            return Response(
                {'detail': f'Unknown program IDs: {sorted(missing)}', 'code': 'invalid_ids'},
                status=400,
            )

        order_map = {item['id']: item['order'] for item in items}

        with transaction.atomic():
            for program in existing:
                new_order = order_map.get(program.id)
                if new_order is not None and program.display_order != new_order:
                    program.display_order = new_order
                    program.save(update_fields=['display_order'])

        self.log_cms_action(
            request, 'update', instance=None,
            description='cms.training.reordered',
            metadata={'affected_count': len(ids), 'ids': ids},
        )

        return Response({'detail': 'Reorder complete.', 'affected_count': len(ids)})


class _BaseRegistrationCMSView(CMSViewMixin):
    """Shared configuration for registration CMS views."""

    cms_module = 'training_registrations'
    pagination_class = CMSPagination

    def get_permissions(self):
        self.cms_action = self.get_cms_action()
        return [IsAuthenticated(), IsCMSUser(), HasModulePermission()]

    def _filter_queryset(self, qs):
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(full_name__icontains=search) |
                Q(email__icontains=search) |
                Q(phone__icontains=search)
            )

        program = self.request.query_params.get('program')
        if program:
            qs = qs.filter(program_id=program)

        status = self.request.query_params.get('status')
        if status and status in dict(TrainingRegistration.STATUS_CHOICES):
            qs = qs.filter(status=status)

        source = self.request.query_params.get('source')
        if source and source in dict(TrainingRegistration.SOURCE_CHOICES):
            qs = qs.filter(source=source)

        # Starter campaign filters
        current_level = self.request.query_params.get('current_level')
        if current_level and current_level in dict(TrainingRegistration.CURRENT_LEVEL_CHOICES):
            qs = qs.filter(current_level=current_level)

        current_status = self.request.query_params.get('current_status')
        if current_status and current_status in dict(TrainingRegistration.CURRENT_STATUS_CHOICES):
            qs = qs.filter(current_status=current_status)

        acquisition_source = self.request.query_params.get('acquisition_source')
        if acquisition_source and acquisition_source in dict(TrainingRegistration.ACQUISITION_SOURCE_CHOICES):
            qs = qs.filter(acquisition_source=acquisition_source)

        # Filter by program branch (e.g. starter campaign registrations)
        branch = self.request.query_params.get('branch')
        if branch:
            qs = qs.filter(program__branch=branch)

        # Email confirmation status filter
        email_status = self.request.query_params.get('email_status')
        if email_status and email_status in dict(TrainingRegistration.CONFIRMATION_EMAIL_STATUS_CHOICES):
            qs = qs.filter(confirmation_email_status=email_status)

        # UTM campaign filter (campaign attribution)
        utm_campaign = self.request.query_params.get('utm_campaign')
        if utm_campaign:
            qs = qs.filter(utm_campaign__icontains=utm_campaign)

        date_from = self.request.query_params.get('date_from')
        if date_from:
            qs = qs.filter(submitted_at__date__gte=date_from)
        date_to = self.request.query_params.get('date_to')
        if date_to:
            qs = qs.filter(submitted_at__date__lte=date_to)

        # Primary operational status filter (four-state staff workflow).
        operational_status = self.request.query_params.get('operational_status')
        if operational_status and operational_status in dict(TrainingRegistration.OPERATIONAL_STATUS_CHOICES):
            qs = qs.filter(operational_status=operational_status)

        # Operational filters (enrollment / payment / follow-up / WhatsApp)
        enrollment_stage = self.request.query_params.get('enrollment_stage')
        if enrollment_stage and enrollment_stage in dict(TrainingRegistration.ENROLLMENT_STAGE_CHOICES):
            qs = qs.filter(enrollment_stage=enrollment_stage)

        payment_status = self.request.query_params.get('payment_status')
        if payment_status and payment_status in dict(TrainingRegistration.PAYMENT_STATUS_CHOICES):
            qs = qs.filter(payment_status=payment_status)

        whatsapp_group = self.request.query_params.get('whatsapp_group')
        if whatsapp_group == 'added':
            qs = qs.filter(whatsapp_group_added=True)
        elif whatsapp_group == 'not_added':
            qs = qs.filter(whatsapp_group_added=False)

        follow_up_due = self.request.query_params.get('follow_up_due')
        if follow_up_due == 'today':
            qs = qs.filter(
                next_follow_up_at__date__lte=timezone.now().date(),
                enrollment_stage__in=[
                    TrainingRegistration.ENROLLMENT_STAGE_FOLLOW_UP,
                    TrainingRegistration.ENROLLMENT_STAGE_NEEDS_CONTACT,
                    TrainingRegistration.ENROLLMENT_STAGE_CONTACTED,
                ],
            )
        elif follow_up_due == 'overdue':
            qs = qs.filter(
                next_follow_up_at__date__lt=timezone.now().date(),
                enrollment_stage__in=[
                    TrainingRegistration.ENROLLMENT_STAGE_FOLLOW_UP,
                    TrainingRegistration.ENROLLMENT_STAGE_NEEDS_CONTACT,
                    TrainingRegistration.ENROLLMENT_STAGE_CONTACTED,
                ],
            )

        return qs


class CMSTrainingRegistrationListCreateView(_BaseRegistrationCMSView, ListCreateAPIView):
    """
    GET  /api/v1/cms/training/registrations/     -> paginated list
    POST /api/v1/cms/training/registrations/     -> create registration
    """

    def get_queryset(self):
        return self._filter_queryset(
            TrainingRegistration.objects.select_related('program').order_by('-submitted_at')
        )

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CMSTrainingRegistrationWriteSerializer
        return CMSTrainingRegistrationListSerializer

    def perform_create(self, serializer):
        instance = serializer.save()
        self.log_cms_action(
            self.request, 'create', instance=instance,
            description='cms.training_registrations.created',
            metadata={
                'id': instance.id,
                'program_id': instance.program_id,
                'status': instance.status,
                'source': instance.source,
            },
        )


class CMSTrainingRegistrationDetailView(CMSViewMixin, RetrieveUpdateDestroyAPIView):
    """
    GET    /api/v1/cms/training/registrations/<id>/  -> retrieve
    PUT/PATCH /api/v1/cms/training/registrations/<id>/ -> update
    DELETE /api/v1/cms/training/registrations/<id>/  -> delete
    """

    cms_module = 'training_registrations'
    queryset = TrainingRegistration.objects.select_related('program', 'reviewed_by')

    def get_permissions(self):
        self.cms_action = self.get_cms_action()
        return [IsAuthenticated(), IsCMSUser(), HasModulePermission()]

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return CMSTrainingRegistrationWriteSerializer
        return CMSTrainingRegistrationDetailSerializer

    def perform_update(self, serializer):
        # Capture old values for operational change auditing.
        instance_before = serializer.instance
        old_stage = instance_before.enrollment_stage if instance_before else None
        old_payment = instance_before.payment_status if instance_before else None
        old_whatsapp = instance_before.whatsapp_group_added if instance_before else None

        instance = serializer.save()

        # Auto-populate review metadata when status changes.
        if 'status' in self.request.data and not instance.reviewed_by:
            instance.reviewed_by = self.request.user
            instance.reviewed_at = timezone.now()
            instance.save(update_fields=['reviewed_by', 'reviewed_at'])

        # Auto-populate WhatsApp group metadata when first marked as added.
        if old_whatsapp is False and instance.whatsapp_group_added is True:
            instance.whatsapp_group_added_at = timezone.now()
            instance.whatsapp_group_added_by = self.request.user
            instance.save(update_fields=['whatsapp_group_added_at', 'whatsapp_group_added_by'])

        # Generic update log.
        self.log_cms_action(
            self.request, 'update', instance=instance,
            description='cms.training_registrations.updated',
            metadata={
                'id': instance.id,
                'changed_fields': list(self.request.data.keys()),
                'status': instance.status,
            },
        )

        # Specific activity logs for meaningful operational transitions.
        if 'enrollment_stage' in self.request.data and old_stage != instance.enrollment_stage:
            self.log_cms_action(
                self.request, 'status_change', instance=instance,
                description='cms.training_registrations.enrollment_stage_changed',
                metadata={
                    'id': instance.id,
                    'old_stage': old_stage,
                    'new_stage': instance.enrollment_stage,
                },
            )

        if 'payment_status' in self.request.data and old_payment != instance.payment_status:
            self.log_cms_action(
                self.request, 'status_change', instance=instance,
                description='cms.training_registrations.payment_status_changed',
                metadata={
                    'id': instance.id,
                    'old_payment_status': old_payment,
                    'new_payment_status': instance.payment_status,
                },
            )

        if 'whatsapp_group_added' in self.request.data and old_whatsapp is False and instance.whatsapp_group_added is True:
            self.log_cms_action(
                self.request, 'assign', instance=instance,
                description='cms.training_registrations.whatsapp_group_added',
                metadata={
                    'id': instance.id,
                    'added_by': self.request.user.id,
                },
            )

    def perform_destroy(self, instance):
        # Certificate is OneToOneField(on_delete=CASCADE) — deleting the
        # registration would silently delete the certificate record and break
        # public verification. Block instead of cascading.
        if hasattr(instance, 'certificate'):
            return Response(
                {
                    'detail': 'This registration cannot be deleted because it is linked to a certificate.',
                    'code': 'registration_has_certificate',
                },
                status=status.HTTP_409_CONFLICT,
            )

        obj_id = instance.id
        obj_repr = str(instance)
        metadata = {
            'id': obj_id,
            'full_name': instance.full_name,
            'email': instance.email,
            'program_id': instance.program_id,
            'program_slug': instance.program.slug if instance.program_id else None,
            'status': instance.status,
        }
        instance.delete()
        self.log_cms_action(
            self.request, 'delete', instance=None,
            description='cms.training_registrations.deleted',
            metadata=metadata,
            object_id=str(obj_id),
            object_repr=obj_repr,
        )

    def delete(self, request, *args, **kwargs):
        """Override to allow perform_destroy to return a 409 conflict response."""
        instance = self.get_object()
        result = self.perform_destroy(instance)
        if result is not None:
            return result
        return Response(status=status.HTTP_204_NO_CONTENT)


class CMSTrainingRegistrationTransitionView(CMSViewMixin, APIView):
    """POST /api/v1/cms/training/registrations/<id>/transition/
    Transition a registration to a new status with server-side validation.

    Body: {"status": "reviewed", "review_notes": "optional notes"}

    The model's ALLOWED_TRANSITIONS enforces valid state machine transitions.
    Only users with training_registrations.update permission can transition.
    """

    cms_module = 'training_registrations'
    cms_action = 'update'
    permission_classes = [IsAuthenticated, IsCMSUser, HasModulePermission]

    def post(self, request, pk):
        registration = TrainingRegistration.objects.filter(pk=pk).first()
        if not registration:
            return Response({'detail': 'Not found.'}, status=404)

        new_status = request.data.get('status', '').strip()
        review_notes = request.data.get('review_notes', '').strip()

        if not new_status:
            return Response({'detail': 'Status is required.'}, status=400)

        valid_statuses = [s[0] for s in TrainingRegistration.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response({'detail': 'Invalid status.'}, status=400)

        old_status = registration.status
        if old_status == new_status:
            return Response({'detail': 'Already in this status.'}, status=400)

        # Validate transition is allowed
        allowed = TrainingRegistration.ALLOWED_TRANSITIONS.get(old_status, set())
        if new_status not in allowed:
            return Response({
                'detail': f'Invalid transition: {old_status} -> {new_status}.',
                'code': 'invalid_transition',
                'allowed_transitions': list(allowed),
            }, status=400)

        # Apply transition
        registration.status = new_status
        registration.reviewed_by = request.user
        registration.reviewed_at = timezone.now()
        if review_notes:
            registration.review_notes = review_notes
        registration.save()

        self.log_cms_action(
            request, 'update', instance=registration,
            description='cms.training_registrations.transition',
            metadata={
                'id': registration.id,
                'old_status': old_status,
                'new_status': new_status,
                'reviewed_by': request.user.id,
            },
        )

        return Response({
            'id': registration.id,
            'old_status': old_status,
            'new_status': new_status,
            'reviewed_at': registration.reviewed_at.isoformat() if registration.reviewed_at else None,
        })


class CMSTrainingRegistrationOperationalStatusView(CMSViewMixin, APIView):
    """POST /api/v1/cms/training/registrations/<id>/operational-status/

    Atomic server-side transition of the primary four-state workflow
    (lead/contacted/subscribed/cancelled). The model's
    OPERATIONAL_TRANSITIONS table enforces validity; moving into
    ``contacted`` stamps ``last_contacted_at`` in the same transaction.
    An optional ``note`` is appended to ``internal_notes`` (used by the
    Cancel action — no dedicated cancellation_reason field in V1).
    """

    cms_module = 'training_registrations'
    cms_action = 'update'
    permission_classes = [IsAuthenticated, IsCMSUser, HasModulePermission]

    def post(self, request, pk):
        from django.core.exceptions import ValidationError

        registration = TrainingRegistration.objects.filter(pk=pk).first()
        if not registration:
            return Response({'detail': 'Not found.'}, status=404)

        new_status = request.data.get('status', '').strip()
        note = request.data.get('note', '').strip()
        if not new_status:
            return Response({'detail': 'Status is required.'}, status=400)

        try:
            with transaction.atomic():
                old_status = registration.apply_operational_transition(new_status)
                if note:
                    stamp = timezone.now().strftime('%Y-%m-%d')
                    line = f'[{stamp}] {note}'
                    registration.internal_notes = (
                        f'{registration.internal_notes}\n{line}'
                        if registration.internal_notes else line
                    )
                    registration.save(update_fields=['internal_notes', 'updated_at'])
        except ValidationError as exc:
            detail = exc.messages[0] if exc.messages else 'Invalid transition.'
            return Response({
                'detail': detail,
                'code': 'invalid_transition',
                'allowed_transitions': sorted(registration.allowed_operational_transitions()),
            }, status=400)

        self.log_cms_action(
            request, 'status_change', instance=registration,
            description='cms.training_registrations.operational_status_changed',
            metadata={
                'id': registration.id,
                'old_status': old_status,
                'new_status': registration.operational_status,
                'changed_by': request.user.id,
                'note_supplied': bool(note),
            },
        )

        return Response({
            'id': registration.id,
            'old_status': old_status,
            'new_status': registration.operational_status,
            'last_contacted_at': registration.last_contacted_at.isoformat()
                if registration.last_contacted_at else None,
        })


class CMSTrainingRegistrationStatsView(CMSViewMixin, APIView):
    """GET /api/v1/cms/training/registrations/stats/ -> status counts."""

    cms_module = 'training_registrations'
    cms_action = 'view'
    permission_classes = [IsAuthenticated, IsCMSUser, HasModulePermission]

    def get(self, request):
        helper = _BaseRegistrationCMSView()
        helper.request = request
        qs = helper._filter_queryset(TrainingRegistration.objects.all())
        total = qs.count()
        by_status = {
            status: qs.filter(status=status).count()
            for status, _ in TrainingRegistration.STATUS_CHOICES
        }
        by_operational_status = {
            op: qs.filter(operational_status=op).count()
            for op, _ in TrainingRegistration.OPERATIONAL_STATUS_CHOICES
        }
        by_enrollment_stage = {
            stage: qs.filter(enrollment_stage=stage).count()
            for stage, _ in TrainingRegistration.ENROLLMENT_STAGE_CHOICES
        }
        by_payment_status = {
            payment: qs.filter(payment_status=payment).count()
            for payment, _ in TrainingRegistration.PAYMENT_STATUS_CHOICES
        }
        by_whatsapp = {
            'added': qs.filter(whatsapp_group_added=True).count(),
            'not_added': qs.filter(whatsapp_group_added=False).count(),
        }
        # Operational compound KPI: paid but not yet added to WhatsApp group.
        paid_not_in_group = qs.filter(
            payment_status=TrainingRegistration.PAYMENT_STATUS_PAID,
            whatsapp_group_added=False,
        ).count()
        # Track grouping: use program.track when set, otherwise fall back to program__title_en.
        by_track = list(
            qs.values('program__track', 'program__title_en')
            .annotate(total=Count('id'))
            .order_by('program__track', 'program__title_en')
        )
        # Merge rows with the same non-empty track name.
        track_map = {}
        for row in by_track:
            track_key = row['program__track'] or row['program__title_en']
            track_map.setdefault(track_key, {'track': track_key, 'total': 0, 'programs': []})
            track_map[track_key]['total'] += row['total']
            track_map[track_key]['programs'].append({
                'program_id': row['program__title_en'],
                'title': row['program__title_en'],
                'total': row['total'],
            })
        by_track_merged = sorted(track_map.values(), key=lambda x: x['track'])

        by_course = list(
            qs.values('program_id', 'program__slug', 'program__title_en')
            .annotate(total=Count('id')).order_by('program__title_en')
        )
        return Response({
            'total': total,
            'by_status': by_status,
            'by_operational_status': by_operational_status,
            'by_enrollment_stage': by_enrollment_stage,
            'by_payment_status': by_payment_status,
            'by_whatsapp': by_whatsapp,
            'paid_not_in_group': paid_not_in_group,
            'by_track': by_track_merged,
            'by_course': by_course,
        })


class CMSTrainingRegistrationExportView(CMSViewMixin, APIView):
    """GET /api/v1/cms/training/registrations/export/ -> CSV export.

    Respects all active filters (program, status, source, branch, email_status,
    utm_campaign, date range, search). Exports the filtered dataset only.

    CSV formula-injection protection: user-controlled values beginning with
    =, +, -, @, or tab are prefixed with a single quote to prevent
    spreadsheet formula execution when opened in Excel/Google Sheets.
    """

    cms_module = 'training_registrations'
    cms_action = 'export'
    permission_classes = [IsAuthenticated, IsCMSUser, HasModulePermission]

    # Characters that trigger spreadsheet formula evaluation.
    _FORMULA_PREFIXES = ('=', '+', '-', '@', '\t', '\r')

    @classmethod
    def _sanitize_cell(cls, value):
        """Prefix dangerous formula characters to prevent CSV injection.

        Only applies to string values; numbers, None, and bools are safe.
        """
        if value is None:
            return ''
        s = str(value)
        if s and s[0] in cls._FORMULA_PREFIXES:
            return "'" + s
        return s

    @staticmethod
    def _format_course_price(registration):
        """Render the immutable registration-time price snapshot.

        Returns '' for legacy rows where the snapshot is NULL — the
        current program price is never used as a substitute.
        """
        if registration.course_price is None:
            return ''
        price = registration.course_price
        # '499.00' -> '499' for clean display
        text = str(int(price)) if price == int(price) else str(price)
        currency = registration.course_price_currency or 'EGP'
        return f'{text} {currency}'

    @staticmethod
    def _export_phone(phone):
        """Wrap phone numbers as =\"...\" so spreadsheet apps keep the
        leading zero of Egyptian numbers instead of parsing them as
        numbers (which would drop the 0 or produce scientific notation).
        The wrapper is generated here — never from user input."""
        digits = ''.join(ch for ch in str(phone or '') if ch not in '"\r\n')
        return f'="{digits}"' if digits else ''

    def get(self, request):
        helper = _BaseRegistrationCMSView()
        helper.request = request
        qs = helper._filter_queryset(
            TrainingRegistration.objects.select_related('program').order_by('-submitted_at')
        )

        response = HttpResponse(content_type='text/csv; charset=utf-8')
        filename = 'training_registrations.csv'
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        response.write('\ufeff')

        writer = csv.writer(response)
        writer.writerow(['Name', 'Phone', 'Track', 'Course Price'])
        count = 0
        for reg in qs.iterator():
            writer.writerow([
                self._sanitize_cell(reg.full_name),
                self._export_phone(reg.phone),
                self._sanitize_cell(reg.program.track or reg.program.title_en),
                self._format_course_price(reg),
            ])
            count += 1

        self.log_cms_action(
            request, 'export', instance=None,
            description='cms.training_registrations.exported',
            metadata={'exported_count': count},
        )

        return response


class _BaseCertificateCMSView(CMSViewMixin):
    """Shared configuration for certificate CMS views."""

    cms_module = 'certificates'
    pagination_class = CMSPagination

    def get_permissions(self):
        self.cms_action = self.get_cms_action()
        return [IsAuthenticated(), IsCMSUser(), HasModulePermission()]


class CMSCertificateListCreateView(_BaseCertificateCMSView, ListCreateAPIView):
    """
    GET  /api/v1/cms/training/certificates/      -> paginated list
    POST /api/v1/cms/training/certificates/      -> create certificate draft
    """

    def get_queryset(self):
        qs = Certificate.objects.select_related(
            'training_registration', 'training_registration__program'
        ).order_by('-created_at')
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(reference__icontains=search) |
                Q(training_registration__full_name__icontains=search) |
                Q(training_registration__email__icontains=search)
            )
        status = self.request.query_params.get('status')
        if status and status in dict(Certificate.STATUS_CHOICES):
            qs = qs.filter(status=status)
        date_from = self.request.query_params.get('date_from')
        if date_from:
            qs = qs.filter(created_at__date__gte=date_from)
        date_to = self.request.query_params.get('date_to')
        if date_to:
            qs = qs.filter(created_at__date__lte=date_to)
        return qs

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CMSCertificateWriteSerializer
        return CMSCertificateListSerializer

    def perform_create(self, serializer):
        try:
            instance = serializer.save()
        except IntegrityError as exc:
            raise serializers.ValidationError(
                {'training_registration': 'A certificate already exists for this registration.'}
            ) from exc
        self.log_cms_action(
            self.request, 'create', instance=instance,
            description='cms.certificates.created',
            metadata={
                'id': instance.id,
                'reference': instance.reference,
                'training_registration_id': instance.training_registration_id,
            },
        )


class CMSCertificateDetailView(CMSViewMixin, RetrieveUpdateAPIView):
    """
    GET    /api/v1/cms/training/certificates/<id>/  -> retrieve
    PUT/PATCH /api/v1/cms/training/certificates/<id>/ -> update
    DELETE /api/v1/cms/training/certificates/<id>/ -> delete
    """

    cms_module = 'certificates'
    queryset = Certificate.objects.select_related(
        'training_registration', 'training_registration__program', 'media_asset'
    )

    def get_permissions(self):
        self.cms_action = self.get_cms_action()
        return [IsAuthenticated(), IsCMSUser(), HasModulePermission()]

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return CMSCertificateWriteSerializer
        return CMSCertificateDetailSerializer

    def perform_update(self, serializer):
        instance = serializer.save()
        self.log_cms_action(
            self.request, 'update', instance=instance,
            description='cms.certificates.updated',
            metadata={
                'id': instance.id,
                'reference': instance.reference,
                'changed_fields': list(self.request.data.keys()),
            },
        )

    def perform_destroy(self, instance):
        obj_id = instance.id
        obj_reference = instance.reference
        instance.delete()
        self.log_cms_action(
            self.request, 'delete', instance=None,
            description='cms.certificates.deleted',
            metadata={'id': obj_id, 'reference': obj_reference},
            object_id=str(obj_id),
            object_repr=obj_reference,
        )


class CMSCertificateIssueView(CMSViewMixin, APIView):
    """POST /api/v1/cms/training/certificates/<id>/issue/ -> issue certificate."""

    cms_module = 'certificates'
    cms_action = 'issue'
    permission_classes = [IsAuthenticated, IsCMSUser, HasModulePermission]

    def post(self, request, pk):
        certificate = Certificate.objects.filter(pk=pk).select_related(
            'training_registration', 'training_registration__program'
        ).first()
        if not certificate:
            return Response({'detail': 'Not found.'}, status=404)

        if certificate.status != Certificate.STATUS_DRAFT:
            return Response(
                {'detail': 'Only draft certificates can be issued.', 'code': 'not_draft'},
                status=400,
            )
        # Completion certificates require a completed registration.
        # Recognition certificates do not require a registration.
        if certificate.certificate_type == 'completion':
            if not certificate.training_registration:
                return Response(
                    {'detail': 'Completion certificate has no linked registration.', 'code': 'no_registration'},
                    status=400,
                )
            if not certificate.training_registration.certificate_eligible:
                return Response(
                    {'detail': 'Only completed registrations are certificate eligible.', 'code': 'not_completed'},
                    status=400,
                )

        certificate.status = Certificate.STATUS_ISSUED
        certificate.issued_by = request.user
        certificate.issued_at = timezone.now()
        certificate.save(update_fields=['status', 'issued_by', 'issued_at'])

        self.log_cms_action(
            request, 'issue', instance=certificate,
            description='cms.certificates.issued',
            metadata={'id': certificate.id, 'reference': certificate.reference},
        )

        serializer = CMSCertificateDetailSerializer(certificate)
        return Response(serializer.data)


class CMSCertificateRevokeView(CMSViewMixin, APIView):
    """POST /api/v1/cms/training/certificates/<id>/revoke/ -> revoke certificate."""

    cms_module = 'certificates'
    cms_action = 'revoke'
    permission_classes = [IsAuthenticated, IsCMSUser, HasModulePermission]

    def post(self, request, pk):
        certificate = Certificate.objects.filter(pk=pk).select_related(
            'training_registration', 'training_registration__program'
        ).first()
        if not certificate:
            return Response({'detail': 'Not found.'}, status=404)

        if certificate.status != Certificate.STATUS_ISSUED:
            return Response(
                {'detail': 'Only issued certificates can be revoked.', 'code': 'not_issued'},
                status=400,
            )

        reason = request.data.get('revoked_reason', '').strip()
        certificate.status = Certificate.STATUS_REVOKED
        certificate.revoked_by = request.user
        certificate.revoked_at = timezone.now()
        certificate.revoked_reason = reason
        certificate.save(update_fields=['status', 'revoked_by', 'revoked_at', 'revoked_reason'])

        self.log_cms_action(
            request, 'revoke', instance=certificate,
            description='cms.certificates.revoked',
            metadata={'id': certificate.id, 'reference': certificate.reference},
        )

        serializer = CMSCertificateDetailSerializer(certificate)
        return Response(serializer.data)


class CMSCertificateQRCodeView(CMSViewMixin, APIView):
    """GET /api/v1/cms/training/certificates/<id>/qr-code/
    Generate and download a QR code PNG for the certificate.

    The QR code contains the full verification URL:
    {PUBLIC_SITE_URL}/certificates/verify/{reference}

    Returns a PNG image suitable for printing on the certificate.
    """

    cms_module = 'certificates'
    cms_action = 'view'
    permission_classes = [IsAuthenticated, IsCMSUser, HasModulePermission]

    def get(self, request, pk):
        import io
        import qrcode
        from django.http import HttpResponse

        certificate = Certificate.objects.filter(pk=pk).first()
        if not certificate:
            return Response({'detail': 'Not found.'}, status=404)

        # QR codes are available for all statuses (draft, issued, revoked)
        # so users can generate credentials and place QR on certificate design before issuing.

        from django.conf import settings
        public_url = getattr(settings, 'PUBLIC_SITE_URL', '').rstrip('/')
        verification_url = f'{public_url}/certificates/verify/{certificate.reference}'

        # Generate QR code with quiet zone and high error correction for print
        qr = qrcode.QRCode(
            version=None,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=10,
            border=4,  # quiet zone
        )
        qr.add_data(verification_url)
        qr.make(fit=True)

        img = qr.make_image(fill_color='black', back_color='white')
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)

        response = HttpResponse(buffer, content_type='image/png')
        filename = f'QR_{certificate.reference}.png'
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response


class CMSCertificatePDFView(CMSViewMixin, APIView):
    """GET /api/v1/cms/training/certificates/<id>/pdf/

    Placeholder PDF generation has been disabled for production launch.
    Certificate PDFs are managed manually by management and stored as
    ``certificate_file`` on the Certificate model. This endpoint previously
    called a ReportLab placeholder generator that did NOT serve the
    authoritative stored PDF. It is now disabled to prevent serving
    incorrect certificate artifacts.

    Public certificate verification remains fully functional via
    ``/api/v1/training/certificates/<reference>/verify/``.
    """

    cms_module = 'certificates'
    cms_action = 'view'
    permission_classes = [IsAuthenticated, IsCMSUser, HasModulePermission]

    def get(self, request, pk):
        return Response(
            {'detail': 'Placeholder PDF generation is disabled. Certificate PDFs are managed manually.'},
            status=501,
        )


# ---------------------------------------------------------------------------
# Landing Page nested resource CRUD views
# ---------------------------------------------------------------------------

class CMSProgramModuleListCreateView(CMSViewMixin, ListCreateAPIView):
    """GET/POST /api/v1/cms/training/<program_id>/modules/"""

    cms_module = 'training'
    pagination_class = CMSPagination
    serializer_class = CMSProgramModuleWriteSerializer

    def get_permissions(self):
        self.cms_action = self.get_cms_action()
        return [IsAuthenticated(), IsCMSUser(), HasModulePermission()]

    def get_queryset(self):
        program_id = self.kwargs.get('program_id')
        return ProgramModule.objects.filter(program_id=program_id).order_by('display_order', 'id')

    def perform_create(self, serializer):
        program_id = self.kwargs.get('program_id')
        program = Program.objects.filter(pk=program_id).first()
        if not program:
            raise serializers.ValidationError({'program': 'Program not found.'})
        instance = serializer.save(program=program)
        self.log_cms_action(
            self.request, 'create', instance=instance,
            description='cms.training.module_created',
            metadata={'id': instance.id, 'program_id': program_id, 'title_en': instance.title_en},
        )


class CMSProgramModuleDetailView(CMSViewMixin, RetrieveUpdateDestroyAPIView):
    """GET/PUT/PATCH/DELETE /api/v1/cms/training/modules/<pk>/"""

    cms_module = 'training'
    queryset = ProgramModule.objects.all()
    serializer_class = CMSProgramModuleWriteSerializer

    def get_permissions(self):
        self.cms_action = self.get_cms_action()
        return [IsAuthenticated(), IsCMSUser(), HasModulePermission()]

    def perform_update(self, serializer):
        instance = serializer.save()
        self.log_cms_action(
            self.request, 'update', instance=instance,
            description='cms.training.module_updated',
            metadata={'id': instance.id, 'changed_fields': list(self.request.data.keys())},
        )

    def perform_destroy(self, instance):
        obj_id = instance.id
        instance.delete()
        self.log_cms_action(
            self.request, 'delete', instance=None,
            description='cms.training.module_deleted',
            metadata={'id': obj_id},
        )


class CMSModuleTopicListCreateView(CMSViewMixin, ListCreateAPIView):
    """GET/POST /api/v1/cms/training/modules/<module_id>/topics/"""

    cms_module = 'training'
    pagination_class = CMSPagination
    serializer_class = CMSModuleTopicWriteSerializer

    def get_permissions(self):
        self.cms_action = self.get_cms_action()
        return [IsAuthenticated(), IsCMSUser(), HasModulePermission()]

    def get_queryset(self):
        module_id = self.kwargs.get('module_id')
        return ModuleTopic.objects.filter(module_id=module_id).order_by('display_order', 'id')

    def perform_create(self, serializer):
        module_id = self.kwargs.get('module_id')
        module = ProgramModule.objects.filter(pk=module_id).first()
        if not module:
            raise serializers.ValidationError({'module': 'Module not found.'})
        instance = serializer.save(module=module)
        self.log_cms_action(
            self.request, 'create', instance=instance,
            description='cms.training.topic_created',
            metadata={'id': instance.id, 'module_id': module_id},
        )


class CMSModuleTopicDetailView(CMSViewMixin, RetrieveUpdateDestroyAPIView):
    """GET/PUT/PATCH/DELETE /api/v1/cms/training/topics/<pk>/"""

    cms_module = 'training'
    queryset = ModuleTopic.objects.all()
    serializer_class = CMSModuleTopicWriteSerializer

    def get_permissions(self):
        self.cms_action = self.get_cms_action()
        return [IsAuthenticated(), IsCMSUser(), HasModulePermission()]

    def perform_destroy(self, instance):
        obj_id = instance.id
        instance.delete()
        self.log_cms_action(
            self.request, 'delete', instance=None,
            description='cms.training.topic_deleted',
            metadata={'id': obj_id},
        )


class CMSInstructorListCreateView(CMSViewMixin, ListCreateAPIView):
    """GET/POST /api/v1/cms/training/instructors/"""

    cms_module = 'training'
    pagination_class = CMSPagination

    def get_permissions(self):
        self.cms_action = self.get_cms_action()
        return [IsAuthenticated(), IsCMSUser(), HasModulePermission()]

    def get_queryset(self):
        qs = Instructor.objects.all().order_by('name_en')
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(Q(name_en__icontains=search) | Q(name_ar__icontains=search))
        return qs

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CMSInstructorWriteSerializer
        return CMSInstructorListSerializer

    def perform_create(self, serializer):
        instance = serializer.save()
        self.log_cms_action(
            self.request, 'create', instance=instance,
            description='cms.training.instructor_created',
            metadata={'id': instance.id, 'name_en': instance.name_en},
        )


class CMSInstructorDetailView(CMSViewMixin, RetrieveUpdateDestroyAPIView):
    """GET/PUT/PATCH/DELETE /api/v1/cms/training/instructors/<pk>/"""

    cms_module = 'training'
    queryset = Instructor.objects.all()

    def get_permissions(self):
        self.cms_action = self.get_cms_action()
        return [IsAuthenticated(), IsCMSUser(), HasModulePermission()]

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return CMSInstructorWriteSerializer
        return CMSInstructorListSerializer

    def perform_update(self, serializer):
        instance = serializer.save()
        self.log_cms_action(
            self.request, 'update', instance=instance,
            description='cms.training.instructor_updated',
            metadata={'id': instance.id, 'changed_fields': list(self.request.data.keys())},
        )


class CMSProgramInstructorListCreateView(CMSViewMixin, ListCreateAPIView):
    """GET/POST /api/v1/cms/training/<program_id>/instructors/"""

    cms_module = 'training'
    serializer_class = CMSProgramInstructorWriteSerializer

    def get_permissions(self):
        self.cms_action = self.get_cms_action()
        return [IsAuthenticated(), IsCMSUser(), HasModulePermission()]

    def get_queryset(self):
        program_id = self.kwargs.get('program_id')
        return ProgramInstructor.objects.filter(program_id=program_id).select_related(
            'instructor', 'instructor__image'
        ).order_by('display_order', 'id')

    def perform_create(self, serializer):
        program_id = self.kwargs.get('program_id')
        program = Program.objects.filter(pk=program_id).first()
        if not program:
            raise serializers.ValidationError({'program': 'Program not found.'})
        instance = serializer.save(program=program)
        self.log_cms_action(
            self.request, 'create', instance=instance,
            description='cms.training.instructor_assigned',
            metadata={'id': instance.id, 'program_id': program_id, 'instructor_id': instance.instructor_id},
        )


class CMSProgramInstructorDetailView(CMSViewMixin, RetrieveUpdateDestroyAPIView):
    """GET/PUT/PATCH/DELETE /api/v1/cms/training/program-instructors/<pk>/"""

    cms_module = 'training'
    queryset = ProgramInstructor.objects.all()
    serializer_class = CMSProgramInstructorWriteSerializer

    def get_permissions(self):
        self.cms_action = self.get_cms_action()
        return [IsAuthenticated(), IsCMSUser(), HasModulePermission()]

    def perform_destroy(self, instance):
        obj_id = instance.id
        instance.delete()
        self.log_cms_action(
            self.request, 'delete', instance=None,
            description='cms.training.instructor_removed',
            metadata={'id': obj_id},
        )


class CMSProgramFAQListCreateView(CMSViewMixin, ListCreateAPIView):
    """GET/POST /api/v1/cms/training/<program_id>/faqs/"""

    cms_module = 'training'
    serializer_class = CMSProgramFAQWriteSerializer

    def get_permissions(self):
        self.cms_action = self.get_cms_action()
        return [IsAuthenticated(), IsCMSUser(), HasModulePermission()]

    def get_queryset(self):
        program_id = self.kwargs.get('program_id')
        return ProgramFAQ.objects.filter(program_id=program_id).order_by('display_order', 'id')

    def perform_create(self, serializer):
        program_id = self.kwargs.get('program_id')
        program = Program.objects.filter(pk=program_id).first()
        if not program:
            raise serializers.ValidationError({'program': 'Program not found.'})
        instance = serializer.save(program=program)
        self.log_cms_action(
            self.request, 'create', instance=instance,
            description='cms.training.faq_created',
            metadata={'id': instance.id, 'program_id': program_id},
        )


class CMSProgramFAQDetailView(CMSViewMixin, RetrieveUpdateDestroyAPIView):
    """GET/PUT/PATCH/DELETE /api/v1/cms/training/faqs/<pk>/"""

    cms_module = 'training'
    queryset = ProgramFAQ.objects.all()
    serializer_class = CMSProgramFAQWriteSerializer

    def get_permissions(self):
        self.cms_action = self.get_cms_action()
        return [IsAuthenticated(), IsCMSUser(), HasModulePermission()]

    def perform_destroy(self, instance):
        obj_id = instance.id
        instance.delete()
        self.log_cms_action(
            self.request, 'delete', instance=None,
            description='cms.training.faq_deleted',
            metadata={'id': obj_id},
        )


class CMSProgramTestimonialListCreateView(CMSViewMixin, ListCreateAPIView):
    """GET/POST /api/v1/cms/training/<program_id>/testimonials/"""

    cms_module = 'training'
    serializer_class = CMSProgramTestimonialWriteSerializer

    def get_permissions(self):
        self.cms_action = self.get_cms_action()
        return [IsAuthenticated(), IsCMSUser(), HasModulePermission()]

    def get_queryset(self):
        program_id = self.kwargs.get('program_id')
        return ProgramTestimonial.objects.filter(program_id=program_id).order_by('display_order', 'id')

    def perform_create(self, serializer):
        program_id = self.kwargs.get('program_id')
        program = Program.objects.filter(pk=program_id).first()
        if not program:
            raise serializers.ValidationError({'program': 'Program not found.'})
        instance = serializer.save(program=program)
        self.log_cms_action(
            self.request, 'create', instance=instance,
            description='cms.training.testimonial_created',
            metadata={'id': instance.id, 'program_id': program_id, 'is_approved': instance.is_approved},
        )


class CMSProgramTestimonialDetailView(CMSViewMixin, RetrieveUpdateDestroyAPIView):
    """GET/PUT/PATCH/DELETE /api/v1/cms/training/testimonials/<pk>/"""

    cms_module = 'training'
    queryset = ProgramTestimonial.objects.all()
    serializer_class = CMSProgramTestimonialWriteSerializer

    def get_permissions(self):
        self.cms_action = self.get_cms_action()
        return [IsAuthenticated(), IsCMSUser(), HasModulePermission()]

    def perform_update(self, serializer):
        instance = serializer.save()
        self.log_cms_action(
            self.request, 'update', instance=instance,
            description='cms.training.testimonial_updated',
            metadata={'id': instance.id, 'changed_fields': list(self.request.data.keys()), 'is_approved': instance.is_approved},
        )

    def perform_destroy(self, instance):
        obj_id = instance.id
        instance.delete()
        self.log_cms_action(
            self.request, 'delete', instance=None,
            description='cms.training.testimonial_deleted',
            metadata={'id': obj_id},
        )


class CMSProgramTestimonialApproveView(CMSViewMixin, APIView):
    """POST /api/v1/cms/training/testimonials/<pk>/approve/ -> approve testimonial."""

    cms_module = 'training'
    cms_action = 'update'
    permission_classes = [IsAuthenticated, IsCMSUser, HasModulePermission]

    def post(self, request, pk):
        testimonial = ProgramTestimonial.objects.filter(pk=pk).first()
        if not testimonial:
            return Response({'detail': 'Not found.'}, status=404)
        testimonial.is_approved = True
        testimonial.save(update_fields=['is_approved'])
        self.log_cms_action(
            request, 'update', instance=testimonial,
            description='cms.training.testimonial_approved',
            metadata={'id': testimonial.id},
        )
        return Response({'detail': 'Approved.', 'is_approved': True})


class CMSNestedReorderView(CMSViewMixin, APIView):
    """
    POST /api/v1/cms/training/reorder/<model>/
    Generic reorder endpoint for nested resources.

    Body: {"items": [{"id": 1, "order": 0}, {"id": 2, "order": 1}, ...]}
    """

    cms_module = 'training'
    cms_action = 'update'
    permission_classes = [IsAuthenticated, IsCMSUser, HasModulePermission]

    MODEL_MAP = {
        'modules': ProgramModule,
        'topics': ModuleTopic,
        'faqs': ProgramFAQ,
        'testimonials': ProgramTestimonial,
        'program-instructors': ProgramInstructor,
    }

    def post(self, request, model):
        model_cls = self.MODEL_MAP.get(model)
        if not model_cls:
            return Response({'detail': f'Unknown model: {model}', 'code': 'invalid_model'}, status=400)

        serializer = ReorderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        items = serializer.validated_data['items']

        ids = [item['id'] for item in items]
        existing = model_cls.objects.filter(id__in=ids)
        existing_ids = set(existing.values_list('id', flat=True))
        missing = set(ids) - existing_ids
        if missing:
            return Response(
                {'detail': f'Unknown IDs: {sorted(missing)}', 'code': 'invalid_ids'},
                status=400,
            )

        order_map = {item['id']: item['order'] for item in items}
        with transaction.atomic():
            for obj in existing:
                new_order = order_map.get(obj.id)
                if new_order is not None and obj.display_order != new_order:
                    obj.display_order = new_order
                    obj.save(update_fields=['display_order'])

        self.log_cms_action(
            request, 'update', instance=None,
            description=f'cms.training.{model}_reordered',
            metadata={'affected_count': len(ids), 'ids': ids},
        )
        return Response({'detail': 'Reorder complete.', 'affected_count': len(ids)})


# ---------------------------------------------------------------------------
# Courses Offers CMS Views (OfferCampaign -> OfferItem -> Program)
# Reuses the existing 'training' CMS module RBAC and activity logging.
# ---------------------------------------------------------------------------

class CMSOfferCampaignListCreateView(CMSViewMixin, ListCreateAPIView):
    """
    GET  /api/v1/cms/training/offers/          -> paginated campaign list
    POST /api/v1/cms/training/offers/          -> create new campaign

    List filters: ?search=, ?status= (active|scheduled|expired|inactive)
    """

    cms_module = 'training'
    pagination_class = CMSPagination

    def get_permissions(self):
        self.cms_action = self.get_cms_action()
        return [IsAuthenticated(), IsCMSUser(), HasModulePermission()]

    def get_queryset(self):
        qs = OfferCampaign.objects.all().order_by('priority', '-start_date', 'id')

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(title_en__icontains=search) |
                Q(title_ar__icontains=search) |
                Q(slug__icontains=search)
            )

        status = self.request.query_params.get('status')
        if status == 'active':
            qs = OfferCampaign.objects.active_now()
        elif status == 'scheduled':
            qs = OfferCampaign.objects.scheduled()
        elif status == 'expired':
            qs = OfferCampaign.objects.expired()
        elif status == 'inactive':
            qs = qs.filter(is_active=False)
        return qs

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CMSOfferCampaignWriteSerializer
        return CMSOfferCampaignListSerializer

    def perform_create(self, serializer):
        instance = serializer.save()
        self.log_cms_action(
            self.request, 'create', instance=instance,
            description='cms.training.offer_campaign_created',
            metadata={
                'id': instance.id,
                'slug': instance.slug,
                'is_active': instance.is_active,
            },
        )


class CMSOfferCampaignDetailView(CMSViewMixin, RetrieveUpdateDestroyAPIView):
    """
    GET    /api/v1/cms/training/offers/<pk>/   -> campaign detail with items
    PUT/PATCH /api/v1/cms/training/offers/<pk>/ -> update campaign
    DELETE /api/v1/cms/training/offers/<pk>/   -> delete campaign (and its items)
    """

    cms_module = 'training'
    queryset = OfferCampaign.objects.all()

    def get_permissions(self):
        self.cms_action = self.get_cms_action()
        return [IsAuthenticated(), IsCMSUser(), HasModulePermission()]

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return CMSOfferCampaignWriteSerializer
        return CMSOfferCampaignDetailSerializer

    def perform_update(self, serializer):
        was_active = serializer.instance.is_active
        instance = serializer.save()
        action = 'update'
        if was_active != instance.is_active:
            action = 'update'
            description = (
                'cms.training.offer_campaign_activated'
                if instance.is_active
                else 'cms.training.offer_campaign_deactivated'
            )
        else:
            description = 'cms.training.offer_campaign_updated'
        self.log_cms_action(
            self.request, action, instance=instance,
            description=description,
            metadata={
                'id': instance.id,
                'slug': instance.slug,
                'is_active': instance.is_active,
            },
        )

    def perform_destroy(self, instance):
        self.log_cms_action(
            self.request, 'delete', instance=instance,
            description='cms.training.offer_campaign_deleted',
            metadata={'id': instance.id, 'slug': instance.slug},
        )
        instance.delete()


class CMSOfferItemListCreateView(CMSViewMixin, ListCreateAPIView):
    """
    GET  /api/v1/cms/training/offers/<campaign_id>/items/  -> list campaign items
    POST /api/v1/cms/training/offers/<campaign_id>/items/  -> add course to campaign

    The campaign FK is set server-side from the URL; clients cannot reassign
    an item to a different campaign.
    """

    cms_module = 'training'

    def get_permissions(self):
        self.cms_action = self.get_cms_action()
        return [IsAuthenticated(), IsCMSUser(), HasModulePermission()]

    def dispatch(self, request, *args, **kwargs):
        self.campaign_instance = OfferCampaign.objects.filter(
            pk=kwargs.get('campaign_id')
        ).first()
        return super().dispatch(request, *args, **kwargs)

    def get_queryset(self):
        return OfferItem.objects.filter(
            campaign=self.campaign_instance
        ).select_related('program', 'program__image').order_by('display_order', 'id')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CMSOfferItemWriteSerializer
        return CMSOfferItemSerializer

    def perform_create(self, serializer):
        try:
            instance = serializer.save(campaign=self.campaign_instance)
        except IntegrityError as exc:
            # Safety net: the DB unique constraint (campaign, program) backs
            # the serializer-level validation for concurrent requests.
            raise serializers.ValidationError(
                {'program': 'This program is already part of this campaign.'}
            ) from exc
        self.log_cms_action(
            self.request, 'create', instance=instance,
            description='cms.training.offer_item_added',
            metadata={
                'id': instance.id,
                'campaign_id': self.campaign_instance.id,
                'campaign_slug': self.campaign_instance.slug,
                'program_id': instance.program_id,
                'program_slug': instance.program.slug,
            },
        )


class CMSOfferItemDetailView(CMSViewMixin, RetrieveUpdateDestroyAPIView):
    """
    GET    /api/v1/cms/training/offer-items/<pk>/  -> item detail
    PUT/PATCH /api/v1/cms/training/offer-items/<pk>/ -> update item
    DELETE /api/v1/cms/training/offer-items/<pk>/  -> remove item from campaign
    """

    cms_module = 'training'
    queryset = OfferItem.objects.select_related('program', 'campaign')

    def get_permissions(self):
        self.cms_action = self.get_cms_action()
        return [IsAuthenticated(), IsCMSUser(), HasModulePermission()]

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return CMSOfferItemWriteSerializer
        return CMSOfferItemSerializer

    def perform_update(self, serializer):
        instance = serializer.save()
        self.log_cms_action(
            self.request, 'update', instance=instance,
            description='cms.training.offer_item_updated',
            metadata={
                'id': instance.id,
                'campaign_id': instance.campaign_id,
                'program_id': instance.program_id,
                'program_slug': instance.program.slug,
                'show_promo_price_publicly': instance.show_promo_price_publicly,
            },
        )

    def perform_destroy(self, instance):
        self.log_cms_action(
            self.request, 'delete', instance=instance,
            description='cms.training.offer_item_removed',
            metadata={
                'id': instance.id,
                'campaign_id': instance.campaign_id,
                'program_id': instance.program_id,
            },
        )
        instance.delete()


class CMSOfferItemReorderView(CMSViewMixin, APIView):
    """
    POST /api/v1/cms/training/offers/<campaign_id>/items/reorder/
    Reorder offer items within a campaign.

    Body: {"items": [{"id": 1, "order": 0}, {"id": 2, "order": 1}, ...]}
    """

    cms_module = 'training'
    cms_action = 'update'
    permission_classes = [IsAuthenticated, IsCMSUser, HasModulePermission]

    def post(self, request, campaign_id):
        campaign = OfferCampaign.objects.filter(pk=campaign_id).first()
        if not campaign:
            return Response({'detail': 'Campaign not found.'}, status=404)

        serializer = ReorderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        items = serializer.validated_data.get('items', [])

        updated = 0
        for entry in items:
            obj_id = entry.get('id')
            order = entry.get('order')
            updated += OfferItem.objects.filter(
                pk=obj_id, campaign=campaign
            ).update(display_order=order)

        self.log_cms_action(
            request, 'update', instance=campaign,
            description='cms.training.offer_items_reordered',
            metadata={'campaign_id': campaign.id, 'updated_count': updated},
        )
        return Response({'detail': 'Reordered.', 'updated': updated})


class CMSStarterCampaignConfigView(CMSViewMixin, APIView):
    """GET/PUT /api/v1/cms/training/starter-form-config/

    Singleton configuration endpoint for the shared Starter campaign
    registration form. GET returns the active config (creating one with
    defaults if none exists). PUT updates it.
    """

    cms_module = 'training'
    cms_action = 'view'

    def get_permissions(self):
        self.cms_action = self.get_cms_action()
        return [IsAuthenticated(), IsCMSUser(), HasModulePermission()]

    def get(self, request):
        config = StarterCampaignConfig.get_current()
        serializer = CMSStarterCampaignConfigSerializer(config)
        return Response(serializer.data)

    def put(self, request):
        config = StarterCampaignConfig.get_current()
        serializer = CMSStarterCampaignConfigSerializer(config, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        self.log_cms_action(
            request, 'update', instance=config,
            description='cms.training.starter_form_config_updated',
        )
        return Response(serializer.data)

    def patch(self, request):
        return self.put(request)


class CMSStarterLandingView(CMSViewMixin, APIView):
    """GET/PUT /api/v1/cms/training/starter-landing/

    Draft management for the Starter landing page builder. GET returns the
    draft plus publish metadata. PUT replaces ``draft_sections`` after
    strict server-side validation — the public payload is never touched
    here. Optimistic concurrency: callers send ``expected_updated_at``;
    a stale editor receives HTTP 409 instead of silently overwriting.
    """

    cms_module = 'training'
    cms_action = 'view'

    def get_permissions(self):
        self.cms_action = self.get_cms_action()
        return [IsAuthenticated(), IsCMSUser(), HasModulePermission()]

    @staticmethod
    def serialize(page):
        return {
            'slug': page.slug,
            'sections': page.draft_sections,
            'published_sections': page.published_sections,
            'updated_at': page.updated_at.isoformat() if page.updated_at else None,
            'published_at': page.published_at.isoformat() if page.published_at else None,
            'has_unpublished_changes': page.has_unpublished_changes,
        }

    def get(self, request):
        return Response(self.serialize(StarterLandingPage.get_current()))

    def put(self, request):
        from django.core.exceptions import ValidationError
        from django.utils.dateparse import parse_datetime

        from .landing_sections import validate_sections

        page = StarterLandingPage.get_current()

        expected = request.data.get('expected_updated_at')
        if expected:
            expected_dt = parse_datetime(str(expected))
            if expected_dt is None or expected_dt != page.updated_at:
                return Response(
                    {
                        'detail': 'The draft was modified by someone else. '
                                  'Reload to get the latest version.',
                        'code': 'conflict',
                    },
                    status=status.HTTP_409_CONFLICT,
                )

        try:
            cleaned = validate_sections(request.data.get('sections'))
        except ValidationError as exc:
            errors = exc.message_dict if hasattr(exc, 'message_dict') else {'detail': exc.messages}
            return Response({'sections': errors}, status=status.HTTP_400_BAD_REQUEST)

        page.draft_sections = cleaned
        page.save(update_fields=['draft_sections', 'updated_at'])
        self.log_cms_action(
            request, 'update', instance=page,
            description='cms.training.starter_landing_draft_updated',
            metadata={'section_count': len(cleaned)},
        )
        return Response(self.serialize(page))


class CMSStarterLandingPublishView(CMSViewMixin, APIView):
    """POST /api/v1/cms/training/starter-landing/publish/

    Validates the complete draft, atomically copies it to the published
    payload, stamps publish metadata and creates a revision snapshot.
    Requires the ``training:publish`` action.
    """

    cms_module = 'training'
    cms_action = 'publish'
    permission_classes = [IsAuthenticated, IsCMSUser, HasModulePermission]

    def post(self, request):
        from django.core.exceptions import ValidationError

        from .landing_sections import validate_sections

        page = StarterLandingPage.get_current()
        try:
            cleaned = validate_sections(page.draft_sections)
        except ValidationError as exc:
            errors = exc.message_dict if hasattr(exc, 'message_dict') else {'detail': exc.messages}
            return Response({'sections': errors}, status=status.HTTP_400_BAD_REQUEST)

        page.draft_sections = cleaned
        page.save(update_fields=['draft_sections', 'updated_at'])
        page.publish(user=request.user)
        self.log_cms_action(
            request, 'publish', instance=page,
            description='cms.training.starter_landing_published',
            metadata={'section_count': len(cleaned)},
        )
        return Response(CMSStarterLandingView.serialize(page))


class CMSStarterLandingPreviewTokenView(CMSViewMixin, APIView):
    """POST /api/v1/cms/training/starter-landing/preview-token/

    Generates a short-lived signed token (10 minutes) that lets the shared
    renderer display the DRAFT payload via the public preview endpoint.
    Requires ``training:view``.
    """

    cms_module = 'training'
    cms_action = 'view'
    permission_classes = [IsAuthenticated, IsCMSUser, HasModulePermission]

    def post(self, request):
        page = StarterLandingPage.get_current()
        from .preview_service import generate_preview_token, DEFAULT_MAX_AGE
        token = generate_preview_token(page.slug)
        self.log_cms_action(
            request, 'view', instance=page,
            description='cms.training.starter_landing_preview_token_generated',
        )
        return Response({
            'token': token,
            'frontend_preview_url': f'/training/starter/register?preview={token}',
            'expires_in_seconds': DEFAULT_MAX_AGE,
        })
