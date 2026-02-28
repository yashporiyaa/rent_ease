"use client";

import { Sidebar } from "../../components/layout/sidebar";
import { SidebarInset, SidebarProvider, useSidebar } from "../../components/ui/sidebar";
import { UserContext } from "../context/user-context";
import { Menu } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import RentEaseLogo from "../../assests/images/RentEase.png";

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
    <SidebarProvider defaultOpen>
      <Sidebar />
      <SidebarInset className="bg-[#f6f8f7]">
        <MobileTopbar />
        <div className="p-4 pt-2 md:p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function MobileTopbar() {
  const { toggleSidebar } = useSidebar();

  return (
    <div className="sticky top-0 z-40 flex items-center justify-between border-b bg-white/95 px-4 py-3 backdrop-blur md:hidden">
      <button
        type="button"
        onClick={toggleSidebar}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700"
        aria-label="Toggle sidebar menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex items-center gap-2">
        <Image
          src={RentEaseLogo}
          alt="RentEase logo"
          className="h-10 w-auto rounded-full bg-white p-1 object-contain"
          priority
        />
        <span className="text-base font-bold tracking-tight text-[#0e1b17]">
          RentEase
        </span>
      </div>
      <span className="w-10" aria-hidden />
    </div>
  );
}
