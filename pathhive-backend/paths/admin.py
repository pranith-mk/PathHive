from django.contrib import admin
from .models import LearningPath, PathStep, Resource, Tag

# This allows you to add Resources directly inside a Step page
class ResourceInline(admin.StackedInline):
    model = Resource
    extra = 1

# This allows you to add Steps directly inside a Path page
class PathStepInline(admin.StackedInline):
    model = PathStep
    extra = 0
    show_change_link = True

class LearningPathAdmin(admin.ModelAdmin):
    inlines = [PathStepInline]
    list_display = ('title', 'creator', 'difficulty', 'is_published', 'created_at')
    list_filter = ('is_published', 'difficulty')
    search_fields = ('title', 'description')

class PathStepAdmin(admin.ModelAdmin):
    inlines = [ResourceInline]
    list_display = ('title', 'path', 'position')
    list_filter = ('path',)
    ordering = ('path', 'position')

admin.site.register(LearningPath, LearningPathAdmin)
admin.site.register(PathStep, PathStepAdmin)
admin.site.register(Resource)
admin.site.register(Tag)