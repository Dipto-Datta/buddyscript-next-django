"""
Models for posts, comments, and likes.
"""

from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation
from django.contrib.contenttypes.models import ContentType
from django.db import models


class Like(models.Model):

    class ReactionType(models.TextChoices):
        LIKE = "Like", "Like"
        LOVE = "Love", "Love"
        ANGRY = "Angry", "Angry"
        HAHA = "Haha", "Haha"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="likes",
    )
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey("content_type", "object_id")
    reaction_type = models.CharField(
        max_length=10,
        choices=ReactionType.choices,
        default=ReactionType.LIKE,
        db_index=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "likes"
        unique_together = ("user", "content_type", "object_id")
        indexes = [
            models.Index(fields=["content_type", "object_id"]),
            models.Index(
                fields=["content_type", "object_id", "reaction_type"]),
        ]

    def __str__(self):
        return f"{self.user} reacted {self.reaction_type} on {self.content_type.model} #{self.object_id}"


class Post(models.Model):

    class Visibility(models.TextChoices):
        PUBLIC = "public", "Public"
        PRIVATE = "private", "Private"

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="posts",
    )
    content = models.TextField(blank=True)
    image = models.ImageField(upload_to="posts/%Y/%m/", blank=True, null=True)
    visibility = models.CharField(
        max_length=10,
        choices=Visibility.choices,
        default=Visibility.PUBLIC,
        db_index=True,
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    like_count = models.PositiveIntegerField(default=0, db_index=True)
    comment_count = models.PositiveIntegerField(default=0, db_index=True)

    likes = GenericRelation(Like)

    class Meta:
        db_table = "posts"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["author", "-created_at"]),
            models.Index(fields=["visibility", "-created_at"]),
        ]

    def __str__(self):
        preview = self.content[:50] if self.content else "(no text)"
        return f"Post by {self.author} — {preview}"


class Comment(models.Model):
    post = models.ForeignKey(Post,
                             on_delete=models.CASCADE,
                             related_name="comments")
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="comments",
    )
    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="replies",
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    like_count = models.PositiveIntegerField(default=0, db_index=True)

    likes = GenericRelation(Like)

    class Meta:
        db_table = "comments"
        ordering = ["created_at"]
        indexes = [
            models.Index(fields=["post", "created_at"]),
            models.Index(fields=["parent"]),
        ]

    def __str__(self):
        preview = self.content[:50]
        return f"Comment by {self.author}: {preview}"


class Notification(models.Model):

    class NotificationType(models.TextChoices):
        POST_CREATED = "post_created", "Post Created"
        POST_REACTED = "post_reacted", "Post Reacted"
        COMMENT_CREATED = "comment_created", "Comment Created"
        COMMENT_REACTED = "comment_reacted", "Comment Reacted"
        REPLY_CREATED = "reply_created", "Reply Created"

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
        db_index=True,
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_notifications",
        null=True,
        blank=True,
    )
    notification_type = models.CharField(
        max_length=20,
        choices=NotificationType.choices,
        db_index=True,
    )

    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    object_id = models.PositiveIntegerField(null=True, blank=True)
    content_object = GenericForeignKey("content_type", "object_id")

    text = models.TextField()
    is_read = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = "notifications"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["recipient", "-created_at"]),
            models.Index(fields=["recipient", "is_read"]),
        ]

    def __str__(self):
        return f"Notification for {self.recipient}: {self.text}"


# ───────────────────────────── Database Signals ─────────────────────────────
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import F


@receiver(post_save, sender=Like)
def increment_like_counter(sender, instance, created, **kwargs):
    if created:
        model_class = instance.content_type.model_class()
        if model_class == Post:
            Post.objects.filter(id=instance.object_id).update(
                like_count=F("like_count") + 1)
        elif model_class == Comment:
            Comment.objects.filter(id=instance.object_id).update(
                like_count=F("like_count") + 1)


@receiver(post_delete, sender=Like)
def decrement_like_counter(sender, instance, **kwargs):
    model_class = instance.content_type.model_class()
    if model_class == Post:

        Post.objects.filter(
            id=instance.object_id,
            like_count__gt=0).update(like_count=F("like_count") - 1)
    elif model_class == Comment:

        Comment.objects.filter(
            id=instance.object_id,
            like_count__gt=0).update(like_count=F("like_count") - 1)


@receiver(post_save, sender=Comment)
def increment_comment_counter(sender, instance, created, **kwargs):
    if created:
        Post.objects.filter(id=instance.post_id).update(
            comment_count=F("comment_count") + 1)


@receiver(post_delete, sender=Comment)
def decrement_comment_counter(sender, instance, **kwargs):
    Post.objects.filter(
        id=instance.post_id,
        comment_count__gt=0).update(comment_count=F("comment_count") - 1)
