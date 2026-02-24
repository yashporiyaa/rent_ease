"use client";

import { useEffect, useState } from "react";
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
import { Pencil, Plus, Trash2, X } from "lucide-react";
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
  lineDiscountPercent: "0",
  lineDiscountAmount: "0",
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
  const lineDiscountAmt = round2(Number(lineForm.lineDiscountAmount) || 0);
  const lineTaxPct = Number(lineForm.taxPercent) || 0;
  const lineTaxAmt = round2(((lineBaseAmount - lineDiscountAmt) * lineTaxPct) / 100);
  const lineTotal = round2(lineBaseAmount - lineDiscountAmt + lineTaxAmt);

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

  const updateLineDiscountFromPercent = (value: string) => {
    const pct = Number(value) || 0;
    const amount = round2((lineBaseAmount * pct) / 100);
    setLineForm((prev) => ({
      ...prev,
      lineDiscountPercent: value,
      lineDiscountAmount: String(amount),
    }));
  };

  const updateLineDiscountFromAmount = (value: string) => {
    const amount = Number(value) || 0;
    const pct = lineBaseAmount > 0 ? round2((amount / lineBaseAmount) * 100) : 0;
    setLineForm((prev) => ({
      ...prev,
      lineDiscountAmount: value,
      lineDiscountPercent: String(pct),
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
      discountPercent: Number(lineForm.lineDiscountPercent) || 0,
      discountAmount: Number(lineForm.lineDiscountAmount) || 0,
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
      lineDiscountPercent: String(line.discountPercent),
      lineDiscountAmount: String(line.discountAmount),
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

  return (
    <div className="w-full max-w-330 space-y-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 md:p-8">
      <div className="flex items-start justify-between gap-3 sm:items-center">
        <h1 className="text-xl font-black text-[#0e1b17] sm:text-2xl">
          {isEditMode ? "Update Rental" : "Create Rental"}
        </h1>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="cursor-pointer">
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5 md:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="w-full">
            <Label className="mb-1 block text-sm font-semibold text-[#0e1b17]">
              Customer Name
            </Label>
            <Select
              value={rentalForm.customerId || undefined}
              onValueChange={(value) =>
                setRentalForm((prev) => ({ ...prev, customerId: value }))
              }
            >
              <SelectTrigger className="w-full h-12 rounded-xl border p-3">
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent className="rounded-xl p-1">
                {customerList.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id} className="py-2 px-3">
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={openCustomerModal}
            className="mt-1 h-10 w-full cursor-pointer sm:mt-0 sm:h-9 sm:w-9"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div>
          <Label className="mb-1 block text-sm font-semibold text-[#0e1b17]">
            Booking Date & Time
          </Label>
          <div className="space-y-2">
            <Input
              type="date"
              className="border p-3 rounded-xl w-full"
              value={splitLocalDateTime(rentalForm.bookingAt).date}
              onChange={(event) => updateBookingDateTime("date", event.target.value)}
            />
            <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-2 py-1">
              <select
                className="h-8 w-20 rounded-md border border-slate-300 bg-white px-2 text-center text-sm font-medium outline-none"
                value={get12HourParts(splitLocalDateTime(rentalForm.bookingAt).time).hour}
                onChange={(event) => updateBookingTime12h("hour", event.target.value)}
              >
                {HOURS_12.map((hour) => (
                  <option key={hour} value={hour}>
                    {hour}
                  </option>
                ))}
              </select>
              <span className="text-sm font-semibold text-slate-600">:</span>
              <select
                className="h-8 w-20 rounded-md border border-slate-300 bg-white px-2 text-center text-sm font-medium outline-none"
                value={get12HourParts(splitLocalDateTime(rentalForm.bookingAt).time).minute}
                onChange={(event) => updateBookingTime12h("minute", event.target.value)}
              >
                {MINUTES.map((minute) => (
                  <option key={minute} value={minute}>
                    {minute}
                  </option>
                ))}
              </select>
              <select
                className="h-8 w-20 rounded-md border border-slate-300 bg-white px-2 text-center text-sm font-medium outline-none"
                value={get12HourParts(splitLocalDateTime(rentalForm.bookingAt).time).period}
                onChange={(event) =>
                  updateBookingTime12h("period", event.target.value as "AM" | "PM")
                }
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <Label className="mb-1 block text-sm font-semibold text-[#0e1b17]">
            Booking No. (Optional)
          </Label>
          <Input
            inputMode="numeric"
            className="border p-3 rounded-xl w-full"
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

        <div>
            <Label className="mb-1 block text-sm font-semibold text-[#0e1b17]">
            Delivery Address
          </Label>
          <Input
            className="border p-3 rounded-xl w-full"
            placeholder="Delivery address"
            value={rentalForm.deliveryAddress}
            onChange={(event) =>
              setRentalForm((prev) => ({ ...prev, deliveryAddress: event.target.value }))
            }
          />
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-slate-200 p-4 sm:p-5">
        <h3 className="text-base font-bold text-[#0e1b17]">Product Section</h3>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_220px] gap-4">
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[1.1fr_1.5fr_1.5fr_0.7fr]">
              <div>
                <Label className="mb-1 block text-xs font-semibold text-[#0e1b17]">
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
                  <SelectTrigger className="h-10 w-full rounded-lg border px-2 text-sm">
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
                <Label className="mb-1 block text-xs font-semibold text-[#0e1b17]">
                  From / Delivery
                </Label>
                <div className="space-y-2">
                  <Input
                    className="h-10 w-full rounded-lg border px-2 text-sm"
                    type="date"
                    value={splitLocalDateTime(lineForm.fromAt).date}
                    onChange={(event) =>
                      updateLineDateTime("fromAt", "date", event.target.value)
                    }
                  />
                  <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-2 py-1">
                    <select
                      className="h-8 w-20 rounded-md border border-slate-300 bg-white px-2 text-center text-sm font-medium outline-none"
                      value={get12HourParts(splitLocalDateTime(lineForm.fromAt).time).hour}
                      onChange={(event) => updateLineTime12h("fromAt", "hour", event.target.value)}
                    >
                      {HOURS_12.map((hour) => (
                        <option key={hour} value={hour}>
                          {hour}
                        </option>
                      ))}
                    </select>
                    <span className="text-sm font-semibold text-slate-600">:</span>
                    <select
                      className="h-8 w-20 rounded-md border border-slate-300 bg-white px-2 text-center text-sm font-medium outline-none"
                      value={get12HourParts(splitLocalDateTime(lineForm.fromAt).time).minute}
                      onChange={(event) =>
                        updateLineTime12h("fromAt", "minute", event.target.value)
                      }
                    >
                      {MINUTES.map((minute) => (
                        <option key={minute} value={minute}>
                          {minute}
                        </option>
                      ))}
                    </select>
                    <select
                      className="h-8 w-20 rounded-md border border-slate-300 bg-white px-2 text-center text-sm font-medium outline-none"
                      value={get12HourParts(splitLocalDateTime(lineForm.fromAt).time).period}
                      onChange={(event) =>
                        updateLineTime12h("fromAt", "period", event.target.value as "AM" | "PM")
                      }
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <Label className="mb-1 block text-xs font-semibold text-[#0e1b17]">
                  To / Return
                </Label>
                <div className="space-y-2">
                  <Input
                    className="h-10 w-full rounded-lg border px-2 text-sm"
                    type="date"
                    value={splitLocalDateTime(lineForm.toAt).date}
                    onChange={(event) =>
                      updateLineDateTime("toAt", "date", event.target.value)
                    }
                  />
                  <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-2 py-1">
                    <select
                      className="h-8 w-20 rounded-md border border-slate-300 bg-white px-2 text-center text-sm font-medium outline-none"
                      value={get12HourParts(splitLocalDateTime(lineForm.toAt).time).hour}
                      onChange={(event) => updateLineTime12h("toAt", "hour", event.target.value)}
                    >
                      {HOURS_12.map((hour) => (
                        <option key={hour} value={hour}>
                          {hour}
                        </option>
                      ))}
                    </select>
                    <span className="text-sm font-semibold text-slate-600">:</span>
                    <select
                      className="h-8 w-20 rounded-md border border-slate-300 bg-white px-2 text-center text-sm font-medium outline-none"
                      value={get12HourParts(splitLocalDateTime(lineForm.toAt).time).minute}
                      onChange={(event) =>
                        updateLineTime12h("toAt", "minute", event.target.value)
                      }
                    >
                      {MINUTES.map((minute) => (
                        <option key={minute} value={minute}>
                          {minute}
                        </option>
                      ))}
                    </select>
                    <select
                      className="h-8 w-20 rounded-md border border-slate-300 bg-white px-2 text-center text-sm font-medium outline-none"
                      value={get12HourParts(splitLocalDateTime(lineForm.toAt).time).period}
                      onChange={(event) =>
                        updateLineTime12h("toAt", "period", event.target.value as "AM" | "PM")
                      }
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <Label className="mb-1 block text-xs font-semibold text-[#0e1b17]">
                  Qty
                </Label>
                <Input
                  className="h-10 w-full rounded-lg border px-2 text-sm"
                  placeholder="Qty"
                  type="number"
                  value={lineForm.quantity}
                  onChange={(event) =>
                    setLineForm((prev) => ({ ...prev, quantity: event.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-8 gap-3">
              <div className="xl:col-span-2">
                <Label className="mb-1 block text-xs font-semibold text-[#0e1b17]">
                  Description
                </Label>
                <Input
                  className="h-10 w-full rounded-lg border px-2 text-sm"
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
                <Label className="mb-1 block text-xs font-semibold text-[#0e1b17]">
                  Rate
                </Label>
                <Input
                  className="h-10 w-full rounded-lg border px-2 text-sm"
                  placeholder="Rate"
                  type="number"
                  value={lineForm.rate}
                  onChange={(event) =>
                    setLineForm((prev) => ({ ...prev, rate: event.target.value }))
                  }
                />
              </div>

              <div>
                <Label className="mb-1 block text-xs font-semibold text-[#0e1b17]">
                  GST
                </Label>
                <Select
                  value={lineForm.taxPercent}
                  onValueChange={(value) =>
                    setLineForm((prev) => ({ ...prev, taxPercent: value }))
                  }
                >
                  <SelectTrigger className="h-10 w-full rounded-lg border px-2 text-sm">
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

              <div>
                <Label className="mb-1 block text-xs font-semibold text-[#0e1b17]">
                  Disc %
                </Label>
                <Input
                  className="h-10 w-full rounded-lg border px-2 text-sm"
                  placeholder="%"
                  type="number"
                  value={lineForm.lineDiscountPercent}
                  onChange={(event) => updateLineDiscountFromPercent(event.target.value)}
                />
              </div>

              <div>
                <Label className="mb-1 block text-xs font-semibold text-[#0e1b17]">
                  Disc Rs
                </Label>
                <Input
                  className="h-10 w-full rounded-lg border px-2 text-sm"
                  placeholder="Rs"
                  type="number"
                  value={lineForm.lineDiscountAmount}
                  onChange={(event) => updateLineDiscountFromAmount(event.target.value)}
                />
              </div>

              <div>
                <Label className="mb-1 block text-xs font-semibold text-[#0e1b17]">
                  Tax Rs
                </Label>
                <Input
                  className="h-10 w-full rounded-lg border border-slate-300 bg-slate-100 px-2 text-sm text-slate-500 cursor-not-allowed"
                  value={String(lineTaxAmt)}
                  readOnly
                />
              </div>

              <div>
                <Label className="mb-1 block text-xs font-semibold text-[#0e1b17]">
                  Total
                </Label>
                <Input
                  className="h-10 w-full rounded-lg border border-slate-300 bg-slate-100 px-2 text-sm text-slate-500 cursor-not-allowed"
                  value={String(lineTotal)}
                  readOnly
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                variant="brand"
                onClick={() => void addOrUpdateLine()}
                disabled={checkingAvailability}
                className="h-10 w-full min-w-32 cursor-pointer rounded-lg sm:w-auto"
              >
                {checkingAvailability
                  ? "Checking..."
                  : lineForm.editingLineId
                    ? "Update"
                    : "Add"}
              </Button>
            </div>
          </div>

          <div>
            <Label className="mb-1 block text-xs font-semibold text-[#0e1b17]">
              Product Image
            </Label>
            <div className="h-36 w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden">
              {selectedProduct?.images?.[0] ? (
                <img
                  src={selectedProduct.images[0]}
                  alt={selectedProduct.fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xs font-medium text-slate-400">No image selected</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <div className="w-full max-w-140 space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5">
        <div className="grid grid-cols-1 overflow-hidden rounded-lg border border-slate-300 sm:grid-cols-[120px_1fr_90px_1fr]">
          <div className="bg-slate-100 px-3 py-2 text-sm font-semibold text-[#3d5a90]">Total</div>
          <div className="bg-white px-3 py-2 text-sm font-semibold text-slate-600">₹ {linesSubtotal}</div>
          <div className="bg-slate-100 px-3 py-2 text-sm font-semibold text-[#0e1b17] sm:border-l sm:border-slate-300">
            Qty
          </div>
          <div className="bg-white px-3 py-2 text-sm font-semibold text-slate-600">{totalQty}</div>
        </div>

        <div className="grid grid-cols-1 overflow-hidden rounded-lg border border-slate-300 sm:grid-cols-[120px_60px_1fr_60px_1fr]">
          <div className="bg-slate-100 px-3 py-2 text-sm font-semibold text-[#3d5a90]">Discount</div>
          <div className="bg-slate-100 px-3 py-2 text-sm font-semibold text-[#0e1b17] sm:border-l sm:border-slate-300">%</div>
          <Input
            className="min-w-0 rounded-none border-0 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none"
            type="number"
            value={summary.globalDiscountPercent}
            onChange={(event) => updateDiscountFromPercent(event.target.value)}
          />
          <div className="bg-slate-100 px-3 py-2 text-sm font-semibold text-[#0e1b17] sm:border-l sm:border-slate-300">₹</div>
          <Input
            className="min-w-0 rounded-none border-0 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none"
            type="number"
            value={summary.globalDiscountAmount}
            onChange={(event) => updateDiscountFromAmount(event.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 overflow-hidden rounded-lg border border-slate-300 sm:grid-cols-[120px_150px_1fr]">
          <div className="bg-slate-100 px-3 py-2 text-sm font-semibold text-[#3d5a90]">Advance</div>
          <div className="bg-white px-3 py-2 text-sm font-semibold text-[#3d5a90] sm:border-l sm:border-slate-300">
            CASH IN HAND
          </div>
          <Input
            className="min-w-0 border-l border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none"
            type="number"
            value={summary.advanceAmount}
            onChange={(event) =>
              setSummary((prev) => ({ ...prev, advanceAmount: event.target.value }))
            }
          />
        </div>

        <div className="grid grid-cols-1 overflow-hidden rounded-lg border border-slate-300 sm:grid-cols-[160px_1fr]">
          <div className="bg-white px-3 py-2 text-sm font-semibold text-[#0e1b17]">Outstanding</div>
          <div className="bg-slate-100 px-3 py-2 text-right text-sm font-semibold text-[#0e1b17] sm:border-l sm:border-slate-300">
            ₹ {pending}
          </div>
        </div>

        <div className="grid grid-cols-1 overflow-hidden rounded-lg border border-slate-300 sm:grid-cols-[120px_150px_1fr_1fr]">
          <div className="bg-slate-100 px-3 py-2 text-sm font-semibold text-[#2f6feb]">Deposit</div>
          <div className="bg-white px-3 py-2 text-sm font-semibold text-[#3d5a90] sm:border-l sm:border-slate-300">
            CASH IN HAND
          </div>
          <Input
            className="min-w-0 border-l border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-red-600 outline-none"
            type="number"
            value={summary.depositAmount}
            onChange={(event) =>
              setSummary((prev) => ({ ...prev, depositAmount: event.target.value }))
            }
          />
          <div className="bg-white px-3 py-2 text-sm font-semibold text-green-600 sm:border-l sm:border-slate-300">
            ₹ {Number(summary.depositAmount) || 0}
          </div>
        </div>

        <div className="grid grid-cols-1 overflow-hidden rounded-lg border border-slate-300 sm:grid-cols-[220px_1fr]">
          <div className="bg-white px-3 py-2 text-sm font-semibold text-[#0e1b17]">Outstanding + Deposit</div>
          <div className="bg-slate-100 px-3 py-2 text-right text-sm font-semibold text-[#0e1b17] sm:border-l sm:border-slate-300">
            ₹ {outstandingWithDeposit}
          </div>
        </div>
      </div>
      </div>

      {lines.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b bg-slate-50">
            <h3 className="text-sm font-semibold text-[#0e1b17]">Added Rental Lines</h3>
          </div>
          <div className="w-full overflow-x-auto">
          <Table className="min-w-275">
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="px-4 py-3 text-left">Sr no.</TableHead>
                <TableHead className="px-4 py-3 text-left">Product</TableHead>
                <TableHead className="px-4 py-3 text-left">Image</TableHead>
                <TableHead className="px-4 py-3 text-left">Description</TableHead>
                <TableHead className="px-4 py-3 text-left">From</TableHead>
                <TableHead className="px-4 py-3 text-left">To</TableHead>
                <TableHead className="px-4 py-3 text-right">Qty</TableHead>
                <TableHead className="px-4 py-3 text-right">Rate</TableHead>
                <TableHead className="px-4 py-3 text-right">Discount</TableHead>
                <TableHead className="px-4 py-3 text-right">Tax</TableHead>
                <TableHead className="px-4 py-3 text-right">Total</TableHead>
                <TableHead className="px-4 py-3 text-left">Status</TableHead>
                <TableHead className="px-4 py-3 text-right">Edit</TableHead>
                <TableHead className="px-4 py-3 text-right">Delete</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y">
              {pagedLines.map((line, index) => (
                <TableRow key={line.id}>
                  <TableCell className="px-4 py-3">
                    {(currentLineTablePage - 1) * lineTablePageSize + index + 1}
                  </TableCell>
                  <TableCell className="px-4 py-3">{line.productName}</TableCell>
                  <TableCell className="px-4 py-3">
                    {line.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={line.image} alt={line.productName} className="h-10 w-10 rounded-lg border object-cover" />
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3">{line.description || "-"}</TableCell>
                  <TableCell className="px-4 py-3">{line.fromAt}</TableCell>
                  <TableCell className="px-4 py-3">{line.toAt}</TableCell>
                  <TableCell className="px-4 py-3 text-right">{line.quantity}</TableCell>
                  <TableCell className="px-4 py-3 text-right">₹{line.rate}</TableCell>
                  <TableCell className="px-4 py-3 text-right">₹{line.discountAmount}</TableCell>
                  <TableCell className="px-4 py-3 text-right">₹{line.taxAmount}</TableCell>
                  <TableCell className="px-4 py-3 text-right">₹{line.total}</TableCell>
                  <TableCell className="px-4 py-3">{line.status}</TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <Button type="button" onClick={() => editLine(line)} className="cursor-pointer text-green-600 bg-white hover:bg-green-100 ">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <Button type="button" onClick={() => deleteLine(line.id)} className="cursor-pointer text-red-600 bg-white hover:bg-red-100">
                      <Trash2 className="h-4 w-4" />
                    </Button>
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

      <Button
        variant="brand"
        onClick={() => void submitRental()}
        disabled={submitting}
        className="w-full rounded-full bg-[#17cf91] text-[#0e1b17] font-bold cursor-pointer"
      >
        {submitting
          ? `${isEditMode ? "Updating" : "Saving"}...`
          : isEditMode
            ? "Update Rental"
            : "Save"}
      </Button>

      {customerModal.open && (
        <div
          className="fixed inset-0 z-60 bg-black/45 p-4"
          onClick={() => setCustomerModal((prev) => ({ ...prev, open: false }))}
        >
          <div className="flex min-h-full items-center justify-center">
            <div className="w-full max-w-2xl" onClick={(event) => event.stopPropagation()}>
              <div className="max-h-[85vh] space-y-4 overflow-y-auto rounded-xl border bg-white p-4 shadow-sm sm:p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-[#0e1b17]">Add / Select Customer</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCustomerModal((prev) => ({ ...prev, open: false }))}
                    className="cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-1 block text-sm font-semibold text-[#0e1b17]">
                      Primary Phone
                    </Label>
                    <Input
                      className="border p-3 rounded-xl w-full"
                      placeholder="Primary phone"
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
                  <div>
                    <Label className="mb-1 block text-sm font-semibold text-[#0e1b17]">
                      Secondary Phone
                    </Label>
                    <Input
                      className="border p-3 rounded-xl w-full"
                      placeholder="Secondary phone"
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
                  <Label className="mb-1 block text-sm font-semibold text-[#0e1b17]">
                    Customer Name
                  </Label>
                  <Input
                    className="border p-3 rounded-xl w-full"
                    placeholder="Customer name"
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
                  <Label className="mb-1 block text-sm font-semibold text-[#0e1b17]">
                    Address
                  </Label>
                  <Input
                    className="border p-3 rounded-xl w-full"
                    placeholder="Address"
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
                  <div className="rounded-xl border overflow-hidden">
                    <div className="w-full overflow-x-auto">
                    <Table className="min-w-180">
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
                              variant="destructive"
                              type="button"
                              onClick={() =>
                                setCustomerModal((prev) => ({
                                  ...prev,
                                  isEditCustomer: true,
                                }))
                              }
                              className="cursor-pointer text-green-600 bg-white hover:bg-green-100"
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

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setCustomerModal((prev) => ({ ...prev, open: false }))}
                    disabled={customerModal.submittingCustomer}
                    className="w-full cursor-pointer sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="brand"
                    onClick={() => void upsertCustomer(false)}
                    disabled={customerModal.submittingCustomer}
                    className="w-full cursor-pointer bg-[#17cf91] text-[#0e1b17] sm:w-auto"
                  >
                    {customerModal.foundCustomer && customerModal.isEditCustomer
                      ? "Update"
                      : "Save"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => void upsertCustomer(true)}
                    disabled={customerModal.submittingCustomer}
                    className="w-full cursor-pointer sm:w-auto"
                  >
                    Save New
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
