"use client";

import { useEffect, useState } from "react";
import { ItemsTable } from "@/components/items/items-table";
import { ItemsEmptyState } from "@/components/items/items-empty-state";

export default function ItemsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/items", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setItems(data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 border-4 border-[#17cf91] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return <ItemsEmptyState />;
  }

  return <ItemsTable items={items} />;
}
