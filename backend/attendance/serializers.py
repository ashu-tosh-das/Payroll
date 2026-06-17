from rest_framework import serializers
from .models import LeaveType, LeaveBalance, LeaveRequest, AttendanceRecord, WFHRequest, Holiday


class LeaveTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveType
        fields = "__all__"
        read_only_fields = ("id",)


class LeaveBalanceSerializer(serializers.ModelSerializer):
    leave_type_detail = LeaveTypeSerializer(source="leave_type", read_only=True)
    available_days = serializers.FloatField(read_only=True)

    class Meta:
        model = LeaveBalance
        fields = "__all__"
        read_only_fields = ("id",)


class LeaveRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source="employee.full_name", read_only=True)
    leave_type_detail = LeaveTypeSerializer(source="leave_type", read_only=True)

    class Meta:
        model = LeaveRequest
        fields = "__all__"
        read_only_fields = ("id", "created_at", "approved_by", "approved_at")


class AttendanceRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceRecord
        fields = "__all__"
        read_only_fields = ("id",)


class WFHRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source="employee.full_name", read_only=True)

    class Meta:
        model = WFHRequest
        fields = "__all__"
        read_only_fields = ("id", "created_at", "approved_by", "approved_at")


class HolidaySerializer(serializers.ModelSerializer):
    class Meta:
        model = Holiday
        fields = "__all__"
        read_only_fields = ("id",)
