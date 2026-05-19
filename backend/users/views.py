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
                         'credit_used', 'credit_limit', 'phone_number', 'is_onboarded']
        
        for field in allowed_fields:
            if field in request.data:
                setattr(profile, field, request.data[field])
        
        profile.save()
        serializer = UserSerializer(user)
        return Response(serializer.data)

# --- 2. OTP Helper Function ---
def generate_otp():
    return str(random.randint(100000, 999999))

# --- 3. Send Email OTP View (Bypassed) ---
class SendEmailOTPView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        
        if not hasattr(user, 'profile'):
            FinancialProfile.objects.create(user=user)
        
        # Auto-verify email
        user.profile.is_email_verified = True
        user.profile.save()
        
        return Response({
            'message': 'Email verification bypassed. Auto-verified.',
            'email': user.email,
            'is_email_verified': True
        })

# --- 4. Verify Email OTP View (Bypassed) ---
class VerifyEmailOTPView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        profile = user.profile
        
        profile.is_email_verified = True
        profile.email_otp = None
        profile.save()
        
        return Response({
            'message': 'Email verified successfully (bypassed)',
            'is_email_verified': True
        })

    def send_welcome_email(self, user):
        """Helper to send the welcome email"""
        try:
            subject = 'Welcome to Aureon! 🚀'
            user_name = user.email.split('@')[0]
            
            html_message = f"""
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <style>
                    body {{ margin: 0; padding: 0; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #e2e8f0; }}
                    .email-wrapper {{ width: 100%; background-color: #0f172a; padding: 40px 0; }}
                    .email-content {{ max-width: 550px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; overflow: hidden; border: 1px solid #334155; }}
                    .header {{ background-color: #1e293b; padding: 30px 0; text-align: center; border-bottom: 1px solid #334155; }}
                    .logo-text {{ font-size: 24px; font-weight: 700; color: #10b981; letter-spacing: 2px; text-transform: uppercase; text-decoration: none; }}
                    .hero-image {{ width: 100%; height: 160px; background: linear-gradient(135deg, #10b981 0%, #0f172a 100%); display: flex; align-items: center; justify-content: center; }}
                    .hero-text {{ font-size: 28px; font-weight: bold; color: white; text-shadow: 0 2px 4px rgba(0,0,0,0.2); }}
                    .body-content {{ padding: 40px 30px; }}
                    .feature-list {{ margin: 25px 0; text-align: left; background: #0f172a; padding: 20px; border-radius: 8px; border: 1px solid #334155; }}
                    .feature-item {{ margin-bottom: 12px; color: #cbd5e1; display: flex; align-items: center; }}
                    .feature-icon {{ color: #10b981; margin-right: 10px; font-weight: bold; }}
                    .cta-button {{ display: inline-block; background-color: #10b981; color: #0f172a; padding: 14px 28px; border-radius: 6px; font-weight: bold; text-decoration: none; margin-top: 20px; }}
                    .footer {{ padding: 24px; background-color: #0f172a; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #334155; }}
                </style>
            </head>
            <body>
                <div class="email-wrapper">
                    <div class="email-content">
                        <div class="header">
                            <div class="logo-text">AUREON</div>
                        </div>
                        
                        <div class="hero-image">
                            <div class="hero-text">Welcome Aboard!</div>
                        </div>
                        
                        <div class="body-content">
                            <h2 style="color: #f8fafc; margin-top: 0;">Hi {user_name},</h2>
                            <p style="color: #94a3b8; line-height: 1.6;">
                                We're thrilled to have you join <strong>Aureon</strong>. You've taken the first step toward smarter financial management.
                            </p>
                            
                            <p style="color: #94a3b8;">Here is what you can do now:</p>
                            
                            <div class="feature-list">
                                <div class="feature-item"><span class="feature-icon">✓</span> Track your net worth in real-time</div>
                                <div class="feature-item"><span class="feature-icon">✓</span> Analyze subscription costs</div>
                                <div class="feature-item"><span class="feature-icon">✓</span> Get AI-powered financial insights</div>
                            </div>
                            
                            <div style="text-align: center;">
                                <a href="http://localhost:5173/dashboard" class="cta-button">Go to Dashboard</a>
                            </div>
                        </div>
                        
                        <div class="footer">
                            <p>&copy; 2025 Aureon Financial. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """
            
            send_mail(
                subject=subject,
                message=f"Welcome to Aureon, {user_name}! We are excited to have you.",
                html_message=html_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True, # Fail silently for welcome emails so it doesn't block the API response
            )
        except Exception as e:
            print(f"Failed to send welcome email: {e}")

class GetUserMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)