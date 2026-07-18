import os
import uuid

from django.conf import settings
from django.db import models

from apps.core.models import TimeStampedModel


def media_file_path(instance, filename):
    """Upload files to a hashed path inside the media root."""
    ext = filename.split('.')[-1].lower()
    filename = f'{uuid.uuid4()}.{ext}'
    return os.path.join('uploads', filename[:2], filename[2:4], filename)


class MediaAsset(TimeStampedModel):
    """A reusable media asset for the CMS."""

    MEDIA_TYPE_IMAGE = 'image'
    MEDIA_TYPE_DOCUMENT = 'document'
    MEDIA_TYPE_VIDEO = 'video'
    MEDIA_TYPE_AUDIO = 'audio'
    MEDIA_TYPE_OTHER = 'other'

    MEDIA_TYPE_CHOICES = [
        (MEDIA_TYPE_IMAGE, 'Image'),
        (MEDIA_TYPE_DOCUMENT, 'Document'),
        (MEDIA_TYPE_VIDEO, 'Video'),
        (MEDIA_TYPE_AUDIO, 'Audio'),
        (MEDIA_TYPE_OTHER, 'Other'),
    ]

    title = models.CharField(max_length=255, blank=True)
    file = models.FileField(upload_to=media_file_path)
    alt_text = models.CharField(max_length=255, blank=True)
    media_type = models.CharField(
        max_length=32,
        choices=MEDIA_TYPE_CHOICES,
        default=MEDIA_TYPE_OTHER,
    )
    usage_context = models.CharField(
        max_length=120,
        blank=True,
        help_text='Where this asset is intended to be used, e.g. partner logo.',
    )
    is_active = models.BooleanField(default=True)

    # System-managed fields (populated by the upload service, not client-writable)
    file_size = models.PositiveBigIntegerField(null=True, blank=True)
    mime_type = models.CharField(max_length=255, blank=True, default='')
    width = models.PositiveIntegerField(null=True, blank=True)
    height = models.PositiveIntegerField(null=True, blank=True)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='uploaded_media',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )

    class Meta:
        db_table = 'media_library_mediaasset'
        verbose_name = 'Media Asset'
        verbose_name_plural = 'Media Assets'
        ordering = ['-created_at']

    def __str__(self):
        return self.title or self.file.name or str(self.id)
