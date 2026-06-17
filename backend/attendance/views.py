from rest_framework import generics, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from django.utils import timezone
from .models import LeaveType, LeaveBalance, LeaveRequest, AttendanceRecord, WFHRequest, Holiday
from .serializers import (
    LeaveTypeSerializer, LeaveBalanceSerializer, LeaveRequestSerializer,
    AttendanceRecordSerializer, WFHRequestSerializer, HolidaySerializer,
)


class LeaveTypeViewSet(ModelViewSet):
    queryset = LeaveType.objects.all()
    serializer_class = LeaveTypeSerializer


class LeaveBalanceViewSet(ModelViewSet):
    queryset = LeaveBalance.objects.select_related("employee", "leave_type").all()
    serializer_class = LeaveBalanceSerializer
    search_fields = ["employee__first_name", "employee__last_name", "employee__employee_id"]


class LeaveRequestViewSet(ModelViewSet):
    queryset = LeaveRequest.objects.select_related("employee", "leave_type").all()
    serializer_class = LeaveRequestSerializer
    search_fields = ["employee__first_name", "employee__last_name"]
    ordering_fields = ["created_at", "start_date"]

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        obj = self.get_object()
        obj.status = "approved"
        obj.approved_by = request.user
        obj.approved_at = timezone.now()
        obj.save()
        return Response(LeaveRequestSerializer(obj).data)

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        obj = self.get_object()
        obj.status = "rejected"
        obj.approved_by = request.user
        obj.approved_at = timezone.now()
        obj.save()
        return Response(LeaveRequestSerializer(obj).data)


class AttendanceRecordViewSet(ModelViewSet):
    queryset = AttendanceRecord.objects.select_related("employee").all()
    serializer_class = AttendanceRecordSerializer
    search_fields = ["employee__first_name", "employee__employee_id"]
    ordering_fields = ["date"]


class WFHRequestViewSet(ModelViewSet):
    queryset = WFHRequest.objects.select_related("employee").all()
    serializer_class = WFHRequestSerializer
    search_fields = ["employee__first_name", "employee__last_name"]

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        obj = self.get_object()
        obj.status = "approved"
        obj.approved_by = request.user
        obj.approved_at = timezone.now()
        obj.save()
        return Response(WFHRequestSerializer(obj).data)


class HolidayViewSet(ModelViewSet):
    queryset = Holiday.objects.all()
    serializer_class = HolidaySerializer
    search_fields = ["name", "location"]
    ordering_fields = ["date"]
