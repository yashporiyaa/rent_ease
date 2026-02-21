import { Plus, Minus } from "lucide-react";
import { Button } from "../ui/button";

export function ItemSelect({
  selectedItems,
  setSelectedItems,
  items,
}: {
  selectedItems: Record<string, number>;
  setSelectedItems: (v: Record<string, number>) => void;
  items: { id: string; name: string; price: number; available?: number }[];
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
        {items.map((item) => {
          const maxAvailable = item.available ?? Number.POSITIVE_INFINITY;
          const currentQty = selectedItems[item.id] || 0;
          const canIncrease = currentQty < maxAvailable;

          return (
            <div
              key={item.id}
              className="flex items-center justify-between border p-4 rounded-xl"
            >
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-slate-500">₹{item.price}</p>
                {item.available !== undefined && (
                  <p className="text-xs text-slate-500">
                    {item.available} available
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() =>
                    updateQty(item.id, (selectedItems[item.id] || 0) - 1)
                  }
                  className="p-2 rounded-lg border"
                >
                  <Minus size={14} />
                </Button>

                <span className="w-6 text-center">{currentQty}</span>

                <Button
                  onClick={() => updateQty(item.id, currentQty + 1)}
                  className="p-2 rounded-lg border disabled:opacity-50"
                  disabled={!canIncrease}
                >
                  <Plus size={14} />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
