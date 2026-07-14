"""
URL patterns for accounts app.
"""

from django.urls import path

from . import views

urlpatterns = [
    path("register/", views.RegisterView.as_view(), name="auth-register"),
    path("login/", views.LoginView.as_view(), name="auth-login"),
    path("verify-otp/", views.OTPVerifyView.as_view(), name="auth-verify-otp"),
    path("logout/", views.LogoutView.as_view(), name="auth-logout"),
    path("refresh/", views.CookieTokenRefreshView.as_view(), name="auth-token-refresh"),
    path("me/", views.MeView.as_view(), name="auth-me"),
]
