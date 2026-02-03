"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function Header() {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-[#e6f4ee]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center gap-2 font-bold text-[#0e1b17]">
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
          <Link
            href="/login"
            className="text-sm text-[#4e977f] hover:underline"
          >
            Log In
          </Link>
          <Button onClick={() => {
            router.push('/signup')
          }} className="rounded-full bg-[#17cf91] px-6 text-[#0e1b17] font-bold hover:bg-[#17cf91]/90 cursor-pointer">
            Sign Up
          </Button>
        </div>
      </div>
    </header>
  );
}
