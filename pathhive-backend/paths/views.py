from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response 
from django.contrib.auth import get_user_model
from django.db import IntegrityError 
from rest_framework.exceptions import ValidationError 
from django.db.models import Avg
from .permissions import IsOwnerOrReadOnly

from .models import (
    LearningPath, Tag, Enrollment, PathStep, 
    Comment, Resource, Report, Review
)

from .serializers import (
    LearningPathListSerializer, 
    LearningPathDetailSerializer, 
    LearningPathCreateSerializer,  
    CommentSerializer,
    ReviewSerializer,
    PathStepSerializer,
    ResourceSerializer,
    ReportSerializer,
    TagSerializer  # Make sure this is imported!
)

# 1. Get User model once at the top level
User = get_user_model()

class LearningPathViewSet(viewsets.ModelViewSet):
    queryset = LearningPath.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def get_queryset(self):
        # Show drafts only to the creator, otherwise only published paths
        user = self.request.user
        if user.is_authenticated:
            return LearningPath.objects.filter(is_published=True) | LearningPath.objects.filter(creator=user)
        return LearningPath.objects.filter(is_published=True)

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return LearningPathCreateSerializer
        if self.action == 'retrieve':
            return LearningPathDetailSerializer
        return LearningPathListSerializer

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def enroll(self, request, pk=None):
        path = self.get_object()
        enrollment, created = Enrollment.objects.get_or_create(student=request.user, learning_path=path)
        if created:
            return Response({'status': 'enrolled'}, status=status.HTTP_201_CREATED)
        return Response({'status': 'already_enrolled'}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], url_path='toggle-step/(?P<step_id>[^/.]+)')
    def toggle_step(self, request, pk=None, step_id=None):
        path = self.get_object()
        step = get_object_or_404(PathStep, pk=step_id, path=path)
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
        enrollments = Enrollment.objects.filter(student=request.user).select_related('learning_path')
        paths = [e.learning_path for e in enrollments]
        serializer = LearningPathListSerializer(paths, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def unenroll(self, request, pk=None):
        path = self.get_object()
        deleted_count, _ = Enrollment.objects.filter(student=request.user, learning_path=path).delete()
        if deleted_count > 0:
            return Response({'status': 'unenrolled'}, status=status.HTTP_200_OK)
        return Response({'status': 'not_enrolled'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def created_by_me(self, request):
        paths = LearningPath.objects.filter(creator=request.user)
        serializer = LearningPathListSerializer(paths, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny])
    def comments(self, request, pk=None):
        path = self.get_object()
        comments = path.comments.all()
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def add_comment(self, request, pk=None):
        path = self.get_object()
        text = request.data.get('text')
        parent_id = request.data.get('parent_id')
        
        if not text:
            return Response({'error': 'Text is required'}, status=status.HTTP_400_BAD_REQUEST)

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
            parent=parent_comment
        )
        serializer = CommentSerializer(comment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    @action(detail=True, methods=['delete'], url_path='comments/(?P<comment_id>[^/.]+)', permission_classes=[permissions.IsAuthenticated])
    def delete_comment(self, request, pk=None, comment_id=None):
        path = self.get_object()
        comment = get_object_or_404(Comment, pk=comment_id, learning_path=path)

        if comment.user != request.user:
            return Response({'error': 'You can only delete your own comments'}, status=status.HTTP_403_FORBIDDEN)

        comment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# --- ADMIN & UTILITY VIEWSETS ---

class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Report.objects.all().order_by('-created_at')
        return Report.objects.none()

    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def resolve(self, request, pk=None):
        report = self.get_object()
        report.is_resolved = True
        report.save()
        return Response({'status': 'resolved'})

@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def admin_stats(request):
    stats = {
        'total_users': User.objects.count(),
        'total_paths': LearningPath.objects.count(),
        'total_comments': Comment.objects.count(),
        'pending_reports': Report.objects.filter(is_resolved=False).count(),
    }
    return Response(stats)

class PathAdminViewSet(viewsets.ModelViewSet):
    queryset = LearningPath.objects.all().order_by('-created_at')
    serializer_class = LearningPathListSerializer
    permission_classes = [permissions.IsAdminUser]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description']

class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def get_queryset(self):
        queryset = Review.objects.all()
        path_id = self.request.query_params.get('path_id')
        if path_id:
            queryset = queryset.filter(path_id=path_id)
        return queryset

    def perform_create(self, serializer):
        try:
            serializer.save(user=self.request.user)
        except IntegrityError:
            raise ValidationError({"detail": "You have already reviewed this path."})

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        path_id = request.query_params.get('path_id')
        if not path_id:
            return Response({"detail": "Path ID required"}, status=400)
        try:
            review = Review.objects.get(path_id=path_id, user=request.user)
            serializer = self.get_serializer(review)
            return Response(serializer.data)
        except Review.DoesNotExist:
            return Response(None)

class PathStepViewSet(viewsets.ModelViewSet):
    queryset = PathStep.objects.all()
    serializer_class = PathStepSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

class ResourceViewSet(viewsets.ModelViewSet):
    queryset = Resource.objects.all()
    serializer_class = ResourceSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]


class TagViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.AllowAny]


# --- PUBLIC CREATOR PROFILE ---

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def creator_profile(request, pk):
    # 1. Get the User safely
    creator = get_object_or_404(User, pk=pk)
    
    # 2. Get their content
    paths = LearningPath.objects.filter(creator=creator, is_published=True).order_by('-created_at')
    total_students = Enrollment.objects.filter(learning_path__creator=creator).count()
    
    # 3. Get Stats
    avg_rating_data = Review.objects.filter(path__creator=creator).aggregate(Avg('rating'))
    avg_rating = avg_rating_data['rating__avg'] or 0
    
    path_serializer = LearningPathListSerializer(paths, many=True, context={'request': request})
    
    # Safe Helper for Date Fields (Handles mismatched User models)
    def get_joined_date(user):
        if hasattr(user, 'date_joined'): return user.date_joined
        if hasattr(user, 'created_at'): return user.created_at
        if hasattr(user, 'joined_at'): return user.joined_at
        return None

    return Response({
        'profile': {
            'id': creator.id,
            'username': creator.username,
            'full_name': getattr(creator, 'full_name', creator.username),
            'bio': getattr(creator, 'bio', ""),
            'avatar': creator.avatar.url if hasattr(creator, 'avatar') and creator.avatar else None,
            'date_joined': get_joined_date(creator)
        },
        'stats': {
            'total_students': total_students,
            'total_paths': paths.count(),
            'average_rating': round(avg_rating, 1)
        },
        'paths': path_serializer.data
    })