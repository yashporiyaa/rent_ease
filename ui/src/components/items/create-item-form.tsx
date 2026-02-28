"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useRouter } from "next/navigation";
import { createItem, updateItem } from "../../lib/api/items";
import { toast } from "react-toastify";
import { ImagePlus, Package2, Trash2, X } from "lucide-react";
import { ItemCategory, InventoryItem, ItemSize } from "../../types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const MAX_IMAGE_SLOTS = 5;

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

const getInitialImageSlots = (images?: string[] | null) => {
  const slots = Array.from({ length: MAX_IMAGE_SLOTS }, () => "");
  (images ?? []).slice(0, MAX_IMAGE_SLOTS).forEach((image, index) => {
    slots[index] = image;
  });
  return slots;
};

export function CreateItemForm({
  categories,
  sizes,
  onSuccess,
  onClose,
  item,
}: {
  categories: ItemCategory[];
  sizes: ItemSize[];
  onSuccess?: () => void;
  onClose?: () => void;
  item?: InventoryItem | null;
}) {
  const router = useRouter();
  const isEditMode = Boolean(item?.id);

  const [shortName, setShortName] = useState(item?.shortName ?? "");
  const [fullName, setFullName] = useState(item?.fullName ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [categoryId, setCategoryId] = useState("");
  const [sizeId, setSizeId] = useState("");
  const [price, setPrice] = useState(item ? String(item.price) : "");
  const [entryDate, setEntryDate] = useState(
    item?.entryDate ? String(item.entryDate).slice(0, 10) : "",
  );
  const [quantity, setQuantity] = useState(
    item?.quantity ? String(item.quantity) : "",
  );
  const [imageSlots, setImageSlots] = useState<string[]>(
    getInitialImageSlots(item?.images),
  );
  const [activeImageSlot, setActiveImageSlot] = useState<number | null>(null);
  const [error, setError] = useState("");

  const selectedImages = useMemo(
    () => imageSlots.filter((image) => Boolean(image)),
    [imageSlots],
  );

  useEffect(() => {
    if (item?.categoryId) {
      setCategoryId(item.categoryId);
    } else if (item?.category) {
      const matchedCategory = categories.find(
        (category) => category.name === item.category,
      );
      setCategoryId(matchedCategory?.id ?? "");
    } else {
      setCategoryId("");
    }

    if (item?.sizeId) {
      setSizeId(item.sizeId);
    } else if (item?.size) {
      const matchedSize = sizes.find((size) => size.name === item.size);
      setSizeId(matchedSize?.id ?? "");
    } else {
      setSizeId("");
    }
  }, [categories, item?.category, item?.categoryId, item?.size, item?.sizeId, sizes]);

  const handleImageSlotChange = async (
    slotIndex: number,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setActiveImageSlot(slotIndex);
    try {
      const imageData = await fileToDataUrl(file);
      setImageSlots((prev) => {
        const updated = [...prev];
        updated[slotIndex] = imageData;
        return updated;
      });
      setError("");
    } catch {
      setError("Failed to read selected image.");
    } finally {
      setActiveImageSlot(null);
    }
  };

  const clearImageSlot = (slotIndex: number) => {
    setImageSlots((prev) => {
      const updated = [...prev];
      updated[slotIndex] = "";
      return updated;
    });
  };

  const submit = async () => {
    if (
      !shortName ||
      !fullName ||
      !categoryId ||
      !sizeId ||
      !price ||
      !entryDate ||
      !quantity
    ) {
      setError("All fields are required.");
      return;
    }

    try {
      if (isEditMode && item?.id) {
        await updateItem(item.id, {
          shortName,
          fullName,
          categoryId,
          description: description || undefined,
          sizeId,
          price: Number(price),
          entryDate,
          quantity: Number(quantity),
          images: selectedImages,
        });
        toast.success("Item updated successfully");
      } else {
        await createItem(
          shortName,
          fullName,
          categoryId,
          description || undefined,
          sizeId,
          Number(price),
          entryDate,
          Number(quantity),
          selectedImages,
        );
        toast.success("Item created successfully");
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/protected/items");
      }
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Failed to save item";
      setError(message);
      toast.error(message);
    }
  };

  return (
    <div className="max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.14)]">
      <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <Package2 className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              {isEditMode ? "Edit Inventory Item" : "Add Inventory Item"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Add product details, pricing and stock availability.
            </p>
          </div>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="cursor-pointer"
          >
            <X className="h-5 w-5 text-slate-500" />
          </Button>
        )}
      </div>

      <div className="space-y-4 px-6 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          className="h-11 w-full rounded-xl border-slate-200 bg-slate-50"
          placeholder="Short name"
          value={shortName}
          onChange={(e) => setShortName(e.target.value)}
        />

        <Input
          className="h-11 w-full rounded-xl border-slate-200 bg-slate-50"
          placeholder="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>

      <textarea
        className="min-h-24 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none ring-0"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-slate-50 px-3">
            <SelectValue
              placeholder="Select category"
            />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sizeId} onValueChange={setSizeId}>
          <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-slate-50 px-3">
            <SelectValue
              placeholder="Select size"
            />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {sizes.map((size) => (
              <SelectItem key={size.id} value={size.id}>
                {size.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          className="h-11 w-full rounded-xl border-slate-200 bg-slate-50"
          placeholder="Price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <Input
          type="date"
          className="h-11 w-full rounded-xl border-slate-200 bg-slate-50"
          value={entryDate}
          onChange={(e) => setEntryDate(e.target.value)}
        />
        <Input
          className="h-11 w-full rounded-xl border-slate-200 bg-slate-50"
          placeholder="Quantity"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-slate-700">
          Images (optional, up to 5)
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {imageSlots.map((image, index) => (
            <div
              key={`slot-${index}`}
              className="relative h-24 overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
            >
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image}
                  alt={`Item image ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-xs text-slate-500">
                  Image {index + 1}
                </div>
              )}

              <Input
                id={`item-image-slot-${index}`}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => void handleImageSlotChange(index, event)}
              />

              <Label
                htmlFor={`item-image-slot-${index}`}
                className="absolute top-2 right-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border bg-white/95 shadow-sm"
              >
                <ImagePlus className="h-4 w-4 text-[#0e1b17]" />
              </Label>

              {image && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon-xs"
                  onClick={() => clearImageSlot(index)}
                  className="absolute right-2 bottom-2 h-7 w-7 rounded-full border bg-white/95 text-red-600 shadow-sm"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {selectedImages.length} image(s) selected
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button
        variant="brand"
        onClick={submit}
        disabled={
          activeImageSlot !== null ||
          categories.length === 0 ||
          sizes.length === 0
        }
        className="mt-2 h-11 w-full cursor-pointer rounded-xl bg-[#17cf91] font-bold text-white"
      >
        {activeImageSlot !== null
          ? "Processing image..."
          : isEditMode
            ? "Update Item"
            : "Create Item"}
      </Button>
      </div>
    </div>
  );
}
