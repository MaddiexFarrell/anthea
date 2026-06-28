from rest_framework import serializers

from .models import User


class CurrentUserSerializer(serializers.ModelSerializer):
    """The logged-in user, plus a simple is_admin flag and their companies,
    so the dashboard can decide which screens to show."""

    is_admin = serializers.SerializerMethodField()
    companies = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'role',
            'is_admin',
            'companies',
            'email_on_new_candidate',
        ]

    def get_is_admin(self, obj) -> bool:
        return bool(obj.is_superuser or obj.is_staff or obj.role == 'admin')

    def get_companies(self, obj):
        return [{'id': c.id, 'name': c.name} for c in obj.companies.all()]
