import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function RentalItemsTable({
  items,
}: {
  items: {
    id: string;
    item: { fullName: string };
    quantity: number;
    price: number;
  }[];
}) {
  return (
    <div className="bg-white rounded-xl border shadow-sm mb-8">
      <div className="p-6 border-b">
        <h2 className="text-lg font-bold text-[#0e1b17]">
          Rented Items
        </h2>
      </div>

      <Table>
        <TableHeader className="bg-slate-50 text-slate-600">
          <TableRow>
            <TableHead className="px-6 py-4 text-left">Item</TableHead>
            <TableHead className="px-6 py-4 text-left">Quantity</TableHead>
            <TableHead className="px-6 py-4 text-left">Price</TableHead>
            <TableHead className="px-6 py-4 text-right">Subtotal</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="divide-y">
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="px-6 py-4 font-medium">{item.item.fullName}</TableCell>
              <TableCell className="px-6 py-4">{item.quantity}</TableCell>
              <TableCell className="px-6 py-4 font-semibold">₹{item.price}</TableCell>
              <TableCell className="px-6 py-4 text-right font-semibold">
                ₹{item.price * item.quantity}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
