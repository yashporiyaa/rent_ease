import { Package } from "lucide-react";

export function InvoiceItemsTable({
  items,
}: {
  items: {
    id: string;
    item: { name: string };
    quantity: number;
    price: number;
  }[];
}) {
  if(!items || items.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-4 text-left">Item</th>
            <th className="px-6 py-4 text-right">Qty</th>
            <th className="px-6 py-4 text-right">Price</th>
            <th className="px-6 py-4 text-right">Subtotal</th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {items.map((ri) => (
            <tr key={ri.id}>
              <td className="px-6 py-4 flex items-center gap-2">
                <Package size={16} className="text-[#17cf91]" />
                {ri.item.name}
              </td>
              <td className="px-6 py-4 text-right">{ri.quantity}</td>
              <td className="px-6 py-4 text-right">₹{ri.price}</td>
              <td className="px-6 py-4 text-right font-bold">
                ₹{ri.quantity * ri.price}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
