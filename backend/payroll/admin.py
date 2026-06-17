from django.contrib import admin
from .models import PayrollRun, Payslip, ITDeclaration


@admin.register(PayrollRun)
class PayrollRunAdmin(admin.ModelAdmin):
    list_display = ("__str__", "status", "employee_count", "total_net", "created_at")
    list_filter = ("status", "period_year")


@admin.register(Payslip)
class PayslipAdmin(admin.ModelAdmin):
    list_display = ("employee", "payroll_run", "gross_pay", "total_deductions", "net_pay", "status")
    list_filter = ("status", "payroll_run__period_year")
    search_fields = ("employee__first_name", "employee__last_name", "employee__employee_id")


@admin.register(ITDeclaration)
class ITDeclarationAdmin(admin.ModelAdmin):
    list_display = ("employee", "financial_year", "original_tds", "revised_tds", "annual_saving", "status")
    list_filter = ("status", "financial_year")
