from django.contrib import admin
from .models import Report, ReportGeneration, ScheduledReport


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "file_format", "is_active", "created_at")
    list_filter = ("category", "file_format", "is_active")
    search_fields = ("name",)


@admin.register(ReportGeneration)
class ReportGenerationAdmin(admin.ModelAdmin):
    list_display = ("report", "requested_by", "period_label", "status", "file_size", "requested_at")
    list_filter = ("status",)


@admin.register(ScheduledReport)
class ScheduledReportAdmin(admin.ModelAdmin):
    list_display = ("report", "owner", "frequency", "delivery_email", "is_active", "next_run_at")
    list_filter = ("frequency", "is_active")
