"use client";

import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { UserContext } from "@/app/context/user-context";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, refreshUser } = useContext(UserContext);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;

    const ensureAuthenticated = async () => {
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

      setChecking(false);
    };

    void ensureAuthenticated();

    return () => {
      active = false;
    };
  }, [refreshUser, router, user]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8f7]">
        <div className="h-8 w-8 border-4 border-[#17cf91] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f6f8f7]">
      <Sidebar />
      <main className="flex-1 ml-64">
        {/* <Header /> */}
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
