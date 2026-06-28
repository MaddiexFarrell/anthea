from django.contrib.auth.models import AbstractUser, UserManager
from django.db import models


class CustomUserManager(UserManager):
    """Same as Django's manager, but superusers default to the Admin role."""

    def create_superuser(self, *args, **kwargs):
        kwargs.setdefault('role', User.Role.ADMIN)
        return super().create_superuser(*args, **kwargs)


class User(AbstractUser):
    """Custom user model.

    Defined up front (before any real data exists) so we can extend it freely
    later without the painful migration Django requires when you swap the user
    model after the fact.

    Every user is one of two kinds:
      - ADMIN  -> internal Anthea staff; sees and manages everything.
      - CLIENT -> a startup; only ever sees their own company's data.
    """

    class Role(models.TextChoices):
        ADMIN = 'admin', 'Admin'
        CLIENT = 'client', 'Client'

    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.CLIENT,
        help_text='Controls what this user can see. Admins see everything; '
        'clients only see their own company.',
    )

    # Client notification preference. Slack is the primary channel, so email for
    # new candidates is opt-in (off by default).
    email_on_new_candidate = models.BooleanField(
        default=False,
        help_text='If on, email this client when a new candidate is shared.',
    )

    objects = CustomUserManager()

    @property
    def is_client(self) -> bool:
        return self.role == self.Role.CLIENT

    @property
    def is_admin_role(self) -> bool:
        return self.role == self.Role.ADMIN
