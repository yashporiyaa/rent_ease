"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RentalsTable } from "@/components/rentals/rentals-table";
import { RentalsEmptyState } from "@/components/rentals/rentals-empty-state";
import { Button } from "@/components/ui/button";

export default function RentalsPage() {
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRentals = async () => {
      try {
        const res = await fetch("http://localhost:3001/rentals", {
          credentials: "include",
        });
        const data = await res.json();
        setRentals(data.data);
      } finally {
        setLoading(false);
      }
    };

    fetchRentals();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 border-4 border-[#17cf91] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0e1b17]">Rentals</h1>
          <p className="text-slate-500 mt-1">
            Track and manage all your active and past rentals.
          </p>
        </div>
        <Button
          asChild
          className="rounded-full bg-[#17cf91] text-[#0e1b17] font-bold"
        >
          <Link href="/protected/rentals/new">Create Rental</Link>
        </Button>
      </div>
      {rentals.length === 0 ? (
        <RentalsEmptyState />
      ) : (
        <RentalsTable rentals={rentals} />
      )}
    </div>
  );
}
