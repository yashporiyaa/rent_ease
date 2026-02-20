"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { RentalStatusBadge } from "./rental-status-badge";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils/date";
import { RentalsTableProps } from "@/types";

export function RentalsTable({ rentals, onEdit, onDelete }: RentalsTableProps) {
  const [expandedRentalIds, setExpandedRentalIds] = useState<Record<string, boolean>>({});

  const formatDateTime = (value?: string) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString();
  };

  const toggleRow = (rentalId: string) => {
    setExpandedRentalIds((prev) => ({
      ...prev,
      [rentalId]: !prev[rentalId],
    }));
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-4 text-center font-semibold w-12">
                #
              </th>
              <th className="px-6 py-4 text-left font-semibold">
                Booking No.
              </th>
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
            {rentals.map((rental) => {
              const isExpanded = Boolean(expandedRentalIds[rental.id]);

              return (
                <Fragment key={rental.id}>
                  <tr className="hover:bg-slate-50 transition">
                    <td className="px-4 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => toggleRow(rental.id)}
                        className={`h-8 w-8 rounded-md font-bold text-white shadow-sm cursor-pointer transition ${
                          isExpanded
                            ? "bg-red-500 hover:bg-red-600"
                            : "bg-blue-500 hover:bg-blue-600"
                        }`}
                        aria-label={isExpanded ? "Collapse rental items" : "Expand rental items"}
                      >
                        {isExpanded ? "-" : "+"}
                      </button>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {rental.bookingNo || "-"}
                    </td>
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
                      <button
                        type="button"
                        onClick={() => onEdit(rental)}
                        className="text-slate-600 cursor-pointer"
                        aria-label={`Edit rental ${rental.id}`}
                      >
                        <Pencil size={16} />
                      </button>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => onDelete(rental)}
                        className="text-red-600 cursor-pointer"
                        aria-label={`Delete rental ${rental.id}`}
                      >
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
                  {isExpanded && (
                    <tr className="bg-slate-50/40">
                      <td colSpan={14} className="p-0">
                        <div className="overflow-x-auto border-t border-slate-200">
                          <table className="w-full text-sm">
                            <thead className="bg-slate-100 text-slate-600">
                              <tr>
                                <th className="px-4 py-3 text-left font-semibold">Sr no.</th>
                                <th className="px-4 py-3 text-left font-semibold">Product</th>
                                <th className="px-4 py-3 text-left font-semibold">Image</th>
                                <th className="px-4 py-3 text-left font-semibold">Description</th>
                                <th className="px-4 py-3 text-left font-semibold">Delivery (Date & Time)</th>
                                <th className="px-4 py-3 text-left font-semibold">Booking Date & Time</th>
                                <th className="px-4 py-3 text-left font-semibold">Return (Date & Time)</th>
                                <th className="px-4 py-3 text-right font-semibold">Qty</th>
                                <th className="px-4 py-3 text-right font-semibold">Rate</th>
                                <th className="px-4 py-3 text-right font-semibold">Discount</th>
                                <th className="px-4 py-3 text-right font-semibold">Tax</th>
                                <th className="px-4 py-3 text-right font-semibold">Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {rental.rentalItems.map((item, index) => (
                                <tr key={item.id} className="bg-white">
                                  <td className="px-4 py-3">{index + 1}</td>
                                  <td className="px-4 py-3 font-medium text-[#0e1b17]">
                                    {item.item?.fullName || "-"}
                                  </td>
                                  <td className="px-4 py-3">
                                    {item.image || item.item?.images?.[0] ? (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img
                                        src={item.image || item.item?.images?.[0]}
                                        alt={item.item?.fullName || "Rental item"}
                                        className="h-10 w-10 rounded-lg border object-cover"
                                      />
                                    ) : (
                                      "-"
                                    )}
                                  </td>
                                  <td className="px-4 py-3">
                                    {item.description || item.item?.description || "-"}
                                  </td>
                                  <td className="px-4 py-3">{formatDateTime(item.fromAt)}</td>
                                  <td className="px-4 py-3">{formatDateTime(rental.bookingAt)}</td>
                                  <td className="px-4 py-3">{formatDateTime(item.toAt)}</td>
                                  <td className="px-4 py-3 text-right">{item.quantity ?? 0}</td>
                                  <td className="px-4 py-3 text-right">₹{item.price ?? 0}</td>
                                  <td className="px-4 py-3 text-right">₹{item.discountAmount ?? 0}</td>
                                  <td className="px-4 py-3 text-right">₹{item.taxAmount ?? 0}</td>
                                  <td className="px-4 py-3 text-right font-semibold">
                                    ₹{item.totalAmount ?? 0}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
