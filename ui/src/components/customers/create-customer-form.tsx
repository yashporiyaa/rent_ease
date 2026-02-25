"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, User, UserRoundPlus, X } from "lucide-react";
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
    <div className="max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.14)]">
      <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <UserRoundPlus className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Add New Customer</h1>
            <p className="mt-1 text-sm text-slate-500">
              Create a customer to start renting items.
            </p>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="cursor-pointer">
            <X className="h-5 w-5 text-slate-500" />
          </Button>
        )}
      </div>
      <div className="space-y-5 px-6 py-6">

        <div>
          <Label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Customer Name
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-3 text-slate-400" size={18} />
            <Input
              className="h-11 w-full rounded-xl border-slate-200 bg-slate-50 pl-10 pr-4"
              placeholder="John Doe"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
            />
          </div>
        </div>

        <div>
          <Label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Phone (Optional)
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 text-slate-400" size={18} />
            <Input
              className="h-11 w-full rounded-xl border-slate-200 bg-slate-50 pl-10 pr-4"
              placeholder="9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button
          variant="brand"
          onClick={submit}
          className="h-11 w-full cursor-pointer rounded-xl bg-[#17cf91] font-bold text-white"
        >
          Create Customer
        </Button>
      </div>
    </div>
  );
}
