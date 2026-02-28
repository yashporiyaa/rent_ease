import Link from "next/link";
import { PlusCircle, Wallet, Boxes, Tags, Ruler } from "lucide-react";
import { Button } from "../ui/button";

type QuickActionsProps = {
  onCreateRental?: () => void;
};

export function QuickActions({ onCreateRental }: QuickActionsProps) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <h2 className="text-base font-bold text-[#0e1b17] mb-6">
        Quick Actions
      </h2>

      <div className="flex flex-col gap-3">
        {onCreateRental ? (
          <Button
            type="button"
            onClick={onCreateRental}
            className="flex items-center gap-3 p-4 bg-[#17cf91] text-[#0e1b17] font-bold rounded-xl shadow hover:opacity-90 transition text-left cursor-pointer"
          >
            <PlusCircle className="h-5 w-5" />
            <span>Add New Rental</span>
          </Button>
        ) : (
          <Link
            href="/protected/rentals"
            className="flex items-center gap-3 p-4 bg-[#17cf91] text-[#0e1b17] font-bold rounded-xl shadow hover:opacity-90 transition"
          >
            <PlusCircle className="h-5 w-5" />
            <span>Add New Rental</span>
          </Link>
        )}

        <Link
          href="/protected/finance/payments"
          className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-[#0e1b17] hover:bg-slate-100 transition"
        >
          <Wallet className="h-5 w-5 text-[#17cf91]" />
          <span>Record Payment</span>
        </Link>

        <Link
          href="/protected/items"
          className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-[#0e1b17] hover:bg-slate-100 transition"
        >
          <Boxes className="h-5 w-5 text-[#17cf91]" />
          <span>Inventory Intake</span>
        </Link>

        <Link
          href="/protected/item-categories"
          className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-[#0e1b17] hover:bg-slate-100 transition"
        >
          <Tags className="h-5 w-5 text-[#17cf91]" />
          <span>Manage Categories</span>
        </Link>

        <Link
          href="/protected/sizes"
          className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-[#0e1b17] hover:bg-slate-100 transition"
        >
          <Ruler className="h-5 w-5 text-[#17cf91]" />
          <span>Manage Sizes</span>
        </Link>
      </div>
    </div>
  );
}
