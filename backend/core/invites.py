"""Invite a client to a company.

We pre-create the client's account (with a verified email so their Google
sign-in attaches to it), link them to the company, and email them a sign-in
link. Clients log in with Google, so the account has no usable password.
"""

import logging

from allauth.account.models import EmailAddress
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import send_mail

User = get_user_model()
logger = logging.getLogger(__name__)


def _unique_username(base: str) -> str:
    username = (base or 'client')[:150]
    candidate = username
    i = 1
    while User.objects.filter(username=candidate).exists():
        suffix = f'-{i}'
        candidate = f'{username[: 150 - len(suffix)]}{suffix}'
        i += 1
    return candidate


def invite_client(company, email: str, name: str = '') -> dict:
    email = email.strip().lower()
    user = User.objects.filter(email__iexact=email).first()
    created = False

    if user is None:
        user = User(username=_unique_username(email), email=email, role='client')
        if name:
            first, _, last = name.strip().partition(' ')
            user.first_name = first
            user.last_name = last
        user.set_unusable_password()
        user.save()
        created = True

    company.members.add(user)

    # A verified email lets allauth attach the Google login to this account.
    EmailAddress.objects.get_or_create(
        user=user,
        email=email,
        defaults={'verified': True, 'primary': True},
    )

    emailed = _send_invite_email(company, email)
    return {
        'created': created,
        'emailed': emailed,
        'member': {'id': user.id, 'email': user.email, 'username': user.username},
    }


def _send_invite_email(company, email: str) -> bool:
    login_url = settings.FRONTEND_URL
    subject = f'{company.name} invited you to Anthea'
    body = (
        f"Hi,\n\n"
        f"{company.name} works with Anthea, and you've been given access to "
        f"review candidates we put forward.\n\n"
        f"Sign in with your Google account here:\n{login_url}\n\n"
        f"Please use this email address — {email} — when you sign in.\n\n"
        f"— Anthea"
    )
    try:
        send_mail(subject, body, settings.DEFAULT_FROM_EMAIL, [email])
        return True
    except Exception:
        logger.exception('Invite email failed for %s', email)
        return False
