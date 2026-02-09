import { cn } from "@/lib/utils";

export function RentalStatusBadge({
  status,
}: {
  status: "active" | "completed" | "overdue";
}) {
  const styles = {
    active: "bg-emerald-100 text-emerald-700",
    completed: "bg-slate-100 text-slate-600",
    overdue: "bg-red-100 text-red-700",
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
