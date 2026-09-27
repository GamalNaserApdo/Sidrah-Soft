"""Public views for the Dynamic Form Builder.

Endpoints:
- GET /api/v1/forms/<slug>/          → form schema for rendering
- POST /api/v1/forms/<slug>/submit/  → submit a form
- GET /api/v1/forms/assigned/<target>/ → get form assigned to a target
"""
from rest_framework import generics, permissions, throttling
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import FormDefinition, FormAssignment, FormSubmission
from .serializers import FormDefinitionPublicSerializer, FormSubmissionCreateSerializer


class FormDefinitionDetailView(generics.RetrieveAPIView):
    """Public form schema endpoint — returns the form definition for rendering."""
    queryset = FormDefinition.objects.filter(is_active=True)
    serializer_class = FormDefinitionPublicSerializer
    lookup_field = 'slug'
    permission_classes = [permissions.AllowAny]
    throttle_classes = [throttling.AnonRateThrottle]


class FormSubmitView(APIView):
    """Public form submission endpoint with server-side validation."""
    permission_classes = [permissions.AllowAny]
    throttle_classes = [throttling.ScopedRateThrottle]
    throttle_scope = 'form_submission'

    def post(self, request, slug=None):
        try:
            form = FormDefinition.objects.get(slug=slug, is_active=True)
        except FormDefinition.DoesNotExist:
            return Response({'detail': 'Form not found or inactive.'}, status=404)

        ip_address = request.META.get('REMOTE_ADDR')
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        language = request.data.get('_language', 'en')
        source_page = request.data.get('_source_page', '')

        # Remove control fields from data before validation
        data = {k: v for k, v in request.data.items() if not k.startswith('_')}

        serializer = FormSubmissionCreateSerializer(
            data=data,
            form=form,
            language=language,
            source_page=source_page,
            ip_address=ip_address,
            user_agent=user_agent,
        )
        serializer.is_valid(raise_exception=True)
        submission = serializer.save()

        return Response({
            'public_id': str(submission.public_id),
            'status': 'submitted',
            'message': form.success_message_en if language != 'ar' else (form.success_message_ar or form.success_message_en),
        }, status=201)


class AssignedFormView(APIView):
    """Returns the form assigned to a given target (e.g., 'ai_automation')."""
    permission_classes = [permissions.AllowAny]
    throttle_classes = [throttling.AnonRateThrottle]

    def get(self, request, target=None):
        try:
            assignment = FormAssignment.objects.select_related('form').get(
                target=target, is_active=True, form__is_active=True
            )
        except FormAssignment.DoesNotExist:
            return Response({'detail': 'No form assigned to this target.'}, status=404)

        serializer = FormDefinitionPublicSerializer(assignment.form)
        return Response(serializer.data)
