"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { createItem } from "@/lib/api/items";
import { toast } from "react-toastify";
import { X } from "lucide-react";

export function CreateItemForm({
  onSuccess,
  onClose,
}: {
  onSuccess?: () => void;
  onClose?: () => void;
}) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");

  const submit = async () => {
    if (!name || !category || !price) {
      setError("All fields are required.");
      return;
    }

    try {
      await createItem(name, category, Number(price));
      toast.success("Item created successfully");
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/protected/items");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create item";
      setError(message);
      toast.error(message);
    }
  };

  return (
    <div className="max-w-xl bg-white p-8 rounded-xl border shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-black text-[#0e1b17]">
          Add Inventory Item
        </h1>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <input
        className="border p-3 rounded-xl w-full mb-4"
        placeholder="Item name"
        onChange={(e) => setName(e.target.value)}
      />

      <input
        className="border p-3 rounded-xl w-full mb-4"
        placeholder="Category"
        onChange={(e) => setCategory(e.target.value)}
      />

      <input
        className="border p-3 rounded-xl w-full mb-6"
        placeholder="Price"
        type="number"
        onChange={(e) => setPrice(e.target.value)}
      />

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <Button
        variant="brand"
        onClick={submit}
        className="w-full rounded-full bg-[#17cf91] text-[#0e1b17] font-bold"
      >
        Create Item
      </Button>
    </div>
  );
}
