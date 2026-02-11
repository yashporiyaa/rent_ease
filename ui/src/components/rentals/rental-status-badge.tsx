import { cn } from "@/lib/utils";
import { RentalStatus } from "@/types";

export function RentalStatusBadge({
  status,
}: {
  status: RentalStatus;
}) {
  const styles = {
    ACTIVE: "bg-emerald-100 text-emerald-700",
    COMPLETED: "bg-slate-100 text-slate-600",
    OVERDUE: "bg-red-100 text-red-700",
    CANCELLED: "bg-rose-100 text-rose-700",
  };

  return (
    <span
      className={cn(
        "px-3 py-1 rounded-full text-xs font-bold capitalize",
        styles[status],
      )}
    >
      {status}
    </span>
  );
}
