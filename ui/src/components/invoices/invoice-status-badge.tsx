import { cn } from "@/lib/utils";

export function InvoiceStatusBadge({
  status,
}: {
  status: "paid" | "unpaid" | "overdue";
}) {
  const styles = {
    paid: "bg-emerald-100 text-emerald-700",
    unpaid: "bg-amber-100 text-amber-700",
    overdue: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={cn(
        "px-3 py-1 rounded-full text-xs font-bold capitalize",
        styles[status]
      )}
    >
      {status}
    </span>
  );
}
