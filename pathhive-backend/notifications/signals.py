from django.db.models.signals import post_save
from django.dispatch import receiver
from paths.models import Comment, Review, Enrollment, Report, LearningPath 
from django.contrib.auth import get_user_model
from .models import Notification

User = get_user_model()

# 1. Notify Creator when someone JOINS (Enrolls)
@receiver(post_save, sender=Enrollment)
def notify_on_join(sender, instance, created, **kwargs):
    if created:
        # FIX: Model uses 'learning_path', not 'path'
        path_instance = instance.learning_path 
        student = instance.student
        
        # Don't notify if creator joins their own path
        if path_instance.creator != student:
            Notification.objects.create(
                recipient=path_instance.creator,
                sender=student,
                notification_type='enrollment',
                path=path_instance, # The Notification model field is still 'path'
                message=f"{student.username} joined your path: {path_instance.title}"
            )

# 2. Notify Creator on Review
@receiver(post_save, sender=Review)
def notify_on_review(sender, instance, created, **kwargs):
    if created:
        # Review model DOES use 'path', so this is fine
        path_instance = instance.path
        reviewer = instance.user
        
        if path_instance.creator != reviewer:
            Notification.objects.create(
                recipient=path_instance.creator,
                sender=reviewer,
                notification_type='review',
                path=path_instance,
                message=f"{reviewer.username} left a {instance.rating}-star review on {path_instance.title}"
            )

# 3. Notify on Comment
@receiver(post_save, sender=Comment)
def notify_on_comment(sender, instance, created, **kwargs):
    if created:
        # FIX: Comment model uses 'learning_path', not 'path'
        path_instance = instance.learning_path 
        author = instance.user
        
        # Case A: Reply to a comment (Notify the parent comment author)
        if instance.parent:
            parent_author = instance.parent.user
            if parent_author != author:
                Notification.objects.create(
                    recipient=parent_author,
                    sender=author,
                    notification_type='reply',
                    path=path_instance,
                    message=f"{author.username} replied to your comment on {path_instance.title}"
                )
        
        # Case B: Top-level comment (Notify the Path Creator)
        else:
            if path_instance.creator != author:
                 Notification.objects.create(
                    recipient=path_instance.creator,
                    sender=author,
                    notification_type='comment',
                    path=path_instance,
                    message=f"{author.username} commented on {path_instance.title}"
                )

# 4.  Notify Admins & Creators on Report
@receiver(post_save, sender=Report)
def notify_on_report(sender, instance, created, **kwargs):
    if created:
        reporter = instance.reporter
        
        # --- A. NOTIFY ADMINS (Always) ---
        # Find all users with is_superuser=True
        admins = User.objects.filter(is_admin=True)
        
        for admin in admins:
            # Don't notify admin if they reported it themselves (edge case)
            if admin != reporter:
                Notification.objects.create(
                    recipient=admin,
                    sender=reporter,
                    notification_type='report',
                    # We leave path empty for generic reports, or fill it if available below
                    message=f"New Report: {instance.report_type.title()} reported by {reporter.username}"
                )

        # --- B. NOTIFY PATH CREATOR (Context Dependent) ---
        
        path_context = None
        creator_to_notify = None
        
        # Case 1: A Path was reported
        if instance.report_type == 'path':
            try:
                path_context = LearningPath.objects.get(id=instance.target_id)
                creator_to_notify = path_context.creator
            except LearningPath.DoesNotExist:
                pass # Path might have been deleted

        # Case 2: A Comment was reported (Notify the Path Creator too)
        elif instance.report_type == 'comment':
            try:
                comment = Comment.objects.get(id=instance.target_id)
                path_context = comment.learning_path
                creator_to_notify = path_context.creator
            except Comment.DoesNotExist:
                pass

        # Create the notification if we found a relevant creator
        if creator_to_notify and creator_to_notify != reporter:
            Notification.objects.create(
                recipient=creator_to_notify,
                sender=reporter,
                notification_type='report',
                path=path_context,
                message=f"Alert: A {instance.report_type} in '{path_context.title}' was reported."
            )