"use client";

import { useContext, useState } from "react";
import { Stepper } from "./stepper";
import { Button } from "@/components/ui/button";
import { OnboardingContext } from "@/app/context/onboarding-context";

export function CustomerStep({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState("");
  const { setCustomerId } = useContext(OnboardingContext);

  const submit = async () => {
    const res = await fetch("http://localhost:3001/customers", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
      }),
    });
    const data = await res.json();
    
    setCustomerId(data.data.id);
    onSuccess(); 
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow">
      <Stepper step={2} />
      <h2 className="text-2xl font-black text-[#0e1b17]">
        Add your first customer
      </h2>

      <input
        className="mt-6 border p-3 w-full rounded-xl"
        placeholder="Customer Name"
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
