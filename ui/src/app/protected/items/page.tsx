"use client";

import { useCallback, useEffect, useState } from "react";
import { ItemsTable } from "@/components/items/items-table";
import { ItemsEmptyState } from "@/components/items/items-empty-state";
import { Button } from "@/components/ui/button";
import { getItems } from "@/lib/api/customers";
import { toast } from "react-toastify";
import { CreateItemForm } from "@/components/items/create-item-form";
import { InventoryItem } from "@/types";

export default function ItemsPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchItemsData = useCallback(async () => {
    try {
      const res = await getItems();
      setItems(res.data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch items";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchItemsData();
  }, [fetchItemsData]);

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
          variant="brand"
          onClick={() => setIsCreateOpen(true)}
          className="rounded-full bg-[#17cf91] text-[#0e1b17] font-bold cursor-pointer"
        >
          Add Item
        </Button>
      </div>
      {items.length === 0 ? <ItemsEmptyState onClick={() => setIsCreateOpen(true)} /> : <ItemsTable items={items} />}

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
              <CreateItemForm
                onClose={() => setIsCreateOpen(false)}
                onSuccess={async () => {
                  setIsCreateOpen(false);
                  setLoading(true);
                  await fetchItemsData();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
