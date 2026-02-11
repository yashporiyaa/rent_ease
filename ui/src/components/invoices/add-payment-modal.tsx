"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createPayment } from "@/lib/api/payments";
import { toast } from "react-toastify";

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
        className="rounded-full bg-[#17cf91] text-[#0e1b17] font-bold"
        variant="brand"
      >
        Add Payment
      </Button>

      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-xl font-bold text-[#0e1b17]">Add Payment</h2>

            <input
              type="number"
              placeholder="Amount"
              className="border p-3 rounded-xl w-full"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <select
              className="border p-3 rounded-xl w-full"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            >
              {METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            <input
              placeholder="Reference (optional)"
              className="border p-3 rounded-xl w-full"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />

            <input
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
                className="bg-[#17cf91] text-[#0e1b17] font-bold"
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
