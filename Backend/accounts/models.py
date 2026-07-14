import random
import string

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        extra_fields.setdefault("is_active", True)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    username = None
    email = models.EmailField("email address", unique=True)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)

    is_2fa_enabled = models.BooleanField(
        default=False,
        help_text="Enable email-based 2FA for this user.",
    )
    otp_code = models.CharField(max_length=6, blank=True, null=True)
    otp_created_at = models.DateTimeField(blank=True, null=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    objects = UserManager()

    class Meta:
        db_table = "users"
        ordering = ["-date_joined"]

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    def generate_otp(self):

        self.otp_code = "".join(random.choices(string.digits, k=6))
        self.otp_created_at = timezone.now()
        self.save(update_fields=["otp_code", "otp_created_at"])
        return self.otp_code

    def verify_otp(self, code):

        if not self.otp_code or not self.otp_created_at:
            return False
        is_valid = (self.otp_code == code
                    and (timezone.now() - self.otp_created_at).total_seconds()
                    < 600)
        if is_valid:
            self.otp_code = None
            self.otp_created_at = None
            self.save(update_fields=["otp_code", "otp_created_at"])
        return is_valid


class SiteSettings(models.Model):
    enable_2fa = models.BooleanField(
        default=False,
        help_text=
        "Master switch: enable email-based 2FA for all users globally.",
    )

    class Meta:
        db_table = "site_settings"
        verbose_name = "Site Settings"
        verbose_name_plural = "Site Settings"

    def __str__(self):
        return "Site Settings"

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
