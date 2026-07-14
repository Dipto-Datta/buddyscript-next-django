"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../lib/auth";

export default function LoginPage() {
  const { login, verifyOtp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [requires2fa, setRequires2fa] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.requires_2fa) {
        setRequires2fa(true);
        setMessage(res.message || "Please enter the OTP sent to your email.");
      }
    } catch (err: any) {
      setError(err?.data?.detail || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await verifyOtp(email, otpCode);
    } catch (err: any) {
      setError(err?.data?.detail || "Invalid or expired OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: "#F0F2F5", padding: "100px 0" }}
    >

      <div className="absolute top-0 left-0 z-0 pointer-events-none">
        <img src="/assets/images/shape1.svg" alt="" className="w-auto h-auto" />
      </div>
      <div className="absolute top-0 right-5 z-0 pointer-events-none">
        <img src="/assets/images/shape2.svg" alt="" className="w-auto h-auto" />
      </div>
      <div className="absolute bottom-0 right-[327px] z-0 pointer-events-none">
        <img src="/assets/images/shape3.svg" alt="" className="w-auto h-auto" />
      </div>


      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-8">


          <div className="hidden lg:flex lg:w-2/3 items-center justify-center">
            <div className="w-full max-w-[633px]">
              <img
                src="/assets/images/login.png"
                alt="Login"
                className="w-full h-auto"
              />
            </div>
          </div>


          <div className="w-full lg:w-1/3">
            <div
              className="rounded-md"
              style={{
                background: "#FFFFFF",
                padding: "48px",
              }}
            >

              <div className="mb-7 flex justify-center">
                <img
                  src="/assets/images/logo.svg"
                  alt="BuddyScript"
                  className="h-auto"
                  style={{ maxWidth: "161px" }}
                />
              </div>

              {!requires2fa ? (
                <>

                  <p
                    className="text-center leading-[1.4] mb-2"
                    style={{ color: "#2D3748", fontWeight: 400 }}
                  >
                    Welcome back
                  </p>
                  <h4
                    className="text-center mb-12 font-medium"
                    style={{ fontSize: "28px", color: "#1A202C" }}
                  >
                    Login to your account
                  </h4>


                  <button
                    type="button"
                    className="w-full flex items-center justify-center rounded-md mb-10 hover:shadow-md transition-shadow"
                    style={{
                      border: "1px solid #F0F2F5",
                      background: "#FFFFFF",
                      padding: "12px 60px",
                    }}
                    onClick={() =>
                      setError("Google Sign-In is not available. Use your email and password.")
                    }
                  >
                    <img
                      src="/assets/images/google.svg"
                      alt="Google"
                      className="mr-2"
                      style={{ maxWidth: "20px", height: "auto" }}
                    />
                    <span
                      className="font-medium text-base leading-[1.4] flex-shrink-0"
                      style={{ color: "#312000" }}
                    >
                      Or sign-in with google
                    </span>
                  </button>


                  <div className="relative text-center mb-10">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[1px] rounded-sm" style={{ width: "108px", background: "#DFDFDF" }} />
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[1px] rounded-sm" style={{ width: "108px", background: "#DFDFDF" }} />
                    <span
                      className="text-sm leading-[1.4] font-normal"
                      style={{ color: "#C4C4C4" }}
                    >
                      Or
                    </span>
                  </div>


                  {error && (
                    <div className="mb-4 p-3 text-sm bg-red-50 border border-red-200 text-red-600 rounded-md">
                      {error}
                    </div>
                  )}


                  <form onSubmit={handleLoginSubmit}>

                    <div className="mb-3.5">
                      <label
                        className="block mb-2 font-medium text-base leading-[1.4]"
                        style={{ color: "#4A5568" }}
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#1890FF] text-[#2D3748] placeholder-[#A0AEC0]"
                        style={{
                          background: "#FFFFFF",
                          border: "1px solid #E8E8E8",
                          height: "48px",
                          padding: "0 16px",
                        }}
                      />
                    </div>


                    <div className="mb-3.5">
                      <label
                        className="block mb-2 font-medium text-base leading-[1.4]"
                        style={{ color: "#4A5568" }}
                      >
                        Password
                      </label>
                      <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#1890FF] text-[#2D3748] placeholder-[#A0AEC0]"
                        style={{
                          background: "#FFFFFF",
                          border: "1px solid #E8E8E8",
                          height: "48px",
                          padding: "0 16px",
                        }}
                      />
                    </div>


                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <label className="flex items-center cursor-pointer select-none">
                          <input
                            type="radio"
                            checked={rememberMe}
                            onChange={() => setRememberMe(!rememberMe)}
                            className="sr-only"
                          />
                          <span
                            className="w-4 h-4 rounded-full border flex items-center justify-center bg-white transition-all"
                            style={{
                              borderColor: rememberMe ? "#1890FF" : "#DFDFDF",
                              borderWidth: "1px",
                            }}
                          >
                            {rememberMe && (
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ background: "#1890FF" }}
                              />
                            )}
                          </span>
                          <span
                            className="ml-2 text-sm font-normal leading-[1.4]"
                            style={{ color: "#2D3748" }}
                          >
                            Remember me
                          </span>
                        </label>
                      </div>
                      <button
                        type="button"
                        className="text-sm leading-[1.4]"
                        style={{ color: "#1890FF" }}
                        onClick={() => setError("Forgot Password feature is disabled for simplicity.")}
                      >
                        Forgot password?
                      </button>
                    </div>


                    <div className="mt-10 mb-14">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-md font-medium text-base text-white border border-transparent hover:shadow-lg transition-shadow disabled:opacity-60"
                        style={{
                          background: "#1890FF",
                          padding: "12px 0",
                        }}
                      >
                        {loading ? "Logging in..." : "Login now"}
                      </button>
                    </div>
                  </form>


                  <div className="text-center">
                    <p className="text-sm" style={{ color: "#767676" }}>
                      Dont have an account?{" "}
                      <Link
                        href="/register"
                        className="font-medium hover:underline"
                        style={{ color: "#1890FF" }}
                      >
                        Create New Account
                      </Link>
                    </p>
                  </div>
                </>
              ) : (
                // TDOD:Not Needed for now
                // otp implementation -- not needed 
                <>

                  <p
                    className="text-center leading-[1.4] mb-2"
                    style={{ color: "#2D3748", fontWeight: 400 }}
                  >
                    Verification Required
                  </p>
                  <h4
                    className="text-center mb-12 font-medium"
                    style={{ fontSize: "28px", color: "#1A202C" }}
                  >
                    Enter OTP Code
                  </h4>

                  {message && (
                    <div className="mb-4 p-3 text-sm bg-blue-50 border border-blue-200 text-blue-600 rounded-md">
                      {message}
                    </div>
                  )}
                  {error && (
                    <div className="mb-4 p-3 text-sm bg-red-50 border border-red-200 text-red-600 rounded-md">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleOtpSubmit}>
                    <div className="mb-3.5">
                      <label
                        className="block mb-2 font-medium text-base leading-[1.4]"
                        style={{ color: "#4A5568" }}
                      >
                        6-Digit OTP
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="e.g. 123456"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        required
                        className="w-full rounded-md text-center tracking-[0.5em] text-lg font-bold focus:outline-none focus:ring-2 focus:ring-[#1890FF]"
                        style={{
                          background: "#FFFFFF",
                          border: "1px solid #E8E8E8",
                          height: "48px",
                          padding: "0 16px",
                        }}
                      />
                    </div>

                    <div className="mt-10 mb-6">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-md font-medium text-base text-white border border-transparent hover:shadow-lg transition-shadow disabled:opacity-60"
                        style={{
                          background: "#1890FF",
                          padding: "12px 0",
                        }}
                      >
                        {loading ? "Verifying..." : "Verify & Login"}
                      </button>
                    </div>
                  </form>

                  <div className="text-center">
                    <button
                      type="button"
                      className="text-sm font-medium hover:underline"
                      style={{ color: "#1890FF" }}
                      onClick={() => {
                        setRequires2fa(false);
                        setError(null);
                        setMessage(null);
                      }}
                    >
                      Back to Login
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
