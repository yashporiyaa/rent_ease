"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  createItemCategory,
  deleteItemCategory,
  getItemCategories,
  updateItemCategory,
} from "@/lib/api/item-categories";
import { ItemCategory } from "@/types";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "react-toastify";
import { ConfirmDialog } from "@/components/common/confirm-dialog";

type CategoryForm = {
  name: string;
  imageUrl: string;
};

const initialForm: CategoryForm = {
  name: "",
  imageUrl: "",
};

export default function ItemCategoriesPage() {
  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ItemCategory | null>(null);
  const [form, setForm] = useState<CategoryForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<ItemCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const pageTitle = useMemo(
    () => (editingCategory ? "Edit Category" : "Add Category"),
    [editingCategory],
  );

  const fetchCategories = useCallback(async () => {
    try {
      const res = await getItemCategories();
      setCategories(res.data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch categories";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  const openCreateModal = () => {
    setEditingCategory(null);
    setForm(initialForm);
    setIsModalOpen(true);
  };

  const openEditModal = (category: ItemCategory) => {
    setEditingCategory(category);
    setForm({
      name: category.name,
      imageUrl: category.imageUrl ?? "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) {
      return;
    }
    setIsModalOpen(false);
    setEditingCategory(null);
    setForm(initialForm);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    setSubmitting(true);
    try {
      if (editingCategory) {
        await updateItemCategory(editingCategory.id, {
          name: form.name.trim(),
          imageUrl: form.imageUrl.trim() || undefined,
        });
        toast.success("Category updated successfully");
      } else {
        await createItemCategory({
          name: form.name.trim(),
          imageUrl: form.imageUrl.trim() || undefined,
        });
        toast.success("Category created successfully");
      }

      closeModal();
      setLoading(true);
      await fetchCategories();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save category";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteItemCategory(deletingCategory.id);
      toast.success("Category deleted successfully");
      setCategories((prev) =>
        prev.filter((category) => category.id !== deletingCategory.id),
      );
      setDeletingCategory(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete category";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0e1b17]">Item Categories</h1>
          <p className="text-slate-500 mt-1">
            Manage categories used for inventory items.
          </p>
        </div>
        <Button
          variant="brand"
          onClick={openCreateModal}
          className="rounded-full bg-[#17cf91] text-[#0e1b17] font-bold cursor-pointer"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left">ID</th>
              <th className="px-6 py-4 text-left">Image</th>
              <th className="px-6 py-4 text-left">Category</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                  Loading categories...
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                  No categories created yet.
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-slate-600">{category.id}</td>
                  <td className="px-6 py-4">
                    {category.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        className="h-10 w-10 rounded-lg object-cover border"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-lg border bg-slate-100" />
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-[#0e1b17]">{category.name}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(category)}
                        className="h-8 w-8 rounded-lg border flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
                        aria-label={`Edit ${category.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingCategory(category)}
                        className="h-8 w-8 rounded-lg border flex items-center justify-center text-red-600 hover:bg-red-50 cursor-pointer"
                        aria-label={`Delete ${category.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 p-4 overflow-y-auto"
          onClick={closeModal}
        >
          <div className="min-h-full flex items-center justify-center">
            <div
              className="w-full max-w-lg"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="bg-white p-8 rounded-xl border shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-black text-[#0e1b17]">{pageTitle}</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={closeModal}
                    className="cursor-pointer"
                    disabled={submitting}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <input
                  className="border p-3 rounded-xl w-full mb-4"
                  placeholder="Category name"
                  value={form.name}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                />

                <input
                  className="border p-3 rounded-xl w-full mb-6"
                  placeholder="Image URL"
                  value={form.imageUrl}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, imageUrl: event.target.value }))
                  }
                />

                <div className="flex items-center justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={closeModal}
                    disabled={submitting}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="brand"
                    onClick={() => void handleSave()}
                    disabled={submitting}
                    className="bg-[#17cf91] text-[#0e1b17] font-bold cursor-pointer"
                  >
                    {submitting ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deletingCategory)}
        title="Delete Category"
        description={
          deletingCategory
            ? `Are you sure you want to delete \"${deletingCategory.name}\"? This action cannot be undone.`
            : ""
        }
        loading={isDeleting}
        onConfirm={() => void handleDelete()}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setDeletingCategory(null);
          }
        }}
      />
    </div>
  );
}
