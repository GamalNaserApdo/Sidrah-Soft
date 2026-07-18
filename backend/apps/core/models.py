"""Shared abstract models for all CMS apps."""
from django.db import models


class TimeStampedModel(models.Model):
    """Abstract base model providing created_at / updated_at fields."""

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
