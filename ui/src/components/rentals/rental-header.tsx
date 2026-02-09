import { RentalStatusBadge } from "./rental-status-badge";

export function RentalHeader({
  rentalId,
  status,
}: {
  rentalId: string;
  status: "active" | "completed" | "overdue";
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-black text-[#0e1b17]">
          Rental #{rentalId}
        </h1>
        <p className="text-slate-500 mt-1">
          Detailed view of rental agreement
        </p>
      </div>

      <RentalStatusBadge status={status} />
    </div>
  );
}
