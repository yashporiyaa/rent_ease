import Link from "next/link";
import { RentalStatusBadge } from "./rental-status-badge";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils/date";
import { RentalsTableProps } from "@/types";

export function RentalsTable({ rentals }: RentalsTableProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-6 py-4 text-left font-semibold">
                Date
              </th>
              <th className="px-6 py-4 text-left font-semibold">
                Customer
              </th>
              <th className="px-6 py-4 text-right font-semibold">
                Discount
              </th>
              <th className="px-6 py-4 text-right font-semibold">
                Tax
              </th>
              <th className="px-6 py-4 text-right font-semibold">
                Total
              </th>
              <th className="px-6 py-4 text-right font-semibold">
                Advance
              </th>
              <th className="px-6 py-4 text-right font-semibold">
                Pending
              </th>
              <th className="px-6 py-4 text-right font-semibold">
                Deposit
              </th>
              <th className="px-6 py-4 text-left font-semibold">
                Status
              </th>
              <th className="px-6 py-4 text-right font-semibold">
                Edit
              </th>
              <th className="px-6 py-4 text-right font-semibold">
                Delete
              </th>
              <th className="px-6 py-4 text-right font-semibold">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {rentals.map((rental) => (
              <tr
                key={rental.id}
                className="hover:bg-slate-50 transition"
              >
                <td className="px-6 py-4 text-slate-600">
                  {formatDate(rental.bookingAt || rental.startDate)}
                </td>
                <td className="px-6 py-4 font-medium text-[#0e1b17]">
                  {rental.customer.name}
                </td>

                <td className="px-6 py-4 text-right">₹{rental.discountAmount ?? 0}</td>
                <td className="px-6 py-4 text-right">₹{rental.taxAmountValue ?? 0}</td>
                <td className="px-6 py-4 text-right font-semibold">₹{rental.totalAmount}</td>
                <td className="px-6 py-4 text-right">₹{rental.advanceAmount ?? 0}</td>
                <td className="px-6 py-4 text-right">₹{rental.pendingAmount ?? 0}</td>
                <td className="px-6 py-4 text-right">₹{rental.depositAmount ?? 0}</td>

                <td className="px-6 py-4">
                  <RentalStatusBadge status={rental.status} />
                </td>

                <td className="px-6 py-4 text-right">
                  <button type="button" className="text-slate-600 cursor-pointer">
                    <Pencil size={16} />
                  </button>
                </td>

                <td className="px-6 py-4 text-right">
                  <button type="button" className="text-red-600 cursor-pointer">
                    <Trash2 size={16} />
                  </button>
                </td>

                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/protected/rentals/${rental.id}`}
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
    </div>
  );
}
