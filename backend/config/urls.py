"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import HttpResponse
from django.urls import include, path, re_path
from django.views.static import serve as serve_media

from accounts.views import MeView


def spa_index(request, *args, **kwargs):
    """Return the built dashboard's index.html so React Router can handle the
    route on the client (production same-origin serving)."""
    return HttpResponse(
        (settings.FRONTEND_DIST / 'index.html').read_bytes(),
        content_type='text/html',
    )

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/me/', MeView.as_view(), name='me'),
    path('api/', include('core.urls')),
    # Lets you log in/out of the browsable API using the session login.
    path('api-auth/', include('rest_framework.urls')),
    # Google login and other allauth account routes (e.g. /accounts/google/login/).
    path('accounts/', include('allauth.urls')),
]

# Serve uploaded media files. In dev the static() helper handles it; in
# production we serve them from the persistent disk via Django's static serve
# view (fine at this scale; swap for object storage if it ever grows).
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
else:
    urlpatterns += [
        re_path(
            r'^media/(?P<path>.*)$',
            serve_media,
            {'document_root': settings.MEDIA_ROOT},
        ),
    ]

# SPA fallback (production): any route not matched above returns the dashboard's
# index.html so client-side routing works on hard refresh / deep links. Added
# only when the build exists, so local dev (which uses the Vite server) is
# unaffected. Must be last so it doesn't shadow /api, /admin, /accounts, /media.
if (settings.FRONTEND_DIST / 'index.html').exists():
    urlpatterns += [re_path(r'^.*$', spa_index)]
