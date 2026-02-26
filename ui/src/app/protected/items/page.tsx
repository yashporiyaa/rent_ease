"use client";

import { useCallback, useEffect, useState } from "react";
import { ItemsTable } from "../../../components/items/items-table";
import { ItemsEmptyState } from "../../../components/items/items-empty-state";
import { Button } from "../../../components/ui/button";
import { deleteItem, getItems } from "../../../lib/api/items";
import { getItemCategories } from "../../../lib/api/item-categories";
import { getItemSizes } from "../../../lib/api/item-sizes";
import { toast } from "react-toastify";
import { CreateItemForm } from "../../../components/items/create-item-form";
import { InventoryItem, ItemCategory, ItemSize } from "../../../types";
import { ConfirmDialog } from "../../../components/common/confirm-dialog";

export default function ItemsPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formCategories, setFormCategories] = useState<ItemCategory[]>([]);
  const [formSizes, setFormSizes] = useState<ItemSize[]>([]);
  const [formBootstrapLoading, setFormBootstrapLoading] = useState(false);

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

  const loadItemFormOptions = async () => {
    const [categoriesRes, sizesRes] = await Promise.all([
      getItemCategories(),
      getItemSizes(),
    ]);

    setFormCategories(categoriesRes.data);
    setFormSizes(sizesRes.data);
  };

  const handleOpenCreate = async () => {
    setFormBootstrapLoading(true);
    try {
      await loadItemFormOptions();
      setIsCreateOpen(true);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load item form data";
      toast.error(message);
    } finally {
      setFormBootstrapLoading(false);
    }
  };

  const handleOpenEdit = async (item: InventoryItem) => {
    setFormBootstrapLoading(true);
    try {
      await loadItemFormOptions();
      setEditingItem(item);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load item form data";
      toast.error(message);
    } finally {
      setFormBootstrapLoading(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!deletingItem) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteItem(deletingItem.id);
      toast.success("Item deleted successfully");
      setItems((prev) =>
        prev.filter((currentItem) => currentItem.id !== deletingItem.id),
      );
      setDeletingItem(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete item";
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
          <h1 className="text-2xl font-black text-[#0e1b17]">
            Inventory Items
          </h1>
          <p className="text-slate-500 mt-1">
            Keep your rental inventory organized.
          </p>
        </div>
        <Button
          variant="brand"
          onClick={() => void handleOpenCreate()}
          disabled={formBootstrapLoading}
          className="rounded-full bg-[#17cf91] text-[#0e1b17] font-bold cursor-pointer"
        >
          Add Item
        </Button>
      </div>
      {items.length === 0 ? (
        <ItemsEmptyState onClick={() => void handleOpenCreate()} />
      ) : (
        <ItemsTable
          items={items}
          onEdit={(item) => void handleOpenEdit(item)}
          onDelete={(item) => setDeletingItem(item)}
        />
      )}

      {isCreateOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/55 p-4 sm:p-6 overflow-y-auto backdrop-blur-[1px]"
          onClick={() => setIsCreateOpen(false)}
        >
          <div className="min-h-full flex items-start justify-center py-6 sm:items-center sm:py-10">
            <div
              className="w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <CreateItemForm
                categories={formCategories}
                sizes={formSizes}
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

      {editingItem && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/55 p-4 sm:p-6 overflow-y-auto backdrop-blur-[1px]"
          onClick={() => setEditingItem(null)}
        >
          <div className="min-h-full flex items-start justify-center py-6 sm:items-center sm:py-10">
            <div
              className="w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <CreateItemForm
                item={editingItem}
                categories={formCategories}
                sizes={formSizes}
                onClose={() => setEditingItem(null)}
                onSuccess={async () => {
                  setEditingItem(null);
                  setLoading(true);
                  await fetchItemsData();
                }}
              />
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deletingItem)}
        title="Delete Item"
        description={
          deletingItem
            ? `Are you sure you want to delete \"${deletingItem.fullName}\"? This action cannot be undone.`
            : ""
        }
        loading={isDeleting}
        onConfirm={() => void handleDeleteItem()}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setDeletingItem(null);
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
