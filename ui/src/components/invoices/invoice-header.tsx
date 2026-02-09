import { InvoiceStatusBadge } from "./invoice-status-badge";

export function InvoiceHeader({
  invoiceId,
  status,
}: {
  invoiceId: string;
  status: "paid" | "unpaid" | "overdue";
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-black text-[#0e1b17]">
          Invoice #{invoiceId}
        </h1>
        <p className="text-slate-500 mt-1">
          Invoice details and payment summary
        </p>
      </div>

      <InvoiceStatusBadge status={status} />
    </div>
  );
}
