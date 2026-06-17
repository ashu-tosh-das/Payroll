from django.contrib import admin
from .models import LeaveType, LeaveBalance, LeaveRequest, AttendanceRecord, WFHRequest, Holiday


@admin.register(LeaveType)
class LeaveTypeAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "annual_days", "is_paid")


@admin.register(LeaveBalance)
class LeaveBalanceAdmin(admin.ModelAdmin):
    list_display = ("employee", "leave_type", "year", "total_days", "used_days")
    list_filter = ("year", "leave_type")


@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    list_display = ("employee", "leave_type", "start_date", "end_date", "duration", "status")
    list_filter = ("status", "leave_type")
    search_fields = ("employee__first_name", "employee__last_name")


@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(admin.ModelAdmin):
    list_display = ("employee", "date", "punch_in", "punch_out", "hours_worked", "is_present", "is_wfh")
    list_filter = ("is_present", "is_wfh")


@admin.register(WFHRequest)
class WFHRequestAdmin(admin.ModelAdmin):
    list_display = ("employee", "requested_date", "status")
    list_filter = ("status",)


@admin.register(Holiday)
class HolidayAdmin(admin.ModelAdmin):
    list_display = ("date", "name", "type", "location", "year")
    list_filter = ("type", "year")
