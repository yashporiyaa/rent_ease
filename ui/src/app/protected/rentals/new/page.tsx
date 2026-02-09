"use client";

import { useEffect, useState } from "react";
import { CreateRentalForm } from "@/components/rentals/create-rental-form";

export default function CreateRentalPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersRes, itemsRes] = await Promise.all([
          fetch("http://localhost:3001/customers", {
            credentials: "include",
          }),
          fetch("http://localhost:3001/items", {
            credentials: "include",
          }),
        ]);

        const customersJson = await customersRes.json();
        const itemsJson = await itemsRes.json();

        setCustomers(customersJson.data);
        setItems(itemsJson.data);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="h-8 w-8 border-4 border-[#17cf91] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <CreateRentalForm
      customers={customers}
      items={items}
    />
  );
}
