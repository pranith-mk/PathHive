from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import UserAccount

class UserAccountAdmin(BaseUserAdmin):
    # The fields to display in the list view (columns)
    list_display = ('email', 'username', 'full_name', 'role', 'is_admin', 'is_active', 'created_at')
    
    # Fields to search when using the search bar
    search_fields = ('email', 'username', 'full_name')
    
    # Filters on the right sidebar
    list_filter = ('is_admin', 'is_active', 'role')

    # The layout of the "Edit User" page
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('username', 'full_name', 'bio', 'avatar')}),
        ('Permissions', {'fields': ('is_active', 'is_admin', 'role')}),
        ('Important dates', {'fields': ('created_at', 'updated_at')}),
    )

    # Fields that should be read-only
    readonly_fields = ('created_at', 'updated_at', 'id')

    # Since we use email as the username, we need to order by email
    ordering = ('email',)
    
    # These are required for custom user models to avoid errors with the default UserAdmin
    filter_horizontal = ()

# Register the model with the custom admin class
admin.site.register(UserAccount, UserAccountAdmin)