import os
import django
import sys


sys.path.append(os.path.dirname(os.path.abspath(__file__)))

print('hi')
print(os.path.dirname(os.path.abspath(__file__)))



os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'auth.settings')
django.setup()


import random
from django.core.mail import send_mail
from django.conf import settings




def generate_otp():
    otp = str(random.randint(100000, 999999))
    return otp

def send_otp(email):
    otp = generate_otp()
    subject = 'Your OTP Code'
    message = (
        f'Hello,\n\n'
        f'Thank you for registering on Musify!\n\n'
        f'Your OTP (One-Time Password) code is {otp}. Please use this code to complete your registration.\n\n'
        f'If you did not request this, please ignore this email.\n\n'
        f'Best regards,\n'
        f'The Musify Team'
    )
    email_from = settings.EMAIL_HOST_USER
    print(email_from)
    recipient_list = [email]
    send_mail(subject, message, email_from, recipient_list)
    return otp

