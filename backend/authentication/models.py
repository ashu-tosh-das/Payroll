"""
Custom User model with Role-Based Access Control (RBAC).
"""
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class Role(models.Model):
    name        = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    color       = models.CharField(max_length=20, default="#6366F1")
    is_system   = models.BooleanField(default=False)

    # Eight permission toggles
    can_view_all_payslips = models.BooleanField(default=False)
    can_edit_compensation = models.BooleanField(default=False)
    can_run_payroll       = models.BooleanField(default=False)
    can_approve_payroll   = models.BooleanField(default=False)
    can_export_pii        = models.BooleanField(default=False)
    can_edit_bank_details = models.BooleanField(default=False)
    can_view_audit_log    = models.BooleanField(default=False)
    can_manage_roles      = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "auth_roles"

    def __str__(self):
        return self.name


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    email          = models.EmailField(unique=True)
    first_name     = models.CharField(max_length=150, blank=True)
    last_name      = models.CharField(max_length=150, blank=True)
    role           = models.ForeignKey(Role, null=True, blank=True, on_delete=models.SET_NULL, related_name="users")
    is_active      = models.BooleanField(default=True)
    is_staff       = models.BooleanField(default=False)
    two_fa_enabled = models.BooleanField(default=False)
    last_login_ip  = models.GenericIPAddressField(null=True, blank=True)
    created_at     = models.DateTimeField(auto_now_add=True)
    updated_at     = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD  = "email"
    REQUIRED_FIELDS = []

    class Meta:
        db_table = "auth_users"

    def __str__(self):
        return self.email

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    @property
    def is_super_admin(self):
        return bool(self.role and self.role.name == "super_admin")
