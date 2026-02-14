# backend/users/utils.py
import os
import random
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from django.conf import settings

def generate_otp():
    return str(random.randint(100000, 999999))

def send_otp_via_sendgrid(recipient_email, otp):
    message = Mail(
        from_email=settings.DEFAULT_FROM_EMAIL,
        to_emails=recipient_email,
        subject='Your Aureon Verification Code',
        plain_text_content=f'Your code is: {otp}'
    )
    try:
        sg = SendGridAPIClient(os.getenv('SENDGRID_API_KEY'))
        response = sg.send(message)
        return response.status_code
    except Exception as e:
        print(f"SendGrid Error: {e}")
        return None