from rest_framework import generics, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from .models import Department, Employee, BankChangeRequest, SalaryStructure
from .serializers import (
    DepartmentSerializer, EmployeeListSerializer, EmployeeDetailSerializer,
    BankChangeRequestSerializer, SalaryStructureSerializer,
)


class DepartmentViewSet(ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    search_fields = ["name"]


class EmployeeViewSet(ModelViewSet):
    queryset = Employee.objects.select_related("department", "manager").all()
    search_fields = ["first_name", "last_name", "email", "employee_id"]
    ordering_fields = ["date_of_joining", "annual_ctc", "first_name"]

    def get_serializer_class(self):
        if self.action == "list":
            return EmployeeListSerializer
        return EmployeeDetailSerializer

    @action(detail=True, methods=["get"])
    def salary_structure(self, request, pk=None):
        employee = self.get_object()
        try:
            structure = employee.salary_structure
            return Response(SalaryStructureSerializer(structure).data)
        except SalaryStructure.DoesNotExist:
            return Response({"detail": "No salary structure found."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=["get"])
    def active(self, request):
        qs = self.queryset.filter(status="active")
        serializer = EmployeeListSerializer(qs, many=True)
        return Response(serializer.data)


class BankChangeRequestViewSet(ModelViewSet):
    queryset = BankChangeRequest.objects.select_related("employee").all()
    serializer_class = BankChangeRequestSerializer
    search_fields = ["employee__first_name", "employee__last_name"]

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        from django.utils import timezone
        obj = self.get_object()
        obj.status = "approved"
        obj.reviewed_by = request.user
        obj.reviewed_at = timezone.now()
        employee = obj.employee
        employee.bank_name = obj.new_bank_name
        employee.bank_account = obj.new_bank_account
        employee.bank_ifsc = obj.new_bank_ifsc
        employee.save()
        obj.save()
        return Response(BankChangeRequestSerializer(obj).data)

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        from django.utils import timezone
        obj = self.get_object()
        obj.status = "rejected"
        obj.reviewed_by = request.user
        obj.reviewed_at = timezone.now()
        obj.save()
        return Response(BankChangeRequestSerializer(obj).data)
