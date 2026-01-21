from django.urls import path
from .views import RegisterView, LoginView, LogoutView, RetrieveUserView, GetCSRFToken

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view()),
    path('logout/', LogoutView.as_view()),
    path('me/', RetrieveUserView.as_view()),
    path('csrf/', GetCSRFToken.as_view()),
]