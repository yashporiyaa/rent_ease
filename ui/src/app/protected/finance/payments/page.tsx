"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "react-toastify";
import {
  createRentalPayment,
  deleteRentalPayment,
  getRentalPaymentPendingRentals,
  getRentalPayments,
  searchRentalPaymentCustomers,
  updateRentalPayment,
} from "@/lib/api/rental-payments";
import { getRentalById } from "@/lib/api/rentals";
import {
  RentalPaymentCustomerOption,
  RentalPaymentPendingRental,
  RentalPaymentMode,
  RentalPaymentRecord,
  RentalRecord,
} from "@/types";
import { Pencil, Trash2, X } from "lucide-react";
import { ConfirmDialog } from "@/components/common/confirm-dialog";

type RentalPaymentFormRow = {
  rentalId: string;
  bookingNo?: string | null;
  bookingAt: string;
  totalAmount: number;
  depositAmount: number;
  description: string;
  paidAmount: string;
};

const PAYMENT_MODES: RentalPaymentMode[] = [
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

const getPaymentNo = (paymentId: string) =>
  `PAY-${paymentId.replace(/-/g, "").slice(0, 8).toUpperCase()}`;

const toDateInput = (value?: string | null) => {
  if (!value) return getTodayDateValue();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return getTodayDateValue();
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 10);
};

export default function PaymentsPage() {
  const searchParams = useSearchParams();
  const today = useMemo(() => getTodayDateValue(), []);
  const deepLinkRentalId = searchParams.get("rentalId");

  const [filters, setFilters] = useState({
    fromDate: today,
    toDate: today,
  });
  const [payments, setPayments] = useState<RentalPaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formBootstrapLoading, setFormBootstrapLoading] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [deletingPayment, setDeletingPayment] = useState<RentalPaymentRecord | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [autoOpenedRentalId, setAutoOpenedRentalId] = useState<string | null>(null);

  const [customerSearch, setCustomerSearch] = useState("");
  const [customerOptions, setCustomerOptions] = useState<RentalPaymentCustomerOption[]>([]);
  const [customerSearching, setCustomerSearching] = useState(false);
  const [selectedCustomer, setSelectedCustomer] =
    useState<RentalPaymentCustomerOption | null>(null);

  const [pendingRentalsLoading, setPendingRentalsLoading] = useState(false);
  const [formRows, setFormRows] = useState<RentalPaymentFormRow[]>([]);

  const [entryDate, setEntryDate] = useState(today);
  const [paymentMode, setPaymentMode] = useState<RentalPaymentMode>("CASH");
  const [discountAmount, setDiscountAmount] = useState("0");

  const fetchPayments = useCallback(async (fromDate?: string, toDate?: string) => {
    try {
      const res = await getRentalPayments({
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      });
      setPayments(res.data as RentalPaymentRecord[]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch payments";
      toast.error(message);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchPayments(filters.fromDate, filters.toDate);
      setLoading(false);
    };

    void load();
  }, [fetchPayments, filters.fromDate, filters.toDate]);

  useEffect(() => {
    if (!isCreateOpen) {
      return;
    }

    const timer = setTimeout(async () => {
      setCustomerSearching(true);
      try {
        const res = await searchRentalPaymentCustomers(customerSearch);
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

  const resetCreateForm = () => {
    setCustomerSearch("");
    setSelectedCustomer(null);
    setCustomerOptions([]);
    setFormRows([]);
    setEntryDate(getTodayDateValue());
    setPaymentMode("CASH");
    setDiscountAmount("0");
    setEditingPaymentId(null);
  };

  const loadPendingRentalsForCustomer = async (customerId: string) => {
    setPendingRentalsLoading(true);
    try {
      const res = await getRentalPaymentPendingRentals(customerId);
      const rentals = res.data as RentalPaymentPendingRental[];

      setFormRows(
        rentals.map((rental) => ({
          rentalId: rental.id,
          bookingNo: rental.bookingNo,
          bookingAt: rental.bookingAt,
          totalAmount: rental.totalAmount,
          depositAmount: rental.depositAmount,
          description: "",
          paidAmount: "",
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
      const res = await searchRentalPaymentCustomers("");
      setCustomerOptions(res.data);
      setEditingPaymentId(null);
      setIsCreateOpen(true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load payment form data";
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
        searchRentalPaymentCustomers(""),
      ]);

      const rental = rentalRes.data as RentalRecord;
      if (!rental?.id) {
        throw new Error("Rental not found");
      }

      const depositAmount = Number(rental.depositAmount ?? 0);
      if (depositAmount <= 0) {
        toast.info("Selected rental has no deposit pending.");
        return;
      }

      if (!rental.customerId) {
        throw new Error("Customer is missing for selected rental");
      }

      setCustomerOptions(customersRes.data);
      setSelectedCustomer({
        id: rental.customerId,
        name: rental.customer.name,
        pendingTotal: depositAmount,
      });
      setCustomerSearch(rental.customer.name);
      setEntryDate(getTodayDateValue());
      setPaymentMode("CASH");
      setDiscountAmount("0");
      setEditingPaymentId(null);
      setFormRows([
        {
          rentalId: rental.id,
          bookingNo: rental.bookingNo,
          bookingAt: rental.bookingAt,
          totalAmount: rental.totalAmount,
          depositAmount,
          description: "",
          paidAmount: String(depositAmount),
        },
      ]);
      setIsCreateOpen(true);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load payment form data for selected rental";
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

  const handleCustomerSelect = async (customer: RentalPaymentCustomerOption) => {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.name);
    await loadPendingRentalsForCustomer(customer.id);
  };

  const openEditModal = async (payment: RentalPaymentRecord) => {
    setFormBootstrapLoading(true);
    try {
      const [customersRes, pendingRes] = await Promise.all([
        searchRentalPaymentCustomers(""),
        getRentalPaymentPendingRentals(payment.customer.id),
      ]);

      setCustomerOptions(customersRes.data);
      setSelectedCustomer({
        id: payment.customer.id,
        name: payment.customer.name,
        pendingTotal: pendingRes.data.reduce(
          (sum: number, rental: RentalPaymentPendingRental) => sum + rental.depositAmount,
          0,
        ),
      });
      setCustomerSearch(payment.customer.name);
      setEntryDate(toDateInput(payment.entryDate));
      setPaymentMode(payment.paymentMode);
      setDiscountAmount(String(payment.discountAmount ?? 0));
      setEditingPaymentId(payment.id);

      const pendingMap = new Map(
        (pendingRes.data as RentalPaymentPendingRental[]).map((rental) => [rental.id, rental]),
      );
      const lineMap = new Map(payment.lineItems.map((line) => [line.rental.id, line]));

      const mergedRows: RentalPaymentFormRow[] = [];

      for (const rental of pendingRes.data as RentalPaymentPendingRental[]) {
        const existingLine = lineMap.get(rental.id);
        const rollbackAmount = existingLine
          ? existingLine.paidAmount + (existingLine.discountAmount ?? 0)
          : 0;

        mergedRows.push({
          rentalId: rental.id,
          bookingNo: rental.bookingNo,
          bookingAt: rental.bookingAt,
          totalAmount: rental.totalAmount,
          depositAmount: rental.depositAmount + rollbackAmount,
          description: existingLine?.description ?? "",
          paidAmount: existingLine ? String(existingLine.paidAmount) : "",
        });
      }

      for (const line of payment.lineItems) {
        if (pendingMap.has(line.rental.id)) {
          continue;
        }

        mergedRows.push({
          rentalId: line.rental.id,
          bookingNo: line.rental.bookingNo,
          bookingAt: line.rental.bookingAt,
          totalAmount: line.rental.totalAmount,
          depositAmount: line.paidAmount + (line.discountAmount ?? 0),
          description: line.description ?? "",
          paidAmount: String(line.paidAmount),
        });
      }

      setFormRows(mergedRows);
      setIsCreateOpen(true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load payment for edit";
      toast.error(message);
    } finally {
      setFormBootstrapLoading(false);
    }
  };

  const grossPaid = useMemo(
    () =>
      formRows.reduce((sum, row) => {
        const amount = Number(row.paidAmount) || 0;
        return sum + amount;
      }, 0),
    [formRows],
  );
  const discountValue = Number(discountAmount) || 0;
  const totalPaid = Math.max(0, grossPaid - discountValue);

  const handleSearch = async () => {
    setSearching(true);
    await fetchPayments(filters.fromDate, filters.toDate);
    setSearching(false);
  };

  const handleSavePayment = async () => {
    if (!selectedCustomer?.id) {
      toast.error("Please select customer");
      return;
    }

    if (formRows.length === 0) {
      toast.error("No rentals available for selected customer");
      return;
    }

    const discount = Number(discountAmount) || 0;
    if (discount < 0) {
      toast.error("Discount cannot be negative");
      return;
    }

    if (grossPaid <= 0) {
      toast.error("Enter paid amount");
      return;
    }

    const selectedPendingTotal = formRows.reduce(
      (sum, row) => sum + row.depositAmount,
      0,
    );

    if (grossPaid > selectedPendingTotal) {
      toast.error("Paid amount exceeds selected deposit total");
      return;
    }

    if (discount > grossPaid) {
      toast.error("Discount cannot exceed paid amount");
      return;
    }

    const hasInvalidLineAmount = formRows.some((row) => {
      const amount = Number(row.paidAmount) || 0;
      return amount < 0 || amount > row.depositAmount;
    });

    if (hasInvalidLineAmount) {
      toast.error("Paid amount must be between 0 and deposit");
      return;
    }

    setSavingPayment(true);
    try {
      const payload = {
        customerId: selectedCustomer.id,
        entryDate,
        paymentMode,
        discountAmount: discount,
        lineItems: formRows.map((row) => ({
          rentalId: row.rentalId,
          description: row.description.trim() || undefined,
          paidAmount: Number(row.paidAmount) || 0,
        })),
      };

      if (editingPaymentId) {
        await updateRentalPayment(editingPaymentId, payload);
        toast.success("Payment updated successfully");
      } else {
        await createRentalPayment(payload);
        toast.success("Payment created successfully");
      }

      setIsCreateOpen(false);
      resetCreateForm();
      setLoading(true);
      await fetchPayments(filters.fromDate, filters.toDate);
      setLoading(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save payment";
      toast.error(message);
    } finally {
      setSavingPayment(false);
    }
  };

  const handleDeletePayment = async () => {
    if (!deletingPayment) return;

    setDeleting(true);
    try {
      await deleteRentalPayment(deletingPayment.id);
      toast.success("Payment deleted successfully");
      setDeletingPayment(null);
      setLoading(true);
      await fetchPayments(filters.fromDate, filters.toDate);
      setLoading(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete payment";
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
          <h1 className="text-2xl font-black text-[#0e1b17]">Payments</h1>
          <p className="text-slate-500 mt-1">
            Track deposit payments and adjust rental deposit balances.
          </p>
        </div>

        <Button
          variant="brand"
          onClick={() => void openCreateModal()}
          disabled={formBootstrapLoading}
          className="rounded-full bg-[#17cf91] text-[#0e1b17] font-bold cursor-pointer"
        >
          Add Payment
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
              <TableHead className="px-4 py-3">Payment No.</TableHead>
              <TableHead className="px-4 py-3">Mode</TableHead>
              <TableHead className="px-4 py-3">Customer</TableHead>
              <TableHead className="px-4 py-3 text-right">Total Paid</TableHead>
              <TableHead className="px-4 py-3 text-right">Discount</TableHead>
              <TableHead className="px-4 py-3 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y">
            {payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  No payments found for selected date range.
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => (
                <TableRow key={payment.id} className="hover:bg-slate-50">
                  <TableCell className="px-4 py-3">{formatDateTime(payment.entryDate)}</TableCell>
                  <TableCell className="px-4 py-3 font-medium">{getPaymentNo(payment.id)}</TableCell>
                  <TableCell className="px-4 py-3">{payment.paymentMode}</TableCell>
                  <TableCell className="px-4 py-3">{payment.customer.name}</TableCell>
                  <TableCell className="px-4 py-3 text-right font-semibold">
                    ₹{payment.totalPaid}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">₹{payment.discountAmount}</TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => void openEditModal(payment)}
                        className="h-8 w-8 text-green-600 hover:text-green-700 cursor-pointer"
                        aria-label={`Edit ${getPaymentNo(payment.id)}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingPayment(payment)}
                        className="h-8 w-8 text-red-600 hover:text-red-700 cursor-pointer"
                        aria-label={`Delete ${getPaymentNo(payment.id)}`}
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
      </div>

      {isCreateOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 p-4 overflow-y-auto"
          onClick={() => {
            if (!savingPayment) {
              setIsCreateOpen(false);
              resetCreateForm();
            }
          }}
        >
          <div className="min-h-full flex items-center justify-center">
            <div className="w-full max-w-6xl" onClick={(event) => event.stopPropagation()}>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-[#0e1b17]">
                    {editingPaymentId ? "Update Payment" : "Add Payment"}
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (!savingPayment) {
                        setIsCreateOpen(false);
                        resetCreateForm();
                      }
                    }}
                    disabled={savingPayment}
                    className="cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

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
                            No customer with deposit pending found.
                          </div>
                        ) : (
                          customerOptions.map((customer) => (
                            <button
                              key={customer.id}
                              type="button"
                              className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50"
                              onClick={() => void handleCustomerSelect(customer)}
                            >
                              <div className="font-medium text-[#0e1b17]">{customer.name}</div>
                              <div className="text-xs text-slate-500">
                                Deposit Pending: ₹{customer.pendingTotal}
                              </div>
                            </button>
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
                      onValueChange={(value: RentalPaymentMode) => setPaymentMode(value)}
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
                        <TableHead className="px-3 py-3 text-right">Deposit</TableHead>
                        <TableHead className="px-3 py-3">Description</TableHead>
                        <TableHead className="px-3 py-3">Paid Amount</TableHead>
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
                            Select a customer to load rentals with deposit pending.
                          </TableCell>
                        </TableRow>
                      ) : (
                        formRows.map((row, index) => (
                          <TableRow key={row.rentalId} className="align-top">
                            <TableCell className="px-3 py-3">{index + 1}</TableCell>
                            <TableCell className="px-3 py-3 font-mono text-xs">{row.rentalId}</TableCell>
                            <TableCell className="px-3 py-3">{row.bookingNo || "-"}</TableCell>
                            <TableCell className="px-3 py-3">{formatDateTime(row.bookingAt)}</TableCell>
                            <TableCell className="px-3 py-3 text-right">₹{row.totalAmount}</TableCell>
                            <TableCell className="px-3 py-3 text-right">₹{row.depositAmount}</TableCell>
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
                                max={row.depositAmount}
                                value={row.paidAmount}
                                onChange={(event) => {
                                  const value = event.target.value;
                                  setFormRows((prev) =>
                                    prev.map((current) =>
                                      current.rentalId === row.rentalId
                                        ? { ...current, paidAmount: value }
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
                    <p className="text-xs font-semibold text-slate-500">Total Paid</p>
                    <p className="text-xl font-black text-[#0e1b17]">₹{totalPaid.toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (!savingPayment) {
                        setIsCreateOpen(false);
                        resetCreateForm();
                      }
                    }}
                    disabled={savingPayment}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="brand"
                    onClick={() => void handleSavePayment()}
                    disabled={savingPayment}
                    className="bg-[#17cf91] text-[#0e1b17] font-bold cursor-pointer"
                  >
                    {savingPayment ? "Saving..." : editingPaymentId ? "Update" : "Save"}
                  </Button>
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
        open={Boolean(deletingPayment)}
        title="Delete Payment"
        description={
          deletingPayment
            ? `Delete ${getPaymentNo(deletingPayment.id)}? This will restore amounts to rental deposit balances.`
            : ""
        }
        loading={deleting}
        onConfirm={() => void handleDeletePayment()}
        onOpenChange={(open) => {
          if (!open && !deleting) {
            setDeletingPayment(null);
          }
        }}
      />
    </div>
  );
}
