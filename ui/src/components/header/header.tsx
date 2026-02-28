"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import RentEaseLogo from "../../assests/images/RentEase.png";

export function Header() {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-[#e6f4ee]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Image
            src={RentEaseLogo}
            alt="RentEase logo"
            className="h-12 w-auto rounded-full bg-white p-1 object-contain"
            priority
          />
          <span className="text-2xl font-bold tracking-tight text-[#0e1b17]">
            RentEase
          </span>
        </div>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm text-[#4e977f]">
          <Link href="/#home">Home</Link>
          <Link href="/#about">About</Link>
          <Link href="/#features">Features</Link>
          <Link href="/#pricing">Pricing</Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button
            variant="brand"
            onClick={() => router.push("/auth/signup")}
            className="rounded-full bg-[#17cf91] px-6 text-[#0e1b17] font-bold hover:bg-[#17cf91]/90 cursor-pointer min-w-35"
          >
            <span>Sign Up Free</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
