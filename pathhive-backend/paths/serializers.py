from rest_framework import serializers
from .models import LearningPath, PathStep, Resource, Tag
from users.serializers import UserSerializer

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']

class ResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = ['id', 'title', 'resource_type', 'url']

class PathStepSerializer(serializers.ModelSerializer):
    # This nests resources inside the step JSON
    resources = ResourceSerializer(many=True, read_only=True)
    
    class Meta:
        model = PathStep
        fields = ['id', 'title', 'description', 'position', 'resources']

class LearningPathListSerializer(serializers.ModelSerializer):
    """
    Lightweight: For the 'Browse' cards. 
    Excludes steps/resources to load faster.
    """
    creator = UserSerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    
    class Meta:
        model = LearningPath
        fields = ['id', 'title', 'difficulty', 'creator', 'tags', 'created_at']

class LearningPathDetailSerializer(serializers.ModelSerializer):
    """
    Heavyweight: For the 'Start Learning' page. 
    Includes everything.
    """
    creator = UserSerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    steps = PathStepSerializer(many=True, read_only=True)
    
    class Meta:
        model = LearningPath
        fields = ['id', 'title', 'description', 'difficulty', 'creator', 'tags', 'steps', 'created_at']