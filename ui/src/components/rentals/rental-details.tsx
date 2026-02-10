"use client";

import { RentalHeader } from "@/components/rentals/rental-header";
import { RentalSummary } from "@/components/rentals/rental-summary";
import { RentalItemsTable } from "@/components/rentals/rental-items-table";
import { RentalInvoicePlaceholder } from "@/components/rentals/rental-invoice-placeholder";
import { useEffect, useState } from "react";

export default function RentalDetailsInfo({ rentalId }: { rentalId: string }) {
  const [rental, setRental] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRentalById = async () => {
      console.log(rentalId);
      try {
        const res = await fetch(`http://localhost:3001/rentals/${rentalId}`, {
          credentials: "include",
        });
        const data = await res.json();
        console.log(data);
        setRental(data.data);
      } finally {
        setLoading(false);
      }
    };

    fetchRentalById();
  }, [rentalId]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 border-4 border-[#17cf91] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!rental) {
    return <p>Rental not found</p>;
  }

  return (
    <div className="space-y-6">
      <RentalHeader rental={rental} />
      <RentalSummary rental={rental} />
      <RentalItemsTable items={rental.rentalItems} />
      <RentalInvoicePlaceholder />
    </div>
  );
}
