from django.core.exceptions import ValidationError
from django.core.validators import URLValidator, validate_email
from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.core.models import TimeStampedModel
from apps.media_library.models import MediaAsset


class NavigationMenu(TimeStampedModel):
    """A CMS-controlled navigation menu."""

    LOCATION_HEADER = 'header'
    LOCATION_FOOTER = 'footer'
    LOCATION_MOBILE = 'mobile'
    LOCATION_LEGAL = 'legal'

    LOCATION_CHOICES = [
        (LOCATION_HEADER, _('Header')),
        (LOCATION_FOOTER, _('Footer')),
        (LOCATION_MOBILE, _('Mobile')),
        (LOCATION_LEGAL, _('Legal')),
    ]

    name = models.CharField(
        max_length=120,
        help_text=_('Human-readable name, e.g. "Main Header".'),
    )
    slug = models.SlugField(
        max_length=64,
        unique=True,
        default='',
        help_text=_('Unique code used by the frontend, e.g. "main-header".'),
    )
    location = models.CharField(
        max_length=32,
        choices=LOCATION_CHOICES,
        default=LOCATION_HEADER,
        help_text=_('Menu location hint for the frontend.'),
    )
    description = models.CharField(
        max_length=255,
        blank=True,
        default='',
    )
    order = models.PositiveIntegerField(
        default=0,
        help_text=_('Lower values appear first in API listings.'),
    )
    is_active = models.BooleanField(
        default=True,
        help_text=_('Inactive menus are hidden from public APIs.'),
    )

    class Meta:
        db_table = 'navigation_navigationmenu'
        verbose_name = _('Navigation Menu')
        verbose_name_plural = _('Navigation Menus')
        ordering = ['location', 'order', 'name']
        indexes = [
            models.Index(fields=['location', 'is_active']),
        ]

    def __str__(self):
        return f'{self.name} ({self.slug})'


class NavigationItem(TimeStampedModel):
    """A single link inside a navigation menu, supporting hierarchy and bilingual labels."""

    LINK_INTERNAL = 'internal'
    LINK_EXTERNAL = 'external'
    LINK_ANCHOR = 'anchor'
    LINK_EMAIL = 'email'
    LINK_PHONE = 'phone'

    LINK_TYPE_CHOICES = [
        (LINK_INTERNAL, _('Internal page')),
        (LINK_EXTERNAL, _('External URL')),
        (LINK_ANCHOR, _('Page anchor')),
        (LINK_EMAIL, _('Email address')),
        (LINK_PHONE, _('Phone number')),
    ]

    menu = models.ForeignKey(
        NavigationMenu,
        related_name='items',
        on_delete=models.CASCADE,
    )
    parent = models.ForeignKey(
        'self',
        related_name='children',
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        help_text=_('Parent item for a two-level dropdown.'),
    )
    label_en = models.CharField(
        _('Label (English)'),
        max_length=120,
        default='',
    )
    label_ar = models.CharField(
        _('Label (Arabic)'),
        max_length=120,
        blank=True,
        default='',
    )
    link_type = models.CharField(
        max_length=16,
        choices=LINK_TYPE_CHOICES,
        default=LINK_INTERNAL,
    )
    url = models.CharField(
        max_length=512,
        blank=True,
        default='',
        help_text=_('Internal path or external URL.'),
    )
    route_name = models.CharField(
        max_length=120,
        blank=True,
        default='',
        help_text=_('Django URL name or frontend route name for internal links.'),
    )
    anchor = models.CharField(
        max_length=120,
        blank=True,
        default='',
        help_text=_('Anchor target without the #, e.g. "contact".'),
    )
    email = models.EmailField(
        blank=True,
        default='',
    )
    phone = models.CharField(
        max_length=40,
        blank=True,
        default='',
    )
    order = models.PositiveIntegerField(
        default=0,
        help_text=_('Lower values appear first.'),
    )
    open_in_new_tab = models.BooleanField(
        default=False,
    )
    icon = models.CharField(
        max_length=120,
        blank=True,
        default='',
        help_text=_('Optional icon class or identifier.'),
    )
    icon_asset = models.ForeignKey(
        MediaAsset,
        related_name='+',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    is_visible = models.BooleanField(
        default=True,
        help_text=_('Hidden items are excluded from public APIs.'),
    )

    class Meta:
        db_table = 'navigation_navigationitem'
        verbose_name = _('Navigation Item')
        verbose_name_plural = _('Navigation Items')
        ordering = ['order', 'id']
        indexes = [
            models.Index(fields=['menu', 'parent', 'is_visible', 'order']),
        ]

    def __str__(self):
        return f'{self.label_en} ({self.menu.slug})'

    @property
    def href(self):
        """Return the final link href based on link_type."""
        if self.link_type == self.LINK_INTERNAL:
            if self.url:
                return self.url
            if self.route_name:
                return f'/{self.route_name}'
            return ''
        if self.link_type == self.LINK_EXTERNAL:
            return self.url
        if self.link_type == self.LINK_ANCHOR:
            return f'#{self.anchor}' if self.anchor else ''
        if self.link_type == self.LINK_EMAIL:
            return f'mailto:{self.email}' if self.email else ''
        if self.link_type == self.LINK_PHONE:
            return f'tel:{self.phone}' if self.phone else ''
        return ''

    def clean(self):
        super().clean()
        errors = {}

        # Self-parenting
        if self.parent_id and self.parent_id == self.pk:
            errors['parent'] = _('An item cannot be its own parent.')

        # Parent must belong to the same menu and must not itself have a parent.
        if self.parent:
            if self.parent.menu_id != self.menu_id:
                errors['parent'] = _('Parent item must belong to the same menu.')
            if self.parent.parent_id is not None:
                errors['parent'] = _('Maximum depth is two levels. Parent cannot have its own parent.')

        # Link type validation
        if self.link_type == self.LINK_INTERNAL:
            if not self.url and not self.route_name:
                errors['url'] = _('Internal links require a URL or a route name.')
        elif self.link_type == self.LINK_EXTERNAL:
            if not self.url:
                errors['url'] = _('External links require a URL.')
            else:
                validator = URLValidator()
                try:
                    validator(self.url)
                except ValidationError:
                    errors['url'] = _('Enter a valid external URL.')
        elif self.link_type == self.LINK_ANCHOR:
            if not self.anchor:
                errors['anchor'] = _('Anchor links require an anchor value.')
        elif self.link_type == self.LINK_EMAIL:
            if not self.email:
                errors['email'] = _('Email links require an email address.')
            else:
                try:
                    validate_email(self.email)
                except ValidationError as exc:
                    errors['email'] = exc.message
        elif self.link_type == self.LINK_PHONE:
            if not self.phone:
                errors['phone'] = _('Phone links require a phone number.')

        if errors:
            raise ValidationError(errors)

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
