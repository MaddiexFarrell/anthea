from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import CurrentUserSerializer


# ensure_csrf_cookie: the dashboard calls /api/me/ on load, and this guarantees
# the csrftoken cookie is set so subsequent write requests (POST/PATCH) can send
# the matching X-CSRFToken header that DRF's session auth requires.
@method_decorator(ensure_csrf_cookie, name='dispatch')
class MeView(APIView):
    """Returns the currently logged-in user. The dashboard calls this on load
    to know who's signed in (and whether they're an admin or a client)."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(CurrentUserSerializer(request.user).data)

    def patch(self, request):
        """Update the current user's own preferences (just the email opt-in)."""
        if 'email_on_new_candidate' in request.data:
            request.user.email_on_new_candidate = bool(
                request.data['email_on_new_candidate']
            )
            request.user.save(update_fields=['email_on_new_candidate'])
        return Response(CurrentUserSerializer(request.user).data)
