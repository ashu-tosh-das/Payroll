from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PayrollRunViewSet, PayslipViewSet, ITDeclarationViewSet

router = DefaultRouter()
router.register("runs", PayrollRunViewSet, basename="payroll-run")
router.register("payslips", PayslipViewSet, basename="payslip")
router.register("it-declarations", ITDeclarationViewSet, basename="it-declaration")

urlpatterns = [path("", include(router.urls))]
