from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LeaveTypeViewSet, LeaveBalanceViewSet, LeaveRequestViewSet,
    AttendanceRecordViewSet, WFHRequestViewSet, HolidayViewSet,
)

router = DefaultRouter()
router.register("leave-types", LeaveTypeViewSet, basename="leave-type")
router.register("leave-balances", LeaveBalanceViewSet, basename="leave-balance")
router.register("leave-requests", LeaveRequestViewSet, basename="leave-request")
router.register("records", AttendanceRecordViewSet, basename="attendance-record")
router.register("wfh-requests", WFHRequestViewSet, basename="wfh-request")
router.register("holidays", HolidayViewSet, basename="holiday")

urlpatterns = [path("", include(router.urls))]
