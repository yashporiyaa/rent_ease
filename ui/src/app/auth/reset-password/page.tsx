"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/common/form-input";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccess(true);

      // small delay so user sees success
      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 1500);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f8f7] px-6">
      <div className="w-full max-w-105 rounded-3xl bg-white p-8 shadow">
        <h1 className="text-3xl font-black text-[#0e1b17]">
          Set a new password
        </h1>

        <p className="mt-2 text-sm text-[#4e977f]">
          Choose a strong password you haven’t used before.
        </p>

        {!success ? (
          <form onSubmit={resetPassword} className="mt-6 space-y-4">
            <FormInput
              label="New Password"
              type="password"
              placeholder="••••••••"
              icon={<Lock size={18} />}
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
            />

            {errorMsg && (
              <p className="text-sm text-red-500">{errorMsg}</p>
            )}

            <Button
              variant="brand"
              type="submit"
              disabled={loading}
              className="mt-4 h-14 w-full rounded-full bg-[#17cf91] cursor-pointer
                         text-[#0e1b17] font-bold
                         hover:bg-[#17cf91]/90
                         shadow-lg shadow-[#17cf91]/20"
            >
              {loading ? "Updating..." : "Reset password"}
            </Button>
          </form>
        ) : (
          <p className="mt-6 text-sm text-[#4e977f]">
            Password updated successfully. Redirecting to login…
          </p>
        )}
      </div>
    </div>
  );
}
