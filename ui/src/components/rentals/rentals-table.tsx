"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { RentalStatusBadge } from "./rental-status-badge";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils/date";
import { RentalsTableProps } from "@/types";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

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
      <Table>
        <TableHeader className="bg-slate-50 text-slate-600">
          <TableRow>
            <TableHead className="px-4 py-4 text-center font-semibold w-12">#</TableHead>
            <TableHead className="px-6 py-4 text-left font-semibold">Booking No.</TableHead>
            <TableHead className="px-6 py-4 text-left font-semibold">Date</TableHead>
            <TableHead className="px-6 py-4 text-left font-semibold">Customer</TableHead>
            <TableHead className="px-6 py-4 text-right font-semibold">Discount</TableHead>
            <TableHead className="px-6 py-4 text-right font-semibold">Tax</TableHead>
            <TableHead className="px-6 py-4 text-right font-semibold">Total</TableHead>
            <TableHead className="px-6 py-4 text-right font-semibold">Advance</TableHead>
            <TableHead className="px-6 py-4 text-right font-semibold">Pending</TableHead>
            <TableHead className="px-6 py-4 text-right font-semibold">Deposit</TableHead>
            <TableHead className="px-6 py-4 text-left font-semibold">Status</TableHead>
            <TableHead className="px-6 py-4 text-right font-semibold">Edit</TableHead>
            <TableHead className="px-6 py-4 text-right font-semibold">Delete</TableHead>
            <TableHead className="px-6 py-4 text-right font-semibold">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="divide-y">
          {rentals.map((rental) => {
            const isExpanded = Boolean(expandedRentalIds[rental.id]);

            return (
              <Fragment key={rental.id}>
                <TableRow className="hover:bg-slate-50 transition">
                  <TableCell className="px-4 py-4 text-center">
                    <Button
                      variant="destructive"
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
                    </Button>
                  </TableCell>
                  <TableCell className="px-6 py-4 font-medium text-slate-700">
                    {rental.bookingNo || "-"}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-slate-600">
                    {formatDate(rental.bookingAt || rental.startDate)}
                  </TableCell>
                  <TableCell className="px-6 py-4 font-medium text-[#0e1b17]">
                    {rental.customer.name}
                  </TableCell>

                  <TableCell className="px-6 py-4 text-right">₹{rental.discountAmount ?? 0}</TableCell>
                  <TableCell className="px-6 py-4 text-right">₹{rental.taxAmountValue ?? 0}</TableCell>
                  <TableCell className="px-6 py-4 text-right font-semibold">₹{rental.totalAmount}</TableCell>
                  <TableCell className="px-6 py-4 text-right">₹{rental.advanceAmount ?? 0}</TableCell>
                  <TableCell className="px-6 py-4 text-right">₹{rental.pendingAmount ?? 0}</TableCell>
                  <TableCell className="px-6 py-4 text-right">₹{rental.depositAmount ?? 0}</TableCell>

                  <TableCell className="px-6 py-4">
                    <RentalStatusBadge status={rental.status} />
                  </TableCell>

                  <TableCell className="px-6 py-4 text-right">
                    <Button
                      variant="destructive"
                      type="button"
                      onClick={() => onEdit(rental)}
                      className="text-green-600 bg-white hover:bg-green-100 cursor-pointer"
                      aria-label={`Edit rental ${rental.id}`}
                    >
                      <Pencil size={16} />
                    </Button>
                  </TableCell>

                  <TableCell className="px-6 py-4 text-right">
                    <Button
                      variant="destructive"
                      type="button"
                      onClick={() => onDelete(rental)}
                      className="text-red-600 bg-white hover:bg-red-100 cursor-pointer"
                      aria-label={`Delete rental ${rental.id}`}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </TableCell>

                  <TableCell className="px-6 py-4 text-right">
                    <Link
                      href={`/protected/rentals/${rental.id}`}
                      className="inline-flex items-center gap-2 text-[#17cf91] font-bold hover:underline"
                    >
                      <Eye size={16} />
                      View
                    </Link>
                  </TableCell>
                </TableRow>
                {isExpanded && (
                  <TableRow className="bg-slate-50/40">
                    <TableCell colSpan={14} className="p-0">
                      <div className="border-t border-slate-200">
                        <Table>
                          <TableHeader className="bg-slate-100 text-slate-600">
                            <TableRow>
                              <TableHead className="px-4 py-3 text-left font-semibold">Sr no.</TableHead>
                              <TableHead className="px-4 py-3 text-left font-semibold">Product</TableHead>
                              <TableHead className="px-4 py-3 text-left font-semibold">Image</TableHead>
                              <TableHead className="px-4 py-3 text-left font-semibold">Description</TableHead>
                              <TableHead className="px-4 py-3 text-left font-semibold">Delivery (Date & Time)</TableHead>
                              <TableHead className="px-4 py-3 text-left font-semibold">Booking Date & Time</TableHead>
                              <TableHead className="px-4 py-3 text-left font-semibold">Return (Date & Time)</TableHead>
                              <TableHead className="px-4 py-3 text-right font-semibold">Qty</TableHead>
                              <TableHead className="px-4 py-3 text-right font-semibold">Rate</TableHead>
                              <TableHead className="px-4 py-3 text-right font-semibold">Discount</TableHead>
                              <TableHead className="px-4 py-3 text-right font-semibold">Tax</TableHead>
                              <TableHead className="px-4 py-3 text-right font-semibold">Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody className="divide-y divide-slate-200">
                            {rental.rentalItems.map((item, index) => (
                              <TableRow key={item.id} className="bg-white">
                                <TableCell className="px-4 py-3">{index + 1}</TableCell>
                                <TableCell className="px-4 py-3 font-medium text-[#0e1b17]">
                                  {item.item?.fullName || "-"}
                                </TableCell>
                                <TableCell className="px-4 py-3">
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
                                </TableCell>
                                <TableCell className="px-4 py-3">
                                  {item.description || item.item?.description || "-"}
                                </TableCell>
                                <TableCell className="px-4 py-3">{formatDateTime(item.fromAt)}</TableCell>
                                <TableCell className="px-4 py-3">{formatDateTime(rental.bookingAt)}</TableCell>
                                <TableCell className="px-4 py-3">{formatDateTime(item.toAt)}</TableCell>
                                <TableCell className="px-4 py-3 text-right">{item.quantity ?? 0}</TableCell>
                                <TableCell className="px-4 py-3 text-right">₹{item.price ?? 0}</TableCell>
                                <TableCell className="px-4 py-3 text-right">₹{item.discountAmount ?? 0}</TableCell>
                                <TableCell className="px-4 py-3 text-right">₹{item.taxAmount ?? 0}</TableCell>
                                <TableCell className="px-4 py-3 text-right font-semibold">
                                  ₹{item.totalAmount ?? 0}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
