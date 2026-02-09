"use client";

import { Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/common/form-input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { loginUser } from "@/lib/api/user";

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await loginUser(formData);

      localStorage.setItem("isLoggedIn", "true");

      router.push("/auth/redirect");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f6f8f7]">
      {/* LEFT SIDE */}
      <div className="relative hidden w-1/2 lg:flex items-center justify-center overflow-hidden bg-linear-to-br from-[#e6fbf3] to-[#f2fdf9]">
        {/* soft glow */}
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#17cf91]/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[#17cf91]/20 blur-3xl" />

        <div className="relative z-10 max-w-130 px-10">
          {/* Image card */}
          <div className="relative rounded-3xl border border-white bg-white p-3 shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c"
              alt="Apartments"
              className="rounded-2xl object-cover"
            />

            {/* top right stat */}
            <div className="absolute right-4 top-4 rounded-xl bg-white px-4 py-2 shadow">
              <span className="text-[#17cf91] font-semibold">↗</span>
            </div>

            {/* bottom left stat */}
            <div className="absolute bottom-4 left-4 rounded-xl bg-white px-4 py-3 shadow">
              <p className="text-[10px] uppercase tracking-wide text-[#4e977f]">
                Occupancy Rate
              </p>
              <p className="text-2xl font-black text-[#17cf91]">98.4%</p>
            </div>
          </div>

          {/* Text */}
          <h2 className="mt-10 text-3xl font-black text-[#0e1b17]">
            The smarter way to manage your portfolio.
          </h2>
          <p className="mt-4 text-[#4e977f] text-lg">
            Automate lease tracking, payment collection, and maintenance
            requests in one unified platform designed for growth.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE (LOGIN FORM) */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6 py-12">
        <div className="w-full max-w-105">
          <h1 className="mb-2 text-4xl font-black text-[#0e1b17]">
            Welcome back
          </h1>

          <p className="mb-8 text-[#4e977f]">
            Log in to manage your property portfolio.
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <FormInput
              label="Work Email"
              type="email"
              placeholder="alex@company.com"
              icon={<Mail size={18} />}
              value={formData.email}
              required
              onChange={(e) => handleChange("email", e.target.value)}
            />

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-semibold text-[#0e1b17]">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm font-medium text-[#17cf91] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <FormInput
                label=""
                type="password"
                placeholder="••••••••"
                icon={<Lock size={18} />}
                value={formData.password}
                required
                onChange={(e) => handleChange("password", e.target.value)}
              />
            </div>

            <Button
              type="submit"
              className="mt-6 h-14 w-full rounded-full bg-[#17cf91]
                         text-[#0e1b17] font-bold
                         hover:bg-[#17cf91]/90
                         shadow-lg shadow-[#17cf91]/20 cursor-pointer"
            >
              Log In
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-[#4e977f]">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="font-bold text-[#17cf91] hover:underline cursor-pointer"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
