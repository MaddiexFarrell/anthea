"""Branded transactional email.

Renders the shared HTML template (templates/email/message.html) and sends it as
a multipart message with a plain-text fallback, so it looks good in modern
clients and still degrades gracefully in text-only ones.
"""

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string


def logo_url() -> str:
    """Absolute URL to the email logo. The backend serves the dashboard and its
    static files from the same origin as FRONTEND_URL, so build it from there.
    Override with settings.EMAIL_LOGO_URL if the asset ever moves to a CDN."""
    override = getattr(settings, 'EMAIL_LOGO_URL', '')
    if override:
        return override
    base = settings.FRONTEND_URL.rstrip('/')
    static_prefix = settings.STATIC_URL.strip('/')
    return f'{base}/{static_prefix}/email/anthea-logo.png'


def send_branded_email(
    *,
    subject: str,
    to: list[str],
    heading: str,
    paragraphs: list[str],
    text_body: str,
    button_label: str | None = None,
    button_url: str | None = None,
    note: str | None = None,
    preheader: str = '',
) -> None:
    """Send one branded HTML email (with plain-text fallback) to `to`."""
    html = render_to_string(
        'email/message.html',
        {
            'subject': subject,
            'preheader': preheader or heading,
            'logo_url': logo_url(),
            'heading': heading,
            'paragraphs': paragraphs,
            'button_label': button_label,
            'button_url': button_url,
            'note': note,
        },
    )
    message = EmailMultiAlternatives(
        subject=subject,
        body=text_body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=to,
    )
    message.attach_alternative(html, 'text/html')
    message.send()
