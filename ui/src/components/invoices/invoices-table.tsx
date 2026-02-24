"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";
import { InvoiceStatusBadge } from "./invoice-status-badge";
import { getAllInvoices } from "@/lib/api/invoice";
import { InvoiceRow } from "@/types";
import { toast } from "react-toastify";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TablePagination } from "@/components/common/table-pagination";

export function InvoicesTable() {
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(invoices.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedInvoices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return invoices.slice(start, start + pageSize);
  }, [invoices, currentPage]);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const data = await getAllInvoices();
        setInvoices(data.data);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to fetch invoices";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="h-8 w-8 border-4 border-[#17cf91] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-black text-[#0e1b17]">Invoices</h1>
        <p className="text-slate-500 mt-1">
          Track all invoices and payment statuses.
        </p>
      </div>

      <Table>
        <TableHeader className="bg-slate-50 text-slate-600">
          <TableRow>
            <TableHead className="px-6 py-4 text-left">Invoice</TableHead>
            <TableHead className="px-6 py-4 text-left">Customer</TableHead>
            <TableHead className="px-6 py-4 text-left">Date</TableHead>
            <TableHead className="px-6 py-4 text-left">Amount</TableHead>
            <TableHead className="px-6 py-4 text-left">Status</TableHead>
            <TableHead className="px-6 py-4 text-right">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="divide-y">
          {pagedInvoices.map((invoice) => (
            <TableRow key={invoice.id} className="hover:bg-slate-50">
              <TableCell className="px-6 py-4 font-medium">{invoice.invoiceNo}</TableCell>
              <TableCell className="px-6 py-4">{invoice.customer}</TableCell>
              <TableCell className="px-6 py-4 text-slate-600">
                {new Date(invoice.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="px-6 py-4 font-semibold">₹{invoice.amount}</TableCell>
              <TableCell className="px-6 py-4">
                <InvoiceStatusBadge status={invoice.status} />
              </TableCell>
              <TableCell className="px-6 py-4 text-right">
                <Link
                  href={`/protected/invoices/${invoice.id}`}
                  className="inline-flex items-center gap-2 text-[#17cf91] font-bold hover:underline"
                >
                  <Eye size={16} />
                  View
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        page={currentPage}
        pageSize={pageSize}
        totalItems={invoices.length}
        onPageChange={(nextPage) => setPage(Math.max(1, Math.min(nextPage, totalPages)))}
      />
    </div>
  );
}
