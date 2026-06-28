from django.conf import settings
from django.db import models


class Company(models.Model):
    """A client startup that Anthea is recruiting for.

    Maps to the "Companies" page (admin) and "Client Overview" (client portal).
    """

    class Status(models.TextChoices):
        NEEDS_CANDIDATES = 'needs_candidates', 'Needs candidates'
        REVIEWING = 'reviewing', 'Reviewing'
        PAUSED = 'paused', 'Paused'
        PLACED = 'placed', 'Placed'

    name = models.CharField(max_length=200)
    logo = models.ImageField(
        upload_to='companies/', blank=True, null=True, help_text='Uploaded company logo.'
    )
    logo_url = models.URLField(blank=True, help_text='Link to the company logo.')
    point_of_contact = models.CharField(
        max_length=200, blank=True, help_text='Main contact name at the company.'
    )
    contact_email = models.EmailField(blank=True)
    roles = models.TextField(
        blank=True, help_text='Roles they are hiring for / what they are looking for.'
    )
    openings = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text='Number of open roles / hires the company wants to fill.',
    )
    scheduling_link = models.URLField(
        blank=True, help_text='Calendly / Cal.com link for booking meetings.'
    )
    intake_link = models.URLField(blank=True, help_text='Intake form link.')
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.NEEDS_CANDIDATES
    )

    # Client-portal users who belong to this company. A user with no company is
    # typically an internal admin.
    members = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='companies',
        blank=True,
        help_text='Client users who can log in and see this company.',
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name_plural = 'companies'

    def __str__(self) -> str:
        return self.name


class Tag(models.Model):
    """A reusable focus-area label (e.g. Growth, Marketing, Social media).

    Predefined ones are seeded via migration; admins can add/rename/delete more
    from the dashboard's "Manage tags" page. Attached to candidates many-to-many.
    """

    name = models.CharField(max_length=60, unique=True)
    order = models.PositiveIntegerField(
        default=0, help_text='Lower numbers sort first in pickers.'
    )

    class Meta:
        ordering = ['order', 'name']

    def __str__(self) -> str:
        return self.name


class Candidate(models.Model):
    """A person Anthea can put forward to companies.

    Maps to the "Candidates" page (admin). A single candidate can be shared with
    multiple companies via Assignment.
    """

    class Experience(models.TextChoices):
        STUDENT = 'student', 'Student'
        INTERN = 'intern', 'Intern'
        NEW_GRAD = 'new_grad', 'New grad'

    name = models.CharField(max_length=200)
    photo = models.ImageField(
        upload_to='candidates/', blank=True, null=True, help_text='Profile photo.'
    )
    email = models.EmailField(blank=True)
    title = models.CharField(
        max_length=200,
        blank=True,
        help_text='Current/most recent role, e.g. "Marketing Intern at Acme".',
    )
    role_wanted = models.CharField(
        max_length=200, blank=True, help_text='Role they want next, e.g. "Growth Marketing".'
    )
    university = models.CharField(max_length=200, blank=True)
    experience = models.CharField(
        max_length=10,
        choices=Experience.choices,
        blank=True,
        help_text='Stage: Student, Intern, or New grad.',
    )
    focus_areas = models.ManyToManyField(
        Tag,
        related_name='candidates',
        blank=True,
        help_text='Focus-area tags shown as chips (e.g. Growth, Social media).',
    )
    resume_url = models.URLField(
        blank=True, help_text='Link to the resume (Google Drive, Dropbox, etc.).'
    )
    linkedin_url = models.URLField(blank=True)
    portfolio_url = models.URLField(blank=True)
    about = models.TextField(
        blank=True, help_text="Candidate's own summary. Shown to clients."
    )
    intake_notes = models.TextField(
        blank=True, help_text='Intake info / internal notes about the candidate. Admin only.'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self) -> str:
        return self.name


class CandidateExperience(models.Model):
    """A single experience highlight for a candidate (internship, club, project,
    etc.), with an optional link to their work. Shown to clients in order."""

    candidate = models.ForeignKey(
        Candidate, related_name='experiences', on_delete=models.CASCADE
    )
    title = models.CharField(
        max_length=200, help_text='e.g. "Growth Intern at Acme" or "President, Marketing Club".'
    )
    description = models.CharField(
        max_length=300, blank=True, help_text='Optional one-line detail.'
    )
    url = models.URLField(blank=True, help_text='Optional link to their work.')
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self) -> str:
        return f'{self.candidate.name} — {self.title}'


class Assignment(models.Model):
    """Links one Candidate to one Company, and tracks where they are in the
    pipeline. This is the record both dashboards read and write.

    Admin view moves it: shared -> meeting -> interviewing -> placed.
    Client view reacts: to_review -> accepted / passed (with feedback).
    """

    class Status(models.TextChoices):
        SHARED = 'shared', 'Shared (awaiting client review)'
        PASSED = 'passed', 'Passed'
        ACCEPTED = 'accepted', 'Accepted'
        MEETING = 'meeting', 'Meeting booked'
        INTERVIEWING = 'interviewing', 'Interviewing'
        PLACED = 'placed', 'Placed'

    candidate = models.ForeignKey(
        Candidate, on_delete=models.CASCADE, related_name='assignments'
    )
    company = models.ForeignKey(
        Company, on_delete=models.CASCADE, related_name='assignments'
    )
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.SHARED
    )
    pass_feedback = models.TextField(
        blank=True, help_text='If the client passed, why. Shown to admin only.'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']
        # A candidate should only be assigned to a given company once.
        constraints = [
            models.UniqueConstraint(
                fields=['candidate', 'company'], name='unique_candidate_company'
            )
        ]

    def __str__(self) -> str:
        return f'{self.candidate} → {self.company} ({self.get_status_display()})'


class Notification(models.Model):
    """An in-app notification for one user. We store one row per recipient (so a
    single event can fan out to several people) and group them in the UI.

    This is the in-app channel; Slack and email are layered on the same events
    later, so this model intentionally stays simple.
    """

    class Kind(models.TextChoices):
        CANDIDATE_SHARED = 'candidate_shared', 'New candidate to review'
        CANDIDATE_ACCEPTED = 'candidate_accepted', 'Candidate accepted'
        CANDIDATE_PASSED = 'candidate_passed', 'Candidate passed'
        STATUS_CHANGED = 'status_changed', 'Status updated'

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
    )
    kind = models.CharField(max_length=32, choices=Kind.choices)
    message = models.CharField(max_length=255)
    # Relative in-app path the notification links to, e.g. /portal/candidate/12.
    link = models.CharField(max_length=255, blank=True)
    # The assignment this is about (if any), kept for context/grouping. Nulled
    # rather than deleted so old notifications survive if the assignment is removed.
    assignment = models.ForeignKey(
        Assignment,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='notifications',
    )
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'is_read']),
        ]

    def __str__(self) -> str:
        return f'{self.recipient} · {self.get_kind_display()}'
