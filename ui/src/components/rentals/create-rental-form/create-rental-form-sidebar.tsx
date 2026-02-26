import type { Dispatch, SetStateAction } from "react";
import { Shield } from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import type { RentalSummaryState } from "../../../types";

type CreateRentalFormSidebarProps = {
  linesSubtotal: number;
  summary: RentalSummaryState;
  updateDiscountFromPercent: (value: string) => void;
  updateDiscountFromAmount: (value: string) => void;
  setSummary: Dispatch<SetStateAction<RentalSummaryState>>;
  totalAfterDiscount: number;
  totalQuantity: number;
  outstandingWithDeposit: number;
  pending: number;
  submitting: boolean;
  isEditMode: boolean;
  submitRental: () => Promise<void>;
};

export function CreateRentalFormSidebar({
  linesSubtotal,
  summary,
  updateDiscountFromPercent,
  updateDiscountFromAmount,
  setSummary,
  totalAfterDiscount,
  totalQuantity,
  outstandingWithDeposit,
  pending,
  submitting,
  isEditMode,
  submitRental,
}: CreateRentalFormSidebarProps) {
  return (
    <aside className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50 px-5 py-5 sm:px-6 sm:py-7 lg:border-t-0 lg:border-l">
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-emerald-500" />
          <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-500">
            Financial Summary
          </h3>
        </div>
        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
            <span className="font-medium text-slate-600">Subtotal</span>
            <span className="text-lg font-bold text-slate-900">₹{linesSubtotal}</span>
          </div>

          <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Discount
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div>
                <Label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Percentage
                </Label>
                <div className="relative">
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                    %
                  </span>
                  <Input
                    className="h-10 rounded-xl border-slate-200 bg-white pr-7 text-sm"
                    type="number"
                    placeholder="0"
                    value={summary.globalDiscountPercent}
                    onChange={(event) => updateDiscountFromPercent(event.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Amount
                </Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                    ₹
                  </span>
                  <Input
                    className="h-10 rounded-xl border-slate-200 bg-white pl-7 text-sm"
                    type="number"
                    placeholder="0"
                    value={summary.globalDiscountAmount}
                    onChange={(event) => updateDiscountFromAmount(event.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 pt-3">
            <span className="text-base font-semibold text-slate-800">Grand Total</span>
            <span className="text-4xl leading-none font-black text-slate-900">
              ₹{totalAfterDiscount}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Quantity</span>
            <span className="font-semibold text-slate-700">{totalQuantity}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
        <div>
          <Label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Security Deposit
          </Label>
          <Input
            className="h-11 rounded-xl border-slate-200 bg-slate-50"
            type="number"
            value={summary.depositAmount}
            onChange={(event) =>
              setSummary((prev) => ({ ...prev, depositAmount: event.target.value }))
            }
          />
        </div>
        <div>
          <Label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Advance Paid
          </Label>
          <Input
            className="h-11 rounded-xl border-slate-200 bg-slate-50"
            type="number"
            value={summary.advanceAmount}
            onChange={(event) =>
              setSummary((prev) => ({ ...prev, advanceAmount: event.target.value }))
            }
          />
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Outstanding Balance
          </p>
          <p className="mt-1 text-3xl font-black text-slate-900">₹{outstandingWithDeposit}</p>
          <p className="mt-2 text-xs text-slate-500">
            Pending: ₹{pending} | Qty: {totalQuantity}
          </p>
        </div>
      </div>

      <Button
        variant="brand"
        onClick={() => void submitRental()}
        disabled={submitting}
        className="h-12 w-full cursor-pointer rounded-2xl bg-[#17cf91] text-base font-bold text-white"
      >
        {submitting
          ? `${isEditMode ? "Updating" : "Saving"}...`
          : isEditMode
            ? "Update & Save Rental"
            : "Confirm & Save Rental"}
      </Button>
    </aside>
  );
}
