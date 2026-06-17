from rest_framework import serializers
from .models import Department, Employee, BankChangeRequest, SalaryStructure


class DepartmentSerializer(serializers.ModelSerializer):
    employee_count = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = "__all__"
        read_only_fields = ("id", "created_at")

    def get_employee_count(self, obj):
        return obj.employees.filter(status="active").count()


class SalaryStructureSerializer(serializers.ModelSerializer):
    computed = serializers.SerializerMethodField()

    class Meta:
        model = SalaryStructure
        fields = "__all__"
        read_only_fields = ("id", "created_at")

    def get_computed(self, obj):
        return obj.compute()


class EmployeeListSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source="department.name", read_only=True)

    class Meta:
        model = Employee
        fields = (
            "id", "employee_id", "first_name", "last_name", "email",
            "department_name", "designation", "level", "location",
            "date_of_joining", "status", "annual_ctc", "monthly_ctc",
        )


class EmployeeDetailSerializer(serializers.ModelSerializer):
    department = DepartmentSerializer(read_only=True)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(), source="department", write_only=True, required=False
    )
    salary_structure = SalaryStructureSerializer(read_only=True)

    class Meta:
        model = Employee
        fields = "__all__"
        read_only_fields = ("id", "employee_id", "created_at", "updated_at")


class BankChangeRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source="employee.full_name", read_only=True)

    class Meta:
        model = BankChangeRequest
        fields = "__all__"
        read_only_fields = ("id", "created_at", "reviewed_by", "reviewed_at")
