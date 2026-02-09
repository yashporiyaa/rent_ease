"use client";

import { Building2, Phone, Mail, Briefcase, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/common/form-input";
import Link from "next/link";
import { useState } from "react";
import { createUser } from "@/lib/api/user";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    companyName: "",
    phone: "",
    email: "",
    businessType: "",
    password: "",
  });
  const router = useRouter();

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createUser(formData);
      router.push("/onboarding");
    } catch (error: unknown) {
      console.error("Signup error:");
    }
  };

  return (
    <div className="flex min-h-screen">
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
              alt="Buildings"
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

      {/* RIGHT SIDE (FORM) */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6 py-12">
        <div className="w-full max-w-120">
          <h1 className="mb-3 text-4xl font-black text-[#0e1b17]">
            Create your account
          </h1>

          <p className="mb-8 text-[#4e977f]">
            Join thousands of property managers simplifying operations.
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <FormInput
              label="Company Name"
              placeholder="Enter company name"
              icon={<Building2 size={18} />}
              value={formData.companyName}
              required
              onChange={(e) => handleChange("companyName", e.target.value)}
            />

            <FormInput
              label="Mobile Number"
              placeholder="9876543210"
              icon={<Phone size={18} />}
              value={formData.phone}
              required
              onChange={(e) => handleChange("phone", e.target.value)}
            />

            <FormInput
              label="Work Email"
              type="email"
              placeholder="admin@rentease.com"
              icon={<Mail size={18} />}
              value={formData.email}
              required
              onChange={(e) => handleChange("email", e.target.value)}
            />

            <FormInput
              label="Type of Business"
              placeholder="Property Management"
              icon={<Briefcase size={18} />}
              value={formData.businessType}
              required
              onChange={(e) => handleChange("businessType", e.target.value)}
            />

            <FormInput
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={<Lock size={18} />}
              value={formData.password}
              required
              onChange={(e) => handleChange("password", e.target.value)}
            />

            <Button
              type="submit"
              className="mt-4 h-14 w-full rounded-full bg-[#17cf91]
                         text-[#0e1b17] font-bold
                         hover:bg-[#17cf91]/90
                         shadow-lg shadow-[#17cf91]/20 cursor-pointer"
            >
              Sign Up
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-[#4e977f]">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-bold text-[#17cf91] hover:underline cursor-pointer"
            >
              Log in
            </Link>
          </p>

          <p className="mt-6 text-center text-xs text-[#4e977f]">
            By signing up, you agree to our{" "}
            <span className="underline">Terms of Service</span> and{" "}
            <span className="underline">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
