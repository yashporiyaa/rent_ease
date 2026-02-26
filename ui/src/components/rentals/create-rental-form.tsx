"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
import { useRouter } from "next/navigation";
import {
  checkRentalItemAvailability,
  createRental,
  updateRental,
} from "@/lib/api/rentals";
import { toast } from "react-toastify";
import {
  CalendarClock,
  FileText,
  MapPin,
  Package2,
  Pencil,
  Plus,
  ReceiptText,
  Search,
  Shield,
  Trash2,
  UserRound,
  UserRoundPlus,
  X,
} from "lucide-react";
import { createCustomer, findCustomerByPhone, updateCustomer } from "@/lib/api/customers";
import { CustomerListItem, CreateRentalPayload, InventoryItem, RentalRecord, CustomerModalState, RentalFormState, RentalLineFormState, RentalSummaryState, CustomerModalUiState, RentalLine } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TablePagination } from "@/components/common/table-pagination";

const gstRates = [0, 5, 12, 18, 28];

const emptyCustomerForm: CustomerModalState = {
  name: "",
  phone1: "",
  phone2: "",
  address: "",
};

const createInitialRentalForm = (): RentalFormState => ({
  customerId: "",
  bookingNo: "",
  bookingAt: nowLocalDateTime(),
  deliveryAddress: "",
});

const createInitialLineForm = (): RentalLineFormState => ({
  itemId: "",
  lineDescription: "",
  fromAt: "",
  toAt: "",
  quantity: "1",
  rate: "",
  taxPercent: "0",
  editingLineId: null,
});

const initialSummary: RentalSummaryState = {
  globalDiscountPercent: "0",
  globalDiscountAmount: "0",
  advanceAmount: "0",
  depositAmount: "0",
};

const initialCustomerModalUi: CustomerModalUiState = {
  open: false,
  form: emptyCustomerForm,
  foundCustomer: null,
  isEditCustomer: false,
  submittingCustomer: false,
};

const makeLineId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const round2 = (n: number) => Math.round(n * 100) / 100;
const nowLocalDateTime = () => {
  const now = new Date();
  const tzOffset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
};
const toLocalDateTimeInput = (value?: string | Date | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
};
const splitLocalDateTime = (value: string) => {
  if (!value) return { date: "", time: "" };
  const [date = "", time = ""] = value.split("T");
  return { date, time: time.slice(0, 5) };
};
const HOURS_12 = Array.from({ length: 12 }, (_, index) =>
  String(index + 1).padStart(2, "0"),
);
const MINUTES = Array.from({ length: 60 }, (_, index) =>
  String(index).padStart(2, "0"),
);
const get12HourParts = (time24?: string) => {
  const [hoursText = "00", minutesText = "00"] = (time24 || "").split(":");
  const hoursNumber = Number(hoursText);
  const minutes = /^\d{2}$/.test(minutesText) ? minutesText : "00";

  if (!Number.isFinite(hoursNumber) || hoursNumber < 0 || hoursNumber > 23) {
    return { hour: "12", minute: minutes, period: "AM" as "AM" | "PM" };
  }

  const period = hoursNumber >= 12 ? "PM" : "AM";
  const normalizedHour = hoursNumber % 12 || 12;

  return {
    hour: String(normalizedHour).padStart(2, "0"),
    minute: minutes,
    period,
  };
};
const to24Hour = (hour12: string, minute: string, period: "AM" | "PM") => {
  const parsedHour = Number(hour12);
  const normalizedHour = Number.isFinite(parsedHour) ? parsedHour % 12 : 0;
  const hour24 = period === "PM" ? normalizedHour + 12 : normalizedHour;
  return `${String(hour24).padStart(2, "0")}:${minute}`;
};
const parseInputDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

export function CreateRentalForm({
  customers,
  items,
  rental,
  onSuccess,
  onClose,
}: {
  customers: CustomerListItem[];
  items: InventoryItem[];
  rental?: RentalRecord | null;
  onSuccess?: () => void;
  onClose?: () => void;
}) {
  const router = useRouter();
  const isEditMode = Boolean(rental?.id);
  const [isMounted, setIsMounted] = useState(false);

  const [customerList, setCustomerList] = useState<CustomerListItem[]>(customers);
  const [rentalForm, setRentalForm] = useState<RentalFormState>(createInitialRentalForm);

  const [lineForm, setLineForm] = useState<RentalLineFormState>(createInitialLineForm);

  const [lines, setLines] = useState<RentalLine[]>([]);
  const [lineTablePage, setLineTablePage] = useState(1);

  const [summary, setSummary] = useState<RentalSummaryState>(initialSummary);

  const [customerModal, setCustomerModal] = useState<CustomerModalUiState>(
    initialCustomerModalUi,
  );
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const hasFoundCustomer = Boolean(
    customerModal.foundCustomer?.id && customerModal.foundCustomer?.name,
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setCustomerList(customers);
  }, [customers]);

  useEffect(() => {
    if (!rental?.id) {
      setRentalForm(createInitialRentalForm());
      setLines([]);
      setSummary(initialSummary);
      return;
    }

    setRentalForm({
      customerId: rental.customerId ?? "",
      bookingNo: rental.bookingNo ?? "",
      bookingAt: toLocalDateTimeInput(rental.bookingAt) || nowLocalDateTime(),
      deliveryAddress: rental.deliveryAddress ?? "",
    });
    setSummary({
      globalDiscountPercent: String(rental.discountPercent ?? 0),
      globalDiscountAmount: String(rental.discountAmount ?? 0),
      advanceAmount: String(rental.advanceAmount ?? 0),
      depositAmount: String(rental.depositAmount ?? 0),
    });
    setLines(
      (rental.rentalItems ?? []).map((line) => ({
        id: line.id,
        itemId: line.itemId ?? "",
        productName: line.item?.fullName ?? "Product",
        image: line.image ?? line.item?.images?.[0],
        description: line.description ?? "",
        fromAt: toLocalDateTimeInput(line.fromAt),
        toAt: toLocalDateTimeInput(line.toAt),
        quantity: line.quantity,
        rate: line.price,
        discountPercent: Number(line.discountPercent ?? 0),
        discountAmount: Number(line.discountAmount ?? 0),
        taxPercent: Number(line.taxPercent ?? 0),
        taxAmount: Number(line.taxAmount ?? 0),
        total: Number(line.totalAmount ?? 0),
        status: line.status ?? "ACTIVE",
      })),
    );
    setLineForm((prev) => ({ ...prev, editingLineId: null }));
  }, [rental]);

  const selectedProduct = items.find((item) => item.id === lineForm.itemId);

  const lineBaseAmount = round2(
    (Number(lineForm.quantity) || 0) * (Number(lineForm.rate) || 0),
  );
  const lineTaxPct = Number(lineForm.taxPercent) || 0;
  const lineTaxAmt = round2((lineBaseAmount * lineTaxPct) / 100);
  const lineTotal = round2(lineBaseAmount + lineTaxAmt);

  const linesSubtotal = round2(lines.reduce((sum, line) => sum + line.total, 0));
  const totalQty = lines.reduce((sum, line) => sum + line.quantity, 0);
  const linesTax = round2(lines.reduce((sum, line) => sum + line.taxAmount, 0));
  const lineTablePageSize = 10;
  const lineTableTotalPages = Math.max(1, Math.ceil(lines.length / lineTablePageSize));
  const currentLineTablePage = Math.min(lineTablePage, lineTableTotalPages);
  const pagedLines = lines.slice(
    (currentLineTablePage - 1) * lineTablePageSize,
    (currentLineTablePage - 1) * lineTablePageSize + lineTablePageSize,
  );

  const overallDiscountAmt = round2(Number(summary.globalDiscountAmount) || 0);
  const overallDiscountPct = Number(summary.globalDiscountPercent) || 0;
  const totalAfterDiscount = round2(linesSubtotal - overallDiscountAmt);
  const advance = Number(summary.advanceAmount) || 0;
  const deposit = Number(summary.depositAmount) || 0;
  const pending = round2(totalAfterDiscount - advance);
  const outstandingWithDeposit = round2(pending - deposit);

  const updateDiscountFromPercent = (value: string) => {
    const pct = Number(value) || 0;
    const amount = round2((linesSubtotal * pct) / 100);
    setSummary((prev) => ({
      ...prev,
      globalDiscountPercent: value,
      globalDiscountAmount: String(amount),
    }));
  };

  const updateDiscountFromAmount = (value: string) => {
    const amount = Number(value) || 0;
    const pct = linesSubtotal > 0 ? round2((amount / linesSubtotal) * 100) : 0;
    setSummary((prev) => ({
      ...prev,
      globalDiscountAmount: value,
      globalDiscountPercent: String(pct),
    }));
  };

  const resetLineForm = () => {
    setLineForm(createInitialLineForm());
  };

  const updateLineDateTime = (
    field: "fromAt" | "toAt",
    part: "date" | "time",
    value: string,
  ) => {
    setLineForm((prev) => {
      const { date, time } = splitLocalDateTime(prev[field]);
      const nextDate = part === "date" ? value : date;
      const nextTime = part === "time" ? value : time;

      if (!nextDate) {
        return { ...prev, [field]: "" };
      }

      return {
        ...prev,
        [field]: `${nextDate}T${nextTime || "00:00"}`,
      };
    });
  };

  const updateBookingDateTime = (part: "date" | "time", value: string) => {
    setRentalForm((prev) => {
      const { date, time } = splitLocalDateTime(prev.bookingAt);
      const nextDate = part === "date" ? value : date;
      const nextTime = part === "time" ? value : time;

      if (!nextDate) {
        return { ...prev, bookingAt: "" };
      }

      return {
        ...prev,
        bookingAt: `${nextDate}T${nextTime || "00:00"}`,
      };
    });
  };

  const updateBookingTime12h = (
    part: "hour" | "minute" | "period",
    value: string,
  ) => {
    setRentalForm((prev) => {
      const { date, time } = splitLocalDateTime(prev.bookingAt);
      const current = get12HourParts(time);
      const next = {
        ...current,
        [part]: value,
      };
      const fallbackDate = date || splitLocalDateTime(nowLocalDateTime()).date;

      return {
        ...prev,
        bookingAt: `${fallbackDate}T${to24Hour(
          next.hour,
          next.minute,
          next.period as "AM" | "PM",
        )}`,
      };
    });
  };

  const updateLineTime12h = (
    field: "fromAt" | "toAt",
    part: "hour" | "minute" | "period",
    value: string,
  ) => {
    setLineForm((prev) => {
      const { date, time } = splitLocalDateTime(prev[field]);
      const current = get12HourParts(time);
      const next = {
        ...current,
        [part]: value,
      };
      const fallbackDate =
        date ||
        splitLocalDateTime(prev.fromAt).date ||
        splitLocalDateTime(prev.toAt).date ||
        splitLocalDateTime(rentalForm.bookingAt).date ||
        splitLocalDateTime(nowLocalDateTime()).date;

      return {
        ...prev,
        [field]: `${fallbackDate}T${to24Hour(
          next.hour,
          next.minute,
          next.period as "AM" | "PM",
        )}`,
      };
    });
  };

  const addOrUpdateLine = async () => {
    if (
      !lineForm.itemId ||
      !lineForm.fromAt ||
      !lineForm.toAt ||
      !lineForm.quantity ||
      !lineForm.rate
    ) {
      toast.error("Fill product section fields first");
      return;
    }

    const item = items.find((current) => current.id === lineForm.itemId);
    if (!item) {
      toast.error("Invalid product selected");
      return;
    }

    const fromDate = parseInputDate(lineForm.fromAt);
    const toDate = parseInputDate(lineForm.toAt);
    if (!fromDate || !toDate) {
      toast.error("Select valid delivery and return date/time");
      return;
    }
    if (toDate <= fromDate) {
      toast.error("Return date/time must be later than delivery date/time");
      return;
    }

    const requestedQty = Number(lineForm.quantity);
    if (!Number.isFinite(requestedQty) || requestedQty <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    setCheckingAvailability(true);
    try {
      const availabilityRes = await checkRentalItemAvailability({
        itemId: lineForm.itemId,
        quantity: requestedQty,
        fromAt: lineForm.fromAt,
        toAt: lineForm.toAt,
        excludeRentalId: rental?.id,
      });

      const availability = availabilityRes.data as {
        available: boolean;
        availableStock: number;
        itemName: string;
      };

      if (!availability.available) {
        toast.error(
          `${availability.itemName} has only ${availability.availableStock} available for selected dates`,
        );
        return;
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to check availability";
      toast.error(message);
      return;
    } finally {
      setCheckingAvailability(false);
    }

    const line: RentalLine = {
      id: lineForm.editingLineId ?? makeLineId(),
      itemId: lineForm.itemId,
      productName: item.fullName,
      image: item.images?.[0],
      description: lineForm.lineDescription || item.description || "",
      fromAt: lineForm.fromAt,
      toAt: lineForm.toAt,
      quantity: requestedQty,
      rate: Number(lineForm.rate),
      discountPercent: 0,
      discountAmount: 0,
      taxPercent: Number(lineForm.taxPercent) || 0,
      taxAmount: lineTaxAmt,
      total: lineTotal,
      status: "ACTIVE",
    };

    setLines((prev) => {
      if (lineForm.editingLineId) {
        return prev.map((current) =>
          current.id === lineForm.editingLineId ? line : current,
        );
      }
      return [...prev, line];
    });

    resetLineForm();
  };

  const editLine = (line: RentalLine) => {
    setLineForm({
      editingLineId: line.id,
      itemId: line.itemId,
      lineDescription: line.description || "",
      fromAt: line.fromAt,
      toAt: line.toAt,
      quantity: String(line.quantity),
      rate: String(line.rate),
      taxPercent: String(line.taxPercent),
    });
  };

  const deleteLine = (lineId: string) => {
    setLines((prev) => prev.filter((line) => line.id !== lineId));
  };

  const openCustomerModal = () => {
    setCustomerModal((prev) => ({
      ...prev,
      open: true,
      form: emptyCustomerForm,
      foundCustomer: null,
      isEditCustomer: false,
    }));
  };

  const handlePhoneLookup = async () => {
    const phone = customerModal.form.phone1.trim();
    if (!phone) return;

    try {
      const res = await findCustomerByPhone(phone);
      if (res.data) {
        const customer = res.data as CustomerListItem;
        if (customer?.id && customer?.name) {
          setCustomerModal((prev) => ({
            ...prev,
            foundCustomer: customer,
            form: {
              name: customer.name ?? "",
              phone1: customer.phone1 ?? "",
              phone2: customer.phone2 ?? "",
              address: customer.address ?? "",
            },
            isEditCustomer: false,
          }));
        } else {
          setCustomerModal((prev) => ({
            ...prev,
            foundCustomer: null,
            isEditCustomer: false,
          }));
        }
      } else {
        setCustomerModal((prev) => ({
          ...prev,
          foundCustomer: null,
          isEditCustomer: false,
        }));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Lookup failed";
      toast.error(message);
    }
  };

  const upsertCustomer = async (stayOpen: boolean) => {
    if (!customerModal.form.name.trim()) {
      toast.error("Customer name is required");
      return;
    }

    setCustomerModal((prev) => ({ ...prev, submittingCustomer: true }));
    try {
      let customer: CustomerListItem;

      if (customerModal.foundCustomer) {
        if (customerModal.isEditCustomer) {
          const res = await updateCustomer(customerModal.foundCustomer.id, {
            name: customerModal.form.name,
            phone1: customerModal.form.phone1,
            phone2: customerModal.form.phone2,
            address: customerModal.form.address,
          });
          customer = res.data;
          toast.success("Customer updated");
        } else {
          customer = customerModal.foundCustomer;
        }
      } else {
        const res = await createCustomer(
          customerModal.form.name,
          customerModal.form.phone1,
          customerModal.form.phone2,
          customerModal.form.address,
        );
        customer = res.data;
        toast.success("Customer created");
      }

      setCustomerList((prev) => {
        const exists = prev.some((c) => c.id === customer.id);
        if (exists) {
          return prev.map((c) => (c.id === customer.id ? customer : c));
        }
        return [...prev, customer];
      });

      setRentalForm((prev) => ({ ...prev, customerId: customer.id }));

      if (stayOpen) {
        setCustomerModal((prev) => ({
          ...prev,
          form: emptyCustomerForm,
          foundCustomer: null,
          isEditCustomer: false,
        }));
      } else {
        setCustomerModal((prev) => ({ ...prev, open: false }));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Customer save failed";
      toast.error(message);
    } finally {
      setCustomerModal((prev) => ({ ...prev, submittingCustomer: false }));
    }
  };

  const submitRental = async () => {
    const missingFields: string[] = [];
    if (!rentalForm.customerId) missingFields.push("Customer");
    if (!rentalForm.bookingAt) missingFields.push("Booking Date & Time");
    if (lines.length === 0) missingFields.push("At least one Product Line");

    if (missingFields.length > 0) {
      toast.error(`Missing: ${missingFields.join(", ")}`);
      return;
    }

    const bookingDate = parseInputDate(rentalForm.bookingAt);
    if (!bookingDate) {
      toast.error("Booking date/time is invalid");
      return;
    }

    const hasInvalidLineDate = lines.some((line) => {
      const fromDate = parseInputDate(line.fromAt);
      const toDate = parseInputDate(line.toAt);
      return !fromDate || !toDate || toDate <= fromDate;
    });

    if (hasInvalidLineDate) {
      toast.error("Each product line must have a valid return time after delivery time");
      return;
    }

    const payload: CreateRentalPayload = {
      customerId: rentalForm.customerId,
      bookingNo: rentalForm.bookingNo.trim() || undefined,
      bookingAt: rentalForm.bookingAt,
      deliveryAddress: rentalForm.deliveryAddress.trim(),
      totalQuantity: totalQty,
      discountPercent: overallDiscountPct,
      discountAmount: overallDiscountAmt,
      taxPercent: 0,
      taxAmountValue: linesTax,
      totalAmount: totalAfterDiscount,
      advanceAmount: Number(summary.advanceAmount) || 0,
      pendingAmount: pending,
      depositAmount: Number(summary.depositAmount) || 0,
      outstandingWithDeposit,
      lineItems: lines.map((line) => ({
        itemId: line.itemId,
        quantity: line.quantity,
        rate: line.rate,
        fromAt: line.fromAt,
        toAt: line.toAt,
        description: line.description,
        image: line.image,
        discountPercent: line.discountPercent,
        discountAmount: line.discountAmount,
        taxPercent: line.taxPercent,
        taxAmount: line.taxAmount,
        total: line.total,
        status: line.status,
      })),
    };

    setSubmitting(true);
    try {
      if (isEditMode && rental?.id) {
        await updateRental(rental.id, payload);
        toast.success("Rental updated successfully");
      } else {
        const res = await createRental(payload);
        toast.success("Rental created successfully");
        if (!onSuccess) {
          if (res?.data?.rental?.id) {
            router.push(`/protected/finance/receipts?rentalId=${res.data.rental.id}`);
          } else {
            router.push("/protected/rentals");
          }
        }
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : `Failed to ${isEditMode ? "update" : "create"} rental`;
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const bookingDateTime = splitLocalDateTime(rentalForm.bookingAt);
  const bookingTimeParts = get12HourParts(bookingDateTime.time);
  const fromDateTime = splitLocalDateTime(lineForm.fromAt);
  const toDateTime = splitLocalDateTime(lineForm.toAt);
  const fromTimeParts = get12HourParts(fromDateTime.time);
  const toTimeParts = get12HourParts(toDateTime.time);

  return (
    <div className="w-full max-w-350 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
      <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-5 sm:px-8 sm:py-6">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <ReceiptText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              {isEditMode ? "Update Rental" : "Create New Rental"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {isEditMode
                ? "Update your rental agreement details"
                : "Generate a new rental agreement for your client"}
            </p>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="cursor-pointer">
            <X className="h-5 w-5 text-slate-500" />
          </Button>
        )}
      </div>

      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6 px-5 py-5 sm:px-8 sm:py-7">
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <UserRound className="h-4 w-4 text-emerald-500" />
                <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-500">
                  Customer Details
                </h2>
              </div>
              <Button
                variant="ghost"
                onClick={openCustomerModal}
                className="h-8 cursor-pointer rounded-full px-3 text-xs font-semibold text-emerald-600 hover:bg-emerald-50"
              >
                <UserRoundPlus className="h-4 w-4" />
                Quick Add
              </Button>
            </div>
            <Select
              value={rentalForm.customerId || undefined}
              onValueChange={(value) => setRentalForm((prev) => ({ ...prev, customerId: value }))}
            >
              <SelectTrigger className="h-12 w-full rounded-2xl border-slate-200 bg-slate-50 px-4">
                <div className="flex items-center gap-2 text-slate-500">
                  <Search className="h-4 w-4" />
                  <SelectValue placeholder="Select or search a customer..." />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl p-1">
                {customerList.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id} className="py-2 px-3">
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-emerald-500" />
              <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-500">
                Booking Logistics
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2 rounded-2xl border border-slate-200 p-4">
                <Label className="text-sm font-semibold text-slate-700">Booking Date & Time</Label>
                <Input
                  type="date"
                  className="h-11 rounded-xl border-slate-200 bg-slate-50"
                  value={bookingDateTime.date}
                  onChange={(event) => updateBookingDateTime("date", event.target.value)}
                />
                <div className="grid grid-cols-3 gap-2">
                  <select
                    className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-2 text-sm outline-none"
                    value={bookingTimeParts.hour}
                    onChange={(event) => updateBookingTime12h("hour", event.target.value)}
                  >
                    {HOURS_12.map((hour) => (
                      <option key={hour} value={hour}>
                        {hour}
                      </option>
                    ))}
                  </select>
                  <select
                    className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-2 text-sm outline-none"
                    value={bookingTimeParts.minute}
                    onChange={(event) => updateBookingTime12h("minute", event.target.value)}
                  >
                    {MINUTES.map((minute) => (
                      <option key={minute} value={minute}>
                        {minute}
                      </option>
                    ))}
                  </select>
                  <select
                    className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-2 text-sm outline-none"
                    value={bookingTimeParts.period}
                    onChange={(event) =>
                      updateBookingTime12h("period", event.target.value as "AM" | "PM")
                    }
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-slate-200 p-4">
                <div>
                  <Label className="mb-1 block text-sm font-semibold text-slate-700">
                    Booking Number (Optional)
                  </Label>
                  <div className="relative">
                    <FileText className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      inputMode="numeric"
                      className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-10"
                      placeholder="Leave empty to auto-generate"
                      value={rentalForm.bookingNo}
                      onChange={(event) =>
                        setRentalForm((prev) => ({
                          ...prev,
                          bookingNo: event.target.value.replace(/\D/g, ""),
                        }))
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label className="mb-1 block text-sm font-semibold text-slate-700">
                    Delivery Address
                  </Label>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-10"
                      placeholder="Delivery address"
                      value={rentalForm.deliveryAddress}
                      onChange={(event) =>
                        setRentalForm((prev) => ({ ...prev, deliveryAddress: event.target.value }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border border-slate-200 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Package2 className="h-4 w-4 text-emerald-500" />
                <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-500">
                  Inventory Items
                </h2>
              </div>
              <Button
                variant="outline"
                onClick={() => void addOrUpdateLine()}
                disabled={checkingAvailability}
                className="h-10 min-w-32 cursor-pointer rounded-full border-emerald-200 bg-emerald-50 px-4 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
              >
                <Plus className="h-4 w-4" />
                {checkingAvailability
                  ? "Checking..."
                  : lineForm.editingLineId
                    ? "Update Product"
                    : "Add Product"}
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <Label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Product
                </Label>
                <Select
                  value={lineForm.itemId || undefined}
                  onValueChange={(selectedId) => {
                    setLineForm((prev) => ({ ...prev, itemId: selectedId }));
                    const product = items.find((i) => i.id === selectedId);
                    if (product) {
                      setLineForm((prev) => {
                        const next = {
                          ...prev,
                          itemId: selectedId,
                          rate: String(product.price),
                        };
                        if (!prev.lineDescription) {
                          next.lineDescription = product.description || "";
                        }
                        return next;
                      });
                    } else {
                      setLineForm((prev) => ({ ...prev, itemId: selectedId }));
                    }
                  }}
                >
                  <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-slate-50 text-sm">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl p-1">
                    {items.map((item) => (
                      <SelectItem key={item.id} value={item.id} className="py-2 px-3">
                        {item.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Delivery Date
                </Label>
                <Input
                  className="h-11 rounded-xl border-slate-200 bg-slate-50"
                  type="date"
                  value={fromDateTime.date}
                  onChange={(event) => updateLineDateTime("fromAt", "date", event.target.value)}
                />
              </div>

              <div>
                <Label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Return Date
                </Label>
                <Input
                  className="h-11 rounded-xl border-slate-200 bg-slate-50"
                  type="date"
                  value={toDateTime.date}
                  onChange={(event) => updateLineDateTime("toAt", "date", event.target.value)}
                />
              </div>

              <div>
                <Label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Quantity
                </Label>
                <Input
                  className="h-11 rounded-xl border-slate-200 bg-slate-50"
                  placeholder="Qty"
                  type="number"
                  value={lineForm.quantity}
                  onChange={(event) =>
                    setLineForm((prev) => ({ ...prev, quantity: event.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="xl:col-span-2">
                <Label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Description
                </Label>
                <Input
                  className="h-11 rounded-xl border-slate-200 bg-slate-50"
                  placeholder="Line description"
                  value={lineForm.lineDescription}
                  onChange={(event) =>
                    setLineForm((prev) => ({
                      ...prev,
                      lineDescription: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Rate
                </Label>
                <Input
                  className="h-11 rounded-xl border-slate-200 bg-slate-50"
                  placeholder="Rate"
                  type="number"
                  value={lineForm.rate}
                  onChange={(event) =>
                    setLineForm((prev) => ({ ...prev, rate: event.target.value }))
                  }
                />
              </div>
              <div>
                <Label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  GST
                </Label>
                <Select
                  value={lineForm.taxPercent}
                  onValueChange={(value) =>
                    setLineForm((prev) => ({ ...prev, taxPercent: value }))
                  }
                >
                  <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-slate-50 text-sm">
                    <SelectValue placeholder="GST" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl p-1">
                    {gstRates.map((value) => (
                      <SelectItem key={value} value={String(value)} className="py-2 px-3">
                        {value}%
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Delivery Time
                </p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <select
                    className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm outline-none"
                    value={fromTimeParts.hour}
                    onChange={(event) => updateLineTime12h("fromAt", "hour", event.target.value)}
                  >
                    {HOURS_12.map((hour) => (
                      <option key={hour} value={hour}>
                        {hour}
                      </option>
                    ))}
                  </select>
                  <select
                    className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm outline-none"
                    value={fromTimeParts.minute}
                    onChange={(event) => updateLineTime12h("fromAt", "minute", event.target.value)}
                  >
                    {MINUTES.map((minute) => (
                      <option key={minute} value={minute}>
                        {minute}
                      </option>
                    ))}
                  </select>
                  <select
                    className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm outline-none"
                    value={fromTimeParts.period}
                    onChange={(event) =>
                      updateLineTime12h("fromAt", "period", event.target.value as "AM" | "PM")
                    }
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Return Time
                </p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <select
                    className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm outline-none"
                    value={toTimeParts.hour}
                    onChange={(event) => updateLineTime12h("toAt", "hour", event.target.value)}
                  >
                    {HOURS_12.map((hour) => (
                      <option key={hour} value={hour}>
                        {hour}
                      </option>
                    ))}
                  </select>
                  <select
                    className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm outline-none"
                    value={toTimeParts.minute}
                    onChange={(event) => updateLineTime12h("toAt", "minute", event.target.value)}
                  >
                    {MINUTES.map((minute) => (
                      <option key={minute} value={minute}>
                        {minute}
                      </option>
                    ))}
                  </select>
                  <select
                    className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm outline-none"
                    value={toTimeParts.period}
                    onChange={(event) =>
                      updateLineTime12h("toAt", "period", event.target.value as "AM" | "PM")
                    }
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Tax Amount
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-800">₹{lineTaxAmt}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Line Total
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-800">₹{lineTotal}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Selected Product Preview
              </p>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-lg border border-slate-200 bg-white">
                  {selectedProduct?.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selectedProduct.images[0]}
                      alt={selectedProduct.fullName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-300">
                      <Package2 className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {selectedProduct?.fullName || "No product selected"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {selectedProduct?.description || "Choose a product to auto-fill price/details"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {lines.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                <h3 className="text-sm font-semibold text-slate-700">Added Rental Lines</h3>
              </div>
              <div className="w-full overflow-x-auto">
                <Table className="min-w-300">
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="px-4 py-3 text-left">#</TableHead>
                      <TableHead className="px-4 py-3 text-left">Product</TableHead>
                      <TableHead className="px-4 py-3 text-left">Image</TableHead>
                      <TableHead className="px-4 py-3 text-left">Description</TableHead>
                      <TableHead className="px-4 py-3 text-left">From</TableHead>
                      <TableHead className="px-4 py-3 text-left">To</TableHead>
                      <TableHead className="px-4 py-3 text-right">Qty</TableHead>
                      <TableHead className="px-4 py-3 text-right">Rate</TableHead>
                      <TableHead className="px-4 py-3 text-right">Tax</TableHead>
                      <TableHead className="px-4 py-3 text-right">Total</TableHead>
                      <TableHead className="px-4 py-3 text-left">Status</TableHead>
                      <TableHead className="px-4 py-3 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y">
                    {pagedLines.map((line, index) => (
                      <TableRow key={line.id}>
                        <TableCell className="px-4 py-3">
                          {(currentLineTablePage - 1) * lineTablePageSize + index + 1}
                        </TableCell>
                        <TableCell className="px-4 py-3 font-medium text-slate-800">
                          {line.productName}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          {line.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={line.image}
                              alt={line.productName}
                              className="h-10 w-10 rounded-lg border object-cover"
                            />
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-3">{line.description || "-"}</TableCell>
                        <TableCell className="px-4 py-3">{line.fromAt}</TableCell>
                        <TableCell className="px-4 py-3">{line.toAt}</TableCell>
                        <TableCell className="px-4 py-3 text-right">{line.quantity}</TableCell>
                        <TableCell className="px-4 py-3 text-right">₹{line.rate}</TableCell>
                        <TableCell className="px-4 py-3 text-right">₹{line.taxAmount}</TableCell>
                        <TableCell className="px-4 py-3 text-right font-semibold">
                          ₹{line.total}
                        </TableCell>
                        <TableCell className="px-4 py-3">{line.status}</TableCell>
                        <TableCell className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon-sm"
                              onClick={() => editLine(line)}
                              className="cursor-pointer border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon-sm"
                              onClick={() => deleteLine(line.id)}
                              className="cursor-pointer border-rose-200 text-rose-600 hover:bg-rose-50"
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
                  page={currentLineTablePage}
                  pageSize={lineTablePageSize}
                  totalItems={lines.length}
                  onPageChange={(nextPage) =>
                    setLineTablePage(Math.max(1, Math.min(nextPage, lineTableTotalPages)))
                  }
                />
              </div>
            </div>
          )}
        </div>

        <aside className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50 px-5 py-5 sm:px-6 sm:py-7 lg:border-t-0 lg:border-l">
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-500" />
              <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-500">
                Financial Summary
              </h3>
            </div>
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                <span className="font-medium text-slate-600">Subtotal</span>
                <span className="text-lg font-bold text-slate-900">₹{linesSubtotal}</span>
              </div>

              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Discount
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div>
                    <Label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Percentage
                    </Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                        %
                      </span>
                      <Input
                        className="h-10 rounded-xl border-slate-200 bg-white pr-7 text-sm"
                        type="number"
                        placeholder="0"
                        value={summary.globalDiscountPercent}
                        onChange={(event) => updateDiscountFromPercent(event.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Amount
                    </Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                        ₹
                      </span>
                      <Input
                        className="h-10 rounded-xl border-slate-200 bg-white pl-7 text-sm"
                        type="number"
                        placeholder="0"
                        value={summary.globalDiscountAmount}
                        onChange={(event) => updateDiscountFromAmount(event.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                <span className="text-base font-semibold text-slate-800">Grand Total</span>
                <span className="text-4xl leading-none font-black text-slate-900">
                  ₹{totalAfterDiscount}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Total Quantity</span>
                <span className="font-semibold text-slate-700">{totalQty}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
            <div>
              <Label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Security Deposit
              </Label>
              <Input
                className="h-11 rounded-xl border-slate-200 bg-slate-50"
                type="number"
                value={summary.depositAmount}
                onChange={(event) =>
                  setSummary((prev) => ({ ...prev, depositAmount: event.target.value }))
                }
              />
            </div>
            <div>
              <Label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Advance Paid
              </Label>
              <Input
                className="h-11 rounded-xl border-slate-200 bg-slate-50"
                type="number"
                value={summary.advanceAmount}
                onChange={(event) =>
                  setSummary((prev) => ({ ...prev, advanceAmount: event.target.value }))
                }
              />
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Outstanding Balance
              </p>
              <p className="mt-1 text-3xl font-black text-slate-900">₹{outstandingWithDeposit}</p>
              <p className="mt-2 text-xs text-slate-500">
                Pending: ₹{pending} | Qty: {totalQty}
              </p>
            </div>
          </div>

          <Button
            variant="brand"
            onClick={() => void submitRental()}
            disabled={submitting}
            className="h-12 w-full cursor-pointer rounded-2xl bg-[#17cf91] text-base font-bold text-white"
          >
            {submitting
              ? `${isEditMode ? "Updating" : "Saving"}...`
              : isEditMode
                ? "Update & Save Rental"
                : "Confirm & Save Rental"}
          </Button>
        </aside>
      </div>

      {customerModal.open && isMounted
        ? createPortal(
            <div
              className="fixed inset-0 z-[80] bg-slate-900/55 p-4 backdrop-blur-[1px]"
              onClick={() => setCustomerModal((prev) => ({ ...prev, open: false }))}
            >
              <div className="flex min-h-full items-center justify-center">
                <div className="w-full max-w-2xl" onClick={(event) => event.stopPropagation()}>
                  <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
                    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                          <UserRoundPlus className="h-5 w-5" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900">Add / Select Customer</h2>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCustomerModal((prev) => ({ ...prev, open: false }))}
                        className="cursor-pointer"
                      >
                        <X className="h-5 w-5 text-slate-500" />
                      </Button>
                    </div>

                    <div className="max-h-[70vh] space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
                      <div>
                        <Label className="mb-1 block text-sm font-semibold text-slate-700">
                          Search existing customer (phone)
                        </Label>
                        <div className="relative">
                          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-10"
                            placeholder="Type phone and press Enter"
                            value={customerModal.form.phone1 ?? ""}
                            onChange={(event) =>
                              setCustomerModal((prev) => ({
                                ...prev,
                                form: { ...prev.form, phone1: event.target.value },
                              }))
                            }
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                void handlePhoneLookup();
                              }
                            }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <Label className="mb-1 block text-sm font-semibold text-slate-700">
                            Customer Full Name
                          </Label>
                          <Input
                            className="h-11 rounded-xl border-slate-200 bg-slate-50"
                            placeholder="e.g. Michael Thompson"
                            value={customerModal.form.name ?? ""}
                            onChange={(event) =>
                              setCustomerModal((prev) => ({
                                ...prev,
                                form: { ...prev.form, name: event.target.value },
                              }))
                            }
                            readOnly={hasFoundCustomer && !customerModal.isEditCustomer}
                          />
                        </div>
                        <div>
                          <Label className="mb-1 block text-sm font-semibold text-slate-700">
                            Secondary Phone
                          </Label>
                          <Input
                            className="h-11 rounded-xl border-slate-200 bg-slate-50"
                            placeholder="(555) 000-0000"
                            value={customerModal.form.phone2 ?? ""}
                            onChange={(event) =>
                              setCustomerModal((prev) => ({
                                ...prev,
                                form: { ...prev.form, phone2: event.target.value },
                              }))
                            }
                            readOnly={hasFoundCustomer && !customerModal.isEditCustomer}
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="mb-1 block text-sm font-semibold text-slate-700">
                          Physical Address
                        </Label>
                        <Input
                          className="h-11 rounded-xl border-slate-200 bg-slate-50"
                          placeholder="Street, City, State..."
                          value={customerModal.form.address ?? ""}
                          onChange={(event) =>
                            setCustomerModal((prev) => ({
                              ...prev,
                              form: { ...prev.form, address: event.target.value },
                            }))
                          }
                          readOnly={hasFoundCustomer && !customerModal.isEditCustomer}
                        />
                      </div>

                      {customerModal.foundCustomer && hasFoundCustomer && (
                        <div className="overflow-hidden rounded-xl border border-slate-200">
                          <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Existing customer found
                          </div>
                          <div className="w-full overflow-x-auto">
                            <Table className="min-w-175">
                              <TableHeader className="bg-slate-50">
                                <TableRow>
                                  <TableHead className="px-4 py-2 text-left">Name</TableHead>
                                  <TableHead className="px-4 py-2 text-left">Phone 1</TableHead>
                                  <TableHead className="px-4 py-2 text-left">Phone 2</TableHead>
                                  <TableHead className="px-4 py-2 text-left">Address</TableHead>
                                  <TableHead className="px-4 py-2 text-right">Edit</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                <TableRow>
                                  <TableCell className="px-4 py-2">
                                    {customerModal.foundCustomer.name}
                                  </TableCell>
                                  <TableCell className="px-4 py-2">
                                    {customerModal.foundCustomer.phone1 || "-"}
                                  </TableCell>
                                  <TableCell className="px-4 py-2">
                                    {customerModal.foundCustomer.phone2 || "-"}
                                  </TableCell>
                                  <TableCell className="px-4 py-2">
                                    {customerModal.foundCustomer.address || "-"}
                                  </TableCell>
                                  <TableCell className="px-4 py-2 text-right">
                                    <Button
                                      variant="outline"
                                      size="icon-sm"
                                      type="button"
                                      onClick={() =>
                                        setCustomerModal((prev) => ({
                                          ...prev,
                                          isEditCustomer: true,
                                        }))
                                      }
                                      className="cursor-pointer border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
                      <Button
                        variant="ghost"
                        onClick={() => setCustomerModal((prev) => ({ ...prev, open: false }))}
                        disabled={customerModal.submittingCustomer}
                        className="w-full cursor-pointer rounded-xl sm:w-auto"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => void upsertCustomer(true)}
                        disabled={customerModal.submittingCustomer}
                        className="w-full cursor-pointer rounded-xl border-emerald-200 bg-emerald-100/60 text-emerald-700 hover:bg-emerald-100 sm:w-auto"
                      >
                        Save New
                      </Button>
                      <Button
                        variant="brand"
                        onClick={() => void upsertCustomer(false)}
                        disabled={customerModal.submittingCustomer}
                        className="w-full cursor-pointer rounded-xl bg-[#17cf91] text-white sm:w-auto"
                      >
                        {customerModal.foundCustomer && customerModal.isEditCustomer
                          ? "Update & Select"
                          : "Save & Select"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
