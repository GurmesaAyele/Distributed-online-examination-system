from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'username'  # explicitly

    def validate(self, attrs):
        # Standard validation
        data = super().validate(attrs)
        # Add role to the token response
        data['role'] = self.user.role
        return data
