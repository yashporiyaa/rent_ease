"use client";

import { useCallback, useEffect, useState } from "react";
import { CustomersTable } from "@/components/customers/customers-table";
import { CustomersEmptyState } from "@/components/customers/customers-empty-state";
import { Button } from "@/components/ui/button";
import { getCustomers } from "@/lib/api/customers";
import { toast } from "react-toastify";
import { CreateCustomerForm } from "@/components/customers/create-customer-form";
import { CustomerListItem } from "@/types";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await getCustomers();
      setCustomers(res.data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch customers";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCustomers();
  }, [fetchCustomers]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-75">
        <div className="h-8 w-8 border-4 border-[#17cf91] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0e1b17]">Customers</h1>
          <p className="text-slate-500 mt-1">
            Manage all your rental customers.
          </p>
        </div>
        <Button
          variant="brand"
          onClick={() => setIsCreateOpen(true)}
          className="rounded-full bg-[#17cf91] text-[#0e1b17] font-bold"
        >
          Add Customer
        </Button>
      </div>
      {customers.length === 0 ? (
        <CustomersEmptyState />
      ) : (
        <CustomersTable customers={customers} />
      )}

      {isCreateOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 p-4 overflow-y-auto"
          onClick={() => setIsCreateOpen(false)}
        >
          <div className="min-h-full flex items-center justify-center">
            <div
              className="w-full max-w-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <CreateCustomerForm
                onClose={() => setIsCreateOpen(false)}
                onSuccess={async () => {
                  setIsCreateOpen(false);
                  setLoading(true);
                  await fetchCustomers();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
