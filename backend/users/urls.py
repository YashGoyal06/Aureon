# backend/users/urls.py
from django.urls import path
from .views import (
    UserProfileView,
    SendEmailOTPView,
    VerifyEmailOTPView,
    GetUserMeView
)

app_name = 'users'

urlpatterns = [
    # Authentication
    path('me/', GetUserMeView.as_view(), name='user-me'),

    # Profile
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    
    # Email verification
    path('send-email-otp/', SendEmailOTPView.as_view(), name='send-email-otp'),
    path('verify-email-otp/', VerifyEmailOTPView.as_view(), name='verify-email-otp'),
    
]