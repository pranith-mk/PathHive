from rest_framework import viewsets, permissions
from .models import LearningPath
from .serializers import LearningPathListSerializer, LearningPathDetailSerializer

class LearningPathViewSet(viewsets.ModelViewSet):
    # Only show published paths
    queryset = LearningPath.objects.filter(is_published=True)
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        # Use detailed serializer for single path, list serializer for browse page
        if self.action == 'retrieve':
            return LearningPathDetailSerializer
        return LearningPathListSerializer

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)