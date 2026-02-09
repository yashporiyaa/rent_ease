"use client";

import { useContext, useState } from "react";
import { Button } from "@/components/ui/button";
import { Stepper } from "./stepper";
import { UserContext } from "@/app/context/user-context";

export function BusinessStep({ onSuccess }: { onSuccess: () => void }) {
  const [address, setAddress] = useState("");
  const { user } = useContext(UserContext);

  const submit = async () => {
    if (!user) return;
    await fetch("http://localhost:3001/users/onboarding/business", {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address,
      }),
    });

    onSuccess();
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow">
      <Stepper step={1} />

      <h2 className="text-2xl font-black text-[#0e1b17]">
        Setup your business address
      </h2>

      <input
        className="mt-6 border p-3 w-full rounded-xl"
        placeholder="Business Address"
        value={address}
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
