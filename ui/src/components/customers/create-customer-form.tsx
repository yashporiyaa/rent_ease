"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Phone, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { createCustomer } from "@/lib/api/customers";
import { toast } from "react-toastify";

export function CreateCustomerForm({
  onSuccess,
  onClose,
}: {
  onSuccess?: () => void;
  onClose?: () => void;
}) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const submit = async () => {
    if (!name.trim()) {
      setError("Customer name is required.");
      return;
    }

    try {
      await createCustomer(name, phone);
      toast.success("Customer created successfully");
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/protected/customers");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong. Please try again.";
      setError(message);
      toast.error(message);
    }
  };

  return (
    <div className="max-w-xl bg-white p-8 rounded-xl border shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-black text-[#0e1b17]">
          Add New Customer
        </h1>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="cursor-pointer">
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
      <p className="text-slate-500 mb-6">
        Create a customer to start renting items.
      </p>

      {/* Name */}
      <div className="mb-4">
        <Label className="text-sm font-semibold text-[#0e1b17] mb-1 block">
          Customer Name
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-3 text-slate-400" size={18} />
          <Input
            className="w-full pl-10 pr-4 py-3 border rounded-xl"
            placeholder="John Doe"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
          />
        </div>
      </div>

      {/* Phone */}
      <div className="mb-4">
        <Label className="text-sm font-semibold text-[#0e1b17] mb-1 block">
          Phone (optional)
        </Label>
        <div className="relative">
          <Phone className="absolute left-3 top-3 text-slate-400" size={18} />
          <Input
            className="w-full pl-10 pr-4 py-3 border rounded-xl"
            placeholder="9876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <Button
        variant="brand"
        onClick={submit}
        className="w-full rounded-full bg-[#17cf91] text-[#0e1b17] font-bold cursor-pointer"
      >
        Create Customer
      </Button>
    </div>
  );
}
