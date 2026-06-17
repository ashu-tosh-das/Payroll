"""
Root URL configuration for Source One Payroll Cloud API.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerUIView

urlpatterns = [
    path("admin/", admin.site.urls),

    # API v1
    path("api/v1/auth/",          include("authentication.urls")),
    path("api/v1/employees/",     include("employees.urls")),
    path("api/v1/payroll/",       include("payroll.urls")),
    path("api/v1/attendance/",    include("attendance.urls")),
    path("api/v1/compliance/",    include("compliance.urls")),
    path("api/v1/notifications/", include("notifications.urls")),
    path("api/v1/reports/",       include("reports.urls")),

    # OpenAPI / Swagger
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/",   SpectacularSwaggerUIView.as_view(url_name="schema"), name="swagger-ui"),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
