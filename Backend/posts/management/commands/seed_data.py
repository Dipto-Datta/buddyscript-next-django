import random
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from posts.models import Post, Comment, Like
from django.contrib.auth.hashers import make_password
from django.utils import timezone

User = get_user_model()


class Command(BaseCommand):
    help = "Seeds the database with 5k users and 50k posts, comments, and reactions."

    def handle(self, *args, **options):
        self.stdout.write("Starting database seeding...")

        self.stdout.write("Generating 5k users...")
        hashed_password = make_password("Password123!")

        users_to_create = []
        for i in range(1, 5001):
            users_to_create.append(
                User(
                    email=f"user_{i}@example.com",
                    first_name=f"First_{i}",
                    last_name=f"Last_{i}",
                    password=hashed_password,
                    is_active=True,
                ))

        User.objects.bulk_create(users_to_create, batch_size=1000)
        self.stdout.write("5k users created successfully.")

        user_ids = list(User.objects.values_list("id", flat=True))

        self.stdout.write("Generating 50k posts...")
        posts_to_create = []
        now = timezone.now()

        for i in range(1, 50001):
            author_id = random.choice(user_ids)
            visibility = random.choice([
                Post.Visibility.PUBLIC, Post.Visibility.PUBLIC,
                Post.Visibility.PRIVATE
            ])
            posts_to_create.append(
                Post(
                    author_id=author_id,
                    content=
                    f"This is mock post number {i} containing some sample text content.",
                    visibility=visibility,
                    created_at=now - timezone.timedelta(minutes=i * 2),
                ))

        Post.objects.bulk_create(posts_to_create, batch_size=5000)
        self.stdout.write("50k posts created successfully.")

        post_ids = list(Post.objects.values_list("id", flat=True))

        self.stdout.write("Generating comments...")
        comments_to_create = []
        for i in range(1, 20001):
            post_id = random.choice(post_ids)
            author_id = random.choice(user_ids)
            comments_to_create.append(
                Comment(
                    post_id=post_id,
                    author_id=author_id,
                    content=
                    f"This is a sample comment response {i} on this post.",
                    created_at=now -
                    timezone.timedelta(minutes=random.randint(1, 10000)),
                ))

        Comment.objects.bulk_create(comments_to_create, batch_size=5000)
        self.stdout.write("Comments created successfully.")

        comment_ids = list(Comment.objects.values_list("id", flat=True))

        self.stdout.write("Generating reactions...")
        likes_to_create = []
        post_ct = ContentType.objects.get_for_model(Post)
        comment_ct = ContentType.objects.get_for_model(Comment)

        reactions_tracker = set()

        attempts = 0
        while len(likes_to_create) < 40000 and attempts < 100000:
            attempts += 1
            uid = random.choice(user_ids)
            pid = random.choice(post_ids)
            key = (uid, post_ct.id, pid)
            if key not in reactions_tracker:
                reactions_tracker.add(key)
                likes_to_create.append(
                    Like(
                        user_id=uid,
                        content_type=post_ct,
                        object_id=pid,
                        reaction_type=random.choice(Like.ReactionType.values),
                    ))

        attempts = 0
        while len(likes_to_create) < 60000 and attempts < 100000:
            attempts += 1
            uid = random.choice(user_ids)
            cid = random.choice(comment_ids)
            key = (uid, comment_ct.id, cid)
            if key not in reactions_tracker:
                reactions_tracker.add(key)
                likes_to_create.append(
                    Like(
                        user_id=uid,
                        content_type=comment_ct,
                        object_id=cid,
                        reaction_type=random.choice(Like.ReactionType.values),
                    ))

        Like.objects.bulk_create(likes_to_create, batch_size=5000)
        self.stdout.write("Reactions created successfully.")

        self.stdout.write("Updating denormalized counter columns...")

        self.stdout.write("Computing Post like counts...")
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute(
                """
                UPDATE posts 
                SET like_count = (
                    SELECT COUNT(*) 
                    FROM likes 
                    WHERE likes.content_type_id = %s AND likes.object_id = posts.id
                )
            """, [post_ct.id])

            self.stdout.write("Computing Post comment counts...")
            cursor.execute("""
                UPDATE posts 
                SET comment_count = (
                    SELECT COUNT(*) 
                    FROM comments 
                    WHERE comments.post_id = posts.id
                )
            """)

            self.stdout.write("Computing Comment like counts...")
            cursor.execute(
                """
                UPDATE comments 
                SET like_count = (
                    SELECT COUNT(*) 
                    FROM likes 
                    WHERE likes.content_type_id = %s AND likes.object_id = comments.id
                )
            """, [comment_ct.id])

        self.stdout.write("Database seeding complete!")
