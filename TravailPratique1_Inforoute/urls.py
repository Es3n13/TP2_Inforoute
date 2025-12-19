"""
URL configuration for TravailPratique1_Inforoute project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from TP1_Inforoute.views import DatasetViewSet,ResourceViewSet
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from graphene_django.views import GraphQLView
from django.views.decorators.csrf import csrf_exempt
from TP1_Inforoute import views

router = routers.DefaultRouter()
router.register(r'datasets', DatasetViewSet, basename='dataset')
router.register(r'resources', ResourceViewSet, basename='resource')

schema_view = get_schema_view(
    openapi.Info(
        title="Inforoute API",
        default_version='v1',
        description="API REST - données moissonnées depuis Données Québec",
        contact=openapi.Contact(email="contact@ogsl.ca"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

class AuthenticatedGraphQLView(GraphQLView):
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            from django.http import JsonResponse
            return JsonResponse({'detail': 'Authentification requise.'}, status=401)
        return super().dispatch(request, *args, **kwargs)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('graphql/', csrf_exempt(AuthenticatedGraphQLView.as_view(graphiql=True))),
    path('stats/', views.stats_view, name='stats_view'),
    path('', views.dataset_list, name='dataset_list'),
    path('dataset/<str:ckan_id>/', views.dataset_detail, name='dataset_detail'),
    path("auth/", include("TP1_Inforoute.auth_urls")),
    path("users/", include("TP1_Inforoute.user_urls")),
    path("auth/register/", views.RegisterView.as_view(), name="register"),
]
