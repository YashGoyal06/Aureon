# backend/users/views.py
import random
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.core.mail import send_mail
from django.conf import settings
from .serializers import UserSerializer
from .models import FinancialProfile

# --- 1. User Profile View ---
class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    def patch(self, request):
        """Update user profile information"""
        user = request.user
        profile = user.profile
        
        # Update any allowed fields
        allowed_fields = ['net_worth', 'cash_available', 'invested_amount', 
                         'credit_used', 'credit_limit', 'phone_number']
        
        for field in allowed_fields:
            if field in request.data:
                setattr(profile, field, request.data[field])
        
        profile.save()
        serializer = UserSerializer(user)
        return Response(serializer.data)

# --- 2. OTP Helper Function ---
def generate_otp():
    return str(random.randint(100000, 999999))

# --- 3. Send Email OTP View ---
class SendEmailOTPView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        
        # Ensure profile exists
        if not hasattr(user, 'profile'):
            FinancialProfile.objects.create(user=user)
        
        # Generate OTP
        otp = generate_otp()
        user.profile.email_otp = otp
        user.profile.save()
        
        # Send email using SendGrid
        try:
            subject = 'Aureon - Email Verification Code'
            message = f'''
Hello {user.email.split('@')[0]},

Your verification code is: {otp}

This code will expire in 10 minutes.

If you didn't request this code, please ignore this email.

Best regards,
Aureon Team
            '''
            
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
            
            return Response({
                'message': 'OTP sent successfully to your email',
                'email': user.email
            })
            
        except Exception as e:
            return Response({
                'error': f'Failed to send email: {str(e)}'
            }, status=500)

# --- 4. Verify Email OTP View ---
class VerifyEmailOTPView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        otp = request.data.get('otp')
        
        if not otp:
            return Response({
                'error': 'OTP is required'
            }, status=400)
        
        profile = request.user.profile
        
        if profile.email_otp == otp:
            # Mark email as verified
            profile.is_email_verified = True
            profile.email_otp = None  # Clear the OTP
            profile.save()
            
            return Response({
                'message': 'Email verified successfully',
                'is_email_verified': True
            })
        else:
            return Response({
                'error': 'Invalid OTP'
            }, status=400)
        
class GetUserMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)