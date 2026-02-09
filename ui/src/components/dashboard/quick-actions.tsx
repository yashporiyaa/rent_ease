import Link from "next/link";
import { PlusCircle, UserPlus, Boxes } from "lucide-react";

export function QuickActions() {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <h2 className="text-base font-bold text-[#0e1b17] mb-6">
        Quick Actions
      </h2>

      <div className="flex flex-col gap-3">
        <Link
          href="/rentals/new"
          className="flex items-center gap-3 p-4 bg-[#17cf91] text-[#0e1b17] font-bold rounded-xl shadow hover:opacity-90 transition"
        >
          <PlusCircle className="h-5 w-5" />
          <span>Add New Rental</span>
        </Link>

        <Link
          href="/customers/new"
          className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-[#0e1b17] hover:bg-slate-100 transition"
        >
          <UserPlus className="h-5 w-5 text-[#17cf91]" />
          <span>Register Customer</span>
        </Link>

        <Link
          href="/assets/new"
          className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-[#0e1b17] hover:bg-slate-100 transition"
        >
          <Boxes className="h-5 w-5 text-[#17cf91]" />
          <span>Inventory Intake</span>
        </Link>
      </div>
    </div>
  );
}
