"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { UserContext } from "@/app/context/user-context";

export function Header() {
  const router = useRouter();
  const { user, loading, logout } = useContext(UserContext);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-[#e6f4ee]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center gap-2 font-bold text-[#0e1b17] text-2xl">
          <span className="h-3 w-3 rounded-full bg-[#17cf91]" />
          RentEase
        </div>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm text-[#4e977f]">
          <Link href="#">Home</Link>
          <Link href="#">About</Link>
          <Link href="#">Features</Link>
          <Link href="#">Pricing</Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button
            onClick={user ? logout : () => router.push("/auth/signup")}
            className="relative rounded-full bg-[#17cf91] px-6 text-[#0e1b17] font-bold hover:bg-[#17cf91]/90 cursor-pointer min-w-[140px]"
            disabled={loading}
          >
            {/* Spinner */}
            {loading && (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#0e1b17] border-t-transparent"></span>
              </span>
            )}

            {/* Button Text */}
            <span className={loading ? "opacity-0" : "opacity-100"}>
              {user ? "Logout" : "Sign Up Free"}
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
}
