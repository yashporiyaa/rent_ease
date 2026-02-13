"use client";

import { RentalHeader } from "@/components/rentals/rental-header";
import { RentalSummary } from "@/components/rentals/rental-summary";
import { RentalItemsTable } from "@/components/rentals/rental-items-table";
import { RentalInvoicePlaceholder } from "@/components/rentals/rental-invoice-placeholder";
import { useEffect, useState } from "react";
import { getRentalById } from "@/lib/api/rentals";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";

export default function RentalDetailsInfo({ rentalId }: { rentalId: string }) {
  const [rental, setRental] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRentalById = async () => {
      try {
        const res = await getRentalById(rentalId);
        setRental(res.data);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to fetch rental details";
        toast.error(message);
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
      {rental.status === "ACTIVE" && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            onClick={async () => {
              await fetch(
                `http://localhost:3001/rentals/${rental.id}/return`,
                {
                  method: "PATCH",
                  credentials: "include",
                },
              );

              window.location.reload();
            }}
            className="bg-red-500 text-white rounded-full cursor-pointer hover:bg-red-300"
          >
            Mark as Returned
          </Button>
        </div>
      )}
      <RentalSummary rental={rental} />
      <RentalItemsTable items={rental.rentalItems} />
      <RentalInvoicePlaceholder />
    </div>
  );
}
