"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createPayment } from "@/lib/api/payments";
import { toast } from "react-toastify";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const METHODS = ["CASH", "UPI", "CARD", "BANK_TRANSFER"];

export function AddPaymentModal({
  invoiceId,
  onSuccess,
}: {
  invoiceId: string;
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("CASH");
  const [reference, setReference] = useState("");
  const [paidAt, setPaidAt] = useState("");

  const submit = async () => {
    try {
      await createPayment(invoiceId, Number(amount), method, reference, paidAt);
      toast.success("Payment added");
      setOpen(false);
      onSuccess();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to add payment";
      toast.error(message);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="rounded-full bg-[#17cf91] text-[#0e1b17] font-bold cursor-pointer"
        variant="brand"
      >
        Add Payment
      </Button>

      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-xl font-bold text-[#0e1b17]">Add Payment</h2>

            <Input
              type="number"
              placeholder="Amount"
              className="border p-3 rounded-xl w-full"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger className="w-full h-12 rounded-xl border px-3">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent className="rounded-xl p-1">
                {METHODS.map((m) => (
                  <SelectItem key={m} value={m} className="py-2 px-3">
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Reference (optional)"
              className="border p-3 rounded-xl w-full"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />

            <Input
              type="datetime-local"
              className="border p-3 rounded-xl w-full"
              value={paidAt}
              onChange={(e) => setPaidAt(e.target.value)}
            />

            <div className="flex gap-3 justify-end">
              <Button variant="brand" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="brand"
                onClick={submit}
                className="bg-[#17cf91] text-[#0e1b17] font-bold cursor-pointer"
              >
                Save Payment
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
