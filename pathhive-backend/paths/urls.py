from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LearningPathViewSet

router = DefaultRouter()
router.register(r'list', LearningPathViewSet, basename='path')

urlpatterns = [
    path('', include(router.urls)),
]