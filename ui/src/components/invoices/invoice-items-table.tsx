import { Package } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TablePagination } from "@/components/common/table-pagination";

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
  const invoiceItems = useMemo(() => items ?? [], [items]);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(invoiceItems.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return invoiceItems.slice(start, start + pageSize);
  }, [currentPage, invoiceItems]);

  if (invoiceItems.length === 0) return null;

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
          {pagedItems.map((ri) => (
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
      <TablePagination
        page={currentPage}
        pageSize={pageSize}
        totalItems={invoiceItems.length}
        onPageChange={(nextPage) => setPage(Math.max(1, Math.min(nextPage, totalPages)))}
      />
    </div>
  );
}
