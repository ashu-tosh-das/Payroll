"""
Attendance records, leave types, leave requests, WFH bookings, holidays.
"""
from django.db import models


class LeaveType(models.Model):
    code        = models.CharField(max_length=10, unique=True)
    name        = models.CharField(max_length=100)
    annual_days = models.PositiveSmallIntegerField(default=12)
    color       = models.CharField(max_length=20, default="#10B981")
    is_paid     = models.BooleanField(default=True)

    class Meta:
        db_table = "leave_types"

    def __str__(self):
        return f"{self.code} — {self.name}"


class LeaveBalance(models.Model):
    employee   = models.ForeignKey("employees.Employee", on_delete=models.CASCADE, related_name="leave_balances")
    leave_type = models.ForeignKey(LeaveType, on_delete=models.CASCADE)
    year       = models.PositiveSmallIntegerField()
    total_days = models.DecimalField(max_digits=5, decimal_places=1, default=0)
    used_days  = models.DecimalField(max_digits=5, decimal_places=1, default=0)

    class Meta:
        db_table = "leave_balances"
        unique_together = ("employee", "leave_type", "year")

    @property
    def available_days(self):
        return float(self.total_days) - float(self.used_days)


class LeaveRequest(models.Model):
    STATUS_CHOICES = [
        ("pending","Pending"), ("approved","Approved"),
        ("rejected","Rejected"), ("cancelled","Cancelled"),
    ]

    employee    = models.ForeignKey("employees.Employee", on_delete=models.CASCADE, related_name="leave_requests")
    leave_type  = models.ForeignKey(LeaveType, on_delete=models.CASCADE)
    start_date  = models.DateField()
    end_date    = models.DateField()
    duration    = models.DecimalField(max_digits=4, decimal_places=1)
    reason      = models.TextField()
    status      = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    approved_by = models.ForeignKey("authentication.User", null=True, blank=True, on_delete=models.SET_NULL, related_name="leave_approvals")
    approved_at = models.DateTimeField(null=True, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "leave_requests"
        ordering = ["-created_at"]


class AttendanceRecord(models.Model):
    employee       = models.ForeignKey("employees.Employee", on_delete=models.CASCADE, related_name="attendance_records")
    date           = models.DateField()
    punch_in       = models.TimeField(null=True, blank=True)
    punch_out      = models.TimeField(null=True, blank=True)
    hours_worked   = models.DecimalField(max_digits=4, decimal_places=2, default=0)
    overtime_hours = models.DecimalField(max_digits=4, decimal_places=2, default=0)
    is_present     = models.BooleanField(default=True)
    is_wfh         = models.BooleanField(default=False)
    source         = models.CharField(max_length=20, default="biometric")

    class Meta:
        db_table = "attendance_records"
        unique_together = ("employee", "date")
        ordering = ["-date"]


class WFHRequest(models.Model):
    STATUS_CHOICES = [("pending","Pending"), ("approved","Approved"), ("rejected","Rejected")]

    employee       = models.ForeignKey("employees.Employee", on_delete=models.CASCADE, related_name="wfh_requests")
    requested_date = models.DateField()
    reason         = models.TextField(blank=True)
    status         = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    approved_by    = models.ForeignKey("authentication.User", null=True, blank=True, on_delete=models.SET_NULL)
    approved_at    = models.DateTimeField(null=True, blank=True)
    created_at     = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "wfh_requests"
        unique_together = ("employee", "requested_date")


class Holiday(models.Model):
    TYPE_CHOICES = [("gazetted","Gazetted"), ("regional","Regional"), ("restricted","Restricted")]

    date     = models.DateField(unique=True)
    name     = models.CharField(max_length=200)
    type     = models.CharField(max_length=20, choices=TYPE_CHOICES)
    location = models.CharField(max_length=200, default="All India")
    year     = models.PositiveSmallIntegerField()

    class Meta:
        db_table = "holidays"
        ordering = ["date"]
