from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Role, User


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")


class UserSerializer(serializers.ModelSerializer):
    role = RoleSerializer(read_only=True)
    role_id = serializers.PrimaryKeyRelatedField(
        queryset=Role.objects.all(), source="role", write_only=True, required=False, allow_null=True
    )
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id", "email", "first_name", "last_name", "full_name",
            "role", "role_id", "is_active", "two_fa_enabled",
            "last_login_ip", "created_at", "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at", "last_login_ip")

    def get_full_name(self, obj):
        return obj.full_name


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ("email", "first_name", "last_name", "password", "role_id")

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField()
    new_password = serializers.CharField(min_length=8)


class PayrollTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["email"] = user.email
        token["role"] = user.role.name if user.role else None
        token["is_super_admin"] = user.is_super_admin
        return token
