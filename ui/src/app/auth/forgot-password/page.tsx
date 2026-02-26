"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { FormInput } from "../../../components/common/form-input";
import { forgotPassword } from "../../../lib/api/user";
import { toast } from "react-toastify";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await forgotPassword(email);
      toast.success("Reset link sent if account exists");
      setIsSent(true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to send reset link";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f8f7] px-6">
      <div className="w-full max-w-105 bg-white p-8 rounded-3xl shadow">
        <h1 className="text-3xl font-black text-[#0e1b17]">
          Reset your password
        </h1>

        {!isSent ? (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <FormInput
              label="Work Email"
              type="email"
              icon={<Mail size={18} />}
              placeholder="alex@company.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Button
              variant="brand"
              type="submit"
              disabled={loading}
              className="mt-4 w-full rounded-full bg-[#17cf91] cursor-pointer"
            >
              Send reset link
            </Button>
          </form>
        ) : (
          <p className="mt-6 text-sm text-[#4e977f]">
            If an account exists for <b>{email}</b>, a password reset link has
            been sent. Please check your inbox.
          </p>
        )}
      </div>
    </div>
  );
}
