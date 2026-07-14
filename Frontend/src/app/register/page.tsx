"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../lib/auth";

export default function RegisterPage() {
  const { register } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!agreeTerms) {
      setError("You must agree to the terms and conditions.");
      return;
    }

    if (password !== passwordConfirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await register({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        password_confirm: passwordConfirm,
      });
    } catch (err: any) {
      const detail = err?.data?.detail;
      const emailErr = err?.data?.email?.[0];
      const pwErr = err?.data?.password?.[0];
      const formErr = err?.data?.non_field_errors?.[0];

      setError(
        emailErr
          ? `Email error: ${emailErr}`
          : pwErr
            ? `Password error: ${pwErr}`
            : formErr || detail || "Registration failed. Please verify your details."
      );
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

          {/* left side */}
          <div className="hidden lg:flex lg:w-2/3 items-center justify-center">
            <div className="w-full max-w-[633px]">
              <img
                src="/assets/images/registration.png"
                alt="Registration"
                className="w-full h-auto"
              />
            </div>
          </div>

          {/* rigth side */}
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


              <p
                className="text-center leading-[1.4] mb-2"
                style={{ color: "#2D3748", fontWeight: 400 }}
              >
                Get Started Now
              </p>
              <h4
                className="text-center mb-12 font-medium"
                style={{ fontSize: "28px", color: "#1A202C" }}
              >
                Registration
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
                  setError("Google registration is not available. Use the email form.")
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
                  Register with google
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


              <form onSubmit={handleRegisterSubmit}>

                <div className="grid grid-cols-2 gap-3 mb-3.5">
                  <div>
                    <label
                      className="block mb-2 font-medium text-base leading-[1.4]"
                      style={{ color: "#4A5568" }}
                    >
                      First Name
                    </label>
                    <input
                      type="text"
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
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
                  <div>
                    <label
                      className="block mb-2 font-medium text-base leading-[1.4]"
                      style={{ color: "#4A5568" }}
                    >
                      Last Name
                    </label>
                    <input
                      type="text"
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
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
                </div>


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
                    placeholder="Enter password"
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


                <div className="mb-3.5">
                  <label
                    className="block mb-2 font-medium text-base leading-[1.4]"
                    style={{ color: "#4A5568" }}
                  >
                    Repeat Password
                  </label>
                  <input
                    type="password"
                    placeholder="Repeat password"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
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


                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer select-none">
                    <input
                      type="radio"
                      checked={agreeTerms}
                      onChange={() => setAgreeTerms(!agreeTerms)}
                      className="sr-only"
                    />
                    <span
                      className="w-4 h-4 rounded-full border flex items-center justify-center bg-white transition-all"
                      style={{
                        borderColor: agreeTerms ? "#1890FF" : "#DFDFDF",
                        borderWidth: "1px",
                      }}
                    >
                      {agreeTerms && (
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
                      I agree to terms & conditions
                    </span>
                  </label>
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
                    {loading ? "Registering..." : "Register now"}
                  </button>
                </div>
              </form>


              <div className="text-center">
                <p className="text-sm" style={{ color: "#767676" }}>
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-medium hover:underline"
                    style={{ color: "#1890FF" }}
                  >
                    Login to Account
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
