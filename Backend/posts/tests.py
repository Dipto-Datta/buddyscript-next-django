from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from posts.models import Post, Comment, Like
from django.contrib.contenttypes.models import ContentType

User = get_user_model()


class PostInteractionTests(APITestCase):

    def setUp(self):
        self.user1 = User.objects.create_user(email="user1@example.com",
                                              password="password123",
                                              first_name="User",
                                              last_name="One")
        self.user2 = User.objects.create_user(email="user2@example.com",
                                              password="password123",
                                              first_name="User",
                                              last_name="Two")

        login_url = reverse("auth-login")
        response = self.client.post(login_url, {
            "email": "user1@example.com",
            "password": "password123"
        },
                                    format="json")
        self.user1_token = response.data["tokens"]["access"]

        self.client_user2 = self.client_class()
        response_user2 = self.client_user2.post(login_url, {
            "email": "user2@example.com",
            "password": "password123"
        },
                                                format="json")
        self.user2_token = response_user2.data["tokens"]["access"]

        self.post_list_url = reverse("post-list-create")

        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {self.user1_token}")
        self.client_user2.credentials(
            HTTP_AUTHORIZATION=f"Bearer {self.user2_token}")

    def test_create_and_list_posts(self):
        response = self.client.post(self.post_list_url, {
            "content": "Public post content",
            "visibility": "public"
        },
                                    format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["content"], "Public post content")

        response_private = self.client.post(self.post_list_url, {
            "content": "Private post content",
            "visibility": "private"
        },
                                            format="json")
        self.assertEqual(response_private.status_code, status.HTTP_201_CREATED)

        response_list1 = self.client.get(self.post_list_url)
        self.assertEqual(response_list1.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response_list1.data["results"]), 2)

        response_list2 = self.client_user2.get(self.post_list_url)
        self.assertEqual(response_list2.status_code, status.HTTP_200_OK)

        self.assertEqual(len(response_list2.data["results"]), 1)
        self.assertEqual(response_list2.data["results"][0]["content"],
                         "Public post content")

    def test_post_like_unlike(self):
        post = Post.objects.create(author=self.user1,
                                   content="Test post",
                                   visibility="public")
        like_url = reverse("post-like", kwargs={"pk": post.id})

        response = self.client_user2.post(like_url)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["liked"])
        self.assertEqual(response.data["like_count"], 1)

        likers_url = reverse("post-likers", kwargs={"pk": post.id})
        likers_response = self.client.get(likers_url)
        self.assertEqual(likers_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(likers_response.data["results"]), 1)
        self.assertEqual(likers_response.data["results"][0]["email"],
                         "user2@example.com")
        response_unlike = self.client_user2.post(like_url)
        self.assertEqual(response_unlike.status_code, status.HTTP_200_OK)
        self.assertFalse(response_unlike.data["liked"])
        self.assertEqual(response_unlike.data["like_count"], 0)

    def test_comment_and_replies(self):

        post = Post.objects.create(author=self.user1,
                                   content="Test post",
                                   visibility="public")
        comments_url = reverse("comment-list-create",
                               kwargs={"post_id": post.id})

        comment_response = self.client_user2.post(
            comments_url, {"content": "This is a comment"}, format="json")
        self.assertEqual(comment_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(comment_response.data["content"], "This is a comment")
        comment_id = comment_response.data["id"]

        reply_url = reverse("comment-reply", kwargs={"pk": comment_id})
        reply_response = self.client.post(
            reply_url, {"content": "This is a reply to the comment"},
            format="json")
        self.assertEqual(reply_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(reply_response.data["content"],
                         "This is a reply to the comment")
        self.assertEqual(reply_response.data["parent"], comment_id)

        list_response = self.client.get(comments_url)
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)

        self.assertEqual(len(list_response.data["results"]), 1)
        self.assertEqual(
            list_response.data["results"][0]["replies"][0]["content"],
            "This is a reply to the comment")

    def test_comment_like_unlike(self):
        post = Post.objects.create(author=self.user1,
                                   content="Test post",
                                   visibility="public")
        comment = Comment.objects.create(post=post,
                                         author=self.user2,
                                         content="My comment")

        comment_like_url = reverse("comment-like", kwargs={"pk": comment.id})

        response = self.client.post(comment_like_url)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["liked"])

        comment_likers_url = reverse("comment-likers",
                                     kwargs={"pk": comment.id})
        likers_response = self.client.get(comment_likers_url)
        self.assertEqual(likers_response.status_code, status.HTTP_200_OK)
        self.assertEqual(likers_response.data["results"][0]["email"],
                         "user1@example.com")

        response_unlike = self.client.post(comment_like_url)
        self.assertEqual(response_unlike.status_code, status.HTTP_200_OK)
        self.assertFalse(response_unlike.data["liked"])
