"use client";

import { useCallback, useEffect, useState } from "react";
import { RentalsTable } from "@/components/rentals/rentals-table";
import { RentalsEmptyState } from "@/components/rentals/rentals-empty-state";
import { Button } from "@/components/ui/button";
import { getRentals } from "@/lib/api/rentals";
import { getCustomers } from "@/lib/api/customers";
import { toast } from "react-toastify";
import { CreateRentalForm } from "@/components/rentals/create-rental-form";
import { CustomerListItem, RentalRecord } from "@/types";

export default function RentalsPage() {
  const [rentals, setRentals] = useState<RentalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formCustomers, setFormCustomers] = useState<CustomerListItem[]>([]);
  const [formLoading, setFormLoading] = useState(false);

  const fetchRentals = useCallback(async () => {
    try {
      const res = await getRentals();
      setRentals(res.data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch rentals";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchRentals();
  }, [fetchRentals]);

  useEffect(() => {
    if (!isCreateOpen) return;

    const fetchFormData = async () => {
      setFormLoading(true);
      try {
        const customersRes = await getCustomers();
        setFormCustomers(customersRes.data);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load rental form data";
        toast.error(message);
      } finally {
        setFormLoading(false);
      }
    };

    void fetchFormData();
  }, [isCreateOpen]);

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
          variant="brand"
          onClick={() => setIsCreateOpen(true)}
          className="rounded-full bg-[#17cf91] text-[#0e1b17] font-bold cursor-pointer"
        >
          Create Rental
        </Button>
      </div>
      {rentals.length === 0 ? (
        <RentalsEmptyState onClick={() => setIsCreateOpen(true)} />
      ) : (
        <RentalsTable rentals={rentals} />
      )}

      {isCreateOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 p-4 overflow-y-auto"
          onClick={() => setIsCreateOpen(false)}
        >
          <div className="min-h-full flex items-center justify-center">
            <div
              className="w-full max-w-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              {formLoading ? (
                <div className="bg-white rounded-xl border shadow-sm p-10 flex justify-center">
                  <div className="h-8 w-8 border-4 border-[#17cf91] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <CreateRentalForm
                  customers={formCustomers}
                  onClose={() => setIsCreateOpen(false)}
                  onSuccess={async () => {
                    setIsCreateOpen(false);
                    setLoading(true);
                    await fetchRentals();
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
