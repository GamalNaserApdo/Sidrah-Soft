"""Public API views for the Contact Management CMS app."""
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle, ScopedRateThrottle
from rest_framework.views import APIView

from apps.activity_logs.services import log_activity

from .models import InquiryType
from .serializers import ContactSubmissionCreateSerializer, InquiryTypeSerializer
from .services import send_submission_notification


class InquiryTypeListView(APIView):
    """Return active inquiry types ordered for the public contact form."""

    permission_classes = [AllowAny]
    throttle_classes = [AnonRateThrottle]

    def get(self, request):
        queryset = InquiryType.objects.filter(
            is_active=True,
        ).order_by('order', 'name_en')
        serializer = InquiryTypeSerializer(
            queryset,
            many=True,
            context={'request': request},
        )
        return Response(serializer.data)


class ContactSubmissionCreateView(APIView):
    """Accept and persist a public contact form submission."""

    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'contact_submission'

    def _capture_client_metadata(self, request):
        """Collect non-sensitive source metadata from the request."""
        return {
            'ip_address': self._get_client_ip(request),
            'user_agent': request.META.get('HTTP_USER_AGENT', '')[:1000],
        }

    def _get_client_ip(self, request):
        """Return the client IP address.

        Only REMOTE_ADDR is trusted by default. X-Forwarded-For is not used
        because the project does not currently configure a trusted proxy list.
        """
        remote_addr = request.META.get('REMOTE_ADDR')
        return remote_addr if remote_addr else None

    def post(self, request):
        serializer = ContactSubmissionCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        metadata = self._capture_client_metadata(request)
        submission = serializer.save(**metadata)

        log_activity(
            user=None,
            action='lead_created',
            module='leads',
            request=request,
            object_instance=submission,
            description='Lead submitted through public contact form.',
            metadata={
                'public_id': str(submission.public_id),
                'inquiry_type': submission.inquiry_type.slug if submission.inquiry_type else None,
                'language': submission.language or 'en',
                'source_page': submission.source_page,
            },
            is_success=True,
        )

        send_submission_notification(submission, request=request)

        return Response(
            {
                'success': True,
                'public_id': str(submission.public_id),
                'status': submission.status,
                'message': 'Your inquiry has been received. We will be in touch soon.',
            },
            status=status.HTTP_201_CREATED,
        )
