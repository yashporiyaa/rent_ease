import Link from "next/link";
import { useMemo, useState } from "react";
import { Eye, User } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TablePagination } from "@/components/common/table-pagination";

export function CustomersTable({
  customers,
}: {
  customers: { id: string; name: string; phone?: string }[];
}) {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(customers.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return customers.slice(start, start + pageSize);
  }, [customers, currentPage]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <Table>
        <TableHeader className="bg-slate-50 text-slate-600">
          <TableRow>
            <TableHead className="px-6 py-4 text-left">Name</TableHead>
            <TableHead className="px-6 py-4 text-left">Phone</TableHead>
            <TableHead className="px-6 py-4 text-right">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="divide-y">
          {pagedCustomers.map((customer) => (
            <TableRow
              key={customer.id}
              className="hover:bg-slate-50 transition"
            >
              <TableCell className="px-6 py-4 font-medium text-[#0e1b17] flex items-center gap-2">
                <User size={16} className="text-[#17cf91]" />
                {customer.name}
              </TableCell>

              <TableCell className="px-6 py-4 text-slate-600">
                {customer.phone || "-"}
              </TableCell>

              <TableCell className="px-6 py-4 text-right">
                <Link
                  href={`/protected/customers/${customer.id}`}
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
        totalItems={customers.length}
        onPageChange={(nextPage) => setPage(Math.max(1, Math.min(nextPage, totalPages)))}
      />
    </div>
  );
}
