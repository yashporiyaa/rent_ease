"use client";

import { useContext, useState } from "react";
import { Button } from "@/components/ui/button";
import { Stepper } from "./stepper";
import { UserContext } from "@/app/context/user-context";
import { updateBusinessOnboarding } from "@/lib/api/user";
import { toast } from "react-toastify";

export function BusinessStep({ onSuccess }: { onSuccess: () => void }) {
  const [address, setAddress] = useState("");
  const { user, refreshUser } = useContext(UserContext);

  const submit = async () => {
    const currentUser = user ?? (await refreshUser());
    if (!currentUser) {
      toast.error("Session not found. Please login again.");
      return;
    }
    try {
      await updateBusinessOnboarding(address);
      toast.success("Business details saved");
      onSuccess();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save business details";
      toast.error(message);
    }
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
        variant="brand"
        className="mt-6 w-full rounded-full bg-[#17cf91]"
        onClick={submit}
      >
        Continue
      </Button>
    </div>
  );
}
