"""
Payroll run, payslips, and IT declarations.
"""
from django.db import models
from django.utils import timezone


class PayrollRun(models.Model):
    STATUS_CHOICES = [
        ("draft",     "Draft"),
        ("in_review", "In Review"),
        ("approved",  "Approved"),
        ("paid",      "Paid"),
    ]

    period_month     = models.PositiveSmallIntegerField()
    period_year      = models.PositiveSmallIntegerField()
    status           = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    total_gross      = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total_deductions = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total_net        = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    employee_count   = models.PositiveIntegerField(default=0)
    anomaly_count    = models.PositiveIntegerField(default=0)
    prepared_by      = models.ForeignKey("authentication.User", null=True, blank=True, on_delete=models.SET_NULL, related_name="prepared_runs")
    approved_by      = models.ForeignKey("authentication.User", null=True, blank=True, on_delete=models.SET_NULL, related_name="approved_runs")
    prepared_at      = models.DateTimeField(null=True, blank=True)
    approved_at      = models.DateTimeField(null=True, blank=True)
    disbursed_at     = models.DateTimeField(null=True, blank=True)
    created_at       = models.DateTimeField(auto_now_add=True)
    updated_at       = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "payroll_runs"
        unique_together = ("period_month", "period_year")
        ordering = ["-period_year", "-period_month"]

    def __str__(self):
        from calendar import month_abbr
        return f"Payroll {month_abbr[self.period_month]} {self.period_year} [{self.status}]"


class Payslip(models.Model):
    STATUS_CHOICES = [("generated","Generated"), ("delivered","Delivered"), ("disputed","Disputed")]

    payroll_run       = models.ForeignKey(PayrollRun, on_delete=models.CASCADE, related_name="payslips")
    employee          = models.ForeignKey("employees.Employee", on_delete=models.CASCADE, related_name="payslips")
    basic             = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    hra               = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    special_allowance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    lta               = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    telephone         = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    reimbursements    = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    gross_pay         = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    employee_pf       = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    professional_tax  = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tds               = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    lop_days          = models.PositiveSmallIntegerField(default=0)
    lop_amount        = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_deductions  = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    net_pay           = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    days_worked       = models.PositiveSmallIntegerField(default=0)
    status            = models.CharField(max_length=20, choices=STATUS_CHOICES, default="generated")
    integrity_hash    = models.CharField(max_length=64, blank=True)
    generated_at      = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "payslips"
        unique_together = ("payroll_run", "employee")


class ITDeclaration(models.Model):
    STATUS_CHOICES = [("pending","Pending"), ("approved","Approved"), ("rejected","Rejected")]

    employee            = models.ForeignKey("employees.Employee", on_delete=models.CASCADE, related_name="it_declarations")
    payroll_run         = models.ForeignKey(PayrollRun, on_delete=models.CASCADE, related_name="it_declarations")
    financial_year      = models.CharField(max_length=10)
    ppf                 = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    elss                = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    nsc                 = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    lic_premium         = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    home_loan_principal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    monthly_rent        = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    landlord_pan        = models.CharField(max_length=10, blank=True)
    health_insurance    = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    nps                 = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    home_loan_interest  = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    original_tds        = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    revised_tds         = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    annual_saving       = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status              = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    reviewed_by         = models.ForeignKey("authentication.User", null=True, blank=True, on_delete=models.SET_NULL)
    submitted_at        = models.DateTimeField(auto_now_add=True)
    reviewed_at         = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "it_declarations"
        unique_together = ("employee", "financial_year")
