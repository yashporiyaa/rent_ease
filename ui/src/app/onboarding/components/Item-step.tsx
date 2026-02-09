"use client";

import { Button } from "@/components/ui/button";
import { Stepper } from "./stepper";
import { useContext, useState } from "react";
import { OnboardingContext } from "@/app/context/onboarding-context";

export function ItemStep({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const { setItemId } = useContext(OnboardingContext);

  const submit = async () => {
    const res = await fetch("http://localhost:3001/items", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        category,
        price: Number(price),
      }),
    });
    const data = await res.json();
    setItemId(data.data.id);

    onSuccess();
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow">
      <Stepper step={2} />
      <h2 className="text-2xl font-black text-[#0e1b17]">
        Add your first item
      </h2>

      <input
        className="mt-6 border p-3 w-full rounded-xl"
        placeholder="Item name"
        onChange={(e) => setName(e.target.value)}
      />

      <input
        className="mt-6 border p-3 w-full rounded-xl"
        placeholder="Category"
        onChange={(e) => setCategory(e.target.value)}
      />

      <input
        className="mt-6 border p-3 w-full rounded-xl"
        placeholder="Price"
        onChange={(e) => setPrice(e.target.value)}
      />

      <Button
        className="mt-6 w-full rounded-full bg-[#17cf91]"
        onClick={submit}
      >
        Continue
      </Button>
    </div>
  );
}
