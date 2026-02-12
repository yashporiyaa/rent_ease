"use client";

import { OnboardingProvider } from "../context/onboarding-context";
import { UserContext } from "../context/user-context";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { user, refreshUser } = useContext(UserContext);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;

    const ensureOnboardingAccess = async () => {
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      if (!isLoggedIn) {
        router.replace("/auth/login");
        return;
      }

      let currentUser = user;
      if (!currentUser) {
        currentUser = await refreshUser();
      }
      if (!active) return;

      if (!currentUser) {
        router.replace("/auth/login");
        return;
      }

      if (currentUser.onboardingDone) {
        router.replace("/protected/dashboard");
        return;
      }

      setChecking(false);
    };

    void ensureOnboardingAccess();

    return () => {
      active = false;
    };
  }, [refreshUser, router, user]);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#f2fdf9] flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-[#17cf91] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
      <OnboardingProvider>
        <div className="min-h-screen bg-[#f2fdf9] flex items-center justify-center">
          <div className="w-full max-w-2xl p-8">{children}</div>
        </div>
      </OnboardingProvider>
  );
}
