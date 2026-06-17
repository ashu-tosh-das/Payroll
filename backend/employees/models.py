"""
Employee master data: Department, Employee, BankChangeRequest, SalaryStructure.
"""
from django.db import models


class Department(models.Model):
    name  = models.CharField(max_length=100, unique=True)
    color = models.CharField(max_length=20, default="#6366F1")
    head  = models.ForeignKey(
        "Employee", null=True, blank=True, on_delete=models.SET_NULL, related_name="headed_department"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "departments"

    def __str__(self):
        return self.name


class Employee(models.Model):
    STATUS_CHOICES = [
        ("active",   "Active"),
        ("on_leave", "On Leave"),
        ("notice",   "In Notice Period"),
        ("inactive", "Inactive"),
    ]
    LEVEL_CHOICES = [(f"L{i}", f"L{i}") for i in range(1, 9)]

    employee_id     = models.CharField(max_length=20, unique=True)
    first_name      = models.CharField(max_length=100)
    last_name       = models.CharField(max_length=100)
    email           = models.EmailField(unique=True)
    phone           = models.CharField(max_length=20, blank=True)
    department      = models.ForeignKey(Department, null=True, on_delete=models.SET_NULL, related_name="employees")
    designation     = models.CharField(max_length=150)
    level           = models.CharField(max_length=5, choices=LEVEL_CHOICES, default="L2")
    location        = models.CharField(max_length=100)
    date_of_joining = models.DateField()
    status          = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")
    manager         = models.ForeignKey("self", null=True, blank=True, on_delete=models.SET_NULL, related_name="reports")
    pan_number      = models.CharField(max_length=10, unique=True)
    uan_number      = models.CharField(max_length=12, blank=True)
    aadhaar_last4   = models.CharField(max_length=4, blank=True)
    bank_name       = models.CharField(max_length=100, blank=True)
    bank_account    = models.CharField(max_length=20, blank=True)
    bank_ifsc       = models.CharField(max_length=11, blank=True)
    annual_ctc      = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "employees"
        ordering = ["first_name", "last_name"]

    def __str__(self):
        return f"{self.employee_id} — {self.full_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def monthly_ctc(self):
        return round(float(self.annual_ctc) / 12, 2)


class BankChangeRequest(models.Model):
    STATUS_CHOICES = [("pending","Pending"), ("approved","Approved"), ("rejected","Rejected")]

    employee         = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="bank_change_requests")
    old_bank_name    = models.CharField(max_length=100)
    old_bank_account = models.CharField(max_length=20)
    old_bank_ifsc    = models.CharField(max_length=11)
    new_bank_name    = models.CharField(max_length=100)
    new_bank_account = models.CharField(max_length=20)
    new_bank_ifsc    = models.CharField(max_length=11)
    status           = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    reviewed_by      = models.ForeignKey("authentication.User", null=True, blank=True, on_delete=models.SET_NULL)
    reviewed_at      = models.DateTimeField(null=True, blank=True)
    created_at       = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "bank_change_requests"


class SalaryStructure(models.Model):
    employee          = models.OneToOneField(Employee, on_delete=models.CASCADE, related_name="salary_structure")
    basic_percent     = models.DecimalField(max_digits=5, decimal_places=2, default=40)
    hra_percent       = models.DecimalField(max_digits=5, decimal_places=2, default=20)
    special_allowance = models.DecimalField(max_digits=5, decimal_places=2, default=25)
    lta_percent       = models.DecimalField(max_digits=5, decimal_places=2, default=8)
    telephone_fixed   = models.DecimalField(max_digits=8, decimal_places=2, default=1000)
    effective_from    = models.DateField()
    created_at        = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "salary_structures"

    def compute(self):
        monthly     = self.employee.monthly_ctc
        basic       = round(monthly * float(self.basic_percent) / 100, 2)
        hra         = round(monthly * float(self.hra_percent) / 100, 2)
        special     = round(monthly * float(self.special_allowance) / 100, 2)
        lta         = round(monthly * float(self.lta_percent) / 100, 2)
        telephone   = float(self.telephone_fixed)
        employer_pf = round(basic * 0.12, 2)
        return {
            "basic": basic, "hra": hra, "special_allowance": special,
            "lta": lta, "telephone": telephone, "employer_pf": employer_pf,
            "gross": round(basic + hra + special + lta + telephone + employer_pf, 2),
        }
