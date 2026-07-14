from django.contrib import admin
from .models import Comment, Like, Post


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ("id", "author", "visibility", "short_content",
                    "like_count", "comment_count", "created_at")
    list_filter = ("visibility", "created_at")
    search_fields = ("content", "author__email", "author__first_name")
    raw_id_fields = ("author", )
    ordering = ("-created_at", )

    def short_content(self, obj):
        return obj.content[:80] if obj.content else "(no text)"

    short_content.short_description = "Content"


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("id", "author", "post", "parent", "short_content",
                    "like_count", "created_at")
    list_filter = ("created_at", )
    search_fields = ("content", "author__email")
    raw_id_fields = ("author", "post", "parent")

    def short_content(self, obj):
        return obj.content[:80]

    short_content.short_description = "Content"


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "content_type", "object_id", "created_at")
    list_filter = ("content_type", )
    raw_id_fields = ("user", )
