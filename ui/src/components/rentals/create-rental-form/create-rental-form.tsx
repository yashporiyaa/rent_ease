"use client";

import { useEffect, useState } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { useRouter } from "next/navigation";
import {
  checkRentalItemAvailability,
  createRental,
  updateRental,
} from "../../../lib/api/rentals";
import { toast } from "react-toastify";
import {
  CalendarClock,
  FileText,
  MapPin,
  Package2,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserRound,
  UserRoundPlus,
} from "lucide-react";
import {
  createCustomer,
  findCustomerByPhone,
  updateCustomer,
} from "../../../lib/api/customers";
import {
  CustomerListItem,
  CreateRentalPayload,
  CustomerModalState,
  CustomerModalUiState,
  InventoryItem,
  RentalFormState,
  RentalLine,
  RentalLineFormState,
  RentalRecord,
  RentalSummaryState,
} from "../../../types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { TablePagination } from "../../common/table-pagination";
import { CreateRentalFormHeader } from "./create-rental-form-header";
import { CreateRentalFormSidebar } from "./create-rental-form-sidebar";
import { CreateRentalCustomerModal } from "./create-rental-customer-modal";
import {
  get12HourParts,
  GST_RATE_OPTIONS,
  HOURS_12,
  makeLineId,
  MINUTES,
  nowLocalDateTime,
  parseInputDate,
  round2,
  splitLocalDateTime,
  to24Hour,
  toLocalDateTimeInput,
} from "./create-rental-form.utils";

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
  isEditingCustomer: false,
  submittingCustomer: false,
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
  const hasMatchedCustomer = Boolean(
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
  const lineTaxPercent = Number(lineForm.taxPercent) || 0;
  const lineTaxAmount = round2((lineBaseAmount * lineTaxPercent) / 100);
  const lineTotal = round2(lineBaseAmount + lineTaxAmount);

  const linesSubtotal = round2(lines.reduce((sum, line) => sum + line.total, 0));
  const totalQuantity = lines.reduce((sum, line) => sum + line.quantity, 0);
  const linesTax = round2(lines.reduce((sum, line) => sum + line.taxAmount, 0));
  const lineTablePageSize = 10;
  const lineTableTotalPages = Math.max(1, Math.ceil(lines.length / lineTablePageSize));
  const currentLineTablePage = Math.min(lineTablePage, lineTableTotalPages);
  const pagedLines = lines.slice(
    (currentLineTablePage - 1) * lineTablePageSize,
    (currentLineTablePage - 1) * lineTablePageSize + lineTablePageSize,
  );

  const overallDiscountAmount = round2(Number(summary.globalDiscountAmount) || 0);
  const overallDiscountPercent = Number(summary.globalDiscountPercent) || 0;
  const totalAfterDiscount = round2(linesSubtotal - overallDiscountAmount);
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
      taxAmount: lineTaxAmount,
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
      isEditingCustomer: false,
    }));
  };

  const handlePhoneLookup = async () => {
    const phone = customerModal.form.phone1.trim();
    if (!phone) return;

    try {
      const response = await findCustomerByPhone(phone);
      if (response.data) {
        const customer = response.data as CustomerListItem;
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
            isEditingCustomer: false,
          }));
        } else {
          setCustomerModal((prev) => ({
            ...prev,
            foundCustomer: null,
            isEditingCustomer: false,
          }));
        }
      } else {
        setCustomerModal((prev) => ({
          ...prev,
          foundCustomer: null,
          isEditingCustomer: false,
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
        if (customerModal.isEditingCustomer) {
          const response = await updateCustomer(customerModal.foundCustomer.id, {
            name: customerModal.form.name,
            phone1: customerModal.form.phone1,
            phone2: customerModal.form.phone2,
            address: customerModal.form.address,
          });
          customer = response.data;
          toast.success("Customer updated");
        } else {
          customer = customerModal.foundCustomer;
        }
      } else {
        const response = await createCustomer(
          customerModal.form.name,
          customerModal.form.phone1,
          customerModal.form.phone2,
          customerModal.form.address,
        );
        customer = response.data;
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
          isEditingCustomer: false,
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
      totalQuantity: totalQuantity,
      discountPercent: overallDiscountPercent,
      discountAmount: overallDiscountAmount,
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
        const response = await createRental(payload);
        toast.success("Rental created successfully");
        if (!onSuccess) {
          if (response?.data?.rental?.id) {
            router.push(
              `/protected/finance/receipts?rentalId=${response.data.rental.id}`,
            );
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
      <CreateRentalFormHeader isEditMode={isEditMode} onClose={onClose} />

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
                    const product = items.find((i) => i.id === selectedId);
                    setLineForm((prev) => {
                      const next = { ...prev, itemId: selectedId };
                      if (!product) {
                        return next;
                      }

                      next.rate = String(product.price);
                      if (!prev.lineDescription) {
                        next.lineDescription = product.description || "";
                      }
                      return next;
                    });
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
                    {GST_RATE_OPTIONS.map((value) => (
                      <SelectItem
                        key={value}
                        value={String(value)}
                        className="py-2 px-3"
                      >
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
                <p className="mt-2 text-lg font-semibold text-slate-800">₹{lineTaxAmount}</p>
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

        <CreateRentalFormSidebar
          linesSubtotal={linesSubtotal}
          summary={summary}
          updateDiscountFromPercent={updateDiscountFromPercent}
          updateDiscountFromAmount={updateDiscountFromAmount}
          setSummary={setSummary}
          totalAfterDiscount={totalAfterDiscount}
          totalQuantity={totalQuantity}
          outstandingWithDeposit={outstandingWithDeposit}
          pending={pending}
          submitting={submitting}
          isEditMode={isEditMode}
          submitRental={submitRental}
        />
      </div>

      <CreateRentalCustomerModal
        isOpen={customerModal.open}
        customerModal={customerModal}
        hasMatchedCustomer={hasMatchedCustomer}
        setCustomerModal={setCustomerModal}
        handlePhoneLookup={handlePhoneLookup}
        upsertCustomer={upsertCustomer}
      />
    </div>
  );
}
