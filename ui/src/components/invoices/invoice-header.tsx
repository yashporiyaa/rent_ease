import { User } from "lucide-react";
import { InvoiceHeaderProps } from "@/types";

export function InvoiceHeader({ invoice }: InvoiceHeaderProps) {
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-black text-[#0e1b17]">
            Invoice #{invoice.invoiceNo}
          </h1>

          <p className="text-slate-500 mt-1 flex items-center gap-2">
            <User size={14} />
            {invoice?.rental?.customer?.name}
          </p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            invoice.status === "PAID"
              ? "bg-green-100 text-green-700"
              : invoice.status === "PARTIAL"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {invoice.status}
        </span>
      </div>
    </div>
  );
}
