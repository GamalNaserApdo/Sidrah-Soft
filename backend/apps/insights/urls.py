from django.urls import path

from . import views

app_name = 'insights'

urlpatterns = [
    path('', views.ArticleListView.as_view(), name='article-list'),
    path('<slug:slug>/', views.ArticleDetailView.as_view(), name='article-detail'),
]
