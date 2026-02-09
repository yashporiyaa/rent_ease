import { User, Calendar, IndianRupee } from "lucide-react";

export function RentalSummary({
  customer,
  startDate,
  endDate,
  totalAmount,
}: {
  customer: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Customer */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <User className="text-[#17cf91] mb-2" />
        <p className="text-sm text-slate-500">Customer</p>
        <p className="font-bold text-[#0e1b17]">{customer}</p>
      </div>

      {/* Duration */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <Calendar className="text-[#17cf91] mb-2" />
        <p className="text-sm text-slate-500">Duration</p>
        <p className="font-bold text-[#0e1b17]">
          {startDate} → {endDate}
        </p>
      </div>

      {/* Amount */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <IndianRupee className="text-[#17cf91] mb-2" />
        <p className="text-sm text-slate-500">Total Amount</p>
        <p className="font-bold text-[#0e1b17]">₹{totalAmount}</p>
      </div>
    </div>
  );
}
