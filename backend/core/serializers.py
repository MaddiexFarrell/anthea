import json

from rest_framework import serializers

from .models import (
    Assignment,
    Candidate,
    CandidateExperience,
    Company,
    Notification,
    Tag,
)


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'order']


class CandidateExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = CandidateExperience
        fields = ['id', 'title', 'description', 'url', 'order']
        read_only_fields = ['id']


class CompanySerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    members = serializers.SerializerMethodField()
    # Relative URL of the uploaded logo for display; `logo` is the writable upload.
    logo = serializers.ImageField(write_only=True, required=False, allow_null=True)
    logo_image_url = serializers.SerializerMethodField()
    # How many candidates have actually been placed (hired) at this company.
    hires_count = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = [
            'id',
            'name',
            'logo',
            'logo_image_url',
            'logo_url',
            'point_of_contact',
            'contact_email',
            'roles',
            'openings',
            'hires_count',
            'scheduling_link',
            'intake_link',
            'status',
            'status_display',
            'members',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_members(self, obj):
        return [
            {'id': u.id, 'email': u.email, 'username': u.username}
            for u in obj.members.all()
        ]

    def get_logo_image_url(self, obj):
        return obj.logo.url if obj.logo else ''

    def get_hires_count(self, obj):
        return obj.assignments.filter(status=Assignment.Status.PLACED).count()


class CandidateSerializer(serializers.ModelSerializer):
    experience_display = serializers.CharField(
        source='get_experience_display', read_only=True
    )
    # Relative URL of the uploaded photo for display; `photo` is the writable upload.
    photo = serializers.ImageField(write_only=True, required=False, allow_null=True)
    photo_url = serializers.SerializerMethodField()
    # Read: nested tag detail. Write: a list of tag names (existing or new).
    focus_areas = TagSerializer(many=True, read_only=True)
    focus_area_names = serializers.ListField(
        child=serializers.CharField(allow_blank=True),
        write_only=True,
        required=False,
    )
    experiences = CandidateExperienceSerializer(many=True, required=False)

    class Meta:
        model = Candidate
        fields = [
            'id',
            'name',
            'photo',
            'photo_url',
            'email',
            'title',
            'role_wanted',
            'university',
            'experience',
            'experience_display',
            'focus_areas',
            'focus_area_names',
            'experiences',
            'resume_url',
            'linkedin_url',
            'portfolio_url',
            'about',
            'intake_notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_photo_url(self, obj):
        return obj.photo.url if obj.photo else ''

    def to_internal_value(self, data):
        # Multipart (photo upload) sends nested fields as JSON strings; decode
        # them so the list/nested serializers can validate normally.
        if hasattr(data, 'getlist'):
            data = data.dict()
        else:
            data = dict(data)
        for field in ('focus_area_names', 'experiences'):
            value = data.get(field)
            if isinstance(value, str):
                try:
                    data[field] = json.loads(value)
                except (ValueError, TypeError):
                    data[field] = []
        # Drop blank-title experience rows so half-filled rows never block a save.
        experiences = data.get('experiences')
        if isinstance(experiences, list):
            data['experiences'] = [
                e for e in experiences
                if isinstance(e, dict) and (e.get('title') or '').strip()
            ]
        return super().to_internal_value(data)

    def create(self, validated_data):
        names = validated_data.pop('focus_area_names', None)
        experiences = validated_data.pop('experiences', None)
        candidate = super().create(validated_data)
        if names is not None:
            self._set_focus_areas(candidate, names)
        if experiences is not None:
            self._set_experiences(candidate, experiences)
        return candidate

    def update(self, instance, validated_data):
        names = validated_data.pop('focus_area_names', None)
        experiences = validated_data.pop('experiences', None)
        candidate = super().update(instance, validated_data)
        if names is not None:
            self._set_focus_areas(candidate, names)
        if experiences is not None:
            self._set_experiences(candidate, experiences)
        return candidate

    @staticmethod
    def _set_focus_areas(candidate, names):
        tags = []
        for raw in names:
            name = (raw or '').strip()
            if not name:
                continue
            tag, _ = Tag.objects.get_or_create(name=name)
            tags.append(tag)
        candidate.focus_areas.set(tags)

    @staticmethod
    def _set_experiences(candidate, experiences):
        # Replace-all: simplest robust strategy for a short, ordered list.
        candidate.experiences.all().delete()
        for i, exp in enumerate(experiences):
            title = (exp.get('title') or '').strip()
            if not title:
                continue
            CandidateExperience.objects.create(
                candidate=candidate,
                title=title,
                description=(exp.get('description') or '').strip(),
                url=(exp.get('url') or '').strip(),
                order=exp.get('order', i),
            )


class CandidatePublicSerializer(serializers.ModelSerializer):
    """What a client is allowed to see about a candidate. Deliberately excludes
    internal intake_notes."""

    experience_display = serializers.CharField(
        source='get_experience_display', read_only=True
    )
    photo_url = serializers.SerializerMethodField()
    focus_areas = TagSerializer(many=True, read_only=True)
    experiences = CandidateExperienceSerializer(many=True, read_only=True)

    class Meta:
        model = Candidate
        fields = [
            'id',
            'name',
            'photo_url',
            'email',
            'title',
            'role_wanted',
            'university',
            'experience',
            'experience_display',
            'focus_areas',
            'experiences',
            'resume_url',
            'linkedin_url',
            'portfolio_url',
            'about',
        ]

    def get_photo_url(self, obj):
        return obj.photo.url if obj.photo else ''


class AssignmentSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    candidate_name = serializers.CharField(source='candidate.name', read_only=True)
    company_name = serializers.CharField(source='company.name', read_only=True)
    # Nested, client-safe candidate details so the portal can render cards in one
    # request without exposing internal intake notes.
    candidate_detail = CandidatePublicSerializer(source='candidate', read_only=True)

    class Meta:
        model = Assignment
        fields = [
            'id',
            'candidate',
            'candidate_name',
            'candidate_detail',
            'company',
            'company_name',
            'status',
            'status_display',
            'pass_feedback',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']


class NotificationSerializer(serializers.ModelSerializer):
    kind_display = serializers.CharField(source='get_kind_display', read_only=True)

    class Meta:
        model = Notification
        fields = [
            'id',
            'kind',
            'kind_display',
            'message',
            'link',
            'is_read',
            'created_at',
        ]
        read_only_fields = fields
