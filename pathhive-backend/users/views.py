from django.contrib.auth import login, logout
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status, viewsets, filters
from rest_framework.parsers import MultiPartParser, FormParser 
from .serializers import LoginSerializer, RegisterSerializer, UserSerializer
from django.middleware.csrf import get_token
from django.http import JsonResponse
from .models import UserAccount 

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        login(request, user)
        # We add context here too, just in case login returns an avatar immediately
        return Response(UserSerializer(user, context={'request': request}).data)

class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response(status=status.HTTP_200_OK)

# --- UPDATED SECTION STARTS HERE ---
class RetrieveUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        return Response(UserSerializer(request.user, context={'request': request}).data)

    def patch(self, request):
        # 👇 DEBUGGING: Print what the server receives
        print("--------------------------------------------------")
        print("DEBUG: Content-Type Header:", request.content_type)
        print("DEBUG: POST Data (Text):", request.data)
        print("DEBUG: FILES Data (Images):", request.FILES)
        print("--------------------------------------------------")

        user = request.user
        serializer = UserSerializer(user, data=request.data, partial=True, context={'request': request})
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        # 👇 DEBUGGING: Print validation errors if it fails
        print("DEBUG: Serializer Errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
# --- UPDATED SECTION ENDS HERE ---

class GetCSRFToken(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        csrf_token = get_token(request)
        return JsonResponse({'csrfToken': csrf_token})

class UserAdminViewSet(viewsets.ModelViewSet):
    """
    Admin-only viewset to manage users (List, Delete, Search)
    """
    queryset = UserAccount.objects.all().order_by('-created_at')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser] 
    
    filter_backends = [filters.SearchFilter]
    search_fields = ['email', 'username', 'full_name']