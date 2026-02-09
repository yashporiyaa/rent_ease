"use client";

import { useEffect, useState } from "react";
import { CustomersTable } from "@/components/customers/customers-table";
import { CustomersEmptyState } from "@/components/customers/customers-empty-state";

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
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="h-8 w-8 border-4 border-[#17cf91] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (customers.length === 0) {
    return <CustomersEmptyState />;
  }

  return <CustomersTable customers={customers} />;
}
