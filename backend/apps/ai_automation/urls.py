"""Public URL configuration for the AI Automation app."""
from django.urls import path

from .views import AIAutomationView

app_name = 'ai_automation'

urlpatterns = [
    path('ai-automation/', AIAutomationView.as_view(), name='ai-automation'),
]
