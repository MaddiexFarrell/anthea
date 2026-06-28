import logging

from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from . import invites, notifications
from .models import Assignment, Candidate, Company, Notification, Tag
from .serializers import (
    AssignmentSerializer,
    CandidatePublicSerializer,
    CandidateSerializer,
    CompanySerializer,
    NotificationSerializer,
    TagSerializer,
)

logger = logging.getLogger(__name__)


def is_admin(user) -> bool:
    """Internal Anthea staff: superusers, staff, or anyone with the admin role.

    (Superusers are included explicitly so the very first account works as an
    admin even if its role field was never flipped from the default.)"""
    return bool(
        user.is_superuser
        or user.is_staff
        or getattr(user, 'role', None) == 'admin'
    )


class IsAdminOrReadOnly(permissions.BasePermission):
    """Admins can do anything; clients are read-only on this resource."""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return is_admin(request.user)


class CompanyViewSet(viewsets.ModelViewSet):
    """Admins manage all companies. Clients can only read their own."""

    serializer_class = CompanySerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if is_admin(user):
            return Company.objects.all()
        return user.companies.all()

    @action(detail=True, methods=['post'])
    def invite(self, request, pk=None):
        """Invite a client (by email) to this company. Admin-only."""
        if not is_admin(request.user):
            raise PermissionDenied('Only admins can invite clients.')
        company = self.get_object()
        email = (request.data.get('email') or '').strip()
        name = (request.data.get('name') or '').strip()
        if not email:
            return Response(
                {'email': ['This field is required.']},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            validate_email(email)
        except ValidationError:
            return Response(
                {'email': ['Enter a valid email address.']},
                status=status.HTTP_400_BAD_REQUEST,
            )
        result = invites.invite_client(company, email, name)
        return Response(result, status=status.HTTP_201_CREATED)


class TagViewSet(viewsets.ModelViewSet):
    """Focus-area tags. Anyone authenticated can read; only admins manage them
    (via the dashboard's "Manage tags" page)."""

    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]
    queryset = Tag.objects.all()


class CandidateViewSet(viewsets.ModelViewSet):
    """Admins manage all candidates. Clients can only read candidates that have
    been shared with their company (i.e. have an assignment to it)."""

    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]

    def get_serializer_class(self):
        # Clients get the trimmed serializer (no internal intake notes).
        if is_admin(self.request.user):
            return CandidateSerializer
        return CandidatePublicSerializer

    def get_queryset(self):
        user = self.request.user
        if is_admin(user):
            return Candidate.objects.all()
        return Candidate.objects.filter(
            assignments__company__in=user.companies.all()
        ).distinct()


class AssignmentViewSet(viewsets.ModelViewSet):
    """The pipeline records. Admins manage all. Clients can read their own
    company's assignments and update the status/feedback (accept or pass)."""

    serializer_class = AssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if is_admin(user):
            qs = Assignment.objects.all()
        else:
            qs = Assignment.objects.filter(company__in=user.companies.all())
        # Optional filters used by the detail pages: ?candidate=<id> (everywhere a
        # candidate is shared) and ?company=<id> (everyone shared with a company).
        candidate_id = self.request.query_params.get('candidate')
        if candidate_id:
            qs = qs.filter(candidate_id=candidate_id)
        company_id = self.request.query_params.get('company')
        if company_id:
            qs = qs.filter(company_id=company_id)
        return qs

    def perform_create(self, serializer):
        # Only admins create assignments (share candidates with companies).
        if not is_admin(self.request.user):
            raise PermissionDenied('Only admins can create assignments.')
        assignment = serializer.save()
        if assignment.status == Assignment.Status.SHARED:
            self._notify(notifications.notify_candidate_shared, assignment)

    def perform_update(self, serializer):
        # Admins can move an assignment to any status. Clients are reacting to a
        # shared candidate, so they may only accept or pass (and leave feedback).
        if not is_admin(self.request.user):
            new_status = serializer.validated_data.get('status')
            allowed = {Assignment.Status.ACCEPTED, Assignment.Status.PASSED}
            if new_status is not None and new_status not in allowed:
                raise PermissionDenied('Clients can only accept or pass a candidate.')

        old_status = serializer.instance.status
        assignment = serializer.save()
        if assignment.status != old_status:
            self._notify_status_transition(assignment)

    def _notify_status_transition(self, assignment):
        actor = self.request.user
        status = assignment.status
        if status == Assignment.Status.ACCEPTED:
            self._notify(notifications.notify_candidate_accepted, assignment, actor=actor)
        elif status == Assignment.Status.PASSED:
            self._notify(notifications.notify_candidate_passed, assignment, actor=actor)
        elif status in {
            Assignment.Status.MEETING,
            Assignment.Status.INTERVIEWING,
            Assignment.Status.PLACED,
        }:
            self._notify(notifications.notify_status_changed, assignment)

    @staticmethod
    def _notify(fn, *args, **kwargs):
        # Fire-and-forget: a notification failure must never break the request.
        try:
            fn(*args, **kwargs)
        except Exception:
            logger.exception('Notification failed for %s', getattr(fn, '__name__', fn))

    def perform_destroy(self, instance):
        if not is_admin(self.request.user):
            raise PermissionDenied('Only admins can delete assignments.')
        instance.delete()


class NotificationViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """The current user's in-app notifications, newest first. Read-only list plus
    actions to mark things read."""

    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        count = self.get_queryset().filter(is_read=False).count()
        return Response({'count': count})

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        updated = self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({'updated': updated})

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        if not notification.is_read:
            notification.is_read = True
            notification.save(update_fields=['is_read'])
        return Response(NotificationSerializer(notification).data)
