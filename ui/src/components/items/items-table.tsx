import { Package, Pencil, Trash2 } from "lucide-react";
import { InventoryItem } from "@/types";

export function ItemsTable({
  items,
  onEdit,
  onDelete,
}: {
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
}) {
  return (
    <div className="bg-white rounded-xl border shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-4 text-left">Image</th>
            <th className="px-6 py-4 text-left">Short Name</th>
            <th className="px-6 py-4 text-left">Full Name</th>
            <th className="px-6 py-4 text-left">Category</th>
            <th className="px-6 py-4 text-left">Size</th>
            <th className="px-6 py-4 text-right">Qty</th>
            <th className="px-6 py-4 text-right">Price</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50">
              <td className="px-6 py-4">
                {item.images?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.images[0]}
                    alt={item.fullName}
                    className="h-10 w-10 rounded-lg object-cover border"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-lg border bg-slate-100 flex items-center justify-center">
                    <Package size={14} className="text-slate-400" />
                  </div>
                )}
              </td>
              <td className="px-6 py-4 font-medium text-[#0e1b17]">{item.shortName}</td>
              <td className="px-6 py-4 text-slate-700">
                {item.fullName}
              </td>
              <td className="px-6 py-4 text-slate-600">
                {item.category}
              </td>
              <td className="px-6 py-4 text-slate-600">{item.size || "-"}</td>
              <td className="px-6 py-4 text-right font-medium">
                {item.quantity ?? item.stock ?? 0}
              </td>
              <td className="px-6 py-4 text-right font-bold">
                ₹{item.price}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(item)}
                    className="h-8 w-8 rounded-lg border flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
                    aria-label={`Edit ${item.fullName}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(item)}
                    className="h-8 w-8 rounded-lg border flex items-center justify-center text-red-600 hover:bg-red-50 cursor-pointer"
                    aria-label={`Delete ${item.fullName}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
