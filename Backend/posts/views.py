"""
Views for posts, comments, and likes.
"""

from django.contrib.contenttypes.models import ContentType
from django.db.models import Q
from rest_framework import generics, permissions, status
from rest_framework.pagination import CursorPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Comment, Like, Post, Notification
from .serializers import (
    CommentCreateSerializer,
    CommentSerializer,
    LikeUserSerializer,
    PostCreateSerializer,
    PostSerializer,
    NotificationSerializer,
)

# ───────────────────────────── Permissions ─────────────────────────────


class IsAuthorOrReadOnly(permissions.BasePermission):

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.author == request.user


# ───────────────────────────── Pagination ─────────────────────────────


class PostCursorPagination(CursorPagination):
    page_size = 20
    ordering = "-created_at"
    cursor_query_param = "cursor"


class CommentCursorPagination(CursorPagination):
    page_size = 20
    ordering = "created_at"
    cursor_query_param = "cursor"


# ───────────────────────────── Post Views ─────────────────────────────

from django.core.cache import cache


class PostListCreateView(generics.ListCreateAPIView):
    pagination_class = PostCursorPagination

    def get_serializer_class(self):
        if self.request.method == "POST":
            return PostCreateSerializer
        return PostSerializer

    def get_queryset(self):
        user = self.request.user
        return (Post.objects.select_related("author").filter(
            Q(visibility=Post.Visibility.PUBLIC)
            | Q(author=user)).order_by("-created_at"))

    def list(self, request, *args, **kwargs):
        user = request.user
        cursor = request.query_params.get("cursor", "none")
        cache_key = f"user_feed_{user.id}_cursor_{cursor}"

        cached_data = cache.get(cache_key)
        if cached_data is not None:
            return Response(cached_data)

        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            response_data = self.get_paginated_response(serializer.data).data
            cache.set(cache_key, response_data, timeout=30)
            return Response(response_data)

        serializer = self.get_serializer(queryset, many=True)
        response_data = serializer.data
        cache.set(cache_key, response_data, timeout=30)
        return Response(response_data)

    def perform_create(self, serializer):
        post = serializer.save(author=self.request.user)
        cache.delete(f"user_feed_{self.request.user.id}_cursor_none")
        Notification.objects.create(
            recipient=self.request.user,
            sender=self.request.user,
            notification_type=Notification.NotificationType.POST_CREATED,
            content_object=post,
            text="Your post has been published successfully.")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        post = Post.objects.select_related("author").get(
            pk=serializer.instance.pk)
        return Response(
            PostSerializer(post, context={
                "request": request
            }).data,
            status=status.HTTP_201_CREATED,
        )


class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated, IsAuthorOrReadOnly]
    queryset = Post.objects.select_related("author")

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return PostCreateSerializer
        return PostSerializer


# ───────────────────────────── Like Views ─────────────────────────────


class PostLikeToggleView(APIView):

    def post(self, request, pk):
        try:
            post = Post.objects.get(pk=pk)
        except Post.DoesNotExist:
            return Response({"detail": "Post not found."},
                            status=status.HTTP_404_NOT_FOUND)

        reaction_type = request.data.get("reaction_type",
                                         Like.ReactionType.LIKE)
        if reaction_type not in Like.ReactionType.values:
            return Response({"detail": "Invalid reaction type."},
                            status=status.HTTP_400_BAD_REQUEST)

        ct = ContentType.objects.get_for_model(Post)

        try:
            like = Like.objects.get(user=request.user,
                                    content_type=ct,
                                    object_id=post.id)
            if like.reaction_type == reaction_type:
                like.delete()
                user_reaction = None
                created = False
            else:
                like.reaction_type = reaction_type
                like.save()
                user_reaction = reaction_type
                created = False
        except Like.DoesNotExist:
            like = Like.objects.create(user=request.user,
                                       content_type=ct,
                                       object_id=post.id,
                                       reaction_type=reaction_type)
            user_reaction = reaction_type
            created = True

        if user_reaction is not None and post.author != request.user:
            Notification.objects.update_or_create(
                recipient=post.author,
                sender=request.user,
                notification_type=Notification.NotificationType.POST_REACTED,
                content_type=ct,
                object_id=post.id,
                defaults={
                    "text": f"{request.user.full_name} reacted to your post.",
                    "is_read": False,
                })

        reaction_counts = {}
        likes_qs = Like.objects.filter(content_type=ct, object_id=post.id)
        from django.db.models import Count
        qs = likes_qs.values("reaction_type").annotate(count=Count("id"))
        for item in qs:
            reaction_counts[item["reaction_type"]] = item["count"]

        return Response(
            {
                "liked": user_reaction is not None,
                "user_reaction": user_reaction,
                "like_count": likes_qs.count(),
                "reaction_counts": reaction_counts
            },
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class PostLikersView(generics.ListAPIView):
    serializer_class = LikeUserSerializer

    def get_queryset(self):
        ct = ContentType.objects.get_for_model(Post)
        return Like.objects.filter(content_type=ct,
                                   object_id=self.kwargs["pk"]).select_related(
                                       "user").order_by("-created_at")


# ───────────────────────────── Comment Views ─────────────────────────────


class CommentListCreateView(generics.ListCreateAPIView):
    pagination_class = CommentCursorPagination

    def get_serializer_class(self):
        if self.request.method == "POST":
            return CommentCreateSerializer
        return CommentSerializer

    def get_queryset(self):
        return (Comment.objects.select_related("author").prefetch_related(
            "replies", "replies__author").filter(
                post_id=self.kwargs["post_id"],
                parent__isnull=True).order_by("created_at"))

    def perform_create(self, serializer):
        comment = serializer.save(author=self.request.user,
                                  post_id=self.kwargs["post_id"])
        post = comment.post
        if post.author != self.request.user:
            Notification.objects.create(
                recipient=post.author,
                sender=self.request.user,
                notification_type=Notification.NotificationType.
                COMMENT_CREATED,
                content_object=comment,
                text=f"{self.request.user.full_name} commented on your post.")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        comment = (Comment.objects.select_related("author").prefetch_related(
            "replies", "replies__author").get(pk=serializer.instance.pk))
        return Response(
            CommentSerializer(comment, context={
                "request": request
            }).data,
            status=status.HTTP_201_CREATED,
        )


class CommentReplyView(APIView):

    def post(self, request, pk):
        try:
            parent_comment = Comment.objects.get(pk=pk)
        except Comment.DoesNotExist:
            return Response({"detail": "Comment not found."},
                            status=status.HTTP_404_NOT_FOUND)

        serializer = CommentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reply = serializer.save(
            author=request.user,
            post=parent_comment.post,
            parent=parent_comment,
        )
        if parent_comment.author != request.user:
            Notification.objects.create(
                recipient=parent_comment.author,
                sender=request.user,
                notification_type=Notification.NotificationType.REPLY_CREATED,
                content_object=reply,
                text=f"{request.user.full_name} replied to your comment.")
        return Response(
            CommentSerializer(reply, context={
                "request": request
            }).data,
            status=status.HTTP_201_CREATED,
        )


class CommentLikeToggleView(APIView):

    def post(self, request, pk):
        try:
            comment = Comment.objects.get(pk=pk)
        except Comment.DoesNotExist:
            return Response({"detail": "Comment not found."},
                            status=status.HTTP_404_NOT_FOUND)

        reaction_type = request.data.get("reaction_type",
                                         Like.ReactionType.LIKE)
        if reaction_type not in Like.ReactionType.values:
            return Response({"detail": "Invalid reaction type."},
                            status=status.HTTP_400_BAD_REQUEST)

        ct = ContentType.objects.get_for_model(Comment)

        try:
            like = Like.objects.get(user=request.user,
                                    content_type=ct,
                                    object_id=comment.id)
            if like.reaction_type == reaction_type:
                like.delete()
                user_reaction = None
                created = False
            else:
                like.reaction_type = reaction_type
                like.save()
                user_reaction = reaction_type
                created = False
        except Like.DoesNotExist:
            like = Like.objects.create(user=request.user,
                                       content_type=ct,
                                       object_id=comment.id,
                                       reaction_type=reaction_type)
            user_reaction = reaction_type
            created = True

        if user_reaction is not None and comment.author != request.user:
            Notification.objects.update_or_create(
                recipient=comment.author,
                sender=request.user,
                notification_type=Notification.NotificationType.
                COMMENT_REACTED,
                content_type=ct,
                object_id=comment.id,
                defaults={
                    "text":
                    f"{request.user.full_name} reacted to your comment.",
                    "is_read": False,
                })
        reaction_counts = {}
        likes_qs = Like.objects.filter(content_type=ct, object_id=comment.id)
        from django.db.models import Count
        qs = likes_qs.values("reaction_type").annotate(count=Count("id"))
        for item in qs:
            reaction_counts[item["reaction_type"]] = item["count"]

        return Response(
            {
                "liked": user_reaction is not None,
                "user_reaction": user_reaction,
                "like_count": likes_qs.count(),
                "reaction_counts": reaction_counts
            },
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class CommentLikersView(generics.ListAPIView):
    serializer_class = LikeUserSerializer

    def get_queryset(self):
        ct = ContentType.objects.get_for_model(Comment)
        return Like.objects.filter(content_type=ct,
                                   object_id=self.kwargs["pk"]).select_related(
                                       "user").order_by("-created_at")


# ───────────────────────────── Notification Views ─────────────────────────────


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(
            recipient=self.request.user).select_related("sender")


class NotificationUnreadCountView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        count = Notification.objects.filter(recipient=request.user,
                                            is_read=False).count()
        return Response({"unread_count": count}, status=status.HTTP_200_OK)


class NotificationReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            notification = Notification.objects.get(pk=pk,
                                                    recipient=request.user)
        except Notification.DoesNotExist:
            return Response({"detail": "Notification not found."},
                            status=status.HTTP_404_NOT_FOUND)

        notification.is_read = True
        notification.save()
        return Response({"success": True}, status=status.HTTP_200_OK)


class NotificationMarkAllReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        Notification.objects.filter(recipient=request.user,
                                    is_read=False).update(is_read=True)
        return Response({"success": True}, status=status.HTTP_200_OK)
