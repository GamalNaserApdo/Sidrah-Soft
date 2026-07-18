"""
Centralized CMS role policy.

Defines which modules and actions each role can access.
This is the single source of truth for authorization decisions.

WHY SESSION AUTH (not JWT):
- The CMS dashboard is a first-party SPA served from the same origin.
- Session cookies with HttpOnly + SameSite=Lax provide superior XSS protection.
- No token storage in localStorage eliminates token theft vector.
- CSRF protection is enforced via Django's standard double-submit cookie pattern.
- Refresh token rotation complexity is unnecessary for same-origin SPAs.
- Django Admin already uses session auth; sharing sessions avoids dual-auth stacks.
"""

# ---------------------------------------------------------------------------
# Module identifiers
# ---------------------------------------------------------------------------

MODULE_DASHBOARD = 'dashboard'
MODULE_SITE_SETTINGS = 'site_settings'
MODULE_NAVIGATION = 'navigation'
MODULE_PARTNERS = 'partners'
MODULE_SERVICES = 'services'
MODULE_CASE_STUDIES = 'case_studies'
MODULE_CAREERS = 'careers'
MODULE_INSIGHTS = 'insights'
MODULE_CONTACT = 'contact'
MODULE_MEDIA = 'media'
MODULE_USERS = 'users'
MODULE_ACTIVITY_LOGS = 'activity_logs'

ALL_MODULES = [
    MODULE_DASHBOARD,
    MODULE_SITE_SETTINGS,
    MODULE_NAVIGATION,
    MODULE_PARTNERS,
    MODULE_SERVICES,
    MODULE_CASE_STUDIES,
    MODULE_CAREERS,
    MODULE_INSIGHTS,
    MODULE_CONTACT,
    MODULE_MEDIA,
    MODULE_USERS,
    MODULE_ACTIVITY_LOGS,
]

# ---------------------------------------------------------------------------
# Action identifiers
# ---------------------------------------------------------------------------

ACTION_VIEW = 'view'
ACTION_CREATE = 'create'
ACTION_UPDATE = 'update'
ACTION_DELETE = 'delete'
ACTION_PUBLISH = 'publish'
ACTION_EXPORT = 'export'
ACTION_ASSIGN = 'assign'
ACTION_MANAGE_USERS = 'manage_users'

ALL_ACTIONS = [
    ACTION_VIEW,
    ACTION_CREATE,
    ACTION_UPDATE,
    ACTION_DELETE,
    ACTION_PUBLISH,
    ACTION_EXPORT,
    ACTION_ASSIGN,
    ACTION_MANAGE_USERS,
]

# ---------------------------------------------------------------------------
# Role constants (must match User.ROLE_* values)
# ---------------------------------------------------------------------------

ROLE_SUPER_ADMIN = 'super_admin'
ROLE_ADMIN = 'admin'
ROLE_CONTENT_MANAGER = 'content_manager'
ROLE_EDITOR = 'editor'
ROLE_MARKETING_MANAGER = 'marketing_manager'
ROLE_MARKETING_SEO = 'marketing_seo'
ROLE_RECRUITER = 'recruiter'
ROLE_SUPPORT_AGENT = 'support_agent'
ROLE_SUPPORT_RECRUITER = 'support_recruiter'
ROLE_LMS_ADMIN = 'lms_admin'
ROLE_FINANCE_SALES = 'finance_sales'

# All roles that have any CMS dashboard access.
CMS_ROLES = {
    ROLE_SUPER_ADMIN,
    ROLE_ADMIN,
    ROLE_CONTENT_MANAGER,
    ROLE_EDITOR,
    ROLE_MARKETING_MANAGER,
    ROLE_MARKETING_SEO,
    ROLE_RECRUITER,
    ROLE_SUPPORT_AGENT,
    ROLE_SUPPORT_RECRUITER,
    ROLE_LMS_ADMIN,
    ROLE_FINANCE_SALES,
}

# Legacy role mapping: treat legacy values as their modern equivalents.
LEGACY_ROLE_MAP = {
    ROLE_MARKETING_SEO: ROLE_MARKETING_MANAGER,
    ROLE_SUPPORT_RECRUITER: ROLE_SUPPORT_AGENT,
}


def get_effective_role(role):
    """Return the effective role, mapping legacy values to modern equivalents."""
    return LEGACY_ROLE_MAP.get(role, role)


# ---------------------------------------------------------------------------
# Permission matrix: role -> {module: {actions}}
# Super Admin: full access (handled by bypass in permission checks).
# ---------------------------------------------------------------------------

CONTENT_MODULES = {
    MODULE_SERVICES,
    MODULE_CASE_STUDIES,
    MODULE_INSIGHTS,
    MODULE_PARTNERS,
    MODULE_NAVIGATION,
}

CONTENT_CRUD = {ACTION_VIEW, ACTION_CREATE, ACTION_UPDATE, ACTION_DELETE, ACTION_PUBLISH}

_ROLE_PERMISSIONS = {
    ROLE_ADMIN: {
        MODULE_DASHBOARD: {ACTION_VIEW},
        MODULE_SITE_SETTINGS: {ACTION_VIEW, ACTION_UPDATE},
        MODULE_NAVIGATION: CONTENT_CRUD,
        MODULE_PARTNERS: CONTENT_CRUD,
        MODULE_SERVICES: CONTENT_CRUD,
        MODULE_CASE_STUDIES: CONTENT_CRUD,
        MODULE_CAREERS: CONTENT_CRUD,
        MODULE_INSIGHTS: CONTENT_CRUD,
        MODULE_CONTACT: {ACTION_VIEW, ACTION_UPDATE, ACTION_ASSIGN, ACTION_EXPORT},
        MODULE_MEDIA: CONTENT_CRUD,
        MODULE_USERS: {ACTION_VIEW, ACTION_MANAGE_USERS},
        MODULE_ACTIVITY_LOGS: {ACTION_VIEW},
    },
    ROLE_CONTENT_MANAGER: {
        MODULE_DASHBOARD: {ACTION_VIEW},
        MODULE_NAVIGATION: CONTENT_CRUD,
        MODULE_PARTNERS: CONTENT_CRUD,
        MODULE_SERVICES: CONTENT_CRUD,
        MODULE_CASE_STUDIES: CONTENT_CRUD,
        MODULE_INSIGHTS: CONTENT_CRUD,
        MODULE_MEDIA: CONTENT_CRUD,
        MODULE_CONTACT: {ACTION_VIEW},
    },
    ROLE_EDITOR: {
        MODULE_DASHBOARD: {ACTION_VIEW},
        MODULE_SERVICES: {ACTION_VIEW, ACTION_CREATE, ACTION_UPDATE},
        MODULE_CASE_STUDIES: {ACTION_VIEW, ACTION_CREATE, ACTION_UPDATE},
        MODULE_INSIGHTS: {ACTION_VIEW, ACTION_CREATE, ACTION_UPDATE},
        MODULE_PARTNERS: {ACTION_VIEW, ACTION_CREATE, ACTION_UPDATE},
        MODULE_NAVIGATION: {ACTION_VIEW, ACTION_UPDATE},
        MODULE_MEDIA: {ACTION_VIEW, ACTION_CREATE},
    },
    ROLE_MARKETING_MANAGER: {
        MODULE_DASHBOARD: {ACTION_VIEW},
        MODULE_PARTNERS: CONTENT_CRUD,
        MODULE_SERVICES: {ACTION_VIEW, ACTION_UPDATE},
        MODULE_CASE_STUDIES: {ACTION_VIEW, ACTION_UPDATE},
        MODULE_INSIGHTS: CONTENT_CRUD,
        MODULE_NAVIGATION: {ACTION_VIEW, ACTION_UPDATE},
        MODULE_MEDIA: {ACTION_VIEW, ACTION_CREATE},
        MODULE_SITE_SETTINGS: {ACTION_VIEW, ACTION_UPDATE},
    },
    ROLE_RECRUITER: {
        MODULE_DASHBOARD: {ACTION_VIEW},
        MODULE_CAREERS: CONTENT_CRUD,
        MODULE_MEDIA: {ACTION_VIEW, ACTION_CREATE},
        MODULE_CONTACT: {ACTION_VIEW},
    },
    ROLE_SUPPORT_AGENT: {
        MODULE_DASHBOARD: {ACTION_VIEW},
        MODULE_CONTACT: {ACTION_VIEW, ACTION_UPDATE, ACTION_ASSIGN},
    },
    ROLE_LMS_ADMIN: {
        MODULE_DASHBOARD: {ACTION_VIEW},
    },
    ROLE_FINANCE_SALES: {
        MODULE_DASHBOARD: {ACTION_VIEW},
        MODULE_CONTACT: {ACTION_VIEW},
    },
}


def get_role_permissions(role):
    """
    Return the permission dict for a role.
    Returns empty dict for unknown roles.
    """
    effective = get_effective_role(role)
    return _ROLE_PERMISSIONS.get(effective, {})


def has_module_access(role, module):
    """Check if a role has any access to a module."""
    perms = get_role_permissions(role)
    return module in perms


def has_permission(role, module, action):
    """Check if a role has a specific action on a module."""
    perms = get_role_permissions(role)
    module_perms = perms.get(module, set())
    return action in module_perms


def get_user_capabilities(user):
    """
    Return a list of 'module.action' capability strings for the user.
    Super admins get all capabilities.
    """
    if user.is_superuser:
        return [f'{m}.{a}' for m in ALL_MODULES for a in ALL_ACTIONS]

    role = getattr(user, 'role', None)
    if not role:
        return []

    perms = get_role_permissions(role)
    capabilities = []
    for module, actions in perms.items():
        for action in sorted(actions):
            capabilities.append(f'{module}.{action}')
    return sorted(capabilities)


def get_user_modules(user):
    """Return a list of modules the user can access."""
    if user.is_superuser:
        return list(ALL_MODULES)

    role = getattr(user, 'role', None)
    if not role:
        return []

    perms = get_role_permissions(role)
    return sorted(perms.keys())
