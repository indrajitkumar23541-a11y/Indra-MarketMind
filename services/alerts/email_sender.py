import os
import smtplib
from email.message import EmailMessage
import logging

logger = logging.getLogger(__name__)

class EmailSender:
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.username = os.getenv("SMTP_USERNAME")
        self.password = os.getenv("SMTP_PASSWORD")
        self.recipient = os.getenv("ALERT_EMAIL_RECIPIENT")
        
        self.is_enabled = bool(self.username and self.password and self.recipient)
        
        if not self.is_enabled:
            logger.warning("Email Sender disabled. Missing SMTP credentials or recipient in environment.")

    def send_email(self, subject: str, body: str) -> bool:
        if not self.is_enabled:
            logger.info(f"[MOCK EMAIL] To: {self.recipient}\nSubject: {subject}\nBody: {body}")
            return True
            
        msg = EmailMessage()
        msg.set_content(body)
        msg['Subject'] = subject
        msg['From'] = self.username
        msg['To'] = self.recipient
        
        try:
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.username, self.password)
                server.send_message(msg)
            logger.info("Email sent successfully.")
            return True
        except Exception as e:
            logger.error(f"Failed to send email: {str(e)}")
            return False
