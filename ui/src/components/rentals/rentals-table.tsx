import Link from "next/link";
import { rentals } from "@/lib/mock/rentals";
import { RentalStatusBadge } from "./rental-status-badge";
import { Eye } from "lucide-react";

export function RentalsTable() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100">
        <h1 className="text-2xl font-black text-[#0e1b17]">
          Rentals
        </h1>
        <p className="text-slate-500 mt-1">
          Track and manage all your active and past rentals.
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-6 py-4 text-left font-semibold">
                Customer
              </th>
              <th className="px-6 py-4 text-left font-semibold">
                Items
              </th>
              <th className="px-6 py-4 text-left font-semibold">
                Duration
              </th>
              <th className="px-6 py-4 text-left font-semibold">
                Amount
              </th>
              <th className="px-6 py-4 text-left font-semibold">
                Status
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
                <td className="px-6 py-4 font-medium text-[#0e1b17]">
                  {rental.customer}
                </td>

                <td className="px-6 py-4">
                  {rental.items}
                </td>

                <td className="px-6 py-4 text-slate-600">
                  {rental.startDate} → {rental.endDate}
                </td>

                <td className="px-6 py-4 font-semibold">
                  ₹{rental.amount}
                </td>

                <td className="px-6 py-4">
                  <RentalStatusBadge status={rental.status as any} />
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
