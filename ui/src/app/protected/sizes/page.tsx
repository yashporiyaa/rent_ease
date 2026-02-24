"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createItemSize,
  deleteItemSize,
  getItemSizes,
  updateItemSize,
} from "@/lib/api/item-sizes";
import { ItemSize } from "@/types";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "react-toastify";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { TablePagination } from "@/components/common/table-pagination";

type SizeForm = {
  name: string;
};

const initialForm: SizeForm = {
  name: "",
};

export default function SizesPage() {
  const [sizes, setSizes] = useState<ItemSize[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSize, setEditingSize] = useState<ItemSize | null>(null);
  const [deletingSize, setDeletingSize] = useState<ItemSize | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [form, setForm] = useState<SizeForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const pageTitle = useMemo(
    () => (editingSize ? "Edit Size" : "Add Size"),
    [editingSize],
  );
  const totalPages = Math.max(1, Math.ceil(sizes.length / pageSize));
  const pagedSizes = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sizes.slice(start, start + pageSize);
  }, [sizes, page]);

  const fetchSizes = useCallback(async () => {
    try {
      const res = await getItemSizes();
      setSizes(res.data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch sizes";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSizes();
  }, [fetchSizes]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const openCreateModal = () => {
    setEditingSize(null);
    setForm(initialForm);
    setIsModalOpen(true);
  };

  const openEditModal = (size: ItemSize) => {
    setEditingSize(size);
    setForm({ name: size.name });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) {
      return;
    }
    setIsModalOpen(false);
    setEditingSize(null);
    setForm(initialForm);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Size name is required");
      return;
    }

    setSubmitting(true);
    try {
      if (editingSize) {
        await updateItemSize(editingSize.id, { name: form.name.trim() });
        toast.success("Size updated successfully");
      } else {
        await createItemSize({ name: form.name.trim() });
        toast.success("Size created successfully");
      }

      closeModal();
      setLoading(true);
      await fetchSizes();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save size";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingSize) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteItemSize(deletingSize.id);
      toast.success("Size deleted successfully");
      setSizes((prev) => prev.filter((size) => size.id !== deletingSize.id));
      setDeletingSize(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete size";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0e1b17]">Sizes</h1>
          <p className="text-slate-500 mt-1">
            Manage sizes used for inventory items.
          </p>
        </div>
        <Button
          variant="brand"
          onClick={openCreateModal}
          className="rounded-full bg-[#17cf91] text-[#0e1b17] font-bold cursor-pointer"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Size
        </Button>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="px-6 py-4 text-left">ID</TableHead>
              <TableHead className="px-6 py-4 text-left">Size</TableHead>
              <TableHead className="px-6 py-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y">
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="px-6 py-8 text-center text-slate-500"
                >
                  Loading sizes...
                </TableCell>
              </TableRow>
            ) : sizes.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="px-6 py-8 text-center text-slate-500"
                >
                  No sizes created yet.
                </TableCell>
              </TableRow>
            ) : (
              pagedSizes.map((size) => (
                <TableRow key={size.id} className="hover:bg-slate-50">
                  <TableCell className="px-6 py-4 text-slate-600">{size.id}</TableCell>
                  <TableCell className="px-6 py-4 font-medium text-[#0e1b17]">
                    {size.name}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="destructive"
                        type="button"
                        onClick={() => openEditModal(size)}
                        className="h-8 w-8 rounded-lg border flex items-center justify-center text-green-600 bg-white hover:bg-green-100 cursor-pointer"
                        aria-label={`Edit ${size.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        type="button"
                        onClick={() => setDeletingSize(size)}
                        className="h-8 w-8 rounded-lg border flex items-center justify-center text-red-600 bg-white hover:bg-red-100 cursor-pointer"
                        aria-label={`Delete ${size.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          page={page}
          pageSize={pageSize}
          totalItems={sizes.length}
          onPageChange={setPage}
        />
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

                <Input
                  className="border p-3 rounded-xl w-full mb-6"
                  placeholder="Size name"
                  value={form.name}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, name: event.target.value }))
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
        open={Boolean(deletingSize)}
        title="Delete Size"
        description={
          deletingSize
            ? `Are you sure you want to delete \"${deletingSize.name}\"? This action cannot be undone.`
            : ""
        }
        loading={isDeleting}
        onConfirm={() => void handleDelete()}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setDeletingSize(null);
          }
        }}
      />
    </div>
  );
}
