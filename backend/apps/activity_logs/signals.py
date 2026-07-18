"""Signal receivers that convert Django admin actions into ActivityLog entries."""
from django.contrib.admin.models import LogEntry
from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.activity_logs.services import log_activity


@receiver(post_save, sender=LogEntry)
def log_admin_action(sender, instance, created, **kwargs):
    """
    Convert Django admin LogEntry records into ActivityLog entries.

    This is intentionally coarse: it only fires for actions already performed
    through the Django admin interface, avoiding per-model signal noise.
    Future custom admin API views should call log_activity/log_content_action
    explicitly to avoid duplicate logs.
    """
    if not created:
        return

    action_map = {
        1: 'create',
        2: 'update',
        3: 'delete',
    }

    action = action_map.get(instance.action_flag, 'update')

    try:
        from django.contrib.contenttypes.models import ContentType
        ct = ContentType.objects.get_for_id(instance.content_type_id)
        object_type = f'{ct.app_label}.{ct.model}'
    except Exception:
        object_type = ''

    log_activity(
        user=instance.user,
        action=action,
        module=object_type.split('.')[0] if object_type else '',
        request=None,
        object_type=object_type,
        object_id=str(instance.object_id),
        object_repr=instance.object_repr,
        description=instance.change_message or '',
        metadata={'admin_log_entry_id': instance.pk},
        is_success=True,
    )
