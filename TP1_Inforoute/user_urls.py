from django.urls import path
from .views_user import UserMeView, ChangePasswordView

urlpatterns = [
    path("me/", UserMeView.as_view()),
    path("me/change-password/", ChangePasswordView.as_view(), name="change-password"),
]