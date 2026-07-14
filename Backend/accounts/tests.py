from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from accounts.models import SiteSettings

User = get_user_model()


class AuthTests(APITestCase):

    def setUp(self):
        self.register_url = reverse("auth-register")
        self.login_url = reverse("auth-login")
        self.me_url = reverse("auth-me")

        self.user_data = {
            "first_name": "Test",
            "last_name": "User",
            "email": "test@example.com",
            "password": "securepassword123",
            "password_confirm": "securepassword123"
        }

    def test_registration(self):
        response = self.client.post(self.register_url,
                                    self.user_data,
                                    format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("tokens", response.data)
        self.assertEqual(response.data["user"]["email"],
                         self.user_data["email"])
        self.assertEqual(User.objects.count(), 1)

    def test_login_without_2fa(self):
        self.client.post(self.register_url, self.user_data, format="json")
        login_data = {
            "email": "test@example.com",
            "password": "securepassword123"
        }
        response = self.client.post(self.login_url, login_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("tokens", response.data)
        self.assertFalse(response.data["requires_2fa"])

    def test_login_with_2fa_globally_disabled_user_enabled(self):
        self.client.post(self.register_url, self.user_data, format="json")
        user = User.objects.get(email=self.user_data["email"])
        user.is_2fa_enabled = True
        user.save()
        login_data = {
            "email": "test@example.com",
            "password": "securepassword123"
        }
        response = self.client.post(self.login_url, login_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data["requires_2fa"])

        site_settings = SiteSettings.load()
        site_settings.enable_2fa = True
        site_settings.save()

        response = self.client.post(self.login_url, login_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["requires_2fa"])

        user.refresh_from_db()
        self.assertIsNotNone(user.otp_code)
        verify_url = reverse("auth-verify-otp")
        verify_data = {"email": user.email, "otp_code": user.otp_code}
        verify_response = self.client.post(verify_url,
                                           verify_data,
                                           format="json")
        self.assertEqual(verify_response.status_code, status.HTTP_200_OK)
        self.assertIn("tokens", verify_response.data)

    def test_get_me_protected(self):
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        reg_response = self.client.post(self.register_url,
                                        self.user_data,
                                        format="json")
        token = reg_response.data["tokens"]["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], self.user_data["email"])
