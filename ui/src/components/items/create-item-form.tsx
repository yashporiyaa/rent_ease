"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function CreateItemForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");

  const submit = async () => {
    if (!name || !category || !price) {
      setError("All fields are required.");
      return;
    }

    await fetch("http://localhost:3001/items", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        category,
        price: Number(price),
      }),
    });

    router.push("/items");
  };

  return (
    <div className="max-w-xl bg-white p-8 rounded-xl border shadow-sm">
      <h1 className="text-2xl font-black mb-6 text-[#0e1b17]">
        Add Inventory Item
      </h1>

      <input
        className="border p-3 rounded-xl w-full mb-4"
        placeholder="Item name"
        onChange={(e) => setName(e.target.value)}
      />

      <input
        className="border p-3 rounded-xl w-full mb-4"
        placeholder="Category"
        onChange={(e) => setCategory(e.target.value)}
      />

      <input
        className="border p-3 rounded-xl w-full mb-6"
        placeholder="Price"
        type="number"
        onChange={(e) => setPrice(e.target.value)}
      />

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <Button onClick={submit} className="w-full rounded-full bg-[#17cf91] text-[#0e1b17] font-bold">
        Create Item
      </Button>
    </div>
  );
}
