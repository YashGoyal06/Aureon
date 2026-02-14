# backend/users/models.py
import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    def __str__(self):
        return self.email

class FinancialProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    # Financial Data
    net_worth = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    cash_available = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    invested_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    credit_used = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    credit_limit = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    
    # Verification Data (Mobile removed)
    is_email_verified = models.BooleanField(default=False)
    email_otp = models.CharField(max_length=6, blank=True, null=True)

    # Onboarding status
    is_onboarded = models.BooleanField(default=False)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile for {self.user.email}"