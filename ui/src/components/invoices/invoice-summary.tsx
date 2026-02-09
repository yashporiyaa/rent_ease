import { Calendar, IndianRupee, User } from "lucide-react";

export function InvoiceSummary({
  customer,
  issueDate,
  dueDate,
  amount,
}: {
  customer: string;
  issueDate: string;
  dueDate: string;
  amount: number;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <User className="text-[#17cf91] mb-2" />
        <p className="text-sm text-slate-500">Customer</p>
        <p className="font-bold text-[#0e1b17]">{customer}</p>
      </div>

      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <Calendar className="text-[#17cf91] mb-2" />
        <p className="text-sm text-slate-500">Issued On</p>
        <p className="font-bold text-[#0e1b17]">{issueDate}</p>
      </div>

      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <Calendar className="text-[#17cf91] mb-2" />
        <p className="text-sm text-slate-500">Due Date</p>
        <p className="font-bold text-[#0e1b17]">{dueDate}</p>
      </div>

      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <IndianRupee className="text-[#17cf91] mb-2" />
        <p className="text-sm text-slate-500">Total Amount</p>
        <p className="font-bold text-[#0e1b17]">₹{amount}</p>
      </div>
    </div>
  );
}
