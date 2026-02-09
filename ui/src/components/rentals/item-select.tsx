import { Plus, Minus } from "lucide-react";
import { items } from "@/lib/mock/items";

export function ItemSelect({
  selectedItems,
  setSelectedItems,
  items,
}: {
  selectedItems: Record<string, number>;
  setSelectedItems: (v: Record<string, number>) => void;
  items: { id: string; name: string; price: number }[];
}) {
  const updateQty = (id: string, qty: number) => {
    const updated = { ...selectedItems };
    if (qty <= 0) delete updated[id];
    else updated[id] = qty;
    setSelectedItems(updated);
  };

  return (
    <div>
      <h3 className="font-semibold text-[#0e1b17] mb-3">
        Select Items
      </h3>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between border p-4 rounded-xl"
          >
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-slate-500">
                ₹{item.price}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  updateQty(item.id, (selectedItems[item.id] || 0) - 1)
                }
                className="p-2 rounded-lg border"
              >
                <Minus size={14} />
              </button>

              <span className="w-6 text-center">
                {selectedItems[item.id] || 0}
              </span>

              <button
                onClick={() =>
                  updateQty(item.id, (selectedItems[item.id] || 0) + 1)
                }
                className="p-2 rounded-lg border"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
