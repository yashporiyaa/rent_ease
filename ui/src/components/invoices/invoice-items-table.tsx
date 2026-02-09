export function InvoiceItemsTable({
  items,
}: {
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
}) {
  return (
    <div className="bg-white rounded-xl border shadow-sm mb-8">
      <div className="p-6 border-b">
        <h2 className="text-lg font-bold text-[#0e1b17]">
          Invoice Items
        </h2>
      </div>

      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-6 py-4 text-left">Item</th>
            <th className="px-6 py-4 text-left">Quantity</th>
            <th className="px-6 py-4 text-left">Price</th>
            <th className="px-6 py-4 text-left">Subtotal</th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {items.map((item) => (
            <tr key={item.id}>
              <td className="px-6 py-4 font-medium">
                {item.name}
              </td>
              <td className="px-6 py-4">{item.quantity}</td>
              <td className="px-6 py-4">₹{item.price}</td>
              <td className="px-6 py-4 font-semibold">
                ₹{item.quantity * item.price}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
