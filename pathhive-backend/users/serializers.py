from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'full_name']

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data['email'], password=data['password'])
        if user and user.is_active:
            return {'user': user}
        raise serializers.ValidationError("Invalid credentials")

class UserSerializer(serializers.ModelSerializer):

    is_staff = serializers.BooleanField(source='is_admin', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'role', 'avatar','is_staff','is_active','created_at']
        read_only_fields = ['is_staff','created_at']