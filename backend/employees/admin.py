from django.contrib import admin
from .models import Department, Employee, BankChangeRequest, SalaryStructure


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ("name", "color", "created_at")
    search_fields = ("name",)


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ("employee_id", "full_name", "department", "designation", "level", "status", "annual_ctc")
    list_filter = ("status", "department", "level", "location")
    search_fields = ("employee_id", "first_name", "last_name", "email", "pan_number")
    ordering = ("first_name",)


@admin.register(BankChangeRequest)
class BankChangeRequestAdmin(admin.ModelAdmin):
    list_display = ("employee", "new_bank_name", "status", "created_at")
    list_filter = ("status",)


@admin.register(SalaryStructure)
class SalaryStructureAdmin(admin.ModelAdmin):
    list_display = ("employee", "basic_percent", "hra_percent", "effective_from")
