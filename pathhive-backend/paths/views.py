from rest_framework import viewsets, permissions
from .models import LearningPath
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