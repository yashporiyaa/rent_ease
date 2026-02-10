"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CustomersTable } from "@/components/customers/customers-table";
import { CustomersEmptyState } from "@/components/customers/customers-empty-state";
import { Button } from "@/components/ui/button";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch("http://localhost:3001/customers", {
          credentials: "include",
        });
        const data = await res.json();
        setCustomers(data.data);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

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
          <h1 className="text-2xl font-black text-[#0e1b17]">
            Customers
          </h1>
          <p className="text-slate-500 mt-1">
            Manage all your rental customers.
          </p>
        </div>
        <Button
          asChild
          className="rounded-full bg-[#17cf91] text-[#0e1b17] font-bold"
        >
          <Link href="/protected/customers/new">Add Customer</Link>
        </Button>
      </div>
      {customers.length === 0 ? (
        <CustomersEmptyState />
      ) : (
        <CustomersTable customers={customers} />
      )}
    </div>
  );
}
