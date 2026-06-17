from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from django.utils import timezone
from .models import Report, ReportGeneration, ScheduledReport
from .serializers import ReportSerializer, ReportGenerationSerializer, ScheduledReportSerializer


class ReportViewSet(ModelViewSet):
    queryset = Report.objects.filter(is_active=True)
    serializer_class = ReportSerializer
    search_fields = ["name", "category"]


class ReportGenerationViewSet(ModelViewSet):
    serializer_class = ReportGenerationSerializer
    ordering_fields = ["requested_at"]

    def get_queryset(self):
        return ReportGeneration.objects.select_related("report", "requested_by").all()

    def perform_create(self, serializer):
        serializer.save(requested_by=self.request.user, status="pending")


class ScheduledReportViewSet(ModelViewSet):
    serializer_class = ScheduledReportSerializer

    def get_queryset(self):
        return ScheduledReport.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=["post"])
    def toggle(self, request, pk=None):
        obj = self.get_object()
        obj.is_active = not obj.is_active
        obj.save()
        return Response(ScheduledReportSerializer(obj).data)
