import { Package } from "lucide-react";

export function ItemsTable({
  items,
}: {
  items: { id: string; name: string; category: string; price: number }[];
}) {
  return (
    <div className="bg-white rounded-xl border shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-4 text-left">Item</th>
            <th className="px-6 py-4 text-left">Category</th>
            <th className="px-6 py-4 text-right">Price</th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50">
              <td className="px-6 py-4 flex items-center gap-2">
                <Package size={16} className="text-[#17cf91]" />
                {item.name}
              </td>
              <td className="px-6 py-4 text-slate-600">
                {item.category}
              </td>
              <td className="px-6 py-4 text-right font-bold">
                ₹{item.price}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
