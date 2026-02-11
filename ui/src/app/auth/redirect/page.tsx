"use client";

import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserContext } from "@/app/context/user-context";

export default function RedirectPage() {
  const router = useRouter();
  const { refreshUser } = useContext(UserContext);

  useEffect(() => {
    let isActive = true;
    const wait = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    const resolveRedirect = async () => {
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      if (!isLoggedIn) {
        router.replace("/auth/login");
        return;
      }

      let currentUser = await refreshUser();
      if (!currentUser) {
        await wait(250);
        currentUser = await refreshUser();
      }
      if (!isActive) return;

      if (!currentUser) {
        router.replace("/auth/login");
        return;
      }

      if (!currentUser.onboardingDone) {
        router.replace("/onboarding");
        return;
      }

      router.replace("/protected/dashboard");
    };

    void resolveRedirect();

    return () => {
      isActive = false;
    };
  }, [refreshUser, router]);

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
