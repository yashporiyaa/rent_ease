"use client";

import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserContext } from "@/app/context/user-context";

export default function RedirectPage() {
  const router = useRouter();
  const { user, loading, getUser } = useContext(UserContext);

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    if (loading) return;

    if (!user) {
        console.log("not user")
      router.replace("/auth/login");
      return;
    }

    if (!user.onboardingDone) {
      router.replace("/onboarding");
    } else {
      router.replace("/protected/dashboard");
    }
  }, [loading, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f8f7]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 rounded-full border-4 border-[#17cf91] border-t-transparent animate-spin" />
        <p className="text-sm font-medium text-slate-500">
          Preparing your workspace…
        </p>
      </div>
    </div>
  );
}
