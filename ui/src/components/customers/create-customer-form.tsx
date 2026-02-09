"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { User, Phone } from "lucide-react";
import { useRouter } from "next/navigation";

export function CreateCustomerForm() {
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
      const res = await fetch("http://localhost:3001/customers", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          phone,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create customer");
      }

      // success → go back to customers list
      router.push("/customers");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="max-w-xl bg-white p-8 rounded-xl border shadow-sm">
      <h1 className="text-2xl font-black text-[#0e1b17] mb-2">
        Add New Customer
      </h1>
      <p className="text-slate-500 mb-6">
        Create a customer to start renting items.
      </p>

      {/* Name */}
      <div className="mb-4">
        <label className="text-sm font-semibold text-[#0e1b17] mb-1 block">
          Customer Name
        </label>
        <div className="relative">
          <User className="absolute left-3 top-3 text-slate-400" size={18} />
          <input
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
        <label className="text-sm font-semibold text-[#0e1b17] mb-1 block">
          Phone (optional)
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-3 text-slate-400" size={18} />
          <input
            className="w-full pl-10 pr-4 py-3 border rounded-xl"
            placeholder="9876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 mb-4">{error}</p>
      )}

      <Button
        onClick={submit}
        className="w-full rounded-full bg-[#17cf91] text-[#0e1b17] font-bold"
      >
        Create Customer
      </Button>
    </div>
  );
}
