from rest_framework import generics, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from django.utils import timezone
from .models import PayrollRun, Payslip, ITDeclaration
from .serializers import (
    PayrollRunSerializer, PayrollRunListSerializer,
    PayslipSerializer, ITDeclarationSerializer,
)


class PayrollRunViewSet(ModelViewSet):
    queryset = PayrollRun.objects.all()
    ordering_fields = ["period_year", "period_month", "created_at"]

    def get_serializer_class(self):
        if self.action == "list":
            return PayrollRunListSerializer
        return PayrollRunSerializer

    @action(detail=True, methods=["post"])
    def submit_for_review(self, request, pk=None):
        run = self.get_object()
        run.status = "in_review"
        run.prepared_by = request.user
        run.prepared_at = timezone.now()
        run.save()
        return Response(PayrollRunSerializer(run).data)

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        run = self.get_object()
        run.status = "approved"
        run.approved_by = request.user
        run.approved_at = timezone.now()
        run.save()
        return Response(PayrollRunSerializer(run).data)

    @action(detail=True, methods=["post"])
    def disburse(self, request, pk=None):
        run = self.get_object()
        run.status = "paid"
        run.disbursed_at = timezone.now()
        run.save()
        return Response(PayrollRunSerializer(run).data)


class PayslipViewSet(ModelViewSet):
    queryset = Payslip.objects.select_related("employee", "payroll_run").all()
    serializer_class = PayslipSerializer
    search_fields = ["employee__first_name", "employee__last_name", "employee__employee_id"]
    ordering_fields = ["generated_at", "net_pay"]


class ITDeclarationViewSet(ModelViewSet):
    queryset = ITDeclaration.objects.select_related("employee").all()
    serializer_class = ITDeclarationSerializer
    search_fields = ["employee__first_name", "employee__last_name"]

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        obj = self.get_object()
        obj.status = "approved"
        obj.reviewed_by = request.user
        obj.reviewed_at = timezone.now()
        obj.save()
        return Response(ITDeclarationSerializer(obj).data)
