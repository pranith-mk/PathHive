from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Universal permission to check ownership across different models.
    """
    def has_object_permission(self, request, view, obj):
        # 1. Read-only methods (GET, HEAD, OPTIONS) are allowed for everyone
        if request.method in permissions.SAFE_METHODS:
            return True

        # 2. Write methods (POST, PUT, PATCH, DELETE) require ownership check:
        
        # Case A: It's a Review (Direct 'user' field)
        if hasattr(obj, 'user'):
            return obj.user == request.user

        # Case B: It's a Learning Path (Direct 'creator' field)
        if hasattr(obj, 'creator'):
            return obj.creator == request.user

        # Case C: It's a PathStep (Linked via 'path')
        if hasattr(obj, 'path'):
            # Traverse: Step -> Path -> Creator
            return obj.path.creator == request.user

        # Case D: It's a Resource (Linked via 'step')
        if hasattr(obj, 'step'):
            # Traverse: Resource -> Step -> Path -> Creator
            return obj.step.path.creator == request.user

        # Default: If we can't find an owner, deny access
        print(f"DEBUG: Permission denied for {obj} - No owner field found.")
        return False