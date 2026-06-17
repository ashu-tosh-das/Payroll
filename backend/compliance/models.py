"""
Statutory compliance: TDS, PF, ESI, PT, LWF, Form 16, TDS computations.
"""
from django.db import models


class StatutoryObligation(models.Model):
    TYPE_CHOICES = [
        ("tds_192","TDS · 192"), ("pf","PF (EPFO)"), ("esi","ESI (ESIC)"),
        ("pt","Professional Tax"), ("lwf","LWF"), ("form_24q","Form 24Q"),
    ]
    STATUS_CHOICES = [("upcoming","Upcoming"), ("filed","Filed"), ("overdue","Overdue")]

    obligation_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    period_month    = models.PositiveSmallIntegerField()
    period_year     = models.PositiveSmallIntegerField()
    payable_amount  = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    due_date        = models.DateField()
    challan_number  = models.CharField(max_length=50, blank=True)
    payment_mode    = models.CharField(max_length=50, default="e-Challan")
    employee_count  = models.PositiveIntegerField(default=0)
    status          = models.CharField(max_length=20, choices=STATUS_CHOICES, default="upcoming")
    filed_at        = models.DateTimeField(null=True, blank=True)
    filed_by        = models.ForeignKey("authentication.User", null=True, blank=True, on_delete=models.SET_NULL)
    created_at      = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "statutory_obligations"
        unique_together = ("obligation_type", "period_month", "period_year")
        ordering = ["due_date"]

    @property
    def days_remaining(self):
        from django.utils import timezone
        return (self.due_date - timezone.now().date()).days


class Form16(models.Model):
    STATUS_CHOICES = [
        ("pending","Pending"), ("generated","Generated"),
        ("digitally_signed","Digitally Signed"), ("delivered","Delivered"),
    ]

    employee       = models.ForeignKey("employees.Employee", on_delete=models.CASCADE, related_name="form16s")
    financial_year = models.CharField(max_length=10)
    gross_salary   = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tds_deducted   = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status         = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    document       = models.FileField(upload_to="form16/", null=True, blank=True)
    generated_at   = models.DateTimeField(null=True, blank=True)
    delivered_at   = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "form_16"
        unique_together = ("employee", "financial_year")


class TDSComputation(models.Model):
    employee         = models.ForeignKey("employees.Employee", on_delete=models.CASCADE, related_name="tds_computations")
    period_month     = models.PositiveSmallIntegerField()
    period_year      = models.PositiveSmallIntegerField()
    gross_taxable    = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_exemptions = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    net_taxable      = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    slab_tax         = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    cess             = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    surcharge        = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    monthly_tds      = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at       = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "tds_computations"
        unique_together = ("employee", "period_month", "period_year")
