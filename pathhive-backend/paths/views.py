from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action 
from rest_framework.response import Response 
from .models import LearningPath, Tag, Enrollment
from .models import PathStep, Comment
from .models import Report
from .serializers import ReportSerializer
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, permission_classes

from .serializers import (
    LearningPathListSerializer, 
    LearningPathDetailSerializer, 
    LearningPathCreateSerializer,  
    CommentSerializer
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

    # 1. Get Comments for a Path
    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny])
    def comments(self, request, pk=None):
        """
        GET /api/paths/list/{id}/comments/
        """
        path = self.get_object()
        comments = path.comments.all()
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)

    # 2. Add a Comment
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def add_comment(self, request, pk=None):
        """
        POST /api/paths/list/{id}/add_comment/
        Body: { "text": "Great course!" }
        """
        path = self.get_object()
        text = request.data.get('text')
        parent_id = request.data.get('parent_id')

        
        if not text:
            return Response({'error': 'Text is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if parent exists
        parent_comment = None
        if parent_id:
            try:
                parent_comment = Comment.objects.get(id=parent_id, learning_path=path)
            except Comment.DoesNotExist:
                return Response({'error': 'Parent comment not found'}, status=status.HTTP_404_NOT_FOUND)

        comment = Comment.objects.create(
            user=request.user,
            learning_path=path,
            text=text,
            parent=parent_comment # <--- Save parent
        )
            
    
        
        serializer = CommentSerializer(comment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    # 3. Delete a Comment
    @action(detail=True, methods=['delete'], url_path='comments/(?P<comment_id>[^/.]+)', permission_classes=[permissions.IsAuthenticated])
    def delete_comment(self, request, pk=None, comment_id=None):
        """
        DELETE /api/paths/list/{path_id}/comments/{comment_id}/
        """
        path = self.get_object()
        comment = get_object_or_404(Comment, pk=comment_id, learning_path=path)

        # Security Check: Only the owner can delete
        if comment.user != request.user:
            return Response(
                {'error': 'You can only delete your own comments'}, 
                status=status.HTTP_403_FORBIDDEN
            )

        comment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)



#admin functionalities

User = get_user_model()

# 1. ViewSet for handling Reports (Anyone can create, only Admin can list)
class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only admins can see the list of reports
        if self.request.user.is_staff:
            return Report.objects.all().order_by('-created_at')
        return Report.objects.none() # Regular users see nothing

    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)

    # Admin action to resolve a report
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def resolve(self, request, pk=None):
        report = self.get_object()
        report.is_resolved = True
        report.save()
        return Response({'status': 'resolved'})

# 2. Admin Stats Endpoint
@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def admin_stats(request):
    """
    Returns counts for dashboard
    """
    stats = {
        'total_users': User.objects.count(),
        'total_paths': LearningPath.objects.count(),
        'total_comments': Comment.objects.count(),
        'pending_reports': Report.objects.filter(is_resolved=False).count(),
    }
    return Response(stats)



class PathAdminViewSet(viewsets.ModelViewSet):
    """
    Admin-only viewset to manage paths (List, Delete, Search)
    """
    queryset = LearningPath.objects.all().order_by('-created_at')
    serializer_class = LearningPathListSerializer
    permission_classes = [permissions.IsAdminUser] # Strict Admin Access
    
    # Enable Searching
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description']