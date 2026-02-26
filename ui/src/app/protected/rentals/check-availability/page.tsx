"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import { TablePagination } from "../../../../components/common/table-pagination";
import { getItems } from "../../../../lib/api/items";
import { getItemSizes } from "../../../../lib/api/item-sizes";
import { checkRentalItemAvailability } from "../../../../lib/api/rentals";
import {
  InventoryItem,
  ItemAvailabilityResult,
  ItemSize,
} from "../../../../types";

const getTodayDateValue = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
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

export default function CheckAvailabilityPage() {
  const today = getTodayDateValue();
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [productId, setProductId] = useState("");
  const [sizeId, setSizeId] = useState("all");
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [sizes, setSizes] = useState<ItemSize[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<ItemAvailabilityResult | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [itemsRes, sizesRes] = await Promise.all([getItems(), getItemSizes()]);
        setItems(itemsRes.data as InventoryItem[]);
        setSizes(sizesRes.data as ItemSize[]);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load data";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    if (sizeId === "all") {
      return items;
    }

    return items.filter((item) => item.sizeId === sizeId);
  }, [items, sizeId]);

  const availabilityMessage = useMemo(() => {
    if (!result) {
      return "";
    }

    if (result.available) {
      return `${result.availableStock} item(s) available`;
    }

    return "Not available";
  }, [result]);

  const recentRentals = useMemo(
    () => result?.recentRentals ?? [],
    [result?.recentRentals],
  );
  const totalPages = Math.max(1, Math.ceil(recentRentals.length / pageSize));
  const pagedRecentRentals = useMemo(() => {
    const start = (page - 1) * pageSize;
    return recentRentals.slice(start, start + pageSize);
  }, [recentRentals, page]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleSizeChange = (nextSizeId: string) => {
    setSizeId(nextSizeId);
    setResult(null);

    if (productId) {
      const selected = items.find((item) => item.id === productId);
      if (!selected || selected.sizeId !== nextSizeId) {
        setProductId("");
      }
    }
  };

  const handleCheck = async () => {
    if (!fromDate || !toDate || !productId) {
      toast.error("Select date range and product");
      return;
    }

    setChecking(true);
    try {
      const res = await checkRentalItemAvailability({
        itemId: productId,
        quantity: 1,
        fromAt: new Date(`${fromDate}T00:00:00`).toISOString(),
        toAt: new Date(`${toDate}T23:59:59`).toISOString(),
        ...(sizeId !== "all" ? { sizeId } : {}),
      });

      setResult(res.data as ItemAvailabilityResult);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to check availability";
      toast.error(message);
      setResult(null);
    } finally {
      setChecking(false);
    }
  };

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
        <h1 className="text-2xl font-black text-[#0e1b17]">Check Availability</h1>
        <p className="text-slate-500 mt-1">
          Check item availability by date range, product, and size.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 md:p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-600">From Date</Label>
            <Input
              type="date"
              value={fromDate}
              onChange={(event) => {
                const nextFromDate = event.target.value;
                setFromDate(nextFromDate);
                setToDate(nextFromDate);
                setResult(null);
              }}
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-600">To Date</Label>
            <Input
              type="date"
              value={toDate}
              onChange={(event) => {
                setToDate(event.target.value);
                setResult(null);
              }}
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-600">Size</Label>
            <Select value={sizeId} onValueChange={handleSizeChange}>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Select Size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sizes</SelectItem>
                {sizes.map((size) => (
                  <SelectItem key={size.id} value={size.id}>
                    {size.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-600">Product</Label>
            <Select
              value={productId}
              onValueChange={(value) => {
                setProductId(value);
                setResult(null);
              }}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Select Product" />
              </SelectTrigger>
              <SelectContent>
                {filteredProducts.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end gap-3">
            <Button
              variant="brand"
              type="button"
              onClick={() => void handleCheck()}
              disabled={checking}
              className="relative min-w-30 rounded-md bg-[#17cf91] text-[#0e1b17] font-semibold"
            >
              <span className={checking ? "opacity-0" : "opacity-100"}>Check</span>
              {checking ? (
                <Loader2 className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 animate-spin" />
              ) : null}
            </Button>
            {availabilityMessage ? (
              <p
                className={`text-sm font-semibold ${
                  result?.available ? "text-green-600" : "text-red-600"
                }`}
              >
                {availabilityMessage}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 text-slate-600">
            <TableRow>
              <TableHead className="px-4 py-3 text-left font-semibold">Booking No.</TableHead>
              <TableHead className="px-4 py-3 text-left font-semibold">Product</TableHead>
              <TableHead className="px-4 py-3 text-left font-semibold">Size</TableHead>
              <TableHead className="px-4 py-3 text-left font-semibold">Delivery Date</TableHead>
              <TableHead className="px-4 py-3 text-left font-semibold">Booking Date</TableHead>
              <TableHead className="px-4 py-3 text-left font-semibold">Return Date</TableHead>
              <TableHead className="px-4 py-3 text-left font-semibold">Name</TableHead>
              <TableHead className="px-4 py-3 text-right font-semibold">Qty</TableHead>
              <TableHead className="px-4 py-3 text-right font-semibold">Discount</TableHead>
              <TableHead className="px-4 py-3 text-left font-semibold">Returned</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-200">
            {recentRentals.length ? (
              pagedRecentRentals.map((row) => (
                <TableRow key={row.id} className="hover:bg-slate-50 transition">
                  <TableCell className="px-4 py-3">{row.bookingNo || "-"}</TableCell>
                  <TableCell className="px-4 py-3">{row.product}</TableCell>
                  <TableCell className="px-4 py-3">{row.size || "-"}</TableCell>
                  <TableCell className="px-4 py-3">{formatDateTime(row.deliveryDate)}</TableCell>
                  <TableCell className="px-4 py-3">{formatDateTime(row.bookingDate)}</TableCell>
                  <TableCell className="px-4 py-3">{formatDateTime(row.returnDate)}</TableCell>
                  <TableCell className="px-4 py-3">{row.customerName}</TableCell>
                  <TableCell className="px-4 py-3 text-right">{row.quantity}</TableCell>
                  <TableCell className="px-4 py-3 text-right">₹{row.discount ?? 0}</TableCell>
                  <TableCell className="px-4 py-3">
                    {row.status === "RETURNED" ? "Yes" : "No"}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="px-4 py-12 text-center text-slate-500">
                  {result ? "No previous rentals found for selected product." : "Check availability to see latest rentals."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          page={page}
          pageSize={pageSize}
          totalItems={recentRentals.length}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
