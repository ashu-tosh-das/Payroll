from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DepartmentViewSet, EmployeeViewSet, BankChangeRequestViewSet

router = DefaultRouter()
router.register("departments", DepartmentViewSet, basename="department")
router.register("bank-change-requests", BankChangeRequestViewSet, basename="bank-change-request")
router.register("", EmployeeViewSet, basename="employee")

urlpatterns = [path("", include(router.urls))]
