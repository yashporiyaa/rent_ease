"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();

  useEffect(() => {
    router.replace("/protected/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#f2fdf9] flex items-center justify-center">
      <div className="w-full max-w-2xl p-8">{children}</div>
    </div>
  );
}
