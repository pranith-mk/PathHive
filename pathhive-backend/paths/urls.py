from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LearningPathViewSet, PathStepViewSet, ResourceViewSet
from . import views

router = DefaultRouter()
router.register(r'list', LearningPathViewSet, basename='path')
router.register(r'steps', PathStepViewSet) 
router.register(r'resources', ResourceViewSet)

urlpatterns = [
    path('creators/<str:pk>/', views.creator_profile, name='creator-profile'),
    path('', include(router.urls)),
    
]