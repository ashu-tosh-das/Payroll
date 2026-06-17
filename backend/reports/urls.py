from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReportViewSet, ReportGenerationViewSet, ScheduledReportViewSet

router = DefaultRouter()
router.register("catalog", ReportViewSet, basename="report")
router.register("generations", ReportGenerationViewSet, basename="report-generation")
router.register("scheduled", ScheduledReportViewSet, basename="scheduled-report")

urlpatterns = [path("", include(router.urls))]
