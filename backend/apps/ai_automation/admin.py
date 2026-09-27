from django.contrib import admin

from .models import (
    AIAutomationPage,
    AIAutomationItem,
    AIAutomationProcessStep,
    AIAutomationFAQ,
)

admin.site.register(AIAutomationPage)
admin.site.register(AIAutomationItem)
admin.site.register(AIAutomationProcessStep)
admin.site.register(AIAutomationFAQ)
