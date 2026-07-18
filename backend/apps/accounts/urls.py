"""URL configuration for the accounts app — CMS authentication endpoints."""
from django.urls import path

from .views import CSRFTokenView, CurrentUserView, LoginView, LogoutView

app_name = 'accounts'

urlpatterns = [
    path('csrf/', CSRFTokenView.as_view(), name='csrf'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('me/', CurrentUserView.as_view(), name='me'),
]
