"""Public API views for Training & Education programs."""
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Program
from .serializers import ProgramListSerializer, ProgramDetailSerializer


class ProgramListView(APIView):
    """
    GET /api/v1/training/programs/
    Return all active programs, optionally filtered by branch.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        qs = Program.objects.filter(status=Program.STATUS_ACTIVE).order_by('display_order', 'title_en')

        branch = request.query_params.get('branch')
        if branch and branch in dict(Program.BRANCH_CHOICES):
            qs = qs.filter(branch=branch)

        serializer = ProgramListSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)


class ProgramDetailView(APIView):
    """
    GET /api/v1/training/programs/<slug>/
    Return a single active program by slug.
    """
    permission_classes = [AllowAny]

    def get(self, request, slug):
        try:
            program = Program.objects.get(slug=slug, status=Program.STATUS_ACTIVE)
        except Program.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=404)

        serializer = ProgramDetailSerializer(program, context={'request': request})
        return Response(serializer.data)
