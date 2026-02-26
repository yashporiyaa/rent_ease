"use client";

import { useCallback, useEffect, useState } from "react";
import { RentalsTable } from "../../../components/rentals/rentals-table";
import { RentalsEmptyState } from "../../../components/rentals/rentals-empty-state";
import { Button } from "../../../components/ui/button";
import { deleteRental, getRentalById, getRentals } from "../../../lib/api/rentals";
import { getCustomers } from "../../../lib/api/customers";
import { getItems } from "../../../lib/api/items";
import { toast } from "react-toastify";
import { CreateRentalForm } from "../../../components/rentals/create-rental-form";
import { CustomerListItem, InventoryItem, RentalRecord } from "../../../types";
import { ConfirmDialog } from "../../../components/common/confirm-dialog";

export default function RentalsPage() {
  const [rentals, setRentals] = useState<RentalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRental, setEditingRental] = useState<RentalRecord | null>(null);
  const [deletingRental, setDeletingRental] = useState<RentalRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formCustomers, setFormCustomers] = useState<CustomerListItem[]>([]);
  const [formItems, setFormItems] = useState<InventoryItem[]>([]);
  const [formBootstrapLoading, setFormBootstrapLoading] = useState(false);

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

  const handleOpenCreate = async () => {
    setFormBootstrapLoading(true);
    try {
      const [customersRes, itemsRes] = await Promise.all([getCustomers(), getItems()]);
      setFormCustomers(customersRes.data);
      setFormItems(itemsRes.data);
      setIsCreateOpen(true);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load rental form data";
      toast.error(message);
    } finally {
      setFormBootstrapLoading(false);
    }
  };

  const handleEditRental = async (rental: RentalRecord) => {
    setFormBootstrapLoading(true);
    try {
      const [rentalRes, customersRes, itemsRes] = await Promise.all([
        getRentalById(rental.id),
        getCustomers(),
        getItems(),
      ]);

      setEditingRental(rentalRes.data as RentalRecord);
      setFormCustomers(customersRes.data);
      setFormItems(itemsRes.data);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load rental form data";
      toast.error(message);
    } finally {
      setFormBootstrapLoading(false);
    }
  };

  const handleDeleteRental = async () => {
    if (!deletingRental) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteRental(deletingRental.id);
      toast.success("Rental deleted successfully");
      setRentals((prev) => prev.filter((rental) => rental.id !== deletingRental.id));
      setDeletingRental(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete rental";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

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
          onClick={() => void handleOpenCreate()}
          disabled={formBootstrapLoading}
          className="rounded-full bg-[#17cf91] text-[#0e1b17] font-bold cursor-pointer"
        >
          Create Rental
        </Button>
      </div>

      {rentals.length === 0 ? (
        <RentalsEmptyState onClick={() => void handleOpenCreate()} />
      ) : (
        <RentalsTable
          rentals={rentals}
          onEdit={(rental) => void handleEditRental(rental)}
          onDelete={(rental) => setDeletingRental(rental)}
        />
      )}

      {isCreateOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/55 p-4 sm:p-6 overflow-y-auto backdrop-blur-[1px]"
          onClick={() => setIsCreateOpen(false)}
        >
          <div className="min-h-full flex items-start justify-center py-6 sm:items-center sm:py-10">
            <div
              className="w-full max-w-345"
              onClick={(e) => e.stopPropagation()}
            >
              <CreateRentalForm
                customers={formCustomers}
                items={formItems}
                onClose={() => setIsCreateOpen(false)}
                onSuccess={async () => {
                  setIsCreateOpen(false);
                  setLoading(true);
                  await fetchRentals();
                }}
              />
            </div>
          </div>
        </div>
      )}

      {editingRental && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/55 p-4 sm:p-6 overflow-y-auto backdrop-blur-[1px]"
          onClick={() => setEditingRental(null)}
        >
          <div className="min-h-full flex items-start justify-center py-6 sm:items-center sm:py-10">
            <div
              className="w-full max-w-345"
              onClick={(e) => e.stopPropagation()}
            >
              <CreateRentalForm
                rental={editingRental}
                customers={formCustomers}
                items={formItems}
                onClose={() => setEditingRental(null)}
                onSuccess={async () => {
                  setEditingRental(null);
                  setLoading(true);
                  await fetchRentals();
                }}
              />
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deletingRental)}
        title="Delete Rental"
        description={
          deletingRental
            ? `Are you sure you want to delete rental for \"${deletingRental.customer.name}\"? This action cannot be undone.`
            : ""
        }
        loading={isDeleting}
        onConfirm={() => void handleDeleteRental()}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setDeletingRental(null);
          }
        }}
      />

      {formBootstrapLoading ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div className="h-8 w-8 border-4 border-[#17cf91] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : null}
    </div>
  );
}
