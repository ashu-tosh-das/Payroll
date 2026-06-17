from rest_framework import serializers
from .models import PayrollRun, Payslip, ITDeclaration
from employees.serializers import EmployeeListSerializer


class PayslipSerializer(serializers.ModelSerializer):
    employee_detail = EmployeeListSerializer(source="employee", read_only=True)

    class Meta:
        model = Payslip
        fields = "__all__"
        read_only_fields = ("id", "integrity_hash", "generated_at")


class PayrollRunSerializer(serializers.ModelSerializer):
    payslips = PayslipSerializer(many=True, read_only=True)

    class Meta:
        model = PayrollRun
        fields = "__all__"
        read_only_fields = (
            "id", "total_gross", "total_deductions", "total_net",
            "employee_count", "anomaly_count", "created_at", "updated_at",
        )


class PayrollRunListSerializer(serializers.ModelSerializer):
    class Meta:
        model = PayrollRun
        exclude = ("payslips",) if False else ()
        fields = (
            "id", "period_month", "period_year", "status",
            "total_gross", "total_net", "employee_count", "anomaly_count",
            "prepared_at", "approved_at", "disbursed_at",
        )


class ITDeclarationSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source="employee.full_name", read_only=True)

    class Meta:
        model = ITDeclaration
        fields = "__all__"
        read_only_fields = ("id", "submitted_at", "reviewed_by", "reviewed_at")
