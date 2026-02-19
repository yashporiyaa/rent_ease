"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { createRental } from "@/lib/api/rentals";
import { toast } from "react-toastify";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { createCustomer, findCustomerByPhone, updateCustomer } from "@/lib/api/customers";
import { getItems } from "@/lib/api/items";
import { CustomerListItem, CreateRentalPayload, InventoryItem } from "@/types";

type RentalLine = {
  id: string;
  itemId: string;
  productName: string;
  image?: string;
  description?: string;
  fromAt: string;
  toAt: string;
  quantity: number;
  rate: number;
  discountPercent: number;
  discountAmount: number;
  taxPercent: number;
  taxAmount: number;
  total: number;
  status: string;
};

type CustomerModalState = {
  name: string;
  phone1: string;
  phone2: string;
  address: string;
};

const gstRates = [0, 5, 12, 18, 28];

const emptyCustomerForm: CustomerModalState = {
  name: "",
  phone1: "",
  phone2: "",
  address: "",
};

const makeLineId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const round2 = (n: number) => Math.round(n * 100) / 100;
const nowLocalDateTime = () => {
  const now = new Date();
  const tzOffset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
};

export function CreateRentalForm({
  customers,
  onSuccess,
  onClose,
}: {
  customers: CustomerListItem[];
  onSuccess?: () => void;
  onClose?: () => void;
}) {
  const router = useRouter();

  const [customerList, setCustomerList] = useState<CustomerListItem[]>(customers);
  const [customerId, setCustomerId] = useState("");
  const [bookingAt, setBookingAt] = useState(nowLocalDateTime());
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [headerDescription, setHeaderDescription] = useState("");

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  const [itemId, setItemId] = useState("");
  const [lineDescription, setLineDescription] = useState("");
  const [fromAt, setFromAt] = useState("");
  const [toAt, setToAt] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [rate, setRate] = useState("");
  const [taxPercent, setTaxPercent] = useState("0");
  const [lineDiscountPercent, setLineDiscountPercent] = useState("0");
  const [lineDiscountAmount, setLineDiscountAmount] = useState("0");
  const [editingLineId, setEditingLineId] = useState<string | null>(null);

  const [lines, setLines] = useState<RentalLine[]>([]);

  const [globalDiscountPercent, setGlobalDiscountPercent] = useState("0");
  const [globalDiscountAmount, setGlobalDiscountAmount] = useState("0");
  const [advanceAmount, setAdvanceAmount] = useState("0");
  const [depositAmount, setDepositAmount] = useState("0");

  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [customerModalForm, setCustomerModalForm] = useState<CustomerModalState>(emptyCustomerForm);
  const [foundCustomer, setFoundCustomer] = useState<CustomerListItem | null>(null);
  const [isEditCustomer, setIsEditCustomer] = useState(false);
  const [submittingCustomer, setSubmittingCustomer] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const hasFoundCustomer = Boolean(foundCustomer?.id && foundCustomer?.name);

  useEffect(() => {
    if (items.length > 0) return;

    const fetchItems = async () => {
      setItemsLoading(true);
      try {
        const res = await getItems();
        setItems(res.data);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to fetch products";
        toast.error(message);
      } finally {
        setItemsLoading(false);
      }
    };

    void fetchItems();
  }, [items.length]);

  const selectedProduct = items.find((item) => item.id === itemId);

  const lineBaseAmount = round2((Number(quantity) || 0) * (Number(rate) || 0));
  const lineDiscountAmt = round2(Number(lineDiscountAmount) || 0);
  const lineTaxPct = Number(taxPercent) || 0;
  const lineTaxAmt = round2(((lineBaseAmount - lineDiscountAmt) * lineTaxPct) / 100);
  const lineTotal = round2(lineBaseAmount - lineDiscountAmt + lineTaxAmt);

  const linesSubtotal = round2(lines.reduce((sum, line) => sum + line.total, 0));
  const totalQty = lines.reduce((sum, line) => sum + line.quantity, 0);
  const linesTax = round2(lines.reduce((sum, line) => sum + line.taxAmount, 0));

  const overallDiscountAmt = round2(Number(globalDiscountAmount) || 0);
  const overallDiscountPct = Number(globalDiscountPercent) || 0;
  const totalAfterDiscount = round2(linesSubtotal - overallDiscountAmt);
  const advance = Number(advanceAmount) || 0;
  const deposit = Number(depositAmount) || 0;
  const pending = round2(totalAfterDiscount - advance);
  const outstandingWithDeposit = round2(pending + deposit);

  const updateDiscountFromPercent = (value: string) => {
    setGlobalDiscountPercent(value);
    const pct = Number(value) || 0;
    const amount = round2((linesSubtotal * pct) / 100);
    setGlobalDiscountAmount(String(amount));
  };

  const updateDiscountFromAmount = (value: string) => {
    setGlobalDiscountAmount(value);
    const amount = Number(value) || 0;
    const pct = linesSubtotal > 0 ? round2((amount / linesSubtotal) * 100) : 0;
    setGlobalDiscountPercent(String(pct));
  };

  const updateLineDiscountFromPercent = (value: string) => {
    setLineDiscountPercent(value);
    const pct = Number(value) || 0;
    const amount = round2((lineBaseAmount * pct) / 100);
    setLineDiscountAmount(String(amount));
  };

  const updateLineDiscountFromAmount = (value: string) => {
    setLineDiscountAmount(value);
    const amount = Number(value) || 0;
    const pct = lineBaseAmount > 0 ? round2((amount / lineBaseAmount) * 100) : 0;
    setLineDiscountPercent(String(pct));
  };

  const resetLineForm = () => {
    setItemId("");
    setLineDescription("");
    setFromAt("");
    setToAt("");
    setQuantity("1");
    setRate("");
    setTaxPercent("0");
    setLineDiscountPercent("0");
    setLineDiscountAmount("0");
    setEditingLineId(null);
  };

  const addOrUpdateLine = () => {
    if (!itemId || !fromAt || !toAt || !quantity || !rate) {
      toast.error("Fill product section fields first");
      return;
    }

    const item = items.find((current) => current.id === itemId);
    if (!item) {
      toast.error("Invalid product selected");
      return;
    }

    const line: RentalLine = {
      id: editingLineId ?? makeLineId(),
      itemId,
      productName: item.fullName,
      image: item.images?.[0],
      description: lineDescription || item.description || "",
      fromAt,
      toAt,
      quantity: Number(quantity),
      rate: Number(rate),
      discountPercent: Number(lineDiscountPercent) || 0,
      discountAmount: Number(lineDiscountAmount) || 0,
      taxPercent: Number(taxPercent) || 0,
      taxAmount: lineTaxAmt,
      total: lineTotal,
      status: "ACTIVE",
    };

    setLines((prev) => {
      if (editingLineId) {
        return prev.map((current) => (current.id === editingLineId ? line : current));
      }
      return [...prev, line];
    });

    resetLineForm();
  };

  const editLine = (line: RentalLine) => {
    setEditingLineId(line.id);
    setItemId(line.itemId);
    setLineDescription(line.description || "");
    setFromAt(line.fromAt);
    setToAt(line.toAt);
    setQuantity(String(line.quantity));
    setRate(String(line.rate));
    setTaxPercent(String(line.taxPercent));
    setLineDiscountPercent(String(line.discountPercent));
    setLineDiscountAmount(String(line.discountAmount));
  };

  const deleteLine = (lineId: string) => {
    setLines((prev) => prev.filter((line) => line.id !== lineId));
  };

  const openCustomerModal = () => {
    setCustomerModalForm(emptyCustomerForm);
    setFoundCustomer(null);
    setIsEditCustomer(false);
    setCustomerModalOpen(true);
  };

  const handlePhoneLookup = async () => {
    const phone = customerModalForm.phone1.trim();
    if (!phone) return;

    try {
      const res = await findCustomerByPhone(phone);
      if (res.data) {
        const customer = res.data as CustomerListItem;
        if (customer?.id && customer?.name) {
          setFoundCustomer(customer);
          setCustomerModalForm({
            name: customer.name ?? "",
            phone1: customer.phone1 ?? "",
            phone2: customer.phone2 ?? "",
            address: customer.address ?? "",
          });
          setIsEditCustomer(false);
        } else {
          setFoundCustomer(null);
          setIsEditCustomer(false);
        }
      } else {
        setFoundCustomer(null);
        setIsEditCustomer(false);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Lookup failed";
      toast.error(message);
    }
  };

  const upsertCustomer = async (stayOpen: boolean) => {
    if (!customerModalForm.name.trim()) {
      toast.error("Customer name is required");
      return;
    }

    setSubmittingCustomer(true);
    try {
      let customer: CustomerListItem;

      if (foundCustomer) {
        if (isEditCustomer) {
          const res = await updateCustomer(foundCustomer.id, {
            name: customerModalForm.name,
            phone1: customerModalForm.phone1,
            phone2: customerModalForm.phone2,
            address: customerModalForm.address,
          });
          customer = res.data;
          toast.success("Customer updated");
        } else {
          customer = foundCustomer;
        }
      } else {
        const res = await createCustomer(
          customerModalForm.name,
          customerModalForm.phone1,
          customerModalForm.phone2,
          customerModalForm.address,
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

      setCustomerId(customer.id);

      if (stayOpen) {
        setCustomerModalForm(emptyCustomerForm);
        setFoundCustomer(null);
        setIsEditCustomer(false);
      } else {
        setCustomerModalOpen(false);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Customer save failed";
      toast.error(message);
    } finally {
      setSubmittingCustomer(false);
    }
  };

  const submitRental = async () => {
    const missingFields: string[] = [];
    if (!customerId) missingFields.push("Customer");
    if (!bookingAt) missingFields.push("Booking Date & Time");
    if (lines.length === 0) missingFields.push("At least one Product Line");

    if (missingFields.length > 0) {
      toast.error(`Missing: ${missingFields.join(", ")}`);
      return;
    }

    const payload: CreateRentalPayload = {
      customerId,
      bookingAt,
      deliveryAddress: deliveryAddress.trim(),
      description: headerDescription,
      totalQuantity: totalQty,
      discountPercent: overallDiscountPct,
      discountAmount: overallDiscountAmt,
      taxPercent: 0,
      taxAmountValue: linesTax,
      totalAmount: totalAfterDiscount,
      advanceAmount: Number(advanceAmount) || 0,
      pendingAmount: pending,
      depositAmount: Number(depositAmount) || 0,
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
      const res = await createRental(payload);
      toast.success("Rental created successfully");
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/protected/rentals/${res.data.rental.id}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create rental";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[1220px] space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-[#0e1b17]">Create Rental</h1>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="cursor-pointer">
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 rounded-xl border border-slate-200 bg-slate-50/50 p-5">
        <div className="flex items-center gap-2">
          <div className="w-full">
            <label className="mb-1 block text-sm font-semibold text-[#0e1b17]">
              Customer Name
            </label>
          <select
            className="border p-3 rounded-xl w-full"
            value={customerId}
            onChange={(event) => setCustomerId(event.target.value)}
          >
            <option value="">Select customer</option>
            {customerList.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
          </div>
          <Button variant="outline" size="icon" onClick={openCustomerModal} className="cursor-pointer mt-6">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-[#0e1b17]">
            Booking Date & Time
          </label>
          <input
            type="datetime-local"
            className="border p-3 rounded-xl w-full"
            value={bookingAt}
            onChange={(event) => setBookingAt(event.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-[#0e1b17]">
            Delivery Address
          </label>
          <input
            className="border p-3 rounded-xl w-full"
            placeholder="Delivery address"
            value={deliveryAddress}
            onChange={(event) => setDeliveryAddress(event.target.value)}
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
        <label className="mb-1 block text-sm font-semibold text-[#0e1b17]">
          Description
        </label>
        <textarea
          className="border p-3 rounded-xl w-full bg-white"
          placeholder="Description"
          value={headerDescription}
          onChange={(event) => setHeaderDescription(event.target.value)}
        />
      </div>

      <div className="rounded-xl border border-slate-200 p-5 space-y-4">
        <h3 className="text-base font-bold text-[#0e1b17]">Product Section</h3>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-[#0e1b17]">
              Product
            </label>
            <select
              className="border p-3 rounded-xl w-full"
              value={itemId}
              onChange={(event) => {
                const selectedId = event.target.value;
                setItemId(selectedId);
                const product = items.find((i) => i.id === selectedId);
                if (product) {
                  setRate(String(product.price));
                  if (!lineDescription) {
                    setLineDescription(product.description || "");
                  }
                }
              }}
              disabled={itemsLoading}
            >
              <option value="">Select product</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.fullName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-[#0e1b17]">
              From / Delivery
            </label>
            <input
              className="border p-3 rounded-xl w-full"
              placeholder="From (date & time)"
              type="datetime-local"
              value={fromAt}
              onChange={(event) => setFromAt(event.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-[#0e1b17]">
              To / Return
            </label>
            <input
              className="border p-3 rounded-xl w-full"
              placeholder="To (date & time)"
              type="datetime-local"
              value={toAt}
              onChange={(event) => setToAt(event.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-[#0e1b17]">
              Quantity
            </label>
            <input
              className="border p-3 rounded-xl w-full"
              placeholder="Quantity"
              type="number"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
            />
          </div>
        </div>

        {selectedProduct?.images?.[0] && (
          <div className="flex items-center gap-3">
            <img
              src={selectedProduct.images[0]}
              alt={selectedProduct.fullName}
              className="h-14 w-14 rounded-lg border object-cover"
            />
            <p className="text-sm text-slate-600">Selected product image preview</p>
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-semibold text-[#0e1b17]">
            Product Description
          </label>
          <input
            className="border p-3 rounded-xl w-full"
            placeholder="Line description"
            value={lineDescription}
            onChange={(event) => setLineDescription(event.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-[#0e1b17]">
              Rate / Quantity
            </label>
            <input
              className="border p-3 rounded-xl w-full"
              placeholder="Rate / qty"
              type="number"
              value={rate}
              onChange={(event) => setRate(event.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-[#0e1b17]">
              Tax (GST)
            </label>
            <select
              className="border p-3 rounded-xl w-full"
              value={taxPercent}
              onChange={(event) => setTaxPercent(event.target.value)}
            >
              {gstRates.map((value) => (
                <option key={value} value={value}>
                  GST {value}%
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-[#0e1b17]">
              Discount (%)
            </label>
            <input
              className="border p-3 rounded-xl w-full"
              placeholder="Discount %"
              type="number"
              value={lineDiscountPercent}
              onChange={(event) => updateLineDiscountFromPercent(event.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-[#0e1b17]">
              Discount (Rs)
            </label>
            <input
              className="border p-3 rounded-xl w-full"
              placeholder="Discount Rs"
              type="number"
              value={lineDiscountAmount}
              onChange={(event) => updateLineDiscountFromAmount(event.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-[#0e1b17]">
              Tax (Rs)
            </label>
            <input
              className="border p-3 rounded-xl bg-slate-50 w-full"
              placeholder="Tax Rs"
              value={String(lineTaxAmt)}
              readOnly
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-[#0e1b17]">
              Total
            </label>
            <input
              className="border p-3 rounded-xl bg-slate-50 w-full"
              placeholder="Total"
              value={String(lineTotal)}
              readOnly
            />
          </div>
        </div>

        <Button variant="brand" onClick={addOrUpdateLine} className="cursor-pointer min-w-32">
          {editingLineId ? "Update Line" : "Add"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 rounded-xl border border-slate-200 bg-slate-50/50 p-5">
        <div>
          <label className="mb-1 block text-sm font-semibold text-[#0e1b17]">
            Total Quantity
          </label>
          <input className="border p-3 rounded-xl bg-slate-50 w-full" value={String(totalQty)} readOnly placeholder="Total qty" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-[#0e1b17]">
            Discount (%)
          </label>
          <input
            className="border p-3 rounded-xl w-full"
            placeholder="Discount %"
            type="number"
            value={globalDiscountPercent}
            onChange={(event) => updateDiscountFromPercent(event.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-[#0e1b17]">
            Discount (Rs)
          </label>
          <input
            className="border p-3 rounded-xl w-full"
            placeholder="Discount Rs"
            type="number"
            value={globalDiscountAmount}
            onChange={(event) => updateDiscountFromAmount(event.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-[#0e1b17]">
            Advance
          </label>
          <input
            className="border p-3 rounded-xl w-full"
            placeholder="Advance"
            type="number"
            value={advanceAmount}
            onChange={(event) => setAdvanceAmount(event.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-[#0e1b17]">
            Outstanding
          </label>
          <input className="border p-3 rounded-xl bg-slate-50 w-full" value={String(pending)} readOnly placeholder="Outstanding" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-[#0e1b17]">
            Deposit
          </label>
          <input
            className="border p-3 rounded-xl w-full"
            placeholder="Deposit"
            type="number"
            value={depositAmount}
            onChange={(event) => setDepositAmount(event.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-[#0e1b17]">
            Outstanding + Deposit
          </label>
          <input
            className="border p-3 rounded-xl bg-slate-50 w-full"
            value={String(outstandingWithDeposit)}
            readOnly
            placeholder="Outstanding + Deposit"
          />
        </div>
      </div>

      {lines.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b bg-slate-50">
            <h3 className="text-sm font-semibold text-[#0e1b17]">Added Rental Lines</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left">Sr no.</th>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-left">Image</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-left">From</th>
                <th className="px-4 py-3 text-left">To</th>
                <th className="px-4 py-3 text-right">Qty</th>
                <th className="px-4 py-3 text-right">Rate</th>
                <th className="px-4 py-3 text-right">Discount</th>
                <th className="px-4 py-3 text-right">Tax</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Edit</th>
                <th className="px-4 py-3 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {lines.map((line, index) => (
                <tr key={line.id}>
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3">{line.productName}</td>
                  <td className="px-4 py-3">
                    {line.image ? (
                      <img src={line.image} alt={line.productName} className="h-10 w-10 rounded-lg border object-cover" />
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-3">{line.description || "-"}</td>
                  <td className="px-4 py-3">{line.fromAt}</td>
                  <td className="px-4 py-3">{line.toAt}</td>
                  <td className="px-4 py-3 text-right">{line.quantity}</td>
                  <td className="px-4 py-3 text-right">₹{line.rate}</td>
                  <td className="px-4 py-3 text-right">₹{line.discountAmount}</td>
                  <td className="px-4 py-3 text-right">₹{line.taxAmount}</td>
                  <td className="px-4 py-3 text-right">₹{line.total}</td>
                  <td className="px-4 py-3">{line.status}</td>
                  <td className="px-4 py-3 text-right">
                    <button type="button" onClick={() => editLine(line)} className="cursor-pointer text-slate-600">
                      <Pencil className="h-4 w-4" />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button type="button" onClick={() => deleteLine(line.id)} className="cursor-pointer text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Button
        variant="brand"
        onClick={() => void submitRental()}
        disabled={submitting}
        className="w-full rounded-full bg-[#17cf91] text-[#0e1b17] font-bold cursor-pointer"
      >
        {submitting ? "Saving..." : "Save"}
      </Button>

      {customerModalOpen && (
        <div className="fixed inset-0 z-[60] bg-black/45 p-4" onClick={() => setCustomerModalOpen(false)}>
          <div className="min-h-full flex items-center justify-center">
            <div className="w-full max-w-2xl" onClick={(event) => event.stopPropagation()}>
              <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-[#0e1b17]">Add / Select Customer</h2>
                  <Button variant="ghost" size="icon" onClick={() => setCustomerModalOpen(false)} className="cursor-pointer">
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-[#0e1b17]">
                      Primary Phone
                    </label>
                    <input
                      className="border p-3 rounded-xl w-full"
                      placeholder="Primary phone"
                      value={customerModalForm.phone1 ?? ""}
                      onChange={(event) =>
                        setCustomerModalForm((prev) => ({ ...prev, phone1: event.target.value }))
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
                    <label className="mb-1 block text-sm font-semibold text-[#0e1b17]">
                      Secondary Phone
                    </label>
                    <input
                      className="border p-3 rounded-xl w-full"
                      placeholder="Secondary phone"
                      value={customerModalForm.phone2 ?? ""}
                      onChange={(event) =>
                        setCustomerModalForm((prev) => ({ ...prev, phone2: event.target.value }))
                      }
                      readOnly={hasFoundCustomer && !isEditCustomer}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-[#0e1b17]">
                    Customer Name
                  </label>
                  <input
                    className="border p-3 rounded-xl w-full"
                    placeholder="Customer name"
                    value={customerModalForm.name ?? ""}
                    onChange={(event) =>
                      setCustomerModalForm((prev) => ({ ...prev, name: event.target.value }))
                    }
                    readOnly={hasFoundCustomer && !isEditCustomer}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-[#0e1b17]">
                    Address
                  </label>
                  <input
                    className="border p-3 rounded-xl w-full"
                    placeholder="Address"
                    value={customerModalForm.address ?? ""}
                    onChange={(event) =>
                      setCustomerModalForm((prev) => ({ ...prev, address: event.target.value }))
                    }
                    readOnly={hasFoundCustomer && !isEditCustomer}
                  />
                </div>

                {hasFoundCustomer && (
                  <div className="rounded-xl border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-2 text-left">Name</th>
                          <th className="px-4 py-2 text-left">Phone 1</th>
                          <th className="px-4 py-2 text-left">Phone 2</th>
                          <th className="px-4 py-2 text-left">Address</th>
                          <th className="px-4 py-2 text-right">Edit</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-4 py-2">{foundCustomer.name}</td>
                          <td className="px-4 py-2">{foundCustomer.phone1 || "-"}</td>
                          <td className="px-4 py-2">{foundCustomer.phone2 || "-"}</td>
                          <td className="px-4 py-2">{foundCustomer.address || "-"}</td>
                          <td className="px-4 py-2 text-right">
                            <button
                              type="button"
                              onClick={() => setIsEditCustomer(true)}
                              className="cursor-pointer text-slate-600"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setCustomerModalOpen(false)}
                    disabled={submittingCustomer}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="brand"
                    onClick={() => void upsertCustomer(false)}
                    disabled={submittingCustomer}
                    className="cursor-pointer bg-[#17cf91] text-[#0e1b17]"
                  >
                    {foundCustomer && isEditCustomer ? "Update" : "Save"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => void upsertCustomer(true)}
                    disabled={submittingCustomer}
                    className="cursor-pointer"
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
