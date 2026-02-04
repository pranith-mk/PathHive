from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from paths.views import ReportViewSet, admin_stats ,PathAdminViewSet , ReviewViewSet
from users.views import UserAdminViewSet
from notifications.views import NotificationViewSet

# Create a router for top-level API items (like reports)
router = DefaultRouter()
router.register(r'reports', ReportViewSet, basename='reports')
router.register(r'admin/users', UserAdminViewSet, basename='admin-users')
router.register(r'admin/paths', PathAdminViewSet, basename='admin-paths')
router.register(r'reviews', ReviewViewSet, basename='reviews')
router.register(r'notifications', NotificationViewSet, basename='notifications')

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Existing App Routes
    path('api/auth/', include('users.urls')),
    path('api/paths/', include('paths.urls')),
    
    # New Admin & Report Routes
    path('api/', include(router.urls)),      # This enables /api/reports/
    path('api/admin/stats/', admin_stats),   # This enables /api/admin/stats/
    
]