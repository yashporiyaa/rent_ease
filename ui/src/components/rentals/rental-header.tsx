import { formatDate } from "@/lib/utils/date";
import { RentalStatusBadge } from "./rental-status-badge";
import { Calendar } from "lucide-react";

export function RentalHeader({ rental }: { rental: any }) {
  return (
    <>
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h1 className="text-2xl font-black text-[#0e1b17]">Rental Details</h1>

        <p className="mt-2 text-slate-600">
          Customer: <strong>{rental.customer.name}</strong>
        </p>

        <div className="mt-2 flex items-center gap-2 text-slate-600">
          <Calendar size={16} />
          {formatDate(rental.startDate)} → {formatDate(rental.endDate)}
        </div>
      </div>
      {/* <RentalStatusBadge status={status} /> */}
    </>
  );
}
