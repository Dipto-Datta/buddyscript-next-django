from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from django.core.mail import send_mail
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.core.cache import cache
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.exceptions import InvalidToken

from .models import SiteSettings
from .serializers import (
    LoginSerializer,
    OTPVerifySerializer,
    RegisterSerializer,
    UserSerializer,
    UserUpdateSerializer,
)

User = get_user_model()


def _get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }


def _set_auth_response_cookies(response, tokens):
    refresh_token = tokens.get("refresh")
    if refresh_token:
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=False,
            samesite="Lax",
            max_age=7 * 24 * 60 * 60,
        )


def _is_2fa_enabled():
    if settings.ENABLE_EMAIL_2FA:
        return True
    try:
        site_settings = SiteSettings.load()
        return site_settings.enable_2fa
    except Exception:
        return False


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        tokens = _get_tokens_for_user(user)
        response = Response(
            {
                "user": UserSerializer(user, context={
                    "request": request
                }).data,
                "tokens": tokens,
                "message": "Registration successful.",
            },
            status=status.HTTP_201_CREATED,
        )
        _set_auth_response_cookies(response, tokens)
        return response


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = authenticate(
            request,
            email=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
        )
        if user is None:
            return Response(
                {"detail": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if _is_2fa_enabled() and user.is_2fa_enabled:
            otp = user.generate_otp()
            send_mail(
                subject="BuddyScript – Your Login OTP",
                message=
                f"Your OTP code is: {otp}\n\nThis code expires in 10 minutes.",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,
            )
            return Response(
                {
                    "requires_2fa":
                    True,
                    "message":
                    "OTP sent to your email. Please verify to complete login.",
                },
                status=status.HTTP_200_OK,
            )

        tokens = _get_tokens_for_user(user)
        response = Response(
            {
                "user": UserSerializer(user, context={
                    "request": request
                }).data,
                "tokens": tokens,
                "requires_2fa": False,
            },
            status=status.HTTP_200_OK,
        )
        _set_auth_response_cookies(response, tokens)
        return response


class OTPVerifyView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            user = User.objects.get(email=serializer.validated_data["email"])
        except User.DoesNotExist:
            return Response({"detail": "Invalid email."},
                            status=status.HTTP_400_BAD_REQUEST)

        if user.verify_otp(serializer.validated_data["otp_code"]):
            tokens = _get_tokens_for_user(user)
            response = Response(
                {
                    "user": UserSerializer(user, context={
                        "request": request
                    }).data,
                    "tokens": tokens,
                },
                status=status.HTTP_200_OK,
            )
            _set_auth_response_cookies(response, tokens)
            return response

        return Response(
            {"detail": "Invalid or expired OTP code."},
            status=status.HTTP_400_BAD_REQUEST,
        )


class LogoutView(APIView):

    def post(self, request):
        try:
            refresh_token = request.COOKIES.get("refresh_token")
            if not refresh_token:
                refresh_token = request.data.get("refresh")
            if refresh_token:
                try:
                    token = RefreshToken(refresh_token)
                    token.blacklist()
                except Exception:
                    pass

            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                raw_token = auth_header.split(" ")[1]
                try:
                    authenticator = JWTAuthentication()
                    validated_token = authenticator.get_validated_token(
                        raw_token)
                    jti = validated_token.get("jti")
                    exp = validated_token.get("exp")
                    if jti and exp:
                        import time
                        remaining_time = max(1, int(exp - time.time()))
                        cache.set(f"blacklist_access_{jti}",
                                  True,
                                  timeout=remaining_time)
                except Exception:
                    pass

            response = Response({"message": "Logged out successfully."},
                                status=status.HTTP_200_OK)
            response.delete_cookie("refresh_token")
            return response
        except Exception:
            return Response({"detail": "Invalid token."},
                            status=status.HTTP_400_BAD_REQUEST)


class MeView(generics.RetrieveUpdateAPIView):

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return UserUpdateSerializer
        return UserSerializer


class CookieTokenRefreshView(TokenRefreshView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get("refresh_token")
        if not refresh_token:
            refresh_token = request.data.get("refresh")

        if not refresh_token:
            return Response(
                {"detail": "Refresh token is missing."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        mutable_data = request.data.copy()
        mutable_data["refresh"] = refresh_token

        serializer = self.get_serializer(data=mutable_data)
        try:
            serializer.is_valid(raise_exception=True)
        except InvalidToken as e:
            return Response({"detail": e.detail},
                            status=status.HTTP_401_UNAUTHORIZED)

        res_data = serializer.validated_data
        response = Response(
            {
                "access": res_data.get("access"),
            },
            status=status.HTTP_200_OK,
        )

        new_refresh = res_data.get("refresh")
        if new_refresh:
            response.set_cookie(
                key="refresh_token",
                value=new_refresh,
                httponly=True,
                secure=False,
                samesite="Lax",
                max_age=7 * 24 * 60 * 60,
            )

        return response
