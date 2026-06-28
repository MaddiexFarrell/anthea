from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.conf import settings


class SocialAccountAdapter(DefaultSocialAccountAdapter):
    """When someone signs in with Google, decide their role by email domain:
    anyone @<ADMIN_EMAIL_DOMAIN> (e.g. antheatalent.com) is internal staff and
    becomes an admin; everyone else stays a client (the model default)."""

    def save_user(self, request, sociallogin, form=None):
        user = super().save_user(request, sociallogin, form)
        domain = (user.email or '').split('@')[-1].lower()
        if domain and domain == settings.ADMIN_EMAIL_DOMAIN.lower():
            user.role = 'admin'
            user.is_staff = True
            user.save(update_fields=['role', 'is_staff'])
        return user
