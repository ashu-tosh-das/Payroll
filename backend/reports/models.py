"""
Report catalog, generation queue, and scheduled delivery.
"""
from django.db import models


class Report(models.Model):
    FORMAT_CHOICES   = [("pdf","PDF"), ("xlsx","XLSX"), ("csv","CSV"), ("zip","ZIP")]
    CATEGORY_CHOICES = [
        ("finance","Finance"), ("tax","Tax"), ("statutory","Statutory"),
        ("analytics","Analytics"), ("audit","Audit"),
    ]

    name        = models.CharField(max_length=200)
    category    = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    file_format = models.CharField(max_length=10, choices=FORMAT_CHOICES)
    description = models.TextField(blank=True)
    is_active   = models.BooleanField(default=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "reports"

    def __str__(self):
        return f"{self.name} ({self.file_format})"


class ReportGeneration(models.Model):
    STATUS_CHOICES = [("pending","Pending"), ("generating","Generating"), ("ready","Ready"), ("failed","Failed")]

    report       = models.ForeignKey(Report, on_delete=models.CASCADE, related_name="generations")
    requested_by = models.ForeignKey("authentication.User", on_delete=models.CASCADE)
    period_label = models.CharField(max_length=50, blank=True)
    status       = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    file         = models.FileField(upload_to="reports/", null=True, blank=True)
    file_size    = models.PositiveIntegerField(default=0)
    requested_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "report_generations"
        ordering = ["-requested_at"]


class ScheduledReport(models.Model):
    FREQUENCY_CHOICES = [("daily","Daily"), ("weekly","Weekly"), ("monthly","Monthly")]

    report         = models.ForeignKey(Report, on_delete=models.CASCADE)
    owner          = models.ForeignKey("authentication.User", on_delete=models.CASCADE)
    frequency      = models.CharField(max_length=20, choices=FREQUENCY_CHOICES)
    delivery_email = models.EmailField()
    is_active      = models.BooleanField(default=True)
    last_run_at    = models.DateTimeField(null=True, blank=True)
    next_run_at    = models.DateTimeField(null=True, blank=True)
    created_at     = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "scheduled_reports"
