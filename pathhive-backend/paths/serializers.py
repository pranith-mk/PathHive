from rest_framework import serializers
from .models import LearningPath, PathStep, Resource, Tag, Comment , Enrollment , Report , Review
from users.serializers import UserSerializer

# --- BASIC SERIALIZERS ---

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']

class ResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = ['id', 'title', 'resource_type', 'url']

class PathStepSerializer(serializers.ModelSerializer):
    resources = ResourceSerializer(many=True, read_only=True)
    
    class Meta:
        model = PathStep
        fields = ['id', 'title', 'description', 'position', 'resources']

class ReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True) # Show user details (name/avatar)
    
    class Meta:
        model = Review
        fields = ['id', 'user', 'rating', 'comment', 'created_at']
        read_only_fields = ['created_at']

# --- READ SERIALIZERS (For viewing data) ---

class LearningPathListSerializer(serializers.ModelSerializer):
    """ Lightweight: For the 'Browse' cards. """
    creator = UserSerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    enrollmentCount = serializers.IntegerField(source='enrollments.count', read_only=True)

    average_rating = serializers.FloatField(read_only=True)
    review_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = LearningPath
        fields = ['id', 'title', 'difficulty', 'creator', 'tags', 'created_at', 'description', 'is_published','enrollmentCount','average_rating', 'review_count']



class LearningPathDetailSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    steps = PathStepSerializer(many=True, read_only=True)
    
    is_enrolled = serializers.SerializerMethodField()
    completed_steps = serializers.SerializerMethodField()
    comments_count = serializers.IntegerField(source='comments.count', read_only=True)

    average_rating = serializers.FloatField(read_only=True)
    review_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = LearningPath
        fields = ['id', 'title', 'description', 'difficulty', 'creator', 'tags', 'steps', 'created_at', 'is_published', 'is_enrolled','completed_steps','comments_count','average_rating', 'review_count']

    def get_is_enrolled(self, obj):
        # Check the 'request' context to see who is asking
        user = self.context.get('request').user
        if user.is_authenticated:
            return obj.enrollments.filter(student=user).exists()
        return False

    def get_completed_steps(self, obj):
        user = self.context.get('request').user
        if user.is_authenticated:
            try:
                enrollment = obj.enrollments.get(student=user)
                return enrollment.completed_steps.values_list('id', flat=True)
            except Enrollment.DoesNotExist:
                return []
        return []


# --- WRITE SERIALIZER (For creating data) ---

class LearningPathCreateSerializer(serializers.ModelSerializer):
    """
    Complex Serializer: Handles creating a Path + Tags + Steps + Resources
    all in one request.
    """
    # We use "write_only" fields to accept the raw JSON data
    tags = serializers.ListField(
        child=serializers.CharField(), write_only=True, required=False
    )
    steps = serializers.ListField(
        child=serializers.DictField(), write_only=True, required=False
    )

    class Meta:
        model = LearningPath
        fields = ['id', 'title', 'description', 'difficulty', 'is_published', 'tags', 'steps']

    def create(self, validated_data):
        # 1. Separate nested data
        tags_data = validated_data.pop('tags', [])
        steps_data = validated_data.pop('steps', [])
        
        # 2. Create the Parent (LearningPath)
        # Note: 'creator' is added automatically in views.py using serializer.save(creator=request.user)
        path = LearningPath.objects.create(**validated_data)

        # 3. Handle Tags (Get existing or Create new)
        for tag_name in tags_data:
            tag, created = Tag.objects.get_or_create(name=tag_name)
            path.tags.add(tag)

        # 4. Handle Steps (Loop through them)
        for i, step_data in enumerate(steps_data):
            resources_data = step_data.pop('resources', [])
            
            # Create the Step
            step = PathStep.objects.create(
                path=path, 
                position=i, 
                title=step_data.get('title'),
                description=step_data.get('description', '')
            )

            # 5. Handle Resources (Loop through nested resources)
            for res_data in resources_data:
                Resource.objects.create(
                    step=step,
                    title=res_data.get('title'),
                    url=res_data.get('url'),
                    resource_type=res_data.get('type', 'article') # Frontend sends 'type', model has 'resource_type'
                )

        return path

        
class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'user', 'text', 'created_at', 'parent']

class ReportSerializer(serializers.ModelSerializer):
    reporter_name = serializers.ReadOnlyField(source='reporter.username')

    class Meta:
        model = Report
        fields = ['id', 'reporter_name', 'report_type', 'target_id', 'reason', 'created_at', 'is_resolved']
        read_only_fields = ['reporter', 'created_at', 'is_resolved']


class ReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True) # Show user details with the review
    
    class Meta:
        model = Review
        fields = ['id', 'user','path','rating', 'comment', 'created_at']
        read_only_fields = ['created_at']