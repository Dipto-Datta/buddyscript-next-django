from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import SiteSettings, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    model = User
    list_display = ("email", "first_name", "last_name", "is_2fa_enabled",
                    "is_staff", "date_joined")
    list_filter = ("is_staff", "is_superuser", "is_active", "is_2fa_enabled")
    search_fields = ("email", "first_name", "last_name")
    ordering = ("-date_joined", )

    fieldsets = (
        (None, {
            "fields": ("email", "password")
        }),
        ("Personal Info", {
            "fields": ("first_name", "last_name", "avatar")
        }),
        ("2FA Settings", {
            "fields": ("is_2fa_enabled", )
        }),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        ("Important dates", {
            "fields": ("last_login", "date_joined")
        }),
    )

    add_fieldsets = ((
        None,
        {
            "classes": ("wide", ),
            "fields": (
                "email",
                "first_name",
                "last_name",
                "password1",
                "password2",
            ),
        },
    ), )


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    list_display = ("__str__", "enable_2fa")

    def has_add_permission(self, request):
        return not SiteSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False
