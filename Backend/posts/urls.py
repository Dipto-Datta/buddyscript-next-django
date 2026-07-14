from django.urls import path

from . import views

urlpatterns = [
    path("posts/", views.PostListCreateView.as_view(),
         name="post-list-create"),
    path("posts/<int:pk>/", views.PostDetailView.as_view(),
         name="post-detail"),
    path("posts/<int:pk>/like/",
         views.PostLikeToggleView.as_view(),
         name="post-like"),
    path("posts/<int:pk>/likes/",
         views.PostLikersView.as_view(),
         name="post-likers"),
    path(
        "posts/<int:post_id>/comments/",
        views.CommentListCreateView.as_view(),
        name="comment-list-create",
    ),
    path(
        "comments/<int:pk>/reply/",
        views.CommentReplyView.as_view(),
        name="comment-reply",
    ),
    path(
        "comments/<int:pk>/like/",
        views.CommentLikeToggleView.as_view(),
        name="comment-like",
    ),
    path(
        "comments/<int:pk>/likes/",
        views.CommentLikersView.as_view(),
        name="comment-likers",
    ),
    path("notifications/",
         views.NotificationListView.as_view(),
         name="notification-list"),
    path("notifications/unread-count/",
         views.NotificationUnreadCountView.as_view(),
         name="notification-unread-count"),
    path("notifications/<int:pk>/read/",
         views.NotificationReadView.as_view(),
         name="notification-read"),
    path("notifications/read-all/",
         views.NotificationMarkAllReadView.as_view(),
         name="notification-read-all"),
]
