import { RentalSummaryProps } from "@/types";

export function RentalSummary({ rental }: RentalSummaryProps) {
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm flex justify-between">
      <div>
        <p className="text-slate-500 text-sm">Total Items</p>
        <p className="text-xl font-bold">
          {rental.rentalItems.length}
        </p>
      </div>

      <div className="text-right">
        <p className="text-slate-500 text-sm">Total Amount</p>
        <p className="text-xl font-black text-[#17cf91]">
          ₹{rental.totalAmount}
        </p>
      </div>
    </div>
  );
}
