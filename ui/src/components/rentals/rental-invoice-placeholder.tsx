import { FileText } from "lucide-react";

export function RentalInvoicePlaceholder() {
  return (
    <div className="bg-[#17cf91]/5 border border-[#17cf91]/20 p-6 rounded-xl">
      <div className="flex items-center gap-3 mb-2">
        <FileText className="text-[#17cf91]" />
        <h3 className="font-bold text-[#0e1b17]">
          Invoice & Payments
        </h3>
      </div>

      <p className="text-sm text-slate-600">
        Invoices and payment tracking will appear here once enabled.
      </p>
    </div>
  );
}
