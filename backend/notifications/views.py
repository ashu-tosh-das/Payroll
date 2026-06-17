from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from django.utils import timezone
from .models import Notification
from .serializers import NotificationSerializer


class NotificationViewSet(ModelViewSet):
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)

    @action(detail=True, methods=["post"])
    def mark_read(self, request, pk=None):
        obj = self.get_object()
        obj.is_read = True
        obj.read_at = timezone.now()
        obj.save()
        return Response(NotificationSerializer(obj).data)

    @action(detail=False, methods=["post"])
    def mark_all_read(self, request):
        qs = self.get_queryset().filter(is_read=False)
        qs.update(is_read=True, read_at=timezone.now())
        return Response({"detail": f"{qs.count()} notifications marked as read."})

    @action(detail=False, methods=["get"])
    def unread_count(self, request):
        count = self.get_queryset().filter(is_read=False).count()
        return Response({"unread_count": count})
