import { Package } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function InvoiceItemsTable({
  items,
}: {
  items: {
    id: string;
    item: { fullName: string };
    quantity: number;
    price: number;
  }[];
}) {
  if (!items || items.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border shadow-sm">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="px-6 py-4 text-left">Item</TableHead>
            <TableHead className="px-6 py-4 text-right">Qty</TableHead>
            <TableHead className="px-6 py-4 text-right">Price</TableHead>
            <TableHead className="px-6 py-4 text-right">Subtotal</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="divide-y">
          {items.map((ri) => (
            <TableRow key={ri.id}>
              <TableCell className="px-6 py-4 flex items-center gap-2">
                <Package size={16} className="text-[#17cf91]" />
                {ri.item.fullName}
              </TableCell>
              <TableCell className="px-6 py-4 text-right">{ri.quantity}</TableCell>
              <TableCell className="px-6 py-4 text-right">₹{ri.price}</TableCell>
              <TableCell className="px-6 py-4 text-right font-bold">
                ₹{ri.quantity * ri.price}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
