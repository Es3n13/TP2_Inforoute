from rest_framework import serializers
from .models import Dataset, Resource, Profile
from django.contrib.auth.models import User
from rest_framework.serializers import ModelSerializer

class ResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = ['id', 'name', 'description', 'format', 'url', 'resource_type']


class DatasetSerializer(serializers.ModelSerializer):
    resources = ResourceSerializer(many=True, read_only=True)

    class Meta:
        model = Dataset
        fields = [
            'ckan_id', 'name', 'title', 'notes', 'author',
            'organization_title', 'license_title', 'metadata_created',
            'metadata_modified', 'state', 'private', 'tags', 'groups', 'resources'
        ]

class UserSerializer(serializers.ModelSerializer):
    phone_number = serializers.CharField(source="profile.phone_number", allow_blank=True, required=False)
    role = serializers.CharField(source="profile.role", read_only=True)
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "username", "email", "phone_number", "role", "avatar_url")

    def get_avatar_url(self, obj):
        if hasattr(obj, "profile") and obj.profile.avatar:
            request = self.context.get("request")
            url = obj.profile.avatar.url
            return request.build_absolute_uri(url) if request else url
        return None

    def update(self, instance, validated_data):
        profile_data = validated_data.pop("profile", {})
        instance.email = validated_data.get("email", instance.email)
        instance.save()

        profile, _ = Profile.objects.get_or_create(user=instance)
        profile.phone_number = profile_data.get("phone_number", profile.phone_number)
        profile.save()
        return instance


class RegisterSerializer(serializers.ModelSerializer):
    phone_number = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ("username", "password", "email", "phone_number")
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        phone_number = validated_data.pop("phone_number", "")
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email"),
            password=validated_data["password"],
        )
        Profile.objects.create(user=user, phone_number=phone_number)
        return user
    
class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Ancien mot de passe incorrect.")
        return value