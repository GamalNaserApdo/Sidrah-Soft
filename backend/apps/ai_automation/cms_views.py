"""CMS API views for the AI Automation page."""
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsCMSUser, HasModulePermission
from apps.core.cms_permissions import CMSViewMixin

from .models import (
    AIAutomationPage,
    AIAutomationItem,
    AIAutomationProcessStep,
    AIAutomationFAQ,
)
from .cms_serializers import (
    CMSAIAutomationPageSerializer,
    CMSAIAutomationItemSerializer,
    CMSAIAutomationProcessStepSerializer,
    CMSAIAutomationFAQSerializer,
)


class CMSAIAutomationPageView(CMSViewMixin, APIView):
    """
    GET/PUT /api/v1/cms/ai-automation/

    Singleton endpoint for the AI Automation page content.
    GET returns the current page; PUT updates it.
    """

    cms_module = 'ai_automation'
    cms_action = 'view'
    permission_classes = [IsAuthenticated, IsCMSUser, HasModulePermission]

    def get(self, request):
        page = AIAutomationPage.get_current()
        if not page:
            return Response(
                {'detail': 'AI Automation page is not configured yet.'},
                status=404,
            )
        serializer = CMSAIAutomationPageSerializer(page, context={'request': request})
        return Response(serializer.data)

    def put(self, request):
        self.cms_action = 'update'
        page = AIAutomationPage.get_current()
        if not page:
            # Create the singleton
            serializer = CMSAIAutomationPageSerializer(
                data=request.data, context={'request': request}
            )
        else:
            serializer = CMSAIAutomationPageSerializer(
                page, data=request.data, partial=True, context={'request': request}
            )
        serializer.is_valid(raise_exception=True)
        page = serializer.save()
        self.log_cms_action(
            request, 'ai_automation_change', instance=page,
            description='cms.ai_automation.page_change',
            metadata={'changed_fields': list(request.data.keys())},
        )
        return Response(serializer.data)


class CMSAIAutomationItemListView(CMSViewMixin, APIView):
    """
    GET/POST /api/v1/cms/ai-automation/items/

    List all items or create a new item.
    """

    cms_module = 'ai_automation'
    cms_action = 'view'
    permission_classes = [IsAuthenticated, IsCMSUser, HasModulePermission]

    def get(self, request):
        page = AIAutomationPage.get_current()
        if not page:
            return Response([])
        items = page.items.all().order_by('section', 'display_order', 'id')
        serializer = CMSAIAutomationItemSerializer(items, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        self.cms_action = 'update'
        page = AIAutomationPage.get_current()
        if not page:
            return Response({'detail': 'Page not configured.'}, status=404)
        data = {**request.data, 'page': page.pk}
        serializer = CMSAIAutomationItemSerializer(data=data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        item = serializer.save(page=page)
        self.log_cms_action(
            request, 'ai_automation_item_create', instance=item,
            description=f'cms.ai_automation.item_create:{item.section}',
        )
        return Response(serializer.data, status=201)


class CMSAIAutomationItemDetailView(CMSViewMixin, APIView):
    """
    GET/PUT/DELETE /api/v1/cms/ai-automation/items/<id>/
    """

    cms_module = 'ai_automation'
    cms_action = 'view'
    permission_classes = [IsAuthenticated, IsCMSUser, HasModulePermission]

    def _get_item(self, pk):
        try:
            return AIAutomationItem.objects.get(pk=pk)
        except AIAutomationItem.DoesNotExist:
            return None

    def get(self, request, pk=None):
        item = self._get_item(pk)
        if not item:
            return Response({'detail': 'Not found.'}, status=404)
        serializer = CMSAIAutomationItemSerializer(item, context={'request': request})
        return Response(serializer.data)

    def put(self, request, pk=None):
        self.cms_action = 'update'
        item = self._get_item(pk)
        if not item:
            return Response({'detail': 'Not found.'}, status=404)
        serializer = CMSAIAutomationItemSerializer(
            item, data=request.data, partial=True, context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        self.log_cms_action(
            request, 'ai_automation_item_update', instance=item,
            description=f'cms.ai_automation.item_update:{item.section}',
        )
        return Response(serializer.data)

    def delete(self, request, pk=None):
        self.cms_action = 'update'
        item = self._get_item(pk)
        if not item:
            return Response({'detail': 'Not found.'}, status=404)
        section = item.section
        item.delete()
        self.log_cms_action(
            request, 'ai_automation_item_delete',
            description=f'cms.ai_automation.item_delete:{section}',
        )
        return Response(status=204)


class CMSAIAutomationProcessStepListView(CMSViewMixin, APIView):
    """GET/POST /api/v1/cms/ai-automation/process-steps/"""

    cms_module = 'ai_automation'
    cms_action = 'view'
    permission_classes = [IsAuthenticated, IsCMSUser, HasModulePermission]

    def get(self, request):
        page = AIAutomationPage.get_current()
        if not page:
            return Response([])
        steps = page.process_steps.all().order_by('display_order', 'id')
        serializer = CMSAIAutomationProcessStepSerializer(steps, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        self.cms_action = 'update'
        page = AIAutomationPage.get_current()
        if not page:
            return Response({'detail': 'Page not configured.'}, status=404)
        serializer = CMSAIAutomationProcessStepSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        step = serializer.save(page=page)
        self.log_cms_action(
            request, 'ai_automation_process_create', instance=step,
            description='cms.ai_automation.process_create',
        )
        return Response(serializer.data, status=201)


class CMSAIAutomationProcessStepDetailView(CMSViewMixin, APIView):
    """GET/PUT/DELETE /api/v1/cms/ai-automation/process-steps/<id>/"""

    cms_module = 'ai_automation'
    cms_action = 'view'
    permission_classes = [IsAuthenticated, IsCMSUser, HasModulePermission]

    def _get_step(self, pk):
        try:
            return AIAutomationProcessStep.objects.get(pk=pk)
        except AIAutomationProcessStep.DoesNotExist:
            return None

    def get(self, request, pk=None):
        step = self._get_step(pk)
        if not step:
            return Response({'detail': 'Not found.'}, status=404)
        serializer = CMSAIAutomationProcessStepSerializer(step, context={'request': request})
        return Response(serializer.data)

    def put(self, request, pk=None):
        self.cms_action = 'update'
        step = self._get_step(pk)
        if not step:
            return Response({'detail': 'Not found.'}, status=404)
        serializer = CMSAIAutomationProcessStepSerializer(
            step, data=request.data, partial=True, context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        self.log_cms_action(
            request, 'ai_automation_process_update', instance=step,
            description='cms.ai_automation.process_update',
        )
        return Response(serializer.data)

    def delete(self, request, pk=None):
        self.cms_action = 'update'
        step = self._get_step(pk)
        if not step:
            return Response({'detail': 'Not found.'}, status=404)
        step.delete()
        self.log_cms_action(
            request, 'ai_automation_process_delete',
            description='cms.ai_automation.process_delete',
        )
        return Response(status=204)


class CMSAIAutomationFAQListView(CMSViewMixin, APIView):
    """GET/POST /api/v1/cms/ai-automation/faqs/"""

    cms_module = 'ai_automation'
    cms_action = 'view'
    permission_classes = [IsAuthenticated, IsCMSUser, HasModulePermission]

    def get(self, request):
        page = AIAutomationPage.get_current()
        if not page:
            return Response([])
        faqs = page.faqs.all().order_by('display_order', 'id')
        serializer = CMSAIAutomationFAQSerializer(faqs, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        self.cms_action = 'update'
        page = AIAutomationPage.get_current()
        if not page:
            return Response({'detail': 'Page not configured.'}, status=404)
        serializer = CMSAIAutomationFAQSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        faq = serializer.save(page=page)
        self.log_cms_action(
            request, 'ai_automation_faq_create', instance=faq,
            description='cms.ai_automation.faq_create',
        )
        return Response(serializer.data, status=201)


class CMSAIAutomationFAQDetailView(CMSViewMixin, APIView):
    """GET/PUT/DELETE /api/v1/cms/ai-automation/faqs/<id>/"""

    cms_module = 'ai_automation'
    cms_action = 'view'
    permission_classes = [IsAuthenticated, IsCMSUser, HasModulePermission]

    def _get_faq(self, pk):
        try:
            return AIAutomationFAQ.objects.get(pk=pk)
        except AIAutomationFAQ.DoesNotExist:
            return None

    def get(self, request, pk=None):
        faq = self._get_faq(pk)
        if not faq:
            return Response({'detail': 'Not found.'}, status=404)
        serializer = CMSAIAutomationFAQSerializer(faq, context={'request': request})
        return Response(serializer.data)

    def put(self, request, pk=None):
        self.cms_action = 'update'
        faq = self._get_faq(pk)
        if not faq:
            return Response({'detail': 'Not found.'}, status=404)
        serializer = CMSAIAutomationFAQSerializer(
            faq, data=request.data, partial=True, context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        self.log_cms_action(
            request, 'ai_automation_faq_update', instance=faq,
            description='cms.ai_automation.faq_update',
        )
        return Response(serializer.data)

    def delete(self, request, pk=None):
        self.cms_action = 'update'
        faq = self._get_faq(pk)
        if not faq:
            return Response({'detail': 'Not found.'}, status=404)
        faq.delete()
        self.log_cms_action(
            request, 'ai_automation_faq_delete',
            description='cms.ai_automation.faq_delete',
        )
        return Response(status=204)
