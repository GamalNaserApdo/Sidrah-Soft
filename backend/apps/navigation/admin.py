from django.contrib import admin
from django.core.exceptions import ValidationError
from django.forms import ModelForm

from .models import NavigationMenu, NavigationItem


class NavigationItemInline(admin.TabularInline):
    model = NavigationItem
    extra = 1
    ordering = ['order', 'id']
    fields = (
        'label_en',
        'label_ar',
        'parent',
        'link_type',
        'url',
        'route_name',
        'anchor',
        'email',
        'phone',
        'order',
        'open_in_new_tab',
        'icon',
        'icon_asset',
        'is_visible',
    )
    autocomplete_fields = ('parent', 'icon_asset')

    def get_formset(self, request, obj=None, **kwargs):
        formset = super().get_formset(request, obj, **kwargs)
        formset.request = request
        return formset


class NavigationItemForm(ModelForm):
    class Meta:
        model = NavigationItem
        fields = '__all__'

    def clean(self):
        cleaned_data = super().clean()
        instance = self.instance
        instance.label_en = cleaned_data.get('label_en', instance.label_en)
        instance.label_ar = cleaned_data.get('label_ar', instance.label_ar)
        instance.link_type = cleaned_data.get('link_type', instance.link_type)
        instance.url = cleaned_data.get('url', instance.url)
        instance.route_name = cleaned_data.get('route_name', instance.route_name)
        instance.anchor = cleaned_data.get('anchor', instance.anchor)
        instance.email = cleaned_data.get('email', instance.email)
        instance.phone = cleaned_data.get('phone', instance.phone)
        instance.parent = cleaned_data.get('parent', instance.parent)
        instance.menu = cleaned_data.get('menu', instance.menu)
        try:
            instance.clean()
        except ValidationError as exc:
            self._update_errors(exc)
        return cleaned_data


@admin.register(NavigationMenu)
class NavigationMenuAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'location', 'order', 'is_active', 'updated_at')
    list_filter = ('location', 'is_active')
    search_fields = ('name', 'slug', 'description')
    prepopulated_fields = {'slug': ('name',)}
    ordering = ('location', 'order', 'name')
    inlines = [NavigationItemInline]


@admin.register(NavigationItem)
class NavigationItemAdmin(admin.ModelAdmin):
    form = NavigationItemForm
    list_display = (
        'label_en',
        'label_ar',
        'menu',
        'parent',
        'link_type',
        'order',
        'is_visible',
        'updated_at',
    )
    list_filter = ('menu', 'link_type', 'is_visible')
    search_fields = ('label_en', 'label_ar', 'url', 'route_name', 'anchor', 'email', 'phone')
    ordering = ('menu', 'order', 'id')
    autocomplete_fields = ('parent', 'icon_asset')
