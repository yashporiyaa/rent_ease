"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
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
import { toast } from "react-toastify";
import {
  createReceipt,
  deleteReceipt,
  getReceiptPendingRentals,
  getReceipts,
  searchReceiptCustomers,
  updateReceipt,
} from "../../../../lib/api/receipts";
import { getRentalById } from "../../../../lib/api/rentals";
import {
  ReceiptCustomerOption,
  ReceiptPendingRental,
  ReceiptPaymentMode,
  ReceiptRecord,
  RentalRecord,
} from "../../../../types";
import { Pencil, Trash2, X } from "lucide-react";
import { ConfirmDialog } from "../../../../components/common/confirm-dialog";
import { TablePagination } from "../../../../components/common/table-pagination";

type ReceiptFormRow = {
  rentalId: string;
  bookingNo?: string | null;
  bookingAt: string;
  totalAmount: number;
  pendingAmount: number;
  description: string;
  receivedAmount: string;
};

const PAYMENT_MODES: ReceiptPaymentMode[] = [
  "CASH",
  "UPI",
  "CARD",
  "BANK_TRANSFER",
];

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

const getReceiptNo = (receiptId: string) =>
  `RCPT-${receiptId.replace(/-/g, "").slice(0, 8).toUpperCase()}`;

const toDateInput = (value?: string | null) => {
  if (!value) return getTodayDateValue();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return getTodayDateValue();
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 10);
};

export default function ReceiptsPage() {
  const searchParams = useSearchParams();
  const today = useMemo(() => getTodayDateValue(), []);
  const deepLinkRentalId = searchParams.get("rentalId");

  const [filters, setFilters] = useState({
    fromDate: today,
    toDate: today,
  });
  const [receipts, setReceipts] = useState<ReceiptRecord[]>([]);
  const [receiptsPage, setReceiptsPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formBootstrapLoading, setFormBootstrapLoading] = useState(false);
  const [savingReceipt, setSavingReceipt] = useState(false);
  const [editingReceiptId, setEditingReceiptId] = useState<string | null>(null);
  const [deletingReceipt, setDeletingReceipt] = useState<ReceiptRecord | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [autoOpenedRentalId, setAutoOpenedRentalId] = useState<string | null>(null);

  const [customerSearch, setCustomerSearch] = useState("");
  const [customerOptions, setCustomerOptions] = useState<ReceiptCustomerOption[]>([]);
  const [customerSearching, setCustomerSearching] = useState(false);
  const [selectedCustomer, setSelectedCustomer] =
    useState<ReceiptCustomerOption | null>(null);

  const [pendingRentalsLoading, setPendingRentalsLoading] = useState(false);
  const [formRows, setFormRows] = useState<ReceiptFormRow[]>([]);
  const [formRowsPage, setFormRowsPage] = useState(1);

  const [entryDate, setEntryDate] = useState(today);
  const [paymentMode, setPaymentMode] = useState<ReceiptPaymentMode>("CASH");
  const [discountAmount, setDiscountAmount] = useState("0");
  const tablePageSize = 10;

  const fetchReceipts = useCallback(async (fromDate?: string, toDate?: string) => {
    try {
      const res = await getReceipts({
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      });
      setReceipts(res.data as ReceiptRecord[]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch receipts";
      toast.error(message);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchReceipts(filters.fromDate, filters.toDate);
      setLoading(false);
    };

    void load();
  }, [fetchReceipts, filters.fromDate, filters.toDate]);

  useEffect(() => {
    if (!isCreateOpen) {
      return;
    }

    const timer = setTimeout(async () => {
      setCustomerSearching(true);
      try {
        const res = await searchReceiptCustomers(customerSearch);
        setCustomerOptions(res.data);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to search customers";
        toast.error(message);
      } finally {
        setCustomerSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [customerSearch, isCreateOpen]);

  const receiptsTotalPages = Math.max(1, Math.ceil(receipts.length / tablePageSize));
  const pagedReceipts = useMemo(() => {
    const start = (receiptsPage - 1) * tablePageSize;
    return receipts.slice(start, start + tablePageSize);
  }, [receipts, receiptsPage]);

  const formRowsTotalPages = Math.max(1, Math.ceil(formRows.length / tablePageSize));
  const pagedFormRows = useMemo(() => {
    const start = (formRowsPage - 1) * tablePageSize;
    return formRows.slice(start, start + tablePageSize);
  }, [formRows, formRowsPage]);

  useEffect(() => {
    if (receiptsPage > receiptsTotalPages) {
      setReceiptsPage(receiptsTotalPages);
    }
  }, [receiptsPage, receiptsTotalPages]);

  useEffect(() => {
    if (formRowsPage > formRowsTotalPages) {
      setFormRowsPage(formRowsTotalPages);
    }
  }, [formRowsPage, formRowsTotalPages]);

  const resetCreateForm = () => {
    setCustomerSearch("");
    setSelectedCustomer(null);
    setCustomerOptions([]);
    setFormRows([]);
    setEntryDate(getTodayDateValue());
    setPaymentMode("CASH");
    setDiscountAmount("0");
    setEditingReceiptId(null);
  };

  const loadPendingRentalsForCustomer = async (customerId: string) => {
    setPendingRentalsLoading(true);
    try {
      const res = await getReceiptPendingRentals(customerId);
      const rentals = res.data as ReceiptPendingRental[];

      setFormRows(
        rentals.map((rental) => ({
          rentalId: rental.id,
          bookingNo: rental.bookingNo,
          bookingAt: rental.bookingAt,
          totalAmount: rental.totalAmount,
          pendingAmount: rental.pendingAmount,
          description: "",
          receivedAmount: "",
        })),
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch pending rentals for customer";
      toast.error(message);
      setFormRows([]);
    } finally {
      setPendingRentalsLoading(false);
    }
  };

  const openCreateModal = async () => {
    setFormBootstrapLoading(true);
    try {
      const res = await searchReceiptCustomers("");
      setCustomerOptions(res.data);
      setEditingReceiptId(null);
      setIsCreateOpen(true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load receipt form data";
      toast.error(message);
    } finally {
      setFormBootstrapLoading(false);
    }
  };

  const openCreateModalForRental = useCallback(async (rentalId: string) => {
    setFormBootstrapLoading(true);
    try {
      const [rentalRes, customersRes] = await Promise.all([
        getRentalById(rentalId),
        searchReceiptCustomers(""),
      ]);

      const rental = rentalRes.data as RentalRecord;
      if (!rental?.id) {
        throw new Error("Rental not found");
      }

      const pendingAmount = Number(rental.pendingAmount ?? 0);
      if (pendingAmount <= 0) {
        toast.info("Selected rental has no pending amount.");
        return;
      }

      if (!rental.customerId) {
        throw new Error("Customer is missing for selected rental");
      }

      setCustomerOptions(customersRes.data);
      setSelectedCustomer({
        id: rental.customerId,
        name: rental.customer.name,
        pendingTotal: pendingAmount,
      });
      setCustomerSearch(rental.customer.name);
      setEntryDate(getTodayDateValue());
      setPaymentMode("CASH");
      setDiscountAmount("0");
      setEditingReceiptId(null);
      setFormRows([
        {
          rentalId: rental.id,
          bookingNo: rental.bookingNo,
          bookingAt: rental.bookingAt,
          totalAmount: rental.totalAmount,
          pendingAmount,
          description: "",
          receivedAmount: String(pendingAmount),
        },
      ]);
      setIsCreateOpen(true);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load receipt form data for selected rental";
      toast.error(message);
    } finally {
      setFormBootstrapLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!deepLinkRentalId) return;
    if (autoOpenedRentalId === deepLinkRentalId) return;

    setAutoOpenedRentalId(deepLinkRentalId);
    void openCreateModalForRental(deepLinkRentalId);
  }, [autoOpenedRentalId, deepLinkRentalId, openCreateModalForRental]);

  const handleCustomerSelect = async (customer: ReceiptCustomerOption) => {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.name);
    await loadPendingRentalsForCustomer(customer.id);
  };

  const openEditModal = async (receipt: ReceiptRecord) => {
    setFormBootstrapLoading(true);
    try {
      const [customersRes, pendingRes] = await Promise.all([
        searchReceiptCustomers(""),
        getReceiptPendingRentals(receipt.customer.id),
      ]);

      setCustomerOptions(customersRes.data);
      setSelectedCustomer({
        id: receipt.customer.id,
        name: receipt.customer.name,
        pendingTotal: pendingRes.data.reduce(
          (sum: number, rental: ReceiptPendingRental) => sum + rental.pendingAmount,
          0,
        ),
      });
      setCustomerSearch(receipt.customer.name);
      setEntryDate(toDateInput(receipt.entryDate));
      setPaymentMode(receipt.paymentMode);
      setDiscountAmount(String(receipt.discountAmount ?? 0));
      setEditingReceiptId(receipt.id);

      const pendingMap = new Map(
        (pendingRes.data as ReceiptPendingRental[]).map((rental) => [rental.id, rental]),
      );
      const lineMap = new Map(receipt.lineItems.map((line) => [line.rental.id, line]));

      const mergedRows: ReceiptFormRow[] = [];

      for (const rental of pendingRes.data as ReceiptPendingRental[]) {
        const existingLine = lineMap.get(rental.id);
        const rollbackAmount = existingLine
          ? existingLine.receivedAmount + (existingLine.discountAmount ?? 0)
          : 0;

        mergedRows.push({
          rentalId: rental.id,
          bookingNo: rental.bookingNo,
          bookingAt: rental.bookingAt,
          totalAmount: rental.totalAmount,
          pendingAmount: rental.pendingAmount + rollbackAmount,
          description: existingLine?.description ?? "",
          receivedAmount: existingLine ? String(existingLine.receivedAmount) : "",
        });
      }

      for (const line of receipt.lineItems) {
        if (pendingMap.has(line.rental.id)) {
          continue;
        }

        mergedRows.push({
          rentalId: line.rental.id,
          bookingNo: line.rental.bookingNo,
          bookingAt: line.rental.bookingAt,
          totalAmount: line.rental.totalAmount,
          pendingAmount: line.receivedAmount + (line.discountAmount ?? 0),
          description: line.description ?? "",
          receivedAmount: String(line.receivedAmount),
        });
      }

      setFormRows(mergedRows);
      setIsCreateOpen(true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load receipt for edit";
      toast.error(message);
    } finally {
      setFormBootstrapLoading(false);
    }
  };

  const grossReceived = useMemo(
    () =>
      formRows.reduce((sum, row) => {
        const amount = Number(row.receivedAmount) || 0;
        return sum + amount;
      }, 0),
    [formRows],
  );
  const discountValue = Number(discountAmount) || 0;
  const totalReceived = Math.max(0, grossReceived - discountValue);

  const handleSearch = async () => {
    setSearching(true);
    await fetchReceipts(filters.fromDate, filters.toDate);
    setSearching(false);
  };

  const handleSaveReceipt = async () => {
    if (!selectedCustomer?.id) {
      toast.error("Please select customer");
      return;
    }

    if (formRows.length === 0) {
      toast.error("No pending rentals available for selected customer");
      return;
    }

    const discount = Number(discountAmount) || 0;
    if (discount < 0) {
      toast.error("Discount cannot be negative");
      return;
    }

    if (grossReceived <= 0) {
      toast.error("Enter received amount");
      return;
    }

    const selectedPendingTotal = formRows.reduce(
      (sum, row) => sum + row.pendingAmount,
      0,
    );

    if (grossReceived > selectedPendingTotal) {
      toast.error("Received amount exceeds selected pending total");
      return;
    }

    if (discount > grossReceived) {
      toast.error("Discount cannot exceed received amount");
      return;
    }

    const hasInvalidLineAmount = formRows.some((row) => {
      const amount = Number(row.receivedAmount) || 0;
      return amount < 0 || amount > row.pendingAmount;
    });

    if (hasInvalidLineAmount) {
      toast.error("Received amount must be between 0 and pending");
      return;
    }

    setSavingReceipt(true);
    try {
      const payload = {
        customerId: selectedCustomer.id,
        entryDate,
        paymentMode,
        discountAmount: discount,
        lineItems: formRows.map((row) => ({
          rentalId: row.rentalId,
          description: row.description.trim() || undefined,
          receivedAmount: Number(row.receivedAmount) || 0,
        })),
      };

      if (editingReceiptId) {
        await updateReceipt(editingReceiptId, payload);
        toast.success("Receipt updated successfully");
      } else {
        await createReceipt(payload);
        toast.success("Receipt created successfully");
      }

      setIsCreateOpen(false);
      resetCreateForm();
      setLoading(true);
      await fetchReceipts(filters.fromDate, filters.toDate);
      setLoading(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save receipt";
      toast.error(message);
    } finally {
      setSavingReceipt(false);
    }
  };

  const handleDeleteReceipt = async () => {
    if (!deletingReceipt) return;

    setDeleting(true);
    try {
      await deleteReceipt(deletingReceipt.id);
      toast.success("Receipt deleted successfully");
      setDeletingReceipt(null);
      setLoading(true);
      await fetchReceipts(filters.fromDate, filters.toDate);
      setLoading(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete receipt";
      toast.error(message);
    } finally {
      setDeleting(false);
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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0e1b17]">Receipts</h1>
          <p className="text-slate-500 mt-1">
            Track receipt entries and adjust rental pending amounts.
          </p>
        </div>

        <Button
          variant="brand"
          onClick={() => void openCreateModal()}
          disabled={formBootstrapLoading}
          className="rounded-full bg-[#17cf91] text-[#0e1b17] font-bold cursor-pointer"
        >
          Add Receipt
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 md:p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-600">From Date</Label>
            <Input
              type="date"
              value={filters.fromDate}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, fromDate: event.target.value }))
              }
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-600">To Date</Label>
            <Input
              type="date"
              value={filters.toDate}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, toDate: event.target.value }))
              }
            />
          </div>

          <div className="md:col-span-2 flex items-end">
            <Button
              variant="brand"
              onClick={() => void handleSearch()}
              disabled={searching}
              className="rounded-md bg-[#17cf91] text-[#0e1b17] font-semibold"
            >
              {searching ? "Searching..." : "Search"}
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="px-4 py-3">Date & Time</TableHead>
              <TableHead className="px-4 py-3">Receipt No.</TableHead>
              <TableHead className="px-4 py-3">Mode</TableHead>
              <TableHead className="px-4 py-3">Customer</TableHead>
              <TableHead className="px-4 py-3 text-right">Total Received</TableHead>
              <TableHead className="px-4 py-3 text-right">Discount</TableHead>
              <TableHead className="px-4 py-3 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y">
            {receipts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  No receipts found for selected date range.
                </TableCell>
              </TableRow>
            ) : (
              pagedReceipts.map((receipt) => (
                <TableRow key={receipt.id} className="hover:bg-slate-50">
                  <TableCell className="px-4 py-3">{formatDateTime(receipt.entryDate)}</TableCell>
                  <TableCell className="px-4 py-3 font-medium">{getReceiptNo(receipt.id)}</TableCell>
                  <TableCell className="px-4 py-3">{receipt.paymentMode}</TableCell>
                  <TableCell className="px-4 py-3">{receipt.customer.name}</TableCell>
                  <TableCell className="px-4 py-3 text-right font-semibold">
                    ₹{receipt.totalReceived}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">₹{receipt.discountAmount}</TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => void openEditModal(receipt)}
                        className="h-8 w-8 text-green-600 hover:text-green-700 cursor-pointer"
                        aria-label={`Edit ${getReceiptNo(receipt.id)}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingReceipt(receipt)}
                        className="h-8 w-8 text-red-600 hover:text-red-700 cursor-pointer"
                        aria-label={`Delete ${getReceiptNo(receipt.id)}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          page={receiptsPage}
          pageSize={tablePageSize}
          totalItems={receipts.length}
          onPageChange={setReceiptsPage}
        />
      </div>

      {isCreateOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/55 p-4 sm:p-6 overflow-y-auto backdrop-blur-[1px]"
          onClick={() => {
            if (!savingReceipt) {
              setIsCreateOpen(false);
              resetCreateForm();
            }
          }}
        >
          <div className="min-h-full flex items-start justify-center py-6 sm:items-center sm:py-10">
            <div className="w-full max-w-6xl" onClick={(event) => event.stopPropagation()}>
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.14)]">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                  <h2 className="text-2xl font-black text-slate-900">
                    {editingReceiptId ? "Update Receipt" : "Add Receipt"}
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (!savingReceipt) {
                        setIsCreateOpen(false);
                        resetCreateForm();
                      }
                    }}
                    disabled={savingReceipt}
                    className="cursor-pointer rounded-xl"
                  >
                    <X className="h-5 w-5 text-slate-500" />
                  </Button>
                </div>

                <div className="space-y-5 px-6 py-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative space-y-1">
                    <Label className="text-xs font-semibold text-slate-600">Customer</Label>
                    <Input
                      placeholder="Type customer name"
                      value={customerSearch}
                      onChange={(event) => {
                        setCustomerSearch(event.target.value);
                        setSelectedCustomer(null);
                        setFormRows([]);
                      }}
                    />

                    {customerSearch && !selectedCustomer && (
                      <div className="absolute z-20 mt-1 w-full rounded-md border bg-white shadow-md max-h-56 overflow-y-auto">
                        {customerSearching ? (
                          <div className="px-3 py-2 text-sm text-slate-500">Searching...</div>
                        ) : customerOptions.length === 0 ? (
                          <div className="px-3 py-2 text-sm text-slate-500">
                            No customer with pending amount found.
                          </div>
                        ) : (
                          customerOptions.map((customer) => (
                            <Button
                              key={customer.id}
                              type="button"
                              variant="ghost"
                              className="h-auto w-full justify-start rounded-none px-3 py-2 text-left text-sm hover:bg-slate-50"
                              onClick={() => void handleCustomerSelect(customer)}
                            >
                              <div className="font-medium text-[#0e1b17]">{customer.name}</div>
                              <div className="text-xs text-slate-500">
                                Pending: ₹{customer.pendingTotal}
                              </div>
                            </Button>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-600">Entry Date</Label>
                    <Input
                      type="date"
                      value={entryDate}
                      onChange={(event) => setEntryDate(event.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-600">Mode of Payment</Label>
                    <Select
                      value={paymentMode}
                      onValueChange={(value: ReceiptPaymentMode) => setPaymentMode(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_MODES.map((mode) => (
                          <SelectItem key={mode} value={mode}>
                            {mode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="px-3 py-3">Sr No.</TableHead>
                        <TableHead className="px-3 py-3">ID</TableHead>
                        <TableHead className="px-3 py-3">Booking No.</TableHead>
                        <TableHead className="px-3 py-3">Booking Date</TableHead>
                        <TableHead className="px-3 py-3 text-right">Total</TableHead>
                        <TableHead className="px-3 py-3 text-right">Pending</TableHead>
                        <TableHead className="px-3 py-3">Description</TableHead>
                        <TableHead className="px-3 py-3">Received Amount</TableHead>
                        <TableHead className="px-3 py-3 text-right">Delete</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingRentalsLoading ? (
                        <TableRow>
                          <TableCell colSpan={9} className="px-3 py-8 text-center text-slate-500">
                            Loading pending rentals...
                          </TableCell>
                        </TableRow>
                      ) : formRows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="px-3 py-8 text-center text-slate-500">
                            Select a customer to load rentals with pending amount.
                          </TableCell>
                        </TableRow>
                      ) : (
                        pagedFormRows.map((row, index) => (
                          <TableRow key={row.rentalId} className="align-top">
                            <TableCell className="px-3 py-3">
                              {(formRowsPage - 1) * tablePageSize + index + 1}
                            </TableCell>
                            <TableCell className="px-3 py-3 font-mono text-xs">{row.rentalId}</TableCell>
                            <TableCell className="px-3 py-3">{row.bookingNo || "-"}</TableCell>
                            <TableCell className="px-3 py-3">{formatDateTime(row.bookingAt)}</TableCell>
                            <TableCell className="px-3 py-3 text-right">₹{row.totalAmount}</TableCell>
                            <TableCell className="px-3 py-3 text-right">₹{row.pendingAmount}</TableCell>
                            <TableCell className="px-3 py-3">
                              <Input
                                value={row.description}
                                placeholder="Description"
                                onChange={(event) => {
                                  const value = event.target.value;
                                  setFormRows((prev) =>
                                    prev.map((current) =>
                                      current.rentalId === row.rentalId
                                        ? { ...current, description: value }
                                        : current,
                                    ),
                                  );
                                }}
                              />
                            </TableCell>
                            <TableCell className="px-3 py-3">
                              <Input
                                type="number"
                                min="0"
                                max={row.pendingAmount}
                                value={row.receivedAmount}
                                onChange={(event) => {
                                  const value = event.target.value;
                                  setFormRows((prev) =>
                                    prev.map((current) =>
                                      current.rentalId === row.rentalId
                                        ? { ...current, receivedAmount: value }
                                        : current,
                                    ),
                                  );
                                }}
                              />
                            </TableCell>
                            <TableCell className="px-3 py-3 text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setFormRows((prev) =>
                                    prev.filter((current) => current.rentalId !== row.rentalId),
                                  );
                                }}
                                className="text-red-600 hover:text-red-700 cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                  <TablePagination
                    page={formRowsPage}
                    pageSize={tablePageSize}
                    totalItems={formRows.length}
                    onPageChange={setFormRowsPage}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-600">Discount</Label>
                    <Input
                      type="number"
                      min="0"
                      value={discountAmount}
                      onChange={(event) => setDiscountAmount(event.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2 rounded-lg border border-slate-200 px-4 py-3">
                    <p className="text-xs font-semibold text-slate-500">Total Received</p>
                    <p className="text-xl font-black text-[#0e1b17]">₹{totalReceived.toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (!savingReceipt) {
                        setIsCreateOpen(false);
                        resetCreateForm();
                      }
                    }}
                    disabled={savingReceipt}
                    className="cursor-pointer rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="brand"
                    onClick={() => void handleSaveReceipt()}
                    disabled={savingReceipt}
                    className="cursor-pointer rounded-xl bg-[#17cf91] font-bold text-white"
                  >
                    {savingReceipt ? "Saving..." : editingReceiptId ? "Update" : "Save"}
                  </Button>
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {formBootstrapLoading ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div className="h-8 w-8 border-4 border-[#17cf91] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(deletingReceipt)}
        title="Delete Receipt"
        description={
          deletingReceipt
            ? `Delete ${getReceiptNo(deletingReceipt.id)}? This will restore amounts to rental pending balances.`
            : ""
        }
        loading={deleting}
        onConfirm={() => void handleDeleteReceipt()}
        onOpenChange={(open) => {
          if (!open && !deleting) {
            setDeletingReceipt(null);
          }
        }}
      />
    </div>
  );
}
