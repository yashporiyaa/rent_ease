"use client";

import { Button } from "@/components/ui/button";
import { Stepper } from "./stepper";
import { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingContext } from "@/app/context/onboarding-context";
import { createRental } from "@/lib/api/rentals";
import { toast } from "react-toastify";

export function RentalStep() {
  const router = useRouter();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [price, setPrice] = useState("");
  const { customerId, itemId } = useContext(OnboardingContext);

  const submit = async () => {
    const payload = {
      customerId: customerId!,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      items: [
        {
          itemId: itemId!,
          quantity: Number(quantity),
          price: Number(price),
        },
      ],
    };

    try {
      await createRental(payload);
      toast.success("Setup complete");
      router.push("protected/dashboard");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create rental";
      toast.error(message);
    }
  };

  if (!customerId || !itemId) {
    return <p>Loading onboarding data…</p>;
  }

  return (
    <div className="bg-white p-8 rounded-3xl shadow">
      <Stepper step={3} />

      <h2 className="text-2xl font-black text-[#0e1b17]">
        Create your first rental
      </h2>

      <p className="mt-2 text-sm text-[#4e977f]">
        Set rental duration and pricing to complete setup.
      </p>

      {/* Start Date */}
      <input
        type="date"
        className="mt-6 border p-3 w-full rounded-xl"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />

      {/* End Date */}
      <input
        type="date"
        className="mt-4 border p-3 w-full rounded-xl"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />

      {/* Quantity */}
      <input
        type="number"
        min={1}
        className="mt-4 border p-3 w-full rounded-xl"
        placeholder="Quantity"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
      />

      {/* Price */}
      <input
        type="number"
        className="mt-4 border p-3 w-full rounded-xl"
        placeholder="Price per item"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />

      <Button
        variant="brand"
        className="mt-6 w-full rounded-full bg-[#17cf91] hover:bg-[#17cf91]/90 text-[#0e1b17] font-bold cursor-pointer"
        onClick={submit}
      >
        Finish Setup
      </Button>
    </div>
  );
}
