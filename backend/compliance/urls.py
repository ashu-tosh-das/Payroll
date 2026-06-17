from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StatutoryObligationViewSet, Form16ViewSet, TDSComputationViewSet

router = DefaultRouter()
router.register("obligations", StatutoryObligationViewSet, basename="statutory-obligation")
router.register("form16", Form16ViewSet, basename="form16")
router.register("tds-computations", TDSComputationViewSet, basename="tds-computation")

urlpatterns = [path("", include(router.urls))]
