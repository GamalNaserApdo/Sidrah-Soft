"""Shared CMS pagination class for all admin API list endpoints."""
from rest_framework.pagination import PageNumberPagination


class CMSPagination(PageNumberPagination):
    """Standard CMS pagination with safe maximum page size."""

    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100
