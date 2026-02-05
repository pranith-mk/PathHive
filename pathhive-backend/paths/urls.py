from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LearningPathViewSet, PathStepViewSet, ResourceViewSet , TagViewSet
from . import views

router = DefaultRouter()
router.register(r'list', LearningPathViewSet, basename='path')
router.register(r'steps', PathStepViewSet) 
router.register(r'resources', ResourceViewSet)
router.register(r'tags', TagViewSet)

urlpatterns = [
    path('creators/<str:pk>/', views.creator_profile, name='creator-profile'),
    path('', include(router.urls)),
    
]