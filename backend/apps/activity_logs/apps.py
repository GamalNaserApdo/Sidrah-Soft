"""App configuration for activity_logs."""
from django.apps import AppConfig


class ActivityLogsConfig(AppConfig):
    """Activity logs app config."""

    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.activity_logs'
    label = 'activity_logs'
    verbose_name = 'Activity Logs'

    def ready(self):
        """Import signal receivers when the app is ready."""
        from . import signals  # noqa: F401
