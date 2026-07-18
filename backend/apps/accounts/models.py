from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom user model with role-based permission foundation."""

    ROLE_SUPER_ADMIN = 'super_admin'
    ROLE_ADMIN = 'admin'
    ROLE_CONTENT_MANAGER = 'content_manager'
    ROLE_EDITOR = 'editor'
    ROLE_MARKETING_MANAGER = 'marketing_manager'
    ROLE_MARKETING_SEO = 'marketing_seo'  # Legacy: mapped to marketing manager.
    ROLE_RECRUITER = 'recruiter'
    ROLE_SUPPORT_AGENT = 'support_agent'
    ROLE_SUPPORT_RECRUITER = 'support_recruiter'  # Legacy: mapped to support + recruiter.
    ROLE_LMS_ADMIN = 'lms_admin'
    ROLE_FINANCE_SALES = 'finance_sales'

    ROLE_CHOICES = [
        (ROLE_SUPER_ADMIN, 'Super Admin'),
        (ROLE_ADMIN, 'Admin'),
        (ROLE_CONTENT_MANAGER, 'Content Manager'),
        (ROLE_EDITOR, 'Editor'),
        (ROLE_MARKETING_MANAGER, 'Marketing Manager'),
        (ROLE_MARKETING_SEO, 'Marketing / SEO'),
        (ROLE_RECRUITER, 'Recruiter'),
        (ROLE_SUPPORT_AGENT, 'Support Agent'),
        (ROLE_SUPPORT_RECRUITER, 'Support / Recruiter'),
        (ROLE_LMS_ADMIN, 'LMS Admin'),
        (ROLE_FINANCE_SALES, 'Finance / Sales'),
    ]

    role = models.CharField(
        max_length=32,
        choices=ROLE_CHOICES,
        default=ROLE_CONTENT_MANAGER,
        help_text='Determines the user\'s default permissions inside the CMS.',
    )

    class Meta:
        db_table = 'accounts_user'

    def __str__(self):
        return self.username
