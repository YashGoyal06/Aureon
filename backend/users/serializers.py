# backend/users/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import FinancialProfile

User = get_user_model()

class FinancialProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinancialProfile
        fields = [
            'net_worth', 'cash_available', 'invested_amount', 
            'credit_used', 'credit_limit', 'is_onboarded',
            'is_email_verified' # Removed phone fields
        ]
        read_only_fields = ['is_email_verified']

class UserSerializer(serializers.ModelSerializer):
    profile = FinancialProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'date_joined', 'profile']