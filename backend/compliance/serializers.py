from rest_framework import serializers
from .models import StatutoryObligation, Form16, TDSComputation


class StatutoryObligationSerializer(serializers.ModelSerializer):
    days_remaining = serializers.IntegerField(read_only=True)

    class Meta:
        model = StatutoryObligation
        fields = "__all__"
        read_only_fields = ("id", "created_at", "filed_by", "filed_at")


class Form16Serializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source="employee.full_name", read_only=True)

    class Meta:
        model = Form16
        fields = "__all__"
        read_only_fields = ("id", "generated_at", "delivered_at")


class TDSComputationSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source="employee.full_name", read_only=True)

    class Meta:
        model = TDSComputation
        fields = "__all__"
        read_only_fields = ("id", "created_at")
