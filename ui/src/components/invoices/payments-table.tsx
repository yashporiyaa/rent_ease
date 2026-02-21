import { CreditCard } from "lucide-react";
import { PaymentsTableProps } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function PaymentsTable({ payments }: PaymentsTableProps) {
  if (!payments) return null;

  if (payments.length === 0) {
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
          {payments.map((p) => (
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
    </div>
  );
}
