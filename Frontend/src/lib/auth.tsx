"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { api } from "./api";
import { User } from "../types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ requires_2fa: boolean; message?: string }>;
  verifyOtp: (email: string, otpCode: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchProfile = async () => {
    try {
      const profile = await api.get("/auth/me/");
      setUser(profile);
    } catch (error) {
      setUser(null);
      api.clearTokens();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      let token = api.getAccessToken();
      if (!token) {
        token = await api.refreshAccessToken();
      }
      if (token) {
        await fetchProfile();
      } else {
        setLoading(false);
      }
    };

    initAuth();


    const handleUnauthorized = () => {
      setUser(null);
      router.push("/login");
    };

    if (typeof window !== "undefined") {
      window.addEventListener("unauthorized", handleUnauthorized);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("unauthorized", handleUnauthorized);
      }
    };
  }, [router]);


  useEffect(() => {
    if (!loading) {
      const publicRoutes = ["/login", "/register"];
      const isPublicRoute = publicRoutes.includes(pathname);

      if (!user && !isPublicRoute) {
        router.push("/login");
      } else if (user && isPublicRoute) {
        router.push("/feed/");
      }
    }
  }, [user, loading, pathname, router]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/login/", { email, password });

      if (response.requires_2fa) {
        setLoading(false);
        return { requires_2fa: true, message: response.message };
      }

      api.setTokens(response.tokens.access, response.tokens.refresh);
      setUser(response.user);
      setLoading(false);
      router.push("/feed/");
      return { requires_2fa: false };
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };
  // TODO:OTP not needed on this 
  const verifyOtp = async (email: string, otp_code: string) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/verify-otp/", { email, otp_code });
      api.setTokens(response.tokens.access, response.tokens.refresh);
      setUser(response.user);
      setLoading(false);
      router.push("/feed/");
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const register = async (registerData: any) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/register/", registerData);
      api.setTokens(response.tokens.access, response.tokens.refresh);
      setUser(response.user);
      setLoading(false);
      router.push("/feed/");
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const refresh = api.getRefreshToken();
      await api.post("/auth/logout/", { refresh });
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      api.clearTokens();
      setUser(null);
      setLoading(false);
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, verifyOtp, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
