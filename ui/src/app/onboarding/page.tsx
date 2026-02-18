"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/protected/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f8f7]">
      <div className="h-8 w-8 border-4 border-[#17cf91] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
