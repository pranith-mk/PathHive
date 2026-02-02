from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action 
from rest_framework.response import Response 
from .models import LearningPath, Tag, Enrollment
from .models import PathStep

from .serializers import (
    LearningPathListSerializer, 
    LearningPathDetailSerializer, 
    LearningPathCreateSerializer  # <--- Make sure to import this!
)

class LearningPathViewSet(viewsets.ModelViewSet):
    # We start with 'all' so we don't accidentally block creating drafts
    queryset = LearningPath.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        """
        Custom logic: 
        - If I am the creator, I can see my own Drafts.
        - Everyone else can only see Published paths.
        """
        user = self.request.user
        if user.is_authenticated:
            # Show published OR my own paths (even drafts)
            return LearningPath.objects.filter(is_published=True) | LearningPath.objects.filter(creator=user)
        # Anonymous users see only published
        return LearningPath.objects.filter(is_published=True)

    def get_serializer_class(self):
        # 1. Use the CreateSerializer for writing (Create/Update)
        if self.action in ['create', 'update', 'partial_update']:
            return LearningPathCreateSerializer
        
        # 2. Use DetailSerializer for viewing a single path (Start Learning page)
        if self.action == 'retrieve':
            return LearningPathDetailSerializer
            
        # 3. Use ListSerializer for the Browse page (Cards)
        return LearningPathListSerializer

    def perform_create(self, serializer):
        # Automatically set the creator to the logged-in user
        serializer.save(creator=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def enroll(self, request, pk=None):
        """
        Endpoint: POST /api/paths/{id}/enroll/
        """
        path = self.get_object()
        enrollment, created = Enrollment.objects.get_or_create(student=request.user, learning_path=path)
        
        if created:
            return Response({'status': 'enrolled'}, status=status.HTTP_201_CREATED)
        else:
            return Response({'status': 'already_enrolled'}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], url_path='toggle-step/(?P<step_id>[^/.]+)')
    def toggle_step(self, request, pk=None, step_id=None):
        """
        POST /api/paths/list/{path_id}/toggle-step/{step_id}/
        """
        path = self.get_object()
        step = get_object_or_404(PathStep, pk=step_id, path=path)
        
        # Get the user's enrollment
        enrollment = get_object_or_404(Enrollment, student=request.user, learning_path=path)

        if step in enrollment.completed_steps.all():
            enrollment.completed_steps.remove(step)
            completed = False
        else:
            enrollment.completed_steps.add(step)
            completed = True

        return Response({'status': 'updated', 'is_completed': completed})
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_enrollments(self, request):
        """
        GET /api/paths/list/my_enrollments/
        """
        # Get all enrollments for this user
        enrollments = Enrollment.objects.filter(student=request.user).select_related('learning_path')
        
        # Extract the Path objects from the enrollments
        paths = [e.learning_path for e in enrollments]
        
        # Serialize them like normal path cards
        serializer = LearningPathListSerializer(paths, many=True, context={'request': request})
        return Response(serializer.data)

    # 2. Get courses I created
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def created_by_me(self, request):
        """
        GET /api/paths/list/created_by_me/
        """
        paths = LearningPath.objects.filter(creator=request.user)
        serializer = LearningPathListSerializer(paths, many=True, context={'request': request})
        return Response(serializer.data)