"""Creates in-app notifications for pipeline events.

One event fans out to one Notification row per recipient. Links are role-aware:
admins go to the admin candidate page, clients go to their portal detail page.

This is the in-app channel only. Slack and email will hook into these same
events later, so keep the event functions as the single source of truth.
"""

import logging

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.db.models import Q

from .models import Notification

User = get_user_model()
logger = logging.getLogger(__name__)


def _admin_users():
    """Internal Anthea staff (mirrors core.views.is_admin)."""
    return User.objects.filter(
        Q(is_superuser=True) | Q(is_staff=True) | Q(role='admin')
    ).distinct()


def _company_members(company, exclude=None):
    members = company.members.all()
    if exclude is not None:
        members = members.exclude(pk=exclude.pk)
    return members


def _create(recipients, *, kind, message, link, assignment):
    rows = [
        Notification(
            recipient=user,
            kind=kind,
            message=message,
            link=link,
            assignment=assignment,
        )
        for user in recipients
    ]
    if rows:
        Notification.objects.bulk_create(rows)


def notify_candidate_shared(assignment):
    """Admin shared a candidate -> in-app for the company's client users, plus an
    email to those who opted in (Slack is the default channel; email is opt-in)."""
    candidate = assignment.candidate
    members = _company_members(assignment.company)
    _create(
        members,
        kind=Notification.Kind.CANDIDATE_SHARED,
        message=f'New candidate to review: {candidate.name}',
        link=f'/portal/candidate/{assignment.id}',
        assignment=assignment,
    )
    _email_opted_in_members(assignment, members)


def _email_opted_in_members(assignment, members):
    recipients = [
        m.email
        for m in members
        if getattr(m, 'email_on_new_candidate', False) and m.email
    ]
    if not recipients:
        return
    candidate = assignment.candidate
    login_url = settings.FRONTEND_URL
    subject = f'New candidate to review: {candidate.name}'
    body = (
        f"Hi,\n\n"
        f"Anthea shared a new candidate for {assignment.company.name} to review: "
        f"{candidate.name}"
        f"{f' ({candidate.title})' if candidate.title else ''}.\n\n"
        f"Review them here:\n{login_url}portal/candidate/{assignment.id}\n\n"
        f"— Anthea"
    )
    try:
        # One message, each recipient hidden from the others.
        send_mail(
            subject,
            body,
            settings.DEFAULT_FROM_EMAIL,
            recipients,
        )
    except Exception:
        logger.exception('New-candidate email failed for assignment %s', assignment.id)


def notify_candidate_accepted(assignment, actor=None):
    """Client accepted -> tell admins, and the client's teammates (not the actor)."""
    candidate = assignment.candidate
    company = assignment.company
    _create(
        _admin_users(),
        kind=Notification.Kind.CANDIDATE_ACCEPTED,
        message=f'{company.name} accepted {candidate.name}',
        link=f'/candidates/{candidate.id}',
        assignment=assignment,
    )
    _create(
        _company_members(company, exclude=actor),
        kind=Notification.Kind.CANDIDATE_ACCEPTED,
        message=f'{candidate.name} was accepted',
        link=f'/portal/candidate/{assignment.id}',
        assignment=assignment,
    )


def notify_candidate_passed(assignment, actor=None):
    """Client passed -> tell admins only (feedback is internal)."""
    candidate = assignment.candidate
    company = assignment.company
    _create(
        _admin_users(),
        kind=Notification.Kind.CANDIDATE_PASSED,
        message=f'{company.name} passed on {candidate.name}',
        link=f'/candidates/{candidate.id}',
        assignment=assignment,
    )


def notify_status_changed(assignment):
    """Admin moved an accepted candidate along -> tell the company's client users."""
    candidate = assignment.candidate
    _create(
        _company_members(assignment.company),
        kind=Notification.Kind.STATUS_CHANGED,
        message=f'{candidate.name}: {assignment.get_status_display()}',
        link=f'/portal/candidate/{assignment.id}',
        assignment=assignment,
    )
