"use client";

import { Button } from "@/components/ui/button";
import { Stepper } from "./stepper";
import { useState } from "react";

export function ItemStep() {
  const [name, setName] = useState("");

  const submit = async () => {
    await fetch("http://localhost:3001/customers", {
      method: "POST",
      credentials: "include", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
      }),
    });

    window.location.reload();
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow">
      <Stepper step={2} />
      <h2 className="text-2xl font-black text-[#0e1b17]">
        Add your first item
      </h2>

      <input
        className="mt-6 border p-3 w-full rounded-xl"
        placeholder="Item Name"
        onChange={(e) => setName(e.target.value)}
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
