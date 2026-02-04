from django.db import models
from django.conf import settings
from paths.models import LearningPath

class Notification(models.Model):
    TYPES = (
        ('comment', 'New Comment'),
        ('reply', 'New Reply'),
        ('review', 'New Review'),
        ('enrollment', 'New Join'),
        ('report', 'New Report'), # <--- ADD THIS LINE
    )

    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_notifications')
    
    notification_type = models.CharField(max_length=20, choices=TYPES)
    
    # Path is optional because a "User Report" might not be linked to a path
    path = models.ForeignKey(LearningPath, on_delete=models.CASCADE, null=True, blank=True)
    
    message = models.CharField(max_length=255)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification for {self.recipient}: {self.message}"