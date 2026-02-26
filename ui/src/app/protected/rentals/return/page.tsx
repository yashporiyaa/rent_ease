"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Button } from "../../../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { Loader2 } from "lucide-react";
import { getItemCategories } from "../../../../lib/api/item-categories";
import { getReturnRentals, updateReturnRentalStatus } from "../../../../lib/api/rentals";
import { ItemCategory, ReturnFilters, ReturnRentalItem } from "../../../../types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import { TablePagination } from "../../../../components/common/table-pagination";

const getTodayDateValue = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const isValidDateValue = (value?: string | null) =>
  Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));

const getInitialFilters = (initialDate?: string | null): ReturnFilters => {
  const defaultDate = isValidDateValue(initialDate) ? initialDate : getTodayDateValue();

  return {
    fromDate: defaultDate as string,
    toDate: defaultDate as string,
    categoryId: "all",
    status: "all",
  };
};

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString();
};

const getSelectValue = (status: ReturnRentalItem["status"]) => {
  if (status === "RETURNED") return "returned";
  return "picked";
};

export default function ReturnPage() {
  const searchParams = useSearchParams();
  const rentalIdFilter = searchParams.get("rentalId") || undefined;
  const dateFilter = searchParams.get("date");

  const [filters, setFilters] = useState<ReturnFilters>(getInitialFilters(dateFilter));
  const [appliedFilters, setAppliedFilters] = useState<ReturnFilters>(
    getInitialFilters(dateFilter),
  );
  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [rows, setRows] = useState<ReturnRentalItem[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [updatingRowId, setUpdatingRowId] = useState<string | null>(null);

  const fetchRows = useCallback(
    async (nextFilters: ReturnFilters, nextRentalId?: string) => {
      try {
        const res = await getReturnRentals({
          rentalId: nextRentalId,
          fromDate: nextFilters.fromDate || undefined,
          toDate: nextFilters.toDate || undefined,
          categoryId:
          nextFilters.categoryId && nextFilters.categoryId !== "all"
            ? nextFilters.categoryId
            : undefined,
        status: nextFilters.status,
      });

        setRows(res.data as ReturnRentalItem[]);
      } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch return rentals";
        toast.error(message);
      }
    },
    [],
  );

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const defaultFilters = getInitialFilters(dateFilter);
        const categoriesRes = await getItemCategories();

        setCategories(categoriesRes.data as ItemCategory[]);
        setFilters(defaultFilters);
        setAppliedFilters(defaultFilters);
        await fetchRows(defaultFilters, rentalIdFilter);
      } finally {
        setLoading(false);
      }
    };

    void loadInitialData();
  }, [dateFilter, fetchRows, rentalIdFilter]);

  const handleSearch = async () => {
    setSearching(true);
    setAppliedFilters(filters);
    await fetchRows(filters, rentalIdFilter);
    setSearching(false);
  };

  const handleStatusChange = async (
    row: ReturnRentalItem,
    nextStatus: "returned",
  ) => {
    setUpdatingRowId(row.id);
    try {
      const res = await updateReturnRentalStatus(row.id, nextStatus);
      const updated = res.data as ReturnRentalItem;

      setRows((prev) => {
        const nextRows = prev.map((item) => (item.id === updated.id ? updated : item));

        return nextRows;
      });

      toast.success("Return status updated");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update return status";
      toast.error(message);
    } finally {
      setUpdatingRowId(null);
    }
  };

  const noResultsText = useMemo(() => {
    if (rentalIdFilter) {
      return "No return items found for selected booking.";
    }

    if (appliedFilters.status === "returned") {
      return "No returned items found for selected filters.";
    }

    return "No items found for selected filters.";
  }, [appliedFilters.status, rentalIdFilter]);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 border-4 border-[#17cf91] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#0e1b17]">Return</h1>
        <p className="text-slate-500 mt-1">
          Filter rentals by return date, product category, and returned status.
        </p>
        {rentalIdFilter ? (
          <p className="mt-1 text-xs font-medium text-[#17cf91]">
            Showing return items for selected calendar booking.
          </p>
        ) : null}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 md:p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-600">Return From</Label>
            <Input
              type="date"
              value={filters.fromDate}
              onChange={(event) => {
                const nextFromDate = event.target.value;

                setFilters((prev) => ({
                  ...prev,
                  fromDate: nextFromDate,
                  toDate: nextFromDate,
                }));
              }}
              className="w-full"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-600">Return To</Label>
            <Input
              type="date"
              value={filters.toDate}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, toDate: event.target.value }))
              }
              className="w-full"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-600">Product Category</Label>
            <Select
              value={filters.categoryId}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, categoryId: value }))}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-600">Status</Label>
            <Select
              value={filters.status}
              onValueChange={(value: "all" | "returned") =>
                setFilters((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button
              variant="brand"
              type="button"
              onClick={() => void handleSearch()}
              disabled={searching}
              className="relative w-full min-w-30 rounded-md bg-[#17cf91] text-[#0e1b17] font-semibold"
            >
              <span className={searching ? "opacity-0" : "opacity-100"}>Search</span>
              {searching ? (
                <Loader2 className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 animate-spin" />
              ) : null}
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 text-slate-600">
            <TableRow>
              <TableHead className="px-4 py-3 text-left font-semibold">Booking No.</TableHead>
              <TableHead className="px-4 py-3 text-left font-semibold">Name</TableHead>
              <TableHead className="px-4 py-3 text-left font-semibold">Image</TableHead>
              <TableHead className="px-4 py-3 text-left font-semibold">Product</TableHead>
              <TableHead className="px-4 py-3 text-left font-semibold">Description</TableHead>
              <TableHead className="px-4 py-3 text-left font-semibold">Date</TableHead>
              <TableHead className="px-4 py-3 text-right font-semibold">Deposit</TableHead>
              <TableHead className="px-4 py-3 text-left font-semibold">Return</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-slate-200">
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="px-4 py-12 text-center text-slate-500">
                  {noResultsText}
                </TableCell>
              </TableRow>
            )}

            {pagedRows.map((row) => {
              const rowImage = row.image || row.item?.images?.[0] || "";
              const rowDescription = row.description || row.item?.description || "-";
              const selectedValue = getSelectValue(row.status);
              const isRowUpdating = updatingRowId === row.id;
              const isReturned = row.status === "RETURNED";

              return (
                <TableRow key={row.id} className="hover:bg-slate-50 transition">
                  <TableCell className="px-4 py-3 font-medium text-slate-700">
                    {row.rental.bookingNo || "-"}
                  </TableCell>
                  <TableCell className="px-4 py-3 font-medium text-[#0e1b17]">
                    {row.rental.customer.name}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {rowImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={rowImage}
                        alt={row.item?.fullName || "Rental item"}
                        className="h-12 w-12 rounded-lg border object-cover"
                      />
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3">{row.item?.fullName || "-"}</TableCell>
                  <TableCell className="px-4 py-3 max-w-56">
                    <p className="line-clamp-2">{rowDescription}</p>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-slate-700">
                    <p className="font-medium">Delivery: {formatDateTime(row.fromAt)}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Return: {formatDateTime(row.toAt)}
                    </p>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right font-semibold">
                    ₹{row.rental.depositAmount ?? 0}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Select
                      value={selectedValue}
                      onValueChange={(value: "picked" | "returned") => {
                        if (value !== selectedValue) {
                          if (value === "returned") {
                            void handleStatusChange(row, value);
                          }
                        }
                      }}
                      disabled={isRowUpdating}
                    >
                      <SelectTrigger className="w-40 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="picked" disabled>
                          Picked
                        </SelectItem>
                        <SelectItem value="returned" disabled={isReturned}>
                          Returned
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <TablePagination
          page={page}
          pageSize={pageSize}
          totalItems={rows.length}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
