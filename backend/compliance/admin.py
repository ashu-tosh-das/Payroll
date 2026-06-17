from django.contrib import admin
from .models import StatutoryObligation, Form16, TDSComputation


@admin.register(StatutoryObligation)
class StatutoryObligationAdmin(admin.ModelAdmin):
    list_display = ("obligation_type", "period_month", "period_year", "payable_amount", "due_date", "status")
    list_filter = ("status", "obligation_type", "period_year")


@admin.register(Form16)
class Form16Admin(admin.ModelAdmin):
    list_display = ("employee", "financial_year", "gross_salary", "tds_deducted", "status")
    list_filter = ("status", "financial_year")
    search_fields = ("employee__first_name", "employee__last_name")


@admin.register(TDSComputation)
class TDSComputationAdmin(admin.ModelAdmin):
    list_display = ("employee", "period_month", "period_year", "monthly_tds", "slab_tax")
    list_filter = ("period_year",)
