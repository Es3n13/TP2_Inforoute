from django.urls import path, include
from rest_framework import routers
from .views import DatasetViewSet
from . import views

router = routers.DefaultRouter()
router.register(r'datasets', DatasetViewSet, basename='dataset')

urlpatterns = [
    path('api/', include(router.urls)),
    path('stats/', views.stats_view, name='stats_view'),
    path('', views.dataset_list, name='dataset_list'),
]