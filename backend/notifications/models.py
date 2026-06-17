"""
In-app notification model.
"""
from django.db import models


class Notification(models.Model):
    TYPE_CHOICES = [("alert","Alert"), ("info","Info"), ("check","Check")]

    recipient  = models.ForeignKey("authentication.User", on_delete=models.CASCADE, related_name="notifications")
    type       = models.CharField(max_length=20, choices=TYPE_CHOICES, default="info")
    title      = models.CharField(max_length=200)
    body       = models.TextField()
    is_read    = models.BooleanField(default=False)
    read_at    = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "notifications"
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.type}] {self.title}"
