from django.db import models
from users.models import UserAccount
from django.conf import settings
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

class Enrollment(models.Model):
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='enrollments')
    learning_path = models.ForeignKey(LearningPath, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)

    completed_steps = models.ManyToManyField(PathStep, blank=True, related_name='completed_by')

    class Meta:
        unique_together = ('student', 'learning_path') # A user can't enroll twice in the same path

    def __str__(self):
        return f"{self.student.username} enrolled in {self.learning_path.title}"

class Comment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    learning_path = models.ForeignKey(LearningPath, on_delete=models.CASCADE, related_name='comments')
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    #  Link to parent comment (Self-referential)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies')

    class Meta:
        ordering = ['-created_at'] 

    def __str__(self):
        return f"Comment by {self.user.username} on {self.learning_path.title}"