import { CreditCard } from "lucide-react";
import { useMemo, useState } from "react";
import { PaymentsTableProps } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TablePagination } from "@/components/common/table-pagination";

export function PaymentsTable({ payments }: PaymentsTableProps) {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const paymentRows = useMemo(() => payments ?? [], [payments]);
  const totalPages = Math.max(1, Math.ceil(paymentRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedPayments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return paymentRows.slice(start, start + pageSize);
  }, [currentPage, paymentRows]);

  if (!payments) return null;

  if (paymentRows.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl border text-slate-500">
        No payments recorded yet.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm">
      <div className="p-6 border-b">
        <h2 className="text-lg font-bold text-[#0e1b17]">
          Payments
        </h2>
      </div>

      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="px-6 py-4 text-left">Date</TableHead>
            <TableHead className="px-6 py-4 text-left">Method</TableHead>
            <TableHead className="px-6 py-4 text-left">Reference</TableHead>
            <TableHead className="px-6 py-4 text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="divide-y">
          {pagedPayments.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="px-6 py-4">
                {new Date(p.paidAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="px-6 py-4 flex items-center gap-2">
                <CreditCard size={14} className="text-[#17cf91]" />
                {p.method}
              </TableCell>
              <TableCell className="px-6 py-4 text-slate-600">
                {p.reference || "—"}
              </TableCell>
              <TableCell className="px-6 py-4 text-right font-bold">
                ₹{p.amount}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        page={currentPage}
        pageSize={pageSize}
        totalItems={paymentRows.length}
        onPageChange={(nextPage) => setPage(Math.max(1, Math.min(nextPage, totalPages)))}
      />
    </div>
  );
}
