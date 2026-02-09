import Link from "next/link";
import { invoices } from "@/lib/mock/invoices";
import { InvoiceStatusBadge } from "./invoice-status-badge";
import { Eye } from "lucide-react";

export function InvoicesTable() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-black text-[#0e1b17]">
          Invoices
        </h1>
        <p className="text-slate-500 mt-1">
          Track all invoices and payment statuses.
        </p>
      </div>

      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-6 py-4 text-left">Invoice</th>
            <th className="px-6 py-4 text-left">Customer</th>
            <th className="px-6 py-4 text-left">Due Date</th>
            <th className="px-6 py-4 text-left">Amount</th>
            <th className="px-6 py-4 text-left">Status</th>
            <th className="px-6 py-4 text-right">Action</th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {invoices.map((invoice) => (
            <tr key={invoice.id} className="hover:bg-slate-50">
              <td className="px-6 py-4 font-medium">
                {invoice.id}
              </td>
              <td className="px-6 py-4">
                {invoice.customer}
              </td>
              <td className="px-6 py-4 text-slate-600">
                {invoice.dueDate}
              </td>
              <td className="px-6 py-4 font-semibold">
                ₹{invoice.amount}
              </td>
              <td className="px-6 py-4">
                <InvoiceStatusBadge status={invoice.status as any} />
              </td>
              <td className="px-6 py-4 text-right">
                <Link
                  href={`/protected/invoices/${invoice.id}`}
                  className="inline-flex items-center gap-2 text-[#17cf91] font-bold hover:underline"
                >
                  <Eye size={16} />
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
