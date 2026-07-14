from django.contrib.contenttypes.models import ContentType
from rest_framework import serializers

from accounts.serializers import UserSerializer

from .models import Comment, Like, Post, Notification

from django.db.models import Count


def get_instances_to_cache(serializer, obj, model_class):
    if serializer.parent and hasattr(serializer.parent, "instance"):
        instances = serializer.parent.instance
        if isinstance(instances, (list, tuple)):
            return [x for x in instances if isinstance(x, model_class)]
        if hasattr(instances, "all"):
            try:
                return [
                    x for x in list(instances) if isinstance(x, model_class)
                ]
            except Exception:
                pass
    return [obj]


def populate_likes_cache(context, serializer, obj, model_class):
    cache_key = f"likes_cache_{model_class.__name__}"
    if cache_key not in context:
        context[cache_key] = {}

    cache = context[cache_key]

    if obj.id in cache:
        return cache[obj.id]

    instances = get_instances_to_cache(serializer, obj, model_class)
    object_ids = [inst.id for inst in instances if inst.id not in cache]

    if object_ids:
        ct = ContentType.objects.get_for_model(model_class)
        likes = Like.objects.filter(
            content_type=ct, object_id__in=object_ids).select_related("user")

        for oid in object_ids:
            cache[oid] = {
                "like_count": 0,
                "reaction_counts": {},
                "user_reactions": {},
            }

        for like in likes:
            entry = cache[like.object_id]
            entry["like_count"] += 1
            r_type = like.reaction_type
            entry["reaction_counts"][r_type] = entry["reaction_counts"].get(
                r_type, 0) + 1
            entry["user_reactions"][like.user_id] = r_type

    if obj.id not in cache:
        cache[obj.id] = {
            "like_count": 0,
            "reaction_counts": {},
            "user_reactions": {},
        }

    return cache[obj.id]


def populate_comments_count_cache(context, serializer, obj):
    cache_key = "post_comments_count_cache"
    if cache_key not in context:
        context[cache_key] = {}

    cache = context[cache_key]

    if obj.id in cache:
        return cache[obj.id]

    instances = get_instances_to_cache(serializer, obj, Post)
    object_ids = [inst.id for inst in instances if inst.id not in cache]

    if object_ids:
        for oid in object_ids:
            cache[oid] = 0

        counts_qs = Comment.objects.filter(
            post_id__in=object_ids).values("post_id").annotate(
                count=Count("id"))
        for item in counts_qs:
            cache[item["post_id"]] = item["count"]

    return cache.get(obj.id, 0)


# ───────────────────────────── Like ─────────────────────────────


class LikeUserSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField(source="user.id")
    first_name = serializers.ReadOnlyField(source="user.first_name")
    last_name = serializers.ReadOnlyField(source="user.last_name")
    full_name = serializers.ReadOnlyField(source="user.full_name")
    email = serializers.ReadOnlyField(source="user.email")
    avatar = serializers.ImageField(source="user.avatar", read_only=True)

    class Meta:
        model = Like
        fields = [
            "id",
            "first_name",
            "last_name",
            "full_name",
            "email",
            "avatar",
            "reaction_type",
        ]


# ───────────────────────────── Comment ─────────────────────────────


class ReplySerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    is_liked = serializers.SerializerMethodField()
    user_reaction = serializers.SerializerMethodField()
    reaction_counts = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            "id",
            "author",
            "content",
            "like_count",
            "is_liked",
            "user_reaction",
            "reaction_counts",
            "created_at",
        ]

    def get_is_liked(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        cache = populate_likes_cache(self.context, self, obj, Comment)
        return request.user.id in cache["user_reactions"]

    def get_user_reaction(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return None
        cache = populate_likes_cache(self.context, self, obj, Comment)
        return cache["user_reactions"].get(request.user.id)

    def get_reaction_counts(self, obj):
        cache = populate_likes_cache(self.context, self, obj, Comment)
        return cache["reaction_counts"]


class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    replies = ReplySerializer(many=True, read_only=True)
    is_liked = serializers.SerializerMethodField()
    user_reaction = serializers.SerializerMethodField()
    reaction_counts = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            "id",
            "author",
            "content",
            "parent",
            "replies",
            "like_count",
            "is_liked",
            "user_reaction",
            "reaction_counts",
            "created_at",
        ]
        read_only_fields = ["author", "replies"]

    def get_is_liked(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        cache = populate_likes_cache(self.context, self, obj, Comment)
        return request.user.id in cache["user_reactions"]

    def get_user_reaction(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return None
        cache = populate_likes_cache(self.context, self, obj, Comment)
        return cache["user_reactions"].get(request.user.id)

    def get_reaction_counts(self, obj):
        cache = populate_likes_cache(self.context, self, obj, Comment)
        return cache["reaction_counts"]


class CommentCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Comment
        fields = ["id", "content", "parent"]


# ───────────────────────────── Post ─────────────────────────────


class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    is_liked = serializers.SerializerMethodField()
    user_reaction = serializers.SerializerMethodField()
    reaction_counts = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            "id",
            "author",
            "content",
            "image",
            "visibility",
            "like_count",
            "comment_count",
            "is_liked",
            "user_reaction",
            "reaction_counts",
            "created_at",
            "updated_at",
        ]

    def get_is_liked(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        cache = populate_likes_cache(self.context, self, obj, Post)
        return request.user.id in cache["user_reactions"]

    def get_user_reaction(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return None
        cache = populate_likes_cache(self.context, self, obj, Post)
        return cache["user_reactions"].get(request.user.id)

    def get_reaction_counts(self, obj):
        cache = populate_likes_cache(self.context, self, obj, Post)
        return cache["reaction_counts"]


class PostCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Post
        fields = ["id", "content", "image", "visibility"]


class NotificationSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)

    class Meta:
        model = Notification
        fields = [
            "id",
            "recipient",
            "sender",
            "notification_type",
            "object_id",
            "text",
            "is_read",
            "created_at",
        ]
