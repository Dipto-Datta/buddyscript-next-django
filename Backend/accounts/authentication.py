from django.core.cache import cache
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken


class CachedJWTAuthentication(JWTAuthentication):
    """
    Custom JWT authentication class that checks the Django cache for blacklisted
    access token JTIs before authenticating.
    """

    def get_validated_token(self, raw_token):
        validated_token = super().get_validated_token(raw_token)
        jti = validated_token.get("jti")
        if jti and cache.get(f"blacklist_access_{jti}"):
            raise InvalidToken("Token is blacklisted.")
        return validated_token
