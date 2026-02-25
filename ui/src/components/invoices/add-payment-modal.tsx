"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createPayment } from "@/lib/api/payments";
import { toast } from "react-toastify";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReceiptIndianRupee, X } from "lucide-react";

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
        <div
          className="fixed inset-0 z-50 bg-slate-900/55 p-4 backdrop-blur-[1px]"
          onClick={() => setOpen(false)}
        >
          <div className="flex min-h-full items-start justify-center py-6 sm:items-center sm:py-10">
            <div
              className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.14)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                    <ReceiptIndianRupee className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Add Payment</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Record payment details for this invoice.
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                  <X className="h-5 w-5 text-slate-500" />
                </Button>
              </div>

              <div className="space-y-4 px-6 py-6">
                <div>
                  <Label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Amount
                  </Label>
                  <Input
                    type="number"
                    placeholder="0"
                    className="h-11 rounded-xl border-slate-200 bg-slate-50"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <div>
                  <Label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Method
                  </Label>
                  <Select value={method} onValueChange={setMethod}>
                    <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-slate-50 px-3">
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
                </div>

                <div>
                  <Label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Reference (Optional)
                  </Label>
                  <Input
                    placeholder="Reference"
                    className="h-11 rounded-xl border-slate-200 bg-slate-50"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                  />
                </div>

                <div>
                  <Label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Paid At
                  </Label>
                  <Input
                    type="datetime-local"
                    className="h-11 rounded-xl border-slate-200 bg-slate-50"
                    value={paidAt}
                    onChange={(e) => setPaidAt(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-1">
                  <Button variant="outline" className="rounded-xl" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="brand"
                    onClick={submit}
                    className="rounded-xl bg-[#17cf91] font-bold text-white cursor-pointer"
                  >
                    Save Payment
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
