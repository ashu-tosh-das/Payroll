from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from django.utils import timezone
from .models import StatutoryObligation, Form16, TDSComputation
from .serializers import StatutoryObligationSerializer, Form16Serializer, TDSComputationSerializer


class StatutoryObligationViewSet(ModelViewSet):
    queryset = StatutoryObligation.objects.all()
    serializer_class = StatutoryObligationSerializer
    ordering_fields = ["due_date"]

    @action(detail=True, methods=["post"])
    def mark_filed(self, request, pk=None):
        obj = self.get_object()
        challan = request.data.get("challan_number", "")
        obj.status = "filed"
        obj.challan_number = challan
        obj.filed_by = request.user
        obj.filed_at = timezone.now()
        obj.save()
        return Response(StatutoryObligationSerializer(obj).data)


class Form16ViewSet(ModelViewSet):
    queryset = Form16.objects.select_related("employee").all()
    serializer_class = Form16Serializer
    search_fields = ["employee__first_name", "employee__last_name", "financial_year"]

    @action(detail=True, methods=["post"])
    def mark_delivered(self, request, pk=None):
        obj = self.get_object()
        obj.status = "delivered"
        obj.delivered_at = timezone.now()
        obj.save()
        return Response(Form16Serializer(obj).data)


class TDSComputationViewSet(ModelViewSet):
    queryset = TDSComputation.objects.select_related("employee").all()
    serializer_class = TDSComputationSerializer
    search_fields = ["employee__first_name", "employee__employee_id"]
    ordering_fields = ["period_year", "period_month"]
