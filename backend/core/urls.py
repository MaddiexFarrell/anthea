from rest_framework.routers import DefaultRouter

from .views import (
    AssignmentViewSet,
    CandidateViewSet,
    CompanyViewSet,
    NotificationViewSet,
    TagViewSet,
)

router = DefaultRouter()
router.register('companies', CompanyViewSet, basename='company')
router.register('candidates', CandidateViewSet, basename='candidate')
router.register('assignments', AssignmentViewSet, basename='assignment')
router.register('notifications', NotificationViewSet, basename='notification')
router.register('tags', TagViewSet, basename='tag')

urlpatterns = router.urls
