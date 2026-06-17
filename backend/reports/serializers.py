from rest_framework import serializers
from .models import Report, ReportGeneration, ScheduledReport


class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = "__all__"
        read_only_fields = ("id", "created_at")


class ReportGenerationSerializer(serializers.ModelSerializer):
    report_name = serializers.CharField(source="report.name", read_only=True)

    class Meta:
        model = ReportGeneration
        fields = "__all__"
        read_only_fields = ("id", "requested_at", "completed_at", "file", "file_size", "requested_by")


class ScheduledReportSerializer(serializers.ModelSerializer):
    report_name = serializers.CharField(source="report.name", read_only=True)

    class Meta:
        model = ScheduledReport
        fields = "__all__"
        read_only_fields = ("id", "created_at", "last_run_at", "next_run_at")
