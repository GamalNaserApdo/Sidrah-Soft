from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User

# Customize the admin site headers for clear identification.
admin.site.site_header = 'SidrahSoft Administration'
admin.site.site_title = 'SidrahSoft Admin'
admin.site.index_title = 'System Administration'


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Role', {'fields': ('role',)}),
    )
    list_display = (
        'username',
        'email',
        'first_name',
        'last_name',
        'role',
        'is_staff',
        'is_active',
    )
    list_filter = BaseUserAdmin.list_filter + ('role',)
    search_fields = ('username', 'email', 'first_name', 'last_name')
