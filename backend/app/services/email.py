"""Email notification service.

Uses SMTP via environment variables. If SMTP is not configured,
marks the incident notification as SKIPPED (not FAILED) and logs clearly.

Environment variables (all optional — email is disabled if absent):
  SMTP_HOST      - e.g. smtp.gmail.com
  SMTP_PORT      - e.g. 587
  SMTP_USER      - sender email address
  SMTP_PASSWORD  - SMTP password or app password
  NOTIFY_EMAIL   - recipient email (authority inbox)
"""
import smtplib
import os
from datetime import datetime, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional

# Read SMTP config from environment (never hardcoded)
SMTP_HOST = os.getenv('SMTP_HOST', '')
SMTP_PORT = int(os.getenv('SMTP_PORT', '587'))
SMTP_USER = os.getenv('SMTP_USER', '')
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD', '')
NOTIFY_EMAIL = os.getenv('NOTIFY_EMAIL', '')


def _is_configured() -> bool:
    return bool(SMTP_HOST and SMTP_USER and SMTP_PASSWORD and NOTIFY_EMAIL)


def _build_email_body(incident) -> str:
    ts = incident.created_at.strftime('%Y-%m-%d %H:%M:%S UTC') if incident.created_at else 'Unknown'
    maps_url = f'https://www.openstreetmap.org/?mlat={incident.latitude}&mlon={incident.longitude}#map=16/{incident.latitude}/{incident.longitude}'

    return f"""
CivicShield AI — New Incident Report
=====================================

Incident ID  : {incident.id}
Issue Type   : {incident.type}
Severity     : {incident.severity}/100 ({incident.risk_level})
Confidence   : {incident.confidence * 100:.1f}%

Location
--------
Address      : {incident.address}
City         : {incident.city or 'Unknown'}
Coordinates  : {incident.latitude:.6f}, {incident.longitude:.6f}
Map          : {maps_url}

Authority
---------
Assigned To  : {incident.authority or 'Unassigned'}
Department   : {incident.department or 'Unassigned'}

Report Details
--------------
Status       : {incident.status}
Description  : {incident.description}
Submitted At : {ts}

---
This is an automated alert from CivicShield AI.
Do not reply to this email.
"""


def send_incident_notification(incident) -> bool:
    """
    Send an email notification for a new incident.

    Returns True if sent, False if skipped/failed.
    Updates incident.notification_status in-memory only (caller must commit).
    """
    if not _is_configured():
        print('[email] SMTP not configured — notification SKIPPED. Set SMTP_HOST, SMTP_USER, SMTP_PASSWORD, NOTIFY_EMAIL to enable.')
        incident.notification_status = 'SKIPPED'
        return False

    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f'[CivicShield] New {incident.type} Report — {incident.risk_level} — {incident.city or incident.address}'
        msg['From'] = SMTP_USER
        msg['To'] = NOTIFY_EMAIL

        body = _build_email_body(incident)
        msg.attach(MIMEText(body, 'plain'))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_USER, NOTIFY_EMAIL, msg.as_string())

        incident.notification_status = 'SENT'
        incident.notification_sent_at = datetime.now(timezone.utc)
        print(f'[email] Notification sent for incident {incident.id} to {NOTIFY_EMAIL}')
        return True

    except Exception as exc:
        incident.notification_status = 'FAILED'
        print(f'[email] Failed to send notification for incident {incident.id}: {exc}')
        return False
