"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CustomerSelect } from "./customer-select";
import { ItemSelect } from "./item-select";
import { RentalSummaryBox } from "./rental-summary-box";
import { useRouter } from "next/navigation";

export function CreateRentalForm({
  customers,
  items: availableItems,
}: {
  customers: { id: string; name: string }[];
  items: { id: string; name: string; price: number }[];
}) {
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState<Record<string, number>>({});
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [errors, setErrors] = useState<{
    customer?: string;
    items?: string;
    dates?: string;
  }>({});
  const router = useRouter();

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!customerId) {
      newErrors.customer = "Please select a customer.";
    }

    if (Object.keys(items).length === 0) {
      newErrors.items = "Please select at least one item.";
    }

    if (!startDate || !endDate) {
      newErrors.dates = "Start and end dates are required.";
    } else if (new Date(endDate) < new Date(startDate)) {
      newErrors.dates = "End date cannot be before start date.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildRentalItemsPayload = () => {
    return Object.entries(items).map(([itemId, quantity]) => {
      const item = availableItems.find((i) => i.id === itemId)!;

      return {
        itemId,
        quantity,
        price: item.price,
      };
    });
  };

  const submit = async () => {
    if (!validate()) return;

    const payload = {
      customerId,
      startDate,
      endDate,
      items: buildRentalItemsPayload(),
    };
    console.log(payload);

    // try {
    //   const res = await fetch("http://localhost:3001/rentals", {
    //     method: "POST",
    //     credentials: "include",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify(payload),
    //   });

    //   if (!res.ok) {
    //     throw new Error("Failed to create rental");
    //   }

    //   const rental = await res.json();

    //   //  Redirect to rental details
    //   router.push(`/rentals/${rental.id}`);
    // } catch (error) {
    //   console.error(error);
    // }
  };

  if (customers.length === 0) {
    return (
      <div className="bg-white p-10 rounded-xl border shadow-sm text-center">
        <h2 className="text-xl font-bold text-[#0e1b17]">
          No customers found
        </h2>
        <p className="text-slate-500 mt-2">
          You must add a customer before creating a rental.
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white p-10 rounded-xl border shadow-sm text-center">
        <h2 className="text-xl font-bold text-[#0e1b17]">
          No items available
        </h2>
        <p className="text-slate-500 mt-2">
          Add items to inventory before creating a rental.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-black text-[#0e1b17]">Create New Rental</h1>

      {errors.customer && (
        <p className="text-sm text-red-600 mt-1">{errors.customer}</p>
      )}

      <CustomerSelect
        value={customerId}
        onChange={(value) => {
          setCustomerId(value);
          setErrors((e) => ({ ...e, customer: undefined }));
        }}
        customers={customers}
      />

      {errors.items && (
        <p className="text-sm text-red-600 mt-1">{errors.items}</p>
      )}

      <ItemSelect
        selectedItems={items}
        setSelectedItems={(updatedItems) => {
          setItems(updatedItems);
          setErrors((e) => ({ ...e, items: undefined }));
        }}
        items={availableItems}
      />

      <div className="grid grid-cols-2 gap-4">
        <input
          type="date"
          className="border p-3 rounded-xl"
          value={startDate}
          onChange={(e) => {
            setStartDate(e.target.value);
            setErrors((prev) => ({ ...prev, dates: undefined }));
          }}
        />

        {errors.dates && (
          <p className="text-sm text-red-600 mt-1">{errors.dates}</p>
        )}

        <input
          type="date"
          className="border p-3 rounded-xl"
          value={endDate}
          onChange={(e) => {
            setEndDate(e.target.value);
            setErrors((prev) => ({ ...prev, dates: undefined }));
          }}
        />

        {errors.dates && (
          <p className="text-sm text-red-600 mt-1">{errors.dates}</p>
        )}
      </div>

      <RentalSummaryBox selectedItems={items} />

      <Button
        onClick={submit}
        disabled={
          !customerId ||
          Object.keys(items).length === 0 ||
          !startDate ||
          !endDate
        }
        className="w-full rounded-full bg-[#17cf91] text-[#0e1b17] font-bold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Create Rental
      </Button>
    </div>
  );
}
