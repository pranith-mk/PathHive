from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LearningPathViewSet, PathStepViewSet, ResourceViewSet

router = DefaultRouter()
router.register(r'list', LearningPathViewSet, basename='path')
router.register(r'steps', PathStepViewSet) 
router.register(r'resources', ResourceViewSet)

urlpatterns = [
    path('', include(router.urls)),
]