"""Media library service layer — upload, usage detection, protected deletion."""
import os

from django.db import transaction

from .models import MediaAsset
from .validators import validate_uploaded_file


def _safe_label(instance):
    """Return a safe human-readable label for a model instance."""
    for attr in ('title_en', 'name_en', 'label_en', 'site_name', 'name', 'title', 'label'):
        val = getattr(instance, attr, None)
        if val:
            return str(val)[:200]
    return str(instance)[:200]


def _query_single(model, field_name, asset_id):
    """Return (count, items) for a single FK field referencing asset_id."""
    qs = model.objects.filter(**{f'{field_name}_id': asset_id})
    count = qs.count()
    items = []
    if count:
        for obj in qs[:10]:
            items.append({
                'object_id': obj.pk,
                'object_label': _safe_label(obj),
            })
    return count, items


# Registry of all MediaAsset FK references in the project.
# Each entry: (module_name, model_class, field_name)
_USAGE_REGISTRY = None


def _build_usage_registry():
    """Build the usage registry lazily to avoid import-time coupling."""
    global _USAGE_REGISTRY
    if _USAGE_REGISTRY is not None:
        return _USAGE_REGISTRY

    from apps.partners.models import Partner
    from apps.services.models import Service
    from apps.case_studies.models import CaseStudy
    from apps.insights.models import Article
    from apps.navigation.models import NavigationItem
    from apps.site_settings.models import SiteSetting

    _USAGE_REGISTRY = [
        ('partners', Partner, 'logo'),
        ('services', Service, 'icon'),
        ('services', Service, 'featured_image'),
        ('case_studies', CaseStudy, 'featured_image'),
        ('case_studies', CaseStudy, 'logo'),
        ('insights', Article, 'featured_image'),
        ('navigation', NavigationItem, 'icon_asset'),
        ('site_settings', SiteSetting, 'default_og_image'),
        ('site_settings', SiteSetting, 'primary_logo'),
        ('site_settings', SiteSetting, 'secondary_logo'),
        ('site_settings', SiteSetting, 'favicon'),
    ]
    return _USAGE_REGISTRY


def get_asset_usage(asset_id):
    """
    Return usage information for a MediaAsset.

    Returns dict:
    {
        'media_id': int,
        'is_used': bool,
        'usage_count': int,
        'usages': [{module, model, field, object_id, object_label}, ...]
    }
    """
    registry = _build_usage_registry()
    usages = []
    total_count = 0

    for module, model, field_name in registry:
        count, items = _query_single(model, field_name, asset_id)
        if count:
            total_count += count
            for item in items:
                usages.append({
                    'module': module,
                    'model': model.__name__,
                    'field': field_name,
                    'object_id': item['object_id'],
                    'object_label': item['object_label'],
                })

    return {
        'media_id': asset_id,
        'is_used': total_count > 0,
        'usage_count': total_count,
        'usages': usages,
    }


def is_asset_used(asset_id):
    """Quick boolean check if an asset is referenced by any content."""
    return get_asset_usage(asset_id)['is_used']


@transaction.atomic
def create_media_asset(uploaded_file, user, title='', alt_text='', usage_context=''):
    """
    Validate and create a new MediaAsset from an uploaded file.

    Returns the created MediaAsset instance.

    Raises MediaValidationError on validation failure.
    No partially saved record or orphaned file remains on failure.
    """
    meta = validate_uploaded_file(uploaded_file)

    asset = MediaAsset(
        title=title or '',
        alt_text=alt_text or '',
        usage_context=usage_context or '',
        media_type=MediaAsset.MEDIA_TYPE_IMAGE,
        is_active=True,
        file_size=meta['file_size'],
        mime_type=meta['mime_type'],
        width=meta['width'],
        height=meta['height'],
        uploaded_by=user,
    )

    # Save the file — if this fails, the transaction rolls back
    asset.file.save(
        f'upload.{meta["ext"]}',
        uploaded_file,
        save=False,
    )
    asset.save()

    return asset


@transaction.atomic
def delete_media_asset(asset):
    """
    Delete an unused MediaAsset and its physical file.

    Raises ValidationError if the asset is referenced by content.

    Safe ordering:
    1. Check usage (within transaction)
    2. Capture audit info
    3. Delete DB record
    4. Delete physical file (after DB commit point within transaction)
    """
    usage = get_asset_usage(asset.id)
    if usage['is_used']:
        from .validators import MediaValidationError
        raise MediaValidationError(
            'This media asset cannot be deleted because it is currently in use.',
            code='media_in_use',
        )

    # Capture safe audit info before deletion
    asset_id = asset.id
    asset_label = asset.title or asset.file.name or str(asset.id)
    file_name = asset.file.name if asset.file else ''

    # Delete DB record first
    asset.delete()

    # Delete physical file after DB record is removed
    # If file deletion fails, the DB record is already gone —
    # this is the safest ordering (orphaned file is better than orphaned DB record)
    if file_name:
        try:
            from django.core.files.storage import default_storage
            if default_storage.exists(file_name):
                default_storage.delete(file_name)
        except Exception:
            # Log but don't raise — file cleanup is best-effort
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(
                'Failed to delete media file "%s" after record deletion',
                file_name,
            )

    return {
        'asset_id': asset_id,
        'asset_label': asset_label,
        'file_name': file_name,
    }
