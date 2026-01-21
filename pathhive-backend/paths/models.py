from django.db import models
from users.models import UserAccount
import uuid

# Source: 15 (TAG table)
class Tag(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

# Source: 4 (LEARNING_PATH table)
class LearningPath(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    creator = models.ForeignKey(UserAccount, on_delete=models.CASCADE, related_name='created_paths')
    difficulty = models.CharField(max_length=50, null=True, blank=True)
    is_published = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)
    allow_comments = models.BooleanField(default=True)
    # Source: 12 (PATH_TAG junction is handled automatically by ManyToManyField)
    tags = models.ManyToManyField(Tag, related_name='paths', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.title

# Source: 6 (PATH_STEP table)
class PathStep(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    path = models.ForeignKey(LearningPath, on_delete=models.CASCADE, related_name='steps')
    title = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    position = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['path', 'position'], name='unique_path_step_position')
        ]
        ordering = ['position']

    def __str__(self):
        return f"{self.position}. {self.title}"

# Source: 9 (RESOURCE table)
class Resource(models.Model):
    RESOURCE_TYPES = [('video', 'Video'), ('article', 'Article'), ('doc', 'Documentation')]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    step = models.ForeignKey(PathStep, on_delete=models.CASCADE, related_name='resources')
    resource_type = models.CharField(max_length=50, choices=RESOURCE_TYPES)
    title = models.CharField(max_length=255)
    url = models.URLField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title