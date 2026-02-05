"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Stepper } from "./stepper";

export function BusinessStep() {
  const [address, setAddress] = useState("");

  const submit = async () => {
    await fetch("http://localhost:3001/users/onboarding/business", {
      method: "PATCH",
      credentials: "include", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        address,
      }),
    });

    window.location.reload();
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow">
      <Stepper step={1} />

      <h2 className="text-2xl font-black text-[#0e1b17]">
        Setup your business
      </h2>

      <input
        className="mt-6 border p-3 w-full rounded-xl"
        placeholder="Business Address"
        onChange={(e) => setAddress(e.target.value)}
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
