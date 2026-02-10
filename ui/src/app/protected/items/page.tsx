"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ItemsTable } from "@/components/items/items-table";
import { ItemsEmptyState } from "@/components/items/items-empty-state";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0e1b17]">
            Inventory Items
          </h1>
          <p className="text-slate-500 mt-1">
            Keep your rental inventory organized.
          </p>
        </div>
        <Button
          asChild
          className="rounded-full bg-[#17cf91] text-[#0e1b17] font-bold"
        >
          <Link href="/protected/items/new">Add Item</Link>
        </Button>
      </div>
      {items.length === 0 ? (
        <ItemsEmptyState />
      ) : (
        <ItemsTable items={items} />
      )}
    </div>
  );
}
