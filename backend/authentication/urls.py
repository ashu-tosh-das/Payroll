from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    PayrollTokenObtainPairView, RegisterView, LogoutView,
    MeView, ChangePasswordView, RoleListCreateView, RoleDetailView,
    UserListView, UserDetailView,
)

urlpatterns = [
    path("token/",          PayrollTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/",  TokenRefreshView.as_view(), name="token_refresh"),
    path("register/",       RegisterView.as_view(), name="register"),
    path("logout/",         LogoutView.as_view(), name="logout"),
    path("me/",             MeView.as_view(), name="me"),
    path("change-password/",ChangePasswordView.as_view(), name="change_password"),
    path("roles/",          RoleListCreateView.as_view(), name="role_list"),
    path("roles/<int:pk>/", RoleDetailView.as_view(), name="role_detail"),
    path("users/",          UserListView.as_view(), name="user_list"),
    path("users/<int:pk>/", UserDetailView.as_view(), name="user_detail"),
]
