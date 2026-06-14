import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional
import logging
from ..core.config import settings

logger = logging.getLogger(__name__)

class EmailService:
    @staticmethod
    async def send_email(
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None
    ):
        if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
            logger.warning("SMTP credentials not configured. Email not sent.")
            return
        
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{settings.EMAIL_FROM_NAME} <{settings.EMAIL_FROM}>"
            msg["To"] = to_email
            
            if text_content:
                part1 = MIMEText(text_content, "plain")
                msg.attach(part1)
            
            part2 = MIMEText(html_content, "html")
            msg.attach(part2)
            
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.EMAIL_FROM, to_email, msg.as_string())
            
            logger.info(f"Email sent to {to_email}")
            
        except Exception as e:
            logger.error(f"Failed to send email: {str(e)}")
    
    @staticmethod
    async def send_verification_email(email: str, token: str, name: str):
        verification_url = f"http://localhost:3000/verify-email?token={token}"
        
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }}
                .content {{ padding: 30px; background: #f9f9f9; }}
                .button {{ display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                .footer {{ text-align: center; padding: 20px; font-size: 12px; color: #999; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome to JobHub!</h1>
                </div>
                <div class="content">
                    <h2>Hello {name},</h2>
                    <p>Thank you for registering with JobHub. Please verify your email address to get started.</p>
                    <div style="text-align: center;">
                        <a href="{verification_url}" class="button">Verify Email Address</a>
                    </div>
                    <p>Or copy and paste this link: {verification_url}</p>
                    <p>This link will expire in 24 hours.</p>
                </div>
                <div class="footer">
                    <p>&copy; 2024 JobHub. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        await EmailService.send_email(email, "Verify Your Email Address", html)
    
    @staticmethod
    async def send_password_reset_email(email: str, token: str, name: str):
        reset_url = f"http://localhost:3000/reset-password?token={token}"
        
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }}
                .content {{ padding: 30px; background: #f9f9f9; }}
                .button {{ display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                .footer {{ text-align: center; padding: 20px; font-size: 12px; color: #999; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Reset Your Password</h1>
                </div>
                <div class="content">
                    <h2>Hello {name},</h2>
                    <p>We received a request to reset your password. Click the button below to create a new password.</p>
                    <div style="text-align: center;">
                        <a href="{reset_url}" class="button">Reset Password</a>
                    </div>
                    <p>Or copy and paste this link: {reset_url}</p>
                    <p>This link will expire in 24 hours.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                </div>
                <div class="footer">
                    <p>&copy; 2024 JobHub. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        await EmailService.send_email(email, "Reset Your Password", html)
    
    @staticmethod
    async def send_job_alert(email: str, jobs: List[dict], frequency: str):
        jobs_html = ""
        for job in jobs[:10]:
            jobs_html += f"""
            <div style="padding: 15px; margin-bottom: 15px; background: white; border-radius: 5px; border-left: 4px solid #667eea;">
                <h3 style="margin: 0 0 5px 0;">{job.get('title', 'New Job')}</h3>
                <p style="margin: 0; color: #666;">{job.get('company', 'Unknown Company')} - {job.get('location', 'Location not specified')}</p>
                <p style="margin: 10px 0 0 0; font-size: 14px;">{job.get('description', '')[:200]}...</p>
            </div>
            """
        
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }}
                .content {{ padding: 30px; background: #f9f9f9; }}
                .footer {{ text-align: center; padding: 20px; font-size: 12px; color: #999; }}
                .button {{ display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Your {frequency.capitalize()} Job Alert</h1>
                </div>
                <div class="content">
                    <h2>New Jobs Matching Your Profile</h2>
                    {jobs_html}
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="http://localhost:3000/jobs" class="button">View All Jobs</a>
                    </div>
                </div>
                <div class="footer">
                    <p>You're receiving this because you subscribed to job alerts. <a href="http://localhost:3000/settings/alerts">Unsubscribe</a></p>
                    <p>&copy; 2024 JobHub. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        await EmailService.send_email(email, f"Your {frequency.capitalize()} Job Alert", html)