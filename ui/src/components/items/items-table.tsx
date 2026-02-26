import { Package, Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { InventoryItem } from "../../types";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { TablePagination } from "../common/table-pagination";

export function ItemsTable({
  items,
  onEdit,
  onDelete,
}: {
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
}) {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage]);

  return (
    <div className="bg-white rounded-xl border shadow-sm">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="px-6 py-4 text-left">Image</TableHead>
            <TableHead className="px-6 py-4 text-left">Short Name</TableHead>
            <TableHead className="px-6 py-4 text-left">Full Name</TableHead>
            <TableHead className="px-6 py-4 text-left">Category</TableHead>
            <TableHead className="px-6 py-4 text-left">Size</TableHead>
            <TableHead className="px-6 py-4 text-right">Qty</TableHead>
            <TableHead className="px-6 py-4 text-right">Price</TableHead>
            <TableHead className="px-6 py-4 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="divide-y">
          {pagedItems.map((item) => (
            <TableRow key={item.id} className="hover:bg-slate-50">
              <TableCell className="px-6 py-4">
                {item.images?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.images[0]}
                    alt={item.fullName}
                    className="h-10 w-10 rounded-lg object-cover border"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-lg border bg-slate-100 flex items-center justify-center">
                    <Package size={14} className="text-slate-400" />
                  </div>
                )}
              </TableCell>
              <TableCell className="px-6 py-4 font-medium text-[#0e1b17]">{item.shortName}</TableCell>
              <TableCell className="px-6 py-4 text-slate-700">
                {item.fullName}
              </TableCell>
              <TableCell className="px-6 py-4 text-slate-600">
                {item.category}
              </TableCell>
              <TableCell className="px-6 py-4 text-slate-600">{item.size || "-"}</TableCell>
              <TableCell className="px-6 py-4 text-right font-medium">
                {item.quantity ?? item.stock ?? 0}
              </TableCell>
              <TableCell className="px-6 py-4 text-right font-bold">
                ₹{item.price}
              </TableCell>
              <TableCell className="px-6 py-4">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="destructive"
                    type="button"
                    onClick={() => onEdit(item)}
                    className="h-8 w-8 rounded-lg border flex items-center justify-center text-green-600 bg-white hover:bg-green-100 cursor-pointer"
                    aria-label={`Edit ${item.fullName}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    type="button"
                    onClick={() => onDelete(item)}
                    className="h-8 w-8 rounded-lg border flex items-center justify-center text-red-600 bg-white hover:bg-red-100 cursor-pointer"
                    aria-label={`Delete ${item.fullName}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        page={currentPage}
        pageSize={pageSize}
        totalItems={items.length}
        onPageChange={(nextPage) => setPage(Math.max(1, Math.min(nextPage, totalPages)))}
      />
    </div>
  );
}
