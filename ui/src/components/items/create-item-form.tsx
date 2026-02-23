"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { createItem, updateItem } from "@/lib/api/items";
import { toast } from "react-toastify";
import { ImagePlus, Trash2, X } from "lucide-react";
import { ItemCategory, InventoryItem, ItemSize } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    <div className="max-w-2xl bg-white p-8 rounded-xl border shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-black text-[#0e1b17]">
          {isEditMode ? "Edit Inventory Item" : "Add Inventory Item"}
        </h1>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="cursor-pointer"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          className="border p-3 rounded-xl w-full"
          placeholder="Short name"
          value={shortName}
          onChange={(e) => setShortName(e.target.value)}
        />

        <Input
          className="border p-3 rounded-xl w-full"
          placeholder="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>

      <textarea
        className="border p-3 rounded-xl w-full mt-4 min-h-24"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="w-full border p-3 rounded-xl h-12">
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
          <SelectTrigger className="w-full border p-3 rounded-xl h-12">
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
        <Input
          className="border p-3 rounded-xl w-full"
          placeholder="Price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <Input
          type="date"
          className="border p-3 rounded-xl w-full"
          value={entryDate}
          onChange={(e) => setEntryDate(e.target.value)}
        />
        <Input
          className="border p-3 rounded-xl w-full"
          placeholder="Quantity"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium text-[#0e1b17] mb-2">
          Images (optional, up to 5)
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {imageSlots.map((image, index) => (
            <div
              key={`slot-${index}`}
              className="relative h-24 rounded-xl border bg-slate-50 overflow-hidden"
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
                className="absolute top-0 right-0 h-7 w-7 rounded-full bg-white/95 border shadow-sm flex items-center justify-center cursor-pointer"
              >
                <ImagePlus className="h-4 w-4 text-[#0e1b17]" />
              </Label>

              {image && (
                <button
                  type="button"
                  onClick={() => clearImageSlot(index)}
                  className="absolute bottom-2 right-2 h-7 w-7 rounded-full bg-white/95 border shadow-sm flex items-center justify-center cursor-pointer text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {selectedImages.length} image(s) selected
        </p>
      </div>

      {error && <p className="text-red-600 text-sm mt-4">{error}</p>}

      <Button
        variant="brand"
        onClick={submit}
        disabled={
          activeImageSlot !== null ||
          categories.length === 0 ||
          sizes.length === 0
        }
        className="w-full rounded-full bg-[#17cf91] text-[#0e1b17] font-bold cursor-pointer mt-6"
      >
        {activeImageSlot !== null
          ? "Processing image..."
          : isEditMode
            ? "Update Item"
            : "Create Item"}
      </Button>
    </div>
  );
}
